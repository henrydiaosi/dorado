"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
exports.createConfigManager = createConfigManager;
const path = __importStar(require("path"));
const constants_1 = require("../core/constants");
const errors_1 = require("../core/errors");
const ConfigurableWorkflow_1 = require("../workflow/ConfigurableWorkflow");
class ConfigManager {
    constructor(fileService) {
        this.fileService = fileService;
    }
    async loadConfig(rootDir) {
        const configPath = path.join(rootDir, constants_1.FILE_NAMES.SKILLRC);
        try {
            return this.normalizeConfig(await this.fileService.readJSON(configPath));
        }
        catch {
            throw new errors_1.ProjectNotInitializedError(`Cannot load .skillrc from ${rootDir}`);
        }
    }
    async saveConfig(rootDir, config) {
        const configPath = path.join(rootDir, constants_1.FILE_NAMES.SKILLRC);
        await this.fileService.writeJSON(configPath, config);
    }
    async getMode(rootDir) {
        const config = await this.loadConfig(rootDir);
        return config.mode;
    }
    async isInitialized(rootDir) {
        const configPath = path.join(rootDir, constants_1.FILE_NAMES.SKILLRC);
        return this.fileService.exists(configPath);
    }
    async createDefaultConfig(mode = 'standard') {
        const workflow = ConfigurableWorkflow_1.WORKFLOW_PRESETS[mode];
        const defaultPolicy = mode === 'lite' ? 'off' : 'error';
        return {
            version: '4.0',
            mode,
            hooks: {
                'pre-commit': true,
                'post-merge': true,
                'spec-check': defaultPolicy,
                'change-check': defaultPolicy,
                'index-check': defaultPolicy,
            },
            index: {
                exclude: ['node_modules/**', 'dist/**', '*.test.*'],
            },
            workflow,
        };
    }
    normalizeConfig(config) {
        const hooks = config.hooks || {
            'pre-commit': true,
            'post-merge': true,
            'spec-check': 'error',
        };
        const fallbackPolicy = hooks['spec-check'] ?? 'error';
        const normalizedHooks = {
            'pre-commit': hooks['pre-commit'] !== false,
            'post-merge': hooks['post-merge'] !== false,
            'spec-check': fallbackPolicy,
            'change-check': hooks['change-check'] ?? fallbackPolicy,
            'index-check': hooks['index-check'] ?? fallbackPolicy,
        };
        const legacyWarnDefaults = config.version === '3.0' &&
            config.mode !== 'lite' &&
            normalizedHooks['pre-commit'] &&
            normalizedHooks['post-merge'] &&
            normalizedHooks['spec-check'] === 'warn' &&
            normalizedHooks['change-check'] === 'warn' &&
            normalizedHooks['index-check'] === 'warn';
        return {
            ...config,
            version: config.version === '3.0' ? '4.0' : config.version,
            hooks: {
                ...normalizedHooks,
                ...(legacyWarnDefaults
                    ? {
                        'spec-check': 'error',
                        'change-check': 'error',
                        'index-check': 'error',
                    }
                    : {}),
            },
        };
    }
}
exports.ConfigManager = ConfigManager;
function createConfigManager(fileService) {
    return new ConfigManager(fileService);
}
//# sourceMappingURL=ConfigManager.js.map