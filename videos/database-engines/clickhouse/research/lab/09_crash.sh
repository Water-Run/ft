#!/usr/bin/env bash
# 出错怎么办：
#   1. 写一亿行写到一半，强行杀掉服务端进程（SIGKILL）。停机状态下用一个临时容器挂上数据卷看目录：
#      写完改名的片段在，写到一半的 tmp_insert_… 目录也在；重启后临时目录被清掉，表里只有完整的片段。
#   2. 片段文件坏了：停机后把一个片段的 age.bin 截短 1 字节、把另一个片段 age.bin 里的 1 个字节改掉（大小不变）。
#      重启时前者因为大小与 checksums.txt 不符被移进 detached；后者在启动时看不出来，读到时校验和报错，CHECK TABLE 能查出。
source "$(dirname "$0")/lab_common.sh"
start_server
NAME="if(number = 2050, 'Alice', concat('User', if(number < 100000, leftPad(toString(number), 5, '0'), toString(number)), '-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN'))"
AGE="if(number = 2050, 42, 18 + number % 63)"
peek() { podman run --rm -v "$VOL:$DATA" --entrypoint bash "$IMG" -c "$1"; }   # 停机时看数据卷

section "1. 写到一半强行终止"
q "DROP TABLE IF EXISTS demo.crash SYNC"
q "CREATE TABLE demo.crash (id UInt32, name String, age UInt8) ENGINE = MergeTree ORDER BY id"
q "SYSTEM STOP MERGES demo.crash"
CU=$(qv "SELECT uuid FROM system.tables WHERE database='demo' AND name='crash'")
TD="$DATA/store/${CU:0:3}/$CU"
printf ':) %s\n\n' "INSERT INTO demo.crash SELECT number, $NAME, $AGE FROM numbers(1, 100000000)"
ch -q "INSERT INTO demo.crash SELECT number, $NAME, $AGE FROM numbers(1, 100000000)" > /tmp/crash_client.txt 2>&1 &
CP=$!
sleep 4
echo "4 秒后：podman kill --signal KILL（向服务端进程发 SIGKILL）"
podman kill --signal KILL "$CT" >/dev/null
wait $CP || true
echo "客户端收到："; head -c 300 /tmp/crash_client.txt; rm -f /tmp/crash_client.txt; printf '\n\n'
podman inspect -f 'container running={{.State.Running}} exitcode={{.State.ExitCode}}' "$CT"
printf '\n停机状态下的表目录（临时容器挂上同一个数据卷）：\n'
peek "cd $TD && ls -d all_* tmp_* 2>/dev/null | sort -V | tr '\n' ' '; echo; echo; for d in tmp_*; do [ -d \"\$d\" ] && echo \"\$d: \$(ls \$d | tr '\n' ' ')\"; done"
printf '\n'

section "重启"
start_server
q "SELECT count() AS parts, sum(rows) AS total_rows, min(rows) AS min_rows, max(rows) AS max_rows FROM system.parts WHERE database='demo' AND table='crash' AND active"
q "SELECT count() FROM demo.crash"
q "SELECT max(id) - min(id) + 1 = count() AS contiguous, min(id), max(id) FROM demo.crash"
sh_ "cd $TD && ls -d tmp_* 2>/dev/null || echo 没有 tmp_ 目录"
sh_ "grep -E 'Removing temporary directory|tmp_insert' /var/log/clickhouse-server/clickhouse-server.log | grep '$CU' | tail -5 | sed -E 's/ \\[ [0-9]+ \\] \\{[^}]*\\}//'"

section "2. 片段文件损坏"
q "DROP TABLE IF EXISTS demo.broken SYNC"
q "CREATE TABLE demo.broken (id UInt32, name String, age UInt8) ENGINE = MergeTree ORDER BY id SETTINGS min_bytes_for_wide_part = 0"
q "SYSTEM STOP MERGES demo.broken"
q "INSERT INTO demo.broken SETTINGS async_insert = 0 SELECT number, $NAME, $AGE FROM numbers(1, 100000)"
q "INSERT INTO demo.broken SETTINGS async_insert = 0 SELECT number, $NAME, $AGE FROM numbers(100001, 100000)"
q "INSERT INTO demo.broken SETTINGS async_insert = 0 SELECT number, $NAME, $AGE FROM numbers(200001, 100000)"
q "SELECT name, rows FROM system.parts WHERE database='demo' AND table='broken' AND active ORDER BY name"
BU=$(qv "SELECT uuid FROM system.tables WHERE database='demo' AND name='broken'")
BD="$DATA/store/${BU:0:3}/$BU"
stop_server
echo "停机后：all_1_1_0/age.bin 截短 1 字节；all_2_2_0/age.bin 第 40 个字节取反（大小不变）"
podman run --rm -i -v "$VOL:$DATA" --entrypoint bash "$IMG" -s "$BD" <<'EOF'
set -e
cd "$1"
ls -l all_1_1_0/age.bin all_2_2_0/age.bin | awk '{print $5, $NF}'
truncate -s -1 all_1_1_0/age.bin
b=$(od -An -tu1 -j39 -N1 all_2_2_0/age.bin | tr -d ' ')
printf "$(printf '\\%03o' $((255 - b)))" | dd of=all_2_2_0/age.bin bs=1 seek=39 conv=notrunc status=none
echo "第 40 个字节：$b → $(od -An -tu1 -j39 -N1 all_2_2_0/age.bin | tr -d ' ')"
ls -l all_1_1_0/age.bin all_2_2_0/age.bin | awk '{print $5, $NF}'
EOF
printf '\n'
start_server
q "SELECT name, rows FROM system.parts WHERE database='demo' AND table='broken' AND active ORDER BY name"
q "SELECT name, reason FROM system.detached_parts WHERE database='demo' AND table='broken'"
sh_ "grep -E 'broken|Detaching' /var/log/clickhouse-server/clickhouse-server.log | grep '$BU' | tail -3 | sed -E 's/ \\[ [0-9]+ \\] \\{[^}]*\\}//' | cut -c1-400"
q "SELECT count() FROM demo.broken"
q "SELECT sum(age) FROM demo.broken"
q "CHECK TABLE demo.broken SETTINGS check_query_single_value_result = 0"
q "DROP TABLE demo.broken SYNC"
q "DROP TABLE demo.crash SYNC"
