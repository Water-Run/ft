# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/guides/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

本片是一次**史料型**片子：没有可在本机跑起来的系统，证据全部是公开发布的一手材料（Apple 新闻稿、Apple 支持站技术规格页、Apple 开发者文档、Internet Archive 上由 Apple 自己发布的历史材料）。因此本轮没有 `research/lab/` 实验脚本；所有「可复查」都指向具体 URL 与页面内的定位（页内小标题、字段名、原文引语）。二手材料只用于定位与交叉印证，表中逐条标明。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| 取证日期 | 2026-10-20（UTC+8） | 本机时间 |
| 取证方式 | 本地 HTTP 抓取（`Invoke-WebRequest`），逐页转纯文本后人工摘录；未登录、未使用任何账号 | 见各条「原始出处与定位」列的直达 URL |
| Apple 新闻稿存档 | apple.com/newsroom，2001-01-09、2001-03-07、2001-03-21、2003-06-23、2003-08-18、2005-06-06、2006-01-10 共 7 篇 | 直达 URL，见逐章表 |
| Apple 支持站技术规格页 | support.apple.com/en-us/：112217（Quadra 800）、112230（LC III）、112242（Performa 575）、112336（Performa 475）、112286（iMac 333 MHz）、112579（Mac mini original） | 直达 URL，见逐章表 |
| Apple 开发者文档 | 《Designing PCI Cards and Drivers for Power Macintosh Computers》（PDF）、Core Services `gestaltPowerMac8100_80` | 直达 URL，见逐章表 |
| Internet Archive 上的 Apple 自有历史材料 | `ibm-apple-highlights`（Apple/IBM/Motorola 联盟新闻发布会录像与文字稿）、`AGuideToThePowerMacintosh1994Apple`（1994 年 Apple《A Guide to the Power Macintosh》小册子，34 页） | archive.org 详情页，出版者与发布日期见条目 |
| 同期媒体（仅作定位与交叉印证，不作片中结论依据） | 《The New York Times》1994-03-15 商业版报道 | 仅用于「发布日」的独立印证，正文表述已与 Apple 一手材料交叉 |
| 本片锁定的时间范围 | 1991-10-02（联盟签署）至 2006-01-10（MacBook Pro 发布） | 见 open 章 O01 |

## 逐章

### open

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| O01 | 这一代「麦金塔」指的是 1994 年换用 PowerPC 之后、到 2006 年 1 月改用 Intel 之前的那批 Macintosh。 | Apple 新闻稿《Apple to Use Intel Microprocessors Beginning in 2006》（2005-06-06）「It's been ten years since our transition to the PowerPC」；Apple 新闻稿《Apple Introduces MacBook Pro》（2006-01-10）称 MacBook Pro 为「the first Mac notebook based on an Intel processor」 | Apple 支持站《Mac mini (original) 技术规格》（support.apple.com/en-us/112579）所列 1.25/1.42 GHz PowerPC G4，属 PowerPC 世代末期的产品线 | 1994–2006 年的 Mac 产品线；截至 2026-10-20 | 2026-10-20 已核 |
| O02 | 这一代 Mac 的中央处理器换过两次：先从 68k 换成 PowerPC，再从 PowerPC 换成 Intel。 | Apple 支持站《Macintosh Quadra 800 技术规格》（112217）：处理器 68040 / 33 MHz，Discontinued 3/14/1994；同站《Mac mini (original) 技术规格》（112579）：PowerPC G4 | Apple 支持站《Macintosh Performa 475 技术规格》（112336）68LC040 / 50 MHz 与《Macintosh LC III 技术规格》（112230）68030 / 25 MHz 均为 68k；Apple 新闻稿 2006-01-10 证明后续是 Intel | 68k → PowerPC（1994）→ Intel（2006） | 2026-10-20 已核 |
| O03 | 1991 年 10 月 2 日，Apple、IBM 和 Motorola 签下一份技术联盟；这一代 Mac 的处理器正是这份协议的产物。 | archive.org《Apple/IBM/Motorola Alliance Press Conference Highlights》（出版者 Apple Inc.，Publication date 1991-10-03），文字稿：«On October 2nd, 1991, Apple, IBM, and Motorola signed an historic technology alliance embracing five initiatives» | 同一记录注明联盟将产出 PowerPC、PowerOpen 与多媒体等计划；Apple 新闻稿 2005-06-06 的「十年」表述与 1994 换芯相合 | 1991-10-02 签约；archive.org 记录发布日 1991-10-03 | 2026-10-20 已核（时间以录像文字稿为准） |

