#!/usr/bin/env node

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { spawnSync } = require('child_process');

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'changes', 'for-ai']);
const INDEX_FILE = 'SKILL.index.json';
const SKILL_FILE = 'SKILL.md';
const OPTIONAL_STEP_PROTOCOL_FILES = {
  code_review: 'review.md',
  design_doc: 'design.md',
  plan_doc: 'plan.md',
  security_review: 'security.md',
  adr: 'adr.md',
  db_change_doc: 'db-change.md',
  api_change_doc: 'api-change.md',
};

async function main() {
  try {
    const action = process.argv[2] || 'build';
    const rootDir = process.cwd();

    switch (action) {
      case 'build':
        await writeIndex(rootDir, { silent: false });
        break;
      case 'hook-check':
        process.exitCode = await runHookCheck(rootDir, process.argv[3] || 'pre-commit');
        break;
      default:
        console.error(`[dorado] unknown action: ${action}`);
        process.exitCode = 1;
    }
  } catch (error) {
    console.error(`[dorado] ${error.message}`);
    process.exitCode = 1;
  }
}

async function runHookCheck(rootDir, event) {
  const config = await loadHookConfig(rootDir);
  if (event === 'pre-commit' && config.preCommit === false) {
    return 0;
  }
  if (event === 'post-merge' && config.postMerge === false) {
    return 0;
  }

  const activeChanges = await listActiveChanges(rootDir);
  if (activeChanges.length === 0) {
    console.log('[dorado] no active changes, hook check skipped');
    return 0;
  }

  const stagedFiles = event === 'pre-commit' ? getStagedFiles(rootDir) : [];
  if (event === 'pre-commit') {
    const relevantPaths = stagedFiles.filter(isHookRelevantPath);
    if (relevantPaths.length === 0) {
      console.log('[dorado] no staged Dorado files, hook check skipped');
      return 0;
    }
  }

  let shouldBlock = false;
  const shouldCheckIndex =
    config.indexCheck !== 'off' &&
    (event === 'post-merge' || stagedFiles.some(filePath => isIndexRelevantPath(filePath)));

  if (shouldCheckIndex) {
    const indexStatus = await computeIndexStatus(rootDir);
    if (indexStatus.stale) {
      console.log('[dorado] SKILL.index.json is stale');
      console.log('[dorado] run "dorado index build" or "node build-index-auto.js" to refresh it');
      if (event === 'pre-commit' && config.indexCheck === 'error') {
        shouldBlock = true;
      }
    } else {
      console.log('[dorado] SKILL.index.json is up to date');
    }
  }

  if (event === 'pre-commit' && config.changeCheck !== 'off') {
    const affectedChanges = collectAffectedChanges(stagedFiles, activeChanges);
    if (affectedChanges.length === 0) {
      console.log('[dorado] no active change files staged, change summary skipped');
    } else {
      console.log('[dorado] active change summary');
      for (const changeName of affectedChanges) {
        const summary = await buildChangeSummary(rootDir, changeName, config);
        if (!summary) {
          continue;
        }

        console.log(
          `${summary.summaryStatus.toUpperCase()} ${summary.name} [${summary.status}] ${summary.progress}%`
        );

        const issues = summary.checks.filter(check => check.status !== 'pass');
        if (issues.length === 0) {
          console.log('  protocol files and checklists are aligned');
        } else {
          for (const issue of issues) {
            console.log(`  ${issue.status.toUpperCase()} ${issue.name}: ${issue.message}`);
          }
        }

        if (summary.summaryStatus !== 'pass' && config.changeCheck === 'error') {
          shouldBlock = true;
        }
      }
    }
  }

  if (shouldBlock) {
    console.log('[dorado] hook blocked by current hook policy');
    return 1;
  }

  return 0;
}

