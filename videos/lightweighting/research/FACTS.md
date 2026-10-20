# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/guides/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

## 概要

取证日期：2026-10-20。对象：汽车轻量化——重量到底影响什么、怎么做到、代价是什么、电动化带来的新问题。

本片的事实分三类，写法与核查方式不同：

1. **物理链条**：由公式推出。公式与输入全部写在表内，片中每个数字都能按表复算；这类条目标「本片计算（公式与输入见表）」。
2. **工程史与材料**：车企官方技术资料与官方新闻稿（一手来源）。
3. **安全、成本与电动化**：美国 EPA / NHTSA / CARB 委托的研究及其同行评审，以及 ICCT 对这些研究的汇总（公开标准级来源）。

**本片不做的事**：不引用任何聚合站、百科或媒体转述作片中依据；不引用「某车减重 X% 就省油 Y%」这类厂商宣传口径而不写清条件。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| Audi Technology Portal「Aluminium bodies / Audi Space Frame」 | 页面版权标注 2026 AUDI AG，无版本号 | Web Fetch，读取日 2026-10-20 |
| Volkswagen Newsroom「XL1」与「The XL1」 | XL1 页面标注 02/21/13 | Web Fetch，读取日 2026-10-20 |
| Ford「The Model T」 | 页面标注 Ford HQ 17.12.21 | Web Fetch，读取日 2026-10-20 |
| Royal Society of Chemistry Periodic Table（Al / Mg / Fe） | 元素页，无版本号；密度为 20 °C 下数值 | Web Fetch，读取日 2026-10-20 |
| ICCT《Summary briefing on four major new mass reduction assessment for light duty vehicles》 | 汇总 2010–2012 年 EPA / NHTSA / CARB / WorldAutoSteel 四项研究 | 2026-10-20 下载 PDF（206,538 字节），本地副本在 `research/_src/icct-mass-reduction-summary.pdf`（该目录不入库） |
| EPA《Highlights of the Automotive Trends Report》（2025 年版） | 页面 `DC.date.modified` 2026-02-19 | Web Fetch，读取日 2026-10-20 |
| EPA-420-R-12-028《Peer Review of Demonstrating the Safety and Crashworthiness of a 2020 Model-Year, Mass-Reduced Crossover Vehicle (Lotus Phase 2 Report)》 | 2012 年 9 月 | 2026-10-20 下载 PDF（3,206,046 字节），本地副本在 `research/_src/carb-lotus-project-peer-review.pdf`（该目录不入库） |
| 抓取与计算环境 | Windows；Node v24.21.0（`fetch`） | 页面正文剥标签后按字符窗口读取；PDF 用 `read` 工具分页读取 |
| 检索方式 | DuckDuckGo HTML / Lite 端点仅用于定位候选页 | 定位到官方域后一律改读官方原文；聚合站不取证 |
| 本片时长 | 拟定 390 秒（6 分 30 秒），独立片 | `project.json` 目前**没有** `check.duration`，须在第 2 步按定稿时长补上 |

## 逐章

