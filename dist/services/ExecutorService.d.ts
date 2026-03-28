import { ExecutorJob, ExecutorJobSummary, QueueRunExecutor } from '../core/types';
import { ExecutorCapability, ExecutorDispatchRequest, ExecutorDispatchResult, ExecutorPollResult } from '../executors/types';
import { FileService } from './FileService';
export declare class ExecutorService {
    private fileService;
    constructor(fileService: FileService);
    getCapability(executor: QueueRunExecutor): ExecutorCapability;
    listCapabilities(): Array<{
        executor: QueueRunExecutor;
        capability: ExecutorCapability;
    }>;
    createJobRecord(rootDir: string, request: ExecutorDispatchRequest): Promise<ExecutorDispatchResult>;
    pollJob(rootDir: string, job: ExecutorJob): Promise<ExecutorPollResult>;
    loadJob(rootDir: string, jobId: string): Promise<ExecutorJob | null>;
    saveJob(rootDir: string, job: ExecutorJob): Promise<void>;
    toSummary(job: ExecutorJob | null): ExecutorJobSummary | null;
    ensureExecutorDirectories(rootDir: string): Promise<void>;
    private getJobPath;
    private normalizeJob;
}
export declare function createExecutorService(fileService: FileService): ExecutorService;
//# sourceMappingURL=ExecutorService.d.ts.map