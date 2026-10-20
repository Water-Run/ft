# CVVT 事实表

取证日期：2026-10-20（UTC+8）。对象：**可变气门正时（CVVT / VVT / VTC）**及其与可变气门升程的关系，重点是凸轮轴相位、气门重叠角与泵气损失的物理机制，以及 Toyota、Honda、Ford、Nissan 四家的官方命名与年代。比较只在同一厂商的不同代际之间进行，不做厂商之间的优劣排名。本文是旁白、画面、标题与说明的事实入口。

一手来源全部为厂商官方材料（官方新闻稿、官方技术页、官方历史页、官方术语表、官方车主信息页）；厂商官方材料之间互相印证时算两路，媒体报道与论坛只用于定位，不写入结论。

## 环境与版本

| 项 | 版本 / 标识 | 获取方式 |
|---|---|---|
| Toyota 官方新闻稿 | 《Toyota Develops New VVT-i Engine Technology》，页面日期 Jun. 19, 1995（https://global.toyota/en/detail/7893162） | `lab/21_webtext.ps1`（curl.exe）→ `lab/out_52_toyota_honda.txt`、`lab/out_55_toyota_date_nissan.txt`、`lab/out_56_toyota_date.txt`；同稿另见 https://global.toyota/en/download/8499122/ |
| Honda 官方历史页 | 《The VTEC Engine / 1989》（https://global.honda/en/heritage/episodes/1989vtecengine.html） | `lab/21_webtext.ps1` → `lab/out_52_toyota_honda.txt` |
| Honda 官方技术页 | 《B16A: Honda’s Innovative Engine with VTEC…》，页面标注 2025.09.30（https://global.honda/en/tech/engine/car/B16A_integra_vtec/） | `lab/21_webtext.ps1` → `lab/out_54_honda_tech.txt` |
| Honda 官方新闻稿 | 《Honda Launches New-Generation Engine: Honda "DOHC i-VTEC"》，October 26, 2000（https://global.honda/en/newsroom/worldnews/2000/4001026.html） | `lab/21_webtext.ps1` → `lab/out_52_toyota_honda.txt` |
| Honda 官方术语页 | Honda Information Center《Intelligent Variable Valve Timing and Lift Electronic Control (i-VTEC®) (Select Vehicles)》（©2026 American Honda Motor Co., Inc.） | `lab/21_webtext.ps1` → `lab/out_54_honda_tech.txt` |
| Nissan 官方新闻稿 | ①《NISSAN ENGINE ONLY EIGHT-TIME WINNER》，2001-12-11 发出 / 2002-01-10 颁奖（https://global.nissannews.com/en/releases/020110-01）；②《NISSAN DEVELOPS NEW-GENERATION V6 ENGINES》，Aug. 22, 2006（https://global.nissannews.com/en/releases/060822-01-e） | `lab/21_webtext.ps1` → `lab/out_55_toyota_date_nissan.txt`、`lab/out_58_nissan_ford.txt` |
| Ford 官方新闻稿 | ①《Ford Launches New Fuel-Efficient 1.5-Liter EcoBoost Engine…》，April 11, 2013；②《Ford 1.0-Liter EcoBoost Wins International Engine of the Year…》，June 21, 2017（media.ford.com，经 Internet Archive 存档快照） | `lab/21_webtext.ps1` → `lab/out_60_ford.txt`；存档定位用 Wayback CDX API，检索脚本 `lab/20_search_brave.ps1` 与 `lab/out_57_search4.txt` |
| 取证机与工具 | Windows 11，PowerShell 7.6.7，`curl.exe` | 各脚本回显头部记录取证时刻（UTC）与内容 SHA-256；全部为只读 GET |
| 检索工具 | Brave、Wayback CDX / availability API（仅用于定位官方页面） | `lab/20_search_brave.ps1` → `out_50_search1.txt`、`out_51_search2.txt`、`out_53_search3.txt`、`out_57_search4.txt` |
| 核查日期 | 2026-10-20（UTC+8） | — |

## 逐章

