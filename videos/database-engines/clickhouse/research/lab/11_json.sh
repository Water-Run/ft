#!/usr/bin/env bash
# 结尾的衔接：ClickHouse 连 JSON 文档也按路径拆成子列来存。三份用户资料写进一个 JSON 列，看片段目录里的文件；
# 对照只读一个路径与读出整份文档时读取的数据量。
source "$(dirname "$0")/lab_common.sh"
start_server
RUN=$(date +%s)
q "DROP TABLE IF EXISTS demo.profiles SYNC"
q "CREATE TABLE demo.profiles (id UInt32, doc JSON) ENGINE = MergeTree ORDER BY id SETTINGS min_bytes_for_wide_part = 0"
q "INSERT INTO demo.profiles SETTINGS async_insert = 0 VALUES
   (2050, '{\"name\": \"Alice\", \"age\": 43, \"city\": \"Paris\", \"tags\": [\"admin\", \"beta\"]}'),
   (2051, '{\"name\": \"Bob\", \"age\": 37, \"city\": \"Berlin\"}'),
   (100000002, '{\"name\": \"Carol\", \"age\": 36, \"pets\": {\"cat\": \"Tom\"}}')"
P=$(qv "SELECT name FROM system.parts WHERE database='demo' AND table='profiles' AND active")
sh_ "cd $(part_path demo profiles "$P") && ls *.bin | sort"
q "SELECT doc.name, doc.age FROM demo.profiles ORDER BY id"
q "SELECT doc FROM demo.profiles ORDER BY id"
ch --query_id "json_path_$RUN" --format Null -q "SELECT doc.age FROM demo.profiles"
ch --query_id "json_whole_$RUN" --format Null -q "SELECT doc FROM demo.profiles"
flush_logs
q "SELECT replaceRegexpOne(query_id, '_[0-9]+\$', '') AS q, read_rows, read_bytes, ProfileEvents['ReadCompressedBytes'] AS compressed_bytes_read
   FROM system.query_log WHERE type = 'QueryFinish' AND query_id IN ('json_path_$RUN', 'json_whole_$RUN') ORDER BY q"
q "DROP TABLE demo.profiles SYNC"
