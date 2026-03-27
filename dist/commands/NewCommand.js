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
exports.NewCommand = void 0;
const gray_matter_1 = __importDefault(require("gray-matter"));
const path = __importStar(require("path"));
const constants_1 = require("../core/constants");
const services_1 = require("../services");
const PathUtils_1 = require("../utils/PathUtils");
const workflow_1 = require("../workflow");
const BaseCommand_1 = require("./BaseCommand");
class NewCommand extends BaseCommand_1.BaseCommand {
    async execute(featureName, rootDir, options = {}) {
        try {
            this.validateArgs([featureName], 1);
            services_1.services.validationService.validateFeatureName(featureName);
            const targetDir = rootDir || process.cwd();
            const hasActiveChanges = await services_1.services.projectService.hasActiveChanges(targetDir);
            const shouldQueue = options.queued === true || (!options.activate && hasActiveChanges);
            const bucket = shouldQueue ? 'queued' : 'active';
            const featureDir = PathUtils_1.PathUtils.getChangeDir(targetDir, bucket, featureName);
            const siblingFeatureDir = PathUtils_1.PathUtils.getChangeDir(targetDir, shouldQueue ? 'active' : 'queued', featureName);
            this.logger.info(`Creating ${bucket} change: ${featureName}`);
            if (options.activate === true && hasActiveChanges) {
                throw new Error('Cannot activate a new change while another active change exists.');
            }
            if ((await services_1.services.fileService.exists(featureDir)) ||
                (await services_1.services.fileService.exists(siblingFeatureDir))) {
                throw new Error(`Change ${featureName} already exists`);
            }
            await services_1.services.fileService.ensureDir(path.join(targetDir, constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.ACTIVE));
            await services_1.services.fileService.ensureDir(path.join(targetDir, constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.QUEUED));
            await services_1.services.fileService.ensureDir(featureDir);
            const config = await services_1.services.configManager.loadConfig(targetDir);
            const projectContext = await services_1.services.projectService.getFeatureProjectContext(targetDir, []);
            const workflowProfileId = (0, workflow_1.getModeDefaultWorkflowProfileId)(config.mode);
            const workflow = new workflow_1.ConfigurableWorkflow(config.mode);
            const optionalSteps = workflow.getActivatedSteps([]);
            await services_1.services.fileService.writeJSON(path.join(featureDir, constants_1.FILE_NAMES.STATE), services_1.services.stateManager.createInitialState(featureName, [], config.mode, workflowProfileId, {
                queued: shouldQueue,
                source: shouldQueue ? 'queue' : 'manual',
            }));
            await services_1.services.fileService.writeFile(path.join(featureDir, constants_1.FILE_NAMES.PROPOSAL), services_1.services.templateEngine.generateProposalTemplate({
                feature: featureName,
                mode: config.mode,
                projectContext,
            }));
            await services_1.services.fileService.writeFile(path.join(featureDir, constants_1.FILE_NAMES.TASKS), services_1.services.templateEngine.generateTasksTemplate({
                feature: featureName,
                mode: config.mode,
                projectContext,
            }));
            await services_1.services.fileService.writeFile(path.join(featureDir, constants_1.FILE_NAMES.VERIFICATION), services_1.services.templateEngine.generateVerificationTemplate({
                feature: featureName,
                mode: config.mode,
                projectContext,
            }));
            await services_1.services.fileService.writeFile(path.join(featureDir, constants_1.FILE_NAMES.REVIEW), services_1.services.templateEngine.generateReviewTemplate({
                feature: featureName,
                mode: config.mode,
                projectContext,
            }));
            for (const asset of (0, workflow_1.getOptionalStepProtocolAssets)(optionalSteps).filter(item => item.step !== 'code_review')) {
                await services_1.services.fileService.writeFile(path.join(featureDir, asset.fileName), services_1.services.templateEngine.generateOptionalStepTemplate(asset.step, {
                    feature: featureName,
                    mode: config.mode,
                    optionalSteps,
                    projectContext,
                }));
            }
            if (shouldQueue) {
                const proposalPath = path.join(featureDir, constants_1.FILE_NAMES.PROPOSAL);
                const proposal = (0, gray_matter_1.default)(await services_1.services.fileService.readFile(proposalPath));
                proposal.data.status = 'queued';
                await services_1.services.fileService.writeFile(proposalPath, gray_matter_1.default.stringify(proposal.content, proposal.data));
            }
            this.success(`${shouldQueue ? 'Queued' : 'Active'} change ${featureName} created at ${featureDir}`);
        }
        catch (error) {
            this.error(`Failed to create change: ${error}`);
            throw error;
        }
    }
}
exports.NewCommand = NewCommand;
//# sourceMappingURL=NewCommand.js.map