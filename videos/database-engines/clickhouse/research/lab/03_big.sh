#!/usr/bin/env bash
# 一亿行的 users 表：id 1..100000000，Alice 仍是 2050 号、42 岁；其他人的姓名与年龄沿用本系列的规则
#   姓名 'User' + 至少 5 位的编号 + '-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN'，年龄 18 + id % 63。
# 一条 INSERT … SELECT 写入；记录写入时生成了多少个片段、后台合并怎样把它们并成大片段；最后 OPTIMIZE FINAL 并成一个片段，
# 后面的查询实验都在这一个片段上做。
source "$(dirname "$0")/lab_common.sh"
start_server
NAME="if(number = 2050, 'Alice', concat('User', if(number < 100000, leftPad(toString(number), 5, '0'), toString(number)), '-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN'))"
AGE="if(number = 2050, 42, 18 + number % 63)"

section "建表"
q "DROP TABLE IF EXISTS demo.users SYNC"
q "CREATE TABLE demo.users (id UInt32, name String, age UInt8) ENGINE = MergeTree ORDER BY id"
q "SHOW CREATE TABLE demo.users" --format TSVRaw

section "写入一亿行（一条 INSERT … SELECT）"
T0=$(date +%s.%N)
q "INSERT INTO demo.users SELECT number AS id, $NAME AS name, $AGE AS age FROM numbers(1, 100000000)" --time
T1=$(date +%s.%N)
printf '写入用时（客户端计时）：%.1f 秒\n\n' "$(echo "$T1 - $T0" | bc)"
q "SELECT count() AS active_parts, sum(rows) AS total_rows, min(rows) AS min_rows, max(rows) AS max_rows FROM system.parts WHERE database='demo' AND table='users' AND active"
flush_logs
q "SELECT event_type, count() AS parts, sum(rows) AS rows FROM system.part_log WHERE table_uuid = (SELECT uuid FROM system.tables WHERE database='demo' AND name='users') GROUP BY event_type ORDER BY event_type"
q "SELECT part_name, rows, round(duration_ms) AS ms FROM system.part_log WHERE table_uuid = (SELECT uuid FROM system.tables WHERE database='demo' AND name='users') AND event_type='NewPart' ORDER BY event_time_microseconds LIMIT 5"

section "等后台合并：每 15 秒看一次活动片段，连续两次不变或 6 分钟为止"
prev=""; same=0
for i in $(seq 1 24); do
  sleep 15
  cur=$(qv "SELECT count() FROM system.parts WHERE database='demo' AND table='users' AND active")
  m=$(qv "SELECT count() FROM system.merges WHERE database='demo' AND table='users'")
  echo "$((i*15)) 秒：活动片段 $cur，进行中的合并 $m"
  if [ "$cur" = "$prev" ] && [ "$m" = 0 ]; then same=$((same+1)); [ $same -ge 2 ] && break; else same=0; fi
  prev=$cur
done
printf '\n'
q "SELECT name, part_type, rows, marks, formatReadableSize(bytes_on_disk) AS size FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY min_block_number"
flush_logs
q "SELECT event_type, count() AS events FROM system.part_log WHERE table_uuid = (SELECT uuid FROM system.tables WHERE database='demo' AND name='users') GROUP BY event_type ORDER BY event_type"
q "SELECT part_name, length(merged_from) AS merged_from_parts, rows, round(duration_ms/1000, 1) AS seconds FROM system.part_log WHERE table_uuid = (SELECT uuid FROM system.tables WHERE database='demo' AND name='users') AND event_type='MergeParts' ORDER BY event_time_microseconds"
q "SELECT name, active, remove_time FROM system.parts WHERE database='demo' AND table='users' AND NOT active ORDER BY modification_time LIMIT 5"
q "SELECT count() AS inactive_parts FROM system.parts WHERE database='demo' AND table='users' AND NOT active"

section "并成一个片段（OPTIMIZE FINAL）"
q "OPTIMIZE TABLE demo.users FINAL" --time
q "SELECT name, part_type, rows, marks, formatReadableSize(bytes_on_disk) AS size, formatReadableSize(primary_key_bytes_in_memory) AS pk_in_memory, path FROM system.parts WHERE database='demo' AND table='users' AND active"
P=$(qv "SELECT name FROM system.parts WHERE database='demo' AND table='users' AND active")
D=$(part_path demo users "$P")
sh_ "cd $D && ls -l --time-style=+ | awk '{print \$5, \$NF}'"

section "各列的大小（压缩前后）"
q "SELECT name, type, formatReadableSize(data_uncompressed_bytes) AS uncompressed, formatReadableSize(data_compressed_bytes) AS compressed, data_uncompressed_bytes, data_compressed_bytes, round(data_uncompressed_bytes / data_compressed_bytes, 1) AS ratio FROM system.columns WHERE database='demo' AND table='users'"
q "SELECT column, substreams, formatReadableSize(column_data_uncompressed_bytes) AS uncompressed, formatReadableSize(column_data_compressed_bytes) AS compressed FROM system.parts_columns WHERE database='demo' AND table='users' AND active"
q "SELECT sum(data_uncompressed_bytes) AS table_uncompressed, sum(data_compressed_bytes) AS table_compressed, formatReadableSize(table_uncompressed), formatReadableSize(table_compressed) FROM system.columns WHERE database='demo' AND table='users'"

section "Alice 与几位邻居"
q "SELECT _part, _part_offset, id, name, age FROM demo.users WHERE id IN (1, 2, 2049, 2050, 2051, 8192, 8193, 100000000) ORDER BY id"
q "SELECT count(), avg(age), min(id), max(id) FROM demo.users"
