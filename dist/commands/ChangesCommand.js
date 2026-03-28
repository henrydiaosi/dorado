"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangesCommand = void 0;
const services_1 = require("../services");
const subcommandHelp_1 = require("../utils/subcommandHelp");
const BaseCommand_1 = require("./BaseCommand");
class ChangesCommand extends BaseCommand_1.BaseCommand {
    async execute(action = 'status', projectPath) {
        try {
            if ((0, subcommandHelp_1.isHelpAction)(action)) {
                this.info((0, subcommandHelp_1.getChangesHelpText)());
                return;
            }
            if (action !== 'status') {
                throw new Error(`Unknown changes action: ${action}`);
            }
            const targetPath = projectPath || process.cwd();
            const report = await services_1.services.projectService.getActiveChangeStatusReport(targetPath);
            const queuedChanges = await services_1.services.projectService.getQueuedChanges(targetPath);
            console.log('\nActive Change Status');
            console.log('====================\n');
            console.log(`Project: ${targetPath}`);
            console.log(`Active changes: ${report.totalActiveChanges}`);
            console.log(`Queued changes: ${queuedChanges.length}`);
            console.log(`Summary: PASS ${report.totals.pass} | WARN ${report.totals.warn} | FAIL ${report.totals.fail}`);
            if (report.changes.length === 0) {
                console.log('\nNo active changes.\n');
                if (queuedChanges.length > 0) {
                    console.log('Queued changes are waiting for activation:');
                    for (const change of queuedChanges) {
                        console.log(`  - ${change.name} [${change.status}]`);
                    }
                    console.log('\nRun "dorado queue status" or "dorado queue next" to continue.\n');
                }
                return;
            }
            for (const change of report.changes) {
                console.log('');
                console.log(`${change.summaryStatus.toUpperCase()} ${change.name} [${change.status}] ${change.progress}%`);
                console.log(`  Path: ${change.path}`);
                console.log(`  Current step: ${change.currentStep}`);
                console.log(`  Archive ready: ${change.archiveReady ? 'yes' : 'no'}`);
                const notableChecks = change.checks.filter(check => check.status !== 'pass');
                if (notableChecks.length === 0) {
                    console.log('  Notes: protocol files and checklists are aligned');
                    continue;
                }
                for (const check of notableChecks) {
                    console.log(`  ${check.status.toUpperCase()} ${check.name}: ${check.message}`);
                }
            }
            console.log('');
            if (queuedChanges.length > 0) {
                console.log(`Queued changes waiting: ${queuedChanges.length}`);
                console.log('Run "dorado queue status" to inspect them.\n');
            }
        }
        catch (error) {
            this.error(`Changes command failed: ${error}`);
            throw error;
        }
    }
}
exports.ChangesCommand = ChangesCommand;
//# sourceMappingURL=ChangesCommand.js.map