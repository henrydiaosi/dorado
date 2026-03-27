# Skills Installation

[English](skills-installation.md) | [简体中文](skills-installation.zh-CN.md)

## Supported Clients

- Codex
- Claude Code

## Codex

Check status:

```bash
dorado skill status
```

Install or resync:

```bash
dorado skill install
```

Default target:

```text
~/.codex/skills/
```

## Claude Code

Check status:

```bash
dorado skill status-claude
```

Install or resync:

```bash
dorado skill install-claude
```

Default target:

```text
~/.claude/skills/
```

## Installed Skill Suite

Both clients receive the same Dorado skill set:

- `dorado`
- `dorado-init`
- `dorado-inspect`
- `dorado-backfill`
- `dorado-change`
- `dorado-workflow`
- `dorado-verify`
- `dorado-archive`
- `dorado-finalize`
- `dorado-cli` legacy compatibility alias

## After A CLI Upgrade

Always resync the skills after a CLI upgrade:

```bash
dorado skill install
dorado skill install-claude
```

Then verify:

```bash
dorado skill status
dorado skill status-claude
```

Use `$dorado` in new prompts. Keep `$dorado-cli` only for older habits or automation.