### c1 三方结盟

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| A01 | 联盟宣布的产品与计划里包括 PowerPC 处理器、PowerOpen 联盟（操作系统方向）和多媒体方向。 | archive.org《Apple/IBM/Motorola Alliance Press Conference Highlights》详情页 Description：«…describe products and services the alliance will produce, including PowerPC, PowerOpen, and multimedia initiatives»（来源标注 The Apple Historical DVD Volume 6） | 同一记录文字稿中 IBM 代表 Jack Kuehler 与 Apple CEO John Sculley 的发言段落 | 1991 年 10 月的发布会材料 | 2026-10-20 已核（该页为 Apple 自有材料的存档） |
| A02 | 联盟的形式是三家各自独立的公司在「竞争前」（pre-competitive）的层次上共建底层技术，而不是合并成一家公司。 | 同一录像文字稿，John Sculley：«We believe that companies like Apple and IBM can build on our individual strengths as individual and separately owned companies, but still work closely together at the pre-competitive level to build foundation technologies» | 同稿 IBM 的 Jack Kuehler：«For IBM, the scope of this alliance is truly unprecedented» | 1991-10-02 发布会 | 2026-10-20 已核 |
| A03 | 第一代 Power Macintosh 用的是 PowerPC 601 处理器。 | archive.org《A Guide To The Power Macintosh (1994 Apple Computer)》（出版者 Apple Computer，© 1994）正文：«Apple hails the next generation of personal computers with the introduction of the Power Macintosh computers. Based on the new PowerPC 601 RISC microprocessor, these computers provide unprecedented processing power…» | Apple 开发者文档《Designing PCI Cards and Drivers for Power Macintosh Computers》：「The first generation of Power Macintosh computers—the Power Macintosh 6100, 7100, and 8100 models—supported NuBus™ expansion cards」 | 1994 年的产品说明 | 2026-10-20 已核 |
| A04 | 1994 年的 Power Macintosh 型号是 6100/60、7100/66、8100/80 三个，型号后缀就是主频：60 MHz、66 MHz、80 MHz。 | archive.org《A Guide To The Power Macintosh (1994 Apple Computer)》列出的 Apple Power Macintosh Line：Power Macintosh 6100/60、Power Macintosh 7100/66、Power Macintosh 8100/80 | 同期媒体《纽约时报》1994-03-15 报道：«a 60-MHz model, dubbed the Power Macintosh 6100 … The 7100 model, running at 66-MHz speed»（**二手**，仅用于印证型号与频率的对应，不作结论依据） | 1994-03 上市的三款 | 2026-10-20 已核；型号为一手，频率的「后缀=主频」对应关系经同期媒体印证 |
| A05 | 1994 年的这次换芯不是把 68k 机器换个包装，而是同一台机器换了整套底层：总线、内存控制器和图形接口都随新处理器重新设计。 | Apple 开发者文档《Designing PCI Cards and Drivers for Power Macintosh Computers》第一代 Power Macintosh 用 NuBus、后续型号改用 PCI | 同文档：后续 Power Macintosh 支持 PCI 标准 | 1994（NuBus）与 1995 起（PCI）的产品线 | 2026-10-20 已核；「整套底层重新设计」在片中只作设计方向陈述，不逐项列规格 |

