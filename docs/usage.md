# Usage

[English](usage.md) | [简体中文](usage.zh-CN.md)

## Common Commands

```bash
dorado status [path]
dorado init [path]
dorado docs status [path]
dorado docs generate [path]
dorado new <change-name> [path]
dorado changes status [path]
dorado progress [changes/active/<change>]
dorado verify [changes/active/<change>]
dorado archive [changes/active/<change>]
dorado finalize [changes/active/<change>]
dorado workflow show [path]
dorado workflow list-flags
dorado workflow set-mode <lite|standard|full> [path]
dorado workflow set-mode <lite|standard|full> [path] --force-active
dorado dashboard start [path] [--port <port>] [--no-open]
dorado doctor
dorado skill status
dorado skill install
dorado skill status-claude
dorado skill install-claude
```

## Recommended Project Flow

### 1. Initialize The Protocol Shell

```bash
dorado init [path]
```

Plain init is intentionally minimal:

- it creates the Dorado protocol shell
- it does not generate a web template or business scaffold
- it does not create the first change automatically
- hooks stay quiet until active changes exist

### 2. Backfill Project Knowledge When Needed

```bash
dorado docs generate [path]
```

This is explicit. Initialization and knowledge backfill are not the same step.

## Document-First Workflow

If your team already has a design document, product brief, API draft, or architecture note before the repository is initialized, this is a correct Dorado workflow:

1. prepare or collect the design material first
2. run `dorado init [path]` to create the protocol shell
3. let Dorado inspect the existing design material and backfill the project knowledge layer
4. let Dorado derive a concrete execution plan or TODO set from that knowledge layer
5. create a new change with `dorado new <change-name> [path]`
6. execute the work through the change workflow until `finalize`

Important clarification:

- the protocol shell should still be initialized first
- project knowledge should be derived from the real design documents, not guessed from a template
- the CLI command is `dorado new`
- "Dorado change" is a good prompt or skill concept, but the concrete CLI entrypoint is still the change creation flow plus verify/finalize/archive

### 3. Choose Or Inspect Repository Governance

Use these commands when you need to inspect or switch repository mode:

```bash
dorado workflow show [path]
dorado workflow set-mode standard [path]
```

Mode switching rules:

- it is blocked by default when active changes exist
- use `--force-active` only when you intentionally want active changes updated too
- mode switching changes repository governance, not archived history

### 4. Start Work With A Change

```bash
dorado new <change-name> [path]
```

Use a new change for new work. Do not reopen archived change history as the default path.

### 5. Inspect Progress During Execution

```bash
dorado changes status [path]
dorado progress [changes/active/<change>]
```

### 6. Close Out Completed Work

```bash
dorado finalize [changes/active/<change>]
```

`finalize` is the standard closeout path. It verifies the completed change, refreshes the index, archives the change, and leaves the repository ready for manual commit.

If you only want to check archive readiness:

```bash
dorado archive [changes/active/<change>] --check
```

If you want to archive directly after it is already verified and ready:

```bash
dorado archive [changes/active/<change>]
```

## Change Lifecycle

The normal lifecycle is:

1. `init`
2. optional `docs generate`
3. optional `workflow set-mode`
4. `new`
5. execution and updates inside `changes/active/<change>/`
6. `verify` during development when needed
7. `finalize`
8. manual Git commit after the change is archived

For document-first teams, the lifecycle is commonly:

1. existing design document
2. `init`
3. knowledge backfill from that design document
4. optional `workflow set-mode`
5. execution plan or TODO refinement
6. `new`
7. change execution
8. `finalize`
9. manual Git commit

## Archived Change Follow-up Rule

If an archived change needs follow-up work later, create a new change that references the archived one. Do not treat archive as a temporary pause state by default.

## Dashboard Position

The dashboard is for inspection, progress visibility, and workflow reading. It should not replace the CLI as the main execution surface.
