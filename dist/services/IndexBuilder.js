"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIndexBuilder = exports.IndexBuilder = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../core/constants");
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'changes', 'for-ai']);
class IndexBuilder {
    constructor(skillParser) {
        this.skillParser = skillParser;
    }
    async build(rootDir) {
        const modules = {};
        const tagIndex = {};
        let totalFiles = 0;
        let totalSections = 0;
        const visit = async (currentDir) => {
            const entries = await fs_extra_1.default.readdir(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(currentDir, entry.name);
                if (entry.isDirectory()) {
                    if (!SKIP_DIRS.has(entry.name)) {
                        await visit(fullPath);
                    }
                    continue;
                }
                if (entry.name !== constants_1.FILE_NAMES.SKILL_MD) {
                    continue;
                }
                totalFiles++;
                const relativePath = path_1.default.relative(rootDir, fullPath).replace(/\\/g, '/');
                const content = await fs_extra_1.default.readFile(fullPath, 'utf-8');
                const parsed = this.skillParser.parseSkillFile(content);
                const moduleName = parsed.frontmatter.name || relativePath;
                const title = parsed.frontmatter.title || parsed.frontmatter.name || relativePath;
                const tags = parsed.frontmatter.tags || [];
                const sections = parsed.sections;
                totalSections += Object.keys(sections).length;
                modules[moduleName] = {
                    file: relativePath,
                    title,
                    tags,
                    sections,
                };
                for (const tag of tags) {
                    if (!tagIndex[tag]) {
                        tagIndex[tag] = [];
                    }
                    tagIndex[tag].push(moduleName);
                }
            }
        };
        if (await fs_extra_1.default.pathExists(rootDir)) {
            await visit(rootDir);
        }
        const activeChangesDir = path_1.default.join(rootDir, 'changes', 'active');
        const activeChanges = (await fs_extra_1.default.pathExists(activeChangesDir)) ? await fs_extra_1.default.readdir(activeChangesDir) : [];
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
    async write(rootDir) {
        const index = await this.build(rootDir);
        const indexPath = path_1.default.join(rootDir, constants_1.FILE_NAMES.SKILL_INDEX);
        await fs_extra_1.default.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
        return index;
    }
    async createEmpty(rootDir) {
        const index = {
            version: '1.0',
            generated: new Date().toISOString(),
            git_commit: null,
            active_changes: [],
            stats: {
                totalFiles: 0,
                totalModules: 0,
                totalSections: 0,
            },
            modules: {},
            tagIndex: {},
        };
        await fs_extra_1.default.writeFile(path_1.default.join(rootDir, constants_1.FILE_NAMES.SKILL_INDEX), JSON.stringify(index, null, 2), 'utf-8');
        return index;
    }
}
exports.IndexBuilder = IndexBuilder;
const createIndexBuilder = (skillParser) => new IndexBuilder(skillParser);
exports.createIndexBuilder = createIndexBuilder;
//# sourceMappingURL=IndexBuilder.js.map