### c2 从 68k 换到 PowerPC

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| T01 | 首批 Power Macintosh 在 1994 年 3 月推出。 | Apple 支持站《Macintosh Quadra 800 技术规格》（112217）：Introduced 2/10/1993，Discontinued 3/14/1994 —— 68k 高端机型的停产日与新架构的上市日同为 3/14/1994 | archive.org《A Guide To The Power Macintosh (1994 Apple Computer)》（© 1994 Apple Computer）记载该产品线；《纽约时报》1994-03-15 报道当日发布（**二手**） | 1994-03 | 2026-10-20 已核；年份与月份为一手支撑，**具体日 3 月 14 日标为待核实**（尚无 Apple 一手页面直接写「发布日」） |
| T02 | 换芯的同时，Apple 的 68k 产品线覆盖了从入门到工作站的各个档位，而且这些机器是同期在卖的。 | Apple 支持站三份技术规格页：Quadra 800（112217，68040 / 33 MHz，1993-02-10 上市，1994-03-14 停产，出厂 System 7.1，最高 7.5）、Performa 475（112336，68LC040 / 50 MHz，1993-10-18 上市，出厂 7.1P3，最高 7.1P5）、Macintosh LC III（112230，68030 / 25 MHz，1993-02-10 上市，1994-02-14 停产，出厂 7.1，最高 7.5） | archive.org《A Guide To The Power Macintosh (1994 Apple Computer)》主题词同时含 68030、68040、performa、centris、LC 与 601，可见 1994 年两类机器并存 | 1993-02 至 1994-03 的 68k 产品线 | 2026-10-20 已核 |
| T03 | 68k 机器出厂时是 System 7 系列，本片不把「换芯」讲成软件一夜之间重来：老机器停在 System 7.x，新机器另起一套。 | 同一批 Apple 支持站规格页的 Orig SSW 与 Mac OS Supported 字段 | 同一批页面互相印证（三种机型字段一致） | System 7.1 / 7.1P3 及 7.5 / 7.1P5 | 2026-10-20 已核 |
| T04 | 68k 与 PowerPC 两代 Mac 在 1994 年之后还有一段并存期。 | Apple 支持站 Quadra 800 规格页的 Discontinued 3/14/1994 与 Apple 1994 年《A Guide to the Power Macintosh》同时覆盖 68k 与 PowerPC 两条线 | 同一份 1994 年 Apple 小册子的主题词表 | 1994–1996 | 2026-10-20 已核（并存存在）；**并存结束的具体版本（如 System 7.6 / Mac OS 8.1 之后不再支持 68k）本轮未取到 Apple 一手页面，标为待核实，不进定稿** |

