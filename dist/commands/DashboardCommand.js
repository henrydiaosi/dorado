"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardCommand = void 0;
const server_js_1 = require("../dashboard/server.js");
const services_1 = require("../services");
const cliArgs_1 = require("../utils/cliArgs");
const BaseCommand_1 = require("./BaseCommand");
class DashboardCommand extends BaseCommand_1.BaseCommand {
    constructor() {
        super(...arguments);
        this.dashboardServer = null;
    }
    async execute(action, options = {}) {
        try {
            const resolvedAction = action || 'start';
            switch (resolvedAction) {
                case 'start': {
                    await this.startDashboard(options);
                    break;
                }
                case 'stop': {
                    await this.stopDashboard();
                    break;
                }
                case 'help': {
                    this.info((0, cliArgs_1.getDashboardHelpText)());
                    break;
                }
                default:
                    this.info((0, cliArgs_1.getDashboardHelpText)());
            }
        }
        catch (error) {
            this.error(`Dashboard command failed: ${error}`);
            throw error;
        }
    }
    async startDashboard(options) {
        const projectPath = options.projectPath || process.cwd();
        const port = options.port ?? 3001;
        const autoOpen = options.autoOpen !== false;
        const structure = await services_1.services.projectService.detectProjectStructure(projectPath);
        console.log('Starting Dorado Dashboard...\n');
        console.log(`Project path: ${projectPath}`);
        console.log(`Structure level: ${structure.level}`);
        console.log(`Initialized: ${structure.initialized ? 'yes' : 'no'}`);
        if (!structure.initialized) {
            console.log('Next: GUI bootstrap will initialize this directory.');
        }
        else if (structure.level !== 'full') {
            console.log('Next: GUI will guide you to complete the project knowledge layer.');
        }
        else {
            console.log('Next: GUI will open the project dashboard and active-change flow.');
        }
        console.log('');
        this.dashboardServer = new server_js_1.DashboardServer({
            port,
            projectPath,
            autoOpen,
        });
        await this.dashboardServer.start();
        process.on('SIGINT', () => void this.handleShutdown());
        process.on('SIGTERM', () => void this.handleShutdown());
    }
    async stopDashboard() {
        console.log('Stopping Dashboard...');
        if (this.dashboardServer) {
            await this.dashboardServer.stop();
            console.log('Dashboard stopped.');
        }
    }
    async handleShutdown() {
        console.log('\nShutting down Dashboard...');
        await this.stopDashboard();
        process.exit(0);
    }
}
exports.DashboardCommand = DashboardCommand;
//# sourceMappingURL=DashboardCommand.js.map