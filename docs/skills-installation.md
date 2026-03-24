# Skills 安装说明

本文只讨论 Dorado skills 的安装、同步和检查。

## 什么时候需要安装 skills

如果你希望在 AI 客户端里直接使用 Dorado 的短提示词和规则展开能力，就需要安装 skills。

典型场景：

- 在 Codex 中使用 Dorado
- 在 Claude Code 中使用 Dorado
- 本地更新了 Dorado 发布仓后，想把最新 skill 同步到客户端

## 安装 Codex skill

执行：

```bash
dorado skill install
```

检查状态：

```bash
dorado skill status
```

默认安装目录：

```text
~/.codex/skills/dorado
```

兼容别名目录：

```text
~/.codex/skills/dorado-cli
```

## 安装 Claude Code skill

执行：

```bash
dorado skill install-claude
```

检查状态：

```bash
dorado skill status-claude
```

默认安装目录：

```text
~/.claude/skills/dorado
```

兼容别名目录：

```text
~/.claude/skills/dorado-cli
```

## 更新 skills

当你已经升级本地 Dorado 发布仓后，建议重新执行：

```bash
dorado skill install
dorado skill install-claude
```

然后分别检查：

```bash
dorado skill status
dorado skill status-claude
```

如果输出里显示 `In sync: yes`，说明本地客户端已同步到当前发布仓版本。

## 安装后怎么用

安装完成后，可以在 AI 客户端里直接使用短提示词，例如：

- `使用 dorado 初始化当前项目`
- `使用 dorado 检查当前目录`
- `使用 dorado 补齐当前项目知识层`
- `使用 dorado 为这个需求创建 change`

不需要每次都手动重复一大段规则说明。
