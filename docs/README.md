# 文档地图

本目录是仓库级的规则与手艺。读文档是为了做事：按手上的任务读对应的几篇，不需要通读。

## 1. 三个层级

| 层级 | 位置 | 放什么 |
|---|---|---|
| **仓库级** | 根目录、`docs/`、`kit/` | 对所有片子都成立的东西：宗旨、角色、流程、标准、经验规则、工具与引擎 |
| **系列级** | `videos/<系列>/README.md`、`kit/starters/` | 一个系列的定位与少数共同约定；系列的起点代码 |
| **视频级** | `videos/<系列>/<片>/`、`videos/standalone/<片>/` | 一部片子的一切：简报、事实、文案、审稿、源码、交付、发布、评价与复盘 |

下一级不重复上一级的规则，只写自己特有的；上一级不写某一部片子的细节，需要举例时链接过去。

## 2. 按任务阅读

| 要做的事 | 读 |
|---|---|
| 第一次来 | [宗旨与原则](principles.md) → [快速入门](getting-started.md) |
| 做一部片子（任何角色） | [角色与权限](roles.md) → [制作周期](process.md) → 本片 README → 当前阶段的专题与 `lessons.js show --stage <阶段>` |
| 只做前期（准备方） | [角色与权限](roles.md) 第 3 节 → [取证](guides/research.md) → [文案与配音](guides/script.md) → [文案校对](guides/script-review.md) |
| 判断成片是否合格 | [质量标准](standards.md) → [经验规则](lessons.md) → [验收](guides/acceptance.md) |
| 发布、收集反馈、归档清理 | [发布与收尾](guides/release.md) |
| 开一个系列或加一集 | [系列](guides/series.md) → `videos/<系列>/README.md` |
| 查看开发安排 | [开发计划](development-plan.md) → [片单](../videos/README.md) |
| 改工具、引擎或模板 | [仓库结构](reference/repository.md) → [工具](reference/tools.md) → [引擎](reference/engine.md) → [踩过的坑](reference/pitfalls.md) |
| 装环境、换机器 | [环境](reference/environment.md) |

## 3. 全部文档

**核心**（规则本身）

| 文档 | 内容 |
|---|---|
| [principles.md](principles.md) | 宗旨：自由软件、自由视频、共产主义；制作原则 |
| [roles.md](roles.md) | 策划、校对、准备方、制作方、维护者各自的权限；冲突时谁说了算；署名；并行与提交 |
| [process.md](process.md) | 制作周期：阶段、三道闸门、改动后的重做、交接、停工与接续 |
| [standards.md](standards.md) | 成片的质量标准 |
| [lessons.md](lessons.md) | 经验规则：从反馈提炼出的通用规则，按阶段排列（由 `lessons.json` 生成） |
| [getting-started.md](getting-started.md) | 从 clone 到第一部片子 |

**计划**

| 文档 | 内容 |
|---|---|
| [development-plan.md](development-plan.md) | 2026 年 10 月 20–31 日开发安排，共 19 部片 |

**专题**（怎样做好一个阶段）

| 文档 | 内容 |
|---|---|
| [guides/research.md](guides/research.md) | 取证：出处、实验、材料、脱敏 |
| [guides/script.md](guides/script.md) | 文案的写法、多语言、读法、配音与音色记录 |
| [guides/script-review.md](guides/script-review.md) | 人工校对：导出、意见、确认、确认后的修改 |
| [guides/visual.md](guides/visual.md) | 视觉系统、关键帧、封面 |
| [guides/scenes.md](guides/scenes.md) | 场景、镜头、动作、换场、节奏 |
| [guides/sound.md](guides/sound.md) | 音效、配乐、混音 |
| [guides/acceptance.md](guides/acceptance.md) | 自动闸门、成片审查、经验规则复核、交付记录 |
| [guides/release.md](guides/release.md) | 发布回填、反馈收集与提炼、归档、清理、恢复 |
| [guides/series.md](guides/series.md) | 系列：共同约定与起点代码 |

