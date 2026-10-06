# 制作流程

本文给出一部视频从立项到交付的顺序、每一步的产物、所用的工具与过关条件。各步的细则在专题文档里，文中逐处给出链接。

所有命令都在仓库根目录下执行，形如 `node kit/tools/<工具>.js <视频目录> [参数…]`；`<视频目录>` 是含 `project.json` 的那一层，例如 `videos/standalone/luainstaller`。先 `cd` 进视频目录时可以省略它。

## 两种制作方式

| | 自制 | 委托 |
|---|---|---|
| 含义 | 从取证到成片由同一个制作者完成 | 准备方完成取证、旁白、视觉系统与任务书；受托模型完成场景、声音编排、封面、渲染与审查 |
| 第 0–4 步 | 制作者 | 准备方 |
| 第 5–10 步 | 制作者 | 受托模型，按任务书做到交付闸门全部通过 |
| 交付之后 | — | 准备方验收：复跑闸门、通看总览图、核对交付说明 |
| 目录里多出的文件 | — | `AGENTS.md`（任务入口）、`brief/`（任务书）、`expect.<语言>.json`、`DELIVERY.md` |
| 记在哪里 | `project.json` 的 `production.mode` 为 `self` | `production.mode` 为 `delegated`，`maker` 记受托模型 |

委托方式的做法单独成文：[delegation.md](delegation.md)。下面的步骤对两种方式都适用，区别只在由谁来做。

两种方式都须满足 [standards.md](standards.md)：不直接抄袭现成产品，动画精美精良，事实严格核查，片尾列出实际参与模型、策划者 WaterRun 与标明「开源视频」的 GitHub 仓库链接。

## 并行开工与分支

- 仓库正常情况下只保留一个 `main` 分支：不开长期特性分支，改动在自己的目录里验证通过后直接提交到 `main`。
- 可能同时有多个制作者（Agent）各开一部片子。每部片子的全部产物都收在 `videos/…/<视频>/` 自己的目录里，互不依赖；一个制作者不需要、也不应该改动别人正在做的片子。
- 共享的文件（`kit/`、`docs/`、`videos/catalog.json`、根目录的 README 与 `AGENTS.md`）改动要小而独立：改片单只动自己的条目，改完运行 `node kit/tools/catalog.js`；不重排、不顺手改别的条目。
- 提交以「一部片子的进展」为单位；全局整理（如片单重组、规范修订）单独提交，不与某部片子的改动混在一起。

## 总览

| 步 | 做什么 | 产物 | 工具 | 过关条件 |
|---|---|---|---|---|
| 0 | 立项 | 视频目录、片单条目 | `new.js`、`doctor.js` | 环境自检通过；题目、时长、受众、语言已定 |
| 1 | 取证 | `research/FACTS.md`、`research/lab/` | 视题目而定 | 计划讲的每一项事实均有可复查依据，交叉核查完成 |
| 2 | 脚本 | `src/js/script.js` | `timeline.js`、`stats.js` | 语速、句长在范围内；各语言句号一一对应 |
| 3 | 配音 | `src/js/timing.<语言>.js`、`audio/` | `tts.js`、`tts_probe.js`、`asr.js` | 读音核对无误；总长在目标范围内 |
| 4 | 视觉设计 | `src/css/style.css`、关键帧、代表性动画片段 | `look.js`、`sheets.js`、`preview.js` | 原创设计记录齐全；关键帧已比较选定，代表性动画达到完成度要求 |
| 5 | 场景实现 | `src/js/scenes/`、`src/js/config.js` | `look.js`、`scan.js`、`check.js` | `check.js` 全部通过 |
| 6 | 声音 | `out/<语言>/audio.wav` 等 | `audio.js` | 数值自检正常；试听片已出 |
| 7 | 渲染与封装 | `out/<语言>/video.mp4`、成片 | `preview.js`、`render.js`、`finish.js` | 渲染日志末行有 `verified frames=<总帧数>`；音画长度一致；响度在范围内 |
| 8 | 成片审查 | `FACTS.md` 的「复核」一节 | `asr.js`、`stats.js`、`sheets.js`、`margin.js` | 三项核心审查、原创与动画完成度、片尾名单均已核对，无未解决的问题 |
| 9 | 封面 | `out/cover-<语言>-*.jpg` | `look.js --url`、`covers.js` | 每种语言 16:9 与 4:3 各一张 |
| 10 | 交付与记录 | 本片 `README.md`、片单、（委托时）`DELIVERY.md` | `check.js --final`、`catalog.js` | 自动闸门与成片审查均通过，封面事实已补查，片尾与交付记录一致 |

