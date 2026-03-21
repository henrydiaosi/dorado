---
name: project-naming-conventions
title: Project Naming Conventions
tags: [conventions, naming, dorado]
---

# Naming Conventions

## Goal

This file is the project-adopted copy of the Dorado mother spec. It fixes naming rules inside the project so AI and humans do not invent naming patterns ad hoc.

## Core Rules

- Directories, modules, and change names use lowercase kebab-case
- Flags and optional steps use lowercase snake_case
- Workflow protocol files keep their fixed filenames
- API docs use semantic kebab-case names

## Change Names

- Use `changes/active/<change-name>/`
- Example: `add-token-refresh`
- Avoid dates, spaces, uppercase names, and non-semantic labels

## Module Names

- Module directories use semantic English names
- Example: `src/modules/auth`, `src/modules/content`
- Each module keeps its `SKILL.md` at the module root

## Document Names

- Project docs live in `docs/project/`
- Design docs live in `docs/design/`
- Planning docs live in `docs/planning/`
- API docs live in `docs/api/`

## Fixed Protocol Files

- `proposal.md`
- `tasks.md`
- `state.json`
- `verification.md`
- `review.md`

## Execution Requirement

- Check this file before adding a new directory, module, change, or workflow flag
- If implementation diverges from this file, bring the code and docs back into alignment first