### 0 现象：轻到底换来了什么（正文 0:00–0:35）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 现象 a1 | 「轻让你在哪里都快」这句承诺要分两层兑现：重量换来的不是「刹车更短」，而是「同样的力气能推得更快、爬得更省力、每公里更省能量」 | 本片归纳；依据见第 1 章 b1–b8 的公式关系 | 各条公式的推导见下章；片中不引用第三方结论 | — | 2026-10-20 已核；这是本片的表述框架，不是引文 |
| 现象 a2 | 轻量化本身是行业长期在做的事，不是什么新鲜想法 | ICCT 汇总开篇：2010–2012 年美国制定 2017–2025 车型年度标准时，「which advanced vehicle technologies would be most critical to cost-effectively increase vehicle efficiency」；减重是其中被评估的关键技术之一（ICCT PDF 第 1 页） | ICCT 汇总所引四项研究均为 EPA / NHTSA / CARB / WorldAutoSteel 委托的官方研究（ICCT PDF 第 2 页表 2） | 截至 2012 年的研究，截至 2026-10-20 仍可核 | 2026-10-20 已核 |
| 现象 a3 | 减重的收益量级：在把动力总成同步缩小以保持相同加速性能的前提下，减重 10% 大致换来 5–7% 的油耗下降 | ICCT PDF 第 1 页：「Generally a 10% mass reduction results in a 5-7% fuel consumption reduction (depending on the drive cycle), if a powertrain is downsized for constant acceleration performance.」 | 无第二路独立来源；同一 PDF 第 1 页表 1 也把「整车重新设计」列为 5–10% 的油耗改善区间 | 条件必须一并说出（同步缩小动力总成、按行驶工况而定） | 2026-10-20 已核；**不得删掉前提条件** |
| 现象 a4 | 只换材料（一处铝替钢）带来的油耗改善是 1–5%，整车重新设计才是 5–10% | ICCT PDF 第 1 页表 1 与正文：「mass reduction is shown to bring forth smaller improvements of 1-5% fuel consumption reduction from material substitution (e.g., piece substitution of aluminum for steel) and larger 5-10% improvement from full vehicle redesign of the entire vehicle.」 | 同上 | 同上 | 2026-10-20 已核 |

### 1 物理链条：重量到底影响什么（正文 0:35–2:15）

本节全部为公式与按公式的计算。片中每个数字都可用表内公式与输入复算。

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 链条 b1 | 爬坡要克服的力：牵引力 F = m·g·(dh/ds) ÷ η。其中 dh/ds 是每前进 1 米上升的高度（坡度），η 是传动效率 | 本片计算：重力沿坡分量 m·g·(dh/ds) 除以传动效率 | 无需外部来源；牛顿第二定律与功的定义 | 示例输入：m = 1,500 kg，g = 9.81 m/s²，dh/ds = 0.10（10% 坡），η = 0.25 | 2026-10-20 已核；F = 1,500×9.81×0.10÷0.25 = 5,886 N |
| 链条 b2 | 爬坡要花的功率：P = F·v = m·g·(dh/ds)·v ÷ η，与质量成正比 | 本片计算（b1 乘以速度） | 同上 | 同上输入，v = 20 m/s（72 km/h） | 2026-10-20 已核；1500 kg 时 P ≈ 118 kW；车重降到 1,350 kg（减 10%）时 F ≈ 5,297 N、P ≈ 106 kW，少用约 12 kW |
| 链条 b3 | 加速：同样的牵引力下 a = F ÷ m，质量越小加速度越大；若功率固定，则 a = P ÷ (m·v)，同样正比于 1/m | 本片计算 | 无需外部来源 | 输入：P = 100 kW，v = 20 m/s → F = 5,000 N；1,500 kg → a ≈ 3.33 m/s²，1,350 kg → a ≈ 3.70 m/s² | 2026-10-20 已核 |
| 链条 b4 | **减重买不到更短的刹车距离**：制动距离 d = v² ÷ (2μg)，其中 μ 是轮胎与路面的摩擦系数——公式里没有质量 | 本片计算：匀减速运动 d = v²/(2a)，a = μg | 无需外部来源 | 关系上与质量无关；片中用比例讲（湿滑路面 μ 减半 → 制动距离加倍），不用未经取证的绝对 μ 数值 | 2026-10-20 已核；**这是本片必须讲清的边界**，防止「一轻遮百丑」被听成「刹车更短」 |
| 链条 b5 | 减重买到的是更少的制动能量：动能在速度不变时 E = ½mv²，与质量成正比 | 本片计算 | 无需外部来源 | 输入：m = 1,500 kg，v = 100 km/h = 27.78 m/s → E ≈ 579 kJ；1,350 kg → ≈ 521 kJ | 2026-10-20 已核；该值用作第 3 章碰撞吸能的入口 |
| 链条 b6 | 滚动阻力 F = Crr·N = Crr·m·g，与质量成正比；所以每公里的滚动损耗随质量等比下降 | 本片计算 | 无需外部来源 | 比例关系，不引用未经取证的 Crr 数值 | 2026-10-20 已核 |
| 链条 b7 | 风阻 F = ½·ρ·Cd·A·v²，与质量无关；所以风阻不是减重能解决的问题，要靠风阻系数和迎风面积 | 本片计算 | 无需外部来源 | 同上 | 2026-10-20 已核；片中把它和第 3 章的 Cw 0.189 连起来 |
| 链条 b8 | 小结：减重改变的是「重量直接乘上去的那几项」——爬坡力、加速能力、滚动阻力、动能；不改变的是「由路面摩擦和空气决定的那几项」——制动距离、风阻 | 本片归纳，依据 b1–b7 | 同上 | — | 2026-10-20 已核；本片的主结论句 |
| 链条 b9 | 轮胎能给出的力有上限：F = μN，N 是轮胎上的法向载荷，四轮均分时每轮 N = mg/4，因此总牵引力上限 ∝ 质量 | 本片计算 | 无需外部来源 | 只讲比例关系，不引用 μ 数值 | 2026-10-20 已核；与 b4 一起说明「为什么减重也不等于刹车更短」 |
| 链条 b10 | 官方数据支持「减重通常伴随油耗改善，但不是自动的」：2024 车型年度新车平均油耗 27.2 mpg，创纪录；EPA 明确写出「increasing vehicle weight, power, or size, is likely to result in lower fuel economy」 | EPA《Highlights》第 4 节与第 1 节（2026-02-19 版） | 同页第 4 节的时间序列图与第 1、2 节的车型结构数据互相印证 | 美国轻型车市场，2024 车型年度 | 2026-10-20 已核 |

