# 工具速查

工具都在 `kit/tools/`，用 Node 运行，在 Windows、Linux、macOS 的任何 shell 里用法相同：

```bash
node kit/tools/<工具>.js <视频目录> [参数…]
```

- `<视频目录>` 是含 `project.json` 的那一层，例如 `videos/open-source-projects/luainstaller`。先 `cd` 进视频目录（或它的子目录）时可以省略。
- `--lang zh`、`--lang en`、`--lang zh,en`、`--lang all` 指定语言。省略时：出产物的工具处理全部语言，看画面的工具只看第一种语言（下表「语言」一栏）。
- 每个工具开头的注释是它的完整用法。工具各自起临时的本地服务器，用完即关，不需要也不应该另外启动常驻的服务器。
- 配音、读法试听、回听、混音，以及数值、空画面、越界自检的计算部分是 Python 脚本，由对应的 Node 工具调用，不直接运行，对应关系见第 9 节。

## 1. 一览

表中省略 `<视频>`（视频目录形如 `videos/<系列>/<片>`，独立的片子是 `videos/standalone/<片>`）。`new.js`、`catalog.js`、`assets.js`、`remote.js`、`repo-check.js`、`smoke.js`、`media-smoke.js`、`voices.js` 与 `lessons.js show / render` 不针对某一部视频；`doctor.js` 的视频目录可选。`clean.js` 清理时必须明确给出目录，`--verify` 则只接受归档目录；其余工具需要视频目录。

