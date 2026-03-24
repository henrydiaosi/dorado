const fs = require('fs-extra');
const path = require('path');

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const dashboardSourceDir = path.join(rootDir, 'src', 'dashboard', 'public');
  const dashboardTargetDir = path.join(rootDir, 'dist', 'dashboard', 'public');
  const toolsSourceDir = path.join(rootDir, 'src', 'tools');
  const toolsTargetDir = path.join(rootDir, 'dist', 'tools');

  await fs.ensureDir(dashboardTargetDir);
  await fs.copy(dashboardSourceDir, dashboardTargetDir, { overwrite: true });
  await fs.ensureDir(toolsTargetDir);
  await fs.copy(toolsSourceDir, toolsTargetDir, { overwrite: true });

  console.log(`Copied dashboard assets to ${dashboardTargetDir}`);
  console.log(`Copied tool assets to ${toolsTargetDir}`);
}

main().catch(error => {
  console.error('Failed to copy dashboard assets:', error);
  process.exit(1);
});
