# OpenClaw 和 OpenCode 的 v2 大改：我们从过去一年的 Agent 工程化学习到了什么

一部面向开发者的科普片，讲 2026 年 8 月底到 9 月中相继发布的两次大改：OpenClaw 2.0（`v2026.8.1`）与 OpenCode v2，并与一年前的做法对照，归纳出写一个 harness（包在模型外面、负责收发、调用工具、保存状态的那层程序）时值得照做的几条。中文版 9 分 33 秒，英文版 9 分 47 秒，主要面向打算自己写 harness 的人。

全片的主线是一个问题：进程在半路死掉之后，还剩下什么。OpenClaw 一侧取它的消息收发，OpenCode 一侧取它的会话执行；中段用一个实验对照 OpenCode 1.0.0 与 2.0.24：让一个按脚本应答的模型要求执行一条慢命令，命令跑到一半时强杀进程，再看两边各自留下的记录、恢复的方式和发给模型的内容。结论是：两边最后都多执行了一次，因为被杀进程留下的命令还在跑；区别在于 v2 把发生过的事记了下来，并如实告诉了模型。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 内容

| 场景 | 起点（中文版） | 起点（英文版） | 内容 |
|---|---|---|---|
| open | 0:00 | 0:00 | 两条发布记录：2026-08-31 OpenClaw 2.0，2026-09-11 OpenCode v2.0.0，相隔 11 天；一个在聊天软件里当个人助理，一个在终端里写代码。一条进程生命线被 `kill -9` 切断。片名 |
| before | 0:25 | 0:25 | 01 一年前的 harness：循环示意；OpenCode 1.0 循环的源码原文（`prompt.ts`）；实测的 1.0.0 数据目录、一把写锁、只在内存里的排队；一年的两条泳道（OpenCode 1.0 → 1.2 迁 SQLite → 1.3 支持 Node.js；warelay → CLAWDIS 网关 → 2026.7.1 的文件会话）；它没有处理的四个时刻 |
| claw | 1:58 | 2:00 | 02 OpenClaw 2.0（上）：版本号与 16,977 个拉取请求；重构文档记着的故障（回复在发送前随重启丢失）；发送三步（意图 → 平台调用 → 回执）与中间的危险窗口、`unknown_after_send`、只有 `not_sent` 才重发、至少一次与恰好一次、持久策略；接收记录与 Telegram 的重启水位线；运行中插话与合成的错误结果 |
| claw2 | 3:31 | 3:37 | 02 OpenClaw 2.0（下）：会话与记录从文件搬进 SQLite（每个智能体一个库，另有一个全局库）；会话之间的带序号信号日志；绑定到具体那一次的审批；出网代理与哨兵串；接管别的编程智能体的会话，以及 OpenCode v1 的表不记每条消息的来源 |
| code | 4:37 | 4:44 | 03 OpenCode v2：2.0.24 与仍在发布的 v1；删掉旧主包后的分层（Schema、Core、Protocol、Server、生成的客户端）；每个用户一个后台服务、事件只编码一次、每连接一条 4,096 上限的队列，规范里的测量（50 个客户端时 554 毫秒降到 12 毫秒）；带序号的事件与投影在同一个事务里写入、收件箱与步边界、调用先落库；收窄的重试 |
| crash | 5:52 | 6:06 | 实验：工具执行到一半时强杀进程。1.0.0 的记录停在 `running`，继续之后那次调用从请求里消失；2.0.24 重启服务即自己接上，记成被中断，补一条重启说明；被杀进程留下的命令还在跑，两边的 `note.txt` 都是两行；规范写明不保证恰好一次 |
| budget | 7:03 | 7:14 | 上下文按预算管：压缩成结构化摘要、默认保留约 15,000 个 token；工具输出只给开头和结尾；指令文件按哈希记差异、改动追加在后，保住缓存前缀；最后一步禁用工具但照发定义；可选的保温；删掉的部分（语言服务器、v1 插件） |
| lessons | 7:58 | 8:08 | 04 学到了什么：六条共同做法，每条配两边的证据——先记下来再动手；恢复时承认「不知道」；记录始终成对；上下文是预算；授权绑定到具体的那一次；只留一条路径。最后一站：一年前核心是循环，到了 v2 分量移到了循环外面 |
| outro | 9:23 | 9:38 | 片尾名单与开源仓库地址 |

## 视觉系统

题目要求 OpenClaw 与 OpenCode 的部分严格遵循各自的视觉设计。本片因此用三套皮肤，各管各的场景，部件不混用（定义在 `src/css/style.css` 开头与 `src/js/parts.js`）：

