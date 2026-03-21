---
name: project-workflow-conventions
title: 工作流执行规范
tags: [conventions, workflow, change, dorado]
---

# 工作流执行规范

## 目标

本文件用于固定项目中的 Dorado 执行流程，确保需求从规划到实现、验证、归档都有统一步骤。

## 标准顺序

1. 明确项目上下文和影响范围
2. 创建或更新 `proposal.md`
3. 创建或更新 `tasks.md`
4. 根据 `state.json` 推进实现
5. 更新相关 `SKILL.md`
6. 重建 `SKILL.index.json`
7. 完成 `verification.md`
8. 满足门禁后再归档

## 状态约束

- 以 `state.json` 为当前执行状态依据
- `verification.md` 不能替代 `state.json`
- 若状态文件与执行文档冲突，先修正状态再继续

## 可选步骤

- 是否启用可选步骤，以 `.skillrc.workflow` 为准
- proposal 中的 flags 必须与 workflow 配置兼容
- 被激活的可选步骤必须进入 `tasks.md` 和 `verification.md`

## 归档约束

- 文档未同步时不得归档
- 索引未重建时不得归档
- 可选步骤未通过时不得归档
- `verification.md` 未完成时不得归档

## 执行要求

- 任何 AI 或人工执行 change 时，都必须先读取 `.skillrc`、`SKILL.index.json` 和当前 change 的执行文件
- 不允许跳过 proposal/tasks 直接进入实现

