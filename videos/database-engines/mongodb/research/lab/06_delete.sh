# 删：Alice 注销。看删除碰了哪些索引；检查点之后集合树里还有没有键 2050、空出来的块去了哪里；之后 Dave 注册，拿到哪个 RecordId、写进哪一页、用没用上空出来的块。
source "$(dirname "$0")/lab_common.sh"
load
m "$REUSE"
stop; snap
section "删除之前"
w verify -d dump_address "file:$COLL.wt"

start
section "删掉 Alice"
m 'db.setProfilingLevel(2).ok'
m 'db.users.deleteOne({ name: "Alice" })'
m 'const p = db.system.profile.find({ op: "remove" }).sort({ ts: -1 }).limit(1).next(); print({ keysExamined: p.keysExamined, docsExamined: p.docsExamined, ndeleted: p.ndeleted, keysDeleted: p.keysDeleted, planSummary: p.planSummary })'
m 'db.setProfilingLevel(0).was'
m 'db.users.countDocuments()'
m 'db.users.find({ name: "Alice" }).toArray()'

section "检查点之后：集合树里各页的位置，以及空出来的区段"
m 'db.adminCommand({ fsync: 1 }).ok'
m "$REUSE"
stop; snap
w verify -d dump_address "file:$COLL.wt"
sh_ "ls -l $DB/$COLL.wt | awk '{print \$5}'"
wq dump -x "table:$COLL" > "$LAB/dump_coll.txt"
printf '键 2049、2050、2051（c7c1、c7c2、c7c3）在不在：\n'; grep -c '^c7c[123]$' "$LAB/dump_coll.txt" || true; grep '^c7c[123]$' "$LAB/dump_coll.txt" || true; echo

start
section "Dave 注册"
m 'db.users.insertOne({ name: "Dave", age: 19 })'
m 'db.users.find({ name: "Dave" }).showRecordId().toArray()'
m 'db.adminCommand({ fsync: 1 }).ok'
m "$REUSE"
stop; snap
section "Dave 写进去之后：各页的位置与空闲区段"
w verify -d dump_address "file:$COLL.wt"
sh_ "ls -l $DB/$COLL.wt | awk '{print \$5}'"

section "文件不会自己变小：compact 才把空闲区段还给文件系统"
start
m "$REUSE"
m 'db.runCommand({ compact: "users" })'
m "$REUSE"
stop
sh_ "ls -l $DB/$COLL.wt | awk '{print \$5}'"