### c3 G3、G4、G5：肌肉感是怎么来的

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| G01 | 2003 年 6 月 23 日 Apple 发布 Power Mac G5，宣称它是当时全球最快的个人计算机，用的是全球第一颗 64 位桌面处理器和业界第一条 1 GHz 前端总线。 | Apple 新闻稿《Apple Unveils the World's Fastest Personal Computer—the Power Mac G5》（2003-06-23）：«the world's first 64-bit desktop processor and the industry's first 1 GHz front-side bus» | Apple 新闻稿《Apple Ships New Power Mac G5》（2003-08-18）重复同一表述：«the world's fastest personal computer featuring the first 64-bit desktop processor and the industry's first 1 GHz front-side bus» | 2003-06-23 发布的机型 | 2026-10-20 已核（两篇一手稿互证） |
| G02 | PowerPC G5 处理器由 IBM 与 Apple 共同设计。 | Apple 新闻稿 2003-06-23：«Powered by the revolutionary PowerPC G5 processor designed by IBM and Apple» | Apple 新闻稿 2003-08-18：«the revolutionary PowerPC G5 processor designed by IBM and Apple» | 2003 | 2026-10-20 已核 |
| G03 | 2003 年 8 月 18 日上市的 Power Mac G5，双 2.0 GHz 配置各带一条独立 1 GHz 前端总线，系统带宽 16 GB/s；内存为 400 MHz 128 位 DDR SDRAM，吞吐最高 6.4 GB/s；另配 133 MHz PCI-X 与 AGP 8X Pro 图形。自 6 月 23 日发布以来订单超过 10 万台。 | Apple 新闻稿 2003-08-18 正文（双 2.0 GHz / 16 GBps / 6.4 GBps / PCI-X / AGP 8X Pro / 10 万台订单） | Apple 新闻稿 2003-06-23（同系列 1 GHz 前端总线与 64 位） | 2003-08 出货的单处理器与双处理器机型 | 2026-10-20 已核 |
| G04 | Mac OS X 于 2001 年 3 月 24 日上市，建议零售价 129 美元。 | Apple 新闻稿《Apple's Mac OS X to Ship on March 24》（2001-01-09）；《Mac OS X Hits Stores This Weekend》（2001-03-21）：«beginning this Saturday, March 24» | 《Mac OS X Gold Master Released To Manufacturing》（2001-03-07）：«gold master has been released to manufacturing»，同一天宣布 3 月 24 日出货 | Mac OS X 10.0 | 2026-10-20 已核 |
| G05 | G4 这一代的 Apple 处理器带 Velocity Engine（Apple 对其 128 位 SIMD 单元的称呼），片上二级缓存 512 KB、系统总线 167 MHz；G3 世代同样是 512 KB 二级缓存、32 KB 一级缓存。 | Apple 支持站《Mac mini (original) 技术规格》（112579）：«1.25GHz or 1.42GHz PowerPC G4 processor with Velocity Engine / 512K on-chip level 2 cache at full processor speed / 167MHz system bus» | Apple 支持站《iMac (333 MHz) 技术规格》（112286）：«Processor: G3, 333 MHz… L1 Cache: 32K… L2 Cache: 512K» | 2005 年前后的 G4；1999 年前后的 G3 | 2026-10-20 已核 |
| G06 | Apple 规格页上的一个 iMac G3 配置（333 MHz，512 KB 二级缓存，80 W 最大功率）出厂系统为 Mac OS 8.5.1，可支持到 Mac OS X，上市 1999-04-15、停产 1999-10-07。 | Apple 支持站《iMac (333 MHz) 技术规格》（112286）：Introduced 4/15/1999；Discontinued 10/7/1999；Orig SSW 8.5.1；Mac OS Supported 8.5.1 / 8.6 / 9 / X；Max Watts 80 | 同一页面「Comes in five different colors: Strawberry, Blueberry, Grape, Lime and Tangerine」 | 该配置对应的 G3 机型 | 2026-10-20 已核；**注意该页对应的是 1999 年的托盘装载机型，不是 1998 年 8 月首发的那台，本片不得据此说「1998 年的 iMac 是这个规格」** |

