# OSpec 版本升级说明

本文档用于记录这个发布仓库的版本升级流程。后续如果只说“升版本”或“往上升一版”，默认按 **patch +1** 处理，除非另外明确说明要升 `minor` 或 `major`。

## 适用范围

- OSpec CLI 发布仓库
- 需要同步更新发布版本号与对外展示版本号的场景
- 用户自己提交 Git，本流程不自动提交

## 默认规则

- `升一版` = `patch +1`
- 例如：`0.6.0 -> 0.6.1`
- 如果用户明确说升小版本，则按 `minor`
- 如果用户明确说升大版本，则按 `major`

## 需要同步的文件

每次升版都要检查并同步下面这些位置：

1. `package.json`
2. `package-lock.json`
3. `dist/cli.js`
4. `docs/usage.md`
5. `docs/usage.zh-CN.md`

## 标准操作步骤

### 1. 确认当前版本

先检查以下文件中的当前 CLI 版本：

- `package.json`
- `package-lock.json`
- `dist/cli.js`
- `docs/usage.md`
- `docs/usage.zh-CN.md`

### 2. 升级 `package.json` 和 `package-lock.json`

推荐命令：

```bash
npm version patch --no-git-tag-version
```

如果要升小版本或大版本，则分别使用：

```bash
npm version minor --no-git-tag-version
npm version major --no-git-tag-version
```

### 3. 同步 CLI 常量版本

把 `dist/cli.js` 里的 `CLI_VERSION` 改成新版本。

### 4. 同步对外文档中的版本展示

更新以下文件里的 CLI 版本展示：

- `docs/usage.md`
- `docs/usage.zh-CN.md`

主 README 目前不展示 CLI 版本号，因此这里不再要求修改 README。

只更新 CLI 版本，不改其他协议或 skill 版本，除非有单独要求。

### 5. 做最小验证

至少执行：

```bash
node dist/cli.js --version
```

确认输出的新版本正确。

如有需要，可额外执行：

```bash
npm run release:smoke
```

### 6. 交付说明

完成后向用户汇报：

- 本次版本从多少升到多少
- 修改了哪些文件
- 是否已做最小验证
- Git 提交由用户自己完成

## 本仓库约定

- 后续如果用户只说“升版本”或“升一版”，默认按 `patch +1`
- 除非用户明确要求，不自动创建 Git tag，不自动提交 Git
- 如果未来仓库新增新的版本展示位置，也要把它补进本文档
