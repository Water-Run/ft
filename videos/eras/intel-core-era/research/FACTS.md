# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/guides/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

本片是一次**史料型**片子：没有可在本机跑起来的系统，证据全部是 Intel 自己发布的新闻稿、新闻稿索引页与官方白皮书。因此本轮没有 `research/lab/` 实验脚本；所有「可复查」都指向具体 URL 与页面内的定位（稿件标题、导语、参数表字段、原文引语）。

**全片统一口径**（本表所有条目按此解释，片中与图注必须照此标注）：

| 口径项 | 本片的含义 | 说明 |
|---|---|---|
| 制程 | 芯片制造工艺的标称节点，单位 nm，取 Intel 稿件自述的节点（如 65 nm、45 nm、32 nm、22 nm、14 nm、10 nm） | Intel 的「Intel 7」「Intel 4」是其**工艺代号**，不是纳米数，片中必须写代号并注明不是节点数字 |
| 核心数 | 物理核心数；线程数单列，不与核心数混写 | Nehalem 起有超线程，核心数与线程数不同 |
| 频率 | 基础频率与睿频分开写，不合并成「最高频率」 | 出处栏写明是哪一个 |
| 功耗 | Intel 稿件中的 TDP（thermal design power）区间，单位 W；宣传性「省电 X%」只作为厂商口径引用并注明 | 不同代之间 TDP 口径不完全可比，片中不做跨代功耗排名 |
| 发布时间 | 取该代**首次发布（宣布上市）**的日期，不取首批零售的日期 | 各条在「适用版本」列标明是哪一次发布 |

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| 取证日期 | 2026-10-20（UTC+8） | 本机时间 |
| 取证方式 | 本地 HTTP 抓取（`Invoke-WebRequest`），逐页转纯文本后人工摘录；未登录、未使用任何账号 | 见各条「原始出处与定位」列的直达 URL |
| Intel 新闻稿存档（pressroom/archive） | 2000 年 dp 系列、2003、2006、2008、2010 若干篇 | 直达 URL，见逐章表 |
| Intel 投资者关系新闻稿库（intc.com） | detail/547、577、627、727、893、1193、1300、1411、1506、1663、1707 共 11 篇 | 直达 URL，见逐章表 |
| Intel 官方白皮书 | 《First the Tick, Now the Tock: Intel® Microarchitecture (Nehalem)》，intel.com/content/dam/doc/white-paper/ | 直达 URL，见 N01 |
| Intel 新闻稿索引页 | intc.com 新闻稿列表第 95、107、128 页（用于确认某篇稿件的发布日期） | 直达 URL，见 A12 |
| 本片锁定的时间范围 | 2000-11-20（Pentium 4 发布）至 2024-09-03（Core Ultra 200V 发布） | 见 open 章 I01 |

## 逐章

### open

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| I01 | 「酷睿」这个名字是 2006 年 5 月 8 日定下的：Intel 把即将上市的桌面与笔记本处理器统一命名为 Intel Core 2 Duo，代码名分别是 Conroe（桌面）与 Merom（笔记本）。 | Intel 新闻稿《Intel® Core™2 Duo Processor Unified Brand Name For Upcoming PC, Laptop Processors》（2006-05-08）：«The Intel® Core™2 Duo processor is the new brand… Formerly codenamed Conroe and Merom… will include two processing cores — or brains — per chip, hence the “Duo” addition» | 同稿说明高端型号叫 Core 2 Extreme；并说明这一族基于新设计的 Intel Core 微架构、面向第三季度上市 | 2006-05-08 的品牌公布，第三季度（2006 年 7 月）上市 | 2026-10-20 已核 |
| I02 | 这代处理器的正式上市日是 2006 年 7 月 27 日，当天 Intel 一口气发布 10 款 Core 2 Duo 与 Core 2 Extreme，覆盖桌面、笔记本与工作站。 | Intel 新闻稿《Intel Unveils World's Best Processor》（2006-07-27）：«today unveiled 10 Intel® Core™2 Duo and Intel® Core™2 Extreme processors for consumer and business desktop and laptop PCs and workstations» | 同一稿列出「five desktop PC processors… and five mobile PC processors」，与「10 款」互证 | 2006-07-27 的一次发布 | 2026-10-20 已核 |

