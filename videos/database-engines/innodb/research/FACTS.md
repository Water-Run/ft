# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。做法见仓库 `docs/guides/research.md`。

新版（2026-10-24 起）在 MySQL 9.7.4 上重新实测，实验脚本与完整回显在 `research/lab/`（`out_0N.json` 与 `.txt`）。旧版（R8）的事实表、来源表与 9.7.2 实验存档在 `research/r8/`：旧实验的执行者记为「GPT-6（型号未记录）」，型号确认不了，新版不沿用其数据；旧表只作线索与出处索引，凡新版要用的都重新核对，记在本表。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| MySQL | 9.7.4 LTS Community Server，官方 Windows 版 | `https://cdn.mysql.com/Downloads/MySQL-9.7/mysql-9.7.4-winx64.zip`，按下载页公布的 MD5 核对（`lab/lab_common.py`）；每次实验新建数据目录，只监听 127.0.0.1 |
| 关键配置（实查） | 页 16384 字节；file-per-table 开；行格式 DYNAMIC；默认隔离级别 REPEATABLE-READ；`innodb_flush_log_at_trx_commit=1`；doublewrite 开；redo 容量 100 MiB；缓冲池 128 MiB；change buffer `all` | `out_01.json`「environment」、`out_04.json`「config」 |
| binlog | 关（`--disable-log-bin`），把 InnoDB 本身隔离出来；实验记录写明 | `lab/lab_common.py` |
| 数据 | 系列共用的 `users(id INT 主键, name CHAR(50) ascii, age TINYINT UNSIGNED, KEY idx_name(name), KEY idx_age(age))`，4096 行，2050 号 Alice 42 岁，其他人名 50 字节、年龄 18 + id % 63；另建 `users_big` 一百万行（人名改用 7 位编号，避免截断重名） | `lab/lab_common.py` 的 `insert_sql()` |
| 官方手册 | MySQL 9.7 参考手册的页面快照（2026-10-09 存，`research/_src/manual/D01–D19`；2026-10-24 白天本机访问 dev.mysql.com 一律 403，故用快照），SHA-256 与当时记录一致；当晚直连恢复，第 2 稿新用的两页直接抓取（`research/_src/manual_974/`），SHA-256 记在 `out_06.json` | `out_06.json` |
| 源码 | `github.com/mysql/mysql-server` 标签 `mysql-9.7.4` | `out_06.json` |

## 实验结果

### T 整棵树（`01_trees.py` → `out_01.json`）

正常建表后慢速关机（`innodb_fast_shutdown=0`，合并 change buffer、做完 purge），复制 `.ibd` 按页解析（`lab/ibd.py`），根页号取自 `INFORMATION_SCHEMA.INNODB_INDEXES`，与页头里的索引号互相印证。

| 编号 | 事实 |
|---|---|
| T1 | `users.ibd` 共 49 页（802 816 字节）。主键树两层：根页 4，下面 21 页叶子（7、8、11、13、15、16、18、20、24、25、27、29、31、32、34、36、40、42、43、45、47），叶子共 4096 条记录 |
| T2 | 主键根页 4 有 21 条节点指针，每条是「一个 id + 一个子页号」：(1→7)、(104→8)、(311→11)……(1967→27)……(4037→47) |
| T3 | 主键叶子：第一页（7）103 条，最后一页（47）60 条，中间 19 页各 207 条；叶页平均用到第 14 720 字节（每页 16 384 字节） |
| T4 | 姓名索引树两层：根页 5，下面 16 页叶子，共 4096 条；每条是「姓名 + 主键 id」（50 + 4 字节）。「Alice」按字母排在所有「User…」之前，在第一页叶子（9）里 |
| T5 | `users_big`（一百万行）：主键树三层，1 + 5 + 4832 页，叶子共 1 000 000 条；姓名索引树三层，1 + 15 + 3664 页 |
| T6 | 从主键根页 4 走到 Alice：根页里不大于 2050 的最后一项是 (1967→27)，于是到叶页 27；Alice 那一行在叶页 27 的偏移 6184 |
| T7 | Alice 那一行 68 字节：主键 `80000802`（2050，INT 以翻转符号位存）、事务号 6 字节（建表时为 1558）、回滚指针 7 字节（`82…`，最高位表示插入）、名字 50 字节（空格补齐）、年龄 1 字节（`2a` = 42）；前面另有 5 字节的记录头 |
| T8 | 姓名索引里的 Alice：叶页 9 偏移 8149，54 字节：名字 50 字节 + 主键 `80000802` |
| T9 | 叶子之间左右相连：页头的「上一页」「下一页」（偏移 8、12）把 21 页主键叶子按键的顺序连成一串：7 ↔ 8 ↔ 11 ↔ … ↔ 25 ↔ 27 ↔ 29 ↔ … ↔ 47，两头为空（FIL_NULL）。页号不连续，因为两棵树一起长，新页交替分给主键树（7、8、11、13…）与姓名索引树（9、10、12、14…） |

