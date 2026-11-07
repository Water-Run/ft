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

实验的先后：01 环境 → 02 小表 → 03 一亿行 → 04 查询 → 05 插入 → 06 改 → 07 删 → 08 并发 → 09 崩溃 → 10 表引擎 → 11 JSON，都在同一个容器与数据卷上依次运行。**待办：** 08 第一次运行时 Carol 的插入因客户端等标准输入卡住，被终止前已写入一行（之后去掉了 `-i` 重跑），所以 08 的回显里 Carol 有两行；定稿前从空数据卷按顺序完整重跑 01–11 一遍，数字以重跑为准。

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
| O01 | 一亿人的平均年龄：一条查询，结果 48.99999546，用时 7–10 毫秒（热缓存，连跑 3 次） | out_04 §1：`avg_1..3` 的 `query_duration_ms` 10、7、7（另一次运行 10、8、10）；结果 `48.99999546` | out_03 末尾同一查询结果相同 | 本机热缓存；页缓存没有清（容器里无权限），冷读未测 | 已核；画面注明「热缓存」 |
| O02 | 这条查询读的压缩数据 541,710 字节（约 529 KiB），正是 `age.bin` 的大小；整张表压缩后 882 MiB | out_04 §1 `compressed_bytes_read`；out_03 片段文件清单 `541710 age.bin`、`table_compressed 925152023` | 同上两份互证 | 同上 | 已核 |

### 表引擎

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| H01 | ClickHouse 2009 年起步，最初是给网页规模的日志做筛选与汇总的算子；2016 年开源 | AO 第 44 行 | clickhouse-docs `docs/about-us/history.md` 第 12 行（最初为 Yandex.Metrica 开发）、第 56 行（2009 年起 Metrica 用 OLAPServer） | — | 已核 |
| H02 | 它最初是为 Yandex.Metrica（网站统计）开发的；2014 年 4 月，Metrica 每天记录约 120 亿次浏览与点击 | `history.md` 第 12、16 行 | AO 第 44 行（日志数据） | 截至文档所写的 2014 年 | 已核（单一出处的数字只用于时代背景，画面注出处） |
| E01 | 建表时用 `ENGINE` 子句为每张表指定表引擎 | out_03 `SHOW CREATE TABLE`；`docs/reference/engines/table-engines/index.mdx` | out_10 | 26.8 | 已核 |
| E02 | 26.8.34.13 共有 84 种表引擎，名字里带 MergeTree 的 16 种（8 种加上各自的 Replicated 版本） | out_10 `system.table_engines` | — | 本版本 | 已核 |
| E03 | 表引擎分三类：MergeTree 家族是 ClickHouse 主要的持久化格式；特殊用途的（字典、内存表、跨分片的 Distributed）；与外部系统交换数据的虚拟引擎（PostgreSQL、MySQL、Kafka、S3 等） | AO 第 72、74、76 行 | out_10 的引擎清单里有 Distributed、Memory、MySQL、Kafka、S3 等 | — | 已核 |
| E04 | 不写 `ENGINE` 时缺省用 MergeTree；ClickHouse 自己的 `query_log`、`part_log` 等日志表也是 MergeTree | out_10 `default_table_engine = MergeTree`、`noengine` 表的 `engine_full`、system 表的 engine | `Core/Settings.cpp:4881`；`Core/SettingsChangesHistory.cpp:1163` | 26.8 | 已核 |
| E05 | MergeTree 家族的各个引擎区别在合并时怎样合并输入片段里的行，例如聚合或替换；ReplacingMergeTree 去掉排序键相同的重复行，SummingMergeTree 把排序键相同的行合成一行、数值列相加 | AO 第 72 行 | `replacingmergetree.mdx` 第 11 行；`summingmergetree.mdx` 第 11 行 | — | 已核 |
| E06 | MergeTree 基于 LSM 树（O'Neil 等，1996）的思路：表分成按主键排好序的片段，后台持续合并；与 LSM 树不同，ClickHouse 不把片段分层，所有片段同等对待 | AO 第 72、98 行，参考文献 [58][60] | clickhouse-docs `docs/managing-data/core-concepts/merges.mdx` 第 23 行 | — | 已核。片中不说「名字取自 LSM 树」（没有找到这样的原话），只说「思路来自」 |
| E07 | 稀疏主键索引不像 B 树那样定位单行，而是在索引项上二分，找出成组的行 | clickhouse-docs `docs/guides/best-practices/sparse-primary-indexes.md` 第 160 行 | out_04 `EXPLAIN`：`Search Algorithm: binary search`；片段里没有 B 树结构的文件（out_03 文件清单） | — | 已核 |

