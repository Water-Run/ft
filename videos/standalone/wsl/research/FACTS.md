# 事实出处

取证日期：2026-10-06 至 10-07。对象：Windows Subsystem for Linux（WSL）从 2016 年到 2026 年的三个节点——WSL 1、WSL 2，以及软件包 3.0 版带来的 WSL 容器。

画面与旁白里的每一项事实都列在下面，出处的优先级是：本机实验 > 源码 > 官方文档与官方博文 > 其他。媒体报道只用来证明「有报道这样称呼」，不作为技术事实的依据。画面上的回显、数字、引文由 `tools/gen_data.py` 从这些材料生成到 `src/js/data.js`，脚本里对每一项都有断言。

## 取证环境

| 记录 | 环境 |
|---|---|
| `lab/out_10` – `out_19` | 一台 Windows 11 测试机：专业工作站版 Insider Preview，10.0.26220.9587，界面语言 zh-CN；WSL 软件包 3.0.2.0（GitHub 上标为预发布，2026-10-05 发布），内核 6.18.40.1-1；Defender 实时保护开启。不是干净环境：机器上原有 4 个 WSL 2 发行版，实验没有动它们。脚本在 PowerShell 7 里执行，工作目录 `C:\ftlab`（演示目录）；实验建的发行版、映像、容器与文件已由 `19_cleanup.ps1` 删除 |
| `lab/out_01` – `out_03` | 一台 Linux 工作机，Python 3.12；原始网页与接口响应于 2026-10-06 至 10-07 取回，逐个记了 SHA-256 |
| `_src/WSL/` | `github.com/microsoft/WSL` 标签 `3.0.1`，提交 `91f161fa240dc355c1a88daabc8aac4273e35ba5`（`git clone --depth 1 --branch 3.0.1`） |
| `_src/web/` | `01_fetch_sources.py` 取回的原始文件；清单、状态码与校验和在 `lab/out_01_fetch_sources.txt` |

实验材料：Alpine Linux minirootfs 3.24.2（x86_64），3,701,382 字节，SHA-256 `c5ca053c…90388677`，与 Alpine 发布清单一致；计时用的压缩包是 WSL 3.0.1 的源码包（GitHub 的标签归档），20,095,141 字节，SHA-256 `dbb03073…a85017ae`，内含 1489 个文件、221 个目录。

**回显入库前的处理**（`lab/18_sanitize.py`，每个被改动的文件头部有一行说明）：删去每条 `wsl` 命令之前重复出现的同一行代理提示；用户名、主机名换成 `<用户>`、`<主机>`；私有网段的地址换成 `<内网地址>`；会话虚拟机里 258 个内核线程折成一行计数。`out_10` 里与实验无关的 3 个发行版只留下 VERSION 列的值。回显里的 `PS>` 表示在测试机的 PowerShell 里执行，`[ft-wsl1]$` 表示经 `wsl -d ft-wsl1 -- sh -c '…'` 在该发行版里执行；画面沿用这两种提示符。画面上显示的命令是回显里那条命令的原样片段（例如回显里是 `dmesg 2>&1 | head -3`，画面显示 `dmesg`）。

**英文版里 `wsl.exe` 的回显**：测试机的界面语言是中文，`wsl.exe` 按用户的界面语言输出（`_src/WSL/src/windows/common/Localization.cpp`，`GetUserPreferredUILanguages`），无法按进程切换。英文版画面上的这几行由 `gen_data.py` 换算：用源码里 zh-CN 的字符串模板从中文回显反解出各项的值，再套进 en-US 模板（`localization/strings/*/Resources.resw` 的 `MessagePackageVersions`、`MessageStatusDefaultVersion`）；Win32 系统信息的英文取自微软文档的错误码表（0 号与 777 号）。Linux 一侧的回显（`uname -r` 等）与语言无关，两种语言相同。

## 逐章

各表的「依据」一栏里，`out_NN` 指 `research/lab/out_NN_*.txt`，`摘录` 指 `research/lab/out_02_extract.txt` 里对应来源的一节（来源的地址与校验和在 `out_01_fetch_sources.txt`）。核查日期均为 2026-10-07；适用范围见各行。

### open

