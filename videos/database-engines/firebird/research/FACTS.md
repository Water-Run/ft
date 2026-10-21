# 事实核查记录

本文件记录视频《一个数据库引擎是如何实现的？——Firebird，小众的第三选择》中每一项事实陈述的出处。

核查分两路进行，结论须两路一致才写入脚本：

1. **实验**：本机安装 Firebird 5.0.4.1812（Windows x64 官方 zip），在 `lab/` 的脚本里建库、跑并发会话、按字节解析 `.fdb` 文件。回显与结构化结果在 `lab/out_*.txt` / `lab/out_*.json`。
2. **源码与官方文档**：Firebird 5.0.4 源码的 `src/jrd/ods.h`（页与页类型）、安装包自带的 `doc/README.providers.html`、`doc/README.garbage_collector.txt`、`doc/README.security_database.txt`、`doc/Firebird-5.0.4-ReleaseNotes.pdf`，以及 firebirdsql.org 官方站点与样式表。

画面上出现的字节、页数、页类型计数、二进制体积由 `tools/gen_data.py` 从实验产物生成，不手写。

编号：`T` 取证环境与版本，`H` 历史与来历，`E` 引擎与连接方式，`D` 存储与页，`U` 更新与行版本，`M` 并发，`W` 写出错与恢复，`V` 视觉取材。

## 00 取证环境

| 编号 | 陈述 | 出处 |
|---|---|---|
| T01 | 版本 Firebird 5.0.4.1812 | `isql -z` 回显：`ISQL Version: WI-V5.0.4.1812 Firebird 5.0`（`out_01_probe.txt`） |
| T02 | 安装包 `Firebird-5.0.4.1812-0-windows-x64.zip`，25,206,603 字节，SHA-256 `01e844fce4d5f53272a76205dbc3a1ba4b782ab8e8eadcd808cdbccd9ce13b72` | GitHub Release `v5.0.4`；本机下载后 `Get-FileHash` |
| T03 | 平台 Windows x64（本机）；源码基线 FirebirdSQL/firebird 标签 `v5.0.4`（tag 对象 `a1b022aae75d506f4d7a2492925d77fb5963488f`） | GitHub API `git/refs/tags/v5.0.4` |
| T04 | 服务端 `firebird.exe -p 3051` 独立进程；`firebird.conf` 未改，全部为出厂缺省 | `research/_src/fb504/firebird.conf` |
| T05 | 安全库：装包自带的是出厂空库（无预置用户），按 `doc/README.security_database.txt` 的步骤用嵌入式连接建 `SYSDBA`；实验口令现场生成，不入库 | `lab/02_init_user.sql` 与 `lab/out_02_init_user.txt` 的回显：`SEC$USER_NAME=SYSDBA`、`SEC$PLUGIN=Srp` |
| T06 | 取证日期 2026-10-20 | — |

第三方安装包与源码取回后放在 `research/_src/`（不入库）；本文件记录版本、获取地址与校验和。

## 01 它是什么，从哪来

