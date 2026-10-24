# 制作周期

一部片子从选题到复盘经过下面这些阶段。阶段之间是依赖关系，不是流水线：取证之后就可以开始找视觉材料，文案确认之前可以探索关键帧。真正不能越过的只有三道闸门（第 2 节）；其余顺序与做法，由当时负责的一方按自己的判断安排。

各阶段由谁来做、谁说了算，见 [角色与权限](roles.md)。

## 1. 阶段

`stage` 是本片 `project.json` 里记录当前阶段的值，片单索引据此分组显示。每次停工前更新它与 `next`。

| 阶段 | `stage` | 做什么 | 产出 | 先读 |
|---|---|---|---|---|
| 选题 | （片单） | 策划者定题目、系列与语言 | `videos/catalog.json` 的条目 | — |
| 立项 | `brief` | `new.js` 建目录；写清受众、核心问题、时长、语言和策划者的原话要求 | README 的「简报」 | 系列说明（如有）、`lessons.js show --stage brief` |
| 取证 | `research` | 查一手来源、做实验；收集讲解对象自己的视觉与声音材料 | `research/FACTS.md`、`research/lab/`、`research/MATERIALS.md` | [取证](guides/research.md) |
| 文案 | `script` | 写中文稿，逐章检查是否回答核心问题 | `src/js/script.js`、`review/NOTES.md` | [文案与配音](guides/script.md)、`--stage script` |
| 审稿 | `review` | 导出全文交校对，按意见改，直到明确确认；再翻译、校对译文 | `review/script.*.md`、`review/approval.json` | [文案校对](guides/script-review.md) |
| 配音 | `voice` | 文案定稿后给出 5 个配音候选的 Demo（默认只有中文，有英文版时英文另给 5 个）；契合对象，读法平实，并尽量不同于前几部已用音色。策划者点选后再合成全片。策划者若已直接指定音色，就用指定的，不再出 Demo，也不再询问 | `src/js/timing.*.js` | [文案与配音](guides/script.md) 第 9 节、`--stage voice` |
| 设计 | `design` | 比较解释方法与关键帧，选定导演方案；做有声代表段验证，再铺开 | `src/css/style.css`、`src/design/`、README 的「设计」 | [视觉设计](guides/visual.md)、`--stage design` |
| 实现 | `build` | 写场景、常驻元素、片尾；边写边查 | `src/js/` | [场景与动态](guides/scenes.md)、[引擎](reference/engine.md)、[踩过的坑](reference/pitfalls.md)、`--stage build` |
| 声音 | `sound` | 配乐先给 3 个调调的 Demo 供策划者选（契合对象与画面，有质感，史诗感收着用）；再做音效、混音 | `tools/music.py`、`out/<语言>/audio.wav` | [声音](guides/sound.md)、`--stage sound` |
| 成片 | `render` | 低清预演、正式渲染、封装、封面 | `out/` | [工具](reference/tools.md) |
| 验收 | `accept` | 自动闸门、连续观看、逐条复核经验规则，有问题就改、重渲、再查 | `review/lessons.json`、README 的「交付」 | [验收](guides/acceptance.md)、`--stage accept` |
| 交付 | `delivered` | 策划者看过并同意；片单状态改为已成片 | 片单、README | [发布与收尾](guides/release.md) |
| 发布与复盘 | `released` | 回填平台记录；收集评价与评论，提炼规则；归档、清理 | `project.json` 的 `release` 与 `reception`、`docs/log/feedback.md`、`docs/lessons.json` | [发布与收尾](guides/release.md) |

`lessons.js show --stage <阶段>` 打印该阶段要遵守的经验规则，只有几条，开工前读一遍。

## 2. 三道闸门

内容与叙事是进入制作的前提：先通读全文，检查核心问题、解释路径和取舍，再看逐句表。文案尚未成立时，工作回到取证或改稿；工具通过只说明它负责的检查通过。

| 闸门 | 之前不能做什么 | 由谁把关 |
|---|---|---|
| **文案确认** | 校对者明确确认当前稿本之前，不配音，不按稿铺开场景 | `tts.js`、`audio.js`、`render.js`、`finish.js` 等核对 `review/approval.json` 与当前内容的哈希 |
| **自动闸门与成片审查** | 自动检查、内容与叙事审查、实际视听核对及交付记录未完成前，不写「验收完成」；未解决项写明并交策划者判断 | `check.js --final` 检查一致性；人与制作方按[验收](guides/acceptance.md)核查内容与成片 |
| **策划者同意** | 策划者看过成片并明确同意之前，不登记交付、不发布 | 人 |

三条之外还有两条底线，任何时候都成立：不为通过检查而放宽阈值或改工具；不补造确认、验收或听看结论。

## 3. 改动之后从哪里重做

本节针对尚未发布的片子。已发布片按[发布后冻结](guides/release.md#发布后冻结)处理，不能因收到反馈或发现漏署名而自行套用下表重做；先取得策划者明确的重做要求。

成片是源码的产物，改了源码，成片就过期了；`check.js --final` 会查出渲染之后改过的源文件。

| 改了什么 | 从哪里重做 |
|---|---|
| 文案的含义、范围、句子增删、章节结构 | 回到审稿，确认后从配音起 |
| 读法、停顿、字幕断句（不改含义） | 记进 `review/NOTES.md`，从配音起 |
| 场景或任何入场时刻 | 从声音起（音效挂在场景的时刻上） |
| 只改样式 | 从成片起 |

## 4. 交接

准备方把前期交给制作方时：

1. 在 README 写「交接」：做完了什么、放在哪里，还有哪些没解决、哪些取舍拿不准。策划者在会话里说过的要求，原话照录进「简报」。
   交接应让接手者能复述核心问题、解释路径和证据边界；不复制通用规则，也不以材料数量代表准备完成。
2. 运行 `node kit/tools/check.js <视频> --handoff`：事实表、确认有效的文案、简报齐全才能交接。新版 FACTS 查是否填写陈述、可定位的出处与核查状态，不以字数判定；记录的真实可靠性仍要逐项复核。
3. 制作方开工时读「简报」「交接」、`research/` 与已确认的稿本；准备方留下的关于成片的建议，按 [角色与权限](roles.md) 第 4 节自行取舍。

## 5. 停工与接续

- **停工前**：更新 `project.json` 的 `stage`、`next`，在 README「状态」写清停在哪一步、为什么停、下一步依赖什么。
- **接续时**：先读 README「状态」，再核对实际文件——当前稿本的确认是否有效、时间线是不是最新、`out/` 里的成片是不是当前源码渲染的。旧的 README、历史排期、片单状态或已有的 MP4 都不能证明当前版本已经完成。计划中且仅保留简报的项目，按 [new.js 的重开方式](reference/repository.md#2-一部片子的目录)继续。
- **规则变了**：经验规则更新之后，在制的片子运行 `node kit/tools/lessons.js <视频> sync`，新增或改变的规则进入待复核。

## 6. 多个会话并行

见 [角色与权限](roles.md) 第 6 节：一个会话一个视频目录，提交用 `git commit -m "…" -- videos/<系列>/<片>/`，共享文件的改动单独提交。
