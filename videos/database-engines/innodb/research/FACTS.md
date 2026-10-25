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
| 2026-10-25 补充取证（第 4 稿） | 手册页面当日直连 `dev.mysql.com/doc/refman/9.7/en/<页名>.html` 抓取，存 `research/_src/manual_974/`；整本手册 PDF `refman-9.7-en.a4.pdf`（扉页「It documents MySQL 9.7 (9.7.4)」）只用于全文检索，存 `research/_src/refman_974/`；源码按文件从 `raw.githubusercontent.com/mysql/mysql-server/mysql-9.7.4/` 取，存 `research/_src/src_974/`，另按同一标签稀疏克隆 `storage/innobase/`（提交 `780b506e8296a61f2a7067bf2087d32c78e0bb76`）做全文检索，两者内容一致（只差 Windows 换行）；页类型另用官方 zip 自带的 `innochecksum` 9.7.4 核对。各文件 SHA-256 见「官方手册与源码（续）」末尾的来源表。摘句与源码行号用临时脚本逐条核对（每句在页面里恰好出现一次、每行能定位），本次未新增 lab 脚本 | 本表 F 节、M35–M69、S8–S22 |

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

### F 文件与页（2026-10-25 补，解析已有实验产物）

不重跑实验，只解析已经存下的产物：01 存下的 `users.ibd`、`users_big.ibd` 副本（`research/_src/v974_users.ibd`、`v974_users_big.ibd`，SHA-256 与 `out_01.json` 记录一致：`f50d690a…ab39`、`b6b03531…b5ec`），以及各次实验留在 `out/lab/<run>/data/` 的数据目录（生成物，不入库；重跑对应 lab 脚本即可再得到）。解析用临时脚本，方法写在每条里，可照做复查；`innochecksum` 只读不写，且在副本上运行。

| 编号 | 事实 |
|---|---|
| F1 | `users.ibd` 前六页的页类型（每页偏移 24 的 2 字节，按 S18 的常量对照）：页 0 = 8 `FIL_PAGE_TYPE_FSP_HDR`（表空间头），页 1 = 5 `FIL_PAGE_IBUF_BITMAP`（change buffer 位图），页 2 = 3 `FIL_PAGE_INODE`（段的索引节点页），页 3 = 17853 `FIL_PAGE_SDI`（表结构字典 SDI 的索引页，第 0 层，2 条记录），页 4 = 17855 `FIL_PAGE_INDEX`（主键树根，索引号 154，第 1 层，21 条），页 5 = 17855（姓名索引树根，索引号 155，第 1 层，16 条）。`users_big.ibd` 的页 0–3 类型相同。官方 `innochecksum --page-type-dump`（9.7.4）对同一文件给出：`0 File Space Header`、`1 Insert Buffer Bitmap`、`2 Inode page`、`3 SDI Index page`（index id=18446744073709551615, page level=0, No. of records=2）、`4 Index page`（index id=154, page level=1, No. of records=21）、`5 Index page`（index id=155, page level=1, No. of records=16）；`-S` 汇总：49 页里 44 页 Index、1 页 SDI Index、1 页 Inode、1 页 Insert buffer bitmap、1 页 File Space Header、1 页 Freshly allocated |
| F2 | 页 0 的表空间头（偏移 38 起）：space id 2，大小 49 页；页 0 记着 SDI 根页号：按 `fsp_header_get_sdi_offset`（S19）算出 16 KiB 页的偏移是 10505（= 150 + 40 × 256 + 115），读到 SDI 版本 1、根页 3，与 F1 的页 3 吻合。另：页 0 偏移 8 的 4 字节是 90704（`FIL_PAGE_SRV_VERSION`，S10，即服务器版本 9.7.4），所以页 0 的这两个字段不是「上一页 / 下一页」 |
| F3 | 不只叶子相连：`users_big` 主键树（三层，T5）根页 4 下面的 5 个第 1 层页 108、109、111、116、121，页头「上一页 / 下一页」连成 108 ↔ 109 ↔ 111 ↔ 116 ↔ 121，两头 FIL_NULL；`users` 的根页 4 独占第 1 层，上一页、下一页都是 FIL_NULL。即同一层的页都左右相连（与 S10 源码注释一致），T9 说的叶子相连是其中最底一层 |
| F4 | undo 文件：每次实验的数据目录里都有 `undo_001`、`undo_002`（02–07 各次都是 16 777 216 字节 = 16 MiB；01 两次的 `undo_002` 长到 33 554 432 字节）。04 崩溃实验重启日志（`out_04.json`「server_log_recovery_lines」）有 `Using undo tablespace '.\undo_001'.`、`Using undo tablespace '.\undo_002'.`、`Opened 2 existing undo tablespaces.`。把 02 实验（`out/lab/02_txn-001/data/`）的两个 undo 文件复制出来用 `innochecksum -S` 汇总：`undo_001`（SHA-256 `b47b070b…987e`）1024 页，其中 156 页 Undo log page（`Undo page type: 120 insert, 36 update`）、128 页 System page、4 页 Inode、1 页 File Space Header、733 页尚未使用；`undo_002`（`968d29ce…642f`）153 页 Undo log page（122 insert、31 update）、128 页 System page。128 页 System page 与 M60「每个 undo 表空间最多 128 个回滚段」数目相同，它们是否就是回滚段头页没有逐页核对（推断，不进旁白） |
| F5 | 双写文件：每次实验的数据目录里都有 `#ib_16384_0.dblwr`（4 194 304 字节）与 `#ib_16384_1.dblwr`（12 582 912 字节），名字与 M65 手册举的例子相同。04 崩溃实验重启日志：先 `Using '.\#ib_16384_0.dblwr' for doublewrite`、`Double write buffer files: 2, --innodb-doublewrite-files=2, segments_per_file=2`，再 `Starting crash recovery.`、`Applying a batch of 187 redo log records ...`。04 脚本按含「doublewrite」等词（不分大小写）筛日志，日志里没有 `Recovered page … from the doublewrite buffer.`（S20 的提示）：这次强杀没有留下写坏的页，双写区没有派上用场。「写到一半」本片没有实测 |

