# Skills Installation

## Codex

Check status:

```bash
dorado skill status
```

Install or sync:

```bash
dorado skill install
```

Default location:

```text
~/.codex/skills/
```

Installed skill suite:

- `dorado`
- `dorado-init`
- `dorado-inspect`
- `dorado-backfill`
- `dorado-change`
- `dorado-verify`
- `dorado-archive`
- `dorado-finalize`
- `dorado-cli` legacy compatibility alias

## Claude Code

Check status:

```bash
dorado skill status-claude
```

Install or sync:

```bash
dorado skill install-claude
```

Default location:

```text
~/.claude/skills/
```

The installed skill suite matches the Codex set.

## After CLI Upgrade

After upgrading Dorado CLI, resync both skill targets so the prompts and workflow rules stay aligned with the installed release:

```bash
dorado skill install
dorado skill install-claude
```

Then verify:

```bash
dorado skill status
dorado skill status-claude
```

## Prompt Naming

Prefer `$dorado` in new prompts.

Use `$dorado-cli` only when older automation or habits still reference the legacy name.
