# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。做法见仓库 `docs/guides/research.md`：读原始来源、做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。

实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

取证日期：2026-11-07。对象：ClickHouse 26.8.34.13（26.8 LTS，2026-10-22 发布，当日最新的 LTS）的 MergeTree 表引擎。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| 服务端 | ClickHouse 26.8.34.13，`VERSION_DESCRIBE v26.8.34.13-lts`，git `e0cfed8d5e66d0e226afa2258a5956e3e22abff9`，官方 RelWithDebInfo 构建 | 官方镜像 `docker.io/clickhouse/clickhouse-server:26.8.34.13`（本地镜像 digest `sha256:ed334fbf…25bde`，拉取时清单 `sha256:8b28eb09…6d7779`）；`out_01_environment.txt` |
| 机器 | 策划者提供的一台 x86-64 Linux 物理机：Rocky Linux 10.2，内核 6.12，i3-12100F（8 线程），16 GB 内存；rootless Podman 跑官方镜像，数据放在命名卷里，容器内路径是标准的 `/var/lib/clickhouse`。主机名、地址与用户名不进任何文件 | `out_01_environment.txt` |
| 配置 | 镜像自带的缺省配置，未改任何设置（`part_log` 缺省已开、日志 trace 级） | 同上 |
| 源码 | tag `v26.8.34.13-lts` 的个别文件，`raw.githubusercontent.com/ClickHouse/ClickHouse/v26.8.34.13-lts/<路径>` | 存在 `research/_src/ch/`（不入库），下文写文件与行号 |
| 文档 | 同一 tag 的 `docs/reference/…`；另取 `ClickHouse/clickhouse-docs` 仓库 main 分支提交 `89036285e33b88b424ebc397cce3cb70e9c2b5a9` 的 `docs/…`（含 VLDB 2024 论文的全文转写 `academic_overview.mdx`） | 存在 `research/_src/ch/docs/`、`research/_src/docs/`（不入库） |
| 演示数据 | `demo.users(id UInt32, name String, age UInt8)`，`ENGINE = MergeTree ORDER BY id`，id 1..100000000；Alice 为 2050 号、42 岁；其他人姓名 `'User' + 至少 5 位编号 + '-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN'`，年龄 `18 + id % 63`（沿用本系列的规则）。小表是本系列第一集的 8 行 | `03_big.sh`、`02_small.sh` |

实验的先后：01 环境 → 02 小表 → 03 一亿行 → 04 查询 → 05 插入 → 06 改 → 07 删 → 08 并发 → 09 崩溃 → 10 表引擎 → 11 JSON → 12 合并（2026-11-08 补做）→ 13 计时（2026-11-08 补做），都在同一个容器与数据卷上依次运行。**完整重跑已做：** 2026-11-07 的第一次是逐个手动运行，08 中途卡住、留下一行多余的 Carol；2026-11-08 从空数据卷用 `research/lab/run_all.sh --fresh` 按顺序完整重跑了两次（第一次发现 05 的三个异步插入被分成 1 + 2 两个片段，改脚本后再跑一次），**现在的 `out_NN_*.txt` 是第二次的回显，文案里的数字以它为准**；随机器负载变化的数字（写入用时、变更用时、合并用时、Bob 与 Carol 的毫秒数、强杀时写到哪一块）在各行里注了三次运行的范围。**仍未查清：** 09 强杀时 4 秒写出 43 个片段（约 11 个/秒），03 里 90 个片段用了 20.8 秒（服务端计时，约 4 个/秒）——两次写的是不同的表，原因没有查；旁白不并列这两个速度，也不拿它们做比较。

## 对象与解释路径

MergeTree 是 ClickHouse 存数据的表引擎（E01–E06）。一张 MergeTree 表是若干个**片段**（part）目录；一个片段由一次插入写成，之后不再改动（P01–P04）。片段里每一列单独一个压缩数据文件（`.bin`）和一个标记文件，各列按建表时的**排序键**排成同样的顺序，第 N 个值属于同一行（C01–C06）。片段多了，后台把几个排好序的片段归并成一个大的（P06–P09），名字里的 Merge 指的就是它；家族里的变体只在合并时对排序键相同的行做的事不同（E05）。

一次查询：只读用到的列（Q01）；按排序键找，先在内存里的**稀疏主键索引**（每 8192 行一个**颗粒**，记该颗粒第一行的键）里二分，选中颗粒，再按各列的**标记**找到这个颗粒在列文件里的位置，读出整个颗粒（Q02–Q05）；按不在排序键里的列找，选不掉颗粒，只能读完整列（Q06）。

改与删都不动原文件：**变更**（mutation）为片段生成新版本，重写改到的列，没改到的列文件用硬链接带过去（U01–U04）；轻量删除给片段加一列隐藏的 `_row_exists`（D01–D04）；真正清理靠合并。被替换的旧片段先标为不活动，没有查询在用、又过了 `old_parts_lifetime`（480 秒）才删（D05–D06、B04）。

并发：查询开始时取活动片段的快照，写入只添新片段，互不等待（B01–B05）。出错：没有预写日志，片段先写在 `tmp_insert_…` 临时目录，写完改名才出现；强行终止后临时目录在重启时被清掉（R01–R05）；新片段缺省不 fsync，旧片段留 8 分钟是为了断电后能退回（R06–R07）；文件损坏由 `checksums.txt` 里的大小与校验和发现（R08–R09）。

尚未弄清、片中不讲：合并选择片段的具体算法（只用实测的合并记录）；`async_insert` 自适应等待时间的细节。

## 逐章

依据里的 `out_NN` 指 `research/lab/out_NN_*.txt`；源码路径相对 `src/`；`AO` 指 clickhouse-docs 的 `docs/managing-data/core-concepts/academic_overview.mdx`（VLDB 2024 论文 *ClickHouse — Lightning Fast Analytics for Everyone* 的转写）。核查日期均为 2026-11-07，状态「已核」表示原始出处与独立印证都已读到。

