# 出错怎么办：kill -9 立刻结束进程，再启动，看回来的是什么。
# 只测进程被强制结束；断电与操作系统崩溃没有实测（kill -9 之后，已经 write 进内核的数据仍会写到磁盘）。
source "$(dirname "$0")/lab_common.sh"
age() { cq HGET user:2050 age; }

section "一、缺省配置（只有 RDB，保存点 3600 1 300 100 60 10000）：写完 4096 个用户后立刻崩溃"
fresh; start; load
c DBSIZE
info persistence 'rdb_changes_since_last_save|rdb_saves'
crash
start
c DBSIZE
grep -E 'DB loaded|No such file|Server initialized|Ready to accept' "$LAB/redis.log" | tail -3 | sed -E 's/^[0-9]+:([MC]) [0-9]+ [A-Za-z]+ [0-9]+ [0-9:.]+ /\1 /'

section "二、缺省配置：保存过一次快照（Alice 42），之后改成 43，再崩溃"
fresh; start; load
c SAVE
c HSET user:2050 age 43
c HGET user:2050 age
crash
start
c DBSIZE
c HGET user:2050 age
grep -E 'DB loaded from disk' "$LAB/redis.log" | tail -1 | sed -E 's/^[0-9]+:([MC]) [0-9]+ [A-Za-z]+ [0-9]+ [0-9:.]+ /\1 /'

section "三、打开 AOF（appendfsync everysec）：改成 43 之后立刻崩溃"
fresh; start --appendonly yes; load
c HSET user:2050 age 43
crash
start --appendonly yes
c DBSIZE
c HGET user:2050 age
grep -E 'Reading RDB base|DB loaded from (append only|base|incr)|Done loading' "$LAB/redis.log" | tail -4 | sed -E 's/^[0-9]+:([MC]) [0-9]+ [A-Za-z]+ [0-9]+ [0-9:.]+ /\1 /'

section "四、AOF everysec：一个客户端不停地加一，0.5 秒后 kill -9；对比最后一次收到的回复与重启后的值"
fresh; start --appendonly yes
python3 - "$(pid)" <<'EOF'
import socket, sys, os, signal, threading, time
pid = int(sys.argv[1])
s = socket.create_connection(('127.0.0.1', 7379)); f = s.makefile('rb')
last = 0
def killer():
    time.sleep(0.5); os.kill(pid, signal.SIGKILL)
threading.Thread(target=killer).start()
try:
    while True:
        s.sendall(b'*2\r\n$4\r\nINCR\r\n$7\r\ncounter\r\n')
        line = f.readline()
        if not line: break
        last = int(line[1:])
except OSError:
    pass
print('崩溃前客户端最后收到的回复：', last)
EOF
while kill -0 "$(pid)" 2>/dev/null; do sleep 0.02; done
start --appendonly yes
printf '重启后 counter：'; cq GET counter

section "五、AOF 的最后一条只写了一半：把 incr 文件截掉末尾 5 个字节，模拟写到一半中断"
fresh; start --appendonly yes; load
c HSET user:2050 age 43
crash
inc=$(ls "$LAB/data/appendonlydir/"*.incr.aof | tail -1)
size=$(stat -c %s "$inc"); truncate -s $((size - 5)) "$inc"
printf 'incr 文件 %s → %s 字节；末尾现在是：\n' "$size" "$((size - 5))"
tail -c 40 "$inc" | cat -A; printf '\n'
start --appendonly yes
c DBSIZE
c HGET user:2050 age
grep -E -i 'truncat|AOF loaded anyway|unexpected end' "$LAB/redis.log" | tail -4 | sed -E 's/^[0-9]+:([MC]) [0-9]+ [A-Za-z]+ [0-9]+ [0-9:.]+ /\1 /'

section "六、appendfsync always：每条写命令先 fsync 再回复"
fresh; start --appendonly yes --appendfsync always; load
c HSET user:2050 age 43
crash
start --appendonly yes --appendfsync always
c HGET user:2050 age
stop
