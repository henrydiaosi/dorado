import { QueueRunExecutor, QueueRunStatusReport, RunnerProfileConfig } from '../core/types';
import { ConfigManager } from './ConfigManager';
import { ExecutorService } from './ExecutorService';
import { FileService } from './FileService';
import { ProjectService } from './ProjectService';
export declare class RunService {
    private fileService;
    private projectService;
    private configManager;
    private executorService;
    constructor(fileService: FileService, projectService: ProjectService, configManager: ConfigManager, executorService: ExecutorService);
    start(rootDir: string, options?: {
        executor?: QueueRunExecutor;
        profileId?: string;
    }): Promise<QueueRunStatusReport>;
    resume(rootDir: string): Promise<QueueRunStatusReport>;
    step(rootDir: string): Promise<QueueRunStatusReport>;
    stop(rootDir: string): Promise<QueueRunStatusReport>;
    getStatusReport(rootDir: string): Promise<QueueRunStatusReport>;
    getLogTail(rootDir: string, lineCount?: number): Promise<string[]>;
    getRunnerConfiguration(rootDir: string): Promise<{
        executor: QueueRunExecutor;
        profileId: string;
        profile: RunnerProfileConfig;
        validationErrors: string[];
    }>;
    private buildStatusReport;
    private resolveStartOptions;
    private synchronizeRun;
    private recordCompletedChange;
    private resolveProfileForRun;
    private advanceRunOnce;
    private ensureCurrentJob;
    private completeCurrentJob;
    private recoverCurrentJobForResume;
    private pollCurrentJob;
    private createRun;
    private touchRun;
    private requireCurrentRun;
    private getCurrentRun;
    private saveRun;
    private appendLogEvents;
    private readLogTail;
    private assertRunnableRepository;
    private assertSingleActive;
    private findArchivedChangePath;
    private ensureRunDirectories;
    private getCurrentRunPath;
    private getHistoryRunPath;
    private resolveRunFilePath;
    private buildActiveInstruction;
    private buildRunInstruction;
    private describeRunStage;
    private getIdleInstruction;
}
export declare function createRunService(fileService: FileService, projectService: ProjectService, configManager: ConfigManager, executorService: ExecutorService): RunService;
//# sourceMappingURL=RunService.d.ts.map