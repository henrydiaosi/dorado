"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectScaffoldCommandService = exports.ProjectScaffoldCommandService = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
class ProjectScaffoldCommandService {
    constructor(fileService, logger) {
        this.fileService = fileService;
        this.logger = logger;
    }
    getPlan(normalized, scaffoldPlan) {
        if (!scaffoldPlan) {
            return null;
        }
        const installRunner = this.resolvePackageManagerRunner('npm');
        return {
            presetId: scaffoldPlan.presetId,
            autoExecute: normalized.executeScaffoldCommands,
            steps: [
                {
                    id: 'install-dependencies',
                    title: normalized.documentLanguage === 'zh-CN'
                        ? '安装框架依赖'
                        : 'Install framework dependencies',
                    command: installRunner,
                    args: ['install'],
                    shellCommand: 'npm install',
                    description: normalized.documentLanguage === 'zh-CN'
                        ? '安装脚手架依赖，让生成的应用可以直接运行。'
                        : 'Install scaffold dependencies so the generated app can run immediately.',
                    phase: 'install',
                },
            ],
            deferredMessage: normalized.documentLanguage === 'zh-CN'
                ? '脚手架命令已生成但暂未执行。准备好后请在项目根目录运行 npm install。'
                : 'Scaffold commands are prepared but deferred. Run npm install in the project root when you are ready.',
        };
    }
    async executePlan(rootDir, plan) {
        if (!plan || !plan.autoExecute || plan.steps.length === 0) {
            return {
                status: 'skipped',
                steps: [],
                recoveryFilePath: null,
            };
        }
        const results = [];
        for (const step of plan.steps) {
            const stepResult = await this.executeStep(rootDir, step);
            results.push(stepResult);
            if (stepResult.status === 'failed') {
                return {
                    status: 'failed',
                    steps: results,
                    recoveryFilePath: null,
                };
            }
        }
        return {
            status: 'completed',
            steps: results,
            recoveryFilePath: null,
        };
    }
    async writeRecoveryRecord(rootDir, input) {
        const recoveryPath = path_1.default.join(rootDir, '.dorado', 'bootstrap-recovery.json');
        const record = {
            generatedAt: new Date().toISOString(),
            projectPresetId: input.normalized.projectPresetId,
            projectName: input.normalized.projectName,
            failedStep: {
                id: input.failedStep.id,
                title: input.failedStep.title,
                shellCommand: input.failedStep.shellCommand,
            },
            createdArtifacts: {
                scaffoldFiles: input.scaffoldCreatedFiles,
                scaffoldDirectories: input.scaffoldCreatedDirectories,
                directCopyFiles: input.directCopyCreatedFiles,
                hooks: input.hookInstalledFiles,
            },
            remediation: [
                input.normalized.documentLanguage === 'zh-CN'
                    ? '先检查网络与 npm registry 可用性，再重新执行安装命令。'
                    : 'Check network access and npm registry availability, then rerun the install command.',
                input.normalized.documentLanguage === 'zh-CN'
                    ? '重试前先查看已创建的脚手架文件，确认哪些内容已经生成。'
                    : 'Review the created scaffold files before retrying so you know which files were already generated.',
                input.normalized.documentLanguage === 'zh-CN'
                    ? '修复环境后，可重新执行 bootstrap，或手动执行延后的安装命令。'
                    : 'After fixing the environment, rerun bootstrap or manually execute the deferred install command.',
            ],
        };
        await this.fileService.writeJSON(recoveryPath, record);
        return recoveryPath;
    }
    executeStep(rootDir, step) {
        return new Promise(resolve => {
            const startedAt = Date.now();
            const child = (0, child_process_1.spawn)(step.command, step.args, {
                cwd: rootDir,
                shell: false,
            });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', chunk => {
                stdout += String(chunk);
            });
            child.stderr.on('data', chunk => {
                stderr += String(chunk);
            });
            child.on('error', error => {
                this.logger.warn(`Scaffold command failed to start: ${step.shellCommand}`, error);
                resolve({
                    id: step.id,
                    title: step.title,
                    shellCommand: step.shellCommand,
                    status: 'failed',
                    exitCode: null,
                    durationMs: Date.now() - startedAt,
                    stdoutSnippet: this.limitOutput(stdout),
                    stderrSnippet: this.limitOutput(`${stderr}\n${String(error)}`),
                });
            });
            child.on('close', exitCode => {
                resolve({
                    id: step.id,
                    title: step.title,
                    shellCommand: step.shellCommand,
                    status: exitCode === 0 ? 'completed' : 'failed',
                    exitCode,
                    durationMs: Date.now() - startedAt,
                    stdoutSnippet: this.limitOutput(stdout),
                    stderrSnippet: this.limitOutput(stderr),
                });
            });
        });
    }
    resolvePackageManagerRunner(packageManager) {
        if (process.platform === 'win32') {
            return `${packageManager}.cmd`;
        }
        return packageManager;
    }
    limitOutput(value) {
        const normalized = value.trim();
        if (normalized.length <= 600) {
            return normalized;
        }
        return `${normalized.slice(0, 600)}...`;
    }
}
exports.ProjectScaffoldCommandService = ProjectScaffoldCommandService;
const createProjectScaffoldCommandService = (fileService, logger) => new ProjectScaffoldCommandService(fileService, logger);
exports.createProjectScaffoldCommandService = createProjectScaffoldCommandService;
//# sourceMappingURL=ProjectScaffoldCommandService.js.map