# 工具速查

工具都在 `kit/tools/`，用 Node 运行，在 Windows、Linux、macOS 的任何 shell 里用法相同：

```bash
node kit/tools/<工具>.js <视频目录> [参数…]
```

- `<视频目录>` 是含 `project.json` 的那一层，例如 `videos/standalone/luainstaller`。先 `cd` 进视频目录（或它的子目录）时可以省略。
- `--lang zh`、`--lang en`、`--lang zh,en`、`--lang all` 指定语言。省略时：出产物的工具处理全部语言，看画面的工具只看第一种语言（下表「语言」一栏）。
- 每个工具开头的注释是它的完整用法。工具各自起临时的本地服务器，用完即关，不需要也不应该另外启动常驻的服务器。
- 混音、配音、回听等几个工具的核心是 Python 脚本，由同名的 Node 工具调用，不直接运行。

## 1. 一览

| 工具 | 作用 | 语言 | 大致耗时 |
|---|---|---|---|
| `new.js <位置>` | 新建一部视频并登记片单 | — | 瞬间 |
| `doctor.js [视频]` | 环境自检；`--clean` 清理残留的浏览器临时目录 | — | 几秒 |
| `assets.js` | 核对字体与语音识别模型；`--fetch` 下载 | — | 视网络 |
| `catalog.js` | 核对片单并生成 `docs/catalog.md` 与各系列说明的分集表；`--check` 只核对 | — | 瞬间 |
| `tts.js` | 合成旁白，写 `timing.<语言>.js`，打印时间线 | 全部 | 有缓存时几秒 |
| `tts_probe.js "写法一" "写法二"` | 读法试验：各合成一句并回听 | 第一种 | 约半分钟 |
| `timeline.js [句号…]` | 打印时间线；带句号时列出词边界 | 第一种 | 瞬间 |
| `stats.js` | 语速与停顿统计 | 全部 | 瞬间 |
| `look.js <时刻…>` | 用文字看画面，并存截图 | 第一种 | 每次约 5 秒 |
| `sheets.js cue` / `every N` / `at <时刻…>` | 把若干时刻的画面拼成总览图 | 第一种 | 约 20 秒 |
| `scan.js` | 扫全片：版面、空屏、静止、确定性、逐句对应 | 第一种 | 8 分钟的片子约半分钟 |
| `check.js` | 总闸门；`--final` 交付前；`--handoff` 委托交接前 | 全部 | 约 1–2 分钟 |
| `margin.js` | 按像素量每句画面的外接范围，列出贴边的句子 | 第一种 | 约半分钟 |
| `audio.js [键=值…]` | 混音并做数值自检 | 全部 | 8 分钟的片子每种语言约 1 分钟 |
| `asr.js` | 语音识别回听旁白，逐句对照 | 全部 | 每种语言约 1–2 分钟 |
| `preview.js` | 低清预演与像素级静止检测 | 第一种 | 约 1–2 分钟 |
| `render.js` | 正式渲染成无声画面 | 全部 | 见下 |
| `finish.js` | 响度处理、封装、字幕、成片检查 | 全部 | 每种语言约 1 分钟 |
| `covers.js` | 出各语言的两版封面 | 全部 | 约 15 秒 |
| `remote.js push` / `run` / `pull` / `sh` | 两台机器分工时的同步与远程执行 | — | — |
| `pngprobe.js <起> <止> [步长]` | 诊断：找出截图像素格式发生变化的时刻 | 第一种 | — |
| `glprobe.js` | 探测无头浏览器的 WebGL 能力 | — | 几秒 |

渲染的耗时取决于片长、页面的复杂程度、运动模糊与机器。一台 32 线程的机器、9 路并行、不开运动模糊时，每秒约 25–100 帧，8 分钟的片子约 5–20 分钟；`mb: 8` 时同样的片子约 35 分钟。画面里有大幅 canvas、模糊滤镜或大倍率缩放的段落更慢。

