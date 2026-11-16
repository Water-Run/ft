# 改：Alice 过生日，42 → 43。看这次修改碰了哪些索引、拿了哪些锁；做完检查点后，集合文件里哪一页换了位置、旧位置怎样了。
source "$(dirname "$0")/lab_common.sh"
load
stop; snap

section "修改之前：集合文件里各页的位置（正常关闭时做完一次检查点）"
w verify -d dump_address "file:$COLL.wt"
sh_ "ls -l $DB/$COLL.wt | awk '{print \$5}'"

start
section "改年龄（打开操作记录，看这次修改的细节）"
m 'db.setProfilingLevel(2).ok'
m 'db.users.updateOne({ name: "Alice" }, { $set: { age: 43 } })'
m 'const p = db.system.profile.find({ op: "update" }).sort({ ts: -1 }).limit(1).next(); print({ keysExamined: p.keysExamined, docsExamined: p.docsExamined, nMatched: p.nMatched, nModified: p.nModified, keysInserted: p.keysInserted ?? 0, keysDeleted: p.keysDeleted ?? 0, writeConflicts: p.writeConflicts ?? 0, locks: p.locks, planSummary: p.planSummary })'
m 'db.setProfilingLevel(0).was'
m 'db.users.find({ name: "Alice" }).showRecordId().toArray()'

section "改完、检查点之前：集合文件的大小没有变（改动还在缓存里）"
sh_ "ls -l $DB/$COLL.wt | awk '{print \$5}'"
m 'db.users.stats().wiredTiger.cache["tracked dirty bytes in the cache"]'

section "做一次检查点（fsync 命令），再看各页的位置"
m 'db.adminCommand({ fsync: 1 }).ok'
m "$REUSE"
stop; snap
w verify -d dump_address "file:$COLL.wt"
sh_ "ls -l $DB/$COLL.wt | awk '{print \$5}'"
section "检查点里 Alice 那一项"
wq dump -x "table:$COLL" > "$LAB/dump_coll.txt"; python3 "$HERE/find_kv.py" "$LAB/dump_coll.txt" 416c69636500 0; echo
