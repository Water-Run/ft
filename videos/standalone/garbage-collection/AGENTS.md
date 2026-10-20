# 任务入口：制作《垃圾回收的艺术》

> **2026-10-20 仓库重整之后**：本任务书写于旧规则下。冲突时以 `docs/roles.md` 为准——策划者在会话里的明确要求优先；任务书中关于视觉方案、配乐方案、版式的内容只是准备方的建议，制作方可以推翻，并在 README 写一句理由。经验规则改用 `node kit/tools/lessons.js`，复核记录在 `review/lessons.json`。

本片：`videos/standalone/garbage-collection`。

> **状态：文案已确认，待受托方开工。** 中文第 8 稿经策划者 WaterRun 2026-10-20 明确确认（「接受。CSharp是为了配音。就这样落盘吧，我叫Opus开工」）。确认后准备方只做了一次「不改含义的字幕断句」：61 句超宽句拆成 142 句，逐字校验与确认稿一致，当前内容 SHA-256 `11b3303b…`。**旁白文字、章节顺序、标题承诺都不得改动。**

## 1. 要做出什么

一部**中文**科普片《垃圾回收的艺术》，讲内存里的东西怎么知道该不该留、谁来收、代价记在谁头上。成片时长在 `check.duration` 的 400–640 秒之间（按当前稿估算 9 分 26 秒）。

- 语言：中文一種。片尾名单与旁白都是中文。
- 规格：1920×1080、60 帧/秒，字幕内嵌在画面里，另有外挂 `.srt`。
- 视觉：瑞士国际主义。**你在这个系统里构图，不要另起一套**（详见 `brief/03-visual.md`）。
- 时长档是定长的：成片时长必须落在 `project.json` 的 `check.duration` 内。

### 这一片的核心问题与七段推进

| 段 | 观众看完这一段要能回答 | 关键内容 |
|---|---|---|
| open | 内存为什么像一张格子纸？程序造对象在做什么？ | 格子纸、每造一个对象占一格、每秒六千七百万个、64 MB 撑不住、换个活法 11 MB、一秒清 136 次、隐形管家是垃圾回收、它难在哪 |
| 01 引用计数 | 引用计数怎么知道该释放了？它的死穴是什么？ | 实时记账、8 字节、计数 1→2→3→2→1、归零即释放、循环引用、拆环器报收 2 个 |
| 02 标记—清扫 | 第二个办法怎么找垃圾？代价是什么？ | 从根出发追踪、走得到才算活、McCarthy 1960 的空闲表、符号位拨成负、一轮要好几秒、Lua 二十万张表、28 MB 掉到 14 MB |
| 03 分代 | 为什么要分代？老对象指着新对象怎么办？ | 1983 利伯曼与休伊特、短命对象占大头、分代与新区、三代 0/1/2、第 0 代收 136 次、卡表 |
| 04 三色与写屏障 | 怎么不停程序地标记？家规是什么？ | 1978 迪杰斯特拉、并发标记、三色白灰黑、黑不能指白、冤杀、涂灰、写屏障、Lua 注释铁律、419 步、增量、G1 并发、.NET 卡表的四条指令 |
| 05 谁来买单 | 这些精妙不免费，账记在谁头上？ | 收得越勤 CPU 越旺、Nim 自己挑、ARC 环永远不释放、Rust 所有权、C 与 Zig 手动 free、两种账单 |
| close | 它到底怎么知道的？ | 它不知道，只是还找不找得到；1960 论文与那条脚注；六十多年 |

**每一段都要有一个说得出名字的主画面**（本片的核心质量要求）：观众看完这一段，闭着眼睛能说出「这一段画的是什么」。最小动作的实现不算主画面。

## 2. 分工

**已经做好，直接用，不要重做：**

| 内容 | 位置 |
|---|---|
| 事实与出处（逐条编号）、12 项实验的回显 | `research/FACTS.md`、`research/lab/` |
| 已确认的中文稿与内容哈希 | `src/js/script.js`（唯一源稿）、`review/script.zh.11b3303b….md`、`review/approval.json` |
| 逐句校对记录、取舍与确认依据 | `review/NOTES.md` |
| 视觉系统：色板、字号阶梯、12 栏网格、部件类名、禁用项 | `src/css/style.css`、`research/STYLE.md` |
| 逐句对应表：每句说完时画面上必须出现的文字 | `expect.zh.json` |
| 场景骨架：七个场景各一个文件，场景号与顺序已定 | `src/js/scenes/s0_open.js` … `s6_close.js`、`src/index.html` |
| 音色试听（六个候选各 4–6 段） | `audio/probe/`（不入库） |
| 配乐的写法 | `tools/music.py`（系列基座） |

