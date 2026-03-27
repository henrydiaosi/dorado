# 工作模式说明

[English](workflow-modes.md) | [简体中文](workflow-modes.zh-CN.md)

## 两类容易混淆的模式

Dorado 现在有两类很容易混淆的模式：

- repository 治理模式
- 队列执行器模式

它们解决的是不同问题。

## Repository 治理模式

通过这些命令控制：

```bash
dorado workflow show [path]
dorado workflow set-mode <lite|standard|full> [path]
dorado workflow set-mode <lite|standard|full> [path] --force-active
```

### `lite`

适合希望治理更轻的仓库。

### `standard`

大多数仓库的推荐默认值。

### `full`

适合愿意接受更严格治理流程的仓库。

重要说明：

- repository mode 决定治理范围
- 它不是产品档位
- 默认情况下，只要有 active changes 就会阻止切换模式
- 只有当你明确希望同步更新 active changes 时才使用 `--force-active`

## 队列执行器模式

通过这个命令控制：

```bash
dorado run start [path] --executor <manual-bridge|codex|claude-code> --profile <manual-safe|archive-chain>
```

### `manual-bridge`

适合由当前聊天窗口或人工自己完成实现，Dorado 只负责跟踪队列状态和协议进度。

### `codex`

适合让 Dorado 显式调用本地 `codex` CLI。

### `claude-code`

适合让 Dorado 显式调用本地 `claude` CLI。

重要说明：

- 你正在 Codex 或 Claude Code 窗口里聊天，并不自动等于选择了这个执行器
- `run start` 必须显式调用
- 真正的派发或轮询发生在 `run step`

## 收口 Profile

Runner 的 profile 和 executor 是两回事。

### `manual-safe`

- 适合你希望把收口控制权留在自己手里
- Dorado 会跟踪状态，但不会自动跑完整条收口链

### `archive-chain`

- 适合你希望 Dorado 在协议检查通过后继续执行 finalize 和 archive
- Git 提交仍然保持手动

## 队列停止规则

当没有 active change，且没有 queued change 时：

- runner 状态会变成 `completed`
- stage 会变成 `queue-complete`
- Dorado 停止继续派发任务

这意味着 Dorado 队列自动化不是常驻后台守护进程。

## 推荐默认值

- repository mode 先用 `standard`
- 如果希望当前聊天窗口自己执行，就用 `manual-bridge`
- 只有当你明确希望 Dorado 在协议通过后自动继续 finalize 和 archive 时，才使用 `archive-chain`
