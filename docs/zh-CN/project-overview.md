# Dorado 项目说明

## 项目定位

Dorado 是一套面向 AI 协同开发的 GUI 优先工作流 CLI。它的目标不是只做初始化，而是把项目规划、知识层、变更执行层和技能同步整合成一条可持续执行的研发流程。

## 核心能力

- 通过 Dashboard 引导新项目初始化
- 自动补齐 `.skillrc`、`.dorado/`、项目知识层和变更执行层
- 根据自然语言需求生成项目规划骨架
- 用 `changes/active/<change>/` 驱动实现、验证和归档
- 为 Codex 安装并同步 `dorado` skill

## 适用场景

- 从 0 到 1 创建新项目
- 将已有项目升级为 Dorado 工作流项目
- 用统一规范管理需求、设计、API、模块技能和执行状态
- 让 AI 在固定流程下持续开发，而不是一次性生成代码

## 标准流程

1. 检查目录状态
2. 启动 Dashboard
3. 完成项目规划与知识层初始化
4. 创建第一个 change
5. 按 `proposal.md`、`tasks.md`、`state.json`、`verification.md` 持续推进
6. 验证完成后归档

## 关键文件

- `.skillrc`
- `.dorado/`
- `changes/active/<change>/proposal.md`
- `changes/active/<change>/tasks.md`
- `changes/active/<change>/state.json`
- `changes/active/<change>/verification.md`
- `SKILL.md`
- `skill.yaml`

## 当前推荐姿势

- 新项目优先从 GUI 进入
- CLI 用于检查、补充和自动化
- 项目规划先于代码实现
- 变更执行必须落在 change 文件上

## 相关文档

- [使用指南](usage-guide.md)
- [模式说明](modes.md)
- [AI 提示词教程](ai-prompt-guide.md)