**归你做：**

1. **配音**：`node kit/tools/tts.js videos/standalone/garbage-collection --lang zh`。音色与语速已定（`project.json` 的 `tts`：`Chinese (Mandarin)_Sweet_Lady`，语速 1.0）。本机已缓存 129/142 句，工具会跳过已合成的。
2. **关键帧**：`src/design/keyframes.html`（三到四张静态版面）与 `src/design/scene-demo.js`（一段十来秒的示范场景）。做两到三个方向，按 `docs/standards.md` 自评后选定一个。**准备方不预置版面样张，这是你的活。**
3. **分镜细化**：`brief/storyboard-detail.md`，每句一行：画面上有什么、从哪来、怎么动、镜头在哪、什么音效。
4. **常驻元素**：`src/js/config.js` 的 `chrome()`（章节卡、角标、进度、秒尺与剩余秒数）。常驻元素的位置与做法按系列约定，不改。
5. **场景实现**：`src/js/scenes/` 里把七个骨架写实。镜头用 `makeCamera`，元素入场用 `slam`/`slide`/`appear`/`typeText`，关键动作登记 `sfx`。
6. **声音编排**：关键动作的音效、混音、试听片。配乐按 `brief/05-motion-sound.md`。
7. **封面**：16:9 与 4:3 各一版，另出 2 倍像素的 PNG。
8. **渲染、封装、成片后的三项审查**（事实、读音与节奏、旁白与画面对应）。
9. **交付说明 `DELIVERY.md`**，并把复核结论写进 `research/FACTS.md` 的「复核」一节；写好本片 `README.md` 的成片与结尾反馈复盘。

## 3. 阅读顺序

| 顺序 | 文件 | 内容 |
|---|---|---|
| 1 | 本文件 | 任务、分工、步骤、铁律、完成的定义 |
| 2 | `brief/01-mission.md` | 主题、结构表、开工反馈应用表、质量要求、术语写法、交付物 |
| 3 | 仓库 `docs/standards.md`、`docs/log/feedback.md` | 质量硬标准与反馈总账（本片要处理的问题编号在 brief/01） |
| 4 | `research/FACTS.md` | 每句话的事实依据，编号对应 `script.js` 的 `facts` 字段 |
| 5 | `review/NOTES.md` | 校对记录、术语表、取舍、确认依据 |
| 6 | `brief/02-script.md` | 旁白全文的取用方式；哪些能调、哪些不能改 |
| 7 | `brief/03-visual.md` | 视觉系统与版式规则 |
| 8 | `brief/04-storyboard.md` | 逐场景：要让观众明白什么、每句对应画面上的什么 |
| 9 | 仓库 `docs/guides/scenes.md`、`docs/guides/sound.md`，再读 `brief/05-motion-sound.md` | 镜头、动作、音效、配乐的通用规则与本片特别规定 |
| 10 | 仓库 `docs/reference/tools.md`、`docs/reference/engine.md`、`docs/reference/pitfalls.md` | 工具与引擎用法、已知的坑 |
| 11 | 仓库 `docs/guides/acceptance.md`，再读 `brief/06-acceptance.md` | 验收闸门、三项审查、交付说明的写法 |
| 12 | `src/design/` | 你做的关键帧与示范场景（准备方只留了说明） |

## 4. 环境

- 工作目录是仓库根目录；本片在 `videos/standalone/garbage-collection`。所有命令形如 `node kit/tools/<工具>.js videos/standalone/garbage-collection [参数…]`，在任何系统的任何 shell 里用法相同。
- 开工前运行 `node kit/tools/doctor.js videos/standalone/garbage-collection`，确认环境可用。**不要用本机路径当文件名或画面内容**。
- 只在本片目录内读写。不改 `kit/`、`docs/`、别的视频目录；不改本片的 `src/js/engine.js`、`util.js`、`boot.js`、`css/base.css`。
- 不要启动常驻的本地服务器：每个工具自己起临时服务器，用完即关。

