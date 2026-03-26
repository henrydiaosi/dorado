# Skills 安装说明

## Codex

检查状态：

```bash
dorado skill status
```

安装或同步：

```bash
dorado skill install
```

默认目录：

```text
~/.codex/skills/
```

当前安装的 skill 套件：

- `dorado`
- `dorado-init`
- `dorado-inspect`
- `dorado-backfill`
- `dorado-change`
- `dorado-verify`
- `dorado-archive`
- `dorado-finalize`
- `dorado-cli` 兼容别名

## Claude Code

检查状态：

```bash
dorado skill status-claude
```

安装或同步：

```bash
dorado skill install-claude
```

默认目录：

```text
~/.claude/skills/
```

安装的 skill 套件与 Codex 保持一致。

## 提示词命名

新的提示词优先使用 `$dorado`。

`$dorado-cli` 只作为旧提示词或旧自动化的兼容别名保留。
