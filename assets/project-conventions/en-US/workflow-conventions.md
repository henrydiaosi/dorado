---
name: project-workflow-conventions
title: Workflow Conventions
tags: [conventions, workflow, change, dorado]
---

# Workflow Conventions

## Goal

This file fixes the Dorado execution order inside the project so every change follows the same path from planning through implementation, verification, and archive readiness.

## Standard Order

1. Confirm project context and affected scope
2. Create or update `proposal.md`
3. Create or update `tasks.md`
4. Implement according to `state.json`
5. Update affected `SKILL.md`
6. Rebuild `SKILL.index.json`
7. Complete `verification.md`
8. Archive only after all gates pass

## State Rules

- `state.json` is the source of truth for execution state
- `verification.md` does not replace `state.json`
- If state and execution docs conflict, repair the state first

## Optional Steps

- Optional steps are controlled by `.skillrc.workflow`
- Proposal flags must be compatible with the configured workflow flags
- Activated optional steps must appear in both `tasks.md` and `verification.md`

## Archive Gates

- Do not archive when docs are stale
- Do not archive when the index has not been rebuilt
- Do not archive when activated optional steps have not passed
- Do not archive when `verification.md` is incomplete

## Execution Requirement

- Any AI or human working on a change must read `.skillrc`, `SKILL.index.json`, and the current change files first
- Do not skip proposal/tasks and jump straight into implementation

