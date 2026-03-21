---
name: project-ai-guide
title: AI Guide
tags: [ai, guide, dorado]
---

# AI 开发指南

## 目标

本文件是从 Dorado 母版复制到项目中的采用版 AI 指南。AI 必须先读取项目采用版规范，而不是回到母版仓库重新自由发挥。

## Working Order

1. 读取 `.skillrc`
2. 读取 `SKILL.index.json`
3. 读取 `docs/project/` 下的项目采用版规范
4. 读取相关 `SKILL.md`
5. 读取当前 change 的执行文件

## 必须遵守

- 先按索引定位，再读目标知识文件
- 先看项目采用版规范，再进入实现
- 修改代码后同步更新 `SKILL.md`
- 必要时重建 `SKILL.index.json`

## 项目采用版优先

- 命名规范：`docs/project/naming-conventions.md`
- SKILL 规范：`docs/project/skill-conventions.md`
- 工作流规范：`docs/project/workflow-conventions.md`
- 项目开发指南：`docs/project/development-guide.md`

