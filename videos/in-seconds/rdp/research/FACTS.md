# 事实出处

取证日期：2026-11-07。对象：微软远程桌面协议（RDP）及其历史；对照对象：以视频流方式工作的远程软件（Parsec、Sunshine + Moonlight）。取证人：Claude Opus 5.5（准备方兼制作方）。

优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。做法见仓库 `docs/guides/research.md`。待核实的内容不进定稿。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| [MS-RDPBCGR] Basic Connectivity and Graphics Remoting | v20260309（Release: March 9, 2026） | `https://winprotocoldocs-bhdugrdyduf5h2e4.b02.azurefd.net/MS-RDPBCGR/%5bMS-RDPBCGR%5d.pdf`，存 `research/_src/`（不入库），sha256 `77fae7d35a5cc4f3d0f4ab86ed752182ec675369655259cb999b7c41290d2d7d` |
| [MS-RDPEGDI] GDI Acceleration Extensions | v20240423（Release: April 23, 2024） | 同上路径换名，sha256 `665f2f45ac81aa3124a7c85e78a781a319e3130bd5bcbc6acef0a8b75c14d38e` |
| [MS-RDPEGFX] Graphics Pipeline Extension | v20260511（Release: May 11, 2026） | 同上，sha256 `ac6d4de488fcf92eacb8730cc6a76f3e5b1d2b95cb86f156f24c99bc8fef9077` |
| [MS-RDPEUDP] UDP Transport Extension | v20251121（Release: November 21, 2025） | 同上，sha256 `366e4c9a3f9ab4fce7a2f600500f10761388c00cb11431884df446087f269b65` |
| 本机实验环境 | Windows NT 10.0.26340（Windows 11 Pro for Workstations），mstsc.exe 10.0.26100.9949 | `research/lab/01_local_rdp.ps1` |
| ffmpeg / libx264 | `ffmpeg version N-127021-ge0c94b2d1c-20260930`（仓库 `assets/ffmpeg/`） | `research/lab/02_h264_frames.py`、`03_chroma_text.py` |
| 字体（实验画面） | 仓库 `assets/fonts/JetBrainsMono.ttf`、`NotoSansSC.ttf` | 仓库自带 |

PDF 用 `pdftotext -layout` 转成文本后检索；下表的「第 X 节」是规范自身的节号，页码是 PDF 页脚的页码。

## 对象与解释路径

RDP 让一台电脑上的会话在另一台电脑上显示和操作：程序在远端（服务器）运行，客户端只负责把画面显示出来、把键盘鼠标送回去（B1）。它出自 1997 年微软与 Citrix 合作的「Hydra」项目，1998 年随 Windows NT Server 4.0 Terminal Server Edition 发布：一台服务器同时承载多个会话，用户用便宜的 Windows 终端或旧电脑连上来（H1–H5）；协议基于 ITU 的 T.120 会议协议族（H3）。Windows XP 专业版把「远程桌面」带到桌面系统（H6）。

传画面有两种思路：

1. **把屏幕当视频**：抓整屏原始帧 → 编码（H.264，交给显卡的硬件编码器）→ 发送 → 解码 → 显示（V1–V3）。它不关心画面里是什么，任何程序都能传；代价是每一帧都按像素编码。
2. **传画画的命令**（RDP 经典做法，MS-RDPEGDI）：服务器端的显示驱动拿到的是 Windows 的绘图操作（T1），RDP 把「填一个矩形」「用缓存里的字形写一行字」「把屏幕上一块搬到另一处」编码成短指令发给客户端，由客户端自己画（G1–G6）；常用的东西（字形、位图、画刷）只传一次，存进双方同步的缓存，之后按编号引用（G2）。字形是 1 位/像素的位图，客户端画出的字与原来逐点相同（G7）。

一次完整操作的对照（同一处画面变化）：规范的带注释样例给出 RDP 指令的字节数（G4–G6）；本片实验把同样的变化交给 libx264 编码，读出视频一帧的字节数（L2）。

画面之外，RDP 在同一条连接里开出虚拟通道，剪贴板、驱动器、打印机、声音各自传数据（B3、B4、H7）。

