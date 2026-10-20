# 任务入口：制作《一个数据库引擎是如何实现的？——Firebird，小众的第三选择》

本片：`videos/series/database-engines/firebird`。数据库引擎系列第四集。

> **状态：文案第 1 稿已落盘，待策划者 WaterRun 确认。** 准备方已完成取证、旁白第 1 稿、章节结构与任务书。**开工条件**：策划者确认中文稿 → 准备方补 `expect.zh.json` 并跑 `node kit/tools/check.js videos/series/database-engines/firebird --handoff` → 你开工。
>
> **旁白文字、章节顺序、标题承诺都不得改动。** 需要调整时长只能改停顿与读法。

## 1. 要做出什么

一部**中文**科普片，讲 Firebird 这个数据库引擎的内部实现。成片时长落在 `project.json` 的 `check.duration`（240–420 秒）内；当前稿估算 **375.9 秒（6 分 16 秒）**。

- 语言：中文一种。片尾名单与旁白都是中文。
- 规格：1920×1080、60 帧/秒，字幕内嵌在画面里，另有外挂 `.srt`。
- 主题：**Firebird 的引擎是一个库，服务端只是可选的外壳**。因此它既能当服务端，也能整个装进你自己的程序。
- 视觉：**取自 Firebird 自己的材料**（官网火鸟标志的火焰三色、官网的墨色与 Heebo 字体、isql 的 `SQL>`、`.fdb` 的页结构）——见 `brief/03-visual.md`。**视觉系统、关键帧、分镜细化、各场景、封面都归你做**，准备方只给材料与硬约束。
- 声音：**配乐是电子乐，要有节奏感**（策划者原话）；配乐、音效、混音、试听片归你做。

### 这一片的核心问题与十段推进

| 段 | 观众看完这一段要能回答 | 关键内容 |
|---|---|---|
| open | 有哪种数据库能把服务端整个关掉？ | 服务端可关、库照样读写、引擎住在自己的程序里、Firebird 是 MySQL 和 PostgreSQL 之外的第三个选择 |
| 01 它从哪里来 | 它是什么、从哪来、今天是什么版本？ | 2000 年 Borland 公开源码、同年 Firebird 项目建立、2002 年 3 月 11 日发布 1.0、今天 5.0.4、C++ 重写 |
| 02 引擎是库，服务端是壳 | 「引擎在库里」是什么意思？ | 引擎是库、服务端只转发、三个二进制的体积对照、提供程序链 |
| 03 同一个库文件，三种走法 | 同一个引擎有几种用法？ | 远程 `inet://`、环回 `xnet://`、嵌入式（本地路径）；停掉服务端后只有嵌入式还活着 |
| 04 数据怎么放 | 数据在磁盘上长什么样？ | 一个 `.fdb` 文件、8192 字节一页、页的十种类型、这个库 240 页的分布、事务清单页 |
| 05 一次修改 | 改一行数据，磁盘上发生什么？ | 不就地改；新的一份写上去，旧的一份留在原地；副本由 1 变 2、位置在第 231 页偏移 1,900,254 |
| 06 怎么并发 | 读者会看到哪一份？ | 写者改到 31 未提交时读者仍读到 30；提交后才变 31；行版本；读已提交 + 语句级读一致性；旧副本等回收 |
| 07 出错怎么办 | 崩了怎么不丢数据？ | 强制写开着、事务先写日志再落盘、Cache Writer 与 Garbage Collector 两个专职角色 |
| 08 Firebird 的回答 | 系列的四个问题，本片的答案是什么？ | 怎么放 / 怎么找 / 怎么改 / 怎么并发 / 出错怎么办；**与 MySQL、PostgreSQL 的对照**：它们的引擎住在服务端进程里，Firebird 的引擎是库 |
| next | 下一集看什么？ | SQLite：一个链接进程序的库，连服务端形态都不保留；三个形态排成一条轴（服务型 → 库型 → 嵌入型），Firebird 站在中间 |
| credits | — | 静默片尾 13 秒，名单与开源链接只上画面 |

