# 一个数据库引擎是如何实现的？——Firebird，小众的第三选择

数据库引擎系列第四集。面向写过 SQL、未读过引擎源码的观众，拆解 Firebird 5.0.4 的内部：**为什么同一个引擎既能当服务端，又能整个装进你自己的程序**。本集只做中文，片长 **4–7 分钟**（`check.duration` 设为 240–420 秒），按策划者 2026-10-20 的要求做电子乐配乐、节奏鲜明。

**制作方式：委托。** 准备方（MiniMax M3.1 Flash）做第 0–4 步与交接材料（取证、旁白稿、任务书、素材与约束）；受托方（Claude Opus 5.5）做视觉系统、关键帧、分镜、配乐、场景、封面、渲染与交付。

**受托方是主力**：准备方交付的是**事实与约束**，不是待执行的图纸。准备方不预置版面、类名、构图与曲子——那会替受托模型把设计定死；受托方可以覆盖准备方写的任何方案性内容，只在两条线上不让步：**事实**（与 `research/FACTS.md` 一致）与**闸门阈值**（`project.json` 的 `check` 段）。准备方做的那部分活（跑实验、写字幕稿、填反馈表）是为了**节约受托方的 Token**，受托方直接读结果，不必重做。规则见仓库 `docs/roles.md`。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 [research/FACTS.md](research/FACTS.md)。

## 当前状态与接续