Windows 8 / Server 2012 起有了新的图形管线 MS-RDPEGFX 与 UDP 传输（N1–N3）；RDP 8.1 起图像也可用 H.264，文字用专有编码；RDP 10 加入全屏 AVC 4:4:4，以解决 4:2:0 压缩让文字发虚的问题（N4–N6）。新管线仍保留「填色」「表面之间搬移」「缓存与表面互拷」这类命令（N2）。

**尚未弄清**：Windows 8 之后的服务器在什么条件下还会发送 MS-RDPEGDI 的经典绘图指令（GlyphIndex、FastIndex 等），规范的产品行为附录没有写明（见文末「没有进入成片的事实」）。因此文案把 G 系列表述为「RDP 的经典做法」，现代管线只讲 N 系列有出处的部分。

## 逐章

### open：开头的场景

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| B1 | RDP 把远端电脑的图形显示数据传给用户，把用户的输入命令传回远端，在远端重放 | [MS-RDPBCGR] 第 1 节：「facilitates user interaction with a remote computer system by transferring graphics display data from the remote computer to the user and transporting input commands from the user to the remote computer, where the input commands are replayed on the remote computer.」第 1.3 节同义 | Microsoft Learn 同节网页（2026-03-06 更新）；Hydra 白皮书「all other operating-system functions, as well as the applications, run completely on the server」（H4） | 规范 v20260309 | 2026-11-07 已核 |
| B2 | 远程桌面连接客户端的程序名 mstsc.exe；本机版本 10.0.26100.9949 | `lab/out_01_local_rdp.txt` 第 2 行 | 本机 `C:\Windows\System32\mstsc.exe` 存在 | 本机，2026-11-07 | 已核 |
| w4 | Windows 自带客户端，中文系统里名为「远程桌面连接」 | `lab/out_01_local_rdp.txt`「mstsc.exe FileDescription: 远程桌面连接」（zh-CN 系统） | H6：XP 起「Remote Desktop Connection tool is installed by default」 | 本机，2026-11-07 | 已核 |

### what：它是什么

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| P1 | RDP 服务端默认监听 TCP 3389 端口；没有官方分配的端口号 | [MS-RDPBCGR] 第 2.1 节：「There is no officially assigned TCP port for [MS-RDPBCGR], but protocol servers listen by default on TCP port 3389」；附录 <1>：「By default, Microsoft RDP servers listen on port 3389.」 | 实验：`lab/out_01_local_rdp.txt`「RDP-Tcp PortNumber: 3389」 | 规范 v20260309；本机 | 已核 |
| P2 | 本机会话列表：services（ID 0）、console（ID 3，运行中）、rdp-tcp（ID 65536，侦听） | `lab/out_01_local_rdp.txt`（qwinsta；用户名已替换为 user） | — | 本机，2026-11-07 | 已核（只作画面素材） |
| B3 | 静态虚拟通道在主 RDP 连接上无损传输；内容对 RDP 不透明；连接时最多建 31 条 | [MS-RDPBCGR] 第 1.3.3 节：「Static Virtual Channels allow lossless communication… A maximum of 31 static virtual channels can be created at connection time.」 | — | 规范 v20260309 | 已核 |
| B4 | 规范的连接样例中出现 rdpdr、cliprdr、rdpsnd 三条通道 | [MS-RDPBCGR] 第 4.1.8.3–4.1.8.5 节（Channel 1004 rdpdr、1005 cliprdr、1006 rdpsnd） | XP 文档列出驱动器、音频、打印机、共享剪贴板（H7） | 规范 v20260309 | 已核 |

