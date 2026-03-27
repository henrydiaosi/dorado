"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillCommand = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const services_1 = require("../services");
const subcommandHelp_1 = require("../utils/subcommandHelp");
const BaseCommand_1 = require("./BaseCommand");
const ACTION_SKILLS = [
    {
        name: 'dorado-init',
        title: 'Dorado Init',
        description: 'Initialize the Dorado protocol shell for a directory without assuming stack templates or creating the first change.',
        shortDescription: 'Initialize Dorado protocol shell',
        defaultPrompt: 'Use $dorado-init to inspect the target directory, run dorado status first, initialize the protocol shell with dorado init when needed, and verify the protocol-shell files on disk. Do not create docs backfill, business scaffold, or the first change automatically.',
        markdown: `# Dorado Init

Use this action when the user intent is initialization.

## Guardrails

- run \`dorado status [path]\` first
- use \`dorado init [path]\` for plain initialization
- verify \`.skillrc\`, \`.dorado/\`, \`changes/\`, \`SKILL.md\`, \`SKILL.index.json\`, \`build-index-auto.js\`, and \`for-ai/\` files on disk
- do not assume a web template when the project type is unclear
- do not backfill docs or create the first change unless explicitly requested

## Commands

\`\`\`bash
dorado status [path]
dorado init [path]
\`\`\`
`,
    },
    {
        name: 'dorado-inspect',
        title: 'Dorado Inspect',
        description: 'Inspect an existing repository to determine Dorado initialization level, docs coverage, skills coverage, and active change posture.',
        shortDescription: 'Inspect Dorado project state',
        defaultPrompt: 'Use $dorado-inspect to inspect the current repository state with dorado status, dorado docs status, dorado skills status, dorado changes status, dorado workflow show, dorado run status when queue execution matters, and the dashboard when needed. Prefer diagnosis before mutation.',
        markdown: `# Dorado Inspect

Use this action when the user wants to understand current project posture before changing anything.

## Commands

\`\`\`bash
dorado status [path]
dorado docs status [path]
dorado skills status [path]
dorado changes status [path]
dorado run status [path]
dorado workflow show
dorado dashboard start [path] [--port <port>] [--no-open]
\`\`\`

## Rules

- prefer inspection before initialization or backfill
- treat the dashboard as a viewer, not the primary creator
- treat run status as inspection only; do not dispatch queue execution during passive inspection
- call out whether the repo is uninitialized, basic, or full
`,
    },
    {
        name: 'dorado-backfill',
        title: 'Dorado Backfill',
        description: 'Backfill the project knowledge layer after protocol-shell init without applying business scaffold or creating a change.',
        shortDescription: 'Backfill project knowledge layer',
        defaultPrompt: 'Use $dorado-backfill to backfill the project knowledge layer after protocol-shell init. Prefer dorado docs generate, keep scaffold explicit, and do not create the first change automatically.',
        markdown: `# Dorado Backfill

Use this action after the protocol shell already exists and the repository still lacks project knowledge.

## Guardrails

- require the protocol shell first
- prefer \`dorado docs generate [path]\`
- do not apply business scaffold during docs backfill
- do not generate \`docs/project/bootstrap-summary.md\`
- do not create a change unless explicitly requested

## Commands

\`\`\`bash
dorado docs status [path]
dorado docs generate [path]
dorado skills status [path]
dorado index check [path]
\`\`\`
`,
    },
    {
        name: 'dorado-workflow',
        title: 'Dorado Workflow',
        description: 'Inspect workflow configuration, compare workflow flags, and switch repository modes with the correct active-change safety rules.',
        shortDescription: 'Inspect or switch workflow mode',
        defaultPrompt: 'Use $dorado-workflow to inspect or change Dorado workflow mode. Prefer dorado workflow show first, explain repository mode versus per-change activation clearly, and only use dorado workflow set-mode --force-active when the user intentionally wants active changes updated too.',
        markdown: `# Dorado Workflow

Use this action when the user wants to inspect workflow settings or switch repository mode.

## Commands

\`\`\`bash
dorado workflow show
dorado workflow list-flags
dorado workflow set-mode <lite|standard|full> [path]
dorado workflow set-mode <lite|standard|full> [path] --force-active
\`\`\`

## Rules

- repository mode is repository-level governance, not per-change completion state
- prefer \`dorado workflow show\` before switching modes
- switching modes is blocked when active changes exist unless \`--force-active\` is used
- use \`--force-active\` only when the user explicitly wants active changes updated too
`,
    },
    {
        name: 'dorado-change',
        title: 'Dorado Change',
        description: 'Create or advance an active change inside a Dorado project while respecting workflow files and optional-step activation.',
        shortDescription: 'Create or advance a change',
        defaultPrompt: 'Use $dorado-change to create or advance a Dorado change. Read .skillrc, SKILL.index.json, workflow posture, runner state when relevant, and the current change files first. Keep protocol execution inside changes/active/<change>, do not confuse bootstrap with change creation, and distinguish manual-bridge tracking from explicit codex/claude-code queue execution.',
        markdown: `# Dorado Change

Use this action for requirement execution after project initialization.

## Read Order

1. \`.skillrc\`
2. \`SKILL.index.json\`
3. \`dorado workflow show\` output when workflow posture matters
4. \`dorado run status [path]\` when runner or executor state matters
5. \`changes/active/<change>/proposal.md\`
6. \`changes/active/<change>/tasks.md\`
7. \`changes/active/<change>/state.json\`
8. \`changes/active/<change>/verification.md\`

## Commands

\`\`\`bash
dorado new <change-name> [path]
dorado progress [changes/active/<change>]
dorado changes status [path]
dorado run start [path] --executor <manual-bridge|codex|claude-code> --profile <profile>
dorado run status [path]
dorado run step [path]
\`\`\`

## Runner Rules

- \`manual-bridge\` means Dorado is tracking a manual or external AI implementation pass
- \`codex\` and \`claude-code\` are explicit queue executors; they must not be started implicitly
- only use \`dorado run start\` / \`dorado run step\` when the user explicitly wants queue execution
- executor output does not bypass verify / finalize / archive
`,
    },
    {
        name: 'dorado-verify',
        title: 'Dorado Verify',
        description: 'Verify a Dorado change and inspect aggregated PASS/WARN/FAIL status across all active changes before commit or archive.',
        shortDescription: 'Verify changes and summaries',
        defaultPrompt: 'Use $dorado-verify to verify change protocol completeness with dorado verify and dorado changes status. Highlight PASS, WARN, and FAIL items before archive or commit.',
        markdown: `# Dorado Verify

Use this action when validating delivery readiness.

## Commands

\`\`\`bash
dorado verify [changes/active/<change>]
dorado changes status [path]
dorado index check [path]
\`\`\`

## Rules

- show PASS, WARN, and FAIL clearly
- incomplete checklists are warnings
- missing protocol files or optional-step coverage are failures
`,
    },
    {
        name: 'dorado-archive',
        title: 'Dorado Archive',
        description: 'Archive a completed Dorado change after checking workflow gates, and support an explicit check-only mode when needed.',
        shortDescription: 'Archive a completed change',
        defaultPrompt: 'Use $dorado-archive to archive a completed Dorado change. Check readiness first, then run dorado archive on the active change path. If you only need a dry check, use dorado archive --check.',
        markdown: `# Dorado Archive

Use this action when a change is complete and should be archived before commit.

## Commands

\`\`\`bash
dorado archive [changes/active/<change>]
dorado archive [changes/active/<change>] --check
dorado verify [changes/active/<change>]
dorado changes status [path]
\`\`\`

## Rules

- state.json.status must be \`ready_to_archive\`
- verification and optional-step coverage must already be complete
- archive before commit; do not expect commit to archive automatically
- use \`--check\` only when you want readiness output without executing archive
`,
    },
    {
        name: 'dorado-finalize',
        title: 'Dorado Finalize',
        description: 'Run the standard change closeout flow, verify protocol completeness, refresh the index, and archive the completed change before commit.',
        shortDescription: 'Finalize a completed change',
        defaultPrompt: 'Use $dorado-finalize to close a completed Dorado change. Run the preflight verification, rebuild the index, move the change through archive, and leave the repository ready for manual commit.',
        markdown: `# Dorado Finalize

Use this action when implementation is complete and the change should be closed before commit.

## Commands

\`\`\`bash
dorado finalize [changes/active/<change>]
dorado changes status [path]
\`\`\`

## Rules

- finalize is the default closeout path for a completed change
- it should verify protocol completeness before archive
- it should archive before commit
- Git commit remains manual unless the project explicitly adds optional automation
`,
    },
];
class SkillCommand extends BaseCommand_1.BaseCommand {
    async execute(action = 'status', targetDir) {
        try {
            if ((0, subcommandHelp_1.isHelpAction)(action)) {
                this.info((0, subcommandHelp_1.getSkillHelpText)());
                return;
            }
            const { provider, verb } = this.resolveAction(action);
            switch (verb) {
                case 'install': {
                    const result = await this.installSkill(provider, targetDir);
                    this.success(`Installed dorado ${result.providerLabel} skill suite to ${path_1.default.dirname(result.targetDir)}`);
                    for (const skillPackage of result.packages) {
                        this.info(`  ${skillPackage.name}: ${skillPackage.targetDir}`);
                    }
                    if (result.legacyAlias) {
                        this.info(`  legacy alias: ${result.legacyAlias.targetDir}`);
                    }
                    break;
                }
                case 'status': {
                    const result = await this.getInstalledSkillStatus(provider, targetDir);
                    console.log(`\n${result.providerLabel} Skill Suite Status`);
                    console.log(`${'='.repeat(`${result.providerLabel} Skill Suite Status`.length)}\n`);
                    console.log(`Primary target: ${result.targetDir}`);
                    console.log(`Packages: ${result.packages.length}`);
                    console.log(`In sync: ${result.inSync ? 'yes' : 'no'}`);
                    for (const skillPackage of result.packages) {
                        console.log(`\n${skillPackage.name}`);
                        console.log(`  Target: ${skillPackage.targetDir}`);
                        console.log(`  In sync: ${skillPackage.inSync ? 'yes' : 'no'}`);
                        for (const asset of skillPackage.assets) {
                            console.log(`  ${asset.relativePath}: ${asset.exists ? 'present' : 'missing'}`);
                        }
                    }
                    if (result.legacyAlias) {
                        console.log(`\nLegacy alias target: ${result.legacyAlias.targetDir}`);
                        console.log(`Legacy alias in sync: ${result.legacyAlias.inSync ? 'yes' : 'no'}`);
                    }
                    if (result.missingFiles.length > 0) {
                        console.log('\nMissing files:');
                        for (const item of result.missingFiles) {
                            console.log(`  - ${item}`);
                        }
                    }
                    if (result.driftedFiles.length > 0) {
                        console.log('\nOut-of-sync files:');
                        for (const item of result.driftedFiles) {
                            console.log(`  - ${item}`);
                        }
                    }
                    if (!result.inSync) {
                        console.log(`\nRecommendation: run "dorado skill ${this.getInstallAction(provider)}${targetDir ? ` ${targetDir}` : ''}" to sync the installed suite.`);
                    }
                    console.log('');
                    break;
                }
            }
        }
        catch (error) {
            this.error(`Skill command failed: ${error}`);
            throw error;
        }
    }
    resolveAction(action) {
        switch (action) {
            case 'install':
                return { provider: 'codex', verb: 'install' };
            case 'status':
                return { provider: 'codex', verb: 'status' };
            case 'install-claude':
                return { provider: 'claude', verb: 'install' };
            case 'status-claude':
                return { provider: 'claude', verb: 'status' };
            default:
                throw new Error(`Unknown skill action: ${action}`);
        }
    }
    getInstallAction(provider) {
        return provider === 'claude' ? 'install-claude' : 'install';
    }
    async installSkill(provider, targetDir) {
        const suite = await this.buildSkillSuite(provider, targetDir);
        for (const skillPackage of suite) {
            await this.syncSkillFiles(skillPackage.assets, skillPackage.targetDir);
        }
        let legacyAlias = null;
        if (!targetDir) {
            const legacyTargetDir = this.resolveLegacyAliasTargetDir(provider);
            const legacySpec = await this.buildLegacyAliasPackage(provider, legacyTargetDir);
            await this.syncSkillFiles(legacySpec.assets, legacySpec.targetDir);
            legacyAlias = {
                targetDir: legacyTargetDir,
                inSync: await this.isPackageInSync(legacySpec.assets, legacyTargetDir),
            };
        }
        const status = await this.getInstalledSkillStatus(provider, targetDir);
        return {
            ...status,
            legacyAlias,
        };
    }
    async getInstalledSkillStatus(provider, targetDir) {
        const suite = await this.buildSkillSuite(provider, targetDir);
        const packages = await Promise.all(suite.map(async (skillPackage) => {
            const assets = await Promise.all(skillPackage.assets.map(async (asset) => {
                const absolutePath = path_1.default.join(skillPackage.targetDir, asset.relativePath);
                const exists = await services_1.services.fileService.exists(absolutePath);
                const inSync = exists && (await services_1.services.fileService.readFile(absolutePath)) === asset.content;
                return {
                    relativePath: asset.relativePath,
                    absolutePath,
                    exists,
                    inSync,
                };
            }));
            return {
                name: skillPackage.name,
                targetDir: skillPackage.targetDir,
                assets,
                inSync: assets.every(asset => asset.inSync),
                missingFiles: assets.filter(asset => !asset.exists).map(asset => asset.absolutePath),
                driftedFiles: assets
                    .filter(asset => asset.exists && !asset.inSync)
                    .map(asset => asset.absolutePath),
            };
        }));
        const missingFiles = packages.flatMap(skillPackage => skillPackage.missingFiles);
        const driftedFiles = packages.flatMap(skillPackage => skillPackage.driftedFiles);
        const legacyTargetDir = this.resolveLegacyAliasTargetDir(provider);
        const legacyAlias = !targetDir && (await services_1.services.fileService.exists(legacyTargetDir))
            ? {
                targetDir: legacyTargetDir,
                inSync: await this.isPackageInSync((await this.buildLegacyAliasPackage(provider, legacyTargetDir)).assets, legacyTargetDir),
            }
            : null;
        return {
            provider,
            providerLabel: provider === 'claude' ? 'Claude Code' : 'Codex',
            targetDir: suite[0].targetDir,
            packages,
            inSync: packages.every(skillPackage => skillPackage.inSync),
            missingFiles,
            driftedFiles,
            legacyAlias,
        };
    }
    async buildSkillSuite(provider, targetDir) {
        const primaryTargetDir = this.resolveTargetDir(provider, targetDir);
        const baseDir = targetDir ? primaryTargetDir : path_1.default.dirname(primaryTargetDir);
        const definitions = [await this.buildPrimarySkillDefinition(), ...ACTION_SKILLS];
        return Promise.all(definitions.map(async (definition) => ({
            name: definition.name,
            targetDir: definition.name === 'dorado'
                ? primaryTargetDir
                : path_1.default.join(baseDir, definition.name),
            assets: await this.buildPackageAssets(provider, definition),
        })));
    }
    async buildPrimarySkillDefinition() {
        const sourceFiles = this.resolvePrimarySourceFiles();
        const sourceSkillMd = await services_1.services.fileService.readFile(sourceFiles.skillMdPath);
        const sourceSkillYaml = await services_1.services.fileService.readFile(sourceFiles.skillYamlPath);
        const sourceOpenaiYaml = await services_1.services.fileService.readFile(sourceFiles.openaiYamlPath);
        return {
            name: 'dorado',
            title: 'Dorado',
            description: 'Protocol-shell-first Dorado workflow for initialization, project knowledge backfill, change execution, verification, and archive readiness.',
            shortDescription: 'Inspect, initialize, and operate Dorado projects',
            defaultPrompt: this.extractInterfaceDefaultPrompt(sourceSkillYaml, sourceOpenaiYaml),
            markdown: sourceSkillMd,
            skillYaml: sourceSkillYaml,
            openaiYaml: sourceOpenaiYaml,
        };
    }
    async buildPackageAssets(provider, definition) {
        if (provider === 'claude') {
            return [
                {
                    relativePath: 'SKILL.md',
                    content: this.withClaudeFrontmatter(definition.name, definition.description, this.stripFrontmatter(this.buildSkillMarkdown(definition))),
                },
            ];
        }
        return [
            {
                relativePath: 'SKILL.md',
                content: this.buildSkillMarkdown(definition),
            },
            {
                relativePath: 'skill.yaml',
                content: definition.skillYaml || this.buildCodexSkillYaml(definition),
            },
            {
                relativePath: 'agents/openai.yaml',
                content: definition.openaiYaml || this.buildOpenAiYaml(definition),
            },
        ];
    }
    async buildLegacyAliasPackage(provider, targetDir) {
        if (provider === 'claude') {
            return {
                targetDir,
                assets: [
                    {
                        relativePath: 'SKILL.md',
                        content: this.withClaudeFrontmatter('dorado-cli', 'Legacy compatibility alias for the Dorado skill in Claude Code. Use when existing prompts, automation, or habits still refer to dorado-cli.', this.stripFrontmatter(this.buildCodexLegacyAliasFiles().skillMd)),
                    },
                ],
            };
        }
        const compatibilityFiles = this.buildCodexLegacyAliasFiles();
        return {
            targetDir,
            assets: [
                { relativePath: 'SKILL.md', content: compatibilityFiles.skillMd },
                { relativePath: 'skill.yaml', content: compatibilityFiles.skillYaml },
                { relativePath: 'agents/openai.yaml', content: compatibilityFiles.openaiYaml },
            ],
        };
    }
    async syncSkillFiles(assets, targetDir) {
        await services_1.services.fileService.ensureDir(targetDir);
        for (const asset of assets) {
            const absolutePath = path_1.default.join(targetDir, asset.relativePath);
            await services_1.services.fileService.ensureDir(path_1.default.dirname(absolutePath));
            await services_1.services.fileService.writeFile(absolutePath, asset.content);
        }
    }
    async isPackageInSync(assets, targetDir) {
        for (const asset of assets) {
            const absolutePath = path_1.default.join(targetDir, asset.relativePath);
            if (!(await services_1.services.fileService.exists(absolutePath))) {
                return false;
            }
            if ((await services_1.services.fileService.readFile(absolutePath)) !== asset.content) {
                return false;
            }
        }
        return true;
    }
    buildCodexSkillYaml(definition) {
        return `name: ${definition.name}
title: ${definition.title}
description: ${definition.description}
version: 5.0.1
author: Dorado Team
license: MIT

interface:
  display_name: "${definition.title}"
  short_description: "${definition.shortDescription}"
  default_prompt: "${this.escapeYaml(definition.defaultPrompt)}"
`;
    }
    buildOpenAiYaml(definition) {
        return `interface:
  display_name: "${definition.title}"
  short_description: "${definition.shortDescription}"
  default_prompt: "${this.escapeYaml(definition.defaultPrompt)}"
`;
    }
    resolvePackageRoot() {
        return path_1.default.resolve(__dirname, '..', '..');
    }
    resolvePrimarySourceFiles() {
        const packageRoot = this.resolvePackageRoot();
        return {
            skillMdPath: path_1.default.join(packageRoot, 'SKILL.md'),
            skillYamlPath: path_1.default.join(packageRoot, 'skill.yaml'),
            openaiYamlPath: path_1.default.join(packageRoot, 'agents', 'openai.yaml'),
        };
    }
    withClaudeFrontmatter(name, description, markdownBody) {
        return `---
name: ${name}
description: ${description}
---

${markdownBody.trimStart()}`;
    }
    stripFrontmatter(markdown) {
        return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    }
    buildSkillMarkdown(definition) {
        if (/^---\r?\n/.test(definition.markdown)) {
            if (/^---\r?\n[\s\S]*?\r?\ndescription:\s.+\r?\n[\s\S]*?\r?\n---\r?\n?/m.test(definition.markdown)) {
                return definition.markdown;
            }
            return definition.markdown.replace(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/, `---\n$1\ndescription: ${definition.description}\n---\n\n`);
        }
        return `---
name: ${definition.name}
description: ${definition.description}
tags: [dorado, cli, workflow]
---

${definition.markdown.trimStart()}`;
    }
    escapeYaml(value) {
        return value.replace(/"/g, '\\"');
    }
    extractInterfaceDefaultPrompt(skillYaml, openaiYaml) {
        const match = skillYaml.match(/default_prompt:\s*"([\s\S]*?)"/) ||
            openaiYaml.match(/default_prompt:\s*"([\s\S]*?)"/);
        return match?.[1]?.replace(/\\"/g, '"') || 'Use $dorado to operate this Dorado project.';
    }
    buildCodexLegacyAliasFiles() {
        return {
            skillMd: `---
name: dorado-cli
description: Legacy compatibility alias for the Dorado skill. Use when existing prompts, automation, or habits still refer to dorado-cli; follow the same Dorado workflow, but prefer the newer $dorado skill name in fresh prompts.
---

# Dorado CLI Legacy Alias

This skill is a compatibility wrapper for the main \`dorado\` skill.

Prefer this prompt style for new work:

1. \`Use dorado to initialize this directory\`
2. \`Use dorado to inspect this repository\`
3. \`Use dorado to backfill the project knowledge layer\`
4. \`Use dorado to create and advance a change for this requirement\`
5. \`Use dorado to inspect or switch the workflow mode for this repository\`

Always keep these guardrails:

- protocol shell first
- no assumed web template when the project type is unclear
- no business scaffold during plain init
- no automatic first change

Use the same command surface:

\`\`\`bash
dorado status [path]
dorado init [path]
dorado docs generate [path]
dorado changes status [path]
dorado workflow show
dorado workflow set-mode <lite|standard|full> [path]
dorado dashboard start [path] [--port <port>] [--no-open]
dorado skill status
dorado skill install
dorado skill status-claude
dorado skill install-claude
\`\`\`
`,
            skillYaml: `name: dorado-cli
title: Dorado CLI (Legacy Alias)
description: Legacy compatibility alias that redirects dorado-cli skill usage to the newer dorado skill name.
version: 5.0.1
author: Dorado Team
license: MIT

interface:
  display_name: "Dorado CLI"
  short_description: "Legacy alias for the Dorado skill"
  default_prompt: "Use $dorado to inspect and initialize this directory according to Dorado rules: protocol shell first, explicit knowledge backfill, no assumed web template when the project type is unclear, no automatic first change, and use dorado workflow set-mode only when repository governance must change explicitly."
`,
            openaiYaml: `interface:
  display_name: "Dorado CLI"
  short_description: "Legacy alias for the Dorado skill"
  default_prompt: "Use $dorado to inspect and initialize this directory according to Dorado rules: protocol shell first, explicit knowledge backfill, no assumed web template when the project type is unclear, no automatic first change, and use dorado workflow set-mode only when repository governance must change explicitly."
`,
        };
    }
    resolveTargetDir(provider, targetDir) {
        if (targetDir) {
            return targetDir;
        }
        return provider === 'claude'
            ? path_1.default.join(os_1.default.homedir(), '.claude', 'skills', 'dorado')
            : path_1.default.join(os_1.default.homedir(), '.codex', 'skills', 'dorado');
    }
    resolveLegacyAliasTargetDir(provider) {
        return provider === 'claude'
            ? path_1.default.join(os_1.default.homedir(), '.claude', 'skills', 'dorado-cli')
            : path_1.default.join(os_1.default.homedir(), '.codex', 'skills', 'dorado-cli');
    }
}
exports.SkillCommand = SkillCommand;
//# sourceMappingURL=SkillCommand.js.map