### X 事务（`02_txn.py` → `out_02.json`）

| 编号 | 事实 |
|---|---|
| X1 | Alice 在事务里把年龄改成 43 并提交，慢速关机后再解析：同一位置（叶页 27、偏移 6184）的行，事务号 1558 → 2061，回滚指针 `820000011d3100` → `010000011f0110`（最高位 0：更新），年龄 42 → 43；事务进行时 `information_schema.innodb_trx` 里的事务号就是 2061 |
| X2 | 同样的 `START TRANSACTION; UPDATE … SET age = 43 WHERE id = 2050; ROLLBACK;`：InnoDB 的 users 回到 42；MyISAM 副本 `users_myisam` 停在 43，`SHOW WARNINGS` 回 `Warning 1196 Some non-transactional changed tables couldn't be rolled back` |
| X3 | 可重复读：Bob 开事务先读到 42；Alice 改成 43 未提交时 Bob 读 42；Alice 提交后 Bob 仍读 42；Bob 用锁定读（`FOR SHARE`）读到 43 |
| X4 | 读已提交：Alice 未提交时 Bob 读 42；Alice 提交后 Bob 读到 43 |
| X5 | Alice 的未提交 UPDATE 持有主键 2050 的记录锁（`performance_schema.data_locks`：RECORD、`X,REC_NOT_GAP`、GRANTED）；Carol 改同一行时她的锁是 WAITING，3 秒后（`innodb_lock_wait_timeout=3`）报 `ERROR 1205 Lock wait timeout exceeded`；Carol 改 2051 不用等 |
| X6 | 删掉 2050 并提交后（此时那条记录还未 purge），Bob 以 `SELECT … WHERE id BETWEEN 2049 AND 2051 FOR UPDATE` 读到 2049、2051，锁住 2049（`X,REC_NOT_GAP`）、2050 与 2051（`X`：记录加前面的间隙）；Dave 插入 (2050, 'Dave', 35) 等待 3 秒后报 1205；Bob 再读仍是 2049、2051（没有幻影）；Bob 提交后 Dave 插入成功 |
| X7 | 死锁：Alice 锁住 2049 后要 2051，Carol 锁住 2051 后要 2049；Carol 收到 `ERROR 1213 Deadlock found when trying to get lock`，她的事务被回滚，Alice 的语句随即完成；`SHOW ENGINE INNODB STATUS` 的「LATEST DETECTED DEADLOCK」记下两笔事务和各自持有、等待的锁 |

### D 删除（`03_delete_purge.py` → `out_03.json`）

| 编号 | 事实 |
|---|---|
| D1 | Bob 开着一致性快照时，管理员删掉 Alice 并提交：管理员已查不到 2050，Bob 仍读到 Alice 42 岁 |
| D2 | 此刻把表空间落盘（`FLUSH TABLES users FOR EXPORT`）解析叶页 27：Alice 那一行仍在偏移 6184，记录头里打了删除标记；事务号变成删除它的那一笔，回滚指针指向 undo |
| D3 | Bob 提交、purge 做完（历史列表长度归零）后再解析：2050 不在记录链上了；页头的可回收字节（PAGE_GARBAGE）由 0 变成 73（68 字节的行 + 5 字节记录头），页内空闲链的头指向 6184 |
| D4 | Dave 插入 (2050, 'Dave', 35)：他的行落在偏移 6184，正好用上 Alice 留下的空间；可回收字节回到 0 |

### R 崩溃恢复（`04_crash.py` → `out_04.json`）

| 编号 | 事实 |
|---|---|
| R1 | Alice 把年龄改成 43（自动提交）后，管理员开事务执行全表 `UPDATE users SET age = age + 1`（逐行放慢），改到第 258 行时强行结束 mysqld（Windows `taskkill /F /T`，不经关机） |
| R2 | 结束前一刻：日志序号 20 359 513，最后一次检查点 19 036 061（`SHOW ENGINE INNODB STATUS` 的 LOG 段） |
| R3 | 重启日志：找到检查点 19 036 061 → 开始崩溃恢复，扫描到 20 362 083，重放 187 条 redo 记录 → 发现 1 笔要回滚的事务，共 274 次行操作要撤销 → 在后台回滚事务 1563，完成 |
| R4 | 重启后 Alice 是 43；其余 4095 行的年龄全部是原值（被改过的 0 行） |

