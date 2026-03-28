"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RUNNER_PROFILE_ID = exports.DEFAULT_RUNNER_EXECUTOR = exports.BUILTIN_RUNNER_PROFILES = exports.VALID_RUNNER_EXECUTORS = void 0;
exports.normalizeRunnerProfileConfig = normalizeRunnerProfileConfig;
exports.normalizeRunnerConfig = normalizeRunnerConfig;
exports.validateRunnerConfig = validateRunnerConfig;
exports.getRunnerProfileRuntimeSupport = getRunnerProfileRuntimeSupport;
exports.VALID_RUNNER_EXECUTORS = [
    'manual-bridge',
    'codex',
    'claude-code',
];
exports.BUILTIN_RUNNER_PROFILES = {
    'manual-safe': {
        auto_activate_next: true,
        auto_verify: false,
        auto_finalize: false,
        auto_archive: false,
        auto_commit: false,
        stop_on_warn: false,
        stop_on_fail: true,
    },
    'archive-chain': {
        auto_activate_next: true,
        auto_verify: true,
        auto_finalize: true,
        auto_archive: true,
        auto_commit: false,
        stop_on_warn: false,
        stop_on_fail: true,
    },
    'full-auto-draft': {
        auto_activate_next: true,
        auto_verify: true,
        auto_finalize: true,
        auto_archive: true,
        auto_commit: false,
        stop_on_warn: false,
        stop_on_fail: true,
    },
};
exports.DEFAULT_RUNNER_EXECUTOR = 'manual-bridge';
exports.DEFAULT_RUNNER_PROFILE_ID = 'manual-safe';
function normalizeRunnerProfileConfig(config) {
    return {
        auto_activate_next: config?.auto_activate_next !== false,
        auto_verify: config?.auto_verify === true,
        auto_finalize: config?.auto_finalize === true,
        auto_archive: config?.auto_archive === true,
        auto_commit: config?.auto_commit === true,
        stop_on_warn: config?.stop_on_warn === true,
        stop_on_fail: config?.stop_on_fail !== false,
    };
}
function normalizeRunnerConfig(config) {
    const userProfiles = config?.profiles ?? {};
    const mergedProfiles = Object.fromEntries(Object.entries({
        ...exports.BUILTIN_RUNNER_PROFILES,
        ...userProfiles,
    }).map(([profileId, profileConfig]) => [profileId, normalizeRunnerProfileConfig(profileConfig)]));
    return {
        default_executor: exports.VALID_RUNNER_EXECUTORS.includes(config?.default_executor)
            ? config?.default_executor
            : exports.DEFAULT_RUNNER_EXECUTOR,
        default_profile: typeof config?.default_profile === 'string' && config.default_profile.trim()
            ? config.default_profile.trim()
            : exports.DEFAULT_RUNNER_PROFILE_ID,
        auto_start: config?.auto_start === true,
        profiles: mergedProfiles,
    };
}
function validateRunnerConfig(config) {
    const errors = [];
    if (config.auto_start === true) {
        errors.push('runner.auto_start=true is not supported. Dorado automation must be started explicitly with "dorado run start".');
    }
    if (!exports.VALID_RUNNER_EXECUTORS.includes(config.default_executor)) {
        errors.push(`Unsupported runner.default_executor: ${config.default_executor}`);
    }
    if (!config.profiles[config.default_profile]) {
        errors.push(`runner.default_profile "${config.default_profile}" does not exist in runner.profiles.`);
    }
    return errors;
}
function getRunnerProfileRuntimeSupport(executor, profileId, profile) {
    if (profile.auto_commit) {
        return {
            supported: false,
            reason: `Profile "${profileId}" enables auto_commit, which is not supported.`,
        };
    }
    if (executor === 'manual-bridge') {
        if (profileId === 'full-auto-draft') {
            return {
                supported: false,
                reason: 'Profile "full-auto-draft" remains planned only. The current runtime supports ' +
                    'manual-safe and archive-chain style manual-bridge orchestration.',
            };
        }
    }
    if (executor === 'codex' || executor === 'claude-code') {
        if (profileId === 'full-auto-draft') {
            return {
                supported: false,
                reason: `Profile "${profileId}" remains planned only. ` +
                    `The current ${executor} runtime is experimental and supports explicit manual-safe or archive-chain stepping only.`,
            };
        }
        return {
            supported: true,
            reason: `Executor "${executor}" is experimentally wired through the local CLI. ` +
                'It still requires explicit "dorado run start" / "dorado run step" control.',
        };
    }
    return {
        supported: true,
        reason: null,
    };
}
//# sourceMappingURL=runnerConfig.js.map