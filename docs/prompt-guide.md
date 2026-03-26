# Prompt Guide

## Principle

Prompt Dorado with short intent, not with long internal checklists.

Dorado should expand the required init, inspection, and change rules internally.

## Recommended Prompts

### Initialize A Project

```text
Use Dorado to initialize this project.
```

### Initialize The Workflow Framework

```text
Use Dorado to initialize the workflow framework for this project.
```

### Backfill The Knowledge Layer

```text
Use Dorado to backfill the project knowledge layer.
```

### Start A Requirement

```text
Use Dorado to create and advance a change for this requirement.
```

### Close A Completed Change

```text
Use Dorado to finalize this completed change before commit.
```

### Inspect Progress

```text
Use Dorado to inspect the current active changes and overall project progress.
```

## Skill-Based Prompts

When your AI client supports Dorado skills, prefer the skill name directly:

```text
Use $dorado to initialize this project.
Use $dorado to backfill the project knowledge layer.
Use $dorado to inspect active changes and progress.
Use $dorado-finalize to close a completed change before commit.
```

## Prompt Boundaries

You usually do not need to repeat:

- the internal file checklist for init
- protocol-shell verification steps
- warnings like "do not create a web template" on every prompt

Those are Dorado defaults and should be enforced by the CLI and the installed skills.
