# Dorado

简体中文 | [English](docs/en-US/project-overview.md)

## 项目介绍

Dorado 是一套面向 AI 辅助软件交付的 GUI 优先工作流 CLI。它帮助团队初始化 Dorado 项目、生成项目知识层、创建首个 change，并通过受控的 change 工作流持续推进执行。

核心能力包括：

- 以 Dashboard 为先的项目初始化
- 项目知识层生成，包括 docs、skills 和 AI 指南
- 基于 `changes/active/<change>/` 的 change 驱动执行流
- Codex skill 安装与同步
- 面向常见项目类型的预设规划

## 安装方式

### 方式 1：直接从当前发布仓库安装

```bash
git clone <repo-url>
cd dorado
npm install
npm install -g .
```

安装完成后可执行：

```bash
dorado --help
```

### 方式 2：打包后安装

```bash
npm pack
npm install -g dorado-cli-0.2.0.tgz
```

## 使用指南

检查目录状态：

```bash
dorado status .
```

启动 Dashboard：

```bash
dorado dashboard start .
```

安装或同步 Codex skill：

```bash
dorado skill install
```

常用命令：

```bash
dorado init [path]
dorado new <change-name> [path]
dorado progress ./changes/active/<change>
dorado verify ./changes/active/<change>
dorado archive ./changes/active/<change>
```

详细文档：

- 中文项目说明：[docs/zh-CN/project-overview.md](docs/zh-CN/project-overview.md)
- 中文使用指南：[docs/zh-CN/usage-guide.md](docs/zh-CN/usage-guide.md)
- 中文模式说明：[docs/zh-CN/modes.md](docs/zh-CN/modes.md)
- 中文 AI 提示指南：[docs/zh-CN/ai-prompt-guide.md](docs/zh-CN/ai-prompt-guide.md)
- English project overview: [docs/en-US/project-overview.md](docs/en-US/project-overview.md)
- English usage guide: [docs/en-US/usage-guide.md](docs/en-US/usage-guide.md)
- English modes guide: [docs/en-US/modes.md](docs/en-US/modes.md)
- English AI prompt guide: [docs/en-US/ai-prompt-guide.md](docs/en-US/ai-prompt-guide.md)
