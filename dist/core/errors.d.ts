/**
 * 错误类定义
 */
export declare class DoradoError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code?: string, details?: any | undefined);
}
export declare class ProjectNotInitializedError extends DoradoError {
    constructor(message?: string);
}
export declare class FeatureNotFoundError extends DoradoError {
    constructor(featureName: string);
}
export declare class FeatureAlreadyExistsError extends DoradoError {
    constructor(featureName: string);
}
export declare class InvalidStateTransitionError extends DoradoError {
    constructor(currentStatus: string, targetStatus: string);
}
export declare class ValidationError extends DoradoError {
    constructor(message: string, details?: any);
}
export declare class FileOperationError extends DoradoError {
    constructor(message: string, details?: any);
}
export declare class ConfigError extends DoradoError {
    constructor(message: string, details?: any);
}
export declare class WorkflowError extends DoradoError {
    constructor(message: string, details?: any);
}
export declare class VerificationError extends DoradoError {
    constructor(message: string, details?: any);
}
//# sourceMappingURL=errors.d.ts.map