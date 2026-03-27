export type ProjectMode = 'lite' | 'standard' | 'full';
export type HookCheckPolicy = 'off' | 'warn' | 'error';
export type ChangeSummaryStatus = 'pass' | 'warn' | 'fail';
export type QueueRunStatus = 'idle' | 'running' | 'paused' | 'failed' | 'completed';
export type QueueRunExecutor = 'manual-bridge' | 'codex' | 'claude-code';
export interface RunnerProfileConfig {
    auto_activate_next: boolean;
    auto_verify: boolean;
    auto_finalize: boolean;
    auto_archive: boolean;
    auto_commit: boolean;
    stop_on_warn: boolean;
    stop_on_fail: boolean;
}
export interface RunnerConfig {
    default_executor: QueueRunExecutor;
    default_profile: string;
    auto_start: boolean;
    profiles: Record<string, RunnerProfileConfig>;
}
export type FeatureStatus = 'queued' | 'draft' | 'proposed' | 'planned' | 'implementing' | 'verifying' | 'ready_to_archive' | 'archived';
export interface SkillrcConfig {
    version: string;
    mode: ProjectMode;
    hooks: {
        'pre-commit': boolean;
        'post-merge': boolean;
        'spec-check': HookCheckPolicy;
        'change-check'?: HookCheckPolicy;
        'index-check'?: HookCheckPolicy;
    };
    index: {
        include?: string[];
        exclude?: string[];
    };
    workflow?: {
        core_required: string[];
        optional_steps: Record<string, {
            enabled: boolean;
            when: string[];
        }>;
        archive_gate: {
            require_verification: boolean;
            require_skill_update: boolean;
            require_index_regenerated: boolean;
            require_optional_steps_passed: boolean;
        };
        feature_flags: {
            supported: string[];
        };
    };
    runner?: RunnerConfig;
}
export interface FeatureState {
    version: string;
    feature: string;
    mode: ProjectMode;
    workflow_profile_id?: string;
    status: FeatureStatus;
    current_step: string;
    affects: string[];
    completed: string[];
    pending: string[];
    blocked_by: string[];
    queued_at?: string;
    activated_at?: string | null;
    source?: 'manual' | 'queue' | 'runner';
    last_updated: string;
}
export interface ProposalFrontmatter {
    name: string;
    status: 'active' | 'queued' | 'archived';
    created: string;
    affects: string[];
    flags: string[];
}
export interface SkillFrontmatter {
    name: string;
    title?: string;
    tags: string[];
}
export interface SkillSection {
    level: number;
    title: string;
    start: number;
    end: number;
    tags?: string[];
}
export interface IndexModule {
    file: string;
    title: string;
    tags: string[];
    sections: Record<string, SkillSection>;
}
export interface SkillIndex {
    version: string;
    generated: string;
    git_commit: string | null;
    active_changes: string[];
    stats: {
        totalFiles: number;
        totalModules: number;
        totalSections: number;
    };
    modules: Record<string, IndexModule>;
    tagIndex: Record<string, string[]>;
}
export interface CommandResult {
    success: boolean;
    message: string;
    data?: unknown;
    error?: string;
}
export type ProjectStructureLevel = 'none' | 'basic' | 'full';
export interface ProjectStructureCheck {
    key: string;
    path: string;
    exists: boolean;
    required: boolean;
    category: 'core' | 'knowledge';
}
export interface ProjectStructureUpgradeSuggestion {
    code: string;
    title: string;
    description: string;
    paths: string[];
}
export interface ProjectStructureStatus {
    initialized: boolean;
    level: ProjectStructureLevel;
    checks: ProjectStructureCheck[];
    missingRequired: string[];
    missingRecommended: string[];
    upgradeSuggestions: ProjectStructureUpgradeSuggestion[];
}
export interface ProjectSummary {
    name: string;
    path: string;
    mode: ProjectMode | null;
    initialized: boolean;
    structureLevel: ProjectStructureLevel;
    createdAt: string | null;
    activeChangeCount: number;
    docsRootExists: boolean;
    forAiExists: boolean;
    skillIndexExists: boolean;
}
export interface ProjectDocumentStatusItem {
    key: string;
    path: string;
    exists: boolean;
    required: boolean;
    updatedAt: string | null;
}
export interface DocsStatus {
    total: number;
    existing: number;
    coverage: number;
    items: ProjectDocumentStatusItem[];
    apiDocs: ApiDocInfo[];
    designDocs: KnowledgeDocInfo[];
    planningDocs: KnowledgeDocInfo[];
    missingRequired: string[];
    missingRecommended: string[];
    updatedAt: string | null;
}
export interface SkillFileInfo {
    key: string;
    path: string;
    exists: boolean;
    title: string | null;
    tags: string[];
    sectionCount: number;
    sectionTitles: string[];
}
export interface ModuleInfo {
    name: string;
    path: string;
    skillPath: string;
    skillExists: boolean;
}
export interface ApiDocInfo {
    name: string;
    path: string;
    exists: boolean;
    updatedAt: string | null;
}
export interface KnowledgeDocInfo {
    name: string;
    path: string;
    exists: boolean;
    updatedAt: string | null;
}
export interface SkillsStatus {
    totalSkillFiles: number;
    existing: number;
    missingRecommended: string[];
    rootSkills: SkillFileInfo[];
    moduleSkills: SkillFileInfo[];
    modules: ModuleInfo[];
    skillIndex: {
        exists: boolean;
        path: string;
        updatedAt: string | null;
        latestSourceUpdatedAt: string | null;
        needsRebuild: boolean;
        stale: boolean;
        reasons: string[];
        stats: SkillIndex['stats'] | null;
    };
}
export interface ExecutionFeatureSummary {
    name: string;
    status: FeatureState['status'];
    progress: number;
    currentStep: string;
    flags: string[];
    activatedSteps: string[];
    description: string;
}
export interface ExecutionStatus {
    totalActiveChanges: number;
    totalQueuedChanges: number;
    byStatus: Record<string, number>;
    activeChanges: ExecutionFeatureSummary[];
    queuedChanges: QueuedChangeSummary[];
}
export interface ChangeStatusCheck {
    name: string;
    status: ChangeSummaryStatus;
    message: string;
}
export interface ActiveChangeStatusItem extends ExecutionFeatureSummary {
    path: string;
    activatedSteps: string[];
    summaryStatus: ChangeSummaryStatus;
    failCount: number;
    warnCount: number;
    archiveReady: boolean;
    checks: ChangeStatusCheck[];
}
export interface ActiveChangeStatusReport {
    totalActiveChanges: number;
    totals: Record<ChangeSummaryStatus, number>;
    changes: ActiveChangeStatusItem[];
}
export interface QueuedChangeSummary {
    name: string;
    path: string;
    status: FeatureState['status'];
    currentStep: string;
    queuedAt: string | null;
    activatedAt: string | null;
    source: FeatureState['source'] | null;
}
export interface QueueRunChangeRecord {
    name: string;
    path: string;
    status: FeatureState['status'] | 'archived';
    recordedAt: string;
    note?: string;
}
export type ExecutorJobStatus = 'queued' | 'dispatching' | 'running' | 'waiting_for_manual' | 'completed' | 'failed' | 'cancelled';
export interface ExecutorJobSummary {
    id: string;
    executor: QueueRunExecutor;
    status: ExecutorJobStatus;
    changeName: string;
    changePath: string;
    startedAt: string;
    updatedAt: string;
    completedAt: string | null;
    note: string | null;
    promptPath: string | null;
    outputPath: string | null;
}
export interface ExecutorJob extends ExecutorJobSummary {
    runId: string;
    projectPath: string;
    profileId: string;
    promptPath: string | null;
    outputPath: string | null;
    dispatchedAt: string | null;
    lastPolledAt: string | null;
    lastError: string | null;
}
export interface QueueRun {
    id: string;
    status: QueueRunStatus;
    executor: QueueRunExecutor;
    profileId: string;
    mode: 'single-active-sequential';
    projectPath: string;
    startedAt: string;
    updatedAt: string;
    stoppedAt: string | null;
    completedAt: string | null;
    currentChange: string | null;
    currentChangePath: string | null;
    currentJobId: string | null;
    currentJob: ExecutorJobSummary | null;
    completedChanges: QueueRunChangeRecord[];
    remainingChanges: string[];
    failedChange: QueueRunChangeRecord | null;
    logPath: string;
    lastInstruction: string | null;
}
export interface QueueRunStatusReport {
    currentRun: QueueRun | null;
    stage: string | null;
    activeChange: {
        name: string;
        path: string;
        status: FeatureState['status'];
    } | null;
    queuedChanges: QueuedChangeSummary[];
    logTail: string[];
    nextInstruction: string | null;
}
export type WorkflowStep = 'proposal_complete' | 'tasks_complete' | 'implementation_complete' | 'skill_updated' | 'index_regenerated' | 'tests_passed' | 'verification_passed' | 'archived';
//# sourceMappingURL=types.d.ts.map