# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

## 取证范围与限制

- 取证日期：2026-10-20。对象：RDP（Remote Desktop Protocol）本身，即它怎么分层、一次连接里发生什么、它提供哪些能力、代价是什么，以及它与 VNC / SSH 的分工。
- 一手来源：Microsoft Open Specifications（[MS-RDPBCGR] 等）、RFC 1006（TPKT）、RFC 4254（SSH 连接协议）、noVNC 官方仓库源码（RFB 协议实现）。
- **本片没有做抓包实验**：本机没有可连接的 RDP 服务端，无法取得真实会话的字节流。因此本片的 RDP 侧事实全部来自规范原文；规范中查不到的一律标「待核实」，不写进定稿。
- 规范页面的在线正文用 `?accept=text/markdown` 读取；标注「目录标题」的条目来自 Microsoft Learn 的 Open Specifications 目录（`toc.json`），对应小节的正文页在 Learn 上渲染为空，已记为待复核。
- 规范版本与读取日期：MS-RDPBCGR 修订 62.0（2026-03-09 发布，页面 last updated 2026-03-06）；MS-CSSP 修订 21.0（2024-04-23）；MS-RDPEUDP 页面 last updated 2025-11-21；MS-RDPEMT 页面 last updated 2024-04-23；MS-RDPEGFX 页面 last updated 2025-08-11；RFC 9110 = 2022-06；RFC 6585 = 2012-04；RFC 1006 = 1987-05；RFC 4254 = 2006-01。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| Microsoft Learn Open Specifications | MS-RDPBCGR 62.0、MS-CSSP 21.0、MS-RDPEUDP / MS-RDPEMT / MS-RDPEGFX / MS-RDPRFX 现行版 | `https://learn.microsoft.com/en-us/openspecs/windows_protocols/<文档缩写>/<GUID>?accept=text/markdown`，2026-10-20 读取 |
| RFC 1006（ISO Transport Service on top of the TCP, Version 3） | 1987-05 | `https://www.rfc-editor.org/rfc/rfc1006.txt` |
| RFC 4254（SSH Connection Protocol） | 2006-01 | `https://www.rfc-editor.org/rfc/rfc4254.txt` |
| noVNC（HTML5 VNC 客户端） | master 分支 `core/rfb.js` | `https://raw.githubusercontent.com/novnc/noVNC/master/core/rfb.js`，2026-10-20 读取 |
| 抓包实验 | 未做 | 本机无可连接的 RDP 服务端；见「尚待核实」 |
| 制作机 | 制作机 A（Windows，PowerShell 7.6.7，Node 24.21.0） | 仓库 `docs/environment.md` |

## 逐章

### 01 它解决什么问题

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 01-1 | RDP 把远程计算机的图形显示信息传给用户，并把用户的输入送回远程计算机重放 | [MS-RDPBCGR] 1.3 Overview（`1e86b4e6-ecf8-4b64-918f-f57bfe58438e`） | [MS-RDPEGFX] 1 Introduction（`0926f8c8-33e1-44ef-baee-3446f2192b0f`）：图形协议用于高效编码远端会话产生的显示数据，净效果是远端桌面看起来像本地运行 | 现行规范，截至 2026-10-20 | 2026-10-20 已读 |
| 01-2 | RDP 还提供一种可扩展的传输机制，让用户端组件与远端组件之间通信 | [MS-RDPBCGR] 1.3 Overview | [MS-RDPBCGR] 1.4 Relationship to Other Protocols：十余个扩展隧道在 RDP 的静态虚拟通道与动态通道里 | 现行规范 | 2026-10-20 已读 |
| 01-3 | RDP 建立在 ITU-T T.120 系列协议之上：X.224（连接模式传输服务）、T.122、T.123、T.124、T.125（多点通信服务）、T.128（通用会议控制） | [MS-RDPBCGR] 1.4 Relationship to Other Protocols | [MS-RDPBCGR] 2.2.1.1：第一个连接请求的 `x224Crq` 字段就是「X.224 Class 0 Connection Request TPDU」（引用 [X224] §13.3） | 现行规范 | 2026-10-20 已读 |
| 01-4 | 「优雅」的第一层：它不自己发明会话协议，而是复用 ITU 已经定好的一套会议协议骨架，再往里填自己的图形与输入语义 | [MS-RDPBCGR] 1.4（协议族归属）+ 1.3.1.1（自有阶段划分） | 1.3.1.1 的十个阶段里，只有「Basic Settings Exchange」把核心数据塞进 T.125 的 MCS Connect PDU，其余照 T.120 的 MCS/GCC 走 | 现行规范 | 2026-10-20 已读；「优雅」是本片的归纳，不是规范原话 |
| 01-5 | 服务器用 Demand Active PDU 宣告自己的能力，客户端用 Confirm Active PDU 应答；能力集里包含支持的 PDU 与绘图命令、桌面尺寸与颜色深度、输入设备支持、缓存结构与特性支持 | [MS-RDPBCGR] 1.7 Versioning and Capability Negotiation | [MS-RDPBCGR] 1.3.1.1 阶段 8「Capabilities Exchange」与 2.2.7 的 Mandatory / Optional Capability Sets 目录 | 现行规范 | 2026-10-20 已读 |

