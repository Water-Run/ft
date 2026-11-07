#!/usr/bin/env bash
# 改：Alice 过生日，42 → 43。
#   1. 经典的「变更」（ALTER TABLE … UPDATE）：后台为含她的片段生成新版本，改到的列重写，没改到的列文件用硬链接带过去。
#      用 ls -i 比较新旧片段里各文件的 inode 与链接数；part_log 里看 MutatePart 读了多少行、用了多久。
#   2. 新的轻量更新（UPDATE … SET）：要求表开启 enable_block_number_column 与 enable_block_offset_column；
#      在另一张同样一亿行的表上实测，它写一个只含改动的「补丁片段」。
source "$(dirname "$0")/lab_common.sh"
start_server
TU="(SELECT uuid FROM system.tables WHERE database='demo' AND name='users')"

section "改之前"
q "SELECT _part, id, name, age FROM demo.users WHERE id = 2050"
q "SELECT name, rows FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY min_block_number"
OLD=$(qv "SELECT _part FROM demo.users WHERE id = 2050")
OD=$(part_path demo users "$OLD")
sh_ "cd $OD && ls -li id.bin name.bin name.size.bin age.bin primary.cidx | awk '{print \$1, \$3, \$6, \$NF}'"

section "1. 变更：ALTER TABLE … UPDATE（mutations_sync = 1，等它做完再返回）"
q "ALTER TABLE demo.users UPDATE age = 43 WHERE id = 2050" --mutations_sync=1 --time
q "SELECT mutation_id, command, parts_to_do, is_done FROM system.mutations WHERE database='demo' AND table='users'"
q "SELECT name, rows, data_version FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY min_block_number"
NEW=$(qv "SELECT _part FROM demo.users WHERE id = 2050")
ND=$(part_path demo users "$NEW")
echo "旧片段 $OLD → 新片段 $NEW"; printf '\n'
sh_ "cd $ND && ls -li id.bin name.bin name.size.bin age.bin primary.cidx | awk '{print \$1, \$3, \$6, \$NF}'"
sh_ "cd $OD && ls -li age.bin | awk '{print \$1, \$3, \$6, \$NF}'"
q "SELECT _part, id, name, age FROM demo.users WHERE id = 2050"
flush_logs
q "SELECT event_type, part_name, merged_from, rows, read_rows, formatReadableSize(bytes_uncompressed) AS uncompressed, duration_ms
   FROM system.part_log WHERE table_uuid = $TU AND event_type = 'MutatePart' ORDER BY event_time_microseconds"
q "SELECT name, active FROM system.parts WHERE database='demo' AND table='users' ORDER BY min_block_number, name"

section "2. 轻量更新：在普通表上不可用"
q "UPDATE demo.users SET age = 43 WHERE id = 2050"

section "2'. 轻量更新：另建一张开启块号列的同样的表"
q "DROP TABLE IF EXISTS demo.users_lw SYNC"
q "CREATE TABLE demo.users_lw (id UInt32, name String, age UInt8) ENGINE = MergeTree ORDER BY id SETTINGS enable_block_number_column = 1, enable_block_offset_column = 1"
q "INSERT INTO demo.users_lw SELECT id, name, if(id = 2050, 42, age) AS age FROM demo.users WHERE id <= 100000000" --time
q "OPTIMIZE TABLE demo.users_lw FINAL" --time
q "SELECT name, rows FROM system.parts WHERE database='demo' AND table='users_lw' AND active"
q "UPDATE demo.users_lw SET age = 43 WHERE id = 2050" --time
q "SELECT name, rows, part_type FROM system.parts WHERE database='demo' AND table='users_lw' AND active ORDER BY name"
PATCH=$(qv "SELECT name FROM system.parts WHERE database='demo' AND table='users_lw' AND active AND startsWith(name, 'patch') LIMIT 1")
[ -n "$PATCH" ] && sh_ "cd $(part_path demo users_lw "$PATCH") && ls -l --time-style=+ | awk 'NR>1{print \$5, \$NF}'"
q "SELECT id, name, age FROM demo.users_lw WHERE id = 2050"
q "DROP TABLE demo.users_lw SYNC"