### 开场

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| O01 | 一亿人的平均年龄：一条查询，结果 48.99999546（Dave 与 Carol 加入前）；热缓存下连跑 30 次（out_13）：最短 7、中位数 8、最长 9 毫秒；第一次重跑时机器上别的负载较重，30 次是最短 7、中位数 9.5、最长 23 毫秒；最早的 3 次是 10、7、7 毫秒。旁白与封面用「不到十毫秒」 | out_13 的 `query_log`（30 次）；out_04 §1 `avg_1..3`（8、9、110 毫秒——第三次被别的负载拖慢，所以 3 次不足以定一个数）；结果 `48.99999546` | out_03 末尾同一查询结果相同 | 本机热缓存；页缓存没有清（容器里无权限），冷读未测；机器是共用的，别的容器的负载会让个别次数变慢 | 已核；画面注明「热缓存」 |
| O02 | 这条查询读的压缩数据 541,710 字节（约 529 KiB），正是 `age.bin` 的大小；整张表压缩后 882 MiB | out_04 §1 `compressed_bytes_read`；out_03 片段文件清单 `541710 age.bin`、`table_compressed 925152023` | 同上两份互证 | 同上 | 已核 |
| S01 | MySQL、PostgreSQL 一类事务型（OLTP）数据库，一次查询只读写几行、毫秒级完成，数据按行存放：一行的各列值挨在一起，取整行快；ClickHouse 按列存放，每一列的值挨在一起，分析查询只读用到的列 | 本仓库 SQLite 一集 FACTS 的 G08、G15（转录自 ClickHouse 文档 What is ClickHouse? 与 What is OLAP?，读于 2026-11-01）；`research/_src/docs/docs/concepts/olap.md` 第 38–42 行：「To build analytical reports efficiently it's crucial to be able to read columns separately … most OLTP systems store data arranged by rows」 | 同文档 OLAP 页对比表把 Postgres、MySQL、Oracle 列为 OLTP 的例子（G15） | 一般性说法，不对应本机实测 | 已核（旁白 o4、c2 用「MySQL、PostgreSQL 这样的数据库」，不点名别的引擎） |
| S04 | 这个系列的五个数据库——MySQL 的 MyISAM 与 InnoDB、PostgreSQL、SQLite、ClickHouse——都是 SQL 数据库：用 SQL 语句建表、插入、查询，数据摆成表（行与列） | MySQL 9.7 手册 18.1 的 `CREATE TABLE t1 (i INT) ENGINE = INNODB;`（S03）；PostgreSQL 一集 FACTS H4、H7（SQL 解释器、SQL:2023 符合情况）；SQLite 一集 FACTS S10、G16（「A complete SQL database with multiple tables, indices … in a single disk file」）；ClickHouse 见 N03 | — | — | 已核（转录各集已核的 FACTS） |
| S05 | SQLite 是嵌入式的 SQL 数据库引擎，没有单独的服务进程，一个完整的数据库（多张表、索引等）放在一个磁盘文件里 | SQLite 一集 FACTS S10：《About SQLite》「does not have a separate server process」「A complete SQL database with multiple tables, indices … is contained in a single disk file」 | 同集 G16 | — | 已核（转录） |

