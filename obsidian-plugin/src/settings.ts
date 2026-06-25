import { App, PluginSettingTab, Setting } from "obsidian";
import FeishuInboxPlugin from "./main";

const SETUP_GUIDE_URL = "https://github.com/qqyzk/feishu-obsidian-inbox/blob/main/docs/feishu-setup.md";

export class FeishuInboxSettingTab extends PluginSettingTab {
  plugin: FeishuInboxPlugin;

  constructor(app: App, plugin: FeishuInboxPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("p", {
      text: "Create your own Feishu / Lark custom app and bot, then fill the settings below."
    });
    const guide = containerEl.createEl("p");
    guide.createEl("a", {
      text: "Open Feishu / Lark setup guide",
      href: SETUP_GUIDE_URL
    });
    const guideLink = guide.querySelector("a");
    if (guideLink) {
      guideLink.setAttr("target", "_blank");
      guideLink.setAttr("rel", "noopener");
    }

    new Setting(containerEl)
      .setName("Feishu App ID")
      .setDesc("App ID for your Feishu / Lark custom app.")
      .addText((text) =>
        text
          .setPlaceholder("cli_xxx")
          .setValue(this.plugin.settings.appId)
          .onChange(async (value) => {
            this.plugin.settings.appId = value.trim();
            await this.plugin.savePluginData();
          })
      );

    new Setting(containerEl)
      .setName("Feishu App Secret")
      .setDesc("Stored locally in this plugin's data.json. Do not publish your vault config.")
      .addText((text) => {
        text.inputEl.type = "password";
        text
          .setPlaceholder("App Secret")
          .setValue(this.plugin.settings.appSecret)
          .onChange(async (value) => {
            this.plugin.settings.appSecret = value.trim();
            await this.plugin.savePluginData();
          });
      });

    new Setting(containerEl)
      .setName("Chat ID")
      .setDesc("Target group chat ID, usually starting with oc_.")
      .addText((text) =>
        text
          .setPlaceholder("oc_xxx")
          .setValue(this.plugin.settings.chatId)
          .onChange(async (value) => {
            this.plugin.settings.chatId = value.trim();
            await this.plugin.savePluginData();
          })
      );

    new Setting(containerEl)
      .setName("Target file")
      .setDesc("Vault-relative Markdown file to append synced records to.")
      .addText((text) =>
        text
          .setPlaceholder("Interface/飞书临时记录.md")
          .setValue(this.plugin.settings.targetFile)
          .onChange(async (value) => {
            this.plugin.settings.targetFile = value.trim();
            await this.plugin.savePluginData();
          })
      );

    new Setting(containerEl)
      .setName("API base")
      .setDesc("Use the default unless you know you need a different Feishu / Lark API endpoint.")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.apiBase)
          .onChange(async (value) => {
            this.plugin.settings.apiBase = value.trim().replace(/\/$/, "");
            await this.plugin.savePluginData();
          })
      );

    new Setting(containerEl)
      .setName("Page size")
      .setDesc("Number of messages to request per API page.")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.pageSize))
          .onChange(async (value) => {
            this.plugin.settings.pageSize = clampInt(value, 50, 1, 100);
            await this.plugin.savePluginData();
            this.display();
          })
      );

    new Setting(containerEl)
      .setName("Recent message limit")
      .setDesc("How many recent Feishu message IDs to keep for duplicate prevention.")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.recentMessageLimit))
          .onChange(async (value) => {
            this.plugin.settings.recentMessageLimit = clampInt(value, 500, 10, 5000);
            await this.plugin.savePluginData();
            this.display();
          })
      );

    new Setting(containerEl)
      .setName("List visible chats")
      .setDesc("Use this after adding the bot to a group if you need to find its Chat ID.")
      .addButton((button) =>
        button
          .setButtonText("List chats")
          .onClick(async () => {
            await this.plugin.listChats();
          })
      );
  }
}

function clampInt(rawValue: string, fallback: number, minimum: number, maximum: number): number {
  const value = Number.parseInt(rawValue, 10);
  if (Number.isNaN(value)) {
    return fallback;
  }
  return Math.min(maximum, Math.max(minimum, value));
}
