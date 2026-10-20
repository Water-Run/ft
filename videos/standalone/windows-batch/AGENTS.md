# 任务入口：制作科普视频《古代来的 Shell：Windows 批处理（.bat）》

你是这部视频的制作者。读完本文件和 `brief/` 下的六份文件后，直接开工，一直做到成片交付为止；中途不需要等人确认。

## 1. 要做出什么

一部约 3 分 13 秒、1920×1080、60 帧/秒的中文科普视频，带旁白、内嵌字幕、配乐与音效，另有两版投稿封面。

主题有两层，全片都要让观众感到这两层：

1. **复古**：`.bat` 是 1981 年随 IBM PC 出现的东西，它今天的行为里留着软盘时代的做法。
2. **仍在大量使用**：即使有了 PowerShell，批处理没有退场——今天的开发机上有成千个 `.bat` / `.cmd`，旧系统（Windows 7、Server 2008）还在运行，同一个脚本在它们上面照样能跑。

受众是会用电脑、未必写过批处理的人。讲法循序渐进，语气客观克制。

## 2. 分工：哪些已经做好，哪些归你

**已经做好，直接用，不要重做：**

| 内容 | 位置 |
|---|---|
| 事实取证：源码、实验回显、统计、出处 | `research/FACTS.md`、`research/lab/`、`research/src/` |
| 旁白脚本（已定稿、已合成、读音已核对） | `src/js/script.js`、`src/js/timing.js`、`audio/` |
| 视觉系统：颜色、字体、字号阶梯、终端与文件两种部件的样式 | `src/css/style.css`、`brief/03-visual.md` |
| 参考关键帧（4 张静态版面）与一段示范场景 | `src/design/kf.html`、`src/design/example_scene.js` |
| 引擎与全部工具（已在本机实测通过） | `src/js/engine.js`、`src/js/util.js`、`tools/` |
| 每句旁白说完时画面上必须有的文字 | `brief/expect.json` |

**归你做：**

1. 七个场景的分镜细化与实现：`src/js/scenes/s0_open.js` … `s6_end.js`（现在是空壳）。
2. 常驻元素：章节卡、章节角标、进度条（`src/js/config.js` 的 `chrome()`）。
3. 声音编排：给每个可见动作登记音效；混音；出一条复古配乐的试听片。
4. 两版封面：`src/cover.html`。
5. 渲染、封装、成片后的三项审查（事实、读音与节奏、旁白与画面对应）。
6. 交付说明 `DELIVERY.md`，并把复核结论写进 `research/FACTS.md` 的「复核」一节，更新 `README.md`。

## 3. 阅读顺序

| 顺序 | 文件 | 内容 |
|---|---|---|
| 1 | 本文件 | 任务、分工、步骤、铁律 |
| 2 | `brief/01-mission.md` | 主题、受众、质量标准（什么算好，什么是要避开的） |
| 3 | `research/FACTS.md` | 每句话的事实依据，画面可用的原文与数字 |
| 4 | `brief/02-script.md` | 旁白与时间线，能不能改、怎么改 |
| 5 | `brief/03-visual.md` | 视觉系统与版式规则 |
| 6 | `brief/04-storyboard.md` | 逐场景的分镜要求 |
| 7 | `brief/05-motion-sound.md` | 镜头、动作、音效、配乐的规则 |
| 8 | `brief/07-tools.md` | 工具与引擎的用法、已知的坑 |
| 9 | `brief/06-acceptance.md` | 验收闸门、三项审查、交付说明的写法 |
| 10 | `src/design/example_scene.js`、`src/design/kf.html`、`src/css/style.css` | 照着写的范例 |

## 4. 环境