### open

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| V01 | 早年的高转运动型发动机用高升程凸轮轴，牺牲低转表现来换高转功率；可变气门技术的意义是让两者不再二选一 | Honda 官方技术页《B16A…》：“High-lift cam profiles were the norm for pre-VTEC sports car engines, which sacrificed low-rpm ranges in favor of high rpm. VTEC was the gamechanger, allowing switching between valve lift profiles.”（`out_54_honda_tech.txt`） | Honda 官方历史页《The VTEC Engine / 1989》：“specific targets identified through the program included high torque in both the low- and high-rpm ranges and dramatic increases in horsepower per liter”（`out_52_toyota_honda.txt`） | Honda 官方材料，页面日期 2025-09-30 / 存档 1989 事件 | 2026-10-20 已核 |
| V02 | 厂商要动气门的时刻，是因为部分负荷下气门正时直接决定油耗、燃烧温度与排放 | Toyota 官方新闻稿 1995-06-19：“In a conventional gasoline engine, the throttle valve controls the air intake when the accelerator pedal is not completely pressed down (partial-load driving). This generates vacuum pressure within the cylinder, causing extra load on the piston (pumping loss).”（`out_56_toyota_date.txt`） | Honda 官方 i-VTEC 术语页：VTC “continuously adjusts the intake valve timing to best match the current engine load”（`out_52_toyota_honda.txt`，2000 稿） | Toyota 1995 稿、Honda 2000 稿 | 2026-10-20 已核 |