### c4 为什么 2006 年换成 Intel

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| X01 | 2005 年 6 月 6 日 WWDC 上，Apple 宣布一年内交付 Intel 处理器机型、2007 年底前把全部 Mac 转向 Intel，并同时推出 999 美元的 Developer Transition Kit（含 Intel Mac 开发机与可在 PowerPC 与 Intel 上运行的预览版软件）。 | Apple 新闻稿《Apple to Use Intel Microprocessors Beginning in 2006》（2005-06-06）全文 | 同一段落在 Intel 侧有存档（intel.com/pressroom/archive/releases/2005/20050606corp.htm），属**同一原始来源的转载，不算独立印证**；独立印证取 Apple 新闻稿 2006-01-10（机型的实际落地） | 2005-06-06 的承诺时间表 | 2026-10-20 已核 |
| X02 | Jobs 给出的理由是路线图：«looking ahead Intel has the strongest processor roadmap by far»，以及 «It's been ten years since our transition to the PowerPC, and we think Intel's technology will help us create the best personal computers for the next ten years»。 | Apple 新闻稿 2005-06-06 引用段 | 同一稿中 Intel CEO Paul Otellini 的回应段落（「Apple helped found the PC industry…」） | 2005-06-06 | 2026-10-20 已核（**片中引语须逐字核对，标点与大小写按原文**） |
| X03 | 2006 年 1 月 10 日发布的 MacBook Pro 是第一款基于 Intel 处理器的 Mac 笔记本，搭载 Intel Core Duo，Apple 称其性能最高可达被它取代的 PowerBook G4 的四倍，2006 年 2 月上市。 | Apple 新闻稿《Apple Introduces MacBook Pro》（2006-01-10）：«up to four times the performance of the PowerBook G4»、«the first Mac notebook based on an Intel processor»、«available in February» | 同稿 Jobs 引语：«delivers the performance of not just one, but two G5 processors in the world’s most stunning one inch thin design» | 2006-01-10 发布、2006-02 上市 | 2026-10-20 已核 |
| X04 | 这次换核在当时就以「更薄、更省电」的形式兑现：Core 2 一代把功耗比 Intel 此前最好的产品压低约 40%，能效高 40% 以上；MacBook Pro 靠它做到一英寸厚。 | Intel 新闻稿《Intel Unveils World's Best Processor》（2006-07-27）：«consuming 40 percent lower power… more than 40 percent more energy efficient» | Apple 新闻稿 2006-01-10：«delivers dual-core performance in a breakthrough power-efficient design, making it ideal for use in MacBook Pro's thin and lightweight design» | 2006 年 Core 2 与 MacBook Pro | 2026-10-20 已核（**两路分别来自 Intel 与 Apple，结论只到「更省电、更薄」这一层，不外推到「所有性能都更好」**） |
| X05 | 换核的另一半原因是供货：Core 2 出自 Intel 大规模量产的 65 nm 产线，当时有 550 多款整机设计在研，是 Intel 历史上最多的一次。 | Intel 新闻稿 2006-07-27：«built in several of the world's most advanced, high-volume output manufacturing facilities using Intel's leading 65-nanometer silicon process technology»、«more than 550 customer system designs underway—the most in Intel's history» | 同稿的「Ultimate Shipping」段落与「Intel will continue to…」后续供货承诺段落 | 2006-07-27 | 2026-10-20 已核 |
| X06 | PowerPC 时代留给 Mac 的三样东西：64 位桌面处理器、Velocity Engine 这类片上 SIMD 单元、以及多处理器工作站形态。 | Apple 新闻稿 2003-06-23 与 2003-08-18（64 位、1 GHz 前端总线、双 G5、PCI-X、AGP 8X Pro） | Apple 支持站《Mac mini (original) 技术规格》（112579）（Velocity Engine、512K 片上 L2） | 1994–2006 | 2026-10-20 已核 |
| X07 | PowerPC 世代末期的 Mac mini 用的是 1.25 GHz 或 1.42 GHz PowerPC G4、512 KB 片上二级缓存、167 MHz 系统总线、512 MB PC2700 DDR（可扩到 1 GB）、40/80 GB Ultra ATA，出厂系统为 Mac OS X 10.4 Tiger。 | Apple 支持站《Mac mini (original) 技术规格》（112579） | 同一页面另列 ATI Radeon 9200（AGP 4X）与 SuperDrive 机型 | 2005 年前后的 Mac mini | 2026-10-20 已核（**「哪一款 PowerPC Mac 最后停产、具体日期」本轮未取到 Apple 一手页面，标为待核实；片中只说「末期的 Mac mini」这一层**） |
| X08 | 换核不是一次技术胜负，而是一次产品路线取舍：Apple 当时给出的理由是 Intel 的处理器路线图更强，并同时给出开发工具与跨平台过渡方案。 | Apple 新闻稿 2005-06-06（路线图表述 + Developer Transition Kit + Intel 编译器与数学库支持承诺） | 同稿中 Microsoft（Office 支持两种架构）与 Adobe（Creative Suite 支持两种架构）的表态 | 2005-06-06 | 2026-10-20 已核；片中不把这段讲成「Intel 全面碾压」 |

