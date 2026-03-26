# Project Overview

## What Dorado Is

Dorado is a CLI workflow system for AI-assisted project delivery.

It is designed around a protocol shell instead of a full starter template. Initialization sets up the shared working rules first. Project-specific structure is added later, explicitly, when the repository direction is clear.

## Core Principles

- Plain `dorado init` keeps the repository minimal. It does not create a web scaffold, a business template, or the first change automatically.
- Project-facing docs belong to the project layer. Dorado protocol rules live in Dorado-managed assets such as `.dorado/`, `for-ai/`, root skill files, and change records.
- Change workflows are configurable. Different step profiles can coexist, and users can choose the workflow depth they need.
- Git hooks focus on real execution state. Empty projects should stay quiet, while active changes can be checked and blocked when incomplete.
- The dashboard is for inspection and progress visibility, not for owning project generation logic.

## Typical Use Cases

- repositories that want consistent AI behavior
- teams that want change execution to be visible and reviewable
- projects that may become web, CLI, Unity, Godot, backend, or protocol-only repositories
- environments that need the same workflow across Codex and Claude Code

## Current Capabilities

- protocol-shell-first initialization
- explicit project-knowledge backfill
- active change workflow management
- standard `finalize -> archive -> commit-ready` closeout flow
- aggregated `PASS / WARN / FAIL` change status
- Git hook enforcement for active changes
- dashboard inspection
- Codex and Claude Code skill install and sync
