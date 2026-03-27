# 安装说明

[English](installation.md) | [简体中文](installation.zh-CN.md)

## 环境要求

- Node.js `>= 18`
- npm `>= 8`

## 从当前发布仓库安装

在 Dorado 发布仓库根目录执行：

```bash
npm install
npm install -g .
```

这个仓库已经包含可发布的 CLI 产物。安装时应基于完整发布仓库执行，不要只复制 `dist/` 或零散脚本文件。

## 安装后验证

```bash
dorado --version
dorado --help
dorado doctor
```

如果你想验证发布仓库本身是否完整：

```bash
npm run doctor
```

## 升级方式

支持的升级路径是：

1. 同步最新完整发布仓库
2. 执行 `npm install`
3. 执行 `npm install -g .`
4. 执行 `dorado doctor`

如果你同时使用 skills，CLI 升级后再同步一次：

```bash
dorado skill install
dorado skill install-claude
```

然后验证：

```bash
dorado skill status
dorado skill status-claude
```

## 可选发布冒烟检查

```bash
npm run release:smoke
```

## 升级规则

- 不要把少量文件覆盖到旧发布目录上当成升级
- 不要只复制 `dist/cli.js` 就当成完成升级
- 始终基于完整同步后的发布仓库进行升级
