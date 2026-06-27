from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


DEFAULT_TARGET_FILE = "~/Documents/Obsidian Vault/Inbox/Feishu Inbox.md"


@dataclass(frozen=True)
class Config:
    app_id: str
    app_secret: str
    chat_id: str
    obsidian_target_file: Path
    state_file: Path
    feishu_api_base: str
    page_size: int
    recent_message_limit: int
    recent_sync_limit: int

    @property
    def missing_required_fields(self) -> list[str]:
        missing: list[str] = []
        if not self.app_id:
            missing.append("FEISHU_APP_ID")
        if not self.app_secret:
            missing.append("FEISHU_APP_SECRET")
        if not self.chat_id:
            missing.append("FEISHU_CHAT_ID")
        if not str(self.obsidian_target_file):
            missing.append("OBSIDIAN_TARGET_FILE")
        return missing


def load_config(env_file: Path | None = None) -> Config:
    env = dict(os.environ)
    if env_file is None:
        env_file = Path(".env")
    env.update(_read_env_file(env_file))

    return Config(
        app_id=env.get("FEISHU_APP_ID", "").strip(),
        app_secret=env.get("FEISHU_APP_SECRET", "").strip(),
        chat_id=env.get("FEISHU_CHAT_ID", "").strip(),
        obsidian_target_file=Path(
            env.get("OBSIDIAN_TARGET_FILE", DEFAULT_TARGET_FILE).strip()
        ).expanduser(),
        state_file=Path(env.get("STATE_FILE", "data/sync_state.json").strip()).expanduser(),
        feishu_api_base=env.get(
            "FEISHU_API_BASE", "https://open.feishu.cn/open-apis"
        ).rstrip("/"),
        page_size=_read_int(env, "FEISHU_PAGE_SIZE", default=50, minimum=1, maximum=100),
        recent_message_limit=_read_int(
            env, "STATE_RECENT_MESSAGE_LIMIT", default=500, minimum=10, maximum=5000
        ),
        recent_sync_limit=_read_int(
            env, "STATE_RECENT_SYNC_LIMIT", default=10, minimum=1, maximum=100
        ),
    )


def _read_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}

    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            values[key] = value
    return values


def _read_int(
    env: dict[str, str], key: str, *, default: int, minimum: int, maximum: int
) -> int:
    raw_value = env.get(key, "").strip()
    if not raw_value:
        return default

    try:
        value = int(raw_value)
    except ValueError as exc:
        raise ValueError(f"{key} must be an integer, got {raw_value!r}") from exc

    if value < minimum or value > maximum:
        raise ValueError(f"{key} must be between {minimum} and {maximum}, got {value}")
    return value