### 02 协议怎么分层

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 02-1 | RDP 的数据包封装在 TCP 里，TCP 之上是 IP v4 或 v6 | [MS-RDPBCGR] 2.1 Transport（`46aacbdd-1b16-4eba-b174-a672df4ac20b`） | [MS-RDPBCGR] 2.2.1.1 的字段图：连接请求最外层是 `tpktHeader` | 现行规范 | 2026-10-20 已读 |
| 02-2 | RDP 没有被 IANA 分配专用 TCP 端口，但协议服务器默认监听 3389 | [MS-RDPBCGR] 2.1 Transport | — | 现行规范 | 2026-10-20 已读；单一出处 |
| 02-3 | 最外层是 TPKT：4 字节头 = 1 字节版本（本版本恒为 3）+ 1 字节保留 + 2 字节整包长度（7–65535，含头） | RFC 1006 §6 Packet Format | [MS-RDPBCGR] 2.2.1.1：「tpktHeader（4 字节）：A TPKT Header, as specified in [T123] section 8」 | RFC 1006 v3，1987-05 | 2026-10-20 已读 |
| 02-4 | TPKT 之上是 X.224：第一次握手发 Class 0 Connection Request PDU，服务器回 Class 0 Connection Confirm PDU；从这一步起双方所有数据都包在 X.224 Data PDU 里 | [MS-RDPBCGR] 1.3.1.1 阶段 1 | [MS-RDPBCGR] 2.2.1.1：`x224Crq` = X.224 Class 0 Connection Request TPDU | 现行规范 | 2026-10-20 已读 |
| 02-5 | X.224 之上是 MCS（T.125 多点通信服务）：客户端发 Erect Domain（建域）与 Attach User（挂用户），服务器回 Attach User Confirm（带 User Channel ID）；随后客户端用 MCS Channel Join Request 加入 user 通道、I/O 通道和全部静态虚拟通道 | [MS-RDPBCGR] 1.3.1.1 阶段 3 | [MS-RDPBCGR] 2.2.1.3.2 `earlyCapabilityFlags` 的 `RNS_UD_CS_SUPPORT_SKIP_CHANNELJOIN`：可以跳过 MCS Channel Join，把所有通道视为已加入 | 现行规范 | 2026-10-20 已读 |
| 02-6 | 从 MCS 层起，客户端→服务器的数据包在 MCS Send Data Request 里，服务器→客户端的在 MCS Send Data Indication 里；此外还要再包一层 X.224 Data PDU | [MS-RDPBCGR] 1.3.1.1 阶段 3 末 | 2.2.1.3.2 的 `earlyCapabilityFlags` 机制本身就在 MCS Connect 的用户数据块里 | 现行规范 | 2026-10-20 已读 |
| 02-7 | 通道编号是固定的：user 通道 1007、I/O 通道 1003，静态虚拟通道从 1004 起（1004 rdpdr、1005 cliprdr、1006 rdpsnd） | Microsoft Learn Open Specifications 目录：[MS-RDPBCGR] 2.2.1.8.1–2.2.1.8.5 的小节标题（`toc.json`） | [MS-RDPBCGR] 1.3.1.1 阶段 3 提到 user 通道与 I/O 通道来自 GCC 包里嵌入的数据 | 现行目录 | 2026-10-20 目录已读；**对应小节正文页在 Learn 上为空，待用规范 PDF 复核** |
| 02-8 | 「省带宽」的第一层不是压缩，而是少发东西：能力集让双方只做对方支持的事，客户端不会发出违反对端能力的报文 | [MS-RDPBCGR] 1.7 | 1.3.1.1 阶段 8 的 Demand/Confirm Active 就是能力协商的落点 | 现行规范 | 2026-10-20 已读 |