### 表引擎

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| H01 | ClickHouse 2009 年起步，最初是给网页规模的日志做筛选与汇总的算子；2016 年开源 | AO 第 44 行 | clickhouse-docs `docs/about-us/history.md` 第 12 行（最初为 Yandex.Metrica 开发）、第 56 行（2009 年起 Metrica 用 OLAPServer） | — | 已核 |
| H02 | 它最初是为 Yandex.Metrica（网站统计）开发的；2014 年 4 月，Metrica 每天记录约 120 亿次浏览与点击 | `history.md` 第 12、16 行 | AO 第 44 行（日志数据） | 截至文档所写的 2014 年 | 已核（单一出处的数字只用于时代背景，画面注出处） |
| H03 | OLAP（联机分析处理）：在海量数据上做聚合等复杂计算的分析查询；ClickHouse 自称「列式的 OLAP 数据库」，面向万亿行、数百列的表 | AO 第 44 行：「a columnar OLAP database designed for high-performance analytical queries on tables with trillions of rows and hundreds of columns」 | 本仓库 SQLite 一集 FACTS G08（ClickHouse 文档 What is ClickHouse? 的定义）；`olap.md` 第 30 行 | — | 已核（旁白 e4 给名字，章节一开头就用到片名里的 OLAP） |
| H04 | OLAP 系统用来做报表：每份报表基于大量历史数据，但做得不那么频繁；OLTP 系统则持续处理事务流，不断修改当前的数据状态 | `research/_src/docs/docs/concepts/olap.md` 第 30–31 行：「The former focuses on building reports, each based on large volumes of historical data, but by doing it less frequently. The latter usually handles a continuous stream of transactions, constantly modifying the current state of data.」 | AO 第 44 行 | — | 已核（旁白 o11「做报表、做统计，问的都是这一类」） |
| H05 | Yandex.Metrica 现场生成自定义报表：基于访问与会话、用户任意划分的分段，常常要做复杂的聚合（例如不重复用户数）；新数据实时到达；一次查询可能要在几百毫秒内扫描几百万行，或在几秒内扫描几亿行；2014 年 4 月每天约 120 亿次浏览与点击（H02） | `research/_src/docs/docs/about-us/history.md` 第 14、16 行：「Yandex.Metrica builds customized reports on the fly …」「A single query may have required scanning millions of rows within a few hundred milliseconds, or hundreds of millions of rows in just a few seconds.」 | AO 第 44 行 | 截至文档所写的 2014 年 | 已核（旁白 o13–o14b；单一出处，只作时代背景） |
| H06 | 「要算得快就得先汇总」曾是通行的看法：汇总能减少数据量，活儿大半在后台、不赶时间时做完；但汇总有局限——要预先定好有哪些报表，用户不能自己做报表；对取值很多的键（例如网址）汇总几乎压不小数据（不到两倍）；汇总的组合多到爆炸；而不汇总、直接用原始数据算，在线计算要尽可能快，因为用户在等结果 | `research/_src/docs/docs/about-us/history.md` 第 36–50 行（「There is a widespread opinion that to calculate statistics effectively, you must aggregate data …」「However, data aggregation comes with a lot of limitations」「In contrast, online calculations require calculating as fast as possible, since the user is waiting for the result.」） | — | 文档所述的 Yandex.Metrica 场景 | 已核（旁白 h4–h6d、h9；「用户在等着看结果，所以是现场算」） |
| H07 | Metrica 有一个专门做汇总的系统 Metrage，大多数报表用它；2009 年起，Metrica 还用上一个专门存非汇总数据的 OLAP 数据库 OLAPServer（原先给报表构建器用）；它对非汇总数据很好用，但限制多：只支持数字（不支持别的数据类型）、不能实时增量更新数据（只能每天重写）；它不是 DBMS，而是专用的库；ClickHouse 最初的目标是去掉 OLAPServer 的限制，对所有报表都直接用非汇总数据解决，多年后长成通用的分析型 DBMS | `research/_src/docs/docs/about-us/history.md` 第 46–54 行（「Yandex.Metrica has a specialized system for aggregating data called Metrage」「Starting in 2009, Yandex.Metrica also used a specialized OLAP database for non-aggregated data called OLAPServer」「The initial goal for ClickHouse was to remove the limitations of OLAPServer …」） | AO 第 44 行（ClickHouse「started in 2009 … open sourced in 2016」） | 文档所述；旁白不说 ClickHouse 自己的起步年份（文档里 OLAPServer 与 ClickHouse 都出现 2009，先后关系文档没细说） | 已核（旁白 h5、h7–h8b、h10b；旁白里 OLAPServer 称「专门的分析库」） |
| H08 | 分析型数据库的年代：早期的 Sybase IQ、Teradata、Vertica、Greenplum 靠昂贵的批量 ETL，因为装在自家机房（on-premise）弹性有限；2010 年代初，云数据仓库与 DBaaS（Snowflake、BigQuery、Redshift）把分析的成本与复杂度大大降下来；与 ClickHouse 目标和设计最像的是 Druid 与 Pinot；ClickHouse 用一个单体二进制程序完成建表、改表与查询 | `research/_src/docs/docs/managing-data/core-concepts/academic_overview.mdx` 第 336–338 行（相关工作一节：「Early systems like Sybase IQ, Teradata, Vertica, and Greenplum were characterized by expensive batch ETL jobs and limited elasticity due to their on-premise nature.」「In the early 2010s, the advent of cloud-native data warehouses … dramatically reduced the cost and complexity of analytics」「ClickHouse uses a monolithic binary」） | — | 论文的概述性说法，不是逐个产品的年表；旁白只说「更早的那些，又贵，又装在自家的机房里，靠批量导入」「二〇一〇年代初云上的分析型数据库出现，分析才便宜了」，名字只在画面上 | 已核（旁白 h11–h11e） |
| H09 | 官方文档（写作时）：Metrica 的库里有超过 13 万亿条记录，每天超过 200 亿条事件，ClickHouse 因此能直接从非汇总数据现场生成自定义报表 | `research/_src/docs/docs/about-us/history.md` 第 12 行（「With more than 13 trillion records in the database and more than 20 billion events daily, ClickHouse allows generating custom reports on the fly directly from non-aggregated data.」） | — | 文档写作时的数字，单一出处，旁白说「官方文档说」；只用 13 万亿一个数，不并列 120 亿与 200 亿 | 已核（旁白 h10c） |
| H10 | 官方文档称 Yandex.Metrica 是全球第二大的网站统计（web analytics）平台（文档引用 w3techs 的统计）；ClickHouse 最初就是为驱动它而开发的 | `research/_src/docs/docs/about-us/history.md` 第 12 行（「ClickHouse was initially developed to power Yandex.Metrica, the second-largest web analytics platform in the world」） | — | 文档的说法，单一出处，旁白说「官方文档说」 | 已核（旁白 h1b–h1c） |
| E01 | 建表时用 `ENGINE` 子句为每张表指定表引擎 | out_03 `SHOW CREATE TABLE`；`docs/reference/engines/table-engines/index.mdx` | out_10 | 26.8 | 已核 |
| S03 | MySQL：建表时用 `ENGINE` 选项为每张表指定存储引擎（手册示例 t1 用 InnoDB、t2 用 CSV、t3 用 MEMORY），不写则用缺省引擎，9.7 缺省是 InnoDB | MySQL 9.7 参考手册 18.1 Setting the Storage Engine：「you can specify which storage engine to use by adding an ENGINE table option to the CREATE TABLE statement」「When you omit the ENGINE option, the default storage engine is used.」「The default engine is InnoDB in MySQL 9.7.」（读于 2026-11-08） | 本仓库 InnoDB 一集 FACTS G6、M22、H2；MyISAM 一集 FACTS a9a | 手册没有逐字说「同一实例里不同表可用不同引擎」，但示例里三张表用了三种引擎 | 已核（旁白 e7「引擎跟着表走」、e8「MySQL 里的引擎是同一件事的几种做法」——后一句是对 MyISAM、InnoDB 都是存表的办法的概括，不另作出处） |
| E02 | 26.8.34.13 共有 84 种表引擎，名字里带 MergeTree 的 16 种（8 种加上各自的 Replicated 版本） | out_10 `system.table_engines` | — | 本版本 | 已核 |
| E03 | 表引擎分三类：MergeTree 家族是 ClickHouse 主要的持久化格式；特殊用途的（字典、内存表、跨分片的 Distributed）；与外部系统交换数据的虚拟引擎（PostgreSQL、MySQL、Kafka、S3 等） | AO 第 72、74、76 行 | out_10 的引擎清单里有 Distributed、Memory、MySQL、Kafka、S3 等 | — | 已核 |
| E04 | 不写 `ENGINE` 时缺省用 MergeTree；ClickHouse 自己的 `query_log`、`part_log` 等日志表也是 MergeTree | out_10 `default_table_engine = MergeTree`、`noengine` 表的 `engine_full`、system 表的 engine | `Core/Settings.cpp:4881`；`Core/SettingsChangesHistory.cpp:1163` | 26.8 | 已核 |
| E05 | MergeTree 家族的各个引擎区别在合并时怎样合并输入片段里的行，例如聚合或替换；ReplacingMergeTree 去掉排序键相同的重复行，SummingMergeTree 把排序键相同的行合成一行、数值列相加 | AO 第 72 行 | `replacingmergetree.mdx` 第 11 行；`summingmergetree.mdx` 第 11 行 | — | 已核 |
| E06 | MergeTree 基于 LSM 树（O'Neil 等，1996）的思路：表分成按主键排好序的片段，后台持续合并；与 LSM 树不同，ClickHouse 不把片段分层，所有片段同等对待 | AO 第 72、98 行，参考文献 [58][60] | clickhouse-docs `docs/managing-data/core-concepts/merges.mdx` 第 23 行 | — | 已核。片中不说「名字取自 LSM 树」（没有找到这样的原话）。第 2 稿起旁白不再提 LSM 树（观众不需要这个名字，也与后文无关）；名字的由来改用 M01 |
| E07 | 稀疏主键索引不像 B 树那样定位单行，而是在索引项上二分，找出成组的行 | clickhouse-docs `docs/guides/best-practices/sparse-primary-indexes.md` 第 160 行 | out_04 `EXPLAIN`：`Search Algorithm: binary search`；片段里没有 B 树结构的文件（out_03 文件清单） | — | 已核 |
| E08 | 表引擎决定：数据怎样、存在哪里，往哪里写、从哪里读；支持哪些查询；并发访问；是否用索引；能否多线程执行；数据复制参数。MergeTree 家族的共同点是「快速写入数据，之后由后台处理」 | `research/_src/ch/docs/reference/engines/table-engines/index.mdx` 前 20 行：「The table engine (type of table) determines: How and where data is stored, where to write it to, and where to read it from. …」「The property shared by these engines is quick data insertion with subsequent background data processing.」 | AO 第 72 行 | 26.8 文档（tag v26.8.34.13-lts） | 已核（旁白 e1b） |

