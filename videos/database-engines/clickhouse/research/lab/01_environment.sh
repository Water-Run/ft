#!/usr/bin/env bash
# 环境：镜像与版本，机器配置，启动服务端，记下与本片有关的缺省设置。
source "$(dirname "$0")/lab_common.sh"

section "镜像"
podman image inspect "$IMG" --format 'image {{index .RepoTags 0}}  digest {{.Digest}}'
printf '\n'

section "机器（宿主）"
grep PRETTY_NAME /etc/os-release
uname -rm
lscpu | grep -E '^(Model name|CPU\(s\)):' | sed 's/  */ /g'
free -g | awk 'NR==2{print "内存 " $2 " GB"}'
printf '\n'

section "启动服务端（官方镜像的缺省配置，数据卷挂在 $DATA）"
start_server
q "SELECT version() AS version, uptime() > 0 AS running"
sh_ "ps -o pid,comm,args -p 1"
sh_ "ls $DATA"

section "MergeTree 表的缺省设置（system.merge_tree_settings）"
q "SELECT name, value, changed FROM system.merge_tree_settings
   WHERE name IN ('index_granularity','index_granularity_bytes','min_bytes_for_wide_part','min_rows_for_wide_part',
                  'old_parts_lifetime','fsync_after_insert','fsync_part_directory','compress_marks','compress_primary_key',
                  'primary_key_compress_block_size','marks_compress_block_size','parts_to_delay_insert','parts_to_throw_insert',
                  'max_bytes_to_merge_at_max_space_in_pool','enable_block_number_column','enable_block_offset_column',
                  'temporary_directories_lifetime','max_suspicious_broken_parts')
   ORDER BY name"

section "会话的缺省设置（system.settings）"
q "SELECT name, value, changed FROM system.settings
   WHERE name IN ('max_insert_block_size','min_insert_block_size_rows','min_insert_block_size_bytes','max_block_size',
                  'mutations_sync','lightweight_deletes_sync','lightweight_delete_mode','async_insert','optimize_move_to_prewhere',
                  'max_threads','insert_deduplicate','allow_experimental_lightweight_update','implicit_transaction',
                  'apply_mutations_on_fly','apply_patch_parts')
   ORDER BY name"

section "服务端设置"
q "SELECT name, value FROM system.server_settings WHERE name IN ('path','max_server_memory_usage','mark_cache_size','uncompressed_cache_size','allow_experimental_transactions') ORDER BY name"
q "SELECT * FROM system.build_options WHERE name IN ('VERSION_DESCRIBE','VERSION_GITHASH','BUILD_TYPE','SYSTEM_PROCESSOR')"