### 一列挨一列

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| C01 | 8 行乱序插入，片段里已按 id 排好（`_part_offset` 0–7 对应 id 1–8） | out_02 第一张结果表 | `age.bin` 解压后的字节顺序 | — | 已核 |
| C02 | Wide 片段每列一个 `.bin` 与一个 `.cmrk2` 标记文件；String 列另有 `name.size.bin` 存长度；还有 `primary.cidx`、`columns.txt`、`count.txt`、`checksums.txt` 等 | out_02、out_03 文件清单 | — | 26.8 | 已核 |
| C03 | `age.bin` 解压后正好 8 字节 `1e 19 29 13 21 34 1c 24`，即 30、25、41、19、33、52、28、36（alice…heidi 的年龄，按 id 排） | out_02 `clickhouse compressor --decompress < age.bin \| xxd` | 与插入的数据逐一对应 | — | 已核 |
| C04 | 压缩块：16 字节 CityHash128 校验和，1 字节方法（`0x82` 为 LZ4），4 字节压缩后大小（含 9 字节块头），4 字节原大小，然后是数据；所有大小为小端 | `Compression/CompressionInfo.h:17`、第 22–40 行注释、`:43` 枚举 | out_02 `xxd age.bin`：`…82 12000000 08000000 80 1e…`（压缩后 18、原 8） | — | 已核 |
| C05 | 小片段缺省写成 Compact 格式（所有列在一个 `data.bin` 里，按颗粒一列接一列）；超过 `min_bytes_for_wide_part`（10 MiB）才每列一个文件 | out_01 `min_bytes_for_wide_part 10485760`；out_02 Compact 片段的 `data.bin` 解压内容 | `Storages/MergeTree/MergeTreeSettings.cpp:78` | 26.8 | 已核；片中 8 行小表用 Wide 演示，画面注明「为演示设 min_bytes_for_wide_part = 0」 |
| C06 | 一亿行：age 一人 1 字节，原 100,000,000 字节（95.37 MiB），压缩后 541,710 字节；name 原 5.67 GiB，压缩后 498.66 MiB；id 原 381.47 MiB，LZ4 几乎压不动（383.12 MiB）；整表原 6.14 GiB、压缩后 882.29 MiB | out_03 `system.columns` | out_03 片段文件清单的文件大小 | 演示数据 | 已核。**年龄按 `18 + id % 63` 循环，规律极强，压缩比远高于真实数据**；画面必须注明，旁白不说压缩倍数 |

### 片段与合并

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| P01 | 一次插入写成一个新片段；片段由插入生成，之后不再改动（immutable） | AO 第 88 行 | out_05、out_03 `part_log` 的 NewPart | — | 已核 |
| P02 | 新片段先写在 `tmp_insert_` 开头的临时目录，写完改名为正式名字 | `Storages/MergeTree/MergeTreeDataWriter.cpp:760`；`MergeTreeData.cpp:6804` 日志 `Renaming temporary part … to …` | out_05：`Renaming temporary part tmp_insert_all_91_91_0 to all_91_91_0`；out_09 停机时看到的 `tmp_insert_all_43_43_0` | — | 已核 |
| P03 | Dave 一行插入：片段 `all_91_91_0`，Compact，1 行，947 字节，11 个文件 | out_05 | — | — | 已核 |
| P04 | 异步插入在 26.8 缺省开启（26.2 起），`wait_for_async_insert = 1`；三人同时插入写成 1 个 3 行的片段，各自同步插入则是 3 个片段 | out_05；out_01 `async_insert 1` | `Core/Settings.cpp:7206`；`Core/SettingsChangesHistory.cpp:430`（26.2 段）`:437` | 26.2 起 | 已核 |
| P05 | 一亿行一条 `INSERT … SELECT`：15.1 秒，写成 90 个片段，每个 1,111,953 行（最后一个较少） | out_03 | out_03 `part_log` NewPart 90 个，合计 100,000,000 行 | 本机 | 已核 |
| P06 | 为了让片段数少，后台合并把小片段并成大片段；片段都按主键排好序，合并用 k 路归并排序 | AO 第 88 行 | out_03 `part_log` MergeParts | — | 已核 |
| P07 | 写入期间的合并：6 个并成 1 个（`all_1_6_1` 等），再 9 个并成 1 个（`all_1_29_2`），最后剩 3 个片段；`OPTIMIZE TABLE … FINAL` 并成一个 `all_1_90_3`，用时 10.3 秒 | out_03 | — | 本机这一次运行 | 已核 |
| P08 | 片段名 `分区_最小块号_最大块号_层级[_变更号]`；没有分区时分区名为 `all`；层级随每次合并加一 | `Storages/MergeTree/MergeTreePartInfo.cpp:210–235` | clickhouse-docs `docs/managing-data/core-concepts/parts.md`；out_03 的名字序列 | — | 已核 |

