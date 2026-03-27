# 项目介绍

[English](project-overview.md) | [简体中文](project-overview.zh-CN.md)

## Dorado 是什么

Dorado 是一个以协议壳优先为核心的 AI 协作 CLI。

它先建立共享协作协议，而不是先塞进业务模板。仓库可以在一开始保持最小化，然后再通过项目知识层、skills 和 change 记录逐步长出具体结构。

## Dorado 不是什么

Dorado 不是固定的 Web 脚手架，不是强制业务模板生成器，也不是以 dashboard 为中心的项目构建器。

Dashboard 的定位是 inspection-first。它负责展示当前状态、active changes、workflow profile 和协议缺口，但主执行链路仍然由 CLI 与 skills 驱动。

## 核心模型

- `dorado init` 只创建协议壳。
- 项目相关知识层通过显式动作补齐，例如 `dorado docs generate`。
- 工作通过 `changes/active/` 下的 change 进行跟踪。
- 一个完成的 change 通常通过 `dorado finalize` 收口，它会先验证、再刷新索引、再归档，让仓库进入可手动提交状态。
- 已归档 change 用于保留历史。后续新增需求应创建新的 change，而不是把已归档记录直接改回活跃执行。

## 为什么采用这种模型

- 有些仓库根本不是 Web 项目
- 有些团队需要延后结构决策
- AI 客户端在业务文件出现前，先需要稳定协议规则
- change 状态应该通过文件可审阅、可验证，而不只存在于聊天记录里

## 当前发布版能力

- 协议壳优先初始化
- 显式触发的项目知识层补齐
- 可配置的 workflow profile 与可选治理步骤
- active change 验证与状态检查
- `finalize -> archive -> 可提交` 收口流程
- 针对 active change 的 Git hooks 阻断
- inspection-first dashboard
- Codex 与 Claude Code skills 安装和同步