## 2. 时刻的写法

`look.js`、`sheets.js at` 接受同一套写法：

| 写法 | 含义 |
|---|---|
| `12.5` | 第 12.5 秒 |
| `a3` | 句 a3 说完的那一刻（结束前 0.05 秒） |
| `a3:0.5` | a3 进行到一半（0 是刚开始，1 是说完） |
| `a3+1.2` | a3 开始后 1.2 秒 |
| `a3e-0.3` | a3 结束前 0.3 秒 |
| `--scene s3 [步长]` | 沿场景 s3 每隔若干秒（缺省 2 秒） |
| `--every 4` | 沿全片每 4 秒 |

## 3. 读懂 `look.js` 的输出

```
■ t=92.35s  场景 what  旁白 a6  句 a6 说完时：运行它的机器，不需要安装 Lua   截图 shots/zh_0092.35.png
  [文字] x=  120 y=  565 w=  182 h=  50  37.9px #F3F2ED  「$ lua -v」  <.ln> @sc-what
  [文字] x=  120 y=  626 w=  638 h=  50  37.9px #F3F2ED@0.58  「bash: lua: command not found」  <.ln.o.d> @sc-what
  [色块] x= 1714 y=   56 w=  112 h= 112  底色 #000080  <.abs> @sc-how
  [绘图] x=    0 y=    0 w= 1920 h=1080  SVG（12 个可见形状），内容看截图  <svg> @sc-what
  [字幕] 「运行它的机器，不需要安装 Lua」
  问题：无
  提示（特写时边缘的次要文字被切属正常；这一刻旁白讲的主体内容不能被切）：
   ! 文字被画面边缘切掉 「…」 位置 x=1559 y=250 w=608 h=64
```

- 每行一个**此刻真正可见**的元素；不可见的、完全在画外的、被 `clip-path` 完全裁掉的不列。顺序是绘制顺序：后面的盖在前面的上面。
- 四种项：`[文字]` 带文字的元素（整行算一项）；`[色块]` 有不透明底色的元素；`[图形]` 带 `data-name` 的元素；`[绘图]` 一块 SVG 或 canvas——里面画了什么文字规则看不见，要看截图。
- `x y w h` 是元素在画面上的最终位置与大小，已经算上镜头的平移和缩放。画面是 1920×1080，`y ≥ 968` 是字幕条。文字项量的是字本身占的范围。
- 字号是变换后的实际大小；颜色后面的 `@0.58` 是颜色自带的透明度；`不透明度 0.4` 表示正在淡入淡出途中；`被裁:R` 表示右侧被切（L 左、T 上、B 下）。
- `<.ln.o>` 是类名；有 `data-name` 的显示它的值。`@sc-what` 是所属场景，`@hud` 是常驻层。
- 「问题」是这一帧的硬问题（重叠、字号过小、对比度不足）；「提示」是特写时可能正常的情形。

其他用法：

```bash
node kit/tools/look.js <视频> a3 --lang en               # 换语言
node kit/tools/look.js <视频> a3 --brief                 # 只列问题与截图位置
node kit/tools/look.js <视频> a3 --scale 0.5             # 存半尺寸的截图
node kit/tools/look.js <视频> --url "/cover.html?r=169&lang=zh" --size 1920x1080   # 看封面或任意静态页
```

## 4. `project.json`

每部视频一份。除 `slug` 与 `languages` 外都可省略。

```json
{
  "slug": "luainstaller",
  "languages": ["zh", "en"],
  "titles":      { "zh": "…", "en": "…" },
  "voices":      { "zh": "zh-CN-YunyangNeural", "en": "en-US-AndrewNeural" },
  "rates":       { "zh": "+5%", "en": "+6%" },
  "asr_prompts": { "zh": "以下是普通话的讲解，介绍……", "en": "A narration about …" },
  "production":  { "mode": "self", "maker": "…" },
  "render": { "fps": 60, "mb": 8 },
  "audio":  { "music": "score", "music_db": -13, "duck_db": 8, "sfx_db": -8, "score": { … } },
  "check":  { … }
}
```

