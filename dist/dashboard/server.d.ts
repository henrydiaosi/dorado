interface DashboardConfig {
    port: number;
    projectPath: string;
    autoOpen: boolean;
}
export declare class DashboardServer {
    private app;
    private config;
    private server;
    constructor(config?: Partial<DashboardConfig>);
    private setupMiddleware;
    private apiRoutes;
    private setupRoutes;
    private loadProjectConfig;
    private resolvePublicPath;
    private ensureInitialized;
    private getBootstrapStatus;
    private getStructurePreview;
    private initializeProject;
    private resolveProjectFilePath;
    private buildBootstrapPreview;
    private inferBootstrapInputFromDescription;
    private extractProjectName;
    private buildArchitectureSummary;
    private handleBootstrapCommit;
    private validateBootstrapPayload;
    private buildFeatureCreateRequestFromSuggestion;
    private createFeature;
    private getWorkflowPresetDescription;
    private isValidProjectMode;
    private getEnabledOptionalSteps;
    private loadProjectSummary;
    private loadExecutionStatus;
    private calculateProgress;
    private executeDorado;
    start(): Promise<void>;
    stop(): Promise<void>;
    private openBrowser;
    private getErrorMessage;
    private sendApiError;
    private handleApiError;
    private getApiStatusCode;
    private getApiErrorCode;
    private getRuntimePort;
}
export default DashboardServer;
//# sourceMappingURL=server.d.ts.map