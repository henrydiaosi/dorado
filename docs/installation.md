# 安装使用文档

## 环境要求

- Node.js 18+
- npm 8+

## 本地安装

在当前仓库目录执行：

```bash
npm install
npm install -g .
```

安装完成后检查：

```bash
dorado --version
dorado --help
```

## 安装 Codex skill

```bash
dorado skill install
dorado skill status
```

默认安装位置：

```text
~/.codex/skills/dorado
```

## 安装 Claude Code skill

```bash
dorado skill install-claude
dorado skill status-claude
```

默认安装位置：

```text
~/.claude/skills/dorado
```

## 常用命令

```bash
dorado status [path]
dorado init [path]
dorado docs generate [path]
dorado new <change-name> [path]
dorado progress [changes/active/<change>]
dorado verify [changes/active/<change>]
dorado archive [changes/active/<change>]
dorado dashboard start [path] [--port <port>] [--no-open]
```

## 升级当前发布仓安装

如果你已经在本地安装过旧版本，进入当前仓库后重新执行：

```bash
npm install
npm install -g .
```

然后重新同步本地 skills：

```bash
dorado skill install
dorado skill install-claude
```