### ch1 涉及的部件与物理原理

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| V03 | 凸轮轴上两样东西各管一件事：凸轮的形状决定气门什么时候开合（正时），凸轮的高度决定气门开多大（升程） | Honda 官方技术页《B16A…》：“The shape of the cams determines the valve timing, while the height of the cam lobe determines the valve lift.”（`out_54_honda_tech.txt`） | Honda 官方历史页 1989：开发目标同时包含“valve timing and lift”，并分别讨论 cam hill 切换与升程（`out_52_toyota_honda.txt`） | Honda 官方材料 | 2026-10-20 已核 |
| V04 | 「重叠角」指进气门与排气门同时打开的那段曲轴转角 | Toyota 官方新闻稿 1995-06-19：“Valve overlap (the timing when both intake and exhaust valves are open), created by continuous, broad control of intake valve timing based on the engine load and speed…”（`out_56_toyota_date.txt`） | Honda 官方技术页：低速凸轮型线是“a small overlap when both intake and exhaust valves are open at the same time”，高速为“large overlap in valve timing”（`out_54_honda_tech.txt`） | Toyota 1995 稿、Honda 官方技术页 | 2026-10-20 已核 |
| V05 | 部分负荷的泵气损失：节气门半开时缸内被抽成负压，活塞要额外克服这份压力，功就白费了 | Toyota 官方新闻稿 1995-06-19（同 V02 引文）：负压“causing extra load on the piston (pumping loss)”（`out_56_toyota_date.txt`） | Honda 官方历史页 1989 的低转做法：以提前关闭进气门提高充气效率（见 V09），指向同一「少做无用功」的机理（`out_52_toyota_honda.txt`） | Toyota 1995 稿；Honda 1989 稿 | 2026-10-20 已核 |
| V06 | Toyota 的做法：部分负荷时把进气门开得更早、重叠加大，把一部分废气抽回气缸，带来三个结果——缸内负压被缓解从而减少进气损失并省油；燃烧温度下降从而减少 NOx；未燃气体回到气缸重烧从而减少碳氢 | Toyota 官方新闻稿 1995-06-19：“an engine with VVT-i advances the timing for opening the intake valve during partial-load driving, increases valve overlap, and draws partial exhaust gas back into the cylinder. This produces three results: (1) negative pressure inside the cylinder is mitigated to reduce intake loss and increase fuel economy; (2) combustion temperature is lowered to reduce NOx; and (3) unburned gas is returned to the combustion chamber to be reburned, reducing hydrocarbons.”（`out_56_toyota_date.txt`） | 无第二路（该稿是同一份发布） | Toyota 1995 稿 | 2026-10-20 一手已核；**第二路待补**，该段三点结论进定稿前须再找一份官方或一手材料佐证 |
| V07 | 怠速时气门不重叠，以稳住燃烧，同时降低怠速转速省油 | Toyota 官方新闻稿 1995-06-19：“The valves do not overlap to stabilize combustion when the engine is idling, and the idling speed is lowered to improve fuel economy.”（`out_56_toyota_date.txt`） | Honda 官方技术页：低速凸轮型线“a small overlap”（`out_54_honda_tech.txt`） | Toyota 1995 稿、Honda 官方技术页 | 2026-10-20 已核 |
| V08 | 高负荷时反过来用足进气惯性效应：进气门在压力差最大时更早开、关得更晚，吸进更多空气，扭矩和功率都上去；低速中速则提前关进气门，转速升高后再推迟关闭 | Toyota 官方新闻稿 1995-06-19：“During high-load driving conditions… the intake valve timing is given optimum (continuous and broad) control based on engine speed. The intake inertia effect is fully utilized to increase intake air, thus raising torque and output.”；“The VVT-i engine increases low- and medium-speed torque by controlling, in advance, intake valve closing in the low- and medium-speed ranges. With an increase in engine speed, the timing for closing the intake valve is retarded to raise output.”（`out_56_toyota_date.txt`） | Honda 官方历史页 1989：“the intake valve to close early, drastically improving the engine’s volumetric efficiency”（`out_52_toyota_honda.txt`） | Toyota 1995 稿、Honda 1989 稿 | 2026-10-20 已核 |
| V09 | 低转扭矩的另一个办法是把进气门提前关掉：把低速凸轮从传统的下止点后 35° 改成 20/30°，让进气门早早关上，充气效率因此大幅提高 | Honda 官方历史页《The VTEC Engine / 1989》：“Low-speed torque, an initial project objective, was obtained by changing the low-speed cam’s setting from the traditional 35 degrees to 20/30 degrees ABDC (after bottom dead-center). This permitted the intake valve to close early, drastically improving the engine’s volumetric efficiency.”（`out_52_toyota_honda.txt`） | Honda 官方技术页《B16A…》同样以低转「小重叠、低升程」型线对应低中转扭矩（`out_54_honda_tech.txt`） | Honda 1989 事件与官方技术页 | 2026-10-20 已核 |
| V10 | 高转的办法是换一整套凸轮型线：气门开得更早、关得更晚、升程更大，重叠加大带来的排气扫气效应改善进气充量 | Honda 官方技术页《B16A…》：“the high-lift cam lobe then controls the movement of all the rocker arms… making the valves open earlier and close later, and creating more lift… The resulting large overlap in valve timing, ideal for high-rpm operation, enhances exhaust scavenging, thereby improving volumetric efficiency during air intake, while the large valve lift facilitates intake and exhaust flow.”（`out_54_honda_tech.txt`） | Honda 官方历史页 1989：“adopted valve timing and lift settings that were comparable to Honda racing engines in order to enhance volumetric efficiency”（`out_52_toyota_honda.txt`） | Honda 官方材料两篇 | 2026-10-20 已核 |
| V11 | 切换由 ECU 依据转速、负荷、车速决定，Honda B16A 在 4800–5200 rpm 之间换凸轮型线 | Honda 官方技术页《B16A…》：“Switching between cam profiles is controlled according to the operating conditions at the time, with the engine control unit (ECU) sensing inputs such as engine speed, engine load, and vehicle speed. Switching occurs around the 4,800–5,200 rpm range.”（`out_54_honda_tech.txt`） | 无第二路 | Honda 官方技术页 | 2026-10-20 一手已核；第二路待补（属具体数值） |
| V12 | 凸轮轴相位怎么被连续改变：把带螺旋花键的凸轮轴做成可相对移动的皮带轮，液压活塞沿凸轮轴轴向推它，凸轮轴就转过所需的角 | Toyota 官方新闻稿 1995-06-19：“In VVT pulley operation, a piston with a helical spline is moved hydraulically in the direction of the camshaft axis to move the camshaft by the exact amount required.”；新工艺做出螺旋角 30° 的花键，“a very swift response and a large variable angle (up to 60° crankshaft angle) with a small stroke in the direction of the camshaft axis”（`out_56_toyota_date.txt`） | 同稿另述三个部件：ECU 算最优正时、油控阀 OCV 控油压、WT 皮带轮改正时，且用发动机常规油泵驱动（`out_56_toyota_date.txt`） | Toyota 1995 稿 | 2026-10-20 一手已核；第二路待补（60° 曲轴转角为具体数值） |

