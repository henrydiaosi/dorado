import { BaseCommand } from './BaseCommand';
export declare class WorkflowCommand extends BaseCommand {
    execute(action: string, ...args: string[]): Promise<void>;
    private showWorkflow;
    private listSupportedFlags;
    private setMode;
    private isValidProjectMode;
}
//# sourceMappingURL=WorkflowCommand.d.ts.map