**你很可能不能看图。** 不要假设自己看过画面，也不要在说明里写「画面看起来……」。判断画面靠工具的文字输出：`look.js` 列出某一时刻画面上每个可见元素的位置、字号、颜色、文字；`scan.js` 扫全片。环境确实能读图片时，`shots/` 下的截图可以作为补充。

## 5. 工作步骤

按顺序做。每一步结束时运行所列命令，结果符合「过关条件」再往下走。下表里的 `V` 指 `videos/standalone/garbage-collection`。

| 步 | 做什么 | 命令 | 过关条件 |
|---|---|---|---|
| 0 | 复查环境与时间线 | `node kit/tools/doctor.js V`<br>`node kit/tools/timeline.js V` | 环境可用；打印出总长与每句起止 |
| 1 | 读完范例与素材 | `node kit/tools/look.js V o1` | 看懂 `look.js` 每一列的含义 |
| 2 | 配音 | `node kit/tools/tts.js V --lang zh`<br>`node kit/tools/asr.js V --lang zh` | 142 句全部合成；ASR 标出的存疑读音逐句听过后改（ASR 只作筛查，不代替人耳） |
| 3 | 写分镜细化 | — | `brief/storyboard-detail.md` 每句一行：画面上有什么、从哪来、怎么动、镜头在哪、什么音效 |
| 4 | 做关键帧（2–3 个方向）并自评选定 | `node kit/tools/look.js V --url "/src/design/keyframes.html?k=1" --size 1920x1080` | 三到四张版面读得清；对照 `docs/standards.md` 自评后选定一个方向，在 `README.md` 写明选了什么、为什么 |
| 5 | 写一段示范场景 | `node kit/tools/look.js V --scene demo`<br>`node kit/tools/scan.js V --from <起> --to <止>` | 运动中的可读性过关；错误为 0 |
| 6 | 实现常驻元素 | `node kit/tools/look.js V <章节卡出现的时刻…>` | 章节卡、角标在文字输出里可见，没有 ✗ |
| 7 | 逐个实现场景 | 每写完一个场景：<br>`node kit/tools/look.js V --scene <场景号>`<br>`node kit/tools/scan.js V --from <起> --to <止>` | 该场景范围内错误为 0 |
| 8 | 全片自检 | `node kit/tools/check.js V` | 「全部通过」 |
| 9 | 混音与读音核对 | `node kit/tools/audio.js V --lang zh`<br>`node kit/tools/asr.js V --lang zh` | 混音成功；逐句「听到」与「合成」一致（同音字不算错） |
| 10 | 低清预演，查像素级静止 | `node kit/tools/preview.js V --lang zh` | 没有超过限值的静止段 |
| 11 | 封面 | 写 `src/cover.html`<br>`node kit/tools/look.js V --url "/cover.html?r=169&lang=zh" --size 1920x1080`<br>`node kit/tools/look.js V --url "/cover.html?r=43&lang=zh" --size 1600x1200`<br>`node kit/tools/covers.js V --lang zh` | 两版无 ✗；`out/` 下每种语言有 2 张 JPG、2 张 PNG |
| 12 | 渲染与封装 | `node kit/tools/render.js V --lang zh`（不要中断）<br>`node kit/tools/finish.js V --lang zh` | 日志末行有 `verified frames=`；时长与时间线一致；响度在范围内 |
| 13 | 试听片 | `node kit/tools/audio.js V --lang zh music=<另一种> out=audio_b.wav`<br>`node kit/tools/finish.js V --lang zh --audio out/zh/audio_b.wav --name <名字>`<br>`node kit/tools/audio.js V --lang zh`（把正式混音恢复为默认） | 试听片存在 |
| 14 | 三项核心审查、原创与动画完成度、片尾名单及同编号反馈复盘（`docs/guides/acceptance.md` 第 5 节） | `node kit/tools/sheets.js V cue`<br>`node kit/tools/sheets.js V every 4` | 各项检查完成，无未解决的问题；反馈表附成片时间、证据、结果与遗留项；结论写进 `README.md`、`DELIVERY.md`，事实复核写入 `research/FACTS.md` |
| 15 | 交付前总检 | `node kit/tools/check.js V --final` | 「全部通过」 |

