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
exports.FinalizeCommand = void 0;
const path = __importStar(require("path"));
const services_1 = require("../services");
const BaseCommand_1 = require("./BaseCommand");
class FinalizeCommand extends BaseCommand_1.BaseCommand {
    async execute(featurePath, options = {}) {
        const targetPath = path.resolve(featurePath || process.cwd());
        const projectRoot = path.resolve(targetPath, '..', '..', '..');
        try {
            this.logger.info(`Finalizing change at ${targetPath}`);
            const preflight = await services_1.services.projectService.getActiveChangeStatusItem(targetPath);
            this.printPreflight(preflight);
            const { archivePath } = await services_1.services.projectService.finalizeChange(targetPath);
            let activatedNextMessage = '';
            if (options.activateNext === true) {
                const activatedNext = await services_1.services.projectService.activateNextQueuedChange(projectRoot, 'queue');
                activatedNextMessage = activatedNext
                    ? ` Next queued change activated: ${activatedNext.name}.`
                    : ' No queued change was waiting for activation.';
            }
            this.success(`Finalize completed: verification passed and change archived to ${archivePath}`);
            if (activatedNextMessage) {
                this.success(activatedNextMessage.trim());
            }
        }
        catch (error) {
            this.error(`Finalize failed: ${error}`);
            throw error;
        }
    }
    printPreflight(change) {
        console.log('\nFinalize Preflight');
        console.log('=================\n');
        console.log(`Change: ${change.name}`);
        console.log(`Path: ${change.path}`);
        console.log(`Status: ${change.status}`);
        console.log(`Progress: ${change.progress}%\n`);
        for (const check of change.checks) {
            const icon = check.status === 'pass' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL';
            console.log(`${icon} ${check.name}: ${check.message}`);
        }
        console.log(`\nArchive ready now: ${change.archiveReady ? 'yes' : 'no'}`);
        console.log('');
    }
}
exports.FinalizeCommand = FinalizeCommand;
//# sourceMappingURL=FinalizeCommand.js.map