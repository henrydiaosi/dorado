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
exports.ArchiveCommand = void 0;
const path = __importStar(require("path"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const constants_1 = require("../core/constants");
const services_1 = require("../services");
const ArchiveGate_1 = require("../workflow/ArchiveGate");
const ConfigurableWorkflow_1 = require("../workflow/ConfigurableWorkflow");
const BaseCommand_1 = require("./BaseCommand");
class ArchiveCommand extends BaseCommand_1.BaseCommand {
    async execute(featurePath) {
        try {
            const targetPath = featurePath || process.cwd();
            this.logger.info(`Checking archive readiness for change at ${targetPath}`);
            const statePath = path.join(targetPath, constants_1.FILE_NAMES.STATE);
            const proposalPath = path.join(targetPath, constants_1.FILE_NAMES.PROPOSAL);
            const tasksPath = path.join(targetPath, constants_1.FILE_NAMES.TASKS);
            const verificationPath = path.join(targetPath, constants_1.FILE_NAMES.VERIFICATION);
            if (!(await services_1.services.fileService.exists(statePath))) {
                throw new Error('Change state file not found.');
            }
            const featureState = await services_1.services.fileService.readJSON(statePath);
            const projectRoot = path.resolve(targetPath, '..', '..', '..');
            const config = await services_1.services.configManager.loadConfig(projectRoot);
            const workflow = new ConfigurableWorkflow_1.ConfigurableWorkflow(config.mode);
            const proposal = (0, gray_matter_1.default)(await services_1.services.fileService.readFile(proposalPath));
            const tasks = (0, gray_matter_1.default)(await services_1.services.fileService.readFile(tasksPath));
            const verification = (0, gray_matter_1.default)(await services_1.services.fileService.readFile(verificationPath));
            const flags = Array.isArray(proposal.data.flags) ? proposal.data.flags : [];
            const activatedSteps = workflow.getActivatedSteps(flags);
            const tasksOptionalSteps = Array.isArray(tasks.data.optional_steps)
                ? tasks.data.optional_steps
                : [];
            const verificationOptionalSteps = Array.isArray(verification.data.optional_steps)
                ? verification.data.optional_steps
                : [];
            const passedOptionalSteps = Array.isArray(verification.data.passed_optional_steps)
                ? verification.data.passed_optional_steps
                : [];
            const archiveConfig = config.workflow?.archive_gate || {
                require_verification: true,
                require_skill_update: true,
                require_index_regenerated: true,
                require_optional_steps_passed: true,
            };
            const result = await ArchiveGate_1.archiveGate.checkArchiveReadiness(featureState, archiveConfig, {
                activatedSteps,
                tasksOptionalSteps,
                verificationOptionalSteps,
                passedOptionalSteps,
                tasksComplete: !/- \[ \]/.test(tasks.content),
                verificationComplete: !/- \[ \]/.test(verification.content),
            });
            console.log('\nArchive Gate Check:');
            console.log('===================\n');
            for (const check of result.checks) {
                const icon = check.passed ? 'PASS' : 'FAIL';
                console.log(`${icon} ${check.name}`);
                console.log(`  ${check.message}\n`);
            }
            if (result.blockers.length > 0) {
                console.log('Blockers:');
                result.blockers.forEach(blocker => {
                    console.log(`  - ${blocker}`);
                });
                console.log();
            }
            if (result.warnings.length > 0) {
                console.log('Warnings:');
                result.warnings.forEach(warning => {
                    console.log(`  - ${warning}`);
                });
                console.log();
            }
            console.log('='.repeat(21) + '\n');
            if (result.canArchive) {
                this.success('Change is ready to archive');
            }
            else {
                this.error('Change cannot be archived. Please resolve blockers.');
                process.exit(1);
            }
        }
        catch (error) {
            this.error(`Archive check failed: ${error}`);
            throw error;
        }
    }
}
exports.ArchiveCommand = ArchiveCommand;
//# sourceMappingURL=ArchiveCommand.js.map