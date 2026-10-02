# 事实核查记录

本文件记录视频《一个数据库引擎是如何实现的？——从 MyISAM 说起》中每一项事实陈述的出处。
核查分两路进行，结论须两路一致才写入脚本：

1. **实验**：在仿真机（Windows Server 2008，`LegacyMySQL55` 服务，MySQL 5.5.62 Community Server）上建库 `myisam_demo`，执行 `lab/*.sql`，每个阶段 `FLUSH TABLES` 后把 `.frm / .MYD / .MYI` 复制出来。快照在 `lab/remote/snap_*`，回显在 `lab/remote/*.out`。
2. **源码**：MySQL 5.5.62 的 `storage/myisam/`、`sql/`、`mysys/`（`src/`，取自 `mysql/mysql-server` 的 `mysql-5.5.62` 标签）。

画面里出现的字节、偏移、页数由 `tools/gen_data.py` 从快照生成（`src/js/data.js`），不手写。`myi.py` 按 `mi_open.c` 的落盘顺序解析 `.MYI`。

## 01 引擎的位置

| 陈述 | 出处 |
|---|---|
| handler 接口的方法名 `write_row / rnd_next / index_read_map / update_row / delete_row` | `storage/myisam/ha_myisam.cc`：`ha_myisam::write_row` → `mi_write`，`rnd_next` → `mi_scan`，`index_read_map` → `mi_rkey`，`update_row` → `mi_update`，`delete_row` → `mi_delete` |
| 引擎列表 MyISAM / InnoDB / MEMORY / CSV / ARCHIVE | `SHOW ENGINES` 实测回显（`01_create.out`） |
| 5.5 之前默认引擎是 MyISAM | 官方手册：5.5.5 起默认引擎改为 InnoDB；`sql/mysqld.cc:3241-3243` 两个默认值分支 |
| InnoDB 5.5 数据在系统表空间 `ibdata` | 5.5 的 `innodb_file_per_table` 默认 OFF |

## 02 三个文件

| 陈述 | 出处 |
|---|---|
| 建表并写入 8 行后目录里有 `users.frm` 8,614 B、`users.MYD` 128 B、`users.MYI` 3,072 B | `snap_01_create` 目录列表 |
| 扩展名含义 MYData / MYIndex | 官方手册 MyISAM 一章；`include/myisam.h`：`MI_NAME_IEXT ".MYI"`、`MI_NAME_DEXT ".MYD"` |
| `.frm` 由 SQL 层维护 | `sql/unireg.cc`、`sql/table.cc`；`users.frm` 首 4 字节 `fe 01 09 09`，第 4 字节 9 = `DB_TYPE_MYISAM`（`sql/handler.h:313`） |
| 回显 `Query OK, 0 rows affected (0.14 sec)`、`Records: 8  Duplicates: 0  Warnings: 0` | `01_create.out` |

## 03 定长行

| 陈述 | 出处 |
|---|---|
| `users.MYD` 共 128 字节、无文件头、每 16 字节一行 | `snap_01_create/users.MYD` 的十六进制内容；`SHOW TABLE STATUS`：`Row_format: Fixed`、`Avg_row_length: 16` |
| 行首 1 字节为标志位：最低位表示有效，其余位是各列的 NULL 标记 | 表 `nul`（两个可空列）四行的首字节依次为 `f9 fb fd ff`；`mi_statrec.c` 以首字节是否为 0 判断删除 |
| INT 低位字节在前；CHAR(10) 以 `0x20` 补齐；TINYINT 1 字节 | 同一文件：`01 00 00 00`、`61 6c 69 63 65 20…`、`1e` |
| 第 N 行偏移 = N × 16 | 文件内容；`Max_data_length = 4503599627370495 = 16 × 2^48 − 1`（行号以 6 字节指针寻址） |

## 04 删除与空位

| 陈述 | 出处 |
|---|---|
| 删除后文件长度不变，只改写行首 7 字节：首字节 `00` + 6 字节指针 | `snap_02_delete/users.MYD`：行 2 变为 `00 ff ff ff ff ff ff 72 6f 6c …`；`mi_statrec.c` `_mi_delete_static_record` |
| 第二次删除的指针指回上一个空位 | 同文件行 5：`00 00 00 00 00 00 02 …`（指针 = 行号 2） |
| 链头记在索引文件里 | `.MYI` 状态区 `dellink`（偏移 0x34）：两次删除后为 80（= 0x50，行 5） |
| 插入先填链头空位，没有空位才追加 | `snap_03_reuse`：`ivan` 写入行 5；`snap_04_reuse2`：`judy` 写入行 2，`mallory` 追加到 0x80，文件 144 字节；`mi_write.c:65-68` |
| 全表扫描按物理顺序返回 | `04_reuse2.out` 中 `SELECT * FROM users` 的顺序为 1, 2, 10, 4, 5, 9, 7, 8, 11 |