### 2 怎么做：材料与结构（正文 2:15–3:40）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 材料 c1 | 密度阶梯：铁 7.87 g/cm³、铝 2.70 g/cm³、镁 1.74 g/cm³ | RSC Periodic Table 元素页 Fact box（Aluminium 2.70、Magnesium 1.74、Iron 7.87），读取日 2026-10-20 | Audi Technology Portal 独立给出铝 2.7 g/cm³，并说「roughly two-thirds lighter than conventional grades of steel」——与 RSC 的铁 7.87 / 铝 2.70 一致 | 20 °C，元素页数值 | 2026-10-20 已核；两路独立来源互证 |
| 材料 c2 | 铝约比钢轻三分之二，镁又比铝轻约三分之一，复合材料更进一步 | Audi Technology Portal「Aluminium as a material」段：「With its low density of 2.7 grams per cubic centimeter (0.098 lb per cu in), it is roughly two-thirds lighter than conventional grades of steel」；RSC 镁 1.74 vs 铝 2.70 | 同上 | 同上 | 2026-10-20 已核 |
| 材料 c3 | 碳纤维复合材料可以做得比钢蒙皮轻得多：XL1 的碳纤维外蒙皮密度只相当于同类钢蒙皮的约 20%，壁厚只有 1.2 mm，强度与刚度不低于同类钢或铝件 | Volkswagen Newsroom《The XL1》：「The density of this material or its specific gravity is only around 20 per cent that of a comparable steel exterior skin. The CFRP parts exhibit a level of stiffness and strength that is by no means inferior to that of comparable steel or aluminium parts, yet the exterior skin of the XL1 is just 1.2 mm thick.」 | 无第二路独立来源（VW 自述）；比例关系可与 c1 的密度阶梯互相参照 | 2013 年 VW 官方页面 | 2026-10-20 已核 |
| 历史 c4 | 钢的时代：Model T 1908 年问世，是福特第一款大量使用「钒钢」这种轻而强的合金的量产车；福特官方对它的定位是「affordable, simple to operate, and durable」，在 Highland Park 厂的移动装配线上生产，售价 260–850 美元，第一位车主提车日是 1908 年 10 月 1 日；累计造了 1,500 多万辆 | Ford《The Model T》（2021-12-17）全文：「the first to make such extensive use of the lightweight but strong alloy known as vanadium steel」；「between $260 and $850」；「shipped to its first customer on October 1, 1908」；「More than 15,000,000 Model T's were built and sold.」 | 无第二路独立来源（福特官方自述） | 1908–1927，官方页面 2021 年发布 | 2026-10-20 已核；**Model T 的整备质量与车身材料未在福特官方页面查到，见「待核实」** |
| 历史 c5 | 铝的时代：奥迪 1994 年推出第一代 A8 时，奥迪不只是量产了 ASF（Audi Space Frame，奥迪空间框架）结构，也把整套生产工艺做出来了；这一研发过程持续了 12 年 | Audi Technology Portal「Audi Space Frame」段：「When it introduced the first A8 in 1994, Audi had not only developed the radically new ASF design and put it into series production, it had also developed all of the steps required for its production. The launch was preceded by a development process lasting 12 years.」 | 无第二路独立来源（奥迪官方自述） | 1994 年起 | 2026-10-20 已核 |
| 历史 c6 | ASF 的路线一直延伸到 A2：A2 及其「3 升版」A2 1.2 TDI 都在这条线上；到 2010 年底，奥迪累计造了约 55 万辆 ASF 车身，比任何其他厂商都多 | Audi Technology Portal 同段：「The arc spans three generations of the A8 and also includes the A2 along with its legendary three-liter version, the A2 1.2 TDI. By the end of 2010 alone, the company had produced some 550,000 vehicles with the ASF body – far more than any other manufacturer in the world.」 | 无第二路独立来源（奥迪官方自述） | 截至 2010 年底 | 2026-10-20 已核；**A2 的整备质量未在奥迪官方页面查到，见「待核实」** |
| 历史 c7 | ASF 车身由三类铝半成品组成：挤压型材、压铸件、铝板；原则是「把合适的材料放在合适的位置」 | Audi Technology Portal「Semi-finished components」段：「The ASF body comprises three semi-finished components: extruded sections, diecast components and aluminum panels… 'The right material in the right place for optimal function.'」 | 无第二路独立来源（奥迪官方自述） | — | 2026-10-20 已核；这是「工艺门槛」的证据 |
| 历史 c8 | 复合材料时代：大众 XL1 的单体壳、全部外覆盖件乃至防倾杆都用碳纤维增强塑料（CFRP）制造，工艺为 RTM（树脂传递模塑）；XL1 整备质量 795 kg，阻力系数 Cw 0.189，重心离地 1,153 mm | Volkswagen Newsroom《The XL1》与《XL1》两页：「The monocoque… all exterior body parts as well as functional elements such as the anti-roll bars are all made of CFRP. The preferred process for producing CFRP components at Volkswagen is the RTM process」；「light weight (795 kg), perfect aerodynamics (Cw 0.189) and low centre of gravity (1,153 mm above ground)」 | 无第二路独立来源（VW 官方自述） | 2013 年官方页面 | 2026-10-20 已核；**795 kg 是官方值，不是常见的 780 kg 说法** |
| 历史 c9 | XL1 的重量构成：整备 795 kg 中，动力总成（含电池）227 kg、行驶系 153 kg | Volkswagen Newsroom《The XL1》：「The Volkswagen weighs just 795 kg. Of this figure, 227 kg represents the entire drive unit including the battery, 153 kg the running gear, 80…」 | 同上 | 同上 | 2026-10-20 已核；这是第 4 章电动化段落的入口 |
| 历史 c10 | 轻量化与空气动力学是一对：XL1 同时把 Cw 做到 0.189，说明减重不能只做材料，还要动形状 | 由 c7、c8 与链条 b7 归纳 | — | — | 2026-10-20 已核；归纳句 |

