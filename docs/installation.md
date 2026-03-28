# Installation

[English](installation.md) | [简体中文](installation.zh-CN.md)

## Requirements

- Node.js `>= 18`
- npm `>= 8`

## Install From This Release Repository

Run in the root of the Dorado release repository:

```bash
npm install
npm install -g .
```

This repository already contains the publishable CLI assets. Install from the full release tree instead of copying only `dist/` or a few individual files.

This is a prebuilt release repository, not the development source repository. That means:

- `npm start` is supported
- `npm run help` is supported
- `npm run doctor` is supported
- `npm run build` is not a supported release action
- `npm run test:run` is not a supported release action

## Verify The Install

```bash
dorado --version
dorado --help
dorado doctor
```

If you want to validate the release repository itself:

```bash
npm run doctor
npm start -- --version
```

## Upgrade

The supported upgrade path is:

1. sync the latest full release repository
2. run `npm install`
3. run `npm install -g .`
4. run `dorado doctor`

If you also use skills, resync them after the CLI upgrade:

```bash
dorado skill install
dorado skill install-claude
```

Then verify:

```bash
dorado skill status
dorado skill status-claude
```

## Optional Release Smoke Check

```bash
npm run release:smoke
```

## Upgrade Rules

- do not overlay a few files onto an older release directory
- do not copy only `dist/cli.js` and call that an upgrade
- always upgrade from a complete synced release repository
