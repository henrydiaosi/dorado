# Skills Installation

[English](skills-installation.md) | [简体中文](skills-installation.zh-CN.md)

## Codex

Check current status:

```bash
dorado skill status
```

Install or sync the Codex skill suite:

```bash
dorado skill install
```

Default target:

```text
~/.codex/skills/
```

Installed suite:

- `dorado`
- `dorado-init`
- `dorado-inspect`
- `dorado-backfill`
- `dorado-workflow`
- `dorado-change`
- `dorado-verify`
- `dorado-archive`
- `dorado-finalize`
- `dorado-cli` legacy compatibility alias

## Claude Code

Check current status:

```bash
dorado skill status-claude
```

Install or sync the Claude Code skill suite:

```bash
dorado skill install-claude
```

Default target:

```text
~/.claude/skills/
```

The Claude Code suite matches the main Dorado skill set.

## After A CLI Upgrade

After upgrading Dorado CLI, resync both skill targets so prompt rules and workflow behavior stay aligned with the installed release:

```bash
dorado skill install
dorado skill install-claude
```

Then verify:

```bash
dorado skill status
dorado skill status-claude
```

This matters because skill prompts are generated from the installed CLI release. If you upgrade the CLI but skip the skill sync step, Codex or Claude Code can keep using stale prompt rules.

## Prompt Naming

Prefer `$dorado` in new prompts.

Use `$dorado-cli` only for compatibility with older habits or automation.
