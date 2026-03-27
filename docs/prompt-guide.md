# Prompt Guide

[English](prompt-guide.md) | [简体中文](prompt-guide.zh-CN.md)

## Principle

Prompt Dorado with short intent, not with a long internal checklist.

If Dorado CLI and Dorado skills are installed correctly, the protocol-shell checks, init defaults, change rules, workflow mode rules, and closeout order should already be enforced by the system.

## Recommended Prompt Style

Use direct intent such as:

```text
Use Dorado to initialize this project.
Use Dorado to inspect the current repository state and tell me what is missing.
Use Dorado to backfill the project knowledge layer.
Use Dorado to create and advance a change for this requirement.
Use Dorado to verify the current active change.
Use Dorado to finalize the completed change before commit.
Use Dorado to show the current workflow mode for this repository.
Use Dorado to switch this repository to full mode.
```

## Skill-First Prompt Style

When your AI client supports Dorado skills, prefer the skill name directly:

```text
Use $dorado to initialize this project.
Use $dorado to inspect this repository.
Use $dorado to backfill the project knowledge layer.
Use $dorado-change to create and advance a change for this requirement.
Use $dorado-workflow to inspect the current workflow mode.
Use $dorado-workflow to switch this repository to standard mode.
Use $dorado-finalize to close the completed change before commit.
```

## Good Prompt Patterns

- state the goal, not the internal checklist
- mention the repository or change if the target is ambiguous
- say whether you want inspection, creation, verification, closeout, or workflow-mode changes
- keep the prompt stable across project types

## Examples

### Initialize A Repository

```text
Use Dorado to initialize this project.
```

### Inspect An Existing Repository

```text
Use Dorado to inspect this repository and summarize the current Dorado state.
```

### Start A Requirement

```text
Use Dorado to create and advance a change for this requirement:
Add a versioned public REST API for project exports.
```

### Document-First Project Bootstrap

```text
Use Dorado to initialize this project, read the existing design documents, backfill the project knowledge layer, derive the execution TODO, and then create the first change to execute it.
```

This is a valid way to use Dorado when the repository direction is already documented before initialization.

### Inspect Or Switch Workflow Mode

```text
Use Dorado to show the current workflow mode and switch to full mode only if it is safe.
```

### Continue After Archive

```text
Use Dorado to create a follow-up change for the archived export API work.
```

### Close Out Completed Work

```text
Use Dorado to finalize this completed change before commit.
```

## What You Usually Do Not Need To Repeat

- "check whether the directory is initialized"
- "do not create a web template"
- "do not create the first change during init"
- "verify the protocol shell after init"
- "archive before commit"
- "block mode switching if active changes exist"

These are Dorado defaults and should not need to be re-explained in every prompt.

## When To Be More Specific

Be more explicit when:

- you want a specific change name
- you want inspection only and no writes
- you want a follow-up change instead of touching archived history
- you want one skill entrypoint instead of the generic Dorado skill
- you want Dorado to derive the knowledge layer and execution TODO from existing design documents
- you want a specific repository mode such as `lite`, `standard`, or `full`
