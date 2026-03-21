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
            return await this.fileService.readJSON(configPath);
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
        return {
            version: '3.0',
            mode,
            hooks: {
                'pre-commit': true,
                'post-merge': true,
                'spec-check': mode === 'full' ? 'error' : mode === 'lite' ? 'off' : 'warn',
            },
            index: {
                exclude: ['node_modules/**', 'dist/**', '*.test.*'],
            },
            workflow,
        };
    }
}
exports.ConfigManager = ConfigManager;
function createConfigManager(fileService) {
    return new ConfigManager(fileService);
}
//# sourceMappingURL=ConfigManager.js.map