"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExecutorAdapter = getExecutorAdapter;
exports.listExecutorAdapters = listExecutorAdapters;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../core/constants");
const EXECUTOR_COMMAND_TIMEOUT_MS = 10 * 60 * 1000;
class BaseExecutorAdapter {
    getCapability() {
        return {
            supported: false,
            reason: `Executor "${this.executor}" is not wired yet.`,
        };
    }
    async dispatch(request) {
        const now = new Date().toISOString();
        const job = {
            id: `job-${now.replace(/[:.]/g, '-')}`,
            executor: request.executor,
            status: 'failed',
            changeName: request.changeName,
            changePath: request.changePath,
            startedAt: now,
            updatedAt: now,
            completedAt: now,
            note: null,
            runId: request.runId,
            projectPath: request.projectPath,
            profileId: request.profileId,
            promptPath: null,
            outputPath: null,
            dispatchedAt: now,
            lastPolledAt: null,
            lastError: this.getCapability().reason,
        };
        return {
            accepted: false,
            job,
            reason: this.getCapability().reason,
        };
    }
    async poll(job) {
        return {
            job: {
                ...job,
                updatedAt: new Date().toISOString(),
                lastPolledAt: new Date().toISOString(),
            },
            changed: true,
        };
    }
}
class ManualBridgeExecutorAdapter extends BaseExecutorAdapter {
    constructor() {
        super(...arguments);
        this.executor = 'manual-bridge';
    }
    getCapability() {
        return {
            supported: true,
            reason: null,
        };
    }
    async dispatch(request) {
        const now = new Date().toISOString();
        const job = {
            id: `job-${now.replace(/[:.]/g, '-')}`,
            executor: request.executor,
            status: 'waiting_for_manual',
            changeName: request.changeName,
            changePath: request.changePath,
            startedAt: now,
            updatedAt: now,
            completedAt: null,
            note: 'manual-bridge waits for the external AI client or user to complete the change.',
            runId: request.runId,
            projectPath: request.projectPath,
            profileId: request.profileId,
            promptPath: null,
            outputPath: null,
            dispatchedAt: now,
            lastPolledAt: null,
            lastError: null,
        };
        return {
            accepted: true,
            job,
            reason: null,
        };
    }
}
class LocalCliExecutorAdapter extends BaseExecutorAdapter {
    getCapability() {
        return {
            supported: true,
            reason: `Experimental local ${this.executor} integration. Requires the CLI to be installed and authenticated on PATH.`,
        };
    }
    async dispatch(request) {
        const now = new Date().toISOString();
        const id = `job-${now.replace(/[:.]/g, '-')}`;
        const promptPath = path_1.default.join(request.projectPath, '.dorado', constants_1.DIR_NAMES.RUNS, constants_1.DIR_NAMES.JOBS, `${id}.prompt.md`);
        const outputPath = path_1.default.join(request.projectPath, '.dorado', constants_1.DIR_NAMES.RUNS, constants_1.DIR_NAMES.JOBS, `${id}.output.txt`);
        const prompt = this.buildPrompt(request);
        await fs_extra_1.default.outputFile(promptPath, prompt, 'utf8');
        const processResult = await runExecutorCommand(this.getCommand(), this.getArgs(request), request.projectPath, prompt);
        await fs_extra_1.default.outputFile(outputPath, formatExecutorProcessResult(processResult), 'utf8');
        const updatedAt = new Date().toISOString();
        const failed = processResult.error !== null || processResult.timedOut || (processResult.exitCode ?? 1) !== 0;
        const job = {
            id,
            executor: request.executor,
            status: failed ? 'failed' : 'running',
            changeName: request.changeName,
            changePath: request.changePath,
            startedAt: now,
            updatedAt,
            completedAt: failed ? updatedAt : null,
            note: failed
                ? `${this.executor} dispatch failed. Inspect ${toPortablePath(outputPath)} for command output.`
                : `${this.executor} dispatch completed. Dorado will keep polling the change state before finalizing the job.`,
            runId: request.runId,
            projectPath: request.projectPath,
            profileId: request.profileId,
            promptPath: toPortablePath(promptPath),
            outputPath: toPortablePath(outputPath),
            dispatchedAt: now,
            lastPolledAt: null,
            lastError: failed ? this.buildFailureMessage(processResult) : null,
        };
        return {
            accepted: !failed,
            job,
            reason: failed ? job.lastError : null,
        };
    }
    async poll(job) {
        const polledAt = new Date().toISOString();
        let note = job.note;
        if (job.outputPath) {
            const outputPath = path_1.default.isAbsolute(job.outputPath)
                ? job.outputPath
                : path_1.default.join(job.projectPath, job.outputPath);
            if (await fs_extra_1.default.pathExists(outputPath)) {
                const stats = await fs_extra_1.default.stat(outputPath);
                note =
                    `${this.executor} dispatch output available. ` +
                        `Last output update: ${stats.mtime.toISOString()}. Dorado is waiting for protocol readiness.`;
            }
        }
        return {
            job: {
                ...job,
                updatedAt: polledAt,
                lastPolledAt: polledAt,
                note,
            },
            changed: true,
        };
    }
    buildPrompt(request) {
        return [
            `You are executing the Dorado change "${request.changeName}" in project "${request.projectPath}".`,
            '',
            'Follow the repository protocol before editing:',
            '- Read `.skillrc`, `SKILL.md`, and the `for-ai/` guidance first.',
            `- Read \`${request.changePath}/proposal.md\`, \`${request.changePath}/tasks.md\`, \`${request.changePath}/verification.md\`, and \`${request.changePath}/state.json\`.`,
            '- Implement the requested change in the working tree.',
            '- Keep protocol files current while you work.',
            '- Do not archive the change yourself.',
            '- Do not create commits unless the repository explicitly asks for it.',
            '',
            'When you finish the implementation pass, stop. Dorado will re-check verify/finalize/archive separately.',
        ].join('\n');
    }
    buildFailureMessage(result) {
        if (result.error) {
            return result.error;
        }
        if (result.timedOut) {
            return `${this.executor} command timed out after ${EXECUTOR_COMMAND_TIMEOUT_MS}ms.`;
        }
        if (result.signal) {
            return `${this.executor} command terminated by signal ${result.signal}.`;
        }
        return `${this.executor} command exited with code ${result.exitCode ?? 'unknown'}.`;
    }
}
class CodexExecutorAdapter extends LocalCliExecutorAdapter {
    constructor() {
        super(...arguments);
        this.executor = 'codex';
    }
    getCommand() {
        return 'codex';
    }
    getArgs(request) {
        return [
            'exec',
            '-C',
            request.projectPath,
            '--dangerously-bypass-approvals-and-sandbox',
            '-',
        ];
    }
}
class ClaudeCodeExecutorAdapter extends LocalCliExecutorAdapter {
    constructor() {
        super(...arguments);
        this.executor = 'claude-code';
    }
    getCommand() {
        return 'claude';
    }
    getArgs() {
        return ['-p', '--permission-mode', 'bypassPermissions', '--output-format', 'json'];
    }
}
const EXECUTOR_ADAPTERS = {
    'manual-bridge': new ManualBridgeExecutorAdapter(),
    codex: new CodexExecutorAdapter(),
    'claude-code': new ClaudeCodeExecutorAdapter(),
};
function getExecutorAdapter(executor) {
    return EXECUTOR_ADAPTERS[executor];
}
function listExecutorAdapters() {
    return Object.values(EXECUTOR_ADAPTERS);
}
async function runExecutorCommand(command, args, cwd, stdinPayload) {
    return new Promise(resolve => {
        const child = (0, child_process_1.spawn)(command, args, {
            cwd,
            shell: true,
            windowsHide: true,
            env: process.env,
        });
        let stdout = '';
        let stderr = '';
        let settled = false;
        let timedOut = false;
        let timeoutHandle = setTimeout(() => {
            timedOut = true;
            child.kill();
        }, EXECUTOR_COMMAND_TIMEOUT_MS);
        child.stdout.on('data', chunk => {
            stdout += chunk.toString();
        });
        child.stderr.on('data', chunk => {
            stderr += chunk.toString();
        });
        child.on('error', error => {
            if (settled) {
                return;
            }
            settled = true;
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
            resolve({
                exitCode: null,
                signal: null,
                stdout,
                stderr,
                timedOut,
                error: error.message,
            });
        });
        child.on('close', (exitCode, signal) => {
            if (settled) {
                return;
            }
            settled = true;
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
            resolve({
                exitCode,
                signal,
                stdout,
                stderr,
                timedOut,
                error: null,
            });
        });
        if (stdinPayload) {
            child.stdin.write(stdinPayload);
        }
        child.stdin.end();
    });
}
function formatExecutorProcessResult(result) {
    return [
        `exitCode: ${result.exitCode ?? 'null'}`,
        `signal: ${result.signal ?? 'null'}`,
        `timedOut: ${result.timedOut}`,
        `error: ${result.error ?? 'null'}`,
        '',
        '--- stdout ---',
        result.stdout.trimEnd(),
        '',
        '--- stderr ---',
        result.stderr.trimEnd(),
        '',
    ].join('\n');
}
function toPortablePath(targetPath) {
    return targetPath.replace(/\\/g, '/');
}
//# sourceMappingURL=registry.js.map