### ch2 关键指标与取舍

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| V13 | Toyota 官方给出的 VVT-i 试验结果：油耗提高约 6%，中低转扭矩提高约 10% | Toyota 官方新闻稿 1995-06-19：“Tests have confirmed that VVT-i increases fuel economy by about 6% and raises low and medium-range torque by about 10%.”（`out_56_toyota_date.txt`） | 无第二路 | Toyota 1995 稿 | 2026-10-20 一手已核；**第二路待补**，进定稿前须补路或改为「官方当年公布的试验值」口径 |
| V14 | Honda B16A 的官方性能数字：最大功率 160 PS @ 7600 rpm、最大扭矩 15.5 kg·m @ 7000 rpm、红线 8000 rpm；同期 ZC 为 120 PS @ 6300 rpm、14.5 kg·m @ 5500 rpm | Honda 官方技术页《B16A…》（`out_54_honda_tech.txt`） | Honda 官方历史页 1989：“the goal was reached, with a full 160 horsepower at 7,600 rpm and a redline of 8,000”；“a 1.6-liter unit - 90 horsepower per liter”→ 改目标为 100 PS/L（`out_52_toyota_honda.txt`） | Honda 官方两篇 | 2026-10-20 已核；美国制与日本制功率标注不同，片中用 PS 并注明来源 |
| V15 | Nissan 新一代 V6 相对既有 VQ 发动机燃油效率提高 10%，并达到 SU-LEV 排放等级（相对日本 2005 年标准，NOx 与 HC 不超过 75%） | Nissan 官方新闻稿 2006-08-22：“The engines achieve a 10% improvement in fuel efficiency compared to vehicles equipped with the existing VQ engine and top-in-class Super Ultra-Low Emission Vehicle level emissions. SU-LEVs have 75% or less nitrogen oxide (NOx) and hydrocarbon (HC) emissions than those stipulated by Japan’s 2005 exhaust emission standards.”（`out_58_nissan_ford.txt`） | 无第二路（Nissan 该稿为唯一出处） | Nissan 2006 稿 | 2026-10-20 一手已核；第二路待补 |
| V16 | Ford 官方口径：EcoBoost 技术带来约 20% 的燃油效率提升与至多 15% 的排放改善 | Ford 官方新闻稿 2013-04-11：“EcoBoost technologies enable improvements to fuel efficiency of 20 percent and emissions of up to 15 percent.”（`out_60_ford.txt`） | 无第二路 | Ford 2013 稿 | 2026-10-20 一手已核；第二路待补 |
| V17 | 取舍关系：同一套气门控制在不同工况下偏向不同目标——低负荷偏向省油与排放，高负荷偏向充气与功率 | 由 V06、V08（Toyota 官方对部分负荷与高负荷分别说明目标）、V09、V10（Honda 官方对低转与高转分别说明目标）、V07（怠速不重叠）归纳的机制陈述；各工况的目标表述分别出自官方原文 | 归纳本身是制作者对多份官方材料的并置，不是厂商原话；片中须按「厂家说法 + 机制」两层表述，不写成「厂商认为三者必然对立」 | Toyota 1995 稿、Honda 官方两篇 | 2026-10-20 已核（归纳依据可复查） |

