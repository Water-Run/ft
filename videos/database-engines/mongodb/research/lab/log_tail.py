"""读 wt printlog -u -x 的输出（一个 JSON 数组），列出最后一个检查点记录之后的每一条提交：日志序号、文件号、键、值里的姓名与年龄。
用法：python3 log_tail.py printlog.txt"""
import json, struct, sys

recs = json.load(open(sys.argv[1], encoding='utf-8'))
last = max(i for i, r in enumerate(recs) if r.get('type') == 'checkpoint')
print(f'最后一个检查点记录：lsn {recs[last]["lsn"]}，检查点从 lsn {recs[last]["ckpt_lsn"]} 起')

def fields(b):
    """极简的 BSON 读取：只认本实验用到的 ObjectId、字符串、int32"""
    out, i = {}, 4
    while i < len(b) - 1:
        t = b[i]; j = b.index(0, i + 1); k = b[i + 1:j].decode(); i = j + 1
        if t == 0x07: out[k] = b[i:i + 12].hex(); i += 12
        elif t == 0x02: n = struct.unpack('<i', b[i:i + 4])[0]; out[k] = b[i + 4:i + 3 + n].decode(); i += 4 + n
        elif t == 0x10: out[k] = struct.unpack('<i', b[i:i + 4])[0]; i += 4
        else: return out
    return out

n = 0
for r in recs[last + 1:]:
    if r.get('type') != 'commit':
        continue
    for op in r.get('ops', []):
        if op.get('fileid', 0) == 0:
            continue
        n += 1
        v = bytes.fromhex(op.get('value-hex', ''))
        f = fields(v) if len(v) > 5 and v[4] == 0x07 else {}
        desc = f'name={f["name"]}, age={f["age"]}（整份文档 {len(v)} 字节）' if 'name' in f else f'值 {len(v)} 字节'
        print(f'  lsn {r["lsn"]}  事务 {r["txnid"]}  {op["optype"]}  文件号 {op["fileid"]}  键 {op.get("key-hex", "")}  {desc}')
print(f'之后共 {n} 次对用户数据的写入')
