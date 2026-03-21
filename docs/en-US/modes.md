# Dorado Modes Guide

## 1. Project Modes

Dorado stores the project mode in `.skillrc` and uses it to control workflow strictness.

### `lite`

- Lightest mode
- Best for prototypes, experiments, and low-risk exploration
- Minimal governance and validation requirements

### `standard`

- Balanced default mode
- Best for day-to-day work in most teams
- Keeps proposal, tasks, verification, and skill/index updates in place

### `full`

- Strictest mode
- Best for larger, riskier, or cross-module delivery
- Enables stronger governance and archive gates

## 2. Repository Structure States

The dashboard and `dorado status` also identify the current repository structure state.

### `none`

- The directory is not initialized as a Dorado project yet
- Core structure such as `.skillrc`, `changes/`, and `.dorado/` is missing

### `basic`

- Minimum runnable structure exists
- The project knowledge layer is still incomplete, such as missing `docs/`, layered `SKILL.md`, or `SKILL.index.json`

### `full`

- Recommended structure is complete
- The repository is ready to continue in the dashboard or change workflow

## 3. Execution States

Even when the structure is already `full`, execution state still matters:

- `full + no active change`: structure is complete, but there is no active change yet
- `full + active change`: structure is complete and the repository is already in active change execution

## 4. Choosing a Mode

- Use `standard` by default for most teams
- Use `full` for high-risk or strongly governed projects
- Use `lite` for experiments and temporary prototypes
