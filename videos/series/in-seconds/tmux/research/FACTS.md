# 事实

取证日期：2026-10-18。对象是 tmux 是什么、怎么用、怎样实现、从哪里来。本文件只登记陈述和依据，不规定片子的结构、时长分配、画面或措辞。

实验用 tmux 3.4；文档与源码固定到 3.8。两个版本不混用：3.8 才有的功能不写成 3.4 的行为。来源编号见 `sources.json`。

## 取证环境

| 材料 | 固定点 |
|---|---|
| 实验 | Ubuntu 24.04.4 LTS on WSL2，kernel `6.18.54.1-microsoft-standard-WSL2`，`tmux 3.4`。用 `-L ftlab -f /dev/null` 隔离 socket 与配置；脚本 `research/lab/01_tmux_basics.sh`，完整回显 `out_01_tmux_basics.txt` |
| 文档 | `man.openbsd.org/tmux.1`，读取日 2026-10-18。页面没有文档版本号 |
| 源码 | `tmux/tmux` tag `3.8`，提交 `7f2a35ad3321f9ba57a1062ca73b1f3ff26aca53`（2026-10-08T08:13:43+01:00）。本地 clone 后用 `git show 3.8:<file>` 读，行号按该提交 |
| 发布 | GitHub API `releases/latest`：tag `3.8`，published_at `2026-09-09T12:55:58Z` |
| 历史 | `CHANGES`、2009 年 undeadly 的采访与导入报道、git 提交记录。git 里最早的标签是 0.8（2009-04-21），更早的发布没有标签 |

## 它是什么

| 陈述 | 依据 | 状态 |
|---|---|---|
| tmux 是终端复用器（terminal multiplexer）：在一个屏幕上创建、访问、控制多个终端；可以从屏幕分离，继续在后台运行，之后再接回 | `tmux-man` DESCRIPTION 开头；`tmux-readme` 开头 | 已读原文 |
| 启动 tmux 会创建一个 session，里面有一个 window，显示在屏幕上；底部状态行显示当前 session 的信息，也用来输入交互命令 | `tmux-man` DESCRIPTION | 已读 |
| session 是一组由 tmux 管理的伪终端；一个 session 有一个或多个 window；window 占满屏幕，可以切成矩形 pane；每个 pane 是一个独立的伪终端 | `tmux-man` DESCRIPTION；`tmux-source-3.8` tmux.h:1304 `struct window_pane`、tmux.h:1073 `struct screen` | 已读原文与结构体 |
| 一个 session 可以由任意多个 tmux 实例连接；一个 session 里可以有任意多个 window；所有 session 都被杀掉后，tmux 退出 | `tmux-man` DESCRIPTION | 已读 |
| session 是持久的，能扛住意外断线（例如 ssh 超时）或主动 detach（默认 `C-b d`）；用 `tmux attach` 接回 | `tmux-man` DESCRIPTION | 已读 |
| session 由 client 显示，所有 session 由单个 server 管理；server 和每个 client 是不同进程，通过 /tmp 下的 socket 通信 | `tmux-man` DESCRIPTION | 已读 |
| 实验里一个 detached session 的读数是 `session=demo windows=1 attached=0`；server pid 506，socket `/tmp/tmux-1001/ftlab`，socket 类型 `socket`、mode 660、owner uid 1001；server 的可执行文件是 `/usr/bin/tmux`，fd 0 是 `/dev/null` | `tmux-lab-3.4` 第 2、3 节 | 已复现 |
| 实验里 pane 是 server 的子进程：`pane_pid=507`、`ppid=506`、`tty=/dev/pts/2`，pane 的 stdin/stdout 都指向 `/dev/pts/2` | `tmux-lab-3.4` 第 4 节 | 已复现 |
| 实验里 `split-window -h` 把一个 window 切成两个 pane：pid 522（`/dev/pts/3`，40×24）与 pid 525（`/dev/pts/4`，39×24） | `tmux-lab-3.4` 第 5 节 | 已复现 |

