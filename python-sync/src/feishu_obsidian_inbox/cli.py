from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .config import Config, load_config
from .feishu import FeishuClient, FeishuError
from .obsidian import append_to_obsidian, render_messages
from .state import SyncState


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.command == "sync":
        return _sync(args)
    if args.command == "chats":
        return _list_chats(args)
    if args.command == "config":
        return _show_config(args)

    parser.print_help()
    return 0


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="feishu-obsidian-inbox",
        description="Sync Feishu temporary notes into an Obsidian inbox file.",
    )
    parser.add_argument(
        "--env-file",
        type=Path,
        default=Path(".env"),
        help="Path to env file. Defaults to .env.",
    )

    subparsers = parser.add_subparsers(dest="command")

    sync_parser = subparsers.add_parser("sync", help="Fetch and append new messages.")
    sync_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print Markdown without writing Obsidian target or state file.",
    )
    sync_parser.add_argument(
        "--save-state-on-dry-run",
        action="store_true",
        help="Update sync state even when --dry-run is used.",
    )

    subparsers.add_parser("chats", help="List chats visible to the Feishu app.")
    subparsers.add_parser("config", help="Print resolved non-secret configuration.")
    return parser


def _sync(args: argparse.Namespace) -> int:
    try:
        config = load_config(args.env_file)
        _validate_config(config)

        state = SyncState.load(config.state_file)
        client = FeishuClient(
            api_base=config.feishu_api_base,
            app_id=config.app_id,
            app_secret=config.app_secret,
        )
        messages = client.list_chat_messages(
            chat_id=config.chat_id,
            start_time_ms=state.last_message_create_time_ms,
            page_size=config.page_size,
        )
        new_messages = state.filter_new_messages(messages)
        markdown = render_messages(new_messages)

        if args.dry_run:
            if markdown:
                print(markdown, end="")
            else:
                print("No new messages.")
        else:
            append_to_obsidian(config.obsidian_target_file, markdown)
            print(
                f"Synced {len(new_messages)} message(s) to "
                f"{config.obsidian_target_file}"
            )

        should_save_state = (not args.dry_run) or args.save_state_on_dry_run
        if should_save_state:
            state.record_sync(
                new_messages,
                recent_message_limit=config.recent_message_limit,
                recent_sync_limit=config.recent_sync_limit,
                dry_run=args.dry_run,
            )
            state.save(config.state_file)

        return 0
    except (FeishuError, OSError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


def _show_config(args: argparse.Namespace) -> int:
    try:
        config = load_config(args.env_file)
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    missing = config.missing_required_fields
    print(f"FEISHU_APP_ID={'set' if config.app_id else 'missing'}")
    print(f"FEISHU_APP_SECRET={'set' if config.app_secret else 'missing'}")
    print(f"FEISHU_CHAT_ID={'set' if config.chat_id else 'missing'}")
    print(f"OBSIDIAN_TARGET_FILE={config.obsidian_target_file}")
    print(f"STATE_FILE={config.state_file}")
    print(f"FEISHU_API_BASE={config.feishu_api_base}")
    print(f"FEISHU_PAGE_SIZE={config.page_size}")
    print(f"STATE_RECENT_MESSAGE_LIMIT={config.recent_message_limit}")
    print(f"STATE_RECENT_SYNC_LIMIT={config.recent_sync_limit}")
    if missing:
        print(f"Missing required fields: {', '.join(missing)}")
        return 1
    return 0


def _list_chats(args: argparse.Namespace) -> int:
    try:
        config = load_config(args.env_file)
        missing = [
            field
            for field in ("FEISHU_APP_ID", "FEISHU_APP_SECRET")
            if field in config.missing_required_fields
        ]
        if missing:
            raise ValueError(
                "Missing required configuration: "
                + ", ".join(missing)
                + ". Fill these values in .env first."
            )

        client = FeishuClient(
            api_base=config.feishu_api_base,
            app_id=config.app_id,
            app_secret=config.app_secret,
        )
        chats = client.list_chats(page_size=config.page_size)
        if not chats:
            print("No chats visible to this app.")
            return 0

        for chat in chats:
            name = chat.name or "(unnamed chat)"
            print(f"{chat.chat_id}\t{name}")
        return 0
    except (FeishuError, OSError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


def _validate_config(config: Config) -> None:
    missing = config.missing_required_fields
    if missing:
        raise ValueError(
            "Missing required configuration: "
            + ", ".join(missing)
            + ". Copy .env.example to .env and fill these values."
        )
