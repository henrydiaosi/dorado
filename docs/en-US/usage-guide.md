# Dorado Usage Guide

## 1. Install

### Option A: Direct install

```bash
git clone <repo-url>
cd dorado
npm install
npm install -g .
```

Then verify the CLI:

```bash
dorado --help
```

### Option B: Install from a packed tarball

```bash
npm pack
npm install -g dorado-cli-0.2.0.tgz
```

## 2. Inspect a Directory

Check whether the target path is already a Dorado project:

```bash
dorado status .
```

If the directory is not ready, continue with the dashboard.

## 3. Start the Dashboard

```bash
dorado dashboard start .
```

Common variant:

```bash
dorado dashboard start C:/work/my-project --port 3020 --no-open
```

The dashboard is the preferred place to:

- detect project initialization state
- complete missing Dorado structure
- enter project name, stack, modules, APIs, design docs, and planning docs
- create the first change

## 4. Bootstrap a New Project

Recommended flow:

1. Run `dorado status <path>`
2. Run `dorado dashboard start <path>`
3. Describe the project in the GUI
4. Commit bootstrap
5. Continue into the first change

## 5. Execute a Change

Create a change:

```bash
dorado new <change-name> .
```

Continue execution:

```bash
dorado progress ./changes/active/<change-name>
```

Verify:

```bash
dorado verify ./changes/active/<change-name>
```

Archive:

```bash
dorado archive ./changes/active/<change-name>
```

## 6. Install the Codex Skill

Check skill status:

```bash
dorado skill status
```

Install or sync:

```bash
dorado skill install
```

Use `$dorado` as the preferred skill name in Codex prompts.

## 7. Common Scenarios

Initialize a new repository:

```bash
dorado status C:/work/new-project
dorado dashboard start C:/work/new-project
```

Upgrade an existing repository:

```bash
dorado status C:/work/existing-project
dorado dashboard start C:/work/existing-project
```

## 8. Validation

Before publishing or handing off a release, at minimum run:

```bash
npm pack --dry-run
dorado skill status
```

## 9. Modes

See [Modes Guide](modes.md) for project mode and repository state definitions.
