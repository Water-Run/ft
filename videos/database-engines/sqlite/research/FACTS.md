# SQLite：事实与实测

取证日期：**2026-10-22**。对象：**SQLite 3.54.1**、普通 rowid 表、BINARY 排序、UTF-8 文件。尚无正式文案，以下编号为候选陈述，不是已确认旁白句号。

## 环境与复现范围

| 项 | 实测记录 |
|---|---|
| 平台 | Windows 11；Python 3.14.3 仅调度命令行、解析字节与记录输出 |
| 引擎 | 官方 Windows x64 sqlite3.exe 3.54.1；全部 SQL 使用它，不使用 Python 自带 SQLite |
| 检查号 | 2026-10-16 14:45:20 555e07ef33f69a0957d24d8e555b702464a131d6f1607f4c3c1e4551e8e6ca76 |
| 同版核对 | sqlite_source_id() 与源码包 manifest.uuid 相同，VERSION=3.54.1；官方工具包和源码包均校验 SHA3-256 |
| 来源与哈希 | [01](lab/out_01_environment.json)：固定 URL、压缩包大小、SHA-256、SHA3-256、可执行文件与源码文件哈希。第三方文件只在忽略的 _src/ |
| 主库 | users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER NOT NULL)，4096 行；显式 page_size=1024、auto_vacuum=NONE、secure_delete=OFF |
| 同一个对象 | id=2050，name=Alice，age=42；其他姓名为 50 字节 ASCII 演示串，年龄为 18+id%63。生成 SQL 在 lab_common.py::insert_sql() |
| 其他结构 | idx_users_name(name)、idx_users_age(age)；notes(id INTEGER PRIMARY KEY, body TEXT NOT NULL) 中一条 12000 个 N 的文本 |
| 主库文件 | 553 页、566272 字节；SHA-256 561ff44c4a30d110a49e9cffa731cad6252558cb1267441c359f11f67acd00ad |
| 对照库 | 4096 字节页的同批 users 和索引，不含长 notes；4096 是本次构建新库测得的默认值 |
| 隐私 | 纯脚本生成的数据；公开证据只有通用库名和公开地址，无个人目录、主机名与凭据；没有靠遮挡、改写回显隐藏真实数据 |

1024 字节页是为了用较小样本观察三层树，不把页号、层数或 18 行分裂阈值讲成引擎常数。

## 原始来源

下列官方文档于 2026-10-22 阅读。内部行为同时对照固定版本源码与实验。