### ch3 可变气门升程与可变气门正时的关系

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| V18 | Honda 的 VTEC 全称是 Variable Valve Timing & Lift Electronic Control System：既改时刻也改升程，1989 年随 Integra 首发，是世界首款同时改变气门正时与升程的机构 | Honda 官方技术页《B16A…》：“VTEC, which stands for ‘Variable Valve Timing & Lift Electronic Control System,’ is the technology that fulfills these contradicting requirements.”；“the world’s first variable valve timing and lift technology”（`out_54_honda_tech.txt`） | Honda 官方历史页 1989：“the world’s first valve mechanism capable of simultaneously changing the valve timing and lift on the intake and exhaust sides”（`out_52_toyota_honda.txt`） | Honda 官方两篇 | 2026-10-20 已核 |
| V19 | VTEC 的结构：每缸三组凸轮从动件（两端低升程、中间高升程），液压销在高速时把三根摇臂连成一体 | Honda 官方技术页《B16A…》：“Each cylinder has three cam lobes arranged in a row—low-lift lobes at both ends and a high-lift lobe between them.”；“the pins are retracted… When the hydraulic pins are actuated, the three rocker arms become joined.”（`out_54_honda_tech.txt`） | Honda 官方历史页 1989：“a set of three cam followers and rocker arms on both the intake side and exhaust side”（`out_52_toyota_honda.txt`） | Honda 官方两篇 | 2026-10-20 已核 |
| V20 | VTEC 的前身是 1982 年为摩托车开发的 REV（Revolution Modulated Valve Control）气门停用机构 | Honda 官方技术页《B16A…》：“VTEC evolved out of REV (Revolution Modulated Valve Control), a valve deactivation mechanism developed for motorcycles in 1982.”（`out_54_honda_tech.txt`） | 无第二路 | Honda 官方技术页 | 2026-10-20 一手已核；第二路待补 |
| V21 | Honda 的 i-VTEC = VTEC 加上 VTC（Variable Timing Control）：VTEC 仍按转速在低/高凸轮型线间切换，VTC 则让进气凸轮轴的相位连续可调 | Honda 官方术语页（Honda Information Center）：“This feature adds Variable Timing Control™ (VTC™) of the intake camshaft to Honda’s renowned VTEC. VTEC still operates the same—using a low-profile cam lobe at low rpm and activating a high-profile cam lobe at high rpm—but its performance is augmented by VTC, which allows infinitely variable control over camshaft phasing.”（`out_54_honda_tech.txt`） | Honda 官方新闻稿 2000-10-26：“Honda’s VTEC system, which varies the timing and amount of lift of the valves according to engine speed, and VTC (Variable Timing Control), which continuously adjusts the intake valve timing to best match the current engine load.”（`out_52_toyota_honda.txt`） | Honda 官方两篇 | 2026-10-20 已核 |
| V22 | Toyota 的 VVT-i 只连续改变进气门的开闭时刻，不改升程；它的前身 WT 是 1991 年在 4A-GE 运动型发动机上的两段式开闭（即升程切换） | Toyota 官方新闻稿 1995-06-19：“In 1991, Toyota introduced the WT mechanism on its 4A-GE sports engines… WT enables the intake valve to open and close in two steps, based on engine operating conditions.”；“VVT-i is an improved version of the WT mechanism. By continuously changing the open/close timing of the intake valve, VVT-i provides optimum valve timing based on driving conditions.”（`out_56_toyota_date.txt`） | 无第二路 | Toyota 1995 稿 | 2026-10-20 一手已核；第二路待补（1991 年 WT 的具体机型与年份） |
| V23 | Nissan 的命名分两侧：进气侧 CVTC（continuously variable valve timing control，连续可变气门正时控制），排气侧 e-VTC（electromagnetic valve timing control，电磁式气门正时控制） | Nissan 官方新闻稿 2006-08-22：“Adoption of continuously variable valve timing control (CVTC) for intake side and electromagnetic valve timing control (e-VTC) for exhaust side”（`out_58_nissan_ford.txt`） | 无第二路 | Nissan 2006 稿 | 2026-10-20 一手已核；第二路待补（CVTC 这一名称在片中若作为 Nissan 官方术语引用，须以本条原文为唯一出处） |
| V24 | Ford 的做法是把增压、直喷与正时打包成 EcoBoost；1.0 升 EcoBoost 用官方称为「双凸轮轴独立正时」的技术 | Ford 官方新闻稿 2013-04-11：“The 1.5-liter EcoBoost offers trademark EcoBoost turbocharging, direct fuel injection and variable valve timing”（`out_60_ford.txt`）；2017-06-21：“sophisticated EcoBoost turbocharging, direct fuel injection and Twin Independent Variable Camshaft Timing technologies”（`out_60_ford.txt`） | 两稿为 Ford 官方同期材料，互为两路 | Ford 2013 与 2017 稿 | 2026-10-20 已核 |
| V25 | 升程可变与正时可变的差别：前者换的是气门开多大（两段或多段型线），后者换的是气门什么时候开（连续相位） | 由 V03（形状管正时、高度管升程）、V19（升程切换的三段摇臂）、V21（VTC 连续相位）、V22（VVT-i 连续改变开闭时刻）归纳 | 归纳自四份官方材料；片中须以「按官方描述归纳」表述，不引用不存在的厂商统一定义 | Toyota 1995 稿、Honda 官方三篇 | 2026-10-20 已核（归纳依据可复查） |
| V26 | Ford 发动机上的可变气门升程（variable valve lift）本轮未取得官方一手描述 | 无 | 无 | — | **待核实**：Ford 官方稿只写到 turbocharging、direct fuel injection、variable valve timing 与 Twin Independent Variable Camshaft Timing；片中不提 Ford 的可变升程，改以 Honda VTEC 与 Toyota WT 作为升程可变的先例 |

