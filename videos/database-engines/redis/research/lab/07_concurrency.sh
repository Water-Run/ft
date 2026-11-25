# 事务与并发：命令一条一条执行；MULTI/EXEC、WATCH 各保证什么，没有回滚。
source "$(dirname "$0")/lab_common.sh"
fresh; start; load
python3 "$(dirname "$0")/conc.py"

section "进程里的线程：执行命令的只有主线程"
ps -T -p "$(pid)" -o comm= | sort | uniq -c

section "源码：EXEC 里排队的命令逐条执行，出错也不回滚（multi.c）"
grep -n 'Exec all the queued commands' -A 3 "$R/multi.c"
grep -n 'EXEC with expired watched key is disallowed\|isWatchedKeyExpired\|CLIENT_DIRTY_CAS' "$R/multi.c" | head -6
stop