### c1 在 Core 2 之前

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| B01 | Core 2 之前 Intel 的桌面主力是 2000 年 11 月 20 日发布的 Pentium 4，基于当时新公布的 NetBurst 微架构，首款 1.5 GHz。 | Intel 新闻稿《Intel Introduces The Pentium® 4 Processor》（2000-11-20）：«today introduced the Intel® Pentium® 4 processor… Its foundation is the new Intel® NetBurst® micro-architecture»；同稿给出 1.5 GHz 型号的 SPEC CPU2000 成绩（SPECint 535 / SPECfp 558） | Intel 新闻稿《Intel Announces New NetBurst® Micro-Architecture For Pentium® 4 Processor》（2000-08-22）：«disclosed details of its new Intel® NetBurst® micro-architecture» | 2000-11-20 发布 | 2026-10-20 已核 |
| B02 | 2003 年 3 月 12 日 Intel 推出 Centrino 移动技术，核心是 Pentium M 处理器，频率 1.60 / 1.50 / 1.40 / 1.30 GHz，千颗单价 720 / 506 / 377 / 292 美元；这是 Intel 第一次把一组技术（处理器 + 芯片组 + 802.11 无线）用一个品牌打包。 | Intel 新闻稿《Intel Launches Intel® Centrino® Mobile Technology》（2003-03-12）：含「Intel Centrino mobile technology pricing includes… the Intel Pentium M Processor at speeds of 1.60, 1.50, 1.40, 1.30 GHz priced at $720, $506, $377, $292 respectively in 1,000 unit quantities」；「marks the first time we've put a combination of technologies under a single brand」 | Intel 新闻稿《Intel Announces Intel® Centrino® Mobile Technology Brand Name》（2003-01-08）：«The Intel Centrino brand marks the first time Intel has branded a combination of technologies under one name» | 2003-03-12 上市 | 2026-10-20 已核（**价格与频率为一手；「迅驰当年在移动端赢过」这类市场结论本片不写**） |
| B03 | Core 2 的卖点是同时把功耗和性能拉平：出 65 nm 产线，2.91 亿晶体管，功耗比 Intel 此前最好的产品低约 40%，能效高 40% 以上，桌面版性能最多提升 40%。 | Intel 新闻稿 2006-07-27：«packing 291 million transistors yet consuming 40 percent lower power»；«more than 40 percent more energy efficient versus Intel’s previous best processor»；«up to a 40 percent increase in performance» | Intel 新闻稿 2006-05-08（65 nm 与 Core 微架构）；同一 2006-07-27 稿内两处分别出现 40% 功耗与 40% 能效 | 2006-07-27 的 Core 2 家族 | 2026-10-20 已核；**三个 40% 均为 Intel 厂商口径，片中引用时必须说明是厂商给出的对比基准** |
| B04 | Core 2 一代同时把 64 位支持带进笔记本。 | Intel 新闻稿 2006-07-27：«support for 64-bit computing now expands to notebook PCs» | 同稿列出配套芯片组 975X / 965 / Mobile 945 | 2006-07-27 | 2026-10-20 已核 |