### 03 一次会话发生了什么

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 03-1 | 一次 RDP 连接分十个阶段：连接发起 → 基本设置交换 → 通道连接 → RDP 安全开始 → 安全设置交换 → 可选的连接时网络探测 → 许可（licensing）→ 可选的多路传输引导 → 能力交换 → 连接收尾 | [MS-RDPBCGR] 1.3.1.1 Connection Sequence（`023f1e69-cfe8-4ee6-9ee0-7e759fb4e4ee`）十项列表 | 同节各阶段各自的小节编号（2.2.1.1–2.2.1.22） | 现行规范 | 2026-10-20 已读 |
| 03-2 | 「基本设置交换」阶段，客户端在 MCS Connect Initial PDU 里带 GCC Conference Create Request，服务器在 Connect Response PDU 里回 GCC Conference Create Response；两个包都携带拼接起来的设置块（核心数据、安全数据、网络数据） | [MS-RDPBCGR] 1.3.1.1 阶段 2 | [MS-RDPBCGR] 2.2.1.3.2 Client Core Data（`00f1da4a-ee9c-421a-852f-c19f92343d73`）：核心数据以 TS_UD_CS_CORE（类型 0xC001）承载 | 现行规范 | 2026-10-20 已读 |
| 03-3 | 客户端在核心数据里报自己的 RDP 版本：4 字节，高 2 字节是主版本、低 2 字节是次版本 | [MS-RDPBCGR] 2.2.1.3.2 `version` 字段 | [MS-RDPBCGR] 1.7：版本号在基本设置交换阶段交换 | 现行规范 | 2026-10-20 已读 |
| 03-4 | 版本取值：0x00080001 = RDP 4.0；0x00080004 = RDP 5.0/5.1/5.2/6.0/6.1/7.0/7.1/8.0/8.1；0x00080005 = RDP 10.0；此后每版加 1，最高到 0x00080011 = RDP 10.12 | [MS-RDPBCGR] 2.2.1.3.2 `version` 取值表 | [MS-RDPBCGR] 1.7：RDP 5.0–8.1 客户端都宣告次版本「4」，因此这个版本号并不准确反映实际版本 | 现行规范 | 2026-10-20 已读 |
| 03-5 | 能力协商在最后才发生：服务器发 Demand Active（客户端据此回 Confirm Active），之后才是连接收尾 | [MS-RDPBCGR] 1.3.1.1 阶段 8、9 | [MS-RDPBCGR] 1.7 同上 | 现行规范 | 2026-10-20 已读 |
| 03-6 | 收尾阶段的报文有固定次序：客户端发 Synchronize → Control (Cooperate) → Control (Request Control) → 可选 Persistent Key List → Font List；服务器回 Synchronize → Control (Cooperate) → Control (Granted Control) → Font Map | [MS-RDPBCGR] 1.3.1.1 阶段 9 | — | 现行规范 | 2026-10-20 已读；单一出处 |
| 03-7 | 分界线很清楚：客户端发出 Confirm Active 后就能开始发键鼠输入；服务器收到 Font List 后才能开始发图形输出 | [MS-RDPBCGR] 1.3.1.1 阶段 9 末 | 阶段 9 列出的 PDU 顺序与该句一致 | 现行规范 | 2026-10-20 已读 |
| 03-8 | 标准 RDP 安全下，客户端把 32 字节随机数用服务器公钥加密后发出，双方用两个 32 字节随机数生成会话密钥，用来加密并校验后续 RDP 流量的完整性 | [MS-RDPBCGR] 1.3.1.1 阶段 4 | [MS-RDPBCGR] 5.3 Standard RDP Security（5.3.4 Client and Server Random Values） | 现行规范 | 2026-10-20 已读 |
| 03-9 | 连接时可选地做一次网络探测，测出往返时延与链路带宽：服务器与客户端交换一组 PDU，在一段预定时间内收够数据以保证统计有意义 | [MS-RDPBCGR] 1.3.1.1 阶段 7 | [MS-RDPBCGR] 2.2.14 的 RTT / Bandwidth Measure 一组 PDU 目录 | 现行规范 | 2026-10-20 已读 |

