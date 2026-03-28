import { OptionalStep } from './ConfigurableWorkflow';
export interface OptionalStepProtocolAsset {
    step: OptionalStep;
    fileName: string;
    title: string;
    summary: string;
}
export declare const OPTIONAL_STEP_PROTOCOL_ASSETS: Record<OptionalStep, OptionalStepProtocolAsset>;
export declare function getOptionalStepProtocolAsset(step: OptionalStep): OptionalStepProtocolAsset;
export declare function getOptionalStepProtocolAssets(steps: OptionalStep[]): OptionalStepProtocolAsset[];
//# sourceMappingURL=OptionalStepProtocolAssets.d.ts.map