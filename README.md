# Dorado

`dorado` 是一套面向 AI 协作开发的 CLI。

这个仓库是 Dorado 的发布仓，目标是提供一份可以直接安装、直接分发、直接同步到 AI 客户端的可发布产物。

如果你要改源码实现，请到源码仓：

```text
C:\Users\henry\Desktop\dorado-cli
```

## 这个仓库包含什么

- `dist/`
  Dorado CLI 的预构建可执行产物
- `assets/`
  初始化和复制用的长期资产
- `.dorado/`
  Dorado 内部模板与资产来源信息
- `SKILL.md`
  Dorado 根技能说明
- `skill.yaml`
  Dorado 技能元数据
- `agents/openai.yaml`
  AI 客户端兼容配置
- `docs/`
  当前发布仓的说明文档和使用教程

## 快速安装

```bash
npm install
npm install -g .
```

安装完成后可检查：

```bash
dorado --version
dorado --help
```

## 文档入口

- [项目说明](docs/project-overview.md)
- [安装使用文档](docs/installation.md)
- [Skills 安装说明](docs/skills-installation.md)
- [提示词文档](docs/prompt-guide.md)

## 适用场景

Dorado 适合这类协作方式：

- 你希望 AI 在项目里按统一规则工作
- 你希望本地 CLI、技能包、协议文档保持一致
- 你希望把项目状态、执行过程和提示词入口收敛成一套标准

## 发布仓说明

这个仓库不负责保存源码开发过程，也不负责维护内部升级计划。

它只负责承接已经验证过的可发布产物和对外可用的说明文档。
