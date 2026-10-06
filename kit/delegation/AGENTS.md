# 任务入口：制作《{{TITLE}}》

> **状态：制作中。** 本文件是准备方写给受托模型（{{MAKER}}）的任务入口。交付并验收之后，把这一行改为「已交付（日期）」；此后本文件只作记录，不应据此重新开工。

<!-- 准备方：把带「待填」的部分写完，删掉所有这类注释。写法与要求见仓库的 docs/delegation.md。 -->

读完本文件、`brief/` 下的文件与第 3 节列出的仓库文档后直接开工，一直做到成片交付为止；中途不需要等人确认。

## 1. 要做出什么

<!-- 准备方待填：时长、规格、语言；主题的一两句话（有几层意思就写几层）；受众；讲法与语气。 -->

一部约 X 分 X 秒、1920×1080、60 帧/秒的视频，语言为 {{LANGS}}，带旁白、内嵌字幕、配乐与音效，每种语言另有两版投稿封面。

## 2. 分工

**已经做好，直接用，不要重做：**

| 内容 | 位置 |
|---|---|
| 事实取证：实验回显、源码、统计、出处 | `research/FACTS.md`、`research/lab/` |
| 旁白脚本（已定稿、已合成、读音已核对） | `src/js/script.js`、`src/js/timing.<语言>.js`、`audio/` |
| 视觉系统：颜色、字体、字号阶梯、部件的样式 | `src/css/style.css`、`brief/03-visual.md` |
| 参考关键帧与一段示范场景 | `src/design/` |
| 引擎与工具（已在本机实测通过） | `src/js/engine.js`、`src/js/util.js`、仓库的 `kit/tools/` |
| 每句旁白说完时画面上必须有的文字 | `expect.<语言>.json` |

**归你做：**

1. 各场景的分镜细化与实现：`src/js/scenes/`（现在是空壳或草稿），包括列出策划者 WaterRun 与实际参与模型的片尾名单。
2. 常驻元素：章节卡、角标、进度条（`src/js/config.js` 的 `chrome()`）。
3. 声音编排：给每个可见动作登记音效；混音；按 `brief/05-motion-sound.md` 出试听片。
4. 每种语言的两版封面：`src/cover.html`。
5. 渲染、封装、成片后的三项审查（事实、读音与节奏、旁白与画面对应）。
6. 交付说明 `DELIVERY.md`；把复核结论写进 `research/FACTS.md` 的「复核」一节；写好本片的 `README.md`。

## 3. 阅读顺序

| 顺序 | 文件 | 内容 |
|---|---|---|
| 1 | 本文件 | 任务、分工、步骤、铁律 |
| 2 | `brief/01-mission.md` | 主题、结构、本片的质量要求、交付物 |
| 3 | 仓库 `docs/standards.md` | 质量标准：什么算好，什么要避开 |
| 4 | `research/FACTS.md` | 每句话的事实依据，画面可用的原文与数字 |
| 5 | `brief/02-script.md` | 旁白与时间线；能不能改、怎么改 |
| 6 | `brief/03-visual.md` | 本片的视觉系统与版式规则 |
| 7 | `brief/04-storyboard.md` | 逐场景的分镜要求 |
| 8 | 仓库 `docs/scenes.md`、`docs/sound.md`，再读 `brief/05-motion-sound.md` | 镜头、动作、音效、配乐的通用规则与本片的特别规定 |
| 9 | 仓库 `docs/tools.md`、`docs/engine.md`、`docs/pitfalls.md` | 工具与引擎的用法、已知的坑 |
| 10 | 仓库 `docs/review.md`，再读 `brief/06-acceptance.md` | 验收闸门、三项审查、交付说明的写法 |
| 11 | `src/design/` 下的示范场景与关键帧、`src/css/style.css` | 照着写的范例 |

## 4. 环境