### history：历史

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| H1 | 1997 年 5 月 12 日微软宣布与 Citrix 的联合开发协议：微软获得 Citrix 现有多用户技术的授权，双方合作开发 Windows NT「Hydra」 | 微软白皮书《Microsoft Windows NT Hydra: The Benefits of Windows with the Low Cost of a Terminal》（July 1997，MSDN Background，镜像 `https://techshelps.github.io/MSDN/BACKGRND/html/msdn_hydrawp.htm`）：「On May 12, 1997, Microsoft Corporation announced a joint development agreement with Citrix Systems Inc. Under this agreement, Microsoft will license existing Citrix multiuser technology…」 | 微软 1998-06-16 新闻稿：「Announced in May 1997, the Terminal Server Edition is a joint development effort between Microsoft and Citrix Systems Inc.」 | 1997 | 2026-11-07 已核 |
| H2 | 1998 年 6 月 16 日，微软宣布 Windows NT Server 4.0 Terminal Server Edition 交付生产；能在一台服务器上同时承载多个客户端会话 | 微软新闻稿 `https://news.microsoft.com/1998/06/16/microsoft-releases-windows-nt-server-4-0-terminal-server-edition`（NEW YORK, June 16, 1998）：「announced the release to manufacturing of… Windows NT Server 4.0 Terminal Server Edition」「the ability to host multiple, simultaneous client sessions」 | TSE 架构概览（Learn previous-versions cc751283）「A multiuser server core that provides the ability to host multiple, simultaneous client sessions」 | 1998 | 已核（新闻稿经 web-fetch 读到；本机 curl 被 Cloudflare 拦截） |
| H3 | 这套协议基于 ITU 的 T.120 协议族（多通道会议标准，当时用于微软 NetMeeting） | Hydra 白皮书：「This protocol is based on International Telecommunications Union's (ITU) T.120 protocol, an international, standard multichannel conferencing protocol currently used in the Microsoft NetMeeting conferencing software product.」 | TSE 架构概览：「Remote Desktop Protocol (RDP) is based on, and is an extension of, the T-120 protocol family standards.」；[MS-RDPBCGR] 引用 T.122、T.124、T.128 并有「Slow-Path (T.128) Formats」一节 | 1997–1998 | 已核 |
| H4 | 目标：低成本的 Windows 终端（白皮书称目标价每台 500 美元以下）与无法升级的旧电脑，都能用上服务器上运行的 32 位 Windows 程序；客户端只含启动、连接、显示界面所需的最少软件 | Hydra 白皮书：「a new class of low-cost hardware, commonly referred to as Windows-based terminals」「older Windows-based personal computers that cannot be upgraded」「with a target price range below $500 per Windows-based terminal desktop」「contains only the minimum amount of software necessary to boot the device, establish a connection to the server, and present the user interface」 | 1998 新闻稿：「users with computers that cannot run the latest version of Windows today」 | 1997 | 已核 |
| H5 | TSE 的服务器端用 RDP 显示驱动 rdpdd.dll 截取 Windows 用户界面，转成 RDP 协议；Windows for Workgroups 版客户端约 70K | TSE 架构概览（`https://learn.microsoft.com/en-us/previous-versions/cc751283(v=technet.10)`，Archived content）：「The new display driver is the Remote Desktop Protocol (RDP) display device driver (rdpdd.dll).」「RDPDD … captures the Windows user interface and translates it into a form that is readily converted by RDPWD into the RDP protocol.」「The WFW RDP client is approximately 70K in size」 | — | NT 4.0 TSE | 已核（单一出处，只作背景，不上屏数字） |
| T1 | （由 H5 与 G1 合起来）RDP 服务端在显示驱动层拿到的是绘图操作，所以能编码「画法」而不是图像 | H5 + G1 | — | 经典 RDP | 已核（两处官方文档合读） |
| H6 | Windows XP 专业版的「远程桌面」基于终端服务技术，是此前只在 Windows 2000 Server 系列提供的终端服务功能的延伸；XP 专业版与家庭版都默认装有「远程桌面连接」客户端 | Windows XP Professional Resource Kit「Configuring Remote Desktop」（`https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-xp/bb457106(v=technet.10)`）：「Remote Desktop in Windows XP Professional is an extension of the Terminal Services functionality formerly available only in the Microsoft Windows 2000 Server family」「The Remote Desktop Connection tool is installed by default when you install Windows XP Professional or Microsoft Windows XP Home Edition.」 | — | Windows XP | 已核 |
| H6y | Windows XP 的年份为 2001 | 微软产品生命周期页 Windows XP「Start Date 12/31/2001」（`https://learn.microsoft.com/en-us/lifecycle/products/windows-xp`） | 维基百科「Windows XP」：2001 年 10 月 25 日零售（二手来源，只作印证） | 截至 2026-11-07 | 已核（画面只写年份 2001） |
| H7 | XP 的远程桌面会话里可以使用客户端的驱动器、音频、串并口和打印机；两端共享剪贴板 | 同 H6 文档：「many of the client resources are available within the session, including the client drives, audio sources, serial and parallel ports, and printers」「the local and the remote computer share a clipboard」 | B4 | Windows XP（RDP 5.1） | 已核 |