### V 开场回顾 MyISAM 用到的事实

来自 MyISAM 一集的事实表（`../myisam/research/FACTS.md`），加上本片 G7 的 9.7.4 实测。

| 编号 | 事实 | 出处 |
|---|---|---|
| V1 | MyISAM 的一张表：数据一个文件（`.MYD`），索引一个文件（`.MYI`） | MyISAM 事实表「02」：5.5 建表后目录里是 `users.frm`、`users.MYD`、`users.MYI`；本片 G7（9.7.4） |
| V2 | MyISAM 的索引是 B 树，每一项是「键 + 这一行在数据文件里的位置（行号）」，主键与普通索引都是这样 | MyISAM 事实表「06」：每项 = 4 字节键 + 6 字节行号；两个 `keydef` 都是 B 树 |
| V3 | MyISAM 不能回滚：ROLLBACK 后数据留在改过的样子，只回警告 1196 | 本片 X2 |
| V4 | MyISAM 锁整张表：读锁共享、写锁独占，一个连接在写，其他连接都要等 | MyISAM 事实表「08」（`mysys/thr_lock.c`）与 9.7.4 实测：读整表时两个修改都处于「Waiting for table level lock」 |
| V5 | MyISAM 不记日志；上次没正常关闭的表要 CHECK TABLE 检查、REPAIR TABLE 修复 | MyISAM 事实表「09」 |
| V6 | MyISAM 自 MySQL 3.23 加入；3.23 作为正式版在 2001 年初发布（`mysql-3.23.31` 标签的提交日期 2001-01-17）。时间轴上 MyISAM 当默认引擎的那一段从 2001 年画起 | MyISAM 事实表「时间轴的年份」与「a9a」 |

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

## 官方手册与源码（续：2026-10-25 补）

手册页面 2026-10-25 直接抓取（MySQL 9.7 参考手册，页面地址 `https://dev.mysql.com/doc/refman/9.7/en/<页名>.html`；PostgreSQL 页面 `https://www.postgresql.org/docs/18/<页名>.html`），核查日期同日。页面一栏注「Dxx 同句」的，表示 2026-10-09 的快照里也有一字不差的同一句。英文照录；摘句中省略处用「…」，两段之间用「/」。源码行号对应标签 `mysql-9.7.4`。