- 工作目录是仓库根目录；本片在 `{{PATH}}`。所有命令形如 `node kit/tools/<工具>.js {{PATH}} [参数…]`，在任何系统的任何 shell 里用法相同。
- 开工前运行 `node kit/tools/doctor.js {{PATH}}`，确认环境可用。
- 只在本片目录内读写。不改 `kit/`、`docs/`、别的视频目录；不改本片的 `src/js/engine.js`、`util.js`、`boot.js`、`css/base.css`。
- 旁白音频已经合成并缓存在 `audio/`；只有改了旁白文本才需要联网重新合成。
- 不要启动常驻的本地服务器：每个工具自己起临时服务器，用完即关。

**你很可能不能看图。** 不要假设自己看过画面，也不要在说明里写「画面看起来……」。判断画面一律靠工具的文字输出：`look.js` 把某一时刻画面上每个可见元素的位置、字号、颜色、文字列出来，并指出版面问题；`scan.js` 扫全片。环境确实能读图片时，`shots/` 下的截图可以作为补充。

## 5. 工作步骤

按顺序做。每一步结束时运行所列命令，结果符合「过关条件」再往下走。下表里的 `V` 代表 `{{PATH}}`。

| 步 | 做什么 | 命令 | 过关条件 |
|---|---|---|---|
| 0 | 确认环境与时间线 | `node kit/tools/doctor.js V`<br>`node kit/tools/tts.js V`（有缓存，几秒）<br>`node kit/tools/timeline.js V` | 环境可用；打印出总长与每句的起止时刻 |
| 1 | 读懂范例：把示范场景临时接进 `src/index.html`，看它的文字输出 | `node kit/tools/look.js V <句号…>`<br>`node kit/tools/scan.js V --from <起> --to <止>` | 看懂输出里每一列的含义；做完把 `index.html` 改回去 |
| 2 | 写分镜细化 `brief/storyboard-detail.md` | — | 每句旁白一行：画面上有什么、从哪来、怎么动、镜头在哪、什么音效。写完再写代码 |
| 3 | 实现常驻元素（`config.js` 的 `chrome()`） | `node kit/tools/look.js V <章节卡出现的时刻…>` | 章节卡、角标在文字输出里可见，没有 ✗ |
| 4 | 逐个实现场景 | 每写完一个场景：<br>`node kit/tools/look.js V --scene <场景号>`<br>`node kit/tools/scan.js V --from <起> --to <止>` | 该场景范围内错误为 0 |
| 5 | 全片自检 | `node kit/tools/check.js V` | 「全部通过」 |
| 6 | 混音与读音核对 | `node kit/tools/audio.js V`<br>`node kit/tools/asr.js V` | 混音成功；逐句「听到」与「合成」一致（同音字不算错） |
| 7 | 低清预演，查像素级静止 | `node kit/tools/preview.js V` | 没有超过限值的静止段 |
| 8 | 封面 | 写 `src/cover.html`<br>`node kit/tools/look.js V --url "/cover.html?r=169&lang={{LANG1}}" --size 1920x1080`<br>`node kit/tools/look.js V --url "/cover.html?r=43&lang={{LANG1}}" --size 1600x1200`<br>`node kit/tools/covers.js V` | 两版无 ✗；`out/` 下每种语言有 2 张 JPG、2 张 PNG |
| 9 | 渲染与封装 | `node kit/tools/render.js V`（不要中断）<br>`node kit/tools/finish.js V` | 日志末行有 `verified frames=`；时长与时间线一致；响度在范围内 |
| 10 | 试听片（按 `brief/05-motion-sound.md` 的要求） | `node kit/tools/audio.js V --lang <语言> music=<另一种> out=audio_b.wav`<br>`node kit/tools/finish.js V --lang <语言> --audio out/<语言>/audio_b.wav --name <名字>`<br>`node kit/tools/audio.js V`（把正式混音恢复为默认） | 试听片存在 |
| 11 | 三项核心审查、原创与动画完成度、片尾名单检查（`docs/review.md` 第 5 节），有问题就改、重渲、再查 | `node kit/tools/sheets.js V cue`<br>`node kit/tools/sheets.js V every 4` | 各项检查完成，无未解决的问题；结论写进 `research/FACTS.md` 的「复核」与 `DELIVERY.md` |
| 12 | 交付前总检 | `node kit/tools/check.js V --final` | 「全部通过」 |

