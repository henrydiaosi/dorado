# 使用说明

[English](usage.md) | [简体中文](usage.zh-CN.md)

## 常用命令

```bash
dorado status [path]
dorado init [path]
dorado docs status [path]
dorado docs generate [path]
dorado new <change-name> [path]
dorado changes status [path]
dorado progress [changes/active/<change>]
dorado verify [changes/active/<change>]
dorado archive [changes/active/<change>]
dorado finalize [changes/active/<change>]
dorado workflow show [path]
dorado workflow list-flags
dorado workflow set-mode <lite|standard|full> [path]
dorado workflow set-mode <lite|standard|full> [path] --force-active
dorado dashboard start [path] [--port <port>] [--no-open]
dorado doctor
dorado skill status
dorado skill install
dorado skill status-claude
dorado skill install-claude
```

## 推荐项目流程

### 1. 初始化协议壳

```bash
dorado init [path]
```

普通初始化会刻意保持最小化：

- 只创建 Dorado 协议壳
- 不自动生成 Web 模板或业务 scaffold
- 不自动创建首个 change
- 在还没有 active change 时，hooks 保持安静

### 2. 按需补齐项目知识层

```bash
dorado docs generate [path]
```

这是显式动作。初始化和知识层补齐不是同一步。

## 设计文档优先流程

如果团队在仓库初始化前就已经有设计文档、产品说明、API 草案或架构说明，那么下面这种 Dorado 流程是正确的：

1. 先准备或收集设计材料
2. 执行 `dorado init [path]` 创建协议壳
3. 让 Dorado 基于现有设计材料补齐项目知识层
4. 让 Dorado 基于知识层细化执行计划或 TODO
5. 使用 `dorado new <change-name> [path]` 创建新的 change
6. 后续工作都通过 change 工作流执行，直到 `finalize`

这里有几个关键澄清：

- 仍然应该先初始化协议壳
- 项目知识层应该来自真实设计文档，而不是从模板猜测
- 真正的 CLI 命令是 `dorado new`
- “Dorado change” 适合作为 prompt 或 skill 入口描述，但 CLI 层对应的仍然是 change 创建加 verify/finalize/archive 这条链路

### 3. 查看或切换仓库治理模式

当你需要查看或切换 repository mode 时，使用：

```bash
dorado workflow show [path]
dorado workflow set-mode standard [path]
```

模式切换规则：

- 默认情况下，只要存在 active changes 就会阻止切换
- 只有在你明确希望同步更新 active changes 时才使用 `--force-active`
- 模式切换调整的是仓库治理策略，不会改写归档历史

### 4. 用 Change 开始实际工作

```bash
dorado new <change-name> [path]
```

新工作就创建新的 change。不要默认把已归档 change 当作可反复重开的执行容器。

### 5. 执行过程中查看进度

```bash
dorado changes status [path]
dorado progress [changes/active/<change>]
```

### 6. 完成后收口

```bash
dorado finalize [changes/active/<change>]
```

`finalize` 是标准收口路径。它会验证已完成 change、刷新索引、归档 change，并让仓库进入可手动提交状态。

如果你只想检查是否达到归档条件：

```bash
dorado archive [changes/active/<change>] --check
```

如果它已经验证通过并且已准备好归档：

```bash
dorado archive [changes/active/<change>]
```

## Change 生命周期

标准生命周期是：

1. `init`
2. 可选 `docs generate`
3. 可选 `workflow set-mode`
4. `new`
5. 在 `changes/active/<change>/` 中执行和更新
6. 开发过程中按需 `verify`
7. `finalize`
8. change 归档后再手动提交 Git

对于“设计文档优先”的团队，常见生命周期会是：

1. 已有设计文档
2. `init`
3. 基于设计文档补齐知识层
4. 可选 `workflow set-mode`
5. 细化执行计划或 TODO
6. `new`
7. 执行 change
8. `finalize`
9. 手动提交 Git

## 归档后补充工作的规则

如果某个已归档 change 后续还有新增需求，应创建新的 change，并在内容上引用旧归档记录。不要默认把 archive 当成临时暂停状态。

## Dashboard 定位

Dashboard 用于查看状态、进度和 workflow，不应该替代 CLI 成为主执行入口。
