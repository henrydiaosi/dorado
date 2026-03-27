# Dorado

[English](README.md) | [简体中文](README.zh-CN.md)

Dorado 是一个以协议壳优先为核心的 AI 协作工作流系统。

绝大多数用户都应该通过 skills 和自然语言来使用 Dorado。CLI 仍然是真正的执行引擎，但通常是 skills 底下那一层，而不是用户每天手敲的主入口。

当前版本：

- CLI：`0.10.1`
- Skills 协议版本：`5.0.2`

建议先看：

- [项目介绍](docs/project-overview.zh-CN.md)
- [提示词文档](docs/prompt-guide.zh-CN.md)
- [Skills 使用教程](docs/skills-usage.zh-CN.md)
- [Skills 安装说明](docs/skills-installation.zh-CN.md)
- [使用说明](docs/usage.zh-CN.md)
- [工作模式说明](docs/workflow-modes.zh-CN.md)
- [安装说明](docs/installation.zh-CN.md)

## Skills 优先的默认用法

如果 Codex 或 Claude Code 已经安装了 Dorado skills，优先直接用这类短提示词：

```text
Use $dorado to initialize this project.
Use $dorado to inspect this repository and tell me what is missing.
Use $dorado to backfill the project knowledge layer from the existing design docs.
Use $dorado-change to create and advance a change for this requirement.
Use $dorado-finalize to finalize the completed change before commit.
```

也可以直接用中文这样说：

```text
使用 $dorado 初始化这个项目。
使用 $dorado 检查这个仓库，并告诉我当前还缺什么。
使用 $dorado 读取现有设计文档并补齐项目知识层。
使用 $dorado-change 为这个需求创建并推进一个 change。
使用 $dorado-finalize 在提交前收口这个已完成的 change。
```

如果是队列场景：

```text
Use $dorado to read this TODO plan, split it into multiple changes, create a queue, and show the queue state before execution.
Use $dorado to read this TODO plan, create a change queue, and execute it in this current session with manual-bridge tracking.
Use $dorado to read this TODO plan, create a change queue, and run it with the codex executor and archive-chain profile.
Use $dorado to read this TODO plan, create a change queue, and run it with the claude-code executor and archive-chain profile.
```

中文也可以直接这样说：

```text
使用 $dorado 读取这份 TODO 计划，把它拆成多个 change，建立队列，并先展示队列状态，不要马上执行。
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并由当前聊天窗口按队列执行，使用 manual-bridge 跟踪，不要额外派发本地执行器。
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并使用 codex 执行器加 archive-chain profile 运行。
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并使用 claude-code 执行器加 archive-chain profile 运行。
```

## 当前发布版覆盖能力

- 仅创建协议壳的 init
- 显式触发的项目知识层补齐
- 包含 verify、finalize、archive 的 change 工作流
- 顺序执行的 change 队列
- `manual-bridge`、`codex`、`claude-code` 执行器模式
- 最后一个 change 完成后队列自动停止
- Codex 与 Claude Code 的 skills 安装和同步
- inspection-first 的 dashboard

## 用户真正要记住的事

- 用自然语言说明你想做什么
- 优先使用 `$dorado` 和更窄边界的 Dorado skills
- 只有在你想精确手控或写脚本时，再直接使用 CLI 命令
