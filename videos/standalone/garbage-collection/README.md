# 垃圾回收的艺术

一部数分钟的垃圾回收科普：从“内存不用了为什么不还给系统”出发，讲引用计数、追踪、标记—清扫、复制/压实、分代、三色与写屏障，以及 Go、V8、Python、Swift、Rust、Java 各自的选择。中文与英文两版。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 当前状态与接续

阶段：事实测绘与视觉方向已落盘。文案：未写、未确认。交付：未完成。发布：未发布。归档：未归档。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 2026-10-18：CPython 3.14.3 引用计数/环实验、Go 1.27.0 GC trace；McCarthy 1960 全文与 1960/1970/1978/1983 论文/摘要核对；`research/FACTS.md`、`sources.json`、`NARRATIVE.md`；瑞士风格设计方向与 token |
| 下一步及依赖 | 写中文稿 → 交 WaterRun 逐句审查并明确确认 → 翻译/校对英文 → 配音 → 视觉关键帧 → 场景 |
| 当前稿本 / 校对结论 | `src/js/script.js` 仍是模板骨架；没有文案确认 |
| 输出在哪台制作机 | 制作机 A（Windows；CPython 3.14.3、Go 1.27.0）；没有成片 |
| 未完成、未检查与阻塞 | 文案、时间线、关键帧、场景、声音、渲染、审查、封面均未做；体量上限待写稿前定 |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/standalone/garbage-collection export
node kit/tools/script-review.js videos/standalone/garbage-collection check
```

导出的 `review/script.<语言>.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`；主语言通过后翻译并校对其他语言。具体边界见仓库 `docs/script-review.md`。

## 开工反馈应用

<!-- 开工必填，改片另起本轮记录。先读 docs/feedback.md 与最近相关复盘；按总账带入全部问题编号，新增编号也须补入。不适用写具体原因，不能只写“已阅读反馈”。 -->

反馈版本：2026-10-18（F01–F12）。本片逐项记录在 `review/feedback.json`；相关复盘：`docs/feedback.md`（2026-10-18 读取）的 P0–P13、C1–C14 与 F01–F12；重点看 P2/P3（卡片与转场同质化）、P6（镜头别晃）、P9（术语第一次出现要解释）和 F01–F03。

目标观众已有的知识：写过 Python/JavaScript/Java/Go 一类的程序，见过 `OutOfMemoryError`、GC 日志或“内存泄漏”；知道堆/栈的大致区别；没有系统学过标记、清扫、分代、三色、写屏障。

看完应能回答的一个核心问题：程序怎么知道一块内存“已经没用了”，又怎样在不长时间打断程序的前提下把它收回来。

逐章怎样推进问题、最后回答什么：钩子（McCarthy 的脚注）→ 引用计数（立即释放与环）→ 追踪（roots/可达性、mark-sweep、copying、mark-compact）→ 分代（大多数对象死得早）→ 并发（三色、写屏障、STW）→ 代价（吞吐/暂停/内存，Go/V8/Python/Swift/Rust/Java 的选择）→ 收束（“艺术”是在不可完全预知的行为上做可证明的规则）。

本片决定不讲的材料及理由：某个算法的完整伪代码、调参手册、跨运行时基准、ZGC/Shenandoah/Oilpan 等分支。理由见 `research/NARRATIVE.md`：数分钟里这些会挤掉定义与逐步解释。

| 问题编号 | 适用性 / 不适用的原因 | 本片计划与正面对照 | 怎样验证 |
|---|---|---|---|
| F01 标题与主问题 | 适用 | 标题“艺术”不能变成术语清单；用“内存不用了为什么不还”作主线，历史和运行时都服务于它 | 审稿时标出开头问题、各章答案与结尾回答的时刻 |
| F02 解释步骤与理解负担 | 适用 | 用同一个 Python 对象走完“计数→归零→环→collect”，再用 Go 的 200k/1k 实验说明追踪；每一步交代输入、变化、理由、结果 | 正常播放检查能否从“del 之后为什么还在”跟到“collect 之后为什么没了”；记录每步时间 |
| F03 名称、比较与边界 | 适用 | 第一次出现 tracing/refcount/mark-sweep/copying/generational/tri-color 时各给一句定义；区分 Go 1.19 指南、Go 1.27 实验、Python 3.15 文档与 3.14.3 实验 | 审稿时核对首次定义、版本标注和画面文字 |
| F04 有效阅读时间 | 适用 | 用 01–07 的章节编号，不做“刷一下”的章节卡；每张承载论点的卡按 3–5 秒完整阅读设计 | 成片用 `sheets.js cue` 与逐帧检查卡片停留 |
| F05 动画解释机制 | 适用 | 网格/盖章/清扫/复制四种动作各有语义；不做全片同一种擦除；镜头只在站与站之间移动 | 与近期两部并排看开头/换章/解释段 |
| F06 声音选择与配合 | 适用 | 节拍器、印章、纸张、铅笔各有语义；不用默认 whoosh；配乐写清节奏、动机与加层 | 主混音/无配乐版试听，记录片段与结果 |
| F07 隐私与脱敏 | 适用 | Python/Go 回显只含对象名、计数和通用路径；不把本机用户名/主机名带进画面 | 检查最终 MP4、字幕、封面与 FACTS 回显 |
| F08 最终文件与记录 | 适用 | 体量上限写稿前定；60fps、立体声、响度按仓库默认；出片后记录实际编码参数与哈希 | `check.js`、`ffprobe`、实际音轨测量与 README 对照 |
| F09 证据与反馈来源 | 适用 | “Go 分代”“G1 实时”“Swift 是 tracing”“引用计数不是 GC”等容易引战；每条回到 FACTS 的来源与版本，未核的写“待核” | 审稿与成片复核时逐条对照 `FACTS.md` 的“边界与常见误说” |
| F10 单集独立可懂 | 适用 | 独立片；不假设看过任何前集。 | 不看任何前集也能理解；审稿逐句检查前集引用。 |
| F11 外文材料的中文解释 | 适用 | McCarthy 脚注、mark-sweep/copying/tri-color/generational 等英文术语给中文解释；论文引文只作辅助。 | 审稿时能找到每个外文术语的中文解释；不要求观众读英文论文。 |
| F12 读音、断句与口播 | 适用 | McCarthy、Dijkstra、Lieberman-Hewitt、Cheney、GOGC、Go、V8、G1、ARC 等列试听清单。 | tts_probe/asr 回听；人耳确认读错/断句；记录时间点。 |

## 内容

大纲见 `research/NARRATIVE.md`。以下只是章节骨架，不是旁白；起点要等实测时间线。

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | McCarthy 的脚注；片名卡 |
| refcount | 待定 | Python 计数 2→3→2、立即 `__del__`；X/Y 环；`gc.collect()` |
| tracing | 待定 | roots/可达性；mark-sweep 的符号位；free-list、复制与转发指针、压实 |
| generations | 待定 | 大多数对象死得早；young/old；remembered set/entry table |
| concurrent | 待定 | 白/灰/黑；黑不能指白；write barrier；STW 的短点 |
| runtimes | 待定 | Go/V8/Python/Swift/Rust/Java 各自的选择与代价 |
| history | 待定 | 1960/1970/1978/1983/2015/2019；片尾名单 |

## 视觉系统

瑞士风格：12 栏网格、Inter/Noto Sans SC、黑/米白加一个强调红；内存画成方格，黑=活、白底黑框=死、灰=已扫描，红色只给收集器的标记/清扫/搬动。标题极大、正文很小，左对齐右不齐，大片留白；用 01–07 编号和小号年份。完整规范、色彩/字体/图形语义、封面与禁止项见 [`src/design/STYLE.md`](src/design/STYLE.md)，token 见 [`src/design/tokens.css`](src/design/tokens.css)。

参考来源：策划者提供的「瑞士风格」风格卡；本片把网格转译为堆/对象/指针，把红色限定为“收集动作”。没有照搬某张海报或某个产品的版式；具体选择见 STYLE.md 第 1、5、8 节。

## 取证

- 实验：`research/lab/01_python_refcount.py`（CPython 3.14.3）与 `research/lab/02_go_trace.go`（go1.27.0，`GODEBUG=gctrace=1`）；完整回显 `out_01_python_refcount.txt`、`out_02_go_trace.txt`。
- 论文：McCarthy 1960 全文 PDF；Collins 1960、Cheney 1970、Dijkstra 1978 只读出版社摘要；Lieberman & Hewitt 1983 全文 HTML。版本与摘要在 `research/FACTS.md`。
- 运行时文档：Go GC guide（描述 Go 1.19）、Go 1.5 博客、V8 Orinoco 2019、Python 3.15 `gc` 文档、JDK 21 G1 指南、Swift ARC、Rust ownership。
- 重做：分别运行两个 lab 脚本；Go 实验要保留 `GODEBUG=gctrace=1` 才能看到每次 GC 的一行 trace。数字是单机单次，不要当基准。

## 读法

尚无旁白。写稿与合成后，在此登记送去合成的文本与字幕不同的地方（`script.js` 的 SAY 表）及原因。

## 制作署名与片尾

策划：WaterRun。

开源视频：[本片源码](https://github.com/Water-Run/ft)。片尾须展示「开源视频」与完整可读的网址。

<!-- 根据 research/FACTS.md 的「制作署名」记录填写实际参与模型，不猜测版本；未披露模型的服务如实注明。所有语言、各交付视频版本都须包含完整名单。 -->

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| DeepSeek Flash（运行环境未披露更细版本） | 事实测绘、CPython/Go 实验、论文与运行时文档核对、叙事测绘、瑞士风格设计方向 |

片尾时段与各语言版本的核对结果：未做（没有成片）。

<!-- 各语言、各视频版本的片尾时段与核对结果：完整性、字号、对比度、停留时间；名单与成片一致。 -->

## 复现

```bash
node kit/tools/script-review.js videos/standalone/garbage-collection check  # 核对当前稿本的人工确认
node kit/tools/tts.js    videos/standalone/garbage-collection --lang all     # 合成旁白，更新时间线
node kit/tools/check.js  videos/standalone/garbage-collection                # 制作期总闸门
node kit/tools/audio.js  videos/standalone/garbage-collection --lang all     # 混音
node kit/tools/render.js videos/standalone/garbage-collection --lang all     # 渲染
node kit/tools/finish.js videos/standalone/garbage-collection --lang all     # 封装成片
node kit/tools/covers.js videos/standalone/garbage-collection --lang all     # 封面
node kit/tools/check.js  videos/standalone/garbage-collection --final        # 交付前总闸门
```

## 成片

<!-- 时长、规格、交付物清单；事实、读音与节奏、旁白与画面对应的审查结果；原创与动画完成度的检查范围、缺陷与修正；需要人来判断的事项（配乐听感、音色、画面观感）。自动闸门通过不代替上述检查，未核查的如实写明。 -->

## 结尾反馈复盘

<!-- 交付前必填。逐行引用开工表中的同一组编号（F01–F12 及后续新增项），不可只写“全部通过”。注明最终 MP4 的语言、版本或哈希；各项列出实际时间窗口和证据。没有播放/试听的范围保留待复核。委托片在 DELIVERY.md 同步结论。 -->

本次核查的最终文件、语言与版本 / SHA-256：

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

<!-- 结果使用“已验证 / 已修改待复核 / 待修改 / 待事实核查 / 不适用（原因）”。补记新发现与反馈总账的关联；修改后另存复测，不覆盖历史评分。 -->

## 发布、归档与清理

<!-- 交付后按 docs/lifecycle.md 执行。发布不是归档的前提；记录实际状态。归档路径含个人信息时仅在本机保存，公开表只写不含身份信息的备份代号。 -->

| 项 | 记录 |
|---|---|
| 平台链接、标题、发布时间与时长 | 未发布 |
| 最终文件、语言、规格、SHA-256 | |
| 实际 Node、Chrome、ffmpeg、Python 与包版本 | |
| 归档代号、manifest.json 哈希、校验日期 | 未归档 |
| 备份介质与恢复抽验结果 | 未检查 |
| 清理范围、时间、取证实验资源撤除 | 未清理 |
| 需保留的复盘证据与后续修订 | |

```bash
node kit/tools/clean.js videos/standalone/garbage-collection   # 只预览，不删除
```
