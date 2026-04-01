# 项目介绍

## OSpec 是什么

OSpec 是一个面向 AI 对话协作的文档驱动开发工作流，让你先用文档明确需求与变更，再驱动 AI 实现、验证与归档。

它把文档视为需求与变更的事实来源。初始化阶段先建立协作规则和基础项目知识层，再通过显式的 change 容器驱动 AI 推进实现。

## 核心原则

- `ospec init` 的目标是一次性把仓库带到 `change-ready`，不是停留在半成品初始化状态。
- 在 AI 参与的初始化流程里，如果项目上下文缺失，可以先追问一次简短的项目概况或技术栈。
- 纯 CLI 的 `ospec init` 保持非交互；拿不到上下文时，直接落占位项目文档。
- `ospec docs generate` 改为后续维护命令，用于刷新、修复或补齐项目知识层。
- 第一个 change 仍然需要显式创建，初始化不会自动进入执行阶段。
- 推荐的用户主流程是 `init -> 执行需求 -> 部署验证 -> 归档需求`。
- 队列模式仍然是显式能力，只有用户明确要求时才使用。

## 适用场景

- 希望 AI 在仓库内按统一规则协作
- 希望需求执行过程可见、可检查、可归档
- 项目类型可能是 Web、CLI、后端服务、游戏项目或纯协议仓库
- 需要同时适配 Codex 与 Claude Code

## 当前能力

- 一步到 `change-ready` 的初始化
- 项目知识层维护
- active change 执行流程管理
- 标准 `finalize -> archive -> 可提交` 收口流程
- `PASS / WARN / FAIL` 聚合状态检查
- 面向 active changes 的 Git hooks 阻断
- Codex 与 Claude Code skills 安装和同步

## 命令模型

新目录的推荐顺序是：

```bash
ospec init [path]
ospec new <change-name> [path]
ospec verify [changes/active/<change>]
ospec finalize [changes/active/<change>]
```

如果后续只是要维护知识层，请使用：

```bash
ospec docs generate [path]
```

如果只是想额外查看项目快照，再单独执行 `ospec status [path]`。
