# 增：空库里写入 4096 个用户，再加一个姓名索引；看 Alice 的文档、BSON 字节、RecordId，数据目录里的文件与各自对应的集合和索引。
source "$(dirname "$0")/lab_common.sh"
fresh; start

section "写入之前的数据目录"
sh_ "ls $DB"

section "写入 4096 个用户（不写 _id，由驱动生成）"
printf 'lab> %s\n' "$LOAD_JS"; mv_ "$LOAD_JS"; echo
m 'db.users.createIndex({ name: 1 })'
m 'db.users.countDocuments()'

section "Alice 的文档、字段类型与 BSON 大小"
m 'db.users.findOne({ name: "Alice" })'
m 'db.users.aggregate([{ $match: { name: "Alice" } }, { $project: { _id: { $type: "$_id" }, name: { $type: "$name" }, age: { $type: "$age" } } }]).toArray()'
m 'bsonsize(db.users.findOne({ name: "Alice" }))'
m 'bsonsize(db.users.findOne({ name: "User02049-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN" }))'

section "RecordId：存储引擎给每份文档的内部编号"
m 'db.users.find({}, { name: 1 }).showRecordId().limit(3).toArray()'
m 'db.users.find({ name: "Alice" }).showRecordId().toArray()'
m 'db.users.find({}, { name: 1 }).sort({ $natural: -1 }).showRecordId().limit(1).toArray()'

section "集合与索引各对应数据目录里的哪个文件"
m 'const s = db.users.stats({ indexDetails: true }); print({ collection: s.wiredTiger.uri, indexes: Object.fromEntries(Object.entries(s.indexDetails).map(([k, v]) => [k, v.uri])) })'
m 'db.adminCommand({ listDatabases: 1 }).databases.map(d => d.name)'
sh_ "ls -l $DB | awk '{print \$5, \$9}' | column -t"
sh_ "ls -l $DB/journal | awk 'NR>1{print \$5, \$9}'"

# 记下 ident 与 Alice 的 ObjectId，给 03 用
mv_ 'const s = db.users.stats({ indexDetails: true }); const id = (u) => u.replace("statistics:table:", "");
print("COLL=" + id(s.wiredTiger.uri)); print("ID_IDX=" + id(s.indexDetails._id_.uri)); print("NAME_IDX=" + id(s.indexDetails.name_1.uri));
print("ALICE_OID_HEX=" + db.users.findOne({ name: "Alice" })._id.toHexString())' > "$LAB/idents.sh"

section "集合文件与索引文件的建表配置（creationString）"
m 'print(db.users.stats().wiredTiger.creationString)'
m 'print(db.users.stats({ indexDetails: true }).indexDetails.name_1.creationString)'

section "写入之后、检查点之前：WiredTiger 统计（缓存里）"
m 'const w = db.users.stats().wiredTiger; print({ "集合在缓存里的字节": w.cache["bytes currently in the cache"], "集合文件的字节": w["block-manager"]["file size in bytes"] })'

section "等一次检查点（缺省每 60 秒），或者正常关闭"
stop
sh_ "ls -l $DB | awk '{print \$5, \$9}' | column -t"

section "mongod 打开 WiredTiger 时用的配置（日志里的 wiredtiger_open 一行）"
sh_ "grep -m1 -o '\"config\":\"create,cache_size[^\"]*\"' $DB.log"
section "缺省的检查点间隔与日志落盘间隔"
start
m 'db.adminCommand({ getParameter: 1, syncdelay: 1, journalCommitInterval: 1 })'
stop
