"""画面数据：从 research/lab/out_0N.json 取出画面要用的实测数字，写成 src/js/data.js（window.DATA）。
画面上的页号、行数、字节、日志序号都从这里来，不在场景里手写；改了实验就重跑本脚本。
用法：python tools/gen_data.py
"""
import io, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.join(HERE, '..', 'research', 'lab')
OUT = os.path.join(HERE, '..', 'src', 'js', 'data.js')


def load(n):
    return json.load(io.open(os.path.join(LAB, f'out_{n}.json'), encoding='utf-8'))


o1, o2, o3, o4, o5, o7 = load('01'), load('02'), load('03'), load('04'), load('05'), load('07')
U = o1['tables']['users']['trees']
B = o1['tables']['users_big']['trees']


def leaves(tree, key):
    return [{'page': p['page'], 'n': p['n_recs'], 'first': p['first'][key], 'last': p['last'][key], 'prev': p['prev'], 'next': p['next']}
            for p in tree['levels'][1]['page_list']]


def rec(r):
    return {k: r[k] for k in ('offset', 'id', 'name', 'age', 'trx_id', 'roll_ptr', 'deleted')}


def page_state(p):
    return {'n': p['n_recs'], 'garbage': p['garbage'], 'free': p['page_free_offset'], 'records': [rec(r) for r in p['records']]}


log = o4['server_log_recovery_lines']
second = log[[i for i, l in enumerate(log) if 'Double write buffer files' in l][0]:]        # 崩溃后那一次启动
pick = lambda key: next(l for l in second if key in l)
KEEP = ['The latest found checkpoint', 'Starting crash recovery', 'scanned up to log sequence number', 'Applying a batch of 187',
        'row operations to undo', 'Rolling back trx with id 1563', 'Rollback of trx with id 1563 completed']
logline = lambda l: l.split('[InnoDB] ', 1)[1] if '[InnoDB] ' in l else l

DATA = {
    'pk': {'root': U['PRIMARY']['root'], 'rootEntries': [{'id': r['id'], 'child': r['child']} for r in U['PRIMARY']['levels'][0]['root_entries']],
           'leaves': leaves(U['PRIMARY'], 'id')},
    'nm': {'root': U['idx_name']['root'], 'rootEntries': [{'name': r['name'], 'id': r['id'], 'child': r['child']} for r in U['idx_name']['levels'][0]['root_entries']],
           'leaves': leaves(U['idx_name'], 'name')},
    'file': {'pages': o1['tables']['users']['pages'], 'bytes': o1['tables']['users']['file_bytes']},
    'big': {k: [lv['pages'] for lv in B[k]['levels']] for k in ('PRIMARY', 'idx_name')},
    'alice': {'page': o2['A_before']['page'], 'offset': o2['A_before']['offset'], 'header': o2['A_before']['header_hex'],
              'before': {'hex': o2['A_before']['fields_hex'], **{k: o2['A_before']['record'][k] for k in ('trx_id', 'roll_ptr', 'age')}},
              'after': {'hex': o2['A_after']['fields_hex'], **{k: o2['A_after']['record'][k] for k in ('trx_id', 'roll_ptr', 'age')}},
              'trxOpen': o2['A_trx_id_while_open'][0]['trx_id'],
              'name': {'page': U['idx_name']['alice_record']['page'], 'offset': U['idx_name']['alice_record']['offset']}},
    'growth': [{'row': e['after_row'], 'index': e.get('index'), 'pages': {int(k): v for k, v in e['pages'].items()}} for e in o7['A_events'][1:]],
    'aliceInsert': {k: {int(p): n for p, n in v.items()} for k, v in o7['A_alice_insert'].items()},
    'dir': {k: o7['C_page_directory'][k] for k in ('page', 'n_recs', 'n_dir_slots', 'binary_search_probes', 'start_slot', 'first_slots', 'last_slots')},
    'explain': {k: [l for l in v.splitlines() if l.startswith('| ->')][0].strip('| ').split('  (cost')[0] for k, v in o7['E_explain'].items()},
    'files': o7['B_files'],
    'defaults': o7['defaults'],
    'lookup': [{'label': q['label'], 'sql': q['sql'], 'pages': q['new_pages_in_pool']} for q in o5['queries']],
    'rollback': o2['summary']['rollback'],
    'warning': 'Warning 1196 Some non-transactional changed tables couldn\'t be rolled back',
    'mvcc': o2['C'],
    'locks': {'carol': o2['D']['locks_while_carol_waits'], 'gap': o2['E']['locks'], 'carolErr': o2['D']['carol_result'].split(': ', 1)[1],
              'deadErr': o2['F']['carol'].split(': ', 1)[1]},
    'del': {k: page_state(o3[k]) for k in ('start', 'delete_marked', 'purged', 'dave')},
    'crash': {'lsn': 20359513, 'checkpoint': 19036061, 'scanned': 20362083, 'redo': 187, 'undo': 274, 'trx': 1563,
              'rowsAtKill': int(o4['bulk_progress_at_kill'][0]['rows_modified']), 'unchanged': int(o4['bulk_after_restart'][0]['unchanged']),
              'log': [logline(pick(k)) for k in KEEP]},
}
# 交叉核对：与 FACTS 里写的数字一致，不一致就停下
assert DATA['crash']['rowsAtKill'] == 258 and DATA['crash']['unchanged'] == 4095
assert 'LOG' in o4['log_at_kill'] and 'Log sequence number          20359513' in o4['log_at_kill'] and 'Last checkpoint at           19036061' in o4['log_at_kill']
assert [l['page'] for l in DATA['pk']['leaves']][10] == 27 and DATA['alice']['offset'] == 6184
assert DATA['big'] == {'PRIMARY': [1, 5, 4832], 'idx_name': [1, 15, 3664]}

js = '// 由 tools/gen_data.py 从 research/lab/out_0N.json 生成，不手改。\nwindow.DATA = ' + json.dumps(DATA, ensure_ascii=False, indent=1) + ';\n'
io.open(OUT, 'w', encoding='utf-8', newline='\n').write(js)
print('data.js', len(js), 'bytes;', len(DATA['growth']), 'growth events')
