# 事务与并发：单节点副本集（多文档事务与快照读要求副本集）。
# Bob 在快照里读 Alice；Alice 改年龄提交后，Bob 的快照仍读到旧值。Carol 与 Alice 同时改同一份文档：写冲突。
source "$(dirname "$0")/lab_common.sh"
section "单机的 mongod 不支持多文档事务"
fresh; start
m 'db.runCommand({ insert: "users", documents: [{ name: "Bob" }], lsid: { id: UUID() }, txnNumber: NumberLong("1"), startTransaction: true, autocommit: false })'
stop

section "改成单节点副本集"
fresh; start --replSet rs0
mv_ 'rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "127.0.0.1:'"$PORT"'" }] }).ok' >/dev/null
for _ in $(seq 1 100); do [ "$(mv_ 'db.hello().isWritablePrimary')" = true ] && break; sleep 0.2; done
mv_ "$LOAD_JS" >/dev/null; mv_ 'db.users.createIndex({ name: 1 })' >/dev/null

section "Bob 开一个快照读的事务，读 Alice；Alice 改年龄并提交；Bob 再读"
m 'const bob = db.getMongo().startSession(); const B = bob.getDatabase("lab").users;
bob.startTransaction({ readConcern: { level: "snapshot" } });
print("Bob 第一次读：", B.findOne({ name: "Alice" }).age);
print("Alice 改年龄：", db.users.updateOne({ name: "Alice" }, { $set: { age: 43 } }).modifiedCount, "份");
print("Bob 在同一个事务里再读：", B.findOne({ name: "Alice" }).age);
print("事务外此刻读：", db.users.findOne({ name: "Alice" }).age);
bob.commitTransaction(); bob.endSession();
print("Bob 结束事务后再读：", db.users.findOne({ name: "Alice" }).age)'

section "Alice 在一个事务里改年龄，还没提交；Carol 也在事务里改同一份文档"
m 'const a = db.getMongo().startSession(), c = db.getMongo().startSession();
a.startTransaction(); a.getDatabase("lab").users.updateOne({ name: "Alice" }, { $set: { age: 44 } });
c.startTransaction();
try { c.getDatabase("lab").users.updateOne({ name: "Alice" }, { $set: { age: 45 } }); print("Carol 成功"); }
catch (e) { print({ "Carol 的错误": e.codeName, "错误标签": e.errorLabels }); }
try { c.abortTransaction(); } catch (e) {}
a.commitTransaction();
print("Alice 提交之后：", db.users.findOne({ name: "Alice" }).age);
c.startTransaction(); c.getDatabase("lab").users.updateOne({ name: "Alice" }, { $set: { age: 45 } }); c.commitTransaction();
print("Carol 重做一遍事务：", db.users.findOne({ name: "Alice" }).age)'

section "Alice 的事务没提交时，Carol 不用事务直接改：服务端自己重试，等 Alice 提交"
m 'db.setProfilingLevel(2).ok'
mongosh --quiet --port "$PORT" lab --eval '
const a = db.getMongo().startSession(); a.startTransaction();
a.getDatabase("lab").users.updateOne({ name: "Alice" }, { $set: { age: 46 } });
sleep(1500); a.commitTransaction(); print("[Alice 的事务在 1.5 秒后提交]")' &
sleep 0.4
m 'const t0 = Date.now(); const r = db.users.updateOne({ name: "Alice" }, { $inc: { age: 1 } });
print({ "Carol 修改了": r.modifiedCount, "等了约（毫秒）": Math.round((Date.now() - t0) / 100) * 100 })'
wait
m 'const p = db.system.profile.find({ op: "update", "command.u.$inc": { $exists: true } }).sort({ ts: -1 }).limit(1).next(); print({ writeConflicts: p.writeConflicts, nModified: p.nModified })'
m 'db.setProfilingLevel(0).was'
m 'db.users.findOne({ name: "Alice" }, { _id: 0 })'

stop