**每一章都要有一个说得出名字的主画面**（F18）：观众看完这一段，闭着眼睛能说出「这一段画的是什么」。最小动作的实现不算主画面。用哪个对象、怎么动，由你定。

**承上启下**：前面是 MySQL（MyISAM、InnoDB）与 PostgreSQL，后面是 SQLite。**承接要看得出来，但不过度**——靠点名（开场点一次 MySQL 和 PostgreSQL，收尾说出对照）、同一条主线（系列统一的四个问题）、同一批数据（前三集同一张 `users` / `notes`）这三条线。**不要逐集回顾前两集，也不要用「上一期的第一个问题」导航**；没看过前集的观众要从头看懂这一集。详细做法见 `brief/01-mission.md` 第 2.1 节。

## 2. 分工

**已经做好，直接用，不要重做：**

| 内容 | 位置 |
|---|---|
| 事实与出处（逐条编号 T/H/E/D/U/M/W/V/S）、九组实验的回显与字节级证据 | `research/FACTS.md`、`research/sources.json`、`research/lab/` |
| 一键重跑实验的脚本 | `research/lab/run_lab.ps1`（用 pwsh 7 跑；口令现场生成，不入库） |
| 中文第 1 稿（唯一源稿） | `src/js/script.js` |
| 交审导出稿与校对记录 | `review/script.zh.<哈希>.md`、`review/NOTES.md`（含 6 个待策划者拍板的问题） |
| 开工反馈应用 F01–F19 | `review/feedback.json` |
| 视觉材料与硬约束（官方实测色值、字体文件、页面上的真实数值、禁用的做法） | `research/STYLE.md`、`brief/03-visual.md` |
| 场景骨架：十一个场景各一个文件，场景号、章节与顺序已定 | `src/js/scenes/s0_open.js` … `s10_credits.js`、`src/index.html` |
| 调色板与字体（锁在 `project.json` 的 `check` 段，闸门按字面比对） | `project.json`、`src/css/style.css` |
| 逐句对应表 | **文案确认后由准备方补上** `expect.zh.json`（现在稿未确认，句号可能变） |

**归你做：**

1. **视觉系统** `src/css/style.css`：在准备方给的 `:root` 变量与 `@font-face` 之上，建立本片的字号阶梯、版式、部件、图形语言、章节卡、常驻元素。**准备方不预置版面样张，这是你的活。**
2. **关键帧** `src/design/keyframes.html`：三到四张静态版面（标题、信息最密的一屏、图解、章节卡）。做两到三个方向，按 `docs/standards.md` 自评后选定一个。
3. **一段示范场景** `src/design/scene-demo.js`：十来秒，用到镜头、两三种入场动作、打字机、音效登记。它是你自己照着写的范例。
4. **分镜细化** `brief/storyboard-detail.md`：每句一行——画面上有什么、从哪来、怎么动、镜头在哪、什么音效。
5. **场景实现** `src/js/scenes/`：把十一个骨架写实。镜头用 `makeCamera`，元素入场用 `slam` / `slide` / `appear` / `typeText`，关键动作登记 `sfx`。
6. **配音** `node kit/tools/tts.js videos/series/database-engines/firebird --lang zh`。音色待定，按 F17 先试听候选再定；读法在 `script.js` 的 `SAY` 表。
7. **配乐** `tools/music.py`：电子乐、有节奏感、贯穿全片的铺底，写法见 `docs/sound.md` 第 3.1 节。`project.json` 的 `audio.music` 已经指向这个文件。
8. **音效编排、混音、试听片**。
9. **封面** `src/cover.html`（准备方没有预留，请新建）：16:9 与 4:3 各一版，另出 2 倍像素的 PNG。
10. **渲染、封装、成片后的三项审查**（事实、读音与节奏、旁白与画面对应）。
11. **交付说明 `DELIVERY.md`**，把复核结论写进 `research/FACTS.md` 的「复核」一节；写好本片 `README.md` 的成片与结尾反馈复盘。

