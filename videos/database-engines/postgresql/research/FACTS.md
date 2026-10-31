# PostgreSQL 事实表（新版）

旁白、画面、注解与封面上的事实只来自本表。2026-10-26 开工，2026-10-27 取证。条目逐项实测、读原文后再填，每条写清出处与核对方式。

状态一栏：**实测** 指本片实验的回显；**原文** 指官方文档、源码或一手页面的原句；两路互相印证的写「实测＋原文」；只有一路或来源受限的写明原因。实验的回显与原句都在 [lab/](lab/)，`out_NN_*.json` 与脚本 `NN_*.py` 同名对应。

## 环境与版本

- 对象：**PostgreSQL 18**，当前最新的生产大版本。WaterRun 2026-10-26：「pg用最新生产版本」；2026-10-27：「Pg我系统安装的是18大版本了, 那就以此即可」——以大版本 18 为准，实测用本机已装的 18.4。
- 18 是最新的生产大版本：[版本政策页](https://www.postgresql.org/support/versioning/)的支持表，18 系列首发 2025-09-25，当前小版本 18.6；[官网首页](https://www.postgresql.org/)「Latest Releases」列 18.6 于 2026-08-13 发布，同页的 PostgreSQL 19 RC 1（2026-10-15）是候选版，官方注明不建议用于生产。2026-10-26、10-27 读取。18 的发布公告：「Posted on 2025-09-25 … announced the release of PostgreSQL 18」（`out_09_docs.json` 的 release-18）。交付前再核一次 19 是否已正式发布。
- 为什么 18.4 的实测代表 18：同一版本政策页——「Starting with PostgreSQL 10, a major version is indicated by increasing the first part of the version」；「Minor releases only contain fixes for frequently-encountered bugs, low-risk fixes, security issues, and data corruption problems」；「Minor release upgrades do not require a dump and restore」，而大版本「the contents of the data directory cannot be maintained in a backward compatible way」。即同一大版本内数据目录通用，页与行的盘上结构不随小版本变。片中写「PostgreSQL 18」，实测记录写明 18.4。
- 旧版材料：旧版（2026-10-19 发布，基于 18.4）的事实表、来源与实验原样存档在 [r12/](r12/)。WaterRun 2026-10-27：「旧版本不用署名」。旧材料只作线索，本表全部重测、重读原文。

## 取证环境

| 项 | 内容 | 依据 |
|---|---|---|
| 实验 01–07 | Windows x86-64；`C:\Program Files\PostgreSQL\18\bin` 的已装二进制，`server_version` 18.4（`server_version_num` 180004）；每个脚本新建独立集群（临时目录、随机端口、只听 127.0.0.1），initdb 用 C 区域、UTF8；做完即删；不连接已有服务 | `lab/pglab.py`；各 `out_0N_*.json` 的 environment 与第一条查询 |
| 集群设置 | 块大小 8192；`data_checksums` on；WAL 段 16 MB；`wal_level` replica、`synchronous_commit` on、`full_page_writes` on、`fsync` on、`wal_sync_method` open_datasync、`checkpoint_timeout` 300 s、`max_wal_size` 1024 MB（以上均为默认值）；为控制时机，实验里 `autovacuum` 设为 off（不是建议） | `out_01_build.json` 第 2 条查询；`out_06_wal_crash.json` 的 steps.1_checkpoint.settings |
| 数据 | 系列共用的 `users(id int 主键, name char(50), age smallint)`，另有 `idx_name(name)`、`idx_age(age)`；4096 行逐行插入（每行一句、自动提交）；人名 `User` + 5 位编号 + 固定 40 个字母，共 50 字符；2050 号是 Alice 42 岁，其他人 `18 + id % 63` 岁。规则与 MyISAM、InnoDB 两集相同，PostgreSQL 没有 TINYINT，年龄用 smallint | `lab/pglab.py` 的 SCHEMA、ROW_SQL、build；InnoDB 一集 [FACTS](../../innodb/research/FACTS.md) 的「数据」行 |
| 可复现 | 各脚本语句序列相同，结构、页号、行位置、事务号在各次运行里一致（Alice 的 xmin 都是 2809）；WAL 位置、校验和、进程号、时间每次不同，引用时以本表所列那次回显为准 | 多次重跑对比 |
| 08–10 | 调查原页、官方文档、源码在 2026-10-27 重新下载，存进 `research/_src/`（不入库），记网址与 SHA-256 | `out_08_survey.json`、`out_09_docs.json`、`out_10_source.json` |
| 源码 | GitHub `postgres/postgres` 标签 REL_18_4 | `out_10_source.json` |
| 脱敏 | 回显写入前把个人目录、用户名、主机名、本片路径换成通用写法；已检查入库的回显里没有用户名、主机名与本机路径 | `pglab.Lab.clean` |

## 对象与解释路径

一张表在 PostgreSQL 里是一个**堆**：一串 8 KB 的页，行按到达顺序放进去，哪页有空放哪页，不按主键排。每个索引是另一个独立的文件，都是 B 树；叶子里存「键 + 行地址（ctid：第几页、第几项）」，主键索引也一样，没有哪棵树装着整行。一页之内，页头之后是从前往后长的项目指针，行版本从页尾往前长，中间是空隙。

改一行不覆盖：写一个新版本，旧版本记下「哪个事务把它作废了」（xmax）并指向新版本。谁能看见哪个版本，由每个事务的快照和 pg_xact 里的提交状态决定，读和写互不阻塞。旧版本留在页里，直到 VACUUM 确认谁都不再需要，才收回空间、删掉索引项。每次修改先写 WAL，提交时 WAL 落盘，数据页稍后写回；崩溃后从检查点重放 WAL；没提交的事务不用撤，它写下的版本状态是 aborted，谁都看不见。

一次完整路径（实测）：按名字找 Alice → 姓名树根页 3 → 叶子 1 → ctid (23,26) → 堆第 23 页第 26 个项目指针 → 偏移 5904 处 82 字节的行 → 用 xmin/xmax 判断可见 → 读到 Alice 42 岁。

未解决：无。

## 开场：开发者调查

Stack Overflow 开发者调查「Databases」题、「All Respondents」口径，多选、自报。各年是不同样本，不是市场份额，也不是同一批人的迁移。原页 2026-10-27 重新下载（`out_08_survey.json`，每年记网址与 SHA-256）。

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| S1 | 2022 年：MySQL 46.85%（28 520 人），PostgreSQL 43.59%（26 538 人），MySQL 领先 | [2022 原页](https://survey.stackoverflow.co/2022/)表格 `databasespfb1`，位于 `figure#most-popular-technologies-database`；切到它的标签按钮标题是「All Respondents」（`-prof`、`-learn` 是另两种口径），脚本断言 | 原文 |
| S2 | 2023 年：PostgreSQL 45.55%（34 909 人）首次超过 MySQL 41.09%（31 489 人） | [2023 原页](https://survey.stackoverflow.co/2023/)表格 `databasedmk1u`，同上核对口径 | 原文 |
| S3 | 2024 年：PostgreSQL 48.7%，MySQL 40.3% | [2024 原页](https://survey.stackoverflow.co/2024/technology)的 SVG 柱状图，前文为 Databases 题、All Respondents 标签；只有百分比，没有人数 | 原文 |
| S4 | 2025 年：PostgreSQL 55.6%，MySQL 40.5% | [2025 原页](https://survey.stackoverflow.co/2025/technology)，同上 | 原文 |
| S5 | 2026 年：PostgreSQL 57.9%（6 984 人），MySQL 35.1%（4 235 人）；这一题的答题人数 12 061 | [2026 原页](https://survey.stackoverflow.co/2026/technology/data/databases)附带的导出 JSON：demographic「All Respondents」、n 12061；百分比与「人数 ÷ n」逐项核对一致；数据许可 ODbL 1.0，Stack Exchange Inc. | 原文 |
| S6 | 2022 → 2026：PostgreSQL 43.59% → 57.9%，MySQL 46.85% → 35.1%；2023 起 PostgreSQL 每年领先 | S1–S5 | 原文 |
| S7 | 2026 年的答题人数（12 061）远少于 2022、2023 年（两库人数之和就超过 5 万）；画面与旁白用百分比，写明各年是不同样本 | S1、S2、S5 | 原文 |
| S8 | 2026 年这一题全部选项里，勾选最多的前五个是 PostgreSQL 57.9%、SQLite 42.1%、MySQL 35.1%、Redis 28.3%、Microsoft SQL Server 27.1%：PostgreSQL 第一，SQLite 第二 | 2026 原页导出 JSON 的全部选项按比例排序（`out_08_survey.json` years[2026].export.top5） | 原文 |

## 来历与标题

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| H1 | POSTGRES 是伯克利的研究项目，由 Michael Stonebraker 教授领导，1986 年开始实现 | [18 手册《A Brief History of PostgreSQL》§2.1](https://www.postgresql.org/docs/18/history.html)：「The POSTGRES project, led by Professor Michael Stonebraker, …」「The implementation of POSTGRES began in 1986.」 | 原文 |
| H2 | 名字的意思是 Ingres 之后：「Post-Ingres」，要做到 Ingres 能做的并更进一步；Ingres 也是 Stonebraker 在伯克利做的关系数据库 | Hellerstein《Looking Back at Postgres》（[arXiv:1901.01973v1](https://arxiv.org/html/1901.01973v1)，2019-01-07，§2）：「As indicated by the name, Postgres was "Post-Ingres": a system designed to take what Ingres could do, and go beyond.」；[伯克利 EECS 教员页](https://www2.eecs.berkeley.edu/Faculty/Homepages/stonebraker.html)：「While at Berkeley, he developed prototypes for the INGRES relational data management system (DBMS), the object-relational DBMS, POSTGRES, …」 | 原文（两处） |
| H3 | 伯克利的 POSTGRES 项目以 4.2 版结束 | 手册 §2.1：「the Berkeley POSTGRES project officially ended with Version 4.2.」 | 原文 |
| H4 | 1994 年 Andrew Yu 与 Jolly Chen 给 POSTGRES 加上 SQL 解释器，改名 Postgres95 作为开源后代发布；查询语言 PostQUEL 换成 SQL；有了 psql | 手册 §2.2：「In 1994, Andrew Yu and Jolly Chen added an SQL language interpreter to POSTGRES.」「… released to the web … as an open-source descendant of the original POSTGRES Berkeley code.」「The query language PostQUEL was replaced with SQL」「A new program (psql) was provided」 | 原文 |
| H5 | 1996 年改名 PostgreSQL，名字表明它是原来的 POSTGRES 加上了 SQL 支持；版本号从 6.0 起，接上伯克利 POSTGRES 的序列；Postgres 仍是官方认可的项目名 | 手册 §2.3：「By 1996 … We chose a new name, PostgreSQL, to reflect the relationship between the original POSTGRES and the more recent versions with SQL capability.」「we set the version numbering to start at 6.0」「Postgres is still considered an official project name」 | 原文 |
| H6 | Stonebraker 获 2014 年度 ACM 图灵奖（2015 年 3 月公布） | [伯克利 EECS 教员页](https://www2.eecs.berkeley.edu/Faculty/Homepages/stonebraker.html)的奖项列表「Turing Award, 2014」；[LWN](https://lwn.net/Articles/637827/)：「The ACM has announced that the 2014 A. M. Turing award has gone to Michael Stonebraker.」「he was the original creator of the database management system now known as PostgreSQL」（经网页工具读取，2026-10-27）；[MIT News 2015-03-25](https://news.mit.edu/2015/michael-stonebraker-wins-turing-award-0325)引 ACM 公告：Stonebraker「invented many of the concepts that are used in almost all modern database systems」 | 原文（三处独立）；ACM 自己的页面（amturing.acm.org、awards.acm.org、acm.org、cacm）在本机取证环境一律 HTTP 403，未能读原页 |
| H7 | 18 手册：在 SQL:2023 全部 Core 符合所需的 177 项强制特性中，PostgreSQL 至少符合 170 项；目前没有任何数据库管理系统声称完全符合 Core SQL:2023 | [18 手册《SQL Conformance》](https://www.postgresql.org/docs/18/features.html)：「PostgreSQL supports most of the major features of SQL:2023. Out of 177 mandatory features required for full Core conformance, PostgreSQL conforms to at least 170.」「… no current version of any database management system claims full conformance to Core SQL:2023.」 | 原文 |
| H10 | 其他数据库公布的标准符合情况（画面脚注用）：Oracle 23ai 的手册按 SQL:2011 的 Core SQL 逐项说明，其中有明确写「不支持」的项（F501）；SQL Server 的官方标准支持文档（MS-TSQLISO02）只覆盖 SQL Server 2008 R2 与 2012；MySQL 8.4 手册的《MySQL Standards Compliance》只作总体说明（有许多扩展，也有缺的功能），没有逐项清单。各家的标准版本与计数方法（按特性还是子特性）不同，**不能据此比较谁符合得最多**，片中只说 PostgreSQL 自己的数字与「没有谁声称全部符合」 | [Oracle《Oracle Compliance to Core SQL》](https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/Oracle-Compliance-To-Core-SQL2011.html)：「F501, Feature and conformance views Oracle does not support this feature.」「… it flags SQL-92 compliance rather than SQL:2011 compliance.」；[Microsoft SQL Server Standards Support](https://learn.microsoft.com/en-us/openspecs/sql_standards/ms-sqlstandlp/89fb00b1-4b9e-4296-92ce-a2b3f7ca01d2)：「[MS-TSQLISO02] … Describes the level of support that is provided by Transact-SQL in both SQL Server 2008 R2 and SQL Server 2012 for Part 2: Foundation」（以上见 `out_09_docs.json`）；[MySQL 8.4 手册 §1.7](https://dev.mysql.com/doc/refman/8.4/en/compatibility.html)：「MySQL Server has many extensions to the SQL standard … You can also find information about functionality missing from MySQL Server」（脚本下载一律断开，2026-10-27 经网页工具读取） | 原文 |
| H11 | Ingres 的历史地位：最早的关系数据库之一；Ingres 与 Postgres 的思想、很多时候连同源码，催生了后来的多个数据库产品，包括 IBM 的 Informix、EMC 的 Greenplum；Stonebraker 因 INGRES 获 ACM 软件系统奖（教员页上年份前后不一，片中不写年份） | [MIT News 2015-03-25](https://news.mit.edu/2015/michael-stonebraker-wins-turing-award-0325)：「Ingres was one of the first relational databases, which provide a more organized way to store multiple kinds of entities – and which now serve as the industry standard for business storage.」「… Ingres and Postgres, which provide the foundational ideas — and, in many cases, specific source code — that spawned several contemporary database products, including IBM’s Informix and EMC’s Greenplum.」；[伯克利 EECS 教员页](https://www2.eecs.berkeley.edu/Faculty/Homepages/stonebraker.html)：「While at Berkeley, he developed prototypes for the INGRES relational data management system (DBMS), the object-relational DBMS, POSTGRES …」「He was awarded the prestigious ACM System Software Award … for his work on INGRES.」（2026-10-31 经网页工具读取；ACM 的两个页面仍是 HTTP 403。「与 System R 并称最早」「影响 Sybase、SQL Server」只见于搜索摘要与百科镜像，未采用） | 原文 |
| H8 | 一个事务里建表、给 users 加一列、插一行，然后 ROLLBACK：新表不存在，users 回到 3 列，那一行也不在（事务里的 DDL 可以回滚） | `out_07_orthodox.json` steps.1_ddl_rollback：事务内列数 4，回滚后 3；`to_regclass('orders')` 为空；5000 号 0 行 | 实测 |
| H9 | 约束由数据库自己拒绝：CHECK（年龄 0–150）插 200 岁 → 23514；外键指向不存在的用户 → 23503；主键重复 → 23505「duplicate key value violates unique constraint "users_pkey"」；NOT NULL → 23502；删除仍被订单引用的 Alice → 23503「… is still referenced from table "orders"」 | `out_07_orthodox.json` steps.2_constraints 的 SQLSTATE 与原文 | 实测 |

「学院派」由 H1、H2、H6 支撑；「正统」由 H7–H9 支撑。不写「取代 MySQL」：S1–S7 是自报、多选的调查，不说明市场份额或迁移。

## 整体结构

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| T1 | 每张表、每个索引各是一个文件，放在 `base/<数据库 OID>/<文件节点号>`：users 是 `base/5/16466`，主键索引 `base/5/16472`，姓名索引 `base/5/16474`，年龄索引 `base/5/16475`；超过 1 GB 再分段 | `out_01_build.json`：`pg_relation_filepath`；[18 手册《Database File Layout》](https://www.postgresql.org/docs/18/storage-file-layout.html)：「When a table or index exceeds 1 GB, it is divided into gigabyte-sized segments.」「The first segment's file name is the same as the filenode」 | 实测＋原文 |
| T2 | 堆（users）共 47 页、385 024 字节（47 × 8192）；每页 88 行，最后一页 48 行；行按插入顺序排：第 k 页放 88k+1 到 88k+88 号 | `out_01_build.json`：tag「rows per heap page」、files_before_vacuum | 实测 |
| T3 | Alice 的地址 ctid 是 (23,26)：堆第 23 页的第 26 个项目指针 | `out_01_build.json` alice | 实测 |
| T4 | 主键树 14 页、两层：第 0 页是元数据页，根是第 3 页，下面 12 页叶子；根里通往 Alice 的那一项键为 1831、指向叶子 7；叶子 7 里 Alice 那一项 16 字节，键 2050，指向 (23,26) | `out_01_build.json` trees.users_pkey：levels、path_from_root（root item `27 07 00 00` = 1831 → (7,1)）、alice_item（itemlen 16，data `02 08 00 00`，htid (23,26)） | 实测 |
| T5 | 姓名树 41 页、两层：根第 3 页，39 页叶子；「Alice」按字节序排在所有「User…」之前，在最左边的叶子 1；每项 64 字节 | `out_01_build.json` trees.idx_name（root item 1 无键，即最左下指针 → 叶子 1；alice_item itemlen 64） | 实测 |
| T6 | 年龄树 7 页、两层：根第 3 页，5 页叶子；同一个年龄的行地址合并成一项（posting list）：42 岁那一项 376 字节，装着 60 个行地址，Alice 的 (23,26) 在其中 | `out_01_build.json` trees.idx_age.alice_item（itemlen 376，tids 60 个）；[18 手册 B 树 §64.1.4.3 Deduplication](https://www.postgresql.org/docs/18/btree.html)（`out_09_docs.json` btree-dedup 的 deduplication、posting list 两组原句） | 实测＋原文 |
| T7 | PostgreSQL 的索引都是独立于表的「二级索引」，叶子里只有键与行地址；普通索引扫描要从索引再到堆取行 | [18 手册《Index-Only Scans and Covering Indexes》](https://www.postgresql.org/docs/18/indexes-index-only-scans.html)：「All indexes in PostgreSQL are secondary indexes, meaning that each index is stored separately from the table's main data area (which is called the table's heap …)」「each row retrieval requires fetching data from both the index and the heap」；T4–T6 | 实测＋原文 |
| T8 | 堆另有两个小分支文件：空闲空间图 `16466_fsm`（插完时已有，3 页、24 576 字节）；可见性图 `16466_vm`（第一次 VACUUM 之后才有，1 页、8192 字节），VACUUM 把 47 页都标成「全可见」 | `out_01_build.json` files_before_vacuum、files_after_vacuum、tag「vm after vacuum」（all_visible 47）；手册 File Layout 的 `_fsm`、`_vm` 原句；[Visibility Map](https://www.postgresql.org/docs/18/storage-vm.html)：「keep track of which pages contain only tuples that are known to be visible to all active transactions; it also keeps track of which pages contain only frozen tuples」 | 实测＋原文 |
| T9 | 对照 InnoDB（同一张表）：InnoDB 的表就是主键树，users.ibd 49 页，主键树根页 4、21 页叶子；姓名索引叶子里存「姓名 + 主键」 | InnoDB 一集 [FACTS](../../innodb/research/FACTS.md) T1、T4 | 引用 |

## 一页之内

Alice 所在的堆第 23 页（检查点后）原样存在 `lab/pages/`：缓冲区里的一份 `01_users_blk23.page`，从数据文件读的一份 `01_users_blk23.disk.page`。pageinspect 与自写解析（`pglab.parse_heap_page`，按源码头文件的布局）逐项一致（`out_01_build.json` alice_page.checks 全为 true）。

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| P1 | 页头 24 字节：pd_lsn 8、pd_checksum 2、pd_flags 2、pd_lower 2、pd_upper 2、pd_special 2、页大小与版本 2、pd_prune_xid 4 | [18 手册《Database Page Layout》](https://www.postgresql.org/docs/18/storage-page-layout.html)表 66.3 与「24 bytes long」原句；源码 `src/include/storage/bufpage.h` 第 159–170 行（REL_18_4） | 原文（两处）＋实测解析 |
| P2 | 页头之后是项目指针，每个 4 字节（偏移 15 位、状态 2 位、长度 15 位），从前往后长；行版本从页尾往前长；中间是空隙。项目指针一旦分配就不挪，所以「第几项」可以长期当地址用，行在页内挪动也不影响 | 手册 Page Layout：「The number of item identifiers present can be determined by looking at pd_lower」「Because an item identifier is never moved until it is freed, its index can be used on a long-term basis to reference an item, even when the item itself is moved around on the page」；源码 `src/include/storage/itemid.h` 第 27 行（`lp_off:15`）、第 38–41 行（LP_UNUSED 0、LP_NORMAL 1、LP_REDIRECT 2、LP_DEAD 3） | 原文 |
| P3 | 第 23 页：88 个项目指针，pd_lower = 24 + 88 × 4 = 376；pd_upper 448；空隙只剩 72 字节 | `out_01_build.json` alice_page.header | 实测 |
| P4 | 第 26 个项目指针：偏移 5904、长度 82、状态 1（正常） | `out_01_build.json` alice_page.alice_item | 实测 |
| P5 | Alice 那一行 82 字节 = 行头 24 + 数据 58。行头字节 `f90a0000 00000000 00000000 0000 1700 1a00 0300 0209 18 00`：xmin 2809、xmax 0、命令号 0、t_ctid (23,26)（指向自己）、infomask2 3（3 列）、infomask 0x0902（HEAP_HASVARWIDTH、HEAP_XMIN_COMMITTED、HEAP_XMAX_INVALID）、t_hoff 24；行头结构本身 23 字节，补 1 字节对齐 | `out_01_build.json` alice_page.alice_item.header_hex 与 flags；手册 Page Layout「HeapTupleHeaderData Layout」与「23 bytes」原句；源码 `src/include/access/htup_details.h` 第 153 行起的 HeapTupleHeaderData、第 185 行 SizeofHeapTupleHeader | 实测＋原文 |
| P6 | 数据 58 字节：编号 `02080000`（2050，小端序）；名字前一个长度字节 `67`（短格式，含自身共 51 字节），然后「Alice」加 45 个空格（char(50) 用空格补齐）；1 字节对齐 `00`；年龄 `2a00`（42） | `out_01_build.json` alice_page.alice_item.data_hex；alice 的 `pg_column_size(name)` 51、`pg_column_size(users.*)` 82 | 实测 |
| P7 | 数据校验和默认开启（18 的 initdb 默认）：数据文件里这一页的 pd_checksum 是 36525，与 `page_checksum()` 按内容重算的值相同（-29011 是同一个 16 位数按有符号读）；缓冲区里那一份的 pd_checksum 是 0，因为校验和在写盘时才算在一份副本上；两份除校验和的 2 字节外完全相同 | `out_01_build.json` alice_page_on_disk、disk_vs_buffer_diff_offsets（只有第 8、9 字节）、checks；`data_checksums` on；源码 `src/bin/initdb/initdb.c` 第 167 行 `static bool data_checksums = true`、`src/backend/storage/buffer/bufmgr.c` 第 4363 行 `bufToWrite = PageSetChecksumCopy(`；手册 WAL Reliability：「Data pages are checksummed by default」 | 实测＋原文 |
| P8 | 对照 InnoDB：同一个 Alice 在 InnoDB 是 68 字节的行（另有 5 字节记录头），带事务号与回滚指针；PostgreSQL 的行头里是 xmin、xmax 与 t_ctid | InnoDB 一集 FACTS T7；本表 P5 | 引用＋实测 |

## 增

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| G1 | 逐行插入时，堆每 88 行加一页（第 1、89、177……4049 行各开一页新页），新行放在最后一页 | `out_01_build.json` growth | 实测 |
| G2 | Alice 注册（第 2050 行）时：堆当时 24 页，她落在最后一页第 23 页第 26 项；主键树里放进当时最右边的叶子 7；姓名树里放进最左边的叶子 1；年龄树里放进叶子 1 | `out_01_build.json` alice_at_insert（heap_pages 24、leaf、rightmost_leaf） | 实测 |
| G3 | 三棵树都从一页长到两层：姓名树在第 120 行第一次分裂、长出根（名字长，一页放得少），主键树在第 408 行，年龄树在第 1113 行（合并存放，最晚） | `out_01_build.json` growth 的根与层数变化 | 实测 |
| G4 | 主键是递增插入，总在最右边扩展：之后每 366 行加一页叶子（第 408、774、1140、1506、1872 行……）；B 树在最右边扩展时只把叶子填到九成（默认填充因子 90） | `out_01_build.json` growth；[18 手册 CREATE INDEX](https://www.postgresql.org/docs/18/sql-createindex.html)：「For B-trees, leaf pages are filled to this percentage during initial index builds, and also when extending the index at the right (adding new largest key values).」「B-trees use a default fillfactor of 90」 | 实测＋原文 |
| G5 | 树会分裂，项会被挪走：Alice 的年龄项插入时在叶子 1，插完 4096 行后在叶子 5 | G2；T6 | 实测 |
| G6 | 为什么最右边分裂时左页装到九成：普通分裂按字节对半分；编号一路递增时，新键总落在最右边，左页以后不再进新键，对半分会让各页只有五成满。所以最右边那页分裂时，左页留在填充因子（九成）。也不装满：装满的页之后哪怕少量更新或插入就要分裂 | 源码 `src/backend/access/nbtree/nbtsplitloc.c` `_bt_findsplitloc()` 注释（约第 95–103 行）：「If the page is the rightmost page on its level, we instead try to arrange to leave the left split page fillfactor% full. In this way, when we are inserting successively increasing keys (consider sequences, timestamps, etc) we will end up with a tree whose pages are about fillfactor% full, instead of the 50% full result that we'd get without this special case.」；nbtree README：「When we split a page, we try to equalize the number of bytes, not items, assigned to pages」；[18 手册 CREATE INDEX](https://www.postgresql.org/docs/18/sql-createindex.html)：「If pages subsequently become completely full, they will be split, leading to fragmentation of the on-disk index structure.」「A fillfactor setting of 100 otherwise risks harming performance: even a few updates or inserts will cause a sudden flood of page splits.」（2026-10-31 查） | 原文 |

## 查

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| Q1 | 按编号查 2050：执行计划「Index Scan using users_pkey」，读 3 页（根、叶、堆页） | `out_02_query.json` plans_before_vacuum.by_id（Buffers: shared hit=3） | 实测 |
| Q2 | 冷缓存（重启后）按编号查：读进缓冲区的是主键树第 0、3、7 页与堆第 23 页；另外姓名、年龄两个索引的第 0 页也被读进来——规划器要用每个 B 树的高度估代价，树高从元数据页（第 0 页）读 | `out_02_query.json` cold_paths.by_id；源码 `src/backend/optimizer/util/plancat.c` 第 493 行 `info->tree_height = amroutine->amgettreeheight(indexRelation)`、`nbtree.c` 第 153、1759 行、`nbtpage.c` 第 670–675 行（`_bt_getrootheight` 注释「This is used by the planner for cost-estimation purposes」，读 BTREE_METAPAGE） | 实测＋原文 |
| Q3 | 冷缓存按名字查 Alice：姓名树第 0、3、1 页（元数据、根、叶）与堆第 23 页 | `out_02_query.json` cold_paths.by_name | 实测 |
| Q4 | 全表计数：顺序扫描，读堆的全部 47 页 | `out_02_query.json` plans_before_vacuum.count_all、cold_paths.count_all | 实测 |
| Q5 | 按年龄 42 查：66 行，散在全部 47 页，执行计划是位图扫描（Bitmap Index Scan on idx_age → Bitmap Heap Scan，Heap Blocks: exact=47） | `out_02_query.json` plans_before_vacuum.by_age | 实测 |
| Q6 | 编号 2000–2100 的范围查询：主键索引扫描，101 行 | `out_02_query.json` plans_before_vacuum.id_range | 实测 |
| Q7 | 按名字只取编号：仍是普通索引扫描，要回堆，因为姓名索引里没有编号；InnoDB 的姓名索引里带主键，同样的查询只读索引 | `out_02_query.json` plans_before_vacuum.id_by_name；InnoDB 一集 FACTS E1 | 实测＋引用 |
| Q8 | 按名字只取名字：仅索引扫描。VACUUM 前「Heap Fetches: 1」（可见性图还没标，要回堆确认这一行可见），VACUUM 后「Heap Fetches: 0」，代价估计 8.30 → 4.30 | `out_02_query.json` index_only；手册 Visibility Map 的「index-only scans」原句（`out_09_docs.json` vm） | 实测＋原文 |
| Q9 | 对照 InnoDB：冷启动按主键查读主键树的根与叶，按名字查读姓名索引的根与叶，再回主键树 | InnoDB 一集 FACTS L1、L2 | 引用 |
| Q10 | 位图扫描先从索引取出全部地址，再按页的顺序去读堆，减少在堆里来回跳 | 手册 Index-Only Scans：「bitmap scans try to alleviate this cost by doing the heap accesses in sorted order」；Q5 | 原文＋实测 |

## 改

同一次「Alice 42 → 43」在三种表上各做一次（`out_03_update.json`）。每次更新前做检查点，用 pg_walinspect 列出这一段 WAL。

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| U1 | 系列原表：新版本写到第 46 页第 49 项（新行 82 字节，按 8 字节对齐占 88，再加一个 4 字节项目指针，第 23 页只剩 72 字节，放不下）；旧版本原地不动，xmax 记上更新它的事务 4866，t_ctid 指向 (46,49)；新版本 xmin 4866，标 HEAP_UPDATED | `out_03_update.json` results.users.before、after（old_item、new_item） | 实测 |
| U2 | 三个索引各多出一项，指向新版本，紧挨着指向旧版本的那项：主键叶子 7 的第 221（旧）、222（新）项；姓名叶子 1 的第 2、3 项；年龄叶子 5 的第 71、85 项 | results.users.after.index_entries | 实测 |
| U3 | 这次更新写的 WAL：Heap LOCK、Heap UPDATE、三条 Btree INSERT_LEAF、Transaction COMMIT（同一区间另有两条属于系统目录 rel 1255 的记录，与 users 无关）。LOCK 是因为新版本要去另一页：放开页锁前先把旧行临时标成已锁 | results.users.wal（block_ref 指向 16466、16472、16474、16475）；源码 `src/backend/access/heap/heapam.c` 第 3826 行附近：「To prevent concurrent sessions from updating the tuple, we have to temporarily mark it locked, while we release the page-level lock.」 | 实测＋原文 |
| U4 | 提交后第一次读到第 23 页时，旧版本被顺手剪掉：第 26 项变成 LP_DEAD（3），空隙 72 → 160 字节；这次按主键查，主键索引里指向旧版本的那项被标成 dead。剪枝的条件：上次更新在这页找不到空间，或空闲低于填充因子目标（至少 10%） | results.users.after_first_read；源码 `src/backend/access/heap/pruneheap.c` 第 226–242 行（注释与 `minfree = Max(minfree, BLCKSZ / 10)`、`PageIsFull(page) \|\| PageGetHeapFreeSpace(page) < minfree`） | 实测＋原文 |
| U5 | 每页留一成空位（fillfactor 90）、三个索引都在：新版本落在同一页（(25,75) → (25,80)），但改的是有索引的年龄，三个索引照样各加一项（年龄索引是合并存放项，记录是 INSERT_POST）；不是 HOT | results.users_ff90（stats n_tup_hot_upd 0；wal） | 实测 |
| U6 | 留空位、年龄没有索引：HOT。WAL 只有一条 Heap HOT_UPDATE 和 COMMIT；索引一项都不加，仍只指向 (25,75)；旧版本标 HEAP_HOT_UPDATED，新版本标 HEAP_ONLY_TUPLE；第一次读取后第 75 项变成重定向（LP_REDIRECT），指向第 80 项 | results.users_hot、hot_prune；源码 htup_details.h 第 295、296 行 | 实测＋原文 |
| U7 | HOT 的两个条件：更新没有改到任何被索引引用的列（BRIN 这类摘要索引除外）；旧行所在的页有足够空间放新行。满足时不用加新索引项；索引始终指向原来那行的项目指针 | [18 手册《Heap-Only Tuples (HOT)》](https://www.postgresql.org/docs/18/storage-hot.html)：「The update does not modify any columns referenced by the table's indexes, not including summarizing indexes.」「There is sufficient free space on the page containing the old row for the updated row.」「New index entries are not needed to represent updated rows」「Indexes always refer to the page item identifier of the original row version.」 | 原文＋实测（U5、U6） |
| U8 | 所以系列原表上 Alice 改年龄两个条件都不满足：年龄有索引（U5），第 23 页也满了（U1）；统计里这次更新记作「换页更新」（n_tup_newpage_upd 1） | U1、U5；results.users.stats | 实测 |
| U9 | 对照 InnoDB：同一位置原地改，旧值进 undo（行里的回滚指针指向它）；回滚时用 undo 改回 42 | InnoDB 一集 FACTS X1、X2 | 引用 |
| U10 | 表的填充因子默认 100（把页装满）；调小后，插入只把页装到那个比例，剩下的空间留给这一页上的行更新 | [18 手册 CREATE TABLE](https://www.postgresql.org/docs/18/sql-createtable.html)：「The fillfactor for a table is a percentage between 10 and 100. 100 (complete packing) is the default.」「When a smaller fillfactor is specified, INSERT operations pack table pages only to the indicated percentage; the remaining space on each page is reserved for updating rows on that page.」 | 原文 |
| U11 | 更新时先看旧行所在的页放不放得下新版本，放不下才换页 | 源码 `heapam.c` 第 3815、3817 行：`newtupsize = MAXALIGN(newtup->t_len);`、`if (need_toast \|\| newtupsize > pagefree)` 进入换页的分支；U1、U5 | 原文＋实测 |

## 事务与并发

`out_04_mvcc.json`，同一张表、VACUUM 后，几个连接按时间顺序。

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| X1 | Alice 开事务改成 43、未提交：她的事务号 4856，pg_xact 里的状态 in progress；她自己读到 43（新地址 (46,49)）；页里两个版本都在：旧版本 xmax 4856，新版本 xmin 4856 | steps.1_alice_uncommitted | 实测 |
| X2 | Bob（默认的读已提交）此时读到 42；他的快照是 `4856:4856:`——4856 及以后的事务一律还看不见 | steps.2_bob（transaction_isolation「read committed」） | 实测 |
| X3 | 每条语句看到的是一份快照；读和写的锁不冲突，读不挡写、写不挡读 | [18 手册 MVCC 介绍](https://www.postgresql.org/docs/18/mvcc-intro.html)：「each SQL statement sees a snapshot of data」「reading never blocks writing and writing never blocks reading」 | 原文＋实测（X2） |
| X4 | Carol 也要改这一行：她在等，等待事件是 Lock / transactionid；她拿到了这一行的元组锁，在等 Alice 的事务号 4856 上的 ShareLock；挡住她的正是 Alice | steps.3_carol_waits（activity、locks、blocked_by_alice true）；[18 手册《Transaction Isolation》](https://www.postgresql.org/docs/18/transaction-iso.html)：「the would-be updater will wait for the first updating transaction to commit or roll back」 | 实测＋原文 |
| X5 | 行锁记在行上（xmax），不存在内存里，所以一次能锁的行数没有上限；行锁不影响查询，只挡同一行的写者与加锁者 | [18 手册《Explicit Locking》](https://www.postgresql.org/docs/18/explicit-locking.html)：「PostgreSQL doesn't remember any information about modified rows in memory, so there is no limit on the number of rows locked at one time.」「Row-level locks do not affect data querying; they block only writers and lockers to the same row.」 | 原文 |
| X6 | Alice 提交：状态 committed。Carol 一直等到这时才继续，在 Alice 的 43 上加一得到 44（读已提交下，第二个更新者在新版本上重做），随后回滚，状态 aborted | steps.4_after_commit（carol.returning 44、carol_status aborted；waited_s 1.1 是脚本在提交前停了 1 秒，不是数据库的特性）；手册 Transaction Isolation：「If the first updater commits, the second updater … will attempt to apply its operation to the updated version of the row.」 | 实测＋原文 |
| X7 | Alice 提交后 Bob 再读，得到 43；Bob2（可重复读，Alice 提交前开始）仍读到 42，他再去改这一行，报 40001「could not serialize access due to concurrent update」 | steps.4_after_commit；手册 Transaction Isolation 的同名报错原句 | 实测＋原文 |
| X8 | 回滚的插入：Mallory（5000 号）的行留在第 46 页第 51 项，事务状态 aborted，谁都看不见；第一次被读到时补上提示位 HEAP_XMIN_INVALID | steps.5_rolled_back_insert（item_before_read、visible 0、item_after_read） | 实测 |
| X9 | 死锁：两个事务交叉改 2050、2051，等待超过 deadlock_timeout（本实验设为 1 秒）后，一方报 40P01「deadlock detected」，细节写明谁在等谁的事务；另一方继续 | steps.6_deadlock | 实测 |
| X10 | 默认隔离级别是读已提交 | 手册 Transaction Isolation（Read Committed 与「default」同句，`out_09_docs.json` isolation）；X2 实测 | 实测＋原文 |
| X11 | 对照 InnoDB：默认可重复读；Carol 等记录锁，3 秒超时报 1205；死锁报 1213 | InnoDB 一集 FACTS 关键配置行、X3–X5、X7 | 引用 |
| X12 | 每个事务的提交状态单独存放，在数据目录的 pg_xact 子目录里；`pg_xact_status()` 读到的进行中、已提交、已中止就来自这里 | 手册 File Layout 的数据目录表：「pg_xact Subdirectory containing transaction commit status data」；X1、X6、X8 的 `pg_xact_status` 实测 | 原文＋实测 |
| X13 | 行头里的 xmax 也用来记行锁：换页更新前给旧行加的临时锁，WAL 里记为 `LOCK xmax: 4856 … infobits: [LOCK_ONLY, EXCL_LOCK]` | `out_06_wal_crash.json` steps.3_alice_commit.pg_waldump；U3 | 实测 |

## 删与回收

`out_05_delete_vacuum.json`。

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| D1 | 删掉 Alice 并提交：那一行还在第 23 页第 26 项，只是 xmax 记上删除它的事务 4856（另标 HEAP_KEYS_UPDATED）；管理员已查不到她 | steps.1_deleted | 实测 |
| D2 | Bob（可重复读，删除前开始）仍读到 Alice 42 岁 | steps.2_blocked.bob_sees | 实测 |
| D3 | 这时 VACUUM：「1 are dead but not yet removable」，可回收界线停在 Bob 的 4856；行原样不动 | 同上 VACUUM VERBOSE 原文（tag「vacuum while bob holds snapshot」） | 实测 |
| D4 | Bob 结束后再 VACUUM：「tuples: 1 removed」，做了 1 次索引扫描；三个索引里指向 (23,26) 的项都删掉了；第 26 项变成空闲（LP_UNUSED）；第 23 页空隙 72 → 160 字节；空闲空间图里这一页记 128（别的页 64，最后一页 3744） | steps.3_reclaimed；VACUUM VERBOSE 原文（tag「vacuum after bob」） | 实测 |
| D5 | Dave 注册（2050 号、35 岁）：他的行落在 (23,26)——正是 Alice 原来那一页、那个项目指针 | steps.4_dave（same_slot_as_alice true） | 实测 |
| D6 | VACUUM 收回的是「死」的行版本：已经没有事务需要的旧版本 | [18 手册《Routine Vacuuming》](https://www.postgresql.org/docs/18/routine-vacuuming.html)「dead row versions」原句（`out_09_docs.json` vacuum） | 原文 |
| D7 | 事务号只有 32 位，跑过 40 亿个事务就会回绕，过去的事务看起来像在未来；所以每张表至少每 20 亿个事务要 VACUUM 一次 | 手册 Routine Vacuuming：「transaction IDs have limited size (32 bits) a cluster that runs for a long time (more than 4 billion transactions) would suffer transaction ID wraparound」「it is necessary to vacuum every table in every database at least once every two billion transactions」 | 原文 |
| D8 | 冻结：VACUUM (FREEZE) 后表的 relfrozenxid 760 → 4859；Dave 那一行的 infomask 同时置上 HEAP_XMIN_COMMITTED 与 HEAP_XMIN_INVALID，两位同时置上就是「已冻结」 | steps.5_freeze；源码 htup_details.h 第 206 行 `#define HEAP_XMIN_FROZEN (HEAP_XMIN_COMMITTED\|HEAP_XMIN_INVALID)` | 实测＋原文 |
| D9 | 自动清理默认开启，每 60 秒检查一次；一张表的死行数超过「50 + 0.2 × 行数」（且不超过 1 亿）就清理它；表的冻结年龄到 2 亿时强制清理 | steps.5_freeze.settings 的 boot_val（autovacuum on、autovacuum_naptime 60 s、autovacuum_vacuum_threshold 50、autovacuum_vacuum_scale_factor 0.2、autovacuum_vacuum_max_threshold 100000000、autovacuum_freeze_max_age 200000000）；手册 Routine Vacuuming：「vacuum threshold = Minimum(vacuum max threshold, vacuum base threshold + vacuum scale factor * number of tuples)」 | 实测（默认值）＋原文 |
| D10 | 对照 InnoDB：删除后 Bob 仍读到 Alice；purge 做完后 Dave 的行用上 Alice 留下的同一处空间 | InnoDB 一集 FACTS D1、D3、D4 | 引用 |
| D11 | 冻结的行对所有普通事务都算「过去」，不受事务号回绕影响，一直有效到被删除 | 手册 Routine Vacuuming：「Frozen row versions are treated as if the inserting XID were FrozenTransactionId, so that they will appear to be "in the past" to all normal transactions regardless of wraparound issues」 | 原文 |
| D12 | 插入一行时，PostgreSQL 向空闲空间图要一页放得下的页 | 源码 `src/backend/access/heap/hio.c` 第 584 行 `targetBlock = GetPageWithFreeSpace(relation, targetFreeSpace)`；D4、D5 | 原文＋实测 |
| D13 | 事务号按模 2³² 比较：每个普通事务号前面约有 20 亿个「更老」的、后面约有 20 亿个「更新」的，事务号空间是一个没有终点的圈；一行版本存在超过 20 亿个事务后，会突然显得在未来 | 手册 18 Routine Vacuuming 24.1.5：「Normal XIDs are compared using modulo-2^32 arithmetic. This means that for every normal XID, there are two billion XIDs that are "older" and two billion that are "newer"; another way to say it is that the normal XID space is circular with no endpoint.」「If the row version still exists after more than two billion transactions, it will suddenly appear to be in the future.」（2026-10-31 查） | 原文 |

## 出错怎么办

`out_06_wal_crash.json`：检查点后，Carol 改 Bob（2049）的年龄、不提交；Alice 改 42 → 43 并提交；随后断电式停机（`pg_ctl stop -m immediate`）再启动。

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| W1 | 规则：数据文件的修改必须在描述它的 WAL 落盘之后才能写；所以提交时不必把数据页写盘，崩溃后可以用 WAL 重做 | [18 手册《Write-Ahead Logging》](https://www.postgresql.org/docs/18/wal-intro.html)：「changes to data files … must be written only after those changes have been logged」「we do not need to flush data pages to disk on every transaction commit, because we know that in the event of a crash we will be able to recover the database using the log」 | 原文 |
| W2 | 提交前，Alice 的修改只在 WAL 缓冲区里：已落盘位置 0/1A53D10，插入位置 0/1A663A0；提交后两者都是 0/1A663C8 | steps.3_alice_commit.flush_before_commit、flush_after_commit | 实测 |
| W3 | 提交后，缓冲区里的第 23 页已经记上 Alice 的 xmax 4857、指向新版本 (46,50)；数据文件里的同一页还是旧的（xmax 0，pd_lsn 0/1A4F478） | steps.3_alice_commit.page_in_buffer、page_on_disk | 实测 |
| W4 | 检查点后第一次改某页，WAL 里带上整页镜像：Carol 的几条记录带 4–8 KB 的整页；Alice 随后改同一堆页与主键叶，不再带；她第一次改到的姓名、年龄两个叶子页带。再改一次 2051，堆页不带整页，只有第一次碰到的年龄叶子带 | steps.2_carol.wal、3_alice_commit.wal、4_second_change.wal 的 fpi_length；pg_waldump 原文里的「FPW」 | 实测 |
| W5 | 为防止写到一半的页，PostgreSQL 在真正改盘上的页之前，把整页镜像写进 WAL | 手册 WAL Reliability：「PostgreSQL periodically writes full page images to permanent WAL storage before modifying the actual page on disk.」 | 原文 |
| W6 | pg_waldump 读出的这次修改（节选）：`rmgr: Heap … desc: UPDATE old_xmax: 4857, old_off: 26 … new_off: 50, blkref #0: rel 1663/5/16466 blk 46, blkref #1: rel 1663/5/16466 blk 23` | steps.3_alice_commit.pg_waldump | 实测 |
| W7 | 断电式停机后启动，日志依次是：「database system was interrupted」→「database system was not properly shut down; automatic recovery in progress」→「redo starts at 0/1A53C40」→「redo done at 0/1A6F070」→ 恢复结束的检查点 →「database system is ready to accept connections」 | steps.5_recovery.server_log | 实测 |
| W8 | 恢复后：Alice 是 43（已提交的在）；Bob 仍是 51，Carol 没提交的 99 看不见；Carol 的事务状态是 aborted，她写下的版本仍在第 46 页第 49 项，第一次被读到时标上 HEAP_XMIN_INVALID——没提交的不用撤，它的版本本来就看不见 | steps.5_recovery（alice、bob、carol_status、carol_version_in_page） | 实测 |
| W9 | 对照 InnoDB：重启时重放 redo，再用 undo 回滚没提交的事务；双写缓冲区防写坏的页：页从缓冲池刷下去时，先写进双写缓冲区，再写到数据文件里的原位 | InnoDB 一集 FACTS R3、F5、M16（MySQL 手册 Doublewrite Buffer：「The doublewrite buffer is a storage area where InnoDB writes pages flushed from the buffer pool before writing the pages to their proper positions in the InnoDB data files.」） | 引用 |
| W10 | 检查点：保证此前写进 WAL 的修改都已写进数据文件；崩溃后从最近一个检查点记下的位置开始重放 | [18 手册《WAL Configuration》](https://www.postgresql.org/docs/18/wal-configuration.html)：「Checkpoints are points in the sequence of transactions at which it is guaranteed that the heap and index data files have been updated with all information written before that checkpoint.」「In the event of a crash, the crash recovery procedure looks at the latest checkpoint record to determine the point in the WAL (known as the redo record) from which it should start the REDO operation.」；W7 | 原文＋实测 |

## 引出下一集

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| B1 | SQLite 是嵌入式的 SQL 数据库引擎，和大多数 SQL 数据库不同，它没有独立的服务进程 | [sqlite.org《About SQLite》](https://www.sqlite.org/about.html)：「SQLite is an embedded SQL database engine.」「Unlike most other SQL databases, SQLite does not have a separate server process.」（`out_09_docs.json` sqlite-about） | 原文 |
| B2 | 2026 年调查里排在 PostgreSQL 之后的第二名是 SQLite | S8 | 原文 |

## 取证中发现、未必进成片的事实

| 编号 | 陈述 | 依据 |
|---|---|---|
| N1 | PostgreSQL 18 的 EXPLAIN 多了一行「Index Searches」 | `out_02_query.json` 各计划 |
| N2 | 开了数据校验和后，设置提示位也可能带来一次整页镜像（WAL 记录 FPI_FOR_HINT） | `out_03_update.json`、`out_06_wal_crash.json` 的 WAL 列表；手册 WAL Reliability「checksummed by default」 |
| N3 | 整页镜像会跳过页中间的空洞：换页更新那条 Heap LOCK 的整页镜像注明「hole: offset: 376, length: 72」，正是第 23 页的空隙 | `out_03_update.json` results.users.wal 的 block_ref |
| N4 | 本机 Windows 上 WAL 的同步方式是 open_datasync（写入即落盘），pg_stat_io 里 WAL 的 fsync 计数为 0 | `out_06_wal_crash.json` |
| N5 | 年龄树的 42 岁有 66 行（65 个按公式算出的人加上 Alice），合并存放项里装 60 个地址 | Q5；T6 |

## 复核

（成片审查中发现并更正的内容记在这里。）
