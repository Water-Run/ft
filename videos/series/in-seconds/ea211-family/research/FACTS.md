# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

## 取证范围与限制

- 取证日期：2026-10-20。对象：大众集团 EA211 汽油发动机家族——它是什么、由哪些成员构成、怎么随年代派生、关键技术如何演进、边界在哪里。
- 一手来源：大众集团官方新闻稿与官方车型／工厂资料页，全部收录在 `research/lab/sources.txt`（S1–S15），抓取回显在 `research/lab/out_12_sources.txt`，逐条引文核对结果在 `research/lab/out_14_claims_check.txt`。
- 媒体与维基类站点本轮只用于定位线索（例如查 SSP 编号、查官方页面的 slug），其内容没有进入本表的任何一行。
- 来源发现的实际路径：大众官方资料站的站内检索（`volkswagen-newsroom.com/en/search?query=EA211`／`MLB`／`EA888`，结果在页面里服务端渲染）与该站 `sitemap.xml`（约 14 MB，取到本机临时目录后按 slug 筛选，临时文件不入库）；通用网页检索端点本轮被限流，`research/lab/11_search.ps1` 已把「被限流」如实写进回显，没有把空结果当成「没有这条资料」。
- 本机没有 bash，取证脚本用 PowerShell 写：抓取、正文抽取、引文核对分别是 `research/lab/12_fetch_sources.ps1`、`13_evidence.ps1`、`14_claims_check.ps1`，回显与脚本同名对应。
- 脱敏：抓取脚本只访问公开的厂商网页，不读取也不输出主机名、用户名、本机路径或任何凭据；回显里只有网页正文文字。
- 官方培训资料 SSP（Self-Study Program）本轮没有拿到可复查的一手副本：SSP 511、SSP 733 的公开镜像站本轮不可用（连接超时或返回占位文件），因此缸径冲程等只在 SSP 里给出的数据标为待核实，不进入片中。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| PowerShell（取证脚本） | 7.6.7 | `$PSVersionTable.PSVersion`，本片制作机 |
| 操作系统 | Microsoft Windows NT 10.0.26340 | `[System.Environment]::OSVersion.VersionString`，同上 |
| 抓取与抽取脚本 | `research/lab/12_fetch_sources.ps1`、`13_evidence.ps1` | 2026-10-20 在制作机运行；重做：先跑 12，再跑 13／14 |
| 引文核对脚本 | `research/lab/14_claims_check.ps1` | 2026-10-20 运行；35 条声明全部 PASS（见 `out_14_claims_check.txt`） |
| S1 大众官方新闻稿 | 2012-10-02《The new Golf. – Powertrain structure: engines and gearboxes》 | `https://www.volkswagen-newsroom.com/en/the-new-golf-das-auto-international-driving-presentation-2797/the-new-golf-powertrain-structure-engines-and-gearboxes-2835` |
| S2 大众官方新闻稿 | 2013-06-24《The new Golf Estate – Engines and running gear》 | `https://www.volkswagen-newsroom.com/en/the-new-golf-estate-international-press-presentation-2977/the-new-golf-estate-engines-and-running-gear-2994` |
| S3 大众官方新闻稿 | 2020-12-08《The compact all-rounder: TSI evo engine with a capacity of 1.0 and 1.5 litres》 | `https://www.volkswagen-newsroom.com/en/press-releases/the-compact-all-rounder-tsi-evo-engine-with-a-capacity-of-10-and-15-litres-6695` |
| S4 大众官方新闻稿 | 2022-06-23《Modular toolkit strategy as recipe for success: the MQB celebrates tenth anniversary》 | `https://www.volkswagen-newsroom.com/en/press-releases/modular-toolkit-strategy-as-recipe-for-success-the-mqb-celebrates-tenth-anniversary-8030` |
| S5 大众官方新闻稿 | 2017-08-28《The new Polo – Highly efficient MPI, TSI, TGI, TDI and DSG engines》 | `https://www.volkswagen-newsroom.com/en/the-new-polo-driving-presentation-2574/highly-efficient-mpi-tsi-tgi-tdi-and-dsg-engines-2602` |
| S6 大众官方资料页 | 2018-10-25《The turbocharged engines》（T-Cross） | `https://www.volkswagen-newsroom.com/en/welcome-to-the-family-the-new-t-cross-4306/the-turbocharged-engines-4313` |
| S7 大众官方新闻稿 | 2025-08-27《The new T-Roc – Drive systems》 | `https://www.volkswagen-newsroom.com/en/the-new-t-roc-world-premiere-19761/drive-systems-19766` |
| S8 大众官方图片说明 | 2022-07-18《1.5 TSI evo2 – basic engine for many Volkswagen models》 | `https://www.volkswagen-newsroom.com/en/images/detail/1-5-tsi-evo2-basic-engine-for-many-volkswagen-models-at-present-only-for-t-roc-and-t-roc-cabriolet-39257` |
| S9 大众官方工厂资料页 | 《Volkswagen de México》，数据截至 2026-02 | `https://www.volkswagen-newsroom.com/en/volkswagen-de-mexico-4070` |
| S10 大众官方工厂资料页 | 《Volkswagen do Brasil》，数据截至 2026-02 | `https://www.volkswagen-newsroom.com/en/volkswagen-do-brasil-4072` |
| S11 大众官方资料页 | 2021-04-16《The engine》（Arteon R 与 Arteon R Shooting Brake） | `https://www.volkswagen-newsroom.com/en/arteon-r-and-arteon-r-shooting-brake-test-drive-7003/the-engine-7011` |
| S12 大众官方车型档案页 | 《Golf VI GTI (2009–2012)》 | `https://www.volkswagen-newsroom.com/en/golf-6-gti-20092012-19514` |
| S13 大众官方新闻稿（存档页） | 《20 years of the Phaeton…》（页面未标出发布日期） | `https://www.volkswagen-newsroom.com/en/press-releases/20-years-of-the-phaeton-for-the-first-time-volkswagen-shows-the-successor-that-was-never-built-8056` |
| S14 大众官方新闻稿 | 2024-05-16《Dynamic and with a long range: Golf GTE and Golf eHybrid now available to order》 | `https://www.volkswagen-newsroom.com/en/press-releases/dynamic-and-with-a-long-range-golf-gte-and-golf-ehybrid-now-available-to-order-18398` |
| S15 大众官方新闻稿 | 2019-10-23《Countdown to the new Golf: Golf Mk7 – lightweight construction and broad powertrain options》（背景材料，本片未引用其结论） | `https://www.volkswagen-newsroom.com/en/press-releases/countdown-to-the-new-golf-golf-mk7-lightweight-construction-and-broad-powertrain-options-5477` |
| S16 大众官方资料页 | 《Volkswagen Sachsen GmbH – Chemnitz plant》（页面数据截至 2025-12） | `https://www.volkswagen-newsroom.com/en/volkswagen-sachsen-gmbh-chemnitz-plant-6882` |

