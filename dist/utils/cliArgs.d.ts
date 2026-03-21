export interface ParsedDashboardArgs {
    action: string;
    projectPath?: string;
    port?: number;
    autoOpen: boolean;
}
export declare function parseDashboardArgs(args: string[]): ParsedDashboardArgs;
export declare function getDashboardHelpText(): string;
//# sourceMappingURL=cliArgs.d.ts.map