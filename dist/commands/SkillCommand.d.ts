import { BaseCommand } from './BaseCommand';
export declare class SkillCommand extends BaseCommand {
    execute(action?: string, targetDir?: string): Promise<void>;
    private installSkill;
    private getInstalledSkillStatus;
    private resolvePackageRoot;
    private resolvePrimarySourceFiles;
    private syncSkillFiles;
    private syncLegacyAlias;
    private isLegacyAliasInSync;
    private buildLegacyAliasFiles;
    private resolveTargetDir;
    private resolveLegacyAliasTargetDir;
}
//# sourceMappingURL=SkillCommand.d.ts.map