### 一列挨一列

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| C01 | 8 行乱序插入，片段里已按 id 排好（`_part_offset` 0–7 对应 id 1–8） | out_02 第一张结果表 | `age.bin` 解压后的字节顺序 | — | 已核 |
| C02 | Wide 片段每列一个 `.bin` 与一个 `.cmrk2` 标记文件；String 列另有 `name.size.bin` 存长度；还有 `primary.cidx`、`columns.txt`、`count.txt`、`checksums.txt` 等 | out_02、out_03 文件清单 | — | 26.8 | 已核 |
| C03 | `age.bin` 解压后正好 8 字节 `1e 19 29 13 21 34 1c 24`，即 30、25、41、19、33、52、28、36（alice…heidi 的年龄，按 id 排） | out_02 `clickhouse compressor --decompress < age.bin \| xxd` | 与插入的数据逐一对应 | — | 已核 |
| C04 | 压缩块：16 字节 CityHash128 校验和，1 字节方法（`0x82` 为 LZ4），4 字节压缩后大小（含 9 字节块头），4 字节原大小，然后是数据；所有大小为小端 | `Compression/CompressionInfo.h:17`、第 22–40 行注释、`:43` 枚举 | out_02 `xxd age.bin`：`…82 12000000 08000000 80 1e…`（压缩后 18、原 8） | — | 已核 |
| C05 | 小片段缺省写成 Compact 格式（所有列在一个 `data.bin` 里，按颗粒一列接一列）；超过 `min_bytes_for_wide_part`（10 MiB）才每列一个文件 | out_01 `min_bytes_for_wide_part 10485760`；out_02 Compact 片段的 `data.bin` 解压内容 | `Storages/MergeTree/MergeTreeSettings.cpp:78` | 26.8 | 已核；片中 8 行小表用 Wide 演示，画面注明「为演示设 min_bytes_for_wide_part = 0」，旁白 c4c 也说「为了看清楚，八个人的小表我们也这样放」；p5b、p5c 说小片段默认几列接在一个文件里、够大才一列一个文件（AO 3.1：小于 10 MB 的片段把各列连续存在一个文件里） |
| C06 | 一亿行：age 一人 1 字节，原 100,000,000 字节（95.37 MiB），压缩后 541,710 字节；name 原 5.67 GiB，压缩后 498.66 MiB；id 原 381.47 MiB，LZ4 几乎压不动（383.12 MiB）；整表原 6.14 GiB、压缩后 882.29 MiB | out_03 `system.columns` | out_03 片段文件清单的文件大小 | 演示数据 | 已核。**年龄按 `18 + id % 63` 循环，规律极强，压缩比远高于真实数据**；画面必须注明，旁白不说压缩倍数 |

