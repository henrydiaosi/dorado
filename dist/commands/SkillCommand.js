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
                    this.success(`Installed dorado ${result.providerLabel} skill to ${result.targetDir}`);
                    for (const asset of result.assets) {
                        this.info(`  ${asset.relativePath}: ${asset.absolutePath}`);
                    }
                    if (result.legacyAlias) {
                        this.info(`  legacy alias: ${result.legacyAlias.targetDir}`);
                    }
                    break;
                }
                case 'status': {
                    const result = await this.getInstalledSkillStatus(provider, targetDir);
                    console.log(`\n${result.providerLabel} Skill Status`);
                    console.log(`${'='.repeat(`${result.providerLabel} Skill Status`.length)}\n`);
                    console.log(`Target: ${result.targetDir}`);
                    for (const asset of result.assets) {
                        console.log(`${asset.relativePath}: ${asset.exists ? 'present' : 'missing'}`);
                    }
                    console.log(`In sync: ${result.inSync ? 'yes' : 'no'}`);
                    if (result.legacyAlias) {
                        console.log(`Legacy alias target: ${result.legacyAlias.targetDir}`);
                        console.log(`Legacy alias in sync: ${result.legacyAlias.inSync ? 'yes' : 'no'}`);
                    }
                    if (result.missingFiles.length > 0) {
                        console.log('Missing files:');
                        for (const item of result.missingFiles) {
                            console.log(`  - ${item}`);
                        }
                    }
                    if (result.driftedFiles.length > 0) {
                        console.log('Out-of-sync files:');
                        for (const item of result.driftedFiles) {
                            console.log(`  - ${item}`);
                        }
                    }
                    if (!result.inSync && result.missingFiles.length === 0 && result.driftedFiles.length > 0) {
                        console.log(`Recommendation: run "dorado skill ${this.getInstallAction(provider)}" to sync the installed skill.`);
                    }
                    console.log('');
                    break;
                }
                default:
                    this.info((0, subcommandHelp_1.getSkillHelpText)());
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
        const resolvedTargetDir = this.resolveTargetDir(provider, targetDir);
        const spec = await this.buildPackageSpec(provider);
        await this.syncSkillFiles(spec.assets, resolvedTargetDir);
        let legacyAlias = null;
        if (!targetDir) {
            const legacyTargetDir = this.resolveLegacyAliasTargetDir(provider);
            const legacySpec = await this.buildPackageSpec(provider, true);
            await this.syncSkillFiles(legacySpec.assets, legacyTargetDir);
            legacyAlias = {
                targetDir: legacyTargetDir,
                inSync: await this.isPackageInSync(legacySpec.assets, legacyTargetDir),
            };
        }
        const status = await this.getInstalledSkillStatus(provider, resolvedTargetDir);
        return {
            ...status,
            legacyAlias,
        };
    }
    async getInstalledSkillStatus(provider, targetDir) {
        const resolvedTargetDir = this.resolveTargetDir(provider, targetDir);
        const spec = await this.buildPackageSpec(provider);
        const assets = await Promise.all(spec.assets.map(async (asset) => {
            const absolutePath = path_1.default.join(resolvedTargetDir, asset.relativePath);
            const exists = await services_1.services.fileService.exists(absolutePath);
            const inSync = exists && (await services_1.services.fileService.readFile(absolutePath)) === asset.content;
            return {
                relativePath: asset.relativePath,
                absolutePath,
                exists,
                inSync,
            };
        }));
        const missingFiles = assets.filter(asset => !asset.exists).map(asset => asset.absolutePath);
        const driftedFiles = assets
            .filter(asset => asset.exists && !asset.inSync)
            .map(asset => asset.absolutePath);
        const legacyTargetDir = this.resolveLegacyAliasTargetDir(provider);
        const legacyAlias = !targetDir && (await services_1.services.fileService.exists(legacyTargetDir))
            ? {
                targetDir: legacyTargetDir,
                inSync: await this.isPackageInSync((await this.buildPackageSpec(provider, true)).assets, legacyTargetDir),
            }
            : null;
        return {
            provider,
            providerLabel: spec.providerLabel,
            targetDir: resolvedTargetDir,
            assets,
            inSync: assets.every(asset => asset.inSync),
            missingFiles,
            driftedFiles,
            legacyAlias,
        };
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
    async buildPackageSpec(provider, legacyAlias = false) {
        if (provider === 'claude') {
            return {
                providerLabel: 'Claude Code',
                assets: [
                    {
                        relativePath: 'SKILL.md',
                        content: legacyAlias
                            ? await this.buildClaudeLegacyAliasSkillMd()
                            : await this.buildClaudeSkillMd(),
                    },
                ],
            };
        }
        if (legacyAlias) {
            const compatibilityFiles = this.buildCodexLegacyAliasFiles();
            return {
                providerLabel: 'Codex',
                assets: [
                    { relativePath: 'SKILL.md', content: compatibilityFiles.skillMd },
                    { relativePath: 'skill.yaml', content: compatibilityFiles.skillYaml },
                    { relativePath: 'agents/openai.yaml', content: compatibilityFiles.openaiYaml },
                ],
            };
        }
        const sourceFiles = this.resolvePrimarySourceFiles();
        if (!(await services_1.services.fileService.exists(sourceFiles.skillMdPath))) {
            throw new Error(`Source skill file not found: ${sourceFiles.skillMdPath}`);
        }
        if (!(await services_1.services.fileService.exists(sourceFiles.skillYamlPath))) {
            throw new Error(`Source skill metadata file not found: ${sourceFiles.skillYamlPath}`);
        }
        const assets = [
            {
                relativePath: 'SKILL.md',
                content: await services_1.services.fileService.readFile(sourceFiles.skillMdPath),
            },
            {
                relativePath: 'skill.yaml',
                content: await services_1.services.fileService.readFile(sourceFiles.skillYamlPath),
            },
        ];
        if (await services_1.services.fileService.exists(sourceFiles.openaiYamlPath)) {
            assets.push({
                relativePath: 'agents/openai.yaml',
                content: await services_1.services.fileService.readFile(sourceFiles.openaiYamlPath),
            });
        }
        return {
            providerLabel: 'Codex',
            assets,
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
    async buildClaudeSkillMd() {
        const sourceFiles = this.resolvePrimarySourceFiles();
        const sourceSkillMd = await services_1.services.fileService.readFile(sourceFiles.skillMdPath);
        return this.withClaudeFrontmatter('dorado', 'Protocol-shell-first Dorado workflow for Claude Code. Use when the user wants to inspect, initialize, backfill project knowledge, or advance changes in a Dorado-managed repository.', this.stripFrontmatter(sourceSkillMd));
    }
    async buildClaudeLegacyAliasSkillMd() {
        return this.withClaudeFrontmatter('dorado-cli', 'Legacy compatibility alias for the Dorado skill in Claude Code. Use when existing prompts, automation, or habits still refer to dorado-cli.', this.stripFrontmatter(this.buildCodexLegacyAliasFiles().skillMd));
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
2. \`Use dorado to inspect and initialize this directory according to current Dorado rules\`
3. \`Use dorado to backfill the project knowledge layer\`
4. \`Use dorado to create and advance a change for this requirement\`

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
version: 3.1.0
author: Dorado Team
license: MIT

interface:
  display_name: "Dorado CLI"
  short_description: "Legacy alias for the Dorado skill"
  default_prompt: "Use $dorado to inspect and initialize this directory according to Dorado rules: protocol shell first, explicit knowledge backfill, no assumed web template when the project type is unclear, and no automatic first change."
`,
            openaiYaml: `interface:
  display_name: "Dorado CLI"
  short_description: "Legacy alias for the Dorado skill"
  default_prompt: "Use $dorado to inspect and initialize this directory according to Dorado rules: protocol shell first, explicit knowledge backfill, no assumed web template when the project type is unclear, and no automatic first change."
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