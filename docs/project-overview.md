# Project Overview

[English](project-overview.md) | [简体中文](project-overview.zh-CN.md)

## What Dorado Is

Dorado is a protocol-shell-first CLI for AI-assisted project execution.

It starts by creating a shared collaboration protocol, not a business template. The repository can stay minimal at the beginning, then grow deliberately through project knowledge, skills, and change records.

## What Dorado Is Not

Dorado is not a fixed web starter, not a forced scaffold generator, and not a dashboard-centered project builder.

The dashboard is inspection-first. It helps users see current state, active changes, workflow profiles, and protocol gaps. The CLI and skills still own the main execution flow.

## Core Model

- `dorado init` creates the protocol shell only.
- Project-specific knowledge is added later with explicit actions such as `dorado docs generate`.
- Work is tracked through changes under `changes/active/`.
- A completed change is normally closed with `dorado finalize`, which verifies it, refreshes the index, archives it, and leaves the repository ready for manual commit.
- Archived changes remain history. Follow-up work should be started as a new change instead of editing archived records back into active execution.

## Why This Model Exists

- some repositories are not web projects
- some teams need to delay structure decisions
- AI clients need stable protocol rules before business-specific files appear
- change state should be reviewable and enforceable through files, not only chat history

## Current Release Capabilities

- protocol-shell-first initialization
- explicit project-knowledge backfill
- configurable workflow profiles and optional governance steps
- active change verification and status inspection
- `finalize -> archive -> commit-ready` closeout flow
- Git hook enforcement for active changes
- inspection-first dashboard
- Codex and Claude Code skill installation and sync
