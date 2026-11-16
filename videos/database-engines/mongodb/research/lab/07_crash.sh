# 出错怎么办：mongod 被强制结束（kill -9）之后重启。检查点之后的修改靠日志（journal）重放回来；
# 已经确认、但还没写进日志文件的那一小段会丢。日志缺省每 100 毫秒落盘一次，写入时要求 j: true 则等落盘后才确认。
source "$(dirname "$0")/lab_common.sh"
load

section "缺省参数：检查点间隔 syncdelay（秒）、日志落盘间隔 journalCommitInterval（毫秒）"
m 'db.adminCommand({ getParameter: 1, syncdelay: 1, journalCommitInterval: 1 })'

section "先做一次检查点：此刻磁盘上的树里 Alice 是 42 岁"
m 'db.adminCommand({ fsync: 1 }).ok'

section "检查点之后：Alice 改年龄（j: true，等日志落盘才确认），Dave 注册（缺省写法，确认时不等日志落盘），然后强制结束 mongod"
m 'db.users.updateOne({ name: "Alice" }, { $set: { age: 43 } }, { writeConcern: { j: true } })'
m 'db.users.insertOne({ name: "Dave", age: 19 })'
echo '$ kill -9 <mongod 的进程号>'; kill -9 "$(pid)"; wait_gone; echo '已强制结束'; echo

section "崩溃后磁盘上的日志：最后一个检查点之后记下了什么"
cd "$LAB"; rm -rf wtlog; cp -a "$DB" wtlog
(cd wtlog && wt -C "log=(enabled=true,path=journal,compressor=snappy,remove=false)" printlog -u -x 2>/dev/null) > printlog.txt || true
python3 "$HERE/log_tail.py" printlog.txt
printf '集合文件 %s.wt 的文件号：' "$COLL"; (cd wtlog && wt -C "$WTC" list -v "file:$COLL.wt" 2>/dev/null | grep -o ',id=[0-9]*' | head -1 | cut -c5-) || true
rm -rf wtlog; echo

section "重启：从检查点起重放日志"
start
grep -o '"msg":"recovery was completed successfully[^"]*"' "$LAB/$DB.log" | tail -1; echo
m 'db.users.find({ name: { $in: ["Alice", "Dave"] } }, { _id: 0 }).toArray()'
m 'db.users.countDocuments()'

section "重复：每种写法各写 5 次，写完立刻强制结束，重启后看还在不在"
trial() {  # trial 标签 写入选项 写后等待秒数
  local kept=0
  for i in 1 2 3 4 5; do
    mv_ "db.users.insertOne({ name: \"$1-$i\", age: 30 }$2).acknowledged" >/dev/null
    sleep "$3"; kill -9 "$(pid)"; wait_gone; start
    [ "$(mv_ "db.users.countDocuments({ name: \"$1-$i\" })")" = 1 ] && kept=$((kept + 1))
  done
  echo "$1：5 次里重启后还在 $kept 次"
}
trial '缺省，立刻结束' '' 0
trial 'j: true，立刻结束' ', { writeConcern: { j: true } }' 0
trial '缺省，等 0.3 秒再结束' '' 0.3
stop
