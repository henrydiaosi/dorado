/**
 * 工作流命令
 * 显示和管理工作流配置
 */
import { BaseCommand } from './BaseCommand';
export declare class WorkflowCommand extends BaseCommand {
    execute(action: string, projectPath?: string): Promise<void>;
    private showWorkflow;
    private listSupportedFlags;
}
//# sourceMappingURL=WorkflowCommand.d.ts.map