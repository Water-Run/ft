# Spectrum

《Spectrum》讲 Adobe 的设计体系 Spectrum 是什么、由哪些构件组成、Spectrum 1 与 Spectrum 2 差在哪里：色板、字体、间距与网格、组件、图标、动效与深色模式。全片 4 分钟左右，中文与英文两版，配音与渲染尚未开工。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 当前状态与接续

阶段：立项与取证（workflow 第 0–1 步）。文案：未开工，未交审。交付：未完成。发布：未发布。归档：未归档。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 第 1 步取证：官方文档站、Spectrum 1 站点存档、Adobe 官方博客与官方实现仓库均已抓取并落盘到 `research/lab/`；事实表见 `research/FACTS.md`（含 2 项「待核实」） |
| 下一步及依赖 | 第 2 步写稿：`src/js/script.js` 目前仍是脚手架占位，须先按本 README 的「内容」表与 `research/FACTS.md` 写中文稿，交策划者 WaterRun 人工审稿确认后方可配音 |
| 当前稿本 / 校对结论 | 见 `review/NOTES.md` 与 `review/approval.json`（均未开始） |
| 输出在哪台制作机 | 使用不含私人主机信息的制作机代号 |
| 未完成、未检查与阻塞 | ① 待核实项：Adobe Clean 的设计者与设计年份、Adobe XD 首发日期（本轮未取得官方出处，见 `research/FACTS.md` C106、T08）；② 未建 `src/js/scenes/` 实际场景、未做视觉关键帧；③ 未做配乐与配音试听 |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/spectrum export
node kit/tools/script-review.js videos/spectrum check
```

导出的 `review/script.<语言>.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`；主语言通过后翻译并校对其他语言。具体边界见仓库 `docs/guides/script-review.md`。

## 开工反馈应用

反馈版本：2026-10-20.1。本片逐项记录在 `review/lessons.json`；规则来自仓库 `docs/lessons.json`。配音前须填写适用性、具体计划和文案 / 分镜定位；交付前补实际主成片的时间、哈希和验证结论。相关复盘：[docs/log/feedback.md](../../docs/log/feedback.md) 第 3 节与第 7 节；正面对照为 PostgreSQL 一集（F16、P30）与 MyISAM 一集（F01、F02）。

目标观众已有的知识：用过至少一款 Adobe 产品（Photoshop、Acrobat、XD、Lightroom 任一），认得「深色模式」「按钮」「字体大小」这些界面词；不知道设计体系（design system）是什么，也分不清「设计规范」与「换皮肤」。

看完应能回答的一个核心问题：Adobe 凭什么让不同产品「看起来像一家做的」——Spectrum 具体定下了哪些可复查的规则（颜色、字体、间距、组件、图标、动效、深色模式），以及 2023 年底的 Spectrum 2 改了哪些。

逐章怎样推进问题、最后回答什么：第 1 章先给对象、年代与路线（2013 落地 → 2023-12-12 公布 Spectrum 2 → 2024 初铺开网页 → 2026-09-30 新文档站），第 2–5 章依次拆开色板、字体、间距与网格、组件与图标动效，每章都先讲「它规定了什么」再讲「为什么这样规定」，第 6 章收束到「设计体系定的是取值与用法，不是外观」。

本片决定不讲的材料及理由：① 跨设计体系的横向比较（Material、Fluent、Carbon 等）——本系列另有各集，且无官方同口径数据；② Spectrum 1 与 2 的逐项差异清单——本片只取观众能感知的差别，完整清单留作资料；③ Adobe Clean 的设计师与设计年份、Adobe XD 首发日期——本轮未取得官方出处，按研究规范标「待核实」而非猜测；④ React Spectrum / Spectrum Web Components 的工程实现细节——不是本片主问题，只在提到「组件有变体轴」时出现。

| 问题编号 | 适用性 / 不适用的原因 | 本片计划与正面对照 | 怎样验证 |
|---|---|---|---|
| F01 标题与主问题 | 适用：本片标题「Spectrum」是对象名，须在 15 秒内回答「它是什么、为什么值得看」 | 全片只回答一个问题：Adobe 用什么规则让不同产品看起来一致。章节按「对象 → 六类构件 → 小结」推进，每章回答同一问题的不同侧面；不铺陈设计史。取 MyISAM 一集「同一对象走完一条链路」的讲法 | 定稿后逐句标注每章在回答问题的哪一步；成片标出提出（0:00–0:20）、推进（各章起点）与回答（结尾 30 秒）的时间 |
| F02 解释步骤与理解负担 | 适用：设计体系术语多（令牌、层级、重叠、深色模式），且面向无工程背景的观众 | 先给现象再给名词：本片引入的新名词控制在 8 个以内——设计体系、色板、语义色、字型样式、布局间距、组件变体、描边图标、对比度。颜色与字号都给具体数值（如 blue-900 #3B63FB、基准 14 px），不给纯符号 | 用 FACTS.md 逐条对照：每个出现在画面上的数字都能指回条目编号；同屏文字超过 12 段即判不合格；按正常速度播放看是否能一次读懂一页 |
| F03 名称、比较与边界 | 适用：Spectrum 1 / Spectrum 2 / Spectrum Hub / Adobe XD 四个名字极易混淆 | 第 1 章第一次提到时即说明各自是什么、属于哪一年、是什么关系（Spectrum 1 以 XD 插件交付、Spectrum 2 由 React Spectrum 与 Spectrum Web Components 实现、Hub 是 2026-09-30 起的新文档站）；「深色模式」与「暗色配色」的差别在第 5 章第一次出现时交代 | 核对首次出现处的旁白、画面文字与 FACTS 编号（C101–C108）；用一张时间线卡片在第 1 章一次交代四个名字 |
| F04 有效阅读时间（核心：不能“刷一下”） | 适用：本片大量出现数值表（字号阶梯、间距令牌、灰度分级），最易刷屏 | 数值不整屏堆：每次只放 3–5 个值，逐组出现并停住；按「1.5 秒 + 必要文字字数 ÷ 5 字/秒」留稳定阅读区间，再留一步机制的理解时间；色板与字号这类信息给常驻卡片，不靠转场推入 | 成片上逐张记录「全部文字到位 → 开始遮挡/退场」的起止；不足即改；再连续正常速度观看，需要暂停才读完的即判未通过 |
| F05 动画解释机制 | 适用：颜色与字号的差别要「看出来」而不是被说出来 | 关键变化做成可见的对照：灰度分级用同一背景上的色阶条演示、几何级数间距用两条长度不同的间隔演示、描边图标用 1.5 px 线宽与关键形的叠加；整屏擦除只用于换章 | 连续观看每个机制段，确认观众能看见「前因后果」而不是看见一个换色；不以镜头移动代替机制演示 |
| F06 声音选择与配合 | 适用：设计体系题材偏「静」，配乐容易沦为稀疏钢琴 | 配乐按本片气质选：稳定、克制的持续铺底（低频在场），节奏与「令牌—规则—应用」的段落对齐；机械音只用在两处关键动作（颜色/字号切换、组件状态切换），不用默认 whoosh | 主混音、无配乐、仅旁白三版连续试听；按 MyISAM 一集的参照量级检查「配乐是否存在」，听感由策划者确认 |
| F07 隐私与脱敏 | 适用：取证全部来自公网，需要保证片中出现的内容不含本机信息 | 画面只出现官方公开材料：spectrum.adobe.com 的页面截图、官方令牌文件中的色值、官方组件数据里的变体名；不出现任何本机路径、主机名、账号与内网地址 | 逐屏检查最终 MP4、字幕、封面与说明文字；确认无本机路径与身份信息；`research/lab/` 内回显亦不含本机绝对路径 |
| F08 最终文件与记录 | 适用：尚未渲染，本项在制作期先立口径 | 以最终编码的 MP4 核对帧率、时长、响度、真峰值与文件名；README 记录实际参数与 SHA-256，混音 WAV 不代替最终测量 | 交付前用 FFprobe 与响度工具实测主成片并把数值与哈希写回 README |
| F09 证据与反馈来源 | 适用：本片大量结论来自官方文档，需要与评论/作者自评严格分开 | 片中结论只来自 `research/FACTS.md`；官方原文与存档快照分列，存档材料标明快照日期；不引用媒体与聚合站；两项「待核实」不进定稿 | 逐句对照 FACTS 编号；核对画面角标只写「来源：Adobe 官方文档」一行；定稿前再联网复核会变动的日期类事实 |
| F10 单集独立可懂 | 适用：这是本系列第二集，且首集 Metro 尚未制作 | 不提「上一期」；本片自带完整对象介绍与时间线；不假设观众看过任何 Adobe 内部资料 | 不看任何其他集即可跟完；逐句检查是否有前集引用 |
| F11 外文材料的中文解释 | 适用：一手材料全是英文官方文档 | 英文术语第一次出现给中文释义（Spectrum＝设计体系；token＝令牌；type style＝字型样式），并注明中文为意译；官方长文只在需要处引用短句，原文不作主画面 | 检查实际中文成片：每个英文术语旁都有可读中文；长英文引文不整段上屏 |
| F12 读音、断句与口播 | 适用：本片专有名词密集（Adobe Clean、Spectrum、Verge、WCAG、Leonardo） | 配音前列专名读法表：Adobe Clean 读法、WCAG 读法、Leonardo 读法；长句按语义断句，字幕切分不决定口播停顿 | 合成后用 ASR 筛查 + 人耳逐句确认；把代表段试听交策划者确认再合成全片 |
| F13 背景、年代与观看路线 | 适用：观众未必知道设计体系是什么，也不知 Adobe 为何要做它 | 第 1 章交代：什么对象、哪一年开始、和 Creative Cloud 的关系、2013 与 2023 两个关键节点、本片路线；年代只用官方可查的年份 | 定稿检查第 1 章能否让首次观看者复述「对象 + 年代 + 路线」；每个年份都能指回 FACTS 编号 |
| F14 片尾署名与旁白分开 | 适用：片尾有模型名单与仓库链接 | 署名与 credit 放进制作说明，片尾用静默 cue 保留时长、字幕为空、TTS 不发声；导出正文检查无制作指令 | 交付前导出正文文本检查无制作指令；核对成片片尾无人声朗读且链接完整可读 |
| F15 不写制作者口吻的自我说明 | 适用：数值表多，容易写出「仅列出令牌名」「示意」这类自我说明 | 画面只放观众需要的内容；来源只写一行「来源：Adobe Spectrum 官方文档」；不写「按官方取值整理」「示意 · 按令牌构造」之类标注；示意性质的图形才标「示意」，且只标在确实非写实比例的图上 | 逐屏列出所有说明性小字，逐条判断「正常人做视频会不会写这句」，不会写的删去 |
| F16 视觉取自讲解对象 | 适用：本片讲的就是一套视觉语言，视觉必须就是它 | 全部视觉元素取自官方材料：色值取自官方令牌文件（`research/FACTS.md` K08、K09）、字体取 Adobe Clean Spectrum VF 与其回退链、部件形状取官方 Button 变体与 1.5 px 描边图标、标识用官方 Spectrum 标志与官网配色；画面常驻官方标志位置 | 成片任取若干帧，不看字幕能否认出是 Adobe Spectrum；逐项列出所用颜色、字体、部件的官方出处（见「视觉系统」） |
| F17 配音语气与精神度 | 适用：题材偏「说明」，容易念成平读 | 配音前试听候选音色与语速，句子有起伏、该强调处有重音；语气是「讲清楚一件事」而不是「念说明书」；不选已停用音色 | 代表段（颜色分级、字号阶梯、组件变体）试听交策划者确认；成片后连续试听开头、难点段与章间 |
| F18 动画完成度与视觉冲击 | 适用：本片每章都要有可记住的主画面 | 每章一个主画面：①同框的三个 Adobe 产品界面（讲「像同一家」）；②灰度与语义色的分层色板墙；③Adobe Clean 字重阶梯与图标 1.5 px 描边的对齐；④间距从线性到几何级数的两栏对比；⑤按钮变体矩阵与状态流转；⑥Spectrum 1→2 的图标与配色对照。每章主画面写明尺度、层次与动作 | 连续观看每章，指出该章主画面及其动作；只有逐行出现、高亮、淡入的章节记为未通过；与 PostgreSQL 一集并排比较 |
| F19 画面缺陷：溢出、压盖与渐变途中的状态 | 适用：色块、色阶条、表格与字距标注容易越界与压字 | 排版按实际字宽排；色阶条与数值卡不相压；反色高亮不同时渐变底色与字色；元素退场交代去向 | 每个场景逐 0.1 秒取帧，专看渐变、飞入、落位、退场的中间帧；`scan.js` 过闸不算通过 |
| F20 图形承载内容，形式服从功能 | 适用 | 本片讲一套设计语言，画面全部由它的官方令牌与部件构成：色值、字阶、网格、组件变体都取自官方文件并注明出处（F16）；自造的示意块一律标明是示意；不要为了“像包豪斯”再补几何装饰，那正是 P39 记的形式压过功能。 | 同：每个颜色、字阶、组件都能指回官方文件；自造示意块逐一标注。 |

## 内容

章节按「先对象、再构件、最后收束」推进；时间为预计值，成片以旁白与画面实际为准。

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | 现象：打开 Photoshop、Acrobat、Lightroom，界面布局、图标、配色都像出自同一家。点题：这不是巧合，是共用的一套规则——Adobe 的设计体系 Spectrum（FACTS O01、O02） |
| ch1 | 0:20 | 对象与年代：Spectrum 是什么、2013 年落地、2023-12-12 公布 Spectrum 2、2024 年初先铺网页产品、2026-09-30 新文档站上线；Spectrum 1 当年以 Adobe XD 插件交付，与 XD 的关系（C101–C108） |
| ch2 | 1:05 | 色板：11 级中性灰与「按对比度生成」的思路、语义色与静态色的分工、默认背景从 gray-100 变为 gray-25；具体色值（blue-900 #3B63FB、gray-25 #FFFFFF、gray-900 #131313）与深色模式只有一套（K01–K10） |
| ch3 | 2:00 | 字体：Adobe Clean 是 Adobe 的品牌字体与 Spectrum 主字体，受限授权；Spectrum 2 的首选是可变字体 Adobe Clean Spectrum VF；大二度 1.125 比例、基准 14 px；七类字型样式与四种字重（T01–T08） |
| ch4 | 2:35 | 间距与网格：Spectrum 1 的 4 步进间距值（2…96 px）与 12 列响应式网格（列宽 8.33%、gutter 16–48 px）；Spectrum 2 改为几何级数并解释「为什么不用固定网格」（G01–G05） |
| ch5 | 3:15 | 组件、图标、动效与深色模式：按钮的变体轴（primary/secondary/accent/negative、fill/outline、S–XL）与状态序列（默认→悬停→按下→焦点）；图标由实心改描边、1.5 px 线宽；动效分方向性/交互性/寻路三类且寻路仍在制定中（P01–P06） |
| close | 3:55 | 收束：Spectrum 2 覆盖每个设计元素；设计体系定的是「取值与用法」的规则，不是外观——这就是不同 Adobe 产品「像一家做的」的原因（Z01、Z02） |

## 视觉系统

本片不另起一套配色：画面用的就是 Spectrum 自己的视觉语言（系列约定见 `series/design-languages.md`「视觉」一行）。所有元素都能指回官方材料。

| 元素 | 取自哪份官方材料 | 出处 |
|---|---|---|
| 主色（蓝） | 官方实现仓库 `adobe/spectrum-css` 的 `tokens/dist/json/tokens.json`：blue-900 亮色 rgb(59, 99, 251) / #3B63FB，暗色 rgb(86, 129, 255) / #5681FF | FACTS K08；原始文件哈希见 `research/lab/out_18_s1_json.txt` |
| 中性灰 | 同一令牌文件：gray-25 #FFFFFF、gray-50 #F8F8F8、gray-100 #E9E9E9、gray-500 #8F8F8F、gray-700 #505050、gray-800 #292929、gray-900 #131313、gray-1000 #000000（亮色主题） | FACTS K09；`research/lab/out_19_s1_blocks.txt` |
| 官方首页深浅底 | 官方首页 `<meta name="light-bg">` 指向 `/media/beta/f7f7f7.svg`，`<meta name="dark-bg">` 指向深色底图 | `research/lab/out_47_home_assets.txt`（第 26、27 行）与 `out_44_assets.txt`（两处资源的实际抓取） |
| 字体 | Adobe Clean Spectrum VF（首选）；回退 Adobe Clean → Source Sans Pro → 系统无衬线；代码用 Source Code Pro | FACTS T03、T04；官方 /foundations/typography/typography-system |
| 字号 | 大二度比例 1.125，基准 14 px（font-size-100），仅取官方字号表中的值 | FACTS T05；官方 /foundations/typography/typography-system |
| 间距 | Spectrum 2 布局间距令牌 spacing-25 1px 至 spacing-1000 96px 的几何级数 | FACTS G04；官方 /foundations/layout-and-structure/spacing/layout-spacing |
| 部件形状 | 官方 React Spectrum 组件数据 `deps/rsp/data/Button.json`：variant primary/secondary/accent/negative/premium/genai，fillStyle fill/outline，size S/M/L/XL；状态序列 default→hover→down→focus | FACTS P01、P02；`research/lab/out_31_s2_button_json.txt` |
| 图标 | 官方描边图标：1.5 px 描边、基于预定义基本形、以单色为主，徽标处可加彩色 | FACTS P03；官方 /foundations/icons-and-illustrations/icon-fundamentals |
| 身份标识 | 官方 Spectrum 标志资源 `/img/icons/s2-icon-spectrumlogo-20-n`（3,040 字节，SHA-256 b5a0bfda…），画面左上角常驻 | `research/lab/out_44_assets.txt`；官方站点地图 `research/lab/out_10_sitemap.txt` |

参考来源与设计选择：官方文档站、Adobe 官方博客与 Adobe Design 专栏、官方实现仓库。仅使用公开的颜色值、字体名、部件规格与官方标志，不复制 Adobe 产品的界面截图、插画或文案；示意图（如气门/齿轮类与本片无关的图不出现）一律标「示意」。

## 取证

全部为公网只读抓取，脚本与完整回显在 `research/lab/`：抓取用 `10_fetch.ps1`（Invoke-WebRequest）、`15_webtext.ps1`（curl.exe，用于 web.archive.org）、`12_github.ps1`（GitHub API）、`13_tokens.ps1`（仓库树）、`14_extract.ps1`（按行提取原始文件）、`16_cssvars.ps1`（样式表取色与字体）、`11_search.ps1`（检索定位）。回显文件以 `out_` 开头，与脚本同名对应，记录取证时刻（UTC）与内容 SHA-256。

重做一遍：

```bash
cd videos/spectrum/research/lab
pwsh -NoProfile -File 10_fetch.ps1 out_11_foundation.txt 'https://spectrum.adobe.com/getting-started/introduction' 'https://spectrum.adobe.com/foundations/getting-started/principles' 'https://spectrum.adobe.com/getting-started/whats-new' 'https://spectrum.adobe.com/foundations/behavior/motion'
pwsh -NoProfile -File 15_webtext.ps1 out_45_adobe_design.txt 'https://adobe.design/ideas/introducing-spectrum-2' --filter='(?i)(spectrum|2013|xd|color|typography|icon)' --max=90
pwsh -NoProfile -File 14_extract.ps1 out_19_s1_blocks.txt 'https://raw.githubusercontent.com/adobe/spectrum-css/main/tokens/dist/json/tokens.json="(blue|gray)-(25|900|1000)": \{@14'
```

网页会随时间更新，官方文档站的「Release 1.0 / September 30, 2026」等日期以 2026-10-20 抓取结果为准；存档快照的日期已逐条记在 `research/FACTS.md` 的出处栏。

## 读法

<!-- 送去合成的文本与字幕不同的地方（script.js 的 SAY 表）及原因。 -->

尚未开工，无读法差异记录。

## 制作署名与片尾

策划：WaterRun。

开源视频：[本片源码](https://github.com/Water-Run/ft)。片尾须展示「开源视频」与完整可读的网址。

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| MiniMax M3.1 Flash（本次会话运行时标识 minimax-M3.1-Flash） | 取证、事实表与开工反馈应用（子任务执行）；片单重构、目录搭建与反馈记录校验（主会话） |
| — | 配音、渲染尚未开工 |

<!-- 各语言、各视频版本的片尾时段与核对结果：完整性、字号、对比度、停留时间；名单与成片一致。 -->

尚未开工，无片尾时段与核对结果。

## 复现

```bash
node kit/tools/script-review.js videos/spectrum check  # 核对当前稿本的人工确认
node kit/tools/tts.js    videos/spectrum --lang all     # 合成旁白，更新时间线
node kit/tools/check.js  videos/spectrum                # 制作期总闸门
node kit/tools/audio.js  videos/spectrum --lang all     # 混音
node kit/tools/render.js videos/spectrum --lang all     # 渲染
node kit/tools/finish.js videos/spectrum --lang all     # 封装成片
node kit/tools/covers.js videos/spectrum --lang all     # 封面
node kit/tools/check.js  videos/spectrum --final        # 交付前总闸门
```

## 成片

<!-- 时长、规格、交付物清单；事实、读音与节奏、旁白与画面对应的审查结果；原创与动画完成度的检查范围、缺陷与修正；需要人来判断的事项（配乐听感、音色、画面观感）。自动闸门通过不代替上述检查，未核查的如实写明。 -->

尚未开工，无成片、无审查记录。

## 结尾反馈复盘

<!-- 交付前必填。逐行引用开工表中的同一组编号（F01–F09 及后续新增项），不可只写“全部通过”。注明最终 MP4 的语言、版本或哈希；各项列出实际时间窗口和证据。没有播放/试听的范围保留待复核。委托片在 DELIVERY.md 同步结论。 -->

本次核查的最终文件、语言与版本 / SHA-256：尚未开工，无。

| 问题编号 | 开工计划 → 实际做法 | 成片时间区间、检查方法与证据 | 结果 / 未解决项与下一步 |
|---|---|---|---|
| F01 | | | |
| F02 | | | |
| F03 | | | |
| F04 | | | |
| F05 | | | |
| F06 | | | |
| F07 | | | |
| F08 | | | |
| F09 | | | |
| F10 | | | |
| F11 | | | |
| F12 | | | |
| F13 | | | |
| F14 | | | |
| F15 | | | |
| F16 | | | |
| F17 | | | |
| F18 | | | |
| F19 | | | |

<!-- 结果使用“已验证 / 已修改待复核 / 待修改 / 待事实核查 / 不适用（原因）”。补记新发现与反馈总账的关联；修改后另存复测，不覆盖历史评分。 -->

## 发布、归档与清理

<!-- 交付后按 docs/guides/release.md 执行。发布不是归档的前提；记录实际状态。归档路径含个人信息时仅在本机保存，公开表只写不含身份信息的备份代号。 -->

| 项 | 记录 |
|---|---|
| 平台链接、标题、发布时间与时长 | 未发布 |
| 最终文件、语言、规格、SHA-256 | 无成片 |
| 实际 Node、Chrome、ffmpeg、Python 与包版本 | 未开工，未记录 |
| 归档代号、manifest.json 哈希、校验日期 | 未归档 |
| 备份介质与恢复抽验结果 | 未检查 |
| 清理范围、时间、取证实验资源撤除 | 未清理；`research/lab/` 中的取证回显是唯一证据，须保留 |
| 需保留的复盘证据与后续修订 | `research/FACTS.md`、`research/lab/` 全部回显、`review/lessons.json` 的开工计划 |

```bash
node kit/tools/clean.js videos/spectrum   # 只预览，不删除
```