### main：传画面的两种思路

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| V1 | Parsec 的核心是视频串流：抓取原始桌面帧 → 编码 → 发送 → 解码 → 显示；编码用 H.264，并且只用显卡的硬件编解码 | Parsec 博客《The Technology Behind A Low Latency Cloud Gaming Service》（Chris Dickson，`https://parsec.app/blog/description-of-parsec-technology-b2738dcc3842`）：「At its core, Parsec is a high performance video streaming app.」及五步列表；「H.264 is really the only viable choice」「we always offload this video processing to special ASICs on your GPU」 | Sunshine README：「Self-hosted game stream host for Moonlight」，用 AMD/Intel/NVIDIA 显卡硬件编码；Moonlight-qt README：「H.264, HEVC, and AV1 codec support」 | 读于 2026-11-07 | 已核 |
| V4 | ToDesk 官网以帧率、编解码描述画面传输：「画面从编码到解码全程无卡顿」「8K和360FPS，<3ms延迟，真彩模式」「4K原画画质，<0.04秒超低延时，4：4：4真彩无损」，并单列「远程游戏」场景 | ToDesk 官网首页 `https://www.todesk.com/`（2026-11-07 读取） | 第三方评测列出 ToDesk 可选 H.264/H.265/AV1 等编码（gitcode 横评，二手，只作印证） | 截至 2026-11-07 | 已核（官网用语）。「4:4:4」是视频色度采样的说法，「编码到解码」「FPS」表明画面以视频帧传输；未见 ToDesk 技术白皮书 |
| V5 | UU 远程（网易）官网：「4K 144 帧随心玩」「超低延迟，丝滑畅玩 3A 大作」「高清高帧，无损还原 PC 画质」「真彩模式」；App Store 名称「UU远程-游戏串流/远程办公」，开发者广州网易计算机系统有限公司 | 网易 UU 远程官网 `https://uuyc.163.com/`（2026-11-07 读取）；App Store id1642306791 | 凤凰网科技报道（二手） | 截至 2026-11-07 | 已核（官网与商店用语）。「串流」「帧」表明以视频帧传输；未见技术白皮书 |
| V6 | 策划者把 ToDesk、UU 远程归为「视频流远程」 | 2026-11-07 会话原话（README「简报」） | V4、V5 的官网用语一致 | — | 与 V4、V5 合读后采用；旁白说它们「把屏幕录成视频、一帧帧发过来」 |
| V2 | 这类软件以游戏为主要目标；Parsec 文中以 60 FPS 为目标帧率，并说 20 ms 与 40 ms 的总延迟决定能不能玩 | Parsec 博客：「streaming PC games at extremely low latency and 60 FPS」「a 20 ms total latency vs. a 40 ms total latency can be the difference between awesome and unplayable」；「Parsec gives you full desktop access and works with any program, game or not.」 | Sunshine README「low-latency, cloud gaming server capabilities」 | 同上 | 已核 |
| V3 | 视频方式工作在帧缓冲层面，因此适用于任何窗口系统与程序（VNC/RFB 的同类说法） | RFC 6143 第 1 节：「Because it works at the framebuffer level, it is applicable to all windowing systems and applications」 | V1「works with any program, game or not」 | RFC 6143（2011） | 已核（RFB 不是视频编码，只引用「帧缓冲层面因而通用」这一点） |
| G1 | GDI 加速扩展通过编码「产生图像的绘图操作」而不是图像本身来降低带宽；例：不发填好的矩形的位图，而发「在 (X,Y) 画宽、高、颜色为…的矩形」，客户端执行指令得到结果 | [MS-RDPEGDI] 第 1.3.1 节（第 13 页） | Microsoft Learn MS-RDPEGDI 首页描述同义 | v20240423 | 已核 |
| G2 | 规范定义多种缓存：位图、调色板、字形、字形片段、画刷、离屏位图等；缓存的东西只从服务器传一次，之后用缓存编号引用；淘汰由服务器决定并通知客户端，双方缓存保持同步 | [MS-RDPEGDI] 第 1.3.1.1 节（第 14 页） | — | v20240423 | 已核 |
| G3 | 主绘图指令按字段压缩：字段没变就不发，能用短编码就用短编码；类别包括位块传输、矩形/线/多边形/椭圆、文字、屏幕区域搬移、缓存位图等；做不成指令的区域改发位图 | [MS-RDPEGDI] 第 1.3.1.2.1 节（第 15 页） | — | v20240423 | 已核 |
| G4 | OpaqueRect 样例：10 个字节 `09 0a 3c 00 04 00 03 73 02 06`，把宽 1024、高 768 的矩形填成一种颜色（左、上坐标沿用上一条，不发） | [MS-RDPEGDI] 第 4.1.5 节 | — | v20240423 | 已核。注：样例字节里红色分量是 `73`，注释写成 0x74，规范自相矛盾；画面不显示颜色值 |
| G5 | ScrBlt 样例：14 个字节，把屏幕上 (303,142) 起宽 417、高 241 的一块搬到 x=7 处（上坐标沿用上一条） | [MS-RDPEGDI] 第 4.1.7 节：dump 一行列出 13 个字节 `09 02 7d 07 00 a1 01 f1 00 cc 2f 01 8e`，注释逐字段列到 nYSrc = `8e 00` | 按同节注释核算：头 3 字节（controlFlags、orderType、1 字节 fieldFlags）+ nLeftRect 2 + nWidth 2 + nHeight 2 + bRop 1 + nXSrc 2 + nYSrc 2 = 14 | v20240423 | 已核。dump 少印了末字节 `00`，以注释的字段为准记 14 |
| G4b | OpaqueRect 样例的内部不一致 | 第 4.1.5 节 fieldFlags 写 0x3c（字段 3–6），但 dump 含 Blue 字段，红色字节与注释不符 | 若按 0x7c（字段 3–7，宽、高、红、绿、蓝）编码，同样是 10 个字节 | v20240423 | 已核：10 字节这一数不受影响 |
| G6 | FastIndex 样例：47 个字节，从 7 号字形缓存里取 9 个字形（编号 0–8）排成一行，并把这串字形存成片段 0（18 字节）供复用 | [MS-RDPEGDI] 第 4.1.14.1 节 | — | v20240423 | 已核（dump 共 0x2F = 47 字节） |
| G7 | 字形缓存里存的是 1 位/像素的位图；规范样例：字母「d」宽 5、高 9 像素，位图 9 个字节 `08 08 08 78 88 88 88 88 78`；Cache Glyph 样例一条 68 字节，一次存入 L、g、O 三个字形（缓存号 49、50、51） | [MS-RDPEGDI] 第 2.2.2.2.1.2.5 节（aj 字段）、第 4.6.1 节、第 4.2.4 节 | — | v20240423 | 已核 |
| L2 | 同样的变化交给 H.264（libx264 veryfast zerolatency CRF 23，yuv420p，1024×768）：打字后的一帧 667 字节；滚动三行后的一帧 23159 字节；整屏换成一种颜色的一帧 950 字节；画面不变的一帧 311 字节 | `lab/out_02_h264_frames.txt` | — | 本机，2026-11-07 | 已核。口径：实验画面是仿记事本的白底文字页，滚动是整页上移三行（比规范样例的 417×241 搬移大），H.264 那一帧同时包含露出来的新行；RDP 一侧滚动后露出的新行还要另发文字指令。比较只说「同一类变化，量级不同」，不说倍数 |
| L3 | 彩色小字经 H.264 yuv420p 编码后变淡、发虚；红字区域平均每通道色差约 3，黑字约 0.45 | `lab/out_03_chroma_text.txt`；放大对照图 `_frames/03_pair.png`（不入库，可重做） | 微软 RDP 10 博客：「the color conversion process that happens as part of the compression … throws away some of the chrominance information, as represented in the 4:2:0 format」 | 本机，2026-11-07 | 已核 |