| 句号或位置 | 陈述 | 依据 |
|---|---|---|
| o1、o2；帖子卡片 | 2026-06-23，WSL 的产品经理 Craig Loewen 发帖：「As a PSA, there is no such thing as WSL 3! I've seen some articles talking about it, and it's not currently a thing.」 | 帖子原文、发帖时刻（2026-06-23 14:01 UTC）与作者简介「Product Manager at @Microsoft, working on the Windows Subsystem for Linux」：摘录 `x-loewen-…json`（经 fxtwitter 镜像接口取回，原帖 `x.com/craigaloewen/status/2069420597487055276`）。独立印证：Windows Latest 2026-06-27 的报道转述同一句话（摘录 `media-windowslatest`） |
| o3；发布页卡片 | 2026-09-29，WSL 3.0.1 发布；发布页正文以「WSLc is generally available.」开头；非预发布；变更比较为 `2.9.13...3.0.1` | GitHub 接口 `/repos/microsoft/WSL/releases/tags/3.0.1`：`published_at` 2026-09-29T17:18:57Z、`prerelease` false（摘录 `gh-release-3.0.1.json`）。「Latest」的标记见发布列表页，截至 2026-10-06 |
| o4；终端 | 测试机上 `wsl --version` 的第一行是「WSL 版本: 3.0.2.0」，第二行「内核版本: 6.18.40.1-1」；3.0.2 是预发布版 | `out_10`「wsl --version」；3.0.2 于 2026-10-05T21:30:49Z 发布、`prerelease` true（摘录 `gh-release-3.0.2.json`） |
| o5；终端 | `wsl -l -v` 的 VERSION 一栏是 2（默认发行版一行；另有 3 个发行版从略，均为 2） | `out_10`「wsl -l -v」 |
| o6；终端 | `wsl --set-default-version 3` 得到「无法解析版本号。」「错误代码： Wsl/ERROR_VERSION_PARSE_ERROR」；默认版本仍为 2 | `out_10`（命令退出码 −1；其后的 `wsl --status` 仍报默认版本 2）。原因见 end 一节的源码行 |
| 片名卡 | 三个数字，两种含义 | 全片的结论，依据见 num 与 end 两节 |
| o8、o9；站 D | 同一份 Alpine Linux 根文件系统（`alpine-minirootfs-3.24.2-x86_64.tar.gz`，3,701,382 字节），用三种方式运行，每次执行 `uname -r` | `out_11`「0 准备」「1 导入」，`out_14`「1」 |

### one（WSL 1）