- 这台机器是 Windows 11。项目根目录是 `D:\LLM制视频\bat-video`，所有命令都在项目根目录下执行。
- 所有工具都是 `node tools/<名字>.js`，在 PowerShell、cmd、Git Bash 里用法相同。不需要 WSL，不需要安装任何东西。
- Node、Python（edge-tts、numpy、faster-whisper）、Chrome、ffmpeg、字体都已就位（位置见 `tools/lib.js` 开头）。
- 只在项目目录内读写。不要改 `D:\LLM制视频\` 下的其他项目和 `_shared\`、`node_modules\`。
- 旁白音频已经合成并缓存在 `audio/`；只有改了旁白文本才需要联网重新合成。

**你很可能不能看图。** 不要假设自己看过画面，也不要在说明里写「画面看起来……」。判断画面一律靠工具的文字输出：`node tools/look.js` 把某一时刻画面上每个可见元素的位置、字号、颜色、文字列出来，并指出版面问题；`node tools/scan.js` 扫全片。如果你的环境确实能读图片，`shots/` 下的 PNG 可以作为补充。

## 5. 工作步骤

按顺序做。每一步结束时运行所列命令，结果符合「过关条件」再往下走。

| 步 | 做什么 | 命令 | 过关条件 |
|---|---|---|---|
| 0 | 确认环境与时间线 | `node tools/tts.js`（有缓存，几秒）<br>`node tools/timeline.js` | 打印出总长约 3:13 和每句的起止时刻 |
| 1 | 读懂范例：把示范场景临时接进来看它的文字输出 | 在 `src/index.html` 里把 `js/scenes/s3_s3.js` 那一行换成 `design/example_scene.js`<br>`node tools/look.js --cue c5 c6 c7`<br>`node tools/scan.js --from 94 --to 107` | 看懂输出里每一列的含义；做完把 `index.html` 改回去 |
| 2 | 写分镜细化：`brief/storyboard-detail.md` | — | 每句旁白一行：画面上有什么、从哪来、怎么动、镜头在哪、什么音效。写完再写代码 |
| 3 | 实现常驻元素（`config.js` 的 `chrome()`） | `node tools/look.js 21.3 53.5` | 章节卡、角标、进度条在文字输出里可见，无 ✗ |
| 4 | 逐个实现场景，顺序：s3 → s2 → s4 → s1 → open → s5 → end | 每写完一个场景：<br>`node tools/look.js --scene <id>`<br>`node tools/scan.js --from <起> --to <止>` | 该场景范围内错误为 0 |
| 5 | 全片自检 | `node tools/check.js` | 「全部通过」 |
| 6 | 混音与读音核对 | `node tools/audio.js`<br>`node tools/asr.js` | 混音成功；逐句「听到」与「合成」一致（同音字不算错） |
| 7 | 低清预演，查像素级静止 | `node tools/preview.js` | 没有超过 3 秒的静止段 |
| 8 | 封面 | 写 `src/cover.html`<br>`node tools/look.js --url "/cover.html?r=169" --size 1920x1080`<br>`node tools/look.js --url "/cover.html?r=43" --size 1600x1200`<br>`node tools/covers.js` | 两版无 ✗；`out/` 下有 2 张 JPG、2 张 PNG |
| 9 | 渲染与封装 | `node tools/render.js`（约 3–5 分钟，不要中断）<br>`node tools/finish.js` | 时长与时间线一致；响度 −16±1.5 LUFS；无静止段 |
| 10 | 试听片（复古配乐） | `node tools/audio.js music=chip out=audio_b.wav`<br>`node tools/finish.js --audio out/audio_b.wav --name 试听-复古配乐`<br>`node tools/audio.js`（把正片混音恢复为默认） | `out/试听-复古配乐.mp4` 存在 |
| 11 | 三项审查（见 `brief/06-acceptance.md` 第 3 节），有问题就改、重渲、再查 | `node tools/sheets.js cue`<br>`node tools/sheets.js every 4` | 审查结论写进 `research/FACTS.md` 的「复核」与 `DELIVERY.md` |
| 12 | 交付前总检 | `node tools/check.js --final` | 「全部通过」 |

改过任何场景、样式或脚本之后，已有的 `out/video.mp4` 就过期了，必须重新执行第 9 步及之后的步骤（`check.js --final` 会查这一点）。

## 6. 铁律

违反任何一条，成片都不合格。

1. **事实只来自 `research/FACTS.md`。** 画面上的终端回显、数字、年份、引文必须与它逐字一致。不知道的不写，不要凭记忆补充批处理的历史或细节。早期 DOS 的终端画面必须带「示意」二字。
2. **画面只由时间 t 决定。** 不用 CSS `transition` / `animation`、定时器、`tl.call()`、时间线回调、未固定种子的随机数。原因：渲染是 16 个浏览器各渲一段并行出帧，任何依赖「播放历史」的状态都会在片段接缝处花屏。
3. **时间点写成 `T(句号, 词)`，不写死秒数。** 旁白改了画面才能自动跟着走。
4. **只用 `style.css` 里的颜色变量和四种字体。** 不加渐变、阴影、圆角、模糊、半透明面板、emoji。
5. **不能静。** 任意 3 秒内必须有观众能感知的画面变化（镜头或元素）；每个场景都有镜头运动。
6. **不能只有配音。** 每个可见动作都有音效。
7. **不泄露本机信息。** 画面、封面、说明里不出现主机名、用户名、IP、除 `D:\batlab` 以外的本机路径。
8. **不谎报。** `DELIVERY.md` 里只写你实际运行过的命令和实际得到的输出；没做的写「未做」，没通过的写「未通过」并贴出工具输出。你听不到声音、（很可能）看不到画面，这两件事要如实写明，留给用户判断。

## 7. 遇到问题时

- 工具报错：先读报错和 `brief/07-tools.md` 的「已知的坑」，自己解决后继续。
- 闸门一直不过：按 `brief/06-acceptance.md` 里该项的「处理办法」改，不要通过修改 `tools/` 下的检查脚本、调阈值、删 `brief/expect.json` 的条目来让它通过。
- 需要取舍（例如某句画面放不下全部内容）：自己做决定，优先保证事实正确与可读，把决定和理由记进 `DELIVERY.md` 的「取舍」一节。
- 只有两种情况停下来向用户报告：工具本身有缺陷导致无法继续（说明复现步骤）；发现 `research/FACTS.md` 或旁白里有事实错误（说明依据）。

## 8. 完成的定义

`node tools/check.js --final` 输出「全部通过」，并且 `DELIVERY.md`、`research/FACTS.md` 的「复核」一节、`README.md` 都已写好。然后用几句话向用户汇报：成片位置、时长、闸门结果、需要用户亲自判断的事项（配乐听感、画面观感）。
