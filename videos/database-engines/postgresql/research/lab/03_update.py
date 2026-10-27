"""03 改：Alice 42 → 43。

三种表各改一次，看页里的两个版本、三个索引的变化、这次更新写了哪些 WAL 记录：
  A users          系列原表（pglab.build，主键、姓名、年龄三个索引，fillfactor 100）。年龄有索引，Alice 所在的第 23 页也已满。
  B users_ff90     同样的数据与三个索引，表的 fillfactor 90（每页留一成空位）：页里有空位，但改的是有索引的列。
  C users_hot      fillfactor 90，只有主键与姓名两个索引：页里有空位，改的列也没有索引——HOT。之后再读这一页，看剪枝与重定向。
B、C 两表由 A 表按编号顺序整批复制（INSERT … SELECT），之后都先做 VACUUM ANALYZE（相当于自动清理已经做过一次）。
每次更新前做检查点，用 pg_walinspect 列出 [更新前, 提交后] 之间的 WAL 记录。
用法：python 03_update.py
"""
import re
from pglab import Lab, build, heap_items, page_head, index_entries


def blk_of(tid):
    return int(re.match(r'\((\d+),(\d+)\)', tid).group(1))


def lp_of(tid):
    return int(re.match(r'\((\d+),(\d+)\)', tid).group(2))