### c2 名字与节奏

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| N01 | Intel 的「tick-tock」节奏：每年交付一次新制程（tick）或一次全新微架构（tock），两者交替。 | Intel 官方白皮书《First the Tick, Now the Tock: Intel® Microarchitecture (Nehalem)》：«marks the next step (a “tock”) in Intel’s rapid “tick-tock” cadence for delivering a new process technology (tick) or an entirely new microarchitecture (tock) every year» | Intel 新闻稿（intc detail/577，2012 年第 3 代 Core）：«Accelerates Intel’s “Tick-Tock” cadence for first time» | 2008 年的白皮书 | 2026-10-20 已核（**白皮书页首与定义段已核对**） |
| N02 | 名字里的「Duo」说的是两颗核，不是第几代。 | Intel 新闻稿 2006-05-08：«will include two processing cores — or brains — per chip, hence the “Duo” addition» | 同稿说明「Core 2」是品牌名，而「Extreme」是最高性能型号的称呼 | 2006-05-08 | 2026-10-20 已核 |
| N03 | 这一族的品牌、平台品牌是分开的一套：Core 2 Duo 是处理器品牌，Centrino Duo / Viiv / vPro 分别是移动、家庭娱乐与企业平台品牌。 | Intel 新闻稿 2006-05-08：«Consumers and businesses will also be able to purchase these processors as part of Intel’s market-focused platforms… Intel® Centrino® Duo mobile technology, Intel® Viiv™ technology and Intel® vPro™ technology brands» | Intel 新闻稿 2006-07-27（同一套平台品牌的实际上市表述） | 2006 | 2026-10-20 已核 |
| N04 | 换成 Core 微架构之后，制程节点一路是 65 nm（2006）→ 45 nm（2008）→ 32 nm（2010）→ 22 nm（2012）→ 14 nm（2015）。 | 65 nm：2006-05-08 与 2006-07-27 稿；45 nm：intc detail/893；32 nm：intc detail/1300；22 nm：intc detail/577；14 nm：intc detail/1193 | 每个节点都能在相邻年份的另一篇一手稿中再次出现（2006↔2007、2008↔2010、2010↔2011、2012↔2013、2015 前后） | 各节点的首次发布年 | 2026-10-20 已核；**本片只给节点序列，不给各节点的良率、每晶体管成本等未取证的数字** |