阶段：前期（事实测绘与中文第 1 稿已落盘，任务书已写）。文案：未确认。配音：未合成。场景：未实现。交付：未完成。发布：未发布。归档：未归档。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 2026-10-20 建目录；本机安装 Firebird 5.0.4.1812 并完成九组实验（`research/lab/`）；写 `research/FACTS.md`、`research/sources.json`、`research/STYLE.md`（材料与约束）；写中文第 1 稿（`src/js/script.js`，78 句，估算 381.9 秒）；写 `AGENTS.md` 与 `brief/01…06` 任务书；给十一个场景各写一个骨架；填 `review/lessons.json`（F01–F20） |
| 下一步及依赖 | ① WaterRun 审中文第 1 稿（`review/NOTES.md` 列了 6 个待决问题）；② 确认后准备方试听音色（按 F17 交策划者确认）、合成旁白、补 `expect.zh.json`，跑 `check.js --handoff`；③ 交 Claude Opus 5.5 开工：视觉系统与关键帧 → 分镜细化 → 场景 → 配乐与音效 → 渲染 → 三项审查 → `DELIVERY.md` |
| 当前稿本 / 校对结论 | 见 [review/NOTES.md](review/NOTES.md) 与 `review/approval.json`；approval 为 pending |
| 输出在哪台制作机 | 本机（不含私人主机信息的代号 FT-WS01） |
| 未完成、未检查与阻塞 | 配音音色未试听；视觉系统、关键帧、配乐、场景、封面均未做（归受托方）；成片未出，任何观感结论都没有 |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/database-engines/firebird export
node kit/tools/script-review.js videos/database-engines/firebird check
```

导出的 `review/script.<语言>.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`。具体边界见仓库 `docs/guides/script-review.md`。

**交审材料**：本片主旨与章节安排见下文「叙事与预算」；逐句依据在 `research/FACTS.md`（每条 cue 的 `facts` 字段指向编号）；需要讨论的取舍列在 [review/NOTES.md](review/NOTES.md)。

## 叙事与预算

主问题：Firebird 的引擎为什么能既是服务端、又是嵌入式？这件事在引擎内部是怎么实现的？

全片只回答这一条线。Firebird 的引擎是一个库文件里的引擎；服务端只是一个可选的外壳。这一个形态差别，直接决定了后面四章的机制：数据放在切成页的单个文件里；修改不就地改，而是在页上留副本；每个事务看到自己的一份；事务先写日志再落盘。

| 推进 | 本章要回答什么 | 估算 |
|---|---|---:|
| 开场 | 抛出反直觉的现象：服务端可以整个关掉；点明这是 MySQL 和 PostgreSQL 之外的第三个选择 | 31.4 秒 |
| 01 它从哪里来 | InterBase 的公开源码、2002 年的 1.0、今天的 5.0.4 | 35.4 秒 |
| 02 引擎是库，服务端是壳 | 三个二进制的体积对照；提供程序链 | 54.5 秒 |
| 03 同一个库文件，三种走法 | 远程 / 环回 / 嵌入式；停掉服务端的实测 | 40.7 秒 |
| 04 数据怎么放 | 8192 字节一页、页的十种类型、本片库的 240 页 | 41.0 秒 |
| 05 一次修改 | 一次 UPDATE 让同一行在页上多出一份副本 | 36.1 秒 |
| 06 怎么并发 | 两会话实测：写者未提交时读者仍读到旧值 | 46.1 秒 |
| 07 出错怎么办 | 强制写；Cache Writer 与 Garbage Collector 两个专职角色 | 29.3 秒 |
| 08 Firebird 的回答 | 四个问题的答案；与 MySQL、PostgreSQL 的对照 | 34.4 秒 |
| 下一集 | 三个形态排成一条轴，引出 SQLite | 19.3 秒 |
| 片尾 | 13 秒静默名单 | 13.6 秒 |

当前源稿（第 1 稿）估算 **381.9 秒（6:21）**，落在 240–420 秒区间内。中文各章语速 3.74–4.47 字/秒，最快句 4.86 字/秒，最长句 5.7 秒。

**本片决定不讲的材料**：SQL 的历史与标准沿革、Firebird 5.0 的新特性清单（并行执行、包例程、快照表等）、`GCPolicy` 三种取值的实际差别、行版本头的字段级布局、Firebird 与 PostgreSQL / MySQL / SQLite 的性能比较、Firebird 的商业史细节。理由见 `research/FACTS.md` 第 10 节：这些材料要么与「形态差别」这一主线无关，要么本轮没有逐项核实，不进定稿。

## 承上启下

本集前面是 MySQL（MyISAM、InnoDB）与 PostgreSQL，后面是 SQLite。**承接靠点名、同一条主线、同一批数据这三条线，不用「上一集」串场**：

| 线 | 本片怎么体现 |
|---|---|
| 点名 | 开场 `o5`–`o5a` 点出 MySQL 和 PostgreSQL；收尾 `z7` 说出对照——它们的引擎住在服务端进程里，Firebird 的引擎是库 |
| 同一条主线 | 收尾 `z1`–`z6` 用系列统一的四个问题收束：怎么放 / 怎么找 / 怎么改 / 怎么并发 / 出错怎么办 |
| 同一批数据 | 沿用前三集同一张 `users(id, name, age)` 8 行与 `notes(id, body)` 3 行（alice/bob/carol…） |
| 启下 | `next` 一段把三个形态排成一条轴：服务型 → 库型 → 嵌入型，Firebird 站在中间 |

**不过度的边界**（F10、P16）：不逐集回顾前两集讲了什么；不用「上一期的第一个问题」导航；不做跨引擎的性能比较。事实依据见 `research/FACTS.md` 的 C01–C03。

## 与系列各集的承接（事实依据）

| 编号 | 陈述 | 出处 |
|---|---|---|
| C01 | MySQL 与 PostgreSQL 都是客户端/服务器式的：引擎跑在服务端进程里 | PostgreSQL 18 手册 §18.3 原文；MySQL 一侧用本系列前两集的实测（MyISAM 一集的 `LegacyMySQL55` 服务；InnoDB 一集 SIGKILL `mysqld` 后的崩溃恢复） |
| C02 | SQLite 连服务端形态都不保留：它是链接进程序的库 | sqlite.org 首页首段 |
| C03 | 系列路线：MySQL → PostgreSQL → Firebird 是「服务型」一段，下一段「极小」是 SQLite | 系列说明的「系列路线」表 |

## 开工反馈应用

反馈版本：2026-10-20.2。本片逐项记录在 `review/lessons.json`（含适用性、计划、文案定位与验证办法）；规则来自仓库 `docs/lessons.json`。相关复盘：[2026-10-18 复盘](../../../docs/log/reviews/2026-10-18.md)、[2026-10-09 复盘](../../../docs/log/reviews/2026-10-09.md)，以及 `docs/log/feedback.md` 的 P24–P38。

目标观众已有的知识：写过 SQL、知道表和索引是什么、知道「数据库服务」这个角色；没读过任何引擎源码，不知道页、事务版本、WAL 这些词。

看完应能回答的一个核心问题：Firebird 的引擎为什么能既是服务端又是嵌入式——同一份数据，用三种连接方式读到的为什么是同一份。

逐章怎样推进问题、最后回答什么：开场抛出「服务端可以整个关掉」的现象 → 01 交代对象与来历 → 02–03 给出答案（引擎是库，外壳可选）并用停掉服务端的实测证明 → 04–07 讲这套形态在存储、修改、并发、恢复上的后果 → 08 用系列的四个问题收束并说出与 MySQL、PostgreSQL 的对照 → 下一集引出另一种形态。

| 编号 | 适用性 / 不适用的原因 | 本片计划与正面对照 | 怎样验证 |
|---|---|---|---|
| F01 标题与主问题 | 适用 | 全片只回答「为什么能既是服务端又是嵌入式」。不铺历史、不开选型比较章、不列功能清单、不逐集回顾前两集。postgresql 一集为叙事正面对照。 | 对照开头、各章与结尾，逐章复述得到的答案。 |
| F02 解释步骤与理解负担 | 适用 | 每一步给「输入 → 变化 → 结果」：三个二进制的体积递进、三种连接方式逐步试、一次 UPDATE 前后各拍一次文件快照、两会话的五个时刻。 | 正常速度跟完四段递进；记录每段所需的停留时间。 |
| F03 名称、比较与边界 | 适用 | 「提供程序」第一次出现当场解释；三种连接一次给全；页类型旁白只点四类，其余只上画面；版本与页大小各交代一次。不作性能比较。 | FACTS 的易错项与首现字幕交叉核查。 |
| F04 有效阅读时间（核心） | 适用，**核心** | 关键状态完整出现后按「1.5 秒 + 必要文字字数 ÷ 5 字/秒」留足；三个体积数字必须同屏静止读完；页阵、两个副本、两块读数板各带独立预算；章卡完整稳定阅读不少于 3 秒；片尾 13 秒单独预算。对照 OpenCart 07:12 与 PostgreSQL 10:47 的负例。 | 最终 MP4 逐个量关键状态的「全部到位 → 开始退场」区间，再连续正常速度观看。 |
| F05 动画解释机制 | 适用 | 运动只表达关系，不用整屏刷换面板。 | 逐段写初态、触发、变化、结果；连续检查动作关系。 |
| F06 声音选择与配合 | 适用 | 配乐为电子乐、有节奏感、全片有持续的低音或铺底（P27），且与前三集听得出来；音效少而分明，不铺 whoosh。 | 主混音、无配乐、仅旁白三版连续试听；与 2FA、PostgreSQL 两片并排比较。 |
| F07 隐私与脱敏 | 适用 | 只有合成数据与固定名字；回显里的绝对路径不入库、不入画面；实验口令现场生成，不入库。 | 检查最终 MP4、字幕、封面与入库文件。 |
| F08 最终文件与记录 | 适用 | 交付前用最终 MP4 实测帧率、时长、响度、真峰值并记 SHA-256。 | 最终编码后核 1080p60、时长、响度、真峰值与 SHA-256。 |
| F09 证据与反馈来源 | 适用 | 每句陈述在 FACTS 里有编号与出处，分实验、源码、官方文档三路；只写实测值；未逐字段核实的行版本布局不进片。跨引擎对照的出处单列 C01–C03。 | FACTS 逐条复核；技术表述回到一手出处。 |
| F10 单集独立可懂 | 适用 | 承接靠点名与一条形态轴，不靠回顾前集；各章直接提本章问题；收尾只列系列统一提法。 | 不看前集也能跟完；逐句检查前集引用的必要性。 |
| F11 外文材料的中文解释 | 适用 | inet / xnet / TCP / fdb / UPDATE 后面接中文作用；长英文材料一律不进画面。 | 检查成片里每个外文词旁边都有中文作用。 |
| F12 读音、断句与口播 | 适用 | 读法集中在 SAY 表；年份、版本号、字节数、偏移在 tts 里直接写中文读法；字幕切分不机械决定口播。 | 确认后试听代表段定音色，ASR 筛查后逐段人耳复核。 |
| F13 背景、年代与观看路线 | 适用 | 开场 5 秒用反直觉现象引起注意；第 01 章交代对象、来历与版本；本片路线在 engine–modes 两章建立。 | 首次阅读能复述对象、年代与主线。 |
| F14 片尾署名与旁白分开 | 适用 | 片尾是 13 秒静默 cue（pause、credits:true、无 tts、字幕 null）；名单与链接只在制作说明与 FACTS。 | 检查导出正文与 TTS 输入排除片尾；成片名单可读且无人声朗读。 |
| F15 不写制作者口吻的自我说明 | 适用 | 画面不写「示意」「只列…不列…」这类小字；数字都是实测值，来源只留一行署名；未核实项单列在 FACTS，不进画面。 | 逐屏列出说明性小字，逐条判断去留。 |
| F16 视觉取自讲解对象 | 适用，**本片的硬要求** | 直接取官网火鸟标志的三色（实测）、官网正文墨色与 Heebo 字体；`check.style.palette` 把这套颜色锁死。**具体怎么用、怎么设计，由受托方决定**（见 `brief/03-visual.md`）。postgresql 一集是 F16 的正面对照。 | 成片任取若干帧，不看字幕能否认出是 Firebird；README「视觉材料」逐项列出来源。 |
| F17 配音语气与精神度 | 适用 | 开工配音前先试听候选音色与语速，确认句子有起伏、该强调处有重音、长句不被念平；`project.json` 里的音色是**占位，未经试听**。 | 代表段试听确认再合成全片；成片后连续试听开头、难点段与章间。 |
| F18 动画完成度与视觉冲击 | 适用 | 每章定一个以 Firebird 自己的对象为主角的主画面（要求交给受托方，实现归受托方）。postgresql 一集的「动画简陋」是本条的反面。 | 连续观看每章，指出该章的主画面与动作。 |
| F19 画面缺陷：溢出、压盖与渐变途中的状态 | 适用 | 盯住三处：三个体积数字并排、页类型分布图的页号标注、字节偏移的十六进制视图。反色高亮只改底色不改字色；后到的元素不盖住正在讲的内容；退场交代去向。 | 每个动作前后逐 0.1 秒取帧，专看溢出、压盖、同色与突然消失。 |
| F20 图形承载内容，形式服从功能 | 适用（2026-10-20.2 新增） | 每个图形必须能指出它对应哪一句旁白的哪个对象；形状与颜色的语义表由受托方写进 `brief/storyboard-detail.md` 并全片不换用；不用几何姿态代替因果说明。 | 逐屏列出图形与对应旁白；核对同一形状与颜色是否换过含义；确认图形在被讲到时在场。 |

## 视觉与声音：归受托方

**准备方不预置版面、类名、构图与曲子。** 这里只给「必须用的材料」和「必须满足的要求」，完整方案见 `research/STYLE.md` 与 `brief/`。

| 项 | 取自官方材料 | 用途 |
|---|---|---|
| 主色 | 官网火鸟标志的火焰红 `#EE2B24` | 此刻正在讲的那一样东西 |
| 强调色 | 同标志的火焰金 `#FAAC19` | 读数与强调 |
| 中间调 | 同标志的火焰橙 `#F68A21` | 火焰的第三层 |
| 墨 | 官网样式表的正文色 `#17222b` | 正文与深色底 |
| 字体 | 官网拉丁字体 Heebo（OFL，随片放在 `src/type/`） | 拉丁文字与数字；中文 Sans SC；代码 Mono |
| 语汇 | `isql` 的 `SQL>`、`MON$` 监控表字段、`.fdb` 的页结构、页类型的官方编号与名称 | 终端、页阵、字节视图 |

