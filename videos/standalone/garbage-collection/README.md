# 垃圾回收的艺术

一部七分钟以内的垃圾回收科普，口吻俏皮、妩媚，画面要震撼：从“C# 一秒六千七百万个对象、攥住不放撞上 64 MB、放手则 136 次回收程序一个字都没管”出发，讲引用计数（CPython、PHP）、标记—清扫（麦卡锡 1960、Lua）、分代（.NET）、三色与写屏障（迪杰斯特拉 1978、Lua 源码与 419 步、.NET 的四条指令、Java G1 的并发标记），最后算一笔账（Lua 的旋钮、Nim 的 --mm 开关、Rust 的所有权、C 与 Zig 的手动管理）。“艺术”不单独成章，落在每章末尾一句机制本身的妙处上。中文与英文两版（英文待中文确认后翻译）。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`（逐条编号，`src/js/script.js` 每句引用）。

## 当前状态与接续

阶段：前期总结完成，中文第 7 稿已导出交审，三轮对抗审稿（事实审计、目标观众、运行时工程师）的意见全部处理。文案：未确认。配音、画面、交付、发布、归档：均未做。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 2026-10-19：`research/FACTS.md` 全部陈述编号（E/G/R/T/N/C/L/D/P/M/J/K/U/V/H/X/Z）；实验 `lab/01`–`12`（新增 09 .NET 10、10 PHP 8.5、11 Nim 2.2、12 OpenJDK 27）；按 WaterRun 同日四轮意见改到第 7 稿：71 句旁白 + 2 静默，估算 417.2 s（6:57），内容 SHA-256 `2c69cb703f3bb41817cd21b8866206b33c8e6b8dcfba29cc5bacdaa7d9ef7408`；配音改 MiniMax 傲娇御姐并做了四种音色试听；画面冲击点写进 STYLE.md 第 13 节；反馈记录 2026-10-19.4（F01–F17）按第 7 稿更新 |
| 下一步及依赖 | WaterRun 复核第 7 稿并明确确认（`review/NOTES.md` 列了 10 项取舍）→ 试听 `audio/probe/` 定音色与语速（F17）→ 按意见改稿重新导出 → 翻译/校对英文 → 配音 → 视觉关键帧（STYLE.md 第 13 节的冲击点；F16 的身份标识与标志来源先补进 STYLE.md）→ 场景 |
| 当前稿本 / 校对结论 | `review/script.zh.2c69cb70….md`；第 1、2 稿与两轮对抗稿保留；`approval.json` 为 pending，没有确认 |
| 输出在哪台制作机 | 制作机 A（Windows；CPython 3.14.3、Lua 5.5.0、.NET 10.0.12、PHP 8.5.10、Nim 2.2.12、OpenJDK 27、rustc 1.98.1、Node 24.21.0、Go 1.27.0）；没有配音、没有成片；音色试听在 `audio/probe/`（不入库） |
| 未完成、未检查与阻塞 | 文案确认、音色确认、英译、配音、关键帧、场景、声音、渲染、审查、封面均未做。体量上限 `check.duration` 240–420 秒，第 7 稿估算贴着上限（NOTES 取舍第 2 项） |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/standalone/garbage-collection export --lang zh
node kit/tools/script-review.js videos/standalone/garbage-collection check --lang zh
node kit/tools/stats.js videos/standalone/garbage-collection --lang zh
```

导出的 `review/script.zh.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`；中文通过后翻译并校对英文。具体边界见仓库 `docs/script-review.md`。

目标观众已有的知识：写过 Python、Lua、C#、PHP 一类的程序，见过 OutOfMemory 一类报错；知道堆/栈的大致区别；没有系统学过标记、清扫、分代、三色、写屏障。

看完应能回答的一个核心问题：运行时怎么知道一块内存“已经没用了”，又怎样在不长时间打断程序的前提下把它收回来。

逐章怎样推进问题、最后回答什么：开场（o1–o10：格子纸即堆 → 一秒六千七百万个数都数不过来 → 攥住不放，收五次也收不回，内存耗尽，四种报错你总见过一种 → 放手则堆只有 11 MB、136 次回收程序一个字都没管 → 什么是垃圾回收 → 程序不会说“我不要了” → 两问 → 五个名字与账单）→ 01 引用计数（对象开头 8 字节里的数，归零当场释放；环卡在 1；Python 与 PHP 另请拆环器，各报收 2 个；妙处：对象自己知道什么时候该走）→ 02 标记—清扫（从根出发走一遍叫追踪，刚才那个环够不着照收；以后用不用说不准，能不能找到现在就能算；麦卡锡 1960 的符号位；标记只认活的，没标的清扫挨个请走；Lua 一轮 28 MB 掉到 14 MB）→ 03 分代（短命对象占大头；新区小、收一次快所以勤收；.NET 对象 0→1→2，一秒 136 次都在第 0 代；老指新靠卡表打勾；妙处：经验观察长成堆的形状）→ 04 三色与写屏障（迪杰斯特拉 1978：别停程序；三色；黑牵白又断灰路就丢；迪杰斯特拉的家规；写屏障；Lua 源码里的规矩与改表时的后退屏障；419 步，这叫增量；Java 的 G1 后台标记头停一下尾停两下，这叫并发；.NET 的卡表四条指令，写入和打勾都在屏障里；妙处：程序员一行屏障都没写，却得了一个边跑边标记的收集器）→ 05 谁来买单（收得勤 CPU 烧得多；Nim 让你自己挑，只留引用计数叫 ARC、环永不释放；Rust 的所有权一块内存只认一个主人，Nim 的 ARC 同理只是还在数数；C 与 Zig 自己 free；谁都没白吃，账记在不同人头上）→ 收束（它不知道内存没用了，只知道还找不找得到；麦卡锡的脚注；从一停好几秒到一秒一百多次）。

本片决定不讲的材料及理由：复制与压实的独立章节、Go 与 Swift 的例子（事实与实验保留）、CPython 环收集器的内部算法、Lua 的两种白、Java 幸存区细节、调参手册、跨运行时基准。理由见 `research/NARRATIVE.md`。

## 开工反馈应用

开工反馈版本：2026-10-18（F01–F12）；2026-10-19 同步至 **2026-10-19.4 / F01–F17**，F06 按改写后的规则重填，F16、F17 新填，第 7 稿更新句号。依据：[反馈总账](../../../docs/feedback.md)、[2026-10-18 复盘](../../../docs/reviews/2026-10-18.md)、[MyISAM 正面对照](../../../docs/reviews/2026-10-09.md)、PostgreSQL 一集（F16 正面对照）。结构化计划与句号定位见 `review/feedback.json`。

| 编号 | 适用性、本片计划与对照 | 验证办法 |
|---|---|---|
| F01 | 适用。标题“艺术”不设单独章节（WaterRun 意见）：每章末尾一句机制本身的妙处（a5、b3、b7、d3、e11、e20、g8–g10）由画面版式统一标出；主问题在 o9 提出，01–02 回答“怎么知道没用”，03–04 回答“怎么不停太久”，05 回答代价，h1 收束，h7 回到开场的数字。历史只在该机制被需要时出现。 | 审稿标出提问、各章答案与收束的句号；成片记录时间点。 |
| F02 | 适用。开场同一个 C# 程序两种模式只差“对象是否被引用”（o2–o6）；同一个对象 a 走完 1→2→3→2→1→0（a2–a4）；同一对 X/Y（a7–a9，b2a 回应）；Lua 实验交代输入、过程、结果（b8–b9、e13–e15）；三色先给反例再给规矩（e7–e8）；术语在例子之后。四条指令一次只讲一条。 | 正常速度通看 e3–e20，确认不要求同时读源码、汇编与字幕。 |
| F03 | 适用。机制名称在章卡与旁白里都出现：引用计数 a1、追踪 b2、标记—清扫 b7、分代 d2、卡表 d8、三色标记 e3、写屏障 e10、增量 e15、并发 e18、所有权 g5；版本固定在画面署名（C# / .NET 10、PHP 8.5、Lua 5.5、Nim 2.2、OpenJDK 27、CPython 3.14.3）。 | 对照 FACTS X01–X21 逐句核首次定义、版本与画面文字。 |
| F04 | 适用，**核心**。结论句已给 0.6–1.0 s 停顿（o4、o6、a5、b3、d3、e6、e11、e20、g10、h6、h7）；枚举句 a3、e4 按分号拆成多条字幕并与画面计数器 / 颜色同步；FATAL/异常行、`lgc.h` 注释、四条指令、419 步曲线先整体出现再逐行高亮；章卡 lead 4 s；片尾 14 s。对照 OpenCart 07:12 负例。 | 最终 MP4 逐卡量“全部到位 → 开始退场”区间；连续正常速度观看，需要暂停即不通过。 |
| F05 | 适用。每章一个冲击点、一种有语义的动作（STYLE.md 第 13 节）：开场格子纸按分配填黑、撞上上限切成报错原文、再被每秒 136 次的红线刷过；01 的 8 字节数字；02 的 28→14 MB 断崖曲线；03 的方块逐级跳代；04 的红线被改灰与四条指令变红；05 的账单；收束的打字机脚注。整屏刷换只用于换章。 | 连续看 o2–o6、e3–e11、e13–e17，确认能看见前因后果；与近期两部并排比较。 |
| F06 | 适用（2026-10-19.4 重填）。音效按对象语义：计数 tick、归零印章、清扫划线、搬动滑动；默认 whoosh 关闭；解释段留白。配乐要有存在感：一层贯穿全片、有分量的低频铺底（以 MyISAM 一集为参照），冲击点前半秒抽走、冲击点上砸回；旋律稀疏不等于克制。 | 主混音、无配乐、仅旁白三版连续试听并与 MyISAM 铺底对照记录；事件数与 LUFS 不代替听感。 |
| F07 | 适用。十二组回显只含对象名、计数、寄存器名、相对文件名；Go 汇编用 `-trimpath`；V8 trace 只含 PID 与 isolate 地址；Node hoard 删去原生栈；PHP、.NET、Java 回显的路径替换成 `…/`；Lua、Nim 回显只有计数与步数。 | 检查最终 MP4、字幕、封面与 FACTS 回显中的用户名/主机名/路径。 |
| F08 | 适用。上限由策划者定：4–7 分钟，`check.duration` 240–420 s；第 7 稿估算贴着 420 s，配音实测若超按 NOTES 删句顺序删；60 fps、立体声、响度按仓库默认；出片后记录实际编码参数与哈希。 | `check.js --final`、`ffprobe`、实际音轨真峰值与 README 对照。 |
| F09 | 适用。易引战句各有编号依据：清扫要碰每个对象 X19、.NET 的辅助函数是记卡屏障 X20、追踪也付屏障钱 X21、G1 周期的停顿 Z22、Nim ARC 仍在数数 Z23、“程序没管”不说“没停”Z21、脚注出处 T04/Z09；单机单次数字只作画面原文（Z14、Z17）。 | 审稿与成片复核逐句对照 FACTS 的 X、Z 两节。 |
| F10 | 适用。独立片，不引用任何前集；o10 给出本片路线。 | 逐句检查无前集引用；不看任何前集也能理解。 |
| F11 | 适用。英文术语首次出现给中文（追踪 b2、写屏障 e10、卡表 d8、所有权 g5）；报错原文、Lua 注释、汇编以中文读出，画面给原文；脚注以中文译文读出（h5–h6），画面同时给原文与译文并注明“译”；论文题名只作画面小字出处。 | 成片中每处英文都能找到可读的中文对应。 |
| F12 | 适用。试听清单见「读法」；SAY 表与 tts 字段为候选；枚举句用 tts 字段固定读法。 | 确认后 `tts_probe` 逐段试，`asr.js` 筛查后人耳逐段确认并记录时间点。 |
| F13 | 适用。o1–o6 先让观众看见现象；o7 是什么；o8 为什么难；o9 两问；o10 路线与五个名字。各章年份（1960、1978、1983）只在该机制被需要时出现并固定版本。 | 首次观看能复述对象、年代与主线。 |
| F14 | 适用。正文无署名与制作指令；片尾 `gCredit` 为 pause 14 s、`credits: true`、无 tts；名单在本 README「制作署名与片尾」。 | 导出稿与 TTS 输入排除片尾；成片片尾无人声且名单可读。 |
| F15 | 适用。画面不写“示意”“单机单次”“本实验”之类说明；实验数据只用一行来源署名（“.NET 10 · 本片实验”“Lua 5.5.0 · 本片实验”）；口径限定只在观众会误解处用一句自然旁白；“用 C# 试一下”是叙述，不是免责声明。 | 成片逐屏列出说明性小字，逐条判断去留。 |
| F16 | 适用，对象不是单一产品而是垃圾回收与六个真实运行时。画面证据一律是运行时真实输出的原文（.NET 的异常与汇编、PHP 与 Java 的报错、CPython 内存里的计数、Lua `lgc.h` 注释与步数、Nim 的 expandArc、G1 日志）以等宽字原样排出，不重绘成示意图；论文段落取 1960 与 1978 年 CACM 的版面感。常驻身份标识：左上角“格子纸=堆”标记与片名全片不变，右上角随章切换当前运行时名称与版本；各家标志按其商标与许可条款只作指认。来源与许可补进 STYLE.md 后再做关键帧。 | 成片任取若干帧，不看字幕判断能否认出“讲垃圾回收、在讲哪个运行时”；逐项列出颜色、字体、部件、标志各自的来源与许可。 |
| F17 | 适用。配音前已试听：四个 MiniMax 候选音色（傲娇御姐、温暖闺蜜、阅历姐姐、御姐 beta）各合成三段代表句（o1–o2、e11、h5–h6）在 `audio/probe/`，默认选傲娇御姐（“妩媚成熟”）；语速 1.0 起，听句子是否有起伏、重音是否落在“六千七百万”“黑的不许指白的”“一行屏障都没写”、长句不被念平；试听结论交 WaterRun 确认后再合成全片。Tmux、OpenCart 作反面对照。 | 成片后连续试听开头、04 章与各章间并记录；响度、真峰值、语速与 ASR 都不代替听感。 |

## 内容

大纲见 `research/NARRATIVE.md`。起点为字数估算，等实测时间线更新。

| 场景 | 章 | 估算起点 | 内容 | 画面上的真实数据 |
|---|---|---|---|---|
| open | — | 0:00 | 格子纸即堆；一秒六千七百万个；撞上 64 MB，收五次也收不回；四种报错；放手则 10 MB、136 次；什么是垃圾回收；两问；五个名字 | `out_09` 的 churn / hoard；`out_10`、`out_12`、`out_07` 的报错行 |
| count | 01 引用计数 | 0:58 | 对象开头的 8 字节；1→2→3→2→1→0；PHP 的 refcount；环卡在 1；两边各报收 2 | `out_05` 的原始计数；`out_01` 的返回值 2；`out_10` 的 refcount 与 `gc_collect_cycles() = 2` |
| trace | 02 标记—清扫 | 1:52 | 根、追踪；环够不着照收；1960 年的符号位；标记只认活的；Lua 一轮 28→14 MB | `out_08` 的 before / after |
| gen | 03 分代 | 2:47 | 1983 年的观察；新区勤收老区少收；.NET 0→1→2；一秒 136 次都在第 0 代；卡表 | `out_09` 的 gen 与 churn |
| tri | 04 三色与写屏障 | 3:36 | 迪杰斯特拉 1978；白灰黑；丢对象的两个条件；家规；写屏障；Lua 源码的规矩与后退屏障；419 步；.NET 四条指令；G1 的并发周期 | `lgc.h` 第 18–23 行；`out_08` 的步数；`out_09` 的汇编；`out_12` 的 Concurrent Start / Remark / Cleanup |
| cost | 05 谁来买单 | 5:25 | 吞吐与 CPU；Nim 的 --mm；Rust 的所有权与 MIR；Nim 的 expandArc；C 与 Zig；账单 | `out_11` 的 ARC / ORC 与 expandArc；`out_06` 的 MIR |
| close | —（收束） | 6:15 | 它只知道还找不找得到；麦卡锡的脚注（原文与译文）；回到 136 次；片尾 14 s | 脚注原文（`mccarthy-1960`） |

## 视觉系统

瑞士风格：12 栏网格、Inter/Noto Sans SC、黑/米白加一个强调红；内存画成方格，黑=活、白底黑框=死、灰=已扫描，红色只给收集器的标记/清扫/搬动。完整规范见 [`src/design/STYLE.md`](src/design/STYLE.md)；第 13 节按策划者“震撼、艺术、冲击感”的要求定了每章一个冲击点（67,000,000 滚动、报错原文、136 次红线、8 字节数字、28→14 MB 断崖、0→1→2 跳代、黑指白被改灰、四条指令变红、账单、打字机脚注）与可选的黑底“赛博”变体；每章末尾的“妙处句”用同一种版式标出。token 见 [`src/design/tokens.css`](src/design/tokens.css)。F16 的身份标识与各家标志的来源、许可在关键帧前补进 STYLE.md。

参考来源：策划者提供的「瑞士风格」风格卡；本片把网格转译为堆/对象/指针，把红色限定为“收集动作”。没有照搬某张海报或某个产品的版式。关键帧与代表性动画在文案确认后做。

## 取证

- 实验（`research/lab/`，回显同名 `out_*`）：`01`、`05` CPython 3.14.3（getrefcount、ctypes 直接读 `ob_refcnt`、环与 `gc.collect()`）；`02`、`03` Go 1.27（gctrace、写屏障汇编；第 3 稿起不旁白）；`04`、`07` Node 24 / V8（trace、分配速度与堆上限；只作报错拼贴）；`06` Rust 1.98（`drop` 与 MIR）；`08` Lua 5.5.0（二十万活表加二十万垃圾，`collectgarbage("step", 0)` 419 步，28,457 KB → 14,239 KB）；`09` .NET 10.0.12（一秒 67,000,000 个对象、136 次第 0 代回收；`DOTNET_GCHeapHardLimit=0x4000000` 下第 1,048,577 个对象抛 `OutOfMemoryException`，其间第 2 代回收 5 次；`GC.GetGeneration` 0→1→2；`DOTNET_JitDisasm` 下 `a.Next = b` 的四条指令 `lea / call CORINFO_HELP_ASSIGN_REF / nop / ret`，11 字节）；`10` PHP 8.5.10（`debug_zval_dump` 的 refcount 2→3→4→3→2、`unset` 时立即析构、`gc_collect_cycles() = 2`、`memory_limit=64M` 的 Fatal error）；`l11` Nim 2.2.12（`--expandArc` 的 `=destroy` 插入；`--mm:arc` 环泄漏、`--mm:orc` 回收）；`12` OpenJDK 27（一秒 287,530,000 个对象 16 次年轻代回收；`-Xmx64m` 的 `OutOfMemoryError: Java heap space`；G1 并发标记周期的 Concurrent Start / Remark / Cleanup）。
- 论文：McCarthy 1960 全文（脚注 7 是重排时加的回顾性注释，见 FACTS T04）；Dijkstra 等 1978 全文与 1975 年手稿 EWD520 的转录；Lieberman & Hewitt 1983 全文；Collins 1960、Cheney 1970 只读出版社摘要。
- 运行时文档与源码：Lua 5.5 参考手册与 5.5.0 源码（`lgc.h` 三色注释与不变式、`lgc.c` 两种屏障与 `singlestep`/`incstep`、`lvm.c` 表赋值走后退屏障、`lstate.c`、`lua.c`）；.NET 的 GC 基础、配置、后台 GC、工作站/服务器 GC、`GC.GetGeneration`、BOTR；PHP 手册的引用计数、环收集、`debug_zval_dump`、`memory_limit`、`gc_collect_cycles`、`gc_status`；Nim 2.2.12 自带的 `mm.md`、`destructors.md`；JDK 21 排障指南；Zig 官网概述；cppreference 的 C `free`；Go GC 指南与运行时源码、V8 Orinoco、Python `gc` 文档、JDK 21 G1 指南、Swift ARC、Rust 语言书第 4 章。网页与源码下载在 `research/_src/`，不入库。
- 重做：按各脚本开头的命令运行；.NET 用 `dotnet run -c Release`，`wb` 模式带 `DOTNET_TieredCompilation=0 DOTNET_JitDisasm="*Link*"`；PHP hoard 用 `-d memory_limit=64M`；Nim 需要 C 编译器（本机 MinGW gcc 16.2）；Java 单文件源码直接 `java -Xlog:gc`；回显入库前替换本机路径。数字是单机单次，不要当基准。
- 2026-10-19 的环境里 docs.python.org、nim-lang.org、docs.oracle.com、部分 GitHub raw 页面经 Web Fetch 不可达：Python 文档改读 CPython 仓库 3.14 分支的 rst；Nim 读安装目录自带文档；Oracle、PHP、Zig、cppreference 页面用 curl 下载后核对；两篇 PDF 用 pypdf 提取文本；Nim、OpenJDK、MinGW 经 scoop 安装。

## 读法

尚无配音。`project.json` 的 `tts` 已改为 MiniMax `speech-2.8-hd`，音色 `Chinese (Mandarin)_Mature_Woman`（傲娇御姐），语速 1.0；候选试听在 `audio/probe/`（不入库）。`script.js` 的 SAY 表与 `tts` 字段是候选读法，不是验收。确认后的试听清单（F12 读音、F17 语气一起听）：

| 类别 | 条目 |
|---|---|
| 人名 | 麦卡锡、迪杰斯特拉、利伯曼和休伊特（字幕用中文译名，画面给英文原名） |
| 英文术语 | C#（C sharp）、.NET（dot net）、PHP（P H P）、CPython（C Python）、Lua、Nim、Rust、Zig、Lisp、G1（G 1）、ARC（A R C）、CPU、free |
| 代码 | `a.Next = b`（a 点 next 等于 b）、`b = a` |
| 数字 | 六千七百万、一百三十六次、64 MB（六十四兆）、10 MB（十兆）、28 MB 掉到 14 MB、419 步 / 300 步、8 字节、报收 2 个、卡在 1、1960 / 1978 / 1983 年逐字读；a3、d4、d5 用 tts 字段固定读法 |
| 多音字与断句 | “一行没管”（háng）、“数数”（shǔ shù）、“重新排版”、e7/e7a 与 e12/e12a 的连读、h5–h6 引文的语气 |
| 语气（F17） | o2–o6 要有往前推的劲和一点轻蔑；e8 的家规句与 e11 的妙处句要有重音；o8 的“这块，我不要了”和 h5–h6 的引文要“扮一下”程序和麦卡锡；h7 收束不塌 |

## 制作署名与片尾

策划：WaterRun。

开源视频：[本片源码](https://github.com/Water-Run/ft)。片尾须展示「开源视频」与完整可读的网址 `github.com/Water-Run/ft`。片尾不配旁白；时间线用 `gCredit`（pause 14 s，`credits: true`）保留。

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| DeepSeek V4.1 Flash 1017 | 事实测绘、Web Fetch 来源核对、CPython/Go 实验（01、02）、论文与运行时文档核对、叙事测绘、瑞士风格设计方向（2026-10-18） |
| Claude Fable 5.1 | 复核 McCarthy 脚注出处与 Dijkstra 1978 全文；读 Go、Lua、.NET、PHP、Nim、Java、Zig 的文档与源码；补做实验 03–12；事实编号；中文第 1–7 稿、交审材料、反馈应用 F01–F17；组织三轮对抗审稿（事实审计、目标观众、运行时工程师各由独立的 Claude Fable 5.1 子任务担任）；MiniMax 音色试听（2026-10-19） |
| MiniMax speech-2.8-hd | 音色试听四种候选各三段（`audio/probe/`，不入库）；全片配音待文案确认后进行 |

尚未使用图像生成模型；后续参与者据实追加。网页来源通过 Web Fetch 或 curl 读取原文；PDF 用 pypdf 提取文本核对。

片尾时段与各语言版本的核对结果：未做（没有成片）。

## 复现

```bash
node kit/tools/script-review.js videos/standalone/garbage-collection check  # 核对当前稿本的人工确认
node kit/tools/feedback.js      videos/standalone/garbage-collection check  # 反馈计划
node kit/tools/tts.js    videos/standalone/garbage-collection --lang all     # 合成旁白（MiniMax），更新时间线
node kit/tools/check.js  videos/standalone/garbage-collection                # 制作期总闸门
node kit/tools/audio.js  videos/standalone/garbage-collection --lang all     # 混音
node kit/tools/render.js videos/standalone/garbage-collection --lang all     # 渲染
node kit/tools/finish.js videos/standalone/garbage-collection --lang all     # 封装成片
node kit/tools/covers.js videos/standalone/garbage-collection --lang all     # 封面
node kit/tools/check.js  videos/standalone/garbage-collection --final        # 交付前总闸门
```

## 成片

未做。

## 结尾反馈复盘

<!-- 交付前必填。逐行引用开工表中的同一组编号（F01–F17 及后续新增项），不可只写“全部通过”。注明最终 MP4 的语言、版本或哈希；各项列出实际时间窗口和证据。没有播放/试听的范围保留待复核。 -->

本次核查的最终文件、语言与版本 / SHA-256：无 MP4，全部待成片复核。

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

<!-- 结果使用“已验证 / 已修改待复核 / 待修改 / 待事实核查 / 不适用（原因）”。补记新发现与反馈总账的关联；修改后另存复测，不覆盖历史评分。 -->

## 发布、归档与清理

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
