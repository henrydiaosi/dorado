import { ExecutorJob, QueueRunExecutor } from '../core/types';
export interface ExecutorDispatchRequest {
    runId: string;
    executor: QueueRunExecutor;
    projectPath: string;
    profileId: string;
    changeName: string;
    changePath: string;
}
export interface ExecutorDispatchResult {
    accepted: boolean;
    job: ExecutorJob;
    reason: string | null;
}
export interface ExecutorPollResult {
    job: ExecutorJob;
    changed: boolean;
}
export interface ExecutorCapability {
    supported: boolean;
    reason: string | null;
}
export interface ExecutorAdapter {
    readonly executor: QueueRunExecutor;
    getCapability(): ExecutorCapability;
    dispatch(request: ExecutorDispatchRequest): Promise<ExecutorDispatchResult>;
    poll(job: ExecutorJob): Promise<ExecutorPollResult>;
}
//# sourceMappingURL=types.d.ts.map