### L 查找（`05_lookup.py` → `out_05.json`）

| 编号 | 事实 |
|---|---|
| L1 | 冷启动（不预热缓冲池）后按主键查 2050：users 表新读进缓冲池的页是 4 与 27；再查一次，没有页从磁盘读入 |
| L2 | 按姓名查 Alice：执行计划 `Index lookup on users using idx_name (name = 'Alice')`；新读入的页是 5 与 9（姓名索引的根与叶）；回表要用的 4、27 已在缓冲池；再查一次没有磁盘读 |

### G 一行一行插入（`07_more.py` → `out_07.json`）

新建空表，按 id 1..4096 一行一句插入（自动提交，人名与年龄同系列规则）。每插一行查 `INFORMATION_SCHEMA.INNODB_BUFFER_PAGE` 里两棵树的页与每页记录数，页的集合一变就记下。

| 编号 | 事实 |
|---|---|
| G1 | 空表的主键树只有第 4 页（根页号同 T1）。前 207 行都在这一页里；插入第 208 行后，主键树变成 3 页：第 4 页存 2 条节点指针，叶页 7 存 103 行、叶页 8 存 105 行 |
| G2 | 之后新行都进最右边的叶子。第 311 行插入后出现叶页 11（1 行），叶页 8 满 207 行，根页 3 条；第 518 行后出现叶页 13，第 725 行后出现叶页 15，每次根页多一条 |
| G3 | 4096 行插完，再慢速关机按页解析：主键树的页号与每页行数与 T1 完全相同（一条 `INSERT … SELECT` 建的表也是这棵树） |
| G4 | 插入第 2050 行（Alice）时，主键树里加了一行的是叶页 27（当时最右边的叶子：它从第 1967 行开始，第 2174 行才有下一页），姓名索引里加了一项的是叶页 9（最左边的叶子）。姓名索引的第一次分裂在第 274 项：叶页 9 存 136 项、叶页 10 存 138 项 |
| G5 | 可重复读下，「Bob 先读、Alice 后改」与「Alice 先改、Bob 后读」两种顺序结果相同：Bob 先读到 42；Alice 提交后 Bob 仍读到 42；锁定读（`FOR SHARE`）读到 43。`innodb_trx` 里 Alice 的事务号是 6171（第二种顺序 6175），Bob 只读未改，显示的是一个很大的内部编号（2829…），不占用正式的事务号 |
| G6 | 缺省值：`autocommit = 1`；`default_storage_engine = InnoDB`；`innodb_lock_wait_timeout = 50`（秒；X5–X7 为缩短实验改成 3） |
| G7 | 同一个库里两种引擎的文件：InnoDB 的 `users.ibd` 802 816 字节；同样的列与三个索引换成 MyISAM（`users_myisam`），是 `.MYD` 229 376 字节（数据）、`.MYI` 297 984 字节（索引），另有 9.x 才有的 `.sdi` 4 348 字节（表结构） |
| P1 | 叶页 27 的页目录（解析 01 存下的 `users.ibd`，SHA-256 与 `out_01.json` 一致）：207 条记录，52 个目录槽（第一个指向 infimum、最后一个指向 supremum）；中间每槽各管 4 条记录。按 InnoDB 的做法在槽上二分查 2050，依次比较槽 25（2066）、12（2014）、18（2038）、21（2050）、23（2058）、22（2054），落在槽 21，它指向的记录就是 2050（这是按源码规则在实测数据上的推算，不是跟踪引擎得到的） |
| E1 | `EXPLAIN FORMAT=TREE`：`SELECT * … WHERE name = 'Alice'` 为 `Index lookup on users using idx_name`；只取 `id` 时为 `Covering index lookup on users using idx_name`（姓名索引里已有编号，不必回表） |

### V 开场回顾 MyISAM 用到的事实

来自 MyISAM 一集的事实表（`../myisam/research/FACTS.md`），加上本片 G7 的 9.7.4 实测。

