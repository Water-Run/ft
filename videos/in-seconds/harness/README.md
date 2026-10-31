# 150 秒了解 Agent 的手：Harness

一部 150 秒的入门科普片，只做中文：模型只会输出文字，替它读文件、跑测试、改代码的那层程序叫 Harness。全片跟着一次真实的运行走：一个最小的 Harness 让模型修好一个测试没通过的小项目，5 次请求，循环到模型不再调用工具为止。

系列：[XX 秒速通](../README.md)。本片的阶段、署名、发布与评分记在 `project.json`，事实依据在 `research/FACTS.md`，文案只在 `src/js/script.js`。流程与规则见仓库的 `docs/`。

## 状态

| 项 | 记录 |
|---|---|
| 当前停在哪里 | 预览：第 2 稿已确认（2026-10-31），全片旁白已合成，场景、配乐、音效、封面都已做完，`check.js` 通过；第 1 版预览 `out/zh/preview-r01.mp4`（960×540、30 fps，低清预演通过静止检测）交 WaterRun 看 |
| 下一步，依赖什么 | WaterRun 看预览、听读音与配乐；按意见改，再正式渲染、验收 |
| 等待策划者的事 | 看第 1 版预览 |
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
- 决定不讲的材料与理由：上下文压缩的具体做法（第 19 集《120 秒速通 Harness 是如何压缩上下文的》讲）；各家 Harness 的比较（「开源 Harness 详解」系列讲）；MCP、子 Agent、技能等组成部分、ReAct 与工具调用的历史（入门片新名词控制在 Harness、Agent、工具调用、循环四个）；Harness 定义上的分歧（只用 LangChain 的公式并署名）。
- 时长上限与语言：150 秒定长；只做中文。
- 策划者的要求（原话、日期）：
  - 2026-10-31：「计划制作Harness的速通视频, 时间减少到150s, 回到最开始2FA的瑞士风, 仅中文. 作为一个入门基础视频, 介绍Agent的手: Harness. 标题: 150秒了解Agent的手: Harness」。片单标题按仓库体例写作「150 秒了解 Agent 的手：Harness」。系列约定要求每集视觉取自本集对象（F16、F21），本片按策划者原话回到首集 2FA 的瑞士风格。
  - 2026-10-31：「按流程, 开始.」——配音照流程给 5 个候选，配乐照流程给 3 个 Demo。
  - 2026-10-31：「视觉我希望B,C结合, C为主 / 配乐选A / 配音选D / 文稿: o6 Model+Harness, 就是Agent」——视觉以 C 环为主、B 消息栈为辅；配乐 A「秒针」；配音 D（MiniMax `Chinese (Mandarin)_Crisp_Girl`，语速 1.15，写进 `project.json` 的 `tts`）；o6 照原话改。
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
| ask + loop | 环 + 对话栈 + 左下的项目文件；环中间放这一步的实物（请求的三样东西、工具调用原文、Harness 拿到的结果） | 同一个环上走完五圈，中间不换场（`config.js` 的 `after()`） |
| more | 五圈与五摞对话（2 → 11 条）→ 压成摘要的前后对照（标明「示意」）→ 项目目录的边界 → 同一个模型、两套 Harness 的分数条 | 摘要与越界都是本片这次运行没有发生的，画面上写明 |
| end | 环再走一圈：「模型」一站是想，其余三站是做；Agent 的手 = Harness | |
| outro | 名单取自 `project.json` | 不配旁白 |

右上角的仪表是「这次发出 · 字节」（实验的 `request_bytes`，1243 → 3724），每发出一次请求跳一次。配乐 `tools/music.py`：每发出一次请求落一声钟音，与指针回到「模型」一站同拍；结论 e1 处抬起。

约束：首集 2FA「计时盘」的瑞士风（墨 `#0c0d0f`、纸 `#f2efe8`、朱红 `#ff4a1c`，平涂、无阴影渐变圆角；JetBrains Mono、Inter、Noto Sans SC），对象换成本片自己的消息、工具调用与循环。

## 交付

<!-- 验收后写。 -->

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