### 稀疏索引

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| Q01 | 平均年龄只读 age 一列：选中 12208 个颗粒、读 1 亿行，解压后 100,000,000 字节 | out_04 §1 | — | — | 已核 |
| Q02 | `index_granularity` 缺省 8192；一亿行 12208 个颗粒（12207 个满 8192 行，最后一个 256 行），主键索引 12209 项（含结尾一项），解压后 48,836 字节，在内存里 47.69 KiB | out_01；out_04 `mergeTreeIndex`、`primary.cidx` 解压；out_03 `pk_in_memory` | `MergeTreeSettings.cpp:72`；`sparse-primary-indexes.md` 第 298 行（主键索引整个载入内存） | — | 已核 |
| Q03 | 索引项是每个颗粒第一行的 id：1、8193、16385、24577… | out_04 `od -t u4` | out_04 `mergeTreeIndex` 的 `id` 列 | — | 已核 |
| Q04 | 找 id = 2050：二分，选中 1/12208 个颗粒，读 8192 行，压缩数据 108,475 字节，1–2 毫秒 | out_04 §2 `EXPLAIN indexes = 1` 与 `pk_*` | — | 热缓存 | 已核 |
| Q05 | 每列的标记：每个颗粒一项，记压缩块在列文件里的偏移与块内偏移，外加行数（每项 24 字节）；几个颗粒可以共用一个压缩块（age 列 1526 个块，id 6104 个，name 12208 个） | out_02、out_04 `age.cmrk2` 的 `od -t u8`、`mergeTreeIndex(with_marks)` | `Formats/MarkInCompressedFile.h` | — | 已核 |
| Q06 | 按姓名找：排序键帮不上，12208/12208 个颗粒全选；先读 name 列（PREWHERE），压缩数据 522,949,259 字节，259–312 毫秒 | out_04 §3 | `EXPLAIN` 里的 `Prewhere filter`；`delete.mdx` 第 78 行对 PREWHERE 的说明 | 热缓存 | 已核 |
| Q07 | 关掉了查询条件缓存（`use_query_condition_cache = 0`），否则重复查询会跳过上次不命中的颗粒 | out_04 脚本说明；`SettingsChangesHistory.cpp:812` | — | 26.8 | 已核（只在画面注解里出现） |

### 改

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| U01 | `ALTER TABLE … UPDATE` 是一次变更：`mutation_92.txt`，各片段生成新版本 `all_1_90_3_92`、`all_91_91_0_92`，0.383 秒 | out_06 | `docs/reference/statements/alter/update.mdx` | — | 已核 |
| U02 | 新版本里 `age.bin` 是新文件（inode 变了、链接数 1）；`id.bin`、`name.bin`、`name.size.bin`、`primary.cidx` 与旧片段同一个 inode，链接数 2（硬链接） | out_06 `ls -li` | `Storages/MergeTree/MutateTask.cpp:1563–1564` | — | 已核 |
| U03 | 这次变更读了片段的 1 亿行，用时 377 毫秒 | out_06 `part_log` MutatePart | — | 本机 | 已核 |
| U04 | 轻量更新 `UPDATE … SET`：普通表上报错，要表开启 `enable_block_number_column` 等；开启后 0.095 秒，写成一个 1 行的补丁片段 `patch-…` | out_06 §2 | `Core/Settings.cpp`（`allow_experimental_lightweight_update` 缺省 1） | 26.8 | 已核（只作注解） |

