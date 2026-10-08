#!/bin/bash
# OpenCode v1.0.0：同一个实验。工具执行到一半时强杀进程，再用 --continue 接着跑，看磁盘上留下了什么、下一次发给模型的是什么。
# 用法（宿主上）：unshare -Urm --fork bash 11_crash_v1.sh <实验目录>
#   <实验目录>/tools/ 下预先放好 node、opencode（1.0.0 的平台包）与 mock.mjs（即 10_scripted_model.mjs）；
#   回显写到 <实验目录>/out/，入库前去掉与实验无关的进程后放进本目录的 exp_v1/。
set -u
LAB=$1
mount --bind "$LAB" /mnt
mount -t tmpfs tmpfs /home
mkdir -p /home/user
mount --bind /mnt /home/user
export HOME=/home/user LANG=C.UTF-8
unset XDG_RUNTIME_DIR LC_ALL
export PATH=/home/user/tools:/usr/bin:/bin
T=/home/user/tools
OUT=/home/user/out
mkdir -p $OUT /home/user/demo
cd /home/user/demo

PORT=18557 LOG=$OUT/model SLEEP=20 $T/node $T/mock.mjs > $OUT/mock.out 2>&1 &
MOCK=$!
sleep 1

echo "== $(date -u +%FT%TZ) start: opencode run" | tee -a $OUT/timeline.txt
$T/oc1 run "Write a note." > $OUT/run1.out 2>&1 &
RUN=$!
for i in $(seq 1 300); do
  grep -q "tool:" $OUT/model/decisions.txt 2>/dev/null && pgrep -f "sleep 20" >/dev/null && break
  sleep 0.5
done
sleep 4
echo "== $(date -u +%FT%TZ) tool is running: $(pgrep -af 'sleep 20' | head -1)" | tee -a $OUT/timeline.txt
ps -eo pid,ppid,args > $OUT/ps_before.txt
echo "== $(date -u +%FT%TZ) kill -9 opencode pid=$RUN" | tee -a $OUT/timeline.txt
kill -9 $RUN
sleep 1
ps -eo pid,ppid,args > $OUT/ps_after_kill.txt
(cd /home/user/.local/share/opencode && find storage -type f | sort) > $OUT/storage_after_kill.txt
cp -r /home/user/.local/share/opencode/storage $OUT/storage_after_kill

echo "== $(date -u +%FT%TZ) continue: opencode run --continue" | tee -a $OUT/timeline.txt
$T/oc1 run --continue "Continue." > $OUT/run2.out 2>&1
echo "== $(date -u +%FT%TZ) run --continue exited ($?)" | tee -a $OUT/timeline.txt
for i in $(seq 1 60); do pgrep -f "sleep 20" >/dev/null || break; sleep 0.5; done
sleep 1
echo "== $(date -u +%FT%TZ) orphaned command finished; note.txt now:" | tee -a $OUT/timeline.txt
cat /home/user/demo/note.txt >> $OUT/timeline.txt 2>&1
(cd /home/user/.local/share/opencode && find storage -type f | sort) > $OUT/storage_final.txt
cp -r /home/user/.local/share/opencode/storage $OUT/storage_final
kill $MOCK
echo "== $(date -u +%FT%TZ) done" | tee -a $OUT/timeline.txt
