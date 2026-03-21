# Dorado

English | [Simplified Chinese](docs/zh-CN/project-overview.md)

Dorado is a GUI-first workflow CLI for AI-assisted software delivery. It helps teams initialize a Dorado project, generate the project knowledge layer, create the first change, and continue execution through a controlled change workflow.

## What Dorado Includes

- Dashboard-first project bootstrap
- Project knowledge generation for docs, skills, and AI guides
- Change-driven execution workflow based on `changes/active/<change>/`
- Codex skill installation and synchronization
- Preset-based planning for common project types

## Quick Start

Install dependencies and use the packaged CLI:

```bash
npm install
npm run build
npm install -g .
```

Check the current directory:

```bash
dorado status .
```

Launch the dashboard:

```bash
dorado dashboard start .
```

Install or sync the Codex skill:

```bash
dorado skill install
```

## Documentation

- Chinese project overview: [docs/zh-CN/project-overview.md](docs/zh-CN/project-overview.md)
- Chinese usage guide: [docs/zh-CN/usage-guide.md](docs/zh-CN/usage-guide.md)
- Chinese AI prompt guide: [docs/zh-CN/ai-prompt-guide.md](docs/zh-CN/ai-prompt-guide.md)
- English project overview: [docs/en-US/project-overview.md](docs/en-US/project-overview.md)
- English usage guide: [docs/en-US/usage-guide.md](docs/en-US/usage-guide.md)
- English AI prompt guide: [docs/en-US/ai-prompt-guide.md](docs/en-US/ai-prompt-guide.md)

## Core Commands

```bash
dorado status [path]
dorado dashboard start [path] [--port <port>] [--no-open]
dorado init [path]
dorado new <change-name> [path]
dorado progress ./changes/active/<change>
dorado verify ./changes/active/<change>
dorado archive ./changes/active/<change>
dorado skill status
dorado skill install
```

## Recommended Flow

1. Inspect the target directory with `dorado status`.
2. Start the dashboard with `dorado dashboard start`.
3. Complete bootstrap and project planning in the GUI.
4. Create or confirm the first change.
5. Continue delivery with `progress`, `verify`, and `archive`.

## Release Package

This repository is prepared as a publishable runtime package. It keeps the runtime assets, dashboard files, packaged skill metadata, and the documentation needed for usage and onboarding.
