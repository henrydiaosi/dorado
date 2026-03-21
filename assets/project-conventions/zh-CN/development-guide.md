---
name: project-development-guide
title: 项目开发指南
tags: [conventions, development, dorado]
---

# 项目开发指南

## 目标

本文件用于作为项目采用版的总开发指南，衔接项目规划、知识层、执行层和 AI 协作方式。

## 开发基线

- 项目级长期知识放在 `docs/project/`
- 当前事实放在分层 `SKILL.md`
- 需求执行放在 `changes/active/<change>/`
- AI 执行入口放在 `for-ai/`

## 推荐工作方式

1. 先确认项目采用版规范
2. 再看项目知识层和模块 `SKILL.md`
3. 再进入当前 change
4. 实现后同步文档和索引

## 不应做的事

- 不要让 AI 自行发明命名规范
- 不要绕开 `changes/` 直接长期开发
- 不要只改代码不改知识层文档