### 04 能力与代价

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 04-1 | 静态虚拟通道在主 RDP 连接上提供无损通信；通道数据与具体应用有关，对 RDP 本身是不透明的；连接时最多建立 31 条静态虚拟通道 | [MS-RDPBCGR] 1.3.3 Static Virtual Channels（`343e4888-4c48-4054-b0e3-4e0762d1993c`） | [MS-RDPBCGR] 1.4：剪贴板、音频、文件系统、打印、输入、图形管线等扩展都隧道在静态虚拟通道里 | 现行规范 | 2026-10-20 已读 |
| 04-2 | 虚拟通道数据会被切块发送，块大小由 Virtual Channel Capability Set 里的设置决定（不含 RDP 头）；每条通道是独立数据流 | [MS-RDPBCGR] 1.3.3 | [MS-RDPBCGR] 2.2.7.1.10 Virtual Channel Capability Set（`a8593178-80c0-4b80-876c-cb77e62cecfc`）目录 | 现行规范 | 2026-10-20 已读 |
| 04-3 | 隧道在静态虚拟通道里的扩展：剪贴板 MS-RDPECLIP、音频输出 MS-RDPEA、文件系统 MS-RDPEFS、打印 MS-RDPEPC、输入 MS-RDPEI、图形管线 MS-RDPEGFX、动态通道 MS-RDPEDYC、串口 MS-RDPESP、远程程序 MS-RDPERP、智能卡 MS-RDPESC、多部件 MS-RDPEMC | [MS-RDPBCGR] 1.4 Relationship to Other Protocols | [MS-RDPEFS] 首页描述：该扩展跑在名为 RDPDR 的静态虚拟通道上 | 现行规范 | 2026-10-20 已读 |
| 04-4 | 打印扩展建立在文件系统扩展之上：它靠文件系统扩展传输自己的报文 | [MS-RDPEPC] 1.4 Relationship to Other Protocols（Learn 目录，搜索结果摘要） | [MS-RDPBCGR] 1.4 把两者都列在静态虚拟通道扩展里 | 现行规范 | 2026-10-20 已读摘要；**正文页未逐字读取，待复核** |
| 04-5 | 动态通道里再跑：多路传输 MS-RDPEMT、UDP 传输 MS-RDPEUDP、XPS 打印、即插即用、视频、音频输入、Composite Remoting V2、USB、Video Optimized Remoting、几何跟踪、显示控制等 | [MS-RDPBCGR] 1.4 | [MS-RDPEMT] 1.3 Overview：多路传输连接用来在动态虚拟通道上传输选定的流量 | 现行规范 | 2026-10-20 已读 |
| 04-6 | RDP 用批量压缩器压缩虚拟通道数据以及部分服务器→客户端的 PDU；能力在 Client Info PDU 里通告 | [MS-RDPBCGR] 1.3.4 Data Compression（`fdd7c4e9-a0f2-415d-af5e-e48389def356`） | [MS-RDPBCGR] 1.3.1.1 阶段 5（Client Info PDU 属安全设置交换阶段） | 现行规范 | 2026-10-20 已读 |
| 04-7 | 两代批量压缩器：RDP 4.0 版基于微软点对点压缩协议 MPPC（RFC 2118），用 8 KB 历史缓冲；RDP 5.0 版由它演进而来，改用 64 KB 历史缓冲与改进的 Huffman 式编码 | [MS-RDPBCGR] 1.3.4 | RFC 2118 即该段引用的规范 | 现行规范 | 2026-10-20 已读 |
| 04-8 | 位图另用游程编码（RLE）的变体压缩；所有客户端都必须能解压压缩位图，这项能力不可协商 | [MS-RDPBCGR] 1.3.4 | — | 现行规范 | 2026-10-20 已读；单一出处 |
| 04-9 | 图形管线扩展用于高效编码远端会话产生的图形显示数据，使其能在链路上传输、解码并渲染 | [MS-RDPEGFX] 1 Introduction | [MS-RDPRFX] 1.3 Protocol Overview (Synopsis)：RemoteFX 编解码扩展通过高效压缩图像降低桌面远程的带宽占用 | 现行规范 | 2026-10-20 已读 |
| 04-10 | 多路传输扩展在主 RDP 连接建立并加固之后由服务器发起，可用可靠 UDP 或有损 UDP；每条多路传输连接用 TLS（可靠那条）或 DTLS（可能丢包那条）加固，用来传输选定的动态虚拟通道流量 | [MS-RDPEMT] 1.3 Overview（`5aa61c5c-e864-4ec6-bd80-e1df51555a48`） | [MS-RDPBCGR] 1.3.1.1 阶段 8：服务器可用 Initiate Multitransport Request PDU 引导出带 RDP-UDP / TLS / DTLS 的带外连接 | 现行规范 | 2026-10-20 已读 |
| 04-11 | UDP 传输扩展的目标是提升网络占用率、减小包到达延迟的波动；分可靠模式（持续重传）与不可靠模式（不重传、保时效），并带前向纠错（FEC）以应对随机丢包 | [MS-RDPEUDP] 1.3 Overview（`fe211d97-92dd-47e6-8fa3-b23f2c1a5af9`） | [MS-RDPEUDP2] 1.3（Learn 目录摘要）：RDP-UDP2 模式为改善 WAN 或有丢包的无线网络上的表现而设计 | 现行规范 | 2026-10-20 已读摘要 + 目录摘要 |
| 04-12 | RDP 自己的连接序列不提供任何保证服务器身份被认证的机制，因此易受中间人攻击，危及两端数据的机密性 | [MS-RDPBCGR] 1.3.1.2 Security-Enhanced Connection Sequence（`49e2791f-72d0-4229-92b7-8f32c48a7206`） | — | 现行规范 | 2026-10-20 已读；单一出处 |
| 04-13 | 安全增强序列有两种走法：协商式（客户端在 X.224 Connection Request 里附上 RDP Negotiation Request 宣告支持的安全协议，服务器用 Response 选一个）与直接式（例如 CredSSP：不协商，直接先跑指定的安全协议） | [MS-RDPBCGR] 1.3.1.2 | [MS-RDPBCGR] 2.2.1.1.1：`rdpNegReq` 是 X.224 Connection Request 的可选字段 | 现行规范 | 2026-10-20 已读 |
| 04-14 | 协商请求里的协议位：PROTOCOL_RDP 0x0 = 标准 RDP 安全；PROTOCOL_SSL 0x1 = TLS 1.0/1.1/1.2；PROTOCOL_HYBRID 0x2 = CredSSP；PROTOCOL_RDSTLS 0x4；PROTOCOL_HYBRID_EX 0x8 = CredSSP 加 Early User Authorization Result；PROTOCOL_RDSAAD 0x10 | [MS-RDPBCGR] 2.2.1.1.1 RDP Negotiation Request（`902b090b-9cb3-4efc-92bf-ee13373371e3`） | [MS-RDPBCGR] 5.4.5 列出七种外部安全协议，含 TLS 各版本、CredSSP、RDSTLS、RDS AAD Auth | 现行规范 | 2026-10-20 已读 |
| 04-15 | 网络级认证（NLA）走的就是 CredSSP：协议位 PROTOCOL_HYBRID，并应当同时置 PROTOCOL_SSL，因为 TLS 是 CredSSP 的子集 | [MS-RDPBCGR] 2.2.1.1.1 `PROTOCOL_HYBRID` 条 | [MS-CSSP] 首页：CredSSP 让应用把用户凭据安全地委派给目标服务器 | 现行规范 | 2026-10-20 已读 |
| 04-16 | CredSSP 与 TLS 都要外部设施才能跑起来：认证证书（TLS 与 CredSSP）或密钥分发中心（CredSSP）；这些资源对 RDP 不透明，由实现者自己提供与维护 | [MS-RDPBCGR] 5.4.5 External Security Protocols Used By RDP（`422e59a0-98c8-4a28-af9f-235a572b6e4d`） | — | 现行规范 | 2026-10-20 已读；单一出处 |

