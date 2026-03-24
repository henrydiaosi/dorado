# 提示词文档

本文只讨论“如何向 AI 使用 Dorado”，不讨论源码实现。

## 推荐原则

- 直接说目标，不要写很长的协议说明
- 尽量使用短提示词
- 让 Dorado skill 自己展开内部规则

## 初始化相关提示词

- `使用 dorado 初始化当前项目`
- `使用 dorado 初始化这个目录`
- `use dorado to initialize this directory`
- `initialize this project with dorado`

## 状态检查相关提示词

- `使用 dorado 检查当前项目状态`
- `使用 dorado 检查这个仓库`
- `use dorado to inspect this repo`

## 知识层相关提示词

- `使用 dorado 补齐当前项目知识层`
- `使用 dorado 生成项目文档和 skills`
- `use dorado to backfill the project knowledge layer`

## 执行相关提示词

- `使用 dorado 为这个需求创建 change`
- `使用 dorado 推进这个需求`
- `use dorado to create and advance a change for this requirement`

## 给 Codex 的用法

在 Codex 中同步 skill 后，直接使用：

```text
使用 dorado 初始化当前项目
```

或：

```text
Use dorado to inspect this repo and continue the work.
```

## 给 Claude Code 的用法

在 Claude Code 中同步 skill 后，也建议保持同样的短提示词风格：

```text
使用 dorado 检查当前目录
```

或：

```text
使用 dorado 为这个需求创建 change
```

## 不推荐的写法

不建议每次都写一大段重复规则，例如：

- 手动把所有 guardrails 重复一遍
- 手动描述完整内部流程
- 手动规定一堆技能包内部已经知道的细节

短提示词才是 Dorado 的目标使用方式。
