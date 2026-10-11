# 官方来源与源码导航

核查日期：2026-10-09。源码固定 `mysql-9.7.2` / `008e09c2834b98143a8c067d4d225c90953050cf`。完整 SHA-256 见 `sources.json`。下面的符号行号是导航命中，具体核查过的机制与边界见 `FACTS.md`；不表示对全文件完成审计。

## 官方手册

| 编号 | 章节 | 状态 |
|---|---|---|
| D01 | [17.6.2.1 Clustered and Secondary Indexes](https://dev.mysql.com/doc/refman/9.7/en/innodb-index-types.html) | fetched |
| D02 | [17.6.2.2 The Physical Structure of an InnoDB Index](https://dev.mysql.com/doc/refman/9.7/en/innodb-physical-structure.html) | fetched |
| D03 | [17.3 InnoDB Multi-Versioning](https://dev.mysql.com/doc/refman/9.7/en/innodb-multi-versioning.html) | fetched |
| D04 | [17.7.2.3 Consistent Nonlocking Reads](https://dev.mysql.com/doc/refman/9.7/en/innodb-consistent-read.html) | fetched |
| D05 | [17.7.1 InnoDB Locking](https://dev.mysql.com/doc/refman/9.7/en/innodb-locking.html) | fetched |
| D06 | [17.6.5 Redo Log](https://dev.mysql.com/doc/refman/9.7/en/innodb-redo-log.html) | fetched |
| D07 | [17.18.2 InnoDB Recovery](https://dev.mysql.com/doc/refman/9.7/en/innodb-recovery.html) | fetched |
| D08 | [17.6.6 Undo Logs](https://dev.mysql.com/doc/refman/9.7/en/innodb-undo-logs.html) | fetched |
| D09 | [17.5.1 Buffer Pool](https://dev.mysql.com/doc/refman/9.7/en/innodb-buffer-pool.html) | fetched |
| D10 | [17.6.4 Doublewrite Buffer](https://dev.mysql.com/doc/refman/9.7/en/innodb-doublewrite-buffer.html) | fetched |
| D11 | [17.6.3.2 File-Per-Table Tablespaces](https://dev.mysql.com/doc/refman/9.7/en/innodb-file-per-table-tablespaces.html) | fetched |
| D12 | [17.7.2.2 autocommit, Commit, and Rollback](https://dev.mysql.com/doc/refman/9.7/en/innodb-autocommit-commit-rollback.html) | fetched |
| D13 | [17.7.5 Deadlocks in InnoDB](https://dev.mysql.com/doc/refman/9.7/en/innodb-deadlocks.html) | fetched |
| D14 | [1.3 MySQL Releases: Innovation and LTS](https://dev.mysql.com/doc/refman/9.7/en/mysql-releases.html) | fetched |
| D15 | [Download MySQL Community Server](https://dev.mysql.com/downloads/mysql/9.7.html) | fetched |
| D16 | [MySQL 9.7 Release Notes :: Changes in MySQL 9.7.3 (2026-08-18)](https://dev.mysql.com/doc/relnotes/mysql/9.7/en/news-9-7-3.html) | fetched |
| D17 | [17.10 InnoDB Row Formats](https://dev.mysql.com/doc/refman/9.7/en/innodb-row-format.html) | fetched |
| D18 | [17.7.2.1 Transaction Isolation Levels](https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-isolation-levels.html) | fetched |
| D19 | [18.2 The MyISAM Storage Engine](https://dev.mysql.com/doc/refman/9.7/en/myisam-storage-engine.html) | fetched |

## 同版本源码

| 编号 | 文件 | 导航符号与行号 |
|---|---|---|
| C01 | [storage/innobase/include/page0types.h](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/include/page0types.h) | `PAGE_HEADER` L53, 80, 105；`PAGE_N_RECS` L74；`PAGE_LEVEL` L84；`PAGE_INDEX_ID` L87；`PAGE_NEW_INFIMUM` L119 |
| C02 | [storage/innobase/include/fil0fil.h](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/include/fil0fil.h) | `FIL_PAGE_TYPE` L1246, 1257, 1270, 1276, 1279, 1282；`FIL_PAGE_INDEX` L1248, 1354 |
| C03 | [storage/innobase/include/rem0rec.h](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/include/rem0rec.h) | `rec_get_next_offs` L70 |
| C04 | [storage/innobase/include/read0types.h](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/include/read0types.h) | `changes_visible` L163；`m_low_limit_id` L173, 208, 217, 269；`m_up_limit_id` L167, 188, 208, 249, 274 |
| C05 | [storage/innobase/read/read0read.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/read/read0read.cc) | `ReadView::prepare` L446；`MVCC::view_open` L499, 699 |
| C06 | [storage/innobase/row/row0sel.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/row/row0sel.cc) | `row_search_mvcc` L4279, 4297, 4431, 4980, 5017, 6155；`row_sel_build_prev_vers_for_mysql` L3079, 3312, 5341；`lock_clust_rec_cons_read_sees` L887, 1393, 1755, 3308, 3765, 5337 |
| C07 | [storage/innobase/row/row0vers.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/row/row0vers.cc) | `row_vers_build_for_consistent_read` L1249 |
| C08 | [storage/innobase/trx/trx0trx.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/trx/trx0trx.cc) | `trx_commit` L1723, 1735, 1754, 1935, 1991, 2038；`trx_flush_log_if_needed` L1724, 1755, 1761, 1767, 2064, 2481；`trx_assign_read_view` L2291 |
| C09 | [storage/innobase/lock/lock0lock.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/lock/lock0lock.cc) | `lock_rec_lock` L336, 371, 417, 425, 433, 441 |
| C10 | [storage/innobase/log/log0recv.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/log/log0recv.cc) | `recv_recovery_from_checkpoint_start` L159, 710, 3766；`recv_apply_hashed_log_recs` L1173, 3505, 3723 |
| C11 | [storage/innobase/trx/trx0roll.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/trx/trx0roll.cc) | `trx_rollback_or_clean_recovered` L712, 838；`trx_rollback_for_mysql` L159, 205, 257, 269 |
| C12 | [storage/innobase/handler/ha_innodb.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/handler/ha_innodb.cc) | `ha_innobase::index_read` L10430, 10622；`ha_innobase::write_row` L3195, 9256；`ha_innobase::update_row` L10010；`innobase_commit` L316, 1355, 1520, 1548, 1742, 1744 |
| C13 | [storage/innobase/dict/dict0dict.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/dict/dict0dict.cc) | `dict_index_build_internal_clust` L204, 2449, 2947；`dict_index_build_internal_non_clust` L211, 2451, 3150 |
| C14 | [storage/innobase/include/data0type.h](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/include/data0type.h) | `DATA_TRX_ID_LEN` L185, 545；`DATA_ROLL_PTR_LEN` L191, 547；`DATA_ROW_ID_LEN` L179 |
| C15 | [storage/innobase/include/mach0data.ic](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/include/mach0data.ic) | `mach_write_to_4` L126, 172, 184, 189, 331, 332；`mach_read_from_4` L139, 247, 252, 294, 300, 342 |
| C16 | [storage/innobase/btr/btr0cur.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/btr/btr0cur.cc) | `btr_cur_search_to_nth_level` L126, 129, 619, 1717, 2395, 5069；`btr_cur_optimistic_insert` L2507, 2662, 4104；`btr_cur_pessimistic_insert` L2930, 4086, 4107, 4122 |
| C17 | [storage/innobase/include/fil0types.h](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/include/fil0types.h) | `FIL_PAGE_OFFSET` L46；`FIL_PAGE_TYPE` L57, 76；`FIL_PAGE_DATA` L111, 119 |
| C18 | [storage/innobase/rem/rec.h](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/rem/rec.h) | `REC_N_NEW_EXTRA_BYTES` L159, 167, 267, 691, 801, 1032, 1072；`REC_INFO_DELETED_FLAG` L147, 319 |
| C19 | [storage/innobase/include/rem0rec.ic](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/include/rem0rec.ic) | `rec_get_next_offs` L161 |
| C20 | [storage/innobase/include/fsp0types.h](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/include/fsp0types.h) | `FSEG_PAGE_DATA` L79；`FSEG_HEADER_SIZE` L94 |
| C21 | [storage/innobase/buf/buf0buf.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/buf/buf0buf.cc) | `buf_page_get_gen` L4449, 5446, 6010, 6246 |
| C22 | [storage/innobase/buf/buf0dblwr.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/buf/buf0dblwr.cc) | `recover` L56, 203, 210, 223, 224, 248；`write_pages` L561, 573, 2249；`dblwr::write` L1117, 2481, 2614 |
| C23 | [storage/innobase/row/row0mysql.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/row/row0mysql.cc) | `row_mysql_store_col_in_innobase_format` L376, 623 |
| C24 | [storage/innobase/lock/lock0wait.cc](https://github.com/mysql/mysql-server/blob/008e09c2834b98143a8c067d4d225c90953050cf/storage/innobase/lock/lock0wait.cc) | `lock_wait_rollback_deadlock_victim` L692, 1146 |
