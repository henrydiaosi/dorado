# 安装说明

[English](installation.md) | [简体中文](installation.zh-CN.md)

## 环境要求

- Node.js `>= 18`
- npm `>= 8`

## 从发布仓库安装

在 Dorado 发布仓库根目录执行：

```bash
npm install
npm install -g .
```

这个发布仓库已经包含可发布的 CLI 产物。安装时应该基于完整仓库根目录执行，而不是手工拷贝 `dist/` 或少量单独文件。

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

先同步完整发布仓库，再重新安装：

```bash
npm install
npm install -g .
dorado doctor
```

如果你同时使用 Dorado skills，CLI 升级后再同步一次：

```bash
dorado skill install
dorado skill install-claude
```

## 可选发布冒烟检查

```bash
npm run release:smoke
```

## 升级规则

- 不要把少量发布文件覆盖到旧目录上当成升级。
- 不要只拷贝 `dist/cli.js`、`dist/` 或单个脚本。
- 支持的升级路径是：同步完整发布仓库，全局重装，然后执行 `dorado doctor`。