## 3. 阅读顺序

| 顺序 | 文件 | 内容 |
|---|---|---|
| 1 | 本文件 | 任务、分工、步骤、铁律、完成的定义 |
| 2 | `brief/01-mission.md` | 主题、结构表、开工反馈应用表、质量要求、术语写法、交付物 |
| 3 | 仓库 `docs/standards.md`、`docs/feedback.md` | 质量硬标准与反馈总账（本片要处理的问题编号在 brief/01） |
| 4 | `research/FACTS.md` | 每句话的事实依据，编号对应 `script.js` 的 `facts` 字段 |
| 5 | `review/NOTES.md` | 校对记录、待策划者拍板的问题、确认依据 |
| 6 | `brief/02-script.md` | 旁白全文的取用方式；哪些能调、哪些不能改 |
| 7 | `research/STYLE.md` → `brief/03-visual.md` | 视觉材料与硬约束 → 你要满足的要求 |
| 8 | `brief/04-storyboard.md` | 逐场景：这一段要让观众明白什么 |
| 9 | 仓库 `docs/scenes.md`、`docs/sound.md`，再读 `brief/05-motion-sound.md` | 镜头、动作、音效、配乐的通用规则与本片特别要求 |
| 10 | 仓库 `docs/tools.md`、`docs/engine.md`、`docs/pitfalls.md` | 工具与引擎用法、已知的坑 |
| 11 | 仓库 `docs/review.md`，再读 `brief/06-acceptance.md` | 验收闸门、三项审查、交付说明的写法 |
| 12 | `src/design/` | 你做的关键帧与示范场景 |

## 4. 环境

- 工作目录是仓库根目录；本片在 `videos/series/database-engines/firebird`。所有命令形如 `node kit/tools/<工具>.js videos/series/database-engines/firebird [参数…]`，在任何系统的任何 shell 里用法相同。
- 开工前运行 `node kit/tools/doctor.js videos/series/database-engines/firebird`，确认环境可用。**不要用本机路径当文件名或画面内容。**
- 只在本片目录内读写。不改 `kit/`、`docs/`、别的视频目录；不改本片的 `src/js/engine.js`、`util.js`、`boot.js`、`css/base.css`。
- 不要启动常驻的本地服务器：每个工具自己起临时服务器，用完即关。
- 本片要用的 Firebird 5.0.4 安装包在 `research/_src/fb504/`（不入库）；`research/lab/run_lab.ps1` 能重跑全部实验。**做画面上的数字时以 `research/lab/out_*.txt` 与 `out_*.json` 为准**，不要从记忆里取。

**你很可能不能看图。** 不要假设自己看过画面，也不要在说明里写「画面看起来……」。判断画面靠工具的文字输出：`look.js` 列出某一时刻画面上每个可见元素的位置、字号、颜色、文字；`scan.js` 扫全片。环境确实能读图片时，`shots/` 下的截图可以作为补充。

## 5. 工作步骤

按顺序做。每一步结束时运行所列命令，结果符合「过关条件」再往下走。下表里的 `V` 指 `videos/series/database-engines/firebird`。

