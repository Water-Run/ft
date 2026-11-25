# 改：Alice 过生日，42 → 43。一条 HSET 改掉 listpack 里的一个值。
source "$(dirname "$0")/lab_common.sh"
fresh; start; load
lp() { c DEBUG LISTPACK user:2050; }   # 打印在服务端 stdout，停机后读出

section "改之前"
c HGETALL user:2050
c MEMORY USAGE user:2050
c DEBUG OBJECT user:2050
lp

section "HSET user:2050 age 43（回复 0：没有新增字段，只改了已有的）"
c CONFIG SET slowlog-log-slower-than 0
cq SLOWLOG RESET >/dev/null
c HSET user:2050 age 43
printf '服务端用时（微秒）：'; cq SLOWLOG GET 1 | tr -d '\r' | sed -n '3p'

section "改之后"
c HGETALL user:2050
c MEMORY USAGE user:2050
c DEBUG OBJECT user:2050
lp

section "也可以让服务端自己加一：HINCRBY"
c HINCRBY user:2050 age 1
c HINCRBY user:2050 age -1
c HGET user:2050 age
stop
printf -- "--- 服务端 stdout（改之前、改之后各一次 DEBUG LISTPACK）---
"
cat "$LAB/stdout.log"