这些值已锁在 `project.json` 的 `check.style.palette` 与 `src/css/style.css` 的 `:root` 变量里，闸门按字面比对。**怎么用它们由受托方定。**

声音的要求（策划者原话「配乐电子乐，富有节奏感」）：程序合成的电子乐、写到 `tools/music.py`、有明确节拍与律动、全片有持续的低音或铺底（P27）、与前三集听得出来（2FA 120 拍/分纪实、PostgreSQL 72 拍/分工业、InnoDB 持续低频）、关键动作才配音效。详见 `brief/05-motion-sound.md`。

## 取证

事实只来自本片自己的实验与一手材料。完整表格见 [research/FACTS.md](research/FACTS.md)，来源清单见 [research/sources.json](research/sources.json)。

- **环境**：本机安装官方 zip `Firebird-5.0.4.1812-0-windows-x64.zip`（SHA-256 `01e844fce4d5f53272a76205dbc3a1ba4b782ab8e8eadcd808cdbccd9ce13b72`），放在 `research/_src/`（不入库）。服务端 `firebird.exe -p 3051` 独立进程，`firebird.conf` 全部为出厂缺省。
- **源码基线**：FirebirdSQL/firebird 标签 `v5.0.4`（`src/jrd/ods.h` 的页结构与页类型常量）。
- **实验脚本**（`research/lab/`，逐项说明见该目录的 `README.md`）：`01_probe.sql` 运行参数、`03_schema.sql` 系列标准示例表、`04_mvcc.py` 两会话并发、`05_pages.py` 按字节统计页类型、`06_modes.py` 三种连接与停掉服务端的实测、`08_clean_versions.py` 一次 UPDATE 的副本计数、`09_logo_colors.py` 标志配色统计、`10_music_smoke.py` 配乐自检、`11_style_lint.py` 样式 lint。
- **重做一遍**：`pwsh -NoProfile -ExecutionPolicy Bypass -File videos/database-engines/firebird/research/lab/run_lab.ps1`（用 pwsh 7，不用 Windows PowerShell 5.1）。脚本从安装包解压出安装目录、生成实验口令、初始化安全库、依次跑完所有实验，把证据写回 `research/lab/`，结束时停掉服务端。口令与体积大的 `.fdb` 快照都不入库。
- **未入画面**：本机绝对路径、用户名、主机名与实验口令一律不出现在入库文件与画面里；入库的 `.sql` 只留 `__FTLAB_PASSWORD__` 占位符，由脚本替换后写到 `out/lab/` 再执行。