| 步 | 做什么 | 命令 | 过关条件 |
|---|---|---|---|
| 0 | 复查环境与时间线 | `node kit/tools/doctor.js V`<br>`node kit/tools/timeline.js V` | 环境可用；打印出总长与每句起止 |
| 1 | 读完范例与素材 | `node kit/tools/look.js V o1` | 看懂 `look.js` 每一列的含义 |
| 2 | 试听音色并定下 | `node kit/tools/tts_probe.js V --lang zh "<写法一>" "<写法二>"` | 三组代表段（`e6`–`e9`、`m2`–`m4`、`c3`–`c6`）听下来语气不塌；把音色与语速写进 `project.json` 的 `tts` |
| 3 | 配音 | `node kit/tools/tts.js V --lang zh`<br>`node kit/tools/asr.js V --lang zh` | 全部句子合成；ASR 标出的存疑读音逐句听过后改（ASR 只作筛查，不代替人耳） |
| 4 | 建视觉系统 | 写 `src/css/style.css`<br>`node kit/tools/look.js V --url "/src/design/keyframes.html?k=1" --size 1920x1080` | 字号阶梯、版式、部件、图形语言定下来；三到四张关键帧读得清；对照 `docs/standards.md` 自评后选定一个方向，在 `README.md` 写明选了什么、为什么 |
| 5 | 写一段示范场景 | `node kit/tools/look.js V --scene demo`<br>`node kit/tools/scan.js V --from <起> --to <止>` | 运动中的可读性过关；错误为 0 |
| 6 | 写分镜细化 | — | `brief/storyboard-detail.md` 每句一行：画面上有什么、从哪来、怎么动、镜头在哪、什么音效 |
| 7 | 逐个实现场景 | 每写完一个场景：<br>`node kit/tools/look.js V --scene <场景号>`<br>`node kit/tools/scan.js V --from <起> --to <止>` | 该场景范围内错误为 0 |
| 8 | 写配乐并混音 | 写 `tools/music.py`<br>`node kit/tools/audio.js V --lang zh` | 混音成功；数值自检（各章配乐电平、低/中/高占比、章节卡处与旁白之下的电平）无削波、压低生效；**听感需人确认，如实写明** |
| 9 | 全片自检 | `node kit/tools/check.js V` | 「全部通过」 |
| 10 | 读音核对 | `node kit/tools/asr.js V --lang zh` | 逐句「听到」与「合成」一致（同音字不算错） |
| 11 | 低清预演，查像素级静止 | `node kit/tools/preview.js V --lang zh` | 没有超过限值的静止段 |
| 12 | 封面 | 写 `src/cover.html`<br>`node kit/tools/look.js V --url "/cover.html?r=169&lang=zh" --size 1920x1080`<br>`node kit/tools/look.js V --url "/cover.html?r=43&lang=zh" --size 1600x1200`<br>`node kit/tools/covers.js V --lang zh` | 两版无 ✗；`out/` 下每种语言有 2 张 JPG、2 张 PNG |
| 13 | 渲染与封装 | `node kit/tools/render.js V --lang zh`（不要中断）<br>`node kit/tools/finish.js V --lang zh` | 日志末行有 `verified frames=`；时长与时间线一致；响度在范围内 |
| 14 | 试听片 | `node kit/tools/audio.js V --lang zh music=<另一种> out=audio_b.wav`<br>`node kit/tools/finish.js V --lang zh --audio out/zh/audio_b.wav --name <名字>`<br>`node kit/tools/audio.js V --lang zh`（把正式混音恢复为默认） | 试听片存在 |
| 15 | 三项核心审查、原创与动画完成度、片尾名单及同编号反馈复盘（`docs/review.md` 第 5 节） | `node kit/tools/sheets.js V cue`<br>`node kit/tools/sheets.js V every 4` | 各项检查完成，无未解决的问题；反馈表附成片时间、证据、结果与遗留项；结论写进 `README.md`、`DELIVERY.md`，事实复核写入 `research/FACTS.md` |
| 16 | 交付前总检 | `node kit/tools/check.js V --final` | 「全部通过」 |

改过任何场景、样式或脚本之后，已有的渲染结果就过期了，必须重新执行第 13 步及之后的步骤（`check.js --final` 会查这一点）。

## 6. 铁律

违反任何一条，成片都不合格。

