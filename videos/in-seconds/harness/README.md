# 150 秒了解 Agent 的手：Harness

一部 150 秒的入门科普片，只做中文：模型只会输出文字，替它读文件、跑测试、改代码的那层程序叫 Harness。全片跟着一次真实的运行走：一个最小的 Harness 让模型修好一个测试没通过的小项目，5 次请求，循环到模型不再调用工具为止。

系列：[XX 秒速通](../README.md)。本片的阶段、署名、发布与评分记在 `project.json`，事实依据在 `research/FACTS.md`，文案只在 `src/js/script.js`。流程与规则见仓库的 `docs/`。

## 状态

| 项 | 记录 |
|---|---|
| 当前停在哪里 | 验收：第 4 稿已确认（2026-10-31），正式版 `out/harness-zh-1080p60.mp4` 已渲染、封装，封面已出，自动检查通过；交付记录见「交付」 |
| 下一步，依赖什么 | WaterRun 连续看、听正式版（读音与听感制作者无法确认），同意后登记交付、发布 |
| 等待策划者的事 | 看正式版，确认 w3b「实际是 7」、m6b「Claude Opus」等读音 |
| 本次会话的角色 | 准备方兼制作方（Claude Opus 5.5，2026-10-31 起），从取证做到成片 |

## 简报

- 目标观众已有的知识：用过或听说过 AI 编程助手、「Agent」；不需要会编程，能看懂「3 加 5 加 2 应为 10」。
- 看完能回答的一个核心问题：模型只会输出文字，Agent 是靠什么动手的？——靠 Harness：它把环境、工具清单和对话发给模型，替模型执行工具调用，把结果放回对话再问，循环到模型不再要工具为止。
- 用哪个具体例子走完解释：`research/lab/01_harness.py` 这个最小 Harness 的一次真实运行（`out_01_harness_a.json`）。任务「测试没通过，帮我修好」；5 次请求：读两个文件 → 跑测试（应为 10，实际 7）→ 改掉 `prices[1:]` 这一行 → 再跑测试通过 → 不再调用工具，循环停下。关键因果：模型只产出「要调用什么」的文字，执行与把结果交回都是 Harness 做的；接口不记上下文，所以每次都重发整段对话（发出 2 → 11 条消息）。边界：对话太长要压缩；Harness 划定模型能碰什么；同一个模型换 Harness，评测分数会变。
- 逐章怎样推进，各章的答案：
  - open（0 s）：让 AI 修测试，它读、跑、改、通过；可模型只会输出文字——谁动的手？→ 片名 → 外面那层程序 Harness；模型 + Harness = Agent。
  - ask（约 28 s）：第一次请求发出三样东西；模型回的是「工具调用」这种特殊格式的文字；文件由 Harness 去读。
  - loop（约 56 s）：第二到第五次请求逐次走完；没有工具调用就停；这个循环是 Harness 的核心。
  - more（约 95 s）：每次重发整段对话（2 → 11 条）；太长要压缩；它管边界；同一个模型换 Harness 本事不同（LangChain 报告的 52.8 → 66.5）。
  - end（约 132 s）：模型想，Harness 做，并把结果交回——这就是 Agent 的手。片尾名单 142.5–150 s。
  - 第 3 稿（2026-10-31，预览 r01 之后）改为：open（0 s）不变 → loop（约 28 s）先给地图：Harness 的核心是一个循环，叫 Agent Loop，一圈的四步与停下的条件 → walk（约 55 s）把开头那次修测试按圈走一遍，每圈一个动作，第 3 圈说出错在哪 → more（约 89.5 s）上下文、压缩、边界，同一个模型换五套 Harness 得分 30%–57%（2026-10 的论文）→ end（约 129 s）不变。