### 3 代价：轻量化要付出什么（正文 3:40–5:05）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 代价 d1 | 第一笔代价是安全：减重不同于换发动机，它需要整车重新设计，因此新车型必须按安全法规逐项做碰撞验证 | ICCT PDF 第 2 页：「More than the other major technologies, mass reduction involves a full redesign of the vehicles… Because the whole-vehicle redesign is necessary, the new vehicle model must be tested for its crashworthiness in terms of safety.」；第 3 页列出需满足的 FMVSS 项目（208 正面碰撞、210 安全带载荷、213 儿童锚点、214 侧撞与门梁侵入、216 顶压、301 后撞）与 IIHS 侧撞要求 | EPA-420-R-12-028 同行评审记录证实这条流程真实存在：EPA 委托 SRA International 对 Lotus 的减重车型报告做同行评审，评审人来自美国能源部、橡树岭国家实验室、俄亥俄州立大学与 Kaiser Aluminum（PDF 第 4–6 页） | 2010–2012 年的评估 | 2026-10-20 已核 |
| 代价 d2 | 减重之后必须重新做碰撞验证：Lotus 那个减重 32% 的车型做了正面、侧撞、顶压等全套验证，结论是满足当时的安全法规要求 | ICCT PDF 第 3 页与图 1 说明（Lotus Engineering, 2012；减重 32% 的设计在 35 mph 正面撞固定壁后仍满足要求） | EPA-420-R-12-028（EPA 委托 SRA 做的同行评审，见 PDF 第 4–5 页）独立印证这批验证确实经过第三方同行评审 | 2011–2012 | 2026-10-20 已核 |
| 代价 d3 | 第二笔代价是钱。四项官方委托研究的结论是：减重本身并不贵，贵的是「把整辆车重做一遍」 | ICCT PDF 第 4 页：「The highest cost finding was for $319 in incremental cost per vehicle for NHTSA's 22% mass reduction. The other three studies suggested that mass-reduction would occur with a net cost saving once the entire vehicle was considered holistically.」 | 表 2 所列四项研究分属 EPA、NHTSA、CARB、WorldAutoSteel 四家委托方，互相独立 | 2011–2012 | 2026-10-20 已核；**表中的美元是 2011–2012 年的研究口径，片中须带年代** |
| 代价 d4 | 四项研究的量化结果：FEV（EPA 委托，2010 款丰田 Venza 基准）减重 18%，每车净省 148 美元；EDAG（NHTSA 委托，2011 款本田雅阁基准）减重 22%，每车增加 319 美元；Lotus（CARB 委托，2009 款丰田 Venza 基准）减重 32%，每车最多省 419 美元；EDAG 2011（WorldAutoSteel 委托，小型车，基准约 2011 款大众 Polo，**专门针对电动车设计做减重**）减重 15%，每车净成本不变 | ICCT PDF 第 2 页表 2 | 表 2 的四项研究分属四家不同委托方，各自独立 | 2011–2012 | 2026-10-20 已核 |
| 代价 d5 | 这些研究本身就很贵：每项用 5–10 名工程师全职做一年多，耗资约 100 万–200 万美元；报告动辄数百页 | ICCT PDF 第 2 页：「Each study was a major undertaking – utilizing 5-10 engineering staff, working full-time for over a year, and costing approximately $1-2 million.」；同段：「Each of these engineering reports is hundreds of pages long」 | 同上 | 2010–2012 | 2026-10-20 已核 |
| 代价 d6 | 而且这些成本优势有前提：只有在年产至少 10 万辆的规模上摊得开 | ICCT PDF 第 4 页：「These major cost reductions are only possible if the technologies are scaled up to high economies of scale of at least 100,000 vehicles per year.」 | 同上 | 同上 | 2026-10-20 已核；**条件不得删** |
| 代价 d7 | 第三笔代价是工艺：铝车身要挤压型材、压铸件、铝板三类半成品和专门的生产工序；碳纤维要 RTM 这类新工艺 | Audi Technology Portal「Semi-finished components」段（c7）；Volkswagen Newsroom《The XL1》RTM 段（c8） | 两家车企官方资料互相独立 | — | 2026-10-20 已核 |
| 代价 d8 | 减重还会带来别的子系统一起变小：FEV 那个 18% 减重方案里，制动系统减重 38%、悬架减重 28%、发动机减重 18%——不是只把车身换轻 | ICCT PDF 第 4 页表 3（EPA 2012）：Engine 172.6 kg → −30.3 kg；Suspension 241.5 kg → −66.8 kg；Brake 86.7 kg → −32.8 kg；Body-in-white 528.9 kg → −68.3 kg；合计 1,711.4 kg → −312.5 kg（−18%），增量技术成本 148.1 美元 | 表 3 标注来源为 US EPA, 2012；与表 2 的 FEV 条目一致 | 2012 | 2026-10-20 已核 |
| 代价 d9 | 铝本身耐腐蚀；铝与镁跟钢混用时的电偶腐蚀问题需要专门处理——这一条本次未取到一手来源 | RSC 铝页「Uses and properties」：「it has low density, is non-toxic, has a high thermal conductivity, has excellent corrosion resistance」 | 混用金属的电偶腐蚀**未取到一手来源** | — | 2026-10-20：铝的耐腐蚀性已核；电偶腐蚀一节列入「待核实」，不进定稿 |

