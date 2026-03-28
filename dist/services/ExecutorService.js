"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutorService = void 0;
exports.createExecutorService = createExecutorService;
const path_1 = __importDefault(require("path"));
const constants_1 = require("../core/constants");
const registry_1 = require("../executors/registry");
class ExecutorService {
    constructor(fileService) {
        this.fileService = fileService;
    }
    getCapability(executor) {
        return (0, registry_1.getExecutorAdapter)(executor).getCapability();
    }
    listCapabilities() {
        return (0, registry_1.listExecutorAdapters)().map(adapter => ({
            executor: adapter.executor,
            capability: adapter.getCapability(),
        }));
    }
    async createJobRecord(rootDir, request) {
        await this.ensureExecutorDirectories(rootDir);
        const result = await (0, registry_1.getExecutorAdapter)(request.executor).dispatch(request);
        await this.saveJob(rootDir, result.job);
        return result;
    }
    async pollJob(rootDir, job) {
        const result = await (0, registry_1.getExecutorAdapter)(job.executor).poll(job);
        if (result.changed) {
            await this.saveJob(rootDir, result.job);
        }
        return result;
    }
    async loadJob(rootDir, jobId) {
        const jobPath = this.getJobPath(rootDir, jobId);
        if (!(await this.fileService.exists(jobPath))) {
            return null;
        }
        const job = await this.fileService.readJSON(jobPath);
        return this.normalizeJob(job);
    }
    async saveJob(rootDir, job) {
        await this.ensureExecutorDirectories(rootDir);
        await this.fileService.writeJSON(this.getJobPath(rootDir, job.id), this.normalizeJob(job));
    }
    toSummary(job) {
        if (!job) {
            return null;
        }
        return {
            id: job.id,
            executor: job.executor,
            status: job.status,
            changeName: job.changeName,
            changePath: job.changePath,
            startedAt: job.startedAt,
            updatedAt: job.updatedAt,
            completedAt: job.completedAt,
            note: job.note,
            promptPath: job.promptPath,
            outputPath: job.outputPath,
        };
    }
    async ensureExecutorDirectories(rootDir) {
        await this.fileService.ensureDir(path_1.default.join(rootDir, '.dorado', constants_1.DIR_NAMES.RUNS, constants_1.DIR_NAMES.JOBS));
    }
    getJobPath(rootDir, jobId) {
        return path_1.default.join(rootDir, '.dorado', constants_1.DIR_NAMES.RUNS, constants_1.DIR_NAMES.JOBS, `${jobId}.json`);
    }
    normalizeJob(job) {
        return {
            ...job,
            completedAt: job.completedAt ?? null,
            note: job.note ?? null,
            promptPath: job.promptPath ?? null,
            outputPath: job.outputPath ?? null,
            dispatchedAt: job.dispatchedAt ?? null,
            lastPolledAt: job.lastPolledAt ?? null,
            lastError: job.lastError ?? null,
        };
    }
}
exports.ExecutorService = ExecutorService;
function createExecutorService(fileService) {
    return new ExecutorService(fileService);
}
//# sourceMappingURL=ExecutorService.js.map