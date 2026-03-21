import { BaseCommand } from './BaseCommand';
interface DashboardStartOptions {
    projectPath?: string;
    port?: number;
    autoOpen?: boolean;
}
export declare class DashboardCommand extends BaseCommand {
    private dashboardServer;
    execute(action?: string, options?: DashboardStartOptions): Promise<void>;
    private startDashboard;
    private stopDashboard;
    private handleShutdown;
}
export {};
//# sourceMappingURL=DashboardCommand.d.ts.map