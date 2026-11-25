# 删：Alice 注销。DEL 立刻删掉；EXPIRE 让键到期自己消失（访问时发现过期就删，另有定时抽查）。Dave 注册。
source "$(dirname "$0")/lab_common.sh"
fresh; start; load

section "DEL user:2050"
c MEMORY USAGE user:2050
c DBSIZE
c DEL user:2050
c EXISTS user:2050
c HGETALL user:2050
c DBSIZE
cq DEBUG HTSTATS 0 | tr -d '\r' | grep -E 'table size|number of elements'

section "Dave 注册：键名由应用自己起"
c HSET user:4097 name Dave age 19
c HGETALL user:4097
c DBSIZE

section "换一种注销：EXPIRE，2 秒后到期"
c HSET user:2050 name Alice age 43
c EXPIRE user:2050 2
c TTL user:2050
info keyspace 'db0'

section "先关掉定时抽查（DEBUG SET-ACTIVE-EXPIRE 0），只剩「访问时检查」"
c DEBUG SET-ACTIVE-EXPIRE 0
sleep 2.5
info stats 'expired_keys'
c DBSIZE
printf '（已经过期，但还没人碰它，仍占着一个键）\n'
c EXISTS user:2050
info stats 'expired_keys'
c DBSIZE

section "再试一次，打开定时抽查：没人访问也会被删掉"
c DEBUG SET-ACTIVE-EXPIRE 1
c HSET user:2050 name Alice age 43
c EXPIRE user:2050 2
sleep 3
info stats 'expired_keys'
c DBSIZE

section "内存有上限时：缺省 noeviction，写不进去就报错"
c DEL user:2050
lim=$(( $(info memory used_memory | cut -d: -f2) - 4096 ))
c CONFIG SET maxmemory "$lim"
c HSET user:2050 name Alice age 42
c HGET user:1 name
c CONFIG SET maxmemory-policy allkeys-lru
c HSET user:2050 name Alice age 42
info stats 'evicted_keys'
c DBSIZE
c CONFIG SET maxmemory 0
c CONFIG SET maxmemory-policy noeviction

section "源码：过期的两条路（db.c 访问时、expire.c 定时）"
grep -n 'ACTIVE_EXPIRE_CYCLE_KEYS_PER_LOOP\b' "$R/expire.c" | head -3
grep -n '#define ACTIVE_EXPIRE_CYCLE_SLOW_TIME_PERC\|#define ACTIVE_EXPIRE_CYCLE_ACCEPTABLE_STALE' "$R/expire.c"
grep -n '^keyStatus expireIfNeeded' "$R/db.c"
stop
