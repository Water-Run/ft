# 150 秒了解 Agent 的手：Harness

一部 150 秒的入门科普片，只做中文：模型只会输出文字，替它读文件、跑测试、改代码的那层程序叫 Harness。全片跟着一次真实的运行走：一个最小的 Harness 让模型修好一个测试没通过的小项目，5 次请求，循环到模型不再调用工具为止。

系列：[XX 秒速通](../README.md)。本片的阶段、署名、发布与评分记在 `project.json`，事实依据在 `research/FACTS.md`，文案只在 `src/js/script.js`。流程与规则见仓库的 `docs/`。

## 状态

| 项 | 记录 |
|---|---|
| 当前停在哪里 | 审稿：中文第 1 稿已导出（`review/script.zh.md`），待校对；试听页（文案、5 个配音、3 个配乐、3 个方向的关键帧）已交 WaterRun |
| 下一步，依赖什么 | WaterRun 校对并明确确认文案，并在试听页里选定配音、配乐与视觉方向；确认后合成全片旁白，按选定方向做代表段 |
| 等待策划者的事 | 文案校对；配音、配乐、视觉方向各选一个 |
| 本次会话的角色 | 准备方兼制作方（Claude Opus 5.5，2026-10-31 起），从取证做到成片 |

## 简报

- 目标观众已有的知识：用过或听说过 AI 编程助手、「Agent」；不需要会编程，能看懂「3 加 5 加 2 应为 10」。
- 看完能回答的一个核心问题：模型只会输出文字，Agent 是靠什么动手的？——靠 Harness：它把环境、工具清单和对话发给模型，替模型执行工具调用，把结果放回对话再问，循环到模型不再要工具为止。
- 用哪个具体例子走完解释：`research/lab/01_harness.py` 这个最小 Harness 的一次真实运行（`out_01_harness_a.json`）。任务「测试没通过，帮我修好」；5 次请求：读两个文件 → 跑测试（应为 10，实际 7）→ 改掉 `prices[1:]` 这一行 → 再跑测试通过 → 不再调用工具，循环停下。关键因果：模型只产出「要调用什么」的文字，执行与把结果交回都是 Harness 做的；接口不记上下文，所以每次都重发整段对话（3 → 12 条消息）。边界：对话太长要压缩；Harness 划定模型能碰什么；同一个模型换 Harness，评测分数会变。
- 逐章怎样推进，各章的答案：
  - open（0 s）：让 AI 修测试，它读、跑、改、通过；可模型只会输出文字——谁动的手？→ 片名 → 外面那层程序 Harness；模型 + Harness = Agent。
  - ask（约 28 s）：第一次请求发出三样东西；模型回的是「工具调用」这种特殊格式的文字；文件由 Harness 去读。
  - loop（约 56 s）：第二到第五次请求逐次走完；没有工具调用就停；这个循环是 Harness 的核心。
  - more（约 94 s）：每次重发整段对话（3 → 12 条）；太长要压缩；它管边界；同一个模型换 Harness 本事不同（LangChain 报告的 52.8 → 66.5）。
  - end（约 132 s）：模型想，Harness 做，并把结果交回——这就是 Agent 的手。片尾名单 142.5–150 s。
- 决定不讲的材料与理由：上下文压缩的具体做法（第 19 集《120 秒速通 Harness 是如何压缩上下文的》讲）；各家 Harness 的比较（「开源 Harness 详解」系列讲）；MCP、子 Agent、技能等组成部分、ReAct 与工具调用的历史（入门片新名词控制在 Harness、Agent、工具调用、循环四个）；Harness 定义上的分歧（只用 LangChain 的公式并署名）。
- 时长上限与语言：150 秒定长；只做中文。
- 策划者的要求（原话、日期）：
  - 2026-10-31：「计划制作Harness的速通视频, 时间减少到150s, 回到最开始2FA的瑞士风, 仅中文. 作为一个入门基础视频, 介绍Agent的手: Harness. 标题: 150秒了解Agent的手: Harness」。片单标题按仓库体例写作「150 秒了解 Agent 的手：Harness」。系列约定要求每集视觉取自本集对象（F16、F21），本片按策划者原话回到首集 2FA 的瑞士风格。
  - 2026-10-31：「按流程, 开始.」——配音照流程给 5 个候选，配乐照流程给 3 个 Demo。
  - 此前的记录：2026-10-11 由独立片《给 LLM 长出手——Harness 工程》改名为《192 秒了解 LLM 的手：Harness 是什么，怎么工作的？》并迁入本系列（[2026-10-09–15](../../../docs/log/plans/2026-10-09--15.md)）；2026-10-23 按策划者「清理这些半成品工作」清除旧成果。旧稿与旧验收结论不作为本次依据。

## 设计

<!-- 制作方写，方法见 docs/guides/visual.md 第 3 节。 -->

关键帧：`src/design/kf.html`（`look.js --url "/design/kf.html?k=A2" --size 1920x1080`），三个方向各三张（标题、信息最密、图解），比较的是讲法，不是配色：

| 方向 | 讲法 | 贯穿的对象 |
|---|---|---|
| A 对开页 | 左墨 = 模型、右纸 = Harness；工具调用是朱红色块，越过中缝交给右边，结果回来 | 两方与来回的箭头 |
| B 消息栈 | 整段对话是一摞消息，每次整摞送进模型，3 → 12 条 | 对话本身 |
| C 环 | 一圈 = 一次请求，指针走过模型 → 工具调用 → Harness 执行 → 结果交回 | 循环 |

试听页 `out/audition/index.html`（不入库）把文案第 1 稿、5 个配音候选（同一段代表句 o3–o6、l2–l4、l9）、3 个配乐 Demo（秒针 120 拍、来回 100 拍、循环 126 拍，各 60 秒）与 9 张关键帧放在一起，2026-10-31 交 WaterRun 选。策划者原话：「整理成本地HTML并打开, 包括配音配音视觉稿件」「这个是新视频的固定流程」。

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
