# Dorado AI Prompt Guide

## Goal

This guide is for Codex, ChatGPT, Claude, and similar AI tools. Its purpose is not to explain the CLI surface alone, but to show how to prompt an AI so it follows the Dorado workflow for project bootstrap, planning, first-change setup, and ongoing delivery.

## Core Principles

- Ask the AI to inspect the directory before writing code
- Use the dashboard first for new projects instead of freeform generation
- Complete project planning before implementation
- Keep execution inside the change-driven workflow
- Be explicit about project goal, stack, modules, APIs, language, and expected output

## Recommended Starter Prompt

Use this in a new directory:

```text
Use dorado to inspect the current directory.
If this is not a complete Dorado project yet, start dorado dashboard first,
guide me through project planning and initialization,
and then create the first change.
```

If you want stronger GUI-first behavior:

```text
Use $dorado to inspect the current directory.
If the project is uninitialized, partially initialized, or has no active change,
launch dorado dashboard first and do not skip the planning step.
```

## New Project Prompt Template

```text
Use dorado to initialize a new project.
Project name: <name>
Project goal: <one-line summary>
Preferred stack: <stack>
Core modules: <module list>
Required API areas: <API list>
Document language: English

First check whether the current directory already has a Dorado project structure.
If not, start dorado dashboard first, guide me through project planning,
and then create the first change.
```

Example:

```text
Use dorado to initialize a new project for the Dorado official website.
Preferred stack: Next.js + TypeScript + Tailwind CSS + Node.js.
It should include marketing pages, a docs center, blog/changelog,
admin content management, and authentication.
First check whether the current directory already has a Dorado project structure.
If not, start dorado dashboard first, guide me through project planning,
and then create the first change.
```

## Existing Project Adoption Prompt

```text
Use dorado to inspect this existing repository.
If it is not yet a complete Dorado project, complete the initialization first,
including project knowledge, AI guides, skill docs, and execution-layer files.
Then tell me what the best first change should be.
```

## Requirements-First Prompt

Use this when you have requirements but no solid design yet:

```text
Use dorado for project planning first and do not start coding yet.
Through the dashboard, help me define:
1. project goal
2. technical solution
3. module boundaries
4. API boundaries
5. design docs
6. delivery plan

After planning is complete, create the first change.
```

## First Change Prompt

```text
Based on the current Dorado project plan, create the first change.
It should be the smallest demonstrable vertical slice
and should cover the main entry points, module boundaries, and base navigation.
First propose the change name and scope,
then generate proposal, tasks, state, and verification.
```

## Execution Prompt

```text
Continue the current active change.
Read the active change files and relevant project knowledge files first.
Follow the Dorado workflow and do not skip verification.
When done, tell me the current status, what is finished, and the next recommended step.
```

## Constraint Prompt

Use this when you want to keep the AI tightly aligned:

```text
Follow the Dorado workflow strictly:
1. inspect directory status first
2. use the dashboard when needed
3. finish project planning before implementation
4. align all work with the active change
5. do not bypass proposal/tasks/state/verification
6. do not invent project conventions when Dorado already provides them
```

## Best Practices

- Explicitly ask the AI to inspect the directory first
- Explicitly ask it to launch the dashboard first
- Explicitly ask it to finish planning before creating the first change
- Set the document language in the prompt
- Say whether you want planning only or direct execution

## What Not To Ask

This is too vague and often causes workflow drift:

```text
Build the whole project directly.
```

A better version is:

```text
Use dorado to finish project planning and initialization first,
then start implementation from the first change.
```