### 4 新问题：电动化带来的重量悖论（正文 5:05–6:10）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 电动 e1 | 电池把轻量化的账重新算了一遍：电动车上，重量不只是结构件，还有电池 | VW Newsroom《The XL1》：795 kg 整备质量中，动力总成（含电池）227 kg（见 c9） | 同上 | 2013 年官方页面 | 2026-10-20 已核 |
| 电动 e2 | 美国 EPA 的官方统计：纯电动车（BEV）平均比同级车更高效、功率更大，也**更重** | EPA《Highlights》第 4 节（2026-02-19 版）：「BEVs are on average more efficient, powerful, and heavier than comparable vehicles.」 | 同页第 1 节把 BEV/PHEV 的存在对整体趋势的影响单独量化，两处互证 | 美国轻型车市场，2024 车型年度 | 2026-10-20 已核 |
| 电动 e3 | 量化一下：2024 车型年度如果不计 BEV 与 PHEV，新车平均重量要低 72 磅；当年 BEV 份额从 10% 降到 7%，新车平均重量、功率与尺寸都小幅下降（不到 5%） | EPA《Highlights》第 4 节：「Without BEVs and PHEVS, the average model year 2024 new vehicle fuel economy was lower by 1.7 mpg, power was lower by 13 hp, weight was lower by 72 pounds, and footprint was slightly lower by 0.1 square feet.」及同段「BEVs fell from 10% to 7% of all new vehicles」 | 同页第 1 节「Without BEVs and PHEVs, the average new vehicle real-world fuel economy in 2024 was 1.7 mpg lower」与同段并列，两处独立措辞一致 | 2024 车型年度，2026-02-19 版 | 2026-10-20 已核 |
| 电动 e4 | 重量与油耗确实相关，但不是唯一变量：EPA 记录了 1975 年以来重量、马力、油耗、尺寸三个阶段的关系——1975 至 1980 年代初油耗快速上升而重量与马力下降；此后二十多年重量与马力稳步上升、油耗下降；2004 年以后三者一起上升 | EPA《Highlights》第 4 节：「Between 1975 and the early 1980s, average new vehicle fuel economy increased rapidly, while vehicle weight and horsepower fell. For the next twenty years, average new vehicle weight and horsepower steadily increased, while fuel economy steadily decreased. Since 2004, fuel economy, horsepower, and weight have all generally increased together.」 | 同页图 ES-4 与该段文字互证 | 1975–2024 | 2026-10-20 已核；这段是「一轻遮百丑」最好的反面对照 |
| 电动 e5 | 电动化一开始就把减重变成了专门课题：四项官方减重研究里，EDAG 2011 那项（WorldAutoSteel 委托）专门针对电动车设计做减重，基准车是约 2011 款大众 Polo 一类的小型车，结论是减重 15% 且每车净成本不变 | ICCT PDF 第 2 页表 2：「EDAG, 2011・Small car (Approx. 2011 Volkswagen Polo)・Focuses in particular on mass reduction for electric vehicle design・Up to 15% mass reduction with no net vehicle cost increase・For WorldAutoSteel」 | 同行研究分属四家委托方 | 2011 | 2026-10-20 已核；这是「电池带来的重量悖论」在官方研究里的对应 |
| 电动 e6 | 悖论的形状：电动车为了续航要带更大的电池，电池带来重量，重量又要靠减车身来抵，于是减重变成一场跟电池的拉锯 | 本片归纳，依据 e1、e2、e3、e5 与第 1 章的公式关系 | 依据同上 | — | 2026-10-20 已核；归纳句，不引入新数字 |

