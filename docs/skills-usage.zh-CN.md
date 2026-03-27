# Skills 使用教程

[English](skills-usage.md) | [简体中文](skills-usage.zh-CN.md)

## 目的

这份文档说明如何通过已安装的 AI skills 使用 Dorado，而不是每一步都自己手敲 CLI 命令。

CLI 仍然是底层执行引擎。Skills 是面向 Codex 或 Claude Code 的 AI 入口，让你可以用简短提示词触发正确的 Dorado 工作流。

## 什么场景用 Skills

以下情况优先用 Dorado skills：

- 你是在 Codex 或 Claude Code 里工作
- 你希望用自然语言表达意图
- 你不想每次都重复 Dorado 内部检查清单
- 你希望 AI 自动选择 init、inspection、知识层补齐、workflow 模式检查、change 执行、verify 或 closeout 的正确流程

以下情况更适合直接用 CLI：

- 你想精确手动控制某个命令
- 你在做脚本化或非 AI 客户端自动化
- 你想直接观察原始命令行为

## 主入口 Skill

默认 skill 是：

- `$dorado`

大多数提示词都优先使用这个入口。

## 专用 Skills

Dorado 还会安装这些更聚焦的 skill 入口：

- `$dorado-init`
- `$dorado-inspect`
- `$dorado-backfill`
- `$dorado-workflow`
- `$dorado-change`
- `$dorado-verify`
- `$dorado-archive`
- `$dorado-finalize`

当你想把动作边界说得非常明确时，使用这些专用入口更合适。

## 推荐 Skills 工作流

### 1. 初始化新仓库

```text
Use $dorado to initialize this project.
```

这里 Dorado 应该自动完成：

- 检查当前目录状态
- 如果未初始化就创建协议壳
- 普通 init 不生成 web scaffold 或首个 change
- 初始化后告诉你当前还缺什么

### 2. 检查已有仓库

```text
Use $dorado-inspect to inspect this repository and summarize the current Dorado state.
```

当你想先分析、暂时不写入时，这个入口最合适。

### 3. 补齐项目知识层

```text
Use $dorado-backfill to read the existing project materials and build the Dorado knowledge layer.
```

当仓库里已经有设计说明、产品文档、API 草案或架构材料时，这就是正确入口。

### 4. 查看或切换工作模式

```text
Use $dorado-workflow to show the current workflow mode and switch to full mode only if it is safe.
```

当仓库治理强度很重要时，用这个入口最合适。Workflow skill 应该主动解释安全规则，不应在你没明确要求时强制更新 active changes。

### 5. 设计文档优先工作流

如果团队在初始化前就已经有设计文档，这是一种有效的 Dorado skills 使用方式：

```text
Use $dorado to initialize this project, read the existing design documents, backfill the project knowledge layer, derive the execution TODO, and then create the first change to execute it.
```

它在底层对应的 Dorado 流程是：

1. 先初始化协议壳
2. 再基于真实设计文档补齐知识层
3. 再细化执行 TODO
4. 再创建首个 change
5. 再进入 change 执行

### 6. 启动一个需求

```text
Use $dorado-change to create and advance a change for this requirement:
Add a versioned public REST API for project exports.
```

Skill 应该把这段意图转成正确的 change 创建和执行流程，而不是要求你自己把内部步骤全写出来。

### 7. 验证当前工作

```text
Use $dorado-verify to verify the current active change.
```

### 8. 完成后的收口

```text
Use $dorado-finalize to finalize the completed change before commit.
```

这是 skill 侧的标准收口入口，应与 CLI 侧的 `finalize -> archive -> commit-ready` 行为对齐。

## Skill 命名建议

- 大多数场景优先使用 `$dorado`
- 如果你要严格限定动作边界，就使用专用 skill
- `$dorado-cli` 只保留给旧兼容场景

## 提示词质量规则

好的 skill 提示词应该：

- 清晰表达目标
- 目标不明确时点明仓库或 change
- 说明当前是 init、inspect、backfill、workflow、change、verify、archive 还是 finalize
- 对 web、backend、Unity、Godot、CLI、纯协议仓库等不同项目类型都保持稳定

通常不需要重复写：

- 协议壳文件检查清单
- “不要创建 web 模板” 这类警告
- “提交前先归档”
- “模式切换前先判断是否安全”
- 具体 CLI 命令名

这些都应该由 Dorado skill 行为和 CLI 协议默认规则兜底。