1. **事实只来自 `research/FACTS.md`。** 画面上的数字、代码、终端回显、引文必须与它逐字一致。不知道的不写，不凭记忆补充。**行版本头的字段级布局没有核实过**——不要画行内每个字节的含义。
2. **画面只由时间 t 决定。** 不用 CSS `transition` / `animation`、定时器、`tl.call()`、时间线回调、未固定种子的随机数。原因：渲染是多个浏览器各渲一段并行出帧，任何依赖「播放历史」的状态都会在片段接缝处出错。
3. **时间点写成 `T(句号, 词)`，不写死秒数。** 旁白改了画面才能自动跟着走。
4. **只用本片的调色板与字体。** 颜色用 `src/css/style.css` 的变量；字体用 Heebo（拉丁）/ Sans SC（中文）/ Mono（代码）。闸门按字面比对色板、渐变、阴影、圆角与系统字体名。
5. **动画精美精良。** 任意 3 秒内必须有观众能感知的画面变化；每个场景都有镜头运动。按 `docs/standards.md` 第 3 节打磨构图、缓动、落点与转场，检查运动中的可读性；不能只以通过静止检测为准。**每一章要有一个说得出名字的主画面。**
6. **不能「刷一下」。** 关键状态完整出现后按「1.5 秒 + 必要文字字数 ÷ 5 字/秒」留足再退场；镜头推近时要看的内容必须在画内。数字与读数出现时镜头停住。
7. **画面上不写说明取舍的小字。** 不出现「示意」「只列常量名不列值」这类标注。
8. **声音服务于内容。** 为有语义的关键动作配音效，慢移与阅读保持可以无声；不用默认气流声填满动作。配乐按 `brief/05-motion-sound.md`：电子乐、有节奏感、贯穿全片的铺底。
9. **不泄露本机信息。** 画面、封面、说明里不出现主机名、用户名、内网地址或演示目录以外的本机路径。实验口令不出现。
10. **不谎报。** `DELIVERY.md` 里只写实际运行过的命令和实际得到的输出；没做的写「未做」，没通过的写「未通过」并附上工具输出。听不到声音、看不到画面，这两件事如实写明，留给人判断。
11. **不为过关而改规则。** 不修改 `kit/` 下的工具，不放宽 `project.json` 的 `check` 段，不删改 `expect.zh.json` 的条目。
12. **不直接抄袭现成产品。** 参考来源与独立设计选择写进 README，不照搬文案、分镜、构图与动效。
13. **片尾名单完整。** 列出策划者 WaterRun 与**全部实际参与模型**及分工：MiniMax M3.1 Flash（准备方：取证、文案、任务书）、Claude Opus 5.5（你）、以及实际用到的语音模型。名单以 `research/FACTS.md` 的「制作署名」为准，不猜版本、不虚构参与者。
14. **片尾展示开源链接。** 展示「开源视频」与完整可读的 `github.com/Water-Run/ft`，与 `FACTS.md`、README、`DELIVERY.md` 一致。
15. **开工和结尾都复盘反馈。** 结尾用开工表里的同一组编号写成片时间、证据、结果与遗留项；只改源码、文档或通过自动闸门不能记为成片已验证。新增共性问题列在你的交付记录里，由准备方回填总账。

## 7. 遇到问题时

- 工具报错：先读报错和 `docs/pitfalls.md`，自己解决后继续。
- 闸门不过：按 `docs/review.md` 里该项的处理办法改画面，不改规则。
- 需要取舍（例如某句画面放不下全部内容）：自己做决定，优先保证事实正确与可读，把决定和理由记进 `DELIVERY.md` 的「取舍」一节。
- 只有两种情况停下来报告：工具本身有缺陷导致无法继续（说明复现步骤）；发现 `research/FACTS.md` 或旁白里有事实错误（说明依据）。

## 8. 完成的定义

`node kit/tools/check.js videos/series/database-engines/firebird --final` 输出「全部通过」，`docs/review.md` 第 5 节的各项检查已完成且无未解决的问题，并且 `DELIVERY.md`、`research/FACTS.md` 的「制作署名」与「复核」两节、本片的 `README.md` 都已写好。开工反馈表的每个编号已有结尾对应记录、成片时间与证据，未检查和不适用项如实说明。未经目视的观感如实记为待复核，不能据此宣称已全部验收。

然后用几句话汇报：成片位置、时长、闸门结果、审查与片尾核对结果、反馈处理和遗留问题、需要人来判断的事项（配乐听感、音色、画面观感）。