### 05 边界：它和 VNC、SSH 差在哪

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 05-1 | SSH 连接协议提供交互式登录会话、远程执行命令、转发 TCP/IP 连接与转发 X11 连接；这些通道全部复用进同一条加密隧道 | RFC 4254 Abstract | RFC 4254 §5 Channel Mechanism：所有终端会话与转发连接都是 channel，多个 channel 复用到一条连接 | RFC 4254，2006-01 | 2026-10-20 已读 |
| 05-2 | SSH 的端口转发是通道的一种：`direct-tcpip` 消息指定接收方应当连到哪个主机与端口 | RFC 4254 §7.2（`direct-tcpip`） | RFC 4254 §5 的 channel 机制 | RFC 4254 | 2026-10-20 已读 |
| 05-3 | SSH 传的是终端字节流与命令，不传图形；画面由本地的终端仿真器画 | RFC 4254 Abstract（协议范围只有登录、命令、转发、X11） | 05-1 的通道清单里没有「图形输出」这一项 | RFC 4254 | 2026-10-20 已读；「画面由本地终端仿真器画」是本片归纳 |
| 05-4 | VNC 用的 RFB 协议以「帧缓冲更新」为中心：服务器发 FramebufferUpdate（消息类型 0），里面是一串矩形，每个矩形带 x、y、width、height 与一个编码号 | noVNC `core/rfb.js`（`_framebufferUpdate()`、`_handleRect()`） | 同文件的 `_normalMsg()`：服务端消息类型 0 = FramebufferUpdate，1 = SetColorMapEntries，2 = Bell，3 = ServerCutText | noVNC master，2026-10-20 读取 | 2026-10-20 已读；**同一来源内的两处一致（弱印证）** |
| 05-5 | RFB 支持的编码有 Raw、CopyRect、RRE、Hextile、Zlib、Tight、TightPNG、ZRLE、JPEG、H264 | noVNC `core/rfb.js` 的 `encodings` 导入与 `_decoders` 数组 | 同文件 `core/encodings.js` 目录 | 同上 | 2026-10-20 已读 |
| 05-6 | RFB 的客户端消息只有：SetPixelFormat(0)、SetEncodings(2)、FramebufferUpdateRequest(3)、KeyEvent(4)、PointerEvent(5)、ClientCutText(6) | noVNC `core/rfb.js` 的 `RFB.messages` | 同上 | 同上 | 2026-10-20 已读 |
| 05-7 | RFB 的安全类型包括 None(1)、VNC Authentication(2)、RA2ne(6)、Tight(16)、VeNCrypt(19)、XVP(22)、ARD(30)、MSLogonII(113) | noVNC `core/rfb.js` 顶部 `securityType*` 常量 | 同文件 `rs2.js` / `legacyCrypto` 的用法 | 同上 | 2026-10-20 已读 |
| 05-8 | 差别一：RDP 在协议里就带设备重定向（剪贴板、磁盘、打印、音频）与其安全层（NLA / CredSSP / TLS）；RFB 协议本身没有磁盘重定向，剪贴板是扩展而非基本消息集 | [MS-RDPBCGR] 1.4（扩展清单） | noVNC `core/rfb.js`：基本消息集里只有 ClientCutText(6) 一种剪贴板消息，且 RFB 无磁盘重定向消息 | 现行规范 + noVNC master | 2026-10-20 已读 |
| 05-9 | 差别二：RDP 送的是「画了什么」的语义（绘图命令、位图缓存、表面命令）与专门的图形编码；RFB 送的是帧缓冲的矩形 | [MS-RDPBCGR] 1.7（能力集含绘图命令与缓存结构）、2.2.9（Basic Output） | [MS-RDPEGFX] 1 Introduction；noVNC `_framebufferUpdate()` | 现行规范 + noVNC master | 2026-10-20 已读 |
| 05-10 | 差别三：RDP 谈的是「把远程桌面交给你操作」，SSH 谈的是「在远程机上替你跑命令、把端口带过来」；前者要传输图形与输入事件，后者要传输字节流与通道 | [MS-RDPBCGR] 1.3 Overview | RFC 4254 Abstract | 同上 | 2026-10-20 已读；归纳句 |
| 05-11 | 适用条件的推论（由上表推出，不直接引用）：要图形、要剪贴板与文件、且对方是 Windows → RDP；只要一个终端、要脚本化、要端口转发 → SSH；跨平台、只要求看见并操作画面、且愿意自己套一层加密隧道 → VNC | 05-8 / 05-9 / 05-10 | — | — | 2026-10-20 归纳；进定稿前须与策划者确认措辞 |