| 编号 | 原文摘句 | 页面或文件 |
|---|---|---|
| M35 | B-tree: A tree data structure that is popular for use in database indexes. The structure is kept sorted at all times, enabling fast lookup for exact matches (equals operator) and ranges (for example, greater than, less than, and BETWEEN operators). This type of index is available for most storage engines, such as InnoDB and MyISAM.（手册词汇表只有「B-tree」条目；整本 9.7.4 手册 PDF 检索 `B+tree`、`B+-tree`、`B+ tree` 均为 0 处，「B-tree」89 处） | glossary；全文检索用 refman-9.7-en.a4.pdf |
| M36 | Index records are stored in the leaf pages of their B-tree or R-tree data structure. | innodb-physical-structure（D02 同句） |
| M37 | Two segments are allocated for each index in InnoDB. One is for nonleaf nodes of the B-tree, the other is for the leaf nodes. Keeping the leaf nodes contiguous on disk enables better sequential I/O operations, because these leaf nodes contain the actual table data. | innodb-file-space（17.11.2） |
| M38 | READ UNCOMMITTED: SELECT statements are performed in a nonlocking fashion, but a possible earlier version of a row might be used. Thus, using this isolation level, such reads are not consistent. This is also called a dirty read. Otherwise, this isolation level works like READ COMMITTED. | innodb-transaction-isolation-levels（D18 同句） |
| M39 | READ COMMITTED: Each consistent read, even within the same transaction, sets and reads its own fresh snapshot. / Because gap locking is disabled, phantom row problems may occur, as other sessions can insert new rows into the gaps. | 同上（D18 同句） |
| M40 | REPEATABLE READ …（承 M19「Consistent reads within the same transaction read the snapshot established by the first read.」）For other search conditions, InnoDB locks the index range scanned, using gap locks or next-key locks to block insertions by other sessions into the gaps covered by the range.（「other」指唯一索引上的唯一查找条件以外的情况；唯一查找只锁找到的那条记录） | 同上（D18 同句） |
| M41 | SERIALIZABLE: This level is like REPEATABLE READ, but InnoDB implicitly converts all plain SELECT statements to SELECT ... FOR SHARE if autocommit is disabled. | 同上（D18 同句） |
| M42 | dirty read: An operation that retrieves unreliable data, data that was updated by another transaction but not yet committed. It is only possible with the isolation level known as read uncommitted. | glossary |
| M43 | non-repeatable read: The situation when a query retrieves data, and a later query within the same transaction retrieves what should be the same data, but the queries return different results (changed by another transaction committing in the meantime). / Among different isolation levels, non-repeatable reads are prevented by the serializable read and repeatable read levels, and allowed by the consistent read, and read uncommitted levels.（原文把「consistent read」当一个级别名列出，没有写 READ COMMITTED） | glossary |
| M44 | phantom: A row that appears in the result set of a query, but not in the result set of an earlier query. / Among different isolation levels, phantom reads are prevented by the serializable read level, and allowed by the repeatable read, consistent read, and read uncommitted levels. / REPEATABLE READ: … It prevents any rows that are queried from being changed by other transactions, thus blocking non-repeatable reads but not phantom reads.（词汇表这两处是一般说法，与 M46 的 InnoDB 专门说明不一致，见下文「按题整理」2） | glossary |
| M45 | READ COMMITTED: … Transactions cannot see uncommitted data from other transactions, but they can see data that is committed by another transaction after the current transaction started. | glossary |
| M46 | By default, InnoDB operates in REPEATABLE READ transaction isolation level. In this case, InnoDB uses next-key locks for searches and index scans, which prevents phantom rows (see Section 17.7.4, “Phantom Rows”).（M11 的全句） / To prevent phantoms, InnoDB uses an algorithm called next-key locking that combines index-row locking with gap locking. / If one session has a shared or exclusive lock on record R in an index, another session cannot insert a new index record in the gap immediately before R in the index order. / … This may cause phantom problems because other sessions can insert new rows into the gaps when gap locking is disabled. | innodb-locking（D05 同句）；innodb-next-key-locking（17.7.4 Phantom Rows） |
| M47 | The snapshot of the database state applies to SELECT statements within a transaction, not necessarily to DML statements.（限定条件：可重复读的快照只管普通 SELECT） | innodb-consistent-read（D04 同句） |
| M48 | SQL-92 的表 9「SQL-transaction isolation levels and the three phenomena」：READ UNCOMMITTED 下 P1（Dirty read）、P2（Non-repeatable read）、P3（Phantom）都 Possible；READ COMMITTED 下 P1 Not Possible，P2、P3 Possible；REPEATABLE READ 下 P1、P2 Not Possible，P3 Possible；SERIALIZABLE 下三者都 Not Possible | 其他来源（不是 MySQL 文档）：卡内基梅隆大学个人主页保存的 ISO/IEC 9075 草案文本「Proposed revised text of DIS 9075, July 1992」第 4.28 节，`http://www.contrib.andrew.cmu.edu/~shadow/sql/sql1992.txt`；表格是文本排版，有错位（如「Possib\|e」），按原文逐格读出 |
| M49 | When deadlock detection is enabled (the default), InnoDB automatically detects transaction deadlocks and rolls back a transaction or transactions to break the deadlock. InnoDB tries to pick small transactions to roll back, where the size of a transaction is determined by the number of rows inserted, updated, or deleted. | innodb-deadlock-detection（17.7.5.2） |
| M50 | A deadlock is a situation in which multiple transactions are unable to proceed because each transaction holds a lock that is needed by another one. Because all transactions involved are waiting for the same resource to become available, none of them ever releases the lock it holds. / If deadlock detection is disabled using the innodb_deadlock_detect variable, InnoDB relies on the innodb_lock_wait_timeout setting to roll back transactions in case of a deadlock. | innodb-deadlocks（D13 同句） |
| M51 | … TOO DEEP OR LONG SEARCH IN THE LOCK TABLE WAITS-FOR GRAPH, WE WILL ROLL BACK FOLLOWING TRANSACTION, this indicates that the number of transactions on the wait-for list has reached a limit of 200.（手册里唯一出现「WAITS-FOR GRAPH」的地方。9.7.4 的 `storage/innobase` 源码里查不到「TOO DEEP」这句提示，也没有 200 的上限，与 S12–S13 的现行检测方式对不上，疑为旧版算法的说明；只作线索，不进成片） | innodb-deadlock-detection |
| M52 | The buffer pool is managed as a list using a variation of the LRU algorithm. When room is needed to add a new page to the buffer pool, the least recently used page is evicted and a new page is added to the middle of the list. This midpoint insertion strategy treats the list as two sublists: / At the head, a sublist of new (“young”) pages that were accessed recently / At the tail, a sublist of old pages that were accessed less recently | innodb-buffer-pool（D09 同句） |
| M53 | The midpoint of the list is the boundary where the tail of the new sublist meets the head of the old sublist. / When InnoDB reads a page into the buffer pool, it initially inserts it at the midpoint (the head of the old sublist). / Accessing a page in the old sublist makes it “young”, moving it to the head of the new sublist. / Eventually, a page that remains unused reaches the tail of the old sublist and is evicted. | 同上（D09 同句） |
| M54 | All newly read pages are inserted at a location that by default is 3/8 from the tail of the LRU list. / The default value of innodb_old_blocks_pct is 37, corresponding to the original fixed ratio of 3/8. | innodb-performance-midpoint_insertion（17.8.3.3） |
| M55 | Free buffers: The total size in pages of the buffer pool free list. / Database pages: The total size in pages of the buffer pool LRU list. / Old database pages: The total size in pages of the buffer pool old LRU sublist.（InnoDB Standard Monitor 字段说明） / flush list: An internal InnoDB data structure that tracks dirty pages in the buffer pool: that is, pages that have been changed and need to be written back out to disk. / Each buffer pool manages its own free lists, flush lists, LRUs, and all other data structures connected to a buffer pool. | innodb-buffer-pool（D09 同句）；glossary；innodb-multiple-buffer-pools |
| M56 | InnoDB is a multi-version storage engine. It keeps information about old versions of changed rows to support transactional features such as concurrency and rollback. This information is stored in undo tablespaces in a data structure called a rollback segment. / InnoDB uses the information in the rollback segment to perform the undo operations needed in a transaction rollback. It also uses the information to build earlier versions of a row for a consistent read. | innodb-multi-versioning（D03 同句） |
| M57 | The roll pointer points to an undo log record written to the rollback segment. If the row was updated, the undo log record contains the information necessary to rebuild the content of the row before it was updated. / Also, a deletion is treated internally as an update where a special bit in the row is set to mark it as deleted. | 同上（D03 同句） |
| M58 | Undo logs in the rollback segment are divided into insert and update undo logs. Insert undo logs are needed only in transaction rollback and can be discarded as soon as the transaction commits. Update undo logs are used also in consistent reads … | 同上（D03 同句） |
| M59 | An undo log record contains information about how to undo the latest change by a transaction to a clustered index record. If another transaction needs to see the original data as part of a consistent read operation, the unmodified data is retrieved from undo log records. Undo logs exist within undo log segments, which are contained within rollback segments. Rollback segments reside in undo tablespaces and in the global temporary tablespace. | innodb-undo-logs（D08 同句） |
| M60 | Two default undo tablespaces are created when the MySQL instance is initialized. / Default undo tablespace data files are named undo_001 and undo_002. / The initial undo tablespace size is normally 16MiB. / Each undo tablespace and the global temporary tablespace individually support a maximum of 128 rollback segments. | innodb-undo-tablespaces（17.6.3.4）；末句 innodb-undo-logs（D08 同句） |
| M61 | InnoDB stores SDI data within its tablespace files.（SDI = serialized dictionary information，表结构的序列化副本） | serialized-dictionary-information |
| M62 | If there is an operating system, storage subsystem, or unexpected mysqld process exit in the middle of a page write, InnoDB can find a good copy of the page from the doublewrite buffer during crash recovery.（M16、M33 所在的整句） / （DETECT_AND_RECOVER）With this setting, the doublewrite buffer is fully enabled, with database page content written to the doublewrite buffer where it is accessed during recovery to fix incomplete page writes. / With the DETECT_ONLY setting, only metadata is written to the doublewrite buffer. Database page content is not written to the doublewrite buffer, and recovery does not use the doublewrite buffer to fix incomplete page writes. | innodb-doublewrite-buffer（D10 同句） |
| M63 | torn page: An error condition that can occur due to a combination of I/O device configuration and hardware failure. If data is written out in chunks smaller than the InnoDB page size (by default, 16KB), a hardware failure while writing could result in only part of a page being stored to disk. The InnoDB doublewrite buffer guards against this possibility. | glossary |
| M64 | If there is an operating system, storage subsystem, or unexpected mysqld process exit in the middle of a page write (causing a torn page condition), InnoDB can later find a good copy of the page from the doublewrite buffer during recovery. / doublewrite buffer: … Only after the write and the flush to the doublewrite buffer have completed, does InnoDB write the pages to their proper positions in the data file. | innodb-disk-io（17.11.1）；glossary |
| M65 | By default, two doublewrite files are created for each buffer pool instance: A flush list doublewrite file and an LRU list doublewrite file. / （16 KiB 页、一个缓冲池实例时的文件名）#ib_16384_0.dblwr #ib_16384_1.dblwr | innodb-doublewrite-buffer（D10 同句） |
| M66 | During normal operations, the redo log encodes requests to change table data that result from SQL statements or low-level API calls. / Data that is written to redo log files is encoded in terms of records affected, and this data is collectively referred to as redo. | innodb-redo-log（D06 同句） |
| M67 | PostgreSQL is an object-relational database management system (ORDBMS) based on POSTGRES, Version 4.2, developed at the University of California at Berkeley Computer Science Department. / PostgreSQL is an open-source descendant of this original Berkeley code. It supports a large part of the SQL standard and offers many modern features: | PostgreSQL 18 文档 intro-whatis（1. What Is PostgreSQL?） |
| M68 | The object-relational database management system now known as PostgreSQL is derived from the POSTGRES package written at the University of California at Berkeley. / The implementation of POSTGRES began in 1986. / In 1994, Andrew Yu and Jolly Chen added an SQL language interpreter to POSTGRES. | PostgreSQL 18 文档 history（2. A Brief History of PostgreSQL；K9 同页） |
| M69 | PostgreSQL supports most of the major features of SQL:2023. Out of 177 mandatory features required for full Core conformance, PostgreSQL conforms to at least 170. | PostgreSQL 18 文档 features（Appendix D. SQL Conformance） |
| S8 | InnoDB 源码里有「B+Tree」的叫法，共 6 处、4 个文件，例如 `/** The core idea is to find the left and right paths down the B+Tree.`（`include/row0pread.h:58`，并行读）、`/** Load the sorted data into the B+Tree.`（`include/ddl0impl-builder.h:176`，建索引）、`ib::error(ER_IB_MSG_938) << "No B+Tree found in tablespace";`（`row/row0import.cc:822`，导入表空间的报错）、`/* Do a breadth first traversal of the B+Tree using recursion.`（`row/row0pread.cc:1200`）。同一目录里「B-tree」出现 386 处（91 个文件） | mysql-9.7.4，`storage/innobase/` 全文检索 |
| S9 | `btr/btr0btr.cc` 文件头 `The B-tree`（:30，`Created 6/2/1994 Heikki Tuuri`）；注释（:114–121）：`Leaf pages of a B-tree contain the index records stored in the tree. On levels n > 0 we store 'node pointers' to pages on level n - 1. For each page there is exactly one node pointer stored: thus the our tree is an ordinary B-tree, not a B-link tree.` / `A node pointer contains a prefix P of an index record. … The file page number of the child page is added as the last field.`（B-link tree 是另一种变体，这句不是在否认 B+ 树） | mysql-9.7.4 |
| S10 | `include/fil0types.h:56–61`（`FIL_PAGE_NEXT` 的注释与定义）：`B-tree index pages(FIL_PAGE_TYPE contains FIL_PAGE_INDEX) on the same PAGE_LEVEL are maintained as a doubly linked list via FIL_PAGE_PREV and FIL_PAGE_NEXT in the collation order of the smallest user record on each page.`；:53–54 `/** On page 0 of the tablespace, this is the server version ID */ constexpr uint32_t FIL_PAGE_SRV_VERSION = 8;` | mysql-9.7.4；实测见 T9、F2、F3 |
| S11 | 一笔事务要等锁时记下挡住它的那笔事务：`static void lock_create_wait_for_edge(…)`（`lock/lock0lock.cc:1406`）里 `waiter->lock.blocking_trx.store(blocker);`（:1421）；死锁检测开关缺省为开：`bool innobase_deadlock_detect = true;`（:71） | mysql-9.7.4 |
| S12 | `lock_wait_build_wait_for_graph`（`lock/lock0wait.cc:650`）的注释（:643–644）：`builds a (subset of) list of edges from waiting transactions to blocking transactions, such that for each waiter we have one outgoing edge.`；事务进入等待槽位时调用 `lock_wait_request_check_for_cycles();`（:188），唤醒后台线程去查环 | mysql-9.7.4 |
| S13 | `lock_wait_find_and_handle_deadlocks`（:1265）的注释：`it identifies and handles all cycles in the wait-for graph`（:1251–1252）；沿每个等待者唯一的出边走，走回本轮已访问过的点就是 `/* found a candidate cycle! */`（:1303）；`lock_wait_check_candidate_cycle`（:1164）先核实环上的事务仍在等，再 `trx_t *const chosen_victim = lock_wait_choose_victim(cycle_ids, infos);`（:1225）；后台线程 `lock_wait_timeout_thread`（:1432）的注释 `analyzes wait-for-graph changes, checks for deadlocks and resolves them`（:1430），开关开时调用 `lock_wait_find_and_handle_deadlocks(infos, outgoing, new_weights);`（:1425） | mysql-9.7.4 |
| S14 | 选受害者 `lock_wait_choose_victim`（`lock/lock0wait.cc:917`）：`if (trx_weight_ge(chosen_victim, trx)) { /* The joining transaction is 'smaller', choose it as the victim and roll it back. */`（:949–950）；事务的「重量」`TRX_WEIGHT`（`include/trx0trx.h:1248–1253`）：`The weight of one transaction is estimated as the number of altered rows + the number of locked rows.`，实现为 `return t->undo_no + UT_LIST_GET_LEN(t->lock.trx_locks);`；`trx_weight_ge`（`trx/trx0trx.cc:2877–2904`）：改过非事务表（如 MyISAM）的事务算更重，`Transactions that have edited non-transactional tables are considered heavier than ones that have not.`；另有高优先级事务的仲裁（:936） | mysql-9.7.4 |
| S15 | `buf/buf0buf.cc` 的「Lists of blocks」注释：`The free list (buf_pool->free) contains blocks which are currently not used.`（:196）/ `The common LRU list contains all the blocks holding a file page except those for which the bufferfix count is non-zero. The pages are in the LRU list roughly in the order of the last access to the page, so that the oldest pages are at the end of the list.`（:199–203）/ `The chain of modified blocks (buf_pool->flush_list) contains the blocks holding file pages that have been modified in the memory but not written to disk yet. The block with the oldest modification which has not yet been written to disk is at the end of the chain.`（:222–225） | mysql-9.7.4 |
| S16 | 从磁盘读进来的页放进 LRU 的旧段：`buf_page_init_for_read`（`buf/buf0buf.cc:4889`）里 `/* The block must be put to the LRU list, to the old blocks */ buf_LRU_add_block(bpage, true /* to old blocks */);`（:4987–4988）；`buf_LRU_add_block_low`（`buf/buf0lru.cc:1656`）：链短于 `BUF_LRU_OLD_MIN_LEN` 时放链头，否则 `UT_LIST_INSERT_AFTER(buf_pool->LRU, buf_pool->LRU_old, bpage);`（:1664、:1678）；`constexpr uint32_t BUF_LRU_OLD_MIN_LEN = 8 * 1024 / 16;`（`include/buf0lru.h:59`，512 页 = 8 MiB）；旧段比例初值 `buf_LRU_old_ratio_update(100 * 3 / 8, false);`（`buf/buf0buf.cc:1596`） | mysql-9.7.4 |
| S17 | `buf_LRU_get_free_block`（`buf/buf0lru.cc:1311`）的注释（:1287–1293）：`The block is taken off the free list. If free list is empty, blocks are moved from the end of the LRU list to the free list. … Note that we only ever get a block from the free list.` | mysql-9.7.4 |
| S18 | 页类型常量（`include/fil0fil.h`）：`FIL_PAGE_INDEX = 17855`（:1248，`B-tree node`）、`FIL_PAGE_SDI = 17853`（:1254，`Tablespace SDI Index page`）、`FIL_PAGE_INODE = 3`（:1263，`Index node`）、`FIL_PAGE_IBUF_BITMAP = 5`（:1273，`Insert buffer bitmap`）、`FIL_PAGE_TYPE_FSP_HDR = 8`（:1282，`File space header`） | mysql-9.7.4 |
| S19 | 固定位置的页（`include/fsp0types.h:150–160`）：`The pages at FSP_XDES_OFFSET and FSP_IBUF_BITMAP_OFFSET are repeated every XDES_DESCRIBED_PER_PAGE pages in every tablespace.`；`FSP_XDES_OFFSET = 0`（extent descriptor）、`FSP_IBUF_BITMAP_OFFSET = 1`（insert buffer bitmap）、`FSP_FIRST_INODE_PAGE_NO = 2`（`in every tablespace`）。SDI 根页不是固定常量，而是记在页 0 里：`fsp_sdi_get_root_page_num` 读 `page_no_t root = mach_read_from_4(page + sdi_offset + 4);`（`fsp/fsp0fsp.cc:3926`），偏移由 `fsp_header_get_sdi_offset` 计算（`include/fsp0fsp.ic:384–386`） | mysql-9.7.4；实测见 F1、F2 |
| S20 | 崩溃恢复一开始就先用双写区修页：`recv_init_crash_recovery`（`log/log0recv.cc:3745`）里 `recv_sys->dblwr->recover();`（:3754），之后才启动重做。`recv::Pages::recover`（`buf/buf0dblwr.cc:3162`）逐一取出双写文件里存着副本的页，对每一页调用 `dblwr_recover_page`（:3022）：读出数据文件里的同一页，`/* Is the page read from the data file corrupt? */`（:3067），坏了就提示 `Trying to recover it from the doublewrite file.`（:3074）并 `/* Write the good page from the doublewrite buffer to the intended position. */`（:3134），记 `Recovered page … from the doublewrite buffer.`（:3143）；页没坏则 `/* Database page is fine.  No need to restore from dblwr. */`（:3110） | mysql-9.7.4 |
| S21 | 重做是在页的现有内容上补：`recv_recover_page_func`（`log/log0recv.cc:2430`）的注释 `Applies the hashed log records to the page, if the page lsn is less than the lsn of a log record.`（:2416–2417）；先 `lsn_t page_lsn = mach_read_from_8(page + FIL_PAGE_LSN);`（:2560）读页头里的 LSN，只有 `recv->start_lsn >= page_lsn` 的记录才应用（:2632） | mysql-9.7.4 |
| S22 | 间隙锁只在可重复读与可串行化下加：`bool skip_gap_locks() const`（`include/trx0trx.h:1113–1121`）对 `READ_UNCOMMITTED`、`READ_COMMITTED` 返回 true，对 `REPEATABLE_READ`、`SERIALIZABLE` 返回 false；`row/row0sel.cc:4320` 据此 `if (!set_also_gap_locks \|\| trx->skip_gap_locks() \|\| …` 只锁记录、不锁间隙 | mysql-9.7.4 |

