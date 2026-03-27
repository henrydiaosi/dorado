# 提示词文档

[English](prompt-guide.md) | [简体中文](prompt-guide.zh-CN.md)

## 原则

给 Dorado 的提示词应该表达简短意图，而不是重复一长串内部检查清单。

如果 Dorado CLI 和 Dorado skills 安装正确，协议壳检查、初始化默认行为、change 规则、工作模式规则以及收口顺序都应该由系统自动执行。

## 推荐提示词风格

直接表达意图即可，例如：

```text
Use Dorado to initialize this project.
Use Dorado to inspect the current repository state and tell me what is missing.
Use Dorado to backfill the project knowledge layer.
Use Dorado to create and advance a change for this requirement.
Use Dorado to verify the current active change.
Use Dorado to finalize the completed change before commit.
Use Dorado to show the current workflow mode for this repository.
Use Dorado to switch this repository to full mode.
```

## Skill 优先提示词风格

当你的 AI 客户端支持 Dorado skills 时，优先直接使用 skill 名称：

```text
Use $dorado to initialize this project.
Use $dorado to inspect this repository.
Use $dorado to backfill the project knowledge layer.
Use $dorado-change to create and advance a change for this requirement.
Use $dorado-workflow to inspect the current workflow mode.
Use $dorado-workflow to switch this repository to standard mode.
Use $dorado-finalize to close the completed change before commit.
```

## 好的提示词模式

- 说清目标，而不是内部清单
- 目标不明确时点明仓库或 change
- 说清当前是 inspection、creation、verification、closeout 还是 workflow mode 操作
- 在不同项目类型之间保持稳定表达

## 示例

### 初始化仓库

```text
Use Dorado to initialize this project.
```

### 检查已有仓库

```text
Use Dorado to inspect this repository and summarize the current Dorado state.
```

### 启动一个需求

```text
Use Dorado to create and advance a change for this requirement:
Add a versioned public REST API for project exports.
```

### 设计文档优先启动流程

```text
Use Dorado to initialize this project, read the existing design documents, backfill the project knowledge layer, derive the execution TODO, and then create the first change to execute it.
```

如果仓库方向在初始化前就已经有文档，这是一种完全正确的 Dorado 使用方式。

### 查看或切换工作模式

```text
Use Dorado to show the current workflow mode and switch to full mode only if it is safe.
```

### 归档后继续追加工作

```text
Use Dorado to create a follow-up change for the archived export API work.
```

### 完成后的收口

```text
Use Dorado to finalize this completed change before commit.
```

## 通常不需要重复说明的内容

- “检查目录是否已初始化”
- “不要创建 web 模板”
- “初始化时不要创建首个 change”
- “初始化后验证协议壳”
- “提交前先归档”
- “存在 active changes 时阻止模式切换”

这些都应当是 Dorado 的默认规则，不需要每次提示都重复。

## 什么时候要写得更具体

以下情况建议写得更具体：

- 你想指定 change 名称
- 你只要 inspection，不要写入
- 你要创建 follow-up change，而不是碰归档历史
- 你想指定某一个 skill 入口，而不是通用 `$dorado`
- 你想让 Dorado 从现有设计文档推导知识层和执行 TODO
- 你想明确指定 `lite`、`standard`、`full` 中的某个仓库模式