## 怎么用

| 陈述 | 依据 | 状态 |
|---|---|---|
| 默认前缀键是 `C-b`（Ctrl-b）；先按前缀，再按命令键 | `tmux-man` DEFAULT KEY BINDINGS；实验 `show-options -g prefix` 输出 `prefix C-b` | 已读与复现 |
| 默认绑定里：`c` 新建 window，`d` detach 当前 client，`%` 左右切 pane，`"` 上下切 pane，`[` 进入 copy mode，`]` 粘贴，`:` 打开命令提示符，`0`–`9` 选 window，方向键换 pane | `tmux-man` DEFAULT KEY BINDINGS | 已读 |
| 常用命令包括 `new-session`、`new-window`、`split-window`、`send-keys`、`capture-pane`、`attach-session`、`detach-client`、`list-sessions`、`kill-server`；命令既能从 shell 运行，也能绑定到键或在命令提示符里运行 | `tmux-man` COMMANDS 各节 | 已读 |
| 实验里 `new-session -d -s demo` 建立一个不接终端的 session；`new-window -t demo -n edit` 建第二个 window；`split-window -h -t demo:1` 把它切成两个 pane | `tmux-lab-3.4` 第 2、5 节 | 已复现 |
| 实验里 `send-keys -t demo:1.0 'echo PANE-A; tty' Enter` 后，`capture-pane -p -t demo:1.0` 读到 `PANE-A` 和 `/dev/pts/3` | `tmux-lab-3.4` 第 6 节 | 已复现 |
| `tmux attach` 接回 session；实验里用 `script` 造一个真实 pty 客户端接上，再用 `detach-client -s demo` 主动分离；分离前 counter=4，分离后 counter=9，clients 变成 0，session 仍是 `attached=0` | `tmux-man`；`tmux-lab-3.4` 第 8 节 | 已复现 |
| 实验里 `kill-server` 后 `list-sessions` 返回 `no server running on /tmp/tmux-1001/ftlab`，server 与 pane 进程都不再存活 | `tmux-lab-3.4` 第 10 节 | 已复现 |
| `-L` 指定 socket 名；socket 放在 `TMUX_TMPDIR` 或 /tmp 下的 `tmux-UID` 目录；该目录不能 world readable/writable/executable | `tmux-man` `-L` 一节 | 已读 |
| 实验里 socket 的 mode 是 660；源码里默认 socket 的 umask 只保留 owner 的读写与执行位，非默认 socket 更严 | `tmux-lab-3.4` 第 3 节；`tmux-source-3.8` server.c:107-139 | 已读与复现 |

## 实现

