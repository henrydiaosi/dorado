import { BaseCommand } from './BaseCommand';
interface ArchiveCommandOptions {
    checkOnly?: boolean;
}
export declare class ArchiveCommand extends BaseCommand {
    execute(featurePath?: string, options?: ArchiveCommandOptions): Promise<void>;
    run(featurePath?: string, options?: ArchiveCommandOptions): Promise<string | void>;
}
export {};
//# sourceMappingURL=ArchiveCommand.d.ts.map