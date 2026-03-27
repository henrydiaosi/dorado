# Installation

[English](installation.md) | [简体中文](installation.zh-CN.md)

## Requirements

- Node.js `>= 18`
- npm `>= 8`

## Install From The Release Repository

Run inside the Dorado release repository root:

```bash
npm install
npm install -g .
```

This release repository already contains the publishable CLI assets. Install from the full repository root instead of manually copying `dist/` or a few individual files.

## Verify The Install

```bash
dorado --version
dorado --help
dorado doctor
```

If you want to verify the release repository itself:

```bash
npm run doctor
```

## Upgrade

Use a full repository sync, then reinstall:

```bash
npm install
npm install -g .
dorado doctor
```

If you also use Dorado skills, resync them after the CLI upgrade:

```bash
dorado skill install
dorado skill install-claude
```

## Optional Release Smoke Check

```bash
npm run release:smoke
```

## Upgrade Rules

- Do not overlay selected release files onto an older directory.
- Do not copy only `dist/cli.js`, `dist/`, or individual scripts and call that an upgrade.
- The supported path is: sync the full release repository, reinstall globally, then run `dorado doctor`.
