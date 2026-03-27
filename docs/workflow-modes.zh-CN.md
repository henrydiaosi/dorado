# 工作模式说明

[English](workflow-modes.md) | [简体中文](workflow-modes.zh-CN.md)

## 为什么需要这份文档

Dorado 里有几层很容易混在一起的概念：

- repository mode
- workflow profile
- change flags
- activated optional steps

这份文档专门解释它们之间的关系，以及应该如何正确使用。

## 四层模型

### 1. Repository Mode

Repository mode 是仓库级治理设置。

当前值：

- `lite`
- `standard`
- `full`

它的含义：

- 表达治理强度
- 影响仓库默认 profile，以及仓库范围内可用的 optional steps
- 不表示另一种产品层级
- 也不表示每个 change 都会执行全部 optional steps

### 2. Workflow Profile

Workflow profile 是 change 级协议形态。

它用来定义 Dorado 认为这个 change 属于哪一类工作。

它的含义：

- 比 repository mode 更具体
- 会随 change 一起持久化
- 用来帮助决定这个 change 真正关心哪些协议文件和 optional steps

### 3. Change Flags

Flags 用来描述一个 change 在运行时的具体特征，例如风险、范围、跨模块影响或公开 API 影响。

Flags 会帮助 Dorado 为这个 change 激活正确的 optional steps。

### 4. Activated Optional Steps

Activated optional steps 指的是某个 active change 在运行时真正生效的可选步骤。

例如：

- `code_review`
- `design_doc`
- `plan_doc`
- `security_review`
- `adr`
- `db_change_doc`
- `api_change_doc`

这些步骤不是纯标签。在当前 Dorado 版本里，它们都会映射到 change 目录中的真实协议资产。

## 公开命令面

当前 CLI 提供：

```bash
dorado workflow show [path]
dorado workflow list-flags
dorado workflow set-mode <lite|standard|full> [path]
dorado workflow set-mode <lite|standard|full> [path] --force-active
```

这些命令分别用于：

- `workflow show`：查看当前仓库 workflow 配置
- `workflow list-flags`：查看可用 workflow flags
- `workflow set-mode`：切换仓库模式
- `--force-active`：在存在 active changes 时强制执行模式切换

## 模式语义

### `lite`

适用场景：

- 仓库较小
- 希望治理成本保持较低
- 大多数 change 只需要核心工作流检查

### `standard`

`standard` 是推荐默认模式。

适用场景：

- 仓库属于正常日常团队项目
- 你希望治理强度保持平衡
- 你没有明确理由要更轻或更严

### `full`

适用场景：

- 仓库更大
- 工作风险更高
- 值得接受更严格的治理流程

`full` 表示更严格治理，不表示“更完整版本”。

## 这几层如何协作

最简单的理解方式是：

1. repository mode 定义治理范围
2. workflow profile 定义单个 change 的协议形态
3. flags 描述这个 change 的风险和范围细节
4. activated optional steps 由 profile 和 flags 共同决定
5. Dorado 再去验证这些 activated steps 对应的真实协议文件

## 真实协议资产

Activated optional steps 会映射到 `changes/active/<change>/` 下的真实文件：

- `code_review -> review.md`
- `design_doc -> design.md`
- `plan_doc -> plan.md`
- `security_review -> security.md`
- `adr -> adr.md`
- `db_change_doc -> db-change.md`
- `api_change_doc -> api-change.md`

这些文件都会参与 verify、finalize、archive 和 hooks 的统一校验。

## 模式切换安全规则

默认行为：

- 只要存在 active changes，Dorado 就会阻止模式切换
- 这是安全默认值，因为 repository mode 会影响运行时治理规则

强制行为：

- `--force-active` 允许在存在 active changes 时执行切换
- Dorado 会同时更新仓库配置和 active change 的 `state.json.mode`

模式切换会更新：

- 项目配置中的 repository workflow mode
- `.skillrc`
- 仍由 CLI 管理的协议壳 `SKILL.md`
- `SKILL.index.json`
- 使用 `--force-active` 时 active change 的 `state.json.mode`

模式切换不会做：

- 不会改写归档历史
- 不会自动补全 tasks 或 verification
- 不会让未完成的 change 自动变成合格状态

## 实际建议

大多数团队都应该从这里开始：

- `standard`

只有在你明确要更轻治理时才选 `lite`。

只有在你明确要更严治理时才选 `full`。

如果可能，尽量尽早切换模式。若仓库已经存在 active changes，先检查这些 change，再决定是否真的需要 `--force-active`。

## Dashboard 阅读方式

在 dashboard 里：

- mode-enabled optional steps 表示仓库级范围
- change-activated optional steps 表示单个 change 的真实运行时要求
- default workflow profile 是仓库级回退值，不是每个 active change 的强制固定规则

## 对外简短解释模板

如果你需要一段对外简述，可以直接用这句话：

```text
Dorado 的 repository mode 用来控制治理强度。具体到某个 change，还要再通过 workflow profile 和 change flags 来决定哪些可选协议步骤真正生效。
```
