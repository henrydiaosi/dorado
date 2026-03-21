"use strict";
/**
 * 工作流命令
 * 显示和管理工作流配置
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowCommand = void 0;
const BaseCommand_1 = require("./BaseCommand");
const services_1 = require("../services");
const subcommandHelp_1 = require("../utils/subcommandHelp");
const workflow_1 = require("../workflow");
class WorkflowCommand extends BaseCommand_1.BaseCommand {
    async execute(action, projectPath) {
        try {
            if ((0, subcommandHelp_1.isHelpAction)(action)) {
                this.info((0, subcommandHelp_1.getWorkflowHelpText)());
                return;
            }
            const targetPath = projectPath || process.cwd();
            switch (action) {
                case 'show': {
                    await this.showWorkflow(targetPath);
                    break;
                }
                case 'list-flags': {
                    await this.listSupportedFlags(targetPath);
                    break;
                }
                case 'simulate': {
                    // 需要传入 mode 和 flags
                    console.error('Usage: dorado workflow simulate <mode> <flags...>');
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
            // 读取项目配置
            const config = await services_1.services.configManager.loadConfig(projectPath);
            const mode = config.mode;
            const workflow = new workflow_1.ConfigurableWorkflow(mode);
            console.log('\n📋 Workflow Configuration:');
            console.log('=========================\n');
            console.log(`Mode: ${mode.toUpperCase()}\n`);
            console.log('Core Steps (Required):');
            const coreSteps = workflow.getCoreSteps();
            coreSteps.forEach((step, i) => {
                console.log(`  ${i + 1}. ${step}`);
            });
            console.log('\nOptional Steps:');
            const optionalSteps = workflow.getConfig().optional_steps;
            for (const [name, config] of Object.entries(optionalSteps)) {
                if (config.enabled) {
                    console.log(`  • ${name}`);
                    console.log(`    Triggers: ${config.when.join(', ')}`);
                }
            }
            console.log('\nSupported Workflow Flags:');
            const flags = workflow.getSupportedFlags();
            flags.forEach((flag, i) => {
                if ((i + 1) % 3 === 0) {
                    console.log(`  ${flag}`);
                }
                else {
                    process.stdout.write(`  ${flag}\n`);
                }
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
            const mode = config.mode;
            const workflow = new workflow_1.ConfigurableWorkflow(mode);
            const flags = workflow.getSupportedFlags();
            console.log('\n🏷️  Supported Workflow Flags:');
            console.log('===========================\n');
            flags.forEach(flag => {
                console.log(`  • ${flag}`);
            });
            console.log('\n' + '='.repeat(27) + '\n');
        }
        catch (error) {
            this.error(`Failed to list flags: ${error}`);
            throw error;
        }
    }
}
exports.WorkflowCommand = WorkflowCommand;
//# sourceMappingURL=WorkflowCommand.js.map