改过任何场景、样式或脚本之后，已有的渲染结果就过期了，必须重新执行第 12 步及之后的步骤（`check.js --final` 会查这一点）。

## 6. 铁律

违反任何一条，成片都不合格。

1. **事实只来自 `research/FACTS.md`。** 画面上的数字、代码、终端回显、引文必须与它逐字一致。不知道的不写，不凭记忆补充。
2. **画面只由时间 t 决定。** 不用 CSS `transition` / `animation`、定时器、`tl.call()`、时间线回调、未固定种子的随机数。原因：渲染是多个浏览器各渲一段并行出帧，任何依赖「播放历史」的状态都会在片段接缝处出错。
3. **时间点写成 `T(句号, 词)`，不写死秒数。** 旁白改了画面才能自动跟着走。
4. **只用本片的视觉系统。** 颜色用 `src/css/style.css` 里的变量；字体只用 Sans SC / Inter / Mono；`brief/03-visual.md` 禁用的做法一处都不要出现。闸门会按字面比对色板、渐变、阴影、圆角与系统字体名。
5. **动画精美精良。** 任意 3 秒内必须有观众能感知的画面变化；每个场景都有镜头运动。按 `docs/standards.md` 第 3 节打磨构图、缓动、落点与转场，检查运动中的可读性；不能只以通过静止检测为准。**每一章要有一个说得出名字的主画面。**
6. **声音服务于内容。** 为有语义的关键动作配音效，慢移与阅读保持可以无声；不用默认气流声填满动作。
7. **不泄露本机信息。** 画面、封面、说明里不出现主机名、用户名、内网地址或演示目录以外的本机路径。
8. **不谎报。** `DELIVERY.md` 里只写实际运行过的命令和实际得到的输出；没做的写「未做」，没通过的写「未通过」并附上工具输出。听不到声音、看不到画面，这两件事如实写明，留给人判断。
9. **不为过关而改规则。** 不修改 `kit/` 下的工具，不放宽 `project.json` 的 `check` 段，不删改 `expect.zh.json` 的条目。
10. **不直接抄袭现成产品。** 参考来源与独立设计选择写进 README，不照搬文案、分镜、构图与动效。
11. **片尾名单完整。** 列出策划者 WaterRun 与**全部实际参与模型**及分工：DeepSeek V4.1 Flash 1017、Claude Fable 5.1、Gemini 4 Argon（网页端）、MiniMax M3.1 Flash（准备方辅助）、MiniMax speech-2.8-hd（配音）、Claude Opus 5.5（你）。名单以 `research/FACTS.md` 的「制作署名」为准，不猜版本、不虚构参与者。
12. **片尾展示开源链接。** 展示「开源视频」与完整可读的 `github.com/Water-Run/ft`，与 `FACTS.md`、README、`DELIVERY.md` 一致。
13. **开工和结尾都复盘反馈。** 结尾用开工表里的同一组编号写成片时间、证据、结果与遗留项；只改源码、文档或通过自动闸门不能记为成片已验证。新增共性问题列在你的交付记录里，由准备方回填总账。

## 7. 遇到问题时

- 工具报错：先读报错和 `docs/reference/pitfalls.md`，自己解决后继续。
- 闸门不过：按 `docs/guides/acceptance.md` 里该项的处理办法改画面，不改规则。
- 需要取舍（例如某句画面放不下全部内容）：自己做决定，优先保证事实正确与可读，把决定和理由记进 `DELIVERY.md` 的「取舍」一节。
- 只有两种情况停下来报告：工具本身有缺陷导致无法继续（说明复现步骤）；发现 `research/FACTS.md` 或旁白里有事实错误（说明依据）。

## 8. 完成的定义

`node kit/tools/check.js videos/standalone/garbage-collection --final` 输出「全部通过」，`docs/guides/acceptance.md` 第 5 节的各项检查已完成且无未解决的问题，并且 `DELIVERY.md`、`research/FACTS.md` 的「制作署名」与「复核」两节、本片的 `README.md` 都已写好。开工反馈表的每个编号已有结尾对应记录、成片时间与证据，未检查和不适用项如实说明。未经目视的观感如实记为待复核，不能据此宣称已全部验收。

然后用几句话汇报：成片位置、时长、闸门结果、审查与片尾核对结果、反馈处理和遗留问题、需要人来判断的事项（配乐听感、音色、画面观感）。
