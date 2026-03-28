"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKFLOW_PROFILE_CATALOG = void 0;
exports.isWorkflowProfileId = isWorkflowProfileId;
exports.getModeDefaultWorkflowProfileId = getModeDefaultWorkflowProfileId;
exports.inferWorkflowProfileIdFromFlags = inferWorkflowProfileIdFromFlags;
exports.resolveWorkflowProfileIdForChange = resolveWorkflowProfileIdForChange;
exports.WORKFLOW_PROFILE_CATALOG = {
    'minimal-change': {
        label: 'Minimal Change',
        description: 'A lightweight protocol for small, low-risk changes.',
        minimumProtocolFiles: ['state.json', 'tasks.md', 'verification.md'],
        optionalSteps: ['code_review'],
        archiveFocus: ['verification', 'tasks completeness'],
        recommendedModes: ['lite'],
    },
    'standard-change': {
        label: 'Standard Change',
        description: 'The balanced default profile for most day-to-day changes.',
        minimumProtocolFiles: ['state.json', 'proposal.md', 'tasks.md', 'verification.md', 'review.md'],
        optionalSteps: ['code_review', 'design_doc', 'plan_doc', 'security_review', 'api_change_doc'],
        archiveFocus: ['verification', 'skill update', 'index regeneration'],
        recommendedModes: ['standard', 'full'],
    },
    'architecture-change': {
        label: 'Architecture Change',
        description: 'A heavier profile for architectural refactors and important decisions.',
        minimumProtocolFiles: ['state.json', 'proposal.md', 'tasks.md', 'verification.md', 'review.md'],
        optionalSteps: ['design_doc', 'adr', 'db_change_doc', 'code_review'],
        archiveFocus: ['design decisions', 'ADR alignment', 'verification'],
        recommendedModes: ['full'],
    },
    'public-api-change': {
        label: 'Public API Change',
        description: 'A profile for externally visible API or contract changes.',
        minimumProtocolFiles: ['state.json', 'proposal.md', 'tasks.md', 'verification.md', 'review.md'],
        optionalSteps: ['api_change_doc', 'code_review', 'security_review'],
        archiveFocus: ['API contract verification', 'compatibility notes'],
        recommendedModes: ['standard', 'full'],
    },
    'security-change': {
        label: 'Security Change',
        description: 'A profile for auth, permission, or security-sensitive work.',
        minimumProtocolFiles: ['state.json', 'proposal.md', 'tasks.md', 'verification.md', 'review.md'],
        optionalSteps: ['security_review', 'code_review'],
        archiveFocus: ['security review', 'verification evidence'],
        recommendedModes: ['standard', 'full'],
    },
};
function isWorkflowProfileId(value) {
    return Boolean(value && value in exports.WORKFLOW_PROFILE_CATALOG);
}
function getModeDefaultWorkflowProfileId(mode) {
    switch (mode) {
        case 'lite':
            return 'minimal-change';
        case 'standard':
        case 'full':
        default:
            return 'standard-change';
    }
}
function inferWorkflowProfileIdFromFlags(flags) {
    const set = new Set(flags);
    if (set.has('security_related') || set.has('auth') || set.has('payment')) {
        return 'security-change';
    }
    if (set.has('public_api_change')) {
        return 'public-api-change';
    }
    if (set.has('architecture_change') ||
        set.has('important_decision') ||
        set.has('db_schema_change')) {
        return 'architecture-change';
    }
    return null;
}
function resolveWorkflowProfileIdForChange(input) {
    if (isWorkflowProfileId(input.explicitProfileId)) {
        return {
            id: input.explicitProfileId,
            source: 'explicit',
        };
    }
    const flags = input.flags ?? [];
    const inferredByFlags = inferWorkflowProfileIdFromFlags(flags);
    if (inferredByFlags) {
        return {
            id: inferredByFlags,
            source: 'flag-inference',
        };
    }
    if (input.hasTasks && input.hasVerification && !input.hasProposal && !input.hasReview) {
        return {
            id: 'minimal-change',
            source: 'legacy-file-set',
        };
    }
    if (input.hasProposal && input.hasTasks && input.hasVerification && input.hasReview) {
        return {
            id: 'standard-change',
            source: 'legacy-file-set',
        };
    }
    return {
        id: getModeDefaultWorkflowProfileId(input.mode),
        source: 'mode-default',
    };
}
//# sourceMappingURL=WorkflowProfiles.js.map