### 5 结论（正文 6:10–6:22）与片尾

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 结论 f1 | 结论句：轻量化不是把车做小，而是把「重量」从该花的地方挪走——同样的功率换更快、同样的电池换更远；代价是整车重做、碰撞重验和工艺升级 | 本片归纳，依据 b8、d1、d3、e6 | 依据同上 | — | 2026-10-20 已核 |
| 结论 f2 | 片尾名单只在画面展示，不配旁白；「策划：WaterRun」「参与模型」「开源视频 https://github.com/Water-Run/ft」 | 仓库 `docs/standards.md` 第 7 节与 `docs/log/feedback.md` F14 | — | 片尾时长待成片后复核 | 2026-10-20 记入；**尚未成片，待复核** |

## 文案审查

<!-- 文案稿经指定校对者 WaterRun 人工审查并明确确认后才配音（见 docs/guides/script-review.md）。逐轮记录交审日期、内容 SHA-256、校对记录的链接与结论；逐句意见在 review/NOTES.md 留存，避免维护两份全文。确认之后的实质改动另起一轮。 -->

| 轮次 | 交审日期 | 稿本 | 审查意见与修改 | 结论与日期 |
|---|---|---|---|---|
| | | | | |

尚未交审：`src/js/script.js` 仍是模板骨架，文案须先经 WaterRun 人工审查并明确确认才进入配音。