### c3 每一代换掉了什么

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| A10 | 2008 年 11 月 17 日发布的第一代 Core i7 是 Nehalem 家族第一款：45 nm、8 MB 三级缓存、三通道 DDR3-1066 内存、QPI 4.8 GT/s；Turbo Boost 与 Hyper-Threading 同时出现，四核八线程；i7-940 基础频率 2.93 GHz、睿频 3.06 GHz、TDP 130 W。 | intc detail/893《Intel Launches Fastest Processor on the Planet》（2008-11-17）：«Each Core i7 processor features an 8 MB level 3 cache and three channels of DDR3 1066 memory»；«the Core i7 quad-core processor delivers 8-threaded performance»；参数表行「Intel® Core™ i7-940 (Nehalem) 45nm … 8 MB … 1066 … 130W」 | Intel 新闻稿存档 20081117comp_sm.htm（同日同题的一手稿）；同稿称其内存带宽较此前 Extreme 平台翻倍以上 | 2008-11-17 发布，45 nm | 2026-10-20 已核 |
| A11 | 2010 年 1 月 7 日 Intel 发布全新 2010 Core 家族，这是 Intel 第一批 32 nm 的 Core 处理器，并首次加入 Turbo Boost Technology 1 与 Hyper-Threading Technology 2；睿频最高到 3.73 GHz。 | intc detail/1300《Intel Unveils All New 2010 Intel® Core® Processor Family》（2010-01-07）：«the arrival of Intel’s groundbreaking new 32 nanometer (nm) manufacturing technology»；«Intel Turbo Boost Technology 1»；«Hyper-Threading Technology 2»；参数表睿频最高「Up To 3.73 GHz」 | Intel 新闻稿存档 20100107comp_sm.htm（同日一手稿）；同稿提到这一代首次把显卡整合进处理器封装 | 2010-01-07 发布，32 nm | 2026-10-20 已核；**「Westmere」这个代码名本轮未在 Intel 一手稿中读到，片中如需写出须先补证；本表的代际称呼只用「2010 Core 家族 / 32 nm 这一代」** |
| A12 | 2011 年 1 月 5 日发布的第 2 代 Core（Sandy Bridge）基于 Intel 32 nm 制造与第二代 high-k 金属栅工艺，Intel 称之为「visibly smart」。 | intc detail/727《Intel Details 2011 Processor Features, Offers Stunning Visuals Built-in》（2010-09-13 预告）：«Codenamed “Sandy Bridge,” the chips will be based on… 32-nanometer… process technology with second-generation high-k metal gate transistors» | intc 新闻稿索引页第 107 页列出第 2 代 Core 发布稿的日期为「Jan 05, 2011 1:00 PM EST」 | 2011-01-05 发布，32 nm | 2026-10-20 已核（**发布日来自 Intel 自己新闻稿库的索引页，预告稿给出制程与工艺**） |
| A13 | 2012 年 4 月发布的第 3 代 Core（Ivy Bridge）是 Intel 第一次在同一代里同时推出 22 nm 处理器。 | intc detail/577《3rd Generation Intel® Core® Processors Bring Exciting New Experiences and Fun to the PC》（2012-04-19）：«Accelerates Intel’s “Tick-Tock” cadence for first time to simultaneously bring to market the world’s first processors developed on 22nm manufacturing process» | 同稿说明该代四核产品同步上市 | 2012-04 发布，22 nm | 2026-10-20 已核 |
| A14 | 2013 年的第 4 代 Core（Haswell）以低功耗为主要方向，Intel 称它会带来更薄、更轻、更凉、更安全的整机。 | intc detail/547《Intel: Low-Power Processors to Fuel Future of Mobile Computing》：«In 2013, 4th generation Intel® Core® processor family based on “Haswell” microarchitecture will bring faster, thinner, lighter, cooler, more secure systems with built-in graphics to mainstream» | Intel 官方事实表《4th Generation Intel® Core® vPro Processor Family》页首署「June 4, 2013」 | 2013 年，22 nm | 2026-10-20 已核（**日期与 22 nm 只取到 PDF 检索摘要，未读 PDF 原文，标为待核实；片中只写「2013 年」这一层**） |
| A15 | 2015 年 9 月 1 日发布的第 6 代 Core（Skylake）建在 14 nm 工艺与 Skylake 微架构上。 | intc detail/1193《Introducing 6th Generation Intel® Core®, Intel's Best Processor Ever》（2015-09-01）：«Built on the new Skylake microarchitecture on Intel’s leading 14nm manufacturing process technology» | 同稿称这一代「the company’s best processors ever」并给出与五年前旧机的性能、电池对比口径 | 2015-09-01 发布，14 nm | 2026-10-20 已核（**同稿中「2.5 倍性能、3 倍电池」的对比基准是「五年前的普通电脑」，不是上一代 Core，片中不得写成代际提升**） |
| A16 | 低功耗这一侧 Intel 另有 Atom 品牌，2008 年 3 月 2 日公布，4 月 1 日首批 Centrino Atom 上市，45 nm high-k 金属栅，TDP 0.65–2.4 W（对照当时典型笔记本约 35 W），平均功耗 160–220 mW，空闲 80–100 mW。 | Intel 新闻稿 2008-03-02《Intel Announces Intel® Atom® Brand for New Family of Low-Power Processors》；2008-04-01《New Intel® Centrino® Atom® Processor Technology…》：«a thermal design power range of 0.65 to 2.4 watts (versus 35 watts for today’s typical laptop), average power range of 160-220 milliwatts (mW) and idle power range of 80-100mW» | 2008-04-01 稿同段写明 45 nm high-k 金属栅与 Deep Power Down (C6) 等省电技术 | 2008-04-01 上市，45 nm | 2026-10-20 已核（**Atom 与 Core 是两条产品线，片中不可混为一谈**） |