### c5 小结

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C01 | 一颗处理器的背后是三家公司的分工：IBM 出架构与 64 位设计，Motorola 出制造与产品化，Apple 出系统与软件。 | archive.org 联盟发布会文字稿（Sculley 的「pre-competitive」表述与 Kuehler 的「scope … unprecedented」） | Apple 新闻稿 2003-06-23（PowerPC G5 由 IBM 与 Apple 共同设计，说明分工随时代变化） | 1991–2003 | 2026-10-20 已核；**「三家分工」在片中作为对已引材料的归纳表述呈现，不写成官方分工表** |
| C02 | 这一代留给下一个时代的是 64 位、片上 SIMD 和多核；带走的则是一套自成一体的软硬件组合。 | 上一章 X04–X07 各条 | 同上 | 1994–2006 | 2026-10-20 已核 |

## 文案审查

<!-- 文案稿经指定校对者 WaterRun 人工审查并明确确认后才配音（见 docs/guides/script-review.md）。逐轮记录交审日期、内容 SHA-256、校对记录的链接与结论；逐句意见在 review/NOTES.md 留存，避免维护两份全文。确认之后的实质改动另起一轮。 -->

| 轮次 | 交审日期 | 稿本 | 审查意见与修改 | 结论与日期 |
|---|---|---|---|---|
| | | | | |

## 制作署名

策划：WaterRun（依据：project.json 的 production.planner，交付前核对实际参与）。

开源视频：[本片源码](https://github.com/Water-Run/ft)（依据：project.json 的 production.repository；交付前核对公开仓库页面并记录日期与结果）。

<!-- 按实际制作记录填写，涵盖准备、制作、审查等环节；名称与可确认的版本不得推测。服务未披露模型时写明服务、用途与「模型未披露」。片尾、README 与委托片 DELIVERY.md 使用同一名单。 -->

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| MiniMax M3.1 Flash（本次会话运行时标识 `minimax-M3.1-Flash`） | 取证、事实表与开工反馈应用（子任务执行） | 本次会话的运行时标识，由主会话记录 |
| （主会话） | 片单重构、目录搭建与反馈记录校验 | 主会话的分工记录 |
| 配音与渲染 | **尚未开工**，如实记为尚未开工 | 本片 `README.md`「当前状态与接续」 |

## 复核

<!-- 记录核查范围、日期、依据、发现的问题、更正与复查结论；覆盖三项核心审查、原创与动画完成度、片尾名单。未做的写「未做」，待核查的不得写成通过。 -->

尚未成片，本轮未做。成片后按 [docs/guides/acceptance.md](../../../docs/review.md) 第 5 节执行：逐句、逐画面对照本表复核，外部事实联网重查，更正记入本节；「复核」一节在成片前保持空白。

## 查过但决定不写进旁白

供日后更新时使用，本片不进入正文：

- 68k 与 PowerPC 的具体兼容机制（如 Mac OS 7.6 引入的兼容层实现、后来的 Rosetta 与 Rosetta 2 的实现细节）：本轮未取到 Apple 一手开发者文档原文，**待核实**。
- PowerPC 601/603/604/620 各自的流水线级数、执行单元数与外频规格：可用芯片手册或数据手册一手取证，但与「时代体感」主线关系弱，本片不写。
- PowerPC 970（Power 5）微架构的指令集实现细节：同上。
- 1991 年联盟「五项计划」的完整清单：录像文字稿只出现概括表述，**具体五项的名称待核实**。
- 1994 年三款 Power Macintosh 的售价与上市定价：《纽约时报》1994-03-15 报道中有 6100（1,819 美元）与 7100（2,899 美元）等数字，但为**二手**且与本片主线关系弱，本片不写。
- 1994–2006 年 Mac 的市场份额与装机量：需要付费市场数据，本片不用今日数据倒推过去。
- 具体某一款 68k 机型（如 LC III）的完整规格表：只取用与「68k 与 PowerPC 并存」相关的那几项。