| 工具 | 作用 | 语言 | 大致耗时 |
|---|---|---|---|
| `new.js <片> [--series <系列>]` | 新建并登记片单；计划中且仅有 README 的目录保留简报原文；系列有起点时盖上起点；`--scratch` 在 `out/sandbox/` 练习且不改片单；策划、校对者与仓库取 studio 配置 | — | 瞬间 |
| `doctor.js [视频]` | 完整环境自检；`--visual` 只查 Node、浏览器与字体；只诊断不清理 | — | 几秒 |
| `script-review.js export / check` | 同一源稿导出连贯阅读与逐句校对视图（中文稿附多音字清单）/ 核对内容与人工确认记录，见 [文案校对](../guides/script-review.md) | 导出主语言，检查全部；可用 `--lang` | 瞬间 |
| `lessons.js show [--stage 阶段]` | 打印经验规则；开工前读这一阶段的几条。`render` 重新生成 `docs/lessons.md` | — | 瞬间 |
| `lessons.js <视频> sync / check [--final]` | 把新增或改变的规则带入本片的 `review/lessons.json`；`check --final` 核对每条都有结论 | — | 瞬间 |
| `readable.js [--scene 场景]` | 量每段文字的完整可读时长，对照经验规则 F04 的下限 | 第一种 | 每分钟片长约半分钟 |
| `clean.js <视频>` | 默认预览；`--archive <新目录> --apply` 归档校验后清理；`--verify <归档>` 核对备份 | 全部 | 取决于文件量 |
| `repo-check.js` | 入库边界、根目录、经验规则、依赖锁、npm 命令入口、工具语法、文档登记与链接、视频目录、片单与署名 | — | 几秒 |
| `smoke.js` | 新建隔离练习、导出稿本、打开中英模板截图、核对 GPL 标识可见；不配音 | 中文、英文 | 约十几秒 |
| `media-smoke.js` | 隔离合成短片跑真实渲染、混音、封装和封面，验证文件替换、媒体命令失败、跳过检查、片尾静止会被挡住；需完整媒体环境，不联网配音 | 中文测试夹具 | 约一分钟 |
| `assets.js` | 核对字体与语音识别模型；`--fetch` 下载 | — | 视网络 |
| `catalog.js` | 核对片单并生成 `videos/README.md`、`videos/CREDITS.md` 与各系列说明的分集表；`--check` 只核对 | — | 瞬间 |
| `tts.js` | 合成旁白，写 `timing.<语言>.js`，打印时间线 | 全部 | 有缓存时几秒 |
| `tts_probe.js "写法一" "写法二"` | 读法试验：各合成一句并回听 | 第一种 | 约半分钟 |
| `voices.js [--engine edge,minimax] [--lang zh,en] [--only 字样] [--zip]` | 音色试听库：同一段范例文本用每个可用音色各合成一遍，生成 `out/voices/index.html` 试听页（见 [文案与配音](../guides/script.md) 第 9 节） | — | 有缓存时几秒；全部重合成约十分钟 |
| `timeline.js [句号…]` | 打印时间线；带句号时列出词边界 | 第一种 | 瞬间 |
| `stats.js` | 语速与停顿统计 | 全部 | 瞬间 |
| `look.js <时刻…>` | 用文字看画面，并存截图 | 第一种 | 每次约 5 秒 |
| `sheets.js cue` / `every N` / `at <时刻…>` | 把若干时刻的画面拼成总览图 | 第一种 | 约 20 秒 |
| `scan.js` | 扫全片：版面、空屏、静止、停留时的镜头缩放、确定性、逐句对应、术语注解 | 第一种 | 8 分钟的片子约半分钟 |
| `check.js` | 总闸门；`--final` 交付前；`--handoff` 准备方交给制作方之前 | 全部 | 约 1–2 分钟 |
| `margin.js` | 按像素量每句画面的外接范围，列出贴边的句子 | 第一种 | 约半分钟 |
| `audio.js [键=值…]` | 混音并做数值自检 | 全部 | 8 分钟的片子每种语言约 1 分钟 |
| `asr.js` | 语音识别回听旁白，逐句对照 | 全部 | 每种语言约 1–2 分钟 |
| `preview.js [--mix] [--from 秒 --to 秒]` | 有声区间 / 全片预演与像素静止检测；可设 scale、fps、gpu、encoder、workers | 第一种，可指定 all | 依区间与画面复杂度 |
| `render.js` | 正式渲染成无声画面 | 全部 | 见下 |
| `finish.js` | 响度处理、封装、字幕、成片检查 | 全部 | 每种语言约 1 分钟 |
| `covers.js` | 出各语言的两版封面 | 全部 | 约 15 秒 |
| `remote.js push` / `run` / `pull` / `sh` | 两台机器分工时的同步与远程执行 | — | — |
| `pngprobe.js <起> <止> [步长]` | 诊断：找出截图像素格式发生变化的时刻 | 第一种 | — |
| `glprobe.js` | 探测无头浏览器的 WebGL 能力 | — | 几秒 |
| `encoder.js [--encoder auto]` | 实际编码三帧，探测 NVIDIA NVENC 与 CPU 后备；不需要视频目录 | — | 几秒 |
| `gif.js <页面.html>` | 把由 `window.seek(t)` 驱动的页面录成循环 GIF，如根 README 的动图 `docs/media/ft.html`；不需要视频目录 | — | 十几秒 |

渲染的耗时取决于片长、页面的复杂程度、运动模糊与机器。一台 32 线程的机器、9 路并行、不开运动模糊时，每秒约 25–100 帧，8 分钟的片子约 5–20 分钟；`mb: 8` 时同样的片子约 35 分钟。画面里有大幅 canvas、模糊滤镜或大倍率缩放的段落更慢。

### 用显卡出帧与 4K 交付

`render.js` 的 `gpu: 0` 保留 Chrome 自身的默认策略，并不强制软件光栅；近期 Chrome 可能已经使用显卡。`gpu: 1` 显式启用 GPU / WebGL（Windows 指定 ANGLE D3D11）。跨浏览器、驱动与字体版本仍需验证结果。机器有显卡时，优先按下面步骤实测；不要把某台机器的型号写进片子的配置。

**交付分辨率缺省是 1080p。** 只有策划者为这一部片子明确要求 4K 时才按 4K 交付（第 4 步），并把原话记进本片 README；能用显卡不等于要出 4K。