| 皮肤 | 用在 | 依据与特征 |
|---|---|---|
| 中性（本片自己的设计） | 开场、01、04、片尾，各章节卡 | 纸白底 `#f1eee6`、墨黑字 `#17181b`、宋体大字；左侧页边是递增的四位序号，一句事实就是「一行记录」 |
| OpenClaw | 02 章两场 | 照 2.0 的 Control UI 设计变量（v2026.8.1 `ui/src/styles/base.css`）：底 `#0e1015`、卡片 `#161920`/`#191c24`、正文 `#bcbcc0`、强调色 `#ff5c5c`，10/14 像素圆角与胶囊；字体是它自带的 Instrument Sans；吉祥物按 `ui/public/favicon.svg` 的路径绘制 |
| OpenCode | 03 章三场 | 照 v2 的终端主题（v2.0.24 `packages/tui/src/theme/assets/v2/opencode.json`）：底 `#0a0a0a`、面板 `#141414`/`#1e1e1e`、边框 `#484848`、交互色 `#fab283`；直角细边框，全等宽，按字符网格排；方块字标志按 `packages/tui/src/logo.ts` 逐格绘制 |

全片不变的约定：

- 中性部分的图形语言只有三种：细横线是一个进程的生命期（会断），带序号的一行是一条落了盘的记录（留得下来），斜切口是进程被杀。开场的那条线与第 04 章的结尾呼应这一点。
- 中性部分只有黑白两色；提到哪个项目，才出现那个项目的颜色（珊瑚红 = OpenClaw，桃橙 = OpenCode），只作小色块。
- OpenClaw 两场沿一条横向的路线走，顶部细轨上标着各站，一枚珊瑚红的消息气泡沿轨走到哪一站，就讲哪一站。OpenCode 三场按终端面板排布，终端里的命令、记录、请求与进程列表都由 `tools/gen_data.py` 从实验回显生成，只截取，不改写。
- 实验一场特写一侧面板时，另一侧压暗；镜头往下看进程与文件时，上方三块一起压暗。
- 示意性质的图形在画面上标「示意」；文档原文与源码行带版本和行号。

**品牌素材的来源与许可。** 吉祥物的路径与动作节奏取自 OpenClaw v2026.8.1 的 `ui/public/favicon.svg`（文件注释写明与官网首页吉祥物一致：浮动 4 秒、触角摆动 2 秒、眨眼 3 秒、钳子开合 4 秒）；深色底上的两档渐变色 `#ff6d5a`→`#c2372b` 取自 `ui/src/styles/base.css` 中深色模式对吉祥物的调整。Instrument Sans 的字体文件随 OpenClaw 仓库分发（OFL 许可，许可文本在 `src/type/instrument-sans-OFL.txt`）。OpenCode 的方块字标志按 v2.0.24 `packages/tui/src/logo.ts` 的字符与 `component/logo.tsx` 的配色规则绘制。两个项目都以 MIT 许可发布。吉祥物的渐变是品牌标志自带的，源码里以 `lint-ok` 注明，是对「不用渐变」的唯一例外。

**参考来源与原创。** 两个项目的部分借用的是设计变量这一层：颜色、字体、圆角、边框与标志；版式、构图、图解、镜头路线与动效都按本片的内容设计，没有复刻 Control UI 或终端界面的任何一屏。中性皮肤与「一行记录」的图形语言是本片自己的设计。画面里的真实材料（发布说明、文档原文、源码行、实验回显）是取证材料，各自带出处。

## 取证

事实由三路得到，互相印证：

1. **源码与文档**（`research/_src/`，不入库）。OpenCode 取 `v1.0.0`、`v1.18.35`、`v2.0.24` 三个标签，OpenClaw 取 `v2026.7.1`、`v2026.8.1`（即 2.0）、`v2026.9.8` 三个标签；各压缩包的 SHA-256 记在 `FACTS.md`。画面与旁白引用的原文由 `research/lab/01_excerpts.py` 按文件与行号摘出（`out_01_excerpts.json`），发布时间、标签与提交由 `02_meta.py` 从 GitHub 接口取得（`out_02_meta.json`）。
2. **实验**（`research/lab/10–13`，回显在 `exp_v1/`、`exp_v2/`）。两个版本各运行一次「工具执行到一半时强杀进程」：模型是本片自己写的按脚本应答的本地服务（`10_scripted_model.mjs`），不访问任何模型服务；每次实验在一个新的用户命名空间里把实验目录挂成 `/home/user`，回显里只有这个通用路径，进程列表另做了过滤。
3. **发布记录与博客**。发布日期取 GitHub 的发布记录与标签提交时间；OpenClaw 的博客只作背景，片中的数字不取自博客。

重做一遍：