- 决定不讲的材料与理由：上下文压缩的具体做法（第 19 集《120 秒速通 Harness 是如何压缩上下文的》讲）；各家 Harness 的比较（「开源 Harness 详解」系列讲）；MCP、子 Agent、技能等组成部分、ReAct 与工具调用的历史（旁白里的新名词控制在 Harness、Agent、工具调用、循环四个；第 3 稿起「循环」点名为 Agent Loop，System Prompt、Context 等英文名只贴在画面上）；Harness 定义上的分歧（只用 LangChain 的公式并署名）。
- 时长上限与语言：150 秒定长；只做中文。
- 策划者的要求（原话、日期）：
  - 2026-10-31：「计划制作Harness的速通视频, 时间减少到150s, 回到最开始2FA的瑞士风, 仅中文. 作为一个入门基础视频, 介绍Agent的手: Harness. 标题: 150秒了解Agent的手: Harness」。片单标题按仓库体例写作「150 秒了解 Agent 的手：Harness」。系列约定要求每集视觉取自本集对象（F16、F21），本片按策划者原话回到首集 2FA 的瑞士风格。
  - 2026-10-31：「按流程, 开始.」——配音照流程给 5 个候选，配乐照流程给 3 个 Demo。
  - 2026-10-31：「视觉我希望B,C结合, C为主 / 配乐选A / 配音选D / 文稿: o6 Model+Harness, 就是Agent」——视觉以 C 环为主、B 消息栈为辅；配乐 A「秒针」；配音 D（MiniMax `Chinese (Mandarin)_Crisp_Girl`，语速 1.15，写进 `project.json` 的 `tts`）；o6 照原话改。
  - 2026-10-31，看过第 1 版预览：「整体还需要对抗迭代几轮. 1. 最后那个gpt5.2有点老了, 最好9月以后的新一点的 2. AgentLoop等关键名词要出现, 至少在画面中 3. 用户有点跟不上, 比如说循环, 改坏哪些部分, 考虑速通视频的简单和用户跟上 4. 整个画面还是太空了, 元素更加丰富 核心还是叙事上的优化, 降低认知负担.」——逐条处理见 `review/NOTES.md` 第 2 轮。
  - 2026-10-31，看过第 3 稿与审片页：「其实问题只有w3和w4了, 用户前面都没提到没跟上具体的问题, 其它OK」——w3、w4 补上「测试算的是购物车总价」与「漏加了第一件的 3」，见 `review/NOTES.md` 第 3 轮。
  - 此前的记录：2026-10-11 由独立片《给 LLM 长出手——Harness 工程》改名为《192 秒了解 LLM 的手：Harness 是什么，怎么工作的？》并迁入本系列（[2026-10-09–15](../../../docs/log/plans/2026-10-09--15.md)）；2026-10-23 按策划者「清理这些半成品工作」清除旧成果。旧稿与旧验收结论不作为本次依据。

## 设计

<!-- 制作方写，方法见 docs/guides/visual.md 第 3 节。 -->

关键帧：`src/design/kf.html`（`look.js --url "/design/kf.html?k=A2" --size 1920x1080`），三个方向各三张（标题、信息最密、图解），比较的是讲法，不是配色：

| 方向 | 讲法 | 贯穿的对象 |
|---|---|---|
| A 对开页 | 左墨 = 模型、右纸 = Harness；工具调用是朱红色块，越过中缝交给右边，结果回来 | 两方与来回的箭头 |
| B 消息栈 | 整段对话是一摞消息，每次整摞送进模型，2 → 11 条 | 对话本身 |
| C 环 | 一圈 = 一次请求，指针走过模型 → 工具调用 → Harness 执行 → 结果交回 | 循环 |

试听页 `out/audition/index.html`（不入库）把文案第 1 稿、5 个配音候选（同一段代表句 o3–o6、l2–l4、l9）、3 个配乐 Demo（秒针 120 拍、来回 100 拍、循环 126 拍，各 60 秒）与 9 张关键帧放在一起，2026-10-31 交 WaterRun 选。策划者原话：「整理成本地HTML并打开, 包括配音配音视觉稿件」「这个是新视频的固定流程」。

**选定（WaterRun，2026-10-31）：C 环为主、B 消息栈为辅**，关键帧 D1–D3。左边是环，一圈 = 一次请求，指针走过四站，左上角数圈；右边是整段对话，每圈新添的消息标朱红，方括号括出这一圈发出的条数，「整摞重发」一直看得见；more 一场五圈收成同心圆，旁边并排五摞对话。配乐 A「秒针」：120 拍、D 小调、每秒一声秒针，正式配乐按片长重写成 `tools/music.py`。配音 D，试听片段实测 4.93 字/秒。

各场的主画面（`src/js/scenes/`）：

| 场 | 主画面 | 说明 |
|---|---|---|
| open | 你的话、AI、`cart.py` 与测试结果 → 模型只写出一段 `read_file` 文字 → 片名卡 → 模型外面包一层 Harness 框，挂着三个工具 → Model + Harness = Agent | 演示项目与工具名取自 `data.js` |
| loop + walk（第 3 稿） | 左：对话栈（上下文）与工具清单；右：环，四站是会显示内容的站卡（模型收到几条与它的话、工具调用原文、执行了什么、交回的结果），模型一站有一条「没有工具调用 → 停下」的岔路；环心先放 Agent Loop 的名字，走一遍时放 `cart.py` 与三件商品 3、5、2；上方五个格子标出五圈各做什么 | 先给地图（一圈通用的四步），再按圈走开头那次修测试；同一个环，中间不换场（`config.js` 的 `after()`） |
| more | 同一块「模型」常驻左侧：五摞对话与每圈的 tokens（2 → 11 条）→ 对话栈继续长到上限、原地压成摘要（15 → 5 条）→ 项目目录：允许的调用进去，越界的被拦下、交回拒绝 → Claude Opus 5 配五套 Harness 的分数条与 63 道题的方格，附论文出处与中文译名 | 压缩一段的旁白「再长下去」说明是假设，画面不另加说明（F15） |
| end | 同一个环再走一圈：「模型」站是想，「Harness 执行」「结果交回」是做；Agent 的手 = Harness | |
| outro | 名单取自 `project.json` | 不配旁白 |

右上角的仪表是「这次发出 · 字节」（实验的 `request_bytes`，1243 → 3724），每发出一次请求跳一次。配乐 `tools/music.py`：每发出一次请求落一声钟音，与指针回到「模型」一站同拍；结论 e1 处抬起。

