"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveCommand = void 0;
const path = __importStar(require("path"));
const services_1 = require("../services");
const BaseCommand_1 = require("./BaseCommand");
class ArchiveCommand extends BaseCommand_1.BaseCommand {
    async execute(featurePath, options = {}) {
        await this.run(featurePath, options);
    }
    async run(featurePath, options = {}) {
        try {
            const targetPath = path.resolve(featurePath || process.cwd());
            const checkOnly = options.checkOnly === true;
            this.logger.info(`${checkOnly ? 'Checking archive readiness' : 'Archiving change'} at ${targetPath}`);
            const { result } = await services_1.services.projectService.checkArchiveReadiness(targetPath);
            console.log('\nArchive Gate Check:');
            console.log('===================\n');
            for (const check of result.checks) {
                const icon = check.passed ? 'PASS' : 'FAIL';
                console.log(`${icon} ${check.name}`);
                console.log(`  ${check.message}\n`);
            }
            if (result.blockers.length > 0) {
                console.log('Blockers:');
                result.blockers.forEach(blocker => {
                    console.log(`  - ${blocker}`);
                });
                console.log();
            }
            if (result.warnings.length > 0) {
                console.log('Warnings:');
                result.warnings.forEach(warning => {
                    console.log(`  - ${warning}`);
                });
                console.log();
            }
            console.log('='.repeat(21) + '\n');
            if (result.canArchive) {
                if (checkOnly) {
                    this.success('Change is ready to archive');
                    return;
                }
                const archivePath = await services_1.services.projectService.archiveChange(targetPath);
                this.success(`Change archived to ${archivePath}`);
                return archivePath;
            }
            else {
                this.error('Change cannot be archived. Please resolve blockers.');
                process.exit(1);
            }
        }
        catch (error) {
            this.error(`Archive check failed: ${error}`);
            throw error;
        }
    }
}
exports.ArchiveCommand = ArchiveCommand;
//# sourceMappingURL=ArchiveCommand.js.map