# Installation

## Requirements

- Node.js `>= 18`
- npm `>= 8`

## Install From This Repository

Run inside the Dorado release repository:

```bash
npm install
npm install -g .
```

## Verify

```bash
dorado --version
dorado --help
```

## Optional Validation

If you want to verify the packaged release behavior before using it:

```bash
npm run release:smoke
```

## Notes

- `npm install` installs the local runtime dependencies
- `npm install -g .` makes the current release available as the global `dorado` command
- this repository ships the release assets and public docs, not the development source workflow
