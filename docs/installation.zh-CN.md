# 安装说明

## 环境要求

- Node.js `>= 18`
- npm `>= 8`

## 首次安装

在 Dorado 发布仓库根目录执行：

```bash
npm install
npm install -g .
```

## 安装后验证

```bash
dorado --version
dorado --help
dorado doctor
```

如果你想先检查当前发布目录本身是否完整，可执行：

```bash
npm run doctor
```

## 升级

升级时应先完整更新整个发布仓库，再在仓库根目录重新安装：

```bash
npm install
npm install -g .
dorado doctor
```

如果你也在使用 Dorado skills，CLI 升级后再同步一次：

```bash
dorado skill install
dorado skill install-claude
```

## 可选冒烟验证

```bash
npm run release:smoke
```

## 重要说明

- 不要只拷贝 `dist/`、`dist/cli.js` 或零散的发布文件去覆盖旧目录。
- 支持的升级方式是“完整同步发布仓库 + 重新安装”，不是手工叠加部分产物。
- 这个仓库承载的是发布产物和对外文档，不是源码开发流程仓库。
