"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionTemplateBuilder = void 0;
const TemplateBuilderBase_1 = require("./TemplateBuilderBase");
class ExecutionTemplateBuilder extends TemplateBuilderBase_1.TemplateBuilderBase {
    constructor(inputs) {
        super();
        this.inputs = inputs;
    }
    generateProposalTemplate(input) {
        const context = this.inputs.normalizeFeatureTemplateInput(input);
        const created = this.getCurrentDate();
        const projectDocs = context.projectContext.projectDocs ?? [];
        const moduleSkills = context.projectContext.moduleSkills ?? [];
        const apiDocs = context.projectContext.apiDocs ?? [];
        const designAndPlanningDocs = [
            ...(context.projectContext.designDocs ?? []),
            ...(context.projectContext.planningDocs ?? []),
        ];
        const zh = `## 背景

${context.background}

## 项目上下文

**项目文档：**
${this.formatReferenceList(projectDocs, '待补充')}

**关联模块技能：**
${this.formatReferenceList(moduleSkills, '待补充')}

**关联 API 文档：**
${this.formatReferenceList(apiDocs, '待补充')}

**关联设计 / 计划文档：**
${this.formatReferenceList(designAndPlanningDocs, '待补充')}

## 目标

${this.formatList(context.goals, '待补充')}

## 范围

**涉及：**
${this.formatList(context.inScope, '待补充')}

**不涉及：**
${this.formatList(context.outOfScope, '待补充')}

## 验收标准

${this.formatChecklist(context.acceptanceCriteria, '待补充')}`;
        const en = `## Background

${context.background}

## Project Context

**Project docs:**
${this.formatReferenceList(projectDocs, 'TBD')}

**Related module skills:**
${this.formatReferenceList(moduleSkills, 'TBD')}

**Related API docs:**
${this.formatReferenceList(apiDocs, 'TBD')}

**Related design / planning docs:**
${this.formatReferenceList(designAndPlanningDocs, 'TBD')}

## Goals

${this.formatList(context.goals, 'TBD')}

## Scope

**In scope:**
${this.formatList(context.inScope, 'TBD')}

**Out of scope:**
${this.formatList(context.outOfScope, 'TBD')}

## Acceptance Criteria

${this.formatChecklist(context.acceptanceCriteria, 'TBD')}`;
        return this.withFrontmatter({
            name: context.feature,
            status: 'active',
            created,
            affects: context.affects,
            flags: context.flags,
        }, this.copy(context.documentLanguage, zh, en));
    }
    generateTasksTemplate(input) {
        const context = this.inputs.normalizeFeatureTemplateInput(input);
        const created = this.getCurrentDate();
        const projectDocs = context.projectContext.projectDocs ?? [];
        const moduleSkills = context.projectContext.moduleSkills ?? [];
        const optionalStepTasksZh = context.optionalSteps.length > 0
            ? context.optionalSteps
                .map((step, index) => `- [ ] ${index + 7}. 完成可选步骤 \`${step}\` 的文档和验证`)
                .join('\n')
            : '';
        const optionalStepTasksEn = context.optionalSteps.length > 0
            ? context.optionalSteps
                .map((step, index) => `- [ ] ${index + 7}. Finish docs and verification for optional step \`${step}\``)
                .join('\n')
            : '';
        const zh = `## 上下文引用

**项目文档：**
${this.formatReferenceList(projectDocs, '待补充')}

**模块技能：**
${this.formatReferenceList(moduleSkills, '待补充')}

## 任务清单

- [ ] 1. 完成实现
- [ ] 2. 对齐项目规划文档与本次 change 的边界
- [ ] 3. 更新涉及模块的 \`SKILL.md\`
- [ ] 4. 更新相关 API / 设计 / 计划文档
- [ ] 5. 重新生成 \`SKILL.index.json\`
- [ ] 6. 执行验证并更新 \`verification.md\`
${optionalStepTasksZh}`.trim();
        const en = `## Context References

**Project docs:**
${this.formatReferenceList(projectDocs, 'TBD')}

**Module skills:**
${this.formatReferenceList(moduleSkills, 'TBD')}

## Task Checklist

- [ ] 1. Implement the change
- [ ] 2. Align project planning docs with this change boundary
- [ ] 3. Update affected \`SKILL.md\` files
- [ ] 4. Update related API / design / planning docs
- [ ] 5. Rebuild \`SKILL.index.json\`
- [ ] 6. Run verification and update \`verification.md\`
${optionalStepTasksEn}`.trim();
        return this.withFrontmatter({
            feature: context.feature,
            created,
            optional_steps: context.optionalSteps,
        }, this.copy(context.documentLanguage, zh, en));
    }
    generateVerificationTemplate(input) {
        const context = this.inputs.normalizeFeatureTemplateInput(input);
        const created = this.getCurrentDate();
        const projectDocs = context.projectContext.projectDocs ?? [];
        const moduleSkills = context.projectContext.moduleSkills ?? [];
        const linkedKnowledgeDocs = [
            ...(context.projectContext.apiDocs ?? []),
            ...(context.projectContext.designDocs ?? []),
            ...(context.projectContext.planningDocs ?? []),
        ];
        const zh = `## 自动验证

- [ ] build 通过
- [ ] lint 通过
- [ ] test 通过
- [ ] 索引已重新生成
- [ ] spec-check 通过

## 项目联动检查

${this.formatReferenceChecklist(projectDocs, '项目文档已回看')}

${this.formatReferenceChecklist(moduleSkills, '相关模块技能已回看')}

${this.formatReferenceChecklist(linkedKnowledgeDocs, '相关 API / 设计 / 计划文档已回看')}

## 需求验收

${this.formatChecklist(context.acceptanceCriteria, '验收项 1')}

## 结果

- [ ] 可以归档`;
        const en = `## Automated Checks

- [ ] build passed
- [ ] lint passed
- [ ] test passed
- [ ] index rebuilt
- [ ] spec-check passed

## Project Sync Review

${this.formatReferenceChecklist(projectDocs, 'Project docs reviewed')}

${this.formatReferenceChecklist(moduleSkills, 'Related module skills reviewed')}

${this.formatReferenceChecklist(linkedKnowledgeDocs, 'Related API / design / planning docs reviewed')}

## Acceptance Review

${this.formatChecklist(context.acceptanceCriteria, 'Acceptance item 1')}

## Decision

- [ ] Ready to archive`;
        return this.withFrontmatter({
            feature: context.feature,
            created,
            status: 'verifying',
            optional_steps: context.optionalSteps,
            passed_optional_steps: [],
        }, this.copy(context.documentLanguage, zh, en));
    }
    generateReviewTemplate(input) {
        const context = this.inputs.normalizeFeatureTemplateInput(input);
        const created = this.getCurrentDate();
        const projectDocs = context.projectContext.projectDocs ?? [];
        const moduleSkills = context.projectContext.moduleSkills ?? [];
        const linkedKnowledgeDocs = [
            ...(context.projectContext.apiDocs ?? []),
            ...(context.projectContext.designDocs ?? []),
            ...(context.projectContext.planningDocs ?? []),
        ];
        const affects = context.affects.length > 0 ? context.affects.join(', ') : 'TBD';
        const zh = `## Review Scope

- Change: \`${context.feature}\`
- Mode: \`${context.mode}\`
- Affects: ${context.affects.length > 0 ? context.affects.join(', ') : '待补充'}

## Context References

**Project docs:**
${this.formatReferenceList(projectDocs, '待补充')}

**Module skills:**
${this.formatReferenceList(moduleSkills, '待补充')}

**API / design / planning docs:**
${this.formatReferenceList(linkedKnowledgeDocs, '待补充')}

## Review Checklist

- [ ] 实现是否符合 proposal 中的背景、目标和范围
- [ ] 关联模块技能是否已同步
- [ ] API / 设计 / 计划文档是否需要更新
- [ ] 验证项是否覆盖主要风险
- [ ] 是否存在回归风险、边界遗漏或未决问题

## Findings

- [ ] 待补充

## Decision

- [ ] 可以继续实现
- [ ] 需要补充修改
- [ ] 可以进入验证 / 归档流程`;
        const en = `## Review Scope

- Change: \`${context.feature}\`
- Mode: \`${context.mode}\`
- Affects: ${affects}

## Context References

**Project docs:**
${this.formatReferenceList(projectDocs, 'TBD')}

**Module skills:**
${this.formatReferenceList(moduleSkills, 'TBD')}

**API / design / planning docs:**
${this.formatReferenceList(linkedKnowledgeDocs, 'TBD')}

## Review Checklist

- [ ] Implementation matches proposal background, goals, and scope
- [ ] Related module skills are updated
- [ ] API / design / planning docs are aligned
- [ ] Verification covers the main risks
- [ ] Regressions, gaps, and open questions are tracked

## Findings

- [ ] TBD

## Decision

- [ ] Continue implementation
- [ ] Require follow-up changes
- [ ] Ready for verification / archive`;
        return this.withFrontmatter({
            feature: context.feature,
            created,
            status: 'pending_review',
        }, this.copy(context.documentLanguage, zh, en));
    }
}
exports.ExecutionTemplateBuilder = ExecutionTemplateBuilder;
//# sourceMappingURL=ExecutionTemplateBuilder.js.map