## 逐章

### 01 现象与家族

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 01-1 | EA211 是大众集团一个汽油发动机家族的代号，家族里既有三缸也有四缸 | S1 正文「Genealogy of a new engine lineup: Underlying the development code EA211 is a new family of petrol engines. It is made up of both three-cylinder and four-cylinder engines.」 | S5「All petrol engines with up to 150 PS and the new natural gas drive belong to the efficient EA211 engine family.」；S2 把 2013 年高尔夫旅行车的汽油机称作「TSI, EA211 series」 | S1 2012-10-02；S5 2017-08-28；S2 2013-06-24 | 2026-10-20 已读并核对（`out_14_claims_check.txt` PASS） |
| 01-2 | 这个家族随第七代高尔夫一起投产 | S3「The 1.5 TSI and 1.0 TSI originate from the EA 211 engine family, which launched in the Golf 7 in 2012.」 | S4「the TSI engines of the EA 211 series – which debuted alongside the MQB」，同页说 MQB「made its debut with the Golf VII」 | S3 2020-12-08；S4 2022-06-23 | 2026-10-20 已读并核对 |
| 01-3 | 家族最早在 up! 上以三缸 MPI 的形式投产 | S1「The engines of the EA211 series made their premiere at Volkswagen with the production launch of the up! as a three-cylinder MPI.」 | S5 的 EA211 家族清单含 1.0 MPI 三缸（48 kW/65 PS、55 kW/75 PS），可印证家族含三缸自吸机型；官方站内检索结果里 2012-07-02《International Driving Presentation of the new Polo BlueGT》摘要亦写「The engine range consists of 1.0, 1.2 and 1.4 litre engines. The efficient 1.0-litre three-cylinder engines (MPI engines without charging…) are used to drive such cars as the new up!.」（该摘要存于 `research/lab/out_11_search.txt`，其直达页面本轮未定位到，故只作交叉线索）；「最早在 up! 投产」为厂商自述 | S1 2012-10-02；S5 2017-08-28 | 2026-10-20 已读；「最早」为单一出处（厂商自述），不写进定稿 |
| 01-4 | EA211 是与横置平台同期出现的家族：MQB 就是横置矩阵，EA211 随 MQB 一起登场 | S4 标题与首段「the modular transverse matrix (MQB)」；「in the TSI engines of the EA 211 series – which debuted alongside the MQB」 | S1 写明 EA211 十六气门四缸机「in the framework of the Modular Transverse Matrix」 | S4 2022-06-23；S1 2012-10-02 | 2026-10-20 已读并核对 |
| 01-5 | 家族的机械结构是重新设计的，只有 82 mm 缸心距沿用上一代 EA111；机体为压铸铝，1.2 TSI 重 97 kg、1.4 TSI 重 104 kg | S1「Only the cylinder spacing was preserved… the cylinder spacing of 82 mm was adopted from… EA111」「Aluminium block reduces weight by up to 16 kg… 97 kg (1.2 TSI) and 104 kg (1.4 TSI)」 | S3 给出同代 1.0 三缸机 88 kg 与铝合金机体、喷涂 100 微米铁层的缸壁；S6 说 1.0 机「with a crankcase made from die-cast aluminium」 | S1 2012-10-02；S3 2020-12-08；S6 2018-10-25 | 2026-10-20 已读并核对 |

