#!/usr/bin/env bash
# 小例子：8 行的 users 表（与本系列第一集 MyISAM 实验的 8 行相同），故意打乱顺序插入。
# 看一次插入写成的片段目录里有哪些文件、每列怎样单独存放、怎样压缩，主键索引与标记里是什么。
# users8w 设 min_bytes_for_wide_part = 0，让 8 行也写成每列一个文件的 Wide 片段；users8 用缺省设置，看小片段的 Compact 格式。
source "$(dirname "$0")/lab_common.sh"
start_server
ROWS="(5,'erin',33),(2,'bob',25),(8,'heidi',36),(1,'alice',30),(7,'grace',28),(4,'dave',19),(6,'frank',52),(3,'carol',41)"

section "建表"
q "CREATE DATABASE IF NOT EXISTS demo"
q "DROP TABLE IF EXISTS demo.users8"
q "DROP TABLE IF EXISTS demo.users8w"
q "CREATE TABLE demo.users8w (id UInt32, name String, age UInt8) ENGINE = MergeTree ORDER BY id SETTINGS min_bytes_for_wide_part = 0"
q "CREATE TABLE demo.users8 (id UInt32, name String, age UInt8) ENGINE = MergeTree ORDER BY id"

section "按打乱的顺序插入 8 行（同步插入，一条 INSERT）"
q "INSERT INTO demo.users8w SETTINGS async_insert = 0 VALUES $ROWS"
q "INSERT INTO demo.users8 SETTINGS async_insert = 0 VALUES $ROWS"
q "SELECT _part, _part_offset, id, name, age FROM demo.users8w ORDER BY _part_offset"
q "SELECT table, name, part_type, rows, marks, bytes_on_disk, path FROM system.parts WHERE database = 'demo' AND active ORDER BY table"

W=$(part_path demo users8w all_1_1_0)
C=$(part_path demo users8 all_1_1_0)

section "Wide 片段：每一列一个数据文件（.bin）和一个标记文件"
sh_ "cd $W && ls -l --time-style=+ | awk '{print \$5, \$NF}'"
sh_ "cd $W && cat columns.txt; echo; cat count.txt; echo; cat default_compression_codec.txt; echo"

section "age.bin 原样的字节：一个压缩块（16 字节校验和，1 字节方法，4 字节压缩后大小，4 字节原大小，然后是数据）"
sh_ "cd $W && xxd age.bin"
sh_ "cd $W && clickhouse compressor --decompress < age.bin | xxd"
sh_ "cd $W && clickhouse compressor --stat < age.bin"
sh_ "cd $W && clickhouse compressor --decompress < id.bin | xxd"
sh_ "cd $W && clickhouse compressor --decompress < name.bin | xxd"
sh_ "cd $W && clickhouse compressor --stat < name.bin"

section "主键索引：每个颗粒一项，存的是该颗粒第一行的排序键（这里只有一个颗粒，外加结尾一项）"
sh_ "cd $W && ls -l primary.cidx && clickhouse compressor --decompress < primary.cidx | xxd"
section "标记：每个颗粒一项，指向压缩文件里的块偏移与块内偏移，外加行数"
sh_ "cd $W && for f in id age name; do ls -l \$f.cmrk2; clickhouse compressor --decompress < \$f.cmrk2 | xxd; done"

section "Compact 片段（缺省设置下的小片段）：所有列在一个 data.bin 里，按颗粒一列接一列"
sh_ "cd $C && ls -l --time-style=+ | awk '{print \$5, \$NF}'"
sh_ "cd $C && clickhouse compressor --decompress < data.bin | xxd"
sh_ "cd $C && clickhouse compressor --decompress < data.cmrk4 | xxd"