| 编号 | 事实 | 出处 |
|---|---|---|
| V1 | MyISAM 的一张表：数据一个文件（`.MYD`），索引一个文件（`.MYI`） | MyISAM 事实表「02」：5.5 建表后目录里是 `users.frm`、`users.MYD`、`users.MYI`；本片 G7（9.7.4） |
| V2 | MyISAM 的索引是 B 树，每一项是「键 + 这一行在数据文件里的位置（行号）」，主键与普通索引都是这样 | MyISAM 事实表「06」：每项 = 4 字节键 + 6 字节行号；两个 `keydef` 都是 B 树 |
| V3 | MyISAM 不能回滚：ROLLBACK 后数据留在改过的样子，只回警告 1196 | 本片 X2 |
| V4 | MyISAM 锁整张表：读锁共享、写锁独占，一个连接在写，其他连接都要等 | MyISAM 事实表「08」（`mysys/thr_lock.c`）与 9.7.4 实测：读整表时两个修改都处于「Waiting for table level lock」 |
| V5 | MyISAM 不记日志；上次没正常关闭的表要 CHECK TABLE 检查、REPAIR TABLE 修复 | MyISAM 事实表「09」 |

### K 事务与 InnoDB 的来历（第 3 稿，`08_history.py` → `out_08.json`）

原始文献或源码，存进 `research/_src/history/` 与 `research/_src/web/`，SHA-256 记在 `out_08.json`，摘句按原文逐字核对。

| 编号 | 事实 | 出处 |
|---|---|---|
| K1 | Jim Gray 1972–1980 年是 IBM 圣何塞研究所的研究员，参加了后来叫 System R 的项目；1980–1990 年在 Tandem 公司 | ACM 图灵奖页面（2019 年存档）：「Research Staff Member, Computer Science Department, IBM Research, San Jose, CA (1972–1980)」「Gray soon joined this project, which became known as System R.」「Software Designer, Tandem Computers, Cupertino, CA (1980–1990)」 |
| K2 | Gray 把事务定义为一个工作单位，例如从一个银行账户转钱到另一个账户：无论成不成功，都要让数据库保持一致——要么钱转过去，要么留在原账户 | 同上：「He defined the transaction as a unit of work, such as moving money from one bank account to another, … either the money moves, or it stays in the original account.」 |
| K3 | 1981 年 6 月，Tandem 技术报告 TR 81.3《The Transaction Concept: Virtues and Limitations》（Jim Gray）：事务是一次状态变换，具有原子性（全有或全无）、持久性（效果在故障后保留）与一致性（正确的变换） | 作者分发的全文：「A transaction is a transformation of state which has the properties of atomicity (all or nothing), durability (effects survive failures) and consistency (a correct transformation).」 |
| K4 | 1983 年 12 月，Theo Härder（西德凯泽斯劳滕大学）与 Andreas Reuter（IBM 圣何塞研究所）在 ACM Computing Surveys 15(4) 发表《Principles of Transaction-Oriented Database Recovery》，把事务的四个性质合称 ACID | 论文原文：「These four properties, atomicity, consistency, isolation, and durability (ACID), describe the major highlights of the transaction paradigm」 |
| K5 | 1998 年图灵奖授予 Jim Gray，表彰他在数据库与事务处理研究上的开创性贡献 | ACM 图灵奖页面：「1998 CITATION For seminal contributions to database and transaction processing research and technical leadership in system implementation.」 |
| K6 | InnoDB 9.7.4 源码的文件头都写着「Created 日期 Heikki Tuuri」：页 `page0page.cc` 与 B 树 `btr0btr.cc` 是 1994 年，缓冲池 `buf0buf.cc` 1995 年，事务 `trx0trx.cc`、undo `trx0undo.cc`、锁 `lock0lock.cc` 1996 年，读视图 `read0read.cc`、崩溃恢复 `log0recv.cc` 1997 年 | GitHub 标签 mysql-9.7.4，行号见 `out_08.json` |
| K7 | 1992 年 3 月，IBM 的 C. Mohan 等在 ACM TODS 17(1) 发表 ARIES：恢复使用预写日志（write-ahead logging，WAL）；重启时先「重演历史」，把缺失的修改全部重做，再回滚没完成的事务 | 论文原文：「recovery using write-ahead logging (WAL)」「We introduce the paradigm of repeating history to redo all missing updates before performing the rollbacks of the loser transactions during restart after a system failure.」 |
| K8 | 1983 年 12 月，Bernstein 与 Goodman 在 ACM TODS 8(4) 为多版本数据库系统的并发控制算法给出正确性理论 | ACM DL 存档：「This paper presents a theory for analyzing the correctness of concurrency control algorithms for multiversion database systems.」 |
| K9 | PostgreSQL 源自加州大学伯克利分校的 POSTGRES：1986 年开始实现，由 Michael Stonebraker 教授领导；1996 年改名 PostgreSQL | PostgreSQL 18 文档《A Brief History of PostgreSQL》 |