改过脚本、场景或样式之后，已有的渲染结果就过期了：从第 6 步重新做起（`check.js --final` 会查这一点）。

## 0 立项

1. 确认题目、目标时长、受众与语言。没有特别说明时：语言为中文与英文两种；科普片按「数分钟、循序渐进、信息量充足但不赶」理解；项目介绍片的体量见 [standards.md](standards.md)。
2. 确认制作方式（自制或委托）。
3. 新建目录并登记片单：

   ```bash
   node kit/tools/new.js standalone/<视频> --title "中文标题" --title-en "English title"
   node kit/tools/new.js series/<系列>/<视频>                      # 片单里已有的条目，标题与语言取自片单
   node kit/tools/new.js standalone/<视频> --title "…" --delegate "<受托模型>"   # 委托制作
   ```

   系列里的一集先读该系列的说明 `videos/series/<系列>/README.md`：系列内要保持连续性，见 [series.md](series.md)。
4. `node kit/tools/doctor.js <视频>` 检查环境；缺什么按 [environment.md](environment.md) 补。

## 1 取证

细则见 [research.md](research.md)。

- 画面和旁白里的每一项事实都要有出处，记入 `research/FACTS.md`（陈述 ↔ 出处，逐章列表）。
- 出处的优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。题目允许时把真实系统运行起来取数据，脚本与完整回显留在 `research/lab/`。
- 原始来源须支持陈述的完整含义，按 [research.md](research.md) 做独立交叉核查，记录版本、范围与日期；模型输出和搜索摘要仅作线索。待核实、冲突或无依据的陈述不能进入定稿。
- 画面上的数字、字节、终端回显由脚本从原始数据生成（放在视频目录的 `tools/` 下，参考已有视频的 `gen_data.py`），不手写。示意性质的图形在画面上标「示意」。
- 口令、密钥、内网地址、个人目录不写进任何文件。

## 2 脚本

细则见 [script-and-voice.md](script-and-voice.md)。

