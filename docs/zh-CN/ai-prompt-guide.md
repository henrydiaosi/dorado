# Dorado AI 提示词教程

## 目标

这份文档给 Codex、ChatGPT、Claude 一类 AI 使用。重点不是介绍命令本身，而是告诉 AI 应该如何被正确提示，才能按 Dorado 的方式初始化项目、进入需求流程、创建第一个 change，并持续推进。

## 基本原则

- 优先让 AI 先检查目录，而不是直接开始写代码
- 新项目优先走 Dashboard，而不是让 AI 自由发挥生成结构
- 先完成项目规划，再进入第一个 change
- 所有实现任务都要落到 change 驱动流程里
- 提示词里尽量明确项目目标、技术栈、模块、API、语言和期望输出

## 推荐起手提示词

适合在一个新目录中开始：

```text
使用 dorado 帮我检查当前目录。
如果这里还不是完整的 Dorado 项目，请先启动 dorado dashboard，
引导我完成项目规划与初始化，然后创建第一个 change。
```

如果你希望 AI 更明确地遵守 GUI-first：

```text
使用 $dorado 检查当前目录。
如果项目未初始化、初始化不完整，或者还没有 active change，
优先启动 dorado dashboard，不要直接跳过规划步骤。
```

## 新项目初始化提示词模板

```text
使用 dorado 帮我初始化一个新项目。
项目名称：<项目名>
项目目标：<一句话描述>
技术栈建议：<技术栈>
核心模块：<模块列表>
需要的 API 边界：<API 列表>
文档语言：中文

请先检查当前目录是否已经具备 Dorado 项目结构。
如果没有，请先启动 dorado dashboard，引导我完成项目规划，
再创建第一个 change。
```

示例：

```text
使用 dorado 帮我初始化一个新项目，我要做 Dorado 官方网站。
技术栈建议：Next.js + TypeScript + Tailwind CSS + Node.js。
需要官网展示、文档中心、博客/更新日志、后台内容管理、鉴权。
请先检查当前目录是否已经具备 Dorado 项目结构。
如果没有，请先启动 dorado dashboard，引导我完成项目规划，
然后创建第一个 change。
```

## 已有项目接入 Dorado 提示词模板

```text
使用 dorado 检查这个已有项目。
如果它还不是完整的 Dorado 项目，请先补齐初始化，
包括项目知识层、AI 指南、技能文档和执行层结构。
完成后再告诉我当前最适合创建哪个第一个 change。
```

## 需求阶段提示词模板

当你只有需求，还没有清晰设计时：

```text
使用 dorado 先做项目规划，不要直接写代码。
请先通过 dashboard 帮我整理：
1. 项目目标
2. 技术方案
3. 模块划分
4. API 边界
5. 设计文档
6. 开发计划

规划完成后，再创建第一个 change。
```

## 第一个 change 提示词模板

```text
基于当前 Dorado 项目规划，帮我创建第一个 change。
这个 change 应该是最小可演示的纵向切片，
并且要覆盖首页/入口、核心模块边界和基础导航。
先给出 change 名称和范围，再落 proposal、tasks、state、verification。
```

## 执行阶段提示词模板

```text
继续当前 active change。
请先读取 change 文档和相关项目知识文档，
按 Dorado 工作流推进，不要跳过 verification。
完成后告诉我当前状态、已完成项和下一步建议。
```

## 约束型提示词模板

当你想防止 AI 偏离流程时：

```text
严格按 Dorado 工作流执行：
1. 先检查目录状态
2. 需要时先走 dashboard
3. 先项目规划，后代码实现
4. 所有工作必须对齐 active change
5. 不要绕过 proposal/tasks/state/verification
6. 不要自己发明项目规范，优先使用 Dorado 已提供的规范文档
```

## 最佳实践

- 在提示词里明确写“先检查目录状态”
- 在提示词里明确写“先启动 dashboard”
- 在提示词里明确写“先项目规划，再创建第一个 change”
- 在提示词里写清楚文档语言
- 在提示词里明确是否要 AI 直接执行，还是只先做规划

## 不推荐的提示方式

下面这种提示容易让 AI 跳过 Dorado 流程：

```text
帮我直接把项目做出来。
```

更好的写法是：

```text
使用 dorado 先完成项目规划和初始化，再基于第一个 change 开始实现。
```