### 02 家族里有哪些成员

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 02-1 | 2012 年第七代高尔夫的 1.2 TSI（85 PS、105 PS）与 1.4 TSI（122 PS、140 PS）属 EA211 | S1「the TSI… sixteen-valve, four-cylinder engines of the EA211 series – at the power levels 63 kW / 85 PS and 77 kW / 105 PS (each 1.2 litre) as well as 90 kW / 122 PS and 103 kW / 140 PS (each 1.4 litre)」 | S2 同一套 1.2/1.4 TSI 动力（85/105/122/140 PS）被写作「TSI, EA211 series」 | S1 2012-10-02；S2 2013-06-24 | 2026-10-20 已读并核对 |
| 02-2 | 1.0 升三缸机属 EA211（70 kW/95 PS 与 85 kW/115 PS 两档） | S6「The two petrol engines with 1.0 litre capacity belong to the established EA211 Volkswagen engine family」 | S5 的 EA211 家族清单含 1.0 TSI 三缸（70/85 kW）与 1.0 MPI 三缸 | S6 2018-10-25；S5 2017-08-28 | 2026-10-20 已读并核对 |
| 02-3 | 1.5 升机型在官方口径里是 EA211 的当代产品：2020 年官方称「EA 211 TSI evo」，2022 年起图片说明写「1.5 TSI evo2」，2025 年写「1.5 TSI evo2 from the Volkswagen EA211 engine family」 | S3「Both power units have had the designation EA 211 TSI evo since the technology updates.」（小标题「From EA 211 to EA 211 evo」）；S8 图注「1.5 TSI evo2 – basic engine for many Volkswagen models (at present only for T-Roc and T-Roc Cabriolet)」；S7「The 1.5 TSI evo2 from the Volkswagen EA211 engine family」 | 三处为不同年份、不同栏目（一篇新闻稿、一条图片说明、一篇上市资料）的官方措辞，互相独立 | S3 2020-12-08；S8 2022-07-18；S7 2025-08-27 | 2026-10-20 已读并核对；「evo3」未见于任何一手资料，见「尚待核实」 |
| 02-4 | 巴西圣卡洛斯厂生产四款 EA211：1.0L MPI、1.6L MSI、1.0L TSI、1.4L TSI（2025 年 626,871 台） | S10「Engines: EA211: 1.0L MPI, 1.6L MSI, 1.0L TSI, 1.4L TSI」；同页「Production: 626,871 engines (2025)」 | S9 墨西哥西拉奥厂同厂并列生产 EA211 与 EA888 两族，并供给北美各厂 | S10 数据截至 2026-02；S9 数据截至 2026-02 | 2026-10-20 已读并核对 |
| 02-5 | 家族覆盖的市场不止欧洲：墨西哥西拉奥厂自 2013 年 1 月起生产 EA211，供北美各厂使用（2025 年 452,042 台） | S9「The engines plant in Silao started its operations in January 2013.」「This factory supplies the third generation of EA888 engines family and the EA211 engine to the Volkswagen Group plants in North America.」 | S10 巴西厂同列 EA211 各机型，两座工厂相互独立 | S9 数据截至 2026-02 | 2026-10-20 已读并核对 |
| 02-6 | 家族成员也按品牌铺开：MQB 平台上第一个量产的集团车型是第三代奥迪 A3，早于高尔夫 | S4「The first-ever MQB model in the Volkswagen Group was the third-generation Audi A3 – launched on the market a few months before the Golf.」 | S4 同页说 MQB「makes it possible to build… models of different brands, on the same production line」 | S4 2022-06-23 | 2026-10-20 已读；本片只用这句事实，不逐一点名斯柯达／西雅特车型，除非另有官方页面 |

