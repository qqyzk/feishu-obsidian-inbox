import { Notice, Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, DEFAULT_STATE } from "./defaults";
import { FeishuClient } from "./feishu";
import { renderMessages } from "./markdown";
import { FeishuInboxSettingTab } from "./settings";
import { filterNewMessages, recordSync } from "./state";
import { FeishuInboxSettings, SyncResult, SyncState } from "./types";

interface PluginData {
  settings?: Partial<FeishuInboxSettings>;
  state?: Partial<SyncState>;
}

export default class FeishuInboxPlugin extends Plugin {
  settings: FeishuInboxSettings = { ...DEFAULT_SETTINGS };
  state: SyncState = { ...DEFAULT_STATE };

  async onload(): Promise<void> {
    await this.loadPluginData();

    this.addRibbonIcon("inbox", "Sync Feishu Inbox", async () => {
      await this.sync({ dryRun: false });
    });

    this.addCommand({
      id: "sync-feishu-inbox",
      name: "Sync Feishu Inbox",
      callback: async () => {
        await this.sync({ dryRun: false });
      }
    });

    this.addCommand({
      id: "dry-run-feishu-inbox-sync",
      name: "Dry-run Feishu Inbox Sync",
      callback: async () => {
        await this.sync({ dryRun: true });
      }
    });

    this.addSettingTab(new FeishuInboxSettingTab(this.app, this));
  }

  async loadPluginData(): Promise<void> {
    const data = (await this.loadData()) as PluginData | null;
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(data?.settings ?? {})
    };
    this.state = {
      ...DEFAULT_STATE,
      ...(data?.state ?? {}),
      recentMessageIds: data?.state?.recentMessageIds ?? [],
      recentSyncs: data?.state?.recentSyncs ?? []
    };
  }

  async savePluginData(): Promise<void> {
    await this.saveData({
      settings: this.settings,
      state: this.state
    });
  }

  async sync(options: { dryRun: boolean }): Promise<void> {
    try {
      this.validateSettings();
      const result = await this.fetchNewMessages();

      if (options.dryRun) {
        if (result.markdown) {
          console.log(result.markdown);
          new Notice(`Feishu dry-run: ${result.messages.length} new message(s). See developer console.`);
        } else {
          new Notice("Feishu dry-run: no new messages.");
        }
        return;
      }

      await this.appendToTargetFile(result.markdown);
      this.state = recordSync(this.state, result.messages, {
        recentMessageLimit: this.settings.recentMessageLimit,
        recentSyncLimit: this.settings.recentSyncLimit,
        dryRun: false
      });
      await this.savePluginData();

      if (result.messages.length === 0) {
        new Notice("Feishu Inbox: no new messages.");
      } else {
        new Notice(`Feishu Inbox: synced ${result.messages.length} message(s).`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new Notice(`Feishu Inbox sync failed: ${message}`);
      console.error(error);
    }
  }

  async listChats(): Promise<void> {
    try {
      if (!this.settings.appId || !this.settings.appSecret) {
        throw new Error("Fill App ID and App Secret first.");
      }
      const client = this.createClient();
      const chats = await client.listChats(this.settings.pageSize);
      if (chats.length === 0) {
        new Notice("No chats visible to this app.");
        return;
      }
      console.log("Feishu visible chats:", chats);
      new Notice(`Found ${chats.length} chat(s). See developer console for IDs.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new Notice(`Failed to list Feishu chats: ${message}`);
      console.error(error);
    }
  }

  private async fetchNewMessages(): Promise<SyncResult> {
    const client = this.createClient();
    const messages = await client.listChatMessages({
      chatId: this.settings.chatId,
      startTimeMs: this.state.lastMessageCreateTimeMs,
      pageSize: this.settings.pageSize
    });
    const newMessages = filterNewMessages(messages, this.state);
    return {
      messages: newMessages,
      markdown: renderMessages(newMessages)
    };
  }

  private async appendToTargetFile(content: string): Promise<void> {
    if (!content) {
      return;
    }

    const normalizedPath = this.normalizeTargetPath();
    const existingFile = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (existingFile instanceof TFile) {
      const existing = await this.app.vault.read(existingFile);
      const separator = buildSeparator(existing);
      await this.app.vault.modify(existingFile, `${existing}${separator}${content}`);
      return;
    }

    await this.app.vault.create(normalizedPath, content);
  }

  private createClient(): FeishuClient {
    return new FeishuClient({
      apiBase: this.settings.apiBase,
      appId: this.settings.appId,
      appSecret: this.settings.appSecret
    });
  }

  private validateSettings(): void {
    const missing: string[] = [];
    if (!this.settings.appId) {
      missing.push("App ID");
    }
    if (!this.settings.appSecret) {
      missing.push("App Secret");
    }
    if (!this.settings.chatId) {
      missing.push("Chat ID");
    }
    if (!this.settings.targetFile) {
      missing.push("Target file");
    }
    if (missing.length > 0) {
      throw new Error(`Missing settings: ${missing.join(", ")}`);
    }
  }

  private normalizeTargetPath(): string {
    return this.settings.targetFile.replace(/^\/+/, "").replace(/\\/g, "/");
  }
}

function buildSeparator(existing: string): string {
  if (!existing || existing.endsWith("\n\n")) {
    return "";
  }
  if (existing.endsWith("\n")) {
    return "\n";
  }
  return "\n\n";
}
