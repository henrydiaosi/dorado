# 项目介绍

[English](project-overview.md) | [简体中文](project-overview.zh-CN.md)

## Dorado 是什么

Dorado 是一个以协议壳优先为核心的 AI 协作 CLI。

它会先给仓库建立共享执行协议，再补项目相关结构。这样初始化可以保持最小化，后续自动化也能通过文件被审阅和验证，而不只是依赖聊天记录。

## Dorado 不做什么

Dorado 在 plain init 阶段不会默认假设 Web 技术栈，不会一上来强塞业务 scaffold，也不会把 dashboard 当成主要创建入口。

Dashboard 的定位是 inspection-first。真正的执行入口仍然是 CLI 和 skills。

## 核心组成

### 1. 协议壳

`dorado init` 只创建共享协议壳。plain init 完成后，项目应该仍然保持最小化和技术栈无关。

### 2. 项目知识层

`dorado docs generate` 在你准备好之后再补齐项目知识层。它和 init 故意是两步。

### 3. Change 工作流

真正的开发工作都通过 `changes/active/` 下的 change 进行管理。一个 change 要先验证、再 finalize、再 archive，之后才进入可提交状态。

### 4. Change 队列

多个 change 可以组成队列。Dorado 可以按顺序跟踪执行，并在队列清空后自动停止。

### 5. AI Skill 层

Codex 和 Claude Code 可以通过已安装的 Dorado skills 使用同一套规则。这样用户可以直接使用简短自然语言，而不用每一步都手敲 CLI 命令。

## 当前版本重点能力

- 仅创建协议壳的初始化
- 显式触发的知识层补齐
- active change 验证与归档门禁
- `finalize -> archive -> commit-ready` 标准收口链路
- 通过 `run start` 和 `run step` 控制的显式队列执行
- `manual-bridge`、`codex`、`claude-code` 执行器
- Codex 与 Claude Code 的 skills 安装
- inspection-first 的 dashboard
