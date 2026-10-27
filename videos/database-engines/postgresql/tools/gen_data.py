"""research/lab 的回显 → 画面数据 src/js/data.js（由脚本生成，不要手改）。

画面上的页号、项号、事务号、字节、计划、日志行都从这里取；场景代码只读 window.DATA。
用法：python tools/gen_data.py（在本片目录或仓库根目录运行都可以）
"""
import json
import re
from pathlib import Path

VIDEO = Path(__file__).resolve().parent.parent
LAB = VIDEO / 'research' / 'lab'
OUT = VIDEO / 'src' / 'js' / 'data.js'


def load(name):
    return json.loads((LAB / name).read_text(encoding='utf-8'))


def tagged(r, tag):
    return next(q for q in r['queries'] if q.get('tag') == tag)['rows']


def tid(s):
    m = re.match(r'\((\d+),(\d+)\)', s)
    return [int(m.group(1)), int(m.group(2))]


def le_int(hexs):
    b = bytes.fromhex(hexs.replace(' ', ''))
    return int.from_bytes(b[:4], 'little', signed=True)


D = {}

# ── 开场：调查 ──
sv = load('out_08_survey.json')
D['survey'] = [{'year': y['year'], 'pg': y['data']['PostgreSQL']['percent'], 'my': y['data']['MySQL']['percent']} for y in sv['years']]
D['survey2026top'] = sv['years'][-1]['export']['top5']

# ── 整体结构、一页之内、增 ──
b = load('out_01_build.json')
per_page = tagged(b, 'rows per heap page')
D['heap'] = {'pages': len(per_page), 'rows': [p['rows'] for p in per_page], 'first': [p['first_id'] for p in per_page], 'bytes': 8192 * len(per_page)}
D['alice'] = {'ctid': tid(b['alice']['ctid']), 'xmin': int(b['alice']['xmin']), 'row_size': b['alice']['row_size'], 'name_size': b['alice']['name_size']}
rel = next(q for q in b['queries'] if 'pg_relation_filepath' in q['sql'])['rows']
D['files'] = {r['relname']: {'path': r['path'], 'node': r['relfilenode']} for r in rel}
for name, sizes in b['files_after_vacuum'].items():
    D['files'][name]['sizes'] = sizes
trees = {}
for idx, t in b['trees'].items():
    root = t['meta']['root']
    items = tagged(b, f'{idx} root items')
    order = [tid(it['ctid'])[0] for it in items]          # 根页里下指针的先后 = 叶子从左到右
    keys = [it['data'] for it in items]
    leaf = t['alice_leaf']
    trees[idx] = {'root': root, 'pages': t['pages_total'], 'leaves': order, 'leafCount': len(order), 'aliceLeaf': leaf,
                  'aliceLeafPos': order.index(leaf), 'aliceItem': {'off': t['alice_item']['itemoffset'], 'len': t['alice_item']['itemlen']},
                  'keys': keys, 'liveItems': t['leaf_live_items']}
    if idx == 'users_pkey':
        trees[idx]['keyInts'] = [le_int(k) if k else None for k in keys]
D['trees'] = trees
tids = b['trees']['idx_age']['alice_item']['tids']
D['agePosting'] = {'count': len(re.findall(r'\(\d+,\d+\)', tids or '')), 'len': b['trees']['idx_age']['alice_item']['itemlen']}
ap = b['alice_page']
D['page23'] = {'blk': ap['blk'], 'lower': ap['header']['pd_lower'], 'upper': ap['header']['pd_upper'], 'special': ap['header']['pd_special'],
               'lps': ap['line_pointers'], 'aliceLp': ap['alice_item']['lp'], 'aliceOff': ap['alice_item']['lp_off'], 'aliceLen': ap['alice_item']['lp_len'],
               'headerHex': ap['alice_item']['header_hex'], 'dataHex': ap['alice_item']['data_hex'], 'flags': ap['alice_item']['flags'],
               'checksumDisk': b['alice_page_on_disk']['pd_checksum']}
g = b['growth']
heap_new = []
prev = None
for e in g:
    if e['pages']['heap'] != prev:
        heap_new.append(e['row']); prev = e['pages']['heap']
firsts = {}
for e in g:
    for idx, m in e['meta'].items():
        if m['level'] >= 1 and idx not in firsts:
            firsts[idx] = e['row']
pk_add = []
prev = None
for e in g:
    n = e['pages']['users_pkey']
    if n != prev:
        pk_add.append(e['row']); prev = n
at_alice = [e for e in g if e['row'] <= 2050][-1]['pages']          # Alice 注册（第 2050 行）那一刻各对象的页数
D['growth'] = {'heapNewPageRows': heap_new, 'rootAtRow': firsts, 'pkPageRows': pk_add, 'pagesAtAlice': at_alice}
D['aliceAtInsert'] = b['alice_at_insert']

