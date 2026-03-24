#!/usr/bin/env node

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const cliPath = path.join(rootDir, 'dist', 'cli.js');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || rootDir,
    encoding: 'utf8',
    shell: false,
  });

  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}\n${output}`);
  }

  return output;
}

function assertContains(output, expected, label) {
  if (!output.includes(expected)) {
    throw new Error(`Expected ${label} to include "${expected}"\nActual output:\n${output}`);
  }
}

async function main() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dorado-release-smoke-'));
  const tempSkillDir = path.join(tempDir, 'codex-skill');
  const tempClaudeSkillDir = path.join(tempDir, 'claude-skill');

  try {
    console.log(`[release:smoke] using temp dir: ${tempDir}`);

    let output = run('node', [cliPath, '--help']);
    assertContains(output, 'Dorado CLI v0.2.0', 'root help');

    output = run('node', [cliPath, 'dashboard', '--help']);
    assertContains(output, 'dorado dashboard start', 'dashboard help');

    output = run('node', [cliPath, 'docs', '--help']);
    assertContains(output, 'dorado docs status', 'docs help');

    output = run('node', [cliPath, 'skills', '--help']);
    assertContains(output, 'dorado skills status', 'skills help');

    output = run('node', [cliPath, 'index', '--help']);
    assertContains(output, 'dorado index build', 'index help');

    output = run('node', [cliPath, 'workflow', '--help']);
    assertContains(output, 'dorado workflow show', 'workflow help');

    output = run('node', [cliPath, 'batch', '--help']);
    assertContains(output, 'dorado batch stats', 'batch help');

    output = run('node', [cliPath, 'skill', 'install', tempSkillDir]);
    assertContains(output, 'Installed dorado Codex skill', 'skill install output');

    output = run('node', [cliPath, 'skill', 'status', tempSkillDir]);
    assertContains(output, 'Codex Skill Status', 'skill status output');
    assertContains(output, 'agents/openai.yaml: present', 'skill metadata output');
    assertContains(output, 'In sync: yes', 'skill sync output');

    const installedSkillMd = await fs.readFile(path.join(tempSkillDir, 'SKILL.md'), 'utf8');
    const installedSkillYaml = await fs.readFile(path.join(tempSkillDir, 'skill.yaml'), 'utf8');
    const installedOpenaiYaml = await fs.readFile(
      path.join(tempSkillDir, 'agents', 'openai.yaml'),
      'utf8'
    );
    assertContains(installedSkillMd, 'dorado dashboard start [path]', 'installed SKILL.md');
    assertContains(installedSkillMd, 'Use dorado to initialize this directory', 'installed SKILL.md');
    assertContains(
      installedSkillMd,
      'Treat plain project-init intent as enough to trigger this flow',
      'installed SKILL.md'
    );
    assertContains(installedSkillMd, 'protocol-shell init first', 'installed SKILL.md');
    assertContains(installedSkillMd, 'Required protocol-shell checks after `dorado init`', 'installed SKILL.md');
    assertContains(installedSkillMd, 'build-index-auto.js', 'installed SKILL.md');
    assertContains(installedSkillMd, 'name: dorado', 'installed SKILL.md');
    assertContains(installedSkillYaml, 'default_prompt', 'installed skill.yaml');
    assertContains(installedSkillYaml, 'prompt_profiles', 'installed skill.yaml');
    assertContains(
      installedSkillYaml,
      'assume no web template when the project type is unclear',
      'installed skill.yaml'
    );
    assertContains(installedSkillYaml, 'verify the protocol-shell files on disk', 'installed skill.yaml');
    assertContains(
      installedSkillYaml,
      'initialize the project or current directory',
      'installed skill.yaml'
    );
    assertContains(installedSkillYaml, 'name: dorado', 'installed skill.yaml');
    assertContains(installedOpenaiYaml, 'display_name: "Dorado"', 'installed openai.yaml');
    assertContains(installedOpenaiYaml, 'Use $dorado', 'installed openai.yaml');
    assertContains(
      installedOpenaiYaml,
      'if the user intent is simply to initialize the project',
      'installed openai.yaml'
    );
    assertContains(
      installedOpenaiYaml,
      'do not create the first change automatically',
      'installed openai.yaml'
    );

    output = run('node', [cliPath, 'skill', 'install-claude', tempClaudeSkillDir]);
    assertContains(output, 'Installed dorado Claude Code skill', 'claude skill install output');

    output = run('node', [cliPath, 'skill', 'status-claude', tempClaudeSkillDir]);
    assertContains(output, 'Claude Code Skill Status', 'claude skill status output');
    assertContains(output, 'SKILL.md: present', 'claude skill file output');
    assertContains(output, 'In sync: yes', 'claude skill sync output');

    const installedClaudeSkillMd = await fs.readFile(
      path.join(tempClaudeSkillDir, 'SKILL.md'),
      'utf8'
    );
    assertContains(installedClaudeSkillMd, 'name: dorado', 'installed Claude SKILL.md');
    assertContains(
      installedClaudeSkillMd,
      'description: Protocol-shell-first Dorado workflow for Claude Code.',
      'installed Claude SKILL.md'
    );
    assertContains(
      installedClaudeSkillMd,
      'Required protocol-shell checks after `dorado init`',
      'installed Claude SKILL.md'
    );
    assertContains(
      installedClaudeSkillMd,
      'dorado skill install-claude',
      'installed Claude SKILL.md'
    );
    if (await fs.pathExists(path.join(tempClaudeSkillDir, 'skill.yaml'))) {
      throw new Error('Claude skill package should not include skill.yaml');
    }

    output = run('node', [cliPath, 'init', tempDir]);
    assertContains(output, 'Protocol shell initialized', 'init output');

    output = run('node', [cliPath, 'status', tempDir]);
    assertContains(output, 'Project Status', 'status output');

    output = run('node', [cliPath, 'docs', 'status', tempDir]);
    assertContains(output, 'Docs Status', 'docs status output');

    output = run('node', [cliPath, 'skills', 'status', tempDir]);
    assertContains(output, 'Skills Status', 'skills status output');

    output = run('node', [cliPath, 'index', 'check', tempDir]);
    assertContains(output, 'Index Status', 'index status output');

    output = run('node', [cliPath, 'new', 'release-smoke', tempDir]);
    assertContains(output, 'Change release-smoke created', 'new change output');

    console.log('[release:smoke] all checks passed');
  } finally {
    await fs.remove(tempDir);
  }
}

main().catch(error => {
  console.error(`[release:smoke] ${error.message}`);
  process.exit(1);
});