| 句号或位置 | 陈述 | 依据 |
|---|---|---|
| a1、a2 | 2016-03-30，微软公布「Bash on Ubuntu on Windows」；场合是 Build 2016 | 官方博文《Run Bash on Ubuntu on Windows》，发布时间 2016-03-30（摘录 `ms-2016-bash-on-ubuntu`）；一周后的预览版公告写「as announced last week at Build 2016」（摘录 `ms-2016-build-14316`，2016-04-06） |
| a3 | 支撑它的新设施叫 Windows Subsystem for Linux | 同一篇博文：「we built new infrastructure within Windows – the Windows Subsystem for Linux (WSL)」 |
| a4；站 B | 里面没有 Linux 内核 | 《Windows Subsystem for Linux Overview》（2016-04-22）：「The drivers do not contain code from the Linux kernel but are instead a clean room implementation of Linux-compatible kernel interfaces」（摘录 `ms-2016-wsl-overview`） |
| a5、a6；站 B 的图 | 两个 Windows 内核驱动 `lxss.sys`、`lxcore.sys` 接住 Linux 系统调用，翻译成 NT 内核的调用 | 同上：「The lxss.sys and lxcore.sys drivers translate the Linux system calls into NT APIs and emulate the Linux kernel」。独立印证：2025 年的开源公告称 WSL 1 的做法是「implement Linux syscalls inside the Windows kernel」（摘录 `ms-2025-open-source`） |
| 站 B 的两个标签 | `sched_yield()` 与 `ZwYieldExecution()` 是一一对应的一对（单一出处，画面上注明「微软，2016」，作为官方给的例子引用） | 《WSL System Calls》（2016-06-08）：「The Linux sched_yield syscall is an example that maps one to one with a NT syscall … forwards the request directly to ZwYieldExecution」（摘录 `ms-2016-wsl-system-calls`）。画面注明这是例子 |
| a7 | 程序不用修改 | Overview：「By placing unmodified Linux binaries in Pico processes …」 |
| a8、a9；终端 | 把那份 Alpine 按版本 1 导入后，`uname -r` 回答 `4.4.0-26100-Microsoft` | `out_11`「1 导入」「2 内核」 |
| a10；右侧磁贴 | 26100 是这台机器上 Windows 内核的版本号 | `out_12`「a」：`ntoskrnl.exe` 的产品版本是 10.0.26100.9587；版本 1 里 `/proc/version` 为「4.4.0-26100-Microsoft … #9587-Microsoft」，两处数字都对得上。适用范围：这台测试机 |
| a11；右侧磁贴 | 回答问题的是 Windows 的驱动，不是 Linux 内核 | `out_12`「a」：`lxcore.sys`，描述「LX Core」，版本 10.0.26100.9587；连同 a4、a5 的出处 |
| a12 | 翻译是逐个调用实现的，有的没有实现 | WSL 2 的公告（2019-05-06）：「In WSL 1 we created a translation layer that interprets many of these system calls」（摘录 `ms-2019-announcing-wsl2`）；下面三行是实测 |
| a13；终端 | `dmesg` → `dmesg: klogctl: Function not implemented` | `out_11`「2 内核」 |
| a14；终端 | `unshare -U id -u` → `unshare: unshare(0x10000000): Invalid argument`；`mount -t cgroup2 none /tmp/cg` → `mount: mounting none on /tmp/cg failed: No such device` | `out_11`「5 系统调用」。范围：Alpine 3.24.2 的 busybox 在这台测试机的版本 1 发行版里 |
| a15；方格 | 版本 1 的根文件系统是 Windows 文件系统上的普通文件：`C:\ftlab\wsl1\rootfs` 下 424 个文件、98 个目录，在 Windows 一侧可数；挂载类型 `wslfs` | `out_11`「3 根文件系统」 |
| a16；计时条 | 在版本 1 自己的文件系统里解压那个 1489 个文件的包：2.47 秒（旁白说 2.5 秒） | `out_13`：5 次的中位数 2612 毫秒，减去空命令基线 144 毫秒，得 2468 毫秒。范围：这台测试机，Defender 实时保护开启，计时含 `sync` |

### two（WSL 2）

