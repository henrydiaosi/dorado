# Skills Usage

[English](skills-usage.md) | [简体中文](skills-usage.zh-CN.md)

## Purpose

This guide explains how to use Dorado through installed AI skills instead of typing the CLI commands yourself.

The CLI is still the execution engine. Skills are the AI-facing entrypoints that let Codex or Claude Code choose the right Dorado workflow automatically from a short prompt.

## When To Use Skills

Use Dorado skills when:

- you are working through Codex or Claude Code
- you want to describe intent in natural language
- you want Dorado rules to be applied without repeating the internal checklist
- you want the AI to choose the correct flow for init, inspection, knowledge backfill, workflow mode inspection, change execution, verification, or closeout

Use the CLI directly when:

- you want exact manual control over a specific command
- you are scripting or automating outside an AI client
- you want to inspect raw command behavior

## Main Skill Entry

The default skill is:

- `$dorado`

This is the recommended entry for most prompts.

## Specialized Skills

Dorado also installs narrower skill entrypoints:

- `$dorado-init`
- `$dorado-inspect`
- `$dorado-backfill`
- `$dorado-workflow`
- `$dorado-change`
- `$dorado-verify`
- `$dorado-archive`
- `$dorado-finalize`

These are useful when you want a very explicit workflow boundary.

## Recommended Skill Workflows

### 1. Initialize A New Repository

```text
Use $dorado to initialize this project.
```

What Dorado should do:

- inspect the current directory
- create the protocol shell if the repository is not initialized
- avoid generating a web scaffold or first change during plain init
- report what is still missing after initialization

### 2. Inspect An Existing Repository

```text
Use $dorado-inspect to inspect this repository and summarize the current Dorado state.
```

Use this when you want read-first analysis before making changes.

### 3. Backfill The Project Knowledge Layer

```text
Use $dorado-backfill to read the existing project materials and build the Dorado knowledge layer.
```

This is the right entry when the repository already has design notes, product docs, API drafts, or architecture material.

### 4. Inspect Or Switch Workflow Mode

```text
Use $dorado-workflow to show the current workflow mode and switch to full mode only if it is safe.
```

Use this when the repository governance level matters. The workflow skill should explain the safety rules and avoid forcing active-change updates unless you explicitly ask for that.

### 5. Document-First Project Workflow

If your team already has a design document before initialization, this is a valid Dorado skills workflow:

```text
Use $dorado to initialize this project, read the existing design documents, backfill the project knowledge layer, derive the execution TODO, and then create the first change to execute it.
```

This maps to the underlying Dorado flow:

1. protocol-shell init
2. knowledge backfill from real project documents
3. execution TODO refinement
4. first change creation
5. change execution

### 6. Start A Requirement

```text
Use $dorado-change to create and advance a change for this requirement:
Add a versioned public REST API for project exports.
```

The skill should translate this into the correct change creation and execution workflow instead of making you spell out the internal steps.

### 7. Verify Active Work

```text
Use $dorado-verify to verify the current active change.
```

### 8. Close Out Completed Work

```text
Use $dorado-finalize to finalize the completed change before commit.
```

This is the standard skill-side closeout path. It should align with the CLI-side `finalize -> archive -> commit-ready` behavior.

## Skill Naming Guidance

- prefer `$dorado` for most prompts
- use specialized skills when you want a narrow action boundary
- use `$dorado-cli` only for legacy compatibility

## Prompt Quality Rules

Good skill prompts:

- state the goal clearly
- mention the repository or change when ambiguous
- mention whether the task is init, inspect, backfill, workflow, change, verify, archive, or finalize
- stay stable across project types such as web, backend, Unity, Godot, CLI, or protocol-only repositories

You usually do not need to repeat:

- protocol-shell file checklists
- warnings like "do not create a web template"
- "archive before commit"
- "block mode switching unless it is safe"
- the exact CLI command names

Those are part of the Dorado skill behavior and CLI protocol defaults.
