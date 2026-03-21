---
name: dorado
tags: [cli, workflow, automation, typescript, dorado, dashboard, bootstrap]
---

# Dorado CLI

GUI-first Dorado project bootstrap and execution workflow.

## Default Entry

Prefer this order:

1. `dorado status [path]`
2. `dorado dashboard start [path]` when the project is uninitialized, partially initialized, or when there is no active change yet
3. `dorado new <change-name> [path]` only when CLI-first change creation is explicitly preferred

The default product posture is:

1. inspect the target directory
2. launch the dashboard
3. let the GUI infer or refine project planning
4. commit bootstrap
5. enter the first change setup flow
6. continue with change-driven delivery

## What The CLI Manages

This CLI now covers:

- project knowledge bootstrap
- layered skill files
- execution-layer change workflow
- dashboard onboarding and inspection
- preset-based project planning
- packaged asset copying from the Dorado mother spec
- business scaffold generation for supported presets
- Codex skill install and sync checks

## Canonical Execution Files

Treat these as the source of truth for active delivery work:

- `.skillrc`
- `changes/active/<change>/proposal.md`
- `changes/active/<change>/tasks.md`
- `changes/active/<change>/state.json`
- `changes/active/<change>/verification.md`

Do not fall back to the old `features/...` layout unless the target repository really still uses it.

## GUI-First Rules

Use the dashboard as the standard entry point when:

- the directory is not initialized as a Dorado project
- the directory only has the minimum execution structure and still lacks docs, skills, or index files
- the user wants to initialize a new project from requirements, stack, modules, and API planning
- the project has no active change and should move into first-change setup

Use CLI inspection when:

- you need a fast textual summary
- you are validating docs, skills, or index state
- you are already inside an active change workflow

## Commands To Prefer

```bash
dorado status [path]
dorado dashboard start [path] [--port <port>] [--no-open]
dorado init [path]
dorado new <change-name> [path]
dorado docs status [path]
dorado skills status [path]
dorado skill status
dorado skill install
dorado index check [path]
dorado index build [path]
dorado workflow show
dorado workflow list-flags
```

When the user is starting from requirements instead of an existing Dorado repo, prefer:

```bash
dorado status <path>
dorado dashboard start <path>
```

## Dashboard Expectations

The dashboard should:

- detect whether the current directory is uninitialized, basic, or fully initialized
- accept a natural-language project description and infer a draft planning form
- bootstrap `.skillrc`, `changes/`, `.dorado/`, `docs/`, layered `SKILL.md`, and `SKILL.index.json`
- generate project planning docs from project name, summary, stack, modules, API areas, design docs, and planning docs
- create `src/modules/<module>/SKILL.md`
- create `docs/api/*.md`, `docs/design/*.md`, and `docs/planning/*.md`
- show which assets come from direct copy, template generation, or runtime generation
- show `Project / Docs / Skills / Execution` as separate inspection views
- provide controlled file preview for project docs, API docs, module skills, and bootstrap summary
- move into the first change setup flow when no active change exists
- auto-create the preset-suggested first change when bootstrap succeeds, unless the flow explicitly disables it

## Verification Discipline

Before saying work is complete:

1. verify the relevant active change
2. confirm docs/skills/index state if project knowledge changed
3. keep `SKILL.index.json` current after meaningful skill updates

For this repository itself, also treat these as standard regression checks when behavior changes:

1. `npm run build`
2. `npm run test:run`
3. `npm run release:smoke`

## Skill-Oriented Usage

When a user says they want to start a new project, the preferred response path is:

1. inspect the target directory
2. run `dorado dashboard start <path>`
3. ask for or infer a natural-language project description, then let the GUI prefill the planning form
4. use the GUI bootstrap to generate the project knowledge layer
5. continue into the first change setup flow
6. rely on the generated change files to carry project-doc and module-skill references into execution

If the request matches a supported preset, prefer that preset instead of inventing a new project layout in free text.

Current first-party presets:

- `official-site`: official website, docs center, blog/changelog, admin CMS, auth
- `nextjs-web`: standard Next.js web product with account/auth/API boundaries

## Codex Installation

To sync the latest dorado skill into Codex, prefer:

1. `dorado skill status`
2. `dorado skill install` when the installed skill is missing or out of sync

The default install target is `~/.codex/skills/dorado`.

Use `$dorado` as the preferred skill name in prompts.

`$dorado-cli` should only be treated as a legacy compatibility alias.