来源文件（2026-10-25 取得）：

| 文件 | SHA-256 |
|---|---|
| manual_974/glossary.html | `77b5cdf8b46686eb5e121285d4298d63636ff05a61b073a5c5dee508508fba30` |
| manual_974/innodb-transaction-isolation-levels.html | `777489370f15415090c75fb41e4a225a43494fe03f9c9a7e35807875b4c5c6c2` |
| manual_974/innodb-locking.html | `1486d741504b5637d44b7126fac49d418f3b99a582bae5d9d084b49e33695c0f` |
| manual_974/innodb-next-key-locking.html | `f907981cbf97a74797ffe12176c95552879d8b206c1559aeaa247ea920439988` |
| manual_974/innodb-consistent-read.html | `e2590b71130e3a395e16a093c55d4eb29a2c78e84c9e28518964b3d66a11ac6a` |
| manual_974/innodb-deadlocks.html | `04600813aaa7f34c435cf6af912b1cf085107310dbed2c72d0727c4ecc98165e` |
| manual_974/innodb-deadlock-detection.html | `51870e27242a0d1965e7954a6e43eb41831bc83096214161e600c3e81dc1a84a` |
| manual_974/innodb-buffer-pool.html | `15d4d887b278c71d9a2f442f316c5eddf1f895a9a1844685aa109baa50649144` |
| manual_974/innodb-performance-midpoint_insertion.html | `c3ba5dfef6d3c1e36ed6b41f972c1d726501c7c69e4ae4b971990c3192fdc1ed` |
| manual_974/innodb-multiple-buffer-pools.html | `233af601d89d67245a1263a35d4b12d518661487a061e50bc7014a5cb27d3341` |
| manual_974/innodb-multi-versioning.html | `f0f9695f0375b9fbd4c2c2c2ebba264a6f351945cc282e342ae3d63028681795` |
| manual_974/innodb-undo-logs.html | `667f77e3fec3a415ec963ee5e3c9cab3ecef3acf5ff32afd3e35b44aaf920ff2` |
| manual_974/innodb-undo-tablespaces.html | `a589cbd8cafe5f0ff817e14b0b1b3da3438c8468e5633d1ccadf44338921321f` |
| manual_974/innodb-physical-structure.html | `e4260e2fa1585876a8365af6ad8e12ed792b66a55fa9702a0f75bcb4266d935a` |
| manual_974/innodb-file-space.html | `1b455435dafae20c2895abbf760257900f3c4cfdcd285ef698e05e310d0bef5e` |
| manual_974/serialized-dictionary-information.html | `3573be6b4921491d47ead8ecc225cccff1fcd66ec2e2769dfaa893c7ad521da8` |
| manual_974/innodb-doublewrite-buffer.html | `9a97775ff8c06806b9c3566faabcf5aabd9818a5f96643b6b6ebed6665c49e59` |
| manual_974/innodb-disk-io.html | `b786b01ca929d32a8c85ced95f0d1649570462562addc9b5e8bc0c9f1e139e94` |
| manual_974/innodb-redo-log.html | `381ad7bff0cf2585d7f71e5d02ef1a56e4b895ab31950f2afa28544aacc50451` |
| manual_974/pg-intro-whatis.html | `5e916d7a5798b3b4f8edd6069f64a7f4f212f008249b46f5b578d055f92ecaeb` |
| manual_974/pg-history.html | `bd4f7c61fb5702011b4a2eb97959fa9e86e25fea1183c135fcef0715a98887d2` |
| manual_974/pg-features.html | `fdfe24cd58045479c43e172899df6a27c4a080847dfda36e58e5e4724d1fe5da` |
| refman_974/refman-9.7-en.a4.pdf（`https://downloads.mysql.com/docs/refman-9.7-en.a4.pdf`） | `61addb50e0f244a99e4205b1811f3d11a034c14b7c5df96cd4b68df0cf629771` |
| web_sql92/sql1992.txt（M48） | `4817caeff431bec4cb49589384b645aa5742a56a280cba01c321d98b4ff11f95` |
| src_974/…btr0btr.cc | `2ea9a3782bc842ae68ab9df988f0a7ebbeeddccb0ddf5c0746cd95cf1e6d9568` |
| src_974/…include__fil0types.h | `8b1186b13d58a5fd22533c05c7c86c174ab1a0037c70227f955c00d27b26d6c3` |
| src_974/…include__fil0fil.h | `a58e8941766e997b16147f64e38ccbab63300139db21d3d3777953ad8c98b2ec` |
| src_974/…include__fsp0types.h | `59f1eadceb4fd9ab9c130b2b5ba73906ac5a7cf8f91fd7caadd659907b22f9ea` |
| src_974/…fsp__fsp0fsp.cc | `2876b7e3b3c91cf589e28238bfea68c22137654e905885bb88e82005148e70a1` |
| src_974/…include__fsp0fsp.ic | `3b89631f0054b7ccfd9dd00ca98632400c7e5ac4f5ef0fcd1dad394488f2ba1f` |
| src_974/…lock__lock0lock.cc | `fd84722a6e907846cc03e4a064dfcb04eac97a6b9838bc1d7bb1407b8b668af4` |
| src_974/…lock__lock0wait.cc | `784a20f7e9a350a5e419ed942f0402662de0d376dbcf875c5ab9b642ae119813` |
| src_974/…include__trx0trx.h | `3948bc70ace9d5c0a2f50cb77bcc1ec46585e462d5a6a77d662c2aa854dbd6d0` |
| src_974/…trx__trx0trx.cc | `7b070ea4f2719ec317d8c9988d4f1f0a0a7d47bf88dfd3a7cbb724b54e21c360` |
| src_974/…row__row0sel.cc | `e0068c8c53faf82608df123af8d65791c741a7fa60fd8a758f27646541186dd8` |
| src_974/…buf__buf0buf.cc | `1a028fdc7a5c2e54fa62305b1d5f07518ad0f5703ed3e214c5f183600f12e8d5` |
| src_974/…buf__buf0lru.cc | `95c57f5944c18d3a62d4c0e59a15f2a6d4855faf7d72d3aa7f02453a6abb0fb3` |
| src_974/…include__buf0lru.h | `0e35cf3df3cd06996a9fe728f6d20ea91935f6691938cc866bf9d11601be52cb` |
| src_974/…buf__buf0dblwr.cc | `e27c8c4500e46da036dc60794bf9f16d84afcfec2309a118735f9b1bb4ccf635` |
| src_974/…log__log0recv.cc | `8a5c7e722196c5c066795f9d33ba2c41a5deb4f9ed3f54951b7deeab287b89e7` |
| src_974/…include__row0pread.h、…row__row0pread.cc、…row__row0import.cc、…include__ddl0impl-builder.h | `8a5ab780…bb55`、`fffc7d2d…25a1`、`dc2c80d7…5409`、`af889588…ba37` |

