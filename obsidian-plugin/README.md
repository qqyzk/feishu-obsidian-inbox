# Feishu / Lark Obsidian Inbox Plugin

Planned TypeScript Obsidian plugin for syncing Feishu / Lark group messages into an Obsidian inbox note.

This folder is intentionally separate from `python-sync/`. The Python implementation is the working reference; this plugin will become the user-facing version.

## Planned Settings

- Feishu App ID
- Feishu App Secret
- Feishu Chat ID
- Target inbox file path
- Recent message ID retention limit

## Planned Commands

- `Sync Feishu Inbox`
- `Dry-run Feishu Inbox Sync`

## Notes

Each user should create their own Feishu / Lark custom app and bot. The plugin should never ship with shared credentials.