### 尚待核实（不得进入定稿）

| 待核实的事 | 为什么没定 | 补法 |
|---|---|---|
| RDP 5.0 / 6.0 / 8.0 / 10.0 各自对应哪个 Windows 版本、哪一年发布 | 规范只给版本号与取值，不给发行版与年份；本轮没有找到可引用的一手发布说明 | 查 Microsoft Learn 的 Windows 发布说明与 RemoteFX / UDP 传输扩展的原文说明，补一手链接后再写 |
| 「RDP 8.0 引入 RemoteFX / 图形管线」「RDP 10.0 引入 UDP 传输」这类版本—功能归属 | 规范把扩展与协议层分开定义，没有把扩展绑定到版本号 | 同上；找不到就只讲扩展的存在，不讲版本归属 |
| Citrix ICA 与 T.120 的关系、RDP 与 Windows Terminal Server 的历史沿革 | 本轮没有读到可引用的一手来源 | 查 ITU-T T.120 / T.125 原文与微软官方历史材料；找不到就整段不讲，不做「历史故事」 |
| 「省带宽」的具体数字（压缩比、码率、延迟） | 没有实测，也没有读到可信的一手数据 | 若要做，须有可复现的实验环境（真实 RDP 服务端 + 抓包）；本机不具备 |
| 通道号 1003–1007 的准确归属 | Learn 上对应小节正文渲染为空，只读到目录标题 | 用规范 PDF（`[MS-RDPBCGR].pdf`，2026-03-09 修订 62.0）复核后再写 |