with Lab('03_update') as lab:
    a = lab.conn('admin'); q = lab.q
    build(lab, a)
    ddl = {
        'users_ff90': ['CREATE TABLE users_ff90 (id int NOT NULL PRIMARY KEY, name char(50) NOT NULL, age smallint NOT NULL) WITH (fillfactor = 90)',
                       'CREATE INDEX idx_ff90_name ON users_ff90 (name)', 'CREATE INDEX idx_ff90_age ON users_ff90 (age)'],
        'users_hot': ['CREATE TABLE users_hot (id int NOT NULL PRIMARY KEY, name char(50) NOT NULL, age smallint NOT NULL) WITH (fillfactor = 90)',
                      'CREATE INDEX idx_hot_name ON users_hot (name)'],
    }
    for t, stmts in ddl.items():
        for s in stmts:
            q(a, s)
        q(a, f'INSERT INTO {t} SELECT * FROM users ORDER BY id')
    for t in ('users', 'users_ff90', 'users_hot'):
        q(a, f'VACUUM ANALYZE {t}', tag='vacuum analyze ' + t)
    idx_of = {t: [r['indexrelid'] for r in q(a, f"SELECT indexrelid::regclass::text AS indexrelid FROM pg_index WHERE indrelid = '{t}'::regclass ORDER BY indexrelid", record=False)]
              for t in ('users', 'users_ff90', 'users_hot')}
    lab.r['indexes'] = idx_of

    results = {}
    for t in ('users', 'users_ff90', 'users_hot'):
        R = results[t] = {}
        old = q(a, f"SELECT ctid::text AS ctid, xmin::text AS xmin, age FROM {t} WHERE id = 2050", tag=f'{t} before')[0]
        ob = blk_of(old['ctid'])
        R['before'] = {'ctid': old['ctid'], 'xmin': old['xmin'], 'page_header': page_head(lab, a, t, ob, tag=f'{t} page {ob} header before'),
                       'free_bytes': None, 'alice_item': heap_items(lab, a, t, ob, [lp_of(old['ctid'])], tag=f'{t} alice item before'),
                       'vm': q(a, f"SELECT * FROM pg_visibility('{t}', {ob})", tag=f'{t} vm before')}
        h = R['before']['page_header']; R['before']['free_bytes'] = h['upper'] - h['lower']
        R['before']['index_entries'] = {i: index_entries(lab, a, i, [old['ctid']], tag=f'{t} before') for i in idx_of[t]}
        q(a, 'CHECKPOINT')
        lsn0 = q(a, 'SELECT pg_current_wal_lsn()::text AS lsn')[0]['lsn']
        q(a, 'BEGIN')
        xid = q(a, 'SELECT pg_current_xact_id()::text AS xid')[0]['xid']
        q(a, f'UPDATE {t} SET age = 43 WHERE id = 2050', tag=f'{t} update')
        q(a, 'COMMIT')
        lsn1 = q(a, 'SELECT pg_current_wal_lsn()::text AS lsn')[0]['lsn']
        # 提交后先用 get_raw_page 读（不会触发剪枝）：旧版本的 t_ctid 指向新版本。任何经过这一页的查询都可能顺手把旧版本剪掉
        old_item = heap_items(lab, a, t, ob, [lp_of(old['ctid'])], tag=f'{t} old version after')
        new = {'ctid': old_item[0]['t_ctid']}
        nb = blk_of(new['ctid'])
        new_item = heap_items(lab, a, t, nb, [lp_of(new['ctid'])], tag=f'{t} new version after')
        new['xmin'] = new_item[0]['t_xmin']
        R['update'] = {'xid': xid, 'lsn_before': lsn0, 'lsn_after': lsn1}
        R['after'] = {'ctid': new['ctid'], 'xmin': new['xmin'], 'same_page': nb == ob,
                      'old_item': old_item, 'new_item': new_item,
                      'old_page_header': page_head(lab, a, t, ob, tag=f'{t} page {ob} header after'),
                      'new_page_header': page_head(lab, a, t, nb, tag=f'{t} page {nb} header after'),
                      'vm_old_page': q(a, f"SELECT * FROM pg_visibility('{t}', {ob})", tag=f'{t} vm old page after'),
                      'index_entries': {i: index_entries(lab, a, i, [old['ctid'], new['ctid']], tag=f'{t} after') for i in idx_of[t]}}
        R['wal'] = q(a, f"SELECT start_lsn::text, resource_manager, record_type, record_length, main_data_length, fpi_length, block_ref "
                        f"FROM pg_get_wal_records_info('{lsn0}', '{lsn1}')", tag=f'{t} wal')
        # 第一次按编号读 Alice（经索引）：之后旧版本、页头、索引项各怎样
        q(a, f"SELECT ctid::text AS ctid, xmin::text AS xmin, age FROM {t} WHERE id = 2050", tag=f'{t} first read after update')
        R['after_first_read'] = {'old_item': heap_items(lab, a, t, ob, [lp_of(old['ctid'])], tag=f'{t} old version after first read'),
                                 'old_page_header': page_head(lab, a, t, ob, tag=f'{t} page {ob} header after first read'),
                                 'index_entries': {i: index_entries(lab, a, i, [old['ctid'], new['ctid']], tag=f'{t} after first read') for i in idx_of[t]}}
        q(a, 'SELECT pg_stat_force_next_flush()', record=False)
        R['stats'] = q(a, f"SELECT n_tup_upd, n_tup_hot_upd, n_tup_newpage_upd FROM pg_stat_user_tables WHERE relname = '{t}'", tag=f'{t} stats')
        print(f'== {t}: {old["ctid"]} -> {new["ctid"]} same_page={nb == ob} free_before={R["before"]["free_bytes"]} stats={R["stats"][0]}')
        print('   old', [(i['lp'], i['lp_flags'], i['t_xmax'], i['t_ctid'], i['flags']) for i in R['after']['old_item']])
        print('   new', [(i['lp'], i['t_xmin'], i['t_ctid'], i['flags']) for i in R['after']['new_item']])
        print('   index entries', {k: [(e['leaf'], e['itemoffset'], e['points_to']) for e in v] for k, v in R['after']['index_entries'].items()})
        print('   wal', [(w['resource_manager'], w['record_type'], w['record_length'], w['fpi_length']) for w in R['wal']])
        print('   after first read: old', [(i['lp'], i['lp_flags'], i['lp_off'], i['lp_len']) for i in R['after_first_read']['old_item']],
              'free', R['after_first_read']['old_page_header']['upper'] - R['after_first_read']['old_page_header']['lower'],
              'index dead', {k: [(e['leaf'], e['itemoffset'], e['points_to'], e['dead']) for e in v] for k, v in R['after_first_read']['index_entries'].items()})

    # ── C 表：第一次读取之后的 HOT 链；再看 VACUUM 之后 ──
    t = 'users_hot'; old = results[t]['before']['ctid']; ob = blk_of(old); nl = lp_of(results[t]['after']['ctid'])
    lab.r['hot_prune'] = {'after_read': heap_items(lab, a, t, ob, [lp_of(old), nl], tag='hot items after first read')}
    q(a, f'VACUUM (VERBOSE) {t}', tag='vacuum hot')
    lab.r['hot_prune']['after_vacuum'] = heap_items(lab, a, t, ob, [lp_of(old), nl], tag='hot items after vacuum')
    lab.r['hot_prune']['index_after_vacuum'] = {i: index_entries(lab, a, i, [old, results[t]['after']['ctid']], tag='hot after vacuum') for i in idx_of[t]}
    lab.r['results'] = results
    print('== hot after read', [(i['lp'], i['lp_flags'], i['lp_off'], i['lp_len'], i.get('flags')) for i in lab.r['hot_prune']['after_read']])
    print('== hot after vacuum', [(i['lp'], i['lp_flags'], i['lp_off'], i['lp_len'], i.get('flags')) for i in lab.r['hot_prune']['after_vacuum']])
