# 源码全解析

一集围绕一个项目，先建立源码的整体结构，再沿具体输入到结果的路径展开，讲清模块如何配合、关键数据结构与实现取舍。各集覆盖范围在开工时结合所选版本确定。

## 定位与共同约定

| 项 | 约定 |
|---|---|
| 内容 | 阅读真实项目源码，建立全景与关键路径，再逐步进入实现 |
| 选题顺序 | Lua → Pegasus（Lua 的 Web 框架）→ parsedown → tinydb → moonscript → luastatic → tokei → ripgrep |
| 标题 | 新条目暂用「项目名 + 源码全解析」；Lua 保留已有完整片名 |
| 版本与范围 | 开工时确定项目仓库、版本或提交、源码覆盖范围与贯穿例子；事实与证据写在各片 research/FACTS.md |
| 片长 | 尚未指定，按项目内容和各片简报确定 |
| 语言 | 中文（片单缺省） |
| 视听表达 | 每片按所讲项目设计；系列不预设统一配色或配乐 |

## 策划者要求

2026-10-27 会话原话：

> 增加个源码全解析部分吧. 现在包括 Lua, Pegasus(Lua的Web框架), parsedown, tinydb, moonscript, luastatic, tokei, ripgrep

本轮角色：维护者。已有 Lua 选题从独立视频移入，保持一集；其余七项登记为计划中。

## 分集

<!-- catalog:begin 由 node kit/tools/catalog.js 生成，不要手改 -->
| # | 标题 | 语言 | 状态 | 目录 |
|---|---|---|---|---|
| 1 | 一个生产级解释器的最小实现——Lua源码全解析 | zh | 计划中 | [`lua-source`](lua-source/) |
| 2 | Pegasus 源码全解析 | zh | 计划中 | `pegasus` |
| 3 | parsedown 源码全解析 | zh | 计划中 | `parsedown` |
| 4 | tinydb 源码全解析 | zh | 计划中 | `tinydb` |
| 5 | moonscript 源码全解析 | zh | 计划中 | `moonscript` |
| 6 | luastatic 源码全解析 | zh | 计划中 | `luastatic` |
| 7 | tokei 源码全解析 | zh | 计划中 | `tokei` |
| 8 | ripgrep 源码全解析 | zh | 计划中 | `ripgrep` |
<!-- catalog:end -->
