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
            switch (action) {
                case 'install': {
                    const result = await this.installSkill(targetDir);
                    this.success(`Installed dorado skill to ${result.targetDir}`);
                    this.info(`  SKILL.md: ${result.skillMdPath}`);
                    this.info(`  skill.yaml: ${result.skillYamlPath}`);
                    if (result.openaiYamlExists) {
                        this.info(`  agents/openai.yaml: ${result.openaiYamlPath}`);
                    }
                    if (result.legacyAlias) {
                        this.info(`  legacy alias: ${result.legacyAlias.targetDir}`);
                    }
                    break;
                }
                case 'status': {
                    const result = await this.getInstalledSkillStatus(targetDir);
                    console.log('\nCodex Skill Status');
                    console.log('==================\n');
                    console.log(`Target: ${result.targetDir}`);
                    console.log(`SKILL.md: ${result.skillMdExists ? 'present' : 'missing'}`);
                    console.log(`skill.yaml: ${result.skillYamlExists ? 'present' : 'missing'}`);
                    console.log(`agents/openai.yaml: ${result.openaiYamlExists ? 'present' : 'missing'}`);
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
                    if (!result.inSync && result.missingFiles.length === 0) {
                        console.log('Recommendation: run "dorado skill install" to sync the installed skill.');
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
    async installSkill(targetDir) {
        const resolvedTargetDir = this.resolveTargetDir(targetDir);
        const sourceFiles = this.resolvePrimarySourceFiles();
        if (!(await services_1.services.fileService.exists(sourceFiles.skillMdPath))) {
            throw new Error(`Source skill file not found: ${sourceFiles.skillMdPath}`);
        }
        await this.syncSkillFiles(sourceFiles, resolvedTargetDir);
        let legacyAlias = null;
        if (!targetDir) {
            const legacyTargetDir = this.resolveLegacyAliasTargetDir();
            await this.syncLegacyAlias(legacyTargetDir);
            legacyAlias = {
                targetDir: legacyTargetDir,
                inSync: await this.isLegacyAliasInSync(legacyTargetDir),
            };
        }
        const status = await this.getInstalledSkillStatus(resolvedTargetDir);
        return {
            ...status,
            legacyAlias,
        };
    }
    async getInstalledSkillStatus(targetDir) {
        const resolvedTargetDir = this.resolveTargetDir(targetDir);
        const sourceFiles = this.resolvePrimarySourceFiles();
        const installedSkillMdPath = path_1.default.join(resolvedTargetDir, 'SKILL.md');
        const installedSkillYamlPath = path_1.default.join(resolvedTargetDir, 'skill.yaml');
        const installedOpenaiYamlPath = path_1.default.join(resolvedTargetDir, 'agents', 'openai.yaml');
        const skillMdExists = await services_1.services.fileService.exists(installedSkillMdPath);
        const skillYamlExists = await services_1.services.fileService.exists(installedSkillYamlPath);
        const sourceOpenaiYamlExists = await services_1.services.fileService.exists(sourceFiles.openaiYamlPath);
        const openaiYamlExists = sourceOpenaiYamlExists
            ? await services_1.services.fileService.exists(installedOpenaiYamlPath)
            : false;
        const missingFiles = [
            ...(skillMdExists ? [] : [installedSkillMdPath]),
            ...(skillYamlExists ? [] : [installedSkillYamlPath]),
            ...(sourceOpenaiYamlExists && !openaiYamlExists ? [installedOpenaiYamlPath] : []),
        ];
        const inSync = skillMdExists &&
            skillYamlExists &&
            (!sourceOpenaiYamlExists || openaiYamlExists) &&
            (await services_1.services.fileService.readFile(installedSkillMdPath)) === (await services_1.services.fileService.readFile(sourceFiles.skillMdPath)) &&
            (await services_1.services.fileService.readFile(installedSkillYamlPath)) === (await services_1.services.fileService.readFile(sourceFiles.skillYamlPath)) &&
            (!sourceOpenaiYamlExists ||
                (await services_1.services.fileService.readFile(installedOpenaiYamlPath)) ===
                    (await services_1.services.fileService.readFile(sourceFiles.openaiYamlPath)));
        const legacyAlias = !targetDir && (await services_1.services.fileService.exists(this.resolveLegacyAliasTargetDir()))
            ? {
                targetDir: this.resolveLegacyAliasTargetDir(),
                inSync: await this.isLegacyAliasInSync(this.resolveLegacyAliasTargetDir()),
            }
            : null;
        return {
            targetDir: resolvedTargetDir,
            skillMdPath: installedSkillMdPath,
            skillYamlPath: installedSkillYamlPath,
            openaiYamlPath: installedOpenaiYamlPath,
            skillMdExists,
            skillYamlExists,
            openaiYamlExists,
            inSync,
            missingFiles,
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
    async syncSkillFiles(sourceFiles, targetDir) {
        await services_1.services.fileService.ensureDir(targetDir);
        await services_1.services.fileService.copy(sourceFiles.skillMdPath, path_1.default.join(targetDir, 'SKILL.md'));
        if (await services_1.services.fileService.exists(sourceFiles.skillYamlPath)) {
            await services_1.services.fileService.copy(sourceFiles.skillYamlPath, path_1.default.join(targetDir, 'skill.yaml'));
        }
        if (await services_1.services.fileService.exists(sourceFiles.openaiYamlPath)) {
            const targetAgentsDir = path_1.default.join(targetDir, 'agents');
            await services_1.services.fileService.ensureDir(targetAgentsDir);
            await services_1.services.fileService.copy(sourceFiles.openaiYamlPath, path_1.default.join(targetAgentsDir, 'openai.yaml'));
        }
    }
    async syncLegacyAlias(targetDir) {
        const compatibilityFiles = this.buildLegacyAliasFiles();
        await services_1.services.fileService.ensureDir(targetDir);
        await services_1.services.fileService.writeFile(path_1.default.join(targetDir, 'SKILL.md'), compatibilityFiles.skillMd);
        await services_1.services.fileService.writeFile(path_1.default.join(targetDir, 'skill.yaml'), compatibilityFiles.skillYaml);
        await services_1.services.fileService.ensureDir(path_1.default.join(targetDir, 'agents'));
        await services_1.services.fileService.writeFile(path_1.default.join(targetDir, 'agents', 'openai.yaml'), compatibilityFiles.openaiYaml);
    }
    async isLegacyAliasInSync(targetDir) {
        const compatibilityFiles = this.buildLegacyAliasFiles();
        const skillMdPath = path_1.default.join(targetDir, 'SKILL.md');
        const skillYamlPath = path_1.default.join(targetDir, 'skill.yaml');
        const openaiYamlPath = path_1.default.join(targetDir, 'agents', 'openai.yaml');
        if (!(await services_1.services.fileService.exists(skillMdPath)) ||
            !(await services_1.services.fileService.exists(skillYamlPath)) ||
            !(await services_1.services.fileService.exists(openaiYamlPath))) {
            return false;
        }
        return ((await services_1.services.fileService.readFile(skillMdPath)) === compatibilityFiles.skillMd &&
            (await services_1.services.fileService.readFile(skillYamlPath)) === compatibilityFiles.skillYaml &&
            (await services_1.services.fileService.readFile(openaiYamlPath)) === compatibilityFiles.openaiYaml);
    }
    buildLegacyAliasFiles() {
        return {
            skillMd: `---
name: dorado-cli
description: Legacy compatibility alias for the Dorado skill. Use when existing prompts, automation, or habits still refer to dorado-cli; follow the same GUI-first Dorado workflow, but prefer the newer $dorado skill name in fresh prompts.
---

# Dorado CLI Legacy Alias

This skill is a compatibility wrapper for the main \`dorado\` skill.

Prefer this prompt style for new work:

1. \`Use $dorado to inspect the current directory\`
2. \`launch the dashboard when the project is uninitialized, partial, or has no active change\`
3. \`continue into bootstrap and first-change setup\`

Use the same command surface:

\`\`\`bash
dorado status [path]
dorado dashboard start [path] [--port <port>] [--no-open]
dorado skill status
dorado skill install
\`\`\`
`,
            skillYaml: `name: dorado-cli
title: Dorado CLI (Legacy Alias)
description: Legacy compatibility alias that redirects dorado-cli skill usage to the newer dorado skill name.
version: 3.0.0
author: Dorado Team
license: MIT

interface:
  display_name: "Dorado CLI"
  short_description: "Legacy alias for the Dorado skill"
  default_prompt: "Use $dorado to inspect the current directory, launch the dashboard when the project is uninitialized or partial, and continue into the first change workflow."
`,
            openaiYaml: `interface:
  display_name: "Dorado CLI"
  short_description: "Legacy alias for the Dorado skill"
  default_prompt: "Use $dorado to inspect the current directory, launch the dashboard when the project is uninitialized or partial, and continue into the first change workflow."
`,
        };
    }
    resolveTargetDir(targetDir) {
        return targetDir || path_1.default.join(os_1.default.homedir(), '.codex', 'skills', 'dorado');
    }
    resolveLegacyAliasTargetDir() {
        return path_1.default.join(os_1.default.homedir(), '.codex', 'skills', 'dorado-cli');
    }
}
exports.SkillCommand = SkillCommand;
//# sourceMappingURL=SkillCommand.js.map