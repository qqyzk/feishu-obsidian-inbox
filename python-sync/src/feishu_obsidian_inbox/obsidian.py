from __future__ import annotations

from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from .feishu import FeishuMessage

LOCAL_TZ = ZoneInfo("Asia/Shanghai")


def render_messages(messages: list[FeishuMessage]) -> str:
    if not messages:
        return ""

    lines: list[str] = []
    current_date: str | None = None
    for message in messages:
        local_time = message.created_at.astimezone(LOCAL_TZ)
        date_text = local_time.strftime("%Y-%m-%d")
        time_text = local_time.strftime("%H:%M")

        if date_text != current_date:
            if lines:
                lines.append("")
            lines.append(f"## {date_text}")
            lines.append("")
            current_date = date_text

        text = _indent_body(message.text or f"[{message.message_type}]")
        lines.append(f"- [ ] {time_text} #飞书")
        lines.append(f"  {text}")
        lines.append(f"  <!-- feishu_message_id: {message.message_id} -->")

    return "\n".join(lines).rstrip() + "\n"


def append_to_obsidian(path: Path, content: str) -> None:
    if not content:
        return

    path.parent.mkdir(parents=True, exist_ok=True)
    existing = path.read_text(encoding="utf-8") if path.exists() else ""
    separator = "" if not existing or existing.endswith("\n") else "\n"
    if existing and not existing.endswith("\n\n"):
        separator += "\n"
    with path.open("a", encoding="utf-8") as file:
        file.write(separator)
        file.write(content)


def _indent_body(text: str) -> str:
    normalized = text.replace("\r\n", "\n").replace("\r", "\n").strip()
    return normalized.replace("\n", "\n  ")
