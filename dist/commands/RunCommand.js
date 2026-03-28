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
exports.RunCommand = void 0;
const path = __importStar(require("path"));
const runnerConfig_1 = require("../core/runnerConfig");
const services_1 = require("../services");
const subcommandHelp_1 = require("../utils/subcommandHelp");
const BaseCommand_1 = require("./BaseCommand");
class RunCommand extends BaseCommand_1.BaseCommand {
    async execute(action = 'status', ...args) {
        const normalizedAction = action || 'status';
        if ((0, subcommandHelp_1.isHelpAction)(normalizedAction)) {
            console.log((0, subcommandHelp_1.getRunHelpText)());
            return;
        }
        switch (normalizedAction) {
            case 'start':
                await this.start(args);
                return;
            case 'status':
                await this.status(args[0]);
                return;
            case 'step':
            case 'tick':
            case 'advance':
                await this.step(args[0]);
                return;
            case 'resume':
                await this.resume(args[0]);
                return;
            case 'stop':
            case 'pause':
                await this.stop(args[0]);
                return;
            case 'logs':
                await this.logs(args[0]);
                return;
            case 'profile':
                await this.profile(args);
                return;
            default:
                throw new Error(`Unknown run action: ${normalizedAction}`);
        }
    }
    async start(args) {
        const parsed = this.parseStartArgs(args);
        const targetPath = path.resolve(parsed.projectPath || process.cwd());
        const report = await services_1.services.runService.start(targetPath, {
            executor: parsed.executor,
            profileId: parsed.profileId,
        });
        this.printReport(report, targetPath);
    }
    async status(projectPath) {
        const targetPath = path.resolve(projectPath || process.cwd());
        const report = await services_1.services.runService.getStatusReport(targetPath);
        this.printReport(report, targetPath);
    }
    async step(projectPath) {
        const targetPath = path.resolve(projectPath || process.cwd());
        const report = await services_1.services.runService.step(targetPath);
        this.printReport(report, targetPath);
    }
    async resume(projectPath) {
        const targetPath = path.resolve(projectPath || process.cwd());
        const report = await services_1.services.runService.resume(targetPath);
        this.printReport(report, targetPath);
    }
    async stop(projectPath) {
        const targetPath = path.resolve(projectPath || process.cwd());
        const report = await services_1.services.runService.stop(targetPath);
        this.printReport(report, targetPath);
    }
    async logs(projectPath) {
        const targetPath = path.resolve(projectPath || process.cwd());
        const lines = await services_1.services.runService.getLogTail(targetPath, 30);
        console.log('\nQueue Run Logs');
        console.log('==============\n');
        if (lines.length === 0) {
            console.log('No queue run logs yet.\n');
            return;
        }
        for (const line of lines) {
            console.log(line);
        }
        console.log('');
    }
    async profile(args) {
        const action = args[0] || 'list';
        if ((0, subcommandHelp_1.isHelpAction)(action)) {
            console.log((0, subcommandHelp_1.getRunHelpText)());
            return;
        }
        switch (action) {
            case 'list':
                await this.profileList(args[1]);
                return;
            case 'show':
                await this.profileShow(args[1], args[2]);
                return;
            case 'validate':
                await this.profileValidate(args[1]);
                return;
            case 'set-default':
                await this.profileSetDefault(args[1], args[2]);
                return;
            default:
                throw new Error(`Unknown run profile action: ${action}`);
        }
    }
    async profileList(projectPath) {
        const targetPath = path.resolve(projectPath || process.cwd());
        const config = await services_1.services.configManager.loadConfig(targetPath);
        const runner = config.runner;
        console.log('\nRunner Profiles');
        console.log('===============\n');
        console.log(`Project: ${targetPath}`);
        console.log(`Default executor: ${runner.default_executor}`);
        console.log(`Default profile: ${runner.default_profile}\n`);
        for (const [profileId, profile] of Object.entries(runner.profiles)) {
            const support = this.getProfileSupportLabel(runner.default_executor, profileId, profile);
            console.log(`- ${profileId}${profileId === runner.default_profile ? ' (default)' : ''}`);
            console.log(`  Support: ${support.label}`);
            if (support.reason) {
                console.log(`  Reason: ${support.reason}`);
            }
        }
        console.log('');
    }
    async profileShow(profileId, projectPath) {
        if (!profileId) {
            throw new Error('Run profile show requires a profile id.');
        }
        const targetPath = path.resolve(projectPath || process.cwd());
        const config = await services_1.services.configManager.loadConfig(targetPath);
        const profile = config.runner?.profiles[profileId];
        if (!profile) {
            throw new Error(`Runner profile not found: ${profileId}`);
        }
        const support = this.getProfileSupportLabel(config.runner.default_executor, profileId, profile);
        console.log('\nRunner Profile');
        console.log('==============\n');
        console.log(`Project: ${targetPath}`);
        console.log(`Profile: ${profileId}`);
        console.log(`Default executor: ${config.runner.default_executor}`);
        console.log(`Support: ${support.label}`);
        if (support.reason) {
            console.log(`Reason: ${support.reason}`);
        }
        console.log('');
        for (const [key, value] of Object.entries(profile)) {
            console.log(`${key}: ${value}`);
        }
        console.log('');
    }
    async profileValidate(projectPath) {
        const targetPath = path.resolve(projectPath || process.cwd());
        const config = await services_1.services.configManager.loadConfig(targetPath);
        const validationErrors = services_1.services.configManager.validateConfig(config);
        console.log('\nRunner Profile Validation');
        console.log('=========================\n');
        console.log(`Project: ${targetPath}`);
        if (validationErrors.length === 0) {
            console.log('Config: valid');
        }
        else {
            console.log('Config: invalid');
            for (const error of validationErrors) {
                console.log(`- ${error}`);
            }
        }
        console.log('');
        for (const [profileId, profile] of Object.entries(config.runner.profiles)) {
            const support = this.getProfileSupportLabel(config.runner.default_executor, profileId, profile);
            console.log(`- ${profileId}: ${support.label}`);
            if (support.reason) {
                console.log(`  ${support.reason}`);
            }
        }
        console.log('');
    }
    async profileSetDefault(profileId, projectPath) {
        if (!profileId) {
            throw new Error('Run profile set-default requires a profile id.');
        }
        const targetPath = path.resolve(projectPath || process.cwd());
        const config = await services_1.services.configManager.loadConfig(targetPath);
        if (!config.runner?.profiles[profileId]) {
            throw new Error(`Runner profile not found: ${profileId}`);
        }
        await services_1.services.configManager.saveConfig(targetPath, {
            ...config,
            runner: {
                ...config.runner,
                default_profile: profileId,
            },
        });
        this.success(`Runner default profile set to ${profileId}`);
    }
    printReport(report, projectPath) {
        console.log('\nQueue Run Status');
        console.log('================\n');
        console.log(`Project: ${projectPath}`);
        if (!report.currentRun) {
            console.log('Run: idle');
            console.log(`Queued changes: ${report.queuedChanges.length}`);
            if (report.nextInstruction) {
                console.log(`Next: ${report.nextInstruction}`);
            }
            console.log('');
            return;
        }
        console.log(`Run ID: ${report.currentRun.id}`);
        console.log(`Status: ${report.currentRun.status}`);
        if (report.stage) {
            console.log(`Stage: ${report.stage}`);
        }
        console.log(`Executor: ${report.currentRun.executor}`);
        console.log(`Profile: ${report.currentRun.profileId}`);
        console.log(`Started at: ${report.currentRun.startedAt}`);
        console.log(`Updated at: ${report.currentRun.updatedAt}`);
        console.log(`Completed changes: ${report.currentRun.completedChanges.length}`);
        console.log(`Queued remaining: ${report.currentRun.remainingChanges.length}`);
        if (report.activeChange) {
            console.log(`Active change: ${report.activeChange.name} [${report.activeChange.status}]`);
            console.log(`Active path: ${report.activeChange.path}`);
        }
        else {
            console.log('Active change: none');
        }
        if (report.currentRun.failedChange) {
            console.log(`Failed marker: ${report.currentRun.failedChange.name}`);
            if (report.currentRun.failedChange.note) {
                console.log(`Failure note: ${report.currentRun.failedChange.note}`);
            }
        }
        if (report.currentRun.currentJob) {
            console.log(`Current job: ${report.currentRun.currentJob.id}`);
            console.log(`Current job status: ${report.currentRun.currentJob.status}`);
            console.log(`Current job change: ${report.currentRun.currentJob.changeName}`);
            if (report.currentRun.currentJob.note) {
                console.log(`Current job note: ${report.currentRun.currentJob.note}`);
            }
            if (report.currentRun.currentJob.promptPath) {
                console.log(`Current job prompt: ${report.currentRun.currentJob.promptPath}`);
            }
            if (report.currentRun.currentJob.outputPath) {
                console.log(`Current job output: ${report.currentRun.currentJob.outputPath}`);
            }
        }
        if (report.queuedChanges.length > 0) {
            console.log('\nQueued changes:');
            for (const change of report.queuedChanges) {
                console.log(`  - ${change.name} [${change.status}]`);
            }
        }
        if (report.nextInstruction) {
            console.log('\nNext instruction:');
            console.log(`  ${report.nextInstruction}`);
        }
        if (report.logTail.length > 0) {
            console.log('\nRecent log lines:');
            for (const line of report.logTail.slice(-10)) {
                console.log(`  ${line}`);
            }
        }
        console.log('');
    }
    parseStartArgs(args) {
        let projectPath;
        let executor;
        let profileId;
        for (let index = 0; index < args.length; index += 1) {
            const value = args[index];
            if (!value) {
                continue;
            }
            if (value === '--executor') {
                executor = this.normalizeExecutor(args[index + 1]);
                index += 1;
                continue;
            }
            if (value === '--profile') {
                profileId = args[index + 1];
                if (!profileId) {
                    throw new Error('Run start requires a value after --profile.');
                }
                index += 1;
                continue;
            }
            if (value.startsWith('--')) {
                throw new Error(`Unknown run start flag: ${value}`);
            }
            if (!projectPath) {
                projectPath = value;
                continue;
            }
            if (!executor) {
                executor = this.normalizeExecutor(value);
                continue;
            }
            throw new Error(`Unexpected run start argument: ${value}`);
        }
        return {
            projectPath,
            executor,
            profileId,
        };
    }
    getProfileSupportLabel(executor, profileId, profile) {
        const support = this.getProfileSupport(executor, profileId, profile);
        return {
            label: support.supported ? 'supported-now' : 'planned-not-runnable',
            reason: support.reason,
        };
    }
    getProfileSupport(executor, profileId, profile) {
        return (0, runnerConfig_1.getRunnerProfileRuntimeSupport)(executor, profileId, profile);
    }
    normalizeExecutor(value) {
        if (!value) {
            return 'manual-bridge';
        }
        if (value === 'manual-bridge' || value === 'codex' || value === 'claude-code') {
            return value;
        }
        throw new Error(`Unsupported run executor: ${value}`);
    }
}
exports.RunCommand = RunCommand;
//# sourceMappingURL=RunCommand.js.map