## 按题整理（2026-10-25 补）

把上面的新编号按片中要用的说法归拢。「结论」只写出处撑得住的部分；撑不住或有限定的另写。

**1. 「B+ 树」这个叫法。** MySQL 9.7 手册不用这个词：整本 9.7.4 手册检索 0 处，InnoDB 索引只称 B-tree（M3、M35）。InnoDB 源码里有：并行读、建索引、导入表空间等处写作「B+Tree」（S8，6 处），核心的 `btr0btr.cc` 仍叫「B-tree」（S9）。「行都在叶子里」：手册 M36、M37（叶子 contain the actual table data）、源码 S9（叶页存索引记录），实测 T1–T4。「上面几层只记路标」：S9（第 n > 0 层只存 node pointer，即键前缀 + 子页号），实测 T2。「叶子相互链接」：源码 S10，实测 T9。限定：InnoDB 是**每一层**的页都左右相连（S10、F3），不只叶子，片中不要说「只有叶子相连」。「B+ 树」的教科书定义（数据只在叶子、叶子成链）本次没有取到原始文献，若旁白要下定义，可改说「InnoDB 源码里把它叫 B+Tree」。

**2. 四个隔离级别与三种现象。** MySQL 手册没有一张总表，下表由各句拼出；「实测」指本片在 9.7.4 上的结果。

