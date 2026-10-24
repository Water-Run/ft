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
| 官方手册 | MySQL 9.7 参考手册的页面快照（2026-10-09 存，`research/_src/manual/D01–D19`；2026-10-24 本机访问 dev.mysql.com 一律 403，故用快照），SHA-256 与当时记录一致 | `out_06.json` |
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
| S1 | `constexpr size_t DATA_TRX_ID_LEN = 6;`（`storage/innobase/include/data0type.h:185`） | mysql-9.7.4 |
| S2 | `constexpr size_t DATA_ROLL_PTR_LEN = 7;`（`storage/innobase/include/data0type.h:191`） | mysql-9.7.4 |

## 史实

| 编号 | 事实 | 出处与状态 |
|---|---|---|
| H1 | InnoDB 由芬兰的 Innobase Oy 开发；2005 年 10 月 Oracle 宣布收购 Innobase | 旧表 I24：Oracle 新闻稿经 pgsql-advocacy 邮件列表转载（2005-10-07），Oracle 官网新闻列表有同名标题；原站全文未取得。只用「2005 年 Oracle 收购」一句 |
| H2 | MySQL 5.5.5（2010-07-06）起，InnoDB 取代 MyISAM 成为默认存储引擎；5.5 系列正式版 5.5.8（2010-12-03） | 旧表 I39：MySQL 5.5 发布说明原文（官方 PDF）；与 MyISAM 一集 FACTS「时间轴的年份」一致 |

## 逐章

（R9 文案写定后，按句号逐条对应到上面的编号。）
