# 讲解测绘

2026-10-18：登记事实与讲述顺序，不规定分镜、时长分配、画面方案或旁白。

2026-10-19：事实逐条编号（`FACTS.md` 的 E/G/R/T/N/C/U/H/X/Z 节），补做四项实验（`lab/03`–`06`），复核 McCarthy 与 Dijkstra 两篇论文的全文；按 `NARRATIVE.md` 的顺序写出 `src/js/script.js` 中文第 1 稿，每句带 `facts` 编号。视觉方向仍见 `src/design/STYLE.md`，它不改变本文件的事实边界。稿本未经 WaterRun 确认，不配音、不铺开场景。

2026-10-19（同日稍后）：WaterRun 读第 1 稿后给三条意见，第 2 稿据此重写。事实新增 V 节（Node 24 的分配速度与堆上限，`lab/07`）与 L 节（Lua 5.5 手册、源码注释与增量步数，`lab/08`），G07、H12–H14、X13–X14、Z13–Z16；Lua 5.5.0 源码解压在 `_src/`（不入库）。讲述顺序见 `NARRATIVE.md`。

2026-10-19（再稍后）：WaterRun 要求语言阵容按其熟悉度排序（GC 语言 Python、Lua、C#、PHP、Nim、Java、JavaScript；非 GC 语言 Rust、Zig、C），并对文案做几轮对抗迭代。第 3 稿据此改写：新增 D（.NET）、P（PHP）、M（Nim）、J（Java）、K（C、Zig、Rust）五节与实验 `lab/09`–`12`（.NET 10、PHP 8.5、Nim 2.2、OpenJDK 27），Go 与 Swift 退出主例（相关事实与 `lab/02`、`03` 保留，不再旁白）。为跑实验，本机经 scoop 装了 Nim、OpenJDK、MinGW；网页文档下载到 `_src/docs/`（不入库）。对抗迭代的轮次、意见与处理记录在 `review/NOTES.md`。

2026-10-19（当日最后）：WaterRun 再定三件事——全片 4–7 分钟、配音与台词俏皮妩媚“赛博活泼”并用 MiniMax、整体要震撼有冲击感。第 4 稿压成五章，第 5 稿改口吻并做音色试听，三轮对抗审稿（目标观众、运行时工程师、事实审计各为独立子任务）后出第 7 稿（`2c69cb70…`，6:57）；事实表据此更正 D09、J04，新增 C16、L09、X19–X21、Z21–Z23；画面冲击点在 `src/design/STYLE.md` 第 13 节。
