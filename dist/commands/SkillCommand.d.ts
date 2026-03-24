import { BaseCommand } from './BaseCommand';
export declare class SkillCommand extends BaseCommand {
    execute(action?: string, targetDir?: string): Promise<void>;
    private resolveAction;
    private getInstallAction;
    private installSkill;
    private getInstalledSkillStatus;
    private resolvePackageRoot;
    private resolvePrimarySourceFiles;
    private buildPackageSpec;
    private syncSkillFiles;
    private isPackageInSync;
    private buildClaudeSkillMd;
    private buildClaudeLegacyAliasSkillMd;
    private withClaudeFrontmatter;
    private stripFrontmatter;
    private buildCodexLegacyAliasFiles;
    private resolveTargetDir;
    private resolveLegacyAliasTargetDir;
}
//# sourceMappingURL=SkillCommand.d.ts.map