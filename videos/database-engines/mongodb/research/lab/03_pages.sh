# 查：数据目录里的三棵 B 树（集合、_id 索引、姓名索引）的真实形状，以及 Alice 在每棵树里的那一项。
# 接着 02：用 02 正常关闭后的数据目录的副本（wt 打开时会做恢复与检查点，不在原目录上运行）。
source "$(dirname "$0")/lab_common.sh"
cd "$LAB"; snap
source "$LAB/idents.sh"     # 02 写下的 COLL、ID_IDX、NAME_IDX（ident 名）与 Alice 的 ObjectId

for t in "集合 users:$COLL" "_id 索引:$ID_IDX" "姓名索引 name_1:$NAME_IDX"; do
  label=${t%%:*}; id=${t#*:}
  section "$label（$id.wt）：树形"
  w verify -d dump_tree_shape "file:$id.wt"
  section "$label：每一页在文件里的位置（偏移-结束, 长度, 校验和）"
  w verify -d dump_address "file:$id.wt"
done

section "集合 users：各页的键（RecordId）"
printf '$ wt verify -k -d dump_pages file:%s.wt   （只列页头与每页第一个、最后一个键）\n' "$COLL"
(cd wtcopy && wt -C "$WTC" verify -k -d dump_pages "file:$COLL.wt" 2>&1) > pages_coll.txt || true
python3 "$HERE/summarize_pages.py" pages_coll.txt; echo

section "集合 users：Alice 那一项（键 = RecordId，按 WiredTiger 的整数打包；值 = 整份 BSON）"
(cd wtcopy && wt -C "$WTC" dump -x "table:$COLL" 2>/dev/null) > dump_coll.txt || true
python3 "$HERE/find_kv.py" dump_coll.txt 416c69636500 1; echo

section "姓名索引：Alice 那一项（键 = 姓名的 KeyString + RecordId，值 = 类型位）"
(cd wtcopy && wt -C "$WTC" dump -x "table:$NAME_IDX" 2>/dev/null) > dump_name.txt || true
python3 "$HERE/find_kv.py" dump_name.txt 416c69636500 3; echo

section "_id 索引：Alice 那一项（键 = ObjectId 的 KeyString，值 = RecordId + 类型位）"
(cd wtcopy && wt -C "$WTC" dump -x "table:$ID_IDX" 2>/dev/null) > dump_id.txt || true
python3 "$HERE/find_kv.py" dump_id.txt "$ALICE_OID_HEX" 1; echo

section "数据目录里的其他文件"
w list
rm -rf wtcopy