### 删

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| D01 | `DELETE FROM` 缺省按 `alter_update` 方式做成变更 `UPDATE _row_exists = 0 WHERE id = 2050` | out_07 `system.mutations`；out_01 `lightweight_delete_mode alter_update` | `delete.mdx` 第 72 行 | 26.8 | 已核 |
| D02 | 新片段多了 `_row_exists.bin` 与标记，其余文件全是硬链接（链接数 3） | out_07 `ls -li` | — | — | 已核 |
| D03 | 删除后查询自动过滤：总数少 1，id 1–8192 这个颗粒剩 8191 行 | out_07 | `delete.mdx` 第 76–78 行（查询被改写为 `PREWHERE _row_exists`） | — | 已核 |
| D04 | 被删的行在下一次合并时才真正移除；`OPTIMIZE FINAL` 之后的片段没有 `_row_exists` | out_07 §2 | `delete.mdx` 第 31 行 | — | 已核 |
| D05 | 被替换的旧片段约 10 分钟后才从磁盘删除（变更与合并在 01:42 前后，`RemovePart` 在 01:52:25） | out_07 §3 | `old_parts_lifetime = 480`（out_01；`MergeTreeSettings.cpp:583`），再加清理线程的间隔 | 本机 | 已核；旁白说「又在磁盘上留了约十分钟」 |
| D06 | 旧片段只有在没有查询使用（refcount 为 1）时才删 | `MergeTreeSettings.cpp:591–593` | AO 第 88 行；out_08 refcount | — | 已核 |

### 并发

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| B01 | Bob 的慢查询 3.2 秒；开始 1 秒后 Carol 插入，用时 2 毫秒；再 1 秒后 Carol 的变更，39 毫秒 | out_08 `query_log` 时间 | — | 本机 | 已核（数字待重跑确认，见上） |
| B02 | Bob 的结果不含 Carol 的新行（100,000,001），他读完后再查是 100,000,002 | out_08 | — | — | 已核（同上） |
| B03 | Bob 读的时候，被变更替换的旧片段 `active = 0`、refcount 5，仍在 | out_08 | AO 第 88 行（refcount 降到零才删） | — | 已核 |
| B04 | 查询开始时取当时活动片段的集合；写入不阻塞读取，没有行锁 | AO（并发一节，第 149 行起「neither of which block parallel inserts」） | out_08 | — | 已核（快照的源码定位待补：`MergeTreeData::getSnapshot`） |
| B05 | 多语句事务：缺省配置下 `BEGIN TRANSACTION` 报 `Transactions are not supported` | out_08 | — | 26.8 缺省配置 | 已核 |

### 出错

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用 | 状态 |
|---|---|---|---|---|---|
| R01 | ClickHouse 把插入直接写到磁盘，不像其他基于 LSM 树的存储那样用预写日志 | AO 第 98 行 | 片段目录与数据目录里没有日志文件（out_01、out_03） | — | 已核 |
| R02 | 写一亿行时第 4 秒强行终止（SIGKILL，退出码 137）：停机时目录里有 42 个完整片段和 `tmp_insert_all_43_43_0`、`tmp_insert_all_44_44_0` 两个临时目录 | out_09 §1 | — | 本机 | 已核 |
| R03 | 重启时日志 `Removing temporary directory …tmp_insert_all_43_43_0/` 与 `…44_44_0/`；表里 42 个片段、46,702,026 行（42 × 1,111,953），id 从 1 连续到 46,702,026 | out_09 | `MergeTreeData.cpp:4861`（启动时清理 `tmp_` 前缀）、`:4037` | — | 已核。注意：同一条 `INSERT` 已写完的片段留下了，不是整条语句回滚 |
| R04 | 停机后看到的「`ls -d tmp_* \| wc -l` = 1」可能是重启后新的合并临时目录（`SYSTEM STOP MERGES` 不跨重启），脚本已改为列出名字，重跑时确认 | out_09 | — | — | **待核实**，不进旁白 |
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

## 取证中发现、没有进入成片的事实

- 查询条件缓存（26.8 缺省开启）会让重复的过滤查询跳过上次不命中的颗粒（Q07）。
- `id` 列递增的 UInt32 用 LZ4 几乎压不动（C06）；换 Delta 编码会好得多，片中不讲。
- 26.8 的 String 列把长度单独存成 `name.size.bin`（`columns_substreams.txt`）。
- `TRUNCATE` 在 `part_log` 里留下 0 行的「NewPart」（out_05）。

## 复核

未做（文案未定稿）。
