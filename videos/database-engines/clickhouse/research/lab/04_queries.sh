#!/usr/bin/env bash
# 三种问题，在 03 建好的一亿行、一个片段的 demo.users 上：
#   1. 一亿人的平均年龄：只读 age 这一列；对照读出所有列（SELECT * … FORMAT Null）。
#   2. 按主键找 Alice（id = 2050）：稀疏主键索引二分，选中 1 个颗粒（8192 行），再按标记到各列文件取对应的块。
#   3. 按姓名找 Alice（不在排序键里）：选不掉任何颗粒，读完整列 name，命中的颗粒再读其他列（PREWHERE）。
# 每条查询带 query_id，结果从 system.query_log 取：用时、读取行数、读取字节（解压后）、选中的片段与标记。
# 关掉查询条件缓存（use_query_condition_cache = 0），否则重复的查询会直接跳过上次不命中的颗粒，读取量不再反映索引本身。
# 机器的页缓存不清（容器里没有权限），用时是热缓存下的；每条跑 3 次。
source "$(dirname "$0")/lab_common.sh"
start_server
S="SETTINGS use_query_condition_cache = 0"
RUN=$(date +%s)   # 每次运行的 query_id 带上它，避免与上一次运行的日志混在一起
run() {  # run 标签 '查询' [show]：跑 3 次（结果丢弃），再按需要打印一次结果
  local tag=$1 sql=$2 show=${3:-show}
  for i in 1 2 3; do ch --query_id "${tag}_${i}_$RUN" --format Null -q "$sql $S" >/dev/null; done
  printf ':) %s %s\n\n' "$sql" "$S"
  if [ "$show" = show ]; then ch --format PrettyCompactMonoBlock -q "$sql $S" 2>&1 || true; else echo "（结果丢弃：客户端以 --format Null 运行）"; fi
  printf '\n'
}
stats() {  # stats 标签
  flush_logs
  q "SELECT replaceRegexpOne(query_id, '_[0-9]+\$', '') AS run, query_duration_ms AS ms, read_rows, read_bytes, formatReadableSize(read_bytes) AS read,
            ProfileEvents['SelectedParts'] AS parts, ProfileEvents['SelectedMarks'] AS marks, ProfileEvents['SelectedRows'] AS selected_rows,
            ProfileEvents['ReadCompressedBytes'] AS compressed_bytes_read
     FROM system.query_log WHERE type = 'QueryFinish' AND query_id LIKE '$1\_%\_$RUN' ORDER BY query_id"
}
q "SYSTEM DROP MARK CACHE"
q "SELECT name, rows, marks FROM system.parts WHERE database='demo' AND table='users' AND active"

section "1. 一亿人的平均年龄"
run avg "SELECT avg(age) FROM demo.users"
stats avg
section "1'. 对照：读出整张表的所有列"
run all "SELECT * FROM demo.users" hide
stats all

section "2. 按主键找 Alice"
q "EXPLAIN indexes = 1 SELECT * FROM demo.users WHERE id = 2050"
run pk "SELECT * FROM demo.users WHERE id = 2050"
stats pk

section "3. 按姓名找 Alice"
q "EXPLAIN indexes = 1 SELECT * FROM demo.users WHERE name = 'Alice'"
q "EXPLAIN actions = 1 SELECT * FROM demo.users WHERE name = 'Alice'" --format TSVRaw
run name "SELECT * FROM demo.users WHERE name = 'Alice'"
stats name

section "主键索引与标记：mergeTreeIndex 表函数列出每个颗粒的索引项与各列的标记"
q "SELECT part_name, mark_number, rows_in_granule, id, id.mark, age.mark, name.mark
   FROM mergeTreeIndex('demo', 'users', with_marks = true) ORDER BY mark_number LIMIT 4"
q "SELECT part_name, mark_number, rows_in_granule, id, age.mark
   FROM mergeTreeIndex('demo', 'users', with_marks = true) ORDER BY mark_number DESC LIMIT 3"
q "SELECT count() AS index_entries, countIf(rows_in_granule = 8192) AS full_granules, sum(rows_in_granule) AS rows
   FROM mergeTreeIndex('demo', 'users')"
q "SELECT uniqExact(age.mark.offset_in_compressed_file) AS age_blocks, uniqExact(id.mark.offset_in_compressed_file) AS id_blocks,
          uniqExact(name.mark.offset_in_compressed_file) AS name_blocks
   FROM mergeTreeIndex('demo', 'users', with_marks = true)"

P=$(qv "SELECT name FROM system.parts WHERE database='demo' AND table='users' AND active")
D=$(part_path demo users "$P")
section "主键索引文件：解压后每项 4 字节（UInt32 的 id），12209 项"
sh_ "cd $D && ls -l primary.cidx && clickhouse compressor --decompress < primary.cidx | wc -c && clickhouse compressor --decompress < primary.cidx | od -A d -t u4 -w16 | head -3"
section "age 的标记文件：解压后每个标记 24 字节（压缩块在文件里的偏移、块内偏移、颗粒行数）"
sh_ "cd $D && clickhouse compressor --decompress < age.cmrk2 2>/dev/null | od -A d -t u8 -w24 | head -10"