| 陈述 | 依据 | 状态 |
|---|---|---|
| client 用 `AF_UNIX` / `SOCK_STREAM` 连接 server 的 socket；连接失败且允许启动 server 时，client 先拿 lock 文件，再启动 server，然后重试连接 | `tmux-source-3.8` client.c:105-170 | 已读源码 |
| server 创建 `AF_UNIX` socket，`bind` 到 socket 路径，`listen(..., 128)`，设为非阻塞；`server_start` 里 fork/daemonize，然后进入 `proc_loop` | `tmux-source-3.8` server.c:107-139、server.c:177-258 | 已读源码 |
| server 的 accept 回调 `accept()` 新连接，为每个连接创建 `struct client`；client 数不受 session 数限制 | `tmux-source-3.8` server.c:373-400；`tmux-man` DESCRIPTION | 已读源码 |
| 每个 pane 由 `fdforkpty()` 创建：得到一个 pty 的主/从端和子进程；pane 结构里保存 `pid`、`tty`、`fd`、输入解析器 `ictx`、可见屏幕 `screen` 与底层 `base` | `tmux-source-3.8` spawn.c:478；tmux.h:1304-1420；`tmux-lab-3.4` 第 4 节 | 已读源码与复现 |
| pane 的输出由 bufferevent 读回调收进来，`input_parse_pane()` 把字节送进 VT100/ANSI 状态机，写进该 pane 的 screen grid | `tmux-source-3.8` window.c:1633-1680、input.c:1030-1075 | 已读源码 |
| 输入解析器基于 Paul Williams 的 VT100 解析器描述，改为 7-bit、支持 UTF-8，并处理 OSC/DCS 等；它不是简单地把字节原样转发给外层终端 | `tmux-source-3.8` input.c 文件头注释（约 30-55 行） | 已读注释 |
| 按键先经过 client 的 key table；没有命中前缀/根表时，才通过 `window_pane_key()` 送到当前 pane 的 pty | `tmux-source-3.8` server-client.c:1690-1700；`tmux-man` DEFAULT KEY BINDINGS | 已读源码 |
| 重绘不是把 pane 的输出直接复制给 client：server 为 client 构建 scene，scene 由 span（同一行上可同样绘制的一段 cell）组成，再按 client 终端能力写出 | `tmux-source-3.8` screen-redraw.c 文件头注释；tty.c:1652 `tty_write` | 已读注释与源码 |
| `struct screen` 保存 grid、光标、滚动区域、保存的屏幕/光标、tab stops、选择区等；`window_pane` 同时有 `screen` 和 `base` | `tmux-source-3.8` tmux.h:1073-1130、tmux.h:1304-1420 | 已读源码 |
| pane、window、session 各有唯一 ID，分别以 `%`、`@`、`$` 前缀；pane ID 通过 `TMUX_PANE` 传给 pane 的子进程 | `tmux-man` COMMANDS 开头的 target 说明 | 已读 |
| 所有 session 结束时 server 退出；`kill-server` 杀掉 server、clients 和所有 session | `tmux-man` DESCRIPTION、`kill-server`；实验第 10 节 | 已读与复现 |

## 历史

| 陈述 | 依据 | 状态 |
|---|---|---|
| 仓库最早的提交是 2007-07-09 的 CVS 导入；提交说明写：detach/reattach、创建 session、列 session 已经可用；还没有状态行，也没有键重映射和自定义 | git 提交 `a41ece5ff0d3ce7a0b7d987baa9759f8a012b48b`，2007-07-09T19:04:12Z，提交说明 | 已核 |
| 作者说 tmux 从一个叫 `nscr` 的原型开始；几个月后把原型展开，2007 年末在线发布第一版 | `tmux-interview-2009` 的 “How long have you worked on it so far?” 答 | 已读采访 |
| 作者写 tmux 的原因：自己是 screen 的重度用户，但觉得 screen 文档差、配置文件怪、命令行不直观，代码也有包袱；他想要可读、可扩展的代码库，并且要能把一个 window 共享给多个终端，同时让同一 session 里的其他 window 保持独立 | `tmux-interview-2009` 第一个问答 | 已读采访 |
| 作者明确说 tmux 不是要复制 screen；screen 有的大部分主要功能当时已经具备，但不会因为 screen 有某个功能就加上 | `tmux-interview-2009` 第三个问答 | 已读采访 |
| `CHANGES` 在 2007-11-20 条目写 “tmux 0.1 released.” | `tmux-changes` 2007-11-20 段 | 已读原文 |
| git 里最早的标签是 `0.8`（2009-04-21）；更早的 0.1–0.7 没有对应标签，不能用标签日期代替 0.1 的日期 | 本地 clone 的 `git tag` 与 `for-each-ref --sort=creatordate` | 已核 |
| 2009-07-07，tmux 被导入 OpenBSD base；当时的报道引用项目站点：清晰的 client-server 模型，window 可以同时接到多个 session、从多个 client 查看，并能在同一 server 内自由移动 | `tmux-import-2009` 开头与引文 | 已读 |
| 2009-07 的采访说，导入 OpenBSD 后收到了更多功能请求、bug 报告和代码；他需要花点功夫同步可移植版本 | `tmux-interview-2009` 最后一个问答 | 已读采访 |
| 最新的 3.8 于 2026-09-09 发布；3.7→3.8 的 CHANGES 第一条是 floating panes 的大量改进，还加入 themes、switch-mode 等 | `tmux-release-3.8`；`tmux-changes` 开头 | 已读发布元数据与 CHANGES |
| 许可为 ISC：允许使用、复制、修改、分发，保留版权与许可声明 | `tmux-readme` License；`COPYING` 文件 | 已读 |