| P3 | 连接类型（客户端报给服务器）：Modem (56 Kbps)、Low-speed broadband (256 Kbps - 2 Mbps)、Satellite (2 Mbps - 16 Mbps with high latency)、High-speed broadband (2 Mbps - 10 Mbps)、WAN、LAN、自动检测 | [MS-RDPBCGR] 第 2.2.1.3.2 节 connectionType（CONNECTION_TYPE_MODEM 0x01 … CONNECTION_TYPE_AUTODETECT 0x07） | 实验：本机中文版 mstsc.exe.mui 里的选项原文「调制解调器(56 kbps)」「卫星(2 Mbps - 16 Mbps，高延迟)」等（`lab/out_05_connection_speed.txt`） | v20260309；本机 2026-11-07 | 已核 |
| L4 | 按带宽算传输时间（字节 × 8 ÷ 带宽，不含延迟与开销）：56 kbps 上，实验 02 滚动那一帧（23159 字节）约 3.31 秒，RDP 搬移指令（14 字节）约 2.00 毫秒；卫星下限 2 Mbps 上分别约 92.6 毫秒与 0.06 毫秒 | `lab/out_05_connection_speed.txt`（由 L2、G5 算出） | — | 本机，2026-11-07 | 已核。口径：只是那一帧的纯传输时间；真实的视频流在慢网上会降码率、降画质，旁白说「刚才那一帧录像要传三秒多」，不说「视频流在拨号上用不了」 |