async function writeIndex(rootDir, options) {
  const indexPath = path.join(rootDir, INDEX_FILE);
  const nextIndex = await buildIndex(rootDir);
  const currentIndex = await readJsonIfExists(indexPath);

  if (currentIndex && isSameIndex(currentIndex, nextIndex)) {
    if (!options.silent) {
      console.log('[dorado] SKILL.index.json already up to date');
      printIndexStats(currentIndex);
    }
    return { changed: false, index: currentIndex };
  }

  const output = {
    ...nextIndex,
    generated: new Date().toISOString(),
  };
  await fsp.writeFile(indexPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  if (!options.silent) {
    console.log('[dorado] SKILL.index.json rebuilt');
    printIndexStats(output);
  }

  return { changed: true, index: output };
}

async function computeIndexStatus(rootDir) {
  const currentIndex = await readJsonIfExists(path.join(rootDir, INDEX_FILE));
  const nextIndex = await buildIndex(rootDir);
  return {
    stale: !currentIndex || !isSameIndex(currentIndex, nextIndex),
    currentIndex,
    nextIndex,
  };
}

async function buildIndex(rootDir) {
  const modules = {};
  const tagIndex = {};
  let totalFiles = 0;
  let totalSections = 0;

  await walk(rootDir, async fullPath => {
    totalFiles += 1;
    const relativePath = normalizePath(path.relative(rootDir, fullPath));
    const content = await fsp.readFile(fullPath, 'utf8');
    const parsed = parseSkillFile(content);
    const moduleName = parsed.frontmatter.name || relativePath;
    const title = parsed.frontmatter.title || parsed.frontmatter.name || relativePath;
    const tags = Array.isArray(parsed.frontmatter.tags) ? parsed.frontmatter.tags : [];

    totalSections += Object.keys(parsed.sections).length;
    modules[moduleName] = {
      file: relativePath,
      title,
      tags,
      sections: parsed.sections,
    };

    for (const tag of tags) {
      if (!tagIndex[tag]) {
        tagIndex[tag] = [];
      }
      tagIndex[tag].push(moduleName);
    }
  });

  for (const tag of Object.keys(tagIndex).sort((left, right) => left.localeCompare(right))) {
    tagIndex[tag] = tagIndex[tag].sort((left, right) => left.localeCompare(right));
  }

  const activeChanges = await listActiveChanges(rootDir);
  return {
    version: '1.0',
    generated: new Date().toISOString(),
    git_commit: null,
    active_changes: activeChanges,
    stats: {
      totalFiles,
      totalModules: Object.keys(modules).length,
      totalSections,
    },
    modules,
    tagIndex,
  };
}

async function walk(currentDir, onSkillFile) {
  const entries = (await fsp.readdir(currentDir, { withFileTypes: true })).sort((left, right) =>
    left.name.localeCompare(right.name)
  );

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        await walk(fullPath, onSkillFile);
      }
      continue;
    }

    if (entry.name === SKILL_FILE) {
      await onSkillFile(fullPath);
    }
  }
}

