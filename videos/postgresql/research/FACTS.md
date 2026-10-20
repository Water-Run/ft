# PostgreSQL 事实表

取证日期：2026-10-19（UTC+8）。对象：**PostgreSQL 18.4 / Windows x86-64**，以 heap 表访问方法、B-tree / GiST / GIN、部分索引与事务机制为重点。比较对象：MySQL 9.7 手册所述 InnoDB 默认行存储机制；系统能力与采用案例单独标注。本文是旁白、画面、标题和说明中的事实入口；文案 cue 的 `facts` 字段关联本表编号。

## 取证环境与材料身份

- 使用本机已有 PostgreSQL 18.4 二进制；新建独立集群、合成数据与随机本机端口，不连接现有服务。实例已停止，未改已有 PostgreSQL 安装或服务。没有容器、远端数据库或在线语音调用。
- Python 3.14.3，psycopg 3.3.5；实际 SQL、设置、页快照、错误码和执行计划见 [out_01_probe.json](lab/out_01_probe.json)，恢复日志见 [out_01_recovery.log](lab/out_01_recovery.log)。完整页样本只在忽略目录 `research/_src/`。
- 实查：页 8192 字节，默认隔离级别 read committed，`fsync=on`、`synchronous_commit=on`、`full_page_writes=on`、校验和开启。仅为控制实验时机关闭 autovacuum，不作为生产建议。
- 源码固定 tag **REL_18_4**，提交 **f5cc81719e6da4cbdb1f797c48b693e91018153a**。23 份选定源码/文档的 URL、SHA-256 和符号行号见 [sources.json](sources.json)。手册网页是 18 系列的在线版本，内部细节同时以该固定源码与本机实验核对，不把在线小版本当成本机版本。
- 当前稳定维护网页另有 [18.6 发行记录](https://www.postgresql.org/docs/18/release-18-6.html)，2026-08-13。本片锁定 18.4 做机制取证，不声称采用最新补丁，也不讨论版本安全差异。
- 失败的试跑没有进入有效实验结果：初次角色名使用了不允许的 `pg_` 前缀，已更名；Windows 后台进程继承 PIPE 导致控制程序等待，已改为文件捕获控制输出并重新运行。最终实验完整成功，旧失败实例均已停止。

## 开场：MySQL 与 PostgreSQL 的位置

以下均为发布者的调查结果，**不代表全球装机、收入、数据量或性能份额**。各年受访者构成与人数变化，不能把多选题比例当互斥市场份额，也不能据排名推导迁移原因。

| 编号 | 可进入片中的陈述与范围 | 两路核对、来源日期与状态 |
|---|---|---|
| S01 | Stack Overflow 2022 数据库题，全部答题者中 MySQL 46.85%，PostgreSQL 43.59%；MySQL 当年居首。可以作为“曾经的开源王者”的具体统计背景，称号本身属于策划评价。 | [2022 官方调查](https://survey.stackoverflow.co/2022/#section-most-popular-technologies-databases)的 All Respondents 表，与 2023 发布者的“取代 MySQL 首位”说明交叉；2022 / 2023，2026-10-19 已读原文。 |
| S02 | 2023 年该调查全部答题者口径，PostgreSQL 45.55%、MySQL 41.09%，数据库题 n=76,634；发布者明确说明 PostgreSQL 当年取得 MySQL 的首位。 | [2023 官方数据库部分](https://survey.stackoverflow.co/2023/#most-popular-technologies-database)的说明与表格，并与 S01 前一年的顺序核对；已核实。不能写所有统计均在 2023 首次反超，职业开发者子样本不同。 |
| S03 | 2026 年数据库题全部答题者 n=12,061，PostgreSQL 6,984 人 / 57.9%，MySQL 4,235 人 / 35.1%；PostgreSQL 居该题首位。 | [2026 官方表与 JSON](https://survey.stackoverflow.co/2026/technology/data/databases)，由人数÷该题人数复算至一位小数；[方法说明](https://survey.stackoverflow.co/2026/methodology)列全调查 30,903 份有效回答、2026-06-23 至 08-05 收集。不能把全调查人数当该题分母。已核实。 |
| S04 | 调查自报过去一年实际开发使用的数据库，可多选；不能由此断言 MySQL 用户逐个迁往 PostgreSQL，或 PostgreSQL 技术在所有负载更优。 | 2023 / 2026 原题与方法；这是对已读统计范围的限定，不是另外一项市场结论。已核实。 |
| S05 | Stack Overflow 开发者调查数据库题「全部答题者」口径，MySQL / PostgreSQL 使用比例：2018 58.7% / 32.9%，2019 54.0 / 34.3，2020 55.6 / 36.1，2021 50.18 / 40.42，2022 46.85 / 43.59，2023 41.09 / 45.55，2024 40.3 / 48.7，2025 40.5 / 55.6，2026 35.1 / 57.9。MySQL 在 2018–2022 年居该题首位，PostgreSQL 自 2023 年起连续四年居首。 | 各年官方原页（[2018](https://survey.stackoverflow.co/2018/)、[2019](https://survey.stackoverflow.co/2019/)、[2020](https://survey.stackoverflow.co/2020/)、[2021](https://survey.stackoverflow.co/2021/)、[2024](https://survey.stackoverflow.co/2024/technology)、[2025](https://survey.stackoverflow.co/2025/technology)；2022、2023、2026 见 S01–S03），由 `lab/10_survey_trend.py` 从缓存原页按 All Respondents 标签提取，输出与原页哈希见 `lab/out_10_trend.json`。2024 原页说明“2018 年 PostgreSQL 约 33%、MySQL 约 59%”“PostgreSQL 连续第二年最流行”，2019 原页说明 MySQL 仍最常用，与提取结果一致。2026-10-19 已核。各年样本与题目措辞不同（2024 起问“过去一年做过大量开发工作”的数据库），折线表示该调查各年的结果，不是市场份额，也不是同一批人的迁移。“最主流”只限于“在这项开发者调查中使用最多”。 |

数据署名：Stack Exchange Inc.，Stack Overflow Developer Survey，相应年份；2026 数据按发布页所示 **ODbL 1.0** 使用。图表展示题目、年份、全部答题者、多选及该题 n；不混用 Professional Developers 或想用比例。

## 系列接续：同一组问题、同一批数据

2026-10-19 本轮改稿按 WaterRun 明确要求，把 MyISAM → InnoDB → PostgreSQL → 后续 Firebird 作为连续的实现比较。各集仍须独立可懂；比较出现时重述必要条件，不要求记住前集编号。前两片的脚本、示例数据及所引用原始材料已逐项核对，摘录与文件哈希保存在本片 `lab/out_07_series.json`，后续运行不依赖另一片目录。

| 编号 | 可进入片中的陈述与范围 | 依据与状态 |
|---|---|---|
| C01 | MyISAM 把行数据与索引分别放在 .MYD、.MYI；首集由这些文件说明数据怎样存、怎样查。与 Pg 默认 heap 比较时，只比较“数据与索引分开”和索引定位方式，不把页格式或指针字段画成相同。 | MySQL 5.5.62 原始 `include/myisam.h:57–58` 的文件扩展名；首集八行表的 .MYD / .MYI 实物快照与脚本 s2 b5–b6、s6 f13–f14；本片 T04、T09。原始文件与选中片段的 SHA-256 见 `out_07_series.json`。2026-10-19 重新读取，已核。 |
| C02 | InnoDB 一集沿同一读写问题加入事务、undo 旧版本、锁与 redo 恢复；结尾提出继续比较另一套实现。本集在主键路径、版本存放和日志重做处接续，并把机制条件在本片讲全。 | 前集 s10 的 k2、k4、k4b、k9 与相应正文；本片已核的 T01、T10、T14、T19–T21。`out_07_series.json` 保存原句与脚本哈希。这是对实际前集内容的核对，不把旧片所有简化表述照搬进新稿。已核。 |
| C03 | 本片沿用前两集 users(id,name,age) 的八条业务数据，包括 id=1 / alice / 30。字段类型、物理布局、环境与版本分别注明，不用相同业务值暗示字节格式一致。 | 前两集建表 SQL 与本片 `lab/00_schema.sql` 的八行值逐项比对；完整值、各 SQL 的哈希见 `out_07_series.json`。已核。 |
| C04 | 系列顺序为 MyISAM、InnoDB、PostgreSQL、Firebird；结尾提 Firebird 是接续制作计划，不在本片提前宣称其技术特点或性能结论。 | 当前 `videos/catalog.json` 数据库引擎系列顺序，与 WaterRun 本轮明确说明一致；相关条目保存在 `out_07_series.json`。已核计划，不作 Firebird 技术取证。 |
| C05 | MyISAM 与 InnoDB 都是 MySQL 的存储引擎；在 MySQL 9.7 中 InnoDB 是默认存储引擎，CREATE TABLE 默认建 InnoDB 表。 | [MySQL 9.7 手册 Alternative Storage Engines](https://dev.mysql.com/doc/refman/9.7/en/storage-engines.html)原文：“InnoDB is the default and most general-purpose storage engine”“MyISAM: These tables have a small footprint…”。脚本抓取返回 403，2026-10-19 经网页工具读取原文。只引用 9.7 的默认值，不写 InnoDB 自哪个版本成为默认。 |

## 历史、名称与人物

| 编号 | 可进入片中的陈述与范围 | 依据与核查状态 |
|---|---|---|
| H01 | E. F. Codd 于 1970 年发表关系模型论文。将“关系数据库之父”落到 Codd 的理论贡献；不能把他写成 POSTGRES 项目负责人。 | [IBM Research 的原论文条目](https://research.ibm.com/publications/a-relational-model-of-data-for-large-shared-data-banks)（1970-06-01）与 [IBM 历史](https://www.ibm.com/history/relational-database)；1970，2026-10-19 交叉已核。 |
| H02 | 1970 年代伯克利 Ingres 由 Stonebraker、Eugene Wong 等参与开发，是早期关系数据库实现；不是 Stonebraker 独自编写。 | [伯克利 Stonebraker 简介](https://www2.eecs.berkeley.edu/Faculty/Homepages/stonebraker.html)、[Wong 简介](https://www2.eecs.berkeley.edu/Faculty/Homepages/wong.html)；Hellerstein 回顾 §1.1 与参考文献 1976 年的《The Design and Implementation of INGRES》。已核；正文不用未交叉确认的精确开工年份。 |
| H03 | Stonebraker 领导的伯克利 POSTGRES 实现于 1986 年开始。POSTGRES 是 Post-Ingres，即 Ingres 之后的系统，研究方向包括可扩展类型和访问方法。 | [18 手册历史 §2.1](https://www.postgresql.org/docs/18/history.html#HISTORY-BERKELEY)与 [Hellerstein 亲历回顾 §2](https://arxiv.org/html/1901.01973v1#S2)，2019-01-07；固定源码 `doc/src/sgml/history.sgml:39` 交叉。已核。不得说 post 表示“SQL 之后”或“后关系数据库”这一单一含义。 |
| H04 | PostgreSQL 的谱系包括理论、研究原型、学生和维护者的长期工作。Stonebraker 获 2014 年度图灵奖，不能把现代整个社区系统归为一人所写。 | [伯克利奖项记录](https://www2.eecs.berkeley.edu/Faculty/Homepages/stonebraker.html)的 2014 ACM A.M. Turing Award；[ACM 50 周年官方获奖名单](https://www.acm.org/binaries/content/assets/awards/turing50-program.pdf)；Hellerstein 摘要与 §3.1 对开发团队、开源维护的区分。已核；年度 2014 与 2015 公布/颁奖日期分开。 |
| H05 | 1994 年 Andrew Yu 与 Jolly Chen 为 POSTGRES 加入 SQL 解释器；随后以 Postgres95 发布。查询语言从 PostQUEL 转向 SQL。 | [官方历史 §2.2](https://www.postgresql.org/docs/18/history.html#HISTORY-POSTGRES95)、固定 `history.sgml:101`，Hellerstein §3.1 对 Postgres95 的独立回顾。已核。人物并列，不写成单人开发。 |
| H06 | 1996 年选择 PostgreSQL 这个名称；6.0 于 **1997-01-29** 发布。Postgres 仍是官方认可的项目名称。 | [官方历史 §2.3](https://www.postgresql.org/docs/18/history.html#HISTORY-POSTGRESQL)与 [6.0 原发行记录](https://www.postgresql.org/docs/9.0/release-6-0.html)；Hellerstein §3.1 社区接续。已核。名称选择与首个该名称版本的发布日期不能合并。 |
| H07 | 今天的 WAL 与版本实现经历了社区演进，不能把 1980 年代原型存储研究直接当成现代实现。 | Hellerstein §2.3 对原型无覆盖存储/恢复研究的回顾，与本机 18.4、`xact.c`、`xlogrecovery.c` 的 WAL 路径。已核。原型“无传统 WAL”不用于描述现代 PostgreSQL。 |
| H08 | 6.5 引入 MVCC；7.1 引入 WAL。这是相关发行版本的记录，不等同于概念的首次发明。 | [6.5 发行记录](https://www.postgresql.org/docs/7.1/release-6-5.html)、[7.1 发行记录入口](https://www.postgresql.org/docs/7.1/release.html)；只作研究索引，精确年代与独立同期公告未做第二路核对，**本轮正文及画面不使用**。 |
| H13 | 关系模型提出后需要实际系统来证明可行；1973 年 IBM 开始以工业强度实现 System R，SQL 由同一研究方向的 Chamberlin 与 Boyce 设计。关系模型让表之间按值关联，用户不必关心数据怎样、在哪里存放。 | [IBM 关系数据库历史](https://www.ibm.com/history/relational-database)（缓存 `_src/sources/ibm-history.txt`）：“had to be tested to address skepticism”“A group of programmers in 1973 undertook an industrial-strength implementation: the System R project”“Concurrently, Chamberlin and Boyce developed SQL”，以及 Chamberlin 对“values”“not be concerned about the details of where or how the data was stored”的说明。2026-10-19 已核。不写 System R 是“第一个”关系数据库；IBM 同页另说 Oracle 1977 年推出首个商用关系数据库。 |
| H14 | Ingres 与 IBM System R 同获 1988 年 ACM 软件系统奖（Ingres：Held、Stonebraker、Wong）。1980 年 Wong、Stonebraker、Rowe 创办 Relational Technology, Inc.（后改名 INGRES Corporation）将其商业化。 | [Eugene Wong 伯克利页面](https://www2.eecs.berkeley.edu/Faculty/Homepages/wong.html)（缓存 `wong.txt`）：“ACM Software System Award in 1988 for his work on INGRES”“co-founded … Relational Technology, Inc. … later renamed the INGRES Corporation”；[ACM 软件系统奖获奖名单](https://en.wikipedia.org/wiki/ACM_Software_System_Award)（缓存 `wiki-ssa.html`）列 1988 INGRES 与 System R 两项；Hellerstein 回顾“as RTI had commercialized Ingres”。ACM 官网页面脚本与网页工具均返回 403，未读到原页；Stonebraker 伯克利页写作 1992 年，与 Wong 页及获奖名单冲突，采用 1988。 |
| H15 | Stonebraker 把 Postgres 的模型称为“对象关系”：在关系查询之上支持用户定义的类型、函数等扩展；Hellerstein 认为今天几乎所有商业关系数据库都已是“对象关系”系统。 | [Hellerstein 回顾](https://arxiv.org/html/1901.01973v1)（缓存 `hellerstein.txt`）：“Stonebraker branded the Postgres model as ‘Object-Relational’”“Today, essentially all commercial relational database systems are ‘Object-Relational’ database systems”；[Pg 官方 About](https://www.postgresql.org/about/) 自称 object-relational database system。这是亲历者的评价，片中表述为“基本都吸收了这套思路”，不写成精确统计。 |
| H16 | PostgreSQL 官方说明：截至 2025 年 9 月发布的 18 版，至少符合 SQL:2023 Core 177 项必选特性中的 170 项；目前没有关系数据库完全符合该标准。官方另称核心平台已有近 40 年的活跃开发。 | [Pg 官方 About](https://www.postgresql.org/about/)（缓存 `compare-pg-about.txt`）原文：“conforms to at least 170 of the 177 mandatory features for SQL:2023 Core conformance”“no relational database meets full conformance with this standard”“nearly 40 years of active development”。2026-10-19 已核。不据此排名各数据库的标准符合度。 |
| H17 | “正统的关系数据库”是本片对 PostgreSQL 的评价，依据为：谱系直接来自伯克利 Ingres 与 POSTGRES（H02、H03），创始人因数据库系统的基础贡献获 2014 年图灵奖（H04），以及对 SQL 标准的高符合度（H16）。 | 由 H02–H04、H14–H16 归纳的策划评价，与 S01“开源王者”称号同类；不是第三方排名或认证。 |
| H18 | MySQL 第一个版本出现于 1995 年 5 月（内部版本），由 Widenius 与 Axmark 于 1994 年开始开发；PostgreSQL 的源头 POSTGRES 始于 1986 年（H03），早约九年。片中「老前辈」「复兴」是本片的评价：依据为源头年代（本条）与 2018–2026 调查比例从 32.9% 升到 57.9%（S05）。 | [Wikipedia MySQL 条目](https://en.wikipedia.org/wiki/MySQL)（缓存 `_src/sources/wiki-mysql.html`）：“Original development of MySQL by Widenius and Axmark began in 1994. The first version of MySQL appeared on 23 May 1995.”；Oracle MySQL 官方博客《MySQL Retrospective – The Early Years》据检索摘要也写 1995 年 5 月首版，但页面返回 403，未读到原文；MySQL 9.7 手册历史页没有给出年份。2026-10-19 核。只比较源头年代，不写 PostgreSQL 这个名字早于 MySQL（PostgreSQL 定名于 1996 年，H06）。 |

“数据库之父”没有全领域唯一、统一授予的称号。正文用“Codd 提出关系模型”“Stonebraker 与同事实现 Ingres、领导 POSTGRES”解释贡献；不根据头衔推导具体机制的发明权。

## 独立的 OLTP 系统：约束与事务

| 编号 | 可进入片中的陈述与范围 | 实验、源码及手册依据 |
|---|---|---|
| T01 | PostgreSQL 是完整对象关系数据库管理系统，包含解析、规划、执行、事务和存储；InnoDB 是 MySQL 内的存储引擎。PostgreSQL 也提供表访问方法接口，默认 heap 不能被误写成唯一可能存储形式。比较时选相同的存储/并发职责，不把二者当相同层次的可插拔组件。 | [PostgreSQL 内部概览](https://www.postgresql.org/docs/18/overview.html)、[表访问方法接口](https://www.postgresql.org/docs/18/tableam.html)、固定 `src/backend/tcop/postgres.c:1012` 的 `exec_simple_query`；[MySQL InnoDB 章节](https://dev.mysql.com/doc/refman/9.7/en/innodb-storage-engine.html)。2026-10-19 已核；未测所有表访问方法。 |
| T02 | 本片用 OLTP 指频繁进行短事务、读取或修改少量业务记录的处理模式，例子是用户资料与同笔说明的更新；不是分析型大扫描的性能评测。 | [IBM 的 OLTP 定义与特征](https://www.ibm.com/think/topics/oltp)的短小事务/少量记录、多用户、原子性，与 [PostgreSQL 事务教程](https://www.postgresql.org/docs/18/tutorial-transactions.html)和本片演示任务对应；2026-10-19 已读原文。定义作为本文范围，不据此宣称所有 PostgreSQL 使用都属于 OLTP。 |
| T03 | 重复主键实际被拒绝；同一事务中对 users 和 notes 的修改可共同回滚。事务把多条语句作为一个工作单元。 | `out_01_probe.json` 的 `duplicate_primary_key_rejected`（23505）、`two_table_rollback`，对应完整 SQL；[事务教程](https://www.postgresql.org/docs/18/tutorial-transactions.html)、[约束](https://www.postgresql.org/docs/18/ddl-constraints.html)。已核。不是 PostgreSQL 独有能力，不写 MySQL 没有事务或约束。 |

## 数据怎样放

| 编号 | 可进入片中的陈述与范围 | 实验与固定源码交叉依据 |
|---|---|---|
| T04 | 实验中 users 的 heap 主文件与两个索引分别存储；主键索引不承载整行。普通 heap 不保证按主键物理排列。 | `layout`：users 8192 字节，users_pkey / users_name_idx 各 16384 字节；`index_meta` 根页 1、level 0；[文件布局 §66.1](https://www.postgresql.org/docs/18/storage-file-layout.html)；`src/backend/access/nbtree/README`。已核。B-tree 页数包括元页，不把两页说成两层树。 |
| T05 | 当前构建页大小 8192 字节。初始页中固定页头 24 字节、8 个各 4 字节的项目指针；行版本从页尾向前放，中间留连续空闲区。 | 设置 `block_size=8192`；`snapshots.before.header` 的 lower=56、upper=7808；[页布局 §66.6](https://www.postgresql.org/docs/18/storage-page-layout.html)；`bufpage.h:159`、`itemid.h:25`。已核。不是所有自定义构建都只能使用 8 KiB。 |
| T06 | 一个行版本还包含事务与状态信息，`xmin` 是创建该版本的事务号；`xmax` 可表示删除/更新或锁信息。可见性需要事务状态、快照与标志，不能只比较两个数。 | 实验页字段与 SQL 的 xmin/xmax；`htup_details.h:130` 的 `HeapTupleFields`，`heapam_visibility.c:960` 的 `HeapTupleSatisfiesMVCC`。已核；当前是单一更新者的简化例子，不把 xmax 非零画成恒等“已删除”。 |
| T07 | `ctid` 是页号与页内项目号，属于行版本的物理位置，更新后可能改变，不是永久业务身份。 | 初始 id=1 `(0,1)`，更新后 `(0,9)`；`new_ctid_changed`；`htup_details.h` 对 t_ctid 的说明与[系统列](https://www.postgresql.org/docs/18/ddl-system-columns.html)。已核。 |

## 数据怎样找

| 编号 | 可进入片中的陈述与范围 | 依据 |
|---|---|---|
| T08 | 一次查询先解析、分析/重写、规划，再由执行器执行。基于代价与统计信息选择计划，不保证有索引必用。 | `postgres.c:604,971,1012` 与[查询路径](https://www.postgresql.org/docs/18/query-path.html)；实际 plans.small 选择 Seq Scan，plans.many 选择 Index Scan。已核；8 行与 20,000 行是不同规模的受控表，不当跨数据库性能评测。 |
| T09 | 选中的普通 B-tree 索引扫描以索引键取得堆位置，再取行版本并检查可见性。部分条件下 index-only scan 可减少堆访问，不能说所有查询必回堆。 | `index_items` 的 ctid；`nodeIndexscan.c:80`，`heapam_visibility.c:960`；[仅索引扫描](https://www.postgresql.org/docs/18/indexes-index-only-scans.html)。已核。演示查询选 name、age，users_pkey 不覆盖它们。 |
| T10 | InnoDB 的主键聚簇索引叶子存行数据，二级索引带主键；PostgreSQL 当前 heap 与索引分离，索引引用堆位置。这是路径差异，不足以单独推出性能胜负。 | [MySQL 9.7 §17.6.2.1](https://dev.mysql.com/doc/refman/9.7/en/innodb-index-types.html)已通过网页工具读到原文；本机 requests 抓取被拒，`sources.json` 如实记 unavailable，不能冒称已缓存。PostgreSQL 对照 T04/T09；MySQL 同版既有测绘作为辅助背景，不作为本片运行依赖。已核。 |

## 更新、快照与写冲突

| 编号 | 可进入片中的陈述与范围 | 依据 |
|---|---|---|
| T11 | 把 id=1 年龄 30 改为 31，实际产生第二个 heap 行版本。老版本仍有 30，旧 t_ctid 指到新版本；新版本 xmin 对应更新事务。 | `snapshots.uncommitted`：lp1 / lp9，旧 t_ctid `(0,9)`，年龄数据 `1e00` / `1f00`；`heapam.c:3242` 的 heap_update、`htup_details.h`。已核。 |
| T12 | 未提交时，另一连接普通 SELECT 读到 30；提交后，默认 Read Committed 下的新语句读到 31；在更新前已取快照的 Repeatable Read 事务仍读 30。 | 检查 `uncommitted_reader_sees_30`、`rc_next_statement_sees_31`、`rr_keeps_30`；完整 BEGIN、SELECT、COMMIT 顺序；[隔离级别 §13.2](https://www.postgresql.org/docs/18/transaction-iso.html)与固定 mvcc.sgml。已核。RC 是每条命令的新快照，不描述成全事务固定快照。 |
| T13 | 本例普通读取不必等待该行更新提交；另一连接更新同一行会等待，设置 300ms lock_timeout 后得到 55P03。MVCC 不等于无锁。 | `conflicting_update_times_out` 与错误；`heapam.c` 更新锁路径；[显式锁](https://www.postgresql.org/docs/18/explicit-locking.html)。已核。未测所有 DDL、锁定读与序列化冲突，不泛化为任何读写都不阻塞。 |
| T14 | InnoDB 也有 MVCC；其聚簇记录和 undo 信息用于重建旧版本，而当前 PostgreSQL heap 保留独立的行版本。两边都要维护历史信息。 | [MySQL 9.7 §17.3](https://dev.mysql.com/doc/refman/9.7/en/innodb-multi-versioning.html)的旧版本、DB_ROLL_PTR、purge 原文已由网页工具读取；PostgreSQL T11/T12 与源码。已核。不能说 InnoDB 无 MVCC，不能说 PostgreSQL 完全没有任何 undo 概念。 |

## 版本维护及实际成本

| 编号 | 可进入片中的陈述与范围 | 依据 |
|---|---|---|
| T15 | 本例只改非索引年龄列且同页有空间，发生 HOT 更新，可沿页内版本链复用索引引用；改索引列 name 则不走该 HOT 条件。 | `HEAP_HOT_UPDATED` / `HEAP_ONLY_TUPLE` 实际标志、页内 lp1→lp9；`indexed_update` 与 name 索引新项；`heapam.c:4009`、`README.HOT`、[HOT §66.7](https://www.postgresql.org/docs/18/storage-hot.html)。已核。BRIN 等摘要索引在 18 系列有例外，正文限定本例 B-tree，不把“没有改任何索引”当所有实现的绝对条件。 |
| T16 | 仍可能被旧快照使用的老版本不能回收。固定 RR 快照时 VACUUM 保留 lp1 的旧数据；释放后再 VACUUM，lp1 成为重定向，旧元组空间回收。 | `snapshots.vacuum_pinned`、`vacuum_released`；两项实验检查；`vacuumlazy.c` 与 [常规 VACUUM](https://www.postgresql.org/docs/18/routine-vacuuming.html)。已核。不能把回收元组说成项目指针必被物理删除。 |
| T17 | 常规 VACUUM 通常把空间留给表复用，不保证把所有空间归还操作系统；自动清理与冻结承担持续维护。长期持有快照会妨碍可回收版本推进。 | 实验 users 主文件仍一页；[常规清理 §24.1](https://www.postgresql.org/docs/18/routine-vacuuming.html)、vacuumlazy.c；文档对尾部截断和 VACUUM FULL 另有条件。已核。正文不说 VACUUM 永不缩文件，也不把长事务危害说成 PostgreSQL 独有。 |
| T18 | 版本写入、索引维护与回收有空间和写入成本。HOT 缓解部分更新开销；是否适合高频更新取决于行宽、索引、并发和维护情况，不能无基准声称总胜 InnoDB。 | T11/T15/T16 与 MySQL §17.3 对 undo/purge 维护的说明。属于有条件的工程归纳，未运行吞吐、延迟或跨引擎基准；无性能数字进入正文。 |

## 提交与故障恢复

| 编号 | 可进入片中的陈述与范围 | 依据 |
|---|---|---|
| T19 | 预写日志原则要求：某数据页变化写回持久存储前，相应 WAL 先持久化。同步提交不要求每个相关数据页当场全部写回。 | [WAL §28.3](https://www.postgresql.org/docs/18/wal-intro.html)、`xact.c:1498` 的同步分支与 `XLogFlush`；本机同步与 fsync 设置。已核。内存页可先改，不能误画成所有内存修改也必须等日志落盘。 |
| T20 | 对本例普通日志表的写事务，synchronous_commit=on、fsync=on 时，提交路径等待相应 WAL 持久化；后台推进脏页写回，检查点协助确定恢复起点。 | `xact.c:1498–1507`、`xlogrecovery.c:1671`；[WAL 设置](https://www.postgresql.org/docs/18/runtime-config-wal.html)与实测 checkpoint / WAL LSN。已核。存储设备须正确履行持久化语义；不描述只读事务和 unlogged 表为同一条写路径。 |
| T21 | 自建实例在已提交 id1=32、未提交 id2=77 后 immediate 停机，再启动产生 automatic recovery、redo starts/done；查询分别得到 32 和原值 25。 | `after_recovery`、`committed_update_survives`、`uncommitted_update_invisible` 与完整恢复日志；`xlogrecovery.c` 和可见性代码。已核。**仅进程崩溃**，未模拟断电、磁盘损坏、撕裂页或备库切换，不说所有 WAL 记录都属于已提交事务，也不说恢复会逐条逻辑逆向 UPDATE。 |

## 可扩展性及其边界

| 编号 | 可进入片中的陈述与范围 | 依据 |
|---|---|---|
| T22 | 可扩展类型、函数、运算符及索引操作符类可以协作，扩展不是只在客户端增加函数。 | [扩展 SQL §36](https://www.postgresql.org/docs/18/extend.html)、[扩展如何工作](https://www.postgresql.org/docs/18/extend-how.html)；实际 `CREATE EXTENSION hstore`、hstore 键查询；固定 `hstore.control`。已核。扩展须安装兼容文件并有相应权限，不是任意名称都可直接加载。 |
| T23 | 本机 point 值、距离运算符与 GiST 索引一起参与最近邻查询，实际计划为 Limit→Index Scan(locations_p_gist)。这展示类型、运算与访问方法的配合。 | `gist_plan` 完整计划及 10,000 合成点；[GiST](https://www.postgresql.org/docs/18/gist.html)、[索引类型](https://www.postgresql.org/docs/18/indexes-types.html)、`geo_ops.c` / `gistproc.c` 距离函数。已核。point/GiST 属内置能力，不冒称本例安装了 PostGIS。 |
| T24 | JSONB 是内置 JSON 存储类型并支持索引；PostGIS 是 PostgreSQL 的空间扩展。可以据此说明关系事务框架可承载更多类型，但它们不是“所有功能都能取代专用系统”的证据。 | [JSON 类型 §8.14](https://www.postgresql.org/docs/18/datatype-json.html)、[PostGIS 官方入门](https://postgis.net/documentation/getting_started/)、PostGIS [官方介绍](https://postgis.net/)；T22/T23 只实测扩展组合方式。已读原文；本轮未安装或运行 PostGIS、未跑 JSONB 性能实验，画面只作有出处的能力说明。 |
| T25 | PostgreSQL 采用宽松的 PostgreSQL License，社区长期演进、类型与索引可扩展，为选型提供可说明的理由；调查增长的具体原因不能从实现自行推定。 | [项目许可](https://www.postgresql.org/about/licence/)、官方历史、T22/T23 与 S04。已核。影片 GPL-3.0-or-later 与数据库许可区分。 |
| T26 | 同一用户预约设备时，可用内置 tsrange 表示时段，GiST 的范围重叠运算与 btree_gist 提供的整数等值操作符类配合，通过排他约束禁止同设备时段重叠。未提交的冲突预约导致等待；观察到第二连接处于 Lock 等待后提交第一笔，第二连接原 INSERT 返回 23P01；半开区间的相邻时段可成功。 | 本片实际 `bookings` DDL、两连接 INSERT/COMMIT、`booking_concurrency`、`concurrent_booking_waits` / `overlapping_booking_rejected` / `adjacent_booking_accepted`；[范围与约束 §8.17.10](https://www.postgresql.org/docs/18/rangetypes.html#RANGETYPES-CONSTRAINT)、[btree_gist](https://www.postgresql.org/docs/18/btree-gist.html)、固定 `execIndexing.c` 的 `check_exclusion_or_unique_constraint` / 等待路径。已核。先安装兼容的 btree_gist；不是客户端先查再写，未测跨实例约束，不泛化成所有类型都有相应索引支持。 |
| T27 | 预约表外键连接 users；不存在的用户被 23503 拒绝。范围、排他约束和外键都是数据库内执行的业务约束，本例与行写入属于同一事务。 | 实际 `unknown_user_foreign_key_rejected` 与事务 SQL；[约束 §5.5](https://www.postgresql.org/docs/18/ddl-constraints.html)、[事务 §3.4](https://www.postgresql.org/docs/18/tutorial-transactions.html)、`execIndexing.c`。已核。不说这是 MySQL 无法实现的业务，也不把 SQL 声明方式等同于性能必胜。 |

## 插入与删除：补足一次修改的实现

| 编号 | 可进入片中的陈述与范围 | 依据与核查边界 |
|---|---|---|
| T28 | 普通 heap 插入需要取得有足够空间的页；可通过空闲空间映射寻找候选页并再次检查，必要时扩展表。之后在页中写入元组。 | 固定 18.4 `heapam.c:2104–2110` 调用 `RelationGetBufferForTuple`；同提交 `hio.c:437–440,581–584,702–705,756–762` 的选页与空间复查；[空闲空间映射 §66.3](https://www.postgresql.org/docs/18/storage-fsm.html)说明各页空闲空间记录。2026-10-19 源码与文档已核；不声称每次 INSERT 必扫描 FSM 或必追加文件，示意图不冒充单独实测的新页分配。 |
| T29 | heap 删除通过元组的事务字段与状态标记版本失效；它不会在执行 DELETE 的瞬间就把仍可能被快照使用的物理元组回收。 | 固定 18.4 `heapam.c:2773` 的 `heap_delete`、`3061–3067` 对 infomask/xmax 的写入；`htup_details.h:123–125`；[系统列 §5.6](https://www.postgresql.org/docs/18/ddl-system-columns.html)对删除事务与可见版本的说明，结合本片 T16/T17 的回收界线。已核；本轮未额外执行 DELETE 字节取样，不展示虚构的删除回显，不把 xmax 非零恒等为已删除。 |

## 第 3 稿：InnoDB 对照与新项目选型

本节新增核查日期为 2026-10-19。比较仍固定 PostgreSQL 18.4 默认 heap 与 MySQL 9.7 文档所述 InnoDB；部分索引和 JSONB/GIN 在新建独立实例中另行实测，见 `lab/out_08_compare.json`。框架、托管平台与扩展资料的网页身份见 `comparison-sources.json`。新实例已正常停止，不改第 1 轮实验结果。

| 编号 | 可进入片中的陈述与范围 | 依据、验证与限制 |
|---|---|---|
| T30 | InnoDB 的二级索引记录带主键，通常沿主键再找聚簇记录；主键较宽会扩大二级索引。Pg 普通索引以堆位置引用版本，不自动把完整主键附加到每个其他索引中。 | [MySQL 9.7 聚簇与二级索引](https://dev.mysql.com/doc/refman/9.7/en/innodb-index-types.html)的 secondary / long primary key 段；[Pg 仅索引扫描](https://www.postgresql.org/docs/18/indexes-index-only-scans.html)说明所有内置索引均与表分离；本片原始 `index_items` / `index_after_name_change` 的堆位置。已核。这是键宽传播和路径的差别，不直接等于 Pg 所有索引更小或查询更快；覆盖索引、INCLUDE 与其他访问方法另有条件。 |
| T31 | PostgreSQL 的默认隔离级别为读已提交；InnoDB 出厂默认为可重复读。比较并发语义前要明确隔离级别，两者均能配置其他级别。 | Pg 原实验 `environment.settings.default_transaction_isolation` 为 read committed；[Pg 隔离文档](https://www.postgresql.org/docs/18/transaction-iso.html)与 [MySQL 9.7 隔离级别](https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-isolation-levels.html)原文。已核。不是所有托管服务或用户环境都采用出厂值；默认值不同不构成全面性能或一致性胜负。 |
| T32 | 部分索引只为符合谓词的行建立索引项；例如只索引未完成任务。查询需要满足相应谓词才能利用它。 | [Pg 部分索引 §11.8](https://www.postgresql.org/docs/18/indexes-partial.html)；`out_08_compare.json` 中 20,000 条 jobs、200 条 open，`CREATE INDEX jobs_open_idx ... WHERE status='open'`，索引元数据保存谓词，实际查询计划选择 jobs_open_idx。已核；不把一次示例推成全部查询提速，不在本片断言 MySQL 无法用其他方案实现相似业务效果。 |
| T33 | JSONB 的内容可与 GIN 索引配合，例如按包含关系查找键值。 | [Pg JSONB 索引 §8.14.4](https://www.postgresql.org/docs/18/datatype-json.html#JSON-INDEXING)；新实验的 jsonb 列、jobs_meta_gin、`meta @> '{"kind":"alert"}'`，实际计划包含该 GIN 索引并返回 206 行。已核；只覆盖该运算与默认操作符类，不能说任何 JSON 表达式都自动走索引。 |
| T34 | pgvector 是给 PostgreSQL 提供向量相似度检索的扩展，可与其他数据同库使用；PostGIS 是空间扩展。二者不等于核心默认内置。 | [pgvector 上游 README](https://github.com/pgvector/pgvector)的用途、数据类型和查询示例；[Supabase 扩展入口](https://supabase.com/docs/guides/database/overview)明确列出 pgvector / PostGIS 的向量与空间用途；PostGIS 资料见 T24。已读一手原文，未在本机安装 pgvector 或 PostGIS、未跑性能实验。 |
| T35 | MySQL 本身也支持 JSON 类型与空间数据类型/操作。不能用“只有 Pg 有 JSON 或空间查询”解释 Pg 的优势。 | [MySQL 9.7 JSON 类型](https://dev.mysql.com/doc/refman/9.7/en/json.html)与[空间类型](https://dev.mysql.com/doc/refman/9.7/en/spatial-types.html)原文，2026-10-19 已核。此处比较整个数据库能力，而不是把 MySQL 的上层功能遗漏后只拿 InnoDB 比较。 |
| T36 | 框架与托管产品已提供明确的采用路径：Django 5.2 教程建议首次真实项目考虑 PostgreSQL；Supabase 文档说明每个项目获得完整的 Postgres 数据库。 | [Django 5.2 教程第 2 部分](https://docs.djangoproject.com/en/5.2/intro/tutorial02/#database-setup)和 [Supabase 数据库总览](https://supabase.com/docs/guides/database/overview)。已核。Django 该教程的默认配置实际是 SQLite；不能改写成 Django 默认 Pg，也不能由两个案例推论所有新项目都默认 Pg。 |
| T37 | 成熟事务、较丰富的索引/类型/约束组合、可扩展接口、社区维护与宽松许可，以及已有框架/托管路径，可作为新项目优先评估 Pg 的理由。 | T03、T22、T25、T26/T27、T32–T36，以及 [Pg 官方项目介绍](https://www.postgresql.org/about/)、[许可原文](https://www.postgresql.org/about/licence/)。标为**基于能力与案例的工程归纳**，不是调查统计得出的采纳因果，也不是声称这些能力全部为 Pg 独有。 |
| T38 | “57.9%”严格指 S03 的 2026 年该题受访者开发使用比例；“默认选择”在正文收窄为许多新项目会优先评估的候选，不等于全球装机/收入份额或用户逐个从 MySQL 迁移。 | 本轮重新读取 [2026 官方数据](https://survey.stackoverflow.co/2026/technology/data/databases)，与原 `out_04_survey.json` 的 6,984 / 12,061 复算一致；T36 的采用实例与 T37 的解释分开。已核统计及其范围，未声称掌握全行业迁移数据。 |

现有 MySQL 应用的迁移还须验证 SQL 语义、索引与负载；本片没有做迁移兼容性或跨库吞吐/延迟基准。比较章保留 InnoDB 主键聚簇路径的直接性、Pg 的版本/索引/回收成本，不能把“老牌加丰富功能”写成无条件适用。

## 视觉、声音与标题的事实边界

| 编号 | 可使用的材料与性质 | 依据 |
|---|---|---|
| V01 | PostgreSQL 现行大象标志名 Slonik；以官方三色版 SVG 的蓝色 #336791 作本片参考。单色蓝 SVG 使用另一蓝色，不把不同变体混为统一官方色。工业工程图、纸白与石墨中性底、年代间排版变化均为本片创作选择，不宣称是 PostgreSQL 官方宣传风格或历代官网复原。 | [官方 wiki 标志入口](https://wiki.postgresql.org/wiki/Logo)与[三色 SVG](https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg)。标志使用遵守[商标政策](https://www.postgresql.org/about/policies/trademarks/)。提取哈希与配色对比见 `lab/out_05_style.json`；历史时期的色彩不作为史实。 |
| V02 | “老牌、严谨、企业”“开源巅峰”为 WaterRun 的定位与审美要求；前者由 1986 至今的谱系、事务例子和克制表达支持，后者作为评价性标题。 | 2026-10-19 本制作会话的明确要求。不得据此新增“企业零故障”“最严格”“所有负载第一”等事实断言。 |

## 制作署名

策划、文案指定校对者：**WaterRun**。事实测绘、中文文案、视听方案：**6.1Sol**，名称严格按 WaterRun 本轮明确要求；未以其他模型代写、未委托子 Agent，未用在线语音或图像模型。不猜测额外模型版本。后续实际使用的翻译、配音、画面模型据实追加。

开源视频：**https://github.com/Water-Run/ft**，本片目录 `videos/postgresql/`。片尾列「策划：WaterRun」「事实测绘 / 文案 / 视听方案：6.1Sol」「开源视频：github.com/Water-Run/ft」，至少预留 12 秒完整阅读。

## 文案审查

本轮按策划追加要求：保留“开源巅峰”；作为独立 OLTP 代表介绍，InnoDB 只在必要机制上对比；开场包括 MySQL 历史领先与 PostgreSQL 在明确调查口径下的超越；时长 8–12 分钟；Credit 为 6.1Sol。稿本、逐句依据与交审状态见 [NOTES](../review/NOTES.md) 及导出稿。**尚未获得对全文的人工确认，不配音、不铺开场景。**

**第 2 稿（2026-10-19）**：WaterRun 明确要求系列成链、各集主线相近，以“数据库引擎怎样实现”为重点；超过 MySQL 仅作补充。正文重排为存储、查询、修改、并发、回收、恢复，加入 C01–C04 的跨集核对和 T28/T29 的实现补充；预约移回研究材料。当前交审内容哈希为 `96b238c8fd324f332ad8c43e6e59e706bb2c1be475c5ffeca9e913d017124854`，142 条旁白，估算 610.7 秒，确认状态仍为 pending。

**第 3 稿（2026-10-19）**：WaterRun 要求增加 InnoDB 比较并可独立成章，补足老牌 Pg 当前被优先考虑的优势。查询和并发段加强二级索引/键宽、RC/RR 默认比较，恢复后新增「与 InnoDB 的取舍」，依 T30–T38 说明组合能力与采用路径。开场明确 57.9% / 35.1% 及调查范围。新增独立索引实验 5 项检查，不改原 15 项实验。当前内容哈希为 `411cbab66356255302755897c1c9dc3f3fc525bc942910d150c393c31653bbaf`，163 条旁白、估算 709.3 秒，仍 pending；前两稿保留为历史。

## 复核与未使用材料

本轮实验成功，不等于视频验收。实际成片后的事实、读音节奏、音画对应及 F01–F14 回填仍未进行。尚无成片时间点、视频哈希或人耳试听结论。

H08 的发行细年、原型 time-travel/无传统 WAL 细节、全部索引分类和历史商业分支仅留研究，不堆入正文。未测多节点扩展、吞吐、备份恢复、物理断电、索引多层遍历耗时，不用图示虚构这些实测结果。

第 2 稿还将预约/排他约束、hstore、JSONB 与 PostGIS 的功能例子保留为研究材料；GiST 仅在索引查找段服务于“类型、运算如何接入访问方法”的解释。跨集源稿和八行数据核对新增，不重跑数据库，不改变第 1 轮 15 项实测的范围。

第 3 稿将部分索引、JSONB/GIN 与预约约束作为比较章短例；PostGIS / pgvector 只说明经文档核查的用途，Django / Supabase 只作具体采用案例。它们未被改写成调查中的迁移原因。跨库性能、全部扩展实测与真实成片仍未进行。

**第 4 稿（2026-10-19）**：按 WaterRun 同意的建议压缩第 3 稿，为更沉稳的 MiniMax 音色留出时长。删去 22 句重复、过渡或偏离主线的句子，合并 h8/h13/w3，不新增事实；内容哈希 `ea33e17e106bb561cfb5eef43c8dc03f31d492c60e298534cb8c49bf8358aff2`，142 条旁白、估算 629.8 秒，仍 pending。见 [review/NOTES.md](../review/NOTES.md)。

**第 5 稿（2026-10-19）**：WaterRun 要求开场以趋势折线体现 PostgreSQL 取代 MySQL 居首，并说明 MyISAM / InnoDB 属于 MySQL；另要求自审迭代。新增 S05（2018–2026 九年数据，`lab/10_survey_trend.py`）与 C05。内容哈希 `12f070d5d41260f22c2a99d6e4a22f04ea26439cbbd53f9d48a5963ab42688d5`，146 条旁白、估算 664.8 秒，仍 pending。见 [review/NOTES.md](../review/NOTES.md)。

**第 6 稿（2026-10-19）**：WaterRun 要求删去口径句 o7，并降低 AI 味、认知负载与跳跃。按 MyISAM 口播逐句口语化重写，未新增事实；内容哈希 `fb5767f7c781786a561ce030ed11c70ec392d261a54998223d0c61b0b5ee74ae`，157 条旁白、估算 671.3 秒，仍 pending。见 [review/NOTES.md](../review/NOTES.md)。

**第 7 稿（2026-10-19）**：WaterRun 改写 o8、b1、z6，要求 3–5 轮自审迭代。b1 改问「为什么越来越多的人选择」，b20 回答为「这些，就是很多人选择它的理由」，不把能力说成比例上升的原因（S04、T25）。未新增事实；内容哈希 `acd25fbddda81ea09164a226fce3943acf8d8d578f7cc32c4ddd7509f1ee3e91`，159 条旁白、估算 674.9 秒，仍 pending。见 [review/NOTES.md](../review/NOTES.md)。

**第 8 稿（2026-10-19）**：WaterRun 要求删 o11、扩写历史（Ingres 地位、「正统关系数据库」）并让文字对应动画。新增 H13–H17；内容哈希 `dc55b3734068711b200999fe30bc166fd7f18c58a3d7901b2316303f0073baf6`，160 条旁白、估算 698.4 秒，仍 pending。见 [review/NOTES.md](../review/NOTES.md)。

**第 9 稿（2026-10-19）**：WaterRun 要求 b1 点出 PostgreSQL 才是老牌、如今复兴，并再优化一版。新增 H18（MySQL 首版 1995 年）；内容哈希 `325e4a1741a57f22d04cd34fd64540b2662fe62f802442597f662b1a3633976c`，估算 703.4 秒，仍 pending。见 [review/NOTES.md](../review/NOTES.md)。

**第 10 稿（2026-10-19）**：WaterRun 认为仍有 AI 味，逐句改措辞，未改事实；内容哈希 `72635f365673c3dbdcef896d8aa733aad250bf7918657660359023feb4db7da3`，估算 703.8 秒，仍 pending。见 [review/NOTES.md](../review/NOTES.md)。

**第 11 稿（2026-10-19）**：按新核心反馈 F04 / F15 自查，h15c 改写，未改事实；内容哈希 `7caad9971c6526e36f183a4c9ea8e6466f4aaadd37be02b20efd0f2ea80a05a7`，估算 703.6 秒，仍 pending。

**第 12 稿（2026-10-19）**：只在关键结果后加长停顿，未改文字与事实；内容哈希 `7caad9971c6526e36f183a4c9ea8e6466f4aaadd37be02b20efd0f2ea80a05a7`，估算 707.9 秒，仍 pending。

**发布复核（2026-10-19）**：成片交付前逐句对照本文件核对旁白与画面；新增事实均已登记（S05、C05、H13–H18）。同日发布于哔哩哔哩 [BV1xAnn6WEzv](https://www.bilibili.com/video/BV1xAnn6WEzv)（16:32:17，+08:00），平台标题与片名一致。
