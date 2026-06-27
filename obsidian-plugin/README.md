# Feishu / Lark Obsidian Inbox Plugin

Sync Feishu / Lark group messages into an Obsidian inbox note.

This is the TypeScript Obsidian plugin version. It is intended to become the user-facing implementation.

It is currently a beta/manual-install plugin and is not yet listed in the official Obsidian community plugin directory.

## Features

- Ribbon icon for manual sync.
- Command palette command: `Sync Feishu Inbox`.
- Dry-run command: `Dry-run Feishu Inbox Sync`.
- Settings page for Feishu credentials, chat ID, target file, and sync retention.
- Duplicate prevention with a bounded recent message ID list.
- System messages are filtered by default.

## Development

```bash
cd obsidian-plugin
npm install
npm run build
```

The build creates `main.js`, which is ignored by git.

Prepare release assets:

```bash
npm run prepare-release
```

This writes release files to `dist/`.

For local manual installation, copy these files into your vault plugin folder:

```text
manifest.json
main.js
styles.css
```

`styles.css` is optional for the current MVP because the plugin does not define custom styles yet.

## Settings

- `Feishu App ID`
- `Feishu App Secret`
- `Chat ID`
- `Target file`, for example `Inbox/Feishu Inbox.md`
- `API base`
- `Page size`
- `Recent message limit`

Each user should create their own Feishu / Lark custom app and bot. The plugin should never ship with shared credentials.

## Privacy

The App Secret is stored in the plugin's local `data.json` under your vault's `.obsidian/plugins/feishu-obsidian-inbox/` folder. Do not publish or sync that file to untrusted places.