async function buildChangeSummary(rootDir, changeName, config) {
  const featureDir = path.join(rootDir, 'changes', 'active', changeName);
  const state = await readJsonIfExists(path.join(featureDir, 'state.json'));
  if (!state) {
    return null;
  }

  const proposalPath = path.join(featureDir, 'proposal.md');
  const tasksPath = path.join(featureDir, 'tasks.md');
  const verificationPath = path.join(featureDir, 'verification.md');
  const proposalExists = await exists(proposalPath);
  const tasksExists = await exists(tasksPath);
  const verificationExists = await exists(verificationPath);

  const checks = [
    {
      name: 'proposal.md',
      status: proposalExists ? 'pass' : 'fail',
      message: proposalExists ? 'Proposal file exists' : 'proposal.md is missing',
    },
    {
      name: 'tasks.md',
      status: tasksExists ? 'pass' : 'fail',
      message: tasksExists ? 'Tasks file exists' : 'tasks.md is missing',
    },
    {
      name: 'verification.md',
      status: verificationExists ? 'pass' : 'fail',
      message: verificationExists ? 'Verification file exists' : 'verification.md is missing',
    },
  ];

  let flags = [];
  let activatedSteps = [];
  if (proposalExists) {
    const proposal = parseFrontmatter(await fsp.readFile(proposalPath, 'utf8'));
    flags = ensureArray(proposal.data.flags);
    activatedSteps = getActivatedSteps(config.workflow, flags);
    const unsupportedFlags = flags.filter(
      flag => !ensureArray(config.workflow?.feature_flags?.supported).includes(flag)
    );

    checks.push({
      name: 'proposal.flags',
      status: 'pass',
      message:
        activatedSteps.length > 0
          ? `Activated optional steps: ${activatedSteps.join(', ')}`
          : 'No optional steps activated',
    });

    if (unsupportedFlags.length > 0) {
      checks.push({
        name: 'proposal.unsupported_flags',
        status: 'warn',
        message: `Unsupported flags: ${unsupportedFlags.join(', ')}`,
      });
    }
  }

  if (tasksExists) {
    const tasks = parseFrontmatter(await fsp.readFile(tasksPath, 'utf8'));
    const optionalSteps = ensureArray(tasks.data.optional_steps);
    const missing = activatedSteps.filter(step => !optionalSteps.includes(step));
    const checklistComplete = !/- \[ \]/.test(tasks.body);
    checks.push({
      name: 'tasks.md.optional_steps',
      status: missing.length === 0 ? 'pass' : 'fail',
      message:
        missing.length === 0
          ? 'All activated optional steps are present in tasks.md'
          : `Missing optional steps in tasks.md: ${missing.join(', ')}`,
    });
    checks.push({
      name: 'tasks.md.checklist',
      status: checklistComplete ? 'pass' : 'warn',
      message: checklistComplete ? 'tasks.md checklist is complete' : 'tasks.md still has unchecked items',
    });
  }

  if (verificationExists) {
    const verification = parseFrontmatter(await fsp.readFile(verificationPath, 'utf8'));
    const optionalSteps = ensureArray(verification.data.optional_steps);
    const missing = activatedSteps.filter(step => !optionalSteps.includes(step));
    const checklistComplete = !/- \[ \]/.test(verification.body);
    checks.push({
      name: 'verification.md.optional_steps',
      status: missing.length === 0 ? 'pass' : 'fail',
      message:
        missing.length === 0
          ? 'All activated optional steps are present in verification.md'
          : `Missing optional steps in verification.md: ${missing.join(', ')}`,
    });
    checks.push({
      name: 'verification.md.checklist',
      status: checklistComplete ? 'pass' : 'warn',
      message:
        checklistComplete
          ? 'verification.md checklist is complete'
          : 'verification.md still has unchecked items',
    });
  }

  for (const step of activatedSteps) {
    const fileName = OPTIONAL_STEP_PROTOCOL_FILES[step];
    if (!fileName) {
      continue;
    }

    const filePath = path.join(featureDir, fileName);
    const fileExists = await exists(filePath);
    checks.push({
      name: fileName,
      status: fileExists ? 'pass' : 'fail',
      message: fileExists
        ? `${fileName} exists for activated optional step ${step}`
        : `${fileName} is required when ${step} is activated`,
    });

    if (fileExists) {
      const document = parseFrontmatter(await fsp.readFile(filePath, 'utf8'));
      const checklistComplete = !/- \[ \]/.test(document.body);
      checks.push({
        name: `${fileName}.checklist`,
        status: checklistComplete ? 'pass' : 'warn',
        message: checklistComplete
          ? `${fileName} checklist is complete`
          : `${fileName} still has unchecked items`,
      });
    }
  }

  const hasProtocolIssues = checks.some(check => check.status !== 'pass');
  if (state.status === 'archived') {
    checks.push({
      name: 'archive.location',
      status: 'fail',
      message: 'state.json.status is archived but the change is still under changes/active',
    });
  } else if (state.status === 'ready_to_archive' && !hasProtocolIssues) {
    checks.push({
      name: 'archive.pending',
      status: 'warn',
      message: `Change is ready to archive. Run "dorado archive changes/active/${changeName}" before commit.`,
    });
  }

  const failCount = checks.filter(check => check.status === 'fail').length;
  const warnCount = checks.filter(check => check.status === 'warn').length;

  return {
    name: state.feature || changeName,
    status: state.status || 'draft',
    progress: calculateProgress(state),
    summaryStatus: failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass',
    checks,
  };
}

