import { requestUrl } from "obsidian";
import { FeishuChat, FeishuMessage } from "./types";

export class FeishuApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeishuApiError";
  }
}

interface FeishuClientOptions {
  apiBase: string;
  appId: string;
  appSecret: string;
}

export class FeishuClient {
  private apiBase: string;
  private appId: string;
  private appSecret: string;

  constructor(options: FeishuClientOptions) {
    this.apiBase = options.apiBase.replace(/\/$/, "");
    this.appId = options.appId;
    this.appSecret = options.appSecret;
  }

  async listChatMessages(options: {
    chatId: string;
    startTimeMs: number | null;
    pageSize: number;
  }): Promise<FeishuMessage[]> {
    const token = await this.tenantAccessToken();
    const messages: FeishuMessage[] = [];
    let pageToken: string | undefined;

    while (true) {
      const params = new URLSearchParams({
        container_id_type: "chat",
        container_id: options.chatId,
        page_size: String(options.pageSize)
      });

      if (options.startTimeMs) {
        params.set("start_time", String(Math.max(0, Math.floor(options.startTimeMs / 1000) - 1)));
      }
      if (pageToken) {
        params.set("page_token", pageToken);
      }

      const payload = await this.requestJson("GET", `/im/v1/messages?${params.toString()}`, token);
      const data = payload.data ?? {};
      for (const item of data.items ?? []) {
        messages.push(parseMessage(item));
      }

      if (!data.has_more || !data.page_token) {
        break;
      }
      pageToken = String(data.page_token);
    }

    return messages.sort((a, b) => {
      if (a.createTimeMs !== b.createTimeMs) {
        return a.createTimeMs - b.createTimeMs;
      }
      return a.messageId.localeCompare(b.messageId);
    });
  }

  async listChats(pageSize: number): Promise<FeishuChat[]> {
    const token = await this.tenantAccessToken();
    const chats: FeishuChat[] = [];
    let pageToken: string | undefined;

    while (true) {
      const params = new URLSearchParams({ page_size: String(pageSize) });
      if (pageToken) {
        params.set("page_token", pageToken);
      }

      const payload = await this.requestJson("GET", `/im/v1/chats?${params.toString()}`, token);
      const data = payload.data ?? {};
      for (const item of data.items ?? []) {
        if (item.chat_id) {
          chats.push({
            chatId: String(item.chat_id),
            name: String(item.name ?? ""),
            description: String(item.description ?? "")
          });
        }
      }

      if (!data.has_more || !data.page_token) {
        break;
      }
      pageToken = String(data.page_token);
    }

    return chats;
  }

  private async tenantAccessToken(): Promise<string> {
    const payload = await this.requestJson("POST", "/auth/v3/tenant_access_token/internal", undefined, {
      app_id: this.appId,
      app_secret: this.appSecret
    });
    const token = payload.tenant_access_token;
    if (!token) {
      throw new FeishuApiError("Feishu response did not include tenant_access_token.");
    }
    return String(token);
  }

  private async requestJson(
    method: string,
    path: string,
    token?: string,
    body?: Record<string, unknown>
  ): Promise<Record<string, any>> {
    const response = await requestUrl({
      url: `${this.apiBase}${path}`,
      method,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      throw: false
    });

    if (response.status < 200 || response.status >= 300) {
      throw new FeishuApiError(`Feishu HTTP ${response.status}: ${response.text}`);
    }

    const payload = response.json as Record<string, any>;
    const code = payload.code ?? 0;
    if (code !== 0) {
      const message = payload.msg ?? payload.message ?? "unknown error";
      throw new FeishuApiError(`Feishu API error ${code}: ${message}`);
    }
    return payload;
  }
}

function parseMessage(item: Record<string, any>): FeishuMessage {
  const rawCreateTime = item.create_time ?? item.update_time ?? 0;
  const createTimeMs = Number.parseInt(String(rawCreateTime), 10) || 0;
  const messageType = String(item.msg_type ?? "unknown");
  const body = item.body ?? {};

  return {
    messageId: String(item.message_id ?? ""),
    createTimeMs,
    messageType,
    text: extractText(String(body.content ?? ""), messageType),
    senderId: extractSenderId(item.sender)
  };
}

function extractText(content: string, messageType: string): string {
  if (!content) {
    return "";
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    return content.trim();
  }

  if (messageType === "text") {
    return String(parsed.text ?? "").trim();
  }

  if (messageType === "post") {
    return extractPostText(parsed).trim();
  }

  return `[${messageType}] ${JSON.stringify(parsed)}`;
}

function extractPostText(content: Record<string, any>): string {
  const parts: string[] = [];
  for (const block of content.content ?? []) {
    for (const item of block ?? []) {
      if (item.text) {
        parts.push(String(item.text));
      }
    }
  }
  return parts.join("\n");
}

function extractSenderId(sender: unknown): string | undefined {
  if (!sender || typeof sender !== "object") {
    return undefined;
  }
  const senderRecord = sender as Record<string, any>;
  const senderId = senderRecord.id;
  if (senderId && typeof senderId === "object") {
    return senderId.user_id ?? senderId.open_id ?? senderId.union_id;
  }
  return senderId ? String(senderId) : undefined;
}
