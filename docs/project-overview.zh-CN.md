# 项目介绍

## Dorado 是什么

Dorado 是一个面向 AI 协作交付的 CLI 工作流系统。

它不是在初始化时直接塞一个固定模板，而是先建立协议壳和协作规则，后续再根据项目真实方向，显式补齐文档、skills 和 change 流程。

## 核心原则

- 普通 `dorado init` 只做最小初始化，不会自动创建 web 模板、业务 scaffold，也不会自动生成第一个 change。
- 项目文档属于项目层。Dorado 协议规则放在 `.dorado/`、`for-ai/`、根目录 skill 文件和 change 记录这些 Dorado 资产里。
- change 工作流应当可配置。不同复杂度的步骤集可以并存，由用户按场景切换。
- Git hooks 只应该关注真实执行状态。空项目保持安静，有 active changes 时再做检查和阻断。
- dashboard 主要负责查看状态和进度，不承担项目生成逻辑。

## 适用场景

- 希望 AI 在仓库内按统一规则协作
- 希望需求执行过程可见、可检查、可归档
- 项目类型可能是 web、CLI、Unity、Godot、后端服务或纯协议仓库
- 需要同时适配 Codex 与 Claude Code

## 当前能力

- 协议壳优先初始化
- 显式项目知识层补齐
- active change 执行流程管理
- 标准 `finalize -> archive -> 可提交` 收口流程
- `PASS / WARN / FAIL` 聚合状态检查
- 面向 active changes 的 Git hooks 阻断
- dashboard 可视化查看
- Codex 与 Claude Code skills 安装和同步
