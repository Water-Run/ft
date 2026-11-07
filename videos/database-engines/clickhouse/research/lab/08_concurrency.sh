#!/usr/bin/env bash
# 并发：Bob 读，Carol 同时写。
#   Bob 的查询（单线程，逐行算姓名的哈希，故意慢到几秒）开始时拿到当时所有活动片段的快照；
#   查询进行中，Carol 插入一行（新片段），随后又改了自己的年龄（一次变更，生成各片段的新版本）。
#   Bob 的结果里没有 Carol；查询进行中被替换的旧片段因为 Bob 还在读而保留（refcount），没有谁等谁。
#   最后试一下多语句事务：缺省配置下没有开启。
source "$(dirname "$0")/lab_common.sh"
start_server
TU="(SELECT uuid FROM system.tables WHERE database='demo' AND name='users')"
RUN=$(date +%s)
BOB="SELECT count() AS users, round(avg(age), 6) AS avg_age FROM demo.users WHERE NOT ignore(sipHash128(name)) SETTINGS max_threads = 1"

section "开始之前"
q "SELECT name, rows, refcount FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY min_block_number"
q "SELECT count() FROM demo.users"

section "Bob 开始读；1 秒后 Carol 插入一行，再过 1 秒 Carol 改自己的年龄"
printf 'Bob   :) %s\n' "$BOB"
ch --query_id "bob_$RUN" --format TSV -q "$BOB" > /tmp/bob_$RUN.txt 2>&1 &
BP=$!
sleep 1
printf 'Carol :) %s\n' "INSERT INTO demo.users SETTINGS async_insert = 0 VALUES (100000002, 'Carol', 35)"
ch --query_id "carol_insert_$RUN" -q "INSERT INTO demo.users SETTINGS async_insert = 0 VALUES (100000002, 'Carol', 35)"
q "SELECT name, active, rows, refcount FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY min_block_number"
sleep 1
printf 'Carol :) %s\n' "ALTER TABLE demo.users UPDATE age = 36 WHERE id = 100000002 SETTINGS mutations_sync = 1"
ch --query_id "carol_update_$RUN" -q "ALTER TABLE demo.users UPDATE age = 36 WHERE id = 100000002 SETTINGS mutations_sync = 1"
printf '\nBob 还在读的时候，被替换下来的旧片段：\n'
q "SELECT name, active, refcount FROM system.parts WHERE database='demo' AND table='users' AND modification_time > now() - 600 OR (database='demo' AND table='users' AND active) ORDER BY min_block_number, name"
q "SELECT query_id, round(elapsed, 2) AS elapsed_s, read_rows FROM system.processes WHERE query_id = 'bob_$RUN'"
wait $BP
printf 'Bob 的结果：\n'; cat /tmp/bob_$RUN.txt; rm -f /tmp/bob_$RUN.txt; printf '\n'

section "Bob 读完之后"
q "SELECT name, active, refcount FROM system.parts WHERE database='demo' AND table='users' AND (active OR refcount > 1) ORDER BY min_block_number, name"
q "$BOB"
flush_logs
q "SELECT replaceRegexpOne(query_id, '_[0-9]+\$', '') AS who, query_start_time_microseconds AS started, event_time_microseconds AS finished, query_duration_ms AS ms
   FROM system.query_log WHERE type = 'QueryFinish' AND query_id IN ('bob_$RUN', 'carol_insert_$RUN', 'carol_update_$RUN') ORDER BY started"

section "多语句事务"
q "BEGIN TRANSACTION"
