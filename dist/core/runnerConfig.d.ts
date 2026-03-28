import { QueueRunExecutor, RunnerConfig, RunnerProfileConfig } from './types';
export declare const VALID_RUNNER_EXECUTORS: QueueRunExecutor[];
export declare const BUILTIN_RUNNER_PROFILES: Record<string, RunnerProfileConfig>;
export declare const DEFAULT_RUNNER_EXECUTOR: QueueRunExecutor;
export declare const DEFAULT_RUNNER_PROFILE_ID = "manual-safe";
export interface RunnerProfileRuntimeSupport {
    supported: boolean;
    reason: string | null;
}
export declare function normalizeRunnerProfileConfig(config?: Partial<RunnerProfileConfig> | null): RunnerProfileConfig;
export declare function normalizeRunnerConfig(config?: Partial<RunnerConfig> | null): RunnerConfig;
export declare function validateRunnerConfig(config: RunnerConfig): string[];
export declare function getRunnerProfileRuntimeSupport(executor: QueueRunExecutor, profileId: string, profile: RunnerProfileConfig): RunnerProfileRuntimeSupport;
//# sourceMappingURL=runnerConfig.d.ts.map