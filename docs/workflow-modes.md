# Workflow Modes

[English](workflow-modes.md) | [简体中文](workflow-modes.zh-CN.md)

## Two Different Mode Families

Dorado has two different kinds of modes that are easy to confuse:

- repository governance modes
- queue executor modes

They solve different problems.

## Repository Governance Modes

These are controlled by:

```bash
dorado workflow show [path]
dorado workflow set-mode <lite|standard|full> [path]
dorado workflow set-mode <lite|standard|full> [path] --force-active
```

### `lite`

Use when governance should stay light.

### `standard`

Recommended default for most repositories.

### `full`

Use when stricter governance is worth the extra process.

Important:

- repository mode sets governance range
- it is not a product tier
- active changes block mode switching by default
- `--force-active` updates active changes together when you explicitly want that

## Queue Executor Modes

These are controlled by:

```bash
dorado run start [path] --executor <manual-bridge|codex|claude-code> --profile <manual-safe|archive-chain>
```

### `manual-bridge`

Use when the current chat session or a human is doing the implementation, and Dorado only tracks queue state and protocol progress.

### `codex`

Use when Dorado should explicitly dispatch the local `codex` CLI.

### `claude-code`

Use when Dorado should explicitly dispatch the local `claude` CLI.

Important:

- being inside a Codex or Claude Code chat window does not automatically pick that executor
- `run start` is always explicit
- `run step` is where dispatch or polling happens

## Closeout Profiles

The runner profile is separate from the executor.

### `manual-safe`

- good when you want closeout decisions to remain manual
- Dorado tracks state but does not auto-finish the queue chain

### `archive-chain`

- good when you want Dorado to continue through finalize and archive when protocol checks pass
- Git commit still remains manual

## Queue Stop Rule

When there is no active change and no queued change left:

- the runner becomes `completed`
- the stage becomes `queue-complete`
- Dorado stops dispatching work

This means Dorado queue automation is not a permanent background daemon.

## Recommended Defaults

- start with repository mode `standard`
- use `manual-bridge` when you want the current chat window to do the work
- use `archive-chain` only when you intentionally want Dorado to drive closeout automatically after protocol checks pass