1. **探测。** `node kit/tools/glprobe.js <视频>`。WebGL 渲染器一栏应是硬件（Windows 上是 ANGLE 加显卡型号）；出现 SwiftShader 表示 WebGL 使用软件路径。此项只证明 WebGL 的设备，不代表所有 DOM、Canvas、滤镜都由 GPU 计算；两种模式都显示同一显卡也可能是正常的。
2. **对比一小段。** 挑画面最重的二三十秒，用 `--from`、`--to`、`--out` 出两段：一段缺省，一段加 `--gpu 1`。比较耗时，再用 ffmpeg 的 `ssim` 滤镜比较两段画面，整体 SSIM 在 0.999 以上视为一致。
3. **整片用显卡。** `project.json` 的 `render` 段写 `"gpu": 1`，或在命令行加 `--gpu 1`。低清预演（`preview.js`）也随之用显卡。
4. **按 4K 交付（只在策划者明确要求时）。** `render` 段再写 `"scale": 2`。4K 出帧比 1080p 慢约 2.3 倍，可用内存也少一半（见下表），没有显卡的机器不要出 4K。舞台、坐标与字号照旧按 1920×1080 写，渲染时整体放大一倍；成片名变成 `<slug>-<语言>-2160p60.mp4`，`check.js --final` 按 `scale` 核对成片的分辨率、文件名，以及 `out/<语言>/video.json` 记下的渲染倍数。一部片子的各种语言用同一个倍数；中途改了 `scale`，全部语言都要重新渲染。不写 `scale` 的片子照旧按 1080p 交付。

`--gpu 1` 只控制浏览器出帧；视频编码另由 `--encoder` 选择。截图仍逐张经调试协议传回，PNG 解码、颜色转换和运动模糊也有 CPU 成本，不能把启用显卡当作端到端提速的证据。

### 硬件编码

```bash
node kit/tools/encoder.js                          # 实际探测，NVENC 失败则试 CPU
node kit/tools/render.js <视频> --lang zh --gpu 1 --encoder auto --workers 2
```

| 参数 / `render` 字段 | 含义 |
|---|---|
| `encoder` | `libx264`（兼容缺省）、`h264_nvenc`（NVIDIA）或 `auto`（实测后选择 NVENC / CPU）；显式指定后端失败即报错 |
| `crf` | libx264 的质量参数，缺省 15 |
| `cq` | NVENC 的质量参数，缺省 19，使用 p5 / hq / vbr；与相同数字的 CRF 不等价 |
| `workers` | 软件编码按 CPU 与可用内存估算；硬件编码未指定时至多两路，避免显存与编码会话争抢 |