```bash
python -I research/lab/01_excerpts.py <解包目录> > research/lab/out_01_excerpts.json   # 从 6 个源码包摘出引用的原文（包的地址与校验和见 FACTS.md）
python -I research/lab/02_meta.py <回显目录>     > research/lab/out_02_meta.json       # 从 GitHub 接口的回显摘出版本与日期
unshare -Urm --fork bash research/lab/11_crash_v1.sh <实验目录>   # OpenCode 1.0.0：强杀与继续
unshare -Urm --fork bash research/lab/12_crash_v2.sh <实验目录>   # OpenCode 2.0.24：强杀与重启服务
python -I research/lab/13_dump_v2_db.py <强杀后的库> <恢复后的库> > research/lab/exp_v2/db_rows.json
python tools/gen_data.py                                                                 # 生成 src/js/data.js
```

两个实验脚本要求 `<实验目录>/tools/` 下预先放好 `node`、对应版本的 `opencode` 与 `mock.mjs`（即 `10_scripted_model.mjs`），回显写到 `<实验目录>/out/`；入库前去掉与实验无关的进程，放进 `exp_v1/`、`exp_v2/`。数据库快照各约 6 MB，不入库，校验和见 `FACTS.md`。

实验在 Linux（x86-64）上进行，需要能建用户命名空间（`unshare`）；OpenCode 的可执行文件取自 npm 上的平台包，版本与哈希见 `FACTS.md`。1.0.0 启动时会安装 `@ai-sdk/openai-compatible@latest`，实验里按 v1.0.0 的 `bun.lock` 预先放进了它的缓存目录。

这个实验说明的是同一个场景下两个版本各运行一次的结果，不说明真实模型一定会重试；脚本模型的选择规则在画面上标明「按脚本应答」。

## 读法

字幕写正式拼写，读法在 `src/js/script.js` 的 `SAY` 表里：

- `unknown_after_send` 去掉下划线，读成三个单词。
- 中文版 `SQLite` 写成 `S Q Lite`：原样送去合成时读音含混。
- `CLAWDIS` 写成 `Clawdis`：全大写会被逐字母拼读。英文版 `warelay` 写成 `wa relay`。
- `sessions.json`、`JSONL` 读成「sessions 点 JSON」「JSON L」；`Node.js` 中文版读成「Node JS」。
- 版本号逐段读：`2026.8.1` → 二零二六点八点一 / twenty twenty-six point eight point one；`v2.0.24` → v 二点零点二十四 / v two point oh point twenty-four。
- 中文版的 `16,977`、`15,000`、`4,096` 写成汉字读数。

`asr.js` 回听两种语言各 141 句，没有漏读与数字读错。中文整条音轨的识别结果里，OpenClaw 多处被写成「OpenCloud」，第 04 章有两句 OpenCode 也被写成「OpenCloud」；用 `tts_probe.js` 把这几句单独合成再回听，分别是「Open Claw」「Open Code」，判断为识别器受前文影响，读音本身正确，没有改读法。其余差异是同音字（会话、回执、终端等）与数字写法的归一。

## 制作署名与片尾

策划：WaterRun。

