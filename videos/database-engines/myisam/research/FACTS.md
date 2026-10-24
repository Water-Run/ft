# MyISAM（新版）：事实与实测

取证日期：**2026-10-24**。对象：**MySQL 9.7.4 LTS** 自带的 MyISAM 存储引擎，Windows 11 x64 上运行官方压缩包。编号是候选陈述，文案句号确定后在 NOTES 里对应。旧版（MySQL 5.5.62）的事实表保留在 Git 历史（提交 `2686046` 及之前），新版不沿用其数字。

## 环境与复现范围

| 项 | 实测记录 |
|---|---|
| 程序 | 官方 `mysql-9.7.4-winx64.zip`，MD5 `e05aaa40639d8548e0f68b7a70685a3b` 与下载页一致；SHA-256 见 [01](lab/out_01_environment.json) |
| 运行 | 每组实验新建数据目录（`--initialize-insecure`），只监听 127.0.0.1，root 无口令；数据目录在忽略的 `out/lab/` |
| 源码 | `github.com/mysql/mysql-server` 标签 `mysql-9.7.4` 的 17 个文件，哈希见 01；入口行号见 [08](lab/out_08_sources.json) |
| 数据 | `users(id INT PRIMARY KEY, name CHAR(50) CHARACTER SET ascii, age TINYINT UNSIGNED)`，`ENGINE=MyISAM`，姓名、年龄各一个索引；4096 行，2050 号 Alice 42 岁，其他人名 50 字节、年龄 18 + id % 63。规则与 SQLite 一集相同，生成 SQL 在 `lab_common.py` |
| 人物 | Bob、Carol、Dave 是同时连接数据库的客户端会话；实验里按人物命名 |
| 复现 | `python videos/database-engines/myisam/research/lab/run_all.py`；除 07 的中断位置随时机变化外，其余数字逐次相同 |

## 原始来源