## 制作署名

策划：WaterRun（依据：project.json 的 production.planner，交付前核对实际参与）。

开源视频：[本片源码](https://github.com/Water-Run/ft)（依据：project.json 的 production.repository；交付前核对公开仓库页面并记录日期与结果）。

<!-- 按实际制作记录填写，涵盖准备、制作、审查等环节；名称与可确认的版本不得推测。服务未披露模型时写明服务、用途与「模型未披露」。片尾、README 与委托片 DELIVERY.md 使用同一名单。 -->

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| MiniMax M3.1 Flash（本次会话运行时标识 minimax-M3.1-Flash） | 取证、事实表与开工反馈应用（子任务执行） | 本次制作会话的运行时标识；版本按标识照写，不推测 |
| MiniMax M3.1 Flash（本次会话运行时标识 minimax-M3.1-Flash） | 片单重构、目录搭建与反馈记录校验（主会话） | 本次制作会话的运行时标识；版本按标识照写，不推测 |

其余环节（配音、渲染、封面）尚未开工，片尾名单待成片前核准。

## 复核

<!-- 记录核查范围、日期、依据、发现的问题、更正与复查结论；覆盖三项核心审查、原创与动画完成度、片尾名单。未做的写「未做」，待核查的不得写成通过。 -->

未做：成片尚未产出，本节留待第 8 步按 `docs/guides/acceptance.md` 第 5 节填写。

## 待核实（不进入定稿）

| 事项 | 状态 | 说明 |
|---|---|---|
| Model T 的整备质量与车身材料 | 待核实 | 福特官方页面只讲钒钢用于发动机与车身系统，没有给出整备质量数字；片中不写具体质量，也不写「全钢车身」一类未经官方来源确认的说法 |
| Audi A2 的整备质量 | 待核实 | 奥迪官方技术门户确认 A2 属于 ASF 路线，但该页未给 A2 的整备质量；片中只讲结构路线与产量，不写质量数字 |
| NHTSA DOT-HS-811-666 原文 | 未直接读到 | 本轮访问 nhtsa.gov 与 downloads.regulations.gov 均返回 403；该报告的内容目前经 ICCT 汇总转述（d3、d4）。若片中要直接引用该报告的原始表述，须先取到原文 |
| 铝／镁与钢混用时的电偶腐蚀 | 待核实 | 本轮未取到一手来源；只保留 RSC 可核的「铝耐腐蚀性」，混用金属的防护要求不进定稿 |
| 轮胎摩擦系数 μ 的具体数值 | 不引用 | 制动距离一律按公式与比例关系讲（湿滑 μ 减半 → 距离加倍），不出现未经取证的绝对 μ 数值 |
| 各国乘用车平均车重的横向比较 | 不做 | 只用 EPA 的美国官方数据，不与欧洲、中国的数据混用口径 |
