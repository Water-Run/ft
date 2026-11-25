# 查：按键找 Alice，一条命令在服务端用了多少微秒；没有按名字的索引，按名字找要把所有键扫一遍。
source "$(dirname "$0")/lab_common.sh"
fresh; start; load
slow() { cq SLOWLOG GET 1 | tr -d '\r' | sed -n '3p;4,99p' | paste -sd' ' | sed -E 's/ 127\.0\.0\.1:[0-9]+ / 127.0.0.1:端口 /'; }

section "按键找：HGETALL user:2050（SLOWLOG 记下每条命令在服务端的执行时间，单位微秒）"
c CONFIG SET slowlog-log-slower-than 0
for k in 1 2 3 4 5; do
  cq SLOWLOG RESET >/dev/null
  cq HGETALL user:2050 | paste -sd' '
  printf '  服务端用时（微秒）与命令：'; slow
done

section "redis-benchmark：50 个连接，共 20 万次 HGETALL user:2050"
c CONFIG SET slowlog-log-slower-than 10000
c CONFIG RESETSTAT
"$R/redis-benchmark" -p "$PORT" -n 200000 -c 50 HGETALL user:2050 2>&1 | tr '\r' '\n' | grep -v '^HGETALL user:2050: rps=' | grep -v '^$'
cq INFO commandstats | tr -d '\r' | grep -E '^cmdstat_hgetall'

section "按名字找 Alice：没有索引，只能用 SCAN 把 4096 个键都看一遍（服务端的 Lua 脚本）"
c CONFIG SET slowlog-log-slower-than 0
LUA="local cur='0' local n=0 local found=false
repeat
  local r = redis.call('SCAN', cur, 'COUNT', 100)
  cur = r[1]
  for _, k in ipairs(r[2]) do
    n = n + 1
    if redis.call('HGET', k, 'name') == 'Alice' then found = k end
  end
until cur == '0'
return {found, n}"
printf '%s\n' "$LUA"
for k in 1 2 3; do
  cq SLOWLOG RESET >/dev/null
  cq EVAL "$LUA" 0 | paste -sd' '
  printf '  服务端用时（微秒）：'; cq SLOWLOG GET 1 | tr -d '\r' | sed -n '3p'
done

section "自己维护一个「名字 → 编号」的键，就是两次按键查找"
c SET name:Alice 2050
c GET name:Alice
c HGETALL user:2050
c DEL name:Alice

section "源码：一条命令的入口（server.c call）与事件循环（ae.c）"
grep -n '^void call(client \*c, int flags)' "$R/server.c"
grep -n 'c->cmd->proc(c);' "$R/server.c" | head -3
grep -n '^void aeMain(aeEventLoop \*eventLoop)' -A 8 "$R/ae.c"
stop