## 官方手册与源码（`06_sources.py` → `out_06.json`）

| 编号 | 原文摘句（MySQL 9.7 参考手册） | 页面 |
|---|---|---|
| M1 | Each InnoDB table has a special index called the clustered index that stores row data. | D01 innodb-index-types |
| M2 | each record in a secondary index contains the primary key columns for the row, as well as the columns specified for the secondary index. | D01 |
| M3 | With the exception of spatial indexes, InnoDB indexes are B-tree data structures. | D02 innodb-physical-structure |
| M4 | The default size of an index page is 16KB. | D02 |
| M5 | If index records are inserted in a sequential order (ascending or descending), the resulting index pages are about 15/16 full. | D02 |
| M6 | A 6-byte DB_TRX_ID field indicates the transaction identifier for the last transaction that inserted or updated the row. | D03 innodb-multi-versioning |
| M7 | A 7-byte DB_ROLL_PTR field called the roll pointer. | D03 |
| M8 | a row is not physically removed from the database immediately when you delete it with an SQL statement. / InnoDB only physically removes the corresponding row and its index records when it discards the update undo log record written for the deletion. / This removal operation is called a purge | D03 |
| M9 | A consistent read means that InnoDB uses multi-versioning to present to a query a snapshot of the database at a point in time. | D04 innodb-consistent-read |
| M10 | A record lock is a lock on an index record. / A gap lock is a lock on a gap between index records / A next-key lock is a combination of a record lock on the index record and a gap lock on the gap before the index record. | D05 innodb-locking |
| M11 | InnoDB uses next-key locks for searches and index scans, which prevents phantom rows | D05 |
| M12 | The redo log is a disk-based data structure used during crash recovery to correct data written by incomplete transactions. / recovery starts at the latest checkpoint LSN. | D06 innodb-redo-log |
| M13 | InnoDB automatically rolls back uncommitted transactions that were present at the time of the crash. | D07 innodb-recovery |
| M14 | An undo log is a collection of undo log records associated with a single read-write transaction. | D08 innodb-undo-logs |
| M15 | 3/8 of the buffer pool is devoted to the old sublist. | D09 innodb-buffer-pool |
| M16 | The doublewrite buffer is a storage area where InnoDB writes pages flushed from the buffer pool before writing the pages to their proper positions in the InnoDB data files. | D10 innodb-doublewrite-buffer |
| M17 | can perform a multiple-statement transaction by starting it with an explicit START TRANSACTION or BEGIN statement and ending it with a COMMIT or ROLLBACK statement. | D12 innodb-autocommit-commit-rollback |
| M18 | When deadlock detection is enabled (the default) and a deadlock does occur, InnoDB detects the condition and rolls back one of the transactions (the victim). | D13 innodb-deadlocks |
| M19 | The default isolation level for InnoDB is REPEATABLE READ / Consistent reads within the same transaction read the snapshot established by the first read. | D18 innodb-transaction-isolation-levels |
| M20 | Its DML operations follow the ACID model, with transactions featuring commit, rollback, and crash-recovery capabilities to protect user data. | innodb-introduction（2026-10-24 直接抓取） |
| M21 | Row-level locking and Oracle-style consistent reads increase multi-user concurrency and performance. | innodb-introduction |
| M22 | In MySQL 9.7, InnoDB is the default MySQL storage engine. | innodb-introduction |
| M23 | A COMMIT means that the changes made in the current transaction are made permanent and become visible to other sessions. / A ROLLBACK statement, on the other hand, cancels all modifications made by the current transaction. | D12 |
| M24 | By default, MySQL starts the session for each new connection with autocommit enabled, so MySQL does a commit after each SQL statement if that statement did not return an error. / If autocommit mode is enabled, each SQL statement forms a single transaction on its own. | D12 |
| M25 | The ACID model is a set of database design principles that emphasize aspects of reliability … / The atomicity aspect of the ACID model mainly involves InnoDB transactions / The consistency aspect of the ACID model mainly involves internal InnoDB processing to protect data from crashes. / … so that data is not corrupted and results are not distorted by exceptional conditions such as software crashes and hardware malfunctions. | mysql-acid（2026-10-24 直接抓取） |
| M26 | Isolation is the I in the acronym ACID / InnoDB offers all four transaction isolation levels described by the SQL:1992 standard: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, and SERIALIZABLE. | D18 |
| M27 | The buffer pool is an area in main memory where InnoDB caches table and index data as it is accessed. / the buffer pool is divided into pages that can potentially hold multiple rows. / data that is rarely used is aged out of the cache using a variation of the least recently used (LRU) algorithm. | D09 |
| M28 | The header is used to link together consecutive records, and for row-level locking. | D17 innodb-row-format |
| M29 | If a table has no PRIMARY KEY or suitable UNIQUE index, InnoDB generates a hidden clustered index named GEN_CLUST_INDEX on a synthetic column that contains row ID values. / A 6-byte DB_ROW_ID field contains a row ID that increases monotonically as new rows are inserted. | D01、D03 |
| M30 | a non-locking SELECT statement presents the state of the database from a read view which consists of transactions committed before the read view was created | D18 |
| M31 | dirty pages are flushed from the buffer pool to tablespace data files（写回的快慢随 redo 占用的空间调整） | D06 |
| M32 | The passage of data through redo log files is represented by an ever-increasing LSN value. | D06 |
| M33 | InnoDB can find a good copy of the page from the doublewrite buffer during crash recovery. | D10 |
| M34 | In PostgreSQL, an UPDATE or DELETE of a row does not immediately remove the old version of the row.（片尾引出下一集用） | PostgreSQL 18 文档 routine-vacuuming（2026-10-24 直接抓取） |
| S1 | `constexpr size_t DATA_TRX_ID_LEN = 6;`（`storage/innobase/include/data0type.h:185`） | mysql-9.7.4 |
| S2 | `constexpr size_t DATA_ROLL_PTR_LEN = 7;`（`storage/innobase/include/data0type.h:191`） | mysql-9.7.4 |
| S3 | `constexpr uint32_t FIL_PAGE_PREV = 8;`、`constexpr uint32_t FIL_PAGE_NEXT = 12;`（`storage/innobase/include/fil0types.h:51`、`:61`）：页头里的上一页、下一页 | mysql-9.7.4（`out_07.json`） |
| S4 | `auto next_page_no = btr_page_get_next(page, mtr);`（`storage/innobase/btr/btr0pcur.cc:307`，`btr_pcur_t::move_to_next_page`）：扫描走完一页，按「下一页」到右边的叶子 | mysql-9.7.4 |
| S5 | `PAGE_DIR_SLOT_MAX_N_OWNED = 8;`、`PAGE_DIR_SLOT_MIN_N_OWNED = 4;`（`storage/innobase/include/page0page.h:73`、`:74`）：一个目录槽管 4 到 8 条记录 | mysql-9.7.4 |
| S6 | `ReadView::changes_visible`（`storage/innobase/include/read0types.h:167`、`:173`、`:182`）：事务号小于快照下限或是自己的，可见；不小于上限，不可见；在两者之间时，拍快照时还在进行的（在活跃列表里）不可见 | mysql-9.7.4 |
| S7 | `trx_flush_log_if_needed_low`（`storage/innobase/trx/trx0trx.cc:1743` 一带）：`innodb_flush_log_at_trx_commit` 为 1 时提交要把 redo 写出并刷到磁盘，为 2 时只写不刷 | mysql-9.7.4；配置实查为 1 |

## 史实

| 编号 | 事实 | 出处与状态 |
|---|---|---|
| H1 | InnoDB 由芬兰的 Innobase Oy 开发；2005 年 10 月 Oracle 宣布收购 Innobase | 旧表 I24：Oracle 新闻稿经 pgsql-advocacy 邮件列表转载（2005-10-07），Oracle 官网新闻列表有同名标题；原站全文未取得。只用「2005 年 Oracle 收购」一句 |
| H2 | MySQL 5.5.5（2010-07-06）起，InnoDB 取代 MyISAM 成为默认存储引擎；5.5 系列正式版 5.5.8（2010-12-03） | 旧表 I39：MySQL 5.5 发布说明原文（官方 PDF）；与 MyISAM 一集 FACTS「时间轴的年份」一致 |

## 逐章

逐句的出处编号写在 `src/js/script.js` 每一句的行尾注释里（第 2 稿 R10）；没有注释的句子是叙述、过渡或复述前面已有出处的内容。
