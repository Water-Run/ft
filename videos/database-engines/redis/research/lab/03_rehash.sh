# 键空间的哈希表怎样长大：桶数翻倍，旧表里的键分批搬到新表（渐进式 rehash）。
# 为了看到「搬到一半」，先关掉 serverCron 里的主动 rehash（activerehashing no），只靠每次读写顺手搬。
source "$(dirname "$0")/lab_common.sh"
fresh; start
stats() { cq DEBUG HTSTATS 0 | tr -d '\r' | grep -E 'Hash table|table size|number of elements|rehashing' ; }

section "写入 4095 个用户"
gen_users | head -4095 | "$R/redis-cli" -p "$PORT" > /dev/null
sleep 0.3; c DBSIZE; stats

section "关掉主动 rehash，再写第 4096 个：键数等于桶数"
c CONFIG SET activerehashing no
gen_users | sed -n '4096p' | "$R/redis-cli" -p "$PORT" > /dev/null
sleep 0.3; c DBSIZE; stats

section "再做 100 次读（每次查找顺手搬一格）"
for i in $(seq 1 100); do printf 'EXISTS user:%d\n' "$i"; done | "$R/redis-cli" -p "$PORT" > /dev/null
stats

section "再做 4000 次读"
for i in $(seq 1 4000); do printf 'EXISTS user:%d\n' "$i"; done | "$R/redis-cli" -p "$PORT" > /dev/null
stats

section "打开主动 rehash：serverCron 每次最多用 1 毫秒继续搬"
c CONFIG SET activerehashing yes
sleep 0.5; stats
c DEBUG HTSTATS 0 FULL

section "源码：扩容与每一步搬多少（dict.c）"
grep -n 'If we reached the 1:1 ratio' -A 12 "$R/dict.c"
grep -n '^int dictRehash(dict \*d, int n)' -B 10 "$R/dict.c" | head -12
stop
