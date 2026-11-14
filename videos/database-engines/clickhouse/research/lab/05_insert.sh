#!/usr/bin/env bash
# 增：一次插入写成一个新片段，不往旧片段里塞。
#   1. Dave 注册：一行同步插入，服务端日志里看临时目录 tmp_insert_… 写完改名为正式片段；看这一行占了一个怎样的目录。
#   2. 成批与不成批：在单独的 demo.signup 表里，三个人各自同步插入（三个片段）对照三个人同时用异步插入（缺省开启）。
#   后台合并的过程见 03（写入一亿行时的 90 个片段）。
source "$(dirname "$0")/lab_common.sh"
start_server
UUID=$(qv "SELECT uuid FROM system.tables WHERE database='demo' AND name='users'")

section "插入之前"
q "SELECT name, part_type, rows FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY min_block_number"

section "1. Dave 注册：一行同步插入（服务端日志开到 trace，只留与片段有关的行）"
printf ':) %s\n\n' "INSERT INTO demo.users SETTINGS async_insert = 0 VALUES (100000001, 'Dave', 29)"
ch --send_logs_level=trace -q "INSERT INTO demo.users SETTINGS async_insert = 0 VALUES (100000001, 'Dave', 29)" 2>&1 \
  | grep -E 'tmp_insert|Renaming temporary part|Wrote block|Trying to reserve' | sed -E 's/^\[clickhouse\] //; s/ \[ [0-9]+ \] \{[^}]*\}//'
printf '\n'
q "SELECT name, part_type, rows, marks, bytes_on_disk FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY min_block_number"
DAVE=$(qv "SELECT name FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY max_block_number DESC LIMIT 1")
sh_ "cd $(part_path demo users "$DAVE") && ls -l --time-style=+ | awk 'NR>1{print \$5, \$NF}'"

section "2. 三个人各自同步插入：三个片段"
q "DROP TABLE IF EXISTS demo.signup SYNC"
q "CREATE TABLE demo.signup (id UInt32, name String, age UInt8) ENGINE = MergeTree ORDER BY id"
q "SYSTEM STOP MERGES demo.signup"
for r in "(9,'ivan',27)" "(10,'judy',31)" "(11,'mallory',45)"; do
  q "INSERT INTO demo.signup SETTINGS async_insert = 0 VALUES $r"
done
q "SELECT name, rows FROM system.parts WHERE database='demo' AND table='signup' AND active ORDER BY name"

section "2'. 三个人同时插入，用缺省的异步插入（async_insert = 1，wait_for_async_insert = 1）"
q "TRUNCATE TABLE demo.signup"
printf ':) %s\n:) %s\n:) %s\n（三个客户端同时发出）\n\n' "INSERT INTO demo.signup VALUES (9,'ivan',27)" "INSERT INTO demo.signup VALUES (10,'judy',31)" "INSERT INTO demo.signup VALUES (11,'mallory',45)"
# 三个客户端在容器里一起启动（逐个 podman exec 的启动误差比异步插入的等待窗口还大，第二次完整重跑时三条被分成了 1 + 2 两个片段）
inct "cat > /tmp/async3.sh <<'EOS'
clickhouse-client -q \"INSERT INTO demo.signup VALUES (9,'ivan',27)\" &
clickhouse-client -q \"INSERT INTO demo.signup VALUES (10,'judy',31)\" &
clickhouse-client -q \"INSERT INTO demo.signup VALUES (11,'mallory',45)\" &
wait
EOS
bash /tmp/async3.sh"
q "SELECT name, rows FROM system.parts WHERE database='demo' AND table='signup' AND active ORDER BY name"
q "SELECT * FROM demo.signup ORDER BY id"
flush_logs
q "SELECT database, table, format, status, rows FROM system.asynchronous_insert_log WHERE table = 'signup' ORDER BY event_time_microseconds"
q "SELECT name, value FROM system.settings WHERE name IN ('async_insert_busy_timeout_min_ms','async_insert_busy_timeout_max_ms','async_insert_max_data_size','async_insert_use_adaptive_busy_timeout','wait_for_async_insert') ORDER BY name"

section "demo.users 现在的片段"
q "SELECT name, part_type, rows FROM system.parts WHERE database='demo' AND table='users' AND active ORDER BY min_block_number"
