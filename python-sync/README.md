# Feishu Obsidian Inbox Python Sync

This is the first working Python CLI implementation. It is kept as a reference implementation and fallback for the Obsidian plugin.

## Configure

Copy the example environment file:

```bash
cp .env.example .env
```

Fill your own Feishu / Lark app settings:

```env
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_CHAT_ID=
OBSIDIAN_TARGET_FILE=~/Documents/Obsidian Vault/Inbox/Feishu Inbox.md
```

## Use

Dry-run without writing:

```bash
PYTHONPATH=src python3 -m feishu_obsidian_inbox sync --dry-run
```

Sync new messages:

```bash
PYTHONPATH=src python3 -m feishu_obsidian_inbox sync
```

List chats visible to the app:

```bash
PYTHONPATH=src python3 -m feishu_obsidian_inbox chats
```

## Development

This reference implementation uses only the Python standard library.

Run tests:

```bash
PYTHONPATH=src python3 -m unittest discover -s tests
```

Install editable package:

```bash
python3 -m pip install -e .
feishu-obsidian-inbox --help
```

## Sync State

Sync state defaults to:

```text
data/sync_state.json
```

It keeps bounded metadata only:

- `last_message_create_time_ms`
- `recent_message_ids`
- `recent_syncs`

Default retention:

```env
STATE_RECENT_MESSAGE_LIMIT=500
STATE_RECENT_SYNC_LIMIT=10
```
