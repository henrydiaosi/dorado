"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsCommand = void 0;
const services_1 = require("../services");
const subcommandHelp_1 = require("../utils/subcommandHelp");
const BaseCommand_1 = require("./BaseCommand");
class DocsCommand extends BaseCommand_1.BaseCommand {
    async execute(action = 'status', projectPath) {
        try {
            if ((0, subcommandHelp_1.isHelpAction)(action)) {
                this.info((0, subcommandHelp_1.getDocsHelpText)());
                return;
            }
            const targetPath = projectPath || process.cwd();
            switch (action) {
                case 'status': {
                    const docs = await services_1.services.projectService.getDocsStatus(targetPath);
                    console.log('\nDocs Status');
                    console.log('===========\n');
                    console.log(`Coverage: ${docs.coverage}% (${docs.existing}/${docs.total})`);
                    console.log(`Updated: ${docs.updatedAt ?? 'unknown'}`);
                    console.log('\nTracked docs:');
                    for (const item of docs.items) {
                        console.log(`  ${item.exists ? '✓' : '✗'} ${item.path}`);
                    }
                    if (docs.apiDocs.length > 0) {
                        console.log('\nAPI docs:');
                        for (const item of docs.apiDocs) {
                            console.log(`  ✓ ${item.path}`);
                        }
                    }
                    if (docs.designDocs.length > 0) {
                        console.log('\nDesign docs:');
                        for (const item of docs.designDocs) {
                            console.log(`  ✓ ${item.path}`);
                        }
                    }
                    if (docs.planningDocs.length > 0) {
                        console.log('\nPlanning docs:');
                        for (const item of docs.planningDocs) {
                            console.log(`  ✓ ${item.path}`);
                        }
                    }
                    if (docs.missingRequired.length > 0) {
                        console.log('\nMissing required docs:');
                        for (const item of docs.missingRequired) {
                            console.log(`  - ${item}`);
                        }
                    }
                    if (docs.missingRecommended.length > 0) {
                        console.log('\nMissing recommended docs:');
                        for (const item of docs.missingRecommended) {
                            console.log(`  - ${item}`);
                        }
                    }
                    console.log('');
                    break;
                }
                default:
                    this.info((0, subcommandHelp_1.getDocsHelpText)());
            }
        }
        catch (error) {
            this.error(`Docs command failed: ${error}`);
            throw error;
        }
    }
}
exports.DocsCommand = DocsCommand;
//# sourceMappingURL=DocsCommand.js.map