function calculateProgress(state) {
  const completed = Array.isArray(state.completed) ? state.completed.length : 0;
  const pending = Array.isArray(state.pending) ? state.pending.length : 0;
  const total = completed + pending;
  if (total === 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

function collectAffectedChanges(stagedFiles, activeChanges) {
  const affected = new Set();

  for (const filePath of stagedFiles) {
    const match = filePath.match(/^changes\/active\/([^/]+)\//);
    if (match) {
      affected.add(match[1]);
    }
  }

  if (affected.size === 0 && stagedFiles.includes('.skillrc')) {
    for (const changeName of activeChanges) {
      affected.add(changeName);
    }
  }

  return Array.from(affected).sort((left, right) => left.localeCompare(right));
}

function isHookRelevantPath(filePath) {
  return filePath === '.skillrc' || isIndexRelevantPath(filePath);
}

function isIndexRelevantPath(filePath) {
  return filePath === SKILL_FILE || /(^|\/)SKILL\.md$/.test(filePath) || filePath.startsWith('changes/active/');
}

async function listActiveChanges(rootDir) {
  const activeDir = path.join(rootDir, 'changes', 'active');
  if (!(await exists(activeDir))) {
    return [];
  }

  return (await fsp.readdir(activeDir, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function loadHookConfig(rootDir) {
  const config = (await readJsonIfExists(path.join(rootDir, '.skillrc'))) || {};
  const hooks = config.hooks || {};
  const fallback = hooks['spec-check'] || 'error';
  const normalized = {
    preCommit: hooks['pre-commit'] !== false,
    postMerge: hooks['post-merge'] !== false,
    changeCheck: hooks['change-check'] || fallback,
    indexCheck: hooks['index-check'] || fallback,
  };
  const legacyWarnDefaults =
    config.version === '3.0' &&
    config.mode !== 'lite' &&
    normalized.preCommit &&
    normalized.postMerge &&
    fallback === 'warn' &&
    normalized.changeCheck === 'warn' &&
    normalized.indexCheck === 'warn';

  return {
    preCommit: normalized.preCommit,
    postMerge: normalized.postMerge,
    changeCheck: legacyWarnDefaults ? 'error' : normalized.changeCheck,
    indexCheck: legacyWarnDefaults ? 'error' : normalized.indexCheck,
    workflow: config.workflow || {},
  };
}

function getActivatedSteps(workflowConfig, flags) {
  const optionalSteps = workflowConfig && workflowConfig.optional_steps ? workflowConfig.optional_steps : {};
  const activated = [];

  for (const [stepName, stepConfig] of Object.entries(optionalSteps)) {
    if (!stepConfig || stepConfig.enabled === false) {
      continue;
    }

    const when = ensureArray(stepConfig.when);
    if (when.some(flag => flags.includes(flag))) {
      activated.push(stepName);
    }
  }

  return activated.sort((left, right) => left.localeCompare(right));
}

function getStagedFiles(rootDir) {
  const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    cwd: rootDir,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    return [];
  }

  return result.stdout
    .split(/\r?\n/)
    .map(item => normalizePath(item.trim()))
    .filter(Boolean);
}

function parseSkillFile(content) {
  const parsed = parseFrontmatter(content);
  return {
    frontmatter: {
      name: typeof parsed.data.name === 'string' ? parsed.data.name : undefined,
      title: typeof parsed.data.title === 'string' ? parsed.data.title : undefined,
      tags: ensureArray(parsed.data.tags),
    },
    sections: extractSections(parsed.body),
  };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { data: {}, body: content };
  }

  const data = {};
  const lines = match[1].split(/\r?\n/);
  let currentKey = null;

  for (const line of lines) {
    if (/^\s*-\s+/.test(line) && currentKey) {
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = [];
      }
      data[currentKey].push(parseValue(line.replace(/^\s*-\s+/, '').trim()));
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) {
      currentKey = null;
      continue;
    }

    const key = keyMatch[1];
    const rawValue = keyMatch[2].trim();
    data[key] = parseValue(rawValue);
    currentKey = Array.isArray(data[key]) && rawValue === '' ? key : null;
  }

  return {
    data,
    body: content.slice(match[0].length),
  };
}

function parseValue(rawValue) {
  if (rawValue === '') {
    return [];
  }
  if (rawValue === '[]') {
    return [];
  }
  if (rawValue === 'true') {
    return true;
  }
  if (rawValue === 'false') {
    return false;
  }
  if (/^\[(.*)\]$/.test(rawValue)) {
    const inner = rawValue.slice(1, -1).trim();
    if (!inner) {
      return [];
    }

    return inner
      .split(',')
      .map(item => stripQuotes(item.trim()))
      .filter(Boolean);
  }

  return stripQuotes(rawValue);
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, '');
}

function extractSections(content) {
  const sections = {};
  const matches = [];
  const headingRegex = /^(#{1,6})\s+(.+?)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    matches.push({
      level: match[1].length,
      title: match[2].trim(),
      start: match.index,
    });
  }

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    sections[current.title] = {
      level: current.level,
      title: current.title,
      start: current.start,
      end: next ? next.start : content.length,
    };
  }

  return sections;
}

function ensureArray(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

function isSameIndex(left, right) {
  return JSON.stringify(stripVolatileFields(left)) === JSON.stringify(stripVolatileFields(right));
}

function stripVolatileFields(index) {
  const clone = JSON.parse(JSON.stringify(index));
  delete clone.generated;
  return clone;
}

function printIndexStats(index) {
  console.log(
    `[dorado] files ${index.stats.totalFiles}, modules ${index.stats.totalModules}, sections ${index.stats.totalSections}`
  );
  console.log(`[dorado] active changes: ${index.active_changes.join(', ') || 'none'}`);
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

async function exists(targetPath) {
  try {
    await fsp.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonIfExists(targetPath) {
  if (!(await exists(targetPath))) {
    return null;
  }

  return JSON.parse(await fsp.readFile(targetPath, 'utf8'));
}

main();