# ── 查 ──
qy = load('out_02_query.json')
D['plans'] = qy['plans_before_vacuum']
D['cold'] = {k: [{'rel': r['relname'], 'blocks': r['blocks'] if r['n'] < 12 else None, 'n': r['n']} for r in v['pages']] for k, v in qy['cold_paths'].items()}
D['ios'] = qy['index_only']

# ── 改 ──
up = load('out_03_update.json')
U = {}
for t, R in up['results'].items():
    U[t] = {'old': tid(R['before']['ctid']), 'new': tid(R['after']['ctid']), 'xid': int(R['update']['xid']), 'freeBefore': R['before']['free_bytes'],
            'samePage': R['after']['same_page'], 'stats': R['stats'][0],
            'wal': [[w['resource_manager'], w['record_type'], w['record_length'], w['fpi_length']] for w in R['wal'] if ' 1663/5/1255 ' not in (w['block_ref'] or '') + ' '],
            'index': {k: [[e['leaf'], e['itemoffset'], e['points_to']] for e in v] for k, v in R['after']['index_entries'].items()},
            'afterRead': {'lpFlags': R['after_first_read']['old_item'][0]['lp_flags'],
                          'free': R['after_first_read']['old_page_header']['upper'] - R['after_first_read']['old_page_header']['lower']}}
U['hotAfterRead'] = [{'lp': i['lp'], 'flags': i['lp_flags'], 'off': i['lp_off']} for i in up['hot_prune']['after_read']]
D['update'] = U

# ── 事务与并发 ──
mv = load('out_04_mvcc.json')['steps']
D['mvcc'] = {'xid': int(mv['1_alice_uncommitted']['xid']), 'snapshot': mv['2_bob']['snapshot'], 'bobReads': mv['2_bob']['reads'],
             'carolXid': int(mv['4_after_commit']['carol']['xid']), 'carolGot': mv['4_after_commit']['carol']['returning'][0]['age'],
             'bobAfter': mv['4_after_commit']['bob_reads'], 'bobRR': mv['4_after_commit']['bob_rr_reads'], 'rrError': mv['4_after_commit']['bob_rr_update'],
             'locks': [[l['application_name'], l['locktype'], l['transactionid'], l['mode'], l['granted']] for l in mv['3_carol_waits']['locks']],
             'wait': [[a['application_name'], a['wait_event_type'], a['wait_event']] for a in mv['3_carol_waits']['activity']]}

# ── 删与回收 ──
dl = load('out_05_delete_vacuum.json')
st = dl['steps']
vac = {}
for tag in ('vacuum while bob holds snapshot', 'vacuum after bob'):
    notes = next(q for q in dl['queries'] if q.get('tag') == tag).get('notices', [])
    text = '\n'.join(notes)
    vac[tag] = [ln for ln in text.splitlines() if ln.startswith(('tuples:', 'removable cutoff:', 'index scan', 'finished'))]
D['delete'] = {'xid': int(st['1_deleted']['xid']), 'freeBefore': st['0_before']['free'], 'freeAfter': st['3_reclaimed']['free'],
               'fsmAfter': st['3_reclaimed']['fsm'], 'dave': tid(st['4_dave']['ctid']), 'vacuum': vac,
               'frozen': [st['5_freeze']['before'][0]['relfrozenxid'], st['5_freeze']['after'][0]['relfrozenxid']]}

# ── 出错 ──
wc = load('out_06_wal_crash.json')['steps']
log = wc['5_recovery']['server_log']
D['wal'] = {'flushBefore': wc['3_alice_commit']['flush_before_commit'], 'flushAfter': wc['3_alice_commit']['flush_after_commit'],
            'buffer': wc['3_alice_commit']['page_in_buffer'], 'disk': wc['3_alice_commit']['page_on_disk'],
            'carolFpi': [[w['record_type'], w['fpi_length']] for w in wc['2_carol']['wal']],
            'second': [[w['record_type'], w['fpi_length']] for w in wc['4_second_change']['wal']],
            'recovery': [re.sub(r'^\S+ \S+ \S+ \[\d+\] ', '', ln) for ln in log.splitlines()
                         if any(k in ln for k in ('interrupted', 'not properly shut down', 'redo starts', 'redo done', 'ready to accept'))],
            'after': {k: wc['5_recovery'][k] for k in ('alice', 'bob', 'carol_status', 'alice_status')}}

# ── 正统 ──
D['orthodox'] = load('out_07_orthodox.json')['steps']

OUT.write_text('// 由 tools/gen_data.py 从 research/lab 的回显生成，不要手改。\nwindow.DATA = ' +
               json.dumps(D, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8', newline='\n')
print('wrote', OUT.relative_to(VIDEO), OUT.stat().st_size, 'bytes')
