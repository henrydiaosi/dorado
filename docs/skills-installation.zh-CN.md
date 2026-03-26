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

## CLI 升级后

CLI 升级完成后，建议把两个目标目录都重新同步一遍，确保提示词和工作流规则与当前发布版一致：

```bash
dorado skill install
dorado skill install-claude
```

然后验证：

```bash
dorado skill status
dorado skill status-claude
```

## 提示词命名

新的提示词优先使用 `$dorado`。

`$dorado-cli` 只作为旧提示词或旧自动化的兼容别名保留。