### 03 关键技术

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 03-1 | 排气歧管整体集成进缸盖，冷启动热得快，高负荷时用冷却液冷却废气，官方称可降低最多 20% 油耗 | S1「Exhaust manifold integrated in cylinder head… At high loads… the exhaust gas is more effectively cooled by the coolant, which reduces fuel consumption by up to 20 per cent.」 | — | S1 2012-10-02 | 2026-10-20 已读；单一出处（厂商自述的效果值），片中只说「把废气热量交给冷却液与座舱」 |
| 03-2 | 进气凸轮轴在所有 EA211 上可调，范围 50 度曲轴角；1.4 TSI 140 PS 版本的排气凸轮轴也可调 | S1「the intake camshaft on all EA211 engines can be varied over a range of 50 degrees crankshaft angle – on the 1.4 TSI with 103 kW / 140 PS, the exhaust camshaft is variable as well」 | S11（EA888 家族）「features variable valve timing with double camshaft control」，说明双凸轮轴可调是厂家的正式措辞 | S1 2012-10-02；S11 2021-04-16 | 2026-10-20 已读；50 度为单一出处（厂商自述） |
| 03-3 | 主动缸数管理 ACT：低中负荷下关闭 2、3 缸，官方称覆盖 1400–4000 rpm、85 Nm 以下的工况，切换只需 13–36 毫秒 | S1「Temporarily deactivating the second and third cylinders can save over 0.5 litres of fuel per 100 km」「ACT is active over an engine speed range between 1,400 and 4,000 rpm and torques of up to 85 Nm… takes just 13 to 36 milliseconds」 | S3「Active Cylinder Management (ACT)… shuts down the second and third cylinders at low to medium loads and engine speeds」（EA211 TSI evo，2020 年官方稿） | S1 2012-10-02；S3 2020-12-08 | 2026-10-20 已读并核对 |
| 03-4 | 2025 年的 1.5 TSI evo2 把这一套升级成 ACTplus，并与可变截面涡轮、米勒循环一起出现 | S7「The 1.5 TSI evo2 from the Volkswagen EA211 engine family is a high-tech drive system with VTG turbocharger (variable turbine geometry), TSI evo combustion cycle and ACTplus Active Cylinder Management.」 | S3（2020）已把 ACT 列为 1.5 TSI 的标配技术，S7 在此基础上写明 ACTplus | S7 2025-08-27；S3 2020-12-08 | 2026-10-20 已读并核对 |
| 03-5 | 米勒循环的官方解释是「早关进气门 + 高压缩比」，在 TSI evo 燃烧过程里与 VTG 配合，整段工况按 λ=1 运行 | S7「the symbiosis of the Miller cycle (early closing of the intake valves with high compression) and VTG charging. The petrol-air mixture is run with lambda 1 efficiency throughout the entire operating range」 | S3「The four-cylinder with 96 kW (130 PS) and the three-cylinder variant use a combustion process based on the so-called Miller cycle.」 | S7 2025-08-27；S3 2020-12-08 | 2026-10-20 已读并核对 |
| 03-6 | 喷射压力：2012 年的 EA211 TSI 最高 200 bar；2020 年的 EA211 TSI evo 升到 350 bar，每次燃烧最多五次喷射 | S1「The maximum injection pressure of the new TSI versions… was increased to 200 bar」；S3「The common rail injection system in all TSI evo petrol engines operates at a maximum pressure of 350 bar and is capable of delivering up to five injections per combustion cycle.」 | S7「high-pressure injection with up to 350 bar pressure」，为 2025 年的独立复核 | S1 2012-10-02；S3 2020-12-08；S7 2025-08-27 | 2026-10-20 已读并核对 |
| 03-7 | EA211 家族的压缩比是 10.5:1 | S5「a compression ratio of 10.5:1 like all EA211 engines」 | — | S5 2017-08-28 | 2026-10-20 已读；单一出处，片中不写此数字 |
| 03-8 | EA211 机体用压铸铝并做减摩处理：2020 年官方稿说三缸机 88 kg，缸壁为 100 微米喷涂铁层 | S3「The aluminium crankcase makes TSI evo engines very lightweight – the three-cylinder variant weighs just 88 kilograms.」「the cylinder walls consist of a 100-micrometre thick iron coating that is applied by plasma spraying」 | S7「plasma-coated cylinder liners (lower internal friction)」 | S3 2020-12-08；S7 2025-08-27 | 2026-10-20 已读并核对 |
| 03-9 | EA211 的安装方式与上一代不同：缸盖转向防火墙，与柴油机一样后倾 12 度，因此排气走向、传动轴与变速箱安装点可以统一 | S1「By rotating the cylinder head, generation of EA211 engines is now tilted towards the firewall… they are now also inclined towards the rear at an identical inclination angle of 12 degrees. A positive result is that Volkswagen can now standardise the exhaust line, driveshafts and gearbox mounting position.」 | S4「in the TSI engines of the EA 211 series – which debuted alongside the MQB, the development engineers rotated the cylinder heads by 180 degrees compared with the previous EA 111 engine」；S4 另说 MQB「standardised» 安装位置 | S1 2012-10-02；S4 2022-06-23 | 2026-10-20 已读；12 度与 180 度是同一事实的两种官方表述，片中只说「安装角与安装点统一」，不并列两个数字 |

