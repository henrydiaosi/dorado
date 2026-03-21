"use strict";
/**
 * 错误类定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationError = exports.WorkflowError = exports.ConfigError = exports.FileOperationError = exports.ValidationError = exports.InvalidStateTransitionError = exports.FeatureAlreadyExistsError = exports.FeatureNotFoundError = exports.ProjectNotInitializedError = exports.DoradoError = void 0;
class DoradoError extends Error {
    constructor(message, code = 'DORADO_ERROR', details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'DoradoError';
    }
}
exports.DoradoError = DoradoError;
class ProjectNotInitializedError extends DoradoError {
    constructor(message = 'Project not initialized. Run `dorado project init` first.') {
        super(message, 'PROJECT_NOT_INITIALIZED');
    }
}
exports.ProjectNotInitializedError = ProjectNotInitializedError;
class FeatureNotFoundError extends DoradoError {
    constructor(featureName) {
        super(`Feature '${featureName}' not found.`, 'FEATURE_NOT_FOUND', { featureName });
    }
}
exports.FeatureNotFoundError = FeatureNotFoundError;
class FeatureAlreadyExistsError extends DoradoError {
    constructor(featureName) {
        super(`Feature '${featureName}' already exists.`, 'FEATURE_ALREADY_EXISTS', {
            featureName,
        });
    }
}
exports.FeatureAlreadyExistsError = FeatureAlreadyExistsError;
class InvalidStateTransitionError extends DoradoError {
    constructor(currentStatus, targetStatus) {
        super(`Cannot transition from '${currentStatus}' to '${targetStatus}'.`, 'INVALID_STATE_TRANSITION', { currentStatus, targetStatus });
    }
}
exports.InvalidStateTransitionError = InvalidStateTransitionError;
class ValidationError extends DoradoError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details);
    }
}
exports.ValidationError = ValidationError;
class FileOperationError extends DoradoError {
    constructor(message, details) {
        super(message, 'FILE_OPERATION_ERROR', details);
    }
}
exports.FileOperationError = FileOperationError;
class ConfigError extends DoradoError {
    constructor(message, details) {
        super(message, 'CONFIG_ERROR', details);
    }
}
exports.ConfigError = ConfigError;
class WorkflowError extends DoradoError {
    constructor(message, details) {
        super(message, 'WORKFLOW_ERROR', details);
    }
}
exports.WorkflowError = WorkflowError;
class VerificationError extends DoradoError {
    constructor(message, details) {
        super(message, 'VERIFICATION_ERROR', details);
    }
}
exports.VerificationError = VerificationError;
//# sourceMappingURL=errors.js.map