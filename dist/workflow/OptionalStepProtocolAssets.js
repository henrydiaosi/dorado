"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTIONAL_STEP_PROTOCOL_ASSETS = void 0;
exports.getOptionalStepProtocolAsset = getOptionalStepProtocolAsset;
exports.getOptionalStepProtocolAssets = getOptionalStepProtocolAssets;
exports.OPTIONAL_STEP_PROTOCOL_ASSETS = {
    code_review: {
        step: 'code_review',
        fileName: 'review.md',
        title: 'Code Review',
        summary: 'Implementation review, findings, and ship decision.',
    },
    design_doc: {
        step: 'design_doc',
        fileName: 'design.md',
        title: 'Design Doc',
        summary: 'Design decisions, tradeoffs, and module impact.',
    },
    plan_doc: {
        step: 'plan_doc',
        fileName: 'plan.md',
        title: 'Plan Doc',
        summary: 'Execution plan, milestones, and fallback path.',
    },
    security_review: {
        step: 'security_review',
        fileName: 'security.md',
        title: 'Security Review',
        summary: 'Threat review, controls, and residual risks.',
    },
    adr: {
        step: 'adr',
        fileName: 'adr.md',
        title: 'Architecture Decision Record',
        summary: 'Architecture decision, alternatives, and consequences.',
    },
    db_change_doc: {
        step: 'db_change_doc',
        fileName: 'db-change.md',
        title: 'Database Change',
        summary: 'Schema/data migration plan and rollback notes.',
    },
    api_change_doc: {
        step: 'api_change_doc',
        fileName: 'api-change.md',
        title: 'API Change',
        summary: 'Contract changes, compatibility, and verification notes.',
    },
};
function getOptionalStepProtocolAsset(step) {
    return exports.OPTIONAL_STEP_PROTOCOL_ASSETS[step];
}
function getOptionalStepProtocolAssets(steps) {
    return steps.map(step => getOptionalStepProtocolAsset(step));
}
//# sourceMappingURL=OptionalStepProtocolAssets.js.map