# Usage

## Common Commands

```bash
dorado status [path]
dorado init [path]
dorado docs status [path]
dorado docs generate [path]
dorado changes status [path]
dorado new <change-name> [path]
dorado progress [changes/active/<change>]
dorado verify [changes/active/<change>]
dorado archive [changes/active/<change>]
dorado finalize [changes/active/<change>]
dorado dashboard start [path] [--port <port>] [--no-open]
dorado skill status
dorado skill install
dorado skill status-claude
dorado skill install-claude
```

## Recommended Flow

For a fresh directory:

```bash
dorado status [path]
dorado init [path]
```

If you explicitly want to build the project knowledge layer:

```bash
dorado docs generate [path]
```

If you explicitly want to start a requirement:

```bash
dorado new <change-name> [path]
```

When a change is complete, close it out with:

```bash
dorado finalize [changes/active/<change>]
```

## Init Expectations

Plain initialization is intentionally minimal:

- it creates the Dorado protocol shell
- it does not create a web template or business scaffold by default
- it does not create the first change automatically
- Git hooks should stay quiet until active changes exist

## Progress And Checks

Use these commands when execution has started:

```bash
dorado changes status [path]
dorado progress [changes/active/<change>]
dorado verify [changes/active/<change>]
dorado archive [changes/active/<change>]
dorado finalize [changes/active/<change>]
```

`dorado finalize` is the standard closeout path. It verifies the completed change, refreshes the index, archives the change, and leaves the repository ready for manual commit.