### ch4 厂商典型做法

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| V27 | Toyota：1995-06-19 公布 VVT-i，结构为 ECU + 油控阀 OCV + WT 皮带轮，用常规发动机油泵驱动，凸轮轴可变角度达 60° 曲轴转角，先用于当年新车型 | Toyota 官方新闻稿 1995-06-19（`out_56_toyota_date.txt`；同稿下载页 https://global.toyota/en/download/8499122/ ） | 同一发布的两处官方页面 | Toyota 1995 稿 | 2026-10-20 一手已核 |
| V28 | Honda：VTEC 随 1989 年 4 月 19 日发布的 Integra 首发（1.6 升 DOHC，100 PS/L），同年 9 月 21 日进入 CR-X 与 Civic，1990 年用于 NSX；1991 年有 VTEC-E，1995 年有三段式 VTEC | Honda 官方技术页《B16A…》：“It was incorporated into the Integra model announced on April 19, 1989, and into the CR-X and Civic models launched on September 21 the same year.”；NSX 1990（`out_54_honda_tech.txt`）；Honda 官方历史页 1989：“Following the SOHC/VTEC engine, and then the VTEC-E in 1991, this technology evolved into the three-stage VTEC engine introduced in 1995”（`out_52_toyota_honda.txt`） | Honda 官方两篇 | Honda 官方材料 | 2026-10-20 已核 |
| V29 | Ford：EcoBoost 系列 2009 年以 3.5 升 V6 起步，随后 2010 年 2.0 升、2011 年 1.6 升、2012 年 1.0 升、2013 年 1.5 升 | Ford 官方新闻稿 2013-04-11：“Ford has sold more than 600,000 EcoBoost-equipped vehicles globally since the range was launched with the 3.5-liter V6 EcoBoost in 2009. Ford added the 2.0-liter EcoBoost in 2010, the 1.6-liter EcoBoost followed in 2011, and last year the 1.0-liter EcoBoost was launched”（`out_60_ford.txt`） | 无第二路 | Ford 2013 稿 | 2026-10-20 一手已核；第二路待补 |
| V30 | Nissan：VQ 发动机 1994 年开始生产（2006 稿口径），1995 年经美国市场以 Nissan Maxima 上市（2002 稿口径）；到 2002 车型已连续第八年入选 Ward's 十大发动机 | Nissan 官方新闻稿 2006-08-22：“Nissan began VQ engine production in 1994”（`out_58_nissan_ford.txt`）；2002-01-10 稿：“Since its U.S. introduction in 1995 in the Nissan Maxima, the VQ engine has undergone two evolutions…”与“named for the eighth-straight year”（`out_55_toyota_date_nissan.txt`） | 两稿为 Nissan 官方同期材料，互为两路 | Nissan 官方两稿 | 2026-10-20 已核；两个年份口径不同（生产起始 1994 / 美国上市 1995），片中须分开讲，不可合并成「1995 年上市生产」 |
| V31 | 命名对照：Toyota 叫 VVT-i，Honda 叫 VTEC（升程+正时）与 i-VTEC（加连续正时），Ford 不为正时另起专名而并入 EcoBoost，Nissan 用 CVTC（进气连续）与 e-VTC（排气电磁） | 由 V21、V22、V23、V24、V27 各自的官方名称归纳 | 各名称的原文出处见对应条 | 四家官方材料 | 2026-10-20 已核（归纳依据可复查） |
| V32 | Toyota 名称中的后缀 VVT-iE 本轮未取得官方出处 | 无 | 无 | — | **待核实**：本轮未取到 Adobe 之外的 Toyota 官方页面对 VVT-iE 这一后缀的定义；片中不写该后缀，只写 VVT-i |

