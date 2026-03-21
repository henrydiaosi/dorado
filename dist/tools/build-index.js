#!/usr/bin/env node

/**
 * 索引构建工具
 * 扫描项目中所有的 SKILL.md 文件，生成 SKILL.index.json
 */

const fs = require('fs-extra');
const path = require('path');

const SKILL_MD = 'SKILL.md';

async function buildIndex() {
  const rootDir = process.cwd();
  const indexFile = path.join(rootDir, 'SKILL.index.json');

  const modules = {};
  const tagIndex = {};
  let fileCount = 0;
  let moduleCount = 0;
  let sectionCount = 0;

  // 递归扫描目录
  async function scanDir(dir, prefix = '') {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      const relativePath = path.relative(rootDir, fullPath);

      if (file.isDirectory()) {
        // 跳过特殊目录
        if (
          ['node_modules', 'dist', '.git', 'for-ai', 'changes'].includes(file.name)
        ) {
          continue;
        }
        await scanDir(fullPath, prefix ? `${prefix}/${file.name}` : file.name);
      } else if (file.name === SKILL_MD) {
        fileCount++;
        const content = await fs.readFile(fullPath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
          try {
            const yaml = require('js-yaml');
            const frontmatter = yaml.load(frontmatterMatch[1]);

            moduleCount++;
            const moduleName = frontmatter.name || relativePath;
            const tags = frontmatter.tags || [];

            // 提取 sections
            const sections = {};
            const headingRegex = /^(#{1,6})\s+(.+?)$/gm;
            let match;
            let index = 0;

            while ((match = headingRegex.exec(content)) !== null) {
              const level = match[1].length;
              const title = match[2];
              sections[title] = {
                level,
                title,
                start: match.index,
                end: match.index + match[0].length,
              };
              sectionCount++;
              index++;
            }

            modules[moduleName] = {
              file: relativePath.replace(/\\/g, '/'),
              title: moduleName,
              tags,
              sections,
            };

            // 构建 tag 反向索引
            for (const tag of tags) {
              if (!tagIndex[tag]) {
                tagIndex[tag] = [];
              }
              tagIndex[tag].push(moduleName);
            }
          } catch (e) {
            console.error(`Error parsing ${relativePath}:`, e.message);
          }
        }
      }
    }
  }

  await scanDir(rootDir);

  // 获取 active features
  const changesDir = path.join(rootDir, 'changes', 'active');
  const activeChanges = [];
  if (await fs.pathExists(changesDir)) {
    const features = await fs.readdir(changesDir);
    activeChanges.push(...features);
  }

  // 生成索引
  const index = {
    version: '1.0',
    generated: new Date().toISOString(),
    git_commit: null,
    active_changes: activeChanges,
    stats: {
      totalFiles: fileCount,
      totalModules: moduleCount,
      totalSections: sectionCount,
    },
    modules,
    tagIndex,
  };

  await fs.writeFile(indexFile, JSON.stringify(index, null, 2));

  console.log('✓ Index rebuilt successfully');
  console.log(`  Files: ${fileCount}, Modules: ${moduleCount}, Sections: ${sectionCount}`);
  console.log(`  Active changes: ${activeChanges.join(', ') || 'none'}`);
}

buildIndex().catch((err) => {
  console.error('✗ Error building index:', err.message);
  process.exit(1);
});
