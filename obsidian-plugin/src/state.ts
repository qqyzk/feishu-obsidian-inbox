import { FeishuMessage, SyncState } from "./types";

export function filterNewMessages(messages: FeishuMessage[], state: SyncState): FeishuMessage[] {
  const seenIds = new Set(state.recentMessageIds);
  return messages.filter((message) => {
    if (!message.messageId) {
      return false;
    }
    if (message.messageType === "system") {
      return false;
    }
    if (!message.text.trim()) {
      return false;
    }
    if (seenIds.has(message.messageId)) {
      return false;
    }
    if (
      state.lastMessageCreateTimeMs !== null &&
      message.createTimeMs < state.lastMessageCreateTimeMs
    ) {
      return false;
    }
    return true;
  });
}

export function recordSync(
  state: SyncState,
  messages: FeishuMessage[],
  options: {
    recentMessageLimit: number;
    recentSyncLimit: number;
    dryRun: boolean;
  }
): SyncState {
  const nextState: SyncState = {
    lastMessageCreateTimeMs: state.lastMessageCreateTimeMs,
    recentMessageIds: [...state.recentMessageIds],
    recentSyncs: [...state.recentSyncs]
  };

  if (messages.length > 0) {
    const latest = Math.max(...messages.map((message) => message.createTimeMs));
    nextState.lastMessageCreateTimeMs = Math.max(latest, nextState.lastMessageCreateTimeMs ?? 0);
    nextState.recentMessageIds = dedupeKeepTail(
      [
        ...nextState.recentMessageIds,
        ...messages.map((message) => message.messageId).filter(Boolean)
      ],
      options.recentMessageLimit
    );
  }

  nextState.recentSyncs = [
    ...nextState.recentSyncs,
    {
      syncedAt: new Date().toISOString(),
      messageCount: messages.length,
      dryRun: options.dryRun,
      lastMessageCreateTimeMs: nextState.lastMessageCreateTimeMs
    }
  ].slice(-options.recentSyncLimit);

  return nextState;
}

function dedupeKeepTail(values: string[], limit: number): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
    if (result.length >= limit) {
      break;
    }
  }
  return result.reverse();
}