### adapt：远程桌面适应你的电脑

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| A1 | 连接时客户端在 Client Core Data 里报上：请求的桌面宽、高（像素），当前键盘布局（输入法区域标识），桌面方向，桌面缩放比例（100%–500%）与设备缩放比例 | [MS-RDPBCGR] 第 2.2.1.3.2 节 TS_UD_CS_CORE：「desktopWidth … The requested desktop width in pixels」「keyboardLayout … The active input locale identifier」「desktopScaleFactor … The requested desktop scale factor」 | — | v20260309 | 2026-11-07 已核 |
| A2 | 客户端在扩展信息包里报上自己的时区（clientTimeZone，RDP 5.0、5.1 服务器不读） | [MS-RDPBCGR] 第 2.2.1.11.1.1.1 节 clientTimeZone | — | v20260309 | 已核 |
| A3 | 显示控制通道：会话中客户端可请求改变显示配置（加显示器、改分辨率），配置有效时服务器重设会话的显示；每台显示器可带缩放比例；适用产品从 Windows 8.1 / Server 2012 R2 起 | [MS-RDPEDISP] 第 1.3 节：「To request a display configuration change on the server (such as the addition of a monitor or a new resolution for an existing monitor), the client sends the DISPLAYCONTROL_MONITOR_LAYOUT_PDU」；第 2.2.2.2.1 节 DesktopScaleFactor；第 6 节产品列表。v20240423，sha256 `13763151c7fa57273e97ebda0dd244936bb2aba55ea08356017b081ccaac0079` | — | Windows 8.1 起 | 已核 |
| A4 | 视频流远程抓取的是主机桌面本来的帧（主机的分辨率）；客户端窗口尺寸不同就要缩放显示 | V1（「Capture raw desktop frames」）、V3（帧缓冲层面）合读 | — | — | 推论，已核依据；旁白只说「尺寸对不上就整张缩放」，不说一定变糊。ToDesk 官网另有「虚拟屏」功能，成片不说视频流远程「做不到」适配 |

### limit：深度绑定

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| D1 | 能被远程桌面连入的是 Windows 专业版、企业版、教育版与 Server；家庭版不能作主机，只能作客户端 | Microsoft Learn「Remote Desktop - Allow access to your PC」：「Windows Home editions can't serve as Remote Desktop hosts」（Last updated 2025-06-18） | Microsoft Support「How to use Remote Desktop」：被连的电脑须为 Pro；发起连接的一端可以是任何版本，甚至别的操作系统 | 截至 2026-11-07 | 已核 |
| D2 | 经典绘图指令是照 Windows 的图形接口 GDI 设计的（规范名即「GDI Acceleration Extensions」，另有 GDI+ 缓存、NineGrid 位图）；做不成指令的区域改发位图 | [MS-RDPEGDI] 标题、第 1.3.1.1 节、第 1.3.1.2.1 节 | — | v20240423 | 已核 |
| D3 | ToDesk 官网：「全平台覆盖 Win/Mac/Linux/Android/iOS/鸿蒙」；UU 远程官网列出 Windows、macOS、iOS、Android、TV | 两家官网（2026-11-07 读取） | V3：工作在帧缓冲层面因此适用于所有窗口系统 | 截至 2026-11-07 | 已核 |

