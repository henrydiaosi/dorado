"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateInputFactory = void 0;
const constants_1 = require("../../core/constants");
class TemplateInputFactory {
    normalizeFeatureTemplateInput(input) {
        if (typeof input === 'string') {
            return {
                feature: input,
                mode: 'standard',
                affects: [],
                flags: [],
                optionalSteps: [],
                background: '为什么要做这个 change？当前存在哪些问题？',
                goals: ['做完之后能解决什么问题？用户或开发者能得到什么？'],
                inScope: ['待补充'],
                outOfScope: ['待补充'],
                acceptanceCriteria: ['条件一', '条件二'],
                projectContext: this.normalizeFeatureProjectContext(),
                documentLanguage: 'zh-CN',
            };
        }
        return {
            feature: input.feature,
            mode: input.mode ?? 'standard',
            affects: input.affects ?? [],
            flags: input.flags ?? [],
            optionalSteps: input.optionalSteps ?? [],
            background: input.background?.trim() || '为什么要做这个 change？当前存在哪些问题？',
            goals: input.goals?.map(item => item.trim()).filter(Boolean) ?? [
                '做完之后能解决什么问题？用户或开发者能得到什么？',
            ],
            inScope: input.inScope?.map(item => item.trim()).filter(Boolean) ?? ['待补充'],
            outOfScope: input.outOfScope?.map(item => item.trim()).filter(Boolean) ?? ['待补充'],
            acceptanceCriteria: input.acceptanceCriteria?.map(item => item.trim()).filter(Boolean) ?? [
                '条件一',
                '条件二',
            ],
            projectContext: this.normalizeFeatureProjectContext(input.projectContext),
            documentLanguage: input.documentLanguage ?? 'zh-CN',
        };
    }
    normalizeProjectBootstrapInput(input, fallbackName, mode, inferredDefaults, presetDefaults) {
        const normalizedInputProjectName = input?.projectName?.trim();
        const normalizedInputSummary = input?.summary?.trim();
        const normalizedInputArchitecture = input?.architecture?.trim();
        const normalizedInputTechStack = (input?.techStack ?? []).map(item => item.trim()).filter(Boolean);
        const normalizedInputModules = (input?.modules ?? []).map(item => item.trim()).filter(Boolean);
        const normalizedInputApiAreas = (input?.apiAreas ?? []).map(item => item.trim()).filter(Boolean);
        const normalizedInputDesignDocs = (input?.designDocs ?? []).map(item => item.trim()).filter(Boolean);
        const normalizedInputPlanningDocs = (input?.planningDocs ?? []).map(item => item.trim()).filter(Boolean);
        const inferredTechStack = (inferredDefaults?.techStack ?? []).map(item => item.trim()).filter(Boolean);
        const inferredModules = (inferredDefaults?.modules ?? []).map(item => item.trim()).filter(Boolean);
        const inferredApiAreas = (inferredDefaults?.apiAreas ?? []).map(item => item.trim()).filter(Boolean);
        const inferredDesignDocs = (inferredDefaults?.designDocs ?? []).map(item => item.trim()).filter(Boolean);
        const inferredPlanningDocs = (inferredDefaults?.planningDocs ?? []).map(item => item.trim()).filter(Boolean);
        const presetTechStack = (presetDefaults?.techStack ?? []).map(item => item.trim()).filter(Boolean);
        const presetModules = (presetDefaults?.modules ?? []).map(item => item.trim()).filter(Boolean);
        const presetApiAreas = (presetDefaults?.apiAreas ?? []).map(item => item.trim()).filter(Boolean);
        const presetDesignDocs = (presetDefaults?.designDocs ?? []).map(item => item.trim()).filter(Boolean);
        const presetPlanningDocs = (presetDefaults?.planningDocs ?? []).map(item => item.trim()).filter(Boolean);
        const presetSummary = presetDefaults?.summary?.trim();
        const presetArchitecture = presetDefaults?.architecture?.trim();
        const projectName = normalizedInputProjectName || fallbackName;
        const summary = normalizedInputSummary ||
            presetSummary ||
            `${fallbackName} 已通过 Dorado 初始化，当前处于项目知识层搭建阶段。`;
        const techStack = normalizedInputTechStack.length > 0
            ? Array.from(new Set(normalizedInputTechStack))
            : inferredTechStack.length > 0
                ? Array.from(new Set(inferredTechStack))
                : presetTechStack.length > 0
                    ? Array.from(new Set(presetTechStack))
                    : ['待补充'];
        const architecture = normalizedInputArchitecture ||
            presetArchitecture ||
            '当前先建立项目知识层、分层技能层和执行层骨架，后续继续细化架构。';
        const modules = normalizedInputModules.length > 0
            ? Array.from(new Set(normalizedInputModules))
            : inferredModules.length > 0
                ? Array.from(new Set(inferredModules))
                : presetModules.length > 0
                    ? Array.from(new Set(presetModules))
                    : ['core', 'modules/<module>'];
        const apiAreas = normalizedInputApiAreas.length > 0
            ? Array.from(new Set(normalizedInputApiAreas))
            : inferredApiAreas.length > 0
                ? Array.from(new Set(inferredApiAreas))
                : presetApiAreas.length > 0
                    ? Array.from(new Set(presetApiAreas))
                    : ['待补充'];
        const designDocs = normalizedInputDesignDocs.length > 0
            ? Array.from(new Set(normalizedInputDesignDocs))
            : inferredDesignDocs.length > 0
                ? Array.from(new Set(inferredDesignDocs))
                : presetDesignDocs.length > 0
                    ? Array.from(new Set(presetDesignDocs))
                    : ['待补充'];
        const planningDocs = normalizedInputPlanningDocs.length > 0
            ? Array.from(new Set(normalizedInputPlanningDocs))
            : inferredPlanningDocs.length > 0
                ? Array.from(new Set(inferredPlanningDocs))
                : presetPlanningDocs.length > 0
                    ? Array.from(new Set(presetPlanningDocs))
                    : ['待补充'];
        const documentLanguage = this.normalizeDocumentLanguage(input?.documentLanguage);
        const executeScaffoldCommands = Boolean(input?.executeScaffoldCommands);
        const fieldSources = {
            projectName: normalizedInputProjectName ? 'user' : 'placeholder',
            summary: normalizedInputSummary ? 'user' : presetSummary ? 'preset' : 'placeholder',
            techStack: normalizedInputTechStack.length > 0
                ? 'user'
                : inferredTechStack.length > 0
                    ? 'inferred'
                    : presetTechStack.length > 0
                        ? 'preset'
                        : 'placeholder',
            architecture: normalizedInputArchitecture
                ? 'user'
                : presetArchitecture
                    ? 'preset'
                    : 'placeholder',
            modules: normalizedInputModules.length > 0
                ? 'user'
                : inferredModules.length > 0
                    ? 'inferred'
                    : presetModules.length > 0
                        ? 'preset'
                        : 'placeholder',
            apiAreas: normalizedInputApiAreas.length > 0
                ? 'user'
                : inferredApiAreas.length > 0
                    ? 'inferred'
                    : presetApiAreas.length > 0
                        ? 'preset'
                        : 'placeholder',
            designDocs: normalizedInputDesignDocs.length > 0
                ? 'user'
                : inferredDesignDocs.length > 0
                    ? 'inferred'
                    : presetDesignDocs.length > 0
                        ? 'preset'
                        : 'placeholder',
            planningDocs: normalizedInputPlanningDocs.length > 0
                ? 'user'
                : inferredPlanningDocs.length > 0
                    ? 'inferred'
                    : presetPlanningDocs.length > 0
                        ? 'preset'
                        : 'placeholder',
        };
        const userProvidedFields = this.pickFieldKeys(fieldSources, 'user');
        const inferredFields = this.pickFieldKeys(fieldSources, 'inferred');
        const placeholderFields = this.pickFieldKeys(fieldSources, 'placeholder');
        const usedFallbacks = [...inferredFields, ...placeholderFields];
        const modulePlans = this.buildPlannedFiles(modules, 'module', value => this.normalizeModuleDisplayName(value), slug => `${constants_1.DIR_NAMES.SRC}/${constants_1.DIR_NAMES.MODULES}/${slug}/${constants_1.FILE_NAMES.SKILL_MD}`, displayName => displayName.toLowerCase() === 'core');
        const moduleApiPlans = this.buildModuleApiPlans(modulePlans);
        const apiAreaPlans = this.buildPlannedFiles(apiAreas, 'api', value => this.normalizeDocDisplayName(value, constants_1.DIR_NAMES.API), slug => `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.API}/${slug}.md`);
        const designDocPlans = this.buildPlannedFiles(designDocs, 'design', value => this.normalizeDocDisplayName(value, constants_1.DIR_NAMES.DESIGN), slug => `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.DESIGN}/${slug}.md`);
        const planningDocPlans = this.buildPlannedFiles(planningDocs, 'plan', value => this.normalizeDocDisplayName(value, constants_1.DIR_NAMES.PLANNING), slug => `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.PLANNING}/${slug}.md`);
        return {
            projectPresetId: input?.projectPresetId ?? null,
            projectName,
            summary,
            techStack,
            architecture,
            modules,
            apiAreas,
            designDocs,
            planningDocs,
            documentLanguage,
            executeScaffoldCommands,
            mode,
            modulePlans,
            moduleApiPlans,
            apiAreaPlans,
            designDocPlans,
            planningDocPlans,
            fieldSources,
            usedFallbacks,
            userProvidedFields,
            inferredFields,
            placeholderFields,
        };
    }
    normalizeFeatureProjectContext(context) {
        return {
            projectDocs: context?.projectDocs ?? [],
            moduleSkills: context?.moduleSkills ?? [],
            apiDocs: context?.apiDocs ?? [],
            designDocs: context?.designDocs ?? [],
            planningDocs: context?.planningDocs ?? [],
        };
    }
    normalizeDocumentLanguage(input) {
        return input === 'en-US' ? 'en-US' : 'zh-CN';
    }
    pickFieldKeys(fieldSources, source) {
        return Object.entries(fieldSources)
            .filter(([, value]) => value === source)
            .map(([key]) => key);
    }
    isPlaceholderItem(value) {
        const normalized = value.trim().toLowerCase();
        return (normalized.length === 0 ||
            normalized === '待补充' ||
            normalized === 'todo' ||
            normalized === 'tbd' ||
            normalized.includes('<') ||
            normalized.includes('>'));
    }
    slugify(value) {
        return value
            .toLowerCase()
            .replace(/\.md$/i, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    normalizeModuleDisplayName(value) {
        return value
            .replace(/^src[\\/]+modules[\\/]+/i, '')
            .replace(/^modules[\\/]+/i, '')
            .replace(/[\\/]+/g, ' ')
            .trim();
    }
    normalizeDocDisplayName(value, section) {
        const normalizedSection = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return value
            .replace(new RegExp(`^docs[\\\\/]${normalizedSection}[\\\\/]`, 'i'), '')
            .replace(/\.md$/i, '')
            .replace(/[\\/]+/g, ' ')
            .trim();
    }
    buildPlannedFiles(items, prefix, normalizeDisplayName, buildPath, shouldSkip) {
        const plans = [];
        const usedSlugs = new Set();
        for (const item of items) {
            const displayName = normalizeDisplayName(item);
            if (!displayName || this.isPlaceholderItem(displayName) || shouldSkip?.(displayName)) {
                continue;
            }
            const baseSlug = this.slugify(displayName) || prefix;
            let slug = baseSlug;
            let counter = 2;
            while (usedSlugs.has(slug)) {
                slug = `${baseSlug}-${counter}`;
                counter += 1;
            }
            usedSlugs.add(slug);
            const relativePath = buildPath(slug).replace(/\\/g, '/');
            plans.push({
                name: slug,
                displayName,
                fileName: relativePath.split('/').pop() || relativePath,
                path: relativePath,
            });
        }
        return plans;
    }
    buildModuleApiPlans(modulePlans) {
        return modulePlans.map(plan => ({
            name: `module-${plan.name}`,
            displayName: `${plan.displayName} module api`,
            fileName: `module-${plan.name}.md`,
            path: `${constants_1.DIR_NAMES.DOCS}/${constants_1.DIR_NAMES.API}/module-${plan.name}.md`,
        }));
    }
}
exports.TemplateInputFactory = TemplateInputFactory;
//# sourceMappingURL=TemplateInputFactory.js.map