# 一个数据库引擎是如何实现的？——OLAP的MergeTree和列式存储：ClickHouse

数据库引擎系列第 5 集：ClickHouse 怎样存数据——它几乎只用 MergeTree 这一种表引擎，按列存进不再改动的片段、后台合并、用稀疏索引找数据。面向写过 SQL、没读过引擎源码的观众，约 12 分钟，只做中文。

系列：[数据库引擎](../README.md)。只遵守系列说明里写明的共同约定，其余按本片的对象设计。本片的阶段、署名、发布与评分记在 `project.json`，事实依据在 `research/FACTS.md`，文案只在 `src/js/script.js`。流程与规则见仓库的 `docs/`。

## 状态

<!-- 每次停工前更新，同时改 project.json 的 stage 与 next。开工、换模型及交接时据实更新 credits 的型号与分工，未核型号须在交付前解决。旧的记录、片单状态或已有的 MP4 都不能证明当前版本已经完成。发布后按 docs/guides/release.md 冻结：只追加发布与反馈记录，未经策划者明确要求重做，不回改制作内容或 credits。 -->

| 项 | 记录 |
|---|---|
| 当前停在哪里 | 审稿：第 1 稿与本地审片页（`out/audition/index.html`，不入库；由 `tools/audition_page.py` 生成）已交出 |
| 下一步，依赖什么 | 等 WaterRun 选定配音、配乐、视觉方向与封面，并对文案提意见；文案确认前从空数据卷按顺序完整重跑 `research/lab/01–11`（08 第一次运行卡住，留下一行多余的 Carol），数字以重跑为准 |
| 等待策划者的事 | 审片页上的五项选择；审片页「待你决定或留意的」五条 |
| 本次会话的角色 | 制作方（Claude Opus 5.5）：取证、实测、文案、配音候选、配乐小样、关键帧、封面候选 |

## 简报

<!-- 立项时写，准备方或制作方都可以写。策划者在会话里提的要求，原话与日期照录在这里，优先于任何缺省做法（docs/roles.md 第 2 节）。 -->

- 目标观众已有的知识：写过 SQL；不假定看过前几集，也不假定知道行存、索引、事务这些名词的细节。
- 看完能回答的一个核心问题：一亿人的平均年龄，ClickHouse 为什么只读一列、几毫秒就能算完？为此它放弃了什么？
- 用哪个具体例子走完解释，关键因果与边界是什么：同一张 `users(id, name, age)`，先用系列第一集的 8 行小表看「每列一个文件」，再放大到一亿行（Alice 2050 号、42 岁）；Dave 注册（一行一个片段），Ivan、Judy、Mallory 同时注册（异步插入合成一个片段），Alice 过生日（变更：只重写 age 列、其余硬链接）、注销（`_row_exists`），Bob 读的时候 Carol 写（片段快照），写到一半强行终止（临时目录与改名）。边界：数字是这台机器、热缓存、规律极强的演示数据上的实测；年龄列的压缩比不代表真实数据。
- 逐章怎样推进，各章的答案：开场（七毫秒读了什么）→ 一张表的引擎（84 种表引擎，存数据几乎只用 MergeTree；名字：不是 B 树，思路来自 LSM 树）→ 一列挨一列（每列一个文件、按排序键对齐、按块压缩；开场的答案）→ 片段与合并（文件从来不改；一次插入一个片段；后台归并；家族成员只在合并时不同）→ 稀疏索引（每 8192 行一项、二分、标记；按姓名只能读完整列）→ 改（变更生成新版本）→ 删（`_row_exists`，合并时才真删，旧片段留约十分钟）→ 同时读写（快照、不互等）→ 出错怎么办（没有预写日志；临时目录改名；不 fsync，旧片段留 8 分钟；校验和）→ 五个问题 → 取舍与衔接（JSON 也拆成列 → MongoDB）。
- 决定不讲的材料与理由：分区、副本（ReplicatedMergeTree）、跳数索引与投影、向量化执行、编码（Delta 等）、合并选择算法——与「按列存、片段、合并、稀疏索引」这条主线无关或篇幅不够；轻量更新与补丁片段只一句带过（待策划者定）。
- 时长上限与语言：约 12 分钟（系列参照，不是硬上限）；zh
- 策划者的要求（原话、日期）：
  - 「考虑项目. 考虑开始ClickHouse的视频制作. ClickHouse的黄黑视觉风格很有特色.」（2026-11-07，开工）
  - 「实现到提供我本地HTML选择」「你的任务只要做到出HTML, 今天就到这里」「HTML里还包括立体的封面哈」（2026-11-07，本次会话的目标）
  - 「不用在WSL里, 我给你物理机器」（2026-11-07）：实验改在策划者提供的一台 Linux 物理机上做（Podman 跑官方镜像，不动机器上原有的 ClickHouse 服务；机器的地址、主机名与用户名不进任何文件）
  - 「ClickHouse多引擎以及MergeTree理解比较困难, 好好想想. 另外, 思考标题要不ClickHouse(MergeTree), 毕竟是数据库引擎, 或者直接MergeTree之类的.」随后：「但是ClickHouse基本只有MergeTree, 和MySQL多引擎用不同, 好好思考怎么设计, 还是标题就ClickHouse, 视频中体现多个引擎和专注的MergeTree」（2026-11-07）：片中第一章交代表引擎与 MySQL 的不同，再专注 MergeTree
  - 「标题改为: ClickHouse: OLAP的MergeTree和列式存储 吧」「MongoDB也改一个合适的标题」「Redis标题体现键值对」「和我探讨新标题」（2026-11-07，看过审片页后）：商量后定为「一个数据库引擎是如何实现的？——OLAP的MergeTree和列式存储：ClickHouse」（与各集同一句式「特点：引擎名」，WaterRun 选定）；同时 MongoDB 改为「不是SQL：MongoDB的WiredTiger」（WaterRun 自拟），Redis 改为「内存里的键值对：Redis」，改在片单

