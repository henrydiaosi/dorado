"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCommand = void 0;
const services_1 = require("../services");
const BaseCommand_1 = require("./BaseCommand");
class StatusCommand extends BaseCommand_1.BaseCommand {
    async execute(projectPath) {
        try {
            const targetPath = projectPath || process.cwd();
            this.logger.info(`Getting status for ${targetPath}`);
            const [structure, summary, docs, skills, execution, changes] = await Promise.all([
                services_1.services.projectService.detectProjectStructure(targetPath),
                services_1.services.projectService.getProjectSummary(targetPath),
                services_1.services.projectService.getDocsStatus(targetPath),
                services_1.services.projectService.getSkillsStatus(targetPath),
                services_1.services.projectService.getExecutionStatus(targetPath),
                services_1.services.projectService.getActiveChangeStatusReport(targetPath),
            ]);
            console.log('\nProject Status');
            console.log('==============\n');
            console.log(`Name: ${summary.name}`);
            console.log(`Path: ${summary.path}`);
            console.log(`Mode: ${summary.mode ?? 'uninitialized'}`);
            console.log(`Initialized: ${summary.initialized ? 'yes' : 'no'}`);
            console.log(`Structure Level: ${summary.structureLevel}`);
            console.log(`Active Changes: ${summary.activeChangeCount}`);
            console.log('\nStructure');
            console.log('---------');
            console.log(`Missing required: ${structure.missingRequired.length}`);
            if (structure.missingRequired.length > 0) {
                for (const item of structure.missingRequired) {
                    console.log(`  - ${item}`);
                }
            }
            console.log(`Missing recommended: ${structure.missingRecommended.length}`);
            if (structure.missingRecommended.length > 0) {
                for (const item of structure.missingRecommended.slice(0, 10)) {
                    console.log(`  - ${item}`);
                }
            }
            console.log('\nUpgrade suggestions:');
            for (const suggestion of structure.upgradeSuggestions) {
                console.log(`  - ${suggestion.title}: ${suggestion.description}`);
                for (const item of suggestion.paths.slice(0, 5)) {
                    console.log(`      ${item}`);
                }
            }
            console.log('\nDocs');
            console.log('----');
            console.log(`Coverage: ${docs.coverage}% (${docs.existing}/${docs.total})`);
            console.log(`Missing required docs: ${docs.missingRequired.length}`);
            console.log('\nSkills');
            console.log('------');
            console.log(`Skill files: ${skills.existing}/${skills.totalSkillFiles}`);
            console.log(`Skill index: ${skills.skillIndex.exists ? 'present' : 'missing'}`);
            if (skills.skillIndex.stats) {
                console.log(`Index stats: ${skills.skillIndex.stats.totalFiles} files, ${skills.skillIndex.stats.totalSections} sections`);
            }
            console.log('\nExecution');
            console.log('---------');
            console.log(`Active changes: ${execution.totalActiveChanges}`);
            for (const [status, count] of Object.entries(execution.byStatus)) {
                console.log(`  ${status}: ${count}`);
            }
            console.log(`Protocol summary: PASS ${changes.totals.pass} | WARN ${changes.totals.warn} | FAIL ${changes.totals.fail}`);
            if (execution.activeChanges.length > 0) {
                console.log('\nCurrent changes:');
                for (const change of execution.activeChanges) {
                    console.log(`  - ${change.name} [${change.status}] ${change.progress}%`);
                }
            }
            console.log('\nRecommended Next Step');
            console.log('---------------------');
            for (const step of this.getRecommendedNextSteps(targetPath, structure, execution)) {
                console.log(`  - ${step}`);
            }
            console.log('');
        }
        catch (error) {
            this.error(`Failed to get status: ${error}`);
            throw error;
        }
    }
    getRecommendedNextSteps(projectPath, structure, execution) {
        if (!structure.initialized) {
            return [
                `Run "dorado init ${projectPath}" to initialize the Dorado protocol shell.`,
                `Or run "dorado dashboard start ${projectPath}" if you want to inspect the directory in GUI first.`,
            ];
        }
        if (structure.level !== 'full') {
            return [
                'The Dorado protocol shell is ready, but the project knowledge layer is still partial.',
                `Run "dorado docs generate ${projectPath}" to backfill the default project knowledge layer. This still will not apply business scaffold or generate docs/project/bootstrap-summary.md.`,
                'Use an explicit bootstrap commit flow later if you want preset-driven scaffold output and a recorded bootstrap summary.',
            ];
        }
        if (execution.totalActiveChanges === 0) {
            return [
                `Run "dorado dashboard start ${projectPath}" to create the first change through the GUI.`,
                `Or run "dorado new <change-name> ${projectPath}" if you want to create the first change from CLI.`,
            ];
        }
        const currentChange = execution.activeChanges[0];
        return [
            `Continue the active change "${currentChange.name}" from the dashboard or with "dorado progress ${projectPath}/changes/active/${currentChange.name}".`,
            `Run "dorado verify ${projectPath}/changes/active/${currentChange.name}" before trying to archive it.`,
        ];
    }
}
exports.StatusCommand = StatusCommand;
//# sourceMappingURL=StatusCommand.js.map