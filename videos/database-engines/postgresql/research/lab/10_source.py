"""10 源码：PostgreSQL REL_18_4 标签下几份源文件里，本集要用的定义与规则，记下行号与原文。

文件从 GitHub 的 postgres/postgres 仓库按标签取（raw.githubusercontent.com），存进 research/_src/pg-REL_18_4/（不入库），记 SHA-256。
每条用一个正则定位，写出命中的行号与该行（和上下文几行）；找不到就报出来。
用法：python 10_source.py
"""
import hashlib
import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

LAB = Path(__file__).resolve().parent
TAG = 'REL_18_4'
DEST = LAB.parent / '_src' / f'pg-{TAG}'
RAW = f'https://raw.githubusercontent.com/postgres/postgres/{TAG}/'
CHECKS = {
    'src/include/storage/itemid.h': [('lp_off 15 位、lp_flags 2 位、lp_len 15 位', r'lp_off:15'), ('LP_UNUSED', r'#define LP_UNUSED'), ('LP_NORMAL', r'#define LP_NORMAL'),
                                     ('LP_REDIRECT', r'#define LP_REDIRECT'), ('LP_DEAD', r'#define LP_DEAD')],
    'src/include/storage/bufpage.h': [('页头结构', r'typedef struct PageHeaderData'), ('pd_lower', r'LocationIndex pd_lower;'), ('pd_upper', r'LocationIndex pd_upper;'),
                                      ('pd_prune_xid', r'TransactionId pd_prune_xid;')],
    'src/include/access/htup_details.h': [('元组头结构', r'struct HeapTupleHeaderData'), ('t_ctid', r'ItemPointerData t_ctid;'), ('HEAP_XMIN_FROZEN', r'#define HEAP_XMIN_FROZEN'),
                                          ('HEAP_HOT_UPDATED', r'#define HEAP_HOT_UPDATED'), ('HEAP_ONLY_TUPLE', r'#define HEAP_ONLY_TUPLE'),
                                          ('HEAP_XMAX_INVALID', r'#define HEAP_XMAX_INVALID'), ('SizeofHeapTupleHeader', r'#define SizeofHeapTupleHeader')],
    'src/backend/access/heap/pruneheap.c': [('读取时剪枝的门槛', r'minfree = Max\(minfree, BLCKSZ / 10\)'), ('门槛的判断', r'PageIsFull\(page\) \|\| PageGetHeapFreeSpace\(page\) < minfree')],
    'src/backend/access/heap/heapam.c': [('换页更新前先锁旧元组', r'Lock the old tuple|we need to lock the old tuple|temporarily mark it locked'),
                                         ('HOT 的条件：没有改到索引列且同页放得下', r'use_hot_update = true')],
    'src/backend/access/heap/README.HOT': [('HOT 的定义', r'Heap Only Tuple'), ('重定向', r'redirect')],
    'src/bin/initdb/initdb.c': [('initdb 默认开启校验和', r'static bool data_checksums = true')],
    'src/backend/storage/buffer/bufmgr.c': [('写盘时在副本上算校验和', r'bufToWrite = PageSetChecksumCopy\(')],
    'src/backend/optimizer/util/plancat.c': [('规划时取每个索引的树高（索引方法提供的函数）', r'tree_height = amroutine->amgettreeheight\(indexRelation\)')],
    'src/backend/access/nbtree/nbtree.c': [('B 树的取树高函数', r'amgettreeheight = btgettreeheight'), ('它调用 _bt_getrootheight', r'return _bt_getrootheight\(rel\)')],
    'src/backend/access/nbtree/nbtpage.c': [('树高从元数据页读', r'^_bt_getrootheight\(Relation rel\)'), ('用途：规划器估代价', r'This is used by the planner for cost-estimation purposes')],
}


def fetch(rel):
    p = DEST / rel.replace('/', '__')
    if not p.exists():
        for attempt in range(3):
            try:
                with urllib.request.urlopen(urllib.request.Request(RAW + rel, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60) as r:
                    p.write_bytes(r.read())
                break
            except urllib.error.URLError:
                if attempt == 2:
                    raise
                time.sleep(3)
    return p


DEST.mkdir(parents=True, exist_ok=True)
out = {'script': '10_source', 'date': time.strftime('%Y-%m-%d'), 'tag': TAG, 'repo': 'https://github.com/postgres/postgres', 'files': {}}
for rel, checks in CHECKS.items():
    p = fetch(rel)
    raw = p.read_bytes()
    lines = raw.decode('utf-8', errors='replace').splitlines()
    rec = {'url': f'https://github.com/postgres/postgres/blob/{TAG}/{rel}', 'sha256': hashlib.sha256(raw).hexdigest(), 'found': {}}
    for label, pat in checks:
        hits = [i for i, l in enumerate(lines) if re.search(pat, l)]
        if hits:
            i = hits[0]
            rec['found'][label] = {'line': i + 1, 'text': lines[i].strip(), 'context': [l.rstrip() for l in lines[max(0, i - 2):i + 4]]}
        else:
            rec['found'][label] = 'NOT FOUND'
    out['files'][rel] = rec
    print(rel, {k: (v['line'] if isinstance(v, dict) else v) for k, v in rec['found'].items()})
(LAB / 'out_10_source.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
