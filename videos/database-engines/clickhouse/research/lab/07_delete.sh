#!/usr/bin/env bash
# 删：Alice 注销。
#   1. 轻量删除（DELETE FROM）：缺省 lightweight_delete_mode = alter_update，做成一次变更，给片段加一列隐藏的 _row_exists，
#      她那一行记 0，其他列文件仍用硬链接；查询自动过滤。
#   2. 真正移除等合并：OPTIMIZE FINAL 之后新片段里没有她，也没有 _row_exists。
#   3. 被替换的旧片段先标为不活动，约 old_parts_lifetime（480 秒）之后才从磁盘上删掉：每 30 秒看一次，直到它消失。
source "$(dirname "$0")/lab_common.sh"
start_server
TU="(SELECT uuid FROM system.tables WHERE database='demo' AND name='users')"

section "删之前"
q "SELECT _part, id, name, age FROM demo.users WHERE id = 2050"
OLD=$(qv "SELECT _part FROM demo.users WHERE id = 2050")
q "SELECT count() FROM demo.users"

section "1. DELETE FROM（lightweight_deletes_sync = 2，等它做完）"
q "DELETE FROM demo.users WHERE id = 2050" --time
q "SELECT mutation_id, command, is_done FROM system.mutations WHERE database='demo' AND table='users' ORDER BY create_time"
q "SELECT name, rows, has_lightweight_delete FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY min_block_number"
NEW=$(qv "SELECT name FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY rows DESC LIMIT 1")
ND=$(part_path demo users "$NEW")
sh_ "cd $ND && ls -li --time-style=+ | awk 'NR>1{print \$1, \$3, \$6, \$NF}'"
echo "_row_exists 解压后第 2041–2056 字节（下标从 0 起，Alice 是片段里的第 2049 行）："
sh_ "cd $ND && clickhouse compressor --decompress < _row_exists.bin | od -A d -t u1 -j 2040 -N 16"
sh_ "cd $ND && clickhouse compressor --stat < _row_exists.bin | awk '{s+=\$2; c+=\$3} END {print NR \" 个压缩块，原大小 \" s \" 字节，压缩后 \" c \" 字节\"}'"
q "SELECT count() FROM demo.users"
q "SELECT * FROM demo.users WHERE id = 2050"
q "SELECT count() FROM demo.users WHERE id BETWEEN 1 AND 8192"
flush_logs
q "SELECT event_type, part_name, merged_from, rows, duration_ms FROM system.part_log WHERE table_uuid = $TU AND event_type = 'MutatePart' ORDER BY event_time_microseconds DESC LIMIT 2"

section "2. 合并之后才真正移除"
q "OPTIMIZE TABLE demo.users FINAL" --time
q "SELECT name, rows, has_lightweight_delete FROM system.parts WHERE database='demo' AND table='users' AND active"
M=$(qv "SELECT name FROM system.parts WHERE database='demo' AND table='users' AND active")
sh_ "cd $(part_path demo users "$M") && ls | grep -c row_exists || true"

section "3. 旧片段什么时候从磁盘上消失"
q "SELECT name, active, remove_time, refcount FROM system.parts WHERE database='demo' AND table='users' AND name IN ('$OLD', '$NEW')"
GONE_AT=""
T0=$(date +%s)
for i in $(seq 1 26); do
  n=$(qv "SELECT count() FROM system.parts WHERE database='demo' AND table='users' AND name = '$NEW'")
  echo "$(( $(date +%s) - T0 )) 秒：$NEW 还在 system.parts 里？$n"
  [ "$n" = 0 ] && break
  sleep 30
done
printf '\n'
flush_logs
q "SELECT event_type, part_name, event_time FROM system.part_log WHERE table_uuid = $TU AND part_name IN ('$OLD', '$NEW') ORDER BY event_time_microseconds"