### boundary：新管线与边界

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| N1 | 图形管线扩展 MS-RDPEGFX 适用产品从 Windows 8 / Windows Server 2012 起 | [MS-RDPEGFX] 第 6 节 Appendix A（第 138 页）产品列表首项 | Windows 8 生命周期起始日 10/30/2012（`https://learn.microsoft.com/en-us/lifecycle/products/windows-8`） | v20260511 | 已核 |
| N2 | 新管线的命令包括：纯色填充 SOLIDFILL、表面之间搬移 SURFACE_TO_SURFACE、表面存入缓存与从缓存取回、把编码后的位图写进表面；编码有 ClearCodec、Planar、RemoteFX Progressive、AVC420、AVC444 等 | [MS-RDPEGFX] 第 1.3 节（五类命令）与第 2.2.2.1 节 codecId 表 | — | v20260511 | 已核 |
| N3 | UDP 传输扩展用于改善广域网与无线网络下的表现，分可靠与不可靠两种模式，带前向纠错；适用产品从 Windows 8 起 | [MS-RDPEUDP] 第 1.3 节；第 6 节产品列表 | — | v20251121 | 已核 |
| N4 | RDP 8.1 引入 AVC/H.264 混合模式：图像也用 H.264，文字用专有编码 | 微软远程桌面团队博客《Remote Desktop Protocol (RDP) 10 AVC/H.264 improvements in Windows 10 and Windows Server 2016 Technical Preview》（CloudBlogs 2016-01-11 首发，techcommunity 转载）：「With RDP 8.1 we introduced an AVC/H.264 mixed mode which … extended support for AVC/H.264 to images as well, while text is compressed using a proprietary Codec.」 | — | 2016 | 已核 |
| N5 | RDP 10 引入全屏 AVC 4:4:4 模式；起因是 4:2:0 压缩丢掉部分色度信息，文字发虚 | 同上，「Introducing the AVC 444 mode」节 | L3 实验 | Windows 10 / Server 2016 | 已核 |
| N6 | H.264 的好处是普遍有硬件支持，编解码可以交给独立的硬件模块 | 同上，「RDP and AVC/H.264」节：「widely available in hardware so that CPU intensive encoding and decoding can be offloaded to a separate hardware block」 | V1 | 2016 | 已核 |
| N7 | Windows 10 的年份为 2015 | Windows 10 Home and Pro 生命周期起始日 7/29/2015 | — | 截至 2026-11-07 | 已核 |

## 取证中发现、没有进入成片的事实

- Hydra 白皮书同日提到微软与 Prologue Software 的多用户技术授权；Citrix 另做名为「Picasso」的 ICA 附加产品。与主线无关。
- 1998 新闻稿给出 TSE 定价 1,129 美元（含 10 个文件与打印 CAL）；数字对观众无用。
- TSE 自 2000 年 8 月起只以 OEM 形式提供（二手来源，未核）。
- RDP 4.0 批量压缩基于 MPPC；RDP 5.0 用 64 KB 历史缓冲（[MS-RDPBCGR] 第 3.1.8 节）。
- 1997 年协议的确切签约日期在不同来源里是 5 月 9 日、12 日或 13 日；成片只用年份。
- Windows 8 之后的服务器是否、在什么条件下仍发送 MS-RDPEGDI 经典指令：规范没有写明，未核。成片不说「今天的 Windows 11 仍发 FastIndex」。
- XP 家庭版只有客户端、不能被远程连入：日文二手资料（@IT）所说，未读到微软原文，不进成片。
- 「客户端画出来的字与原来逐点相同」只对经典字形缓存路径成立（G7）；新管线下文字用 ClearCodec 等编码，是否无损未逐项核对，不在旁白里推到新管线。

## 复核

未做（成片之后进行）。
