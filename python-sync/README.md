# Feishu Obsidian Inbox Python Sync

把 iPhone 飞书专用群里的临时记录，手动同步追加到本地 Obsidian inbox 文件。

这是第一版 Python CLI 实现，已经跑通端到端流程。后续 Obsidian 插件版本会以这里的 API、格式化和去重逻辑作为参考。

目标 Obsidian 文件：

```text
/Users/white/Documents/Obsidian Vault/Interface/飞书临时记录.md
```

## 使用方式

当前 `.env` 已经保存在本目录下。日常同步：

```bash
cd /Users/white/Documents/Projects/feishu-obsidian-inbox/python-sync
PYTHONPATH=src python3 -m feishu_obsidian_inbox sync
```

预览但不写入：

```bash
cd /Users/white/Documents/Projects/feishu-obsidian-inbox/python-sync
PYTHONPATH=src python3 -m feishu_obsidian_inbox sync --dry-run
```

列出应用可见的飞书群：

```bash
cd /Users/white/Documents/Projects/feishu-obsidian-inbox/python-sync
PYTHONPATH=src python3 -m feishu_obsidian_inbox chats
```

## 本地开发

本项目暂时只使用 Python 标准库，不需要安装第三方依赖。

```bash
cd /Users/white/Documents/Projects/feishu-obsidian-inbox/python-sync
PYTHONPATH=src python3 -m unittest discover -s tests
```

也可以安装为 editable 包：

```bash
python3 -m pip install -e .
feishu-obsidian-inbox --help
```

## 状态与去重

同步状态默认保存在：

```text
data/sync_state.json
```

状态文件只保留有限的近期信息：

- `last_message_create_time_ms`：上次处理到的最新消息时间。
- `recent_message_ids`：最近见过的一批消息 ID，用来处理同一时间戳附近的重复。
- `recent_syncs`：最近几次同步摘要，便于排查问题。

默认限制：

```env
STATE_RECENT_MESSAGE_LIMIT=500
STATE_RECENT_SYNC_LIMIT=10
```
