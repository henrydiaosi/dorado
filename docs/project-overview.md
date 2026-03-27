# Project Overview

[English](project-overview.md) | [简体中文](project-overview.zh-CN.md)

## What Dorado Is

Dorado is a protocol-shell-first CLI for AI-assisted software work.

It gives the repository a shared execution protocol before it adds project-specific structure. That keeps initialization minimal and makes later automation auditable through files instead of only chat history.

## What Dorado Does Not Do

Dorado does not assume a web stack during plain init, does not force a business scaffold on day one, and does not treat the dashboard as the main creation engine.

The dashboard is inspection-first. The CLI and skills remain the primary execution surface.

## Core Building Blocks

### 1. Protocol Shell

`dorado init` creates the shared protocol shell only. A plain init should leave the project minimal and stack-agnostic.

### 2. Project Knowledge Layer

`dorado docs generate` backfills project knowledge when you are ready. This is separate from init on purpose.

### 3. Change Workflow

Real work happens through changes under `changes/active/`. A change is verified, finalized, archived, and only then becomes commit-ready.

### 4. Change Queue

Multiple changes can be queued. Dorado can track them sequentially and stop automatically when the queue is empty.

### 5. AI Skill Layer

Codex and Claude Code can use Dorado through installed skills so the user can work from short natural-language prompts instead of typing every CLI command manually.

## Current Release Highlights

- protocol-shell-only initialization
- explicit knowledge backfill
- active change verification and archive gating
- standard closeout path with `finalize -> archive -> commit-ready`
- queue runner with explicit `run start` and `run step`
- `manual-bridge`, `codex`, and `claude-code` executors
- skill installation for Codex and Claude Code
- inspection-first dashboard
