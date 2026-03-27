"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHelpAction = isHelpAction;
exports.getDocsHelpText = getDocsHelpText;
exports.getSkillsHelpText = getSkillsHelpText;
exports.getSkillHelpText = getSkillHelpText;
exports.getIndexHelpText = getIndexHelpText;
exports.getDoctorHelpText = getDoctorHelpText;
exports.getWorkflowHelpText = getWorkflowHelpText;
exports.getBatchHelpText = getBatchHelpText;
exports.getChangesHelpText = getChangesHelpText;
exports.getQueueHelpText = getQueueHelpText;
exports.getRunHelpText = getRunHelpText;
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
  dorado skill status [dir]          - inspect installed Codex Dorado skill suite
  dorado skill install [dir]         - install or sync the Codex Dorado skill suite
  dorado skill status-claude [dir]   - inspect installed Claude Code Dorado skill suite
  dorado skill install-claude [dir]  - install or sync the Claude Code Dorado skill suite
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
function getDoctorHelpText() {
    return `
Doctor Commands:
  dorado doctor       - validate release integrity and install consistency
  dorado doctor help  - show doctor command help
`;
}
function getWorkflowHelpText() {
    return `
Workflow Commands:
  dorado workflow show [path]                                  - show workflow configuration for the project
  dorado workflow list-flags [path]                            - list supported workflow flags
  dorado workflow set-mode <lite|standard|full> [path]         - switch repository workflow mode
  dorado workflow set-mode <mode> [path] --force-active        - force a mode switch even when active changes exist
  dorado workflow help                                         - show workflow command help
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
function getChangesHelpText() {
    return `
Changes Commands:
  dorado changes status [path]  - show PASS/WARN/FAIL protocol status for every active change
  dorado finalize [path]        - verify and archive a completed change before commit
  dorado changes help           - show changes command help
`;
}
function getQueueHelpText() {
    return `
Queue Commands:
  dorado queue status [path]             - show queued changes in activation order
  dorado queue list [path]               - alias of queue status
  dorado queue activate <change> [path]  - activate a specific queued change
  dorado queue next [path]               - activate the next queued change
  dorado queue help                      - show queue command help
`;
}
function getRunHelpText() {
    return `
Run Commands:
  note: automation never starts implicitly; use "dorado run start" as the switch
  dorado run start [path] [executor]  - start a single-active queue run
  dorado run start [path] --executor <executor> --profile <profile>
  dorado run status [path]            - show queue state, runner stage, and current job details
  dorado run step [path]              - dispatch or poll one explicit automation step for the active profile
  dorado run resume [path]            - resume a paused or failed queue run and recover stale/failed jobs
  dorado run stop [path]              - pause the current queue run without rollback
  dorado run logs [path]              - show recent queue-run log lines and recovery history
  dorado run profile list [path]      - list runner profiles and runtime support
  dorado run profile show <id> [path] - show one runner profile
  dorado run profile validate [path]  - validate runner config and profile support
  dorado run profile set-default <id> [path] - set the default runner profile
  dorado run help                     - show run command help
`;
}
//# sourceMappingURL=subcommandHelp.js.map