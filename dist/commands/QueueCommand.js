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
exports.QueueCommand = void 0;
const path = __importStar(require("path"));
const services_1 = require("../services");
const subcommandHelp_1 = require("../utils/subcommandHelp");
const BaseCommand_1 = require("./BaseCommand");
class QueueCommand extends BaseCommand_1.BaseCommand {
    async execute(action = 'status', arg1, arg2) {
        const normalizedAction = action || 'status';
        if ((0, subcommandHelp_1.isHelpAction)(normalizedAction)) {
            console.log((0, subcommandHelp_1.getQueueHelpText)());
            return;
        }
        switch (normalizedAction) {
            case 'status':
            case 'list':
                await this.showStatus(arg1);
                return;
            case 'activate':
                await this.activate(arg1, arg2);
                return;
            case 'next':
                await this.activateNext(arg1);
                return;
            default:
                throw new Error(`Unknown queue action: ${normalizedAction}`);
        }
    }
    async showStatus(rootDir) {
        const targetDir = path.resolve(rootDir || process.cwd());
        const queuedChanges = await services_1.services.projectService.getQueuedChanges(targetDir);
        console.log('\nQueued Changes');
        console.log('==============\n');
        console.log(`Total queued: ${queuedChanges.length}\n`);
        if (queuedChanges.length === 0) {
            console.log('No queued changes.\n');
            return;
        }
        queuedChanges.forEach((change, index) => {
            console.log(`${index + 1}. ${change.name}`);
            console.log(`   Path: ${change.path}`);
            console.log(`   Status: ${change.status}`);
            console.log(`   Current step: ${change.currentStep}`);
            console.log(`   Queued at: ${change.queuedAt ?? 'unknown'}`);
            console.log(`   Source: ${change.source ?? 'unknown'}`);
            console.log('');
        });
    }
    async activate(changeName, rootDir) {
        if (!changeName) {
            throw new Error('Queue activate requires a change name.');
        }
        const targetDir = path.resolve(rootDir || process.cwd());
        const activatedPath = await services_1.services.projectService.activateQueuedChange(targetDir, changeName, 'queue');
        this.success(`Queued change ${changeName} activated at ${activatedPath}`);
    }
    async activateNext(rootDir) {
        const targetDir = path.resolve(rootDir || process.cwd());
        const activatedNext = await services_1.services.projectService.activateNextQueuedChange(targetDir, 'queue');
        if (!activatedNext) {
            this.success('No queued changes to activate.');
            return;
        }
        this.success(`Activated next queued change: ${activatedNext.name}`);
    }
}
exports.QueueCommand = QueueCommand;
//# sourceMappingURL=QueueCommand.js.map