| 来源 | 定位 |
|---|---|
| S01 | [3.54.1 发布记录](https://www.sqlite.org/releaselog/3_54_1.html)、[下载页](https://www.sqlite.org/download.html)；固定下载与校验值见 01，不依赖未来的 latest |
| S02 | [文件格式](https://www.sqlite.org/fileformat.html)：§1.2 页、§1.3 文件头、§1.5 freelist、§1.6 两类树、§1.7 溢出、§2.1 记录、§2.3 rowid 表、§2.5 索引、§4 WAL |
| S03 | [DBSTAT](https://www.sqlite.org/dbstat.html)：页号、路径、页型、单元数与 overflow。本构建启用此功能 |
| S04 | [EXPLAIN QUERY PLAN](https://www.sqlite.org/eqp.html)、[字节码](https://www.sqlite.org/opcode.html)：计划与生成程序的含义，输出属于具体版本 |
| S05 | 同检查号 src/btree.c、pager.c、wal.c、vdbe.c、os_win.c；[07](lab/out_07_sources.json) 给出文件哈希、18 个入口行号；源码包取得方式见 01 |
| S06 | [架构](https://www.sqlite.org/arch.html)、[嵌入进程](https://www.sqlite.org/serverless.html)：SQL 编译、执行程序、树、页管理、文件接口 |
| S07 | [WAL](https://www.sqlite.org/wal.html)：§2 提交、§2.1 检查点、§2.2 读快照与写者；结合 S02 §4 的帧格式和校验 |
| S08 | [原子提交](https://www.sqlite.org/atomiccommit.html)：§3 单文件提交、§4 回滚、§6.3 提交前缓存溢写；回滚模式与 WAL 的实现分开 |

2026-10-24 制作方补读（下列页面当日阅读）：

| 来源 | 定位 |
|---|---|
| S09 | [SQLite 版本 3 概述](https://www.sqlite.org/version3.html)：“The new database file format uses B+trees for tables. In a B+tree, all data is stored in the leaves of the tree instead of in both the leaves and the intermediate branch nodes. … Traditional B-trees are still used for indices.” |
| S10 | [关于 SQLite](https://www.sqlite.org/about.html)：in-process library；“does not have a separate server process”；“A complete SQL database with multiple tables, indices … is contained in a single disk file”。[首页](https://www.sqlite.org/index.html)：“SQLite is a C-language library”、标语 “Small. Fast. Reliable. Choose any three.” |
| S11 | [最广泛部署](https://www.sqlite.org/mostdeployed.html)：每部智能手机广泛使用，“each holding hundreds of SQLite database files”，属官网估计。[发布年表](https://www.sqlite.org/chronology.html)：1.0 于 2000-08-17，3.54.1 于 2026-10-16 |
| S12 | [公有领域](https://www.sqlite.org/copyright.html)：“All of the code and documentation in SQLite has been dedicated to the public domain”；同版 src/btree.c 第 1–9 行：“The author disclaims copyright to this source code. In place of a legal notice, here is a blessing: May you do good and not evil. May you find forgiveness for yourself and forgive others. May you share freely, never taking more than you give.” pager.c、wal.c、vdbe.c 开头同一段 |
| S13 | [PRAGMA journal_mode](https://www.sqlite.org/pragma.html#pragma_journal_mode)：“The DELETE journaling mode is the default … the delete operation is the action that causes the transaction to commit.” [WAL](https://www.sqlite.org/wal.html) §1：“The WAL approach inverts this”；“readers do not block writers and a writer does not block readers”；检查点停在读者的 end mark，“otherwise it might overwrite part of the database file that the reader is actively using” |
| S14 | 文件格式 S02 §1.6：内部页 “contains K keys together with K+1 pointers to child b-tree pages”，“all children of an interior b-tree have the same depth”；同版 src/btreeInt.h 第 19–33 行 Ptr/Key 交替与 O(log M) 查找页数；页头标志 leafdata(4) 表示数据只在叶页 |

## 先建立整体结构

| 编号 | 候选陈述 | 实测与交叉核对 | 适用范围、核查状态 |
|---|---|---|---|
| A01 | SQLite 的库嵌在应用进程内；可先建立“SQL → 执行程序 → 树 → 页管理 → 文件接口”的关系 | S06；02 保留 EXPLAIN；S05 将指令、树查找、页管理和 Windows 文件读取定位到同版源码 | 架构已核于 2026-10-22；没有对整条函数调用链做动态跟踪 |
| A02 | 表与各个普通索引各有一棵树，同处数据库文件，模式表登记根页 | 02 main.schema；独立字节解析器读取全部父子页号，再核对 DBSTAT 的页集、深度、单元数与溢出页；S02 §1.6、§2.3、§2.5、§2.6 | 本次普通 rowid 表和索引已核；不涵盖 WITHOUT ROWID、虚拟表、附加库 |
| A03 | 文件全页归属可完整还原，不只抽出几张叶页 | 02：模式树 1 页、users 260、姓名索引 243、年龄索引 37、notes 1、溢出 11，共 553。解析器逐页断言不遗漏不重叠；空闲链亦独立解码并与 PRAGMA 数量核对 | 已核；本库小于锁字节页所在范围，auto_vacuum=NONE，无 ptrmap 页 |

同一主库的实测树（02 main.trees；层数含根与叶，页数不含溢出）：

| 树 | 根页 | 层数 | 树页数 | 条目数 |
|---|---:|---:|---:|---:|
| sqlite_schema | 1 | 1 | 1 | 4 |
| users | 2 | 3 | 260 | 4096 |
| idx_users_name | 262 | 3 | 243 | 4096 |
| idx_users_age | 505 | 2 | 37 | 4096 |
| notes | 542 | 1 | 1 | 1 |

全部边见[文字地图](lab/out_02_trees.txt)与 JSON nodes[].children。每页保留页型、深度、单元数、首末键、内部页分隔键和真实页头字节。

## 沿同一条查询走过两棵树

| 编号 | 候选陈述 | 实测与交叉核对 | 范围与状态 |
|---|---|---|---|
| B01 | 按姓名找到 Alice 后，用索引给的行号到表树取年龄 | 02 plans.index_then_table；真实结果 (2050,Alice,42)；索引记录 ['Alice',2050]；字节重建路径 262→281→263，表路径 2→133→130。S02 §2.3/2.5；S05 vdbe.c:6872 DeferredSeek/IdxRowid、btree.c:5837/6068 两种查找 | 已核于 2026-10-22；是重建的逻辑路径，不是逐页动态访问或磁盘 I/O 轨迹 |
| B02 | 根先缩小行号范围，子树再指到叶页 | users 根 2 的分隔行号为 1560、3081，子页为 132、133、261；2050 走中间子树 133 到 130。02 main.trees 与 table_route_reconstructed、DBSTAT、S02 §1.6 | 数值仅限本样本，已核 |
| B03 | 表树与索引树不能一概画成“记录只在叶子”的同一种 B+ 树 | 表树内部单元解出行号分隔键与子页，完整表记录在叶页；姓名索引根 262 的内部单元实际含 ['User00306-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN',306]，SQL 核对该行存在；索引全部内外页条目合计 4096。02 index_interior_real_record、S02 §1.6、S05 btree.c | 已核；索引里的“记录”是键记录，不是整条表行 |
| B04 | 只取 id、name 时，姓名索引已经包含所需内容，可以覆盖查询 | 02 plans.covering 的实际计划标为 COVERING INDEX，并保留结果与全部字节码；与还需 age 的查询对照；S04、S02 §2.5 | 此 SQL、此索引已核，不概括任意查询 |
| B05 | 同一连接再次查询可以复用 SQLite 缓存 | 03 真实运行计数；S06 页缓存、S08 §7.1 | 已核；没有清空操作系统缓存，不量物理磁盘读数和通用速度 |

03：每个场景独立新建命令行连接，再在同连接执行第二次。

| 查询 | 页缓存未命中，首次/第二次 | 扫描步数 | 虚拟机步数 |
|---|---|---:|---:|
| SELECT id,name,age FROM users WHERE name='Alice' | 7 / 0 | 0 | 15 |
| SELECT id,name FROM users WHERE name='Alice' | 4 / 0 | 0 | 12 |
| SELECT id,name,age FROM users NOT INDEXED WHERE name='Alice' | 261 / 0 | 4095 | 12299 |

首次不等于冷磁盘，不能从此推出通用性能倍数。EXPLAIN 也是程序清单，不是动态执行轨迹。

## 树怎样生长、空间怎样复用

| 编号 | 候选陈述 | 实测与交叉核对 | 范围与状态 |
|---|---|---|---|
| C01 | 从单个根叶页长到根和两个叶页时，本样本根页号仍为 2 | 02 first_split：前 17 行在叶页 2；插入第 18 行后，2 变内部页、分隔键 17，子页 3 有行 1–17，子页 4 有行 18。前后字节与 DBSTAT；S05 btree.c:9081 balance_deeper、:8039 balance_quick | 已核；限递增插入、此记录长度与 1024 字节页，不宣称固定 18 行阈值或永远均分 |
| C02 | 相同记录在不同页大小下形成的树不同 | 02 default_4096：同样 4096 行，表树 62 页/2 层、姓名索引 59/2、年龄索引 10/2；1024 字节页分别为 260/3、243/3、37/2。S02 §1.2/1.6 | 已核；只比较同批 users 与索引，不把主库额外 notes 算入 |
| D01 | 删除可以把页留给未来写入，文件不必立刻缩小 | 04：4096 行删到 1024，仍 553 页/566272 字节，空闲页从 0 到 394；直接解析 freelist trunk/leaf 链并与 PRAGMA 核对；S02 §1.5 | 已核；限 auto_vacuum=NONE |
| D02 | 再插入会复用空闲页；VACUUM 的文件变化与普通删除不同 | 04：再插 1024 行，共 2048，文件不增、空闲降到 260；VACUUM 后 283 页/289792 字节、空闲 0。每步留整树与完整页归属，integrity_check=ok；S02 §1.5 | 此序列已核，不承诺任意插入不增长或任意 VACUUM 都缩小 |

## 同一条记录的并发、提交与恢复

| 编号 | 候选陈述 | 实测与交叉核对 | 范围与状态 |
|---|---|---|---|
| E01 | WAL 中已建立的读事务可继续看到旧快照，新连接看到已提交的新值 | 05，三个真实 shell 进程：读者 BEGIN 查 42；写者改 43、COMMIT；旧读者仍 42，另一连接 43。S07 §2.2、S05 wal.c:3102 | 已核；控制顺序的多进程实验，不是并发压力或竞态测试 |
| E02 | 同一个库的写者须串行取得写入资格 | 05：一个进程持有 BEGIN IMMEDIATE，另一进程同样 BEGIN IMMEDIATE 得 database is locked；S07 §2.2、S05 写锁代码 | 已核；不宣称所有读者被阻塞，也未测跨主机 |
| E03 | 提交可先留在 WAL，主文件仍为旧值；检查点随后写回 | 05 关闭自动检查点、FULL：COMMIT 前后主文件字节相同，直接解出 age=42。实际 5 帧对应页 130、505、519、520、521，末帧提交大小 553。盐值与累计校验逐帧核对，只叠已提交帧后独立解出 43，与新连接 SQL 一致。S02 §4、S07 §2、S05 wal.c:4361 | 已核；本次年龄索引也被修改，不画成永远只改一个数据页；没有真实断电测试 |
| E04 | 未结束的旧读者可限制检查点推进；结束后可完成写回 | 05：旧读者仍在时 PASSIVE 的 checkpointed 小于 log；读者 COMMIT 后 TRUNCATE=0/0/0，WAL 长度 0，直接解主文件为 43、完整性 ok；S07 §2.1/2.2、S05 wal.c:4387 | 此序列已核，不承诺检查点永不阻塞 |
| E05 | 回滚日志模式下，未提交修改已溢写主文件后，进程崩溃仍可恢复旧状态 | 06 独立副本，DELETE/FULL/cache_size=5/cache_spill=ON；全部年龄加一，主文件字节确已变化，hot-journal 头有效。强制终止本实验写者，重开后 4096 行、年龄和 200664、Alice=42、完整性 ok，整个文件恢复原始 SHA-256，journal 被引擎移除。S08 §4/6.3、S05 pager.c:2872 | 已核；进程崩溃，不是断电、磁盘故障或穷举所有崩溃时刻 |

## 局部格式留作后台校核

| 编号 | 观测 | 证据与范围 |
|---|---|---|
| F01 | Alice 位于页 130、槽 9，页内偏移 489、文件偏移 132585；payload 为 10 字节 04001701416c6963652a | 02 table_route_reconstructed.cell：头长 4，serial types=0/23/1，值 NULL/Alice/42；rowid=2050 在单元键中，SQL 的 INTEGER PRIMARY KEY 仍返回 2050。S02 §1.6/2.1/2.3；本例已核，不泛化其他主键声明 |
| F02 | notes 的 12000 字节文本使用页 543–553 的 11 页溢出链 | 02 long_note：从本地 payload 和指针解出完整文本、长度与哈希，并核对 DBSTAT 溢出页集；S02 §1.7。已核，不把页数当普遍阈值 |

## 制作方补证（2026-10-24）

写稿时为正式文案补充的陈述。G、H 两组的数字由 [02](lab/out_02_structure.json) 的整树数据直接计数，I 组来自新增的 [08](lab/out_08_trace.json)。

| 编号 | 陈述 | 证据 | 范围与状态 |
|---|---|---|---|
| G01 | SQLite 是 C 语言库，在应用进程内运行，没有单独的服务进程；多张表和索引都在一个普通磁盘文件里 | S10；S06 classic serverless：“same process … no message passing or network activity” | 官方说明，已读于 2026-10-24 |
| G02 | 1.0 发布于 2000 年；本片用 2026-10-16 发布的 3.54.1 | S11 年表；01 环境 | 已核 |
| G03 | 官网估计每部智能手机里有成百个 SQLite 数据库文件 | S11 原文 “each holding hundreds of SQLite database files” | 官网估计，旁白须标明“官网估计” |
| G04 | 代码属于公有领域；源码文件开头不写版权声明，写一段祝福 | S12；同版 btree.c、pager.c、wal.c、vdbe.c 第 1–9 行 | 已核于 3.54.1 源码 |
| H01 | 内部页有 K 个分界、K+1 个子页；本库 users 根页 2 有 2 个分界、3 个子页，第 133 页有 94 个分界、95 个子页 | S14；02 nodes[].separators 与 children | 已核 |
| H02 | 同一棵树的叶页都在同一层：users 的 256 个叶页、姓名索引的 228 个叶页深度都相同 | S14；02 nodes[].depth：users 1/3/256，姓名索引 1/14/228，年龄索引 1/36 | 已核 |
| H03 | 表是 B+ 树：4096 行全在叶页；内部页的 255 个行号只作分界，例如根页的 1560，在叶页 99（行 1545–1560）里另有完整的一行 | S09；02 叶页单元合计 4096、内部单元 255；页头标志 0x05/0x0d 含 leafdata | 已核 |
| H04 | 索引是传统 B 树：姓名索引叶页 3869 条、内部页 227 条，合计正好 4096，不重复；根页 262 的第一个分界 ['User00306…', 306] 不在任何叶页（叶页 279 止于 305，叶页 280 始于 307） | S09；02 计数与 index_interior_real_record；B03 | 已核 |
| H05 | 沿姓名索引找 Alice 时范围逐层缩小：4096 → 306（第 281 页子树）→ 18（叶页 263）；沿表树找 2050：4096 → 1521（第 133 页子树）→ 17（叶页 130，行 2041–2057，位于分界 2040 与 2057 之间） | 02 子树条目计数 | 已核，数值仅属本样本 |
| H06 | 编译出的程序共 15 条指令，其中两条 OpenRead 分别打开根页 2（users）与根页 262（姓名索引） | 02 plans.index_then_table.bytecode 第 1、2 条 | 已核；是程序清单，不是执行轨迹 |
| I01 | 首次查询在文件接口上实际读取的页依次为 1、262、281、263、2、133、130，共 7 页；只取 id、姓名时为 1、262、281、263；强制扫描读 261 个不同的页 | 08：官方命令行 -vfstrace 记录每次 xRead，偏移 ÷ 1024 + 1 为页号；与 B01 重建路线和 03 的未命中数一致 | 已核；记录的是 SQLite 向操作系统发出的读请求，不观测系统缓存与设备 |
| I02 | 同一连接再查一次，不再读任何页，只读文件头偏移 24 处的 16 字节，核对文件是否被改过 | 08 第二次运行；同版 pager.c 第 5452–5481 行（变化则清空缓存） | 已核 |
| G05 | Firebird 3.0 起，同一个核心引擎既可由网络服务程序加载，也可作为嵌入式引擎加载 | [Firebird 3.0 发布说明](https://www.firebirdsql.org/file/documentation/release_notes/html/en/3_0/rlsnotes30.html)：“the Firebird core is now a unified library … loadable either as an embedded engine or by the ‘network listener’ executable”；§3 Remodelled Architecture “integrates the core engine for Classic/Superclassic, Superserver and embedded models in a common binary” | 读于 2026-10-24；只用于衔接，不比较两者实现 |
| G06 | ClickHouse 是列式存储、面向在线分析（OLAP）的 SQL 数据库；分析查询动辄处理数十亿到数万亿行 | [ClickHouse 文档 What is ClickHouse?](https://clickhouse.com/docs/intro)：“column-oriented SQL database management system (DBMS) for online analytical processing (OLAP)”；“analytics queries routinely process billions and trillions of rows” | 读于 2026-10-24；只用于结尾引出 |
| G07 | 全部功能打开时，SQLite 库可以小于 900 KiB，视平台与编译选项而定 | S10 about.html：“With all features enabled, the library size can be less than 900KiB, depending on the target platform and compiler optimization settings” | 官方说明；旁白用“可以小于” |
| J01 | 文件最开头 16 个字节是 “SQLite format 3” 加一个零字节；偏移 16 记页大小 1024，偏移 28 记页数 553 | [09](lab/out_09_page.json) file_header；S02 §1.3；同版 btreeInt.h 文件头格式 | 已核 |
| J02 | 叶页 130：前 8 字节页头（标志 0x0d 表树叶页，17 个单元）；随后 17 个两字节指针占偏移 8–41，按行号排序；单元从页尾往前放（第 2041 行在偏移 966–1023），内容区从偏移 83 开始，中间 41 字节未分配 | 09 alice_page：pointers、cell_content_start、unallocated_bytes；S02 §1.6 “cell pointer array … cell content area” | 已核，数值只属本页 |
| J03 | Alice 的单元在偏移 489，共 13 字节：长度 1 字节、行号 2050 占 2 字节、内容 10 字节；其他用户每行 58 字节（内容 55 字节） | 09 cells；F01 | 已核 |
| J04 | 长文本 12005 字节的内容（12000 个 N 加记录头）在叶页 542 只留前 785 字节，其余在 543–553 的溢出链；每个溢出页开头 4 字节是下一页页号，第 553 页写 0 | 09 note_page、overflow_chain；S02 §1.7；F02 | 已核 |
| J05 | 回滚日志里每页带页号，日志头记录修改前的文件大小；本次日志头记的是 553 页。日志先刷到存储，再改主文件 | S08 §3.5（“The page number is stored together with each database page”“records the original size of the database file”）、§3.7、§3.9、§6.3；06 journal_header_hex 偏移 20–23 为 0x00000229 = 553 | 已核；未测断电 |
| J06 | auto_vacuum 默认关闭：删除数据后文件大小不变，空出的页进空闲链，供之后插入复用；VACUUM 把数据库复制到临时文件再覆盖原文件，重建出最小的文件 | [PRAGMA auto_vacuum](https://www.sqlite.org/pragma.html#pragma_auto_vacuum)：“The default setting for auto-vacuum is 0 or "none" … the database file remains the same size”；[VACUUM](https://www.sqlite.org/lang_vacuum.html)：“rebuilds the database file, repacking it into a minimal amount of disk space”；D01、D02 | 读于 2026-10-24；本库的数字见 D01、D02 |
| K01 | 回滚日志模式的锁：读者持共享锁；写者先取保留锁，此时别人仍可读，但保留锁只有一把，所以写者只有一个；改主文件前要升到独占锁，中间的 pending 状态不再接受新读者，并等已有读者离开 | S08 §3.2、§3.4（“only a single process can be attempting to write to the database at one time”）、§3.8（pending “prevents new shared locks from being established”） | 官方说明，读于 2026-10-24 |
| K02 | 同一顺序在回滚日志模式下实测：旧读者开着读事务看到 42；写者 BEGIN IMMEDIATE 并改成 43 后，新读者仍读到 42；写者 COMMIT 得 “database is locked”；此后新读者再读也得 “database is locked”，旧读者仍能读 42；旧读者 COMMIT 后写者提交成功，两边都读到 43。与 05 的 WAL 结果（写者直接提交，旧读者 42、新读者 43）对照 | [10](lab/out_10_locks.json)，三个真实进程、忙等待 0；锁的名称据 K01 解释，命令行只显示成功或 locked | 已核；控制顺序，非竞态测试 |
| K03 | 每次读事务开始，SQLite 都检查主文件旁是否有 -journal 与 -wal 文件；存在且需要回放的日志叫热日志，打开时抄回原页再删除 | 08 回显：每次取共享锁后 xAccess("main.db-journal")、xAccess("main.db-wal")；S08 §4.2–4.5；E05 | 已核 |
| K04 | WAL 由 32 字节文件头和若干帧组成；每帧 24 字节帧头加一整页，帧头记页号，提交帧还记提交后的页数；盐值与累计校验和全部对上的帧才算有效 | S02 §4.1（“A frame is considered valid if and only if …”）；05 的 5 帧：页 130、505、519、520、521，第 5 帧提交页数 553，逐帧校验通过 | 已核 |
| K05 | WAL 旁的 wal-index 放在共享内存（-shm 文件），帮读者在 WAL 里快速找到页；因此用同一个库的进程必须在同一台机器上，WAL 不能用于网络文件系统 | S13 wal.html：“a data structure called the "wal-index" is maintained in shared memory which helps readers locate pages in the WAL quickly”；“All processes using a database must be on the same host computer” | 官方说明；本片未测网络文件系统 |
| I03 | 回滚日志是默认模式；删除日志文件的那一刻即提交。WAL 正好相反：原内容留在主文件，改动追加进 WAL，读写互不阻塞，写者同时只有一个 | S13；E01–E05 | 已核 |

## 已核与尚未核

已做：七组脚本实际运行；二进制与同版源码校验；独立字节解析全部树边、深度、单元数、溢出与空闲链；全页不遗漏不重叠；真实 SQL、计划和程序；运行计数；多进程快照与写锁；WAL 帧校验与提交叠加；崩溃恢复及字节比对；数据阶段的完整性检查。入口为 lab/run_all.py。

未做：完整函数调用轨迹、逐页 VFS I/O 跟踪、真实断电、设备持久性、吞吐与时延基准、操作系统冷缓存、其他排序与表类型、跨平台重跑。源码和数据固定版本，在线文档会变；不据有限观测承诺所有版本内部行为。

未选入主讲：版本史、采用率未取证，不从记忆补；全部编译选项、页内字段、溢出阈值公式、校验算法和逐条指令只留作后台证据。正式稿、逐句复核和成片后的事实审查均**尚未进行**。