### c4 2008–2018 用户能感觉到什么

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| U01 | 「超极本」这个品类是 Intel 在 2011 年提出的，它被描述成一个要分三个阶段推进的行业级努力，第一阶段的产品在当年假日季上市。 | intc detail/627《Personal Computing Transformed: Ultrabook Ushers in…》（2011）：«The Ultrabook vision is a multi-year, industry-wide effort that will roll out in three phases… phase one is in process and will be realized this holiday season with the introduction of the first Ultrabook devices» | Intel 官方《Ultrabook Device Signals Dawn of New Era in Mobile Computing》事实表同述「substantially longer battery life」与主流价位定位 | 2011 年提出，三阶段 | 2026-10-20 已核 |
| U02 | 这一阶段 CPU 侧的可见变化是核心数与线程数一路往上：Core 2 Duo 是两个核两个线程，Nehalem 的 i7 是四核八线程。 | 2006-05-08 稿（Core 2 Duo = two processing cores）；intc detail/893（四核八线程） | intc detail/1193（Skylake 一代仍是四核六线程等不同组合，说明核数不是每代都翻倍） | 2006–2008 | 2026-10-20 已核；**具体各型号核心/线程表本片不逐个列，只用这两个有出处的点说明趋势** |
| U03 | 2015 年这一代 Intel 给出的对比口径是「与五年前的普通电脑相比」性能最高 2.5 倍、电池 3 倍、图形 30 倍。 | intc detail/1193（2015-09-01）：«up to two and a half times better performance, triple the battery life, and graphics that are 30 times better … versus the average 5-year-old computer» | 同稿在更早位置重复同一组对比 | 2015-09-01 | 2026-10-20 已核（**这是厂商对「五年前普通电脑」的对比，不是对上一代 Core 的提升，片中必须按原口径表述**） |
| U04 | 2018 年之后多核与能效成为竞争主轴，桌面端出现「四核八线程、睿频到 4.1 GHz、显卡频率 1.1 GHz」这样的规格。 | intc detail/70（2019-05-28，Computex 2019）：«10th Gen Intel Core desktop processors… enable fast, immersive experiences with up to 4 cores and 8 threads, up to 4.1 GHz max turbo frequency and up to 1.1 GHz graphics frequency» | 同批发布的 PDF 新闻稿《2019-05-28 news releases – 2019 Computex Intel disclosures》同述 10 nm 与 10th Gen | 2019-05-28 发布 | 2026-10-20 已核 |

### c5 转折：大小核与端侧 NPU

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| V01 | 2020 年 9 月 2 日发布的第 11 代 Core（Tiger Lake）建在 10 nm SuperFin 工艺上，配 Iris Xe 图形，带 Thunderbolt 4 与 Intel Wi-Fi 6 (Gig+)，并配套推出 Intel Evo 平台品牌。 | intc detail/1411（2020-09-02）：«Intel launches nine new 11th Gen Intel Core processors with Intel Iris Xe graphics (code-named “Tiger Lake”) on Sept. 2, 2020»；图片说明«based on the 10nm SuperFin process technology»；«Thunderbolt 4 and Intel Wi-Fi 6 (Gig+)» | 同稿的 Intel Evo 说明段（「All Intel Evo platform designs are powered by 11th Gen Intel Core i7 or i5 processors」） | 2020-09-02 发布，10 nm SuperFin | 2026-10-20 已核 |
| V02 | 2021 年 10 月 27 日发布的第 12 代 Core（Alder Lake）第一次采用 Intel 自己的「性能混合架构」，首批是六款解锁的桌面处理器。 | intc detail/1506（2021-10-27）：«unveils the 12th Gen Intel Core processor family with the launch of six new unlocked desktop processors, based on Intel’s performance hybrid architecture» | Intel 官方第 12 代新闻资料页：«the first based on Intel 7 process technology and the new performance hybrid architecture» | 2021-10-27 发布，Intel 7 工艺 | 2026-10-20 已核（**Intel 7 是工艺代号，不是节点纳米数，片中必须这样说明**） |
| V03 | 2023 年 12 月 14 日发布的 Core Ultra 移动处理器建在 Intel 4 工艺与「3D 性能混合架构」上，并第一次在客户端 CPU 里放进神经网络处理器（NPU），Intel 称其能效比上一代好 2.5 倍。 | intc detail/1663（2023-12-14）：«Powered by Intel’s 3D performance hybrid architecture and built on the Intel 4 process»；«Intel Core Ultra features Intel’s first client on-chip AI accelerator — the neural processing unit, or NPU — to enable a new level of power-efficient AI acceleration with 2.5x better power efficiency than the previous generation» | 同稿提到 Core Ultra 是「the company’s largest architectural shift in 40 years」 | 2023-12-14 发布，Intel 4 工艺 | 2026-10-20 已核（**NPU 的 TOPS 数值本轮未取到 Intel 一手页面，标为待核实，片中不写具体 TOPS**） |
| V04 | 2024 年 9 月 3 日发布的 Core Ultra 200V 被 Intel 称为「有史以来效率最高的 x86 处理器」，配套 80 多款整机设计、20 多家厂商，9 月 24 日上市，同年 11 月起可获得 Copilot+ PC 功能。 | intc detail/1707（2024-09-03）：«the Intel® Core™ Ultra 200V series processors are the most efficient x86 processors ever built»；«more than 80 consumer designs from more than 20 of the world’s top manufacturing partners»；«systems available globally on-shelf and online at over 30 global retailers starting Sept. 24»；«Copilot+ PC features as a free update starting in November» | 同稿的图片说明确认发布时间为 2024-09-03（IFA 柏林前） | 2024-09-03 发布 | 2026-10-20 已核 |

