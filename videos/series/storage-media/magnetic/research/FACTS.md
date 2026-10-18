# 事实

取证日期：2026-10-18。对象是磁带、硬磁盘和软盘这三种磁存储介质：一位数据在物理上怎样被记下、怎样被读出，容量和机构怎样演进，以及它们各自适合什么。本文件只登记陈述和依据，不规定片子的结构、时长分配、画面或措辞。

这是「存储介质」系列的第一集，覆盖磁存储；光盘与闪存留给后续两集。来源编号见 `sources.json`。

## 取证环境

| 材料 | 固定点 |
|---|---|
| 博物馆史料 | Computer History Museum 的 The Storage Engine 条目与时间线、ASME Landmark、Sony/Philips 的厂商史 |
| 标准/厂商规格 | ECMA-147（90 mm 软盘）、LTO Program 的 LTO-9/LTO-10 页、Seagate Mozaic 4+ 新闻稿 |
| 容量口径 | 原页面用 MB/GB/TB 的十进制写法；本文件照录，不擅自换算成 MiB/GiB。厂商的压缩容量按页面注明的压缩比估算 |
| 未做 | 没有拆解真实盘片/磁带做磁力测量；没有做寿命、误码率、长期归档实验。相关陈述只写到文献能支持的程度 |

## 磁记录的基础

| 陈述 | 依据 | 状态 |
|---|---|---|
| 磁记录把信息存成磁性材料里的磁化状态；硬盘在刚性旋转盘片的磁性材料上记录，读写由可移动的磁头完成 | `chm-ramac-1956` 第 2 段 | 已读 |
| 磁存储是非易失的：断电后磁化状态仍在，不需要持续供电来保持数据 | `chm-ramac-1956`；`chm-tape-1951`；`chm-poulsen-1898` | 本文件归纳；三处都描述“记录在磁性材料上” |
| 磁记录的历史早于计算机：Oberlin Smith 1878 年实验钢丝/浸铁粉线，1888 年公开发表想法；Poulsen 1898 年在哥本哈根用电磁铁沿钢琴丝录音，1899 年申请专利，后来做成 Telegraphone | `chm-poulsen-1898` | 已读 |
| Poulsen 的简单版本用 5 英寸钢盘存 2 分钟音频；绕在圆柱上的钢丝可存 30 分钟 | `chm-poulsen-1898` | 已读 |
| 1935 年 AEG 在柏林展出 Magnetophon 商用磁带录音机，用低成本磁性纸带/塑料带 | `chm-timeline` 1935 条 | 已读；只读时间线条目 |
| 写入时，磁头的磁场要把介质磁化；位尺寸与介质的矫顽力成反比，而矫顽力受写入头能产生的磁场限制；更强的写场能用更高矫顽力的介质，从而写更小的位 | `chm-pmr-2005` | 已读 |
| PMR（垂直磁记录）把磁化方向垂直于盘面，而不是沿盘面；它和屏蔽 MR 读头结合，把面密度推到多 TB 级 | `chm-pmr-2005` | 已读 |
| 感应式读头靠磁通变化产生回读信号；MR 读头靠磁场引起的电阻变化，回读信号可以比同尺寸的感应头大 | `chm-mr-head-1990` 开头 | 已读；这是对两类读头差异的概述 |
| MR（各向异性磁阻）1990 年进入硬盘；GMR（巨磁阻）1997 年由 IBM 做成 spin-valve 头；TMR（隧穿磁阻）2004 年进入 2.5 英寸盘 | `chm-mr-head-1990` | 已读 |
| 2014 年硬盘面密度达到 1 Tbit/in²；这是 MR/GMR/TMR 头与 PMR 盘片共同推进的结果 | `chm-mr-head-1990` 末段 | 已读 |

## 硬盘：从 RAMAC 到 HAMR

