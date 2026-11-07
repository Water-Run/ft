#!/usr/bin/env bash
# 表引擎：这个版本一共有多少种，MergeTree 家族有哪些；不写 ENGINE 时缺省用哪一种；ClickHouse 自己的日志表用什么引擎。
source "$(dirname "$0")/lab_common.sh"
start_server
section "这个版本的表引擎"
q "SELECT count() AS engines, countIf(name LIKE '%MergeTree%') AS mergetree_family FROM system.table_engines"
q "SELECT arrayStringConcat(groupArray(name), ', ') FROM (SELECT name FROM system.table_engines WHERE name LIKE '%MergeTree%' ORDER BY name)" --format TSVRaw
q "SELECT arrayStringConcat(groupArray(name), ', ') FROM (SELECT name FROM system.table_engines WHERE name NOT LIKE '%MergeTree%' ORDER BY name)" --format TSVRaw

section "不写 ENGINE 时"
q "SELECT name, value, changed FROM system.settings WHERE name = 'default_table_engine'"
q "DROP TABLE IF EXISTS demo.noengine SYNC"
q "CREATE TABLE demo.noengine (id UInt32, name String, age UInt8) ORDER BY id"
q "SELECT engine, engine_full FROM system.tables WHERE database = 'demo' AND name = 'noengine'"
q "DROP TABLE demo.noengine SYNC"

section "ClickHouse 自己记日志的表"
q "SELECT name, engine FROM system.tables WHERE database = 'system' AND name IN ('query_log', 'part_log', 'asynchronous_insert_log', 'trace_log', 'metric_log') ORDER BY name"
