import { BaseCommand } from './BaseCommand';
interface FinalizeCommandOptions {
    activateNext?: boolean;
}
export declare class FinalizeCommand extends BaseCommand {
    execute(featurePath?: string, options?: FinalizeCommandOptions): Promise<void>;
    private printPreflight;
}
export {};
//# sourceMappingURL=FinalizeCommand.d.ts.map