| 陈述 | 依据 | 状态 |
|---|---|---|
| IBM 350 RAMAC 于 1956 年 6 月交付 Zellerbach Paper，是第一个商用硬盘；它把数据存在 50 张 24 英寸盘片上，主轴 1200 rpm | `chm-ramac-1956` | 已读 |
| RAMAC 的容量是 5 million 个 6-bit 字符，约 3.75 MB；面密度 2,000 bits/in²；磁头靠气压空气轴承飞在盘面上方 800 microinches；平均访问时间小于 1 秒 | `chm-ramac-1956` | 已读 |
| RAMAC 高 5 英尺、宽 6 英尺，连独立空气压缩机超过 1 吨，月租 750 美元 | `chm-ramac-1956` | 已读 |
| ASME 说 RAMAC 每面有 100 条同心磁道，并写“共 20,000 条磁道”；按 50 盘 × 2 面 × 100 条算是 10,000 条，两个来源不一致。本文件只写“每面 100 条”，不写总磁道数 | `asme-ramac`；`chm-ramac-1956` | 两个来源冲突，已标注 |
| 1973 年 11 月，IBM 3340 开始出货；它因“30-30”得名（原始规格两个主轴各 30 MB），实际数据模块有 35/70 MB 两种；磁道密度 300 tpi，访问时间 25 ms | `chm-winchester-1973` | 已读 |
| 3340 的磁头负载小于 20 克，起飞高度 18 microinches；它把盘片、主轴、轴承、磁头定位滑架和磁头臂做进可拆卸的密封数据模块 | `chm-winchester-1973` | 已读 |
| 1975 年的 IBM 3350 把数据模块变成不可拆卸的头盘组件（HDA），容量 317 MB；这成为后来硬盘的基本封装 | `chm-winchester-1973` | 已读 |
| 1980 年 Seagate ST-506 是 5.25 英寸、5 MB 的 Winchester 盘；ST506 接口和外形成为 PC 行业标准；1981 年 ST412 10 MB 进入 IBM XT | `chm-seagate-st506-1980` | 已读 |
| 1983 年 Rodime R0351/352 是第一个 3.5 英寸硬盘，匹配 3.5 英寸软盘的外形；3.5 英寸后来在 PC 里主导了 25 年以上 | `chm-seagate-st506-1980` | 已读 |
| 1990 年 IBM 9345（Sawmill）用 MR 读头，面密度 107 Mbit/in²；1991 年 Corsair 132 Mbit/in²；1997 年 IBM Deskstar 16GP 用 GMR 头，1 Gbit/in²、16.8 GB | `chm-mr-head-1990` | 已读 |
| 2005–2006 年 Toshiba、Seagate、HGST 把 PMR 商业化；Toshiba MK4007GAL 面密度 133 Gbit/in²；2007 年 HGST Deskstar 7K1000 是 1 TB、325 Gbit/in² | `chm-pmr-2005` | 已读 |
| 2013 年 HGST Ultrastar He6 是第一个量产的充氦硬盘：3.5 英寸、7200 rpm、6 TB、7 张盘；氦密度约为空气的 1/7，降低功耗/发热并改善寻道 | `chm-helium-2013` | 已读 |
| 2026 年 3 月，Seagate 的 Mozaic 4+（HAMR 平台）容量最高 44 TB，已向两家大型超大规模云厂商量产出货；路线图是从当前每盘 4+ TB 向 10 TB/盘、单盘最高 100 TB | `seagate-mozaic-4-2026` | 已读厂商新闻稿转载 |
| HAMR 是 heat-assisted magnetic recording（热辅助磁记录）；Mozaic 4+ 是 HAMR 平台 | `seagate-mozaic-4-2026` | 已读；只写名称与容量，不展开激光/介质机制 |

## 磁带