### 片段与合并

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| P01 | 一次插入写成一个新片段；片段由插入生成，之后不再改动（immutable） | AO 第 88 行 | out_05、out_03 `part_log` 的 NewPart | — | 已核 |
| P02 | 新片段先写在 `tmp_insert_` 开头的临时目录，写完改名为正式名字 | `Storages/MergeTree/MergeTreeDataWriter.cpp:760`；`MergeTreeData.cpp:6804` 日志 `Renaming temporary part … to …` | out_05：`Renaming temporary part tmp_insert_all_91_91_0 to all_91_91_0`；out_09 停机时看到的 `tmp_insert_all_43_43_0` | — | 已核 |
| P03 | Dave 一行插入：片段 `all_91_91_0`，Compact，1 行，947 字节，11 个文件 | out_05 | — | — | 已核 |
| P04 | 异步插入在 26.8 缺省开启（26.2 起），`wait_for_async_insert = 1`；三个客户端在容器里一起启动、各插一行，写成 1 个 3 行的片段 `all_4_4_0`，各自同步插入则是 3 个片段（第一次重跑时三个客户端逐个 `podman exec` 启动，启动误差超过等待窗口，被分成 1 + 2 两个片段，所以脚本改成在容器里一起启动） | out_05；out_01 `async_insert 1` | `Core/Settings.cpp:7206`；`Core/SettingsChangesHistory.cpp:430`（26.2 段）`:437` | 26.2 起；能不能合成一个片段取决于几个插入到达的时间差（等待窗口 50–200 毫秒，自适应） | 已核 |
| P05 | 一亿行一条 `INSERT … SELECT`：客户端计时 25.5 秒（服务端计时 20.8 秒；第一次实验时是 15.1 秒，之后两次重跑都是 25–27 秒，与机器上别的负载有关；旁白说「二十几秒」），写成 90 个片段，每个 1,111,953 行（最后一个较少） | out_03 | out_03 `part_log` NewPart 90 个，合计 100,000,000 行 | 本机；用时随机器负载变化，片段数与每片行数不变 | 已核 |
| P09 | 同步插入时，每条 INSERT 建一个新片段；为了减少合并的负担，鼓励客户端成批插入，例如一次两万行；需要实时分析时可用异步插入：服务端把来自多个 INSERT 的行缓冲起来，缓冲超过大小阈值或超时才建一个新片段 | AO 第 90 行（3.1 节）：「clients are encouraged to insert tuples in bulk, e.g. 20,000 rows at once」「creates a new part only after the buffer size exceeds a configurable threshold or a timeout expires」 | P04 | 例子是文献里的举例，不是本机测的 | 已核（旁白 p6b「比如一次两万行」） |
| P06 | 为了让片段数少，后台合并把小片段并成大片段；片段都按主键排好序，合并用 k 路归并排序 | AO 第 88 行 | out_03 `part_log` MergeParts | — | 已核 |
| P07 | 写入期间的合并：6 个并成 1 个（`all_1_6_1` 等），再 9 个并成 1 个（`all_1_29_2`），最后剩 3 个片段（三次运行都是这样）；`OPTIMIZE TABLE … FINAL` 并成一个 `all_1_90_3`，用时 10.5 秒（另两次是 10.3、7.3 秒，把一亿行重新写了一遍，旁白 m13b「用了十秒多」） | out_03 | — | 本机；用时随机器负载变化 | 已核 |
| P08 | 片段名 `分区_最小块号_最大块号_层级[_变更号]`；没有分区时分区名为 `all`；层级随每次合并加一 | `Storages/MergeTree/MergeTreePartInfo.cpp:210–235` | clickhouse-docs `docs/managing-data/core-concepts/parts.md`；out_03 的名字序列 | — | 已核 |
| M01 | 为什么要合并：插入只管写新的、排好序且不再改的片段，所有数据处理都交给后台合并，写入因此很轻；后台不断把小片段并成大片段以控制每张表的片段数量，一直并到压缩后约 150 GB（`max_bytes_to_merge_at_max_space_in_pool` 缺省）为止，所以持续写入的表不会并成「唯一的一个」片段，本片「并到了底」是我们用 `OPTIMIZE FINAL` 手动做的（旁白 m11d–m11e 如实说）；片段合并下来，随时间形成一棵合并出来的片段的树，所以叫 MergeTree | `research/_src/docs/docs/managing-data/core-concepts/merges.mdx` 第 21–36 行：「Inserts … create sorted, immutable data parts」「All data processing is offloaded to background part merges」「To control the number of parts per table … ClickHouse continuously merges … smaller parts into larger ones」「Over time, this creates a tree of merged parts. Hence the name merge tree table.」 | AO 第 88 行（「To keep the number of parts per table low, a background merge job …」）；out_03 `part_log` 的合并记录 | — | 已核（旁白 p9、p13：名字里的 Tree 指合并出来的片段树，不是 B 树，也不说「取自 LSM 树」） |
| M02 | 小例子（本机实测，out_12 §1）：八个人分三批插入（`(8 heidi, 2 bob, 5 erin)`、`(7 grace, 1 alice, 4 dave)`、`(6 frank, 3 carol)`），写成三个片段 `all_1_1_0`、`all_2_2_0`、`all_3_3_0`，各 3、3、2 行，每个片段内部按编号排好（`_part_offset` 0、1、2……），片段之间编号交错；此时 `EXPLAIN indexes = 1 … WHERE id = 5` 显示 `Parts: 3/3`；`OPTIMIZE TABLE … FINAL` 后并成一个 `all_1_3_1`（8 行，层级 1，按编号 1–8 排好），`part_log` 记 `MergeParts`、`merged_from = [all_1_1_0, all_2_2_0, all_3_3_0]`，用时 1 毫秒；三个旧片段 `active = 0`；同一个 `EXPLAIN` 变成 `Parts: 1/1` | out_12 §1 | 片段命名规则 P08 | 本机；`SYSTEM STOP MERGES` 后手动插入再 `OPTIMIZE FINAL` | 已核（旁白 m7–m10b；卡片归并的比方对应 AO 的「k 路归并排序」，P06） |
| M03 | 片段多了的代价与合并链（本机实测，out_12 §2）：一张表（`id UInt32, age UInt8`，`ORDER BY id`）停掉合并后一行一行插 900 行，得 900 个活动片段；`SELECT avg(age)` 五次的 `query_duration_ms` 是 16、12、13、39、12（热缓存、关掉查询条件缓存）；`OPTIMIZE FINAL` 之后只剩一个片段 `all_1_900_3`，同一查询五次都是 1 毫秒。合并按层进行：九个左右的 99 行片段（`all_11_109_1` 等，层级 1）→ `all_1_109_2`、`all_669_801_2`（层级 2）→ `all_1_900_3`（层级 3），共 12 次 `MergeParts` | out_12 §2 | 层级随每次合并加一（P08）；AO 3.1 | 本机；900 行是演示规模，不外推到真实数据的倍数 | 已核（旁白 m2–m3b：「要十几毫秒」「一毫秒」；m11–m11c） |
| M04 | 片段数上限：同一分区的活动片段超过 `parts_to_delay_insert`（默认 1000）时人为放慢插入，超过 `parts_to_throw_insert`（默认 3000）时插入被打断，报 `Too many parts (N). Merges are processing significantly slower than inserts`。实测（out_12 §3）：把上限调到 20、停掉合并，连续插入一行的语句，第 21 条报 `Code: 252 … Too many parts (20 with average size of 458.00 B) in table 'demo.few (…)'. Merges are processing significantly slower than inserts.`（`TOO_MANY_PARTS`），表里停在 20 个片段 | `Storages/MergeTree/MergeTreeSettings.cpp:949–975`；out_12 §0（`system.merge_tree_settings` 的值 1000、3000、`old_parts_lifetime` 480）；out_12 §3 | `_async_inserts.md` 第 57 行提到「too many parts」错误 | 默认值；演示为了快把上限调低到 20（画面注明）。这两个上限按**分区**计，本片的表没有分区（分区名 all），片中不讲分区 | 已核（旁白 m5、m5b） |

