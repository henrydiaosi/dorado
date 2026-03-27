"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowCommand = void 0;
const process_1 = __importDefault(require("process"));
const services_1 = require("../services");
const workflow_1 = require("../workflow");
const BaseCommand_1 = require("./BaseCommand");
const subcommandHelp_1 = require("../utils/subcommandHelp");
const VALID_PROJECT_MODES = ['lite', 'standard', 'full'];
class WorkflowCommand extends BaseCommand_1.BaseCommand {
    async execute(action, ...args) {
        try {
            if ((0, subcommandHelp_1.isHelpAction)(action)) {
                this.info((0, subcommandHelp_1.getWorkflowHelpText)());
                return;
            }
            switch (action) {
                case 'show': {
                    await this.showWorkflow(args[0] || process_1.default.cwd());
                    break;
                }
                case 'list-flags': {
                    await this.listSupportedFlags(args[0] || process_1.default.cwd());
                    break;
                }
                case 'set-mode': {
                    await this.setMode(args);
                    break;
                }
                default:
                    this.info((0, subcommandHelp_1.getWorkflowHelpText)());
            }
        }
        catch (error) {
            this.error(`Workflow command failed: ${error}`);
            throw error;
        }
    }
    async showWorkflow(projectPath) {
        try {
            const config = await services_1.services.configManager.loadConfig(projectPath);
            const mode = config.mode;
            const workflow = new workflow_1.ConfigurableWorkflow(mode);
            console.log('\nWorkflow Configuration:');
            console.log('=========================\n');
            console.log(`Mode: ${mode.toUpperCase()}\n`);
            console.log('Core Steps (Required):');
            const coreSteps = workflow.getCoreSteps();
            coreSteps.forEach((step, index) => {
                console.log(`  ${index + 1}. ${step}`);
            });
            console.log('\nOptional Steps:');
            const optionalSteps = workflow.getConfig().optional_steps;
            for (const [name, optionalConfig] of Object.entries(optionalSteps)) {
                if (optionalConfig.enabled) {
                    console.log(`  - ${name}`);
                    console.log(`    Triggers: ${optionalConfig.when.join(', ')}`);
                }
            }
            console.log('\nSupported Workflow Flags:');
            workflow.getSupportedFlags().forEach(flag => {
                console.log(`  - ${flag}`);
            });
            console.log('\n' + '='.repeat(25) + '\n');
        }
        catch (error) {
            this.error(`Failed to show workflow: ${error}`);
            throw error;
        }
    }
    async listSupportedFlags(projectPath) {
        try {
            const config = await services_1.services.configManager.loadConfig(projectPath);
            const workflow = new workflow_1.ConfigurableWorkflow(config.mode);
            console.log('\nSupported Workflow Flags:');
            console.log('===========================\n');
            workflow.getSupportedFlags().forEach(flag => {
                console.log(`  - ${flag}`);
            });
            console.log('\n' + '='.repeat(27) + '\n');
        }
        catch (error) {
            this.error(`Failed to list flags: ${error}`);
            throw error;
        }
    }
    async setMode(args) {
        const forceActive = args.includes('--force-active');
        const positional = args.filter(arg => arg !== '--force-active');
        const nextMode = positional[0];
        const projectPath = positional[1] || process_1.default.cwd();
        if (!this.isValidProjectMode(nextMode)) {
            throw new Error('Usage: dorado workflow set-mode <lite|standard|full> [path] [--force-active]');
        }
        const result = await services_1.services.projectService.switchProjectMode(projectPath, nextMode, {
            forceActive,
        });
        if (result.previousMode === result.nextMode) {
            this.info(`Project mode already set to ${result.nextMode}. No changes made.`);
            return;
        }
        this.success(`Project mode changed from ${result.previousMode} to ${result.nextMode}`);
        this.info('  Updated .skillrc workflow preset and hook policy defaults for the selected mode');
        if (result.refreshedProtocolShellRootSkill) {
            this.info('  Refreshed protocol-shell root SKILL.md to match the new mode');
        }
        if (result.rebuiltIndex) {
            this.info('  Rebuilt SKILL.index.json after the mode change');
        }
        if (result.activeChangesDetected.length > 0) {
            if (forceActive) {
                this.warn(`Active changes were present during the mode switch: ${result.activeChangesDetected.join(', ')}`);
                this.info(`  Updated state.json mode for: ${result.activeChangesUpdated.join(', ') || '(none)'}`);
                this.info('  Review tasks.md, verification.md, and activated optional-step assets for those active changes before continuing execution');
            }
            else {
                this.info(`  Active changes detected: ${result.activeChangesDetected.join(', ')}`);
            }
        }
    }
    isValidProjectMode(mode) {
        return Boolean(mode && VALID_PROJECT_MODES.includes(mode));
    }
}
exports.WorkflowCommand = WorkflowCommand;
//# sourceMappingURL=WorkflowCommand.js.map