## 边界与常见误说

| 说法 | 核查结果 | 依据 |
|---|---|---|
| “tmux 是 screen 的分支/复刻” | 本次读到的作者原话是：tmux 从一个原型开始，不是要复制 screen；没有找到“fork 自 screen”的一手依据。不要这样写 | `tmux-interview-2009` |
| “一个 session 一个 server” | 错。一个 server 管理同一个 socket 上的所有 session；可以有多个独立 server，用不同 socket 名/路径区分 | `tmux-man` DESCRIPTION、`-L`/`-S` |
| “一个 window 就是一个进程” | 不准确。window 是布局容器；每个 pane 才是独立的 pty 和子进程 | `tmux-man` DESCRIPTION；tmux.h |
| “detach 会杀掉里面的程序” | 错。实验里 detach 后 counter 从 4 走到 9，session 仍在；只有 kill-server/kill-session 等才会结束 | `tmux-lab-3.4` 第 8 节 |
| “tmux 能跨重启恢复 session” | 本次没有测试重启；只能证明 detach/断线后 server 与 pane 进程继续运行。不要把“持久”扩大成“重启后恢复” | `tmux-lab-3.4`；`tmux-man` |
| “3.8 的 floating pane 在 3.4 也有” | 不能这样说。实验是 3.4；floating panes 是 3.7/3.8 的 CHANGES 内容 | `tmux-release-3.8`；`tmux-changes` |
| “Windows 上的 psmux 就是 tmux” | 本次没有把 psmux 当证据；所有实验都在 WSL 的 tmux 3.4 里做 | `tmux-lab-3.4` |
| “socket 权限就是安全边界” | socket 权限只限制谁能连；man page 还提醒不要给不可信用户读权限。不要把它说成完整的沙箱 | `tmux-man` `-L`、`server-access` |

## 不进入定稿的句子

| 句子 | 原因 |
|---|---|
| tmux 是 2007 年 11 月 20 日“发布”的，所以项目从这天开始 | 0.1 是 2007-11-20 发布；仓库首次提交是 2007-07-09，原型更早。两个日期不能混 |
| tmux 一开始就支持状态行、键重映射 | 首次导入的提交说明明确说还没有状态行、没有键重映射 |
| tmux 是 OpenBSD 官方项目/由 OpenBSD 团队维护 | 本次只读到“导入 base”和作者在 OpenBSD 工作的材料；没有核对当前治理结构 |
| tmux 的 server 是单线程还是多线程 | 本次没有读事件循环的线程模型细节，不写 |
| tmux 的每个 pane 都保存完整 scrollback 到磁盘 | 没有读存储实现；不写 |
| tmux 能恢复重启前的 session | 没有测试，也没有读到内建持久化机制；不写 |
| 任何“内存占用比 screen 少多少”的倍数 | 没有做对照测量；不写 |

## 文案审查

尚未写稿，未交审。写稿后按 `docs/script-review.md` 逐轮记录交审日期、稿本哈希、意见与明确确认；没有确认不配音。

## 制作署名

策划：WaterRun。2026-10-18 这次会话中的 DeepSeek V4.1 Flash 1017 使用 Web Fetch 读取 3.8 文档与源码，在 WSL 里运行 tmux 3.4 实验，并写下本目录的事实记录；没有写旁白。仓库：https://github.com/Water-Run/ft 。

## 复核

没有成片。等脚本与画面完成后，按 `docs/review.md` 第 5 节逐句、逐画面复核；本文件现在只完成取证阶段的交叉核查。
