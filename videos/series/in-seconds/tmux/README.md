# 128 秒关于 Tmux：是什么，怎么用，如何实现的

一部 128 秒的 tmux 科普：它是什么、日常怎么用、server/client 与 pty/pane 怎样工作，以及从 2007 年 `nscr` 原型到 2026 年 3.8 的沿革。中文与英文两版。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 当前状态与接续

阶段：事实测绘与视觉方向已落盘。文案：未写、未确认。交付：未完成。发布：未发布。归档：未归档。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 2026-10-18：tmux 3.4（WSL2 Ubuntu 24.04）实验；3.8 文档/源码核对；`research/FACTS.md`、`sources.json`、`NARRATIVE.md`；卡带未来主义设计方向与 token |
| 下一步及依赖 | 写中文稿 → 交 WaterRun 逐句审查并明确确认 → 翻译/校对英文 → 配音 → 视觉关键帧 → 场景 |
| 当前稿本 / 校对结论 | `src/js/script.js` 仍是模板骨架；没有文案确认 |
| 输出在哪台制作机 | 制作机 A（Windows + WSL2）；没有成片 |
| 未完成、未检查与阻塞 | 文案、时间线、关键帧、场景、声音、渲染、审查、封面均未做；英文标题待中文稿定稿时确认 |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/series/in-seconds/tmux export
node kit/tools/script-review.js videos/series/in-seconds/tmux check
```

导出的 `review/script.<语言>.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`；主语言通过后翻译并校对其他语言。具体边界见仓库 `docs/script-review.md`。

## 开工反馈应用

<!-- 开工必填，改片另起本轮记录。先读 docs/feedback.md 与最近相关复盘；按总账带入全部问题编号，新增编号也须补入。不适用写具体原因，不能只写“已阅读反馈”。 -->

反馈版本：2026-10-18（F01–F12）。本片逐项记录在 `review/feedback.json`；相关复盘：`docs/feedback.md`（2026-10-18 读取）的 P0–P13、C1–C14 与 F01–F12；重点看 P2/P3（卡片与转场同质化）、P6（镜头别晃）、P9（术语第一次出现要解释）和 F01–F03。

目标观众已有的知识：用过终端、ssh 或编辑器内置终端，知道 `cd`、`ls`、`vim` 一类命令；没有系统用过 tmux 的 session/window/pane，也不知道 detach 后程序为什么还活着。

看完应能回答的一个核心问题：关掉终端之后程序为什么还在跑；tmux 到底替谁记住了什么。

逐章怎样推进问题、最后回答什么：现象（detach 后还在跑）→ 它是什么（session/window/pane 与 pty）→ 怎么用（前缀键与几个命令）→ 原理（server/client、forkpty、VT100 解析、重绘）→ 历史（nscr、2007、OpenBSD、3.8）→ 边界（kill-server/重启）。结尾回到“它保活的是进程与 pty，不是重启后的机器状态”。

本片决定不讲的材料及理由：tmux 配置/插件生态、copy mode 全部键位、Windows psmux、性能对比、systemd 托管。理由见 `research/NARRATIVE.md`：128 秒里这些会挤掉定义与逐步解释。

| 问题编号 | 适用性 / 不适用的原因 | 本片计划与正面对照 | 怎样验证 |
|---|---|---|---|
| F01 标题与主问题 | 适用 | 标题已含“是什么、怎么用、如何实现”；事实测绘补历史，但历史只占一小段，不抢主线 | 审稿时标出开头问题、各章答案与结尾回答的时刻 |
| F02 解释步骤与理解负担 | 适用 | 用同一个 detach/attach 实验贯穿：先看到 counter 继续走，再拆 server/pty，再回到命令 | 正常播放检查观众能否从“关掉终端”跟到“server/pty 仍在”；记录每步时间 |
| F03 名称、比较与边界 | 适用 | 首次出现 session/window/pane/pty 时各给一句定义；区分 tmux 3.4 实验与 3.8 文档；不把 psmux 当 tmux | 审稿时核对首次定义、版本标注和画面文字 |
| F04 有效阅读时间 | 适用 | 本片没有章节卡；片名/结论卡按 2–3 秒完整阅读设计，不用“刷一下”代替阅读 | 成片用 `sheets.js cue` 与逐帧检查卡片停留 |
| F05 动画解释机制 | 适用 | 换场只用拔插电缆、换台雪花、挡板合拢三类，各自绑定不同语义；不做全片同一种擦除 | 与近期两部并排看开头/换章/解释段 |
| F06 声音选择与配合 | 适用 | 继电器、按键、磁带、CRT 底噪各有语义；不用默认 whoosh；配乐写清节奏与加层 | 主混音/无配乐版试听，记录片段与结果 |
| F07 隐私与脱敏 | 适用 | 实验回显已去掉用户名/主机名；画面只用 `/tmp/ft-tmux-lab` 与通用路径 | 检查最终 MP4、字幕、封面与 FACTS 回显 |
| F08 最终文件与记录 | 适用 | 目标 128 秒 ±0.1；60fps、立体声、响度按仓库默认；出片后记录实际编码参数与哈希 | `check.js`、`ffprobe`、实际音轨测量与 README 对照 |
| F09 证据与反馈来源 | 适用 | 3.4/3.8 差异、psmux、socket 权限等容易引战；每条回到 FACTS 的来源与版本，未核的写“待核” | 审稿与成片复核时逐条对照 `FACTS.md` 的“边界与常见误说” |
| F10 单集独立可懂 | 适用 | 本集不依赖前集；不写“上一期/第几集”。tmux 的概念在 open/model 两章自足。 | 不看任何前集也能理解；审稿逐句检查前集引用。 |
| F11 外文材料的中文解释 | 适用 | 英文术语 pty、VT100、client/server、socket 首次出现时给中文解释；tmux 源码引文只作辅助，画面给中文释义。 | 审稿时能找到每个外文术语的中文解释；不要求观众读英文 man page。 |
| F12 读音、断句与口播 | 适用 | 专名 tmux、pty、libevent、OpenBSD、VT100 列试听清单；断句按语义，不按字幕切。 | tts_probe/asr 回听；人耳确认读错/断句；记录时间点。 |

## 内容

大纲见 `research/NARRATIVE.md`。以下只是章节骨架，不是旁白；起点要等实测时间线。

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | 现象：detach 后 counter 还在走；片名卡 |
| model | 待定 | session / window / pane / pty 的树；一个 session、两个 window、三个 pane |
| use | 待定 | 前缀 `C-b`、`c`/`%`/`"`/`d`/`[`、`tmux attach`；命令与键是同一套命令 |
| impl | 待定 | client 只收键/画屏；server 持有 pty，解析 VT100/ANSI，再按 client 重绘 |
| history | 待定 | 2007 `nscr`、0.1、2009 OpenBSD、2026 3.8 |
| edge | 待定 | kill-server、server 死、重启不恢复；片尾名单 |

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