### 04 混动化与代际

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 04-1 | 48V 轻混已经进入 EA211：2025 年欧洲上市的新 T-Roc 全系标配 48V 轻混的 1.5 eTSI（85 kW/116 PS 与 110 kW/150 PS），配 7 速双离合 | S7「48V mild hybrid as standard – the T-Roc is equipped as standard with an efficient mild hybrid turbo petrol engine (eTSI) with 85 kW (116 PS) and 7-speed dual clutch gearbox」 | S3（2020）已写「Within the Golf family, both engines operate together with a 48-volt mild hybrid system.」 | S7 2025-08-27；S3 2020-12-08 | 2026-10-20 已读并核对 |
| 04-2 | 48V 系统的做法：48V 锂电池 + 皮带式启动发电机，兼作发电机、起动机与电机 | S7「a 48V belt-driven starter alternator」「The water-cooled belt-driven starter alternator has the role of alternator and starter. At the same time, it acts as a compact electric motor」 | S3（2020）已把 48V 轻混列为 EA211 TSI evo 的选项 | S7 2025-08-27；S3 2020-12-08 | 2026-10-20 已读并核对 |
| 04-3 | 48V 系统可临时额外输出 14 kW 与 56 Nm 扭矩，制动时回收能量，官方称滑行与工况转移可省约半升油 | S7「The 48V system provides an additional 14 kW of power and 56 Nm of torque on a temporary basis.」「savings of around half a litre per 100 km can be achieved due to coasting and load-point shifting」 | — | S7 2025-08-27 | 2026-10-20 已读；14 kW/56 Nm 为单一出处（2025 年官方数据） |
| 04-4 | 轻混还带来整车层面的变化：1.5 TSI evo2 可以被完全关闭以实现滑行 | S7「it is even possible for the 1.5 TSI evo2 to be switched off completely, thereby enabling the SUV to coast」 | S7 同页写皮带式发电机「restarts the TSI – which is switched off as much as possible while the vehicle is moving」 | S7 2025-08-27 | 2026-10-20 已读；同一来源内部两处互相印证 |
| 04-5 | 插电混动也在用同一台机器：2024 年款高尔夫 eHybrid 换成 1.5 TSI evo2（可变截面涡轮 + TSI evo 燃烧过程），配 19.7 kWh 电池 | S14「the changeover to a new 1.5-litre turbocharged petrol engine (1.5 TSI evo2) with variable turbocharger geometry (VTG) plus highly efficient TSI-evo combustion process and a new 19.7 kWh battery」 | S7 确认 1.5 TSI evo2 属 EA211 且带 VTG | S14 2024-05-16；S7 2025-08-27 | 2026-10-20 已读并核对 |
| 04-6 | 家族还有别的动力形式：2020 年官方稿说 1.0/1.5 TSI evo 从 up! 到 Passat 都有，可选天然气（TGI）或 48V 轻混 | S3「Two base engines for many models from the up! to Passat with three or four cylinders, 66 kW (90 PS) to 110 kW (150 PS), optionally available with natural gas or mild hybrid system」；「In Polo and Golf, the three and four-cylinder units are also designed for operation with natural gas as TGI engines.」 | S5 把 1.0 TGI 列入 EA211 家族清单 | S3 2020-12-08；S5 2017-08-28 | 2026-10-20 已读并核对；天然气线本片不讲，见「尚待核实」 |