### 稀疏索引

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| Q01 | 平均年龄只读 age 一列：选中 12208 个颗粒、读 1 亿行，解压后 100,000,000 字节 | out_04 §1 | — | — | 已核 |
| Q02 | `index_granularity` 缺省 8192；一亿行 12208 个颗粒（12207 个满 8192 行，最后一个 256 行），主键索引 12209 项（含结尾一项），解压后 48,836 字节，在内存里 47.69 KiB | out_01；out_04 `mergeTreeIndex`、`primary.cidx` 解压；out_03 `pk_in_memory` | `MergeTreeSettings.cpp:72`；`sparse-primary-indexes.md` 第 298 行（主键索引整个载入内存） | — | 已核 |
| Q03 | 索引项是每个颗粒第一行的 id：1、8193、16385、24577… | out_04 `od -t u4` | out_04 `mergeTreeIndex` 的 `id` 列 | — | 已核 |
| Q04 | 找 id = 2050：二分，选中 1/12208 个颗粒，读 8192 行，压缩数据 108,475 字节，1–2 毫秒 | out_04 §2 `EXPLAIN indexes = 1` 与 `pk_*` | 二分的次数是算术：12,209 项，对半砍 ⌈log₂12209⌉ = 14 次以内（旁白说「十几次就够了」） | 热缓存 | 已核 |
| Q05 | 每列的标记：每个颗粒一项，记压缩块在列文件里的偏移与块内偏移，外加行数（每项 24 字节）；几个颗粒可以共用一个压缩块（age 列 1526 个块，id 6104 个，name 12208 个） | out_02、out_04 `age.cmrk2` 的 `od -t u8`、`mergeTreeIndex(with_marks)` | `Formats/MarkInCompressedFile.h` | — | 已核 |
| Q06 | 按姓名找：排序键帮不上，12208/12208 个颗粒全选；先读 name 列（PREWHERE），压缩数据 522,949,259 字节；用时 224–246 毫秒（第二次重跑）、212–263 毫秒（第一次重跑）、259–312 毫秒（最早一次），旁白说「两三百毫秒」 | out_04 §3 | `EXPLAIN` 里的 `Prewhere filter`；`delete.mdx` 第 78 行对 PREWHERE 的说明 | 热缓存 | 已核 |
| Q07 | 关掉了查询条件缓存（`use_query_condition_cache = 0`），否则重复查询会跳过上次不命中的颗粒 | out_04 脚本说明；`SettingsChangesHistory.cpp:812` | — | 26.8 | 已核（只在画面注解里出现） |
| Q08 | 传统关系数据库的主键索引每一行一项（B(+) 树），能很快定位单行；代价是额外的磁盘与内存开销、插入新行时更高的索引维护成本，有时还要重新平衡 B 树；ClickHouse 因此不索引每一行，每组行（颗粒）一项，即稀疏索引，索引小到能整个放进内存 | `research/_src/docs/docs/guides/best-practices/sparse-primary-indexes.md` 第 150–160 行：「In traditional relational database management systems, the primary index would contain one entry per table row」「This capability comes at a cost: additional disk and memory overheads, higher insertion costs when adding new rows to the table and entries to the index, and sometimes rebalancing of the B-Tree.」「instead of indexing every row, the primary index for a part has one index entry … per group of rows (called granule) - this technique is called sparse index」 | 与 E07 相互印证 | — | 已核（旁白 i2：「传统数据库靠索引找人，像翻书后的目录：一棵 B 树，每一行都有一项；找得快，可索引占的地方大，每插入一行还要改」） |
| Q09 | 颗粒（granule）是 ClickHouse 扫描与索引查找处理的最小的、不可再分的数据单位；磁盘读写则按块（block，由同一列里相邻的几个颗粒组成，缺省约 1 MB）进行 | AO 第 100 行（3.1 节：「A granule represents the smallest indivisible data unit processed by the scan and index lookup operators in ClickHouse.」） | Q02 | — | 已核（旁白 i3b2「颗粒是读数据的最小单位」；块的细节只放画面） |