约束：首集 2FA「计时盘」的瑞士风（墨 `#0c0d0f`、纸 `#f2efe8`、朱红 `#ff4a1c`，平涂、无阴影渐变圆角；JetBrains Mono、Inter、Noto Sans SC），对象换成本片自己的消息、工具调用与循环。

## 交付

正式版（2026-10-31，第 4 稿，WaterRun 2026-10-31 21:09 确认并要求「直接对抗迭代消灭Bug, 出正式版本」）：

| 文件（`out/`，不入库） | 规格 | SHA-256 |
|---|---|---|
| `harness-zh-1080p60.mp4` | 1920×1080、60 fps、h264 + aac，150.000 s；I = -15.7 LUFS，TP = -1.3 dBFS（在最终文件上测） | `ef0c6142c3dcd76f09ba5b9cbdff82e535165a3d65af85a9b057f7c4c542d864` |
| `harness-zh-1080p60-no-music.mp4` | 同上，无配乐 | `6ba57dd7148af3f389170d62f2109e1278c29ed36eff480822638239318ffa68` |
| `harness-zh-1080p60-voice-only.mp4` | 同上，仅旁白 | `cf472e1fe47cd63c96c33799e0f990e1cf3f61adf2507a2ba5fd4943b21ce964` |
| `harness-zh.srt` | 中文字幕 | `b75cd39a8bb33738fc797d6fc63c093ddc3b84adc2aedadeddc2c922fbeff3e8` |
| `cover-zh-16x9.jpg`、`cover-zh-4x3.jpg` 及 3840×2160、3200×2400 的 PNG | 封面 | 见 `build/covers.zh.json` |

- 渲染：`render.js --gpu 1 --workers 4`，9000 帧逐帧核对；画面帧数、声音时长与时间线总长都是 150.00 s（`finish.js`）。成片上没有 ≥3 秒的静止段与空画面。
- 检查：`check.js` 全部通过（仅有 1:25 前后同屏文字偏多的提示）；`readable.js` 184 段文字全部达到 F04 的下限；`scan.js` 无错误；`preview.js` 低清预演无超过 2.5 秒的静止段。`check.js --final` 的结论见下。
- 成片审查中发现并改掉的：配音后 m6 字幕超过一行（按规则断句为 m6、m6b）；三处画面静止超过 2.5 秒；m6b 的「63」在配音时间里找不到，方格出得太早；涨势线压在对话方块上；16 段文字停留时间不够读完；对话栈的括号与环上的指针弧在「顺着播放」和「直接跳到某一刻」时画面不一致（会让并行渲染出错）。
- 记为 `open` 的经验规则（`review/lessons.json`）：F05、F06、F12、F17、F19、F27。制作者看不了连续画面、听不到声音，只用了抽帧总览、数值检查与语音识别回听。需要 WaterRun 连续看、听一遍，尤其是语音识别里听成别的的两处：w3b「实际是 7」（转写成「实际17」）、m6b「Claude Opus」（转写成「Cloud Office」），以及 o6「Model 加 Harness」、w4 与 w5 的「一行」。
- Credit 核对：名单取自 `project.json` 的 `credits`，按本会话的实际分工核对——策划 WaterRun；Claude Opus 5.5 取证、实验、文案、视觉设计、场景、配乐、音效、封面；MiniMax `speech-2.8-hd`（音色 `Chinese (Mandarin)_Crisp_Girl`）旁白配音；DeepSeek `deepseek-flash` 是实验里被调用的模型；取证时用了制作会话自带的网页搜索与网页读取。片尾在逐句抽帧的 z1（2:29）画面上逐行出现；没有连续播放核对停留时间。
- 开源交付：本片源码在本仓库 `videos/in-seconds/harness/`，GPL-3.0-or-later；成片对应的源码快照记在 `out/zh/video.json`。第三方：字体 Inter、JetBrains Mono、Noto Sans SC（SIL OFL 1.1，`kit/assets.json`）；GSAP 3.13.0 运行时由 `npm ci` 取得（GreenSock Standard License，不是开源许可，见 `docs/reference/third-party.md`）；配乐由本片 `tools/music.py` 生成；旁白是 MiniMax 语音合成的输出。论文与文档只引用标题、出处与数字。
- 实际看过、听过的范围：看了逐句抽帧总览、每 5 秒总览、改动处的单帧与封面；没有连续观看，没有听过任何声音。

## 评价与复盘

<!-- 发布后写。 -->

## 复现

```bash
node kit/tools/script-review.js videos/in-seconds/harness check   # 核对当前稿本的人工确认
node kit/tools/tts.js     videos/in-seconds/harness               # 合成旁白，更新时间线
node kit/tools/check.js   videos/in-seconds/harness               # 制作期总闸门
node kit/tools/audio.js   videos/in-seconds/harness               # 混音
node kit/tools/render.js  videos/in-seconds/harness               # 渲染
node kit/tools/finish.js  videos/in-seconds/harness               # 封装成片
node kit/tools/covers.js  videos/in-seconds/harness               # 封面
node kit/tools/check.js   videos/in-seconds/harness --final       # 交付前总闸门
```