| 级别 | 脏读 | 不可重复读 | 幻读 |
|---|---|---|---|
| READ UNCOMMITTED | 会（M38、M42） | 会（M38「其余同 READ COMMITTED」；M43） | 会（M38 + M39） |
| READ COMMITTED | 不会（M42、M45） | 会（M39 每次读重新拍快照；实测 X4） | 会（M39：不加间隙锁，别人能往间隙里插；S22） |
| REPEATABLE READ | 不会（M42） | 不会（M19、M43；实测 X3、G5） | InnoDB 下普通 SELECT 读同一个快照，锁定读与扫描用 next-key 锁挡住插入（M40、M46、S22；实测 X6 没有幻影） |
| SERIALIZABLE | 不会（M42） | 不会（M43） | 不会（M44；M41：普通 SELECT 变成 FOR SHARE） |

出处冲突要写明：手册词汇表的一般说法认为可重复读「blocking non-repeatable reads but not phantom reads」、「phantom reads are … allowed by the repeatable read」级别（M44），这与 SQL-92 标准表一致（M48，P3 Possible）；InnoDB 专门的说明则是可重复读下用 next-key 锁「prevents phantom rows」（M46）。所以「标准允许、InnoDB 挡住了」是两路出处都能支持的说法。限定：可重复读的快照只管普通 SELECT，不一定管 DML（M47）；混用锁定读与普通读会看到两种不同的状态（D18 原文，见 M30）。词汇表 M43、M44 里的「consistent read」级别原文就是这样写的，没有写 READ COMMITTED，引用时不要替换成 READ COMMITTED 加引号。

