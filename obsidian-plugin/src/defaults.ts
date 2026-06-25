import { FeishuInboxSettings, SyncState } from "./types";

export const DEFAULT_SETTINGS: FeishuInboxSettings = {
  appId: "",
  appSecret: "",
  chatId: "",
  targetFile: "Interface/飞书临时记录.md",
  apiBase: "https://open.feishu.cn/open-apis",
  pageSize: 50,
  recentMessageLimit: 500,
  recentSyncLimit: 10
};

export const DEFAULT_STATE: SyncState = {
  lastMessageCreateTimeMs: null,
  recentMessageIds: [],
  recentSyncs: []
};
