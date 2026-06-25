# Feishu Obsidian Inbox

Sync quick notes from a Feishu / Lark group chat into an Obsidian inbox note.

The intended workflow is simple:

```text
iPhone sends temporary notes to a Feishu / Lark group
→ Obsidian plugin or Python CLI fetches new messages
→ New records are appended to an Obsidian Markdown file
→ Obsidian / AI tools can triage the inbox later
```

## Status

This repository currently contains two implementations:

```text
obsidian-plugin/   TypeScript Obsidian plugin MVP
python-sync/       Working Python CLI reference implementation
docs/              Feishu / Lark setup notes
```

The Python version has been tested end to end. The Obsidian plugin MVP has also been built and tested locally, but it is not yet listed in the official Obsidian community plugin directory.

## Obsidian Plugin

Features:

- Manual sync from a ribbon icon.
- Command palette command: `Sync Feishu Inbox`.
- Dry-run command: `Dry-run Feishu Inbox Sync`.
- Settings page for Feishu / Lark credentials, chat ID, target file, and sync retention.
- Direct Feishu / Lark Open Platform API calls. Python is not required.
- Duplicate prevention with bounded local state.
- System messages are filtered by default.

Build:

```bash
cd obsidian-plugin
npm install
npm run build
```

Manual installation for testing:

1. Build the plugin.
2. Create this folder in your vault:

```text
.obsidian/plugins/feishu-obsidian-inbox/
```

3. Copy these files into that folder:

```text
obsidian-plugin/manifest.json
obsidian-plugin/main.js
obsidian-plugin/styles.css
```

4. Restart Obsidian and enable `Feishu Obsidian Inbox` in Community plugins.

## Feishu / Lark Setup

Each user must create their own Feishu / Lark custom app and bot. This project never ships shared credentials.

Required scopes:

```text
im:chat
im:message:readonly
im:message.group_msg
```

The bot must be added to the target group chat. See [docs/feishu-setup.md](docs/feishu-setup.md).

## Python CLI

The Python implementation is kept as a working reference and fallback.

Configure it from the example file:

```bash
cd python-sync
cp .env.example .env
```

Then fill:

```env
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_CHAT_ID=
OBSIDIAN_TARGET_FILE=
```

Run a dry-run:

```bash
PYTHONPATH=src python3 -m feishu_obsidian_inbox sync --dry-run
```

Run a real sync:

```bash
PYTHONPATH=src python3 -m feishu_obsidian_inbox sync
```

## Privacy

Secrets are local configuration and must not be committed:

- `python-sync/.env`
- Obsidian plugin `data.json`

The repository includes `.env.example` so other users can reproduce the setup without exposing private credentials.

The sync state stores only bounded metadata such as recent message IDs and the latest processed message timestamp.

## Release Notes

For a beta release, upload the built Obsidian plugin assets:

```text
manifest.json
main.js
styles.css
```

Official Obsidian community plugin submission should happen after the plugin has had some beta testing.