**3. 死锁怎么发现、选谁回滚。** 发现：每笔等锁的事务记下挡住它的那一笔（S11），后台线程把这些「谁在等谁」连成等待图，每个等待者恰好一条出边（S12），沿边走回来就是环，即死锁（S13）；事务一开始等待就会唤醒这个线程（S12），检测缺省开着（S11、M49），关掉后只能靠锁等待超时（M50）。选谁：手册说倾向回滚「小」事务，大小按插入、更新、删除的行数算（M49）；9.7.4 源码的比较是「改动的行数（undo 记录数）+ 持有的锁数」，改过非事务表的事务算更重（S14），还有高优先级事务的仲裁。两路出处在「回滚小的」上一致，在「怎么算大小」上源码多算了锁数；旁白宜只说「挑改动少的那笔回滚」。实测 X7：后加入环的 Carol 收到 1213 被回滚（两笔各只改 1 行，本次没有保存 InnoDB 选中它的具体理由）。M51 的「200 笔上限」与 9.7.4 源码对不上，不用。

**4. 缓冲池的组织。** LRU 链分新旧两段，旧段占 3/8（M15、M52–M54，`innodb_old_blocks_pct` 缺省 37）；新读进来的页插在中点，也就是旧段的头（M53、S16）；被访问就移到新段的头（M53）；一直没人用的页走到旧段的尾巴被换出（M53），换出要腾空位时从 LRU 链尾找（S17）。另两条链：free list 是没用上的空页，读页只从这里拿空位（M55、S15、S17）；flush list 是改过、还没写回磁盘的脏页，最老的修改在链尾（M55、S15）。限定：LRU 链很短（不到 512 页，例如刚启动时）新页直接放链头，不分新旧段（S16）；本片冷启动查找的实验（L1）当时链上有多少页没有记录，不能拿它演示中点插入。

