# Usage

[English](usage.md) | [简体中文](usage.zh-CN.md)

## Default: Use Skills, Not Raw Commands

For most users, the normal way to use Dorado is:

1. install Dorado skills into Codex or Claude Code
2. describe the goal in natural language
3. let Dorado choose the correct workflow

The CLI commands in this document are the underlying execution surface and the fallback for scripting or exact manual control.

## The Five Most Common Skill Requests

### 1. Initialize A Project

```text
Use $dorado to initialize this project.
```

### 2. Inspect Current State

```text
Use $dorado to inspect this repository and tell me what is missing.
```

### 3. Backfill Project Knowledge

```text
Use $dorado to read the existing design documents and backfill the project knowledge layer.
```

### 4. Start A Requirement

```text
Use $dorado-change to create and advance a change for this requirement:
Add a versioned public REST API for project exports.
```

### 5. Close Completed Work

```text
Use $dorado-finalize to finalize the completed change before commit.
```

## Queue Work In Natural Language

### Create The Queue Only

```text
Use $dorado to read this TODO plan, split it into multiple changes, create a queue, and show the queue state before execution.
```

### Let This Current Chat Session Execute

```text
Use $dorado to read this TODO plan, create a change queue, and execute it in this current session. Use manual-bridge tracking and do not dispatch an extra local executor.
```

### Let Dorado Dispatch Local Codex

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the codex executor and archive-chain profile.
```

### Let Dorado Dispatch Local Claude Code

```text
Use $dorado to read this TODO plan, create a change queue, and run it with the claude-code executor and archive-chain profile.
```

## What Dorado Understands From Those Prompts

Dorado mainly needs three things from you:

- what you want to do: init, inspect, backfill, change, finalize, or queue
- who should execute: this current chat window or an explicitly dispatched local executor
- how closeout should behave: manual-safe or archive-chain when queue execution is involved

## CLI Reference

Use the CLI directly when you need manual control, automation scripts, or debugging.

```bash
dorado status [path]
dorado init [path]
dorado docs status [path]
dorado docs generate [path]
dorado new <change-name> [path]
dorado new <change-name> [path] --queued
dorado changes status [path]
dorado queue status [path]
dorado progress [changes/active/<change>]
dorado verify [changes/active/<change>]
dorado finalize [changes/active/<change>]
dorado archive [changes/active/<change>] --check
dorado run start [path] --executor <manual-bridge|codex|claude-code> --profile <manual-safe|archive-chain>
dorado run step [path]
dorado run status [path]
dorado workflow show [path]
dorado workflow set-mode <lite|standard|full> [path]
dorado doctor
```

## Important Behavior Rules

- plain init creates the protocol shell only
- project knowledge backfill is explicit
- the first change is explicit
- `run start` is explicit
- `run step` is where dispatch or polling happens
- queue execution stops automatically when no active or queued changes remain
- archived work stays history; follow-up work should use a new change