### 改

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| U01 | `ALTER TABLE … UPDATE` 是一次变更：`mutation_92.txt`，各片段生成新版本 `all_1_90_3_92`、`all_91_91_0_92`，端到端 0.556 秒（另两次 0.383、0.381 秒；旁白说「半秒上下」） | out_06 | `docs/reference/statements/alter/update.mdx`；AO 3.4（「Mutations rewrite all parts of a table」） | — | 已核。**每个片段都生成新版本，含不含 Alice 都生成**（`part_log` 里 `all_91_91_0_92` 也有一条 MutatePart）；第 1 稿旁白写成「给含有她的片段」是错的，第 2 稿改为「给每一个片段」 |
| U02 | 新版本里 `age.bin` 是新文件（inode 变了、链接数 1）；`id.bin`、`name.bin`、`name.size.bin`、`primary.cidx` 与旧片段同一个 inode，链接数 2（硬链接） | out_06 `ls -li` | `Storages/MergeTree/MutateTask.cpp:1563–1564` | — | 已核 |
| U03 | 这次变更读了片段的 1 亿行，用时 454 毫秒（`part_log`；另两次是 377 毫秒） | out_06 `part_log` MutatePart | — | 本机 | 已核 |
| U04 | 轻量更新 `UPDATE … SET`：普通表上报错，要表开启 `enable_block_number_column` 等；开启后 0.095 秒（对照变更的 0.383 秒），写成一个 1 行的补丁片段 `patch-…` | out_06 §2 | `Core/Settings.cpp`（`allow_experimental_lightweight_update` 缺省 1） | 26.8 | 已核（旁白 u7「能缓解，但要先开设置」） |

### 删

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| D01 | `DELETE FROM` 缺省按 `alter_update` 方式做成变更 `UPDATE _row_exists = 0 WHERE id = 2050` | out_07 `system.mutations`；out_01 `lightweight_delete_mode alter_update` | `delete.mdx` 第 72 行 | 26.8 | 已核 |
| D02 | 新片段多了 `_row_exists.bin` 与标记，其余文件全是硬链接（链接数 3） | out_07 `ls -li` | — | — | 已核 |
| D03 | 删除后查询自动过滤：总数少 1，id 1–8192 这个颗粒剩 8191 行 | out_07 | `delete.mdx` 第 76–78 行（查询被改写为 `PREWHERE _row_exists`） | — | 已核 |
| D04 | 被删的行在下一次合并时才真正移除；`OPTIMIZE FINAL` 之后的片段没有 `_row_exists`（实验里是手动催的；后台没有新数据来合并时，可以手动 `OPTIMIZE`，旁白 d5c） | out_07 §2 | `delete.mdx` 第 31 行 | — | 已核 |
| D05 | 被替换的旧片段约 8 分钟多后才从磁盘删除：第二次重跑每 30 秒查一次，482 秒时还在，512 秒时已不在（第一次实验里是约 10 分钟，查询日志的时间差；之后两次是 482–512 秒） | out_07 §3 | `old_parts_lifetime = 480`（out_01；`MergeTreeSettings.cpp:583`），再加清理线程的间隔 | 本机 | 已核。旁白说「默认至少留八分钟才删」（`old_parts_lifetime` = 480 秒，R07 同一数字）；画面注出实测约 8.5 分钟 |
| D06 | 旧片段只有在没有查询使用（refcount 为 1）时才删 | `MergeTreeSettings.cpp:591–593` | AO 第 88 行；out_08 refcount | — | 已核 |

### 并发

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| B01 | Bob 的慢查询 3.2 秒（三次运行都是 3.2–3.3 秒）；开始 1 秒后 Carol 插入，用时 4 毫秒（另两次 7、2 毫秒）；再 1 秒后 Carol 的变更，5 毫秒（另两次 15、39 毫秒）；旁白说「几毫秒」 | out_08 `query_log` 时间 | — | 本机；**Bob 的查询是特意做慢的**：`WHERE NOT ignore(sipHash128(name))` 加 `max_threads = 1`，逐行算姓名的哈希，不是「读一亿个名字」本来要花的时间（那是 Q06 的零点三秒）；旁白 b1/b1b 如实说「很慢的统计」「特意让它只用一个线程」 | 已核（数字待重跑确认，见上） |
| B02 | Bob 的结果不含 Carol 的新行（100,000,001），他读完后再查是 100,000,002 | out_08 | — | — | 已核（同上） |
| B03 | Bob 读的时候，被变更替换的旧片段 `active = 0`、refcount 5，仍在 | out_08 | AO 第 88 行（refcount 降到零才删） | — | 已核 |
| B04 | 查询开始时取当时活动片段的集合；写入不阻塞读取，没有行锁 | AO（并发一节，第 149 行起「neither of which block parallel inserts」） | out_08 | — | 已核（快照的源码定位待补：`MergeTreeData::getSnapshot`） |
| B05 | 多语句事务：缺省配置下 `BEGIN TRANSACTION` 报 `Transactions are not supported` | out_08 | — | 26.8 缺省配置 | 已核 |

