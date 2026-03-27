# Dorado

[English](README.md) | [简体中文](README.zh-CN.md)

Dorado 是一个以协议壳优先为核心的 AI 协作 CLI。

它会先初始化最小协作协议，尽量保持仓库起点干净，再通过后续显式的文档补齐、skills 和 change 流程逐步构建具体项目结构。

当前版本：

- CLI：`0.5.2`
- Skills 协议版本：`5.0.1`

文档入口：

- [项目介绍](docs/project-overview.zh-CN.md)
- [安装说明](docs/installation.zh-CN.md)
- [使用说明](docs/usage.zh-CN.md)
- [提示词文档](docs/prompt-guide.zh-CN.md)
- [Skills 安装说明](docs/skills-installation.zh-CN.md)
- [Skills 使用教程](docs/skills-usage.zh-CN.md)
- [工作模式说明](docs/workflow-modes.zh-CN.md)

工作模式速览：

- `lite`：适合较小仓库的轻量治理
- `standard`：适合大多数团队的平衡默认模式
- `full`：适合更大或更高风险工作的严格治理

重要说明：

- `standard` 是推荐默认值
- `full` 不是另一种产品层级，也不是“更完整”的 Dorado
- repository mode 负责设定治理范围，具体到每个 change 仍然要再结合 profile、flags 和 activated optional steps
- 当前版本已经提供公开的模式切换命令 `dorado workflow set-mode`

当前发布版覆盖内容：

- 协议壳优先的项目初始化
- 显式触发的项目知识层补齐
- 可配置的 change 工作流
- change 状态检查与 Git hooks 阻断
- 标准化的 `finalize -> archive -> 可提交` 收口流程
- 公开的仓库工作模式查看与切换
- Codex 与 Claude Code 的 skills 安装与同步
- `dorado doctor` / `npm run doctor` 发布自检
