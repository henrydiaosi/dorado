# Dorado

[English](README.md) | [简体中文](README.zh-CN.md)

Dorado is a protocol-shell-first workflow system for AI-assisted project work.

Most users should use Dorado through skills and natural-language prompts. The CLI is still the execution engine, but it is usually the layer underneath the skills rather than the thing you type all day.

Current release:

- CLI: `0.10.1`
- Skills protocol: `5.0.2`

Start here:

- [Project Overview](docs/project-overview.md)
- [Prompt Guide](docs/prompt-guide.md)
- [Skills Usage](docs/skills-usage.md)
- [Skills Installation](docs/skills-installation.md)
- [Usage](docs/usage.md)
- [Workflow Modes](docs/workflow-modes.md)
- [Installation](docs/installation.md)

## Skills-First Default

If Codex or Claude Code already has Dorado skills installed, start with short prompts like these:

```text
Use $dorado to initialize this project.
Use $dorado to inspect this repository and tell me what is missing.
Use $dorado to backfill the project knowledge layer from the existing design docs.
Use $dorado-change to create and advance a change for this requirement.
Use $dorado-finalize to finalize the completed change before commit.
```

For queue work:

```text
Use $dorado to read this TODO plan, split it into multiple changes, create a queue, and show the queue state before execution.
Use $dorado to read this TODO plan, create a change queue, and execute it in this current session with manual-bridge tracking.
Use $dorado to read this TODO plan, create a change queue, and run it with the codex executor and archive-chain profile.
Use $dorado to read this TODO plan, create a change queue, and run it with the claude-code executor and archive-chain profile.
```

## What This Release Covers

- protocol-shell-only init
- explicit project knowledge backfill
- change workflow with verify, finalize, and archive
- sequential change queues
- `manual-bridge`, `codex`, and `claude-code` executor modes
- queue auto-stop after the last change is done
- Codex and Claude Code skill installation and sync
- inspection-first dashboard

## Release Repository Behavior

- this repository is prebuilt
- install it with `npm install -g .`
- run it with `npm start`, `npm run help`, or `dorado --help`
- do not expect source-repo scripts such as `npm run build` or `npm run test:run`

## What Users Should Remember

- say what you want in natural language
- prefer `$dorado` and the narrower Dorado skills
- use CLI commands only when you want exact manual control or scripting
