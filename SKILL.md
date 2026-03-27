---
name: dorado
description: Protocol-shell-first Dorado workflow for initialization, project knowledge backfill, change execution, verification, and archive readiness.
tags: [cli, workflow, automation, typescript, dorado, dashboard, bootstrap]
---

# Dorado CLI

Protocol-shell-first Dorado workflow for initialization, project knowledge backfill, and change execution.

## Default Entry

When the user says something short like:

- `使用 dorado 初始化项目`
- `使用 dorado 初始化这个目录`
- `use dorado to initialize this directory`
- `use dorado to inspect and initialize this repo`

expand it internally as:

1. inspect the target directory
2. initialize the Dorado protocol shell if needed
3. explicitly backfill the project knowledge layer only when needed
4. create the first change only when explicitly requested

Do not force the user to repeat those steps manually when the request is already clear.

Treat plain project-init intent as enough to trigger this flow. Do not require the user to restate the guardrails in a longer prompt.

## Mandatory Init Execution

When the user asks to initialize a directory, do not freehand the initialization flow.

If the user intent is simply to initialize the project or current directory, treat that as a request for this mandatory flow.

Use this exact behavior:

1. run `dorado status [path]`
2. if the directory is uninitialized or missing protocol-shell assets, run `dorado init [path]`
3. verify the actual filesystem result before claiming initialization is complete

Never replace `dorado init` with manual directory creation or a hand-written approximation.

Do not say initialization is complete unless the protocol-shell assets actually exist on disk.

Required protocol-shell checks after `dorado init`:

- `.skillrc`
- `.dorado/`
- `changes/active/`
- `changes/archived/`
- `SKILL.md`
- `SKILL.index.json`
- `build-index-auto.js`
- `for-ai/ai-guide.md`
- `for-ai/execution-protocol.md`
- `for-ai/naming-conventions.md`
- `for-ai/skill-conventions.md`
- `for-ai/workflow-conventions.md`
- `for-ai/development-guide.md`

During plain init, do not report `docs/SKILL.md`, `src/SKILL.md`, `tests/SKILL.md`, or business scaffold as if they were part of protocol-shell completion.

## Prompt Profiles

Use these prompt styles as the preferred mental model.

### 1. Minimal Prompt

Use when the user already trusts Dorado defaults.

```text
Use dorado to initialize this directory.
```

### 2. Standard Prompt

Use when you want short prompts but still want anti-drift guardrails.

```text
Use dorado to inspect and initialize this directory according to current Dorado rules.
```

### 3. Guardrail Prompt

Use when the model is likely to over-assume frameworks or over-create assets.

```text
Use dorado for this directory. Default to protocol-shell init first, do not assume a web template, do not apply business scaffold during init, and do not create the first change unless explicitly requested.
```

### 4. Knowledge-Backfill Prompt

Use when the protocol shell already exists and the project knowledge layer is still partial.

```text
Use dorado to backfill the project knowledge layer for this directory. Focus on docs, layered skills, and index state. Do not create a change yet.
```

### 5. Change-Creation Prompt

Use when the user is explicitly ready to move into execution.

```text
Use dorado to create and advance a change for this requirement. Respect the current project state and do not treat bootstrap as auto-change creation.
```

### 6. TODO Queue Prompt

Use when the user already has a TODO plan and wants Dorado to split it into multiple queued changes.

```text
Read this TODO plan, use dorado to split it into multiple change units, create a Dorado change queue, and show the queue state before execution.
```

### 7. Queue Execution Prompt

Use when the user wants Dorado not only to create queued changes, but also to start queue execution with an explicit mode.

```text
Read this TODO plan, use dorado to create a change queue, then continue with Dorado queue execution. If I want the current AI session to do the work, keep it in manual-bridge mode. If I explicitly ask for codex or claude-code executor mode, start dorado run with that executor and advance it with explicit run steps until the queue completes.
```

## Anti-Drift Rules

Always keep these rules:

- `dorado init` creates the protocol shell only
- `dorado docs generate` backfills project knowledge only
- when the user asks to initialize, execute the CLI init command and verify the protocol-shell files on disk before declaring success
- do not assume the project is a web or Next.js project unless the repository or user makes that explicit
- do not apply business scaffold during plain init
- do not generate `docs/project/bootstrap-summary.md` during plain init or docs generate
- do not create the first change automatically unless the user explicitly asks to create a change
- treat presets as planning defaults, not as init-time templates
- use the dashboard for inspection, navigation, and progress review, not as the main creation brain

## What The CLI Manages

This CLI now covers:

- protocol-shell initialization
- project knowledge backfill
- layered skill files
- execution-layer change workflow
- dashboard inspection
- preset-based planning defaults
- explicit business scaffold generation for supported presets
- Codex and Claude Code skill install and sync checks

## Queue Runner And Executors

When the repository is already initialized and the user wants Dorado to advance queued work explicitly, prefer the queue runner commands:

```bash
dorado run start [path] --executor <manual-bridge|codex|claude-code> --profile <profile>
dorado run status [path]
dorado run step [path]
dorado run resume [path]
dorado run stop [path]
```

Interpret them this way:

- `manual-bridge` means Dorado tracks the change while a human or external AI client performs the implementation pass
- `codex` means Dorado may dispatch the local `codex` CLI experimentally
- `claude-code` means Dorado may dispatch the local `claude` CLI experimentally
- `run start` is always explicit; Dorado must not auto-start from hooks, dashboard refresh, or passive inspection
- `run step` is the only place where dispatch or polling should happen
- executor output never overrides Dorado protocol checks; verify/finalize/archive still remain under Dorado control

