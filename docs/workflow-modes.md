# Workflow Modes

[English](workflow-modes.md) | [简体中文](workflow-modes.zh-CN.md)

## Why This Document Exists

Dorado has multiple workflow concepts that are easy to mix together:

- repository mode
- workflow profile
- change flags
- activated optional steps

This page explains how they relate and how to operate them correctly.

## The Four Layers

### 1. Repository Mode

Repository mode is the repository-level governance setting.

Current values:

- `lite`
- `standard`
- `full`

What it means:

- it expresses governance strength
- it affects the default profile and which optional steps are available in the repository
- it does not mean a different product tier
- it does not mean every change will execute every optional step

### 2. Workflow Profile

Workflow profile is the change-level protocol shape.

It defines what kind of change Dorado believes this work item is.

What it means:

- it is more specific than repository mode
- it is persisted with the change
- it helps determine which protocol files and optional steps matter for this change

### 3. Change Flags

Flags describe concrete runtime traits of a change, such as risk, scope, public API impact, or cross-module work.

Flags help Dorado activate the right optional steps for this specific change.

### 4. Activated Optional Steps

Activated optional steps are the steps that actually apply to a specific active change at runtime.

Examples:

- `code_review`
- `design_doc`
- `plan_doc`
- `security_review`
- `adr`
- `db_change_doc`
- `api_change_doc`

These steps map to real protocol assets inside the change directory.

## Public Command Surface

Current CLI commands:

```bash
dorado workflow show [path]
dorado workflow list-flags
dorado workflow set-mode <lite|standard|full> [path]
dorado workflow set-mode <lite|standard|full> [path] --force-active
```

What they do:

- `workflow show`: inspect current repository workflow configuration
- `workflow list-flags`: inspect available workflow flags
- `workflow set-mode`: switch repository mode
- `--force-active`: allow the mode switch even when active changes exist

## Mode Semantics

### `lite`

Use `lite` when:

- the repository is small
- governance overhead should stay low
- most changes only need essential workflow checks

### `standard`

`standard` is the recommended default.

Use it when:

- the repository is a normal day-to-day team project
- you want balanced governance
- you do not have a reason to push lighter or stricter policy

### `full`

Use `full` when:

- the repository is larger
- the work is riskier
- stronger governance is worth the extra process

`full` means stricter governance, not a more complete edition of Dorado.

## How The Layers Work Together

The simplest mental model is:

1. repository mode defines governance range
2. workflow profile defines the shape of one change
3. flags describe risk and scope details of that change
4. activated optional steps are computed from that profile and flags
5. Dorado verifies real protocol files for those activated steps

## Real Protocol Assets

Activated optional steps map to real files in `changes/active/<change>/`:

- `code_review -> review.md`
- `design_doc -> design.md`
- `plan_doc -> plan.md`
- `security_review -> security.md`
- `adr -> adr.md`
- `db_change_doc -> db-change.md`
- `api_change_doc -> api-change.md`

These assets participate in verify, finalize, archive, and hook enforcement.

## Mode Switching Safety Rules

Default behavior:

- Dorado blocks mode switching when active changes exist
- this is the safe default because repository mode influences runtime governance

Forced behavior:

- `--force-active` allows the switch when active changes exist
- Dorado updates the repository configuration and the active change `state.json` mode values together

What mode switching updates:

- repository workflow mode in project config
- `.skillrc`
- managed protocol-shell `SKILL.md` when it is still CLI-managed
- `SKILL.index.json`
- active change `state.json.mode` when `--force-active` is used

What mode switching does not do:

- it does not rewrite archived history
- it does not auto-complete tasks or verification files
- it does not magically make an incomplete change valid

## Practical Guidance

Most teams should start with:

- `standard`

Choose `lite` only when you deliberately want lighter governance.

Choose `full` only when you deliberately want stricter governance.

Switch modes early when possible. If the repository already has active changes, inspect them first and use `--force-active` only when you explicitly want those active changes brought forward under the new repository mode.

## Dashboard Reading Guide

In the dashboard:

- mode-enabled optional steps describe repository scope
- change-activated optional steps describe one change's actual runtime requirements
- the default workflow profile is the repository fallback, not a forced rule for every active change

## Recommended External Explanation

If you need a short external explanation, use this:

```text
Dorado repository mode controls governance strength. A workflow profile and change flags then decide which optional protocol steps actually apply to a specific change.
```
