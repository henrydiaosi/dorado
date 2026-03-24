"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHelpAction = isHelpAction;
exports.getDocsHelpText = getDocsHelpText;
exports.getSkillsHelpText = getSkillsHelpText;
exports.getSkillHelpText = getSkillHelpText;
exports.getIndexHelpText = getIndexHelpText;
exports.getWorkflowHelpText = getWorkflowHelpText;
exports.getBatchHelpText = getBatchHelpText;
const HELP_ACTIONS = new Set(['help', '--help', '-h']);
function isHelpAction(action) {
    return HELP_ACTIONS.has(action || '');
}
function getDocsHelpText() {
    return `
Docs Commands:
  dorado docs status [path]    - show project docs coverage and missing items
  dorado docs generate [path]  - explicitly backfill the project knowledge layer after protocol-shell init
                               - does not create business scaffold or docs/project/bootstrap-summary.md
  dorado docs help             - show docs command help
`;
}
function getSkillsHelpText() {
    return `
Skills Commands:
  dorado skills status [path]  - show layered skill coverage and index status
  dorado skills help           - show skills command help
`;
}
function getSkillHelpText() {
    return `
Skill Package Commands:
  dorado skill status [dir]          - inspect installed Codex skill files
  dorado skill install [dir]         - install or sync the Codex skill
  dorado skill status-claude [dir]   - inspect installed Claude Code skill files
  dorado skill install-claude [dir]  - install or sync the Claude Code skill
  dorado skill help                  - show skill command help
`;
}
function getIndexHelpText() {
    return `
Index Commands:
  dorado index check [path]  - inspect index presence, freshness, and stats
  dorado index build [path]  - rebuild SKILL.index.json
  dorado index help          - show index command help
`;
}
function getWorkflowHelpText() {
    return `
Workflow Commands:
  dorado workflow show [path]        - show workflow configuration for the project
  dorado workflow list-flags [path]  - list supported workflow flags
  dorado workflow help               - show workflow command help
`;
}
function getBatchHelpText() {
    return `
Batch Commands:
  dorado batch export [path]  - export change data in batch
  dorado batch stats [path]   - show aggregated change statistics
  dorado batch help           - show batch command help
`;
}
//# sourceMappingURL=subcommandHelp.js.map