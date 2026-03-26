import { BaseCommand } from './BaseCommand';
export declare class SkillCommand extends BaseCommand {
    execute(action?: string, targetDir?: string): Promise<void>;
    private resolveAction;
    private getInstallAction;
    private installSkill;
    private getInstalledSkillStatus;
    private buildSkillSuite;
    private buildPrimarySkillDefinition;
    private buildPackageAssets;
    private buildLegacyAliasPackage;
    private syncSkillFiles;
    private isPackageInSync;
    private buildCodexSkillYaml;
    private buildOpenAiYaml;
    private resolvePackageRoot;
    private resolvePrimarySourceFiles;
    private withClaudeFrontmatter;
    private stripFrontmatter;
    private buildSkillMarkdown;
    private escapeYaml;
    private extractInterfaceDefaultPrompt;
    private buildCodexLegacyAliasFiles;
    private resolveTargetDir;
    private resolveLegacyAliasTargetDir;
}
//# sourceMappingURL=SkillCommand.d.ts.map