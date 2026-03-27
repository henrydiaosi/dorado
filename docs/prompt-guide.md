# Prompt Guide

[English](prompt-guide.md) | [简体中文](prompt-guide.zh-CN.md)

## Default Rule

Prompt Dorado with short natural-language intent.

Do not treat Dorado as a system that needs a long repeated checklist every time. If the CLI and skills are installed correctly, Dorado should already know the protocol-shell rules, closeout order, queue boundaries, and skill guardrails.

## The Best Default Shape

The most stable prompt shape is:

```text
Use $dorado to <goal>.
```

Or, when you want a narrower action boundary:

```text
Use $dorado-change to <goal>.
Use $dorado-finalize to <goal>.
Use $dorado-workflow to <goal>.
```

## Good Default Prompts

```text
Use $dorado to initialize this project.
Use $dorado to inspect this repository and tell me what is missing.
Use $dorado to backfill the project knowledge layer from the existing design docs.
Use $dorado-change to create and advance a change for this requirement.
Use $dorado-verify to verify the current active change.
Use $dorado-finalize to finalize the completed change before commit.
```

## Queue Prompt Patterns

### Queue Creation Only

```text
Use $dorado to read this TODO plan, split it into multiple changes, create a queue, and show the queue state before execution.
```

### Current Chat Window Executes

```text
Use $dorado to read this TODO plan, create a change queue, and execute it in this current session. Use manual-bridge tracking and do not dispatch an extra local executor.
```

### Dorado Dispatches Local Codex

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the codex executor and archive-chain profile.
```

### Dorado Dispatches Local Claude Code

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the claude-code executor and archive-chain profile.
```

## What You Usually Do Not Need To Repeat

- do not create a web template during init
- do not create the first change during plain init
- archive before commit
- queue should stop when empty
- hooks should stay quiet until active changes exist

## When To Add More Detail

Add more detail when:

- you want queue creation only and no execution
- you want the current chat session to execute the work
- you want Dorado to dispatch `codex` or `claude-code`
- you want `manual-safe` or `archive-chain` explicitly
- you want to switch governance mode to `lite`, `standard`, or `full`

## Practical Advice

If you are unsure, start with:

```text
Use $dorado to inspect this repository and tell me the correct next step.
```

That is usually enough to keep the workflow on track without over-specifying internals.
