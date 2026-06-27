# Project Notes

This document keeps repository and development notes that are useful for maintainers, but too distracting for the Obsidian community plugin README.

## Repository Layout

```text
obsidian-plugin/   TypeScript Obsidian plugin
python-sync/       Working Python CLI reference implementation
docs/              Setup and project documentation
```

## Current Status

The Python version has been tested end to end. The Obsidian plugin has been built and tested locally.

The intended workflow is:

```text
iPhone sends temporary notes to a Feishu / Lark group
→ Obsidian plugin or Python CLI fetches new messages
→ New records are appended to an Obsidian Markdown file
→ Obsidian / AI tools can triage the inbox later
```

## Obsidian Plugin Development

Build:

```bash
cd obsidian-plugin
npm install
npm run build
```

Prepare release assets:

```bash
npm run prepare-release
```

Release assets are written to:

```text
obsidian-plugin/dist/
```

For a GitHub release, upload:

```text
manifest.json
main.js
styles.css
```

## Manual Plugin Installation

1. Build the plugin.
2. Create this folder in your vault:

```text
.obsidian/plugins/feishu-inbox/
```

3. Copy these files into that folder:

```text
obsidian-plugin/manifest.json
obsidian-plugin/main.js
obsidian-plugin/styles.css
```

4. Restart Obsidian and enable `Feishu Obsidian Inbox` in Community plugins.

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

## Release Checklist

1. Update versions in:
   - `manifest.json`
   - `versions.json`
   - `obsidian-plugin/manifest.json`
   - `obsidian-plugin/versions.json`
   - `obsidian-plugin/package.json`
   - `obsidian-plugin/package-lock.json`
2. Run:

```bash
cd obsidian-plugin
npm run prepare-release
```

3. Commit and push.
4. Create a GitHub release with the same tag as `manifest.json`.
5. Upload `manifest.json`, `main.js`, and `styles.css`.

## Privacy

Secrets are local configuration and must not be committed:

- `python-sync/.env`
- Obsidian plugin `data.json`

The repository includes `.env.example` so other users can reproduce the setup without exposing private credentials.

The sync state stores only bounded metadata such as recent message IDs and the latest processed message timestamp.