If the user is only asking to inspect state, use `dorado run status` or the dashboard. Do not dispatch an executor just because run data exists.

When the user describes a TODO-driven queue in natural language, distinguish these intents carefully:

- “create a queue” means split work into multiple Dorado changes first
- “execute in this current Codex / Claude session” means prefer `manual-bridge`
- “execute with codex” or “execute with claude-code” means explicit local executor mode
- “run automatically until the queue finishes” still means explicit `run start` plus explicit repeated `run step`, not an implicit background daemon

## Canonical Execution Files

Treat these as the source of truth for active delivery work:

- `.skillrc`
- `changes/active/<change>/proposal.md`
- `changes/active/<change>/tasks.md`
- `changes/active/<change>/state.json`
- `changes/active/<change>/verification.md`

Do not fall back to the old `features/...` layout unless the target repository really still uses it.

## Commands To Prefer

```bash
dorado status [path]
dorado init [path]
dorado docs generate [path]
dorado new <change-name> [path]
dorado docs status [path]
dorado skills status [path]
dorado changes status [path]
dorado run status [path]
dorado run start [path] --executor <executor> --profile <profile>
dorado run step [path]
dorado run resume [path]
dorado dashboard start [path] [--port <port>] [--no-open]
dorado index check [path]
dorado index build [path]
dorado workflow show
dorado workflow list-flags
dorado workflow set-mode <lite|standard|full> [path]
dorado workflow set-mode <lite|standard|full> [path] --force-active
dorado progress [changes/active/<change>]
dorado verify [changes/active/<change>]
dorado archive [changes/active/<change>]
dorado archive [changes/active/<change>] --check
dorado finalize [changes/active/<change>]
dorado skill status
dorado skill install
dorado skill status-claude
dorado skill install-claude
```

The default `dorado skill install` and `dorado skill install-claude` commands now install a Dorado skill suite:

- `dorado`
- `dorado-init`
- `dorado-inspect`
- `dorado-backfill`
- `dorado-change`
- `dorado-workflow`
- `dorado-verify`
- `dorado-archive`
- `dorado-finalize`

Preferred execution order for a new directory:

```bash
dorado status [path]
dorado init [path]
dorado docs generate [path]
dorado new <change-name> [path]
```

For plain init, stop after `dorado init [path]` and verify the protocol-shell assets. Do not silently continue into docs generation unless the user explicitly wants knowledge backfill.

For completed changes, archive before commit. Use `dorado archive [changes/active/<change>]` to execute the archive and `--check` only when you want a readiness preview without moving files.

For the normal closeout path, prefer `dorado finalize [changes/active/<change>]`. It should verify completeness, rebuild the index, archive the change, and leave Git commit as a separate manual step.

For repository governance changes, prefer `dorado workflow set-mode <lite|standard|full> [path]`. By default, mode switching is blocked when active changes exist. Use `--force-active` only when you intentionally want the repository mode and current active changes updated together.

## Dashboard Use Rules

Use the dashboard when:

- the directory is not initialized yet
- the directory only has the protocol shell and still lacks project knowledge
- the user wants a visual inspection of docs, skills, execution, or asset sources
- the user wants to inspect project posture before deciding whether to backfill docs or create a change

Do not treat the dashboard as:

- the default place to invent project structure
- the owner of first-change creation
- the main place to decide project type
- the place that secretly starts executor jobs

## Project-Type Rules

If the repository type is unclear:

- inspect the real directory first
- keep initialization minimal
- allow the project to stay empty except for Dorado protocol assets
- let later skills or explicit project-knowledge steps shape the actual stack

This is important because valid Dorado projects include:

- web applications
- CLI tools
- Unity projects
- Godot projects
- desktop apps
- service backends
- protocol-only repositories

## Dashboard Expectations

The dashboard should:

- detect whether the current directory is uninitialized, basic, or fully initialized
- show `Project / Docs / Skills / Execution` as inspection views
- expose the default workflow profile and compatibility profile display
- show which assets come from direct copy, template generation, or runtime generation
- allow controlled file preview for protocol docs, project docs, and layered skills
- avoid auto-creating the first change

## Verification Discipline

Before saying work is complete:

1. verify the relevant active change
2. confirm docs, skills, and index state if project knowledge changed
3. keep `SKILL.index.json` current after meaningful skill updates

For this repository itself, also treat these as standard regression checks when behavior changes:

1. `npm run build`
2. `npm run test:run`
3. `npm run release:smoke`

## Supported First-Party Presets

If the request matches a supported preset, prefer that preset instead of inventing a new layout in free text.

- `official-site`: official website, docs center, blog/changelog, admin CMS, auth
- `nextjs-web`: standard Next.js web product with account/auth/API boundaries

Remember: preset choice only supplies planning defaults. It does not turn plain init into template landing.

## Skill Installation

To sync the latest dorado skill into local AI clients, prefer:

1. `dorado skill status`
2. `dorado skill install` when the Codex package is missing or out of sync
3. `dorado skill status-claude`
4. `dorado skill install-claude` when the Claude Code package is missing or out of sync

The default install targets are:

- `~/.codex/skills/dorado`
- `~/.claude/skills/dorado`

Use `$dorado` as the preferred skill name in prompts.

`$dorado-cli` should only be treated as a legacy compatibility alias.
