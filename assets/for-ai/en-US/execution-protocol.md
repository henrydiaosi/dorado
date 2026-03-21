---
name: project-execution-protocol
title: Execution Protocol
tags: [ai, protocol, dorado]
---

# Execution Protocol

## Read First On Every Session

1. `.skillrc`
2. `SKILL.index.json`
3. `docs/project/naming-conventions.md`
4. `docs/project/skill-conventions.md`
5. `docs/project/workflow-conventions.md`
6. The active change files: `proposal.md`, `tasks.md`, `state.json`, `verification.md`

## Hard Rules

- Do not skip proposal/tasks and jump directly into implementation
- Use `state.json` as the source of truth for execution status
- Activated optional steps must appear in both `tasks.md` and `verification.md`
- Work is not considered complete while `SKILL.md` or the index is stale

## Project-Adopted Rules Win

If project-adopted rules differ from the mother spec, follow the project-adopted version.