| 陈述 | 依据 | 状态 |
|---|---|---|
| 1951 年 Univac 的 Uniservo 1 用 0.5 英寸宽的磷青铜带，线性密度 128 bits/inch，传输率 7,200 characters/s，替代 Univac I 的穿孔卡输入 | `chm-tape-1951` | 已读 |
| 1952 年 IBM 发布 Model 726 磁带机，配 IBM 701；8 英寸盘可存 2 million digits，月租 850 美元 | `chm-tape-1951` | 已读 |
| 1950 年代磁带靠真空柱缓冲一段 U 形带，带速 100–200 inches/s，防止快速启停时拉断 | `chm-tape-1951` | 已读 |
| 1963 年 8 月 28 日，Philips 在柏林第 23 届 IFA 发布 Compact Cassette，配套 EL 3300 录音机与 EL1903 磁带；最初面向口述/家用录音，后来扩展到音乐 | `philips-cassette-press-1963`；`philips-cassette-museum` | 已读 |
| Compact Cassette 的尺寸由 Lou Ottens 团队用“能放进口袋的木块”定下；Philips 以免许可费换技术规范，使它成为世界标准；1965 年推出预录 Musicassette；后来做到 90/120 分钟 | `philips-cassette-museum` | 已读 |
| 紧凑 cassette 作为家庭录音系统持续了 35 年以上，是最广泛使用的家用录音介质之一 | `philips-cassette-museum` | 已读 |
| 1997 年 HP、IBM、Seagate 宣布 LTO（Linear Tape-Open）联盟，目标是开放、可授权、可认证的高容量磁带；2010 年 IBM 的 LTFS 让磁带像文件系统一样访问 | `chm-lto-1997` | 已读 |
| LTO-9 的容量是 18 TB 原生、45 TB（2.5:1 压缩）；原生传输 400 MB/s，压缩 1,000 MB/s；与 LTO-8 向后读写兼容 | `lto-9` | 已读厂商规格 |
| LTO-10 有两种卡带：30 TB 与 40 TB 原生，按 2.5:1 压缩为 75 TB 与 100 TB；原生传输 400 MB/s，压缩 1,200 MB/s；15,104 条数据磁道，比 LTO-9 的 8,960 条多 68.5%；用锶掺杂 BaFe 介质 | `lto-10` | 已读厂商规格 |
| LTO-10 不向后兼容：不能读写 LTO-9 及更早的卡带；这是 LTO 每两三代一次的大技术跳跃 | `lto-10` | 已读厂商规格 |
| 磁带的记录是线性的：磁头沿磁道顺序读写；它适合大容量、长时期、低成本的归档，随机访问不如磁盘 | `lto-10`（linear/track density）；`chm-lto-1997`（慢访问、低成本、长期保存）；`chm-tape-1951` | 已读；这是对“线性/顺序”机制的归纳 |
| LTO-10 的 30 TB 卡带用 12 Gb/in² 的面密度，而 18 TB 硬盘用 1022 Gb/in²；也就是说，磁带用约 1/85 的面密度做到相近容量，靠的是展开后巨大的表面积 | `lto-10` | 已读；页面自己给了这个比较 |
| 2014/2015 年 Fujifilm-IBM、Sony 公布过 154 TB/220 TB 的磁带原型；这些是实验原型，不是当时的出货产品 | `chm-lto-1997` | 已读；只作背景，不写成市售容量 |

## 软盘

| 陈述 | 依据 | 状态 |
|---|---|---|
| 1971 年 IBM 23FD “Minnow” 是第一个 8 英寸软盘驱动器：可移动、只读、80 KB，约等于 3,000 张穿孔卡；用于给 IBM 3330 控制器加载微码 | `chm-floppy-1971` | 已读 |
| 1976 年出现 500 KB 双面单密度 8 英寸盘；1977 年出现 1.2 MB 格式；1976 年 Shugart SA 400 5.25 英寸 Minifloppy 是 110 KB，OEM 价 390 美元，十张盘 45 美元 | `chm-floppy-1971`；`chm-minifloppy-1976` | 已读 |
| 1980 年 Sony 发售世界首个 3.5 英寸微软盘；1982 年 Microfloppy Industry Committee 以 Sony 设计为基础定下 3.5 英寸规格；后来做到最高 1.44 MB | `sony-media-history`；`chm-minifloppy-1976` | 已读；注意 1980 是 Sony 产品，1982 是行业规格 |
| ECMA-147 规定 90 mm 软盘用 MFM 记录，每面 80 条磁道，31,831 ftprad，ISO type 303；它规定机械、物理、磁特性、记录方法、磁道布局与格式 | `ecma-147` | 已读标准页 |
| 软盘是可移动的柔性盘片；它在 PC 时代被广泛用于可移动存储，容量、速度和可靠性都低于硬盘 | `chm-floppy-1971`；`chm-minifloppy-1976` | 已读；具体用途未逐项取证，不写“启动/装系统”等细节 |
| 1994 年 Iomega Zip 把 100 MB 装在 3.5 英寸可移动盘包里；1990 年软驱年产量约 1.2 亿台，之后被 CD-R 等取代 | `chm-minifloppy-1976` | 已读 |

## 容量与尺度（都由已引容量计算）