## 文案审查

<!-- 文案稿经指定校对者 WaterRun 人工审查并明确确认后才配音（见 docs/script-review.md）。逐轮记录交审日期、内容 SHA-256、校对记录的链接与结论；逐句意见在 review/NOTES.md 留存，避免维护两份全文。确认之后的实质改动另起一轮。 -->

| 轮次 | 交审日期 | 稿本 | 审查意见与修改 | 结论与日期 |
|---|---|---|---|---|

## 制作署名

策划：WaterRun（依据：project.json 的 production.planner，交付前核对实际参与）。

开源视频：[本片源码](https://github.com/Water-Run/ft)（依据：project.json 的 production.repository；交付前核对公开仓库页面并记录日期与结果）。

<!-- 按实际制作记录填写，涵盖准备、制作、审查等环节；名称与可确认的版本不得推测。服务未披露模型时写明服务、用途与「模型未披露」。片尾、README 与委托片 DELIVERY.md 使用同一名单。 -->

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| MiniMax M3.1 Flash（会话运行时标识 minimax-M3.1-Flash） | 取证、事实表与开工反馈应用 | 本次会话的运行时标识；2026-10-20 |
| 主会话的模型 | 片单重构、目录搭建与反馈记录校验 | 主会话的交接说明；2026-10-20 |

配音、渲染与成片审查尚未开工，暂无参与模型可记。

## 复核

<!-- 记录核查范围、日期、依据、发现的问题、更正与复查结论；覆盖三项核心审查、原创与动画完成度、片尾名单。未做的写「未做」，待核查的不得写成通过。 -->