| 字段 | 含义 |
|---|---|
| `slug` | 成片文件名的前缀，与目录名一致 |
| `languages` | 语言列表，第一种是主语言 |
| `titles` | 各语言的标题，写进成片的元数据 |
| `voices`、`rates` | 各语言的音色与语速 |
| `asr_prompts` | 给语音识别的提示：一句话说明内容并带上术语的正确拼写，回听时识别得更准 |
| `production` | 制作方式：`mode` 为 `self` 或 `delegated`；`maker` 制作者；委托时 `prepared_by` 准备方 |
| `render` | `fps`（60）、`mb` 运动模糊的子帧数（1 为不开）、`shutter` 快门开角（0.5）、`crf`（15）、`gpu`（WebGL 场景设 1） |
| `audio` | 见 [sound.md](sound.md) 第 4 节 |
| `check` | 见下 |

单语言的旧写法（`title`、`voice`、`rate`、`asr_prompt`）也认。

### `check` 段

| 字段 | 含义 | 缺省 |
|---|---|---|
| `duration` | 总长的允许范围 `[最短, 最长]`（秒）；可按语言写成 `{ "zh": […], "en": […] }` | 不查 |
| `caption_width` | 字幕一行的宽度上限，按字宽算（汉字 1，其余 0.5）；按语言写 | 中文 26，其他 44 |
| `max_cue_seconds` | 单句旁白的时长上限；0 表示不查 | 6 |
| `min_font` | 画面内最小字号（像素，按变换后的实际大小） | 22 |
| `margin` | 文字离画面左右边缘的最小距离；0 表示不查 | 0（模板设 60） |
| `still_seconds` | 画面多久不变算静止 | 3 |
| `empty_seconds` | 画面多久没有内容算空屏 | 1 |
| `dense` | 同屏文字段数的建议上限 | 16 |
| `camera` | 为真时要求每个场景都用镜头 | 否（模板设为真） |
| `expect` | 逐句对应表的位置，相对视频目录，`<lang>` 换成语言 | `expect.<lang>.json` |
| `levels` | 把某一项检查改成 `error` / `warn` / `off`，例如 `{ "SMALL": "warn" }` | 见 [review.md](review.md) |
| `style` | 风格规则，见下 | 都不开 |
| `sfx` | 音效覆盖率，见 [sound.md](sound.md) 第 1 节 | |
| `pace` | 语速阈值，按语言：`{ "zh": { "fast": 6.3 } }` | 中文 6.3 字/秒，英文 3.6 词/秒 |
| `blank_ignore` | 空画面检查时忽略的区域 `[[x0, y0, x1, y1], …]`，各值是 0–1 的比例。用于常驻角标 | 无 |
| `margin_skip` | 越界自检时略过的句子 `{ 句号: 原因 }`。用于有意出血的画面 | 无 |

脚本自己也可以报时间线问题：`script.js` 的 `layoutScript()` 返回的对象里若有 `problems`（字符串数组），总闸门把它们计入「时长与节奏」。定长的片子用它报「某一场的旁白超出了定点」，做法见 [XX 秒速通首集的 `script.js`](../videos/series/in-seconds/two-factor-auth/src/js/script.js)。

`style`：

| 字段 | 打开后 |
|---|---|
| `flat: true` | 源码里不许出现阴影、渐变、模糊滤镜 |
| `no_radius: true` | 不许用圆角（`50%` 的圆形除外） |
| `palette: ["ECE8DF", …]` | 源码里只许出现这些十六进制颜色，且不许写 `rgb()`、`hsl()` |
| `fonts: ["Sans SC", "Mono"]` | 不许出现系统字体与通用族名 |
| `no_emoji: true` | 不许用 emoji 与装饰符号 |

