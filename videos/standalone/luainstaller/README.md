# luainstaller-video

luainstaller 的介绍视频，中文版与英文版各一部，1080p60，中文 7 分 55 秒、英文 7 分 57 秒。画面是「时间 t 的纯函数」的 HTML 动画，旁白逐句合成，动画时间点由旁白的词边界推出，所以两种语言共用同一套场景代码，时间轴各自排布。

制作流程与标准见 `~/work/llm-video/PLAYBOOK.md`。片中每一句陈述的出处见 `research/FACTS.md`。

## 内容

| 场景 | 中文起点 | 内容 |
|---|---|---|
| open | 0:00 | 一份脚本；另一台机器没有 Lua；还缺模块；收进一个可执行文件；标题 |
| 01 在它之前 | 0:20 | srlua 与 luastatic 的做法、实测的失败情形；三者的对照表 |
| 02 它做什么 | 1:14 | 入口脚本、模块、运行时合成一个可执行文件；只写入口的命令；PyInstaller 的类比；Lua 版本与平台；开源、自身规模、测试矩阵 |
| 03 安装 | 2:06 | LuaRocks 与源码目录两种安装；构建前提；`luai` 与 `luainstaller` 两套写法 |
| 04 使用 | 2:43 | 四步工作流的一次完整会话；目录包与单文件；Windows；三种依赖发现方式；C 模块；选项；库 API；一个 17 + 2 个模块的示例服务 |
| 05 边界 | 4:42 | 不做交叉编译；不支持 LuaJIT；系统库不带走；源码不加密；不签名、不出安装包 |
| 06 实现原理 | 5:05 | 八步：校验、发现依赖、清单、工具链、生成 C、编译、核验、落盘；随后是运行时与单文件 |
| outro | 7:37 | 产物随身带的许可证与 C 源码；GitHub；标题；作者与制作说明 |

## 视觉系统

- 两种颜色：Lua 标志的藏蓝 `#000080` 与纸白 `#f3f2ed`。强调只用反白块与字重。
- 图形只有圆与直线。圆是文件、模块、可执行文件；虚线圆是 `require` 关系；实线环是目录包。空心表示「还没有」或「没被找到」，实心表示「有」。
- 月亮是贯穿全片的角色：标题里的大月亮；每一章右上角常驻的「行星 + 轨道 + 卫星」，换章时下一场从它里面展开；实现原理的八步是八个月相，从一弯新月到满月；片尾它重新长成标题里的那一轮。演示程序本身就是一个月相计算器。
- 字体：Inter（拉丁）、Noto Sans SC（中文）、JetBrains Mono（代码与终端）。
- 终端没有窗框；命令比回显大一级。
- 转场只有圆形光圈、站点之间的平移，以及第 06 章的两次推拉（从八步总览推入第一站；推近到可执行文件的字节里读出源码）。
- 没有使用 Lua 的官方标志（其许可只允许改动环绕文字）。

## 目录

```
project.json             语言、音色、语速、混音参数
src/js/script.js         中英双语旁白脚本（一句一条 cue）与读法表
src/js/timing.<语言>.js   实测的每句时长与词边界（sync_tts.sh 生成）
src/js/data.js           画面用到的实测原文与真实产物（gen_data.py 生成，不手改）
src/js/parts.js          部件：遮罩揭示、终端、圆与轨道、字节图、章节卡、角上的小月亮
src/js/config.js         场间转场、字幕配色
src/js/scenes/           八个场景；04 分两个文件，06 分三个文件
src/js/scenes_v1/        第一版（4 分 40 秒）的场景，留作对照
src/cover.html           封面（?r=169|43&lang=zh|en）
research/FACTS.md        逐句的事实出处
research/lab/            取证脚本与完整回显；演示程序 moon；v2/art 是取回的真实产物
tools/                   工具；带语言的工具读环境变量 VLANG（zh / en，默认 zh）
```

## 常用命令

```bash
python3 tools/gen_data.py                  # research/lab → src/js/data.js
VLANG=en tools/sync_tts.sh                 # 合成旁白，更新时间轴
tools/serve.sh &                           # 本机静态服务器
tools/sheet.sh name $(node tools/tq.js zh u19+1 h21e)   # 本机出若干静帧并拼成总览；tq.js 把「句号±秒」换算成时刻
tools/wshot.sh name 311.0 388.6            # 在渲染机上出帧（canvas、大倍率缩放要以渲染机为准）
VLANG=en tools/cuesheets.sh                # 每句旁白结束瞬间的画面（shots/cue-en/）
python3 tools/margin_audit.py en 60         # 越界自检：先把渲染机的 out/cue-en/f_*.jpg 取回 shots/cuef-en/
VLANG=en tools/build_audio.sh              # 混音；随后可在渲染机上跑 tools/audio_check.py 看各章频段与电平
VLANG=en tools/render.sh --mb 8            # 渲染（9 路并行，约 35 分钟；结束后看日志末行的 verified frames= 是否等于总帧数）
VLANG=en tools/finish.sh                   # 封装成片、字幕、响度
python tools/blank_check.py out/zh/video.mp4   # 渲染机上：找出几乎是空画面的时段
VLANG=en tools/covers.sh                   # 封面
```

## 成片位置

WATERRUN 的 `D:\LLM制视频\luainstaller-video\out\`：

- `luainstaller-zh-1080p60.mp4`、`luainstaller-en-1080p60.mp4`（另有 `-voice-only`：只有旁白；`-no-music`：旁白与音效，没有配乐）
- `zh\`、`en\`：渲染出的无声画面 `video.mp4` 与各条音轨（`audio.wav`、`audio_voice.wav`、`audio_nomusic.wav`、`stem_music.wav`、`stem_sfx.wav`），换混音时不必重渲染画面
- `render.zh.log`、`render.en.log`：渲染日志，末行有 `verified frames=`
- `luainstaller-zh.srt`、`luainstaller-en.srt`
- `cover-zh-16x9.jpg`、`cover-zh-4x3.jpg`、`cover-en-16x9.jpg`、`cover-en-4x3.jpg`（及 2 倍像素的 PNG）
- `v1/`：第一版成片（4 分 40 秒）

## 声音

配乐与音效都是程序合成的（`tools/mix.py`）。配乐按章节编排：每章从和弦循环的开头重新起，章节卡落在强拍上；各层（铺底、琶音、高处的稀疏音、低音、极轻的节拍）随章节进出，「实现原理」一章逐步加厚，片尾收到只剩铺底。旁白出现时配乐自动压低。制作过程中只能看数值（`tools/audio_check.py`），听感需要人来确认；不合适时可改 `project.json` 的 `audio` 段后重跑 `build_audio.sh` 与 `finish.sh`，不必重新渲染画面。

## 读法

送去合成的文本与字幕不同的地方记在 `script.js` 的 `SAY` 表，例如 `luainstaller` → `lua installer`、`luai` → `lua i`（英文 `lua-eye`）、`srlua` → `S R lua`、`月相` → `月象`。直接写 `luainstaller` 会被读成「low installer」。改读法后用 `tools/asr.sh` 回听。
