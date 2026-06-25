# Feishu Obsidian Inbox

把飞书 / Lark 群里的手机临时记录同步到 Obsidian inbox 文件。

这个仓库现在分成两条实现线：

```text
python-sync/       已跑通的 Python CLI 版本，作为第一版和参考实现
obsidian-plugin/   准备开发的 Obsidian 插件版本，目标是可发布
docs/              飞书应用/Bot 配置教程和设计文档
```

## 当前状态

`python-sync/` 已经能完成端到端同步：

```text
iPhone 飞书群发消息
→ Mac 脚本请求飞书开放平台 API
→ 追加到 Obsidian 临时记录文件
→ 记录同步状态，避免重复追加
```

目标 Obsidian 文件：

```text
/Users/white/Documents/Obsidian Vault/Interface/飞书临时记录.md
```

## 日常同步

当前可用版本仍是 Python CLI：

```bash
cd /Users/white/Documents/Projects/feishu-obsidian-inbox/python-sync
PYTHONPATH=src python3 -m feishu_obsidian_inbox sync
```

预览但不写入：

```bash
cd /Users/white/Documents/Projects/feishu-obsidian-inbox/python-sync
PYTHONPATH=src python3 -m feishu_obsidian_inbox sync --dry-run
```

`obsidian-plugin/` 已经有第一版 TypeScript MVP：

- 可以构建为 Obsidian 插件。
- 提供侧边栏同步按钮和命令面板命令。
- 提供设置页。
- 直接请求飞书开放平台 API，不依赖 Python。
- 复刻 Python 版的去重、过滤和 Markdown 输出逻辑。

## Obsidian 插件方向

插件本身可以公开发布，但每个用户需要创建自己的飞书 / Lark 自建应用和 Bot，并在插件设置里填写自己的凭证。

当前能力：

- 侧边栏同步按钮。
- 命令面板命令：`Sync Feishu Inbox`。
- 设置页填写 App ID、App Secret、Chat ID、目标文件路径。
- 同步状态保存在插件本地数据中，只保留最近有限数量的消息 ID。
- 默认过滤系统消息，避免把建群、邀请 Bot 等事件写入 inbox。

飞书配置教程会放在 [docs/feishu-setup.md](docs/feishu-setup.md)。
