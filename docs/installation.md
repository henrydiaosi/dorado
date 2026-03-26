# Installation

## Requirements

- Node.js `>= 18`
- npm `>= 8`

## First Install

Run inside the Dorado release repository:

```bash
npm install
npm install -g .
```

## Verify After Install

```bash
dorado --version
dorado --help
dorado doctor
```

If you want to verify the release directory itself before using it:

```bash
npm run doctor
```

## Upgrade

Upgrade by replacing or pulling the full release repository, then reinstalling from the repository root:

```bash
npm install
npm install -g .
dorado doctor
```

If you use Dorado skills, resync them after the CLI upgrade:

```bash
dorado skill install
dorado skill install-claude
```

## Optional Smoke Check

```bash
npm run release:smoke
```

## Important

- Do not partially copy `dist/`, `dist/cli.js`, or individual release files into an older release directory.
- The supported upgrade path is a full repository sync plus reinstall, not a manual overlay of selected artifacts.
- This repository ships release assets and public docs, not the source-development workflow repository.
