import { ProjectMode } from '../core/types';
export type WorkflowProfileId = 'minimal-change' | 'standard-change' | 'architecture-change' | 'public-api-change' | 'security-change';
export type WorkflowProfileResolutionSource = 'explicit' | 'flag-inference' | 'legacy-file-set' | 'mode-default';
export interface WorkflowProfileDefinition {
    label: string;
    description: string;
    minimumProtocolFiles: string[];
    optionalSteps: string[];
    archiveFocus: string[];
    recommendedModes: ProjectMode[];
}
export declare const WORKFLOW_PROFILE_CATALOG: Record<WorkflowProfileId, WorkflowProfileDefinition>;
interface ResolveWorkflowProfileIdForChangeInput {
    mode: ProjectMode;
    explicitProfileId?: string | null;
    flags?: string[];
    hasProposal?: boolean;
    hasTasks?: boolean;
    hasVerification?: boolean;
    hasReview?: boolean;
}
export declare function isWorkflowProfileId(value: string | undefined | null): value is WorkflowProfileId;
export declare function getModeDefaultWorkflowProfileId(mode: ProjectMode): WorkflowProfileId;
export declare function inferWorkflowProfileIdFromFlags(flags: string[]): WorkflowProfileId | null;
export declare function resolveWorkflowProfileIdForChange(input: ResolveWorkflowProfileIdForChangeInput): {
    id: WorkflowProfileId;
    source: WorkflowProfileResolutionSource;
};
export {};
//# sourceMappingURL=WorkflowProfiles.d.ts.map