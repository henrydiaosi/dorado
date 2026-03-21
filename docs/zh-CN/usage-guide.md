# Dorado 使用教程

## 1. 安装

本地开发或发布前常用命令：

```bash
npm install
npm run build
npm install -g .
```

安装后可直接使用：

```bash
dorado --help
```

## 2. 检查项目

检查当前目录是否已经具备 Dorado 结构：

```bash
dorado status .
```

如果目录还没有初始化，下一步直接启动 Dashboard。

## 3. 启动 Dashboard

```bash
dorado dashboard start .
```

常见参数：

```bash
dorado dashboard start C:/work/my-project --port 3020 --no-open
```

Dashboard 适合做这些事：

- 检测当前目录是否已初始化
- 补齐缺失的 Dorado 结构
- 填写项目名称、技术栈、模块、API、设计文档和计划文档
- 创建第一个 change

## 4. 初始化新项目

推荐流程：

1. 先运行 `dorado status <path>`
2. 再运行 `dorado dashboard start <path>`
3. 在 GUI 中填写项目描述
4. 提交 bootstrap
5. 进入第一个 change

## 5. 执行 change

创建 change：

```bash
dorado new <change-name> .
```

继续执行：

```bash
dorado progress ./changes/active/<change-name>
```

验证：

```bash
dorado verify ./changes/active/<change-name>
```

归档：

```bash
dorado archive ./changes/active/<change-name>
```

## 6. 安装 Codex Skill

检查 skill 状态：

```bash
dorado skill status
```

安装或同步：

```bash
dorado skill install
```

安装后推荐在 Codex 中使用 `$dorado` 作为技能名。

## 7. 常见场景

新仓库初始化：

```bash
dorado status C:/work/new-project
dorado dashboard start C:/work/new-project
```

已有项目接入 Dorado：

```bash
dorado status C:/work/existing-project
dorado dashboard start C:/work/existing-project
```

## 8. 验证建议

发布或升级前建议至少执行：

```bash
npm pack --dry-run
dorado skill status
```