### 出错

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| R01 | ClickHouse 把插入直接写到磁盘，不像其他基于 LSM 树的存储那样用预写日志 | AO 第 98 行 | 片段目录与数据目录里没有日志文件（out_01、out_03） | — | 已核 |
| S06 | 很多数据库在改数据之前，先把要做的事记进日志（预写日志）：InnoDB 的 redo 日志、SQLite 的 WAL 模式、PostgreSQL 的 WAL 都是这样；MergeTree 不这样做，直接把插入写到磁盘 | InnoDB 一集 FACTS K7（ARIES，预写日志）、M12、M66（redo log）；SQLite 一集 FACTS S07（WAL）；本片 R01（AO 第 98 行） | PostgreSQL 一集 FACTS（WAL 一节） | 一般性说法，旁白 r1「很多数据库写数据之前，要先在日志里记一笔」只用「很多」，不点名 | 已核（转录各集已核的 FACTS） |
| S07 | 前四期的引擎都按行存、都是事务型（OLTP）：MyISAM 的 `users.MYD` 是一行接一行（定长 16 字节一行）；InnoDB 的表本身是按主键排好的聚簇索引，叶子里是整行；PostgreSQL 的表是堆，行按到达顺序放；SQLite 的表是按行号排好的 B+ 树，叶页里是整条记录；ClickHouse 文档把 Postgres、MySQL 列为 OLTP 的例子，SQLite 官网称自己是事务型 | MyISAM 一集 FACTS「03 定长行」（`users.MYD` 128 B、每 16 B 一行）；SQLite 一集 FACTS G18、G15、G08 | S01 | 一般性说法 | 已核（转录；旁白 o1–o4b） |
| R02 | 写一亿行时第 4 秒强行终止（SIGKILL，退出码 137）：第二次重跑停机时目录里有 43 个完整片段和 `tmp_insert_all_44_44_0` 一个临时目录（第一次实验是 42 个完整片段加两个临时目录：杀进程的瞬间写到哪一块，每次不同） | out_09 §1 | — | 本机 | 已核 |
| R03 | 重启时日志 `Removing temporary directory …tmp_insert_all_44_44_0/`；表里 43 个片段、47,813,979 行（43 × 1,111,953），id 从 1 连续到 47,813,979 | out_09 | `MergeTreeData.cpp:4861`（启动时清理 `tmp_` 前缀）、`:4037` | — | 已核。注意：同一条 `INSERT` 已写完的片段留下了，不是整条语句回滚 |
| R04 | 重启后目录里看到的 `tmp_merge_all_1_43_1` 是重启后新开始的合并留下的临时目录（`SYSTEM STOP MERGES` 不跨重启），不是强杀前留下的；这一点第二次重跑列出名字后得到确认 | out_09 | — | — | 已核；不进旁白 |
| R05 | 单个插入块是原子的：片段要么完整出现，要么不出现 | P02 的改名机制；R02–R03 | AO 第 88 行（片段自包含） | — | 已核 |
| R06 | 新片段缺省不 fsync（`fsync_after_insert = 0`），可能只在操作系统缓存里，突然重启时可能丢失或损坏 | `MergeTreeSettings.cpp:596–598`、`:642` | out_01 | — | 已核 |
| R07 | 所以合并掉的旧片段不立刻删，留 `old_parts_lifetime` 秒；启动时若合并出的片段损坏，就把旧片段放回活动列表 | `MergeTreeSettings.cpp:583–612` | — | — | 已核 |
| R08 | 截短一个列文件 1 字节：启动时这个片段被移进 `detached/broken-on-start_all_1_1_0` | out_09 §2 | `MergeTreeData.cpp:3094`、`:3494`、`:3645` | — | 已核 |
| R09 | 改掉一个字节（大小不变）：启动时看不出；读到时报 `Checksum doesn't match: corrupted data`；`CHECK TABLE` 指出 `all_2_2_0` | out_09 §2 | C04 的块头校验和 | — | 已核 |

### 结尾

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| J01 | JSON 列按路径拆成子列存放：片段里有 `doc.name…`、`doc.pets%2Ecat…`、`doc.tags…` 等文件 | out_11 | `docs/reference/data-types/newjson.mdx` 第 40、42 行 | 26.8 | 已核 |
| J02 | 只读 `doc.age` 读压缩数据 188 字节；读出整份 `doc` 885 字节 | out_11 | — | 3 行的演示 | 已核（数字太小，只作画面注解，旁白只说「要从各列拼回来」） |
| N01 | MongoDB 是文档数据库：把数据存成灵活的、类似 JSON 的文档；文档由字段与值的对子组成，字段的值可以是别的文档、数组、文档的数组；MongoDB 以 BSON 文档存数据（BSON 是 JSON 的二进制表示，数据类型比 JSON 多） | MongoDB 9.0 手册首页（读于 2026-11-08）：「MongoDB is a document database designed to help developers build modern applications faster.」「It stores data in flexible, JSON-like documents」；`/core/document/`：「MongoDB stores data records as BSON documents.」「The value of a field can be any of the BSON data types, including other documents, arrays, and arrays of documents.」 | — | — | 已核（旁白 s5b–s5c、s7b；「这个人有三项、那个人有三十项」是打比方，不是实测） |
| N02 | MongoDB 读写数据用的是它自己的 Query API（含 CRUD 操作与聚合管道）；手册这两页的正文里没有 SQL 字样（侧边栏只有一个「SQL to MongoDB」的对照页链接） | MongoDB 9.0 手册 `/query-api/`：「The MongoDB Query API is the mechanism that you use to interact with your data.」「The Query API comprises two ways to query data in MongoDB: CRUD Operations … Aggregation pipelines」；`/crud/` | 读于 2026-11-08 | — | 已核（旁白 s7c「也不再用 SQL 去问它」——只说 MongoDB 用自己的接口，不说它任何场合都不能碰 SQL） |
| N03 | ClickHouse 是列式的 SQL 数据库管理系统（OLAP）；查询语言是基于 SQL 的声明式语言，在许多情况下与 ANSI SQL 标准一致 | ClickHouse 文档 What is ClickHouse?（clickhouse.com/docs/intro，读于 2026-11-08）：「ClickHouse® is a column-oriented SQL database management system (DBMS) for online analytical processing (OLAP).」「ClickHouse supports a declarative query language based on SQL that is identical to the ANSI SQL standard in many cases.」 | AO 第 44 行；本机实测全程用 SQL（01–12） | — | 已核（旁白 s1b） |

## 取证中发现、没有进入成片的事实

- 查询条件缓存（26.8 缺省开启）会让重复的过滤查询跳过上次不命中的颗粒（Q07）。
- `id` 列递增的 UInt32 用 LZ4 几乎压不动（C06）；换 Delta 编码会好得多，片中不讲。
- 26.8 的 String 列把长度单独存成 `name.size.bin`（`columns_substreams.txt`）。
- `TRUNCATE` 在 `part_log` 里留下 0 行的「NewPart」（out_05）。

## 复核

未做（文案未定稿）。
