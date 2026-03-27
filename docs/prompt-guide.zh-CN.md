# 提示词文档

[English](prompt-guide.md) | [简体中文](prompt-guide.zh-CN.md)

## 默认原则

给 Dorado 写简短自然语言意图。

不要把 Dorado 当成一个每次都需要你重复长清单的系统。只要 CLI 和 skills 安装正确，Dorado 默认就应该知道协议壳规则、收口顺序、队列边界和 skill 守卫。

## 最稳定的默认写法

最推荐的提示词形态是：

```text
Use $dorado to <goal>.
```

如果你希望动作边界更窄，则写：

```text
Use $dorado-change to <goal>.
Use $dorado-finalize to <goal>.
Use $dorado-workflow to <goal>.
```

## 推荐的基础提示词

```text
Use $dorado to initialize this project.
Use $dorado to inspect this repository and tell me what is missing.
Use $dorado to backfill the project knowledge layer from the existing design docs.
Use $dorado-change to create and advance a change for this requirement.
Use $dorado-verify to verify the current active change.
Use $dorado-finalize to finalize the completed change before commit.
```

## 推荐的中文提示词

```text
使用 $dorado 初始化这个项目。
使用 $dorado 检查这个仓库，并告诉我当前还缺什么。
使用 $dorado 读取现有设计文档并补齐项目知识层。
使用 $dorado-change 为这个需求创建并推进一个 change。
使用 $dorado-verify 验证当前 active change。
使用 $dorado-finalize 在提交前收口这个已完成的 change。
```

## 队列提示词模式

### 只建队列，不开始执行

```text
Use $dorado to read this TODO plan, split it into multiple changes, create a queue, and show the queue state before execution.
```

```text
使用 $dorado 读取这份 TODO 计划，把它拆成多个 change，建立队列，并先展示队列状态，不要马上执行。
```

### 由当前聊天窗口执行

```text
Use $dorado to read this TODO plan, create a change queue, and execute it in this current session. Use manual-bridge tracking and do not dispatch an extra local executor.
```

```text
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并由当前聊天窗口按队列执行。使用 manual-bridge 跟踪，不要额外派发本地执行器。
```

### 让 Dorado 调用本地 Codex

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the codex executor and archive-chain profile.
```

```text
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并使用 codex 执行器加 archive-chain profile 运行。
```

### 让 Dorado 调用本地 Claude Code

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the claude-code executor and archive-chain profile.
```

```text
使用 $dorado 读取这份 TODO 计划，建立 change 队列，并使用 claude-code 执行器加 archive-chain profile 运行。
```

## 一般不需要重复强调的内容

- init 时不要创建 Web 模板
- plain init 时不要自动创建第一个 change
- 提交前先 archive
- 队列跑空后自动停止
- 没有 active change 时 hooks 保持安静

## 什么时候要补更多细节

以下场景建议写得更具体：

- 你只想建队列，不想马上执行
- 你希望由当前聊天窗口自己执行
- 你希望 Dorado 显式调用 `codex` 或 `claude-code`
- 你想显式指定 `manual-safe` 或 `archive-chain`
- 你想切换到 `lite`、`standard`、`full` 某种治理模式

## 实用建议

如果你不确定怎么写，先用这句：

```text
Use $dorado to inspect this repository and tell me the correct next step.
```

或者直接用中文：

```text
使用 $dorado 检查这个仓库，并告诉我下一步应该做什么。
```

通常这已经足够让流程不跑偏，而不需要你过度描述内部细节。