## 05 变长行

| 陈述 | 出处 |
|---|---|
| 含 VARCHAR 的表为动态格式 | `notes` 表 `Row_format: Dynamic` |
| 三行分别占 20 / 44 / 20 字节；块头 `03 00 0b 05` = 类型、数据长 11、填充 5 | `snap_01_create/notes.MYD`；`myisamdef.h`：`MI_MIN_BLOCK_LENGTH 20`、`MI_DYN_ALIGN_SIZE 4` |
| 若按定长存放每行 205 字节 | `notes.MYI` 基础信息 `reclength = 205` |
| 改长第 1 行后被拆成两段：原块留 7 字节数据并带 8 字节指针 `→ 0x54`，其余 49 字节在文件末尾 | `snap_02_delete/notes.MYD`：`05 00 38 00 07 00…00 54 | 00 01 00 00 00 32 68`，0x54 处 `07 00 31` + `ello, this row…` |
| `OPTIMIZE TABLE` 整理碎片 | 官方手册；`ha_myisam::optimize` |
| 「多次更新之后」的碎片条 | 示意图，画面已标注「示意」 |

## 06 索引文件与 B 树

| 陈述 | 出处 |
|---|---|
| 文件头 396 字节，字段偏移：`records` 0x1c、`del` 0x24、`dellink` 0x34、`key_root[0]` 0x7c、`key_root[1]` 0x84；魔数 `fe fe 07 01` | `myi.py` 对 `users.MYI` 的解析，与 `mi_state_info_write`（`mi_open.c:870`）的顺序一致 |
| 统计总行数不必扫描 | `EXPLAIN SELECT COUNT(*) FROM users` 的 Extra 为 `Select tables optimized away`（`03_reuse.out`） |
| 页大小 1024 字节；两个索引各占一页，文件共 3072 字节 | `include/myisam.h`：`MI_KEY_BLOCK_LENGTH 1024`；`key_root` = 1024 / 2048 |
| 页头 2 字节、已用 82 字节；每项 = 4 字节键（高位在前）+ 6 字节行号 | `users.MYI` 偏移 0x400 起：`00 52 | 00 00 00 01 | 00 00 00 00 00 00 …`；`mi_key.c` 的 `HA_SWAP_KEY` 分支；`rec_reflength = 6` |
| 十万行的主键索引为 3 层：1 + 21 + 981 = 1003 页，键数 20 + 960 + 99,020 = 100,000 | `myi.walk_tree` 遍历 `users_big.MYI` |
| 顺序插入时叶子页留 101 个键，分隔键 102 上移 | 同上：中间页 @3072 的键为 102, 204, …；叶子页 @95232 含 4183…4283 |
| 主键与普通索引结构相同，存的都是行位置 | 两个 `keydef` 都是 B 树（`key_alg = 1`）；`myisamchk -dvv` 输出 |

## 07 一次查询

| 陈述 | 出处 |
|---|---|
| 路径：根页 @175104 → 中间页 @3072 → 叶子页 @95232 → 行号 4241 | `tools/gen_data.py` 输出；`research` 中的查找脚本复现 |
| 叶子项字节 `00 00 10 92 | 00 00 00 00 10 91` | 0x1092 = 4242，0x1091 = 4241 |
| 偏移 4241 × 16 = 67856，读出 `ff 92 10 00 00 75 35 39 32 32 39 39 20 20 20 3c` → 4242 / u592299 / 60 | `users_big.MYD` 对应位置的 16 字节 |
| 页内二分查找，探测顺序为下标 9 → 4 → 2 → 1 → 0 | `mi_open.c:857`：定长非压缩键使用 `_mi_bin_search`；按 `mi_search.c` 中该函数的取中方式（`mid=(start+end)/2`，不小于则 `end=mid`）对根页 20 个键手算得到 |
| 键缓存只缓存索引页，数据文件依赖操作系统缓存 | 官方手册「The MyISAM Key Cache」原文：“For index blocks, a special structure called the key cache (or key buffer) is maintained.”“For data blocks, MySQL uses no special cache. Instead it relies on the native operating system file system cache.” |

## 08 表锁

