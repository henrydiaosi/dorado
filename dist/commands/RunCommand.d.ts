import { BaseCommand } from './BaseCommand';
export declare class RunCommand extends BaseCommand {
    execute(action?: string, ...args: string[]): Promise<void>;
    private start;
    private status;
    private step;
    private resume;
    private stop;
    private logs;
    private profile;
    private profileList;
    private profileShow;
    private profileValidate;
    private profileSetDefault;
    private printReport;
    private parseStartArgs;
    private getProfileSupportLabel;
    private getProfileSupport;
    private normalizeExecutor;
}
//# sourceMappingURL=RunCommand.d.ts.map