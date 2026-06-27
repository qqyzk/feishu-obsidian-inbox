import { App, Modal, Setting } from "obsidian";

const SETUP_GUIDE_URL = "https://github.com/qqyzk/feishu-obsidian-inbox/blob/main/docs/feishu-setup.md";

export class FeishuSetupGuideModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("feishu-inbox-guide");

    contentEl.createEl("h2", { text: "Feishu / Lark setup guide" });
    contentEl.createEl("p", {
      text: "Create your own Feishu / Lark custom app and bot, then copy the app credentials and target group chat ID into this plugin."
    });

    createSection(contentEl, "1. Create a custom app", [
      "Open Feishu Open Platform.",
      "Go to Developer Console.",
      "Create a Custom App. Do not choose a store app.",
      "Use any private name, for example Feishu Obsidian Inbox."
    ]);

    createSection(contentEl, "2. Copy app credentials", [
      "Open Credentials & Basic Info.",
      "Copy App ID into this plugin's Feishu App ID field.",
      "Copy App Secret into this plugin's Feishu App Secret field.",
      "Keep the App Secret private. It is stored only in this vault's local plugin data."
    ]);

    createSection(contentEl, "3. Add permissions", [
      "Open Permissions & Scopes.",
      "Add these tenant token scopes: im:chat, im:message:readonly, im:message.group_msg.",
      "If Feishu later reports need scope: im:message.group_msg, add that scope and publish again."
    ]);

    createSection(contentEl, "4. Enable Bot", [
      "Open Add Features.",
      "Add the Bot feature.",
      "Publish a new app version after adding scopes or the Bot feature."
    ]);

    createSection(contentEl, "5. Add bot to the target group", [
      "Open the Feishu / Lark group used as your mobile inbox.",
      "Open group settings and add the bot/app you created.",
      "The group chat ID usually starts with oc_."
    ]);

    createSection(contentEl, "6. Fill plugin settings", [
      "Fill Feishu App ID, Feishu App Secret, Chat ID, and Target file.",
      "The target file is vault-relative, for example Inbox/Feishu Inbox.md.",
      "Use List visible chats if you need help finding the Chat ID."
    ]);

    new Setting(contentEl)
      .setName("Screenshot guide")
      .setDesc("Open the GitHub guide for screenshots and updated Feishu UI notes.")
      .addButton((button) =>
        button
          .setButtonText("Open GitHub guide")
          .onClick(() => {
            window.open(SETUP_GUIDE_URL);
          })
      );
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

function createSection(container: HTMLElement, title: string, items: string[]): void {
  container.createEl("h3", { text: title });
  const list = container.createEl("ol");
  for (const item of items) {
    list.createEl("li", { text: item });
  }
}

export { SETUP_GUIDE_URL };
