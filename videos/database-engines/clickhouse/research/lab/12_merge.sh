#!/usr/bin/env bash
# 并：为什么要合并、合并时到底发生了什么（第 2 稿补做，2026-11-08；其余实验见 01–11）。
#   1. 八个人分三批到：三个小片段，每个片段内部按编号排好，片段之间的编号是交错的；合并之后并成一个按编号排好的片段。
#   2. 片段多了，一次查询要翻每一个：同一张表里 900 个一行的片段，对比合并成一个之后，求平均年龄花多少时间。
#   3. 攒得太多会怎样：把「片段数上限」调低到 20，一行一行地插，看 ClickHouse 怎样拒绝（缺省上限是 1000 起放慢、3000 起报错）。
# 用单独的表（demo.mp、demo.many、demo.few），不动 demo.users。
source "$(dirname "$0")/lab_common.sh"
start_server

section "0. 缺省的片段数上限（system.merge_tree_settings）"
q "SELECT name, value FROM system.merge_tree_settings WHERE name IN ('parts_to_delay_insert', 'parts_to_throw_insert', 'old_parts_lifetime') ORDER BY name"

section "1. 八个人分三批到：先看三个片段，再看合并"
q "DROP TABLE IF EXISTS demo.mp SYNC"
q "CREATE TABLE demo.mp (id UInt32, name String, age UInt8) ENGINE = MergeTree ORDER BY id"
q "SYSTEM STOP MERGES demo.mp"
for v in "(8,'heidi',36),(2,'bob',25),(5,'erin',33)" "(7,'grace',28),(1,'alice',30),(4,'dave',19)" "(6,'frank',52),(3,'carol',41)"; do
  q "INSERT INTO demo.mp SETTINGS async_insert = 0 VALUES $v"
done
q "SELECT name, rows, level, active FROM system.parts WHERE database='demo' AND table='mp' ORDER BY min_block_number"
q "SELECT _part, _part_offset, id, name, age FROM demo.mp ORDER BY _part, _part_offset"
q "EXPLAIN indexes = 1 SELECT * FROM demo.mp WHERE id = 5"
q "SYSTEM START MERGES demo.mp"
q "OPTIMIZE TABLE demo.mp FINAL"
q "SELECT name, rows, level, active FROM system.parts WHERE database='demo' AND table='mp' ORDER BY min_block_number, name"
q "SELECT _part, _part_offset, id, name, age FROM demo.mp ORDER BY _part, _part_offset"
q "EXPLAIN indexes = 1 SELECT * FROM demo.mp WHERE id = 5"
flush_logs
q "SELECT event_type, part_name, merged_from, rows, read_rows, duration_ms FROM system.part_log WHERE table_uuid = (SELECT uuid FROM system.tables WHERE database='demo' AND name='mp') ORDER BY event_time_microseconds"

section "2. 片段多了，一次查询要翻每一个：900 个一行的片段与合并成一个之后"
q "DROP TABLE IF EXISTS demo.many SYNC"
q "CREATE TABLE demo.many (id UInt32, age UInt8) ENGINE = MergeTree ORDER BY id"
q "SYSTEM STOP MERGES demo.many"
printf '$ （一个客户端连续发 900 条 INSERT，每条一行，async_insert = 0）\n\n'
inct 'for i in $(seq 1 900); do echo "INSERT INTO demo.many SETTINGS async_insert = 0 VALUES ($i, $((18 + i % 63)));"; done > /tmp/many.sql; clickhouse-client --multiquery --queries-file /tmp/many.sql'
q "SELECT count() AS parts, sum(rows) AS rows FROM system.parts WHERE database='demo' AND table='many' AND active"
for i in 1 2 3 4 5; do ch --log_comment="many_before" -q "SELECT avg(age) FROM demo.many SETTINGS use_query_condition_cache = 0" >/dev/null; done
q "EXPLAIN indexes = 1 SELECT avg(age) FROM demo.many WHERE id = 450 SETTINGS use_query_condition_cache = 0"
q "SYSTEM START MERGES demo.many"
q "OPTIMIZE TABLE demo.many FINAL"
q "SELECT count() AS parts, sum(rows) AS rows, max(name) AS part FROM system.parts WHERE database='demo' AND table='many' AND active"
for i in 1 2 3 4 5; do ch --log_comment="many_after" -q "SELECT avg(age) FROM demo.many SETTINGS use_query_condition_cache = 0" >/dev/null; done
q "EXPLAIN indexes = 1 SELECT avg(age) FROM demo.many WHERE id = 450 SETTINGS use_query_condition_cache = 0"
flush_logs
q "SELECT log_comment, query_duration_ms, read_rows FROM system.query_log WHERE type = 'QueryFinish' AND log_comment LIKE 'many_%' ORDER BY event_time_microseconds"
q "SELECT event_type, part_name, rows, duration_ms FROM system.part_log WHERE table_uuid = (SELECT uuid FROM system.tables WHERE database='demo' AND name='many') AND event_type = 'MergeParts' ORDER BY event_time_microseconds"

section "3. 攒得太多会怎样：把上限调到 20，一行一行地插"
q "DROP TABLE IF EXISTS demo.few SYNC"
q "CREATE TABLE demo.few (id UInt32) ENGINE = MergeTree ORDER BY id SETTINGS parts_to_delay_insert = 20, parts_to_throw_insert = 20"
q "SYSTEM STOP MERGES demo.few"
printf '$ （连续发 30 条 INSERT，每条一行；表的上限已调到 20，缺省是 1000 / 3000）\n\n'
inct 'for i in $(seq 1 30); do echo "INSERT INTO demo.few SETTINGS async_insert = 0 VALUES ($i);"; done > /tmp/few.sql; clickhouse-client --multiquery --ignore-error --queries-file /tmp/few.sql 2>&1 | sed -n "1,3p"'
q "SELECT count() AS parts, sum(rows) AS rows FROM system.parts WHERE database='demo' AND table='few' AND active"
q "SYSTEM START MERGES demo.few"
q "DROP TABLE IF EXISTS demo.few SYNC"