### c6 小结

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| D01 | 「酷睿」不是一颗芯片的名字，而是一套每年换一次的手艺：交替做制程和架构，并且给每一代配一个能让人记住的产品形态。 | N01（tick-tock 官方定义）、A10/A11/A12/A13/A15（制程与架构交替的具体年份）、U01（超极本）、V02/V03（性能混合与 NPU） | 每一项在上文均有独立的一手出处 | 2006–2024 | 2026-10-20 已核；**「酷睿」这个名字在 2006 年之后并未覆盖全部型号（Atom、服务器 Xeon、Core Ultra 另起名），片中不把「酷睿」说成 Intel 全部产品的名字** |
| D02 | 这一代真正被改变的，是普通用户能感觉到的三件事：机器从满载风扇到安静、电池从半天的反面变成能用一天、机器从一台变成几台设备。 | U01（超极本的三阶段与电池口径）、U03（2015 年的对比口径）、V01（2020 年的平台品牌与连接）、V03（2023 年的 NPU 与能效） | 同上 | 2011–2024 | 2026-10-20 已核；**「安静」「一天」等体感词在片中必须挂到上表某条具体口径上，不单独成立** |

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

尚未成片，本轮未做。成片后按 [docs/guides/acceptance.md](../../../docs/review.md) 第 5 节执行：逐句、逐画面对照本表复核，Intel 会持续发布新代次，交付前须重新确认「截至日期」一列的每一项外部事实，更正记入本节；「复核」一节在成片前保持空白。

## 查过但决定不写进旁白

供日后更新时使用，本片不进入正文：

- Core 2 各型号的完整 SKU 列表与每颗的价格：本片只用品牌与架构层面；具体 SKU 价格属于商业信息，改动频繁。
- Westmere 的代码名与最高核心数：2010 年那篇一手稿的参数表在抓取时单元格内容丢失，**「最高六核」未取到一手出处，标为待核实**。
- Haswell 的确切上市日与 22 nm：只取到 Intel 官方 PDF 的检索摘要，**未读原文，标为待核实**。
- Ivy Bridge 的「首次在同一代同时推出 22 nm」的细节展开：仅有 intc detail/577 一句概括，展开说明需另找来源。
- NPU 的 TOPS 指标：intel.com 的产品规格页在本轮抓取被拒，**标为待核实**。
- 各代 Core 与 AMD 同代产品的性能对比：本片不写厂商之间的横向跑分对比，只用 Intel 自己给出的口径。
- 酷睿的零售市场占有率、销量：本片不用市场统计代替技术史。
