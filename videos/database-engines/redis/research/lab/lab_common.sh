# 各实验共用：Redis 8.12.0 官方源码编译的 redis-server，只监听本机 7379 端口，数据目录在 /tmp/redis-lab/run。
# 不碰机器上原有的 Redis（6379）。每个实验都从一个空的数据目录开始。
set -u
R=/tmp/redis-lab/redis-8.12.0/src
LAB=/tmp/redis-lab/run
PORT=7379
export LC_ALL=C.UTF-8

section() { printf '\n==== %s ====\n' "$*"; }
# 打印并执行一条 redis-cli 命令
c() { printf '127.0.0.1:%s> %s\n' "$PORT" "$*"; "$R/redis-cli" -p "$PORT" "$@"; }
cq() { "$R/redis-cli" -p "$PORT" "$@"; }          # 只取结果
info() { cq INFO "$1" | tr -d '\r' | grep -E "^($2):" ; }
pid() { cat "$LAB/redis.pid"; }

start() {
  rm -f "$LAB/redis.pid"
  # 不用 daemonize：服务端的 stdout（DEBUG LISTPACK 打印在这里）存进 stdout.log
  "$R/redis-server" --port "$PORT" --bind 127.0.0.1 --dir "$LAB/data" --daemonize no \
    --logfile "$LAB/redis.log" --pidfile "$LAB/redis.pid" --enable-debug-command local "$@" >> "$LAB/stdout.log" 2>&1 &
  disown   # kill -9 时不让 bash 打印作业提示
  for i in $(seq 1 200); do cq PING 2>/dev/null | grep -q PONG && [ -s "$LAB/redis.pid" ] && return 0; sleep 0.05; done
  echo "redis-server 没有起来"; tail -20 "$LAB/redis.log"; exit 1
}
stop() { cq SHUTDOWN NOSAVE >/dev/null 2>&1 || true; for i in $(seq 1 100); do cq PING >/dev/null 2>&1 || return 0; sleep 0.05; done; }
fresh() { stop; rm -rf "$LAB"; mkdir -p "$LAB/data"; }
# kill -9：进程立刻结束，不做任何收尾
crash() { local p; p=$(pid); kill -9 "$p"; while kill -0 "$p" 2>/dev/null; do sleep 0.02; done; printf '（kill -9 %s：进程已结束）\n' "PID"; }

# 本系列同一批数据：4096 个用户，Alice 是第 2050 个、42 岁；其他人姓名为 50 字节的演示串，年龄 18 + i % 63
gen_users() {
  for i in $(seq 1 4096); do
    if [ "$i" -eq 2050 ]; then printf 'HSET user:2050 name Alice age 42\n'
    else printf 'HSET user:%d name User%05d-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN age %d\n' "$i" "$i" $((18 + i % 63)); fi
  done
}
load() { gen_users | "$R/redis-cli" -p "$PORT" > /dev/null; }
