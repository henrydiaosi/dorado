---
name: project-skill-conventions
title: SKILL 编写规范
tags: [conventions, skill, dorado]
---

# SKILL 编写规范

## 目标

本文件用于固定项目中分层 `SKILL.md` 的职责边界，确保 AI 始终先通过索引定位，再读取正确层级的知识文档。

## 分层结构

- 根 `SKILL.md`：项目总导航
- `docs/SKILL.md`：文档中心导航
- `src/SKILL.md`：源码结构地图
- `src/core/SKILL.md`：核心基础层说明
- `src/modules/<module>/SKILL.md`：模块知识单元
- `tests/SKILL.md`：测试策略和入口

## 编写要求

- `SKILL.md` 必须描述当前事实，不写未来计划
- 模块级 `SKILL.md` 应覆盖职责、结构、API、依赖、测试要求
- 发生 API 或边界变化时，必须同步更新相关 `SKILL.md`
- 新增模块时，必须补对应的模块 `SKILL.md`

## 与索引的关系

- `SKILL.index.json` 只负责定位，不替代 `SKILL.md`
- 修改 `SKILL.md` 后，必须重建索引
- AI 在改代码前应先读索引，再读目标 `SKILL.md`

## 执行要求

- 不允许只改代码不改 `SKILL.md`
- 不允许把设计文档内容全部塞进 `SKILL.md`
- `SKILL.md` 描述“现在是什么”，设计文档解释“为什么这样设计”

