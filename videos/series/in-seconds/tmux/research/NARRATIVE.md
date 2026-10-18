# 叙事测绘

本文件只记录面向观众的讲述顺序与取舍，不是旁白稿。事实与依据在 `FACTS.md`。

## 观众前提

用过终端、ssh 或 VS Code 的终端，知道 `cd`、`ls`、`vim` 这类基本命令；没有系统用过 tmux 的 session/window/pane，也不知道 detach 后程序为什么还活着。

## 一个核心问题

关掉终端之后，程序为什么还在跑；tmux 到底替谁记住了什么。

## 逐章问题与答案

| 章 | 观众的问题 | 本章要回答 | 画面上的主要证据 |
|---|---|---|---|
| 1 现象 | 关掉窗口，正在跑的任务为什么没死 | 因为有一个不随终端退出的 server 和 pty 还在 | 实验：detach 后 counter 继续走，session 仍 attached=0 |
| 2 它是什么 | tmux 是窗口管理器吗 | 不是；它是终端复用器，把多个 pty 放进 session/window/pane 的树里 | 实验：一个 session、两个 window、三个 pane 的 pid/tty 列表 |
| 3 怎么用 | 我每天要按哪些键 | 前缀 `C-b`，`c`/`%`/`"`/`d`/`[`，以及 `tmux attach`；命令和键是同一套命令 | 默认键表；`send-keys`/`capture-pane` 回显 |
| 4 原理 | server 和 client 到底怎么分工 | client 只负责收键和画屏；server 持有 session/window/pane，读每个 pane 的 pty，解析 VT100/ANSI，再按 client 终端重绘 | 源码：AF_UNIX、forkpty、input.c、screen-redraw.c |
| 5 历史 | 它为什么会出现 | 2007 年从 nscr 原型起步；作者嫌 screen 的文档/配置/命令行/代码有包袱；2009 进入 OpenBSD base；2026 年 3.8 | 采访、CHANGES、导入报道、release |
| 6 边界 | 它是不是“永不丢” | 它保活的是进程与 pty，不是重启后的机器状态；server 死了/kill-server 了，session 也没了 | 实验：kill-server 后 server/pane 都不在 |

## 决定不讲

- tmux 配置文件的完整写法、插件管理器、主题生态。会把 128 秒变成配置课。
- copy mode 的全部键位。只讲 `[` 进入、`]` 粘贴，以及它为什么需要（pane 里没有外层终端的滚动条）。
- Windows 上的 psmux、iTerm2 的 tmux 集成、systemd 托管。它们是另一条实现路径。
- 性能对比、内存占用、启动时间。本次没有做对照测量。
- “tmux 是 screen 的替代品”这种站队式说法。作者自己说不是要复制 screen。

## 开场可用的钩子（不是定稿）

- 先让一个计数器在 pane 里跑，然后 detach；画面上的终端消失了，计数器还在走。再把 client 接回来，数字已经跳了一大截。
- 或者先问：“你关掉终端，程序为什么还活着？”停一拍，再出现 server 与 pty 的剖面。

## 与系列的约束

本集属于「XX 秒速通」：成片必须恰好 128 秒；保留系列的定长时间线、语速、字幕带/秒尺/剩余秒数/右上角仪表的位置与做法。视觉系统改用卡带未来主义，理由与边界见 `src/design/STYLE.md` 和系列说明的视觉例外。
