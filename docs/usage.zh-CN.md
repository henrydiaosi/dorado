# 使用说明

## 常用命令

```bash
dorado status [path]
dorado init [path]
dorado docs status [path]
dorado docs generate [path]
dorado changes status [path]
dorado new <change-name> [path]
dorado progress [changes/active/<change>]
dorado verify [changes/active/<change>]
dorado archive [changes/active/<change>]
dorado finalize [changes/active/<change>]
dorado dashboard start [path] [--port <port>] [--no-open]
dorado skill status
dorado skill install
dorado skill status-claude
dorado skill install-claude
```

## 推荐流程

新目录建议先执行：

```bash
dorado status [path]
dorado init [path]
```

如果你明确要补齐项目知识层，再执行：

```bash
dorado docs generate [path]
```

如果你明确要开始一个需求，再执行：

```bash
dorado new <change-name> [path]
```

当一个 change 执行完成后，使用下面的标准收口命令：

```bash
dorado finalize [changes/active/<change>]
```

## 初始化预期

普通初始化默认保持最小化：

- 只创建 Dorado 协议壳
- 不默认生成 web 模板或业务 scaffold
- 不自动创建第一个 change
- 没有 active changes 时，Git hooks 应保持安静

## 进度与检查

进入执行阶段后，重点使用这些命令：

```bash
dorado changes status [path]
dorado progress [changes/active/<change>]
dorado verify [changes/active/<change>]
dorado archive [changes/active/<change>]
dorado finalize [changes/active/<change>]
```

`dorado finalize` 是标准收口路径。它会完成验证、刷新索引、执行归档，并把仓库留在“可手动提交”的状态。
