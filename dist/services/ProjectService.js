"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectService = exports.ProjectService = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../core/constants");
const ProjectPresets_1 = require("../presets/ProjectPresets");
class ProjectService {
    constructor(fileService, configManager, templateEngine, indexBuilder, skillParser, projectAssetService, projectScaffoldService, projectScaffoldCommandService) {
        this.fileService = fileService;
        this.configManager = configManager;
        this.templateEngine = templateEngine;
        this.indexBuilder = indexBuilder;
        this.skillParser = skillParser;
        this.projectAssetService = projectAssetService;
        this.projectScaffoldService = projectScaffoldService;
        this.projectScaffoldCommandService = projectScaffoldCommandService;
    }
    async initializeProject(rootDir, mode, input) {
        const config = await this.configManager.createDefaultConfig(mode);
        await this.configManager.saveConfig(rootDir, config);
        await Promise.all(this.getDirectorySkeleton(rootDir).map(dirPath => this.fileService.ensureDir(dirPath)));
        const normalized = await this.normalizeProjectBootstrap(rootDir, mode, input);
        await this.writeProjectKnowledgeLayer(rootDir, mode, normalized);
        const scaffoldResult = await this.applyProjectScaffoldPhase(rootDir, normalized);
        const directCopyResult = await this.projectAssetService.installDirectCopyAssets(rootDir, normalized.documentLanguage);
        const hookResult = await this.projectAssetService.installGitHooks(rootDir, config.hooks);
        const commandPlan = this.projectScaffoldCommandService.getPlan(normalized, scaffoldResult.plan);
        const bootstrapSummaryRelativePath = `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/bootstrap-summary.md`;
        try {
            await this.indexBuilder.write(rootDir);
        }
        catch {
            await this.indexBuilder.createEmpty(rootDir);
        }
        await this.projectAssetService.writeAssetManifest(rootDir, {
            documentLanguage: normalized.documentLanguage,
            templateGeneratedPaths: this.getFullBootstrapTemplateGeneratedPaths(normalized),
            runtimeGeneratedPaths: [
                constants_1.FILE_NAMES.SKILLRC,
                constants_1.FILE_NAMES.SKILL_INDEX,
                '.dorado/asset-sources.json',
                bootstrapSummaryRelativePath,
            ],
        });
        let commandExecution = await this.projectScaffoldCommandService.executePlan(rootDir, commandPlan);
        let recoveryFilePath = null;
        if (commandExecution.status === 'failed') {
            const failedStep = commandExecution.steps.find(step => step.status === 'failed');
            if (failedStep) {
                recoveryFilePath = await this.projectScaffoldCommandService.writeRecoveryRecord(rootDir, {
                    normalized,
                    failedStep,
                    scaffoldCreatedFiles: scaffoldResult.createdFiles,
                    scaffoldCreatedDirectories: scaffoldResult.createdDirectories,
                    directCopyCreatedFiles: directCopyResult.created,
                    hookInstalledFiles: hookResult.installed,
                });
                commandExecution = {
                    ...commandExecution,
                    recoveryFilePath,
                };
            }
        }
        const firstChangeSuggestion = this.getFirstChangeSuggestion(normalized);
        await this.writeBootstrapSummary(rootDir, {
            mode,
            normalized,
            scaffoldPlan: scaffoldResult.plan,
            commandPlan,
            commandExecution,
            scaffoldCreatedFiles: scaffoldResult.createdFiles,
            scaffoldSkippedFiles: scaffoldResult.skippedFiles,
            scaffoldCreatedDirectories: scaffoldResult.createdDirectories,
            scaffoldSkippedDirectories: scaffoldResult.skippedDirectories,
            directCopyCreatedFiles: directCopyResult.created,
            directCopySkippedFiles: directCopyResult.skipped,
            hookInstalledFiles: hookResult.installed,
            hookSkippedFiles: hookResult.skipped,
            runtimeGeneratedFiles: [
                constants_1.FILE_NAMES.SKILLRC,
                constants_1.FILE_NAMES.SKILL_INDEX,
                '.dorado/asset-sources.json',
                bootstrapSummaryRelativePath,
            ],
            recoveryFilePath,
            firstChangeSuggestion,
        });
        return {
            projectName: normalized.projectName,
            mode,
            projectPresetId: normalized.projectPresetId,
            documentLanguage: normalized.documentLanguage,
            executeScaffoldCommands: normalized.executeScaffoldCommands,
            scaffoldPlan: scaffoldResult.plan,
            commandPlan,
            commandExecution,
            scaffoldCreatedFiles: scaffoldResult.createdFiles,
            scaffoldSkippedFiles: scaffoldResult.skippedFiles,
            scaffoldCreatedDirectories: scaffoldResult.createdDirectories,
            scaffoldSkippedDirectories: scaffoldResult.skippedDirectories,
            directCopyCreatedFiles: directCopyResult.created,
            directCopySkippedFiles: directCopyResult.skipped,
            hookInstalledFiles: hookResult.installed,
            hookSkippedFiles: hookResult.skipped,
            runtimeGeneratedFiles: [
                constants_1.FILE_NAMES.SKILLRC,
                constants_1.FILE_NAMES.SKILL_INDEX,
                '.dorado/asset-sources.json',
                bootstrapSummaryRelativePath,
            ],
            recoveryFilePath,
            firstChangeSuggestion,
        };
    }
    async generateProjectKnowledge(rootDir, input) {
        const config = await this.configManager.loadConfig(rootDir);
        await Promise.all(this.getKnowledgeLayerDirectorySkeleton(rootDir).map(dirPath => this.fileService.ensureDir(dirPath)));
        const normalized = await this.normalizeProjectBootstrap(rootDir, config.mode, {
            ...(await this.getBootstrapUpgradePlan(rootDir)),
            ...(input ?? {}),
        });
        const writeSummary = await this.writeProjectKnowledgeLayer(rootDir, config.mode, normalized);
        const directCopyResult = await this.projectAssetService.installDirectCopyAssets(rootDir, normalized.documentLanguage);
        const hookResult = await this.projectAssetService.installGitHooks(rootDir, config.hooks);
        try {
            await this.indexBuilder.write(rootDir);
        }
        catch {
            await this.indexBuilder.createEmpty(rootDir);
        }
        const runtimeGeneratedFiles = [
            constants_1.FILE_NAMES.SKILLRC,
            constants_1.FILE_NAMES.SKILL_INDEX,
            '.dorado/asset-sources.json',
        ];
        await this.projectAssetService.writeAssetManifest(rootDir, {
            documentLanguage: normalized.documentLanguage,
            templateGeneratedPaths: this.getFullBootstrapTemplateGeneratedPaths(normalized),
            runtimeGeneratedPaths: runtimeGeneratedFiles,
        });
        return {
            projectName: normalized.projectName,
            mode: config.mode,
            projectPresetId: normalized.projectPresetId,
            documentLanguage: normalized.documentLanguage,
            createdFiles: writeSummary.created,
            refreshedFiles: writeSummary.refreshed,
            skippedFiles: writeSummary.skipped,
            directCopyCreatedFiles: directCopyResult.created,
            directCopySkippedFiles: directCopyResult.skipped,
            hookInstalledFiles: hookResult.installed,
            hookSkippedFiles: hookResult.skipped,
            runtimeGeneratedFiles,
            firstChangeSuggestion: this.getFirstChangeSuggestion(normalized),
        };
    }
    async initializeProtocolShellProject(rootDir, mode, input) {
        const config = await this.configManager.createDefaultConfig(mode);
        await this.configManager.saveConfig(rootDir, config);
        await Promise.all(this.getProtocolShellDirectorySkeleton(rootDir).map(dirPath => this.fileService.ensureDir(dirPath)));
        const fallbackName = path_1.default.basename(path_1.default.resolve(rootDir));
        const normalized = this.templateEngine.normalizeProjectBootstrapInput(input, fallbackName, mode);
        await this.writeIfMissing(path_1.default.join(rootDir, constants_1.FILE_NAMES.SKILL_MD), this.renderProtocolShellRootSkill(normalized.projectName, normalized.documentLanguage, mode));
        const directCopyResult = await this.projectAssetService.installDirectCopyAssets(rootDir, normalized.documentLanguage);
        const hookResult = await this.projectAssetService.installGitHooks(rootDir, config.hooks);
        try {
            await this.indexBuilder.write(rootDir);
        }
        catch {
            await this.indexBuilder.createEmpty(rootDir);
        }
        await this.projectAssetService.writeAssetManifest(rootDir, {
            documentLanguage: normalized.documentLanguage,
            templateGeneratedPaths: this.getProtocolShellTemplateGeneratedPaths(),
            runtimeGeneratedPaths: [
                constants_1.FILE_NAMES.SKILLRC,
                constants_1.FILE_NAMES.SKILL_INDEX,
                '.dorado/asset-sources.json',
            ],
        });
        return {
            projectName: normalized.projectName,
            mode,
            projectPresetId: null,
            documentLanguage: normalized.documentLanguage,
            executeScaffoldCommands: false,
            scaffoldPlan: null,
            commandPlan: null,
            commandExecution: {
                status: 'skipped',
                steps: [],
                recoveryFilePath: null,
            },
            scaffoldCreatedFiles: [],
            scaffoldSkippedFiles: [],
            scaffoldCreatedDirectories: [],
            scaffoldSkippedDirectories: [],
            directCopyCreatedFiles: directCopyResult.created,
            directCopySkippedFiles: directCopyResult.skipped,
            hookInstalledFiles: hookResult.installed,
            hookSkippedFiles: hookResult.skipped,
            runtimeGeneratedFiles: [
                constants_1.FILE_NAMES.SKILLRC,
                constants_1.FILE_NAMES.SKILL_INDEX,
                '.dorado/asset-sources.json',
            ],
            recoveryFilePath: null,
            firstChangeSuggestion: null,
        };
    }
    async detectProjectStructure(rootDir) {
        const checks = await Promise.all(this.getStructureDefinitions().map(async (definition) => ({
            key: definition.key,
            path: path_1.default.join(rootDir, ...definition.pathSegments),
            exists: await this.fileService.exists(path_1.default.join(rootDir, ...definition.pathSegments)),
            required: Boolean(definition.required),
            category: definition.category ?? 'knowledge',
        })));
        const missingRequired = checks.filter(check => check.required && !check.exists).map(check => check.path);
        const missingRecommended = checks.filter(check => !check.required && !check.exists).map(check => check.path);
        const initialized = missingRequired.length === 0;
        const upgradeSuggestions = this.buildUpgradeSuggestions(checks, initialized);
        return {
            initialized,
            level: !initialized ? 'none' : missingRecommended.length === 0 ? 'full' : 'basic',
            checks,
            missingRequired,
            missingRecommended,
            upgradeSuggestions,
        };
    }
    async getProjectSummary(rootDir) {
        const structure = await this.detectProjectStructure(rootDir);
        const configPath = path_1.default.join(rootDir, constants_1.FILE_NAMES.SKILLRC);
        const mode = structure.initialized && (await this.fileService.exists(configPath))
            ? (await this.configManager.loadConfig(rootDir)).mode
            : null;
        const createdAt = (await this.fileService.exists(configPath))
            ? (await this.fileService.stat(configPath)).mtime.toISOString()
            : null;
        const execution = await this.getExecutionStatus(rootDir);
        return {
            name: path_1.default.basename(path_1.default.resolve(rootDir)),
            path: rootDir,
            mode,
            initialized: structure.initialized,
            structureLevel: structure.level,
            createdAt,
            activeChangeCount: execution.totalActiveChanges,
            docsRootExists: await this.fileService.exists(path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS)),
            forAiExists: await this.fileService.exists(path_1.default.join(rootDir, constants_1.DIR_NAMES.FOR_AI)),
            skillIndexExists: await this.fileService.exists(path_1.default.join(rootDir, constants_1.FILE_NAMES.SKILL_INDEX)),
        };
    }
    async getProjectAssetStatus(rootDir) {
        const manifestPath = path_1.default.join(rootDir, '.dorado', 'asset-sources.json');
        if (!(await this.fileService.exists(manifestPath))) {
            return {
                exists: false,
                path: manifestPath,
                generatedAt: null,
                summary: {
                    directCopy: 0,
                    templateGenerated: 0,
                    runtimeGenerated: 0,
                },
                directCopy: [],
                templateGenerated: [],
                runtimeGenerated: [],
            };
        }
        const manifest = await this.fileService.readJSON(manifestPath);
        const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
        return {
            exists: true,
            path: manifestPath,
            generatedAt: manifest.generatedAt || null,
            summary: manifest.summary || {
                directCopy: 0,
                templateGenerated: 0,
                runtimeGenerated: 0,
            },
            directCopy: assets.filter(asset => asset.strategy === 'direct_copy'),
            templateGenerated: assets.filter(asset => asset.strategy === 'template_generated'),
            runtimeGenerated: assets.filter(asset => asset.strategy === 'runtime_generated'),
        };
    }
    async scanProjectDocs(rootDir) {
        const definitions = this.getDocumentDefinitions();
        const items = await Promise.all(definitions.map(definition => this.toDocumentStatusItem(rootDir, definition)));
        const apiDocs = await this.scanApiDocs(rootDir);
        const designDocs = await this.scanDesignDocs(rootDir);
        const planningDocs = await this.scanPlanningDocs(rootDir);
        const existing = items.filter(item => item.exists).length;
        const updatedAt = this.maxUpdatedAt([
            ...items.map(item => item.updatedAt),
            ...apiDocs.map(item => item.updatedAt),
            ...designDocs.map(item => item.updatedAt),
            ...planningDocs.map(item => item.updatedAt),
        ]);
        return {
            total: items.length,
            existing,
            coverage: items.length === 0 ? 0 : Math.round((existing / items.length) * 100),
            items,
            apiDocs,
            designDocs,
            planningDocs,
            missingRequired: items.filter(item => item.required && !item.exists).map(item => item.path),
            missingRecommended: items.filter(item => !item.required && !item.exists).map(item => item.path),
            updatedAt,
        };
    }
    async scanModules(rootDir) {
        const modulesDir = path_1.default.join(rootDir, constants_1.DIR_NAMES.SRC, constants_1.DIR_NAMES.MODULES);
        if (!(await this.fileService.exists(modulesDir))) {
            return [];
        }
        const entries = await fs_extra_1.default.readdir(modulesDir, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => ({
            name: entry.name,
            path: path_1.default.join(modulesDir, entry.name),
            skillPath: path_1.default.join(modulesDir, entry.name, constants_1.FILE_NAMES.SKILL_MD),
            skillExists: fs_extra_1.default.existsSync(path_1.default.join(modulesDir, entry.name, constants_1.FILE_NAMES.SKILL_MD)),
        }));
    }
    async scanApiDocs(rootDir) {
        return this.scanDocsInDirectory(rootDir, constants_1.DIR_NAMES.API);
    }
    async scanDesignDocs(rootDir) {
        return this.scanDocsInDirectory(rootDir, constants_1.DIR_NAMES.DESIGN);
    }
    async scanPlanningDocs(rootDir) {
        return this.scanDocsInDirectory(rootDir, constants_1.DIR_NAMES.PLANNING);
    }
    async scanSkillHierarchy(rootDir) {
        const rootSkills = await Promise.all(this.getRootSkillDefinitions().map(definition => this.toSkillFileInfo(rootDir, definition)));
        const modules = await this.scanModules(rootDir);
        const moduleSkills = await Promise.all(modules.map(module => this.toSkillFileInfo(rootDir, {
            key: `module:${module.name}`,
            pathSegments: path_1.default.relative(rootDir, module.skillPath).split(path_1.default.sep),
        })));
        const skillIndexPath = path_1.default.join(rootDir, constants_1.FILE_NAMES.SKILL_INDEX);
        let skillIndexStats = null;
        let skillIndexUpdatedAt = null;
        let latestSourceUpdatedAt = null;
        if (await this.fileService.exists(skillIndexPath)) {
            try {
                const index = await this.fileService.readJSON(skillIndexPath);
                skillIndexStats = index.stats ?? null;
                skillIndexUpdatedAt = (await this.fileService.stat(skillIndexPath)).mtime.toISOString();
            }
            catch {
                skillIndexStats = null;
            }
        }
        const allSkills = [...rootSkills, ...moduleSkills];
        const existingSkillPaths = allSkills
            .filter(skill => skill.exists)
            .map(skill => skill.path);
        latestSourceUpdatedAt = await this.getLatestUpdatedAt(existingSkillPaths);
        const indexNeedsRebuild = this.shouldRebuildIndex(skillIndexUpdatedAt, latestSourceUpdatedAt, allSkills);
        const indexReasons = this.getIndexRebuildReasons(skillIndexPath, skillIndexUpdatedAt, latestSourceUpdatedAt, allSkills);
        return {
            totalSkillFiles: allSkills.length,
            existing: allSkills.filter(skill => skill.exists).length,
            missingRecommended: rootSkills.filter(skill => !skill.exists).map(skill => skill.path),
            rootSkills,
            moduleSkills,
            modules,
            skillIndex: {
                exists: await this.fileService.exists(skillIndexPath),
                path: skillIndexPath,
                updatedAt: skillIndexUpdatedAt,
                latestSourceUpdatedAt,
                needsRebuild: indexNeedsRebuild,
                stale: Boolean(skillIndexUpdatedAt) &&
                    Boolean(latestSourceUpdatedAt) &&
                    new Date(latestSourceUpdatedAt).getTime() > new Date(skillIndexUpdatedAt).getTime(),
                reasons: indexReasons,
                stats: skillIndexStats,
            },
        };
    }
    async getExecutionStatus(rootDir) {
        const featuresDir = path_1.default.join(rootDir, constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.ACTIVE);
        if (!(await this.fileService.exists(featuresDir))) {
            return {
                totalActiveChanges: 0,
                byStatus: {},
                activeChanges: [],
            };
        }
        const entries = await fs_extra_1.default.readdir(featuresDir, { withFileTypes: true });
        const activeChanges = [];
        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }
            const featureDir = path_1.default.join(featuresDir, entry.name);
            const statePath = path_1.default.join(featureDir, constants_1.FILE_NAMES.STATE);
            if (!(await this.fileService.exists(statePath))) {
                continue;
            }
            const state = await this.fileService.readJSON(statePath);
            const proposalPath = path_1.default.join(featureDir, constants_1.FILE_NAMES.PROPOSAL);
            let flags = [];
            let description = 'No description yet';
            if (await this.fileService.exists(proposalPath)) {
                const proposal = (0, gray_matter_1.default)(await this.fileService.readFile(proposalPath));
                flags = Array.isArray(proposal.data.flags) ? proposal.data.flags : [];
                description = this.extractDescription(proposal.content);
            }
            activeChanges.push({
                name: state.feature,
                status: state.status,
                progress: this.calculateProgress(state),
                currentStep: state.current_step,
                flags,
                description,
            });
        }
        const byStatus = {};
        for (const change of activeChanges) {
            byStatus[change.status] = (byStatus[change.status] ?? 0) + 1;
        }
        return {
            totalActiveChanges: activeChanges.length,
            byStatus,
            activeChanges: activeChanges.sort((left, right) => left.name.localeCompare(right.name)),
        };
    }
    async getFeatureProjectContext(rootDir, affects = []) {
        const affectSlugs = affects
            .map(item => this.toSlug(item))
            .filter(Boolean);
        const projectDocs = (await Promise.all([
            ['项目概览', path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'overview.md')],
            ['技术栈', path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'tech-stack.md')],
            ['架构说明', path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'architecture.md')],
            ['模块地图', path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'module-map.md')],
            ['API 总览', path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'api-overview.md')],
        ].map(async ([title, filePath]) => (await this.fileService.exists(filePath)
            ? { title, path: this.toRelativePath(rootDir, filePath) }
            : null)))).filter((item) => Boolean(item));
        const modules = await this.scanModules(rootDir);
        const moduleSkills = modules
            .filter(module => module.skillExists)
            .filter(module => affectSlugs.length === 0 ||
            affectSlugs.includes(this.toSlug(module.name)) ||
            affectSlugs.some(slug => this.toSlug(module.name).includes(slug)))
            .map(module => ({
            title: `${module.name} 模块技能`,
            path: this.toRelativePath(rootDir, module.skillPath),
        }));
        const apiDocs = this.filterKnowledgeDocsByAffects(await this.scanApiDocs(rootDir), affectSlugs)
            .map(item => ({
            title: item.name.replace(/\.md$/i, ''),
            path: this.toRelativePath(rootDir, item.path),
        }));
        const designDocs = (await this.scanDesignDocs(rootDir))
            .filter(item => item.name.toLowerCase() !== 'readme.md')
            .map(item => ({
            title: item.name.replace(/\.md$/i, ''),
            path: this.toRelativePath(rootDir, item.path),
        }));
        const planningDocs = (await this.scanPlanningDocs(rootDir))
            .filter(item => item.name.toLowerCase() !== 'readme.md')
            .map(item => ({
            title: item.name.replace(/\.md$/i, ''),
            path: this.toRelativePath(rootDir, item.path),
        }));
        return {
            projectDocs,
            moduleSkills,
            apiDocs,
            designDocs,
            planningDocs,
        };
    }
    async getDocsStatus(rootDir) {
        return this.scanProjectDocs(rootDir);
    }
    async getSkillsStatus(rootDir) {
        return this.scanSkillHierarchy(rootDir);
    }
    async getIndexStatus(rootDir) {
        const skills = await this.getSkillsStatus(rootDir);
        return skills.skillIndex;
    }
    async getBootstrapUpgradePlan(rootDir) {
        const docsRoot = path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT);
        const readMarkdown = async (filePath) => {
            if (!(await this.fileService.exists(filePath))) {
                return '';
            }
            try {
                const parsed = (0, gray_matter_1.default)(await this.fileService.readFile(filePath));
                return parsed.content.trim();
            }
            catch {
                return '';
            }
        };
        const extractBulletList = (content) => content
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => /^-\s+/.test(line))
            .map(line => line.replace(/^-\s+/, '').trim())
            .filter(Boolean);
        const extractParagraph = (content) => content
            .split(/\r?\n\r?\n/)
            .map(block => block.trim())
            .find(block => block && !block.startsWith('#') && !block.startsWith('- '))
            ?.replace(/\r?\n/g, ' ')
            .trim() || '';
        const [overviewContent, techStackContent, architectureContent] = await Promise.all([
            readMarkdown(path_1.default.join(docsRoot, 'overview.md')),
            readMarkdown(path_1.default.join(docsRoot, 'tech-stack.md')),
            readMarkdown(path_1.default.join(docsRoot, 'architecture.md')),
        ]);
        const modules = await this.inferBootstrapModules(rootDir);
        const apiDocs = await this.scanApiDocs(rootDir);
        const designDocs = await this.scanDesignDocs(rootDir);
        const planningDocs = await this.scanPlanningDocs(rootDir);
        return {
            projectName: path_1.default.basename(path_1.default.resolve(rootDir)),
            summary: extractParagraph(overviewContent),
            techStack: extractBulletList(techStackContent),
            architecture: extractParagraph(architectureContent),
            modules,
            apiAreas: apiDocs
                .filter(item => item.name.toLowerCase() !== 'readme.md')
                .map(item => item.name.replace(/\.md$/i, '').replace(/-/g, ' ')),
            designDocs: designDocs
                .filter(item => item.name.toLowerCase() !== 'readme.md')
                .map(item => item.name.replace(/\.md$/i, '').replace(/-/g, ' ')),
            planningDocs: planningDocs
                .filter(item => item.name.toLowerCase() !== 'readme.md')
                .map(item => item.name.replace(/\.md$/i, '').replace(/-/g, ' ')),
        };
    }
    previewBootstrap(rootDir, mode, input) {
        return this.buildBootstrapPreview(rootDir, mode, input);
    }
    async inferBootstrapModules(rootDir) {
        const inferred = new Set();
        const pushDirectories = async (pathSegments, options = {}) => {
            const directoryPath = path_1.default.join(rootDir, ...pathSegments);
            if (!(await this.fileService.exists(directoryPath))) {
                return;
            }
            const entries = await fs_extra_1.default.readdir(directoryPath, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory()) {
                    continue;
                }
                const normalizedName = entry.name.trim();
                if (!normalizedName || normalizedName.startsWith('.')) {
                    continue;
                }
                if ((options.exclude ?? []).includes(normalizedName.toLowerCase())) {
                    continue;
                }
                inferred.add(normalizedName);
            }
        };
        await pushDirectories([constants_1.DIR_NAMES.SRC, constants_1.DIR_NAMES.MODULES]);
        await pushDirectories(['apps']);
        await pushDirectories(['packages']);
        await pushDirectories(['services']);
        await pushDirectories(['modules']);
        if (inferred.size === 0) {
            await pushDirectories([constants_1.DIR_NAMES.SRC], {
                exclude: ['core', 'modules', 'utils', 'shared', 'types', 'assets', 'styles', 'tests', '__tests__'],
            });
        }
        return Array.from(inferred).sort((left, right) => left.localeCompare(right));
    }
    getBootstrapFieldPolicy() {
        return [
            { key: 'projectName', required: true, allowPlaceholder: false },
            { key: 'summary', required: false, allowPlaceholder: true },
            { key: 'techStack', required: false, allowPlaceholder: true },
            { key: 'architecture', required: false, allowPlaceholder: true },
            { key: 'modules', required: false, allowPlaceholder: true },
            { key: 'apiAreas', required: false, allowPlaceholder: true },
            { key: 'designDocs', required: false, allowPlaceholder: true },
            { key: 'planningDocs', required: false, allowPlaceholder: true },
        ];
    }
    getBootstrapStructurePolicy(rootDir) {
        const definitions = this.getStructureDefinitions();
        const toPath = (definition) => path_1.default.join(rootDir, ...definition.pathSegments);
        return {
            minimumRequiredPaths: definitions
                .filter(definition => definition.required)
                .map(definition => toPath(definition)),
            recommendedPaths: definitions.map(definition => toPath(definition)),
            compatibleMissingRecommendedPaths: definitions
                .filter(definition => !definition.required)
                .map(definition => toPath(definition)),
        };
    }
    async buildBootstrapPreview(rootDir, mode, input) {
        const fallbackName = path_1.default.basename(path_1.default.resolve(rootDir));
        const inferredModules = await this.inferBootstrapModules(rootDir);
        const presetDefaults = this.getPresetDefaults(input);
        const normalized = this.templateEngine.normalizeProjectBootstrapInput(input, fallbackName, mode, {
            modules: inferredModules,
        }, presetDefaults);
        const assetPlan = this.getBootstrapAssetPlan(normalized.documentLanguage, normalized);
        const scaffoldPlan = await this.projectScaffoldService.getPlanForProject(rootDir, normalized);
        const commandPlan = this.projectScaffoldCommandService.getPlan(normalized, scaffoldPlan);
        return {
            projectPresetId: normalized.projectPresetId,
            projectName: normalized.projectName,
            mode,
            summary: normalized.summary,
            techStack: normalized.techStack,
            modules: normalized.modules,
            apiAreas: normalized.apiAreas,
            designDocs: normalized.designDocs,
            planningDocs: normalized.planningDocs,
            moduleSkillFiles: normalized.modulePlans.map(plan => plan.path),
            moduleApiDocFiles: normalized.moduleApiPlans.map(plan => plan.path),
            apiDocFiles: normalized.apiAreaPlans.map(plan => plan.path),
            designDocFiles: normalized.designDocPlans.map(plan => plan.path),
            planningDocFiles: normalized.planningDocPlans.map(plan => plan.path),
            inferredModules,
            fieldPolicy: this.getBootstrapFieldPolicy(),
            structurePolicy: this.getBootstrapStructurePolicy(rootDir),
            assetPlan,
            scaffoldPlan,
            commandPlan,
            firstChangeSuggestion: this.getFirstChangeSuggestion(normalized),
            usedFallbacks: normalized.usedFallbacks,
            fieldSources: normalized.fieldSources,
            files: [
                constants_1.FILE_NAMES.SKILLRC,
                constants_1.FILE_NAMES.README,
                constants_1.FILE_NAMES.SKILL_MD,
                constants_1.FILE_NAMES.SKILL_INDEX,
                `${constants_1.DIR_NAMES.DOCS}/${constants_1.FILE_NAMES.SKILL_MD}`,
                `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/overview.md`,
                `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/tech-stack.md`,
                `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/architecture.md`,
                `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/module-map.md`,
                `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/api-overview.md`,
                `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.DESIGN}/README.md`,
                `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PLANNING}/README.md`,
                `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.API}/README.md`,
                `${constants_1.DIR_NAMES.SRC}/${constants_1.FILE_NAMES.SKILL_MD}`,
                `${constants_1.DIR_NAMES.SRC}/${constants_1.DIR_NAMES.CORE}/${constants_1.FILE_NAMES.SKILL_MD}`,
                `${constants_1.DIR_NAMES.TESTS}/${constants_1.FILE_NAMES.SKILL_MD}`,
                `${constants_1.DIR_NAMES.FOR_AI}/${constants_1.FILE_NAMES.AI_GUIDE}`,
                `${constants_1.DIR_NAMES.FOR_AI}/${constants_1.FILE_NAMES.EXECUTION_PROTOCOL}`,
                '.dorado/asset-sources.json',
                ...this.projectAssetService.getDirectCopyTargetPaths(),
                ...(scaffoldPlan?.files || []).map(file => file.path),
                ...normalized.modulePlans.map(plan => plan.path),
                ...normalized.moduleApiPlans.map(plan => plan.path),
                ...normalized.apiAreaPlans.map(plan => plan.path),
                ...normalized.designDocPlans.map(plan => plan.path),
                ...normalized.planningDocPlans.map(plan => plan.path),
            ],
        };
    }
    async rebuildIndex(rootDir) {
        await this.projectAssetService.installDirectCopyAssets(rootDir);
        await this.indexBuilder.write(rootDir);
        return this.getIndexStatus(rootDir);
    }
    getDirectorySkeleton(rootDir) {
        return [
            path_1.default.join(rootDir, constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.ACTIVE),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.ARCHIVED),
            path_1.default.join(rootDir, '.dorado'),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.DESIGN),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PLANNING),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.API),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.SRC, constants_1.DIR_NAMES.CORE),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.SRC, constants_1.DIR_NAMES.MODULES),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.TESTS),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.FOR_AI),
        ];
    }
    getProtocolShellDirectorySkeleton(rootDir) {
        return [
            path_1.default.join(rootDir, constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.ACTIVE),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.ARCHIVED),
            path_1.default.join(rootDir, '.dorado'),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.FOR_AI),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS),
        ];
    }
    getKnowledgeLayerDirectorySkeleton(rootDir) {
        return [
            path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.DESIGN),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PLANNING),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.API),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.SRC, constants_1.DIR_NAMES.CORE),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.SRC, constants_1.DIR_NAMES.MODULES),
            path_1.default.join(rootDir, constants_1.DIR_NAMES.TESTS),
        ];
    }
    getMinimumRuntimeStructureDefinitions() {
        return [
            { key: constants_1.FILE_NAMES.SKILLRC, pathSegments: [constants_1.FILE_NAMES.SKILLRC], required: true, category: 'core' },
            {
                key: `${constants_1.DIR_NAMES.CHANGES}/${constants_1.DIR_NAMES.ACTIVE}`,
                pathSegments: [constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.ACTIVE],
                required: true,
                category: 'core',
            },
            {
                key: `${constants_1.DIR_NAMES.CHANGES}/${constants_1.DIR_NAMES.ARCHIVED}`,
                pathSegments: [constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.ARCHIVED],
                required: true,
                category: 'core',
            },
            { key: '.dorado', pathSegments: ['.dorado'], required: true, category: 'core' },
        ];
    }
    getProtocolShellRecommendedDefinitions() {
        return [
            { key: constants_1.FILE_NAMES.SKILL_MD, pathSegments: [constants_1.FILE_NAMES.SKILL_MD], category: 'core' },
            { key: constants_1.FILE_NAMES.SKILL_INDEX, pathSegments: [constants_1.FILE_NAMES.SKILL_INDEX], category: 'core' },
            { key: constants_1.FILE_NAMES.BUILD_INDEX_SCRIPT, pathSegments: [constants_1.FILE_NAMES.BUILD_INDEX_SCRIPT], category: 'core' },
            { key: constants_1.DIR_NAMES.DOCS, pathSegments: [constants_1.DIR_NAMES.DOCS], category: 'knowledge' },
            {
                key: `${constants_1.DIR_NAMES.FOR_AI}/${constants_1.FILE_NAMES.AI_GUIDE}`,
                pathSegments: [constants_1.DIR_NAMES.FOR_AI, constants_1.FILE_NAMES.AI_GUIDE],
                category: 'core',
            },
            {
                key: `${constants_1.DIR_NAMES.FOR_AI}/${constants_1.FILE_NAMES.EXECUTION_PROTOCOL}`,
                pathSegments: [constants_1.DIR_NAMES.FOR_AI, constants_1.FILE_NAMES.EXECUTION_PROTOCOL],
                category: 'core',
            },
            {
                key: `${constants_1.DIR_NAMES.FOR_AI}/naming-conventions.md`,
                pathSegments: [constants_1.DIR_NAMES.FOR_AI, 'naming-conventions.md'],
                category: 'core',
            },
            {
                key: `${constants_1.DIR_NAMES.FOR_AI}/skill-conventions.md`,
                pathSegments: [constants_1.DIR_NAMES.FOR_AI, 'skill-conventions.md'],
                category: 'core',
            },
            {
                key: `${constants_1.DIR_NAMES.FOR_AI}/workflow-conventions.md`,
                pathSegments: [constants_1.DIR_NAMES.FOR_AI, 'workflow-conventions.md'],
                category: 'core',
            },
            {
                key: `${constants_1.DIR_NAMES.FOR_AI}/development-guide.md`,
                pathSegments: [constants_1.DIR_NAMES.FOR_AI, 'development-guide.md'],
                category: 'core',
            },
        ];
    }
    getProjectKnowledgeStructureDefinitions() {
        return [
            {
                key: `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/overview.md`,
                pathSegments: [constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'overview.md'],
            },
            {
                key: `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/tech-stack.md`,
                pathSegments: [constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'tech-stack.md'],
            },
            {
                key: `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/architecture.md`,
                pathSegments: [constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'architecture.md'],
            },
            {
                key: `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/module-map.md`,
                pathSegments: [constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'module-map.md'],
            },
            {
                key: `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/api-overview.md`,
                pathSegments: [constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'api-overview.md'],
            },
        ];
    }
    getStructureDefinitions() {
        return [
            ...this.getMinimumRuntimeStructureDefinitions(),
            ...this.getProtocolShellRecommendedDefinitions(),
            ...this.getProjectKnowledgeStructureDefinitions(),
        ];
    }
    getDocumentDefinitions() {
        return this.getProjectKnowledgeStructureDefinitions();
    }
    getRootSkillDefinitions() {
        return [{ key: constants_1.FILE_NAMES.SKILL_MD, pathSegments: [constants_1.FILE_NAMES.SKILL_MD] }];
    }
    async toDocumentStatusItem(rootDir, definition) {
        const filePath = path_1.default.join(rootDir, ...definition.pathSegments);
        const exists = await this.fileService.exists(filePath);
        const updatedAt = exists ? (await this.fileService.stat(filePath)).mtime.toISOString() : null;
        return {
            key: definition.key,
            path: filePath,
            exists,
            required: Boolean(definition.required),
            updatedAt,
        };
    }
    async toSkillFileInfo(rootDir, definition) {
        const filePath = path_1.default.join(rootDir, ...definition.pathSegments);
        const exists = await this.fileService.exists(filePath);
        if (!exists) {
            return {
                key: definition.key,
                path: filePath,
                exists: false,
                title: null,
                tags: [],
                sectionCount: 0,
                sectionTitles: [],
            };
        }
        try {
            const parsed = this.skillParser.parseSkillFile(await this.fileService.readFile(filePath));
            return {
                key: definition.key,
                path: filePath,
                exists: true,
                title: parsed.frontmatter.title || parsed.frontmatter.name || null,
                tags: parsed.frontmatter.tags,
                sectionCount: Object.keys(parsed.sections).length,
                sectionTitles: Object.keys(parsed.sections),
            };
        }
        catch {
            return {
                key: definition.key,
                path: filePath,
                exists: true,
                title: null,
                tags: [],
                sectionCount: 0,
                sectionTitles: [],
            };
        }
    }
    async writeIfMissing(filePath, content) {
        if (!(await this.fileService.exists(filePath))) {
            await this.fileService.writeFile(filePath, content);
        }
    }
    async normalizeProjectBootstrap(rootDir, mode, input) {
        const projectName = path_1.default.basename(path_1.default.resolve(rootDir));
        const inferredDefaults = {
            modules: await this.inferBootstrapModules(rootDir),
        };
        const presetDefaults = this.getPresetDefaults(input);
        return this.templateEngine.normalizeProjectBootstrapInput(input, projectName, mode, inferredDefaults, presetDefaults);
    }
    async writeProjectKnowledgeLayer(rootDir, mode, normalized) {
        const result = {
            created: [],
            refreshed: [],
            skipped: [],
        };
        const projectName = normalized.projectName;
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.FILE_NAMES.README), this.templateEngine.generateProjectReadmeTemplate(projectName, mode, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.FILE_NAMES.SKILL_MD), this.templateEngine.generateRootSkillTemplate(projectName, mode, normalized), result, { overwriteProtocolShellRootSkill: true });
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.FILE_NAMES.SKILL_MD), this.templateEngine.generateDocsSkillTemplate(projectName, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.SRC, constants_1.FILE_NAMES.SKILL_MD), this.templateEngine.generateSrcSkillTemplate(projectName, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.SRC, constants_1.DIR_NAMES.CORE, constants_1.FILE_NAMES.SKILL_MD), this.templateEngine.generateCoreSkillTemplate(projectName, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.TESTS, constants_1.FILE_NAMES.SKILL_MD), this.templateEngine.generateTestsSkillTemplate(projectName, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'overview.md'), this.templateEngine.generateProjectOverviewTemplate(projectName, mode, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'tech-stack.md'), this.templateEngine.generateTechStackTemplate(projectName, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'architecture.md'), this.templateEngine.generateArchitectureTemplate(projectName, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'module-map.md'), this.templateEngine.generateModuleMapTemplate(projectName, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'api-overview.md'), this.templateEngine.generateApiOverviewTemplate(projectName, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.DESIGN, 'README.md'), this.templateEngine.generateDesignDocsTemplate(projectName, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PLANNING, 'README.md'), this.templateEngine.generatePlanningDocsTemplate(projectName, normalized), result);
        await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.API, 'README.md'), this.templateEngine.generateApiDocsTemplate(projectName, normalized), result);
        for (const modulePlan of normalized.modulePlans) {
            await this.fileService.ensureDir(path_1.default.join(rootDir, constants_1.DIR_NAMES.SRC, constants_1.DIR_NAMES.MODULES, modulePlan.name));
            await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, ...modulePlan.path.split('/')), this.templateEngine.generateModuleSkillTemplate(projectName, modulePlan.displayName, normalized, modulePlan.name), result);
        }
        for (const moduleApiPlan of normalized.moduleApiPlans) {
            const moduleSlug = moduleApiPlan.name.replace(/^module-/, '');
            const modulePlan = normalized.modulePlans.find(plan => plan.name === moduleSlug);
            await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, ...moduleApiPlan.path.split('/')), this.templateEngine.generateModuleApiDocTemplate(projectName, modulePlan?.displayName ?? moduleSlug, normalized, moduleSlug), result);
        }
        for (const apiAreaPlan of normalized.apiAreaPlans) {
            await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, ...apiAreaPlan.path.split('/')), this.templateEngine.generateApiAreaDocTemplate(projectName, apiAreaPlan.displayName, normalized), result);
        }
        for (const designDocPlan of normalized.designDocPlans) {
            await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, ...designDocPlan.path.split('/')), this.templateEngine.generateDesignDocTemplate(projectName, designDocPlan.displayName, normalized), result);
        }
        for (const planningDocPlan of normalized.planningDocPlans) {
            await this.writeGeneratedFile(rootDir, path_1.default.join(rootDir, ...planningDocPlan.path.split('/')), this.templateEngine.generatePlanningDocTemplate(projectName, planningDocPlan.displayName, normalized), result);
        }
        return result;
    }
    async writeGeneratedFile(rootDir, filePath, content, result, options = {}) {
        const relativePath = this.toRelativePath(rootDir, filePath);
        const exists = await this.fileService.exists(filePath);
        const shouldOverwrite = exists &&
            options.overwriteProtocolShellRootSkill === true &&
            (await this.isProtocolShellRootSkill(filePath));
        if (!exists || shouldOverwrite) {
            await this.fileService.writeFile(filePath, content);
            if (shouldOverwrite) {
                result.refreshed.push(relativePath);
            }
            else {
                result.created.push(relativePath);
            }
            return;
        }
        result.skipped.push(relativePath);
    }
    async isProtocolShellRootSkill(filePath) {
        if (!(await this.fileService.exists(filePath))) {
            return false;
        }
        const content = await this.fileService.readFile(filePath);
        return (content.includes('Layer: protocol shell') ||
            content.includes('协议壳') ||
            content.includes('project knowledge: not generated yet'));
    }
    createEmptyScaffoldResult() {
        return {
            plan: null,
            createdDirectories: [],
            skippedDirectories: [],
            createdFiles: [],
            skippedFiles: [],
        };
    }
    async applyProjectScaffoldPhase(rootDir, normalized) {
        return ((await this.projectScaffoldService.applyScaffold(rootDir, normalized)) ??
            this.createEmptyScaffoldResult());
    }
    getProtocolShellTemplateGeneratedPaths() {
        return [
            constants_1.FILE_NAMES.SKILL_MD,
        ];
    }
    getFullBootstrapTemplateGeneratedPaths(normalized) {
        return [
            constants_1.FILE_NAMES.README,
            constants_1.FILE_NAMES.SKILL_MD,
            `${constants_1.DIR_NAMES.DOCS}/${constants_1.FILE_NAMES.SKILL_MD}`,
            `${constants_1.DIR_NAMES.SRC}/${constants_1.FILE_NAMES.SKILL_MD}`,
            `${constants_1.DIR_NAMES.SRC}/${constants_1.DIR_NAMES.CORE}/${constants_1.FILE_NAMES.SKILL_MD}`,
            `${constants_1.DIR_NAMES.TESTS}/${constants_1.FILE_NAMES.SKILL_MD}`,
            `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/overview.md`,
            `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/tech-stack.md`,
            `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/architecture.md`,
            `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/module-map.md`,
            `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/api-overview.md`,
            `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.DESIGN}/README.md`,
            `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PLANNING}/README.md`,
            `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.API}/README.md`,
            ...normalized.modulePlans.map(plan => plan.path),
            ...normalized.moduleApiPlans.map(plan => plan.path),
            ...normalized.apiAreaPlans.map(plan => plan.path),
            ...normalized.designDocPlans.map(plan => plan.path),
            ...normalized.planningDocPlans.map(plan => plan.path),
        ];
    }
    getBootstrapAssetPlan(documentLanguage, normalized) {
        const staticPlan = this.projectAssetService.getAssetPlan(documentLanguage);
        return {
            directCopyFiles: staticPlan.directCopyFiles,
            templateGeneratedFiles: this.getFullBootstrapTemplateGeneratedPaths(normalized),
            runtimeGeneratedFiles: [
                constants_1.FILE_NAMES.SKILLRC,
                constants_1.FILE_NAMES.SKILL_INDEX,
                '.dorado/asset-sources.json',
                `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PROJECT}/bootstrap-summary.md`,
            ],
            localizedCopySources: staticPlan.localizedCopySources,
        };
    }
    renderProtocolShellRootSkill(projectName, documentLanguage, mode) {
        const isEnglish = documentLanguage === 'en-US';
        const title = isEnglish ? `${projectName} Protocol Shell` : `${projectName} 协议壳`;
        const body = isEnglish
            ? `# ${projectName}

> Layer: protocol shell

## Current State

- Project: ${projectName}
- Mode: ${mode}
- Status: Dorado protocol shell initialized
- Project knowledge: not generated yet

## Read First

- [AI guide](for-ai/ai-guide.md)
- [Execution protocol](for-ai/execution-protocol.md)
- [Naming conventions](for-ai/naming-conventions.md)
- [Skill conventions](for-ai/skill-conventions.md)
- [Workflow conventions](for-ai/workflow-conventions.md)
- [Development guide](for-ai/development-guide.md)

## Notes

- This repository currently contains only the Dorado protocol shell.
- Project docs, source structure, tests, and business scaffold should be generated later through explicit skills or commands.
- Active changes live under \`changes/active/<change>\`.`
            : `# ${projectName}

> 层级：协议壳

## 当前状态

- 项目：${projectName}
- 模式：${mode}
- 状态：已完成 Dorado 协议壳初始化
- 项目知识：尚未生成

## 优先阅读

- [AI 指南](for-ai/ai-guide.md)
- [执行协议](for-ai/execution-protocol.md)
- [命名规范](for-ai/naming-conventions.md)
- [SKILL 规范](for-ai/skill-conventions.md)
- [workflow 规范](for-ai/workflow-conventions.md)
- [开发指南](for-ai/development-guide.md)

## 说明

- 当前仓库只完成了 Dorado 协议壳初始化。
- 项目 docs、源码结构、测试结构和业务 scaffold 应由后续显式技能或命令逐步生成。
- 活跃变更位于 \`changes/active/<change>\`。`;
        return `---
name: ${projectName}
title: ${title}
tags: [dorado, protocol-shell, ${mode}]
---

${body}
`;
    }
    async writeBootstrapSummary(rootDir, input) {
        const filePath = path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, constants_1.DIR_NAMES.PROJECT, 'bootstrap-summary.md');
        await this.fileService.writeFile(filePath, this.renderBootstrapSummary(input, rootDir));
    }
    renderBootstrapSummary(input, rootDir) {
        const isEnglish = input.normalized.documentLanguage === 'en-US';
        const title = isEnglish ? 'Bootstrap Summary' : '初始化摘要';
        const commandStatus = this.describeCommandExecutionStatus(input.commandExecution.status, input.normalized.documentLanguage);
        const formatPaths = (items, emptyLabel) => items.length > 0 ? items.map(item => `- \`${item}\``).join('\n') : `- ${emptyLabel}`;
        const formatCommandSteps = () => {
            if (!input.commandPlan || input.commandPlan.steps.length === 0) {
                return isEnglish ? '- No scaffold command plan.' : '- 当前没有脚手架命令计划。';
            }
            return input.commandPlan.steps
                .map(step => `- \`${step.shellCommand}\` (${step.description})`)
                .join('\n');
        };
        const formatSuggestion = () => {
            if (!input.firstChangeSuggestion) {
                return isEnglish ? '- No preset-driven first change suggestion.' : '- 当前没有预设驱动的首个变更建议。';
            }
            return [
                `- ${isEnglish ? 'Suggested change' : '建议变更'}: \`${input.firstChangeSuggestion.name}\``,
                `- ${isEnglish ? 'Affects' : '影响模块'}: ${input.firstChangeSuggestion.affects.join(', ') || '-'}`,
                `- ${isEnglish ? 'Flags' : '标记'}: ${input.firstChangeSuggestion.flags.join(', ') || '-'}`,
            ].join('\n');
        };
        const recoveryLine = input.recoveryFilePath
            ? `- ${isEnglish ? 'Recovery record' : '补救记录'}: \`${this.toRelativePath(rootDir, input.recoveryFilePath)}\``
            : `- ${isEnglish ? 'Recovery record' : '补救记录'}: ${isEnglish ? 'None' : '无'}`;
        return `---
name: bootstrap-summary
title: "${input.normalized.projectName} ${title}"
tags: [project, bootstrap, scaffold]
---

# ${title}

## ${isEnglish ? 'Context' : '上下文'}

- ${isEnglish ? 'Project' : '项目'}: ${input.normalized.projectName}
- ${isEnglish ? 'Mode' : '模式'}: ${input.mode}
- ${isEnglish ? 'Preset' : 'Preset'}: ${input.normalized.projectPresetId || (isEnglish ? 'None' : '无')}
- ${isEnglish ? 'Document language' : '文档语言'}: ${input.normalized.documentLanguage}
- ${isEnglish ? 'Scaffold command execution' : '脚手架命令执行'}: ${commandStatus}

## ${isEnglish ? 'Business Scaffold' : '业务框架脚手架'}

- ${isEnglish ? 'Framework' : '框架方案'}: ${input.scaffoldPlan?.framework || (isEnglish ? 'None' : '无')}
- ${isEnglish ? 'Install command' : '安装命令'}: ${input.scaffoldPlan?.installCommand || (isEnglish ? 'None' : '无')}

### ${isEnglish ? 'Created directories' : '本次创建目录'}

${formatPaths(input.scaffoldCreatedDirectories, isEnglish ? 'No new scaffold directories were created.' : '本次没有新建业务框架目录。')}

### ${isEnglish ? 'Created files' : '本次创建文件'}

${formatPaths(input.scaffoldCreatedFiles, isEnglish ? 'No new scaffold files were created.' : '本次没有新建业务框架文件。')}

### ${isEnglish ? 'Preserved existing scaffold paths' : '已保留的现有框架路径'}

${formatPaths([...input.scaffoldSkippedDirectories, ...input.scaffoldSkippedFiles], isEnglish ? 'No scaffold paths were preserved.' : '当前没有需要保留的现有框架路径。')}

## ${isEnglish ? 'Dorado Knowledge Backfill' : 'Dorado 知识回填'}

### ${isEnglish ? 'Direct-copy assets created' : '直接复制资产'}

${formatPaths(input.directCopyCreatedFiles, isEnglish ? 'No direct-copy assets were created.' : '本次没有新建直接复制资产。')}

### ${isEnglish ? 'Git hooks installed' : 'Git hooks'}

${formatPaths(input.hookInstalledFiles, isEnglish ? 'No hooks were installed.' : '本次没有安装 Git hooks。')}

### ${isEnglish ? 'Runtime-generated files' : '运行期生成文件'}

${formatPaths(input.runtimeGeneratedFiles, isEnglish ? 'No runtime-generated files were recorded.' : '当前没有记录运行期生成文件。')}

## ${isEnglish ? 'Command Plan' : '命令计划'}

${formatCommandSteps()}

- ${isEnglish ? 'Execution result' : '执行结果'}: ${commandStatus}
${recoveryLine}

## ${isEnglish ? 'Default First Change Suggestion' : '默认首个 Change 建议'}

${formatSuggestion()}
`;
    }
    describeCommandExecutionStatus(status, language) {
        const isEnglish = language === 'en-US';
        if (status === 'completed') {
            return isEnglish ? 'Completed' : '已完成';
        }
        if (status === 'failed') {
            return isEnglish ? 'Failed' : '失败';
        }
        return isEnglish ? 'Deferred' : '已延后';
    }
    getPresetDefaults(input) {
        const preset = (0, ProjectPresets_1.getProjectPresetById)(input?.projectPresetId);
        if (!preset) {
            return undefined;
        }
        const language = input?.documentLanguage ?? 'zh-CN';
        const localized = (0, ProjectPresets_1.getLocalizedProjectPresetContent)(preset.id, language);
        return {
            projectPresetId: preset.id,
            summary: localized?.description ?? preset.description,
            techStack: preset.recommendedTechStack,
            architecture: localized?.architecture ?? preset.architecture,
            modules: preset.modules,
            apiAreas: preset.apiAreas,
            designDocs: localized?.designDocs ?? preset.designDocs,
            planningDocs: localized?.planningDocs ?? preset.planningDocs,
        };
    }
    getFirstChangeSuggestion(normalized) {
        return (0, ProjectPresets_1.getProjectPresetFirstChangeSuggestion)(normalized.projectPresetId, normalized.documentLanguage, normalized.projectName);
    }
    calculateProgress(state) {
        const total = state.completed.length + state.pending.length;
        if (total === 0) {
            return 0;
        }
        return Math.round((state.completed.length / total) * 100);
    }
    extractDescription(content) {
        const lines = content
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)
            .filter(line => !line.startsWith('#'));
        return lines[0] || 'No description yet';
    }
    maxUpdatedAt(values) {
        const timestamps = values.filter((value) => Boolean(value));
        if (timestamps.length === 0) {
            return null;
        }
        timestamps.sort();
        return timestamps[timestamps.length - 1] ?? null;
    }
    async getLatestUpdatedAt(filePaths) {
        const timestamps = await Promise.all(filePaths.map(async (filePath) => (await this.fileService.exists(filePath)
            ? (await this.fileService.stat(filePath)).mtime.toISOString()
            : null)));
        return this.maxUpdatedAt(timestamps);
    }
    shouldRebuildIndex(indexUpdatedAt, latestSourceUpdatedAt, allSkills) {
        if (!indexUpdatedAt) {
            return true;
        }
        if (allSkills.some(skill => !skill.exists)) {
            return true;
        }
        if (!latestSourceUpdatedAt) {
            return false;
        }
        return new Date(latestSourceUpdatedAt).getTime() > new Date(indexUpdatedAt).getTime();
    }
    getIndexRebuildReasons(indexPath, indexUpdatedAt, latestSourceUpdatedAt, allSkills) {
        const reasons = [];
        if (!indexUpdatedAt) {
            reasons.push(indexPath);
        }
        const missingSkillFiles = allSkills.filter(skill => !skill.exists).map(skill => skill.path);
        reasons.push(...missingSkillFiles);
        if (indexUpdatedAt &&
            latestSourceUpdatedAt &&
            new Date(latestSourceUpdatedAt).getTime() > new Date(indexUpdatedAt).getTime()) {
            reasons.push(`source:newer:${latestSourceUpdatedAt}`);
        }
        return Array.from(new Set(reasons));
    }
    buildUpgradeSuggestions(checks, initialized) {
        const suggestions = [];
        const missingChecks = checks.filter(check => !check.exists);
        const missingCore = missingChecks.filter(check => check.required);
        const missingKnowledge = missingChecks.filter(check => !check.required);
        if (missingCore.length > 0) {
            suggestions.push({
                code: initialized ? 'repair_core_structure' : 'initialize_core_structure',
                title: initialized ? 'Repair core Dorado structure' : 'Initialize Dorado core structure',
                description: initialized
                    ? 'Restore required Dorado directories and config before continuing with project knowledge or execution.'
                    : 'Create the minimum Dorado runtime structure first: .skillrc, changes/, and .dorado/.',
                paths: missingCore.map(item => item.path),
            });
        }
        const missingSkillFiles = missingKnowledge.filter(check => check.key.endsWith(constants_1.FILE_NAMES.SKILL_MD));
        if (missingSkillFiles.length > 0) {
            suggestions.push({
                code: 'complete_skill_hierarchy',
                title: 'Restore protocol skill entrypoints',
                description: 'Add the missing root SKILL entrypoint so agents can discover the protocol shell and project guidance.',
                paths: missingSkillFiles.map(item => item.path),
            });
        }
        const missingDocs = missingKnowledge.filter(check => check.path.includes(`${path_1.default.sep}${constants_1.DIR_NAMES.DOCS}${path_1.default.sep}`));
        if (missingDocs.length > 0) {
            suggestions.push({
                code: 'complete_project_docs',
                title: 'Complete project knowledge docs',
                description: 'Fill missing project-level docs so the dashboard, changes, and AI skills can reference stable architecture and planning context.',
                paths: missingDocs.map(item => item.path),
            });
        }
        const missingIndexAssets = missingKnowledge.filter(check => check.key === constants_1.FILE_NAMES.SKILL_INDEX ||
            check.key === constants_1.FILE_NAMES.BUILD_INDEX_SCRIPT);
        if (missingIndexAssets.length > 0) {
            suggestions.push({
                code: 'restore_skill_index',
                title: 'Restore skill index assets',
                description: 'Add the skill index file and rebuild script so skill discovery and dashboard summaries can stay current.',
                paths: missingIndexAssets.map(item => item.path),
            });
        }
        const missingAiGuides = missingKnowledge.filter(check => check.path.includes(`${path_1.default.sep}${constants_1.DIR_NAMES.FOR_AI}${path_1.default.sep}`));
        if (missingAiGuides.length > 0) {
            suggestions.push({
                code: 'restore_ai_guides',
                title: 'Restore AI guidance docs',
                description: 'Add the AI guide and execution protocol files so Codex and other agents can follow the project workflow consistently.',
                paths: missingAiGuides.map(item => item.path),
            });
        }
        if (suggestions.length === 0 && initialized) {
            suggestions.push({
                code: 'project_ready',
                title: 'Project structure is ready',
                description: 'The Dorado core structure and recommended knowledge files are present. You can continue with active changes or dashboard workflows.',
                paths: [],
            });
        }
        return suggestions;
    }
    filterKnowledgeDocsByAffects(docs, affectSlugs) {
        const filteredDocs = docs.filter(item => item.name.toLowerCase() !== 'readme.md');
        if (affectSlugs.length === 0) {
            return filteredDocs;
        }
        const matched = filteredDocs.filter(item => {
            const nameSlug = this.toSlug(item.name);
            return affectSlugs.some(slug => nameSlug.includes(slug));
        });
        return matched.length > 0 ? matched : filteredDocs;
    }
    toRelativePath(rootDir, filePath) {
        return path_1.default.relative(rootDir, filePath).replace(/\\/g, '/');
    }
    toSlug(value) {
        return value
            .toLowerCase()
            .replace(/\.md$/i, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    async scanDocsInDirectory(rootDir, docSection) {
        const targetDir = path_1.default.join(rootDir, constants_1.DIR_NAMES.DOCS, docSection);
        if (!(await this.fileService.exists(targetDir))) {
            return [];
        }
        const entries = await fs_extra_1.default.readdir(targetDir, { withFileTypes: true });
        const files = entries
            .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
            .sort((left, right) => left.name.localeCompare(right.name));
        return Promise.all(files.map(async (file) => {
            const filePath = path_1.default.join(targetDir, file.name);
            const stats = await this.fileService.stat(filePath);
            return {
                name: file.name,
                path: filePath,
                exists: true,
                updatedAt: stats.mtime.toISOString(),
            };
        }));
    }
}
exports.ProjectService = ProjectService;
const createProjectService = (fileService, configManager, templateEngine, indexBuilder, skillParser, projectAssetService, projectScaffoldService, projectScaffoldCommandService) => new ProjectService(fileService, configManager, templateEngine, indexBuilder, skillParser, projectAssetService, projectScaffoldService, projectScaffoldCommandService);
exports.createProjectService = createProjectService;
//# sourceMappingURL=ProjectService.js.map