| 来源 | 定位 |
|---|---|
| S01 | [MySQL 9.7 手册 · The MyISAM Storage Engine](https://dev.mysql.com/doc/refman/9.7/en/myisam-storage-engine.html)：基于已不再提供的 ISAM；B 树索引；有索引缓存、无数据缓存；锁粒度为表；无 MVCC；「Each MyISAM table is stored on disk in two files … .MYD (MYData) … .MYI (MYIndex). The table definition is stored in the MySQL data dictionary」；「In MySQL 9.7 … InnoDB is the default engine」；「When rows are inserted in sorted order … the index tree is split so that the high node only contains one key」；默认键块 1024 字节 |
| S02 | [9.7 手册 · Serialized Dictionary Information](https://dev.mysql.com/doc/refman/9.7/en/serialized-dictionary-information.html)：「Other storage engines store SDI data in .sdi files … in a compact JSON format」 |
| S03 | [9.7 手册 · Internal Locking Methods](https://dev.mysql.com/doc/refman/9.7/en/internal-locking.html)：「MySQL uses table-level locking for MyISAM … permitting only one session to update those tables at a time」；并发插入：「If a MyISAM table has no free blocks in the middle of the data file, rows are always inserted at the end … you can insert rows into a MyISAM table at the same time other clients are reading from it」 |
| S04 | MySQL 5.5.62 源码 `sql/mysqld.cc` 第 3236–3244 行注释：「From MySQL 5.5 onwards, the default storage engine is InnoDB (except in the embedded server, where the default continues to be MyISAM)」（旧版取证时取得的同版源码；5.5 手册与 5.5.5 发布说明的网页 2026-10-24 已下线） |
| S05 | 同版源码 9.7.4：`storage/myisam/` 的 `mi_open.cc`（文件头）、`mi_search.cc`（查找、压缩键、子块与行指针换算）、`mi_statrec.cc`（定长行的写、删、复用）、`mysys/mf_keycache.cc`（键缓存）、`mysys/thr_lock.cc`（表锁）、`mi_check.cc`；行号见 08 |

## 增：怎么放

| 编号 | 陈述 | 实测与交叉核对 | 范围与状态 |
|---|---|---|---|
| A01 | 同一个 MySQL 9.7.4 服务器里，存储引擎可以选；InnoDB 是默认，支持事务；MyISAM 不支持事务 | [01](lab/out_01_environment.json)：`information_schema.ENGINES` 中 InnoDB `DEFAULT / YES`、MyISAM `YES / NO`；S01 | 已核 |
| A02 | MySQL 5.5 起默认引擎是 InnoDB，此前是 MyISAM | S04 | 源码注释为一手依据；不说具体月份 |
| A03 | 一张 MyISAM 表在目录里是三个文件：数据 `users.MYD`（229376 字节）、索引 `users.MYI`（297984 字节）、表定义 `users_375.sdi`（4345 字节，JSON） | [02](lab/out_02_structure.json) files；S01、S02 | 已核；`.sdi` 的数字后缀是表的内部编号 |
| A04 | 每行定长 56 字节：1 字节标志 + 4 字节 id（低位在前）+ 50 字节姓名（不足补空格）+ 1 字节年龄；没有文件头，第 n 行从 n × 56 开始 | 02：`reclength` 56、文件 4096 × 56；Alice 那 56 字节 `ff 02080000 416c696365 20… 2a` | 已核；按插入顺序，Alice 是第 2049 行（从 0 数），偏移 114744 |
| A05 | 姓名、年龄、主键各是 `.MYI` 里的一棵 B 树，键块 1024 字节：主键 2 层（1 + 41 块），姓名 3 层（1 + 12 + 205 块），年龄 2 层（1 + 29 块）；每棵树 4096 项 | 02：由字节解出全部块与父子关系，`myisamchk -i -e` 报各键 Max levels 2/3/2 | 已核 |
| A06 | 这是经典 B 树：内部块里的每一项也是真正的条目（姓名 + 行号），子块指针夹在条目之间；叶块与内部块的条目合计正好 4096 | 02 trees：各层条目合计 4096；S05 `_mi_get_pack_key` 每项后跟行指针与子块指针 | 已核 |
| A07 | 姓名索引的项按与上一项的公共前缀压缩存放（「char packed stripped」） | 02 `myisamchk -dvv`：Key 2 `char packed stripped`；S05 | 已核；画面不展开压缩格式 |
| A08 | 从空表一行一行插入，叶块装满 20 个姓名后，第 21 行插入时树长高一层：新根块 5 只有一个条目 User00020，左叶 19 个、右叶 1 个；根的位置写在文件头里 | 02 growth：before 1 层 20 项，after 根 5 [User00020] → 子块 2、4；S01 顺序插入的分裂说明；文件头 `key_root` | 已核；20 只属本例的键长与 1024 字节块 |

## 查：怎么找

| 编号 | 陈述 | 实测与交叉核对 | 范围与状态 |
|---|---|---|---|
| B01 | 按姓名找 Alice：根块 260 → 内部块 62 → 叶块 43，第一项就是 Alice，给出行号 2049；行号 × 56 = 114744，到数据文件取 56 字节 | 02 name_route；S05 `_mi_dpos`（静态行：行号 × 行长） | 重建路线，已核 |
| B02 | 第一次查询从磁盘读入 3 个索引块；再查一次，索引块都已在键缓存里，读入 0 块 | [03](lab/out_03_queries.json)：`Key_reads` 3 / 0（每次先重启服务，键缓存为空） | 已核；不量操作系统缓存 |
| B03 | 数据行没有缓存：两次查询都向 `users.MYD` 读了 1 次、56 字节 | 03：performance_schema 文件读取统计 `users.MYD` 1 次 56 字节，两次相同；S01 无数据缓存 | 已核 |
| B04 | 不用索引时逐行读完数据文件：4096 次读取，共 229376 字节 | 03 scan | 已核 |
| B05 | 按主键找 2050：根块 3 → 叶块 22，同样得到行号 2049 | 02 id_route | 重建路线，已核 |

## 改、删：怎么改，怎么删

| 编号 | 陈述 | 实测与交叉核对 | 范围与状态 |
|---|---|---|---|
| C01 | Alice 改成 43：同一位置的 56 字节里只有最后一个字节 `2a` 变成 `2b`，文件大小不变 | [04](lab/out_04_update_delete.json) | 已核 |
| C02 | Alice 注销：这 56 字节的第一个字节变成 `00`，接着 6 个字节写入空位链的下一个位置（链尾 `ff ff ff ff ff ff`），其余旧字节原样留着；文件头记下删除数 1、链头 114744；文件不变小 | 04 Alice deleted；S05 `_mi_delete_static_record`（写 `'\0'` 与原链头，链头改为本行位置） | 已核 |
| C03 | Dave 注册（4097，30 岁）：新行写进同一个空位 114744，删除数回到 0，文件仍是 229376 字节 | 04 Dave inserted；S05 `_mi_write_static_record` 先取链头 | 已核 |

## 事务与并发

| 编号 | 陈述 | 实测与交叉核对 | 范围与状态 |
|---|---|---|---|
| D01 | 没有事务：`START TRANSACTION`、改成 43、`ROLLBACK` 之后仍是 43，并得到警告 1196「Some non-transactional changed tables couldn't be rolled back」；同样的语句对 InnoDB 副本回到 42 | [06](lab/out_06_no_transaction.json) | 已核 |
| D02 | Bob 读整张表的 3 秒里，Alice 和 Carol 的修改都在等待（状态「Waiting for table level lock」），Bob 读完它们才完成 | [05](lab/out_05_locks.json) 第一组：1 秒时两人等待，三人都在 3.01 秒完成；S03 | 已核；用 SLEEP 让读持续 3 秒 |
| D03 | Alice 改的 3 秒里，Bob 的读、Dave 的插入也在等待 | 05 第二组 | 已核 |
| D04 | 例外：Bob 读着的时候，Dave 往表尾追加新行不必等（0.3 秒完成），Carol 的修改仍要等 | 05 第三组；S03 并发插入（数据文件中间没有空位时） | 已核；中间有空位时这个例外不成立 |
| D05 | 只按主键取一行的查询在优化阶段就读完那一行并提前释放锁，不会挡住写 | 05 调试记录与 limits | 观察已核；画面里 Bob 的读按整表读来演示 |

## 出错怎么办

| 编号 | 陈述 | 实测与交叉核对 | 范围与状态 |
|---|---|---|---|
| E01 | 管理员给每个人的年龄加一，进行到一半时服务进程被强行结束：重启后前 155 行改了，其余 3940 行没改，Alice 仍是 42 | [07](lab/out_07_crash.json) | 已核；改到第几行随时机变化（另一次为 157） |
| E02 | 被中断后 `.MYI` 文件头的打开计数停在 1；`CHECK TABLE` 报「1 client is using or hasn't closed the table properly」，并报年龄索引与数据的校验和不一致、表损坏 | 07 open_count_after_kill、check；S05 `mi_check.cc` 校验和报错 | 已核 |
| E03 | `REPAIR TABLE` 修好了表的结构，但改了一半的数据没有回去：仍是 155 行改了 | 07 repair、after_repair | 已核 |

## 未核与不讲

未做：断电与设备持久性、`delay_key_write` 等选项、变长行与碎片、压缩表、全文索引、多表锁的顺序、并发插入在有空位时的行为细节。旧版讲过的变长行一章，新版按主线不进主讲。
