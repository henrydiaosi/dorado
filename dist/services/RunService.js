"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunService = void 0;
exports.createRunService = createRunService;
const runnerConfig_1 = require("../core/runnerConfig");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../core/constants");
class RunService {
    constructor(fileService, projectService, configManager, executorService) {
        this.fileService = fileService;
        this.projectService = projectService;
        this.configManager = configManager;
        this.executorService = executorService;
    }
    async start(rootDir, options = {}) {
        const resolvedRootDir = path_1.default.resolve(rootDir);
        await this.ensureRunDirectories(resolvedRootDir);
        const existingRun = await this.getCurrentRun(resolvedRootDir);
        if (existingRun && ['running', 'paused', 'failed'].includes(existingRun.status)) {
            throw new Error(`A queue run already exists with status "${existingRun.status}". Use "dorado run resume" or "dorado run stop" first.`);
        }
        await this.assertRunnableRepository(resolvedRootDir);
        const { executor, profileId } = await this.resolveStartOptions(resolvedRootDir, options);
        const run = this.createRun(resolvedRootDir, executor, profileId);
        const synchronized = await this.synchronizeRun(resolvedRootDir, run, {
            allowActivateNext: true,
        });
        await this.saveRun(resolvedRootDir, synchronized.run);
        await this.appendLogEvents(resolvedRootDir, synchronized.run, [
            `Queue run started with executor ${executor} and profile ${profileId}.`,
            ...synchronized.events,
        ]);
        return this.buildStatusReport(resolvedRootDir, synchronized.run);
    }
    async resume(rootDir) {
        const resolvedRootDir = path_1.default.resolve(rootDir);
        const run = await this.requireCurrentRun(resolvedRootDir);
        if (!['paused', 'failed'].includes(run.status)) {
            throw new Error(`Run resume requires a paused or failed run. Current status is "${run.status}".`);
        }
        await this.assertSingleActive(resolvedRootDir);
        const recoveryEvents = await this.recoverCurrentJobForResume(resolvedRootDir, run);
        run.status = 'running';
        run.stoppedAt = null;
        run.completedAt = null;
        const synchronized = await this.synchronizeRun(resolvedRootDir, run, {
            allowActivateNext: true,
        });
        await this.saveRun(resolvedRootDir, synchronized.run);
        await this.appendLogEvents(resolvedRootDir, synchronized.run, [
            'Queue run resumed.',
            ...recoveryEvents,
            ...synchronized.events,
        ]);
        return this.buildStatusReport(resolvedRootDir, synchronized.run);
    }
    async step(rootDir) {
        const resolvedRootDir = path_1.default.resolve(rootDir);
        const run = await this.requireCurrentRun(resolvedRootDir);
        if (run.status !== 'running') {
            throw new Error(`Run step requires a running run. Current status is "${run.status}".`);
        }
        const profile = await this.resolveProfileForRun(resolvedRootDir, run);
        const events = [];
        const initialSync = await this.synchronizeRun(resolvedRootDir, run, {
            allowActivateNext: profile.auto_activate_next,
        });
        events.push(...initialSync.events);
        const stepEvents = await this.advanceRunOnce(resolvedRootDir, run, profile);
        events.push(...stepEvents);
        const finalSync = await this.synchronizeRun(resolvedRootDir, run, {
            allowActivateNext: profile.auto_activate_next,
        });
        events.push(...finalSync.events);
        await this.saveRun(resolvedRootDir, finalSync.run);
        if (events.length > 0) {
            await this.appendLogEvents(resolvedRootDir, finalSync.run, events);
        }
        return this.buildStatusReport(resolvedRootDir, finalSync.run);
    }
    async stop(rootDir) {
        const resolvedRootDir = path_1.default.resolve(rootDir);
        const run = await this.requireCurrentRun(resolvedRootDir);
        if (run.status === 'completed') {
            throw new Error('The current queue run is already completed.');
        }
        const synchronized = await this.synchronizeRun(resolvedRootDir, run, {
            allowActivateNext: false,
        });
        synchronized.run.status = 'paused';
        synchronized.run.stoppedAt = new Date().toISOString();
        synchronized.run.lastInstruction = synchronized.run.currentChange
            ? 'Runner paused. Finish the current change manually, then use "dorado run resume" when you want Dorado to continue tracking the queue.'
            : 'Runner paused. Use "dorado run resume" when you want Dorado to continue with the queue.';
        await this.saveRun(resolvedRootDir, synchronized.run);
        await this.appendLogEvents(resolvedRootDir, synchronized.run, [
            ...synchronized.events,
            'Queue run paused by user request.',
        ]);
        return this.buildStatusReport(resolvedRootDir, synchronized.run);
    }
    async getStatusReport(rootDir) {
        const resolvedRootDir = path_1.default.resolve(rootDir);
        const run = await this.getCurrentRun(resolvedRootDir);
        if (!run) {
            return this.buildStatusReport(resolvedRootDir, null);
        }
        const synchronized = await this.synchronizeRun(resolvedRootDir, run, {
            allowActivateNext: run.status === 'running',
        });
        await this.saveRun(resolvedRootDir, synchronized.run);
        if (synchronized.events.length > 0) {
            await this.appendLogEvents(resolvedRootDir, synchronized.run, synchronized.events);
        }
        return this.buildStatusReport(resolvedRootDir, synchronized.run);
    }
    async getLogTail(rootDir, lineCount = 20) {
        const resolvedRootDir = path_1.default.resolve(rootDir);
        const run = await this.getCurrentRun(resolvedRootDir);
        if (!run) {
            return [];
        }
        return this.readLogTail(resolvedRootDir, run.logPath, lineCount);
    }
    async getRunnerConfiguration(rootDir) {
        const config = await this.configManager.loadConfig(rootDir);
        const runner = (0, runnerConfig_1.normalizeRunnerConfig)(config.runner);
        const validationErrors = this.configManager.validateConfig({
            ...config,
            runner,
        });
        const profile = runner.profiles[runner.default_profile] ?? runner.profiles['manual-safe'];
        return {
            executor: runner.default_executor,
            profileId: runner.default_profile,
            profile,
            validationErrors,
        };
    }
    async buildStatusReport(rootDir, run) {
        const [activeNames, queuedChanges, logTail] = await Promise.all([
            this.projectService.listActiveChangeNames(rootDir),
            this.projectService.getQueuedChanges(rootDir),
            run ? this.readLogTail(rootDir, run.logPath, 20) : Promise.resolve([]),
        ]);
        const activeChange = activeNames.length === 1
            ? {
                name: activeNames[0],
                path: `changes/active/${activeNames[0]}`,
                status: (await this.fileService.readJSON(path_1.default.join(rootDir, 'changes', 'active', activeNames[0], 'state.json'))).status,
            }
            : null;
        return {
            currentRun: run,
            stage: this.describeRunStage(run),
            activeChange,
            queuedChanges,
            logTail,
            nextInstruction: run?.lastInstruction ?? this.getIdleInstruction(queuedChanges.length),
        };
    }
    async resolveStartOptions(rootDir, options) {
        const config = await this.configManager.loadConfig(rootDir);
        const runner = (0, runnerConfig_1.normalizeRunnerConfig)(config.runner);
        const validationErrors = this.configManager.validateConfig({
            ...config,
            runner,
        });
        if (validationErrors.length > 0) {
            throw new Error(validationErrors.join(' '));
        }
        const executor = options.executor ?? runner.default_executor;
        const profileId = options.profileId ?? runner.default_profile;
        const profile = runner.profiles[profileId];
        if (!profile) {
            throw new Error(`Runner profile not found: ${profileId}`);
        }
        const support = (0, runnerConfig_1.getRunnerProfileRuntimeSupport)(executor, profileId, profile);
        if (!support.supported) {
            throw new Error(support.reason ?? `Runner profile ${profileId} is not supported right now.`);
        }
        return {
            executor,
            profileId,
            profile,
        };
    }
    async synchronizeRun(rootDir, run, options) {
        const events = [];
        const activeNames = await this.projectService.listActiveChangeNames(rootDir);
        if (activeNames.length > 1) {
            run.status = 'failed';
            run.failedChange = {
                name: activeNames.join(', '),
                path: 'changes/active',
                status: 'draft',
                recordedAt: new Date().toISOString(),
                note: 'multiple active changes detected',
            };
            run.lastInstruction =
                'Multiple active changes were detected. Resolve the repository back to a single active change before resuming the runner.';
            run.remainingChanges = await this.projectService.listQueuedChangeNames(rootDir);
            events.push(`Runner entered failed state because multiple active changes were detected: ${activeNames.join(', ')}.`);
            return {
                run: this.touchRun(run),
                events,
            };
        }
        const activeName = activeNames[0] ?? null;
        if (run.currentChange && run.currentChange !== activeName) {
            const archivedPath = await this.findArchivedChangePath(rootDir, run.currentChange);
            if (archivedPath) {
                this.recordCompletedChange(run, run.currentChange, archivedPath);
                run.currentJobId = null;
                run.currentJob = null;
                events.push(`Observed archived change: ${run.currentChange}.`);
            }
        }
        if (activeName) {
            const activePath = `changes/active/${activeName}`;
            if (run.currentChange !== activeName) {
                events.push(`Runner attached to active change ${activeName}.`);
            }
            run.currentChange = activeName;
            run.currentChangePath = activePath;
            if (run.currentJob && run.currentJob.changeName !== activeName) {
                run.currentJobId = null;
                run.currentJob = null;
            }
            if (run.status !== 'failed') {
                run.failedChange = null;
            }
            run.completedAt = null;
        }
        else {
            run.currentChange = null;
            run.currentChangePath = null;
            run.currentJobId = null;
            run.currentJob = null;
            if (options.allowActivateNext && run.status === 'running') {
                const nextChange = await this.projectService.activateNextQueuedChange(rootDir, 'runner');
                if (nextChange) {
                    run.currentChange = nextChange.name;
                    run.currentChangePath = nextChange.path;
                    run.failedChange = null;
                    run.lastInstruction = this.buildActiveInstruction(nextChange.path, run.executor, run.profileId);
                    events.push(`Activated next queued change: ${nextChange.name}.`);
                }
            }
        }
        run.remainingChanges = await this.projectService.listQueuedChangeNames(rootDir);
        if (!run.currentChange) {
            if (run.status === 'running' && run.remainingChanges.length === 0) {
                run.status = 'completed';
                run.completedAt = new Date().toISOString();
                run.lastInstruction = 'Queue run completed. No queued changes remain.';
                events.push('Queue run completed.');
            }
            else if (run.status !== 'completed') {
                run.lastInstruction =
                    run.remainingChanges.length > 0
                        ? 'No active change is attached right now. Run "dorado run resume" to activate the next queued change.'
                        : 'No active or queued changes are available right now.';
            }
        }
        else {
            run.lastInstruction = this.buildRunInstruction(run);
        }
        return {
            run: this.touchRun(run),
            events,
        };
    }
    recordCompletedChange(run, changeName, archivedPath) {
        if (run.completedChanges.some(item => item.name === changeName && item.path === archivedPath)) {
            return;
        }
        run.completedChanges.push({
            name: changeName,
            path: archivedPath,
            status: 'archived',
            recordedAt: new Date().toISOString(),
        });
    }
    async resolveProfileForRun(rootDir, run) {
        const config = await this.configManager.loadConfig(rootDir);
        const runner = (0, runnerConfig_1.normalizeRunnerConfig)(config.runner);
        const profile = runner.profiles[run.profileId];
        if (!profile) {
            throw new Error(`Runner profile not found: ${run.profileId}`);
        }
        return profile;
    }
    async advanceRunOnce(rootDir, run, profile) {
        const events = [];
        if (!run.currentChangePath) {
            run.lastInstruction =
                run.remainingChanges.length > 0
                    ? 'No active change is attached right now. Run "dorado run step" again after Dorado attaches or activates the next queued change.'
                    : 'No active change is attached right now.';
            return events;
        }
        const activePath = path_1.default.join(rootDir, run.currentChangePath);
        const pollEvents = await this.pollCurrentJob(rootDir, run);
        events.push(...pollEvents);
        if (run.status === 'failed') {
            return events;
        }
        const change = await this.projectService.getActiveChangeStatusItem(activePath);
        const blockingChecks = change.checks.filter(check => check.status === 'fail');
        const blockingWarnings = change.checks.filter(check => check.status === 'warn' && check.name !== 'archive.pending');
        if (blockingChecks.length > 0 || (profile.stop_on_warn && blockingWarnings.length > 0)) {
            const failures = [
                ...blockingChecks.map(check => check.name),
                ...blockingWarnings.map(check => check.name),
            ];
            run.status = 'failed';
            run.failedChange = {
                name: change.name,
                path: change.path,
                status: change.status,
                recordedAt: new Date().toISOString(),
                note: `runner-step-blocked:${failures.join(', ')}`,
            };
            run.lastInstruction =
                `Runner step blocked on ${change.name}. Resolve ${failures.join(', ')} ` +
                    'and use "dorado run resume" when the change is ready again.';
            events.push(`Runner step failed on ${change.name} because blocking protocol checks remain: ${failures.join(', ')}.`);
            return events;
        }
        if (profile.auto_verify || profile.auto_finalize || profile.auto_archive) {
            const finalizeReady = change.checks.every(check => check.status === 'pass' || check.name === 'archive.pending');
            if (!finalizeReady) {
                const dispatchEvents = await this.ensureCurrentJob(rootDir, run, change.name, change.path);
                events.push(...dispatchEvents);
                run.lastInstruction =
                    run.executor === 'manual-bridge'
                        ? `Manual bridge is still waiting on ${change.name}. Complete the change protocol, then run "dorado run step" to let Dorado continue the archive chain.`
                        : `${run.executor} is still attached to ${change.name}. Let the executor finish its implementation pass, then run "dorado run step" again so Dorado can re-check archive-chain readiness.`;
                events.push(`Runner step inspected ${change.name} and found it not ready for finalize/archive yet.`);
                return events;
            }
            await this.completeCurrentJob(rootDir, run, `change ${change.name} reached archive-chain completion`);
            const { archivePath } = await this.projectService.finalizeChange(activePath);
            run.failedChange = null;
            run.lastInstruction =
                `Change ${change.name} was auto-finalized and archived to ${archivePath}. ` +
                    'Dorado can now continue with the queue.';
            events.push(`Auto-finalized and archived ${change.name} to ${archivePath}.`);
            return events;
        }
        const dispatchEvents = await this.ensureCurrentJob(rootDir, run, change.name, change.path);
        events.push(...dispatchEvents);
        run.lastInstruction =
            run.executor === 'manual-bridge'
                ? `Manual bridge is attached to ${change.path}. Complete the implementation and protocol docs, then run "dorado run step" when you want Dorado to re-check queue progress.`
                : `${run.executor} has been dispatched for ${change.path}. Run "dorado run step" again when you want Dorado to poll the current job and re-check protocol progress.`;
        events.push(`Runner step inspected ${change.name} under ${run.executor}/${run.profileId}; no automatic lifecycle actions were requested.`);
        return events;
    }
    async ensureCurrentJob(rootDir, run, changeName, changePath) {
        if (run.currentJobId && run.currentJob?.changeName === changeName) {
            return [];
        }
        const result = await this.executorService.createJobRecord(rootDir, {
            runId: run.id,
            executor: run.executor,
            projectPath: rootDir,
            profileId: run.profileId,
            changeName,
            changePath,
        });
        run.currentJobId = result.job.id;
        run.currentJob = this.executorService.toSummary(result.job);
        if (!result.accepted || result.job.status === 'failed') {
            run.status = 'failed';
            run.failedChange = {
                name: changeName,
                path: changePath,
                status: 'implementing',
                recordedAt: new Date().toISOString(),
                note: result.reason ?? `${run.executor} dispatch failed`,
            };
            run.lastInstruction =
                `${run.executor} dispatch failed for ${changeName}. ` +
                    'Inspect the current job output, fix the executor/runtime problem, then use "dorado run resume" after the change is ready to retry.';
            return [
                `Executor dispatch failed for ${changeName}: ${result.reason ?? 'unknown executor error'}.`,
            ];
        }
        return [
            `Executor ${run.executor} dispatched for ${changeName} as job ${result.job.id}.`,
        ];
    }
    async completeCurrentJob(rootDir, run, note) {
        if (!run.currentJobId) {
            return;
        }
        const existing = await this.executorService.loadJob(rootDir, run.currentJobId);
        if (!existing) {
            run.currentJobId = null;
            run.currentJob = null;
            return;
        }
        const completedAt = new Date().toISOString();
        const updated = {
            ...existing,
            status: 'completed',
            updatedAt: completedAt,
            completedAt,
            note,
        };
        await this.executorService.saveJob(rootDir, updated);
        run.currentJobId = null;
        run.currentJob = null;
    }
    async recoverCurrentJobForResume(rootDir, run) {
        if (!run.currentJobId) {
            return [];
        }
        const existing = await this.executorService.loadJob(rootDir, run.currentJobId);
        if (!existing) {
            run.currentJobId = null;
            run.currentJob = null;
            return ['Current executor job record was missing during resume. Dorado cleared the stale job pointer.'];
        }
        if (existing.status === 'failed' || existing.status === 'cancelled') {
            run.currentJobId = null;
            run.currentJob = null;
            return [
                `Cleared ${existing.status} executor job ${existing.id} during resume. Dorado will re-dispatch the active change on the next explicit run step.`,
            ];
        }
        if (existing.status === 'completed') {
            run.currentJobId = null;
            run.currentJob = null;
            return [
                `Cleared completed executor job ${existing.id} during resume. Dorado will re-check protocol readiness on the next explicit run step.`,
            ];
        }
        run.currentJob = this.executorService.toSummary(existing);
        return [
            `Resumed with existing executor job ${existing.id} still attached in status ${existing.status}.`,
        ];
    }
    async pollCurrentJob(rootDir, run) {
        if (!run.currentJobId) {
            return [];
        }
        const existing = await this.executorService.loadJob(rootDir, run.currentJobId);
        if (!existing) {
            run.currentJobId = null;
            run.currentJob = null;
            return ['Current executor job record is missing. Dorado will dispatch again on the next eligible step.'];
        }
        const result = await this.executorService.pollJob(rootDir, existing);
        run.currentJob = this.executorService.toSummary(result.job);
        if (result.job.status === 'failed') {
            run.status = 'failed';
            run.failedChange = {
                name: result.job.changeName,
                path: result.job.changePath,
                status: 'implementing',
                recordedAt: new Date().toISOString(),
                note: result.job.lastError ?? result.job.note ?? `${result.job.executor} job failed`,
            };
            run.lastInstruction =
                `${result.job.executor} job ${result.job.id} failed for ${result.job.changeName}. ` +
                    'Inspect the saved executor output, fix the issue, then use "dorado run resume" when you want Dorado to continue.';
            return [
                `Executor job ${result.job.id} failed for ${result.job.changeName}: ${result.job.lastError ?? result.job.note ?? 'unknown error'}.`,
            ];
        }
        if (!result.changed) {
            return [];
        }
        return [
            `Polled executor job ${result.job.id} for ${result.job.changeName}. Current status: ${result.job.status}.`,
        ];
    }
    createRun(rootDir, executor, profileId) {
        const now = new Date().toISOString();
        const id = `run-${now.replace(/[:.]/g, '-')}`;
        return {
            id,
            status: 'running',
            executor,
            profileId,
            mode: 'single-active-sequential',
            projectPath: rootDir,
            startedAt: now,
            updatedAt: now,
            stoppedAt: null,
            completedAt: null,
            currentChange: null,
            currentChangePath: null,
            currentJobId: null,
            currentJob: null,
            completedChanges: [],
            remainingChanges: [],
            failedChange: null,
            logPath: `.dorado/${constants_1.DIR_NAMES.RUNS}/${constants_1.DIR_NAMES.LOGS}/${id}.log`,
            lastInstruction: null,
        };
    }
    touchRun(run) {
        return {
            ...run,
            updatedAt: new Date().toISOString(),
        };
    }
    async requireCurrentRun(rootDir) {
        const run = await this.getCurrentRun(rootDir);
        if (!run) {
            throw new Error('No queue run exists for this project yet. Use "dorado run start" first.');
        }
        return run;
    }
    async getCurrentRun(rootDir) {
        const currentRunPath = this.getCurrentRunPath(rootDir);
        if (!(await this.fileService.exists(currentRunPath))) {
            return null;
        }
        const run = await this.fileService.readJSON(currentRunPath);
        return {
            ...run,
            currentJobId: run.currentJobId ?? null,
            currentJob: run.currentJob
                ? {
                    ...run.currentJob,
                    note: run.currentJob.note ?? null,
                    promptPath: run.currentJob.promptPath ?? null,
                    outputPath: run.currentJob.outputPath ?? null,
                }
                : null,
        };
    }
    async saveRun(rootDir, run) {
        await this.ensureRunDirectories(rootDir);
        const historyPath = this.getHistoryRunPath(rootDir, run.id);
        await this.fileService.writeJSON(this.getCurrentRunPath(rootDir), run);
        await this.fileService.writeJSON(historyPath, run);
    }
    async appendLogEvents(rootDir, run, events) {
        if (events.length === 0) {
            return;
        }
        const logPath = this.resolveRunFilePath(rootDir, run.logPath);
        await this.fileService.ensureDir(path_1.default.dirname(logPath));
        const timestamped = events
            .map(event => `[${new Date().toISOString()}] ${event}`)
            .join('\n');
        await fs_extra_1.default.appendFile(logPath, `${timestamped}\n`, 'utf8');
    }
    async readLogTail(rootDir, logPath, lineCount) {
        const resolvedLogPath = this.resolveRunFilePath(rootDir, logPath);
        if (!(await this.fileService.exists(resolvedLogPath))) {
            return [];
        }
        const content = await this.fileService.readFile(resolvedLogPath);
        return content
            .split(/\r?\n/)
            .map(line => line.trimEnd())
            .filter(Boolean)
            .slice(-lineCount);
    }
    async assertRunnableRepository(rootDir) {
        await this.assertSingleActive(rootDir);
        const [activeNames, queuedChanges] = await Promise.all([
            this.projectService.listActiveChangeNames(rootDir),
            this.projectService.listQueuedChangeNames(rootDir),
        ]);
        if (activeNames.length === 0 && queuedChanges.length === 0) {
            throw new Error('No active or queued changes are available for execution.');
        }
    }
    async assertSingleActive(rootDir) {
        const activeNames = await this.projectService.listActiveChangeNames(rootDir);
        if (activeNames.length > 1) {
            throw new Error(`Queue runner requires single-active mode, but ${activeNames.length} active changes were found: ${activeNames.join(', ')}.`);
        }
    }
    async findArchivedChangePath(rootDir, changeName) {
        const archivedDir = path_1.default.join(rootDir, 'changes', 'archived');
        if (!(await this.fileService.exists(archivedDir))) {
            return null;
        }
        const entries = await fs_extra_1.default.readdir(archivedDir, { withFileTypes: true });
        const match = entries
            .filter(entry => entry.isDirectory() && entry.name.endsWith(`-${changeName}`))
            .map(entry => entry.name)
            .sort()
            .at(-1);
        return match ? `changes/archived/${match}` : null;
    }
    async ensureRunDirectories(rootDir) {
        await Promise.all([
            this.fileService.ensureDir(path_1.default.join(rootDir, '.dorado', constants_1.DIR_NAMES.RUNS)),
            this.fileService.ensureDir(path_1.default.join(rootDir, '.dorado', constants_1.DIR_NAMES.RUNS, constants_1.DIR_NAMES.HISTORY)),
            this.fileService.ensureDir(path_1.default.join(rootDir, '.dorado', constants_1.DIR_NAMES.RUNS, constants_1.DIR_NAMES.LOGS)),
            this.executorService.ensureExecutorDirectories(rootDir),
        ]);
    }
    getCurrentRunPath(rootDir) {
        return path_1.default.join(rootDir, '.dorado', constants_1.DIR_NAMES.RUNS, 'current.json');
    }
    getHistoryRunPath(rootDir, runId) {
        return path_1.default.join(rootDir, '.dorado', constants_1.DIR_NAMES.RUNS, constants_1.DIR_NAMES.HISTORY, `${runId}.json`);
    }
    resolveRunFilePath(rootDir, targetPath) {
        return path_1.default.isAbsolute(targetPath) ? targetPath : path_1.default.join(rootDir, targetPath);
    }
    buildActiveInstruction(changePath, executor, profileId) {
        if (executor === 'manual-bridge') {
            return [
                `Manual bridge is attached to ${changePath}.`,
                `Complete the implementation in your AI client and keep the protocol docs current.`,
                `Use "dorado run step" when you want Dorado to re-check, finalize, or archive according to the active runner profile.`,
                `For ${profileId}, you can still run "dorado verify ${changePath}" and "dorado finalize ${changePath}" yourself.`,
            ].join(' ');
        }
        return [
            `${executor} is configured for ${changePath}, but Dorado has not dispatched it yet.`,
            `Use "dorado run step" to dispatch the executor and poll later queue progress explicitly.`,
            profileId === 'archive-chain'
                ? 'Once the protocol becomes finalize-ready, Dorado will finish finalize/archive on a later explicit step.'
                : `For ${profileId}, Dorado will not finalize or archive automatically; keep using explicit verify/finalize when needed.`,
        ].join(' ');
    }
    buildRunInstruction(run) {
        if (!run.currentChangePath) {
            return run.remainingChanges.length > 0
                ? 'No active change is attached right now. Run "dorado run resume" to activate the next queued change.'
                : 'No active or queued changes are available right now.';
        }
        if (run.status === 'failed') {
            if (run.currentJob?.status === 'failed') {
                return (`${run.currentJob.executor} job ${run.currentJob.id} failed on ${run.currentJob.changeName}. ` +
                    'Inspect the saved executor output, fix the runtime or repository issue, then use "dorado run resume".');
            }
            if (run.failedChange?.note?.startsWith('runner-step-blocked:')) {
                return (`Runner is blocked on protocol checks for ${run.failedChange.name}. ` +
                    'Resolve the failing checks, then use "dorado run resume" and "dorado run step" to continue.');
            }
            return (`Run is failed on ${run.failedChange?.name ?? run.currentChange}. ` +
                'Review the current job and protocol state, then use "dorado run resume" when ready.');
        }
        if (run.status === 'paused') {
            if (run.currentJob?.status === 'running' || run.currentJob?.status === 'waiting_for_manual') {
                return (`Run is paused while job ${run.currentJob.id} is still ${run.currentJob.status}. ` +
                    'Use "dorado run resume" when you want Dorado to continue tracking this change.');
            }
            return (`Run is paused on ${run.currentChange}. ` +
                'Use "dorado run resume" to continue from the current active change.');
        }
        if (run.currentJob?.status === 'waiting_for_manual') {
            return (`Manual bridge is still waiting on ${run.currentJob.changeName}. ` +
                'Complete the change implementation and protocol docs, then run "dorado run step" to re-check progress.');
        }
        if (run.currentJob?.status === 'running') {
            return (`${run.currentJob.executor} job ${run.currentJob.id} has already been dispatched for ${run.currentJob.changeName}. ` +
                'Run "dorado run step" again when you want Dorado to poll the job and re-check protocol readiness.');
        }
        return this.buildActiveInstruction(run.currentChangePath, run.executor, run.profileId);
    }
    describeRunStage(run) {
        if (!run) {
            return null;
        }
        if (run.status === 'completed') {
            return 'queue-complete';
        }
        if (run.status === 'paused') {
            return run.currentJob ? `paused:${run.currentJob.status}` : 'paused';
        }
        if (run.status === 'failed') {
            if (run.currentJob?.status === 'failed') {
                return 'failed:executor';
            }
            if (run.failedChange?.note?.startsWith('runner-step-blocked:')) {
                return 'failed:protocol';
            }
            return 'failed';
        }
        if (!run.currentChangePath) {
            return run.remainingChanges.length > 0 ? 'awaiting-activation' : 'idle';
        }
        if (run.currentJob?.status === 'waiting_for_manual') {
            return 'active:waiting-for-manual';
        }
        if (run.currentJob?.status === 'running') {
            return 'active:waiting-for-executor-followup';
        }
        return 'active:attached';
    }
    getIdleInstruction(queuedCount) {
        if (queuedCount > 0) {
            return 'No queue run is active. Run "dorado run start" to begin processing queued changes.';
        }
        return 'No queue run is active.';
    }
}
exports.RunService = RunService;
function createRunService(fileService, projectService, configManager, executorService) {
    return new RunService(fileService, projectService, configManager, executorService);
}
//# sourceMappingURL=RunService.js.map