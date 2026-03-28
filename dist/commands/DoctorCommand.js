"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorCommand = void 0;
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const subcommandHelp_1 = require("../utils/subcommandHelp");
const BaseCommand_1 = require("./BaseCommand");
class DoctorCommand extends BaseCommand_1.BaseCommand {
    async execute(action) {
        if ((0, subcommandHelp_1.isHelpAction)(action)) {
            this.info((0, subcommandHelp_1.getDoctorHelpText)());
            return;
        }
        const packageRoot = path_1.default.resolve(__dirname, '..', '..');
        const scriptPath = path_1.default.join(packageRoot, 'scripts', 'release-doctor.js');
        const result = (0, child_process_1.spawnSync)(process.execPath, [scriptPath], {
            cwd: packageRoot,
            encoding: 'utf8',
            shell: false,
        });
        if (result.stdout) {
            process.stdout.write(result.stdout);
        }
        if (result.stderr) {
            process.stderr.write(result.stderr);
        }
        if (result.status !== 0) {
            throw new Error(`Doctor reported integrity failures (exit ${result.status ?? 1})`);
        }
    }
}
exports.DoctorCommand = DoctorCommand;
//# sourceMappingURL=DoctorCommand.js.map