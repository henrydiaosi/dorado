# Dorado

[English](README.md) | [简体中文](README.zh-CN.md)

Dorado is a protocol-shell-first CLI for AI-assisted project workflows.

It initializes the collaboration protocol first, keeps the repository minimal at the start, and lets project-specific structure grow later through explicit docs, skills, and changes.

Current release:

- CLI: `0.5.2`
- Skills protocol: `5.0.1`

Documentation:

- [Project Overview](docs/project-overview.md)
- [Installation](docs/installation.md)
- [Usage](docs/usage.md)
- [Prompt Guide](docs/prompt-guide.md)
- [Skills Installation](docs/skills-installation.md)
- [Skills Usage](docs/skills-usage.md)
- [Workflow Modes](docs/workflow-modes.md)

Workflow modes at a glance:

- `lite`: lighter governance for smaller repositories
- `standard`: balanced default for most teams
- `full`: stricter governance for larger or riskier work

Important:

- `standard` is the recommended default
- `full` is not a different product tier or a "more complete" Dorado
- repository mode sets governance range; each change still resolves its own profile, flags, and activated optional steps
- Dorado now exposes public mode switching through `dorado workflow set-mode`

What this release covers:

- protocol-shell-first project initialization
- explicit project-knowledge backfill
- configurable change workflows
- change-status inspection and Git hook enforcement
- standard change closeout with `finalize -> archive -> commit-ready`
- public repository mode inspection and switching
- Codex and Claude Code skill installation and sync
- release self-check with `dorado doctor` and `npm run doctor`