| 句号或位置 | 陈述 | 依据 |
|---|---|---|
| b1 | 2019-05-06，微软公布 WSL 2 | 官方博文《Announcing WSL 2》，发布时间 2019-05-06（摘录 `ms-2019-announcing-wsl2`） |
| b2；图 | 不再翻译，带一个真正的 Linux 内核；首批预览版的内核是 4.19 | 同上：「We will be shipping a real Linux kernel with Windows that will make full system call compatibility possible」「In initial builds we will ship version 4.19 of the kernel」。独立印证：微软的 WSL 2 内核仓库（`microsoft/WSL2-Linux-Kernel`）里最早的一批标签是 4.19.x（摘录 `gh-kernel-*.json`） |
| b3；图 | 内核跑在轻量级虚拟机里 | 同上：「run its Linux kernel inside of a lightweight utility virtual machine (VM)」。独立印证：现行文档《Comparing WSL Versions》（摘录 `ms-docs-compare-versions`） |
| b4 | 2020 年 5 月随 Windows 10 的 2004 版正式提供 | 《WSL 2 will be generally available in Windows 10, version 2004》（2020-03-13）；2004 版（May 2020 Update）于 2020-05-27 发布（摘录 `ms-2020-wsl2-ga-2004`、`ms-2020-may-2020-update`） |
| b5、b6；终端 | 同一份 Alpine 按版本 2 导入，`uname -r` 回答 `6.18.40.1-microsoft-standard-WSL2` | `out_11`「1 导入」「2 内核」。独立印证：内核仓库有发布 `linux-msft-wsl-6.18.40.1`（2026-08-01），与回显里的编译时间（2026-07-31）相符（摘录 `gh-kernel-*.json`） |
| b7；终端 | 版本 2 里：`dmesg` 有输出；`unshare -U id -u` → `65534`；cgroup2 可挂载，控制器为 `cpuset cpu io memory hugetlb pids rdma` | `out_11`「2 内核」「5 系统调用」。画面上 `dmesg` 的第一行在「(root@…」处截断并标「…」 |
| b8；方格收拢 | 版本 2 的根文件系统是一个 ext4 格式的虚拟磁盘文件：`C:\ftlab\wsl2` 里只有 `ext4.vhdx`（79,691,776 字节），挂载为 `/dev/sdd / ext4` | `out_11`「3 根文件系统」 |
| b9；计时条 | 同样的解压在版本 2 里是 0.34 秒，约为版本 1 的七分之一（7.2 倍） | `out_13`：中位数 540 毫秒，减去基线 196 毫秒，得 344 毫秒；2468 ÷ 344 = 7.2。范围同 a16。官方当年给出的数量级：「up to 20x faster compared to WSL 1 when unpacking a zipped tarball」（摘录 `ms-2019-announcing-wsl2`，未进入成片） |
| b10；图 | 版本 2 访问 Windows 的盘经过 9P：`/mnt/c` 的挂载类型在版本 2 里是 `9p`，在版本 1 里是 `drvfs` | `out_11`「3 根文件系统」。独立印证：文档的对照表里「Performance across OS file systems」一项版本 1 为是、版本 2 为否（摘录 `ms-docs-compare-versions`） |
| b11、b12；条形 | 把同一个包解到 C 盘：版本 1 用了 7.8 秒，版本 2 用了 88 秒（11.3 倍） | `out_13`：扣除基线后 7825 毫秒与 88032 毫秒。`out_15`「b」不含 `sync` 的对照为 8.7 秒与 73.7 秒，说明差距不是 `sync` 造成的。范围同 a16；这是这台机器的数字，不是普遍结论，画面上标「本机实测」 |
| b13；终端 | 版本 1 至今保留，两种发行版并存（旁白只陈述现状，不说保留的原因：官方没有给出这层因果） | `out_11`：同一台机器上 `ft-wsl1` 为 VERSION 1、`ft-wsl2` 为 VERSION 2；WSL 2 的公告：「you can run WSL 1 and WSL 2 distros side by side」；2025 年的开源公告称 WSL 1「which WSL still supports」 |

### num（两套版本号）

| 句号或位置 | 陈述 | 依据 |
|---|---|---|
| v1；黑线 | 1 和 2 指架构：发行版运行在哪一种上面 | 文档《Basic commands for WSL》：`wsl --set-version <distribution name> <versionNumber>`，「To designate the version of WSL (1 or 2) that a Linux distribution is running on」（摘录 `ms-docs-basic-commands`）。黑线的两个日期取 a1 与 b1 的公布日 |
| v2 | 2021 年，WSL 从 Windows 的代码库里分离出来，单独发布 | 开源公告（2025-05-19）：「in 2021 we separated WSL from the Windows codebase, and moved it to its own codebase」（摘录 `ms-2025-open-source`） |
| v3；蓝线起点 | 第一个软件版本号是 0.47.1 | 同上：「This new WSL first shipped as version 0.47.1 to the Microsoft Store, in July 2021」。GitHub 上该版本的发布记录是 2021-10-12（`out_03`），画面上的日期取 GitHub 的发布日，并写明「GitHub 上的发布」 |
| v4；蓝线 | 2022 年 11 月，软件包升到 1.0.0 | `out_03`：1.0.0 于 2022-11-15 发布。独立印证：商店版正式可用并成为默认的公告在 2022-11-22（摘录 `ms-2022-store-ga`） |
| v5；括线 | 那时装的是 1.0.0，跑的是 WSL 2 | 由 v4 与文档「WSL 2 is the default distro type when installing a Linux distribution」（摘录 `ms-docs-about`）得出；图上是同一时刻的两条线 |
| v6；蓝线与卡片 | 2023 年 9 月是 2.0.0；2025 年 5 月源代码公开 | `out_03`：2.0.0 于 2023-09-18 发布（预发布；首个非预发布的 2.x 是 2023-11-11 的 2.0.9）；博文《Windows Subsystem for Linux September 2023 update》2023-09-18。开源公告 2025-05-19 |
| v7；整张图 | GitHub 上共 118 个发布；主版本号的首发依次为 0.47.1、1.0.0、2.0.0、3.0.1；架构的线停在 2 | `out_03_releases.tsv`（接口 `/repos/microsoft/WSL/releases`，截至 2026-10-06 取回）。每道刻度是一个发布，预发布画成浅色短刻度 |

### three（「WSL 3」）

| 句号或位置 | 陈述 | 依据 |
|---|---|---|
| c1；卡片一 | 2026 年 6 月，微软公布 WSL 容器，缩写 WSLc；预览版 2.9.3 于 2026-06-29 发布 | Loewen 06-23 的帖子：「we did just announce WSL container (Or WSLc for short …) and that will be available in just a week or so」；`out_03`：2.9.3（预发布）2026-06-29；文档：「The WSL container feature requires WSL version 2.9.3 or higher」（摘录 `ms-docs-wsl-container`）。公布的具体日期没有读到官方原文，旁白只说到月份 |
| c2；卡片二 | 有的报道把它写成 WSL 3 | 两篇报道的标题与日期：TechTimes 2026-06-02《WSL 3 at Build 2026: …》、IT-Connect 2026-06-04《WSL 3 and WSL Containers: …》（`gen_data.py` 回到存档网页上核对标题与日期）。画面上的标题在 44 个字符处截断并标「…」 |
| c3；卡片三 | 9 月 29 日正式可用，版本编号 3.0.1 | 同 o3；官方博文《WSL containers is now generally available》2026-09-29（摘录 `ms-2026-wslc-ga`） |
| c4；卡片四与左侧标题 | 官方的发布文章里没有出现过「WSL 3」；官方称它为「WSL 的一项新功能」（「a new feature in WSL: WSL containers」，发布博文） | `gen_data.py` 在存档的博文正文里计数，`WSL 3` 出现 0 次；架构解析一文与文档页同样是 0 次（2026-10-07 复算）。截至取回时刻 |
| c5 | 新增命令 `wslc`，在 Windows 上直接运行 Linux 容器 | 发布博文：「WSL containers CLI: wslc.exe to directly build, run and deploy Linux containers on Windows, or use its built-in alias container.exe」；`out_10`：`wslc.exe` 与 `container.exe` 逐字节相同 |
| c6、c7；终端 | 把同一份 Alpine 用 `wslc import` 导入成映像，`wslc run --rm ft-alpine:3.24.2 uname -r` 回答 `6.18.40.1-microsoft-standard-WSL2` | `out_14`「1」 |
| c8 | 与版本 2 发行版里的回答逐字相同，是同一个内核 | `out_14` 与 `out_11` 的 `/proc/version` 整行相同（`gen_data.py` 有断言）。源码：容器虚拟机启动的是安装目录 `tools\kernel`（`_src/WSL/src/windows/service/exe/HcsVirtualMachine.cpp` 第 213–224 行，`LXSS_VM_MODE_KERNEL_NAME`），与发行版的虚拟机是同一个文件 |
| c9；图 | 容器不在任何发行版里，跑在另一台虚拟机上。图上方的虚线框是发行版列表（其中 `ft-wsl1` 是版本 1，本就不在虚拟机里），不是一台虚拟机 | `out_14`「3」：容器运行期间 `ft-wsl1`、`ft-wsl2` 都是 Stopped；Windows 一侧有两个不同的虚拟机进程（发行版的与容器会话的） |
| c10；图 | 系统服务 `wslservice.exe`（属主 SYSTEM）创建虚拟机，调用 `HcsCreateComputeSystem` | 架构解析（2026-09-29）：「wslservice.exe, which is a privileged Windows service. That service has the capability to create virtual machines (via HCS)」（摘录 `ms-2026-wslc-architecture`）；`out_14`「3」的属主；源码 `src/windows/common/hcs.cpp` |
| c11；图 | 交给 `wslcsession.exe`，它以当前用户身份运行 | 同一篇：「it creates a child process, wslcsession.exe, which runs on behalf of the calling user」；`out_14`「3」：属主为当前用户 |
| c12；图 | 这样一台虚拟机叫一个会话，带自己的存储盘 `storage.vhdx`（620 MB） | 同一篇：「Each WSLC session has its own storage VHD」；`out_14`「3」「4」：`%LOCALAPPDATA%\wslc\sessions\…\storage.vhdx` 650,117,120 字节（按 1 MB = 1,048,576 字节为 620 MB），挂载在 `/var/lib/docker` |
| c13；图 | 虚拟机里运行着 `containerd` 与 `dockerd`（实测版本 2.2.4 与 25.0.3） | `out_14`「4」：会话虚拟机的进程表与两条 `--version` |
| c14；图 | `wslcsession` 经 hvsocket 连到 `/var/run/docker.sock`，用 Docker 的 HTTP 接口；创建与启动容器的请求是 `POST /containers/create`、`POST /containers/{id}/start` | 源码 `src/windows/wslcsession/DockerHTTPClient.cpp`：文件头的说明、第 283–308 行的路径与 `verb::post`（`gen_data.py` 有断言）。画面上把 `{}` 写成 `{id}` |
| c15；终端 | 挂进容器的 Windows 目录是 virtiofs：`drvfs /data virtiofs rw,relatime 0 0`；对照：版本 2 的发行版里 `/mnt/c` 仍是 9p | `out_14`「5」；`out_11`「3」。架构解析：「these volumes are implemented by mounting virtiofs shares inside the Linux virtual machine」 |
| c16 | 官方的说法是大约快一倍 | 架构解析：「Compared to plan9, virtiofs is about twice as fast」；发布博文：「up to 2x faster performance when accessing Windows files from Linux environments」。本片没有实测这一项，旁白与画面都写明是官方的说法 |
| c17、c18；图 | 虚拟机发出的以太网帧经 virtio 队列交给 Windows 一侧以用户身份运行的进程，由它做 DNS、路由与端口映射 | 架构解析：「all the Linux virtual machines' traffic is sent as ethernet frames to a virtio queue, which is then read by a Windows process running on behalf of the user … Answering DNS queries / Routing for UDP & TCP traffic / Port mapping」。独立印证（源码）：`src/windows/common/ConsommeNetworking.cpp` 给来宾加的是 virtio 网卡，并带着用户的令牌（`AddVirtioNetDevice(…, m_userToken.get())`）；`WSLCVirtualMachine.cpp` 注释写明这一模式下 DNS 由宿主一侧代理。实测的例子：`127.0.0.1:18080->80/tcp`，从 Windows 连 localhost 读回容器里的 `3.24.2`（`out_15`「a」） |
| c19 | 目前没有 compose，官方把它列为下一步的重点 | 发布博文：「Our top feature request for WSLc is adding compose support, and this will be our focus for our next iterations」；`out_13` 末尾的 `wslc --help` 列表里没有 compose。截至 3.0.2 |

### end

| 句号或位置 | 陈述 | 依据 |
|---|---|---|
| e2 | 1 和 2 是架构：翻译系统调用，或在虚拟机里运行真内核 | one、two 两节 |
| e3；标签 | 3.0 是软件包的版本号：在第二种架构上加了容器 | num、three 两节；四个标签的日期取 `out_03` 各主版本的首发月份 |
| e4；代码 | WSL 3.0.1 的源码里，校验发行版版本的那一行只接受 1 和 2 | `_src/WSL/src/windows/common/WslClient.cpp` 第 1093 行（函数 `ParseVersionString`）：`THROW_HR_IF(HRESULT_FROM_WIN32(ERROR_VERSION_PARSE_ERROR), (FAILED(result) \|\| ((version != LXSS_WSL_VERSION_1) && (version != LXSS_WSL_VERSION_2))));`；`src/windows/service/inc/wslservice.idl` 只定义了 `LXSS_WSL_VERSION_DEFAULT 0`、`_1 1`、`_2 2`，没有 `_3`。画面把这一行按原文断成三段。与 o6 的实测报错相符（实测的是 3.0.2，源码取的是 3.0.1） |
| e5；两张卡片 | 「没有 WSL 3」与「WSL 3.0 发布了」同时成立 | 前一句按架构讲（o1、e4），后一句按软件包讲（o3）；画面写的是「按架构讲」「按软件包讲」，标明这是本片的读法。这是本片的归纳，不是任何一方的原话；Loewen 的原话带着限定「not currently a thing」 |
| e6；两行回显 | 版本号的第一位是 3；内核的名字结尾是 WSL2 | `out_10`「wsl --version」；`out_14`「uname -r」 |

### 封面

两版封面上的两行回显与 e6 相同；三个数字与片名相同。

## 制作署名

策划：WaterRun（依据：仓库制作规范）。

开源视频：[GitHub · Water-Run/ft](https://github.com/Water-Run/ft)（依据：仓库制作规范；核对结果见「复核」）。

| 参与方（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| Claude Opus 5.5 | 取证、脚本、翻译、视觉设计、场景实现、审查 | 本次制作会话的模型标识（`claude-opus-5-5`）；`project.json` 的 `production.maker` |
| Microsoft Edge 在线语音（经 edge-tts 7.2.8 调用），模型未披露 | 旁白：中文 `zh-CN-YunyangNeural`，英文 `en-US-AndrewNeural` | `project.json` 的 `voices`；`tts.js` 的合成记录 |
| 程序合成（`kit/tools/mix.py`），不是模型 | 配乐与音效 | `project.json` 的 `audio` |

## 复核

审查分两轮：第一轮在渲染之前与渲染期间（2026-10-07），第二轮对最终成片（2026-10-07）。核查人是制作者本身（Claude Opus 5.5）；它能看静帧与总览图，不能播放视频，也听不到声音。

**事实（review 5.1）**

- 范围：两种语言各 70 句旁白、全部画面文字、片名、字幕、两版封面。做法：把 `sheets.js cue` 的每句画面与本表逐行比对；画面上的回显、数字、引文都由 `gen_data.py` 生成并带断言，重新运行后 `data.js` 逐字节不变。
- 外部事实联网复核（2026-10-07 00:35 UTC，读原始接口与页面）：GitHub 上 `microsoft/WSL` 的 Latest 仍是 3.0.1（2026-09-29），3.0.2 仍标为预发布；官方发布博文与 Loewen 的帖子都还在，内容与存档一致。
- 排查「单一出处」后补了三条独立印证：WSL 2 首批内核为 4.19（内核仓库最早的标签）、实测内核 6.18.40.1 与内核仓库 2026-08-01 的发布相符、WSL 容器的网络做法（源码 `ConsommeNetworking.cpp`）。`sched_yield` 一例仍是单一出处，画面上注明来源。
- 发现并更正了四处表述：
  1. b13 原为「所以版本 1 一直保留着」。「所以」把跨盘更慢说成保留版本 1 的原因，官方原文没有这层因果。改为「版本 1 至今保留着」，英文同改。
  2. 第四章一处标题原为「一项新功能，不是一代新架构」。容器自己有一套新的会话架构，后半句站不住。改为「官方的说法：WSL 的一项新功能」，并补了原文出处。
  3. 架构图里标着「WSL 2 发行版的虚拟机」的虚线框里列了 `ft-wsl1`，它是版本 1 的发行版，不在虚拟机里。改为「发行版（容器运行期间）」。
  4. 结尾两张卡片的小字原为「指架构」「指软件包」，读起来像原话的含义。改为「按架构讲」「按软件包讲」。
- 画面里没有本机路径以外的用户目录、主机名、用户名与内网地址：实验目录是 `C:\ftlab`；会话名里的用户名在数据里写成 `user`，画面上没有用到它；回显入库前的处理见本文开头。
- 没有「待核实」的陈述留在成片里。c1 的公布日期只读到月份，旁白与画面也只说到月份。

**读音与节奏（review 5.2）**

- `asr.js` 回听两种语言各 70 句（对最终混音）：没有漏词，数字、版本号与缩写的读法正确；出入都是同音字与大小写一类的识别误差。`virtiofs` 的读法改过一次（原写法被逐字母拼读）。
- 一处需要人耳确认：中文版第一句的「2026 年」。整条音轨识别时被听成 2016，把这一句单独切出来识别是 2020，放慢到 0.8 倍是 2026；同样的文字在常速下单独合成，三种识别方式都是 2026；第四章里同一个「2026 年」识别正确。判断是读音正确、识别模型在片头第一个词与加快 8% 的语速下不稳（三次给出了两个不同的错答）。画面与字幕同时写着 2026。把年份改写成汉字数字试过，识别结果更差，所以没有改稿。
- `stats.js`：中文各章每秒 4.4–4.8 字，英文每秒 2.4–2.6 词；没有过快、过长与停顿过短的句子。

**旁白与画面对应（review 5.3）**

- 两种语言的 `sheets.js cue` 总览图逐张看过（各 8 张、70 帧）。发现并改掉了三处：
  1. b12「版本 2 用了 88 秒」说完时，读数还停在 61.9，要再过半秒多才到 88.0。把条形的生长提前，读到「88」时正好走完。
  2. 英文版 c14 里「HTTP」在句末，两条请求与容器填实落到了这一句之后、镜头已经离开的时候。改为按句中靠前的词起，并限定在这一句之内。
  3. e5 那一句时画面下半部分空着约五秒。改为先把两条命令与两道横线摆出来占位，e6 再填上回显。
- `margin.js` 按像素量出 40 句「贴边」，其中绝大多数是有意铺满画面的东西：Fluent 与 Windows 11 两个年代的背景色团、第三章的时间轴与纵轴、88 秒的长条、推近时的虚拟机方框。真正略小于 60 像素留边的内容有两处，量出来之后都改了：第一章答案那一站（原 42–57 像素）与结尾代码卡片推近时（原 27 像素）。对最终源码复量，被列出的降到 36 句，内容贴边的只剩 a11（左 57 像素）与 c14（右 57 像素）两句，各差 3 像素，没有再改。各场景标题距画面顶边约 30 像素，没有改。

**动态与声音（review 5.4）**

- 低清预演的像素级静止检测查出一段（落点场开头约 3.9 秒），已改。最终成片（第三轮渲染）：两种语言都没有 3 秒以上的静止段，没有空画面与内容很少的时段；渲染日志末行 `verified frames=19985`（中文）、`19882`（英文），与时间线总帧数一致。从成片里抽帧核对过第 0 帧、b12 说完的一刻与片尾。
- 一处潜伏的确定性问题在最后才暴露：全片第 0 帧的镜头机位时对时错（原因与做法见仓库 `docs/pitfalls.md`）。改后从成片里抽出第 0 帧核对过。
- 用总览图看过每 4 秒一帧的全片（84 帧），改掉了描线开始前露出的圆点、压住文字的印章、被卡片压住的年份等几处。
- 配乐与音效是程序合成的，核查人听不到。混音的数值自检正常（无削波，旁白之下的配乐比章节卡处低约 8 dB，低频与中频占比均衡），听感未经人耳确认。连续播放时的动作观感同样没有人看过：依据是静帧、总览图与工具的文字输出。

**原创、片尾名单与开源链接（review 5.5）**

- 参考的是微软三套设计语言的一般特征，没有复刻具体的界面、网页或视频；比较过的两个方向与取舍见 README「视觉系统」。画面里的真实材料（帖子、发布页、报道标题、回显、源码行）各带出处。
- 从两种语言的成片里各抽出片尾一帧核对：都有「策划：WaterRun」（英文 `Planning: WaterRun`）、Claude Opus 5.5 及分工、旁白所用的语音服务（模型未披露）、配乐与音效为程序合成、以及「开源视频 github.com/Water-Run/ft」（英文 `Open-source video`）。片尾约 9 秒，最小的字 28 像素。仅旁白版与无配乐版用的是同一条画面。
- 2026-10-07 打开 `https://github.com/Water-Run/ft`：返回 200，仓库公开，许可证 GPL-3.0，默认分支 main。

**闸门**：`check.js --final` 于 2026-10-07 全部通过。

**未做**：发布。成片在制作机上，没有上传。

## 取证中发现、没有进入成片的事实

- 微软 2019 年给出的数量级是「解压压缩包最多快 20 倍，`git clone`、`npm install`、`cmake` 快 2–5 倍」。本片只用了本机实测的 7.2 倍。
- 版本 1 里用 `wsl.exe` 启动的 `sleep`，在 Windows 的进程表里查不到同名进程，只看到几个没有命令行的 `init`（`out_12`「b」）。「WSL 1 的 Linux 进程在 Windows 一侧可见」这一说法因此没有用。
- 端口映射在 Windows 一侧由哪个进程监听，`Get-NetTCPConnection` 没有查到（`out_15`「a」），没有用。
- 文档把 WSL 容器的最低版本写作 2.9.3，而 2.9.x 全部是预发布；稳定线在 3.0.1 之前停在 2.7.14。
- 发布博文还提到 Defender for Endpoint 与 Intune 对容器的管理、新的网络模式名为 consomme、Windows 应用可经 API 创建容器。前两项与本片主线无关，后一项只在文档里读到，没有实测。
- 会话虚拟机的内核命令行带 `WSLC_ROOT_INIT=1`，发行版虚拟机带 `WSL_ROOT_INIT=1`：同一个内核、同一个 initrd，两种启动方式（`out_11`、`out_14`；源码 `src/shared/inc/lxinitshared.h`）。
- 实验用的 `wslc pull alpine:3.24.2` 因测试机连不上镜像仓库而失败（`out_14`「7」），所以映像一律用 `wslc import` 从本地压缩包导入。