尚无旁白。写稿与合成后，在此登记送去合成的文本与字幕不同的地方（`script.js` 的 SAY 表）及原因。

## 制作署名与片尾

策划：WaterRun。

开源视频：[本片源码](https://github.com/Water-Run/ft)。片尾须展示「开源视频」与完整可读的网址。

<!-- 根据 research/FACTS.md 的「制作署名」记录填写实际参与模型，不猜测版本；未披露模型的服务如实注明。所有语言、各交付视频版本都须包含完整名单。 -->

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| DeepSeek V4.1 Flash 1017 | 事实测绘、Web Fetch 来源核对、tmux 3.4 实验、3.8 文档/源码核对、叙事测绘、卡带未来主义设计方向 |

网页来源通过 Web Fetch 读取原文；PDF 与 403 页面用下载/存档文本核对。

片尾时段与各语言版本的核对结果：未做（没有成片）。

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

<!-- 时长、规格、交付物清单；事实、读音与节奏、旁白与画面对应的审查结果；原创与动画完成度的检查范围、缺陷与修正；需要人来判断的事项（配乐听感、音色、画面观感）。自动闸门通过不代替上述检查，未核查的如实写明。 -->

## 结尾反馈复盘

<!-- 交付前必填。逐行引用开工表中的同一组编号（F01–F12 及后续新增项），不可只写“全部通过”。注明最终 MP4 的语言、版本或哈希；各项列出实际时间窗口和证据。没有播放/试听的范围保留待复核。委托片在 DELIVERY.md 同步结论。 -->

本次核查的最终文件、语言与版本 / SHA-256：

| 问题编号 | 开工计划 → 实际做法 | 成片时间区间、检查方法与证据 | 结果 / 未解决项与下一步 |
|---|---|---|---|
| F01 | | | |
| F02 | | | |
| F03 | | | |
| F04 | | | |
| F05 | | | |
| F06 | | | |
| F07 | | | |
| F08 | | | |
| F09 | | | |
| F10 | | | |
| F11 | | | |
| F12 | | | |

<!-- 结果使用“已验证 / 已修改待复核 / 待修改 / 待事实核查 / 不适用（原因）”。补记新发现与反馈总账的关联；修改后另存复测，不覆盖历史评分。 -->

## 发布、归档与清理

<!-- 交付后按 docs/lifecycle.md 执行。发布不是归档的前提；记录实际状态。归档路径含个人信息时仅在本机保存，公开表只写不含身份信息的备份代号。 -->

| 项 | 记录 |
|---|---|
| 平台链接、标题、发布时间与时长 | 未发布 |
| 最终文件、语言、规格、SHA-256 | |
| 实际 Node、Chrome、ffmpeg、Python 与包版本 | |
| 归档代号、manifest.json 哈希、校验日期 | 未归档 |
| 备份介质与恢复抽验结果 | 未检查 |
| 清理范围、时间、取证实验资源撤除 | 未清理 |
| 需保留的复盘证据与后续修订 | |

```bash
node kit/tools/clean.js videos/series/in-seconds/tmux   # 只预览，不删除
```
