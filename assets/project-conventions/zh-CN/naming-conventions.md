---
name: project-naming-conventions
title: 项目命名规范
tags: [conventions, naming, dorado]
---

# 项目命名规范

## 目标

本文件是从 Dorado 母版复制到项目中的采用版规范，用于固定项目内的命名方式，避免 AI 或人工在开发过程中临时发明命名风格。

## 基本规则

- 目录、模块、change 名称统一使用小写短横线
- flags、optional steps 统一使用小写下划线
- Markdown 协议文件名使用固定名称，不得自定义变体
- API 文档文件名优先使用语义化短横线

## change 命名

- 使用 `changes/active/<change-name>/`
- 示例：`add-token-refresh`
- 避免使用日期、中文、空格、大写字母

## 模块命名

- 模块目录使用语义化英文短横线或单词
- 示例：`src/modules/auth`、`src/modules/content`
- 模块 `SKILL.md` 必须放在模块根目录

## 文档命名

- 项目级文档放在 `docs/project/`
- 设计文档放在 `docs/design/`
- 计划文档放在 `docs/planning/`
- API 文档放在 `docs/api/`

## 固定协议文件

- `proposal.md`
- `tasks.md`
- `state.json`
- `verification.md`
- `review.md`

## 执行要求

- 新增目录、模块、change、flags 时，必须先检查本规范
- 与本规范冲突时，应优先修正文档和实现，而不是继续扩散不一致命名

