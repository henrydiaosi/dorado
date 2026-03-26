#!/usr/bin/env node
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
const process = __importStar(require("process"));
const ArchiveCommand_1 = require("./commands/ArchiveCommand");
const BatchCommand_1 = require("./commands/BatchCommand");
const ChangesCommand_1 = require("./commands/ChangesCommand");
const DashboardCommand_1 = require("./commands/DashboardCommand");
const DocsCommand_1 = require("./commands/DocsCommand");
const FinalizeCommand_1 = require("./commands/FinalizeCommand");
const IndexCommand_1 = require("./commands/IndexCommand");
const InitCommand_1 = require("./commands/InitCommand");
const NewCommand_1 = require("./commands/NewCommand");
const ProgressCommand_1 = require("./commands/ProgressCommand");
const SkillCommand_1 = require("./commands/SkillCommand");
const SkillsCommand_1 = require("./commands/SkillsCommand");
const StatusCommand_1 = require("./commands/StatusCommand");
const VerifyCommand_1 = require("./commands/VerifyCommand");
const WorkflowCommand_1 = require("./commands/WorkflowCommand");
const services_1 = require("./services");
const cliArgs_1 = require("./utils/cliArgs");
const CLI_VERSION = '0.5.0';
async function main() {
    try {
        const args = process.argv.slice(2);
        if (args.length === 0) {
            showHelp();
            return;
        }
        const command = args[0];
        const commandArgs = args.slice(1);
        switch (command) {
            case 'init': {
                const initCmd = new InitCommand_1.InitCommand();
                await initCmd.execute(commandArgs[0]);
                break;
            }
            case 'new': {
                if (commandArgs.length === 0) {
                    console.error('Error: change name is required');
                    console.log('Usage: dorado new <change-name> [root-dir]');
                    process.exit(1);
                }
                const newCmd = new NewCommand_1.NewCommand();
                await newCmd.execute(commandArgs[0], commandArgs[1]);
                break;
            }
            case 'verify': {
                const verifyCmd = new VerifyCommand_1.VerifyCommand();
                await verifyCmd.execute(commandArgs[0]);
                break;
            }
            case 'progress': {
                const progressCmd = new ProgressCommand_1.ProgressCommand();
                await progressCmd.execute(commandArgs[0]);
                break;
            }
            case 'archive': {
                const checkOnly = commandArgs.includes('--check');
                const archiveArgs = commandArgs.filter(arg => arg !== '--check');
                const archiveCmd = new ArchiveCommand_1.ArchiveCommand();
                await archiveCmd.execute(archiveArgs[0], { checkOnly });
                break;
            }
            case 'finalize': {
                const finalizeCmd = new FinalizeCommand_1.FinalizeCommand();
                await finalizeCmd.execute(commandArgs[0]);
                break;
            }
            case 'status': {
                const statusCmd = new StatusCommand_1.StatusCommand();
                await statusCmd.execute(commandArgs[0]);
                break;
            }
            case 'batch': {
                if (commandArgs.length === 0) {
                    console.error('Error: batch action is required');
                    console.log('Usage: dorado batch <action> [root-dir]');
                    process.exit(1);
                }
                const batchCmd = new BatchCommand_1.BatchCommand();
                await batchCmd.execute(commandArgs[0], commandArgs[1]);
                break;
            }
            case 'changes': {
                const changesCmd = new ChangesCommand_1.ChangesCommand();
                await changesCmd.execute(commandArgs[0] || 'status', commandArgs[1]);
                break;
            }
            case 'dashboard': {
                const dashboardArgs = (0, cliArgs_1.parseDashboardArgs)(commandArgs);
                const dashboardCmd = new DashboardCommand_1.DashboardCommand();
                await dashboardCmd.execute(dashboardArgs.action, {
                    projectPath: dashboardArgs.projectPath,
                    port: dashboardArgs.port,
                    autoOpen: dashboardArgs.autoOpen,
                });
                break;
            }
            case 'docs': {
                const docsCmd = new DocsCommand_1.DocsCommand();
                await docsCmd.execute(commandArgs[0] || 'status', commandArgs[1]);
                break;
            }
            case 'skills': {
                const skillsCmd = new SkillsCommand_1.SkillsCommand();
                await skillsCmd.execute(commandArgs[0] || 'status', commandArgs[1]);
                break;
            }
            case 'skill': {
                const skillCmd = new SkillCommand_1.SkillCommand();
                await skillCmd.execute(commandArgs[0] || 'status', commandArgs[1]);
                break;
            }
            case 'index': {
                const indexCmd = new IndexCommand_1.IndexCommand();
                await indexCmd.execute(commandArgs[0] || 'check', commandArgs[1]);
                break;
            }
            case 'workflow': {
                const workflowCmd = new WorkflowCommand_1.WorkflowCommand();
                await workflowCmd.execute(commandArgs[0] || 'show', commandArgs[1]);
                break;
            }
            case 'help':
            case '-h':
            case '--help':
                showHelp();
                break;
            case 'version':
            case '-v':
            case '--version':
                console.log(`Dorado CLI v${CLI_VERSION}`);
                break;
            default:
                console.error(`Unknown command: ${command}`);
                showHelp();
                process.exit(1);
        }
    }
    catch (error) {
        services_1.services.logger.error('CLI Error:', error);
        process.exit(1);
    }
}
function showHelp() {
    console.log(`
Dorado CLI v${CLI_VERSION}

Usage: dorado <command> [options]

Commands:
  init [root-dir]           Initialize the Dorado protocol shell
  new <change-name> [root]  Create a new change
  verify [path]             Verify change completion
  progress [path]           Show workflow progress
  archive [path] [--check]  Archive a ready change or only check readiness
  status [path]             Show project status
  finalize [path]           Verify a completed change and archive it before commit
  batch <action> [path]     Batch operations (export, stats)
  changes [action] [path]   Active change summaries (status)
  dashboard [action]        Web Dashboard (start, stop, install, build)
                            start [path] [--port <port>] [--no-open]
  docs [action] [path]      Docs helpers (status, generate)
  skills [action] [path]    Skills status helpers (status)
  skill [action] [dir]      Skill package helpers (status, install, status-claude, install-claude)
  index [action] [path]     Index helpers (check, build)
  workflow [action]         Workflow configuration (show, list-flags)
  help, -h, --help          Show this help message
  version, -v, --version    Show version

Examples:
  dorado init
  dorado new onboarding-flow
  dorado verify ./changes/active/onboarding-flow
  dorado progress ./changes/active/onboarding-flow
  dorado archive ./changes/active/onboarding-flow
  dorado archive ./changes/active/onboarding-flow --check
  dorado finalize ./changes/active/onboarding-flow
  dorado status
  dorado docs status
  dorado docs generate
  dorado skills status
  dorado skill status
  dorado skill install
  dorado skill status-claude
  dorado skill install-claude
  dorado index build
  dorado batch stats
  dorado changes status
  dorado dashboard start
  dorado dashboard start C:/work/my-project --port 3020 --no-open
  dorado workflow show
`);
}
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map