# 安装说明

## 环境要求

- Node.js `>= 18`
- npm `>= 8`

## 从当前仓库安装

在 Dorado 发布仓库根目录执行：

```bash
npm install
npm install -g .
```

## 安装后验证

```bash
dorado --version
dorado --help
```

## 可选验证

如果你想先验证发布产物是否可用，可以执行：

```bash
npm run release:smoke
```

## 说明

- `npm install` 用于安装当前发布仓所需运行依赖
- `npm install -g .` 会把当前版本注册为全局 `dorado` 命令
- 这个仓库承载的是发布产物和对外文档，不是源码开发流程仓库
