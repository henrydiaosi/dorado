# Dorado Project Overview

## Positioning

Dorado is a GUI-first workflow CLI for AI-assisted software delivery. It is designed to cover more than initialization: project planning, project knowledge, change execution, and skill synchronization are treated as one continuous workflow.

## Core Capabilities

- Dashboard-guided project bootstrap
- Automatic generation of `.skillrc`, `.dorado/`, project knowledge files, and change workflow files
- Project planning from natural-language requirements
- Controlled delivery through `changes/active/<change>/`
- Codex skill installation and synchronization for `dorado`

## Where It Fits

- Starting a brand-new project
- Upgrading an existing repository into a Dorado project
- Managing requirements, design, APIs, module skills, and execution state under one structure
- Keeping AI development aligned with a fixed workflow instead of ad hoc generation

## Standard Flow

1. Inspect the target directory
2. Launch the dashboard
3. Complete project planning and knowledge bootstrap
4. Create the first change
5. Execute through `proposal.md`, `tasks.md`, `state.json`, and `verification.md`
6. Verify and archive

## Canonical Files

- `.skillrc`
- `.dorado/`
- `changes/active/<change>/proposal.md`
- `changes/active/<change>/tasks.md`
- `changes/active/<change>/state.json`
- `changes/active/<change>/verification.md`
- `SKILL.md`
- `skill.yaml`

## Repository Contents

This publish-oriented `dorado` repository keeps the runtime and onboarding assets:

- `dist/` for CLI and dashboard runtime code
- `assets/` for copied project conventions and AI guides
- `.dorado/templates/` for packaged template resources and hooks
- `agents/`, `SKILL.md`, and `skill.yaml` for Codex skill metadata
- `docs/` for bilingual project and usage documentation

## Recommended Product Posture

- Start new projects from the GUI
- Use CLI for inspection, validation, and automation
- Finish planning before implementation
- Drive work from explicit change files
