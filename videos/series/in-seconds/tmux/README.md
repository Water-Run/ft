# 128 秒关于 Tmux：是什么，怎么用，如何实现的

一部 128 秒的 tmux 科普：它是什么、日常怎么用、server 怎样把程序留住，以及 2007 到 2009 年它怎样写出来并进入 OpenBSD。中文与英文两版。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 当前状态与接续

阶段：已交付并已发布（2026-10-19）。第 5 轮 b 中英成片经 WaterRun 观看试听确认（详见「成片」）。WaterRun 看过第 5 轮并要求优化使用与原理两段；第 5 轮 b 经其观看试听确认交付。同日发布到哔哩哔哩与 YouTube（见「发布、归档与清理」）。归档：未归档。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 2026-10-19：第 5 轮成片后按 WaterRun 意见出第 5 轮 b：使用一段改为逐条「Ctrl-b 再按」，原理拆成按键与输出两条路径（约 21 秒，原 10.5 秒）；修画面小问题（字幕条侵入、主体被切、静止段、开头占位读数、计数统一）；tmux 读法改 tee mux；重新配音、混音、渲染、封装 |
| 下一步及依赖 | 已发布；按 lifecycle 归档、校验、清理 |
| 当前稿本 / 校对结论 | 中文 `review/script.zh.03a119d1958c0bf7c2bf3d1a3602b22a0e97c285088f941fb575777d9a3b87e3.md`，英文 `review/script.en.ce875f7996b19a5d257da7ed44119e8e7f7c337325dbc0245546c19f13ac1332.md`；approval 依据是会话授权，不是逐句阅读确认（`review/NOTES.md`「第 5 轮」「第 5 轮 b」） |
| 输出在哪台制作机 | 制作机 A（Windows）；`out/` 不入库 |
| 未完成、未检查与阻塞 | 已交付、已发布；待归档与清理。配音语气问题按「已发布不返工」留档，不改本片 |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/series/in-seconds/tmux export
node kit/tools/script-review.js videos/series/in-seconds/tmux check
```

导出的 `review/script.<语言>.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`；主语言通过后翻译并校对其他语言。具体边界见仓库 `docs/script-review.md`。

## 开工反馈应用

<!-- 开工必填，改片另起本轮记录。先读 docs/feedback.md 与最近相关复盘；按总账带入全部问题编号，新增编号也须补入。不适用写具体原因，不能只写“已阅读反馈”。 -->

反馈版本：2026-10-19（F01–F14）。本片逐项记录在 `review/feedback.json`；相关复盘见 `docs/feedback.md`。重点看术语第一次出现要解释、同一条计数不要被历史打断，以及 F13 的年代和路线。

目标观众已有的知识：用过终端、ssh 或编辑器内置终端，知道 `cd`、`ls`、`vim` 一类命令；没有系统用过 tmux 的 session/window/pane，也不知道 detach 后程序为什么还活着。

看完应能回答的一个核心问题：关掉终端之后程序为什么还在跑；tmux 到底替谁记住了什么。

逐章怎样推进问题、最后回答什么（第 4 轮口播）：先说终端离开了、计数的程序还在，再用离开前 4、离开后 9 这两次读数说明距离；走的只是眼前这块终端 → 把计数留住的程序叫 tmux，同一块屏幕里可以有多个终端；片名停顿在定义之后，不配旁白 → 短历史（2007 年写出来；当时在用 screen；不是要复制；同一页要同时出现在多个终端上；2009 年成了 OpenBSD 里自带的程序）→ 回到同一个数，再起名 session、window、pane、server、client、伪终端 → 前缀键与 c / d / % / 引号 / attach → 刚才这些键由 tmux 收下，其余进 pane；没有 client 时读到的是 9 → 程序还在是因为 server 还在；这个还在只算终端离开；要停就用 kill-server；server 停了，里面的程序也停。

本片决定不讲的材料及理由：tmux 配置/插件生态、copy mode 全部键位、Windows psmux、性能对比、systemd 托管。理由见 `research/NARRATIVE.md`：128 秒里这些会挤掉定义与逐步解释。

| 问题编号 | 适用性 / 不适用的原因 | 本片计划与正面对照 | 怎样验证 |
|---|---|---|---|
| F01 标题与主问题 | 适用 | 先说终端离开、计数的程序还在，再用两次读数说明 4 和 9；tmux 在 o4 起名、o5 定义，片名停顿放在定义之后。历史是 past 一场，然后回到同一个数 | 审稿时标出 o1、o2、o5、p1、m1、e1、e4 的时刻 |
| F02 解释步骤与理解负担 | 适用 | 先说终端离开、程序还在，再给两次读数。术语和历史都在这个定义之后，m1 再接回同一个数。口播不说实验。对照 MyISAM；历史不插进后面的因果，对照 Lean 4 | 审稿时从 o1 跟到 e4，看每句是不是上一句的原因或下一步；记录预估时间 |
| F03 名称、比较与边界 | 适用 | tmux、screen、session、window、pane、server、client、伪终端都在首次句里用中文定义。不口播 nscr、3.8、3.4。3.4 只留在画面角标。不说 psmux | 审稿时核对首次定义，并确认口播没有版本号和原型名 |
| F04 有效阅读时间 | 适用 | 本片没有章节卡；片名/结论卡按 2–3 秒完整阅读设计，不用“刷一下”代替阅读 | 成片用 `sheets.js cue` 与逐帧检查卡片停留 |
| F05 动画解释机制 | 适用 | 换场只用拔插电缆、换台雪花、挡板合拢三类，各自绑定不同语义；不做全片同一种擦除 | 与近期两部并排看开头/换章/解释段 |
| F06 声音选择与配合 | 适用 | 继电器、按键、磁带、CRT 底噪各有语义；不用默认 whoosh；配乐写清节奏与加层 | 主混音/无配乐版试听，记录片段与结果 |
| F07 隐私与脱敏 | 适用 | 实验回显已去掉用户名/主机名；画面只用 `/tmp/ft-tmux-lab` 与通用路径 | 检查最终 MP4、字幕、封面与 FACTS 回显 |
| F08 最终文件与记录 | 适用 | 目标 128 秒 ±0.1；60fps、立体声、响度按仓库默认；出片后记录实际编码参数与哈希 | `check.js`、`ffprobe`、实际音轨测量与 README 对照 |
| F09 证据与反馈来源 | 适用 | 3.4/3.8 差异、psmux、socket 权限等容易引战；每条回到 FACTS 的来源与版本，未核的写“待核” | 审稿与成片复核时逐条对照 `FACTS.md` 的“边界与常见误说” |
| F10 单集独立可懂 | 适用 | 本集不依赖前集；不写“上一期/第几集”。tmux 的概念在 open/model 两章自足。 | 不看任何前集也能理解；审稿逐句检查前集引用。 |
| F11 外文材料的中文解释 | 适用 | 不口播 pty、VT100、socket、PANE-A、nscr。tmux、screen、server、client、window、pane、session、伪终端都在首次句里给中文。OpenBSD 说成里面自带的程序 | 审稿时确认没有没解释的外文词；不要求观众读 man page。 |
| F12 读音、断句与口播 | 适用 | 这一轮会读到 tmux、screen、OpenBSD、Ctrl-b、kill-server；% 和引号另写读法。断句按语义。还没有试听。 | 确认后用 tts_probe/asr 回听；人耳确认读错和断句。 |
| F13 背景、年代与观看路线 | 适用 | 从终端离开、程序还在进入；o4–o5 说明是什么；past 给 2007、当时在用的 screen、2009 年 OpenBSD 自带。m1 接回计数。不拿 3.8 倒推这次读到的数 | 审稿时看第一次观看能否复述对象、年代和主线；成片复述仍待成片 |
| F14 片尾署名与旁白分开 | 适用 | z1 只有 7 秒停顿，没有字幕和读法。署名与仓库链接在 README、FACTS，不进旁白 | 核对 script.js 的 outro 没有 tts；成片片尾仍待画面 |

## 内容

大纲见 `research/NARRATIVE.md`；口播在 `src/js/script.js`（第 5 轮 b）。起点为中文实测（英文在括号里）。

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | 计数 1→4，拔线；机架里继续数到 9；只有终端走了；终端复用器 tmux；片名停顿 |
| past | 0:18.3（0:18.9） | 2007；作者原本用 screen、不打算复制它；一个窗口同时接到多个终端；2009 进 OpenBSD 基本系统 |
| model | 0:32.3（0:32.4） | 计数住在哪：server 后台进程（PID 506）、计数是其子进程、伪终端；client 只管显示与按键、经本地连接通信，关掉终端只断连接；server 里的 session / window / pane 三层 |
| use | 1:03.3（1:03.7） | 快捷键两步：先 Ctrl-b、再一个键；逐条「Ctrl-b 再按」c / % / 双引号 / d（detach），tmux attach 一切原样；画面累积「已学会」键表 |
| impl | 1:27.8（1:26.7） | 按键路径：键送到 server 查键表，Ctrl-b 之后的 c 命中新开窗口，查不到的键写进 pane 的伪终端；输出路径：不直接上屏，先记进 pane 自己的屏幕，再按每个 client 重画；所以接回来画面原样 |
| edge | 1:48.7（1:48.5） | 开头的答案：程序住在 server 里；kill-server 后全部结束 |
| outro | 2:00.5 | 片尾名单，无旁白 |

## 视觉系统

卡带未来主义：把 tmux 画成 1970 年代的多路终端控制室。米色/军绿机架、CRT pane、磁带仓=session、频道旋钮=window、插头=client、机架电源灯=server；黑底荧光绿/琥珀字，扫描线只在 CRT 内部，红色只给警示灯。UI 动作 12fps 步进，镜头连续；转场用拔插电缆、换台雪花、挡板合拢。完整规范、色彩/字体/图形语义、封面与禁止项见 [`src/design/STYLE.md`](src/design/STYLE.md)，token 见 [`src/design/tokens.css`](src/design/tokens.css)。

参考来源：策划者提供的「卡带未来主义」风格卡；本片把它转译成 tmux 的 server/session/window/pane/client 物件。没有照搬某部电影/游戏的控制台构图、文案或动效；具体选择见 STYLE.md 第 1、5、8 节。

这是「XX 秒速通」的视觉例外：保留系列的定长时间线、语速、字幕带/秒尺、剩余秒数、右上角仪表的位置与做法，只换视觉系统；理由写在系列说明的视觉例外里。

## 取证

- 实验：`research/lab/01_tmux_basics.sh` 在 WSL2 Ubuntu 24.04.4 的 tmux 3.4 上运行，完整回显 `out_01_tmux_basics.txt`；用 `-L ftlab -f /dev/null` 隔离 socket 与配置。
- 文档/源码：`man.openbsd.org/tmux.1` 与 tag `3.8`（提交 `7f2a35ad3321f9ba57a1062ca73b1f3ff26aca53`）。行号与引用见 `research/FACTS.md`。
- 来源清单：`research/sources.json`；历史采访与 CHANGES 的引用都在 FACTS 里。
- 重做：在 WSL 里跑上面的脚本，再按 `FACTS.md` 的「取证环境」核对版本；不要用 Windows 上的 psmux 代替 tmux。

## 读法

配音改用 MiniMax（`project.json` 的 `tts` 段）。字幕写正式拼写；`u3` 的 `%` 送去合成的是「百分号」。SAY 表里 tmux、Ctrl-b、kill-server、OpenBSD 的拆读是为 edge 调的，MiniMax 仍按 SAY 送读；tmux 改为 tee mux、kill-server 原样送读。WaterRun 已试听确认。

## 制作署名与片尾

策划：WaterRun。

开源视频：[本片源码](https://github.com/Water-Run/ft)。片尾须展示「开源视频」与完整可读的网址。

<!-- 根据 research/FACTS.md 的「制作署名」记录填写实际参与模型，不猜测版本；未披露模型的服务如实注明。所有语言、各交付视频版本都须包含完整名单。 -->

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| DeepSeek V4.1 Flash 1017 | 事实测绘、Web Fetch 来源核对、tmux 3.4 实验、3.8 文档/源码核对、叙事测绘、卡带未来主义设计方向 |
| Grok 4.7 | 2026-10-18 中文旁白第 1 轮与英文对照草稿；2026-10-19 第 2 轮；同日第 3 轮；同日按「不报没有作用的版本号，结尾要回答开头」重写第 4 轮中文旁白和英文对照草稿 |
| Claude Opus 5.5 | 2026-10-19 第 5 轮中英旁白、卡带未来主义场景与 HUD、封面、配音接入、混音、渲染、封装与成片审查 |
| MiniMax speech-2.8-hd | 中文（Chinese (Mandarin)_Reliable_Executive，speed 1.0）与英文（English_Trustworthy_Man，speed 1.1）旁白语音合成 |

网页来源通过 Web Fetch 读取原文；PDF 与 403 页面用下载/存档文本核对。

片尾时段：120.5–128.0 s（两种语言相同），无旁白。名单含策划 WaterRun、上表四个模型与分工、「开源视频」与 72px 的 https://github.com/Water-Run/ft；look.js 126.0 s 截图核对完整可读。

<!-- 各语言、各视频版本的片尾时段与核对结果：完整性、字号、对比度、停留时间；名单与成片一致。 -->

## 复现

```bash
node kit/tools/script-review.js videos/series/in-seconds/tmux check  # 核对当前稿本的人工确认
node kit/tools/tts.js    videos/series/in-seconds/tmux --lang all     # 合成旁白，更新时间线
node kit/tools/check.js  videos/series/in-seconds/tmux                # 制作期总闸门
node kit/tools/audio.js  videos/series/in-seconds/tmux --lang all     # 混音
node kit/tools/render.js videos/series/in-seconds/tmux --lang all     # 渲染
node kit/tools/finish.js videos/series/in-seconds/tmux --lang all     # 封装成片
node kit/tools/covers.js videos/series/in-seconds/tmux --lang all     # 封面
node kit/tools/check.js  videos/series/in-seconds/tmux --final        # 交付前总闸门
```

## 成片

| 项 | 记录 |
|---|---|
| 交付物（制作机 A 的 `out/`，不入库） | `tmux-zh-1080p60.mp4`（SHA-256 `f2b11e1178902a9778f031dc6e5289e459ebc5824302455715dd2b9998ee3017`）、`tmux-en-1080p60.mp4`（`ef6073249408fe35c0bae1f3511694d4c39bd908f51cd1497f9c752fc3f39ee4`）；各语言另有 no-music、voice-only 与 `.srt`；封面 `cover-<语言>-16x9 / 4x3`（JPG 与 2 倍 PNG） |
| 规格（finish.js 实测） | 两语言均 7680 帧 = 128.00 s，1920×1080，60 fps，H.264 + AAC；zh 约 -16 LUFS，en -15.7 LUFS，TP ≤ -1.5 dBFS；渲染日志 verified frames=7680 |
| 自动闸门 | 第 5 轮 b：`check.js` 全部通过；`check.js --final` 全部通过（F06、F12 经 WaterRun 试听确认） |
| 事实 | 逐句与画面对照 FACTS；第 5 轮新增陈述的依据记在 FACTS「文案审查」第 5 轮一条 |
| 读音与节奏 | 无过快、无过长句；多数句间停顿 < 0.2 s（定长 128 秒所致）。`asr.js` zh 无漏读，Ctrl B / detach / attach / kill-server 识别正确，「终端→中端」为同音；tmux 改读 tee mux（tts_probe 对比）。WaterRun 已试听确认 |
| 旁白与画面 | `sheets.js cue`（zh 33 张）逐张核对：每句所述对象在画面主体 |
| 动画 | 卡带未来主义：12fps 步进 UI、CRT 开关机与换台雪花、拔插电缆、磁带仓/旋钮/挡板对应 session/window/pane；第 5 轮 b 修正：字幕条侵入、主体被切、detach 保持段静止、开头占位读数、u1 特写与右上仪表重叠；剩余 use 段 DENSE 提示（键帽单字与图例） |
| 计数示意 | 开头 4→9 来自实验第 8 节；之后机架里计数继续到 10、11…，以及 o5 小屏的 vim / make / ssh，都是「还在跑」的示意，不是实验回显 |
| 需要人来判断 | WaterRun 已观看试听第 5 轮 b 并确认交付（2026-10-19） |

## 结尾反馈复盘

<!-- 交付前必填。逐行引用开工表中的同一组编号（F01–F12 及后续新增项），不可只写“全部通过”。注明最终 MP4 的语言、版本或哈希；各项列出实际时间窗口和证据。没有播放/试听的范围保留待复核。委托片在 DELIVERY.md 同步结论。 -->

本次核查的最终文件、语言与版本 / SHA-256：zh `out/tmux-zh-1080p60.mp4` `f2b11e11…3017`；en `out/tmux-en-1080p60.mp4` `ef607324…f9ee4`（第 5 轮 b，2026-10-19）。逐项证据与时段写在 `review/feedback.json`。

| 问题编号 | 开工计划 → 实际做法 | 成片时间区间、检查方法与证据 | 结果 / 未解决项与下一步 |
|---|---|---|---|
| F01 | 4→9 钩子 → 第 5 轮保留，并用 e1 直接回答 | 0:00–0:20、1:42–1:45；sheets cue | 已验证 |
| F02 | 先定义再术语 → model 按 server→子进程→伪终端→client→连接→三层推进；5b 使用逐条讲、原理分两条路径 | 0:32.3–1:48.7（en 0:32.4–1:48.5）；sheets cue | 已验证 |
| F03 | 不口播版本号 → 3.4 只在角标；首次术语同句中文 | 0:19.9–1:13；sheets cue | 已验证 |
| F04 | 卡片 2–3 秒 → 片名卡 2.2 s、答案牌约 8 s、片尾 7.5 s、「已学会」键表累积 | 1:48.7–2:08；look、finish 静止检查（无 ≥3 s 静止） | 已验证 |
| F05 | 三类换场 → 纸带 / 挡板 / CRT 关开，各配不同音效 | 0:17–0:42 等换场；look | 已验证（静帧与时间线），连续观感待人看 |
| F06 | 机械音效、不用 whoosh → 9 种音效，无 whoosh；配乐 pulse | audio.js 数值：峰值 0.875、无削波 | 已验证：WaterRun 试听确认（「听过了没问题，标记交付」） |
| F07 | 脱敏 → 只用 /tmp/tmux-1001/ftlab、PID、/dev/pts 等通用值 | 0:37.8–1:13；look | 已验证 |
| F08 | 128 s、60fps → 实测 128.00 s / 7680 帧 / 1080p60 | finish.js、render 日志 | 已验证 |
| F09 | 回到 FACTS → 年份、采访大意、kill-server 回显均有依据 | 0:19.9–0:37.8、1:50–1:57 | 已验证 |
| F10 | 不依赖前集 | 全片 | 已验证 |
| F11 | 外文配中文 | 0:37.8–1:41.9 | 已验证 |
| F12 | 试听读音 → tts_probe 选 tee mux、kill-server 原样送读；asr 无漏读 | 0:00–2:00.5；asr.js、tts_probe | 已验证：WaterRun 试听确认 |
| F13 | 年代与路线 | 0:00–0:37.8 | 已验证 |
| F14 | 片尾不配旁白 | 2:00.5–2:08；look 126.0 s | 已验证 |

<!-- 结果使用“已验证 / 已修改待复核 / 待修改 / 待事实核查 / 不适用（原因）”。补记新发现与反馈总账的关联；修改后另存复测，不覆盖历史评分。 -->

## 发布、归档与清理

<!-- 交付后按 docs/lifecycle.md 执行。发布不是归档的前提；记录实际状态。归档路径含个人信息时仅在本机保存，公开表只写不含身份信息的备份代号。 -->

| 项 | 记录 |
|---|---|
| 平台链接、标题、发布时间与时长 | 哔哩哔哩：[BV1oSn56oEUQ](https://www.bilibili.com/video/BV1oSn56oEUQ)，《128 秒关于 Tmux：是什么，怎么用，如何实现的》，2026-10-19 03:40:52（UTC+8），平台时长 128 秒，在合集「速通教学」第 3 集。YouTube：[qCklpfGDWXk](https://www.youtube.com/watch?v=qCklpfGDWXk)，*Tmux in 128 Seconds: What It Is, How to Use It, How It Works*，频道 Water Run（@waterrun1978）。两个平台均已于 2026-10-19 核对可访问 |
| 最终文件、语言、规格、SHA-256 | 见「成片」 |
| 实际 Node、Chrome、ffmpeg、Python 与包版本 | |
| 归档代号、manifest.json 哈希、校验日期 | 未归档 |
| 备份介质与恢复抽验结果 | 未检查 |
| 清理范围、时间、取证实验资源撤除 | 未清理 |
| 需保留的复盘证据与后续修订 | 配音语气「懒洋洋」的反馈见 `docs/feedback.md` 的 P29 / F17。按「已发布不返工」，本片原样保留在线，不重配音、不重渲；该问题只用于以后的新片 |

```bash
node kit/tools/clean.js videos/series/in-seconds/tmux   # 只预览，不删除
```
