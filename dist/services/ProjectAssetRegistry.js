"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIRECT_COPY_PROJECT_ASSETS = void 0;
exports.DIRECT_COPY_PROJECT_ASSETS = [
    {
        id: 'ai-guide',
        category: 'ai_guidance',
        description: 'Project-adopted AI guide copied from the Dorado mother spec.',
        targetRelativePath: 'for-ai/ai-guide.md',
        overwritePolicy: 'if_missing',
        localizedSources: {
            'zh-CN': 'assets/for-ai/zh-CN/ai-guide.md',
            'en-US': 'assets/for-ai/en-US/ai-guide.md',
        },
    },
    {
        id: 'execution-protocol',
        category: 'ai_guidance',
        description: 'Project-adopted execution protocol copied from the Dorado mother spec.',
        targetRelativePath: 'for-ai/execution-protocol.md',
        overwritePolicy: 'if_missing',
        localizedSources: {
            'zh-CN': 'assets/for-ai/zh-CN/execution-protocol.md',
            'en-US': 'assets/for-ai/en-US/execution-protocol.md',
        },
    },
    {
        id: 'build-index-script',
        category: 'tooling',
        description: 'Rebuild script for SKILL.index.json.',
        targetRelativePath: 'build-index-auto.js',
        overwritePolicy: 'if_missing',
        sourceRelativePaths: ['src/tools/build-index.js', 'dist/tools/build-index.js'],
    },
    {
        id: 'project-naming-conventions',
        category: 'conventions',
        description: 'Project-adopted naming conventions copied from the Dorado mother spec.',
        targetRelativePath: 'docs/project/naming-conventions.md',
        overwritePolicy: 'if_missing',
        localizedSources: {
            'zh-CN': 'assets/project-conventions/zh-CN/naming-conventions.md',
            'en-US': 'assets/project-conventions/en-US/naming-conventions.md',
        },
    },
    {
        id: 'project-skill-conventions',
        category: 'conventions',
        description: 'Project-adopted layered SKILL conventions copied from the Dorado mother spec.',
        targetRelativePath: 'docs/project/skill-conventions.md',
        overwritePolicy: 'if_missing',
        localizedSources: {
            'zh-CN': 'assets/project-conventions/zh-CN/skill-conventions.md',
            'en-US': 'assets/project-conventions/en-US/skill-conventions.md',
        },
    },
    {
        id: 'project-development-guide',
        category: 'conventions',
        description: 'Project-adopted development guide copied from the Dorado mother spec.',
        targetRelativePath: 'docs/project/development-guide.md',
        overwritePolicy: 'if_missing',
        localizedSources: {
            'zh-CN': 'assets/project-conventions/zh-CN/development-guide.md',
            'en-US': 'assets/project-conventions/en-US/development-guide.md',
        },
    },
    {
        id: 'project-workflow-conventions',
        category: 'conventions',
        description: 'Project-adopted workflow and change execution conventions copied from the Dorado mother spec.',
        targetRelativePath: 'docs/project/workflow-conventions.md',
        overwritePolicy: 'if_missing',
        localizedSources: {
            'zh-CN': 'assets/project-conventions/zh-CN/workflow-conventions.md',
            'en-US': 'assets/project-conventions/en-US/workflow-conventions.md',
        },
    },
    {
        id: 'hook-template-pre-commit',
        category: 'hooks',
        description: 'Template for the Dorado pre-commit hook.',
        targetRelativePath: '.dorado/templates/hooks/pre-commit',
        overwritePolicy: 'if_missing',
        sourceRelativePaths: ['assets/git-hooks/pre-commit'],
    },
    {
        id: 'hook-template-post-merge',
        category: 'hooks',
        description: 'Template for the Dorado post-merge hook.',
        targetRelativePath: '.dorado/templates/hooks/post-merge',
        overwritePolicy: 'if_missing',
        sourceRelativePaths: ['assets/git-hooks/post-merge'],
    },
];
//# sourceMappingURL=ProjectAssetRegistry.js.map