## 读法

送去合成的文本与字幕的差别集中在 `src/js/script.js` 的 SAY 表与各 cue 的 `tts` 字段：

- `Firebird` 读作「Fire bird」；`InterBase` 读作「Inter Base」；`C++` 读作「C 加加」；`firebird.exe` 读作「firebird 点 exe」；`inet` 读作「i net」；`xnet` 读作「x net」；`TCP` 逐字母读；`fdb` 逐字母读；`UPDATE` 读作英文单词。
- 年份、版本号、字节数与偏移在对应 cue 的 `tts` 里直接写成中文读法：「二零零二年三月十一日」「五点零点四」「八千一百九十二字节」「一百九十万零二百五十四字节」。

音色与语速**未定**：`project.json` 暂记 `Chinese (Mandarin)_Male_Announcer`、语速 1.08，只是占位。按 F17 先试听候选再定。

## 制作署名与片尾

策划：WaterRun。

开源视频：[本片源码](https://github.com/Water-Run/ft)。片尾须展示「开源视频」与完整可读的网址。

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| MiniMax M3.1 Flash（会话标识 `minimax-M3.1-Flash-Preview`） | 准备方：事实测绘与本机实验、取证脚本与字节解析、中文文案、任务书与交接材料 |
| Claude Opus 5.5 | 受托方：视觉系统、关键帧与分镜、配乐与音效、场景实现、封面、渲染与交付 |
| MiniMax speech-2.8-hd | 尚未使用；实际合成后按真实分工补记 |

片尾为 13 秒静默 cue（`pause 13`、`credits: true`、无 `tts`、字幕为 `null`），名单与链接只在画面上，不配旁白。配音一行待实际合成后补记。

## 复现

```bash
node kit/tools/script-review.js videos/database-engines/firebird check  # 核对当前稿本的人工确认
node kit/tools/check.js  videos/database-engines/firebird --handoff     # 交接检查
node kit/tools/tts.js    videos/database-engines/firebird --lang zh     # 合成旁白，更新时间线
node kit/tools/check.js  videos/database-engines/firebird                # 制作期总闸门
node kit/tools/audio.js  videos/database-engines/firebird --lang zh     # 混音
node kit/tools/render.js videos/database-engines/firebird --lang zh     # 渲染
node kit/tools/finish.js videos/database-engines/firebird --lang zh     # 封装成片
node kit/tools/covers.js videos/database-engines/firebird --lang zh     # 封面
node kit/tools/check.js  videos/database-engines/firebird --final        # 交付前总闸门
```

## 成片

尚未出片。审查范围、缺陷修正与需要人来判断的事项（配乐听感、音色、画面观感）在成片后补写。

## 结尾反馈复盘

交付前填写。逐行引用开工表的同一组编号（F01–F20），注明最终 MP4 的语言、版本与 SHA-256，各项列出实际时间窗口与证据；没有播放或试听的范围保留待复核。

本次核查的最终文件、语言与版本 / SHA-256：待成片。

| 编号 | 开工计划 → 实际做法 | 成片时间区间、检查方法与证据 | 结果 / 未解决项与下一步 |
|---|---|---|---|
| F01 | | | 待成片 |
| F02 | | | 待成片 |
| F03 | | | 待成片 |
| F04 | | | 待成片 |
| F05 | | | 待成片 |
| F06 | | | 待成片 |
| F07 | | | 待成片 |
| F08 | | | 待成片 |
| F09 | | | 待成片 |
| F10 | | | 待成片 |
| F11 | | | 待成片 |
| F12 | | | 待成片 |
| F13 | | | 待成片 |
| F14 | | | 待成片 |
| F15 | | | 待成片 |
| F16 | | | 待成片 |
| F17 | | | 待成片 |
| F18 | | | 待成片 |
| F19 | | | 待成片 |
| F20 | | | 待成片 |

## 发布、归档与清理

| 项 | 记录 |
|---|---|
| 平台链接、标题、发布时间与时长 | 未发布 |
| 最终文件、语言、规格、SHA-256 | 未成片 |
| 实际 Node、Chrome、ffmpeg、Python 与包版本 | Node v24.21.0；Python 3.14.3（numpy 2.4.6、`fdb` 2.0.4）；ffmpeg/ffprobe 取自 `assets/ffmpeg/bin/`；Firebird 5.0.4.1812；Docker Desktop 29.5.3（一次尝试拉取 Firebird 4.0 镜像，未用上） |
| 归档代号、manifest.json 哈希、校验日期 | 未归档 |
| 备份介质与恢复抽验结果 | 未检查 |
| 清理范围、时间、取证实验资源撤除 | 未清理；实验用的 Firebird 安装目录与库文件在 `research/_src/` 与 `out/lab/`，收尾时按 `docs/guides/release.md` 撤除 |
| 需保留的复盘证据与后续修订 | `research/lab/out_*.txt` 与 `out_*.json` 是本片的事实证据，随归档保留 |

```bash
node kit/tools/clean.js videos/database-engines/firebird   # 只预览，不删除
```