### 05 边界与小结

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 05-1 | 柴油机不在 EA211 里：大众把 1.6 TDI、2.0 TDI 归为 EA288 系列 | S1「The new diesel engines (TDIs of the EA288 engine series)」；S5「Both four-cylinder engines belong to the EA288 engine family and have an SCR catalytic converter.」 | 两处独立稿件一致；S1 同页说 EA211 汽油机与 EA288 柴油机采用相同 12 度后倾安装角 | S1 2012-10-02；S5 2017-08-28 | 2026-10-20 已读并核对 |
| 05-2 | 2.0 升汽油机也不在 EA211 里：那是另一个家族 EA888 | S11「EA888 evo4.」「The 1,984 cm³ four-cylinder turbocharged direct injection engine (TSI)… is the most powerful model in the EA888 engine family」；S5 的说法是「150 PS 以内」的汽油机属 EA211，而该清单里的 2.0 TSI 为 147 kW/200 PS | S9 墨西哥工厂同厂并列生产 EA888 第三代与 EA211 | S11 2021-04-16；S5 2017-08-28；S9 数据截至 2026-02 | 2026-10-20 已读并核对 |
| 05-3 | EA888 并不是「只能纵置」：大众官方档案里的第六代高尔夫 GTI 用的 2.0 TSI 就出自 EA888，且「optimised for transverse installation」 | S12「this is a new power unit from the second development cycle of the “EA888” engine generation. The engine, which has been optimised for transverse installation…」 | S12 同页记 2.0 TSI 235 PS 用于 Golf VI GTI | S12 大众官方车型档案页（Golf VI GTI 2009–2012） | 2026-10-20 已读；这一条纠正了「EA888＝纵置」的常见误解 |
| 05-4 | 两族分工的官方措辞：MQB 是横置矩阵，MLB 是纵置矩阵 | S4「the modular transverse matrix (MQB)」；S13「the modular longitudinal matrix (MLB)」 | — | S4 2022-06-23；S13 未标发布日期的存档页 | 2026-10-20 已读；MLB 全称只有一处官方出处 |
| 05-5 | EA211 能成为主力，是因为平台把发动机安装位置标准化了，新汽油机与新柴油机（EA 288）配了统一接口 | S4「The installation position of the engines is also standardised in the modular transverse matrix.」「The new petrol engines and the equally new diesel engines (EA 288) were provided with standard interfaces for power transmission.」 | S1 从机械角度印证：EA211 换安装角后，排气走向、传动轴与变速箱安装点可以统一 | S4 2022-06-23；S1 2012-10-02 | 2026-10-20 已读并核对 |
| 05-6 | 平台把不同品牌的车放到同一条产线上，集团第一个 MQB 车型是第三代奥迪 A3 | S4「The MQB also makes it possible to build vehicles with different wheelbases and track widths, or models of different brands, on the same production line.」「The first-ever MQB model in the Volkswagen Group was the third-generation Audi A3」 | S9、S10 两座工厂分别给北美与巴西供货，同一家族跨区域 | S4 2022-06-23；S9、S10 数据截至 2026-02 | 2026-10-20 已读并核对 |
| 05-7 | 平台的体量：到 2022 年 6 月，MQB 上已生产超过 3,200 万辆，是大众最成功的技术平台 | S4「With more than 32 million vehicles produced, the modular transverse toolkit (MQB) is Volkswagen's most successful technology platform」 | — | S4 2022-06-23（截至该日） | 2026-10-20 已读；单一出处，片中须带「截至 2022 年」 |
| 05-8 | 家族仍在扩产：墨西哥西拉奥厂 2025 年产 452,042 台发动机，巴西圣卡洛斯厂同年产 626,871 台 | S9「Production: 335,716 vehicles (Puebla plant, 2025); 452,042 engines (Silao plant, 2025)」；S10「Production: 626,871 engines (2025)」 | 两座工厂互相独立 | S9、S10 数据截至 2026-02，产量年份为 2025 | 2026-10-20 已读并核对 |
| 05-9 | 集团内有一个专职的「车型负责人」机制：开姆尼茨厂是 EA211 的 1.0 升与 1.5 升机型在集团内的负责人（type leader），全球其他工厂量产时都由这里的专家支援；该厂 2025 年交付约 681,000 台发动机 | S16「Within the Group, Chemnitz is the type leader for EA 211 engines (1.0 liter and 1.5 liter capacity). Each ramp-up of the engines at other Group sites worldwide is supported by experts from the Chemnitz plant.」「In 2025, around 681,000 engines were delivered.」 | S9、S10 两座海外工厂的 EA211 供货，可视为「别的厂照着开姆尼茨的机型量产」的结果 | S16 数据截至 2025-12 | 2026-10-20 已读并核对 |

