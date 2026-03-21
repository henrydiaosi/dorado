# Dorado 模式说明

## 一、项目模式

Dorado 在 `.skillrc` 中定义项目模式，用来控制工作流的严格程度。

### `lite`

- 最轻量的模式
- 适合快速试验、原型和低风险探索
- 治理与校验要求最少

### `standard`

- 默认平衡模式
- 适合大多数团队的日常使用
- 保留 proposal、tasks、verification、skill/index 更新等核心步骤

### `full`

- 最严格的模式
- 适合大型项目、高风险项目和跨模块交付
- 启用更完整的治理和归档门禁

## 二、仓库结构状态

Dashboard 和 `dorado status` 会识别当前目录的结构状态：

### `none`

- 目录尚未初始化为 Dorado 项目
- 缺少 `.skillrc`、`changes/`、`.dorado/` 等核心结构

### `basic`

- 已有最小可运行结构
- 但项目知识层仍不完整，例如缺少 `docs/`、分层 `SKILL.md` 或 `SKILL.index.json`

### `full`

- 推荐结构已经完整
- 可以直接继续 dashboard 或 change 工作流

## 三、执行阶段状态

即使结构已经是 `full`，执行状态仍会继续区分：

- `full + no active change`：结构完整，但还没有活跃 change
- `full + active change`：结构完整，且已经进入 change 执行阶段

## 四、如何选择

- 常规团队默认使用 `standard`
- 高风险或治理要求高的项目使用 `full`
- 临时试验或原型可以使用 `lite`
