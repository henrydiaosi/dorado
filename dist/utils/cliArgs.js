"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDashboardArgs = parseDashboardArgs;
exports.getDashboardHelpText = getDashboardHelpText;
const HELP_FLAGS = new Set(['help', '--help', '-h']);
function parseDashboardArgs(args) {
    let action = 'start';
    let projectPath;
    let port;
    let autoOpen = true;
    const values = [...args];
    if (values[0] && !values[0].startsWith('-')) {
        action = values.shift() || 'start';
    }
    if (HELP_FLAGS.has(action)) {
        return { action: 'help', projectPath, port, autoOpen };
    }
    for (let index = 0; index < values.length; index += 1) {
        const value = values[index];
        if (HELP_FLAGS.has(value)) {
            return { action: 'help', projectPath, port, autoOpen };
        }
        if (value === '--no-open') {
            autoOpen = false;
            continue;
        }
        if (value === '--port') {
            const nextValue = values[index + 1];
            if (!nextValue) {
                throw new Error('Missing value for --port');
            }
            const parsedPort = Number(nextValue);
            if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
                throw new Error(`Invalid port: ${nextValue}`);
            }
            port = parsedPort;
            index += 1;
            continue;
        }
        if (!value.startsWith('-') && !projectPath) {
            projectPath = value;
            continue;
        }
        throw new Error(`Unknown dashboard option: ${value}`);
    }
    return {
        action,
        projectPath,
        port,
        autoOpen,
    };
}
function getDashboardHelpText() {
    return `
Dashboard Commands:
  dorado dashboard start [path] [--port <port>] [--no-open]
                              - start dashboard for a project directory
  dorado dashboard stop       - stop the in-process dashboard
  dorado dashboard help       - show dashboard command help
`;
}
//# sourceMappingURL=cliArgs.js.map