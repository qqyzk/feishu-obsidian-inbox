import { App, Modal, Setting } from "obsidian";
import { FeishuChat } from "./types";

export class ChatListModal extends Modal {
  private chats: FeishuChat[];
  private onUseChat: (chatId: string) => void;

  constructor(app: App, chats: FeishuChat[], onUseChat: (chatId: string) => void) {
    super(app);
    this.chats = chats;
    this.onUseChat = onUseChat;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Visible Feishu / Lark chats" });
    contentEl.createEl("p", {
      text: "Choose the group used as your mobile inbox. The Chat ID will be copied into plugin settings."
    });

    for (const chat of this.chats) {
      new Setting(contentEl)
        .setName(chat.name || "(unnamed chat)")
        .setDesc(chat.chatId)
        .addButton((button) =>
          button
            .setButtonText("Use")
            .onClick(() => {
              this.onUseChat(chat.chatId);
              this.close();
            })
        );
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