| 编号 | 陈述 | 出处 |
|---|---|---|
| H01 | Firebird 从 Borland（时名 Inprise）的 InterBase 6.0 派生：2000 年 7 月公开源码，同月 Firebird 项目建立 | 已核实，2026-10-21 复核：[官方历史](https://www.firebirdsql.org/en/historical-reference/)「InterBase at Borland」「InterBase becomes Open Source」「Firebird records」；`v5.0.4/README.md` 的项目起源说明交叉核对 |
| H02 | 首个正式版 Firebird 1.0 于 2002 年发布；本稿不需要具体月日 | 已核实，2026-10-21：[官方历史概述](https://firebirdsql.org/file/documentation/papers_presentations/html/fr/paper-fbent-history-fr.html)「La livraison initiale」；[1.0 发布说明](https://www.firebirdsql.org/file/documentation/release_notes/Firebird-1.0-ReleaseNotes.pdf) 互证 |
| H03 | 本片选定的实验版本为 5.0.4；其发布记录日期为 2026 年 4 月 17 日，不据此声称截至现在仍是最新版本 | 原取证：GitHub Release `v5.0.4`，`published_at = 2026-04-17T10:15:27Z`；本轮旁白只报 T01 的实验版本 |
| H04 | 5.0.4 发布说明文档版本 `0504-01`，日期 2026 年 4 月 3 日 | `doc/Firebird-5.0.4-ReleaseNotes.pdf` 第 1 页 |
| H05 | 3.0 起把 Classic / Superclassic、Superserver 与 embedded 的核心引擎合并进同一个二进制（Remodelled Architecture） | Firebird 3.0.6 发布说明「Remodelled Architecture」；5.0.4 安装包 `doc/README.providers.html` 同义表述 |
| H06 | 官网标语是「The true open-source relational database」 | `https://firebirdsql.org/` 的 `<meta name="description">` 与页面标题 |
| H07 | Firebird 1.5 已将 C 代码改写为 C++；不采用「1.5 之后才开始重写」的说法 | 已核实，2026-10-21：[官方历史概述](https://www.firebirdsql.org/file/documentation/papers_presentations/html/fr/paper-fbent-history-fr.html)「Version stable actuelle」关于 1.5 的历史段落；`v5.0.4` 的 C++ 源码互证。页面写于旧版本时代，只用于历史事件，不拿它说明当前稳定版 |
| H09 | Firebird 是独立的开源关系数据库管理系统，跨 Windows、Linux 等平台，能处理 SQL，支持存储过程与触发器；不是 MySQL 的可插拔存储引擎 | 已核实，2026-10-21：`v5.0.4/README.md`；[5.0 语言参考](https://firebirdsql.org/file/documentation/html/en/refdocs/fblangref50/firebird-50-language-reference.html) 的 DSQL/PSQL 章节；本片 SQL 实测 `out_03_schema.txt`、`out_13_query_path.txt` |
| H10 | InterBase 的公司于 1984 年建立；Firebird 的技术来历可追到八十年代，而 Firebird 这个项目始于 2000 年 | 已核实，2026-10-21：官方历史「How Jim Starkey remembers it」「Further recollections from Ann Harrison」；同站 [History of Firebird 法文版](https://firebirdsql.org/file/documentation/papers_presentations/html/fr/paper-fbent-history-fr.html) 的 1985 年 InterBase 介绍互证。文案只说「八十年代的 InterBase」，不声称 Firebird 项目当时已存在 |
| H08 | 下一集的主角 SQLite 自述为「a C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine」；本系列路线把 SQLite 定为「极小」的一端：不再是服务进程 | `https://www.sqlite.org/` 首页首段；本系列说明 `videos/database-engines/README.md` 的「系列路线」表 |

## 02 与系列各集的承接（承上启下）

这一组事实支撑片中的三处承接。**承接靠点名与一条形态轴，不靠回顾前集**（F10：不要求观众记住前集编号或内容）。

| 编号 | 陈述 | 出处 |
|---|---|---|
| C01 | MySQL 与 PostgreSQL 都是客户端/服务器式的：引擎跑在服务端进程里，客户端连的是这个服务 | **PostgreSQL** 一侧取官方手册原文：PostgreSQL 18 文档 §18.3「Starting the Database Server」——「Before anyone can access the database, you must start the database server.」（<https://www.postgresql.org/docs/18/server-start.html>，已读）。**MySQL** 一侧取本系列前两集的实测：MyISAM 一集在 Windows 服务 `LegacyMySQL55`（MySQL 5.5.62）上建库（`myisam/research/FACTS.md` 的取证环境）；InnoDB 一集在容器里以 `mysqld` 为 PID 1 运行，并用 SIGKILL 模拟崩溃后由服务恢复（`innodb/research/FACTS.md` 的 I14）。MySQL 官方手册「What is MySQL?」一页在本机取用时站点故障（Oracle 侧事故 0.37aac117），**未读到原文，故不作逐字引用**；本条只据上面两处已核实的实测与 PostgreSQL 手册原文 |
| C02 | SQLite 是嵌入应用的库，不提供中间的独立数据库服务端进程 | 2026-10-21 复核：[SQLite Is Serverless](https://sqlite.org/serverless.html) §1；[首页](https://www.sqlite.org/) 首段交叉核对。不说它在历史上删掉过服务端，也不暗示它派生自 Firebird |
| C03 | 本系列的路线：MySQL（MyISAM、InnoDB）→ PostgreSQL → Firebird 是「服务型开源关系数据库」一段，收束在 Firebird；下一段「极小」是 SQLite | 本系列说明 `videos/database-engines/README.md` 的「系列路线」表（策划者 2026-10-19 定） |
| C04 | 前集使用的 PostgreSQL 18 以 WAL 先行记录持久化修改，崩溃后可据日志重做尚未写入数据页的修改 | 已核实，2026-10-21：[PostgreSQL 18 §28.3](https://www.postgresql.org/docs/18/wal-intro.html)；前集已确认稿 `7caad997…` 的 z5 与其研究记录交叉核对。文案不复讲 WAL 原理，只作一次必要对照 |
| C05 | PostgreSQL 是完整数据库系统，包括 SQL 处理与数据存储，不是 MySQL 的存储引擎 | 前集已确认稿 `7caad997…` 的 h1–h1a；[PostgreSQL 18 架构介绍](https://www.postgresql.org/docs/18/tutorial-arch.html)。本稿 h2 的类比仅指同为整套数据库系统，不暗示内部实现一致 |
| C06 | 对照前集有显式主键的同类 users 表：InnoDB 的主键聚簇索引叶子存整行；Firebird 的行在数据页中，索引另存。PostgreSQL 18 的 heap 与索引也分离，但其索引位置和 Firebird 内部记录号不是同一种编码 | **2026-10-21 第 3 稿已核**：[MySQL 9.7 §17.6.2.1](https://dev.mysql.com/doc/refman/9.7/en/innodb-index-types.html) Clustered and Secondary Indexes；前集 InnoDB FACTS I03/I05 的字节实验；[PostgreSQL 18 §11.9](https://www.postgresql.org/docs/18/indexes-index-only-scans.html) 首段与前集 T09/T10；本片 D10/Q03 的 v5.0.4 源码和查询实测交叉核对。比较基线为前片 MySQL 9.7.2/InnoDB、PostgreSQL 18.4/heap，不涵盖其他表访问方法；不推性能高低，也不说 InnoDB 每棵索引都装整行 |
| C07 | InnoDB 利用 undo 中的信息重建修改前的行；PostgreSQL 当前 heap 保存独立行版本；Firebird 当前记录可通过回溯链取得历史版本，历史信息可差量存储 | **2026-10-21 第 3 稿已核**：[MySQL 9.7 §17.3](https://dev.mysql.com/doc/refman/9.7/en/innodb-multi-versioning.html) DB_ROLL_PTR、undo 原文；前集 InnoDB I16/I07 与 PostgreSQL T11/T14 的源码和实验；[PostgreSQL 18 §24.1.2](https://www.postgresql.org/docs/18/routine-vacuuming.html#VACUUM-FOR-SPACE-RECOVERY)；本片 U05。只比较本例行修改保存历史的方式，不扩成锁或隔离级别课程，不把 Firebird 历史版都画成完整副本 |
| C08 | InnoDB 的 redo 与 PostgreSQL 的 WAL 都用于崩溃后重做尚未完成的数据页修改；Firebird 常规恢复依赖 careful writes、事务状态与行版本，不采用同一条 redo 重放路径 | **2026-10-21 第 3 稿已核**：[MySQL 9.7 §17.6.5 Redo Log](https://dev.mysql.com/doc/refman/9.7/en/innodb-redo-log.html) 开头的 crash recovery 说明；前集 InnoDB I14 的进程崩溃实验；C04 的 PostgreSQL 18 WAL 原文与前集 T19–T21；本片 W04–W06 的 v5.0.4 源码和官方论文。仅比较普通事务数据的恢复职责，不说 InnoDB/PostgreSQL 只靠日志、Firebird 没有任何日志，亦不作性能胜负判断 |
| C09 | “小众的第三选择”是本片的策划定位：在 MySQL、PostgreSQL 之后介绍 Firebird 这一完整开源关系数据库；“第三”数的是本系列讲过的数据库系统，不是市场份额或能力排名 | **2026-10-21 第 4 稿，策划原话已记录**：本轮会话要求“引子稍微长一点, 体现\"小众的第三选择\", 很多用户都不知道Firebird是啥”；C03 的系列路线与 H09 的对象定义交叉支持。第 5 稿开场按 C11 接续前三期，不再询问观众认识哪些数据库；不添加未经核实的使用率 |
| C10 | MyISAM 首集交付记录的中文成片时长为 475.883 秒（7:55.883）；本轮策划要求 Firebird 比它短 | **2026-10-21 读取本仓库交付元数据**：`../myisam/project.json` 的 `delivery.duration.zh = 475.883`，其 README 首段写 7 分 55.9 秒，二者一致。本轮未重新探测视频文件，不冒称新测量；当前 Firebird 预算上限取 475 秒，目标约 7 分半，配音后仍须实测成片比较 |
| C11 | 本片接续前三期的 MyISAM、InnoDB、PostgreSQL。上一期结尾已经引出 Firebird：两个开源巨头之外，一个更小众的选择；本轮观众定位是看过前三期、但尚不熟悉 Firebird 的人 | **2026-10-21 第 5 稿已核**：C03 系列顺序；PostgreSQL 已确认稿 `review/script.zh.7caad9971c6526e36f183a4c9ea8e6466f4aaadd37be02b20efd0f2ea80a05a7.md` 的 z6–z6a；策划最新会话原话“开场就不对. 注意观众是想看了前三期的”。前片已讲过的存储、事务、索引不在引子重教；本片仍交代 Firebird 的对象、历史与新机制 |

## 02a 引擎与两种运行形态

| 编号 | 陈述 | 出处 |
|---|---|---|
| E01 | 引擎是一个库；服务端是提供程序（Provider）链里的一环，客户端按连接串决定走哪条路 | `doc/README.providers.html`：「The remodelled architecture integrates the core engine for Classic/Superclassic, Superserver and embedded models in a common binary.」 |
| E02 | 默认提供程序顺序是 `Remote,Engine13,Loopback`：连接串带网络协议走 Remote；只给本地路径则 Remote 拒绝、Engine13 直接打开文件，得到嵌入式连接；再失败才试 Loopback | 同上（原文：「When database name does not contain network protocol (just dbname) Remote provider rejects it and Engine13 provider comes to stage... we do not need special embedded library to have embedded connection, standard client loads appropriate provider and becomes embedded server.」） |
| E03 | 连接串形式：`inet://<host>:<port>/<path>` 走 TCP；`xnet://` 走本机共享内存（Windows 的本地连接）；直接给本地文件路径即嵌入式 | `doc/README.providers.html`；5.0.4 发布说明第 13 节「Removal of WNET protocol」——5.0 已移除 `wnet://`，本地只剩 `xnet://` |
| E04 | 服务端可执行文件 `firebird.exe` 1,160,192 字节；客户端库 `fbclient.dll` 2,073,088 字节；引擎插件 `plugins/engine13.dll` 8,932,352 字节 | `lab/06_modes.py` 的 `binary_sizes`（`out_06_modes.json`），本机 `os.path.getsize` 实测 |
| E05 | 服务端可执行文件比客户端库还小（限该 Windows 包）；引擎插件可由服务端或应用进程加载 | E04 实测与 `README.providers.html`。**体积不证明职责**，不据此声称服务端「只转发」或无其他工作 |
| E06 | 服务端运行时除用户连接外还有两个内部 attachment：`Cache Writer` 与 `Garbage Collector` | `lab/01_probe.sql` 回显（`out_01_probe.txt`）：attachment 1 = Cache Writer，2 = Garbage Collector，3 = SYSDBA（`MON$REMOTE_PROTOCOL = TCPv4`） |
| E07 | 嵌入式连接不需要口令：本地文件路径的连接按宿主身份登录 | `doc/README.security_database.txt`：「For an embedded connection, an authentication password is not required and will be ignored if you provide one.」；本机正是用这种方式完成安全库初始化 |
| E08 | **停掉服务端进程后，远程与环回都连不上，只有嵌入式仍然可以打开同一个库文件** | `lab/06_modes.py` 的 `server-off` 分支：远程报 `Unable to complete network request to host "127.0.0.1"`，环回报 `Unable to complete network request to host "xnet://Global\FIREBIRD"`，本地路径连接成功。回显见 `out_06_modes.json` |
| E09 | 「引擎是库」指可加载的代码库；`.fdb` 是数据文件，两者不同。标准客户端在提供程序可用、本地文件可访问等条件满足时，可加载引擎获得嵌入式连接；不只是给一个路径就必然成功 | 已核实，2026-10-21：安装包 `doc/README.providers.html` 的 YValve、Engine13、embedded 说明；E08 及新实验 `13_query_path.py`。架构合并时间据 H05；不据部署方式推导页布局或事务算法 |

## 03 存储：页与页类型

| 编号 | 陈述 | 出处 |
|---|---|---|
| D01 | 本片实验库的页大小是 8192 字节 | `MON$DATABASE.MON$PAGE_SIZE = 8192`（`out_01_probe.txt`）；字节数互证：1,966,080 = 240 × 8192 |
| D02 | 磁盘结构版本是 ODS 13.1 | `MON$ODS_MAJOR = 13`、`MON$ODS_MINOR = 1` |
| D03 | 建库后 224 页；建表并插入 11 行后 240 页 | `out_01_probe.txt`（224）与 `out_03_schema.txt`（240） |
| D04 | 页头是 16 字节：`pag_type`(1) `pag_flags`(1) `pag_reserved`(2) `pag_generation`(4) `pag_scn`(4) `pag_pageno`(4) | Firebird 5.0.4 源码 `src/jrd/ods.h` 第 227–237 行（`struct pag`，`static_assert(sizeof(struct pag) == 16)`） |
| D05 | 页类型共 10 种：1 header 库头页、2 page inventory 页清单页、3 transactions 事务清单页(TIP)、4 pointer 指针页、5 data 数据页、6 index root 索引根页、7 index 索引页、8 blob data 大字段页、9 gen-ids 生成器页、10 SCN inventory | 同上，第 187–196 行的 `pag_header … pag_scns` 常量表 |
| D06 | 本片实验库 240 页的实际分布：header 1、page inventory 1、transactions 1、pointer 40、data 87、index root 40、index 64、gen-ids 1、SCN inventory 1，其余 4 页尚未分配 | `lab/05_pages.py` 按第 0 字节读页类型（`out_05_pages.json`） |
| D07 | 数据页上 `users` 表的物理行所在页是第 231 号页 | `lab/08_clean_versions.py` 的 `clean_before.fdb` 解析：唯一的 `alice` 落在第 231 页（`out_08_clean_versions.json`） |
| D08 | 名字索引 `idx_users_name` 的 B 树页在第 230 号页，那一页里也有 `alice` 这个键 | `lab/05_pages.py` 的解析：`alice` 命中一次于第 230 页（页类型 7，index B-tree） |
| D09 | 库里实际有 3 个用户自定义索引：`pk_users`、`idx_users_name`、`pk_notes` | `out_03_schema.txt` 的 `RDB$INDICES` 查询 |
| D10 | 单文件数据库内包含表、索引、系统表等；页有不同分工。数据页有记录槽目录，每槽记录页内偏移和长度；指针页列出表的数据页号 | 已核实，2026-10-21：`v5.0.4/src/jrd/ods.h:318–340`（`data_page`）、`:634–652`（`pointer_page`）；同版本 `dpm.epp` 的 `DPM_get`/`get_header`；[内部结构文档](https://www.firebirdsql.org/file/documentation/html/en/firebirddocs/firebirdinternals/firebird-internals.html) §2、§7、§8 交叉核对。该文档基于 ODS 11.1，**只用于概念互证**；5.0 的字节布局以 `ods.h` 为准。只称本片实验库为单文件，不声称所有配置都只能单文件 |

## 03a 一次查询（2026-10-21 补证）

本组对象为 Firebird 5.0.4，复用现有安装包，新建独立嵌入式库与原示例数据。没有重跑或覆盖旧实验。

| 编号 | 陈述 | 出处与核查 |
|---|---|---|
| Q01 | `SELECT age FROM users WHERE name = 'alice'` 返回 30；无计划提示，实际计划为 `Filter → Table USERS Access By ID → Bitmap → Index IDX_USERS_NAME Range Scan (full match)` | **已实测**：`lab/13_query_path.py`、`out_13_query_path.txt/json`；`v5.0.4/src/jrd/recsrc/BitmapTableScan.cpp:48–125` 交叉核对。此处 ID 是内部记录号，不等于用户表的 `id` 列 |
| Q02 | 本次计划先由姓名索引生成候选记录号的位图，再逐个调用 `VIO_get` 读取记录；位图可理解为标出哪些记录要取的清单，并非最终行值 | **已核实**：Q01 的实际计划；`BitmapTableScan.cpp` 的 `open`、`internalGetRecord`；`btr.cpp` 的索引扫描。只讲本次选中的路径，不把所有索引访问都说成位图扫描（另有索引导航） |
| Q03 | 索引的叶节点携带键与内部记录号；按记录号经表的指针页、数据页和槽定位记录；读取仍要按可见性规则选版本、检查谓词，才能返回年龄 | **已核实**：`v5.0.4/src/jrd/ods.h` 的 B 树页、指针页与数据页；`dpm.epp` 的 `DPM_get`、`get_header`；`vio.cpp` 的 `VIO_get`；Q01 的 `Access By ID` 与 `Filter`。官方内部结构文档 §7–10 作概念互证；本片不解码索引节点的逐字节格式 |
| Q04 | 全表扫描与索引访问是引擎的不同执行路径，优化器选择计划；索引页与数据页分别存放，名字索引不直接包含本例要返回的年龄 | **已核实**：`v5.0.4/src/jrd/recsrc/FullTableScan.cpp`、`BitmapTableScan.cpp`；Q01 实测；D07–D09 的原有页定位。文案不声称优化器永远选索引，也不以八行数据证明性能优势 |

## 04 更新与行版本

| 编号 | 陈述 | 出处 |
|---|---|---|
| U01 | 引擎知道每次 update / delete 产生的各个行版本，最老快照事务允许时就能回收 | `doc/README.garbage_collector.txt`：「Engine knows about each record versions produced by update\delete statement and can remove them as soon as oldest snapshot transaction (OST) allowed this.」 |
| U02 | 回收方式由 `GCPolicy` 决定：cooperative（由用户请求顺带回收，Classic 模式只有这一种）、background（专门的回收线程）、combined（两者都做）；SuperServer 缺省是 combined | 同上 |
| U03 | 本机实验库的清扫间隔 `MON$SWEEP_INTERVAL = 20000`（事务） | `out_01_probe.txt` |
| U04 | 原实验中数据页里的 `alice` 字节匹配从 1 处变为 2 处，新增匹配在第 231 页、文件偏移 1,900,254；这只证明字节多了一处，**不能据此判定哪个槽是当前版本、哪个是旧版本，也不能证明旧版留在原地址** | 2026-10-21 收窄旧结论：`lab/08_clean_versions.py` 只搜索字节；`out_08_clean_versions.json`。文案不再把新出现的位置标成「新版本」，也不把字节搜索说成完整的行版本解码 |
| U05 | 跨事务修改时需保留可供其他事务读取的旧版：引擎先保存旧版本，再替换主记录，主记录以回溯指针连接历史；旧版可以用差量编码，不一定是完整副本。不能概括为「不就地改、新版搬走、旧版不动」 | 已核实，2026-10-21：`v5.0.4/src/jrd/vio.cpp:6053–6173` 的 `prepare_update`、`:6570–6601` 的 `replace_record`；`dpm.epp:2386` 的 `DPM_update`；[MVCC 论文](https://www.firebirdsql.org/file/documentation/papers_presentations/Multi_version_concurrency_control.pdf) 第 4–5 页交叉核对。文案只讲保留历史与回溯，不承诺物理地址不变；同事务的重复修改有原地更新分支，不说每次 UPDATE 都新增长链 |

## 05 并发

| 编号 | 陈述 | 出处 |
|---|---|---|
| M01 | **两个并发会话实测：写者更新 `users` 第 1 行的 age 为 31 但未提交，读者在同一行读到的仍是旧值 30，连读两次都是 30；写者提交后读者才读到 31** | `lab/04_mvcc.py` 的 `out_04_mvcc.txt`（五步逐条回显：更新前 30 / 写者自己读到 31 / 读者未提交时 30 / 读者再读 30 / 提交后 31） |
| M02 | 5.0 的 `ReadConsistency = 1` 影响 **READ COMMITTED 模式内部**的读一致性行为；不代表所有客户端默认事务隔离级别都是 READ COMMITTED | 2026-10-21 纠正范围：`firebird.conf` 第 800–808 行与 5.0 语言参考的事务章节。旧 `04_mvcc.py` 未显式设置隔离级别，旧回显可保留为历史记录，**不再用它断言同一读事务在对方提交后必然见新值**；本稿只使用「未提交时读取旧值」这一观察，并以 U05/语言参考互证 |
| M03 | 引擎按事务与快照的可见性规则，沿回溯版本链（back versions chain）寻找可以读取的版本 | Firebird 5.0 语言参考（`refdocs/fblangref50`）关于 READ COMMITTED READ CONSISTENCY 的说明；2026-10-21 补以 `v5.0.4/src/jrd/vio.cpp` 的 `VIO_get` 与回溯读取交叉核对。译名纠正为「回溯」，不说「后继」 |
| M04 | `MON$TRANSACTIONS.MON$STATE` 是监控层的空闲/活跃状态，不是 TIP 中的已提交/失败状态；不能用该查询解码事务清单页 | 2026-10-21 纠正：5.0 语言参考「MON$TRANSACTIONS」与 `v5.0.4/src/jrd/tra.cpp` 的 `TRA_set_state` 对照；本稿不引用原监控值 |
| M05 | 缓冲页数 `MON$PAGE_BUFFERS = 2048`；数据库只读标志为 0 | `out_01_probe.txt` |

## 06 写出错与恢复

| 编号 | 陈述 | 出处 |
|---|---|---|
| W01 | 强制写已开启：`MON$FORCED_WRITES = 1` | `out_01_probe.txt`；`firebird.conf` 缺省即开 |
| W02 | 引擎内部有两个专职角色：Cache Writer 负责把脏页写回库文件，Garbage Collector 负责回收无用的行版本 | `out_01_probe.txt` 的 attachment 清单（Cache Writer、Garbage Collector）；`doc/README.garbage_collector.txt` 说明回收由专职线程完成（background 模式） |
| W03 | 事务状态在事务清单页（TIP）上：页类型 3 即 `pag_transactions` | `src/jrd/ods.h` 第 189 行的常量与注释 `// Transaction inventory page` |
| W04 | Firebird 的常规事务恢复不是 PostgreSQL 式的 WAL 重放；依靠行版本、事务状态以及有依赖顺序的页面写入（careful writes）。这里不讨论复制日志、追踪日志等其他日志用途 | 已核实，2026-10-21：[MVCC 论文](https://www.firebirdsql.org/file/documentation/papers_presentations/Multi_version_concurrency_control.pdf) 第 5 页「no recovery log」「careful write」；同版本 `cch.cpp:1813–1844` 的 `CCH_precedence`、`dpm.epp` 的页面依赖调用与 `tra.cpp` 的提交实现交叉核对。旧稿 w2/z6「先写日志再落盘」没有依据，已撤回 |
| W05 | `TRA_commit` 对写事务先 `transaction_flush`，随后 `TRA_set_state(...tra_committed)` 更新事务清单页；强制写开启时要求物理写盘。指向某页的页须在所指页之后写出，这是一类页面依赖，不是所有页共用一个简单顺序 | 已核实，2026-10-21：`v5.0.4/src/jrd/tra.cpp:432–542`、`:1488–1580`，`cch.cpp` 的 `CCH_precedence`，`dpm.epp` 的依赖设置；[gfix 手册](https://www.firebirdsql.org/file/documentation/html/en/firebirddocs/gfix/firebird-gfix.html)「Synchronous or Asynchronous Writes」；W01 的本机强制写值为 1。本轮**未做断电/崩溃恢复实验**，不把源码核对称作崩溃实测，不保证坏盘或底层违背刷盘承诺时仍无数据损失 |
| W06 | 崩溃后启动时，独占库锁下的 `TRA_cleanup` 把残留 active 状态普通事务标为 dead；这些事务的版本不作为已提交数据返回。两阶段提交的 limbo 状态另行处理，不在本片范围 | 已核实，2026-10-21：`v5.0.4/src/jrd/tra.cpp:301–375` 的 `TRA_cleanup`、`vio.cpp` 的 dead-version 处理；MVCC 论文第 5 页 failed transaction/back versions 说明互证。限源码与文档核对，未声称崩溃实测 |

**不确定的字节口径（不进脚本）**：本片没有解码行版本头的字段布局，只用「同一物理行在页上出现几份」这一可数事实；行内各字节的字段含义未逐字段核实，故不在旁白或画面上标注具体偏移的含义。

## 07 演示用数据

| 编号 | 陈述 | 出处 |
|---|---|---|
| S01 | 本片沿用系列前几集的同一张示例表与同一批数据：`users(id, name, age)` 8 行 alice/bob/carol/dave/erin/frank/grace/heidi，`notes(id, body)` 3 行 | MyISAM 一集 `research/lab/01_create.sql`；本片 `lab/03_schema.sql` 与 `lab/08a_create.sql` |
| S02 | Firebird 没有 TINYINT，`age` 用 SMALLINT | 建表语句与 `out_03_schema.txt` 回显（建表成功） |
| S03 | MyISAM 一集 `notes` 第 2 行原文是「MyISAM stores rows in a .MYD file」；本片改成「Firebird keeps row versions in the data page」，因为本片讲的正是这件事 | `lab/03_schema.sql`；`myisam/research/lab/01_create.sql` |

## 08 视觉与声音的取材

| 编号 | 陈述 | 出处 |
|---|---|---|
| V01 | 官网标志是一只「火鸟」：火焰由金黄渐变到橙再到红，落在红橙色的方框里 | `firebirdsql.org/img/site/firebird.png`（本机取回后按像素统计，`lab/09_logo_colors.py`） |
| V02 | 标志里的实际颜色：金 `#FAAC19`、橙 `#F68A21`、红 `#EE2B24` | 同上，像素统计的前几位 |
| V03 | 官网正文色 `#17222b`，链接与悬停色 `#2e6474` | `https://firebirdsql.org/template/css/style.css`（`a:hover { color: #2e6474 }`，`a { color: #17222B }`） |
| V04 | 官网拉丁字体是 Heebo | 同上，`font-family: "Heebo", sans-serif`（OFL 授权，可自由取用） |
| V05 | isql 的提示符是 `SQL>` | `lab/01_probe.sql` 等回显 |

## 09 制作署名

- 策划：WaterRun
- 事实测绘与实验：MiniMax M3.1 Flash（会话标识 `minimax-M3.1-Flash-Preview`）
- 文案：MiniMax M3.1 Flash
- 任务书与交接材料：MiniMax M3.1 Flash
- 2026-10-21 事实纠错、查询路径补证、文案第 2 稿：本轮模型具体版本未记录，署名据实记在 project.json；不把客户端名当模型名。
- 视觉系统、配乐、场景、封面、渲染与交付：本轮未做，不预列未来参与者。
- 配音：尚未合成（音色待定，见 README 与 `brief/05-motion-sound.md`）
- 开源视频：github.com/Water-Run/ft（[源码仓库](https://github.com/Water-Run/ft)）

实际署名的唯一来源为 `project.json` 的 `credits`；本节是劳动记录，不预列未来制作者。当前准备方负责事实与文案，视觉与声音的方案归后续制作方。旧 brief 的章节和技术断言已过期，见 README 的交接。

实际用到的第三方软件与版本：

| 软件 | 版本 | 用途 | 许可 |
|---|---|---|---|
| Firebird | 5.0.4.1812 | 被讲的数据库，本机实验 | IPL 1.0 / IDPL |
| Firebird 源码 | 标签 `v5.0.4` | 页结构与页类型常量 | 同上 |
| Python `fdb` | 2.0.4 | 实验脚本连接 Firebird | BSD |
| Python | 3.14.3 | 实验脚本 | PSF |
| Docker Desktop | 29.5.3 | 一次尝试拉取 Firebird 4.0 镜像（未用上，最终改用官方 zip） | — |

## 10 取证中查到、但本片不讲的材料

留待日后再查或另立选题，不写进本片：

- `GCPolicy` 的三种取值在本机 SuperServer 下的实际差别（只从文档读到定义，没有逐项实测）。
- 行版本头的逐字段字节解码（本轮补查了更新与回溯实现，但没有新增行头解码实验）。
- 5.0 的并行执行（`ParallelWorkers` / `MaxParallelWorkers`）与「更紧凑的记录压缩」（Denser compression of records）——发布说明第 3 节列出，但本片时长与主线不展开。
- `xnet://` 环回与嵌入式的性能差异（本片只讲「能不能连上」，不讲快慢）。
- Firebird 5.0 移除了 `wnet://` 协议（发布说明第 13 节），本片只提到本地连接用 `xnet://`。
- Firebird 的更详细历史（Datatrieve / JRD、Groton、Ashton-Tate、Borland 收购等）——本轮保留八十年代 InterBase、2000 年开源分支、2002 年 1.0 的短线，不展开公司编年史。

## 文案第 2 稿事实复核（2026-10-21）

此处是文案与证据核对，**不是成片验收**。本轮补查的源码全部固定 v5.0.4，网页与函数位置见各条及 sources.json。

- H01/H02/H07：换用官方历史、发布说明和同版本源码；只报已需要且有依据的年份。
- E05/E09：代码库与数据文件分清；文件体积不承担“服务端只负责转发”的因果证明；部署形态与存储算法分开讲。
- D10/Q01–Q04：补足页与槽、姓名索引、候选位图、取行与可见性；查询路径有新实测，未添加计划提示。
- U04/U05：撤回“新增字节位置就是新版本”“旧版固定原地”的推断，不展示未经解码的行头字段。
- M02/M04：撤回“Firebird 一概缺省 READ COMMITTED”和“监控活跃状态就是提交状态”的混淆。
- U01–U03：正文不再把 sweep 阈值当作版本回收周期。
- W04–W06：撤回 WAL 重放的错误；以源码和官方论文解释页面依赖、提交顺序与崩溃后的普通事务处理。**未做崩溃实验**。
- 未做配音、字幕成片、画面、声音和交付文件复核；没有写入任何通过结论。

## 文案第 3 稿事实复核（2026-10-21）

- C06–C08：新增与 InnoDB、PostgreSQL 的存储、历史与恢复对比，官方手册原文重新读取，前集对应事实和实验用于交叉核对。版本与对象边界随各条保留。
- D10/Q02/Q03：用“页内目录”“记录号”“先记下匹配记录号再取行”讲职责；省去术语没有把位图步骤说成不存在，也没有让 Firebird 的内部记录号等于用户 id 列。
- U05/M03：用“当前记录留着线索，能找回之前的样子”解释版本；不承诺历史均为完整副本，不扩讲隔离级别。
- W05/W06：新增页与指向它的目录作为页面依赖例子，回到 Alice 修改时再解释提交顺序；两者不能画成每次 UPDATE 都会分配新页。未补做崩溃实验，仍据同版本源码与官方文档。
- 仅文案与研究核对；没有配音、连续观看或成片验收结论。

## 文案第 4 稿事实复核（2026-10-21）

- 开场的完整数据库定义使用 H09，MySQL/Pg 的服务式用法使用 C01，SQLite 式嵌入对照使用 C02 与 E01–E09；没有添加新的市场数据或架构结论。
- C09 单列策划的“小众的第三选择”定位，不把叙事顺序冒充市场名次。
- C10 从 MyISAM 的 project.json 与 README 核对已登记交付时长，说明此次相对片长要求；本轮未对前片成片做新测量。
- 实现主体沿用第 3 稿已核事实与实验；引子给运行形态的印象，engine 章解释加载机制，两者均不把部署方式说成存储算法的原因。
- 本轮仍是准备文案；未配音、未做崩溃新实验、未验收成片。

## 文案第 5 稿事实复核（2026-10-21）

- C11 对照前集已确认稿的 z6–z6a，开场直接接续已有 Firebird 预告。观众定位取自策划本轮纠正，不再使用第 4 稿的泛认知问句与数据库基础介绍。
- 开场对前三期“不同实现、独立服务”的概括由 C01、C03、C06–C08 支撑；Firebird 与两种运行方式仍用 H09、C02、E01–E09，没有新增技术结论。
- 实现主体未改；本轮没有重跑实验、配音或成片验收。
