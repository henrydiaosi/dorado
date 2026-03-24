"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardServer = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const open_1 = __importDefault(require("open"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const constants_1 = require("../core/constants");
const services_1 = require("../services");
const ConfigurableWorkflow_1 = require("../workflow/ConfigurableWorkflow");
const ProjectPresets_1 = require("../presets/ProjectPresets");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const WORKFLOW_PROFILE_CATALOG = {
    'minimal-change': {
        label: 'Minimal Change',
        description: 'A lightweight protocol for small, low-risk changes.',
        minimumProtocolFiles: ['state.json', 'tasks.md', 'verification.md'],
        optionalSteps: ['code_review'],
        archiveFocus: ['verification', 'tasks completeness'],
        recommendedModes: ['lite'],
    },
    'standard-change': {
        label: 'Standard Change',
        description: 'The balanced default profile for most day-to-day changes.',
        minimumProtocolFiles: ['state.json', 'proposal.md', 'tasks.md', 'verification.md', 'review.md'],
        optionalSteps: ['code_review', 'design_doc', 'plan_doc', 'security_review', 'api_change_doc'],
        archiveFocus: ['verification', 'skill update', 'index regeneration'],
        recommendedModes: ['standard', 'full'],
    },
    'architecture-change': {
        label: 'Architecture Change',
        description: 'A heavier profile for architectural refactors and important decisions.',
        minimumProtocolFiles: ['state.json', 'proposal.md', 'tasks.md', 'verification.md', 'review.md'],
        optionalSteps: ['design_doc', 'adr', 'db_change_doc', 'code_review'],
        archiveFocus: ['design decisions', 'ADR alignment', 'verification'],
        recommendedModes: ['full'],
    },
    'public-api-change': {
        label: 'Public API Change',
        description: 'A profile for externally visible API or contract changes.',
        minimumProtocolFiles: ['state.json', 'proposal.md', 'tasks.md', 'verification.md', 'review.md'],
        optionalSteps: ['api_change_doc', 'code_review', 'security_review'],
        archiveFocus: ['API contract verification', 'compatibility notes'],
        recommendedModes: ['standard', 'full'],
    },
    'security-change': {
        label: 'Security Change',
        description: 'A profile for auth, permission, or security-sensitive work.',
        minimumProtocolFiles: ['state.json', 'proposal.md', 'tasks.md', 'verification.md', 'review.md'],
        optionalSteps: ['security_review', 'code_review'],
        archiveFocus: ['security review', 'verification evidence'],
        recommendedModes: ['standard', 'full'],
    },
};
class DashboardServer {
    constructor(config = {}) {
        this.server = null;
        this.config = {
            port: config.port ?? 3001,
            projectPath: config.projectPath || process.cwd(),
            autoOpen: config.autoOpen !== false,
        };
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupMiddleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(body_parser_1.default.json());
        const publicPath = this.resolvePublicPath();
        this.app.use(express_1.default.static(publicPath));
        this.app.use('/api', this.apiRoutes());
    }
    apiRoutes() {
        const router = express_1.default.Router();
        router.get('/bootstrap/status', async (_req, res) => {
            try {
                const status = await this.getBootstrapStatus();
                res.json(status);
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.get('/bootstrap/workflow-presets', (_req, res) => {
            const presets = Object.entries(ConfigurableWorkflow_1.WORKFLOW_PRESETS)
                .map(([mode, workflow]) => ({
                mode,
                description: this.getWorkflowPresetDescription(mode),
                core_steps: workflow?.core_required ?? [],
                enabled_optional_steps: Object.entries(workflow?.optional_steps ?? {})
                    .filter(([, config]) => config.enabled)
                    .map(([stepName]) => stepName),
                supported_flags: workflow?.feature_flags.supported ?? [],
            }));
            res.json({ presets });
        });
        router.get('/bootstrap/project-presets', (_req, res) => {
            const presets = ProjectPresets_1.PROJECT_PRESETS.map(preset => ({
                id: preset.id,
                name: preset.name,
                description: preset.description,
                recommendedMode: preset.recommendedMode,
                recommendedTechStack: preset.recommendedTechStack,
                modules: preset.modules,
                apiAreas: preset.apiAreas,
                designDocs: preset.designDocs,
                planningDocs: preset.planningDocs,
                policy: this.getProjectPresetPolicy(),
            }));
            res.json({ presets });
        });
        router.post('/bootstrap/preview', async (req, res) => {
            try {
                const payload = req.body;
                const preview = await this.buildBootstrapPreview(payload);
                res.json({ preview });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.post('/bootstrap/project-plan', async (req, res) => {
            try {
                const payload = req.body;
                const preview = await this.buildBootstrapPreview(payload);
                const { projectPresetId, projectName, mode, summary, techStack, modules, apiAreas, designDocs, planningDocs, moduleSkillFiles, moduleApiDocFiles, apiDocFiles, designDocFiles, planningDocFiles, inferredModules, fieldPolicy, structurePolicy, scaffoldPlan, commandPlan, firstChangeSuggestion, assetPlan, presetPolicy, scaffoldPolicy, bootstrapSummaryPolicy, usedFallbacks, fieldSources, } = preview;
                res.json({
                    plan: {
                        projectPresetId,
                        projectName,
                        mode,
                        summary,
                        techStack,
                        modules,
                        apiAreas,
                        designDocs,
                        planningDocs,
                        moduleSkillFiles,
                        moduleApiDocFiles,
                        apiDocFiles,
                        designDocFiles,
                        planningDocFiles,
                        inferredModules,
                        fieldPolicy,
                        structurePolicy,
                        scaffoldPlan,
                        commandPlan,
                        firstChangeSuggestion,
                        assetPlan,
                        presetPolicy,
                        scaffoldPolicy,
                        bootstrapSummaryPolicy,
                        usedFallbacks,
                        fieldSources,
                    },
                });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.get('/bootstrap/upgrade-plan', async (_req, res) => {
            try {
                const plan = await services_1.services.projectService.getBootstrapUpgradePlan(this.config.projectPath);
                res.json({ plan });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.post('/bootstrap/describe-project', async (req, res) => {
            try {
                const payload = req.body;
                const suggestion = this.inferBootstrapInputFromDescription(payload);
                res.json({ suggestion });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.post('/bootstrap/init', async (req, res) => {
            await this.handleBootstrapInit(req, res);
        });
        router.post('/bootstrap/commit', async (req, res) => {
            await this.handleBootstrapCommit(req, res);
        });
        router.get('/project', async (_req, res) => {
            try {
                await this.ensureInitialized();
                res.json(await this.loadProjectSummary());
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.get('/project/summary', async (_req, res) => {
            try {
                await this.ensureInitialized();
                res.json(await this.loadProjectSummary());
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.get('/docs/status', async (_req, res) => {
            try {
                await this.ensureInitialized();
                res.json(await services_1.services.projectService.getDocsStatus(this.config.projectPath));
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.get('/assets/status', async (_req, res) => {
            try {
                await this.ensureInitialized();
                res.json(await services_1.services.projectService.getProjectAssetStatus(this.config.projectPath));
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.get('/skills/status', async (_req, res) => {
            try {
                await this.ensureInitialized();
                res.json(await services_1.services.projectService.getSkillsStatus(this.config.projectPath));
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.get('/execution/status', async (_req, res) => {
            try {
                await this.ensureInitialized();
                res.json(await this.loadDashboardExecutionStatus());
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.get('/index/status', async (_req, res) => {
            try {
                await this.ensureInitialized();
                const skills = await services_1.services.projectService.getSkillsStatus(this.config.projectPath);
                res.json(skills.skillIndex);
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.post('/index/build', async (_req, res) => {
            try {
                await this.ensureInitialized();
                const index = await services_1.services.projectService.rebuildIndex(this.config.projectPath);
                res.json({
                    success: true,
                    message: 'Skill index rebuilt successfully',
                    index,
                });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        const listChanges = async (_req, res) => {
            try {
                await this.ensureInitialized();
                const execution = await this.loadDashboardExecutionStatus();
                res.json(execution.activeChanges);
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        };
        router.get('/changes', listChanges);
        router.get('/features', listChanges);
        router.get('/workflow', async (_req, res) => {
            try {
                await this.ensureInitialized();
                const config = await this.loadProjectConfig();
                const workflow = new ConfigurableWorkflow_1.ConfigurableWorkflow(config.mode);
                const defaultProfile = this.resolveWorkflowProfile(this.getModeDefaultWorkflowProfileId(config.mode), 'mode-default', config.mode);
                res.json({
                    mode: workflow.getMode(),
                    core_steps: workflow.getCoreSteps(),
                    optional_steps: config.workflow?.optional_steps ?? workflow.getConfig().optional_steps,
                    activated_steps: this.getEnabledOptionalSteps(config),
                    supported_flags: config.workflow?.feature_flags.supported ?? workflow.getSupportedFlags(),
                    defaultProfile,
                    availableProfiles: this.getWorkflowProfilesForMode(config.mode),
                    profileDisplayPolicy: {
                        phase: 'inspection-first',
                        changeSelectionOwnedBy: 'cli_or_skill',
                        runtimeModel: 'compatibility_inference_until_profile_runtime_lands',
                    },
                });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.get('/flags', async (_req, res) => {
            try {
                await this.ensureInitialized();
                const config = await this.loadProjectConfig();
                const workflow = new ConfigurableWorkflow_1.ConfigurableWorkflow(config.mode);
                res.json({
                    flags: config.workflow?.feature_flags.supported ?? workflow.getSupportedFlags(),
                });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        router.get('/files/content', async (req, res) => {
            try {
                await this.ensureInitialized();
                const target = typeof req.query.path === 'string' ? req.query.path : '';
                if (!target) {
                    this.sendApiError(res, 400, 'file_path_required', 'File path is required');
                    return;
                }
                const resolvedPath = this.resolveProjectFilePath(target);
                if (!this.isPreviewableProjectFile(resolvedPath)) {
                    this.sendApiError(res, 403, 'file_preview_not_allowed', 'The requested file is outside the dashboard preview allowlist');
                    return;
                }
                const stats = await fs_extra_1.default.stat(resolvedPath);
                if (!stats.isFile()) {
                    this.sendApiError(res, 400, 'file_path_not_file', 'The requested path is not a file');
                    return;
                }
                const maxBytes = 256 * 1024;
                if (stats.size > maxBytes) {
                    this.sendApiError(res, 413, 'file_too_large', `File is too large to preview in dashboard (limit: ${maxBytes} bytes)`);
                    return;
                }
                const content = await fs_extra_1.default.readFile(resolvedPath, 'utf8');
                res.json({
                    path: path_1.default.relative(this.config.projectPath, resolvedPath).replace(/\\/g, '/'),
                    absolutePath: resolvedPath,
                    content,
                });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        });
        const createChange = async (req, res) => {
            try {
                await this.ensureInitialized();
                const payload = req.body;
                const { name, flags } = payload;
                if (!name) {
                    this.sendApiError(res, 400, 'change_name_required', 'Change name is required');
                    return;
                }
                const feature = await this.createFeature(payload);
                const change = {
                    name,
                    status: feature.status,
                    progress: feature.progress,
                    flags: flags || [],
                    currentStep: feature.currentStep,
                };
                res.status(201).json({
                    success: true,
                    message: `Change "${name}" created successfully`,
                    change,
                    feature: change,
                });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        };
        router.post('/changes', createChange);
        router.post('/features', createChange);
        const verifyChange = async (req, res) => {
            try {
                await this.ensureInitialized();
                const { name } = req.params;
                const result = await this.executeDorado(`verify ./changes/active/${name}`);
                res.json({
                    success: true,
                    message: `Change "${name}" verified`,
                    result,
                });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        };
        router.post('/changes/:name/verify', verifyChange);
        router.post('/features/:name/verify', verifyChange);
        const archiveChange = async (req, res) => {
            try {
                await this.ensureInitialized();
                const { name } = req.params;
                const result = await this.executeDorado(`archive ./changes/active/${name}`);
                res.json({
                    success: true,
                    message: `Change "${name}" archived`,
                    result,
                });
            }
            catch (error) {
                this.handleApiError(res, error);
            }
        };
        router.post('/changes/:name/archive', archiveChange);
        router.post('/features/:name/archive', archiveChange);
        router.get('/health', (_req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
        return router;
    }
    setupRoutes() {
        this.app.get('*', (_req, res) => {
            res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
        });
    }
    async loadProjectConfig() {
        const configPath = path_1.default.join(this.config.projectPath, constants_1.FILE_NAMES.SKILLRC);
        return fs_extra_1.default.readJSON(configPath);
    }
    resolvePublicPath() {
        const compiledPublicPath = path_1.default.join(__dirname, 'public');
        if (fs_extra_1.default.existsSync(compiledPublicPath)) {
            return compiledPublicPath;
        }
        const sourcePublicPath = path_1.default.resolve(__dirname, '../../src/dashboard/public');
        return sourcePublicPath;
    }
    async ensureInitialized() {
        const structure = await services_1.services.projectService.detectProjectStructure(this.config.projectPath);
        if (!structure.initialized) {
            throw new Error('Project is not initialized. Use /api/bootstrap/init first.');
        }
    }
    async getBootstrapStatus() {
        const structure = await services_1.services.projectService.detectProjectStructure(this.config.projectPath);
        const inferredModules = await services_1.services.projectService.inferBootstrapModules(this.config.projectPath);
        const checks = structure.checks.map(check => ({
            name: check.key,
            path: check.path,
            exists: check.exists,
            required: check.required,
        }));
        let mode = null;
        if (structure.initialized) {
            try {
                const config = await this.loadProjectConfig();
                mode = config.mode;
            }
            catch {
                mode = null;
            }
        }
        return {
            initialized: structure.initialized,
            structureLevel: structure.level,
            projectName: path_1.default.basename(this.config.projectPath),
            projectPath: this.config.projectPath,
            mode,
            nextAction: !structure.initialized
                ? 'initialize_project'
                : structure.level === 'full'
                    ? 'open_dashboard'
                    : 'complete_project_knowledge',
            missingPaths: structure.missingRequired,
            missingRecommended: structure.missingRecommended,
            upgradeSuggestions: structure.upgradeSuggestions,
            checks,
            structurePreview: this.getStructurePreview(structure.level),
            inferredModules,
            fieldPolicy: services_1.services.projectService.getBootstrapFieldPolicy(),
            structurePolicy: services_1.services.projectService.getBootstrapStructurePolicy(this.config.projectPath),
        };
    }
    getStructurePreview(level) {
        const preview = ['.skillrc', 'changes/active/', 'changes/archived/', '.dorado/'];
        if (level !== 'none') {
            preview.push('SKILL.md', 'SKILL.index.json', 'build-index-auto.js', 'docs/project/overview.md', 'for-ai/ai-guide.md');
        }
        return preview;
    }
    async initializeProject(mode, payload) {
        return services_1.services.projectService.initializeProject(this.config.projectPath, mode, payload);
    }
    async initializeProtocolShell(mode, payload) {
        return services_1.services.projectService.initializeProtocolShellProject(this.config.projectPath, mode, payload);
    }
    resolveProjectFilePath(targetPath) {
        const projectRoot = path_1.default.resolve(this.config.projectPath);
        const resolvedPath = path_1.default.isAbsolute(targetPath)
            ? path_1.default.resolve(targetPath)
            : path_1.default.resolve(projectRoot, targetPath);
        const normalizedRoot = projectRoot.toLowerCase();
        const normalizedResolved = resolvedPath.toLowerCase();
        if (normalizedResolved !== normalizedRoot &&
            !normalizedResolved.startsWith(`${normalizedRoot}${path_1.default.sep}`)) {
            throw new Error('Requested file path is outside the current project');
        }
        return resolvedPath;
    }
    isPreviewableProjectFile(resolvedPath) {
        const projectRoot = path_1.default.resolve(this.config.projectPath);
        const relativePath = path_1.default.relative(projectRoot, resolvedPath).replace(/\\/g, '/');
        const previewablePatterns = [
            /^SKILL\.md$/,
            /^SKILL\.index\.json$/,
            /^for-ai\/.+\.md$/i,
            /^docs\/.+\.md$/i,
            /^src\/.+\/SKILL\.md$/i,
            /^src\/SKILL\.md$/i,
            /^tests\/.+\/SKILL\.md$/i,
            /^tests\/SKILL\.md$/i,
        ];
        return previewablePatterns.some(pattern => pattern.test(relativePath));
    }
    async buildBootstrapPreview(payload) {
        if (payload.mode && !this.isValidProjectMode(payload.mode)) {
            throw new Error('Mode must be one of: lite, standard, full');
        }
        const mode = payload.mode && this.isValidProjectMode(payload.mode)
            ? payload.mode
            : 'standard';
        const validationError = this.validateBootstrapPayload(payload);
        if (validationError) {
            throw new Error(validationError);
        }
        const preview = await services_1.services.projectService.previewBootstrap(this.config.projectPath, mode, payload);
        return {
            ...preview,
            presetPolicy: {
                ...this.getProjectPresetPolicy(),
                canPlanScaffold: Boolean(preview.scaffoldPlan),
                canSuggestFirstChange: Boolean(preview.firstChangeSuggestion),
            },
            scaffoldPolicy: {
                previewAvailable: Boolean(preview.scaffoldPlan),
                createdDuringProtocolInit: false,
                createdDuringKnowledgeBackfill: false,
                createdDuringBootstrapCommit: Boolean(preview.scaffoldPlan),
            },
            bootstrapSummaryPolicy: this.getBootstrapSummaryPolicy(),
        };
    }
    inferBootstrapInputFromDescription(payload) {
        const description = payload.description?.trim();
        if (!description) {
            throw new Error('Project description is required');
        }
        const normalizedDescription = description.toLowerCase();
        const explicitPreset = (0, ProjectPresets_1.getProjectPresetById)(payload.projectPresetId);
        const inferredPreset = explicitPreset ?? (0, ProjectPresets_1.inferProjectPresetFromDescription)(description);
        const detectedKeywords = new Set();
        const collectMatches = (rules) => {
            const values = new Set();
            for (const rule of rules) {
                if (rule.keywords.some(keyword => normalizedDescription.includes(keyword))) {
                    rule.values.forEach(value => values.add(value));
                    rule.keywords.forEach(keyword => {
                        if (normalizedDescription.includes(keyword)) {
                            detectedKeywords.add(keyword);
                        }
                    });
                }
            }
            return Array.from(values);
        };
        const techStack = collectMatches([
            { keywords: ['next.js', 'nextjs', 'next'], values: ['Next.js'] },
            { keywords: ['react'], values: ['React'] },
            { keywords: ['vue'], values: ['Vue'] },
            { keywords: ['nuxt'], values: ['Nuxt'] },
            { keywords: ['typescript'], values: ['TypeScript'] },
            { keywords: ['javascript'], values: ['JavaScript'] },
            { keywords: ['tailwind'], values: ['Tailwind CSS'] },
            { keywords: ['node', 'node.js'], values: ['Node.js'] },
            { keywords: ['nestjs', 'nest'], values: ['NestJS'] },
            { keywords: ['express'], values: ['Express'] },
            { keywords: ['fastify'], values: ['Fastify'] },
            { keywords: ['postgres', 'postgresql'], values: ['PostgreSQL'] },
            { keywords: ['mysql'], values: ['MySQL'] },
            { keywords: ['redis'], values: ['Redis'] },
            { keywords: ['prisma'], values: ['Prisma'] },
            { keywords: ['electron'], values: ['Electron'] },
            { keywords: ['tauri'], values: ['Tauri'] },
        ]);
        const modules = collectMatches([
            { keywords: ['官网', 'website', 'landing', 'marketing'], values: ['web'] },
            { keywords: ['docs', 'documentation', '文档'], values: ['docs'] },
            { keywords: ['admin', '后台', '运营后台'], values: ['admin'] },
            { keywords: ['auth', '登录', '鉴权', '用户体系'], values: ['auth'] },
            { keywords: ['payment', '支付', 'billing'], values: ['payment'] },
            { keywords: ['cms', 'content', '内容'], values: ['content'] },
            { keywords: ['dashboard', '仪表板'], values: ['dashboard'] },
            { keywords: ['api'], values: ['api'] },
            { keywords: ['mobile', 'app', '客户端'], values: ['mobile'] },
        ]);
        const apiAreas = collectMatches([
            { keywords: ['auth', '登录', '鉴权'], values: ['auth api'] },
            { keywords: ['payment', '支付', 'billing'], values: ['payment api'] },
            { keywords: ['content', '内容', 'cms', '官网'], values: ['content api'] },
            { keywords: ['admin', '后台'], values: ['admin api'] },
            { keywords: ['search', '搜索'], values: ['search api'] },
            { keywords: ['user', '用户'], values: ['user api'] },
        ]);
        const designDocs = collectMatches([
            { keywords: ['官网', 'website', 'ui', '界面'], values: ['ui information architecture'] },
            { keywords: ['content', '内容', 'cms'], values: ['content model'] },
            { keywords: ['架构', 'architecture', '模块'], values: ['system architecture'] },
        ]);
        const planningDocs = collectMatches([
            { keywords: ['phase', '阶段', 'milestone', '里程碑'], values: ['phase 1 roadmap'] },
            { keywords: ['launch', '上线', '发布'], values: ['launch checklist'] },
            { keywords: ['plan', '规划', 'delivery', '交付'], values: ['delivery plan'] },
        ]);
        const inferredProjectName = payload.projectName?.trim() ||
            this.extractProjectName(description) ||
            path_1.default.basename(this.config.projectPath);
        return {
            projectPresetId: inferredPreset?.id,
            projectName: inferredProjectName,
            summary: payload.summary?.trim() || description,
            techStack: payload.techStack?.length
                ? payload.techStack
                : techStack.length > 0
                    ? techStack
                    : inferredPreset?.recommendedTechStack ?? [],
            architecture: payload.architecture?.trim() ||
                inferredPreset?.architecture ||
                this.buildArchitectureSummary(modules, apiAreas),
            modules: payload.modules?.length
                ? payload.modules
                : modules.length > 0
                    ? modules
                    : inferredPreset?.modules ?? [],
            apiAreas: payload.apiAreas?.length
                ? payload.apiAreas
                : apiAreas.length > 0
                    ? apiAreas
                    : inferredPreset?.apiAreas ?? [],
            designDocs: payload.designDocs?.length
                ? payload.designDocs
                : designDocs.length > 0
                    ? designDocs
                    : inferredPreset?.designDocs ?? [],
            planningDocs: payload.planningDocs?.length
                ? payload.planningDocs
                : planningDocs.length > 0
                    ? planningDocs
                    : inferredPreset?.planningDocs ?? [],
            documentLanguage: payload.documentLanguage,
            detectedKeywords: Array.from(detectedKeywords),
        };
    }
    extractProjectName(description) {
        const quotedMatch = description.match(/[“"']([^"”']{2,40})[”"']/);
        if (quotedMatch?.[1]) {
            return quotedMatch[1].trim();
        }
        const titleMatch = description.match(/(?:做一个|创建一个|create|build)\s+([A-Za-z0-9\u4e00-\u9fa5\s-]{2,40}?)(?=\s+(?:with|using|包含|使用)|[,.，。]|$)/i);
        if (titleMatch?.[1]) {
            return titleMatch[1]
                .replace(/^(a|an)\s+/i, '')
                .replace(/\s+(with|using|包含|使用)\s+.*$/i, '')
                .trim();
        }
        return null;
    }
    buildArchitectureSummary(modules, apiAreas) {
        const moduleSummary = modules.length > 0 ? modules.join(' / ') : 'project modules';
        const apiSummary = apiAreas.length > 0 ? apiAreas.join(' / ') : 'API areas';
        return `Use a layered project structure with modules ${moduleSummary}, and organize service boundaries around ${apiSummary}.`;
    }
    async handleBootstrapInit(req, res) {
        try {
            const payload = req.body;
            const { mode } = payload;
            if (!mode || !this.isValidProjectMode(mode)) {
                this.sendApiError(res, 400, 'invalid_project_mode', 'Mode must be one of: lite, standard, full');
                return;
            }
            const validationError = this.validateBootstrapPayload(payload);
            if (validationError) {
                this.sendApiError(res, 400, 'invalid_bootstrap_payload', validationError);
                return;
            }
            const status = await this.getBootstrapStatus();
            if (status.initialized && status.structureLevel === 'full') {
                this.sendApiError(res, 409, 'project_already_initialized', 'Project is already initialized', { status });
                return;
            }
            const result = await this.initializeProtocolShell(mode, payload);
            res.status(201).json({
                success: true,
                message: status.initialized
                    ? `Refreshed Dorado protocol shell in ${mode} mode`
                    : `Initialized Dorado protocol shell in ${mode} mode`,
                result: {
                    ...result,
                    createFirstChange: false,
                    createdFirstChange: null,
                    firstChangeCreationError: null,
                },
                status: await this.getBootstrapStatus(),
            });
        }
        catch (error) {
            this.handleApiError(res, error);
        }
    }
    async handleBootstrapCommit(req, res) {
        try {
            const payload = req.body;
            const { mode } = payload;
            if (!mode || !this.isValidProjectMode(mode)) {
                this.sendApiError(res, 400, 'invalid_project_mode', 'Mode must be one of: lite, standard, full');
                return;
            }
            const validationError = this.validateBootstrapPayload(payload);
            if (validationError) {
                this.sendApiError(res, 400, 'invalid_bootstrap_payload', validationError);
                return;
            }
            const status = await this.getBootstrapStatus();
            if (status.initialized && status.structureLevel === 'full') {
                this.sendApiError(res, 409, 'project_already_initialized', 'Project is already initialized', { status });
                return;
            }
            const result = await this.initializeProject(mode, payload);
            const shouldCreateFirstChange = payload.createFirstChange === true;
            let createdFirstChange = null;
            let firstChangeCreationError = null;
            if (shouldCreateFirstChange && result.firstChangeSuggestion) {
                try {
                    createdFirstChange = await this.createFeature(this.buildFeatureCreateRequestFromSuggestion(result.firstChangeSuggestion, payload.documentLanguage));
                }
                catch (error) {
                    firstChangeCreationError =
                        error instanceof Error ? error.message : 'Failed to create the first change';
                }
            }
            res.status(201).json({
                success: true,
                message: status.initialized && status.structureLevel !== 'full'
                    ? `Completed Dorado knowledge skeleton in ${mode} mode`
                    : `Initialized Dorado project in ${mode} mode`,
                result: {
                    ...result,
                    createFirstChange: shouldCreateFirstChange,
                    createdFirstChange,
                    firstChangeCreationError,
                },
                status: await this.getBootstrapStatus(),
            });
        }
        catch (error) {
            this.handleApiError(res, error);
        }
    }
    validateBootstrapPayload(payload) {
        if (!payload.projectName?.trim()) {
            return 'Project name is required';
        }
        if (payload.projectPresetId && !(0, ProjectPresets_1.getProjectPresetById)(payload.projectPresetId)) {
            return 'Project preset is invalid';
        }
        return null;
    }
    buildFeatureCreateRequestFromSuggestion(suggestion, documentLanguage) {
        return {
            name: suggestion.name,
            background: suggestion.background,
            goals: suggestion.goals,
            inScope: suggestion.inScope,
            outOfScope: suggestion.outOfScope,
            acceptanceCriteria: suggestion.acceptanceCriteria,
            affects: suggestion.affects,
            flags: suggestion.flags,
            documentLanguage,
        };
    }
    getProjectPresetPolicy() {
        return {
            role: 'planning_defaults',
            appliesDuringProtocolInit: false,
            appliesDuringKnowledgeBackfill: true,
            appliesDuringBootstrapCommit: true,
            canPlanScaffold: true,
            canSuggestFirstChange: true,
        };
    }
    getBootstrapSummaryPolicy() {
        return {
            path: 'docs/project/bootstrap-summary.md',
            generatedDuringProtocolInit: false,
            generatedDuringKnowledgeBackfill: false,
            generatedDuringBootstrapCommit: true,
        };
    }
    async createFeature(payload) {
        const config = await this.loadProjectConfig();
        const workflow = new ConfigurableWorkflow_1.ConfigurableWorkflow(config.mode);
        const name = payload.name?.trim();
        if (!name) {
            throw new Error('Change name is required');
        }
        services_1.services.validationService.validateFeatureName(name);
        const featureDir = path_1.default.join(this.config.projectPath, constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.ACTIVE, name);
        if (await services_1.services.fileService.exists(featureDir)) {
            throw new Error(`Change ${name} already exists`);
        }
        const flags = (payload.flags ?? []).map(flag => flag.trim()).filter(Boolean);
        const flagValidation = workflow.validateFlags(flags);
        if (!flagValidation.valid) {
            throw new Error(`Unsupported flags for ${config.mode} mode: ${flagValidation.unsupported.join(', ')}`);
        }
        const optionalSteps = workflow.getActivatedSteps(flags);
        const affects = (payload.affects ?? []).map(item => item.trim()).filter(Boolean);
        const projectContext = await services_1.services.projectService.getFeatureProjectContext(this.config.projectPath, affects);
        const goals = (payload.goals ?? []).map(item => item.trim()).filter(Boolean);
        const inScope = (payload.inScope ?? []).map(item => item.trim()).filter(Boolean);
        const outOfScope = (payload.outOfScope ?? []).map(item => item.trim()).filter(Boolean);
        const acceptanceCriteria = (payload.acceptanceCriteria ?? [])
            .map(item => item.trim())
            .filter(Boolean);
        await services_1.services.fileService.ensureDir(featureDir);
        await services_1.services.fileService.writeJSON(path_1.default.join(featureDir, constants_1.FILE_NAMES.STATE), services_1.services.stateManager.createInitialState(name, affects, config.mode));
        await services_1.services.fileService.writeFile(path_1.default.join(featureDir, constants_1.FILE_NAMES.PROPOSAL), services_1.services.templateEngine.generateProposalTemplate({
            feature: name,
            mode: config.mode,
            affects,
            flags,
            optionalSteps,
            background: payload.background,
            goals,
            inScope,
            outOfScope,
            acceptanceCriteria,
            projectContext,
            documentLanguage: payload.documentLanguage,
        }));
        await services_1.services.fileService.writeFile(path_1.default.join(featureDir, constants_1.FILE_NAMES.TASKS), services_1.services.templateEngine.generateTasksTemplate({
            feature: name,
            mode: config.mode,
            affects,
            flags,
            optionalSteps,
            background: payload.background,
            goals,
            inScope,
            outOfScope,
            acceptanceCriteria,
            projectContext,
            documentLanguage: payload.documentLanguage,
        }));
        await services_1.services.fileService.writeFile(path_1.default.join(featureDir, constants_1.FILE_NAMES.VERIFICATION), services_1.services.templateEngine.generateVerificationTemplate({
            feature: name,
            mode: config.mode,
            affects,
            flags,
            optionalSteps,
            background: payload.background,
            goals,
            inScope,
            outOfScope,
            acceptanceCriteria,
            projectContext,
            documentLanguage: payload.documentLanguage,
        }));
        await services_1.services.fileService.writeFile(path_1.default.join(featureDir, constants_1.FILE_NAMES.REVIEW), services_1.services.templateEngine.generateReviewTemplate({
            feature: name,
            mode: config.mode,
            affects,
            flags,
            optionalSteps,
            background: payload.background,
            goals,
            inScope,
            outOfScope,
            acceptanceCriteria,
            projectContext,
            documentLanguage: payload.documentLanguage,
        }));
        const state = await services_1.services.stateManager.readState(featureDir);
        return {
            name,
            status: state.status,
            progress: this.calculateProgress(state),
            currentStep: state.current_step,
            flags,
            description: payload.background?.trim() || 'No description yet',
        };
    }
    getWorkflowPresetDescription(mode) {
        const descriptions = {
            lite: 'Fast start for smaller repositories with only essential workflow checks.',
            standard: 'Balanced default workflow for most teams using Dorado day to day.',
            full: 'Strict workflow with all governance steps enabled for larger or riskier projects.',
        };
        return descriptions[mode];
    }
    isValidProjectMode(mode) {
        return mode === 'lite' || mode === 'standard' || mode === 'full';
    }
    getEnabledOptionalSteps(config) {
        return Object.entries(config.workflow?.optional_steps ?? {})
            .filter(([, optionalConfig]) => optionalConfig.enabled)
            .map(([stepName]) => stepName);
    }
    isWorkflowProfileId(value) {
        return Boolean(value && value in WORKFLOW_PROFILE_CATALOG);
    }
    getModeDefaultWorkflowProfileId(mode) {
        switch (mode) {
            case 'lite':
                return 'minimal-change';
            case 'standard':
            case 'full':
            default:
                return 'standard-change';
        }
    }
    getWorkflowProfilesForMode(mode) {
        return Object.keys(WORKFLOW_PROFILE_CATALOG).map(profileId => this.resolveWorkflowProfile(profileId, profileId === this.getModeDefaultWorkflowProfileId(mode) ? 'mode-default' : 'explicit', mode));
    }
    resolveWorkflowProfile(profileId, source, mode) {
        const definition = WORKFLOW_PROFILE_CATALOG[profileId];
        const reasonBySource = {
            explicit: 'Shown as an available workflow profile for inspection.',
            'flag-inference': 'Inferred from the active change flags for compatibility display.',
            'legacy-file-set': 'Inferred from the existing change protocol file set.',
            'mode-default': 'Inferred from the current project mode until explicit profile config exists.',
        };
        return {
            id: profileId,
            label: definition.label,
            description: definition.description,
            source,
            inferred: source !== 'explicit',
            minimumProtocolFiles: [...definition.minimumProtocolFiles],
            optionalSteps: [...definition.optionalSteps],
            archiveFocus: [...definition.archiveFocus],
            recommendedForMode: definition.recommendedModes.includes(mode),
            reason: reasonBySource[source],
        };
    }
    inferWorkflowProfileIdFromFlags(flags) {
        const set = new Set(flags);
        if (set.has('security_related') || set.has('auth') || set.has('payment')) {
            return 'security-change';
        }
        if (set.has('public_api_change')) {
            return 'public-api-change';
        }
        if (set.has('architecture_change') || set.has('important_decision') || set.has('db_schema_change')) {
            return 'architecture-change';
        }
        return null;
    }
    async loadProjectSummary() {
        return services_1.services.projectService.getProjectSummary(this.config.projectPath);
    }
    async loadExecutionStatus() {
        return services_1.services.projectService.getExecutionStatus(this.config.projectPath);
    }
    async loadDashboardExecutionStatus() {
        const execution = await this.loadExecutionStatus();
        const config = await this.loadProjectConfig();
        const defaultProfile = this.resolveWorkflowProfile(this.getModeDefaultWorkflowProfileId(config.mode), 'mode-default', config.mode);
        if (execution.activeChanges.length === 0) {
            return {
                ...execution,
                activeChanges: [],
                defaultProfile,
            };
        }
        const activeChanges = await Promise.all(execution.activeChanges.map(async (change) => {
            const featureDir = path_1.default.join(this.config.projectPath, constants_1.DIR_NAMES.CHANGES, constants_1.DIR_NAMES.ACTIVE, change.name);
            const state = await services_1.services.stateManager.readState(featureDir);
            const workflowProfile = await this.resolveWorkflowProfileForChange(featureDir, state, change.flags);
            return {
                ...change,
                workflowProfile,
            };
        }));
        return {
            ...execution,
            activeChanges,
            defaultProfile,
        };
    }
    async resolveWorkflowProfileForChange(featureDir, state, flags) {
        if (this.isWorkflowProfileId(state.workflow_profile_id)) {
            return this.resolveWorkflowProfile(state.workflow_profile_id, 'explicit', state.mode);
        }
        const inferredByFlags = this.inferWorkflowProfileIdFromFlags(flags);
        if (inferredByFlags) {
            return this.resolveWorkflowProfile(inferredByFlags, 'flag-inference', state.mode);
        }
        const [hasProposal, hasTasks, hasVerification, hasReview] = await Promise.all([
            services_1.services.fileService.exists(path_1.default.join(featureDir, constants_1.FILE_NAMES.PROPOSAL)),
            services_1.services.fileService.exists(path_1.default.join(featureDir, constants_1.FILE_NAMES.TASKS)),
            services_1.services.fileService.exists(path_1.default.join(featureDir, constants_1.FILE_NAMES.VERIFICATION)),
            services_1.services.fileService.exists(path_1.default.join(featureDir, constants_1.FILE_NAMES.REVIEW)),
        ]);
        if (hasTasks && hasVerification && !hasProposal && !hasReview) {
            return this.resolveWorkflowProfile('minimal-change', 'legacy-file-set', state.mode);
        }
        if (hasProposal && hasTasks && hasVerification && hasReview) {
            return this.resolveWorkflowProfile('standard-change', 'legacy-file-set', state.mode);
        }
        return this.resolveWorkflowProfile(this.getModeDefaultWorkflowProfileId(state.mode), 'mode-default', state.mode);
    }
    calculateProgress(state) {
        const total = state.completed.length + state.pending.length;
        if (total === 0) {
            return 0;
        }
        return Math.round((state.completed.length / total) * 100);
    }
    async executeDorado(command) {
        try {
            const cliPath = path_1.default.resolve(__dirname, '../cli.js');
            const { stdout } = await execAsync(`"${process.execPath}" "${cliPath}" ${command}`, {
                cwd: this.config.projectPath,
            });
            return stdout.trim();
        }
        catch (error) {
            throw new Error(`Dorado command failed: ${this.getErrorMessage(error)}`);
        }
    }
    async start() {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(this.config.port, () => {
                const port = this.getRuntimePort();
                console.log(`\nDorado Dashboard started`);
                console.log(`Visit: http://localhost:${port}`);
                console.log(`Project: ${this.config.projectPath}\n`);
                if (this.config.autoOpen) {
                    this.openBrowser();
                }
                resolve();
            });
            this.server.on('error', reject);
        });
    }
    async stop() {
        return new Promise((resolve, reject) => {
            if (!this.server) {
                resolve();
                return;
            }
            this.server.close(err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    openBrowser() {
        const url = `http://localhost:${this.getRuntimePort()}`;
        (0, open_1.default)(url).catch(() => {
            // Ignore browser open failures.
        });
    }
    getErrorMessage(error) {
        return error instanceof Error ? error.message : String(error);
    }
    sendApiError(res, status, code, error, details) {
        const payload = {
            error,
            code,
        };
        if (details !== undefined) {
            payload.details = details;
        }
        res.status(status).json(payload);
    }
    handleApiError(res, error) {
        this.sendApiError(res, this.getApiStatusCode(error), this.getApiErrorCode(error), this.getErrorMessage(error));
    }
    getApiStatusCode(error) {
        const message = this.getErrorMessage(error);
        if (message.includes('Project is not initialized')) {
            return 409;
        }
        if (message.includes('Mode must be one of') ||
            message.includes('Project description is required') ||
            message.includes('Project name is required') ||
            message.includes('Project preset is invalid') ||
            message.includes('Change name is required') ||
            message.includes('Feature name is required') ||
            message.includes('Invalid change name') ||
            message.includes('Invalid feature name') ||
            message.includes('Unsupported flags')) {
            return 400;
        }
        if (message.includes('already exists')) {
            return 409;
        }
        return 500;
    }
    getApiErrorCode(error) {
        const message = this.getErrorMessage(error);
        if (message.includes('Project is not initialized')) {
            return 'project_not_initialized';
        }
        if (message.includes('Mode must be one of')) {
            return 'invalid_project_mode';
        }
        if (message.includes('Project description is required')) {
            return 'project_description_required';
        }
        if (message.includes('Project preset is invalid')) {
            return 'invalid_project_preset';
        }
        if (message.includes('Feature name is required') || message.includes('Change name is required')) {
            return 'change_name_required';
        }
        if (message.includes('Invalid feature name') || message.includes('Invalid change name')) {
            return 'invalid_change_name';
        }
        if (message.includes('Unsupported flags')) {
            return 'unsupported_flags';
        }
        if (message.includes('Project name is required')) {
            return 'invalid_bootstrap_payload';
        }
        if (message.includes('already exists')) {
            return 'resource_conflict';
        }
        return 'internal_error';
    }
    getRuntimePort() {
        const address = this.server?.address();
        if (typeof address === 'object' && address) {
            return address.port;
        }
        return this.config.port;
    }
}
exports.DashboardServer = DashboardServer;
exports.default = DashboardServer;
//# sourceMappingURL=server.js.map