**参考**（查的时候再看）

| 文档 | 内容 |
|---|---|
| [reference/repository.md](reference/repository.md) | 目录与文件的约定、单一来源、生成文件 |
| [reference/tools.md](reference/tools.md) | 工具速查与 `project.json` 字段 |
| [reference/engine.md](reference/engine.md) | 引擎函数 |
| [reference/pitfalls.md](reference/pitfalls.md) | 踩过的坑 |
| [reference/environment.md](reference/environment.md) | 环境、两台机器、空间 |
| [reference/third-party.md](reference/third-party.md) | 第三方组件、许可与商标 |

**记录**（只追加的历史，做事时不必读）

| 位置 | 内容 |
|---|---|
| [log/feedback.md](log/feedback.md) | 策划者评价与观众评论的原始记录（P、C 编号） |
| [log/reviews/](log/reviews/) | 成片测绘与评分复盘 |
| [log/plans/](log/plans/) | 过去的排期 |
| [log/history.md](log/history.md) | 仓库自身的大事：迁入、重构 |

## 4. 信息归属

每一类信息只有一个存放处。要写一样东西，先查这张表；要改一条规则，只改它的源头。

| 信息 | 唯一来源 | 派生（由工具生成，不手改） |
|---|---|---|
| 选题、系列归属、标题、语言、片单状态 | `videos/catalog.json` | `videos/README.md`、各系列说明的分集表 |
| 当前开发日期与同日顺序 | `docs/development-plan.md` | — |
| 系列的定位与共同约定 | `videos/<系列>/README.md` | — |
| 一部片子的阶段、署名、发布记录、评分 | 该片 `project.json` 的 `stage`、`credits`、`release`、`reception` | 片尾名单、`videos/README.md` |
| 一部片子的简报、设计决定、交付说明、复盘 | 该片 `README.md` | — |
| 事实 | 该片 `research/FACTS.md` 与证据 | 画面数据（`tools/gen_data.py` → `src/js/data.js`） |
| 文案 | 该片 `src/js/script.js` | 校对稿、配音输入、字幕 |
| 文案确认 | 人的明确确认，记在 `review/NOTES.md` | `review/approval.json` |
| 经验规则的复核结论 | 该片 `review/lessons.json` | — |
| 原始反馈（评价、评论） | `docs/log/feedback.md` | — |
| 通用规则 | `docs/lessons.json`、`docs/standards.md` | `docs/lessons.md` 的规则表 |
| 引擎与工具的用法 | 源码开头的注释 | `docs/reference/*.md` 的速查 |

## 5. 维护：控制熵

文档会自然地变长、变散、互相矛盾。下面几条用来对抗它，`repo-check.js` 能查的都已接入。

1. **一处来源。** 同一条规则只写在一个地方，别处用链接或编号引用，不复述。新反馈不往五个文档里各抄一遍，只进 `docs/log/feedback.md`（原话）和 `docs/lessons.json`（规则）。
2. **分级。** 某一部片子的细节（时长、发布链接、评分、某一帧的问题）只写在那一部的目录里。根 README 不列发布链接；系列说明不写某一集的设计决定。
3. **规则要通用。** 经验规则写成对所有片子都成立的话，片名只出现在「案例」里。能用工具查的，做进工具。
4. **记录与规则分开。** 只追加的历史放进 `docs/log/`，不是必读；规则文档里不写「某日某人说了什么」。
5. **新增文档先登记。** `docs/` 下的每个文件都要出现在本页第 3 节，否则 `repo-check.js` 报错。宁可扩写已有的一篇，也不新开一篇。
6. **生成的就别手改。** 标着「由工具生成」的文件与区段，改源头再重新生成。
7. **改规则同时改落点。** 规则变了，同步对应的模板、工具与测试，并运行 `npm test`、`npm run check:repo`。
