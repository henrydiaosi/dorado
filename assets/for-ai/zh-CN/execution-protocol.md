---
name: project-execution-protocol
title: Execution Protocol
tags: [ai, protocol, dorado]
---

# AI 执行协议

## 每次进入项目时必须先读

1. `.skillrc`
2. `SKILL.index.json`
3. `docs/project/naming-conventions.md`
4. `docs/project/skill-conventions.md`
5. `docs/project/workflow-conventions.md`
6. 当前 change 的 `proposal.md / tasks.md / state.json / verification.md`

## 强制规则

- 不得跳过 proposal/tasks 直接进入实现
- 必须以 `state.json` 作为执行状态依据
- 被激活的可选步骤必须进入 `tasks.md` 和 `verification.md`
- `SKILL.md` 与索引未同步时不得视为完成

## 项目采用版优先

如果项目内规范与母版规范存在差异，应以项目内采用版为准。

