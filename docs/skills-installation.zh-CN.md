# Skills 安装说明

[English](skills-installation.md) | [简体中文](skills-installation.zh-CN.md)

## Codex

检查当前状态：

```bash
dorado skill status
```

安装或同步 Codex skill 套件：

```bash
dorado skill install
```

默认目标目录：

```text
~/.codex/skills/
```

安装内容：

- `dorado`
- `dorado-init`
- `dorado-inspect`
- `dorado-backfill`
- `dorado-workflow`
- `dorado-change`
- `dorado-verify`
- `dorado-archive`
- `dorado-finalize`
- `dorado-cli` 兼容别名

## Claude Code

检查当前状态：

```bash
dorado skill status-claude
```

安装或同步 Claude Code skill 套件：

```bash
dorado skill install-claude
```

默认目标目录：

```text
~/.claude/skills/
```

Claude Code 套件与主 Dorado skill 集保持一致。

## CLI 升级后

升级 Dorado CLI 后，建议把两个 skill 目标都重新同步一次，确保提示词规则和工作流行为与当前发布版一致：

```bash
dorado skill install
dorado skill install-claude
```

然后再验证：

```bash
dorado skill status
dorado skill status-claude
```

这一步很重要，因为 skills 的提示词内容来自你本地安装的 CLI 版本。只升级 CLI、不重新同步 skills，Codex 或 Claude Code 仍然可能继续使用旧提示词。

## 提示词命名

新提示词优先使用 `$dorado`。

只有在兼容旧习惯或旧自动化时，才继续使用 `$dorado-cli`。