编码探测以目标尺寸实际编码三帧，不只看 `ffmpeg -encoders`。`auto` 仅在开工探测失败时回退；渲染中编码失败仍报错，不在各段间混用编码器。可先用 `--encoder h264_nvenc` 显式确认硬件路径；其他厂商目前使用 libx264。参数依据：[NVIDIA FFmpeg 指南](https://docs.nvidia.com/video-technologies/video-codec-sdk/13.0/ffmpeg-with-nvidia-gpu/index.html)、[FFmpeg NVENC 实现](https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_h264.c)。

按同一段、同一语言、相同 fps / scale / mb / workers 分别测浏览器默认模式、显式 GPU 模式、显式 GPU 加 NVENC。短片段用 `--out out/<语言>/bench-<后端>.mp4`，附带的 `.mp4.json` 记录源码、实际编码器、帧数、耗时与校验和；正式片仍写 `video.json`。比较总耗时和文件大小，同时看小字、细线、渐变与快速运动。浏览器路径比较保留上面的 SSIM 门槛；有损编码器间的质量还需实际看图，不套用 CRF 数字或把码率当画质。确定性指相同环境下 `seek(t)` 的画面不依赖播放历史，不保证不同编码器的 MP4 字节相同。

本轮合成夹具实测（2026-10-23，Windows、Chrome 155、RTX 4060 Laptop；`media-smoke.js` 的移动矩形场景，4.2 秒 / 252 帧、1080p60、mb=1、一路）：默认浏览器 + libx264 总耗时 11.82 秒，显式 GPU + libx264 11.76 秒，显式 GPU + NVENC 11.52 秒。两种浏览器模式都识别到硬件 WebGL，前两份画面 SSIM=1；NVENC 文件约 113 KB，libx264 约 84 KB。这只是一次短合成场景验证，不足以证明正式影片提速或画质提升。总耗时包含进程与浏览器启动；渲染记录的 `seconds` 从页面就绪后计到拼接完成。

历史实测（2026-10-20，以下均使用 libx264，不能代表新增 NVENC 路径；一台 24 线程、带笔记本独立显卡的 Windows 机器；一部 2D 的 DOM/SVG 片子，`mb: 4`；《垃圾回收的艺术》）：

| 渲染 | 软件光栅 | 显卡 |
|---|---|---|
| 最重的 20 秒（1,200 帧，1080p，4 路） | 258 s | 112 s；与软件光栅的 SSIM 0.9999 |
| 同上，8 路 | — | 109 s；渲染期间最低可用内存 8.1 GB |
| 同上，4K（`--scale 2`），4 路 | — | 257 s；最低可用内存 4.7 GB；文件约为 1080p 的 1.8 倍 |
| 整片（1080p，4 路；两种语言画面相同、时长不同） | 中文 35,566 帧 3,127 s（11.4 帧/秒） | 英文 38,136 帧 3,209 s（11.9 帧/秒） |

由此可见：

- 显卡在同一重段上快一倍多；上表整片使用不同语言和时长，不能据此推断同一片子的加速比。显卡路径当时约每秒 11–12 帧（每帧 4 个子帧，约每秒 48 张截图），渲染时 CPU 约用四成、显卡约三成。截图回传可能是瓶颈（推测，没有单独测）；是否增加路数仍须同条件实测。
- 4K 每帧像素是 1080p 的 4 倍，用显卡出帧只慢约 2.3 倍；可用内存降到最低 4.7 GB（1080p、4 路时抽查约 10 GB）。软件光栅出 4K 没有实测；它在重的段落上本就比显卡慢一倍多，没有显卡的机器缺省仍出 1080p。

### 快速样片与正式成片

文案确认和配音就绪后，按要作的决定选择出片路径。`preview.js --mix` 只刷新混音，不合成配音；旧混音来源不匹配时会拒绝封装并提示重混。

| 用途 | 命令与产物 |
|---|---|
| 验证一段解释、转场和声音（先选实际的起止秒数） | `node kit/tools/preview.js <视频> --lang zh --from 20 --to 40 --mix --scale 0.5 --fps 30 --gpu 1 --encoder auto --workers 2` |
| 全片粗看结构与节奏 | `node kit/tools/preview.js <视频> --lang zh --mix --gpu 1 --encoder auto --workers 2`；缺省 480×270、15fps、mb=1 |
| 检查正式尺寸的小字与运动模糊 | `node kit/tools/render.js <视频> --lang zh --from 20 --to 40 --out out/zh/detail.mp4 --gpu 1 --encoder auto --workers 2`；沿用本片正式 fps / scale / mb |
| 正式成片 | `audio.js` → `render.js` → `finish.js` → `covers.js` → `check.js --final`，继续执行实际视听与策划者验收 |
| 另一台 GPU 机器出片 | 用 [两台机器分工](environment.md#3-两台机器分工) 的 `remote.js` 同步和执行以上命令；先固定依赖、字体与源码版本，再回传产物与记录 |

`--out` 路径相对当前工作目录。预演输出在本片 `out/<语言>/preview.mp4`（有声）与 `preview_video.mp4`（无声），每次替换；区间预演自动裁取相应的音轨，实际起止量化到帧边界。`--lang all` 可依次生成全部语言。失败不保留上次的有声预演或通过报告；静止超限时仍保留本次样片供定位，同时失败退出。

先做代表段，再修全片；日常迭代用预演，正式渲染只在时序、声音稳定后进行。预演降低分辨率、帧率与运动模糊以缩短反馈时间，不能代替最终版面、空画面、像素静止及响度检查。1080p60 是缺省交付规格，快速路径不改变标准。

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

每部视频一份，既是工具的配置，也是这部片子的机器可读记录（阶段、署名、交付、发布、评价）。不得为绕过校对而删除 `review`。

```json
{
  "slug": "luainstaller",
  "layout": 2,
  "languages": ["zh", "en"],
  "titles":      { "zh": "…", "en": "…" },
  "stage": "build", "next": "第 03 章主画面",
  "credits": { "planner": "WaterRun", "models": [{ "name": "Claude Opus 5.5", "roles": ["视觉", "场景"] }], "services": [], "repository": "https://github.com/Water-Run/ft" },
  "voices":      { "zh": "zh-CN-YunyangNeural", "en": "en-US-AndrewNeural" },
  "rates":       { "zh": "+5%", "en": "+6%" },
  "asr_prompts": { "zh": "以下是普通话的讲解，介绍……", "en": "A narration about …" },
  "review": { "required": true, "reviewer": "WaterRun" },
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
| `tts` | 可选。配音引擎：`{ "engine": "minimax" 或 { "zh": "minimax", "en": "edge" }, "model": "speech-2.8-hd", "voice": { "zh": "<MiniMax 音色 id>" }, "speed": { "zh": 1.0 } }`。没有这一块，或该语言引擎为 `edge`，照旧按 `voices`、`rates` 走 edge-tts。MiniMax 密钥取环境变量 `MINIMAX_API_KEY` 或 `kit/local/minimax-tts.md`（不入库），接口区域可在 `kit/config.local.json` 写 `minimax_base`；本机没有密钥时整种语言退回 edge-tts。缓存键含引擎、模型、音色、语速与文本 |
| `asr_prompts` | 给语音识别的提示：一句话说明内容并带上术语的正确拼写，回听时识别得更准 |
| `layout` | 新片为 `2`：目录按 [仓库结构](repository.md) 第 2 节的新约定；没有这一项的是 2026-10-20 之前开工的旧片 |
| `license` | 新片为 `GPL-3.0-or-later`，片尾从这里显示；旧配置省略时按仓库许可。第三方材料按其实际许可单列，见[开源交付](third-party.md) |
| `stage`、`next` | 当前阶段与下一步，取值见 [制作周期](../process.md) 第 1 节；片单索引据此显示。每次停工前更新 |
| `credits` | 署名的唯一来源：`planner` 为策划者选定的公开署名（姓名、昵称或笔名均可）；`models` 记录准确型号与实际分工；`services` 记录配音、语音识别、检索等服务；`repository` 为源码仓库。`check.js --final` 核对字段和片尾，并检查署名变更后成片是否过期；不能补造缺失的渲染记录。写法见[署名规则](../roles.md#5-署名) |
| `review` | `{ "required": true, "reviewer": "WaterRun" }`（fork 配置实际校对者）；内容哈希、日期、依据在本片 `review/approval.json` |
| `delivery` | 交付后填写：`date`，以及各语言最终文件的 `duration`（秒，实测） |
| `release` | 发布后填写，每个平台一条：`platform`、`url`、`date`，可加 `title`、`lang` |
| `reception` | 策划者的评价：`date`、`score`（满分 10，可空）、`by`、`ref`（反馈记录里的 P 编号或复盘文档） |
| `render` | `fps`（60）、`mb` 运动模糊的子帧数（1 为不开）、`shutter` 快门开角（0.5）、`crf`（15）、`encoder` / `cq` / `workers`（见第 1 节「硬件编码」）、`gpu`（WebGL 场景设 1；有可用显卡时普通场景也可设 1，见第 1 节「用显卡出帧」）、`scale` 交付分辨率的倍数（1 为 1920×1080，2 为 3840×2160） |
| `audio` | 见 [sound.md](../guides/sound.md) 第 4 节 |
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
| `levels` | 把某一项检查改成 `error` / `warn` / `off`，例如 `{ "SMALL": "warn" }` | 见 [acceptance.md](../guides/acceptance.md) |
| `style` | 风格规则，见下 | 都不开 |
| `sfx` | 音效覆盖率，见 [sound.md](../guides/sound.md) 第 1 节 | |
| `pace` | 语速阈值，按语言：`{ "zh": { "fast": 6.3 } }` | 中文 6.3 字/秒，英文 3.6 词/秒 |
| `blank_ignore` | 空画面检查时忽略的区域 `[[x0, y0, x1, y1], …]`，各值是 0–1 的比例。用于常驻角标 | 无 |
| `margin_skip` | 越界自检时略过的句子 `{ 句号: 原因 }`。用于有意出血的画面 | 无 |

脚本自己也可以报时间线问题：`script.js` 的 `layoutScript()` 返回的对象里若有 `problems`（字符串数组），总闸门把它们计入「时长与节奏」。定长的片子用它报「某一场的旁白超出了定点」，做法见 [XX 秒速通首集的 `script.js`](../../videos/in-seconds/two-factor-auth/src/js/script.js)。

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

一部片子目录里的文件与各自的作用见 [仓库结构](repository.md) 第 2 节。

## 6. 本机配置

工具按系统的常见位置找 Chrome、ffmpeg、Python。找不到或要指定时，写 `kit/config.local.json`（不入库；样例见 `kit/config.local.example.json`），或用环境变量 `CHROME`、`FFMPEG`、`FFPROBE`、`PYTHON`：

| 字段 | 含义 |
|---|---|
| `chrome`、`ffmpeg`、`ffprobe`、`python` | 可执行文件的位置 |
| `asr_model`、`asr_device` | 语音识别模型的名字（缺省 `fw-small`）与设备（缺省 `cpu`） |
| `hf_endpoint` | 下载模型用的地址，可换成镜像站 |
| `remote` | 渲染机：`{ "ssh": "<ssh 主机别名>", "path": "<渲染机上仓库的路径>" }` |

ffmpeg 也可以放在 `assets/ffmpeg/bin/` 下。

Python 还会查仓库的 `.venv/`。`kit/studio.json` 是公开制作默认值，不能放可执行路径、主机或凭据；它与本机配置各自独立。

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
| 生成物与临时目录越来越大 | `clean.js <视频>` 预览；浏览器临时目录用 `doctor.js` 诊断，按 [release.md](../guides/release.md) 核对归属 |
| 工具提示文案校对失败 | `script-review.js <视频> check`，核对稿本、确认者、日期、依据和当前内容 |
| 工具提示制作锁 | 等待同片任务结束；异常退出按 [release.md](../guides/release.md) 核对 PID 与子进程，不盲删锁 |

## 9. 内部模块

下列文件不直接运行，由上面的工具引用。

| 文件 | 作用 | 调用方 |
|---|---|---|
| `project-files.js` | 路径边界、逐文件哈希与单片制作锁 | 制作、校对与清理工具 |
| `artifact-record.js` | 产物与输入的内容校验和、源码与配置状态、最终交付报告核对 | 渲染、混音、封装、封面与总闸门 |
| `credits.js` | 署名字段、片尾静默 cue、完整可见的名单、分工与 GPL 标识 | `catalog.js`、`check.js` |
| `lib.js` | 公共部分：定位仓库与视频目录、读本机配置、语言、时间线、静态服务器、打开页面 | 多数 Node 工具 |
| `inspect.js` | 「用文字看画面」的公共部分：收集某一刻可见的元素，做版面判断 | `look.js`、`scan.js` |
| `pngfix.js` | PNG 的解码，以及 RGBA 到 RGB 的改写 | `render.js`、`inspect.js` |
| `tts.py` | 逐句合成旁白（edge-tts 或 MiniMax） | `tts.js` |
| `voices.py` | 列出 edge-tts 与 MiniMax 的音色，合成范例文本，写试听页 | `voices.js` |
| `minimax_tts.py` | MiniMax T2A v2 合成一句，逐字时间戳转成 `words` | `tts.py`、`tts_probe.py` |
| `tts_probe.py` | 读法试验：合成几种写法，用 Whisper 回听 | `tts_probe.js` |
| `asr.py` | 用 Whisper 回听旁白（faster-whisper） | `asr.js` |
| `mix.py` | 混音：旁白、配乐、音效 | `audio.js` |
| `audio_check.py` | 配乐与混音的数值自检 | `audio.js` |
| `margin_audit.py` | 按像素量每句画面的外接范围 | `margin.js` |
| `blank_check.py` | 成片里几乎为空的时段 | `finish.js` |

`audio_check.py`、`blank_check.py` 也可以单独运行，用法见各自文件头部。
