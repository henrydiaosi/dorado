export type ProjectMode = 'lite' | 'standard' | 'full';
export type FeatureStatus = 'draft' | 'proposed' | 'planned' | 'implementing' | 'verifying' | 'ready_to_archive' | 'archived';
export interface SkillrcConfig {
    version: string;
    mode: ProjectMode;
    hooks: {
        'pre-commit': boolean;
        'post-merge': boolean;
        'spec-check': 'off' | 'warn' | 'error';
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
    last_updated: string;
}
export interface ProposalFrontmatter {
    name: string;
    status: 'active' | 'archived';
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
    description: string;
}
export interface ExecutionStatus {
    totalActiveChanges: number;
    byStatus: Record<string, number>;
    activeChanges: ExecutionFeatureSummary[];
}
export type WorkflowStep = 'proposal_complete' | 'tasks_complete' | 'implementation_complete' | 'skill_updated' | 'index_regenerated' | 'tests_passed' | 'verification_passed' | 'archived';
//# sourceMappingURL=types.d.ts.map