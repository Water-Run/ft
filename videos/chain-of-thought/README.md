# 192 秒认识 CoT：先思考，再回答

一部 192 秒的 CoT 科普：为什么让模型先写几步再回答往往更有效，以及为什么写出来的步骤不等于模型真实的思考过程。中文与英文两版。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 当前状态与接续

阶段：事实测绘与视觉方向已落盘。文案：未写、未确认。交付：未完成。发布：未发布。归档：未归档。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 2026-10-18：Wei/Kojima/Wang/Nye/ReAct/ToT/Turpin/Snell/R1 的 arXiv 摘要核对；`research/FACTS.md`、`sources.json`、`NARRATIVE.md`；系列「计时盘 × 思考轨」设计方向与 token |
| 下一步及依赖 | 写中文稿 → 交 WaterRun 逐句审查并明确确认 → 翻译/校对英文 → 配音 → 视觉关键帧 → 场景 |
| 当前稿本 / 校对结论 | `src/js/script.js` 仍是模板骨架；没有文案确认 |
| 输出在哪台制作机 | 制作机 A（Windows）；没有成片 |
| 未完成、未检查与阻塞 | 文案、时间线、关键帧、场景、声音、渲染、审查、封面均未做 |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/chain-of-thought export
node kit/tools/script-review.js videos/chain-of-thought check
```

导出的 `review/script.<语言>.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`；主语言通过后翻译并校对其他语言。具体边界见仓库 `docs/guides/script-review.md`。

## 开工反馈应用

<!-- 开工必填，改片另起本轮记录。先读 docs/log/feedback.md 与最近相关复盘；按总账带入全部问题编号，新增编号也须补入。不适用写具体原因，不能只写“已阅读反馈”。 -->

反馈版本：2026-10-18（F01–F12）。本片逐项记录在 `review/lessons.json`；规则来自仓库 `docs/lessons.json`。相关复盘：`docs/log/feedback.md` 的 P0–P13、C1–C14；重点看 P0/P9（叙事与术语）、P2/P3（卡片与转场同质化）、F01–F03。

目标观众已有的知识：用过 ChatGPT/DeepSeek 一类的对话模型；见过“Let's think step by step”“推理过程”或“深度思考”；不知道 CoT 的研究来源，也不清楚写出来的步骤不一定等于真实想法。

看完应能回答的一个核心问题：为什么让模型先写几步再回答往往更有效；以及为什么不能把这几步直接当成模型的真实思考。

逐章怎样推进问题、最后回答什么：现象（同一题直答/分步）→ CoT 是什么（few-shot 中间步骤）→ zero-shot（一句提示）→ 一条链不够（self-consistency/ToT/ReAct）→ 为什么有效（中间结果、测试时计算、RL）→ 什么时候不能信（不忠实、成本）→ 收束（方法是多给计算，不是读心术）。

本片决定不讲的材料及理由：所有 CoT 变体清单、完整基准表、提示工程技巧、内部推理实现细节、哲学判断。理由见 `research/NARRATIVE.md`：192 秒里这些会挤掉“为什么有效/为什么不能信”。

| 问题编号 | 适用性 / 不适用的原因 | 本片计划与正面对照 | 怎样验证 |
|---|---|---|---|
| F01 标题与主问题 | 适用 | 标题承诺“先思考，再回答”，主线是“写步骤为何有用/为何不能全信”，不是 CoT 论文综述。 | 对照最终成片的开头、章节和结尾，说明是否兑现标题。 |
| F02 解释步骤与理解负担 | 适用 | 用 23+7−3 同一题走完直答/分步，再引申到 zero-shot、self-consistency；先讲每一步在做什么，再给论文数字。 | 逐步跟完机制，核对正文是否要求观众同时读论文、图表和字幕；记录正常速度检查范围。 |
| F03 名称、比较与边界 | 适用 | 首次出现 CoT/zero-shot/self-consistency/ReAct/ToT 时给定义；区分“生成的步骤”与“真实内部过程”；数字标论文报告。 | 检查首次出现的旁白、画面和结论是否一致，译文是否保留限制条件。 |
| F04 有效阅读时间 | 适用 | 用 01–07 的段落编号，不做“刷一下”的章节卡；步骤文字按 3–5 秒稳定阅读设计。 | 记录实际 MP4 中必要文字全部到位至开始遮挡的区间；不能用章节总时长代替。 |
| F05 动画解释机制 | 适用 | 思考轨/分叉/投票/断轨四种动作各有语义；不做全片同一种擦除。 | 连续观看代表机制段，确认观众能看见前因后果；不能以镜头运动、元素数量或静止检测通过代替。 |
| F06 声音选择与配合 | 适用 | 节拍器/铅笔/印章/继电器；不用 whoosh/提示音；配乐按系列 120 BPM。 | 对照主混音、无配乐和仅旁白版连续试听，记录音色、音量和重复刺激的问题。 |
| F07 隐私与脱敏 | 适用 | 画面只用自拟 23+7−3、假模型名/通用界面；不出现真实账号、真实 prompt 或论文作者个人信息。 | 核对数据、源码摘录、截图、字幕、封面、提示词、交付记录和最终画面。 |
| F08 最终文件与记录 | 适用 | 目标 192 秒 ±0.1；60fps、立体声、响度按仓库默认；出片后记录实际编码与哈希。 | 保存最终 MP4 的测量与 SHA-256；混音 WAV、旧报告和文件名不能代替最终测量。 |
| F09 证据与反馈来源 | 适用 | 论文数字是论文报告、不是本片复现；Turpin 的忠实性结论与 R1 的 RL 结论分开；未核的写待核。 | 技术异议回到 FACTS；记录实际核查范围与未核项，保留历史评分。 |
| F10 单集独立可懂 | 适用 | 独立成集；不要求记得 2FA/Lean/tmux 等前集；不写“上一期”。 | 不看前集也能理解；逐句检查前集引用及其必要性，不要求记住前集编号。 |
| F11 外文材料的中文解释 | 适用 | CoT/zero-shot/self-consistency/ReAct/ToT/faithfulness/test-time compute 首次出现给中文解释；论文标题/引文给中文释义。 | 实际中文成片中能同时找到可读的中文解释；不强迫观众自行翻译英文论文或追读文献卡。 |
| F12 读音、断句与口播 | 适用 | CoT、zero-shot、self-consistency、ReAct、ToT、GSM8K、MultiArith、BIG-Bench Hard、DeepSeek-R1、Nature 列试听清单；断句按语义。 | 检查实际音轨对应时间；ASR 仅作筛查，读错、断句错和不自然处须人耳确认后复测。 |

## 内容

大纲见 `research/NARRATIVE.md`。以下只是章节骨架，不是旁白；起点要等实测时间线。

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | 23+7−3 的直答/分步钩子；片名卡 |
| what | 待定 | CoT 是三段式：问题 + 中间步骤 + 答案；few-shot 示例 |
| zero | 待定 | “Let's think step by step”；Kojima 的两个数字 |
| branches | 待定 | self-consistency 多路径投票；ToT 分叉/回溯；ReAct 思考/行动交替 |
| why | 待定 | 中间结果、测试时计算、R1 的纯 RL |
| limits | 待定 | Turpin 的不忠实；成本；不能当审计记录 |
| close | 待定 | 断开的轨道；片尾名单 |

## 视觉系统

沿用「XX 秒速通」的计时盘：墨色/纸色/朱红、Mono + Inter + Sans SC、字幕带与秒尺、剩余秒数、右上角仪表。CoT 只把右上角仪表扩展为「思考轨」：问题卡在左，步骤块沿轨道向右，答案用唯一一个朱红块；self-consistency 画分叉 + tally，ToT 画剪枝/回溯，ReAct 画步骤接插座/箭头到外部观察；结尾用断开的轨道提醒“写出来的步骤 ≠ 真实思考”。完整规范见 [`src/design/STYLE.md`](src/design/STYLE.md)，token 见 [`src/design/tokens.css`](src/design/tokens.css)。

这不是视觉例外：颜色、字体、字幕带、秒尺、剩余秒数、120 BPM 与片尾格式都沿用系列，只换仪表内容。

## 取证

- 论文：Wei 2022、Kojima 2022、Wang 2022、Nye 2021、ReAct 2022、ToT 2023、Turpin 2023、Snell 2024、DeepSeek-R1 2025；以 arXiv 摘要页为准，版本与日期见 `research/sources.json`。
- 没有复现论文实验；所有准确率/提升数字都注明“论文报告”，不是本片测量。
- 画面里的 23+7−3 是自拟示意题，不是论文题目；计算可复核。
- 网页来源通过 Web Fetch 读取原文；PDF/HTML 细节只读到摘要能支持的范围。

## 读法

<!-- 送去合成的文本与字幕不同的地方（script.js 的 SAY 表）及原因。 -->

## 制作署名与片尾

策划：WaterRun。

开源视频：[本片源码](https://github.com/Water-Run/ft)。片尾须展示「开源视频」与完整可读的网址。

<!-- 根据 research/FACTS.md 的「制作署名」记录填写实际参与模型，不猜测版本；未披露模型的服务如实注明。所有语言、各交付视频版本都须包含完整名单。 -->

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| DeepSeek V4.1 Flash 1017 | 事实测绘、Web Fetch 来源核对、arXiv 摘要与版本核对、叙事测绘、系列视觉扩展 |

网页来源通过 Web Fetch 读取原文；PDF/HTML 细节只读到摘要能支持的范围。

<!-- 各语言、各视频版本的片尾时段与核对结果：完整性、字号、对比度、停留时间；名单与成片一致。 -->

## 复现

```bash
node kit/tools/script-review.js videos/chain-of-thought check  # 核对当前稿本的人工确认
node kit/tools/tts.js    videos/chain-of-thought --lang all     # 合成旁白，更新时间线
node kit/tools/check.js  videos/chain-of-thought                # 制作期总闸门
node kit/tools/audio.js  videos/chain-of-thought --lang all     # 混音
node kit/tools/render.js videos/chain-of-thought --lang all     # 渲染
node kit/tools/finish.js videos/chain-of-thought --lang all     # 封装成片
node kit/tools/covers.js videos/chain-of-thought --lang all     # 封面
node kit/tools/check.js  videos/chain-of-thought --final        # 交付前总闸门
```

## 成片

<!-- 时长、规格、交付物清单；事实、读音与节奏、旁白与画面对应的审查结果；原创与动画完成度的检查范围、缺陷与修正；需要人来判断的事项（配乐听感、音色、画面观感）。自动闸门通过不代替上述检查，未核查的如实写明。 -->

## 结尾反馈复盘

<!-- 交付前必填。逐行引用开工表中的同一组编号（F01–F09 及后续新增项），不可只写“全部通过”。注明最终 MP4 的语言、版本或哈希；各项列出实际时间窗口和证据。没有播放/试听的范围保留待复核。委托片在 DELIVERY.md 同步结论。 -->

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

<!-- 交付后按 docs/guides/release.md 执行。发布不是归档的前提；记录实际状态。归档路径含个人信息时仅在本机保存，公开表只写不含身份信息的备份代号。 -->

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
node kit/tools/clean.js videos/chain-of-thought   # 只预览，不删除
```