阈值与规则是这部片子的标准，动笔前定好；不为了通过而事后放宽。

## 5. 视频目录

```
<视频>/
  project.json            配置
  README.md               本片的说明：内容、视觉系统、取证、读法、复现、成片
  src/
    index.html            页面：按顺序加载下面的脚本
    cover.html            封面
    css/base.css          结构性样式（引擎的一部分）
    css/style.css         本片的视觉系统
    js/script.js          旁白脚本
    js/timing.<语言>.js    实测时长（tts.js 生成，入库）
    js/config.js          字体预载、常驻元素、换场
    js/engine.js、util.js、boot.js    引擎的快照
    js/scenes/            场景
    design/               参考关键帧与示范场景（可选）
  research/               FACTS.md、lab/；_src/ 不入库
  tools/                  本片专用的脚本，例如 gen_data.py（可选）
  expect.<语言>.json       逐句对应表（可选）
  AGENTS.md、brief/、DELIVERY.md    委托制作时才有
  audio/<语言>/            旁白音频缓存            ┐
  out/<语言>/              无声画面与各条混音      │ 生成物，
  out/                    成片、字幕、封面         │ 不入库
  shots/                  截图与总览图             │
  build/                  工具的中间数据           ┘
```

## 6. 本机配置

工具按系统的常见位置找 Chrome、ffmpeg、Python。找不到或要指定时，写 `kit/config.local.json`（不入库；样例见 `kit/config.local.example.json`），或用环境变量 `CHROME`、`FFMPEG`、`FFPROBE`、`PYTHON`：

| 字段 | 含义 |
|---|---|
| `chrome`、`ffmpeg`、`ffprobe`、`python` | 可执行文件的位置 |
| `asr_model`、`asr_device` | 语音识别模型的名字（缺省 `fw-small`）与设备（缺省 `cpu`） |
| `hf_endpoint` | 下载模型用的地址，可换成镜像站 |
| `remote` | 渲染机：`{ "ssh": "<ssh 主机别名>", "path": "<渲染机上仓库的路径>" }` |

ffmpeg 也可以放在 `assets/ffmpeg/bin/` 下。

## 7. 两台机器分工：`remote.js`

在一台机器上写代码、看帧、扫描，在另一台（渲染机）上配音、混音、渲染时用。两边各有一份仓库；配置好 `remote` 之后：

```bash
node kit/tools/remote.js push                          # 把工作树同步过去（已跟踪与未被忽略的文件；本机删掉的在对面也删）
node kit/tools/remote.js run tts <视频>                # 先同步，再在渲染机上运行工具；结束后取回被改写的 timing.<语言>.js
node kit/tools/remote.js run render <视频> --lang zh
node kit/tools/remote.js pull <视频>/out/cover-zh-16x9.jpg <视频>/shots     # 取回生成物
node kit/tools/remote.js sh "<命令>"                   # 在渲染机的仓库目录下执行一条命令
```

同步的是工作树，不是提交：没提交的改动也会过去。生成物与 `assets/`、`node_modules/` 不同步，各留在产生它们的机器上。详见 [environment.md](environment.md)。

## 8. 诊断

| 现象 | 用什么查 |
|---|---|
| 成片比时间线短 | 渲染日志有没有 `verified frames=`；`pngprobe.js <视频> <起> <止>` 找截图格式变化的时刻 |
| 页面没能就绪 | 工具会打印页面日志：脚本报错、资源 404、`T()` 找不到句号 |
| 某一刻画面不对 | `look.js <视频> <时刻>` 看文字描述与截图；在入场时刻前后多取几帧 |
| 想知道某个词何时被读到 | `timeline.js <视频> <句号>` |
| 临时目录越来越大 | `doctor.js --clean`（渲染被强行终止时，浏览器的临时档案目录会留下） |