| 陈述 | 出处 |
|---|---|
| 读锁共享、写锁独占 | `mysys/thr_lock.c` |
| 数据文件中间没有空位时，插入与查询可并行 | `mi_locking.c` `mi_check_status`：`dellink == HA_OFFSET_ERROR`；`concurrent_insert` 实测为 `AUTO`；官方手册「Concurrent Inserts」：“If a MyISAM table has no holes in the data file (deleted rows in the middle), an INSERT statement can be executed to add rows to the end of the table at the same time that SELECT statements are reading rows from the table.” |
| 查询只读到它开始时的文件末尾 | `mi_locking.c` `mi_get_status`：读者取得锁时把状态复制到 `save_state` |
| 甘特图 | 示意：演示排队关系，不对应具体实测时序 |

## 09 崩溃

| 陈述 | 出处 |
|---|---|
| 一次插入的顺序：标记已修改 → 写各索引 → 写数据行 → 行数 +1 | `mi_write.c:82-157` |
| `open_count`：首次修改时 +1，正常关闭时 −1 | `mi_locking.c:505-555` 的注释与 `_mi_mark_file_changed` |
| 模拟现场：数据文件 176 字节（含新行 olivia），文件头 `records = 10`、`data_file_length = 160`、`open_count = 1` | `snap_06_crash`；做法见 `lab/run2.bat`（两次插入之间复制 `.MYI`，之后复制 `.MYD`） |
| 修复后 `open_count = 0`、`records = 11`、文件 176 字节 | `snap_07_repaired/users_crashed.MYI`（REPAIR 并 FLUSH TABLES 之后取回） |
| `SELECT … WHERE id = 13` 返回 `Empty set`；`CHECK TABLE` 五行回显；`REPAIR TABLE` 报告 `Number of rows changed from 10 to 11` | `lab/remote/06c.out`，画面逐字照录 |
| `SHOW ENGINES` 中 MyISAM 的 Transactions / XA / Savepoints 均为 NO | `01_create.out`，画面为节选并已标注 |

## 10 收束

| 陈述 | 出处 |
|---|---|
| MyISAM 自 MySQL 3.23 加入 | 官方手册 3.23/4.x 版「Storage Engines」一章：MyISAM 于 3.23.0 引入，取代 ISAM |
| 2010 年 MySQL 5.5 把默认引擎改为 InnoDB | 5.5.5（2010-07）变更，5.5 GA 于 2010-12 |
| MySQL 8.0（2018）系统表迁往 InnoDB，取消 `.frm` | 8.0 数据字典变更说明 |
| InnoDB：按主键组织的 B+ 树、16 KB 页、行级锁、MVCC、事务日志 | InnoDB 官方手册的通行表述，片中只作对照，不展开 |

## 第二轮复核（成片前）

对照成片逐句、逐画面重新核对后所做的更正：

| 位置 | 原表述 | 更正 | 依据 |
|---|---|---|---|
| 06 页内注解 | 「页内的字节序就是大小顺序」 | 改为只陈述「键按高位字节在前存放」 | 有符号整数键由 `ha_key_cmp` 解码后比较，并非逐字节比较；官方手册的说法是 “stored with the high byte first to permit better index compression” |
| 07 二分探测 | 探测下标 9 → 4 → 1 → 0 | 9 → 4 → 2 → 1 → 0 | `_mi_bin_search` 的循环逐步手算 |
| 08 小结 | 「加锁本身几乎没有开销」 | 「加锁本身的开销很小」 | 表述收紧 |
| 09 修复后 | — | 增补实测快照 `snap_07_repaired` | `open_count = 0`，`records = 11` |

外部事实另经联网复核：MyISAM 引入版本（3.23.0）、默认引擎变更（5.5.5，2010 年）、8.0 取消 `.frm` 并把系统表迁往 InnoDB、键缓存与并发插入的官方表述。

审查方式：`tools/cuesheets.sh` 取每句旁白结束瞬间的画面（110 帧）逐一比对所述内容与画面元素；`tools/sheets.sh` 每 4 秒抽帧通看；语速与停顿由脚本统计（各章 4.4～4.9 字/秒，单句最高 6.0）。

## 未采用或已放弃的说法

- 「B 树每页约 100 个键」：只对叶子页成立（实测 101），中间页为 45～60，故脚本只说「十万行，三层」。
- 「删除只改一个字节」：实际改写 7 字节，脚本已按 7 字节表述。
- 「崩溃后表无法打开」：`myisam-recover-options` 为默认值 OFF 时表仍能打开，只是结果不完整，需 `CHECK TABLE` 才报错；脚本表述为「需要检查」。