## 设计

<!-- 制作方写，方法见 docs/guides/visual.md 第 3 节。 -->

审片页（2026-11-07）给出的方向，等策划者选定后再写定：

- **视觉材料**：官网的黄 `#FAFF69` 与近黑 `#151515`、Inter 与等宽字体（`research/MATERIALS.md`）；不放产品标志，竖条只作「列」本身。三个关键帧方向（`src/design/kf-a/b/c.html`）：A 黄黑平面（终端式、数据密）、B 立体质感（片段是有厚度的黄板，合并时叠起来）、C 黄底海报（大数字揭示）。与前几集（MyISAM 终端、InnoDB、PostgreSQL 学院派、SQLite 一个文件）一眼可分。
- **贯穿的对象**：一个片段目录，从插入、合并、被读、被变更、被标记删除、被快照留住到崩溃后被清理，全片都在它身上发生。
- **封面候选**（`src/design/cover-a/b/c.html`）：A「只读一列」、B「片段合并」、C「稀疏索引」，都按系列封面约定（PART 5、问句、大标题、立体图、实测数据）。
- **配音**：本系列男女声交替，本集男声；5 个本系列没用过的 MiniMax 男声，语速对齐到每秒约 4.9 字（`tools/audition_voices.py`）。
- **配乐**：3 段小样（`tools/music_sketch.py`）：A「秒级」124 拍、B「列」100 拍、C「合并」88 拍，与前几集的速度与配器区分开。制作方无法实际听，只核对了合成与响度。

## 交付

<!-- 验收后写：成片文件、规格、时长、响度（在最终文件上测，F08）；check.js --final 的结论；review/lessons.json 里记为 open 的条目；实际看过、听过的范围，以及没看、没听的部分。Credit：对照哪些会话、审稿与交接记录核对了参与者；逐个语言与交付版本记录实际片尾时刻、型号与分工核对结论，未核的如实写。 -->

<!-- 开源交付（第三方制作也必须填写）：GPL-3.0-or-later；与本版成片对应的公开源码地址及提交号/标签；可编辑工程和必要外置音画材料的地址及校验和；制作环境与步骤；第三方材料的许可和使用、再分发依据。检查项目见 docs/reference/third-party.md，不预填通过。 -->

## 评价与复盘

<!-- 发布后写：策划者的评分与原话（同时记进 docs/log/feedback.md 并引用 P 编号）、观众反馈摘要、这部片子做对了什么、做错了什么，以及建议补进经验规则的东西。 -->

## 复现

```bash
node kit/tools/script-review.js videos/database-engines/clickhouse check   # 核对当前稿本的人工确认
node kit/tools/tts.js     videos/database-engines/clickhouse               # 合成旁白，更新时间线
node kit/tools/check.js   videos/database-engines/clickhouse               # 制作期总闸门
node kit/tools/audio.js   videos/database-engines/clickhouse               # 混音
node kit/tools/render.js  videos/database-engines/clickhouse               # 渲染
node kit/tools/finish.js  videos/database-engines/clickhouse               # 封装成片
node kit/tools/covers.js  videos/database-engines/clickhouse               # 封面
node kit/tools/check.js   videos/database-engines/clickhouse --final       # 交付前总闸门
```
