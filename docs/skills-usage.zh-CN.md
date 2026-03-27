# Skills 使用教程

[English](skills-usage.md) | [简体中文](skills-usage.zh-CN.md)

## 这才是使用 Dorado 的主方式

如果你正在 Codex 或 Claude Code 里工作，skills 才是 Dorado 的正常入口。

CLI 仍然是真正的执行引擎，但日常使用 Dorado 时，大多数场景都应该从 `$dorado` 或更窄边界的 Dorado skill 自然语言提示词开始。

## 你真正需要记住的东西

大多数情况下，只需要记住下面几件事：

- 广义 Dorado 请求用 `$dorado`
- 明确是创建或推进 change 时用 `$dorado-change`
- 明确是收口时用 `$dorado-finalize`
- 短自然语言通常就够了

## 主要入口

- `$dorado`
- `$dorado-init`
- `$dorado-inspect`
- `$dorado-backfill`
- `$dorado-change`
- `$dorado-workflow`
- `$dorado-verify`
- `$dorado-archive`
- `$dorado-finalize`

## 核心思维模型

一个好的 Dorado skill 提示词，通常只需要回答三个问题：

1. 目标是什么
2. 谁来执行
3. 当前是只检查、正在执行，还是收口

## 常见自然语言模式

### 初始化

```text
Use $dorado to initialize this project.
```

```text
使用 $dorado 初始化这个项目。
```

### 检查

```text
Use $dorado to inspect this repository and tell me what is missing.
```

```text
使用 $dorado 检查这个仓库，并告诉我当前还缺什么。
```

### 补齐知识层

```text
Use $dorado to read the existing design docs and backfill the project knowledge layer.
```

```text
使用 $dorado 读取现有设计文档，并补齐项目知识层。
```

### 创建并执行 Change

```text
Use $dorado-change to create and advance a change for this requirement:
Add a versioned public REST API for project exports.
```

```text
使用 $dorado-change 为这个需求创建并推进一个 change：
为项目导出能力增加一个带版本的公开 REST API。
```

### 验证

```text
Use $dorado-verify to verify the current active change.
```

```text
使用 $dorado-verify 验证当前 active change。
```

### 收口

```text
Use $dorado-finalize to finalize the completed change before commit.
```

```text
使用 $dorado-finalize 在提交前收口这个已完成的 change。
```

## 队列模式

### 只建队列

```text
Use $dorado to read this TODO plan, split it into multiple changes, create a queue, and show the queue state before execution.
```

```text
使用 $dorado 读取这份 TODO 计划，把它拆成多个 change，建立队列，并先展示队列状态，不要马上执行。
```

### 当前窗口自己执行

```text
Use $dorado to read this TODO plan, create a change queue, and execute it in this current session. Use manual-bridge tracking and do not dispatch an extra local executor.
```

```text
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并由当前聊天窗口按队列执行。使用 manual-bridge 跟踪，不要额外派发本地执行器。
```

### 让 Dorado 调 Codex

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the codex executor and archive-chain profile.
```

```text
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并使用 codex 执行器加 archive-chain profile 运行。
```

### 让 Dorado 调 Claude Code

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the claude-code executor and archive-chain profile.
```

```text
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并使用 claude-code 执行器加 archive-chain profile 运行。
```

## 一个非常重要的区别

你正在 Codex 或 Claude Code 聊天窗口里工作，并不自动等于 Dorado 正在使用 `codex` 或 `claude-code` 执行器。

这是两件不同的事：

- 你当前正在对话的 AI 客户端
- Dorado 在队列执行时是否显式派发执行器

如果你希望由当前聊天窗口自己执行，就明确说出来。  
如果你希望 Dorado 调用本地执行器，也明确说出来。

## 什么时候才直接用 CLI

以下场景才更适合直接用原生命令：

- 你在写自动化脚本
- 你想精确手控每一步
- 你在排查底层执行细节

正常交互场景下，应当默认优先使用 skills。
