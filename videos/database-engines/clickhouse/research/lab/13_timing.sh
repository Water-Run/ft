#!/usr/bin/env bash
# 计时：开场那条「一亿人的平均年龄」查询连跑 30 次（热缓存），看最短、中位数与最长；
# 第一次完整重跑时只跑了 3 次，其中一次被机器上别的负载拖慢，三次不足以定一个数。
source "$(dirname "$0")/lab_common.sh"
start_server
RUN=$(date +%s)
section "SELECT avg(age) FROM demo.users，连跑 30 次"
for i in $(seq 1 30); do ch --query_id "t7_${i}_$RUN" -q "SELECT avg(age) FROM demo.users" > /dev/null; done
flush_logs
q "SELECT count() AS runs, min(query_duration_ms) AS min_ms, round(quantile(0.5)(query_duration_ms), 1) AS median_ms, round(quantile(0.9)(query_duration_ms), 1) AS p90_ms, max(query_duration_ms) AS max_ms
   FROM system.query_log WHERE type = 'QueryFinish' AND query_id LIKE 't7\_%\_$RUN'"
q "SELECT query_duration_ms AS ms, count() AS runs FROM system.query_log WHERE type = 'QueryFinish' AND query_id LIKE 't7\_%\_$RUN' GROUP BY ms ORDER BY ms"
q "SELECT formatReadableSize(sum(read_bytes) / count()) AS read_per_query, round(avg(read_rows)) AS read_rows, avg(ProfileEvents['SelectedMarks']) AS marks FROM system.query_log WHERE type = 'QueryFinish' AND query_id LIKE 't7\_%\_$RUN'"
