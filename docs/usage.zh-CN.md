# 使用说明

[English](usage.md) | [简体中文](usage.zh-CN.md)

## 默认方式：用 Skills，不是手敲原生命令

对大多数用户来说，正常的 Dorado 使用方式是：

1. 先把 Dorado skills 安装到 Codex 或 Claude Code
2. 用自然语言描述目标
3. 让 Dorado 自动选择正确流程

本页里的 CLI 命令主要是底层执行面，适合脚本化、精确手控或排查问题时使用。

## 五个最常见的 Skill 请求

### 1. 初始化项目

```text
Use $dorado to initialize this project.
```

```text
使用 $dorado 初始化这个项目。
```

### 2. 检查当前状态

```text
Use $dorado to inspect this repository and tell me what is missing.
```

```text
使用 $dorado 检查这个仓库，并告诉我当前还缺什么。
```

### 3. 补齐项目知识层

```text
Use $dorado to read the existing design documents and backfill the project knowledge layer.
```

```text
使用 $dorado 读取现有设计文档，并补齐项目知识层。
```

### 4. 开始一个需求

```text
Use $dorado-change to create and advance a change for this requirement:
Add a versioned public REST API for project exports.
```

```text
使用 $dorado-change 为这个需求创建并推进一个 change：
为项目导出能力增加一个带版本的公开 REST API。
```

### 5. 收口已完成工作

```text
Use $dorado-finalize to finalize the completed change before commit.
```

```text
使用 $dorado-finalize 在提交前收口这个已完成的 change。
```

## 用自然语言描述队列工作

### 只创建队列，不执行

```text
Use $dorado to read this TODO plan, split it into multiple changes, create a queue, and show the queue state before execution.
```

```text
使用 $dorado 读取这份 TODO 计划，把它拆成多个 change，建立队列，并先展示队列状态，不要马上执行。
```

### 由当前聊天窗口自己执行

```text
Use $dorado to read this TODO plan, create a change queue, and execute it in this current session. Use manual-bridge tracking and do not dispatch an extra local executor.
```

```text
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并由当前聊天窗口按队列执行。使用 manual-bridge 跟踪，不要额外派发本地执行器。
```

### 让 Dorado 调本地 Codex

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the codex executor and archive-chain profile.
```

```text
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并使用 codex 执行器加 archive-chain profile 运行。
```

### 让 Dorado 调本地 Claude Code

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the claude-code executor and archive-chain profile.
```

```text
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并使用 claude-code 执行器加 archive-chain profile 运行。
```

## Dorado 主要需要你说清楚什么

Dorado 实际上主要只需要你说明三件事：

- 你要做什么：init、inspect、backfill、change、finalize 还是 queue
- 谁来执行：当前聊天窗口，还是显式派发的本地执行器
- 怎么收口：如果涉及队列，是 `manual-safe` 还是 `archive-chain`

## CLI 命令参考

当你需要精确手控、写自动化脚本或排查问题时，再直接使用 CLI：

```bash
dorado status [path]
dorado init [path]
dorado docs status [path]
dorado docs generate [path]
dorado new <change-name> [path]
dorado new <change-name> [path] --queued
dorado changes status [path]
dorado queue status [path]
dorado progress [changes/active/<change>]
dorado verify [changes/active/<change>]
dorado finalize [changes/active/<change>]
dorado archive [changes/active/<change>] --check
dorado run start [path] --executor <manual-bridge|codex|claude-code> --profile <manual-safe|archive-chain>
dorado run step [path]
dorado run status [path]
dorado workflow show [path]
dorado workflow set-mode <lite|standard|full> [path]
dorado doctor
```

## 关键行为规则

- plain init 只创建协议壳
- 项目知识层补齐是显式动作
- 第一个 change 需要显式创建
- `run start` 必须显式启动
- 真正的派发或轮询发生在 `run step`
- 没有 active change 和 queued change 时，队列自动停止
- 已归档的 change 保持为历史记录，后续补充工作应新建 change