改过任何场景、样式或脚本之后，已有的渲染结果就过期了，必须重新执行第 9 步及之后的步骤（`check.js --final` 会查这一点）。

多语言的片子：场景只写一套，画面里的文字用 `tr('中文', 'English')`，时间点用 `T(句号, { zh: '词', en: 'word' })`；每写完一段，两种语言都要查（`--lang en`）。版面先按较长的那种语言排。

## 6. 铁律

违反任何一条，成片都不合格。

1. **事实只来自 `research/FACTS.md`。** 画面上的终端回显、数字、年份、引文必须与它逐字一致。不知道的不写，不凭记忆补充。重建的旧系统画面必须带「示意」二字。
2. **画面只由时间 t 决定。** 不用 CSS `transition` / `animation`、定时器、`tl.call()`、时间线回调、未固定种子的随机数。原因：渲染是多个浏览器各渲一段并行出帧，任何依赖「播放历史」的状态都会在片段接缝处出错。
3. **时间点写成 `T(句号, 词)`，不写死秒数。** 旁白改了画面才能自动跟着走。
4. **只用本片的视觉系统。** 颜色用 `style.css` 里的变量，字体用规定的几种；`brief/03-visual.md` 禁用的做法一处都不要出现。
5. **动画精美精良。** 任意 3 秒内必须有观众能感知的画面变化；每个场景都有镜头运动。按 `docs/standards.md` 第 3 节打磨构图、缓动、落点与转场，检查运动中的可读性；不能只以通过静止检测为准。
6. **不能只有配音。** 每个可见动作都有音效。
7. **不泄露本机信息。** 画面、封面、说明里不出现主机名、用户名、内网地址、演示目录以外的本机路径。
8. **不谎报。** `DELIVERY.md` 里只写实际运行过的命令和实际得到的输出；没做的写「未做」，没通过的写「未通过」并附上工具输出。听不到声音、看不到画面，这两件事要如实写明，留给人来判断。
9. **不为过关而改规则。** 不修改 `kit/` 下的工具，不放宽 `project.json` 的 `check` 阈值，不删改 `expect.<语言>.json` 的条目。
10. **不直接抄袭现成产品。** 参考来源与独立设计选择写进 README，不照搬文案、分镜、构图与动效；边界见 `docs/standards.md` 第 2 节。
11. **片尾名单完整。** 各语言、各交付视频版本列出策划者 WaterRun 及实际参与模型与分工，包含准备方与受托方；与 `FACTS.md` 的「制作署名」、README、`DELIVERY.md` 一致且可读。不猜测模型版本，不虚构参与者。
12. **片尾展示开源视频链接。** 各语言、各交付视频版本展示「开源视频」（英文 `Open-source video`）与 `github.com/Water-Run/ft`，网址完整可读、留足阅读时间，与 `FACTS.md`、README、`DELIVERY.md` 一致。

## 7. 遇到问题时

- 工具报错：先读报错和 `docs/pitfalls.md`，自己解决后继续。
- 闸门一直不过：按 `docs/review.md` 里该项的处理办法改画面，不改规则。
- 需要取舍（例如某句画面放不下全部内容）：自己做决定，优先保证事实正确与可读，把决定和理由记进 `DELIVERY.md` 的「取舍」一节。
- 只有两种情况停下来报告：工具本身有缺陷导致无法继续（说明复现步骤）；发现 `research/FACTS.md` 或旁白里有事实错误（说明依据）。

## 8. 完成的定义

`node kit/tools/check.js {{PATH}} --final` 输出「全部通过」，`docs/review.md` 第 5 节的各项检查已完成且无未解决的问题，并且 `DELIVERY.md`、`research/FACTS.md` 的「制作署名」与「复核」两节、本片的 `README.md` 都已写好。未经目视的观感如实记为待复核，不能据此宣称已全部验收。然后用几句话汇报：成片位置、时长、闸门结果、审查与片尾核对结果、需要人来判断的事项（配乐听感、画面观感）。
