import { FeatureState, FeatureStatus, ProjectMode } from '../core/types';
import { WorkflowProfileId } from '../workflow/WorkflowProfiles';
import { FileService } from './FileService';
export declare class StateManager {
    private fileService;
    constructor(fileService: FileService);
    readState(featurePath: string): Promise<FeatureState>;
    writeState(featurePath: string, state: FeatureState): Promise<void>;
    validateTransition(currentStatus: FeatureStatus, targetStatus: FeatureStatus): boolean;
    transitionStatus(featurePath: string, targetStatus: FeatureStatus): Promise<void>;
    createInitialState(feature: string, affects: string[], mode?: ProjectMode, workflowProfileId?: WorkflowProfileId, options?: {
        queued?: boolean;
        source?: FeatureState['source'];
    }): FeatureState;
}
export declare function createStateManager(fileService: FileService): StateManager;
//# sourceMappingURL=StateManager.d.ts.map