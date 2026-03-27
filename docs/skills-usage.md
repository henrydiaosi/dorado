# Skills Usage

[English](skills-usage.md) | [简体中文](skills-usage.zh-CN.md)

## This Is The Main Way To Use Dorado

If you are in Codex or Claude Code, skills are the normal entrypoint.

The CLI is still the execution engine, but most day-to-day Dorado usage should begin with natural-language prompts through `$dorado` or a narrower Dorado skill.

## What You Actually Need To Remember

For most work, remember only this:

- `$dorado` for broad Dorado requests
- `$dorado-change` when the task is clearly about creating or advancing a change
- `$dorado-finalize` when the task is clearly about closeout
- short natural-language prompts are enough

## Main Entries

- `$dorado`
- `$dorado-init`
- `$dorado-inspect`
- `$dorado-backfill`
- `$dorado-change`
- `$dorado-workflow`
- `$dorado-verify`
- `$dorado-archive`
- `$dorado-finalize`

## The Core Mental Model

Every good Dorado skill prompt usually answers three questions:

1. what is the goal
2. who should execute the work
3. whether this is inspect-only, active execution, or closeout

## Common Natural-Language Patterns

### Initialize

```text
Use $dorado to initialize this project.
```

### Inspect

```text
Use $dorado to inspect this repository and tell me what is missing.
```

### Backfill

```text
Use $dorado to read the existing design docs and backfill the project knowledge layer.
```

### Change Creation And Execution

```text
Use $dorado-change to create and advance a change for this requirement:
Add a versioned public REST API for project exports.
```

### Verify

```text
Use $dorado-verify to verify the current active change.
```

### Finalize

```text
Use $dorado-finalize to finalize the completed change before commit.
```

## Queue Patterns

### Queue Only

```text
Use $dorado to read this TODO plan, split it into multiple changes, create a queue, and show the queue state before execution.
```

### Current Window Does The Work

```text
Use $dorado to read this TODO plan, create a change queue, and execute it in this current session. Use manual-bridge tracking and do not dispatch an extra local executor.
```

### Dorado Dispatches Codex

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the codex executor and archive-chain profile.
```

### Dorado Dispatches Claude Code

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the claude-code executor and archive-chain profile.
```

## A Very Important Distinction

If you are already chatting inside Codex or Claude Code, that does not automatically mean Dorado is using the `codex` or `claude-code` executor.

These are different things:

- the current AI client you are talking to
- the executor Dorado may explicitly dispatch through queue running

If you want the current chat window to do the work, say so. If you want Dorado to dispatch a local executor, say that instead.

## When To Use Raw CLI Instead

Use raw CLI commands when:

- you are writing automation scripts
- you want exact manual control
- you are debugging execution details

For normal interactive work, skills should be the default.