### ch5 与增压、直喷和排放控制的协同

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| V33 | 与涡轮增压：气门正时在充量上做文章，增压则直接提高进气压力；Ford 把两者与直喷、正时一起打包成 EcoBoost | Ford 官方新闻稿 2013-04-11（`out_60_ford.txt`） | Toyota 官方 1995 稿的进气惯性效应（V08）说明高负荷下正时与充气是同一件事的两面（`out_56_toyota_date.txt`） | Ford 2013 稿、Toyota 1995 稿 | 2026-10-20 已核 |
| V34 | 与缸内直喷：直喷与可变气门正时同属一套节油措施 | Ford 官方新闻稿 2013-04-11：“turbocharging, direct fuel injection and variable valve timing”（`out_60_ford.txt`） | Ford 2017-06-21 稿同列三技术（`out_60_ford.txt`） | Ford 两稿 | 2026-10-20 已核 |
| V35 | 与排放控制：Toyota 的部分负荷策略以降低燃烧温度与减少未燃气体为目标；Nissan 以 SU-LEV 为目标；Honda 的 2 升 i-VTEC 同时用可变长度进气歧管、后置排气与稀燃 NOx 吸附催化器 | Toyota 1995 稿（V06）；Nissan 2006 稿（V15）；Honda 官方新闻稿 2000-10-26：“also features a variable-length intake manifold, a rear exhaust system, and a new lean-burn NOx-adsorbing catalyzer”（`out_52_toyota_honda.txt`） | 三家官方材料彼此独立 | Toyota 1995、Nissan 2006、Honda 2000 稿 | 2026-10-20 已核 |
| V36 | Honda 2 升 DOHC i-VTEC 的官方整机数据：最大功率 113 kW（154 PS）@ 6500 rpm，燃油消耗 14.2 km/liter | Honda 官方新闻稿 2000-10-26（`out_52_toyota_honda.txt`） | 无第二路 | Honda 2000 稿 | 2026-10-20 一手已核；第二路待补 |

### close

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| V37 | 小结：可变气门正时的价值不在「让车更快」，而在把「什么时候进气」交给工况决定——同一套零件在不同转速与负荷下服务不同目标 | 由 V06、V07、V08、V09、V10、V17 归纳；各条均有厂商官方原文 | 归纳依据可复查；片中表述为机制总结，不引用不存在的厂商结论 | Toyota 1995 稿、Honda 官方两篇 | 2026-10-20 已核 |
| V38 | 本片四项「待核实」：VVT-iE 后缀（V32）、Ford 变速气门升程（V26）、Toyota 的 +6%/+10% 试验值的第二路（V13）、Nissan CVTC 命名的第二路（V23） | 见各条 | — | — | **待核实**，不进定稿 |

## 文案审查

<!-- 文案稿经指定校对者 WaterRun 人工审查并明确确认后才配音（见 docs/script-review.md）。逐轮记录交审日期、内容 SHA-256、校对记录的链接与结论；逐句意见在 review/NOTES.md 留存，避免维护两份全文。确认之后的实质改动另起一轮。 -->

| 轮次 | 交审日期 | 稿本 | 审查意见与修改 | 结论与日期 |
|---|---|---|---|---|

## 制作署名

策划：WaterRun（依据：project.json 的 production.planner，交付前核对实际参与）。

开源视频：[本片源码](https://github.com/Water-Run/ft)（依据：project.json 的 production.repository；交付前核对公开仓库页面并记录日期与结果）。

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| MiniMax M3.1 Flash（本次会话运行时标识 minimax-M3.1-Flash） | 取证、事实表与开工反馈应用（子任务执行）；片单重构、目录搭建与反馈记录校验（主会话） | 本次会话运行时标识与分工记录 |
| — | 配音、渲染尚未开工 | — |

<!-- 按实际制作记录填写，涵盖准备、制作、审查等环节；名称与可确认的版本不得推测。服务未披露模型时写明服务、用途与「模型未披露」。片尾、README 与委托片 DELIVERY.md 使用同一名单。 -->

## 复核

<!-- 记录核查范围、日期、依据、发现的问题、更正与复查结论；覆盖三项核心审查、原创与动画完成度、片尾名单。未做的写「未做」，待核查的不得写成通过。 -->
