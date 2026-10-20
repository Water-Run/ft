#!/bin/bash
# OpenCode v2.0.24：工具执行到一半时强杀后台服务，再重启，看它留下了什么、恢复时做了什么。
# 在用户命名空间里运行：实验目录被挂成 /home/user，回显里只有这个通用路径。
# 用法（宿主上）：unshare -Urm --fork bash 12_crash_v2.sh <实验目录>
#   <实验目录>/tools/ 下预先放好 node、opencode（2.0.24 的平台包）与 mock.mjs（即 10_scripted_model.mjs）；
#   回显写到 <实验目录>/out/，入库前去掉与实验无关的进程后放进本目录的 exp_v2/。
set -u
LAB=$1
mount --bind "$LAB" /mnt
mount -t tmpfs tmpfs /home
mkdir -p /home/user
mount --bind /mnt /home/user
export HOME=/home/user
unset XDG_RUNTIME_DIR
export PATH=/home/user/tools:/usr/bin:/bin
T=/home/user/tools
OUT=/home/user/out
mkdir -p $OUT /home/user/demo
cd /home/user/demo

PORT=18556 LOG=$OUT/model SLEEP=20 $T/node $T/mock.mjs > $OUT/mock.out 2>&1 &
MOCK=$!
sleep 1

echo "== $(date -u +%FT%TZ) start: opencode run" | tee -a $OUT/timeline.txt
$T/oc2 run --auto "Write a note." > $OUT/run1.out 2>&1 &
RUN=$!

# 等到模型要求调用工具，且工具已经开始执行（命令在睡眠）
for i in $(seq 1 120); do
  grep -q "tool:" $OUT/model/decisions.txt 2>/dev/null && pgrep -f "sleep 20" >/dev/null && break
  sleep 0.5
done
sleep 4
echo "== $(date -u +%FT%TZ) tool is running: $(pgrep -af 'sleep 20' | head -1)" | tee -a $OUT/timeline.txt
$T/oc2 service status > $OUT/service_before.txt 2>&1
SVC=$(pgrep -f "oc2 serve --service" | head -1)
ps -eo pid,ppid,args > $OUT/ps_before.txt
echo "== $(date -u +%FT%TZ) kill -9 service pid=$SVC" | tee -a $OUT/timeline.txt
kill -9 $SVC
sleep 1
ps -eo pid,ppid,args > $OUT/ps_after_kill.txt
wait $RUN 2>/dev/null
echo "== $(date -u +%FT%TZ) run client exited" | tee -a $OUT/timeline.txt
ls -la /home/user/demo > $OUT/demo_after_kill.txt
DB=$($T/oc2 debug paths db 2>/dev/null | tail -1)
echo "db=$DB" >> $OUT/timeline.txt
cp "$DB" $OUT/db_after_kill.sqlite 2>/dev/null; cp "$DB-wal" $OUT/db_after_kill.sqlite-wal 2>/dev/null

echo "== $(date -u +%FT%TZ) restart service" | tee -a $OUT/timeline.txt
$T/oc2 service start > $OUT/service_start.txt 2>&1
for i in $(seq 1 120); do
  grep -q "final" $OUT/model/decisions.txt 2>/dev/null && break
  sleep 0.5
done
echo "== $(date -u +%FT%TZ) model gave final answer; note.txt now:" | tee -a $OUT/timeline.txt
cat /home/user/demo/note.txt >> $OUT/timeline.txt 2>&1
# 等被强杀的服务留下的那条命令自己跑完
for i in $(seq 1 60); do pgrep -f "sleep 20" >/dev/null || break; sleep 0.5; done
sleep 1
echo "== $(date -u +%FT%TZ) orphaned command finished; note.txt now:" | tee -a $OUT/timeline.txt
echo "== $(date -u +%FT%TZ) after recovery" | tee -a $OUT/timeline.txt
ls -la /home/user/demo > $OUT/demo_after_recovery.txt
cat /home/user/demo/note.txt >> $OUT/timeline.txt 2>&1
$T/oc2 session list > $OUT/session_list.txt 2>&1
cp "$DB" $OUT/db_final.sqlite 2>/dev/null; cp "$DB-wal" $OUT/db_final.sqlite-wal 2>/dev/null
$T/oc2 service stop > $OUT/service_stop.txt 2>&1
kill $MOCK
echo "== $(date -u +%FT%TZ) done" | tee -a $OUT/timeline.txt
