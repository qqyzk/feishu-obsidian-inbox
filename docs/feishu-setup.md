# Feishu / Lark App Setup

This guide will explain how to create a Feishu / Lark custom app for the Obsidian inbox sync plugin.

## What You Need

Each user needs their own Feishu / Lark custom app. Do not use another person's App ID or App Secret.

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

## Notes From a Working Setup

The following flow has been tested:

1. Create a custom app in Feishu Open Platform.
2. Copy App ID and App Secret.
3. Add these scopes:

```text
Obtain and update group information
im:chat

Read direct messages and group chat messages
im:message:readonly

Read all messages in associated group chat
im:message.group_msg
```

4. Enable the Bot feature.
5. Publish a new app version after changing scopes or features.
6. Add the bot to the target group in Feishu.
7. Use the plugin settings to fill App ID, App Secret, and Chat ID.

If Feishu returns `need scope: im:message.group_msg`, add `im:message.group_msg` and publish the app again.