- 一句一条 cue：`[句号, 字幕, { tts, gap, pause }]`。多语言时字幕写成 `{ zh: '…', en: '…' }`。
- 先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
- 语速与句长用 `node kit/tools/stats.js <视频>` 看。
- 语体客观、克制，不用比喻套话；开头 5 秒要有钩子。
- 为片尾预留脚本与时长，包含「策划：WaterRun」、实际参与模型的名称与分工，以及「开源视频」和 [GitHub 仓库链接](https://github.com/Water-Run/ft)；制作过程中持续更新 `FACTS.md` 的「制作署名」记录，渲染前核准最终名单与链接。

## 3 配音

```bash
node kit/tools/tts.js <视频>                 # 逐句合成，写出各语言的 timing.<语言>.js，打印时间线
node kit/tools/timeline.js <视频> a3 a4      # 看指定句子的起止时刻与词边界
node kit/tools/tts_probe.js <视频> --lang en "写法一" "写法二"   # 读法拿不准时，几种写法各合成一句比较
```

- 合成有缓存：改了哪句只重新合成哪句。
- 此后所有动画时间点都用 `T(句号, 词)` 表达，脚本一改画面自动重排。
- 混音之后用 `node kit/tools/asr.js <视频>` 回听：查多音字、术语读音、漏读。

## 4 视觉设计

细则见 [visual-design.md](visual-design.md)。先设计，后实现。

- 独立视频从头建立自己的视觉系统，不沿用上一部的配色与部件；系列里的一集沿用该系列的视觉系统。
- 不照搬现成产品的文案、分镜、构图与动效。使用参考时，在本片 README 记录来源、借鉴方法与设计选择。
- 先做两到三个方向的关键帧（各两到三张静帧），按 [standards.md](standards.md) 自评后选定一个方向。选定的关键帧在进度说明里给出，方向可以随时调整。
- 铺开制作前验证一段代表性动画，覆盖信息密集画面、关键揭示与转场，检查运动中的可读性、缓动、落点与衔接。
- 静帧用 `node kit/tools/look.js <视频> <时刻…>`（存到 `shots/`）或 `node kit/tools/sheets.js <视频> at <时刻…>`（拼成总览）。

## 5 场景实现

细则见 [scenes.md](scenes.md)，引擎的函数见 [engine.md](engine.md)，常见错误见 [pitfalls.md](pitfalls.md)。

- 整部片子是时间 t 的纯函数：不用 CSS 动画与过渡、定时器、时间线回调；随机数固定种子。
- 以连续空间和镜头运动为骨架（`makeCamera`），不是一屏一屏换面板。
- 关键动作同步登记音效：`sfx(名称, 时刻)`。
- 片尾名单按正式场景实现，各语言、各交付版本都要能完整读完；动画逐段打磨，不能只以通过静止检测作为完成依据。
- 每写完一小段就查，不攒到最后：

  ```bash
  node kit/tools/look.js <视频> a3 a4                 # 这两句说完时的画面：文字描述 + 截图
  node kit/tools/scan.js <视频> --from 20.6 --to 52.8 # 扫一个场景
  node kit/tools/check.js <视频>                      # 制作期总闸门
  ```

## 6 声音

细则见 [sound.md](sound.md)。

```bash
node kit/tools/audio.js <视频>                                   # 各语言的主混音、仅旁白、无配乐与分轨
node kit/tools/audio.js <视频> --lang zh music=chip out=audio_b.wav   # 另一种配乐的试听混音
```

配乐与音效是程序合成的，制作者听不到：混音后看数值自检的输出，出片时附试听片，并在交付说明里写明。

## 7 渲染与封装

```bash
node kit/tools/preview.js <视频>            # 低清预演，从像素层面找静止段
node kit/tools/render.js <视频>             # 正式渲染，各语言依次进行
node kit/tools/finish.js <视频>             # 响度处理、封装、字幕、静止段与空画面检查
node kit/tools/finish.js <视频> --lang zh --audio out/zh/audio_b.wav --name 试听-复古配乐   # 试听片
```

- 渲染日志的末行应是 `verified frames=<总帧数>`。对不上时工具以非零码退出并保留分段，不会交出少帧的片子。
- `finish.js` 先核对画面、声音与时间线三者的长度，不一致就不封装。
- 字幕内嵌在成片里：字幕条由引擎画进画面，每种语言的成片自带该语言的字幕，交付与投稿不依赖外挂字幕文件。`finish.js` 另导出同文同步的 `.srt`，只是 `out/` 里的附属文件。

## 8 成片审查

细则见 [review.md](review.md) 第 5 节。成片出来不算完，还要做三项核心审查与完成度检查，达到可发布的可靠程度再交付：

| 项 | 做法 |
|---|---|
| 事实 | 逐句、逐画面对照 `FACTS.md` 再核一遍；外部事实联网复核；更正记入 `FACTS.md` 的「复核」一节 |
| 读音与节奏 | `asr.js` 回听；`stats.js` 看语速与停顿；`sheets.js <视频> every 4` 通看 |
| 旁白与画面对应 | `sheets.js <视频> cue` 取每句说完那一刻的画面，逐张比对所述内容是否在画面上 |
| 动画与声音 | 静帧与连续播放都查，核对动作、镜头衔接、可读性与音画配合，记录缺陷与修正 |
| 原创与片尾 | 对照参考来源检查独立设计；逐个视频版本核对片尾名单、策划者 WaterRun、参与模型与分工、开源视频的 GitHub 链接及可读性 |

发现问题就改、重渲、再查，直到这一轮查不出问题。

## 9 封面

```bash
node kit/tools/look.js <视频> --url "/cover.html?r=169&lang=zh" --size 1920x1080
node kit/tools/look.js <视频> --url "/cover.html?r=43&lang=zh"  --size 1600x1200
node kit/tools/covers.js <视频>
```

每种语言两版：16:9 与 4:3，各出 2 倍像素的 PNG 和投稿用的 JPG。封面单独设计，不用视频截帧。

## 10 交付与记录

1. `node kit/tools/check.js <视频> --final` 全部通过，并完成 [review.md](review.md) 第 5 节的检查；补查封面事实与最终片尾名单，未完成的检查不能记为通过。
2. 本片的 `README.md` 写全：内容、视觉系统与参考来源、取证方式、读法、复现命令、成片规格、制作署名与片尾时段、各项审查中改掉了什么、哪些需要人来判断（配乐听感、音色、画面观感）。委托片同步写进 `DELIVERY.md`。
3. 片单里把状态改为 `delivered`，运行 `node kit/tools/catalog.js`。
4. 系列里的一集：把这一集定下的做法写回系列说明；首集完成后整理系列基座（见 [series.md](series.md)）。
5. 制作中得到的新经验写进 [pitfalls.md](pitfalls.md) 与 [retrospectives.md](retrospectives.md)。
6. 提交。生成物（`audio/`、`out/`、`shots/`、`build/`）不入库，留在制作机上；提交前把将入库的改动过一遍，确认没有口令、密钥、内网地址等敏感信息（见 [research.md](research.md) 第 5 节）。
