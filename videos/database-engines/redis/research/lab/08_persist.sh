# 落盘的两种文件：RDB 快照（某一刻整个内存的样子）与 AOF（记下每一条写命令）。
source "$(dirname "$0")/lab_common.sh"
fresh; start; load

section "RDB：BGSAVE 叫一个子进程（fork）把此刻的数据写成 dump.rdb"
c BGSAVE
for i in $(seq 1 100); do [ "$(info persistence rdb_bgsave_in_progress | cut -d: -f2)" = 0 ] && break; sleep 0.05; done
info persistence 'rdb_last_bgsave_status|rdb_last_bgsave_time_sec|rdb_last_cow_size|rdb_saves|rdb_last_save_time' | sed 's/rdb_last_save_time:.*/rdb_last_save_time:（时间戳）/'
info stats 'latest_fork_usec'
grep -E 'Background saving|DB saved on disk|Fork CoW' "$LAB/redis.log" | sed -E 's/^[0-9]+:([MC]) [0-9]+ [A-Za-z]+ [0-9]+ [0-9:.]+ /\1 /'
ls -l "$LAB/data/dump.rdb" | awk '{print $5, $9}' | sed "s#$LAB/##"

section "dump.rdb 的开头（魔数与版本号）"
head -c 9 "$LAB/data/dump.rdb"; printf '\n'
xxd -l 64 "$LAB/data/dump.rdb"

section "dump.rdb 里 Alice 那一项"
off=$(grep -abo 'user:2050' "$LAB/data/dump.rdb" | head -1 | cut -d: -f1)
printf '键名 user:2050 在文件里的偏移：%s\n' "$off"
xxd -s $((off - 2)) -l 40 "$LAB/data/dump.rdb"
xxd -p -s $((off - 2)) -l 39 "$LAB/data/dump.rdb" | tr -d '\n'; printf '\n'
printf '另一个用户 user:2049：\n'
off2=$(grep -abo 'user:2049' "$LAB/data/dump.rdb" | head -1 | cut -d: -f1)
xxd -s $((off2 - 2)) -l 96 "$LAB/data/dump.rdb"

section "AOF：打开 appendonly（CONFIG SET appendonly yes 会先把现有数据整份写成 base 文件）"
c CONFIG SET appendonly yes
for i in $(seq 1 100); do [ "$(info persistence aof_rewrite_in_progress | cut -d: -f2)" = 0 ] && [ "$(info persistence aof_rewrite_scheduled | cut -d: -f2)" = 0 ] && break; sleep 0.05; done
sleep 0.3
ls -l "$LAB/data/appendonlydir" | awk 'NR>1{print $5, $9}'
printf -- '--- manifest ---\n'; cat "$LAB/data/appendonlydir/"*.manifest

section "Alice 过生日：HSET user:2050 age 43。incr 文件里多出来的就是这条命令本身"
c HSET user:2050 age 43
sleep 0.2
inc=$(ls "$LAB/data/appendonlydir/"*.incr.aof | tail -1)
ls -l "$LAB/data/appendonlydir" | awk 'NR>1{print $5, $9}'
printf -- '--- %s（cat -A：^M$ 是 \\r\\n）---\n' "$(basename "$inc")"
cat -A "$inc"
xxd "$inc"
printf -- '--- base 文件的开头：RDB 格式 ---\n'
xxd -l 16 "$LAB/data/appendonlydir/"*.base.rdb

section "Dave 注册、Alice 注销，也一条条追加进去"
c HSET user:4097 name Dave age 19
c DEL user:2050
sleep 0.2
cat -A "$inc"

section "BGREWRITEAOF：把现在的数据重新写成一个新的 base，incr 从空开始"
c BGREWRITEAOF
for i in $(seq 1 100); do [ "$(info persistence aof_rewrite_in_progress | cut -d: -f2)" = 0 ] && [ "$(info persistence aof_rewrite_scheduled | cut -d: -f2)" = 0 ] && break; sleep 0.05; done
sleep 0.5
ls -l "$LAB/data/appendonlydir" | awk 'NR>1{print $5, $9}'
printf -- '--- manifest ---\n'; cat "$LAB/data/appendonlydir/"*.manifest
stop
