import { ActiveChangeStatusItem, ActiveChangeStatusReport, DocsStatus, ExecutionStatus, FeatureState, KnowledgeDocInfo, ModuleInfo, ProjectMode, ProjectStructureStatus, ProjectSummary, QueuedChangeSummary, SkillsStatus } from '../core/types';
import { ConfigManager } from './ConfigManager';
import { FileService } from './FileService';
import { IndexBuilder } from './IndexBuilder';
import { ProjectAssetService } from './ProjectAssetService';
import { ProjectScaffoldCommandExecutionResult, ProjectScaffoldCommandPlan, ProjectScaffoldCommandService } from './ProjectScaffoldCommandService';
import { ProjectScaffoldPlan, ProjectScaffoldService } from './ProjectScaffoldService';
import { SkillParser } from './SkillParser';
import { StateManager } from './StateManager';
import { TemplateEngine } from './TemplateEngine';
import { FeatureProjectContext, ProjectBootstrapInput } from './TemplateEngine';
import { ProjectPresetFirstChangeSuggestion } from '../presets/ProjectPresets';
import { archiveGate } from '../workflow/ArchiveGate';
interface BootstrapStructurePolicy {
    minimumRequiredPaths: string[];
    recommendedPaths: string[];
    compatibleMissingRecommendedPaths: string[];
}
interface BootstrapAssetPlan {
    directCopyFiles: string[];
    templateGeneratedFiles: string[];
    runtimeGeneratedFiles: string[];
    localizedCopySources: Array<{
        targetRelativePath: string;
        sourceRelativePath: string;
    }>;
}
interface BootstrapFieldPolicy {
    key: string;
    required: boolean;
    allowPlaceholder: boolean;
}
interface AssetManifestEntry {
    id: string;
    strategy: 'direct_copy' | 'template_generated' | 'runtime_generated';
    category: string;
    description: string;
    targetRelativePath: string;
    sourceRelativePath: string | null;
    overwritePolicy: 'if_missing' | 'rebuild';
    exists: boolean;
}
export interface ProjectAssetStatus {
    exists: boolean;
    path: string;
    generatedAt: string | null;
    summary: {
        directCopy: number;
        templateGenerated: number;
        runtimeGenerated: number;
    };
    directCopy: AssetManifestEntry[];
    templateGenerated: AssetManifestEntry[];
    runtimeGenerated: AssetManifestEntry[];
}
export interface ProjectInitializationResult {
    projectName: string;
    mode: ProjectMode;
    projectPresetId: string | null;
    documentLanguage: string;
    executeScaffoldCommands: boolean;
    scaffoldPlan: ProjectScaffoldPlan | null;
    commandPlan: ProjectScaffoldCommandPlan | null;
    commandExecution: ProjectScaffoldCommandExecutionResult;
    scaffoldCreatedFiles: string[];
    scaffoldSkippedFiles: string[];
    scaffoldCreatedDirectories: string[];
    scaffoldSkippedDirectories: string[];
    directCopyCreatedFiles: string[];
    directCopySkippedFiles: string[];
    hookInstalledFiles: string[];
    hookSkippedFiles: string[];
    runtimeGeneratedFiles: string[];
    recoveryFilePath: string | null;
    firstChangeSuggestion: ProjectPresetFirstChangeSuggestion | null;
}
export interface ProjectKnowledgeGenerationResult {
    projectName: string;
    mode: ProjectMode;
    projectPresetId: string | null;
    documentLanguage: string;
    createdFiles: string[];
    refreshedFiles: string[];
    skippedFiles: string[];
    directCopyCreatedFiles: string[];
    directCopySkippedFiles: string[];
    hookInstalledFiles: string[];
    hookSkippedFiles: string[];
    runtimeGeneratedFiles: string[];
    firstChangeSuggestion: ProjectPresetFirstChangeSuggestion | null;
}
export interface ProjectModeSwitchResult {
    previousMode: ProjectMode;
    nextMode: ProjectMode;
    activeChangesDetected: string[];
    activeChangesUpdated: string[];
    refreshedProtocolShellRootSkill: boolean;
    rebuiltIndex: boolean;
}
export declare class ProjectService {
    private fileService;
    private configManager;
    private templateEngine;
    private indexBuilder;
    private skillParser;
    private stateManager;
    private projectAssetService;
    private projectScaffoldService;
    private projectScaffoldCommandService;
    constructor(fileService: FileService, configManager: ConfigManager, templateEngine: TemplateEngine, indexBuilder: IndexBuilder, skillParser: SkillParser, stateManager: StateManager, projectAssetService: ProjectAssetService, projectScaffoldService: ProjectScaffoldService, projectScaffoldCommandService: ProjectScaffoldCommandService);
    initializeProject(rootDir: string, mode: ProjectMode, input?: ProjectBootstrapInput): Promise<ProjectInitializationResult>;
    generateProjectKnowledge(rootDir: string, input?: ProjectBootstrapInput): Promise<ProjectKnowledgeGenerationResult>;
    switchProjectMode(rootDir: string, nextMode: ProjectMode, options?: {
        forceActive?: boolean;
    }): Promise<ProjectModeSwitchResult>;
    initializeProtocolShellProject(rootDir: string, mode: ProjectMode, input?: ProjectBootstrapInput): Promise<ProjectInitializationResult>;
    detectProjectStructure(rootDir: string): Promise<ProjectStructureStatus>;
    getProjectSummary(rootDir: string): Promise<ProjectSummary>;
    getProjectAssetStatus(rootDir: string): Promise<ProjectAssetStatus>;
    scanProjectDocs(rootDir: string): Promise<DocsStatus>;
    scanModules(rootDir: string): Promise<ModuleInfo[]>;
    scanApiDocs(rootDir: string): Promise<KnowledgeDocInfo[]>;
    scanDesignDocs(rootDir: string): Promise<KnowledgeDocInfo[]>;
    scanPlanningDocs(rootDir: string): Promise<KnowledgeDocInfo[]>;
    scanSkillHierarchy(rootDir: string): Promise<SkillsStatus>;
    getExecutionStatus(rootDir: string): Promise<ExecutionStatus>;
    getActiveChangeStatusReport(rootDir: string): Promise<ActiveChangeStatusReport>;
    getActiveChangeStatusItem(featurePath: string): Promise<ActiveChangeStatusItem>;
    checkArchiveReadiness(featurePath: string): Promise<{
        featureState: FeatureState;
        result: Awaited<ReturnType<typeof archiveGate.checkArchiveReadiness>>;
    }>;
    archiveChange(featurePath: string): Promise<string>;
    finalizeChange(featurePath: string): Promise<{
        archivePath: string;
        preflight: ActiveChangeStatusItem;
    }>;
    listActiveChangeNames(rootDir: string): Promise<string[]>;
    hasActiveChanges(rootDir: string): Promise<boolean>;
    listQueuedChangeNames(rootDir: string): Promise<string[]>;
    getQueuedChanges(rootDir: string): Promise<QueuedChangeSummary[]>;
    activateQueuedChange(rootDir: string, changeName: string, source?: FeatureState['source']): Promise<string>;
    activateNextQueuedChange(rootDir: string, source?: FeatureState['source']): Promise<QueuedChangeSummary | null>;
    getFeatureProjectContext(rootDir: string, affects?: string[]): Promise<FeatureProjectContext>;
    getDocsStatus(rootDir: string): Promise<DocsStatus>;
    getSkillsStatus(rootDir: string): Promise<SkillsStatus>;
    getIndexStatus(rootDir: string): Promise<SkillsStatus['skillIndex']>;
    getBootstrapUpgradePlan(rootDir: string): Promise<ProjectBootstrapInput>;
    previewBootstrap(rootDir: string, mode: ProjectMode, input?: ProjectBootstrapInput): Promise<{
        projectPresetId: string | null;
        projectName: string;
        mode: ProjectMode;
        summary: string;
        techStack: string[];
        modules: string[];
        apiAreas: string[];
        designDocs: string[];
        planningDocs: string[];
        moduleSkillFiles: string[];
        moduleApiDocFiles: string[];
        apiDocFiles: string[];
        designDocFiles: string[];
        planningDocFiles: string[];
        files: string[];
        inferredModules: string[];
        fieldPolicy: BootstrapFieldPolicy[];
        structurePolicy: BootstrapStructurePolicy;
        assetPlan: BootstrapAssetPlan;
        scaffoldPlan: ProjectScaffoldPlan | null;
        commandPlan: ProjectScaffoldCommandPlan | null;
        firstChangeSuggestion: ProjectPresetFirstChangeSuggestion | null;
        usedFallbacks: string[];
        fieldSources: Record<string, string>;
    }>;
    inferBootstrapModules(rootDir: string): Promise<string[]>;
    getBootstrapFieldPolicy(): BootstrapFieldPolicy[];
    getBootstrapStructurePolicy(rootDir: string): BootstrapStructurePolicy;
    private buildBootstrapPreview;
    rebuildIndex(rootDir: string): Promise<SkillsStatus['skillIndex']>;
    private getDirectorySkeleton;
    private getProtocolShellDirectorySkeleton;
    private getKnowledgeLayerDirectorySkeleton;
    private getMinimumRuntimeStructureDefinitions;
    private getProtocolShellRecommendedDefinitions;
    private getProjectKnowledgeStructureDefinitions;
    private getStructureDefinitions;
    private getDocumentDefinitions;
    private getRootSkillDefinitions;
    private toDocumentStatusItem;
    private toSkillFileInfo;
    private writeIfMissing;
    private normalizeProjectBootstrap;
    private writeProjectKnowledgeLayer;
    private writeGeneratedFile;
    private isProtocolShellRootSkill;
    private detectProtocolShellRootSkillLanguage;
    private refreshProtocolShellRootSkillIfManaged;
    private updateActiveChangeModes;
    private createEmptyScaffoldResult;
    private applyProjectScaffoldPhase;
    private getProtocolShellTemplateGeneratedPaths;
    private getFullBootstrapTemplateGeneratedPaths;
    private getBootstrapAssetPlan;
    private renderProtocolShellRootSkill;
    private writeBootstrapSummary;
    private renderBootstrapSummary;
    private describeCommandExecutionStatus;
    private getPresetDefaults;
    private getFirstChangeSuggestion;
    private calculateProgress;
    private extractDescription;
    private buildActiveChangeStatusItem;
    private analyzeChecklistDocument;
    private analyzeVerificationDocument;
    private analyzeStateProtocolAlignment;
    private analyzeOptionalStepProtocolAssets;
    private resolveActiveChangePaths;
    private reconcileStateForFinalize;
    private assertFinalizeStateConsistency;
    private performArchive;
    private resolveArchiveDirName;
    private updateProposalStatus;
    private maxUpdatedAt;
    private getLatestUpdatedAt;
    private shouldRebuildIndex;
    private getIndexRebuildReasons;
    private buildUpgradeSuggestions;
    private filterKnowledgeDocsByAffects;
    private toRelativePath;
    private toSlug;
    private scanDocsInDirectory;
}
export declare const createProjectService: (fileService: FileService, configManager: ConfigManager, templateEngine: TemplateEngine, indexBuilder: IndexBuilder, skillParser: SkillParser, stateManager: StateManager, projectAssetService: ProjectAssetService, projectScaffoldService: ProjectScaffoldService, projectScaffoldCommandService: ProjectScaffoldCommandService) => ProjectService;
export {};
//# sourceMappingURL=ProjectService.d.ts.map