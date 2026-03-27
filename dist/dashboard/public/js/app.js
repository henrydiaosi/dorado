class DashboardApp {
  constructor() {
    this.apiBase = '/api';
    this.storageKey = 'dorado-dashboard-language';
    this.refreshTimer = null;
    this.state = {
      view: 'loading',
      loading: true,
      error: null,
      project: null,
      assetStatus: null,
      docsStatus: null,
      skillsStatus: null,
      execution: null,
      features: [],
      queuedFeatures: [],
      workflow: null,
      flags: [],
      bootstrap: null,
      presets: [],
      projectPresets: [],
      selectedMode: 'standard',
      selectedProjectPresetId: 'official-site',
      initializing: false,
      bootstrapDescribing: false,
      bootstrapPreviewing: false,
      creatingFeature: false,
      rebuildingIndex: false,
      activeTab: 'project',
      bootstrapStep: 0,
      bootstrapPlan: null,
      bootstrapPreview: null,
      bootstrapCommitResult: null,
      filePreview: null,
      filePreviewLoading: false,
      language: this.getInitialLanguage(),
      bootstrapForm: this.createEmptyBootstrapForm(),
      featureForm: this.createEmptyFeatureForm(),
    };
  }

  getDefaultBootstrapModulesText() {
    return 'core\nmodules/<module>';
  }

  getInitialLanguage() {
    const storedLanguage = window.localStorage.getItem(this.storageKey);
    if (storedLanguage === 'zh' || storedLanguage === 'en') {
      return storedLanguage;
    }

    const browserLanguage = (window.navigator.language || '').toLowerCase();
    return browserLanguage.startsWith('zh') ? 'zh' : 'en';
  }

  createEmptyFeatureForm(modules = []) {
    return {
      name: '',
      background: '',
      goalsText: '',
      inScopeText: '',
      outOfScopeText: '',
      acceptanceCriteriaText: '',
      affectsText: modules.length > 0 ? modules.join('\n') : 'dashboard\ncli\nskill',
      selectedFlags: [],
    };
  }

  createFeatureFormFromSuggestion(suggestion, modules = []) {
    const baseForm = this.createEmptyFeatureForm(modules);
    if (!suggestion) {
      return baseForm;
    }

    return {
      ...baseForm,
      name: suggestion.name || baseForm.name,
      background: suggestion.background || baseForm.background,
      goalsText: (suggestion.goals || []).join('\n'),
      inScopeText: (suggestion.inScope || []).join('\n'),
      outOfScopeText: (suggestion.outOfScope || []).join('\n'),
      acceptanceCriteriaText: (suggestion.acceptanceCriteria || []).join('\n'),
      affectsText:
        (suggestion.affects || []).length > 0
          ? suggestion.affects.join('\n')
          : baseForm.affectsText,
      selectedFlags: suggestion.flags || [],
    };
  }

  createEmptyBootstrapForm(projectName = '') {
    return {
      projectName,
      projectDescription: '',
      summary: '',
      techStackText: '',
      architecture: '',
      modulesText: this.getDefaultBootstrapModulesText(),
      apiAreasText: '',
      designDocsText: '',
      planningDocsText: '',
      executeScaffoldCommands: false,
    };
  }

  shouldAutoFillInferredModules(currentValue) {
    const normalized = (currentValue || '').trim();
    return !normalized || normalized === this.getDefaultBootstrapModulesText();
  }

  applyBootstrapStatus(bootstrap) {
    this.state.bootstrap = bootstrap;
    if (!this.state.bootstrapForm.projectName) {
      this.state.bootstrapForm = this.createEmptyBootstrapForm(bootstrap.projectName || '');
    }

    if (
      (bootstrap.inferredModules || []).length > 0 &&
      this.shouldAutoFillInferredModules(this.state.bootstrapForm.modulesText)
    ) {
      this.state.bootstrapForm.modulesText = bootstrap.inferredModules.join('\n');
    }
  }

  getBootstrapFieldPolicy(fieldKey) {
    return (this.state.bootstrap?.fieldPolicy || []).find(item => item.key === fieldKey) || {
      key: fieldKey,
      required: false,
      allowPlaceholder: true,
    };
  }

  getBootstrapFieldSource(fieldKey) {
    return (
      this.state.bootstrapPreview?.fieldSources?.[fieldKey] ||
      this.state.bootstrapPlan?.fieldSources?.[fieldKey] ||
      null
    );
  }

  renderBootstrapFieldHint(fieldKey) {
    const policy = this.getBootstrapFieldPolicy(fieldKey);
    const source = this.getBootstrapFieldSource(fieldKey);
    const parts = [policy.required ? this.t('bootstrapFieldRequired') : this.t('bootstrapFieldOptional')];

    if (!policy.required && policy.allowPlaceholder) {
      parts.push(this.t('bootstrapFieldPlaceholderAllowed'));
    }

    if (source === 'inferred') {
      parts.push(this.t('bootstrapFieldInferred'));
    } else if (source === 'preset') {
      parts.push(this.t('bootstrapFieldPresetApplied'));
    } else if (source === 'placeholder') {
      parts.push(this.t('bootstrapFieldPlaceholderGenerated'));
    }

    return `<p class="mt-2 text-xs leading-6 text-stone-500">${parts.join(' · ')}</p>`;
  }

  getBootstrapFieldDisplayName(fieldKey) {
    const labels = {
      projectName: this.t('bootstrapProjectName'),
      summary: this.t('bootstrapSummary'),
      techStack: this.t('bootstrapTechStack'),
      architecture: this.t('bootstrapArchitecture'),
      modules: this.t('bootstrapModules'),
      apiAreas: this.t('bootstrapApiAreas'),
      designDocs: this.t('bootstrapDesignDocs'),
      planningDocs: this.t('bootstrapPlanningDocs'),
    };

    return labels[fieldKey] || fieldKey;
  }

  getModeLabel(mode) {
    const labels = this.state.language === 'zh'
      ? {
          lite: '轻量',
          standard: '平衡',
          full: '严格',
        }
      : {
          lite: 'Lite',
          standard: 'Balanced',
          full: 'Strict',
        };

    return labels[mode] || mode || this.t('unknownValue');
  }

  getModeOptionalStepsLabel() {
    return this.state.language === 'zh' ? '模式启用的可选步骤' : 'Mode-enabled optional steps';
  }

  getNoOptionalStepsForModeText() {
    return this.state.language === 'zh'
      ? '当前项目模式没有启用可选步骤。'
      : 'No optional steps are enabled by the current project mode.';
  }

  getChangeActivatedOptionalStepsLabel() {
    return this.state.language === 'zh'
      ? '当前 change 激活的可选步骤'
      : 'Change-activated optional steps';
  }

  getNoActivatedOptionalStepsForChangeText() {
    return this.state.language === 'zh'
      ? '当前 change 没有激活可选步骤。'
      : 'No optional steps are activated on this change.';
  }

  getWorkflowOptionalStepsModeHint() {
    return this.state.language === 'zh'
      ? '这里展示的是当前项目模式允许启用的可选步骤范围，不代表每个 change 都会实际执行。'
      : 'This shows the optional steps made available by the current project mode. It does not mean every change will execute them.';
  }

  getWorkflowOptionalStepsChangeHint() {
    return this.state.language === 'zh'
      ? '具体 change 只会激活与自身 flags 和 profile 匹配的可选步骤。'
      : 'A specific change activates only the optional steps matched by that change\'s flags and profile.';
  }

  getWorkflowModeGovernanceHint() {
    return this.state.language === 'zh'
      ? '项目模式表达的是治理强度，不是“完整版”与“普通版”的产品分层。'
      : 'Project mode expresses governance strength, not a separate “full edition” of Dorado.';
  }

  getWorkflowProfileDefaultHint() {
    return this.state.language === 'zh'
      ? '默认 profile 是仓库级回退值；具体 change 仍会通过自己的 profile 与 flags 进入不同的运行路径。'
      : 'The default profile is the repository-level fallback. Each active change can still activate a different runtime path through its own profile and flags.';
  }

  getWorkflowProfileAvailableHint() {
    return this.state.language === 'zh'
      ? '这里列出的是当前仓库可兼容的 profile 选项，便于检查，不代表 dashboard 直接替你切换。'
      : 'The dashboard lists compatible profiles for inspection. Real selection still happens through CLI or skills, and active changes persist their chosen profile.';
  }

  getStructureLevelLabel(level) {
    const labels = {
      none: this.t('structureLevelNone'),
      basic: this.t('structureLevelBasic'),
      full: this.t('structureLevelFull'),
    };

    return labels[level] || level || this.t('unknownValue');
  }

  getFeatureStatusLabel(status) {
    const queuedLabel = this.t('statusQueued');
    const labels = {
      queued: queuedLabel === 'statusQueued' ? 'Queued' : queuedLabel,
      draft: this.t('statusDraft'),
      planned: this.t('statusPlanned'),
      implementing: this.t('statusImplementing'),
      verifying: this.t('statusVerifying'),
      ready_to_archive: this.t('statusReadyToArchive'),
    };

    return labels[status] || status || this.t('unknownValue');
  }

  getWorkflowStepLabel(step) {
    const labels = {
      proposal: this.t('stepProposalLabel'),
      tasks: this.t('stepTasksLabel'),
      state: this.t('stepStateLabel'),
      verification: this.t('stepVerificationLabel'),
      skill_update: this.t('stepSkillUpdateLabel'),
      index_regenerated: this.t('stepIndexRegeneratedLabel'),
      code_review: this.t('stepCodeReviewLabel'),
      design_doc: this.t('stepDesignDocLabel'),
      plan_doc: this.t('stepPlanDocLabel'),
      security_review: this.t('stepSecurityReviewLabel'),
      adr: this.t('stepAdrLabel'),
      db_change_doc: this.t('stepDbChangeDocLabel'),
      api_change_doc: this.t('stepApiChangeDocLabel'),
    };

    return labels[step] || step || this.t('unknownValue');
  }

  getFlagLabel(flag) {
    const labels = {
      cross_module: this.t('flagCrossModule'),
      complex_feature: this.t('flagComplexFeature'),
      large_feature: this.t('flagLargeFeature'),
      multi_phase: this.t('flagMultiPhase'),
      high_risk: this.t('flagHighRisk'),
      multi_file_change: this.t('flagMultiFileChange'),
      security_related: this.t('flagSecurityRelated'),
      auth: this.t('flagAuth'),
      payment: this.t('flagPayment'),
      public_api_change: this.t('flagPublicApiChange'),
      architecture_change: this.t('flagArchitectureChange'),
      important_decision: this.t('flagImportantDecision'),
      external_api: this.t('flagExternalApi'),
      db_schema_change: this.t('flagDbSchemaChange'),
    };

    return labels[flag] || flag || this.t('unknownValue');
  }

  getWorkflowProfileLabel(profile) {
    return profile?.label || profile?.id || this.t('unknownValue');
  }

  getWorkflowProfileSourceLabel(source) {
    const labels = {
      explicit: this.t('workflowProfileExplicit'),
      'flag-inference': this.t('workflowProfileFlagInference'),
      'legacy-file-set': this.t('workflowProfileLegacyInference'),
      'mode-default': this.t('workflowProfileModeFallback'),
    };

    return labels[source] || source || this.t('unknownValue');
  }

  renderWorkflowProfileBadge(profile, extraClass = '') {
    if (!profile) {
      return '';
    }

    const tone = profile.inferred
      ? 'border-amber-500/25 bg-amber-500/10 text-amber-100'
      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100';

    return `<span class="rounded-full border px-3 py-1 text-xs tracking-[0.18em] ${tone} ${extraClass}">${
      profile.inferred ? this.t('workflowProfileInferred') : this.t('workflowProfileExplicit')
    }</span>`;
  }

  async init() {
    document.documentElement.lang = this.state.language === 'zh' ? 'zh-CN' : 'en';
    await this.loadInitialView();
    this.render();
    this.refreshTimer = window.setInterval(() => {
      void this.refreshActiveView();
    }, 5000);
  }

  async loadInitialView() {
    this.state.loading = true;
    this.state.error = null;

    try {
      const bootstrap = await this.fetchJson('/bootstrap/status');
      this.applyBootstrapStatus(bootstrap);

      if (!bootstrap.initialized) {
        this.state.view = 'bootstrap';
        return;
      }

      await this.loadDashboardData();
      if (this.state.features.length === 0) {
        this.state.activeTab = 'execution';
      }
      this.state.view = 'dashboard';
    } catch (error) {
      this.state.error = this.formatErrorMessage(error.message);
      this.state.view = 'bootstrap';
    } finally {
      this.state.loading = false;
    }
  }

  async loadDashboardData() {
    const [project, assetStatus, docsStatus, skillsStatus, execution, workflow, flags] = await Promise.all([
      this.fetchJson('/project/summary'),
      this.fetchJson('/assets/status'),
      this.fetchJson('/docs/status'),
      this.fetchJson('/skills/status'),
      this.fetchJson('/execution/status'),
      this.fetchJson('/workflow'),
      this.fetchJson('/flags'),
    ]);

    this.state.project = project;
    this.state.assetStatus = assetStatus;
    this.state.docsStatus = docsStatus;
    this.state.skillsStatus = skillsStatus;
    this.state.execution = execution;
    this.state.features = execution.activeChanges || [];
    this.state.queuedFeatures = execution.queuedChanges || [];
    this.state.workflow = workflow;
    this.state.flags = flags.flags || [];
  }

  async refreshActiveView() {
    if (this.state.initializing || this.state.creatingFeature || this.state.rebuildingIndex) {
      return;
    }

    try {
      const bootstrap = await this.fetchJson('/bootstrap/status');
      this.applyBootstrapStatus(bootstrap);

      if (!bootstrap.initialized) {
        if (this.state.view !== 'bootstrap') {
          this.state.view = 'bootstrap';
        }
        this.render();
        return;
      }

      await this.loadDashboardData();
      if (this.state.features.length === 0) {
        this.state.activeTab = 'execution';
      }
      this.state.view = 'dashboard';
      this.state.error = null;
      this.render();
    } catch (error) {
      this.state.error = this.formatErrorMessage(error.message);
      this.render();
    }
  }

  async handleInitProject() {
    if (this.state.initializing) {
      return;
    }

    if (!this.state.bootstrapPreview) {
      await this.requestBootstrapPreview();
      if (!this.state.bootstrapPreview) {
        return;
      }
    }

    this.state.initializing = true;
    this.state.error = null;
    this.render();

    try {
      const commitResult = await this.fetchJson('/bootstrap/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.collectBootstrapPayload()),
      });
      await this.loadInitialView();
      this.state.bootstrapCommitResult = commitResult.result || null;
      if (commitResult.result?.createdFirstChange) {
        this.state.view = 'dashboard';
        this.state.activeTab = 'execution';
      } else if (commitResult.result?.firstChangeSuggestion) {
        this.state.featureForm = this.createFeatureFormFromSuggestion(
          commitResult.result.firstChangeSuggestion,
          (this.state.skillsStatus?.modules || []).map(module => module.name)
        );
        if (commitResult.result?.firstChangeCreationError) {
          this.state.error = commitResult.result.firstChangeCreationError;
        }
        this.state.view = 'dashboard';
        this.state.activeTab = 'execution';
      }
    } catch (error) {
      this.state.error = this.formatErrorMessage(error.message);
    } finally {
      this.state.initializing = false;
      this.render();
    }
  }

  async handleCreateFeature() {
    if (this.state.creatingFeature) {
      return;
    }

    const form = this.state.featureForm;
    if (!form.name.trim()) {
      this.state.error = this.t('featureNameRequired');
      this.render();
      return;
    }

    this.state.creatingFeature = true;
    this.state.error = null;
    this.render();

    try {
      await this.fetchJson('/changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          background: form.background.trim(),
          goals: this.parseMultilineList(form.goalsText),
          inScope: this.parseMultilineList(form.inScopeText),
          outOfScope: this.parseMultilineList(form.outOfScopeText),
          acceptanceCriteria: this.parseMultilineList(form.acceptanceCriteriaText),
          affects: this.parseMultilineList(form.affectsText),
          flags: form.selectedFlags,
          documentLanguage: this.state.language === 'zh' ? 'zh-CN' : 'en-US',
        }),
      });

      await this.loadDashboardData();
      this.state.featureForm = this.createEmptyFeatureForm(
        (this.state.skillsStatus?.modules || []).map(module => module.name)
      );
      this.state.view = 'dashboard';
      this.state.activeTab = 'execution';
    } catch (error) {
      this.state.error = this.formatErrorMessage(error.message);
    } finally {
      this.state.creatingFeature = false;
      this.render();
    }
  }

  async handleRebuildIndex() {
    if (this.state.rebuildingIndex) {
      return;
    }

    this.state.rebuildingIndex = true;
    this.state.error = null;
    this.render();

    try {
      await this.fetchJson('/index/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      await this.loadDashboardData();
    } catch (error) {
      this.state.error = this.formatErrorMessage(error.message);
    } finally {
      this.state.rebuildingIndex = false;
      this.render();
    }
  }

  async createFeature() {
    this.state.featureForm = this.createEmptyFeatureForm(
      (this.state.skillsStatus?.modules || []).map(module => module.name)
    );
    this.state.view = 'featureSetup';
    this.state.error = null;
    this.render();
  }

  skipFeatureSetup() {
    this.state.view = 'dashboard';
    this.state.error = null;
    this.render();
  }

  async openUpgradeWizard() {
    try {
      if (this.state.presets.length === 0 || this.state.projectPresets.length === 0) {
        await this.loadBootstrapPresetData();
      }
      const upgradePlanResponse = await this.fetchJson('/bootstrap/upgrade-plan');
      const upgradePlan = upgradePlanResponse.plan || {};
      this.state.selectedMode = this.state.bootstrap?.mode || this.state.selectedMode || 'standard';
      if (upgradePlan.projectPresetId) {
        this.applyProjectPresetSelection(upgradePlan.projectPresetId, { syncMode: false, render: false });
      }
      this.state.bootstrapForm.projectName = upgradePlan.projectName || this.state.bootstrapForm.projectName;
      this.state.bootstrapForm.summary = upgradePlan.summary || this.state.bootstrapForm.summary;
      this.state.bootstrapForm.techStackText = (upgradePlan.techStack || []).join('\n');
      this.state.bootstrapForm.architecture = upgradePlan.architecture || this.state.bootstrapForm.architecture;
      this.state.bootstrapForm.modulesText = (upgradePlan.modules || []).join('\n') || this.state.bootstrapForm.modulesText;
      this.state.bootstrapForm.apiAreasText = (upgradePlan.apiAreas || []).join('\n');
      this.state.bootstrapForm.designDocsText = (upgradePlan.designDocs || []).join('\n');
      this.state.bootstrapForm.planningDocsText = (upgradePlan.planningDocs || []).join('\n');
      this.state.bootstrapStep = 1;
      this.state.bootstrapPlan = null;
      this.state.bootstrapPreview = null;
      this.state.error = null;
      this.state.view = 'bootstrap';
      this.render();
    } catch (error) {
      this.state.error = this.formatErrorMessage(error.message);
      this.render();
    }
  }

  setMode(mode) {
    this.state.selectedMode = mode;
    this.state.bootstrapPlan = null;
    this.state.bootstrapPreview = null;
    this.render();
  }

  async loadBootstrapPresetData() {
    const [workflowPresetResponse, projectPresetResponse] = await Promise.all([
      this.fetchJson('/bootstrap/workflow-presets'),
      this.fetchJson('/bootstrap/project-presets'),
    ]);

    this.state.presets = workflowPresetResponse.presets || [];
    this.state.projectPresets = projectPresetResponse.presets || [];

    if (!this.state.presets.some(preset => preset.mode === this.state.selectedMode)) {
      this.state.selectedMode = this.state.presets.some(preset => preset.mode === 'standard')
        ? 'standard'
        : this.state.presets[0]?.mode || 'standard';
    }

    if (!this.state.projectPresets.some(preset => preset.id === this.state.selectedProjectPresetId)) {
      this.state.selectedProjectPresetId = this.state.projectPresets[0]?.id || '';
    }
  }

  applyProjectPresetSelection(projectPresetId, options = {}) {
    const { syncMode = true, render = true } = options;
    this.state.selectedProjectPresetId = projectPresetId;
    this.state.bootstrapPlan = null;
    this.state.bootstrapPreview = null;

    const selectedPreset = this.state.projectPresets.find(preset => preset.id === projectPresetId);
    if (syncMode && selectedPreset?.recommendedMode) {
      this.state.selectedMode = selectedPreset.recommendedMode;
    }

    if (render) {
      this.render();
    }
  }

  setProjectPreset(projectPresetId) {
    this.applyProjectPresetSelection(projectPresetId);
  }

  getProjectPresetLabel(projectPresetId) {
    if (!projectPresetId) {
      return this.t('unknownValue');
    }

    const preset = this.state.projectPresets.find(item => item.id === projectPresetId);
    if (!preset) {
      return projectPresetId;
    }

    const localizedPreset = this.getLocalizedProjectPreset(preset);
    return `${localizedPreset.name} (${preset.id})`;
  }

  getLocalizedProjectPreset(preset) {
    if (!preset || this.state.language !== 'zh') {
      return preset;
    }

    const localizedMap = {
      'official-site': {
        ...preset,
        name: '官网站点',
        description: '适用于官网展示、文档中心、博客/更新日志、后台内容管理和鉴权的一体化官网项目。',
        designDocs: ['界面信息架构', '内容模型', 'CMS 工作流'],
        planningDocs: ['交付计划', '上线检查清单'],
      },
      'nextjs-web': {
        ...preset,
        name: 'Next.js 网站应用',
        description: '适用于标准 Web 产品的 Next.js 项目骨架，内置账户、鉴权与 API 边界。',
        designDocs: ['界面信息架构', '系统架构'],
        planningDocs: ['交付计划'],
      },
    };

    return localizedMap[preset.id] || preset;
  }

  getLocalizedModuleName(moduleName) {
    if (this.state.language !== 'zh') {
      return moduleName;
    }

    const labels = {
      core: '核心层',
      web: '官网前台',
      docs: '文档中心',
      content: '内容管理',
      admin: '后台管理',
      auth: '鉴权',
      dashboard: '仪表板',
      cli: 'CLI',
      skill: '技能',
      api: 'API',
      payment: '支付',
      cms: 'CMS',
      mobile: '移动端',
      blog: '博客',
    };

    return labels[moduleName] || moduleName;
  }

  getLocalizedApiAreaName(apiArea) {
    if (this.state.language !== 'zh') {
      return apiArea;
    }

    const normalized = String(apiArea || '').trim().toLowerCase();
    const labels = {
      'auth api': '鉴权 API',
      'payment api': '支付 API',
      'content api': '内容 API',
      'admin api': '后台 API',
      'search api': '搜索 API',
      'user api': '用户 API',
      'dashboard api': '仪表板 API',
    };

    return labels[normalized] || apiArea;
  }

  formatLocalizedList(items, formatter) {
    if (!items || items.length === 0) {
      return '-';
    }

    const separator = this.state.language === 'zh' ? '，' : ', ';
    return items.map(item => formatter.call(this, item)).join(separator);
  }

  getLocalizedUpgradeSuggestion(suggestion) {
    if (!suggestion || this.state.language !== 'zh') {
      return suggestion;
    }

    const localizedMap = {
      initialize_core_structure: {
        title: '初始化 Dorado 核心结构',
        description: '先补齐最小可运行的 Dorado 结构：.skillrc、changes/ 和 .dorado/。',
      },
      repair_core_structure: {
        title: '修复 Dorado 核心结构',
        description: '继续补齐项目知识层或执行流之前，先恢复必需的 Dorado 目录与配置。',
      },
      complete_skill_hierarchy: {
        title: '补齐分层技能文件',
        description: '生成或恢复缺失的根 / docs / src / tests 层 SKILL 文件，保证 AI 能稳定理解项目知识结构。',
      },
      complete_project_docs: {
        title: '补齐项目知识文档',
        description: '补全缺失的项目级文档，让 dashboard、change 和 AI skills 能引用稳定的架构与计划上下文。',
      },
      restore_skill_index: {
        title: '恢复技能索引资产',
        description: '补齐技能索引文件和重建脚本，保证技能发现与 dashboard 摘要保持最新。',
      },
      restore_ai_guides: {
        title: '恢复 AI 指南文档',
        description: '补齐 AI guide 与 execution protocol，让 Codex 和其他代理始终按统一流程执行。',
      },
      project_ready: {
        title: '项目结构已就绪',
        description: 'Dorado 核心结构和推荐知识文件都已存在，可以继续推进 active changes 或 dashboard 工作流。',
      },
    };

    const localized = localizedMap[suggestion.code];
    if (!localized) {
      return suggestion;
    }

    return {
      ...suggestion,
      title: localized.title,
      description: localized.description,
    };
  }

  getLocalizedStatusItem(item) {
    if (this.state.language !== 'zh' || typeof item !== 'string') {
      return item;
    }

    if (item.startsWith('source:newer:')) {
      return `源技能文件更新时间晚于当前索引：${item.replace('source:newer:', '')}`;
    }

    return item;
  }

  getFeatureDescriptionText(description) {
    if (!description || description === 'No description yet') {
      return this.state.language === 'zh' ? '暂无背景说明' : 'No description yet';
    }

    return description;
  }

  formatFileDirectorySummary(fileCount, directoryCount) {
    if (this.state.language === 'zh') {
      return `${fileCount} 个文件 / ${directoryCount} 个目录`;
    }

    return `${fileCount} files / ${directoryCount} dirs`;
  }

  formatErrorMessage(message) {
    if (!message || this.state.language !== 'zh') {
      return message;
    }

    const mappings = [
      ['Project is not initialized. Use /api/bootstrap/init first.', '项目尚未初始化，请先完成初始化。'],
      ['Project description is required', '请先输入项目描述'],
      ['Project name is required', '项目名称不能为空'],
      ['Project preset is invalid', '项目预设无效'],
      ['Change name is required', '变更名称不能为空'],
      ['Feature name is required', '变更名称不能为空'],
      ['Mode must be one of: lite, standard, full', '项目模式必须是 lite、standard 或 full'],
      ['File path is required', '必须提供文件路径'],
      ['The requested path is not a file', '请求的路径不是文件'],
      ['Requested file path is outside the current project', '请求的文件路径超出当前项目范围'],
      ['Skill index rebuilt successfully', '技能索引重建完成'],
    ];

    for (const [source, localized] of mappings) {
      if (message.includes(source)) {
        return message.replace(source, localized);
      }
    }

    const largeFilePrefix = 'File is too large to preview in dashboard';
    if (message.includes(largeFilePrefix)) {
      return message.replace(largeFilePrefix, '文件过大，无法在仪表板中预览');
    }

    const apiErrorPrefix = 'API error: ';
    if (message.startsWith(apiErrorPrefix)) {
      return `接口错误：${message.slice(apiErrorPrefix.length)}`;
    }

    return message;
  }

  toInlineJsString(value) {
    return JSON.stringify(String(value ?? ''));
  }

  async openFilePreview(filePath, title = '') {
    if (!filePath || this.state.filePreviewLoading) {
      return;
    }

    this.state.filePreviewLoading = true;
    this.state.error = null;
    this.render();

    try {
      const query = `?path=${encodeURIComponent(filePath)}`;
      const result = await this.fetchJson(`/files/content${query}`);
      this.state.filePreview = {
        title: title || result.path,
        path: result.path,
        absolutePath: result.absolutePath,
        content: result.content,
      };
    } catch (error) {
      this.state.error = this.formatErrorMessage(error.message);
    } finally {
      this.state.filePreviewLoading = false;
      this.render();
    }
  }

  closeFilePreview() {
    this.state.filePreview = null;
    this.state.filePreviewLoading = false;
    this.render();
  }

  setBootstrapStep(step) {
    this.state.bootstrapStep = Math.max(0, Math.min(step, 3));
    this.render();
  }

  async nextBootstrapStep() {
    if (this.state.bootstrapStep === 1 && !this.state.bootstrapForm.projectName.trim()) {
      this.state.error = this.t('bootstrapProjectNameRequired');
      this.render();
      return;
    }

    if (this.state.bootstrapStep === 2) {
      await this.requestBootstrapPreview();
      if (!this.state.bootstrapPreview) {
        return;
      }
    }

    this.state.error = null;
    this.setBootstrapStep(this.state.bootstrapStep + 1);
  }

  previousBootstrapStep() {
    this.state.error = null;
    this.setBootstrapStep(this.state.bootstrapStep - 1);
  }

  switchTab(tabId) {
    this.state.activeTab = tabId;
    this.render();
  }

  updateFeatureField(field, value) {
    this.state.featureForm[field] = value;
  }

  updateBootstrapField(field, value) {
    this.state.bootstrapForm[field] = value;
    this.state.bootstrapPlan = null;
    this.state.bootstrapPreview = null;
  }

  async inferBootstrapFromDescription() {
    if (this.state.bootstrapDescribing) {
      return;
    }

    const description = this.state.bootstrapForm.projectDescription.trim();
    if (!description) {
      this.state.error = this.t('bootstrapDescriptionRequired');
      this.render();
      return;
    }

    this.state.bootstrapDescribing = true;
    this.state.error = null;
    this.render();

    try {
      const result = await this.fetchJson('/bootstrap/describe-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: this.state.selectedMode,
          projectPresetId: this.state.selectedProjectPresetId || undefined,
          description,
          projectName: this.state.bootstrapForm.projectName.trim(),
        }),
      });
      const suggestion = result.suggestion || {};
      if (suggestion.projectPresetId) {
        this.applyProjectPresetSelection(suggestion.projectPresetId, { syncMode: true, render: false });
      }
      this.state.bootstrapForm.projectName = suggestion.projectName || this.state.bootstrapForm.projectName;
      this.state.bootstrapForm.summary = suggestion.summary || this.state.bootstrapForm.summary;
      this.state.bootstrapForm.techStackText = (suggestion.techStack || []).join('\n');
      this.state.bootstrapForm.architecture = suggestion.architecture || this.state.bootstrapForm.architecture;
      this.state.bootstrapForm.modulesText = (suggestion.modules || []).join('\n');
      this.state.bootstrapForm.apiAreasText = (suggestion.apiAreas || []).join('\n');
      this.state.bootstrapForm.designDocsText = (suggestion.designDocs || []).join('\n');
      this.state.bootstrapForm.planningDocsText = (suggestion.planningDocs || []).join('\n');
      this.state.bootstrapPlan = null;
      this.state.bootstrapPreview = null;
    } catch (error) {
      this.state.error = this.formatErrorMessage(error.message);
    } finally {
      this.state.bootstrapDescribing = false;
      this.render();
    }
  }

  collectBootstrapPayload() {
    return {
      mode: this.state.selectedMode,
      projectPresetId: this.state.selectedProjectPresetId || undefined,
      projectName: this.state.bootstrapForm.projectName.trim(),
      summary: this.state.bootstrapForm.summary.trim(),
      techStack: this.parseMultilineList(this.state.bootstrapForm.techStackText),
      architecture: this.state.bootstrapForm.architecture.trim(),
      modules: this.parseMultilineList(this.state.bootstrapForm.modulesText),
      apiAreas: this.parseMultilineList(this.state.bootstrapForm.apiAreasText),
      designDocs: this.parseMultilineList(this.state.bootstrapForm.designDocsText),
      planningDocs: this.parseMultilineList(this.state.bootstrapForm.planningDocsText),
      executeScaffoldCommands: Boolean(this.state.bootstrapForm.executeScaffoldCommands),
      documentLanguage: this.state.language === 'zh' ? 'zh-CN' : 'en-US',
    };
  }

  async requestBootstrapPreview() {
    if (this.state.bootstrapPreviewing) {
      return;
    }

    this.state.bootstrapPreviewing = true;
    this.state.error = null;
    this.render();

    try {
      const planResult = await this.fetchJson('/bootstrap/project-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.collectBootstrapPayload()),
      });
      this.state.bootstrapPlan = planResult.plan || null;

      const result = await this.fetchJson('/bootstrap/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.collectBootstrapPayload()),
      });
      this.state.bootstrapPreview = result.preview;
    } catch (error) {
      this.state.error = this.formatErrorMessage(error.message);
      this.state.bootstrapPlan = null;
      this.state.bootstrapPreview = null;
    } finally {
      this.state.bootstrapPreviewing = false;
      this.render();
    }
  }

  toggleFeatureFlag(flag) {
    const selected = new Set(this.state.featureForm.selectedFlags);
    if (selected.has(flag)) {
      selected.delete(flag);
    } else {
      selected.add(flag);
    }
    this.state.featureForm.selectedFlags = Array.from(selected);
    this.render();
  }

  setLanguage(language) {
    if (language !== 'zh' && language !== 'en') {
      return;
    }

    this.state.language = language;
    window.localStorage.setItem(this.storageKey, language);
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    this.render();
  }

  t(key, params = {}) {
    const messages = {
      zh: {
        loading: '正在准备 Dorado',
        guiFirstBootstrap: '图形化引导初始化',
        bootstrapTitle: '先完成 Dorado 初始化，再进入改造流程。',
        bootstrapDescription:
          '这个向导会先检查目录结构并采集项目规划信息。`init` 只会写入 {{skillrc}}、协议骨架和基础目录；项目知识、业务 scaffold 与初始化摘要只会在后续显式 commit/backfill 时生成。',
        selected: '已选中',
        preset: '预设',
        bootstrapStepMode: '步骤 1 模式',
        bootstrapStepBasics: '步骤 2 基础信息',
        bootstrapStepArchitecture: '步骤 3 规划细节',
        bootstrapStepPreview: '步骤 4 生成预览',
        nextStep: '下一步',
        previousStep: '上一步',
        previewAndContinue: '生成预览并继续',
        previewing: '正在生成预览...',
        bootstrapProjectNameRequired: '项目名称不能为空',
        bootstrapDescriptionRequired: '请先输入项目描述',
        optionalStepsEnabled: '{{count}} 个可选步骤已启用',
        selectedMode: '当前模式',
        projectPlanning: '项目规划',
        projectPlanningDescription: '先把项目名称、简介、技术栈、模块和 API 规划填进去，初始化时会直接生成对应文档骨架。',
        bootstrapOnlyProjectNameRequired: '只强制要求项目名称。其他字段可以先留空，Dorado 会生成可继续补全的占位内容。',
        bootstrapDetectedModulesTitle: '从当前目录识别到的模块',
        bootstrapDetectedModulesEmpty: '当前目录还没有可推断的模块。',
        bootstrapStructurePolicyTitle: '初始化策略',
        bootstrapStructurePolicyDescription: '最小可运行结构会保证 Dorado 可启动；推荐结构会补齐知识层与索引。旧项目缺少推荐项不会直接判定初始化失败。',
        bootstrapMinimumStructure: '最小可运行结构',
        bootstrapRecommendedStructure: '完整推荐结构',
        bootstrapAssetSourcesTitle: '资产来源',
        bootstrapDirectCopyCount: '直接复制资产',
        bootstrapTemplateGeneratedCount: '模板生成资产',
        bootstrapRuntimeGeneratedCount: '运行期生成资产',
        bootstrapSourceExamples: '来源示例',
        bootstrapScaffoldTitle: '业务框架脚手架',
        bootstrapScaffoldDirectories: '将创建的目录',
        bootstrapScaffoldFiles: '将创建的框架文件',
        bootstrapScaffoldFramework: '框架方案',
        bootstrapScaffoldInstallCommand: '安装与启动命令',
        bootstrapScaffoldEmpty: '当前没有可预览的业务脚手架。协议初始化不会创建业务 scaffold，只有显式 commit 才会应用。',
        bootstrapScaffoldExistingFiles: '将保留的现有框架文件',
        bootstrapScaffoldExistingDirectories: '将复用的现有目录',
        bootstrapExecuteCommands: '提交初始化时执行脚手架命令',
        bootstrapExecuteCommandsDescription: '勾选后会在提交初始化时尝试执行依赖安装命令。若失败，会写入 .dorado/bootstrap-recovery.json 补救清单。',
        bootstrapCommandPlanTitle: '命令执行计划',
        bootstrapCommandDeferred: '当前仅生成命令计划，不自动执行。',
        bootstrapCommandWillExecute: '提交初始化时将自动执行。',
        bootstrapCommandStatusSkipped: '已延后执行',
        bootstrapCommandStatusCompleted: '执行完成',
        bootstrapCommandStatusFailed: '执行失败，已写补救记录',
        bootstrapRecoveryFile: '补救记录',
        bootstrapInitSummaryTitle: '本次 bootstrap 提交摘要',
        bootstrapInitDoradoFiles: 'Dorado 协议层',
        bootstrapInitBusinessFiles: '业务框架层',
        bootstrapInitCreated: '本次创建',
        bootstrapInitSkipped: '检测到已存在，已保留',
        bootstrapInitRuntime: '运行期生成',
        bootstrapInitHooks: 'Git 钩子',
        featureSuggestionTitle: '预设建议',
        featureSuggestionSource: '来源预设',
        featureSuggestionBackground: '建议背景',
        featureSuggestionAffects: '建议影响模块',
        featureSuggestionFlags: '建议标记',
        bootstrapProjectDescription: '项目描述',
        bootstrapProjectDescriptionPlaceholder: '用自然语言描述你要做的项目，例如：我要做一个使用 Next.js 和 TypeScript 的 doradospec 官网，包含官网展示、文档中心、后台内容管理和鉴权能力。',
        bootstrapProjectPreset: '项目预设',
        bootstrapProjectPresetTitle: '业务预设',
        bootstrapProjectPresetDescription: '先选择业务场景预设，再进入详细规划。预设只负责提供项目知识和 scaffold 的默认规划，不会让协议初始化直接变成模板落地。',
        bootstrapProjectPresetRecommendedMode: '推荐模式',
        bootstrapProjectPresetRecommendedStack: '推荐技术栈',
        bootstrapProjectPresetSelectedHint: '当前会把该预设作为默认规划来源。',
        inferProjectPlan: '从描述拆解规划',
        inferringProjectPlan: '正在拆解规划...',
        bootstrapProjectName: '项目名称',
        bootstrapProjectNamePlaceholder: '例如：dorado 官网',
        bootstrapSummary: '项目简介',
        bootstrapSummaryPlaceholder: '这个项目要解决什么问题？目标用户是谁？',
        bootstrapTechStack: '技术栈',
        bootstrapTechStackPlaceholder: '每行一个，例如：Next.js\nTypeScript\nPostgreSQL',
        bootstrapArchitecture: '架构说明',
        bootstrapArchitecturePlaceholder: '简要描述项目分层、关键模块和运行方式',
        bootstrapModules: '模块规划',
        bootstrapModulesPlaceholder: '每行一个模块，例如：web\ncms\nauth',
        bootstrapApiAreas: 'API 规划',
        bootstrapApiAreasPlaceholder: '每行一个 API 域，例如：auth api\ncontent api',
        bootstrapDesignDocs: '设计文档需求',
        bootstrapDesignDocsPlaceholder: '每行一个长期设计文档',
        bootstrapPlanningDocs: '计划文档需求',
        bootstrapPlanningDocsPlaceholder: '每行一个计划/里程碑文档',
        bootstrapFieldRequired: '必填',
        bootstrapFieldOptional: '选填',
        bootstrapFieldPlaceholderAllowed: '可用占位内容生成',
        bootstrapFieldInferred: '将使用目录推断结果',
        bootstrapFieldPresetApplied: '将使用预设默认值',
        bootstrapFieldPlaceholderGenerated: '将使用默认占位内容',
        bootstrapFallbackFieldsTitle: '将自动补齐的字段',
        bootstrapFallbackFieldsEmpty: '当前预览没有使用占位补齐。',
        bootstrapFilesLabel: '将生成的文件',
        bootstrapPreview: '生成预览',
        initializeAndContinue: '初始化并继续',
        initializing: '正在初始化...',
        coreSteps: '核心步骤',
        enabledOptionalSteps: '已启用可选步骤',
        noOptionalStepsEnabled: '当前没有启用的可选步骤',
        projectCheck: '项目检查',
        ready: '已就绪',
        needsInit: '需要初始化',
        present: '已存在',
        missing: '缺失',
        structurePreview: '结构预览',
        firstChangeSetup: '首个变更设置',
        featureSetupTitle: '初始化完成，继续创建第一个变更。',
        featureSetupDescription:
          '这里会直接生成首个活跃变更的 {{proposal}}、{{tasks}}、{{state}}、{{verification}} 和 {{review}}。',
        featureName: '变更名称',
        featureNamePlaceholder: 'fullchain-skill-onboarding',
        background: '背景',
        backgroundPlaceholder: '为什么需要这个改造？当前痛点是什么？',
        goals: '目标',
        goalsPlaceholder: '每行一个目标',
        inScope: '涉及范围',
        inScopePlaceholder: '每行一个涉及项',
        outOfScope: '不涉及范围',
        outOfScopePlaceholder: '每行一个不涉及项',
        acceptanceCriteria: '验收标准',
        acceptanceCriteriaPlaceholder: '每行一个验收项',
        affects: '影响模块',
        affectsPlaceholder: '每行一个模块名',
        featureFlags: '变更标记',
        featureFlagsDescription: '根据当前项目模式选择需要的标记，可选步骤会自动联动。',
        projectSummary: '项目摘要',
        upgradeSuggestionsTitle: '升级建议',
        noUpgradeSuggestions: '当前没有结构升级建议。',
        viewDataSourcesTitle: '数据来源',
        viewStateTitle: '视图状态',
        sourceEndpoint: '接口',
        sourceProjectSummaryDescription: '提供项目名称、模式、结构层级、当前目录和创建时间。',
        sourceBootstrapStatusDescription: '提供结构完整度、缺失路径和升级建议，用于判断是否需要补齐项目知识层。',
        sourceWorkflowDescription: '提供工作流核心步骤、可选步骤和当前模式对应的执行规则。',
        sourceAssetStatusDescription: '提供项目实际资产来源清单，区分母版复制、模板生成与运行期生成。',
        sourceDocsStatusDescription: '提供核心文档覆盖率，以及 API、设计、计划文档的存在情况。',
        sourceSkillsStatusDescription: '提供分层 SKILL、模块清单和索引快照，用于判断技能层是否完整。',
        sourceExecutionStatusDescription: '提供活跃变更列表、状态和进度摘要。',
        sourceFlagsDescription: '提供当前项目模式支持的变更标记，用于创建改造计划。',
        statusReady: '已就绪',
        statusNeedsUpgrade: '待升级',
        statusNeedsAttention: '需关注',
        statusEmpty: '空态',
        readyStateTitle: '当前视图已具备基础数据',
        readyStateDescription: '当前数据源已经可用，可以继续查看项目状态或推进后续变更。',
        legacyProjectTitle: '检测到旧项目或部分初始化项目',
        legacyProjectDescription: '当前目录已具备 Dorado 核心结构，但项目知识层还不完整。建议补齐 docs、SKILL、索引和 for-ai 指南后再长期使用仪表板。',
        openUpgradeWizard: '打开升级向导',
        legacyUpgradeHint: 'GUI 现在只负责显示缺口与风险，补齐知识层请改用 CLI 或 skill。',
        docsNeedAttentionTitle: '文档层仍有缺口',
        docsNeedAttentionDescription: '核心文档或推荐文档仍有缺失，文档视图已降级为“缺失项优先展示”。',
        docsEmptyTitle: '当前还没有可展示的文档资产',
        docsEmptyDescription: '还没有发现可跟踪的项目文档，可以先通过升级向导或初始化流程生成骨架。',
        skillsNeedAttentionTitle: '技能层仍有缺口',
        skillsNeedAttentionDescription: '根技能文件、模块技能或索引仍不完整，技能视图会优先展示缺失项。',
        skillsEmptyTitle: '当前还没有可展示的技能结构',
        skillsEmptyDescription: '还没有发现分层 SKILL 或模块技能，可以先补齐项目知识层骨架。',
        executionEmptyTitle: '当前没有活跃变更',
        executionEmptyDescription: '执行视图已就绪，但还没有进行中的改造计划。GUI 只显示进度与概况，新的 change 建议通过 CLI 或 skill 创建。',
        name: '名称',
        mode: '模式',
        activatedOptionalStepsPreview: '激活的可选步骤预览',
        noActivatedOptionalSteps: '按当前标记不会激活任何可选步骤。',
        whatHappensNext: '接下来会发生什么',
        createFirstChange: '创建第一个变更',
        creatingChange: '正在创建变更...',
        skipForNow: '稍后再创建，先进入仪表板',
        dashboard: 'Dorado 仪表板',
        refresh: '刷新',
        createFeature: '创建变更',
        inspectionOnlyMode: '查看与巡检优先',
        bootstrapCliOnlyTitle: 'GUI 只负责查看，初始化请走 CLI 或 skill',
        bootstrapCliOnlyDescription: '这个界面会展示当前目录状态、缺失结构、推断模块和后续建议，但不再承担主初始化逻辑。协议初始化、知识补齐和业务 scaffold 应由 CLI 或 skill 显式触发。',
        bootstrapNextStepTitle: '推荐下一步',
        bootstrapCliInitCommand: '运行 dorado init 初始化协议壳',
        bootstrapCliDocsCommand: '运行 dorado docs generate 补齐项目知识层',
        bootstrapCliStatusCommand: '运行 dorado status 查看文本状态摘要',
        bootstrapCliSkillHint: '如果你正在通过 skill 逐步构建项目，也可以直接让 skill 驱动后续动作。',
        inspectionSignalsTitle: '巡检指标',
        inspectionStructureSignal: '结构完整度',
        inspectionDocsSignal: '文档健康度',
        inspectionSkillsSignal: '技能与索引健康度',
        inspectionExecutionSignal: '执行态势',
        inspectionHealthy: '健康',
        inspectionAttention: '需关注',
        inspectionIdle: '空闲',
        inspectionStructureHealthy: '核心结构和推荐结构已经对齐。',
        inspectionStructureAttention: '项目仍停留在协议壳或部分初始化状态。',
        inspectionDocsHealthy: '项目文档没有明显缺口。',
        inspectionDocsAttention: 'docs 层仍有缺失，建议继续补齐项目知识。',
        inspectionSkillsHealthy: '分层 SKILL 与索引处于可用状态。',
        inspectionSkillsAttention: '技能层或索引仍有缺口，建议优先修复。',
        inspectionExecutionHealthy: '存在进行中的 change，可继续通过 GUI 巡检进度。',
        inspectionExecutionIdle: '当前没有活跃 change，GUI 维持巡检视角即可。',
        projectTab: '项目',
        docsTab: '文档',
        skillsTab: '技能',
        executionTab: '执行',
        overview: '概览',
        features: '变更',
        workflow: '工作流',
        flags: '标记',
        structureLevel: '结构层级',
        structureLevelNone: '未初始化',
        structureLevelBasic: '基础结构',
        structureLevelFull: '完整结构',
        docsCoverage: '文档覆盖率',
        skillFiles: 'SKILL 文件',
        activeChangesLabel: '活跃变更',
        missingRequiredLabel: '缺失核心项',
        missingRecommendedLabel: '缺失推荐项',
        allRequiredReady: '核心项已齐全',
        allRecommendedReady: '推荐项已齐全',
        docsStatusTitle: '文档状态',
        skillsStatusTitle: '技能状态',
        coreDocsTitle: '核心文档',
        apiDocsTitle: 'API 文档',
        designDocsTitle: '设计文档',
        planningDocsTitle: '计划文档',
        docsHealthTitle: '文档健康度',
        skillHealthTitle: '技能健康度',
        indexStatus: '索引状态',
        modules: '模块',
        moduleMapTitle: '模块清单',
        moduleCount: '模块数',
        apiDocCount: 'API 文档数',
        designDocCount: '设计文档数',
        planningDocCount: '计划文档数',
        skillCoverage: '技能覆盖率',
        noModulesDiscovered: '当前没有发现模块级 SKILL。',
        noDocsTracked: '当前没有可展示的文档状态。',
        noApiDocs: '当前还没有 API 文档。',
        noDesignDocs: '当前还没有设计文档。',
        noPlanningDocs: '当前还没有计划文档。',
        indexReady: '索引已就绪',
        indexMissing: '索引缺失',
        indexNeedsAttention: '索引需要关注',
        indexNeedsRebuild: '索引需要重建',
        indexRebuildReady: '索引建议重建',
        indexLatestSourceUpdate: '最近技能更新时间',
        rebuildIndex: '重建索引',
        rebuildingIndex: '正在重建索引...',
        indexRebuildReasons: '重建原因',
        sourceIndexStatusDescription: '提供索引文件是否存在、是否过期、最近源文件更新时间以及重建原因。',
        assetSourcesTitle: '资产来源',
        assetDirectCopy: '母版复制',
        assetTemplateGenerated: '模板生成',
        assetRuntimeGenerated: '运行期生成',
        assetGeneratedAt: '生成时间',
        assetManifestPath: '清单路径',
        assetSourcePath: '母版来源',
        assetTargetPath: '项目路径',
        assetMissing: '当前项目还没有资产来源清单。',
        allSkillsReady: '技能层已齐全',
        missingSkillsLabel: '缺失技能项',
        generatedAt: '最近更新时间',
        totalFeatures: '总变更数',
        proposed: '提案中',
        planned: '已计划',
        implementing: '实现中',
        verifying: '验证中',
        currentWorkflow: '当前工作流',
        noActiveChanges: '当前还没有活跃变更。',
        noActiveChangesHint: '使用 `dorado new <change-name> <path>` 或 skill 创建新的 change，然后回到这里查看进度。',
        progress: '进度',
        currentStep: '当前步骤',
        modeLite: '轻量',
        modeStandard: '标准',
        modeFull: '完整',
        statusDraft: '草稿',
        statusPlanned: '已计划',
        statusImplementing: '实现中',
        statusVerifying: '验证中',
        statusReadyToArchive: '待归档',
        stepProposalLabel: '提案',
        stepTasksLabel: '任务',
        stepStateLabel: '状态',
        stepVerificationLabel: '验证',
        stepSkillUpdateLabel: '技能文档更新',
        stepIndexRegeneratedLabel: '索引重建',
        stepCodeReviewLabel: '代码评审',
        stepDesignDocLabel: '设计文档',
        stepPlanDocLabel: '计划文档',
        stepSecurityReviewLabel: '安全评审',
        stepAdrLabel: '架构决策记录',
        stepDbChangeDocLabel: '数据库变更文档',
        stepApiChangeDocLabel: 'API 变更文档',
        flagCrossModule: '跨模块',
        flagComplexFeature: '复杂功能',
        flagLargeFeature: '大型功能',
        flagMultiPhase: '多阶段',
        flagHighRisk: '高风险',
        flagMultiFileChange: '多文件变更',
        flagSecurityRelated: '安全相关',
        flagAuth: '鉴权相关',
        flagPayment: '支付相关',
        flagPublicApiChange: '公共 API 变更',
        flagArchitectureChange: '架构变更',
        flagImportantDecision: '重要决策',
        flagExternalApi: '外部 API',
        flagDbSchemaChange: '数据库 Schema 变更',
        noFlags: '没有标记',
        noOptionalStepsForMode: '当前项目模式没有启用可选步骤。',
        supportedFlags: '支持的标记',
        noFlagsAvailable: '当前没有可用标记。',
        featureNameRequired: '变更名称不能为空',
        stepProposal: '生成 changes/active/<change>/proposal.md',
        stepTasks: '生成 changes/active/<change>/tasks.md',
        stepState: '生成 changes/active/<change>/state.json',
        stepVerification: '生成 changes/active/<change>/verification.md',
        stepReview: '生成 changes/active/<change>/review.md',
        stepBackToDashboard: '回到仪表板并显示新创建的变更',
        nextDevelopmentGuideTitle: '后续如何继续开发',
        nextDevelopmentGuideDescription: '先查看初始化沉淀的项目知识，再决定是直接创建首个变更，还是回到仪表板继续巡检。',
        nextOpenBootstrapSummary: '查看 bootstrap 提交摘要',
        nextOpenModuleMap: '查看模块地图',
        nextOpenApiOverview: '查看 API 总览',
        nextOpenSkillIndex: '查看技能索引',
        openFilePreview: '查看',
        closePreview: '关闭预览',
        loadingFilePreview: '正在读取文件...',
        filePreviewTitle: '文件预览',
        currentProject: '当前项目',
        currentDirectory: '当前目录',
        projectFallback: '项目',
        languageLabel: '语言',
        unknownValue: '未知',
        sectionsLabel: '区块数',
      },
      en: {
        loading: 'Preparing Dorado',
        guiFirstBootstrap: 'GUI-first bootstrap',
        bootstrapTitle: 'Initialize Dorado first, then move into the delivery flow.',
        bootstrapDescription:
          'This wizard inspects the repository and captures planning input. `init` writes only {{skillrc}}, the protocol shell, and base directories; project knowledge, business scaffold, and the bootstrap summary are generated only by an explicit commit/backfill step.',
        selected: 'Selected',
        preset: 'Preset',
        bootstrapStepMode: 'Step 1 Mode',
        bootstrapStepBasics: 'Step 2 Basics',
        bootstrapStepArchitecture: 'Step 3 Planning',
        bootstrapStepPreview: 'Step 4 Preview',
        nextStep: 'Next',
        previousStep: 'Back',
        previewAndContinue: 'Preview and continue',
        previewing: 'Generating preview...',
        bootstrapProjectNameRequired: 'Project name is required',
        bootstrapDescriptionRequired: 'Enter a project description first',
        optionalStepsEnabled: '{{count}} optional steps enabled',
        selectedMode: 'Selected mode',
        projectPlanning: 'Project planning',
        projectPlanningDescription: 'Capture the project name, summary, stack, modules, and API areas first so initialization can generate a meaningful knowledge skeleton.',
        bootstrapOnlyProjectNameRequired: 'Only the project name is required. Dorado can generate placeholder content for the rest.',
        bootstrapDetectedModulesTitle: 'Modules detected from the current directory',
        bootstrapDetectedModulesEmpty: 'No modules could be inferred from the current directory yet.',
        bootstrapStructurePolicyTitle: 'Initialization policy',
        bootstrapStructurePolicyDescription: 'The minimum runnable structure makes Dorado usable; the recommended structure completes the knowledge layer and index. Legacy projects may miss recommended items without being treated as uninitialized.',
        bootstrapMinimumStructure: 'Minimum runnable structure',
        bootstrapRecommendedStructure: 'Recommended full structure',
        bootstrapAssetSourcesTitle: 'Asset Sources',
        bootstrapDirectCopyCount: 'Direct-copy assets',
        bootstrapTemplateGeneratedCount: 'Template-generated assets',
        bootstrapRuntimeGeneratedCount: 'Runtime-generated assets',
        bootstrapSourceExamples: 'Source examples',
        bootstrapScaffoldTitle: 'Business scaffold',
        bootstrapScaffoldDirectories: 'Directories to create',
        bootstrapScaffoldFiles: 'Framework files to create',
        bootstrapScaffoldFramework: 'Framework',
        bootstrapScaffoldInstallCommand: 'Install and run',
        bootstrapScaffoldEmpty: 'No business scaffold preview is selected for the current preset. Protocol init stays empty; scaffold only applies during explicit bootstrap commit.',
        bootstrapScaffoldExistingFiles: 'Existing framework files to preserve',
        bootstrapScaffoldExistingDirectories: 'Existing directories to reuse',
        bootstrapExecuteCommands: 'Execute scaffold commands during commit',
        bootstrapExecuteCommandsDescription: 'When enabled, bootstrap will try to run dependency installation commands on commit. If a step fails, Dorado writes .dorado/bootstrap-recovery.json with recovery guidance.',
        bootstrapCommandPlanTitle: 'Command plan',
        bootstrapCommandDeferred: 'Commands are prepared but deferred.',
        bootstrapCommandWillExecute: 'Commands will execute during bootstrap commit.',
        bootstrapCommandStatusSkipped: 'Deferred',
        bootstrapCommandStatusCompleted: 'Completed',
        bootstrapCommandStatusFailed: 'Failed with recovery record',
        bootstrapRecoveryFile: 'Recovery file',
        bootstrapInitSummaryTitle: 'Bootstrap commit summary',
        bootstrapInitDoradoFiles: 'Dorado protocol layer',
        bootstrapInitBusinessFiles: 'Business framework layer',
        bootstrapInitCreated: 'Created now',
        bootstrapInitSkipped: 'Already existed and was preserved',
        bootstrapInitRuntime: 'Runtime-generated',
        bootstrapInitHooks: 'Git hooks',
        featureSuggestionTitle: 'Preset suggestion',
        featureSuggestionSource: 'Preset source',
        featureSuggestionBackground: 'Suggested background',
        featureSuggestionAffects: 'Suggested affects',
        featureSuggestionFlags: 'Suggested flags',
        bootstrapProjectDescription: 'Project description',
        bootstrapProjectDescriptionPlaceholder: 'Describe the project in natural language, for example: Build a doradospec website with Next.js and TypeScript, including marketing pages, docs, admin content management, and auth.',
        bootstrapProjectPreset: 'Project preset',
        bootstrapProjectPresetTitle: 'Business preset',
        bootstrapProjectPresetDescription: 'Choose a business preset first. Presets only provide default planning input for project knowledge and scaffold previews; they do not turn protocol init into a template bootstrap.',
        bootstrapProjectPresetRecommendedMode: 'Recommended mode',
        bootstrapProjectPresetRecommendedStack: 'Recommended tech stack',
        bootstrapProjectPresetSelectedHint: 'This preset will be used as the default planning source.',
        inferProjectPlan: 'Infer plan from description',
        inferringProjectPlan: 'Inferring plan...',
        bootstrapProjectName: 'Project name',
        bootstrapProjectNamePlaceholder: 'For example: Dorado website',
        bootstrapSummary: 'Project summary',
        bootstrapSummaryPlaceholder: 'What problem does this project solve? Who is it for?',
        bootstrapTechStack: 'Tech stack',
        bootstrapTechStackPlaceholder: 'One item per line, for example: Next.js\nTypeScript\nPostgreSQL',
        bootstrapArchitecture: 'Architecture',
        bootstrapArchitecturePlaceholder: 'Describe the major layers, modules, and runtime shape',
        bootstrapModules: 'Module plan',
        bootstrapModulesPlaceholder: 'One module per line, for example: web\ncms\nauth',
        bootstrapApiAreas: 'API plan',
        bootstrapApiAreasPlaceholder: 'One API area per line, for example: auth api\ncontent api',
        bootstrapDesignDocs: 'Design docs',
        bootstrapDesignDocsPlaceholder: 'One long-lived design document per line',
        bootstrapPlanningDocs: 'Planning docs',
        bootstrapPlanningDocsPlaceholder: 'One milestone or planning document per line',
        bootstrapFieldRequired: 'Required',
        bootstrapFieldOptional: 'Optional',
        bootstrapFieldPlaceholderAllowed: 'Placeholder generation allowed',
        bootstrapFieldInferred: 'Directory inference will be used',
        bootstrapFieldPresetApplied: 'Preset defaults will be used',
        bootstrapFieldPlaceholderGenerated: 'Default placeholder content will be used',
        bootstrapFallbackFieldsTitle: 'Fields that will be auto-filled',
        bootstrapFallbackFieldsEmpty: 'No placeholder fallback is used in the current preview.',
        bootstrapFilesLabel: 'Files to generate',
        bootstrapPreview: 'Bootstrap preview',
        initializeAndContinue: 'Initialize and continue',
        initializing: 'Initializing...',
        coreSteps: 'Core steps',
        enabledOptionalSteps: 'Enabled optional steps',
        noOptionalStepsEnabled: 'No optional steps enabled',
        projectCheck: 'Project check',
        ready: 'Ready',
        needsInit: 'Needs init',
        present: 'Present',
        missing: 'Missing',
        structurePreview: 'Structure preview',
        firstChangeSetup: 'First change setup',
        featureSetupTitle: 'Initialization is done. Create the first change now.',
        featureSetupDescription:
          'This step generates the first active change files directly: {{proposal}}, {{tasks}}, {{state}}, {{verification}}, and {{review}}.',
        featureName: 'Change name',
        featureNamePlaceholder: 'fullchain-skill-onboarding',
        background: 'Background',
        backgroundPlaceholder: 'Why is this change needed? What is the current pain point?',
        goals: 'Goals',
        goalsPlaceholder: 'One goal per line',
        inScope: 'In scope',
        inScopePlaceholder: 'One in-scope item per line',
        outOfScope: 'Out of scope',
        outOfScopePlaceholder: 'One out-of-scope item per line',
        acceptanceCriteria: 'Acceptance criteria',
        acceptanceCriteriaPlaceholder: 'One acceptance item per line',
        affects: 'Affected areas',
        affectsPlaceholder: 'One module per line',
        featureFlags: 'Change flags',
        featureFlagsDescription:
          'Choose the flags that match this project mode. Optional steps update automatically.',
        projectSummary: 'Project summary',
        upgradeSuggestionsTitle: 'Upgrade suggestions',
        noUpgradeSuggestions: 'There are no structure upgrade suggestions right now.',
        viewDataSourcesTitle: 'Data sources',
        viewStateTitle: 'View state',
        sourceEndpoint: 'Endpoint',
        sourceProjectSummaryDescription: 'Provides the project name, mode, structure level, current path, and creation time.',
        sourceBootstrapStatusDescription: 'Provides structure completeness, missing paths, and upgrade suggestions to decide whether the knowledge layer still needs work.',
        sourceWorkflowDescription: 'Provides the current mode workflow plus the default workflow profile and compatibility inference used by the dashboard.',
        sourceAssetStatusDescription: 'Provides the effective asset manifest, distinguishes direct-copy, template-generated, and runtime-generated outputs, and notes that the bootstrap summary appears only on explicit commit.',
        sourceDocsStatusDescription: 'Provides core-doc coverage and the presence of API, design, and planning documents.',
        sourceSkillsStatusDescription: 'Provides layered SKILL files, discovered modules, and the index snapshot for the skills layer.',
        sourceExecutionStatusDescription: 'Provides the active change list, queued change summary, progress signals, and the per-change workflow profile shown in the execution view.',
        sourceFlagsDescription: 'Provides the supported flags for new changes in the current project mode.',
        statusReady: 'Ready',
        statusNeedsUpgrade: 'Needs upgrade',
        statusNeedsAttention: 'Needs attention',
        statusEmpty: 'Empty',
        readyStateTitle: 'This view already has the baseline data it needs',
        readyStateDescription: 'The current data sources are available, so you can inspect the project state or continue with the next change.',
        legacyProjectTitle: 'A legacy or partially initialized project was detected',
        legacyProjectDescription: 'The repository already has the Dorado core structure, but the project knowledge layer is still incomplete. Finish docs, SKILL files, index assets, and AI guides before treating this dashboard as complete.',
        openUpgradeWizard: 'Open upgrade wizard',
        legacyUpgradeHint: 'The GUI now only surfaces the gaps and risk signals. Use CLI or skills to backfill the missing knowledge layer.',
        docsNeedAttentionTitle: 'The docs layer still has gaps',
        docsNeedAttentionDescription: 'Required or recommended docs are still missing, so the docs view is prioritizing missing items.',
        docsEmptyTitle: 'There are no document assets to show yet',
        docsEmptyDescription: 'It is valid for API, design, and planning docs to stay empty in a protocol-shell project. They normally appear after `dorado docs generate` or later knowledge-building skills.',
        skillsNeedAttentionTitle: 'The skills layer still has gaps',
        skillsNeedAttentionDescription: 'Root skills, module skills, or index assets are incomplete, so the skills view prioritizes protocol gaps and index issues.',
        skillsEmptyTitle: 'There is no skills structure to show yet',
        skillsEmptyDescription: 'A protocol-shell project can legitimately have no module-level skills yet. They normally appear after `dorado docs generate` or later knowledge-building skills.',
        executionEmptyTitle: 'There are no active changes yet',
        executionEmptyDescription: 'The execution view is ready, but there is no in-flight change yet. The GUI now focuses on inspection; create new changes from CLI or skills.',
        name: 'Name',
        mode: 'Mode',
        activatedOptionalStepsPreview: 'Activated optional steps preview',
        noActivatedOptionalSteps: 'No optional steps will be activated with the current flags.',
        whatHappensNext: 'What happens next',
        createFirstChange: 'Create the first change',
        creatingChange: 'Creating change...',
        skipForNow: 'Skip for now and open the dashboard',
        dashboard: 'Dorado dashboard',
        refresh: 'Refresh',
        createFeature: 'Create change',
        inspectionOnlyMode: 'Inspection-first',
        bootstrapCliOnlyTitle: 'The GUI is now inspection-first; use CLI or skills for initialization',
        bootstrapCliOnlyDescription: 'This view shows the current directory status, missing structure, inferred modules, and recommended next steps, but it no longer carries the main creation flow. Protocol init, knowledge backfill, and business scaffold should be triggered explicitly from CLI or skills.',
        bootstrapNextStepTitle: 'Recommended next steps',
        bootstrapCliInitCommand: 'Run dorado init to create the protocol shell',
        bootstrapCliDocsCommand: 'Run dorado docs generate to backfill the project knowledge layer',
        bootstrapCliStatusCommand: 'Run dorado status for a textual project summary',
        bootstrapCliSkillHint: 'If you are building the project progressively with skills, let the skill drive the next explicit action instead.',
        inspectionSignalsTitle: 'Inspection signals',
        inspectionStructureSignal: 'Structure alignment',
        inspectionDocsSignal: 'Docs health',
        inspectionSkillsSignal: 'Skills and index health',
        inspectionExecutionSignal: 'Execution posture',
        inspectionHealthy: 'Healthy',
        inspectionAttention: 'Needs attention',
        inspectionIdle: 'Idle',
        inspectionStructureHealthy: 'Core and recommended structure are aligned.',
        inspectionStructureAttention: 'The project is still at protocol-shell or partial-initialization level.',
        inspectionDocsHealthy: 'The docs layer does not show obvious gaps.',
        inspectionDocsAttention: 'The docs layer still has gaps and should be backfilled further.',
        inspectionSkillsHealthy: 'Layered skills and the index are in a usable state.',
        inspectionSkillsAttention: 'The skills layer or index still has gaps and should be repaired first.',
        inspectionExecutionHealthy: 'There are active changes in flight; use the GUI to inspect progress.',
        inspectionExecutionIdle: 'There is no active change right now, so the GUI stays in inspection mode.',
        projectTab: 'Project',
        docsTab: 'Docs',
        skillsTab: 'Skills',
        executionTab: 'Execution',
        overview: 'Overview',
        features: 'Changes',
        workflow: 'Workflow',
        flags: 'Flags',
        structureLevel: 'Structure level',
        structureLevelNone: 'Uninitialized',
        structureLevelBasic: 'Basic structure',
        structureLevelFull: 'Full structure',
        docsCoverage: 'Docs coverage',
        skillFiles: 'SKILL files',
        activeChangesLabel: 'Active changes',
        queuedChangesLabel: 'Queued changes',
        missingRequiredLabel: 'Missing required',
        missingRecommendedLabel: 'Missing recommended',
        allRequiredReady: 'All required items are present',
        allRecommendedReady: 'All recommended items are present',
        docsStatusTitle: 'Docs status',
        skillsStatusTitle: 'Skills status',
        coreDocsTitle: 'Core docs',
        apiDocsTitle: 'API docs',
        designDocsTitle: 'Design docs',
        planningDocsTitle: 'Planning docs',
        docsHealthTitle: 'Docs health',
        skillHealthTitle: 'Skills health',
        indexStatus: 'Index status',
        modules: 'Modules',
        moduleMapTitle: 'Module map',
        moduleCount: 'Modules',
        apiDocCount: 'API docs',
        designDocCount: 'Design docs',
        planningDocCount: 'Planning docs',
        skillCoverage: 'Skill coverage',
        noModulesDiscovered: 'No module-level skills were discovered yet.',
        noDocsTracked: 'There are no tracked docs to show yet.',
        noApiDocs: 'There are no API docs yet.',
        noDesignDocs: 'There are no design docs yet.',
        noPlanningDocs: 'There are no planning docs yet.',
        indexReady: 'Index ready',
        indexMissing: 'Index missing',
        indexNeedsAttention: 'Index needs attention',
        indexNeedsRebuild: 'Index needs rebuild',
        indexRebuildReady: 'Index rebuild suggested',
        indexLatestSourceUpdate: 'Latest skill update',
        rebuildIndex: 'Rebuild index',
        rebuildingIndex: 'Rebuilding index...',
        indexRebuildReasons: 'Rebuild reasons',
        sourceIndexStatusDescription: 'Provides whether the index exists, whether it is stale, the latest source update, and rebuild reasons.',
        assetSourcesTitle: 'Asset sources',
        assetDirectCopy: 'Direct copy',
        assetTemplateGenerated: 'Template generated',
        assetRuntimeGenerated: 'Runtime generated',
        assetGeneratedAt: 'Generated at',
        assetManifestPath: 'Manifest path',
        assetSourcePath: 'Packaged source',
        assetTargetPath: 'Project path',
        assetPhaseDescription: 'This panel only explains where current assets came from: direct-copy assets belong to the protocol layer, template-generated assets come from knowledge generation, and runtime-generated assets are execution artifacts. The bootstrap summary appears only on explicit commit.',
        assetMissing: 'There is no asset manifest yet. Protocol-shell initialization alone does not create the full manifest; it normally appears after knowledge backfill or a bootstrap commit.',
        allSkillsReady: 'All skill layers are present',
        missingSkillsLabel: 'Missing skills',
        generatedAt: 'Last updated',
        totalFeatures: 'Total changes',
        proposed: 'Proposed',
        planned: 'Planned',
        implementing: 'Implementing',
        verifying: 'Verifying',
        currentWorkflow: 'Current workflow',
        workflowProfileLabel: 'Workflow profile',
        workflowProfileDefaultLabel: 'Default profile',
        workflowProfilesAvailableLabel: 'Available profiles',
        workflowProfileExplicit: 'Explicit',
        workflowProfileInferred: 'Inferred',
        workflowProfileFlagInference: 'Flag-inferred',
        workflowProfileLegacyInference: 'Legacy file-set',
        workflowProfileModeFallback: 'Mode fallback',
        workflowProfileReasonLabel: 'Resolution basis',
        workflowProfileProtocolFilesLabel: 'Minimum protocol files',
        workflowProfileArchiveFocusLabel: 'Archive focus',
        workflowProfileAvailableHint: 'The dashboard only displays the default profile and compatibility inference. Real profile selection still belongs to CLI or skills.',
        workflowProfileDefaultHint: 'The current default profile is still inferred from project mode until explicit workflowProfiles config lands.',
        docsProtocolHint: 'API, design, and planning docs normally appear only after the project knowledge layer is backfilled.',
        skillsProtocolHint: 'Module skills and the skill index normally appear only after the project knowledge layer is built.',
        noActiveChanges: 'There are no active changes yet.',
        noActiveChangesHint: 'Use `dorado new <change-name> <path>` or a skill to create the next change, then return here to inspect progress.',
        queuedChangesWaiting: 'Queued changes are waiting for activation.',
        queuedChangeActivateHint: 'Finish or finalize the current active change, then activate the next queued change from the CLI.',
        noQueuedChanges: 'There are no queued changes.',
        progress: 'Progress',
        currentStep: 'Current step',
        modeLite: 'Lite',
        modeStandard: 'Standard',
        modeFull: 'Full',
        statusQueued: 'Queued',
        statusDraft: 'Draft',
        statusPlanned: 'Planned',
        statusImplementing: 'Implementing',
        statusVerifying: 'Verifying',
        statusReadyToArchive: 'Ready to archive',
        stepProposalLabel: 'Proposal',
        stepTasksLabel: 'Tasks',
        stepStateLabel: 'State',
        stepVerificationLabel: 'Verification',
        stepSkillUpdateLabel: 'Skill update',
        stepIndexRegeneratedLabel: 'Index regenerated',
        stepCodeReviewLabel: 'Code review',
        stepDesignDocLabel: 'Design doc',
        stepPlanDocLabel: 'Plan doc',
        stepSecurityReviewLabel: 'Security review',
        stepAdrLabel: 'ADR',
        stepDbChangeDocLabel: 'DB change doc',
        stepApiChangeDocLabel: 'API change doc',
        flagCrossModule: 'Cross-module',
        flagComplexFeature: 'Complex feature',
        flagLargeFeature: 'Large feature',
        flagMultiPhase: 'Multi-phase',
        flagHighRisk: 'High risk',
        flagMultiFileChange: 'Multi-file change',
        flagSecurityRelated: 'Security-related',
        flagAuth: 'Auth-related',
        flagPayment: 'Payment-related',
        flagPublicApiChange: 'Public API change',
        flagArchitectureChange: 'Architecture change',
        flagImportantDecision: 'Important decision',
        flagExternalApi: 'External API',
        flagDbSchemaChange: 'DB schema change',
        noFlags: 'No flags',
        noOptionalStepsForMode: 'No optional steps are enabled for this project mode.',
        supportedFlags: 'Supported flags',
        noFlagsAvailable: 'No flags are available.',
        featureNameRequired: 'Change name is required',
        stepProposal: 'Generate changes/active/<change>/proposal.md',
        stepTasks: 'Generate changes/active/<change>/tasks.md',
        stepState: 'Generate changes/active/<change>/state.json',
        stepVerification: 'Generate changes/active/<change>/verification.md',
        stepReview: 'Generate changes/active/<change>/review.md',
        stepBackToDashboard: 'Return to the dashboard and show the new change',
        nextDevelopmentGuideTitle: 'What to do next',
        nextDevelopmentGuideDescription: 'Review the generated project knowledge first, then decide whether to create the first change now or return to the dashboard.',
        nextOpenBootstrapSummary: 'Open bootstrap commit summary',
        nextOpenModuleMap: 'Open module map',
        nextOpenApiOverview: 'Open API overview',
        nextOpenSkillIndex: 'Open skill index',
        openFilePreview: 'Open',
        closePreview: 'Close preview',
        loadingFilePreview: 'Loading file preview...',
        filePreviewTitle: 'File preview',
        currentProject: 'Current project',
        currentDirectory: 'Current directory',
        projectFallback: 'Project',
        languageLabel: 'Language',
        unknownValue: 'Unknown',
        sectionsLabel: 'Sections',
      },
    };

    const languageMessages = messages[this.state.language] || messages.en;
    let template = languageMessages[key] || messages.en[key] || key;
    for (const [paramKey, paramValue] of Object.entries(params)) {
      template = template.replaceAll(`{{${paramKey}}}`, String(paramValue));
    }
    return template;
  }

  presetDescription(mode) {
    const descriptions = {
      zh: {
        lite: '??????????????????????????',
        standard: '?????????????????????',
        full: '?????????????????????????????????????????',
      },
      en: {
        lite: 'Light governance for smaller repositories that only need the essential workflow checks.',
        standard: 'Balanced default governance for most teams using Dorado day to day.',
        full: 'Strict governance for larger or riskier projects; this is stronger policy, not a different product tier.',
      },
    };

    return descriptions[this.state.language]?.[mode] || descriptions.en[mode] || mode;
  }

  formatPresetOptionalSteps(count) {
    return this.t('optionalStepsEnabled', { count });
  }

  renderLanguageSwitcher() {
    return `
      <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 p-1 text-xs uppercase tracking-[0.2em] text-stone-300">
        <span class="px-2 text-[10px] text-stone-500">${this.t('languageLabel')}</span>
        <button
          type="button"
          onclick="app.setLanguage('zh')"
          class="${this.state.language === 'zh' ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:bg-white/5'} rounded-full px-3 py-1 transition"
        >
          中文
        </button>
        <button
          type="button"
          onclick="app.setLanguage('en')"
          class="${this.state.language === 'en' ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:bg-white/5'} rounded-full px-3 py-1 transition"
        >
          EN
        </button>
      </div>
    `;
  }

  parseMultilineList(text) {
    return text
      .split(/\r?\n/)
      .map(item => item.trim())
      .map(item => item.replace(/^[-*]\s*/, '').replace(/^\[\s?\]\s*/, '').trim())
      .filter(Boolean);
  }

  escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  async fetchJson(endpoint, options) {
    const response = await fetch(`${this.apiBase}${endpoint}`, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  }

  renderPreviewButton(filePath, title) {
    return `
      <button
        type="button"
        onclick='app.openFilePreview(${this.toInlineJsString(filePath)}, ${this.toInlineJsString(title || filePath)})'
        class="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-sky-400 hover:text-sky-100"
      >
        ${this.t('openFilePreview')}
      </button>
    `;
  }

  renderFilePreviewModal() {
    if (!this.state.filePreview && !this.state.filePreviewLoading) {
      return '';
    }

    const preview = this.state.filePreview;
    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
        <div class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-2xl">
          <div class="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('filePreviewTitle')}</p>
              <h2 class="mt-2 truncate text-lg font-semibold text-slate-50">${this.escapeHtml(preview?.title || '')}</h2>
              <p class="mt-2 truncate font-mono text-xs text-slate-400">${this.escapeHtml(preview?.path || '')}</p>
            </div>
            <button
              type="button"
              onclick="app.closeFilePreview()"
              class="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              ${this.t('closePreview')}
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-auto px-6 py-5">
            ${this.state.filePreviewLoading
              ? `<p class="text-sm text-slate-400">${this.t('loadingFilePreview')}</p>`
              : `<pre class="overflow-auto whitespace-pre-wrap break-words rounded-[1.5rem] border border-slate-800 bg-slate-900/80 p-5 font-mono text-xs leading-6 text-slate-200">${this.escapeHtml(preview?.content || '')}</pre>`
            }
          </div>
        </div>
      </div>
    `;
  }

  isLegacyProject() {
    return this.state.bootstrap?.initialized && this.state.bootstrap?.nextAction === 'complete_project_knowledge';
  }

  getViewSources(viewId) {
    const sourceMap = {
      project: [
        {
          label: this.t('projectSummary'),
          endpoint: '/api/project/summary',
          description: this.t('sourceProjectSummaryDescription'),
        },
        {
          label: this.t('upgradeSuggestionsTitle'),
          endpoint: '/api/bootstrap/status',
          description: this.t('sourceBootstrapStatusDescription'),
        },
        {
          label: this.t('currentWorkflow'),
          endpoint: '/api/workflow',
          description: this.t('sourceWorkflowDescription'),
        },
        {
          label: this.t('assetSourcesTitle'),
          endpoint: '/api/assets/status',
          description: this.t('sourceAssetStatusDescription'),
        },
      ],
      docs: [
        {
          label: this.t('docsStatusTitle'),
          endpoint: '/api/docs/status',
          description: this.t('sourceDocsStatusDescription'),
        },
        {
          label: this.t('upgradeSuggestionsTitle'),
          endpoint: '/api/bootstrap/status',
          description: this.t('sourceBootstrapStatusDescription'),
        },
      ],
      skills: [
        {
          label: this.t('skillsStatusTitle'),
          endpoint: '/api/skills/status',
          description: this.t('sourceSkillsStatusDescription'),
        },
        {
          label: this.t('indexStatus'),
          endpoint: '/api/index/status',
          description: this.t('sourceIndexStatusDescription'),
        },
        {
          label: this.t('upgradeSuggestionsTitle'),
          endpoint: '/api/bootstrap/status',
          description: this.t('sourceBootstrapStatusDescription'),
        },
      ],
      execution: [
        {
          label: this.t('activeChangesLabel'),
          endpoint: '/api/execution/status',
          description: this.t('sourceExecutionStatusDescription'),
        },
        {
          label: this.t('currentWorkflow'),
          endpoint: '/api/workflow',
          description: this.t('sourceWorkflowDescription'),
        },
        {
          label: this.t('supportedFlags'),
          endpoint: '/api/flags',
          description: this.t('sourceFlagsDescription'),
        },
      ],
    };

    return sourceMap[viewId] || [];
  }

  getViewState(viewId) {
    const docsStatus = this.state.docsStatus;
    const skillsStatus = this.state.skillsStatus;
    const execution = this.state.execution;
    const legacy = this.isLegacyProject();
    const upgradeTitles = (this.state.bootstrap?.upgradeSuggestions || []).map(item => item.title);

    if (legacy) {
      return {
        tone: 'amber',
        badge: this.t('statusNeedsUpgrade'),
        title: this.t('legacyProjectTitle'),
        description: this.t('legacyProjectDescription'),
        items: upgradeTitles,
      };
    }

    if (viewId === 'docs') {
      if (!docsStatus || !docsStatus.items?.length || docsStatus.existing === 0) {
        return {
          tone: 'slate',
          badge: this.t('statusEmpty'),
          title: this.t('docsEmptyTitle'),
          description: this.t('docsEmptyDescription'),
          items: [],
        };
      }
      if ((docsStatus.missingRequired?.length || 0) > 0 || (docsStatus.missingRecommended?.length || 0) > 0) {
        return {
          tone: 'amber',
          badge: this.t('statusNeedsAttention'),
          title: this.t('docsNeedAttentionTitle'),
          description: this.t('docsNeedAttentionDescription'),
          items: [...(docsStatus.missingRequired || []), ...(docsStatus.missingRecommended || [])],
        };
      }
    }

    if (viewId === 'skills') {
      if (!skillsStatus || skillsStatus.existing === 0) {
        return {
          tone: 'slate',
          badge: this.t('statusEmpty'),
          title: this.t('skillsEmptyTitle'),
          description: this.t('skillsEmptyDescription'),
          items: [],
        };
      }
      if (
        (skillsStatus.missingRecommended?.length || 0) > 0 ||
        !skillsStatus.skillIndex?.exists ||
        skillsStatus.skillIndex?.needsRebuild
      ) {
        return {
          tone: 'amber',
          badge: this.t('statusNeedsAttention'),
          title: this.t('skillsNeedAttentionTitle'),
          description: this.t('skillsNeedAttentionDescription'),
          items: [
            ...(skillsStatus.missingRecommended || []),
            ...(skillsStatus.skillIndex?.exists ? [] : [skillsStatus.skillIndex?.path || this.t('indexMissing')]),
            ...(skillsStatus.skillIndex?.needsRebuild ? skillsStatus.skillIndex.reasons || [] : []),
          ],
        };
      }
    }

    if (viewId === 'execution' && (!execution || execution.totalActiveChanges === 0)) {
      return {
        tone: 'slate',
        badge: this.t('statusEmpty'),
        title: this.t('executionEmptyTitle'),
        description: this.t('executionEmptyDescription'),
        items: [],
      };
    }

    return {
      tone: 'emerald',
      badge: this.t('statusReady'),
      title: this.t('readyStateTitle'),
      description: this.t('readyStateDescription'),
      items: [],
    };
  }

  renderDataSourcesCard(viewId) {
    const sources = this.getViewSources(viewId);
    return `
      <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
        <div class="flex items-center justify-between gap-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('viewDataSourcesTitle')}</p>
          <span class="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">${sources.length}</span>
        </div>
        <div class="mt-5 grid gap-3">
          ${sources.map(source => `
            <div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div class="flex items-center justify-between gap-4">
                <span class="font-medium text-slate-100">${this.escapeHtml(source.label)}</span>
                <span class="rounded-full border border-slate-700 px-3 py-1 font-mono text-[11px] text-slate-400">${this.escapeHtml(source.endpoint)}</span>
              </div>
              <p class="mt-2 leading-6 text-slate-400">${this.escapeHtml(source.description)}</p>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  renderAssetSourcesCard() {
    const assetStatus = this.state.assetStatus;
    if (!assetStatus?.exists) {
      return `
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('assetSourcesTitle')}</p>
          <p class="mt-4 text-sm leading-6 text-slate-400">${this.t('assetMissing')}</p>
        </section>
      `;
    }

    const groups = [
      {
        label: this.t('assetDirectCopy'),
        items: assetStatus.directCopy || [],
        tone: 'border-emerald-500/20 bg-emerald-500/8',
      },
      {
        label: this.t('assetTemplateGenerated'),
        items: assetStatus.templateGenerated || [],
        tone: 'border-sky-500/20 bg-sky-500/8',
      },
      {
        label: this.t('assetRuntimeGenerated'),
        items: assetStatus.runtimeGenerated || [],
        tone: 'border-amber-500/20 bg-amber-500/8',
      },
    ];

    return `
      <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('assetSourcesTitle')}</p>
            <div class="mt-3 space-y-2 text-sm text-slate-300">
              <div><span class="text-slate-500">${this.t('assetGeneratedAt')}:</span> ${assetStatus.generatedAt || '-'}</div>
              <div><span class="text-slate-500">${this.t('assetManifestPath')}:</span> ${assetStatus.path || '-'}</div>
            </div>
            <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-500">${this.t('assetPhaseDescription')}</p>
          </div>
          <div class="grid grid-cols-3 gap-3 text-center text-sm">
            <div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-emerald-100">
              <div>${this.t('assetDirectCopy')}</div>
              <div class="mt-2 text-2xl font-semibold">${assetStatus.summary?.directCopy || 0}</div>
            </div>
            <div class="rounded-2xl border border-sky-500/20 bg-sky-500/8 px-4 py-3 text-sky-100">
              <div>${this.t('assetTemplateGenerated')}</div>
              <div class="mt-2 text-2xl font-semibold">${assetStatus.summary?.templateGenerated || 0}</div>
            </div>
            <div class="rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-amber-100">
              <div>${this.t('assetRuntimeGenerated')}</div>
              <div class="mt-2 text-2xl font-semibold">${assetStatus.summary?.runtimeGenerated || 0}</div>
            </div>
          </div>
        </div>
        <div class="mt-6 grid gap-4 xl:grid-cols-3">
          ${groups.map(group => `
            <div class="rounded-[1.5rem] border ${group.tone} p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium text-slate-100">${group.label}</p>
                <span class="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">${group.items.length}</span>
              </div>
              <div class="mt-4 space-y-3">
                ${group.items.slice(0, 4).map(item => `
                  <div class="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">
                    <div><span class="text-slate-500">${this.t('assetTargetPath')}:</span> ${this.escapeHtml(item.targetRelativePath || '-')}</div>
                    <div class="mt-1"><span class="text-slate-500">${this.t('assetSourcePath')}:</span> ${this.escapeHtml(item.sourceRelativePath || '-')}</div>
                  </div>
                `).join('') || `<div class="text-xs text-slate-500">-</div>`}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  renderViewStateCard(viewId) {
    const state = this.getViewState(viewId);
    const toneMap = {
      emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
      amber: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
      slate: 'border-slate-700 bg-slate-900/80 text-slate-200',
    };

    return `
      <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
        <div class="flex items-center justify-between gap-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('viewStateTitle')}</p>
          <span class="rounded-full border px-3 py-1 text-xs ${toneMap[state.tone] || toneMap.slate}">${this.escapeHtml(state.badge)}</span>
        </div>
        <div class="mt-5 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4">
          <p class="text-base font-semibold text-slate-100">${this.escapeHtml(state.title)}</p>
          <p class="mt-2 text-sm leading-6 text-slate-400">${this.escapeHtml(state.description)}</p>
          ${state.items?.length
            ? `<div class="mt-4 grid gap-2">
                ${state.items.slice(0, 6).map(item => `
                  <div class="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-400">
                    ${this.escapeHtml(this.getLocalizedStatusItem(item))}
                  </div>
                `).join('')}
              </div>`
            : ''}
        </div>
      </section>
    `;
  }

  renderLegacyProjectBanner() {
    if (!this.isLegacyProject()) {
      return '';
    }

    const projectPath = this.state.bootstrap?.projectPath || this.state.project?.path || '.';
    return `
      <section class="rounded-[1.75rem] border border-amber-500/30 bg-amber-500/10 px-6 py-5 text-amber-50">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-amber-200">${this.t('statusNeedsUpgrade')}</p>
            <h2 class="mt-2 text-xl font-semibold">${this.t('legacyProjectTitle')}</h2>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-amber-100/90">${this.t('legacyProjectDescription')}</p>
            <p class="mt-2 text-xs text-amber-100/70">${this.t('legacyUpgradeHint')}</p>
          </div>
          <div class="rounded-2xl border border-amber-200/30 bg-amber-950/20 px-4 py-3 font-mono text-xs text-amber-100">
            dorado docs generate ${this.escapeHtml(projectPath)}
          </div>
        </div>
      </section>
    `;
  }

  render() {
    const app = document.getElementById('app');
    document.documentElement.lang = this.state.language === 'zh' ? 'zh-CN' : 'en';
    document.title = this.state.language === 'zh' ? 'Dorado 仪表板' : 'Dorado Dashboard';

    let content = '';

    if (this.state.loading) {
      content = this.renderLoading();
    } else if (this.state.view === 'dashboard') {
      content = this.renderDashboard();
    } else if (this.state.view === 'featureSetup') {
      content = this.renderFeatureSetup();
    } else {
      content = this.renderBootstrap();
    }

    app.innerHTML = `${content}${this.renderFilePreviewModal()}`;
  }

  renderLoading() {
    return `
      <main class="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <div class="text-center">
          <div class="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-stone-700 border-t-amber-400"></div>
          <p class="mt-4 text-sm tracking-[0.2em] uppercase text-stone-400">${this.t('loading')}</p>
        </div>
      </main>
    `;
  }

  renderBootstrap() {
    const bootstrap = this.state.bootstrap;
    const projectPath = bootstrap?.projectPath || '.';
    const nextCommands = bootstrap?.initialized
      ? [
          `dorado docs generate ${projectPath}`,
          `dorado status ${projectPath}`,
        ]
      : [
          `dorado init ${projectPath}`,
          `dorado status ${projectPath}`,
        ];

    return `
      <main class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_34%),linear-gradient(180deg,_#111111_0%,_#050505_100%)] text-stone-100">
        <section class="mx-auto max-w-6xl px-6 py-12 lg:px-10">
          <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div class="rounded-[2rem] border border-stone-800 bg-stone-950/85 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              <div class="flex items-start justify-between gap-4">
                <div class="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-amber-200">
                  ${this.t('inspectionOnlyMode')}
                </div>
                ${this.renderLanguageSwitcher()}
              </div>
              <h1 class="mt-6 text-4xl font-semibold tracking-tight text-stone-50">${this.t('bootstrapCliOnlyTitle')}</h1>
              <p class="mt-4 max-w-2xl text-base leading-7 text-stone-300">${this.t('bootstrapCliOnlyDescription')}</p>
              ${this.renderErrorBanner()}
              <div class="mt-8 rounded-[1.5rem] border border-stone-800 bg-stone-900/75 p-6">
                <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('bootstrapNextStepTitle')}</p>
                <div class="mt-4 grid gap-3">
                  ${nextCommands.map(command => `
                    <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 font-mono text-sm text-amber-100">${this.escapeHtml(command)}</div>
                  `).join('')}
                </div>
                <p class="mt-4 text-sm leading-6 text-stone-400">${this.t('bootstrapCliSkillHint')}</p>
              </div>
            </div>
            <div class="space-y-6">
              <section class="rounded-[2rem] border border-stone-800 bg-stone-950/90 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('projectCheck')}</p>
                    <h2 class="mt-2 text-2xl font-semibold text-stone-50">${bootstrap?.projectName || this.t('currentDirectory')}</h2>
                  </div>
                  <span class="rounded-full border ${bootstrap?.initialized ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'} px-3 py-1 text-xs uppercase tracking-[0.2em]">
                    ${bootstrap?.initialized ? this.t('ready') : this.t('needsInit')}
                  </span>
                </div>
                <p class="mt-4 break-all rounded-2xl bg-stone-900 px-4 py-3 text-sm text-stone-400">${bootstrap?.projectPath || ''}</p>
                <div class="mt-5 space-y-3">
                  ${(bootstrap?.checks || []).map(check => `
                    <div class="flex items-start justify-between gap-4 rounded-2xl border ${check.exists ? 'border-emerald-500/20 bg-emerald-500/8' : 'border-stone-800 bg-stone-900/80'} px-4 py-3">
                      <div>
                        <p class="text-sm font-medium text-stone-100">${check.name}</p>
                        <p class="mt-1 break-all text-xs text-stone-500">${check.path}</p>
                      </div>
                      <span class="text-xs uppercase tracking-[0.2em] ${check.exists ? 'text-emerald-300' : 'text-stone-500'}">
                        ${check.exists ? this.t('present') : this.t('missing')}
                      </span>
                    </div>
                  `).join('')}
                </div>
              </section>
              <section class="rounded-[2rem] border border-stone-800 bg-stone-950/90 p-6">
                <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('structurePreview')}</p>
                <div class="mt-4 space-y-3">
                  ${(bootstrap?.structurePreview || []).map(item => `
                    <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3 font-mono text-sm text-stone-300">${item}</div>
                  `).join('')}
                </div>
              </section>
              <section class="rounded-[2rem] border border-stone-800 bg-stone-950/90 p-6">
                <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('bootstrapDetectedModulesTitle')}</p>
                <p class="mt-3 text-sm leading-6 text-stone-400">${this.t('bootstrapStructurePolicyDescription')}</p>
                <div class="mt-4 flex flex-wrap gap-2">
                  ${(bootstrap?.inferredModules || []).map(module => `
                    <span class="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100">${module}</span>
                  `).join('') || `<span class="text-sm text-stone-500">${this.t('bootstrapDetectedModulesEmpty')}</span>`}
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    `;

    const selectedWorkflowPreset = this.state.presets.find(preset => preset.mode === this.state.selectedMode);
    const selectedProjectPresetRaw = this.state.projectPresets.find(
      preset => preset.id === this.state.selectedProjectPresetId
    );
    const selectedProjectPreset = selectedProjectPresetRaw
      ? this.getLocalizedProjectPreset(selectedProjectPresetRaw)
      : null;
    const planning = this.state.bootstrapForm;
    const steps = [
      this.t('bootstrapStepMode'),
      this.t('bootstrapStepBasics'),
      this.t('bootstrapStepArchitecture'),
      this.t('bootstrapStepPreview'),
    ];
    const preview = this.state.bootstrapPreview;

    let stepContent = '';

    if (this.state.bootstrapStep === 0) {
      stepContent = `
        <div class="mt-8 space-y-6">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapStepMode')}</p>
            <div class="mt-4 grid gap-4 md:grid-cols-3">
              ${this.state.presets.map(preset => `
                <button
                  type="button"
                  onclick="app.setMode('${preset.mode}')"
                  class="${this.state.selectedMode === preset.mode
                    ? 'border-amber-400 bg-amber-400/12 text-stone-50 shadow-[0_0_0_1px_rgba(251,191,36,0.3)]'
                    : 'border-stone-800 bg-stone-900/80 text-stone-300 hover:border-stone-700 hover:bg-stone-900'} rounded-[1.5rem] border p-5 text-left transition"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-lg font-semibold">${this.getModeLabel(preset.mode)}</span>
                    <span class="text-xs uppercase tracking-[0.25em] ${this.state.selectedMode === preset.mode ? 'text-amber-200' : 'text-stone-500'}">
                      ${this.state.selectedMode === preset.mode ? this.t('selected') : this.t('preset')}
                    </span>
                  </div>
                  <p class="mt-3 text-sm leading-6 text-stone-400">${this.presetDescription(preset.mode)}</p>
                  <p class="mt-4 text-xs uppercase tracking-[0.2em] text-stone-500">
                    ${this.formatPresetOptionalSteps(preset.enabled_optional_steps.length)}
                  </p>
                </button>
              `).join('')}
            </div>
          </div>
          <div class="rounded-[1.5rem] border border-stone-800 bg-stone-900/60 p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapProjectPresetTitle')}</p>
                <p class="mt-2 text-sm leading-6 text-stone-400">${this.t('bootstrapProjectPresetDescription')}</p>
              </div>
              ${selectedProjectPreset
                ? `<span class="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-100">${this.escapeHtml(selectedProjectPreset.id)}</span>`
                : ''
              }
            </div>
            <div class="mt-6 grid gap-4 lg:grid-cols-2">
              ${this.state.projectPresets.map(rawPreset => {
                const preset = this.getLocalizedProjectPreset(rawPreset);
                return `
                <button
                  type="button"
                  onclick="app.setProjectPreset('${rawPreset.id}')"
                  class="${this.state.selectedProjectPresetId === rawPreset.id
                    ? 'border-emerald-400 bg-emerald-400/10 text-stone-50 shadow-[0_0_0_1px_rgba(74,222,128,0.28)]'
                    : 'border-stone-800 bg-stone-950/80 text-stone-300 hover:border-stone-700 hover:bg-stone-950'} rounded-[1.5rem] border p-5 text-left transition"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <div class="text-lg font-semibold text-stone-100">${this.escapeHtml(preset.name)}</div>
                      <div class="mt-2 text-xs uppercase tracking-[0.2em] text-stone-500">${this.escapeHtml(rawPreset.id)}</div>
                    </div>
                    <span class="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${this.state.selectedProjectPresetId === rawPreset.id ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100' : 'border-stone-700 text-stone-500'}">
                      ${this.state.selectedProjectPresetId === rawPreset.id ? this.t('selected') : this.t('preset')}
                    </span>
                  </div>
                  <p class="mt-4 text-sm leading-6 text-stone-400">${this.escapeHtml(preset.description)}</p>
                  <div class="mt-4 grid gap-3 text-xs text-stone-300">
                    <div>
                      <span class="text-stone-500">${this.t('bootstrapProjectPresetRecommendedMode')}:</span>
                      <span class="ml-2">${this.escapeHtml(this.getModeLabel(preset.recommendedMode))}</span>
                    </div>
                    <div>
                      <span class="text-stone-500">${this.t('bootstrapProjectPresetRecommendedStack')}:</span>
                      <span class="ml-2">${this.escapeHtml((preset.recommendedTechStack || []).join(', ') || '-')}</span>
                    </div>
                    <div>
                      <span class="text-stone-500">${this.t('bootstrapModules')}:</span>
                      <span class="ml-2">${this.escapeHtml(this.formatLocalizedList(preset.modules || [], this.getLocalizedModuleName))}</span>
                    </div>
                    <div>
                      <span class="text-stone-500">${this.t('bootstrapApiAreas')}:</span>
                      <span class="ml-2">${this.escapeHtml(this.formatLocalizedList(preset.apiAreas || [], this.getLocalizedApiAreaName))}</span>
                    </div>
                  </div>
                </button>
              `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (this.state.bootstrapStep === 1) {
      stepContent = `
        <div class="mt-8 rounded-[1.5rem] border border-stone-800 bg-stone-900/75 p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('projectPlanning')}</p>
              <p class="mt-2 text-sm leading-6 text-stone-400">${this.t('projectPlanningDescription')}</p>
              <p class="mt-3 text-xs leading-6 text-stone-500">${this.t('bootstrapOnlyProjectNameRequired')}</p>
            </div>
            <span class="rounded-full border border-stone-700 px-3 py-1 text-xs tracking-[0.2em] text-stone-300">${this.getModeLabel(this.state.selectedMode)}</span>
          </div>
          ${selectedProjectPreset ? `
            <div class="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-4 text-sm text-stone-300">
              <div class="flex flex-wrap items-center gap-3">
                <span class="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100">${this.t('bootstrapProjectPreset')}</span>
                <span class="font-medium text-stone-100">${this.escapeHtml(selectedProjectPreset.name)}</span>
                <span class="text-stone-500">${this.t('bootstrapProjectPresetSelectedHint')}</span>
              </div>
            </div>
          ` : ''}
          <div class="mt-6 grid gap-5">
            ${this.renderTextarea(
              this.t('bootstrapProjectDescription'),
              this.t('bootstrapProjectDescriptionPlaceholder'),
              planning.projectDescription,
              "app.updateBootstrapField('projectDescription', this.value)",
              5
            )}
            <div class="flex justify-end">
              <button
                type="button"
                onclick="app.inferBootstrapFromDescription()"
                class="inline-flex items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-stone-700 disabled:bg-stone-900 disabled:text-stone-500"
                ${this.state.bootstrapDescribing ? 'disabled' : ''}
              >
                ${this.state.bootstrapDescribing ? this.t('inferringProjectPlan') : this.t('inferProjectPlan')}
              </button>
            </div>
            ${this.renderInput(
              this.t('bootstrapProjectName'),
              this.t('bootstrapProjectNamePlaceholder'),
              planning.projectName,
              "app.updateBootstrapField('projectName', this.value)"
            )}
            ${this.renderBootstrapFieldHint('projectName')}
            ${this.renderTextarea(
              this.t('bootstrapSummary'),
              this.t('bootstrapSummaryPlaceholder'),
              planning.summary,
              "app.updateBootstrapField('summary', this.value)",
              4
            )}
            ${this.renderBootstrapFieldHint('summary')}
            ${this.renderTextarea(
              this.t('bootstrapTechStack'),
              this.t('bootstrapTechStackPlaceholder'),
              planning.techStackText,
              "app.updateBootstrapField('techStackText', this.value)",
              5
            )}
            ${this.renderBootstrapFieldHint('techStack')}
          </div>
        </div>
      `;
    } else if (this.state.bootstrapStep === 2) {
      stepContent = `
        <div class="mt-8 rounded-[1.5rem] border border-stone-800 bg-stone-900/75 p-6">
          <div class="grid gap-5">
            ${this.renderTextarea(
              this.t('bootstrapArchitecture'),
              this.t('bootstrapArchitecturePlaceholder'),
              planning.architecture,
              "app.updateBootstrapField('architecture', this.value)",
              5
            )}
            ${this.renderBootstrapFieldHint('architecture')}
            <div class="grid gap-5 lg:grid-cols-2">
              <div>
                ${this.renderTextarea(
                  this.t('bootstrapModules'),
                  this.t('bootstrapModulesPlaceholder'),
                  planning.modulesText,
                  "app.updateBootstrapField('modulesText', this.value)",
                  5
                )}
                ${this.renderBootstrapFieldHint('modules')}
              </div>
              <div>
                ${this.renderTextarea(
                  this.t('bootstrapApiAreas'),
                  this.t('bootstrapApiAreasPlaceholder'),
                  planning.apiAreasText,
                  "app.updateBootstrapField('apiAreasText', this.value)",
                  5
                )}
                ${this.renderBootstrapFieldHint('apiAreas')}
              </div>
            </div>
            <div class="grid gap-5 lg:grid-cols-2">
              <div>
                ${this.renderTextarea(
                  this.t('bootstrapDesignDocs'),
                  this.t('bootstrapDesignDocsPlaceholder'),
                  planning.designDocsText,
                  "app.updateBootstrapField('designDocsText', this.value)",
                  4
                )}
                ${this.renderBootstrapFieldHint('designDocs')}
              </div>
              <div>
                ${this.renderTextarea(
                  this.t('bootstrapPlanningDocs'),
                  this.t('bootstrapPlanningDocsPlaceholder'),
                  planning.planningDocsText,
                  "app.updateBootstrapField('planningDocsText', this.value)",
                  4
                )}
                ${this.renderBootstrapFieldHint('planningDocs')}
              </div>
            </div>
            <label class="rounded-[1.5rem] border border-stone-800 bg-stone-950/70 px-5 py-4 text-sm text-stone-300">
              <div class="flex items-start gap-4">
                <input
                  type="checkbox"
                  ${planning.executeScaffoldCommands ? 'checked' : ''}
                  onchange="app.updateBootstrapField('executeScaffoldCommands', this.checked)"
                  class="mt-1 h-4 w-4 rounded border-stone-600 bg-stone-900 text-amber-400 focus:ring-amber-400"
                />
                <div>
                  <div class="font-medium text-stone-100">${this.t('bootstrapExecuteCommands')}</div>
                  <div class="mt-2 leading-6 text-stone-500">${this.t('bootstrapExecuteCommandsDescription')}</div>
                </div>
              </div>
            </label>
          </div>
        </div>
      `;
    } else {
      stepContent = `
        <div class="mt-8 rounded-[1.5rem] border border-stone-800 bg-stone-900/75 p-6">
          <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('bootstrapPreview')}</p>
          ${this.state.bootstrapPreviewing
            ? `<p class="mt-4 text-sm text-stone-400">${this.t('previewing')}</p>`
            : preview
              ? `
                <div class="mt-4 grid gap-4">
                  <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-sm text-stone-300">
                    <span class="text-stone-500">${this.t('bootstrapProjectPreset')}:</span>
                    <div class="mt-2 font-medium text-stone-100">${this.escapeHtml(this.getProjectPresetLabel(preview.projectPresetId || null) || '-')}</div>
                  </div>
                  <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-sm text-stone-300">
                    <span class="text-stone-500">${this.t('bootstrapProjectName')}:</span>
                    <div class="mt-2 font-medium text-stone-100">${preview.projectName}</div>
                  </div>
                  <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-sm text-stone-300">
                    <span class="text-stone-500">${this.t('bootstrapSummary')}:</span>
                    <div class="mt-2 leading-6 text-stone-200">${preview.summary}</div>
                  </div>
                  <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-sm text-stone-300">
                    <span class="text-stone-500">${this.t('bootstrapTechStack')}:</span>
                    <div class="mt-2 text-stone-200">${preview.techStack.join(', ') || '-'}</div>
                  </div>
                  <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-sm text-stone-300">
                    <span class="text-stone-500">${this.t('bootstrapModules')}:</span>
                    <div class="mt-2 text-stone-200">${this.escapeHtml(this.formatLocalizedList(preview.modules, this.getLocalizedModuleName))}</div>
                  </div>
                  <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-sm text-stone-300">
                    <span class="text-stone-500">${this.t('bootstrapApiAreas')}:</span>
                    <div class="mt-2 text-stone-200">${this.escapeHtml(this.formatLocalizedList(preview.apiAreas, this.getLocalizedApiAreaName))}</div>
                  </div>
                  <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-sm text-stone-300">
                    <span class="text-stone-500">${this.t('bootstrapScaffoldTitle')}:</span>
                    ${preview.scaffoldPlan
                      ? `
                        <div class="mt-3 space-y-3">
                          <div>
                            <div class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapScaffoldFramework')}</div>
                            <div class="mt-1 text-stone-100">${this.escapeHtml(preview.scaffoldPlan.framework)}</div>
                          </div>
                          <div>
                            <div class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapScaffoldInstallCommand')}</div>
                            <div class="mt-1 rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-2 font-mono text-xs text-stone-200">${this.escapeHtml(preview.scaffoldPlan.installCommand)}</div>
                          </div>
                          <div>
                            <div class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapScaffoldDirectories')}</div>
                            <div class="mt-2 flex flex-wrap gap-2">
                              ${(preview.scaffoldPlan.directories || []).map(directory => `
                                <span class="rounded-full border border-stone-700 bg-stone-900/80 px-3 py-1 font-mono text-xs text-stone-300">${this.escapeHtml(directory)}</span>
                              `).join('')}
                            </div>
                          </div>
                        </div>
                      `
                      : `<div class="mt-2 text-stone-500">${this.t('bootstrapScaffoldEmpty')}</div>`
                    }
                  </div>
                  <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-sm text-stone-300">
                    <span class="text-stone-500">${this.t('bootstrapCommandPlanTitle')}:</span>
                    ${preview.commandPlan
                      ? `
                        <div class="mt-3 space-y-3">
                          <div class="text-xs ${preview.commandPlan.autoExecute ? 'text-emerald-300' : 'text-stone-500'}">
                            ${preview.commandPlan.autoExecute ? this.t('bootstrapCommandWillExecute') : this.t('bootstrapCommandDeferred')}
                          </div>
                          ${(preview.commandPlan.steps || []).map(step => `
                            <div class="rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-2">
                              <div class="font-medium text-stone-100">${this.escapeHtml(step.title)}</div>
                              <div class="mt-1 font-mono text-xs text-stone-300">${this.escapeHtml(step.shellCommand)}</div>
                            </div>
                          `).join('')}
                        </div>
                      `
                      : `<div class="mt-2 text-stone-500">${this.t('bootstrapScaffoldEmpty')}</div>`
                    }
                  </div>
                  <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-sm text-stone-300">
                    <span class="text-stone-500">${this.t('bootstrapFilesLabel')}:</span>
                    <div class="mt-3 space-y-2">
                      ${preview.files.map(file => `
                        <div class="rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-2 font-mono text-xs text-stone-300">${file}</div>
                      `).join('')}
                    </div>
                  </div>
                  <div class="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-sm text-stone-300">
                    <span class="text-stone-500">${this.t('bootstrapFallbackFieldsTitle')}:</span>
                    <div class="mt-3 space-y-2">
                      ${(preview.usedFallbacks || []).length > 0
                        ? preview.usedFallbacks.map(field => `
                            <div class="rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-2 text-xs text-stone-300">${this.getBootstrapFieldDisplayName(field)}</div>
                          `).join('')
                        : `<div class="rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-2 text-xs text-stone-500">${this.t('bootstrapFallbackFieldsEmpty')}</div>`
                      }
                    </div>
                  </div>
                </div>
              `
              : `<p class="mt-4 text-sm text-stone-500">-</p>`
          }
        </div>
      `;
    }

    const primaryAction = this.state.bootstrapStep === 3
      ? `
        <button
          type="button"
          onclick="app.handleInitProject()"
          class="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
          ${this.state.initializing ? 'disabled' : ''}
        >
          ${this.state.initializing ? this.t('initializing') : this.t('initializeAndContinue')}
        </button>
      `
      : `
        <button
          type="button"
          onclick="app.nextBootstrapStep()"
          class="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
          ${(this.state.bootstrapPreviewing || this.state.initializing) ? 'disabled' : ''}
        >
          ${this.state.bootstrapStep === 2 ? this.t('previewAndContinue') : this.t('nextStep')}
        </button>
      `;

    return `
      <main class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_34%),linear-gradient(180deg,_#111111_0%,_#050505_100%)] text-stone-100">
        <section class="mx-auto max-w-6xl px-6 py-12 lg:px-10">
          <div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div class="rounded-[2rem] border border-stone-800 bg-stone-950/85 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              <div class="flex items-start justify-between gap-4">
                <div class="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-amber-200">
                  ${this.t('guiFirstBootstrap')}
                </div>
                ${this.renderLanguageSwitcher()}
              </div>
              <h1 class="mt-6 text-4xl font-semibold tracking-tight text-stone-50">${this.t('bootstrapTitle')}</h1>
              <p class="mt-4 max-w-2xl text-base leading-7 text-stone-300">
                ${this.t('bootstrapDescription', {
                  skillrc: '<code class="rounded bg-stone-900 px-2 py-1 text-amber-200">.skillrc</code>',
                })}
              </p>
              ${this.renderErrorBanner()}
              <div class="mt-8 grid gap-3 md:grid-cols-4">
                ${steps.map((step, index) => `
                  <button
                    type="button"
                    onclick="app.setBootstrapStep(${index})"
                    class="${this.state.bootstrapStep === index ? 'border-amber-400 bg-amber-400/12 text-stone-50' : 'border-stone-800 bg-stone-900/80 text-stone-400'} rounded-[1.25rem] border px-4 py-3 text-left transition"
                  >
                    <div class="text-[11px] uppercase tracking-[0.2em] text-stone-500">${index + 1}</div>
                    <div class="mt-2 text-sm font-medium">${step}</div>
                  </button>
                `).join('')}
              </div>
              ${stepContent}
              ${selectedWorkflowPreset ? `
                <div class="mt-8 rounded-[1.5rem] border border-stone-800 bg-stone-900/75 p-6">
                  <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('selectedMode')}</p>
                      <h2 class="mt-2 text-2xl font-semibold text-stone-50">${this.getModeLabel(selectedWorkflowPreset.mode)}</h2>
                      <p class="mt-3 max-w-xl text-sm leading-6 text-stone-400">${this.presetDescription(selectedWorkflowPreset.mode)}</p>
                    </div>
                    <div class="flex flex-wrap gap-3">
                      ${this.state.bootstrapStep > 0 ? `
                        <button
                          type="button"
                          onclick="app.previousBootstrapStep()"
                          class="inline-flex items-center justify-center rounded-full border border-stone-700 bg-stone-900 px-6 py-3 text-sm font-medium text-stone-200 transition hover:border-stone-500 hover:bg-stone-800"
                        >
                          ${this.t('previousStep')}
                        </button>
                      ` : ''}
                      ${primaryAction}
                    </div>
                  </div>
                  <div class="mt-6 grid gap-6 lg:grid-cols-2">
                    <div>
                      <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('coreSteps')}</p>
                      <div class="mt-3 flex flex-wrap gap-2">
                        ${selectedWorkflowPreset.core_steps.map(step => `
                          <span class="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-100">${this.getWorkflowStepLabel(step)}</span>
                        `).join('')}
                      </div>
                    </div>
                    <div>
                      <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('enabledOptionalSteps')}</p>
                      <div class="mt-3 flex flex-wrap gap-2">
                        ${selectedWorkflowPreset.enabled_optional_steps.map(step => `
                          <span class="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100">${this.getWorkflowStepLabel(step)}</span>
                        `).join('') || `<span class="text-sm text-stone-500">${this.t('noOptionalStepsEnabled')}</span>`}
                      </div>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
            <div class="space-y-6">
              <section class="rounded-[2rem] border border-stone-800 bg-stone-950/90 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('projectCheck')}</p>
                    <h2 class="mt-2 text-2xl font-semibold text-stone-50">${bootstrap?.projectName || this.t('currentDirectory')}</h2>
                  </div>
                  <span class="rounded-full border ${bootstrap?.initialized ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'} px-3 py-1 text-xs uppercase tracking-[0.2em]">
                    ${bootstrap?.initialized ? this.t('ready') : this.t('needsInit')}
                  </span>
                </div>
                <p class="mt-4 break-all rounded-2xl bg-stone-900 px-4 py-3 text-sm text-stone-400">${bootstrap?.projectPath || ''}</p>
                <div class="mt-5 space-y-3">
                  ${(bootstrap?.checks || []).map(check => `
                    <div class="flex items-start justify-between gap-4 rounded-2xl border ${check.exists ? 'border-emerald-500/20 bg-emerald-500/8' : 'border-stone-800 bg-stone-900/80'} px-4 py-3">
                      <div>
                        <p class="text-sm font-medium text-stone-100">${check.name}</p>
                        <p class="mt-1 break-all text-xs text-stone-500">${check.path}</p>
                      </div>
                      <span class="text-xs uppercase tracking-[0.2em] ${check.exists ? 'text-emerald-300' : 'text-stone-500'}">
                        ${check.exists ? this.t('present') : this.t('missing')}
                      </span>
                    </div>
                  `).join('')}
                </div>
              </section>
              <section class="rounded-[2rem] border border-stone-800 bg-stone-950/90 p-6">
                <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('structurePreview')}</p>
                <div class="mt-4 space-y-3">
                  ${(bootstrap?.structurePreview || []).map(item => `
                    <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3 font-mono text-sm text-stone-300">${item}</div>
                  `).join('')}
                </div>
              </section>
              <section class="rounded-[2rem] border border-stone-800 bg-stone-950/90 p-6">
                <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('bootstrapDetectedModulesTitle')}</p>
                <p class="mt-3 text-sm leading-6 text-stone-400">${this.t('bootstrapStructurePolicyDescription')}</p>
                <div class="mt-4 flex flex-wrap gap-2">
                  ${(bootstrap?.inferredModules || []).map(module => `
                    <span class="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100">${module}</span>
                  `).join('') || `<span class="text-sm text-stone-500">${this.t('bootstrapDetectedModulesEmpty')}</span>`}
                </div>
                <div class="mt-5 grid gap-3">
                  <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                    <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapMinimumStructure')}</p>
                    <p class="mt-2 text-sm text-stone-300">${(bootstrap?.structurePolicy?.minimumRequiredPaths || []).length}</p>
                  </div>
                  <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                    <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapRecommendedStructure')}</p>
                    <p class="mt-2 text-sm text-stone-300">${(bootstrap?.structurePolicy?.recommendedPaths || []).length}</p>
                  </div>
                </div>
              </section>
              ${preview ? `
                <section class="rounded-[2rem] border border-stone-800 bg-stone-950/90 p-6">
                  <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('bootstrapAssetSourcesTitle')}</p>
                  <div class="mt-4 grid gap-3 md:grid-cols-3">
                    <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                      <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapDirectCopyCount')}</p>
                      <p class="mt-2 text-sm text-stone-300">${(preview.assetPlan?.directCopyFiles || []).length}</p>
                    </div>
                    <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                      <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapTemplateGeneratedCount')}</p>
                      <p class="mt-2 text-sm text-stone-300">${(preview.assetPlan?.templateGeneratedFiles || []).length}</p>
                    </div>
                    <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                      <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapRuntimeGeneratedCount')}</p>
                      <p class="mt-2 text-sm text-stone-300">${(preview.assetPlan?.runtimeGeneratedFiles || []).length}</p>
                    </div>
                  </div>
                  <div class="mt-4 space-y-3">
                    <p class="text-xs uppercase tracking-[0.2em] text-stone-500">${this.t('bootstrapSourceExamples')}</p>
                    ${(preview.assetPlan?.localizedCopySources || []).slice(0, 4).map(item => `
                      <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3 text-sm text-stone-300">
                        <div class="font-mono text-stone-200">${item.targetRelativePath}</div>
                        <div class="mt-1 break-all text-xs text-stone-500">${item.sourceRelativePath}</div>
                      </div>
                    `).join('')}
                  </div>
                </section>
              ` : ''}
              ${preview ? `
                <section class="rounded-[2rem] border border-stone-800 bg-stone-950/90 p-6">
                  <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('bootstrapScaffoldTitle')}</p>
                  ${preview.scaffoldPlan
                    ? `
                      <div class="mt-4 space-y-4 text-sm text-stone-300">
                        <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                          <span class="text-stone-500">${this.t('bootstrapScaffoldFramework')}:</span>
                          <div class="mt-2 font-medium text-stone-100">${this.escapeHtml(preview.scaffoldPlan.framework)}</div>
                        </div>
                        <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                          <span class="text-stone-500">${this.t('bootstrapScaffoldInstallCommand')}:</span>
                          <div class="mt-2 font-mono text-xs text-stone-200">${this.escapeHtml(preview.scaffoldPlan.installCommand)}</div>
                        </div>
                        <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                          <span class="text-stone-500">${this.t('bootstrapScaffoldDirectories')}:</span>
                          <div class="mt-3 flex flex-wrap gap-2">
                            ${(preview.scaffoldPlan.newDirectories || preview.scaffoldPlan.directories || []).map(directory => `
                              <span class="rounded-full border border-stone-700 px-3 py-1 font-mono text-xs text-stone-300">${this.escapeHtml(directory)}</span>
                            `).join('')}
                          </div>
                        </div>
                        ${(preview.scaffoldPlan.existingDirectories || []).length > 0 ? `
                          <div class="rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
                            <span class="text-stone-500">${this.t('bootstrapScaffoldExistingDirectories')}:</span>
                            <div class="mt-3 flex flex-wrap gap-2">
                              ${(preview.scaffoldPlan.existingDirectories || []).map(directory => `
                                <span class="rounded-full border border-amber-500/30 px-3 py-1 font-mono text-xs text-amber-100">${this.escapeHtml(directory)}</span>
                              `).join('')}
                            </div>
                          </div>
                        ` : ''}
                        <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                          <span class="text-stone-500">${this.t('bootstrapScaffoldFiles')}:</span>
                          <div class="mt-3 space-y-2">
                            ${(preview.scaffoldPlan.files || []).filter(file => !(preview.scaffoldPlan.existingFiles || []).includes(file.path)).slice(0, 12).map(file => `
                              <div class="rounded-xl border border-stone-800 bg-stone-950/80 px-3 py-2">
                                <div class="font-mono text-xs text-stone-100">${this.escapeHtml(file.path)}</div>
                                <div class="mt-1 text-xs text-stone-500">${this.escapeHtml(file.purpose)}</div>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                        ${(preview.scaffoldPlan.existingFiles || []).length > 0 ? `
                          <div class="rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
                            <span class="text-stone-500">${this.t('bootstrapScaffoldExistingFiles')}:</span>
                            <div class="mt-3 space-y-2">
                              ${(preview.scaffoldPlan.existingFiles || []).slice(0, 12).map(filePath => `
                                <div class="rounded-xl border border-amber-500/20 bg-stone-950/80 px-3 py-2 font-mono text-xs text-amber-100">${this.escapeHtml(filePath)}</div>
                              `).join('')}
                            </div>
                          </div>
                        ` : ''}
                      </div>
                    `
                    : `<div class="mt-4 text-sm text-stone-500">${this.t('bootstrapScaffoldEmpty')}</div>`
                  }
                </section>
              ` : ''}
              ${preview ? `
                <section class="rounded-[2rem] border border-stone-800 bg-stone-950/90 p-6">
                  <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('bootstrapCommandPlanTitle')}</p>
                  ${preview.commandPlan
                    ? `
                      <div class="mt-4 space-y-3 text-sm text-stone-300">
                        <div class="rounded-2xl border ${preview.commandPlan.autoExecute ? 'border-emerald-500/20 bg-emerald-500/8' : 'border-stone-800 bg-stone-900/80'} px-4 py-3">
                          ${preview.commandPlan.autoExecute ? this.t('bootstrapCommandWillExecute') : this.t('bootstrapCommandDeferred')}
                        </div>
                        ${(preview.commandPlan.steps || []).map(step => `
                          <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                            <div class="font-medium text-stone-100">${this.escapeHtml(step.title)}</div>
                            <div class="mt-1 font-mono text-xs text-stone-300">${this.escapeHtml(step.shellCommand)}</div>
                            <div class="mt-1 text-xs text-stone-500">${this.escapeHtml(step.description)}</div>
                          </div>
                        `).join('')}
                      </div>
                    `
                    : `<div class="mt-4 text-sm text-stone-500">${this.t('bootstrapScaffoldEmpty')}</div>`
                  }
                </section>
              ` : ''}
              ${preview ? `
                <section class="rounded-[2rem] border border-stone-800 bg-stone-950/90 p-6">
                  <p class="text-xs uppercase tracking-[0.25em] text-stone-500">${this.t('bootstrapPreview')}</p>
                  <div class="mt-4 space-y-3 text-sm text-stone-300">
                    <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                      <span class="text-stone-500">${this.t('bootstrapProjectPreset')}:</span>
                      <div class="mt-2 font-medium text-stone-100">${this.escapeHtml(this.getProjectPresetLabel(preview.projectPresetId || null) || '-')}</div>
                    </div>
                    <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                      <span class="text-stone-500">${this.t('bootstrapProjectName')}:</span>
                      <div class="mt-2 font-medium text-stone-100">${preview.projectName}</div>
                    </div>
                    <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                      <span class="text-stone-500">${this.t('bootstrapModules')}:</span>
                      <div class="mt-2 text-stone-200">${this.escapeHtml(this.formatLocalizedList(preview.modules, this.getLocalizedModuleName))}</div>
                    </div>
                    <div class="rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3">
                      <span class="text-stone-500">${this.t('bootstrapApiAreas')}:</span>
                      <div class="mt-2 text-stone-200">${this.escapeHtml(this.formatLocalizedList(preview.apiAreas, this.getLocalizedApiAreaName))}</div>
                    </div>
                  </div>
                </section>
              ` : ''}
            </div>
          </div>
        </section>
      </main>
    `;
  }

  renderFeatureSetup() {
    const form = this.state.featureForm;
    const workflow = this.state.workflow;
    const supportedFlags = this.state.flags;
    const bootstrapResult = this.state.bootstrapCommitResult;
    const suggestedChange = bootstrapResult?.firstChangeSuggestion || null;
    const selectedOptionalSteps = Object.entries(workflow?.optional_steps || {})
      .filter(([, config]) => config.enabled && form.selectedFlags.some(flag => config.when.includes(flag)))
      .map(([step]) => step);

    return `
      <main class="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(180deg,_#08111f_0%,_#020617_100%)] text-slate-100">
        <section class="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div class="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div class="rounded-[2rem] border border-slate-800 bg-slate-950/85 p-8">
              <div class="flex items-start justify-between gap-4">
                <div class="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-sky-200">
                  ${this.t('firstChangeSetup')}
                </div>
                ${this.renderLanguageSwitcher()}
              </div>
              <h1 class="mt-6 text-4xl font-semibold tracking-tight text-slate-50">${this.t('featureSetupTitle')}</h1>
              <p class="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                ${this.t('featureSetupDescription', {
                  proposal: '<code class="rounded bg-slate-900 px-2 py-1 text-sky-200">proposal.md</code>',
                  tasks: '<code class="rounded bg-slate-900 px-2 py-1 text-sky-200">tasks.md</code>',
                  state: '<code class="rounded bg-slate-900 px-2 py-1 text-sky-200">state.json</code>',
                  verification: '<code class="rounded bg-slate-900 px-2 py-1 text-sky-200">verification.md</code>',
                  review: '<code class="rounded bg-slate-900 px-2 py-1 text-sky-200">review.md</code>',
                })}
              </p>
              ${bootstrapResult ? `
                <section class="mt-6 rounded-[1.5rem] border border-sky-500/20 bg-sky-500/8 p-5">
                  <p class="text-xs uppercase tracking-[0.2em] text-sky-200">${this.t('bootstrapInitSummaryTitle')}</p>
                  <div class="mt-4 grid gap-4 lg:grid-cols-2">
                    <div class="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('bootstrapInitDoradoFiles')}</p>
                      <div class="mt-3 space-y-3 text-sm text-slate-300">
                        <div>
                          <div class="text-slate-500">${this.t('bootstrapInitCreated')}</div>
                          <div class="mt-1 text-slate-100">${(bootstrapResult.directCopyCreatedFiles || []).length}</div>
                        </div>
                        <div>
                          <div class="text-slate-500">${this.t('bootstrapInitRuntime')}</div>
                          <div class="mt-1 text-slate-100">${(bootstrapResult.runtimeGeneratedFiles || []).join(', ') || '-'}</div>
                        </div>
                        <div>
                          <div class="text-slate-500">${this.t('bootstrapInitHooks')}</div>
                          <div class="mt-1 text-slate-100">${(bootstrapResult.hookInstalledFiles || []).join(', ') || '-'}</div>
                        </div>
                      </div>
                    </div>
                    <div class="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('bootstrapInitBusinessFiles')}</p>
                      <div class="mt-3 space-y-3 text-sm text-slate-300">
                        <div>
                          <div class="text-slate-500">${this.t('bootstrapInitCreated')}</div>
                          <div class="mt-1 text-slate-100">${this.formatFileDirectorySummary((bootstrapResult.scaffoldCreatedFiles || []).length, (bootstrapResult.scaffoldCreatedDirectories || []).length)}</div>
                        </div>
                        <div>
                          <div class="text-slate-500">${this.t('bootstrapInitSkipped')}</div>
                          <div class="mt-1 text-slate-100">${this.formatFileDirectorySummary((bootstrapResult.scaffoldSkippedFiles || []).length, (bootstrapResult.scaffoldSkippedDirectories || []).length)}</div>
                        </div>
                        <div>
                          <div class="text-slate-500">${this.t('bootstrapScaffoldFramework')}</div>
                          <div class="mt-1 text-slate-100">${bootstrapResult.scaffoldPlan?.framework || '-'}</div>
                        </div>
                        <div>
                          <div class="text-slate-500">${this.t('bootstrapCommandPlanTitle')}</div>
                          <div class="mt-1 text-slate-100">
                            ${bootstrapResult.commandExecution?.status === 'completed'
                              ? this.t('bootstrapCommandStatusCompleted')
                              : bootstrapResult.commandExecution?.status === 'failed'
                                ? this.t('bootstrapCommandStatusFailed')
                                : this.t('bootstrapCommandStatusSkipped')}
                          </div>
                        </div>
                        ${bootstrapResult.recoveryFilePath ? `
                          <div>
                            <div class="text-slate-500">${this.t('bootstrapRecoveryFile')}</div>
                            <div class="mt-1 font-mono text-xs text-amber-200">${bootstrapResult.recoveryFilePath}</div>
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                </section>
              ` : ''}
              ${this.renderErrorBanner()}
              <div class="mt-8 grid gap-5">
                ${this.renderInput(this.t('featureName'), this.t('featureNamePlaceholder'), form.name, "app.updateFeatureField('name', this.value)")}
                ${this.renderTextarea(this.t('background'), this.t('backgroundPlaceholder'), form.background, "app.updateFeatureField('background', this.value)", 4)}
                ${this.renderTextarea(this.t('goals'), this.t('goalsPlaceholder'), form.goalsText, "app.updateFeatureField('goalsText', this.value)", 4)}
                <div class="grid gap-5 lg:grid-cols-2">
                  ${this.renderTextarea(this.t('inScope'), this.t('inScopePlaceholder'), form.inScopeText, "app.updateFeatureField('inScopeText', this.value)", 5)}
                  ${this.renderTextarea(this.t('outOfScope'), this.t('outOfScopePlaceholder'), form.outOfScopeText, "app.updateFeatureField('outOfScopeText', this.value)", 5)}
                </div>
                <div class="grid gap-5 lg:grid-cols-2">
                  ${this.renderTextarea(this.t('acceptanceCriteria'), this.t('acceptanceCriteriaPlaceholder'), form.acceptanceCriteriaText, "app.updateFeatureField('acceptanceCriteriaText', this.value)", 5)}
                  ${this.renderTextarea(this.t('affects'), this.t('affectsPlaceholder'), form.affectsText, "app.updateFeatureField('affectsText', this.value)", 5)}
                </div>

                <div class="rounded-[1.5rem] border border-slate-800 bg-slate-900/75 p-5">
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('featureFlags')}</p>
                      <p class="mt-2 text-sm text-slate-400">${this.t('featureFlagsDescription')}</p>
                    </div>
                    <span class="rounded-full border border-slate-700 px-3 py-1 text-xs tracking-[0.2em] text-slate-300">
                      ${this.getModeLabel(this.state.project?.mode || workflow?.mode)}
                    </span>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-3">
                    ${supportedFlags.map(flag => `
                      <button
                        type="button"
                        onclick="app.toggleFeatureFlag('${flag}')"
                        class="${form.selectedFlags.includes(flag)
                          ? 'border-sky-400 bg-sky-400/12 text-sky-100'
                          : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'} rounded-full border px-4 py-2 text-sm transition"
                      >
                        ${this.getFlagLabel(flag)}
                      </button>
                    `).join('') || `<span class="text-sm text-slate-500">${this.t('noFlagsAvailable')}</span>`}
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <section class="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('projectSummary')}</p>
                <div class="mt-4 space-y-4">
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('name')}</p>
                    <p class="mt-2 text-lg font-semibold text-slate-100">${this.state.project?.name || this.state.bootstrap?.projectName || this.t('currentProject')}</p>
                  </div>
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('mode')}</p>
                    <p class="mt-2 text-lg font-semibold text-sky-200">${this.getModeLabel(this.state.project?.mode || workflow?.mode)}</p>
                  </div>
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('activatedOptionalStepsPreview')}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      ${selectedOptionalSteps.map(step => `
                        <span class="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100">${this.getWorkflowStepLabel(step)}</span>
                      `).join('') || `<span class="text-sm text-slate-500">${this.t('noActivatedOptionalSteps')}</span>`}
                    </div>
                  </div>
                  ${suggestedChange ? `
                    <div class="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-4">
                      <p class="text-xs uppercase tracking-[0.2em] text-sky-200">${this.t('featureSuggestionTitle')}</p>
                      <div class="mt-3 space-y-3 text-sm text-slate-200">
                        <div>
                          <div class="text-slate-500">${this.t('featureSuggestionSource')}</div>
                          <div class="mt-1 font-medium text-slate-100">${this.escapeHtml(this.getProjectPresetLabel(bootstrapResult?.projectPresetId || null))}</div>
                        </div>
                        <div>
                          <div class="text-slate-500">${this.t('featureName')}</div>
                          <div class="mt-1 font-medium text-slate-100">${this.escapeHtml(suggestedChange.name || '-')}</div>
                        </div>
                        <div>
                          <div class="text-slate-500">${this.t('featureSuggestionBackground')}</div>
                          <div class="mt-1 leading-6 text-slate-200">${this.escapeHtml(suggestedChange.background || '-')}</div>
                        </div>
                        <div>
                          <div class="text-slate-500">${this.t('featureSuggestionAffects')}</div>
                          <div class="mt-1 text-slate-100">${this.escapeHtml(this.formatLocalizedList(suggestedChange.affects || [], this.getLocalizedModuleName))}</div>
                        </div>
                        <div>
                          <div class="text-slate-500">${this.t('featureSuggestionFlags')}</div>
                          <div class="mt-1 text-slate-100">${this.escapeHtml((suggestedChange.flags || []).map(flag => this.getFlagLabel(flag)).join(', ') || '-')}</div>
                        </div>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </section>

              <section class="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('nextDevelopmentGuideTitle')}</p>
                <p class="mt-3 text-sm leading-6 text-slate-400">${this.t('nextDevelopmentGuideDescription')}</p>
                <div class="mt-4 grid gap-3">
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <div class="flex items-center justify-between gap-4">
                      <span class="text-sm text-slate-200">${this.t('nextOpenBootstrapSummary')}</span>
                      ${this.renderPreviewButton('docs/project/bootstrap-summary.md', this.t('nextOpenBootstrapSummary'))}
                    </div>
                  </div>
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <div class="flex items-center justify-between gap-4">
                      <span class="text-sm text-slate-200">${this.t('nextOpenModuleMap')}</span>
                      ${this.renderPreviewButton('docs/project/module-map.md', this.t('nextOpenModuleMap'))}
                    </div>
                  </div>
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <div class="flex items-center justify-between gap-4">
                      <span class="text-sm text-slate-200">${this.t('nextOpenApiOverview')}</span>
                      ${this.renderPreviewButton('docs/project/api-overview.md', this.t('nextOpenApiOverview'))}
                    </div>
                  </div>
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <div class="flex items-center justify-between gap-4">
                      <span class="text-sm text-slate-200">${this.t('nextOpenSkillIndex')}</span>
                      ${this.renderPreviewButton('SKILL.index.json', this.t('nextOpenSkillIndex'))}
                    </div>
                  </div>
                </div>
              </section>

              <section class="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('whatHappensNext')}</p>
                <div class="mt-4 space-y-3">
                  ${[
                    this.t('stepProposal'),
                    this.t('stepTasks'),
                    this.t('stepState'),
                    this.t('stepVerification'),
                    this.t('stepReview'),
                    this.t('stepBackToDashboard'),
                  ].map(item => `
                    <div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">${item}</div>
                  `).join('')}
                </div>
                <div class="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onclick="app.handleCreateFeature()"
                    class="inline-flex items-center justify-center rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                    ${this.state.creatingFeature ? 'disabled' : ''}
                  >
                    ${this.state.creatingFeature ? this.t('creatingChange') : this.t('createFirstChange')}
                  </button>
                  <button
                    type="button"
                    onclick="app.skipFeatureSetup()"
                    class="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                  >
                    ${this.t('skipForNow')}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  renderInput(label, placeholder, value, handler) {
    return `
      <label class="block rounded-[1.5rem] border border-slate-800 bg-slate-900/75 p-5">
        <span class="text-xs uppercase tracking-[0.2em] text-slate-500">${label}</span>
        <input
          type="text"
          placeholder="${this.escapeHtml(placeholder)}"
          value="${this.escapeHtml(value)}"
          oninput="${handler}"
          class="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-400"
        />
      </label>
    `;
  }

  renderTextarea(label, placeholder, value, handler, rows) {
    return `
      <label class="block rounded-[1.5rem] border border-slate-800 bg-slate-900/75 p-5">
        <span class="text-xs uppercase tracking-[0.2em] text-slate-500">${label}</span>
        <textarea
          rows="${rows}"
          placeholder="${this.escapeHtml(placeholder)}"
          oninput="${handler}"
          class="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-400"
        >${this.escapeHtml(value)}</textarea>
      </label>
    `;
  }

  renderPathRows(items, options = {}) {
    const tone = options.tone || 'slate';
    const emptyMessage = options.emptyMessage || '-';
    if (!items || items.length === 0) {
      return `<p class="text-sm text-slate-500">${emptyMessage}</p>`;
    }

    const tones = {
      slate: 'border-slate-800 bg-slate-900/80 text-slate-300',
      sky: 'border-sky-500/25 bg-sky-500/10 text-sky-100',
      emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
      amber: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
      rose: 'border-rose-500/25 bg-rose-500/10 text-rose-100',
    };

    return items.map(item => {
      const path = typeof item === 'string' ? item : item.path;
      const label = typeof item === 'string' ? item : (item.name || item.title || item.path);
      const previewable = typeof item === 'string' ? true : item.previewable !== false;
      const meta = typeof item === 'string'
        ? ''
        : item.updatedAt
          ? `<p class="mt-2 text-xs text-slate-400">${this.t('generatedAt')}: ${item.updatedAt}</p>`
          : '';

      return `
        <div class="rounded-2xl border px-4 py-3 text-sm ${tones[tone] || tones.slate}">
          <div class="flex items-center justify-between gap-4">
            <span class="font-medium">${this.escapeHtml(label)}</span>
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs text-slate-300">${this.escapeHtml(path)}</span>
              ${previewable ? this.renderPreviewButton(path, label) : ''}
            </div>
          </div>
          ${meta}
        </div>
      `;
    }).join('');
  }

  renderIssueBanner(title, items, tone = 'rose') {
    if (!items || items.length === 0) {
      return '';
    }

    const styles = {
      rose: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
      amber: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
    };

    return `
      <section class="rounded-[1.5rem] border px-5 py-4 ${styles[tone] || styles.rose}">
        <p class="text-xs uppercase tracking-[0.2em]">${title}</p>
        <div class="mt-3 grid gap-2">
          ${items.map(item => `
            <div class="rounded-xl border border-white/10 bg-black/10 px-3 py-2 font-mono text-xs">
              ${this.escapeHtml(this.getLocalizedStatusItem(item))}
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  renderCollectionCard(title, items, emptyMessage, tone = 'slate') {
    return `
      <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
        <div class="flex items-center justify-between gap-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${title}</p>
          <span class="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">${items.length}</span>
        </div>
        <div class="mt-5 grid gap-3">
          ${this.renderPathRows(items, { tone, emptyMessage })}
        </div>
      </section>
    `;
  }

  renderDashboard() {
    return `
      <main class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)] text-slate-100">
        ${this.renderDashboardHeader()}
        <section class="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          ${this.renderErrorBanner()}
          ${this.renderTabs()}
          ${this.renderDashboardContent()}
        </section>
      </main>
    `;
  }

  renderDashboardHeader() {
    return `
      <header class="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-end justify-between gap-6 px-6 py-8 lg:px-10">
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-emerald-300/80">${this.t('dashboard')}</p>
            <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-50">${this.state.project?.name || this.t('projectFallback')}</h1>
            <p class="mt-2 text-sm text-slate-400">
              ${this.t('mode')}:
              <span class="font-medium text-emerald-200">${this.getModeLabel(this.state.project?.mode)}</span>
            </p>
            <p class="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('inspectionOnlyMode')}</p>
          </div>
          <div class="flex gap-3">
            ${this.renderLanguageSwitcher()}
            <button
              type="button"
              onclick="app.refreshActiveView()"
              class="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              ${this.t('refresh')}
            </button>
          </div>
        </div>
      </header>
    `;
  }

  renderTabs() {
    const tabs = [
      { id: 'project', label: this.t('projectTab') },
      { id: 'docs', label: this.t('docsTab') },
      { id: 'skills', label: this.t('skillsTab') },
      { id: 'execution', label: this.t('executionTab') },
    ];

    return `
      <div class="mb-8 flex flex-wrap gap-3">
        ${tabs.map(tab => `
          <button
            type="button"
            onclick="app.switchTab('${tab.id}')"
            class="${this.state.activeTab === tab.id
              ? 'bg-emerald-400 text-slate-950'
              : 'border border-slate-700 bg-slate-900/75 text-slate-300 hover:border-slate-500 hover:bg-slate-800'} rounded-full px-4 py-2 text-sm font-medium transition"
          >
            ${tab.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  renderDashboardContent() {
    switch (this.state.activeTab) {
      case 'docs':
        return this.renderDocs();
      case 'skills':
        return this.renderSkills();
      case 'execution':
        return this.renderExecution();
      case 'project':
      default:
        return this.renderProject();
    }
  }

  renderProject() {
    const project = this.state.project || {};
    const docsStatus = this.state.docsStatus || {
      coverage: 0,
      missingRequired: [],
      missingRecommended: [],
      apiDocs: [],
      designDocs: [],
      planningDocs: [],
    };
    const skillsStatus = this.state.skillsStatus || {
      existing: 0,
      totalSkillFiles: 0,
      modules: [],
      missingRecommended: [],
      skillIndex: { exists: false, needsRebuild: true, stale: false, reasons: [] },
    };
    const execution = this.state.execution || { totalActiveChanges: 0, totalQueuedChanges: 0 };
    const defaultProfile = this.state.workflow?.defaultProfile || execution.defaultProfile || null;
    const cards = [
      { label: this.t('structureLevel'), value: this.getStructureLevelLabel(project.structureLevel || 'none'), tone: 'from-emerald-500/30 to-emerald-300/10' },
      { label: this.t('docsCoverage'), value: `${docsStatus.coverage || 0}%`, tone: 'from-sky-500/30 to-sky-300/10' },
      { label: this.t('moduleCount'), value: skillsStatus.modules?.length || 0, tone: 'from-cyan-500/30 to-cyan-300/10' },
      { label: this.t('apiDocCount'), value: docsStatus.apiDocs?.length || 0, tone: 'from-indigo-500/30 to-indigo-300/10' },
      { label: this.t('skillFiles'), value: `${skillsStatus.existing || 0}/${skillsStatus.totalSkillFiles || 0}`, tone: 'from-violet-500/30 to-violet-300/10' },
      { label: this.t('activeChangesLabel'), value: execution.totalActiveChanges || 0, tone: 'from-amber-500/30 to-amber-300/10' },
      { label: this.t('queuedChangesLabel'), value: execution.totalQueuedChanges || 0, tone: 'from-orange-500/30 to-orange-300/10' },
      { label: this.t('indexStatus'), value: !skillsStatus.skillIndex?.exists ? this.t('indexMissing') : skillsStatus.skillIndex?.needsRebuild ? this.t('indexNeedsRebuild') : this.t('indexReady'), tone: 'from-rose-500/30 to-rose-300/10' },
    ];

    return `
      <div class="space-y-8">
        ${this.renderLegacyProjectBanner()}
        <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          ${this.renderDataSourcesCard('project')}
          ${this.renderViewStateCard('project')}
        </div>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
          ${cards.map(card => `
            <article class="rounded-[1.5rem] border border-slate-800 bg-gradient-to-br ${card.tone} p-6">
              <p class="text-sm text-slate-300">${card.label}</p>
              <p class="mt-4 text-4xl font-semibold text-slate-50">${card.value}</p>
            </article>
          `).join('')}
        </div>
        ${this.renderInspectionSignalsCard(project, docsStatus, skillsStatus, execution)}
        ${this.renderIssueBanner(this.t('missingRequiredLabel'), docsStatus.missingRequired, 'rose')}
        ${this.renderIssueBanner(this.t('missingRecommendedLabel'), docsStatus.missingRecommended, 'amber')}
        ${this.renderIssueBanner(this.t('missingSkillsLabel'), skillsStatus.missingRecommended, 'amber')}
        ${(!skillsStatus.skillIndex?.exists || skillsStatus.skillIndex?.needsRebuild) ? this.renderIssueBanner(this.t('indexNeedsAttention'), skillsStatus.skillIndex?.exists ? (skillsStatus.skillIndex.reasons || [this.t('indexNeedsRebuild')]) : [this.t('indexMissing')], 'amber') : ''}
        <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('projectSummary')}</p>
            <div class="mt-4 space-y-3 text-sm text-slate-300">
              <div><span class="text-slate-500">${this.t('name')}:</span> ${project.name || this.t('projectFallback')}</div>
              <div><span class="text-slate-500">${this.t('mode')}:</span> ${this.getModeLabel(project.mode)}</div>
              <div><span class="text-slate-500">${this.t('structureLevel')}:</span> ${this.getStructureLevelLabel(project.structureLevel || 'none')}</div>
              <div><span class="text-slate-500">${this.t('currentDirectory')}:</span> ${project.path || '-'}</div>
              <div><span class="text-slate-500">${this.t('generatedAt')}:</span> ${project.createdAt || '-'}</div>
            </div>
          </section>
          <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('currentWorkflow')}</p>
            ${defaultProfile
              ? `<div class="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                  <span class="text-slate-500">${this.t('workflowProfileDefaultLabel')}:</span>
                  <span class="font-medium text-slate-100">${this.escapeHtml(this.getWorkflowProfileLabel(defaultProfile))}</span>
                  ${this.renderWorkflowProfileBadge(defaultProfile)}
                </div>`
              : ''}
            <div class="mt-4 flex flex-wrap gap-3">
              ${(this.state.workflow?.core_steps || []).map(step => `
                <span class="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">${this.getWorkflowStepLabel(step)}</span>
              `).join('')}
            </div>
            <div class="mt-6 space-y-2 text-sm text-slate-300">
              <div>${docsStatus.missingRequired?.length ? `${this.t('missingRequiredLabel')}: ${docsStatus.missingRequired.length}` : this.t('allRequiredReady')}</div>
              <div>${docsStatus.missingRecommended?.length ? `${this.t('missingRecommendedLabel')}: ${docsStatus.missingRecommended.length}` : this.t('allRecommendedReady')}</div>
              <div>${skillsStatus.missingRecommended?.length ? `${this.t('missingSkillsLabel')}: ${skillsStatus.missingRecommended.length}` : this.t('allSkillsReady')}</div>
            </div>
          </section>
        </div>
        ${this.renderAssetSourcesCard()}
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
          <div class="flex items-center justify-between gap-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('upgradeSuggestionsTitle')}</p>
            <span class="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">${(this.state.bootstrap?.upgradeSuggestions || []).length}</span>
          </div>
          <div class="mt-5 grid gap-3">
            ${(this.state.bootstrap?.upgradeSuggestions || []).map(suggestion => `
              <div class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
                <div class="flex items-center justify-between gap-4">
                  <span class="font-medium text-slate-100">${this.escapeHtml(this.getLocalizedUpgradeSuggestion(suggestion).title)}</span>
                  <span class="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">${this.escapeHtml(suggestion.code)}</span>
                </div>
                <p class="mt-2 leading-6 text-slate-400">${this.escapeHtml(this.getLocalizedUpgradeSuggestion(suggestion).description)}</p>
                <div class="mt-3 grid gap-2">
                  ${(suggestion.paths || []).map(item => `
                    <div class="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-400">
                      ${this.escapeHtml(item)}
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('') || `<p class="text-sm text-slate-500">${this.t('noUpgradeSuggestions')}</p>`}
          </div>
        </section>
        <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          ${this.renderCollectionCard(
            this.t('moduleMapTitle'),
            (skillsStatus.modules || []).map(module => ({
              name: this.getLocalizedModuleName(module.name),
              path: module.skillPath,
              updatedAt: null,
            })),
            this.t('noModulesDiscovered'),
            'emerald'
          )}
          ${this.renderCollectionCard(
            this.t('apiDocsTitle'),
            docsStatus.apiDocs || [],
            this.t('noApiDocs'),
            'sky'
          )}
        </div>
      </div>
    `;
  }

  renderInspectionSignalsCard(project, docsStatus, skillsStatus, execution) {
    const signals = [
      {
        label: this.t('inspectionStructureSignal'),
        tone: project.structureLevel === 'full' ? 'emerald' : 'amber',
        status: project.structureLevel === 'full' ? this.t('inspectionHealthy') : this.t('inspectionAttention'),
        description:
          project.structureLevel === 'full'
            ? this.t('inspectionStructureHealthy')
            : this.t('inspectionStructureAttention'),
      },
      {
        label: this.t('inspectionDocsSignal'),
        tone:
          (docsStatus.missingRequired?.length || 0) === 0 && (docsStatus.missingRecommended?.length || 0) === 0
            ? 'emerald'
            : 'amber',
        status:
          (docsStatus.missingRequired?.length || 0) === 0 && (docsStatus.missingRecommended?.length || 0) === 0
            ? this.t('inspectionHealthy')
            : this.t('inspectionAttention'),
        description:
          (docsStatus.missingRequired?.length || 0) === 0 && (docsStatus.missingRecommended?.length || 0) === 0
            ? this.t('inspectionDocsHealthy')
            : this.t('inspectionDocsAttention'),
      },
      {
        label: this.t('inspectionSkillsSignal'),
        tone:
          (skillsStatus.missingRecommended?.length || 0) === 0 &&
          skillsStatus.skillIndex?.exists &&
          !skillsStatus.skillIndex?.needsRebuild
            ? 'emerald'
            : 'amber',
        status:
          (skillsStatus.missingRecommended?.length || 0) === 0 &&
          skillsStatus.skillIndex?.exists &&
          !skillsStatus.skillIndex?.needsRebuild
            ? this.t('inspectionHealthy')
            : this.t('inspectionAttention'),
        description:
          (skillsStatus.missingRecommended?.length || 0) === 0 &&
          skillsStatus.skillIndex?.exists &&
          !skillsStatus.skillIndex?.needsRebuild
            ? this.t('inspectionSkillsHealthy')
            : this.t('inspectionSkillsAttention'),
      },
      {
        label: this.t('inspectionExecutionSignal'),
        tone: (execution.totalActiveChanges || 0) > 0 ? 'emerald' : 'slate',
        status: (execution.totalActiveChanges || 0) > 0 ? this.t('inspectionHealthy') : this.t('inspectionIdle'),
        description:
          (execution.totalActiveChanges || 0) > 0
            ? this.t('inspectionExecutionHealthy')
            : this.t('inspectionExecutionIdle'),
      },
    ];

    const toneClass = {
      emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
      amber: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
      slate: 'border-slate-700 bg-slate-900/80 text-slate-200',
    };

    return `
      <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
        <div class="flex items-center justify-between gap-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('inspectionSignalsTitle')}</p>
          <span class="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">${signals.length}</span>
        </div>
        <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          ${signals.map(signal => `
            <article class="rounded-[1.5rem] border border-slate-800 bg-slate-900/80 p-5">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm text-slate-300">${signal.label}</p>
                <span class="rounded-full border px-3 py-1 text-xs ${toneClass[signal.tone]}">${signal.status}</span>
              </div>
              <p class="mt-4 text-sm leading-6 text-slate-400">${signal.description}</p>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  renderDocs() {
    const docsStatus = this.state.docsStatus
      ? {
          ...this.state.docsStatus,
          apiDocs: this.state.docsStatus.apiDocs || [],
          designDocs: this.state.docsStatus.designDocs || [],
          planningDocs: this.state.docsStatus.planningDocs || [],
        }
      : null;
    if (!docsStatus) {
      return '';
    }

    const hasTrackedDocs = Boolean(docsStatus.items?.length);

    return `
      <div class="space-y-8">
        ${this.renderLegacyProjectBanner()}
        <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          ${this.renderDataSourcesCard('docs')}
          ${this.renderViewStateCard('docs')}
        </div>
        ${this.renderIssueBanner(this.t('missingRequiredLabel'), docsStatus.missingRequired, 'rose')}
        ${this.renderIssueBanner(this.t('missingRecommendedLabel'), docsStatus.missingRecommended, 'amber')}
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          ${[
            { label: this.t('docsCoverage'), value: `${docsStatus.coverage}%` },
            { label: this.t('apiDocCount'), value: docsStatus.apiDocs.length },
            { label: this.t('designDocCount'), value: docsStatus.designDocs.length },
            { label: this.t('planningDocCount'), value: docsStatus.planningDocs.length },
          ].map(card => `
            <article class="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-6">
              <p class="text-sm text-slate-400">${card.label}</p>
              <p class="mt-4 text-4xl font-semibold text-slate-50">${card.value}</p>
            </article>
          `).join('')}
        </div>
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
          <div class="flex items-center justify-between gap-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('coreDocsTitle')}</p>
            <span class="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">${docsStatus.coverage}%</span>
          </div>
          <p class="mt-3 text-sm text-slate-400">${this.t('generatedAt')}: ${docsStatus.updatedAt || '-'}</p>
          <p class="mt-2 text-sm leading-6 text-slate-500">${this.t('docsProtocolHint')}</p>
          ${hasTrackedDocs
            ? `<div class="mt-5 grid gap-3">
                ${docsStatus.items.map(item => `
                  <div class="rounded-2xl border ${item.exists ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-rose-500/25 bg-rose-500/10'} px-4 py-3 text-sm">
                    <div class="flex items-center justify-between gap-4">
                      <span class="font-mono text-slate-100">${item.path}</span>
                      <div class="flex items-center gap-3">
                        <span class="${item.exists ? 'text-emerald-100' : 'text-rose-100'}">${item.exists ? this.t('present') : this.t('missing')}</span>
                        ${item.exists ? this.renderPreviewButton(item.path, item.key) : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>`
            : `<div class="mt-5 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4">
                <p class="text-base font-medium text-slate-100">${this.t('docsEmptyTitle')}</p>
                <p class="mt-2 text-sm leading-6 text-slate-400">${this.t('docsEmptyDescription')}</p>
              </div>`
          }
        </section>
        <div class="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
          ${this.renderCollectionCard(this.t('apiDocsTitle'), docsStatus.apiDocs || [], this.t('noApiDocs'), 'sky')}
          ${this.renderCollectionCard(this.t('designDocsTitle'), docsStatus.designDocs || [], this.t('noDesignDocs'), 'emerald')}
          ${this.renderCollectionCard(this.t('planningDocsTitle'), docsStatus.planningDocs || [], this.t('noPlanningDocs'), 'amber')}
        </div>
      </div>
    `;
  }

  renderSkills() {
    const skillsStatus = this.state.skillsStatus
      ? {
          ...this.state.skillsStatus,
          modules: this.state.skillsStatus.modules || [],
          missingRecommended: this.state.skillsStatus.missingRecommended || [],
        }
      : null;
    if (!skillsStatus) {
      return '';
    }

    return `
      <div class="space-y-8">
        ${this.renderLegacyProjectBanner()}
        <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          ${this.renderDataSourcesCard('skills')}
          ${this.renderViewStateCard('skills')}
        </div>
        ${this.renderIssueBanner(this.t('missingSkillsLabel'), skillsStatus.missingRecommended, 'amber')}
        ${(!skillsStatus.skillIndex.exists || skillsStatus.skillIndex.needsRebuild) ? this.renderIssueBanner(this.t('indexNeedsAttention'), skillsStatus.skillIndex.exists ? (skillsStatus.skillIndex.reasons || [this.t('indexNeedsRebuild')]) : [skillsStatus.skillIndex.path || this.t('indexMissing')], 'rose') : ''}
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          ${[
            { label: this.t('skillCoverage'), value: `${skillsStatus.existing}/${skillsStatus.totalSkillFiles}` },
            { label: this.t('moduleCount'), value: skillsStatus.modules.length },
            { label: this.t('indexStatus'), value: !skillsStatus.skillIndex.exists ? this.t('indexMissing') : skillsStatus.skillIndex.needsRebuild ? this.t('indexRebuildReady') : this.t('indexReady') },
            { label: this.t('sectionsLabel'), value: skillsStatus.skillIndex.stats?.totalSections || 0 },
          ].map(card => `
            <article class="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-6">
              <p class="text-sm text-slate-400">${card.label}</p>
              <p class="mt-4 text-4xl font-semibold text-slate-50">${card.value}</p>
            </article>
          `).join('')}
        </div>
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
          <div class="flex items-center justify-between gap-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('skillsStatusTitle')}</p>
            <span class="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">${skillsStatus.existing}/${skillsStatus.totalSkillFiles}</span>
          </div>
          <p class="mt-3 text-sm leading-6 text-slate-500">${this.t('skillsProtocolHint')}</p>
          <div class="mt-5 grid gap-3">
            ${skillsStatus.rootSkills.map(skill => `
              <div class="rounded-2xl border ${skill.exists ? 'border-sky-500/25 bg-sky-500/10' : 'border-slate-800 bg-slate-900/80'} px-4 py-3 text-sm">
                <div class="flex items-center justify-between gap-4">
                  <span class="font-mono text-slate-100">${skill.path}</span>
                  <div class="flex items-center gap-3">
                    <span class="${skill.exists ? 'text-sky-100' : 'text-slate-500'}">${skill.exists ? (skill.title || this.t('ready')) : this.t('missing')}</span>
                    ${skill.exists ? this.renderPreviewButton(skill.path, skill.title || skill.key) : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
          <div class="flex items-center justify-between gap-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('moduleMapTitle')}</p>
            <span class="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">${skillsStatus.modules.length}</span>
          </div>
          <div class="mt-5 grid gap-3">
            ${skillsStatus.modules.map(module => `
              <div class="rounded-2xl border ${module.skillExists ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-rose-500/25 bg-rose-500/10'} px-4 py-3 text-sm">
                <div class="flex items-center justify-between gap-4">
                  <span class="font-medium text-slate-100">${this.getLocalizedModuleName(module.name)}</span>
                  <div class="flex items-center gap-3">
                    <span class="${module.skillExists ? 'text-emerald-100' : 'text-rose-100'}">${module.skillExists ? this.t('ready') : this.t('missing')}</span>
                    ${module.skillExists ? this.renderPreviewButton(module.skillPath, this.getLocalizedModuleName(module.name)) : ''}
                  </div>
                </div>
                <p class="mt-2 font-mono text-xs text-slate-400">${module.skillPath}</p>
              </div>
            `).join('') || `<p class="text-sm text-slate-500">${this.t('noModulesDiscovered')}</p>`}
          </div>
        </section>
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
          <div class="flex items-center justify-between gap-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('indexStatus')}</p>
            <button
              type="button"
              onclick="app.handleRebuildIndex()"
              class="rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500"
              ${this.state.rebuildingIndex ? 'disabled' : ''}
            >
              ${this.state.rebuildingIndex ? this.t('rebuildingIndex') : this.t('rebuildIndex')}
            </button>
          </div>
          <div class="mt-4 space-y-2 text-sm text-slate-300">
            <div>${!skillsStatus.skillIndex.exists ? this.t('indexMissing') : skillsStatus.skillIndex.needsRebuild ? this.t('indexNeedsRebuild') : this.t('indexReady')}</div>
            <div>${this.t('generatedAt')}: ${skillsStatus.skillIndex.updatedAt || '-'}</div>
            <div>${this.t('indexLatestSourceUpdate')}: ${skillsStatus.skillIndex.latestSourceUpdatedAt || '-'}</div>
            <div>${this.t('sectionsLabel')}: ${skillsStatus.skillIndex.stats?.totalSections || 0}</div>
            ${(skillsStatus.skillIndex.reasons || []).length
              ? `<div class="pt-2">
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('indexRebuildReasons')}</p>
                  <div class="mt-2 grid gap-2">
                    ${(skillsStatus.skillIndex.reasons || []).map(reason => `
                      <div class="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 font-mono text-xs text-slate-400">
                        ${this.escapeHtml(this.getLocalizedStatusItem(reason))}
                      </div>
                    `).join('')}
                  </div>
                </div>`
              : ''}
          </div>
        </section>
      </div>
    `;
  }

  renderExecution() {
    return `
      <div class="space-y-8">
        ${this.renderLegacyProjectBanner()}
        <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          ${this.renderDataSourcesCard('execution')}
          ${this.renderViewStateCard('execution')}
        </div>
        ${this.renderFeatures()}
        ${this.renderWorkflow()}
        ${this.renderFlags()}
      </div>
    `;
  }

  renderFeatures() {
    const defaultProfile = this.state.workflow?.defaultProfile || this.state.execution?.defaultProfile || null;
    const queuedFeatures = this.state.queuedFeatures || [];
    if (this.state.features.length === 0 && queuedFeatures.length === 0) {
      return `
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-10 text-center">
          <p class="text-lg text-slate-200">${this.t('noActiveChanges')}</p>
          <p class="mt-2 text-sm text-slate-500">${this.t('noActiveChangesHint')}</p>
          ${defaultProfile
            ? `<div class="mt-5 inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                <span class="text-slate-500">${this.t('workflowProfileDefaultLabel')}:</span>
                <span class="font-medium text-slate-100">${this.escapeHtml(this.getWorkflowProfileLabel(defaultProfile))}</span>
                ${this.renderWorkflowProfileBadge(defaultProfile)}
              </div>`
            : ''}
        </section>
      `;
    }

    return `
      <div class="space-y-6">
        ${queuedFeatures.length > 0 ? this.renderQueuedFeatures(queuedFeatures) : ''}
        ${this.state.features.length === 0
          ? `<section class="rounded-[2rem] border border-dashed border-slate-700 bg-slate-950/50 p-6">
              <p class="text-lg text-slate-200">${this.t('noActiveChanges')}</p>
              <p class="mt-2 text-sm text-slate-500">${this.t('queuedChangesWaiting')}</p>
              <p class="mt-2 text-sm text-slate-500">${this.t('queuedChangeActivateHint')}</p>
            </section>`
          : ''}
        ${this.state.features.length > 0 ? `<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        ${this.state.features.map(feature => `
          <article class="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-lg font-semibold text-slate-50">${feature.name}</h3>
                <p class="mt-2 text-sm leading-6 text-slate-400">${this.escapeHtml(this.getFeatureDescriptionText(feature.description))}</p>
                ${feature.workflowProfile
                  ? `<div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                      <span class="text-slate-500">${this.t('workflowProfileLabel')}:</span>
                      <span class="font-medium text-slate-100">${this.escapeHtml(this.getWorkflowProfileLabel(feature.workflowProfile))}</span>
                      ${this.renderWorkflowProfileBadge(feature.workflowProfile)}
                    </div>
                    <p class="mt-2 text-xs leading-6 text-slate-500">${this.t('workflowProfileReasonLabel')}: ${this.escapeHtml(this.getWorkflowProfileSourceLabel(feature.workflowProfile.source))}</p>`
                  : ''}
                <div class="mt-3">
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.getChangeActivatedOptionalStepsLabel()}</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    ${(feature.activatedSteps || []).map(step => `
                      <span class="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs text-amber-100">${this.getWorkflowStepLabel(step)}</span>
                    `).join('') || `<span class="text-sm text-slate-500">${this.getNoActivatedOptionalStepsForChangeText()}</span>`}
                  </div>
                </div>
              </div>
              <span class="rounded-full border border-slate-700 px-3 py-1 text-xs tracking-[0.2em] text-slate-300">${this.getFeatureStatusLabel(feature.status)}</span>
            </div>
            <div class="mt-5">
              <div class="mb-2 flex items-center justify-between text-sm">
                <span class="text-slate-500">${this.t('progress')}</span>
                <span class="font-medium text-slate-100">${feature.progress}%</span>
              </div>
              <div class="h-2 rounded-full bg-slate-800">
                <div class="h-2 rounded-full bg-emerald-400" style="width: ${feature.progress}%"></div>
              </div>
            </div>
            <p class="mt-4 text-sm text-slate-400">${this.t('currentStep')}: <span class="text-slate-200">${this.getWorkflowStepLabel(feature.currentStep)}</span></p>
            <div class="mt-4 flex flex-wrap gap-2">
              ${feature.flags.map(flag => `
                <span class="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-100">${this.getFlagLabel(flag)}</span>
              `).join('') || `<span class="text-sm text-slate-500">${this.t('noFlags')}</span>`}
            </div>
          </article>
        `).join('')}</div>` : ''}
      </div>
    `;
  }

  renderQueuedFeatures(queuedFeatures) {
    return `
      <section class="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('queuedChangesLabel')}</p>
            <p class="mt-2 text-sm text-slate-400">${this.t('queuedChangesWaiting')}</p>
          </div>
          <span class="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">${queuedFeatures.length}</span>
        </div>
        <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          ${queuedFeatures.map((feature, index) => `
            <article class="rounded-[1.5rem] border border-orange-500/20 bg-orange-500/5 p-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-orange-200/70">#${index + 1}</p>
                  <h3 class="mt-2 text-lg font-semibold text-slate-50">${this.escapeHtml(feature.name)}</h3>
                </div>
                <span class="rounded-full border border-orange-500/25 px-3 py-1 text-xs tracking-[0.2em] text-orange-100">${this.getFeatureStatusLabel(feature.status)}</span>
              </div>
              <div class="mt-4 space-y-2 text-sm text-slate-300">
                <p>${this.t('currentStep')}: <span class="text-slate-100">${this.escapeHtml(feature.currentStep || 'queued')}</span></p>
                <p>Path: <span class="text-slate-100">${this.escapeHtml(feature.path)}</span></p>
                <p>Queued at: <span class="text-slate-100">${this.escapeHtml(feature.queuedAt || '-')}</span></p>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  renderWorkflow() {
    const workflow = this.state.workflow;
    if (!workflow) {
      return '';
    }

    const defaultProfile = workflow.defaultProfile || this.state.execution?.defaultProfile || null;
    const availableProfiles = workflow.availableProfiles || [];

    const modeEnabledOptionalSteps = workflow.mode_enabled_optional_steps || workflow.activated_steps || [];

    return `
      <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('coreSteps')}</p>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            ${workflow.core_steps.map((step, index) => `
              <div class="flex items-center gap-3">
                <span class="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">${this.getWorkflowStepLabel(step)}</span>
                ${index < workflow.core_steps.length - 1 ? '<span class="text-slate-600">→</span>' : ''}
              </div>
            `).join('')}
          </div>
        </section>
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.getModeOptionalStepsLabel()}</p>
          <p class="mt-3 text-sm leading-6 text-slate-500">${this.getWorkflowOptionalStepsModeHint()}</p>
          <div class="mt-5 flex flex-wrap gap-3">
            ${modeEnabledOptionalSteps.map(step => `
              <span class="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">${this.getWorkflowStepLabel(step)}</span>
            `).join('') || `<span class="text-sm text-slate-500">${this.getNoOptionalStepsForModeText()}</span>`}
          </div>
          <p class="mt-4 text-xs leading-6 text-slate-500">${this.getWorkflowModeGovernanceHint()}</p>
        </section>
      </div>
      <div class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6">
          <div class="flex items-center justify-between gap-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('workflowProfileDefaultLabel')}</p>
            ${defaultProfile ? this.renderWorkflowProfileBadge(defaultProfile) : ''}
          </div>
          ${defaultProfile
            ? `<h3 class="mt-4 text-xl font-semibold text-slate-50">${this.escapeHtml(this.getWorkflowProfileLabel(defaultProfile))}</h3>
                <p class="mt-2 text-sm leading-6 text-slate-400">${this.escapeHtml(defaultProfile.description || '')}</p>
                <p class="mt-3 text-xs leading-6 text-slate-500">${this.getWorkflowProfileDefaultHint()}</p>
                <div class="mt-5 space-y-3 text-sm text-slate-300">
                  <div><span class="text-slate-500">${this.t('workflowProfileReasonLabel')}:</span> ${this.escapeHtml(this.getWorkflowProfileSourceLabel(defaultProfile.source))}</div>
                  <div><span class="text-slate-500">${this.t('workflowProfileProtocolFilesLabel')}:</span> ${this.escapeHtml((defaultProfile.minimumProtocolFiles || []).join(', ') || '-')}</div>
                  <div><span class="text-slate-500">${this.t('workflowProfileArchiveFocusLabel')}:</span> ${this.escapeHtml((defaultProfile.archiveFocus || []).join(', ') || '-')}</div>
                </div>`
            : `<p class="mt-4 text-sm text-slate-500">${this.t('unknownValue')}</p>`
          }
        </section>
        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6">
          <div class="flex items-center justify-between gap-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('workflowProfilesAvailableLabel')}</p>
            <span class="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">${availableProfiles.length}</span>
          </div>
          <p class="mt-3 text-sm leading-6 text-slate-500">${this.getWorkflowProfileAvailableHint()}</p>
          <div class="mt-5 grid gap-3">
            ${availableProfiles.map(profile => `
              <article class="rounded-2xl border ${profile.id === defaultProfile?.id ? 'border-emerald-500/25 bg-emerald-500/8' : 'border-slate-800 bg-slate-900/80'} px-4 py-4">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="text-sm font-semibold text-slate-100">${this.escapeHtml(this.getWorkflowProfileLabel(profile))}</h3>
                    <p class="mt-2 text-sm leading-6 text-slate-400">${this.escapeHtml(profile.description || '')}</p>
                  </div>
                  ${this.renderWorkflowProfileBadge(profile)}
                </div>
                <p class="mt-3 text-xs leading-6 text-slate-500">${this.t('workflowProfileProtocolFilesLabel')}: ${this.escapeHtml((profile.minimumProtocolFiles || []).join(', ') || '-')}</p>
              </article>
            `).join('') || `<p class="text-sm text-slate-500">${this.t('unknownValue')}</p>`}
          </div>
          <p class="mt-4 text-xs leading-6 text-slate-500">${this.getWorkflowOptionalStepsChangeHint()}</p>
        </section>
      </div>
    `;
  }

  renderFlags() {
    return `
      <section class="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500">${this.t('supportedFlags')}</p>
        <div class="mt-5 flex flex-wrap gap-3">
          ${this.state.flags.map(flag => `
            <span class="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">${this.getFlagLabel(flag)}</span>
          `).join('') || `<span class="text-sm text-slate-500">${this.t('noFlagsAvailable')}</span>`}
        </div>
      </section>
    `;
  }

  renderErrorBanner() {
    if (!this.state.error) {
      return '';
    }

    return `
      <div class="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
        ${this.escapeHtml(this.state.error)}
      </div>
    `;
  }
}

const app = new DashboardApp();
window.app = app;
window.addEventListener('load', () => {
  void app.init();
});
