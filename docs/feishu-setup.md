# Feishu / Lark App Setup

This guide will explain how to create a Feishu / Lark custom app for the Obsidian inbox sync plugin.

## Required Permissions

Add these tenant token scopes:

```text
im:chat
im:message:readonly
im:message.group_msg
```

The app also needs the Bot feature enabled and published.

## Setup Outline

1. Open Feishu Open Platform.
2. Create a custom app.
3. Copy the App ID and App Secret.
4. Add Messenger permissions.
5. Enable the Bot feature.
6. Publish a new app version.
7. Add the bot to the target Feishu group.
8. Copy the group `chat_id` into the Obsidian plugin settings.

Screenshots should be added after redacting personal names, app IDs, and secrets.
