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
exports.InitCommand = void 0;
const path = __importStar(require("path"));
const services_1 = require("../services");
const BaseCommand_1 = require("./BaseCommand");
class InitCommand extends BaseCommand_1.BaseCommand {
    async execute(rootDir) {
        try {
            const targetDir = rootDir || process.cwd();
            this.logger.info(`Initializing Dorado project at ${targetDir}`);
            const structure = await services_1.services.projectService.detectProjectStructure(targetDir);
            if (structure.initialized && structure.level === 'full') {
                this.warn('Project already initialized');
                return;
            }
            const config = await services_1.services.configManager.createDefaultConfig('standard');
            await services_1.services.projectService.initializeProject(targetDir, config.mode);
            this.success(`${structure.initialized ? 'Project knowledge skeleton completed' : 'Project initialized'} at ${targetDir}`);
            this.info(`  Created project knowledge skeleton for ${path.basename(targetDir)}`);
            this.info('  Added root/docs/src/tests SKILL files, project docs, for-ai guides, and SKILL.index.json');
        }
        catch (error) {
            this.error(`Failed to initialize project: ${error}`);
            throw error;
        }
    }
}
exports.InitCommand = InitCommand;
//# sourceMappingURL=InitCommand.js.map