| 陈述 | 依据 | 状态 |
|---|---|---|
| RAMAC 的约 3.75 MB 与 2026 年 44 TB HAMR 盘相差约 1,170 万倍（44×10¹² ÷ 3.75×10⁶） | `chm-ramac-1956`；`seagate-mozaic-4-2026` | 计算 |
| LTO-10 的 40 TB 卡带与 1.44 MB 软盘相差约 2,800 万倍（40×10¹² ÷ 1.44×10⁶） | `lto-10`；`chm-minifloppy-1976` | 计算 |
| 1956 年 RAMAC 的面密度是 2,000 bits/in²；2014 年硬盘到 1 Tbit/in²；两者相差约 5 亿倍 | `chm-ramac-1956`；`chm-mr-head-1990` | 计算；1 Tbit = 10¹² bit，2,000 = 2×10³ |
| LTO-10 的 40 TB 与 44 TB HAMR 盘已经接近同一量级；但一个是可移动卡带、顺序访问，一个是密封硬盘、随机访问 | `lto-10`；`seagate-mozaic-4-2026` | 计算/归纳 |

## 历史时间线

| 年份 | 事件 | 依据 | 状态 |
|---|---|---|---|
| 1878/1888 | Oberlin Smith 实验钢丝磁记录，1888 年公开发表想法 | `chm-poulsen-1898` | 已读 |
| 1898 | Poulsen 用钢丝录音，1899 申请专利，Telegraphone | `chm-poulsen-1898` | 已读 |
| 1935 | AEG Magnetophon 商用磁带录音机 | `chm-timeline` | 已读时间线 |
| 1951 | Univac Uniservo 1 磁带数据存储 | `chm-tape-1951` | 已读 |
| 1952 | IBM 726 磁带机 | `chm-tape-1951` | 已读 |
| 1956 | IBM 350 RAMAC 商用硬盘 | `chm-ramac-1956`；`asme-ramac` | 已读 |
| 1963 | Philips Compact Cassette 在 IFA 发布 | `philips-cassette-press-1963` | 已读 |
| 1971 | IBM 23FD 8 英寸软盘 | `chm-floppy-1971` | 已读 |
| 1973 | IBM 3340 Winchester | `chm-winchester-1973` | 已读 |
| 1976 | Shugart 5.25 英寸 Minifloppy；500 KB 8 英寸盘 | `chm-minifloppy-1976`；`chm-floppy-1971` | 已读 |
| 1980 | Sony 3.5 英寸微软盘；Seagate ST-506 5 MB 硬盘 | `sony-media-history`；`chm-seagate-st506-1980` | 已读 |
| 1982 | Microfloppy Industry Committee 定 3.5 英寸规格 | `chm-minifloppy-1976` | 已读 |
| 1983 | Rodime 3.5 英寸硬盘 | `chm-seagate-st506-1980` | 已读 |
| 1990 | IBM 9345 用 MR 读头 | `chm-mr-head-1990` | 已读 |
| 1997 | HP/IBM/Seagate 成立 LTO 联盟；IBM GMR 头 | `chm-lto-1997`；`chm-mr-head-1990` | 已读 |
| 2005 | PMR 商业化 | `chm-pmr-2005` | 已读 |
| 2013 | HGST 充氦硬盘 | `chm-helium-2013` | 已读 |
| 2014 | 硬盘面密度 1 Tbit/in² | `chm-mr-head-1990` | 已读 |
| 2026 | LTO-10（30/40 TB 原生）；Seagate Mozaic 4+ 44 TB HAMR | `lto-10`；`seagate-mozaic-4-2026` | 已读 |

## 边界与常见误说

