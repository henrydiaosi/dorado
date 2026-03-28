#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { createRequire } = require('module');

const packageRoot = path.resolve(__dirname, '..');
const distDir = path.join(packageRoot, 'dist');
const cliPath = path.join(distDir, 'cli.js');

function parseCliVersion(cliSource) {
  const match = cliSource.match(/CLI_VERSION\s*=\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function parseYamlScalar(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

async function runDoctor() {
  const checks = [];
  const allowedReleaseScripts = new Set([
    'start',
    'help',
    'version',
    'doctor',
    'index:rebuild',
    'release:smoke',
  ]);

  const pass = message => checks.push({ level: 'PASS', message });
  const fail = message => checks.push({ level: 'FAIL', message });

  const packageJsonPath = path.join(packageRoot, 'package.json');
  const packageLockPath = path.join(packageRoot, 'package-lock.json');
  const gitignorePath = path.join(packageRoot, '.gitignore');
  const buildIndexPath = path.join(packageRoot, 'build-index-auto.js');
  const rootSkillPath = path.join(packageRoot, 'SKILL.md');
  const skillYamlPath = path.join(packageRoot, 'skill.yaml');
  const openaiYamlPath = path.join(packageRoot, 'agents', 'openai.yaml');

  const packageJsonExists = await fs.pathExists(packageJsonPath);
  if (!packageJsonExists) {
    fail('package.json is missing');
  } else {
    pass('package.json present');
  }

  let packageJson = null;
  if (packageJsonExists) {
    packageJson = await fs.readJson(packageJsonPath);
  }

  const packageLockExists = await fs.pathExists(packageLockPath);
  if (!packageLockExists) {
    fail('package-lock.json is missing');
  } else {
    const packageLock = await fs.readJson(packageLockPath);
    if (packageJson && packageLock.version === packageJson.version) {
      pass(`package-lock.json version matches package.json (${packageJson.version})`);
    } else {
      fail(
        `package-lock.json version mismatch: package.json=${packageJson?.version ?? 'unknown'} package-lock.json=${packageLock.version ?? 'unknown'}`
      );
    }
  }

  const cliExists = await fs.pathExists(cliPath);
  if (!cliExists) {
    fail('dist/cli.js is missing');
  } else {
    pass('dist/cli.js present');
  }

  if (cliExists && packageJson) {
    const cliSource = await fs.readFile(cliPath, 'utf8');
    const cliVersion = parseCliVersion(cliSource);
    if (!cliVersion) {
      fail('could not parse CLI_VERSION from dist/cli.js');
    } else if (cliVersion !== packageJson.version) {
      fail(`CLI version mismatch: package.json=${packageJson.version} dist/cli.js=${cliVersion}`);
    } else {
      pass(`CLI version matches package.json (${cliVersion})`);
    }

    const requireMatches = [...cliSource.matchAll(/require\("(\.[^"]+)"\)/g)];
    const missingRefs = [];
    for (const match of requireMatches) {
      const request = match[1];
      try {
        require.resolve(request, { paths: [path.dirname(cliPath)] });
      } catch (error) {
        missingRefs.push(request);
      }
    }

    if (missingRefs.length > 0) {
      fail(`dist/cli.js references missing modules: ${missingRefs.join(', ')}`);
    } else {
      pass(`dist/cli.js import graph resolved (${requireMatches.length} relative imports)`);
    }
  }

  for (const [label, filePath] of [
    ['build-index-auto.js', buildIndexPath],
    ['SKILL.md', rootSkillPath],
    ['skill.yaml', skillYamlPath],
    ['agents/openai.yaml', openaiYamlPath],
  ]) {
    if (await fs.pathExists(filePath)) {
      pass(`${label} present`);
    } else {
      fail(`${label} is missing`);
    }
  }

  if (await fs.pathExists(skillYamlPath)) {
    const skillYaml = await fs.readFile(skillYamlPath, 'utf8');
    const skillName = parseYamlScalar(skillYaml, 'name');
    const skillVersion = parseYamlScalar(skillYaml, 'version');
    if (skillName === 'dorado') {
      pass('skill.yaml package name is dorado');
    } else {
      fail(`skill.yaml name mismatch: expected dorado, got ${skillName ?? 'missing'}`);
    }

    if (skillVersion) {
      pass(`skill.yaml version detected (${skillVersion})`);
    } else {
      fail('skill.yaml version is missing');
    }
  }

  if (await fs.pathExists(gitignorePath)) {
    const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
    if (/^dist\/\s*$/m.test(gitignoreContent)) {
      fail('.gitignore must not ignore dist/ in the release repository');
    } else {
      pass('.gitignore does not ignore dist/');
    }
  } else {
    fail('.gitignore is missing');
  }

  if (packageJson) {
    const packageRequire = createRequire(packageJsonPath);
    const dependencyNames = Object.keys(packageJson.dependencies || {});
    const missingDependencies = [];
    for (const dependency of dependencyNames) {
      try {
        packageRequire.resolve(dependency);
      } catch (error) {
        missingDependencies.push(dependency);
      }
    }

    if (missingDependencies.length > 0) {
      fail(`runtime dependencies not installed: ${missingDependencies.join(', ')}`);
    } else {
      pass(`runtime dependencies resolved (${dependencyNames.length})`);
    }

    if (packageJson.bin?.dorado === 'dist/cli.js') {
      pass('package.json bin.dorado points to dist/cli.js');
    } else {
      fail(`package.json bin.dorado mismatch: ${packageJson.bin?.dorado ?? 'missing'}`);
    }

    const scriptNames = Object.keys(packageJson.scripts || {});
    const unsupportedScripts = scriptNames.filter(name => !allowedReleaseScripts.has(name));
    if (unsupportedScripts.length > 0) {
      fail(`package.json contains non-release scripts: ${unsupportedScripts.join(', ')}`);
    } else {
      pass(`package.json scripts are release-safe (${scriptNames.join(', ') || 'none'})`);
    }
  }

  const passed = checks.filter(check => check.level === 'PASS').length;
  const failed = checks.filter(check => check.level === 'FAIL').length;

  console.log('Dorado Release Doctor');
  console.log('=====================');
  console.log(`Root: ${packageRoot}`);
  console.log('');

  for (const check of checks) {
    console.log(`${check.level} ${check.message}`);
  }

  console.log('');
  console.log('Doctor Summary');
  console.log('--------------');
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);

  if (failed > 0) {
    console.log('');
    console.log('Recommendation: reinstall or re-sync the full release package instead of copying dist files partially.');
    process.exit(1);
  }
}

runDoctor().catch(error => {
  console.error(`[doctor] ${error.message}`);
  process.exit(1);
});
