export interface FeishuInboxSettings {
  appId: string;
  appSecret: string;
  chatId: string;
  targetFile: string;
  apiBase: string;
  pageSize: number;
  recentMessageLimit: number;
  recentSyncLimit: number;
}

export interface SyncState {
  lastMessageCreateTimeMs: number | null;
  recentMessageIds: string[];
  recentSyncs: SyncSummary[];
}

export interface SyncSummary {
  syncedAt: string;
  messageCount: number;
  dryRun: boolean;
  lastMessageCreateTimeMs: number | null;
}

export interface FeishuMessage {
  messageId: string;
  createTimeMs: number;
  messageType: string;
  text: string;
  senderId?: string;
}

export interface FeishuChat {
  chatId: string;
  name: string;
  description: string;
}

export interface SyncResult {
  messages: FeishuMessage[];
  markdown: string;
}
