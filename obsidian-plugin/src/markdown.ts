import { FeishuMessage } from "./types";

export function renderMessages(messages: FeishuMessage[]): string {
  if (messages.length === 0) {
    return "";
  }

  const lines: string[] = [];
  let currentDate: string | null = null;

  for (const message of messages) {
    const createdAt = new Date(message.createTimeMs);
    const dateText = formatDate(createdAt);
    const timeText = formatTime(createdAt);

    if (dateText !== currentDate) {
      if (lines.length > 0) {
        lines.push("");
      }
      lines.push(`## ${dateText}`);
      lines.push("");
      currentDate = dateText;
    }

    lines.push(`- [ ] ${timeText} #飞书`);
    lines.push(`  ${indentBody(message.text || `[${message.messageType}]`)}`);
    lines.push(`  <!-- feishu_message_id: ${message.messageId} -->`);
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function indentBody(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().replace(/\n/g, "\n  ");
}
