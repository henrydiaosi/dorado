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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyCommand = void 0;
const path = __importStar(require("path"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const constants_1 = require("../core/constants");
const services_1 = require("../services");
const ConfigurableWorkflow_1 = require("../workflow/ConfigurableWorkflow");
const BaseCommand_1 = require("./BaseCommand");
class VerifyCommand extends BaseCommand_1.BaseCommand {
    async execute(featurePath) {
        try {
            const targetPath = featurePath || process.cwd();
            this.logger.info(`Verifying change at ${targetPath}`);
            const statePath = path.join(targetPath, constants_1.FILE_NAMES.STATE);
            const proposalPath = path.join(targetPath, constants_1.FILE_NAMES.PROPOSAL);
            const tasksPath = path.join(targetPath, constants_1.FILE_NAMES.TASKS);
            const verificationPath = path.join(targetPath, constants_1.FILE_NAMES.VERIFICATION);
            const [stateExists, proposalExists, tasksExists, verificationExists] = await Promise.all([
                services_1.services.fileService.exists(statePath),
                services_1.services.fileService.exists(proposalPath),
                services_1.services.fileService.exists(tasksPath),
                services_1.services.fileService.exists(verificationPath),
            ]);
            if (!stateExists) {
                throw new Error('Change state file not found. Expected changes/active/<change>/state.json');
            }
            const featureState = await services_1.services.fileService.readJSON(statePath);
            const projectRoot = path.resolve(targetPath, '..', '..', '..');
            const config = await services_1.services.configManager.loadConfig(projectRoot);
            const workflow = new ConfigurableWorkflow_1.ConfigurableWorkflow(config.mode);
            const checks = [
                {
                    name: 'proposal.md',
                    status: proposalExists ? 'pass' : 'fail',
                    message: proposalExists ? 'Proposal file exists' : 'proposal.md is missing',
                },
                {
                    name: 'tasks.md',
                    status: tasksExists ? 'pass' : 'fail',
                    message: tasksExists ? 'Tasks file exists' : 'tasks.md is missing',
                },
                {
                    name: 'verification.md',
                    status: verificationExists ? 'pass' : 'fail',
                    message: verificationExists
                        ? 'Verification file exists'
                        : 'verification.md is missing',
                },
            ];
            let activatedSteps = [];
            if (proposalExists) {
                const proposal = (0, gray_matter_1.default)(await services_1.services.fileService.readFile(proposalPath));
                const flags = Array.isArray(proposal.data.flags) ? proposal.data.flags : [];
                activatedSteps = workflow.getActivatedSteps(flags);
                checks.push({
                    name: 'proposal.flags',
                    status: 'pass',
                    message: activatedSteps.length > 0
                        ? `Activated optional steps: ${activatedSteps.join(', ')}`
                        : 'No optional steps activated',
                });
            }
            if (tasksExists) {
                const tasksContent = await services_1.services.fileService.readFile(tasksPath);
                const tasks = (0, gray_matter_1.default)(tasksContent);
                const optionalSteps = Array.isArray(tasks.data.optional_steps)
                    ? tasks.data.optional_steps
                    : [];
                const missing = activatedSteps.filter(step => !optionalSteps.includes(step));
                checks.push({
                    name: 'tasks.optional_steps',
                    status: missing.length === 0 ? 'pass' : 'fail',
                    message: missing.length === 0
                        ? 'All activated optional steps are present in tasks.md'
                        : `Missing optional steps in tasks.md: ${missing.join(', ')}`,
                });
                checks.push({
                    name: 'tasks checklist',
                    status: /- \[ \]/.test(tasksContent) ? 'warn' : 'pass',
                    message: /- \[ \]/.test(tasksContent)
                        ? 'tasks.md still has unchecked items'
                        : 'tasks.md checklist is complete',
                });
            }
            if (verificationExists) {
                const verificationContent = await services_1.services.fileService.readFile(verificationPath);
                const verification = (0, gray_matter_1.default)(verificationContent);
                const optionalSteps = Array.isArray(verification.data.optional_steps)
                    ? verification.data.optional_steps
                    : [];
                const missing = activatedSteps.filter(step => !optionalSteps.includes(step));
                checks.push({
                    name: 'verification.optional_steps',
                    status: missing.length === 0 ? 'pass' : 'fail',
                    message: missing.length === 0
                        ? 'All activated optional steps are present in verification.md'
                        : `Missing optional steps in verification.md: ${missing.join(', ')}`,
                });
                checks.push({
                    name: 'verification checklist',
                    status: /- \[ \]/.test(verificationContent) ? 'warn' : 'pass',
                    message: /- \[ \]/.test(verificationContent)
                        ? 'verification.md still has unchecked items'
                        : 'verification.md checklist is complete',
                });
            }
            checks.push({
                name: 'state.json',
                status: 'pass',
                message: `Status is ${featureState.status}, current step is ${featureState.current_step}`,
            });
            const failCount = checks.filter(check => check.status === 'fail').length;
            const warnCount = checks.filter(check => check.status === 'warn').length;
            const passed = failCount === 0;
            const summary = failCount > 0
                ? `${failCount} verification(s) failed`
                : warnCount > 0
                    ? `${warnCount} warning(s) found`
                    : 'All verifications passed';
            console.log('\nChange Verification Results:');
            console.log('====================\n');
            for (const check of checks) {
                const icon = check.status === 'pass' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL';
                console.log(`${icon} ${check.name}: ${check.message}`);
            }
            console.log('\n' + '='.repeat(24));
            console.log(`Summary: ${summary}`);
            console.log('='.repeat(24) + '\n');
            if (passed) {
                this.success('All verifications passed');
            }
            else {
                this.warn('Some verifications failed');
                process.exit(1);
            }
        }
        catch (error) {
            this.error(`Verification failed: ${error}`);
            throw error;
        }
    }
}
exports.VerifyCommand = VerifyCommand;
//# sourceMappingURL=VerifyCommand.js.map