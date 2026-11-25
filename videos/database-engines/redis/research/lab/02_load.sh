# 增：写入 4096 个用户。每个用户一个哈希键 user:<编号>，字段 name 与 age。
# 看键空间的哈希表有多大、Alice 这个键的类型与编码、占多少内存。
source "$(dirname "$0")/lab_common.sh"
fresh; start

section "写入之前"
info memory 'used_memory'
c DBSIZE

section "写入 4096 个用户（逐条 HSET，示例前 2 条与 Alice）"
gen_users | sed -n '1,2p;2050p'
load
c DBSIZE
info memory 'used_memory'
info keyspace 'db0'

section "Alice"
c HGETALL user:2050
c TYPE user:2050
c OBJECT ENCODING user:2050
c MEMORY USAGE user:2050
c HLEN user:2050
c DEBUG OBJECT user:2050

section "另一个用户（姓名 50 字节）"
c HGETALL user:2049
c OBJECT ENCODING user:2049
c MEMORY USAGE user:2049

section "Alice 的 listpack（DEBUG LISTPACK 打印在服务端的 stdout，停机后读出）"
c DEBUG LISTPACK user:2050

sleep 1   # 键数等于桶数时，serverCron 的定期检查会把表翻倍（FACTS R05）；等它跑过一次
section "键空间的哈希表（DEBUG HTSTATS 0 FULL），写完 1 秒后"
c DEBUG HTSTATS 0 FULL

section "字符串的三种编码"
c SET n 42
c OBJECT ENCODING n
c SET s 'Alice'
c OBJECT ENCODING s
c SET long 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'
c OBJECT ENCODING long
c DEL n s long

section "一个哈希键超过 512 个字段时改用哈希表"
c DEBUG OBJECT user:2050
for i in $(seq 1 513); do printf 'HSET big f%d v\n' "$i"; done | "$R/redis-cli" -p "$PORT" >/dev/null
c HLEN big
c OBJECT ENCODING big
c DEL big

stop
printf -- "--- 服务端 stdout（DEBUG LISTPACK user:2050）---
"
cat "$LAB/stdout.log"