开源视频：[GitHub · Water-Run/ft](https://github.com/Water-Run/ft)。

| 参与方（含可确认的版本） | 实际分工 |
|---|---|
| Claude Opus 5.5 | 取证（源码、文档、发布记录）、实验设计与运行、脚本与翻译、视觉设计、场景实现、配乐脚本、封面、审查 |
| Microsoft Edge 在线语音（模型未披露） | 旁白：`zh-CN-YunyangNeural`、`en-US-AndrewNeural` |
| faster-whisper `small` | 旁白回听 |
| 程序合成（`tools/music.py`、`kit/tools/mix.py`） | 配乐与音效 |

片尾是最后一个场景（`outro`），两种语言都有：中文版 9:23–9:33，英文版 9:38–9:47，各约 10 秒。内容是五行名单（策划、制作、配音、回听、素材及其许可）与「开源视频 github.com/Water-Run/ft」（英文 `Open-source video`）。核对结果见「成片」。

## 复现

```bash
node kit/tools/tts.js    videos/standalone/openclaw-opencode-v2 --lang all     # 合成旁白，更新时间线
node kit/tools/check.js  videos/standalone/openclaw-opencode-v2                # 制作期总闸门
node kit/tools/audio.js  videos/standalone/openclaw-opencode-v2 --lang all     # 混音
node kit/tools/render.js videos/standalone/openclaw-opencode-v2 --lang all     # 渲染
node kit/tools/finish.js videos/standalone/openclaw-opencode-v2 --lang all     # 封装成片
node kit/tools/covers.js videos/standalone/openclaw-opencode-v2 --lang all     # 封面
node kit/tools/check.js  videos/standalone/openclaw-opencode-v2 --final        # 交付前总闸门
```

## 成片

2026-10-08 完成。成片在制作机的 `videos/standalone/openclaw-opencode-v2/out/` 下，不入库。

| 文件 | 内容 |
|---|---|
| `openclaw-opencode-v2-zh-1080p60.mp4`、`openclaw-opencode-v2-en-1080p60.mp4` | 主混音（文件名里的「p60」是 `finish.js` 的固定命名，实际帧率见下表） |
| `…-1080p60-voice-only.mp4`、`…-1080p60-no-music.mp4` | 仅旁白；旁白与音效，没有配乐 |
| `openclaw-opencode-v2-zh.srt`、`openclaw-opencode-v2-en.srt` | 与内嵌字幕同文同步的字幕文件（附属） |
| `cover-<语言>-16x9.jpg`、`cover-<语言>-4x3.jpg` 及各自 2 倍像素的 PNG | 封面，每种语言两版 |

| | 中文 | 英文 |
|---|---|---|
| 时长 | 573.60 秒（9:33） | 587.70 秒（9:47） |
| 规格 | 1920×1080，30 帧/秒，H.264 + AAC | 同左 |
| 渲染日志末行 | `verified frames=17208` | `verified frames=17631` |
| 响度 | −16.5 LUFS，真峰值 −1.4 dBFS | −15.6 LUFS，真峰值 −1.5 dBFS |
| 静止 ≥ 3 秒的段落 | 无 | 无 |
| 空画面 | 无 | 无 |
| 内容很少的时段（占比 < 2%，只作提示） | 6 段，最长 7.7 秒（547.3–555.0，最后一站只有圆环与一句话） | 8 段，最长 7.0 秒（561.3–568.3，同一处） |

**帧率。** 成片按 30 帧/秒渲染，仓库的惯例是 60 帧/秒。这是为赶交付时限做的取舍：两种语言并行渲染，中文 1354 秒、英文 1089 秒；画面是时间的纯函数，改 `project.json` 的 `render.fps` 为 60 后重跑 `render.js` 与 `finish.js` 即得 60 帧版本，不需要改场景。

**审查中改掉了什么。** 逐条记录在 `research/FACTS.md` 的「复核」一节，这里只列结论：

- 事实：一处因果表述收严（e12「于是」改为「按脚本」）；外部事实于 2026-10-08 联网复核一致。
- 读音：两种语言各 141 句回听，没有漏读与数字读错；OpenClaw 在整轨识别里被写成「OpenCloud」，单句复核读音正确。
- 镜头与版面：镜头漂移改为横移受每站余量约束、不足部分用拉远补足，既不把字推出画面，也让画面在到站之后持续有运动；特写并排面板时压暗另一侧；多处到站后空着的一两秒改为提前入场；描线前露出的端点、两处英文版面重叠（第 04 章标题与小图、片尾标签与内容）已改。

**原创。** 参考来源与品牌素材的许可见「视觉系统」。没有照搬两个项目界面的任何一屏，也没有照搬其他现成产品的文案、分镜、构图或动效。

**片尾。** 两种语言的片尾都核对过：五行名单、分工与「开源视频 github.com/Water-Run/ft」（英文 `Open-source video`）齐全，与 `research/FACTS.md` 的「制作署名」一致；2026-10-08 打开该地址，仓库公开可访问。

**需要人来判断的事项**

- 配乐与音效的听感。两者由程序合成，制作者听不到；数值自检正常（旁白约 −21 dB，配乐在旁白之下约 −40 dB，无削波）。不合适时改 `project.json` 的 `audio` 段或 `tools/music.py` 后重跑 `audio.js` 与 `finish.js`，不必重新渲染画面。
- 两种音色与语速（中文加快 4%，英文加快 6%）是否合适；英文有 21 句单句语速超过每秒 3.6 词。
- OpenClaw、OpenCode、Clawdis 在中文旁白里的读音。
- 连续播放时的观感，以及 30 帧/秒在镜头移动处是否够顺。制作者只看过静帧与总览图（两种语言每 4 秒一帧、每句一帧）。

**已知的小瑕疵**

- 英文字幕里有六句带弯撇号（`’`），字幕条的字体把它排成全角，例如「OpenClaw’ s」。改成直撇号会改动这几句的合成文本，赶时限时没有动。
- 各场景的部分面板边框与小字在镜头漂移时距画面左右边缘不足 60 像素（`margin.js` 的提示）；被切的文字只出现在特写时露出的相邻面板上，已压暗。

**未做**

- 没有逐句对应表（`expect.<语言>.json`）；旁白与画面的对应是逐张看总览图核的。
- 本片未发布。
