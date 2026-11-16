# 查：按姓名找 Alice。没有姓名索引时是集合扫描；有了索引，先在索引树里找到 RecordId，再到集合树取文档。用 explain 的执行统计实测。
source "$(dirname "$0")/lab_common.sh"
fresh; start
mv_ "$LOAD_JS" >/dev/null

STATS='const e = db.users.find({ name: "Alice" }).explain("executionStats"); const st = e.executionStats;
const plan = (s) => s ? [s.stage].concat(plan(s.inputStage)) : [];
print({ "计划": plan(e.queryPlanner.winningPlan.queryPlan || e.queryPlanner.winningPlan).join(" ← "), "返回": st.nReturned, "看过的索引键": st.totalKeysExamined, "看过的文档": st.totalDocsExamined })'

section "没有姓名索引：find({ name: \"Alice\" })"
m 'db.users.find({ name: "Alice" })'
m "$STATS"

section "建姓名索引之后"
m 'db.users.createIndex({ name: 1 })'
m "$STATS"
m 'db.users.find({ name: "Alice" }).explain("executionStats").queryPlanner.winningPlan'

section "按 _id 找：_id 索引是建集合时自带的"
m 'db.users.getIndexes()'
m 'const id = db.users.findOne({ name: "Alice" })._id; const st = db.users.find({ _id: id }).explain("executionStats").executionStats; print({ "看过的索引键": st.totalKeysExamined, "看过的文档": st.totalDocsExamined, "阶段": st.executionStages.stage })'

section "按年龄找：age 没有索引，又回到集合扫描"
m 'const st = db.users.find({ age: 42 }).explain("executionStats").executionStats; print({ "返回": st.nReturned, "看过的文档": st.totalDocsExamined })'

section "查询本身也是一份文档：mongosh 的 find() 发给服务端的是 find 命令"
m 'db.runCommand({ find: "users", filter: { name: "Alice" } }).cursor.firstBatch'
stop
