import { BaseCommand } from './BaseCommand';
interface NewCommandOptions {
    queued?: boolean;
    activate?: boolean;
}
export declare class NewCommand extends BaseCommand {
    execute(featureName: string, rootDir?: string, options?: NewCommandOptions): Promise<void>;
}
export {};
//# sourceMappingURL=NewCommand.d.ts.map