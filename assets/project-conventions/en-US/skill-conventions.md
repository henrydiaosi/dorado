---
name: project-skill-conventions
title: SKILL Conventions
tags: [conventions, skill, dorado]
---

# SKILL Conventions

## Goal

This file fixes the responsibility boundary of layered `SKILL.md` files so AI consistently locates context through the index and then reads the correct knowledge document.

## Layered Structure

- Root `SKILL.md`: project entry map
- `docs/SKILL.md`: docs hub
- `src/SKILL.md`: source map
- `src/core/SKILL.md`: core platform layer
- `src/modules/<module>/SKILL.md`: module knowledge unit
- `tests/SKILL.md`: testing strategy and entry

## Authoring Rules

- `SKILL.md` documents current facts, not future plans
- Module `SKILL.md` files should cover responsibility, structure, API, dependencies, and test expectations
- When APIs or boundaries change, update the relevant `SKILL.md`
- When a new module is created, add its module `SKILL.md`

## Relationship To The Index

- `SKILL.index.json` is for discovery, not for replacing `SKILL.md`
- Rebuild the index after updating `SKILL.md`
- AI should read the index first and the target `SKILL.md` second

## Execution Requirement

- Code-only changes without `SKILL.md` updates are not acceptable
- Do not overload `SKILL.md` with design rationale that belongs in design docs
- `SKILL.md` explains what exists now, design docs explain why it was designed that way