| 说法 | 核查结果 | 依据 |
|---|---|---|
| “RAMAC 是 5 MB” | 不精确。它是 5 million 个 6-bit 字符，约 3.75 MB；写 5 MB 时要说清是“5 百万字符”还是“3.75 MB” | `chm-ramac-1956`；`asme-ramac` |
| “RAMAC 有 20,000 条磁道” | 来源冲突：ASME 写 20,000，CHM 写每面 100 条（按 50 盘×2 面是 10,000）。本片不写总磁道数 | `asme-ramac`；`chm-ramac-1956` |
| “第一个硬盘是 RAMAC” | 应写“第一个商用硬盘”。Rabinow 1951 的 notched-disk 等是更早的实验/专利；不要用“第一个”覆盖所有前史 | `chm-ramac-1956`；`chm-timeline` 1951 条 |
| “软盘是 1982 年发明的” | 8 英寸软盘 1971 年就有；Sony 3.5 英寸是 1980 年产品，1982 年是行业规格。三个时间不能混 | `chm-floppy-1971`；`sony-media-history`；`chm-minifloppy-1976` |
| “1.44 MB 就是 1.44 MiB” | 不要混。1.44 MB 是常见格式化容量的叫法；本文件不把它换算成 MiB，也不手算字节数 | `chm-minifloppy-1976`；`ecma-147` |
| “磁带已经淘汰” | 错。LTO-9/LTO-10 仍在出货；LTO-10 2026 年提供 30/40 TB 原生容量，用于归档/备份/离线保护 | `lto-9`；`lto-10` |
| “磁带的面密度比硬盘高” | 不对。LTO-10 30 TB 用 12 Gb/in²，18 TB 硬盘用 1022 Gb/in²；磁带靠更大的展开面积做到高容量 | `lto-10` |
| “LTO-10 能读 LTO-9” | 错。LTO-10 不向后兼容，不能读写 LTO-9 及更早的卡带 | `lto-10` |
| “PMR 是唯一的新技术” | 不全面。还有 GMR/TMR 读头、氦气密封、HAMR、SMR 等；本片只讲与磁带/磁盘/软盘主线相关的 | `chm-pmr-2005`；`chm-helium-2013`；`seagate-mozaic-4-2026` |
| “氦气硬盘是 2013 年才想到的” | 不对。1970 年代就有尝试；2013 年是第一个成功量产的 HGST He6 | `chm-helium-2013` |
| “MR、GMR、TMR 是同一种头” | 不是。MR 1990、GMR 1997、TMR 2004，三代不同的磁阻效应/结构 | `chm-mr-head-1990` |
| “cassette 是 Lou Ottens 一个人发明的” | 不准确。Philips Hasselt 的团队开发；Ottens 是产品开发负责人，博物馆用“Lou Ottens 团队”的叙述 | `philips-cassette-museum` |
| “Poulsen 发明了磁记录” | 不准确。Oberlin Smith 更早提出想法；Poulsen 做成了第一台可工作的钢丝录音机/Telegraphone。写“Poulsen 的 Telegraphone”而不是“发明磁记录” | `chm-poulsen-1898` |
| “HAMR 的 44 TB 已经大规模零售” | 新闻稿说已向两家超大规模云厂商量产出货， broader availability 还在扩；不要写成“人人能买到” | `seagate-mozaic-4-2026` |

## 不进入定稿的句子

| 句子 | 原因 |
|---|---|
| 磁带可以保存 30 年/50 年 | 本次没有读归档寿命标准与测试报告；厂商页只说“长期”，不给统一年限 |
| 软盘的可靠寿命是 N 年 | 没有读加速老化实验；不写 |
| LTO-10 的 100 TB 是实际可用容量 | 100 TB 是 40 TB × 2.5:1 的压缩估算；实际取决于数据可压缩性，不能写成保证 |
| 某块硬盘的持续传输速度是 N MB/s | 本次没有做盘上测量；只写厂商/页面给出的接口或原生传输率，并注明口径 |
| HAMR 靠激光加热到 N 度 | 没有读 HAMR 的机理原始资料；只写“热辅助磁记录”名称与容量，不写温度/功率 |
| 磁带是“纯顺序”，完全不能随机访问 | 磁带可以在磁道上定位/快进，但随机访问代价高；不要写成绝对不能 |
| 软盘“靠磁头接触盘面” | 本次没有读具体接触/加载机制；不写接触方式，只写柔性盘片与可移动 |
| RAMAC 的 5 MB 等于今天的 5 MB | 它是 5 million 6-bit characters；与今天的字节定义不同，必须写清口径 |
| “第一个商用硬盘”是 1956 年 9 月 4 日 | ASME 写引入日 9 月 4 日，CHM 写 6 月交付 Zellerbach；两个日期口径不同（发布/交付），不要合成一个 |

## 文案审查

尚未写稿，未交审。写稿后按 `docs/script-review.md` 逐轮记录交审日期、稿本哈希、意见与明确确认；没有确认不配音。

## 制作署名

策划：WaterRun。2026-10-18 这次会话中的 DeepSeek V4.1 Flash 1017 使用 Web Fetch 读取博物馆、厂商与标准资料并写下本目录的事实记录；没有写旁白。仓库：https://github.com/Water-Run/ft 。

## 复核

没有成片。等脚本与画面完成后，按 `docs/review.md` 第 5 节逐句、逐画面复核；本文件现在只完成取证阶段的交叉核查。