**5. undo 存在哪里、记的是什么。** 记的是改之前的信息：undo 记录说明怎样撤销一笔事务对聚簇索引记录的最近一次修改，回滚靠它，一致性读要看原来的数据也从这里取（M56、M57、M59）；删除在内部当作打删除标记的更新（M57，对应实测 D2）。insert undo 提交后就能丢，update undo 还要留给一致性读（M58）。存放：undo 记录在 undo 段里，undo 段在回滚段里，回滚段在 undo 表空间（M56、M59）；初始化时建两个缺省 undo 表空间，文件名 `undo_001`、`undo_002`，初始 16 MiB（M60）。回滚指针指向 undo 记录（M57、M7；实测 X1、D2）。实测：数据目录里就是这两个文件，重启日志打开的也是它们，页里确有 undo 页（F4）。

**6. .ibd 的页 0–3。** 实测（F1，自己解析 + 官方 innochecksum 两路一致）：页 0 表空间头（FSP_HDR），页 1 change buffer 位图（IBUF_BITMAP），页 2 段的索引节点页（INODE），页 3 SDI 索引页（表结构，M61）；之后页 4、5 才是主键树与姓名索引树的根（与 T1、T4 一致）。源码：页 0–2 的位置是常量（S19），页 3 是 SDI 根页、页号记在页 0 里（S19、F2），类型值见 S18。

**7. 双写缓冲区要解决的问题。** 手册原文：页写到一半时进程退出、系统或存储出错，恢复时能从双写区找到这一页完好的副本（M62、M64）；「torn page」指数据以小于 16 KB 的块写出，硬件故障时只有一部分页落盘，双写区就是防这个的（M63）；页先写进双写区并刷盘，之后才写到数据文件里的正位（M64）。恢复时怎么用：崩溃恢复一开始，先把双写文件里存有副本的页逐一和数据文件里的同一页比对，数据文件里的那页校验不过，就把双写区里的好副本写回原位，然后才重做（S20、F5）。「为什么 redo 救不了」**手册与源码都没有直接写**（未取到原文）。能支撑的事实只有：redo 记的是对记录的修改请求，不是整页的副本（M66）；重做时按页头的 LSN 在页的现有内容上补记录（S21）。由此推出「页本身写坏了，redo 没有可以补的底子」属于推论，标「待核实」；旁白宜写成可直接核对的顺序——先用双写区的完整副本把写坏的页换回来，再在上面重做 redo。本片的崩溃实验没有出现写坏的页（F5）。

**8. PostgreSQL「另一个更老牌、更正统的关系数据库」。** 官方文档称 PostgreSQL 为「object-relational database management system (ORDBMS)」（M67、M68），即对象关系数据库；这两页都这样写，没有单说「relational database」。「老牌」：源头 POSTGRES 1986 年在伯克利开始实现（M68、K9），早于 InnoDB 源码最早的 1994 年（K6）；但加上 SQL 是 1994 年（M68），改名 PostgreSQL 是 1996 年（K9），说「更老牌」时以 POSTGRES 起算为宜。「正统」是评价，文档里没有这个说法；最接近的出处是「supports a large part of the SQL standard」（M67）与「SQL:2023 核心 177 项强制特性至少符合 170 项」（M69）。

## 史实

| 编号 | 事实 | 出处与状态 |
|---|---|---|
| H1 | InnoDB 由芬兰的 Innobase Oy 开发；2005 年 10 月 Oracle 宣布收购 Innobase | 旧表 I24：Oracle 新闻稿经 pgsql-advocacy 邮件列表转载（2005-10-07），Oracle 官网新闻列表有同名标题；原站全文未取得。只用「2005 年 Oracle 收购」一句 |
| H2 | MySQL 5.5.5（2010-07-06）起，InnoDB 取代 MyISAM 成为默认存储引擎；5.5 系列正式版 5.5.8（2010-12-03） | 旧表 I39：MySQL 5.5 发布说明原文（官方 PDF）；与 MyISAM 一集 FACTS「时间轴的年份」一致 |

## 逐章

逐句的出处编号写在 `src/js/script.js` 每一句的行尾注释里（第 2 稿 R10）；没有注释的句子是叙述、过渡或复述前面已有出处的内容。
