# Skills 安装说明

[English](skills-installation.md) | [简体中文](skills-installation.zh-CN.md)

## 支持的客户端

- Codex
- Claude Code

## Codex

检查状态：

```bash
dorado skill status
```

安装或重新同步：

```bash
dorado skill install
```

默认目录：

```text
~/.codex/skills/
```

## Claude Code

检查状态：

```bash
dorado skill status-claude
```

安装或重新同步：

```bash
dorado skill install-claude
```

默认目录：

```text
~/.claude/skills/
```

## 已安装的 Skill 套件

两个客户端都会拿到同一套 Dorado skills：

- `dorado`
- `dorado-init`
- `dorado-inspect`
- `dorado-backfill`
- `dorado-change`
- `dorado-workflow`
- `dorado-verify`
- `dorado-archive`
- `dorado-finalize`
- `dorado-cli` 兼容别名

## CLI 升级后

CLI 升级后一定要重新同步 skills：

```bash
dorado skill install
dorado skill install-claude
```

然后验证：

```bash
dorado skill status
dorado skill status-claude
```

新的提示词优先使用 `$dorado`。`$dorado-cli` 只保留给旧习惯或旧自动化兼容使用。
