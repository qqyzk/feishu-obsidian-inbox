from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .feishu import FeishuMessage


@dataclass
class SyncState:
    last_message_create_time_ms: int | None = None
    recent_message_ids: list[str] = field(default_factory=list)
    recent_syncs: list[dict[str, Any]] = field(default_factory=list)

    @classmethod
    def load(cls, path: Path) -> "SyncState":
        if not path.exists():
            return cls()

        data = json.loads(path.read_text(encoding="utf-8"))
        return cls(
            last_message_create_time_ms=data.get("last_message_create_time_ms"),
            recent_message_ids=list(data.get("recent_message_ids", [])),
            recent_syncs=list(data.get("recent_syncs", [])),
        )

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(
                {
                    "last_message_create_time_ms": self.last_message_create_time_ms,
                    "recent_message_ids": self.recent_message_ids,
                    "recent_syncs": self.recent_syncs,
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

    def filter_new_messages(self, messages: list[FeishuMessage]) -> list[FeishuMessage]:
        seen_ids = set(self.recent_message_ids)
        new_messages: list[FeishuMessage] = []

        for message in messages:
            if not message.message_id:
                continue
            if message.message_type == "system":
                continue
            if not message.text.strip():
                continue
            if message.message_id in seen_ids:
                continue
            if (
                self.last_message_create_time_ms is not None
                and message.create_time_ms < self.last_message_create_time_ms
            ):
                continue
            new_messages.append(message)

        return new_messages

    def record_sync(
        self,
        messages: list[FeishuMessage],
        *,
        recent_message_limit: int,
        recent_sync_limit: int,
        dry_run: bool,
    ) -> None:
        if messages:
            latest = max(message.create_time_ms for message in messages)
            self.last_message_create_time_ms = max(
                latest, self.last_message_create_time_ms or 0
            )
            merged_ids = self.recent_message_ids + [
                message.message_id for message in messages if message.message_id
            ]
            self.recent_message_ids = _dedupe_keep_tail(merged_ids, recent_message_limit)

        self.recent_syncs.append(
            {
                "synced_at": datetime.now(timezone.utc).isoformat(),
                "message_count": len(messages),
                "dry_run": dry_run,
                "last_message_create_time_ms": self.last_message_create_time_ms,
            }
        )
        self.recent_syncs = self.recent_syncs[-recent_sync_limit:]


def _dedupe_keep_tail(values: list[str], limit: int) -> list[str]:
    result_reversed: list[str] = []
    seen: set[str] = set()
    for value in reversed(values):
        if value in seen:
            continue
        seen.add(value)
        result_reversed.append(value)
        if len(result_reversed) >= limit:
            break
    return list(reversed(result_reversed))