## 尚待核实（不得进入定稿）

| 待核实的事 | 为什么没定 | 补法 |
|---|---|---|
| 各排量版本的缸径 × 冲程（1.0／1.2／1.4／1.5／1.6） | 本轮没有拿到厂家一手数据：这类参数只在官方培训资料 SSP 511、SSP 733 里给出，而 SSP 的公开镜像站本轮不可用（连接超时、返回占位文件），第三方汇总站不能作为片中依据 | 取得可复查的 SSP 原件后补记，并按 `docs/research.md` 用实测排量核对；在此之前片中只讲官方公布的升数与代号，不写缸径冲程 |
| 「EA211 evo3」这一官方命名 | 全部一手材料里没有出现过：2020-12 官方写「EA 211 TSI evo」，2022-07 图片说明写「1.5 TSI evo2」，2025-08 上市资料仍写「1.5 TSI evo2」 | 除非找到厂家明确使用 evo3 的页面，否则片中只讲 evo 与 evo2 两代，并把 evo3 标为未见官方命名 |
| 「可变气门升程」在 EA211 上的应用 | EA211 的一手资料里没有升程可变这一项；厂家的可变气门技术是凸轮轴相位可变（进气 50 度曲轴角，双凸轮轴机型排气轴也可变）与 ACT／ACTplus 停缸。可变升程是别的家族的用词 | 若要讲升程，须先取到具体机型的官方资料；本片按「可变气门正时 + 停缸」讲，不提升程 |
| EA211 的累计产量 | 官方页面只给单厂年产与 MQB 累计产量，没有 EA211 家族的累计台数 | 若要写累计，须找到厂家的官方累计口径；否则只用工厂年产与平台累计 |
| 1.6L MSI 的含义 | 巴西工厂页只给代号 MSI，没有解释含义 | 不解释，只用代号 MSI 出现在成员清单里 |
| 各成员在各市场的具体车型清单（斯柯达、西雅特、奥迪等） | 本轮只在官方材料里确认了「MQB 首个集团车型是第三代奥迪 A3」与「不同品牌同线生产」，没有逐个品牌的官方车型对照表 | 若片中要点名品牌车型，须逐个品牌取官方资料并交叉核对；否则只讲「同一家族跨品牌、跨工厂供货」 |
| EA211 在北美 1.6 升机型的官方归属 | 检索到的北美捷达资料页（`vw-jetta-2018-powertrain`）发布日无法确认，未采信 | 取该页的确定日期与官方车型规格页后再决定是否写 1.6 北美归属；本片用巴西工厂页的 1.6 MSI 佐证 |

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
| 主会话的模型（本次未取得可确认的版本标识） | 片单重构、目录搭建与反馈记录校验 | 主会话的交接说明；2026-10-20 |

配音、渲染与成片审查尚未开工，暂无参与模型可记。

## 复核

<!-- 记录核查范围、日期、依据、发现的问题、更正与复查结论；覆盖三项核心审查、原创与动画完成度、片尾名单。未做的写「未做」，待核查的不得写成通过。 -->
