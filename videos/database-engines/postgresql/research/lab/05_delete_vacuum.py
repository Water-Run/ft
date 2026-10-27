"""05 删与回收。

同一张表（pglab.build，再 VACUUM 一次）：
1. Bob 以可重复读开着一个快照（读到 Alice 42）。管理员删掉 Alice 并提交：页里的那一行还在，只是 xmax 记上了删除它的事务。
2. Bob 仍能读到 Alice。此时 VACUUM VERBOSE：这一行「已死但还不能回收」（Bob 的快照还可能要它）。
3. Bob 结束后再 VACUUM VERBOSE：行被收回、三个索引里指向它的项被删掉、项目指针变成空闲；FSM 里这一页的可用空间。
4. Dave 注册（2050, 'Dave', 35）：他的行落在哪一页、哪个项目指针。
5. 冻结：VACUUM (FREEZE, VERBOSE) 前后的 relfrozenxid、元组的标志位；自动清理与冻结相关设置的默认值。
用法：python 05_delete_vacuum.py
"""
import re
from pglab import Lab, build, heap_items, page_head, index_entries

IDX = ['users_pkey', 'idx_name', 'idx_age']


def blk_lp(tid):
    m = re.match(r'\((\d+),(\d+)\)', tid)
    return int(m.group(1)), int(m.group(2))


with Lab('05_delete_vacuum') as lab:
    adm = lab.conn('admin'); q = lab.q
    build(lab, adm)
    q(adm, 'VACUUM users', tag='settle')
    tid = q(adm, "SELECT ctid::text AS ctid FROM users WHERE id = 2050")[0]['ctid']
    b, l = blk_lp(tid)
    S = lab.r['steps'] = {}
    S['0_before'] = {'ctid': tid, 'page_header': page_head(lab, adm, 'users', b), 'free': None,
                     'fsm': q(adm, f"SELECT pg_freespace('users', {b}) AS avail", tag='fsm before')[0]['avail'],
                     'index_entries': {i: index_entries(lab, adm, i, [tid], tag='before delete') for i in IDX}}
    S['0_before']['free'] = S['0_before']['page_header']['upper'] - S['0_before']['page_header']['lower']

    # 1. Bob 开快照；删除 Alice
    bob = lab.conn('bob')
    q(bob, 'BEGIN ISOLATION LEVEL REPEATABLE READ')
    bob_before = q(bob, 'SELECT name, age FROM users WHERE id = 2050', tag='bob reads before delete')[0]
    q(adm, 'BEGIN')
    dx = q(adm, 'SELECT pg_current_xact_id()::text AS xid')[0]['xid']
    q(adm, 'DELETE FROM users WHERE id = 2050', tag='delete alice')
    q(adm, 'COMMIT')
    S['1_deleted'] = {'xid': dx, 'bob_before': bob_before, 'item': heap_items(lab, adm, 'users', b, [l], tag='alice after delete')[0],
                      'admin_sees': q(adm, 'SELECT count(*) AS n FROM users WHERE id = 2050', tag='admin after delete')[0]['n']}

    # 2. Bob 仍能读到；VACUUM 回收不了
    S['2_blocked'] = {'bob_sees': q(bob, 'SELECT name, age FROM users WHERE id = 2050', tag='bob reads after delete')[0],
                      'bob_snapshot': q(bob, 'SELECT pg_current_snapshot()::text AS s')[0]['s'],
                      'oldest': q(adm, "SELECT application_name, backend_xmin::text AS backend_xmin, state FROM pg_stat_activity WHERE backend_xmin IS NOT NULL ORDER BY application_name", tag='who holds back xmin')}
    q(adm, 'VACUUM (VERBOSE) users', tag='vacuum while bob holds snapshot')
    S['2_blocked']['item_after_vacuum'] = heap_items(lab, adm, 'users', b, [l], tag='alice after blocked vacuum')[0]
    S['2_blocked']['index_entries'] = {i: index_entries(lab, adm, i, [tid], tag='after blocked vacuum') for i in IDX}

    # 3. Bob 结束；再 VACUUM
    q(bob, 'COMMIT')
    q(adm, 'VACUUM (VERBOSE) users', tag='vacuum after bob')
    h = page_head(lab, adm, 'users', b, tag='page after vacuum')
    S['3_reclaimed'] = {'item': heap_items(lab, adm, 'users', b, [l], tag='alice slot after vacuum')[0], 'page_header': h, 'free': h['upper'] - h['lower'],
                        'fsm': q(adm, f"SELECT pg_freespace('users', {b}) AS avail", tag='fsm after vacuum')[0]['avail'],
                        'fsm_last_page': q(adm, "SELECT blkno, avail FROM pg_freespace('users') WHERE avail > 0 ORDER BY blkno", tag='pages with free space'),
                        'index_entries': {i: index_entries(lab, adm, i, [tid], tag='after vacuum') for i in IDX},
                        'stats': q(adm, "SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'users'")}

    # 4. Dave 注册
    dave = lab.conn('dave')
    dtid = q(dave, "INSERT INTO users VALUES (2050, 'Dave', 35) RETURNING ctid::text AS ctid", tag='dave registers')[0]['ctid']
    db_, dl = blk_lp(dtid)
    S['4_dave'] = {'ctid': dtid, 'same_page_as_alice': db_ == b, 'same_slot_as_alice': (db_, dl) == (b, l),
                   'item': heap_items(lab, adm, 'users', db_, [dl], tag='dave item')[0], 'page_header': page_head(lab, adm, 'users', db_, tag='dave page')}

    # 5. 冻结
    S['5_freeze'] = {'settings': q(adm, "SELECT name, boot_val, unit FROM pg_settings WHERE name IN ('autovacuum', 'autovacuum_naptime', 'autovacuum_vacuum_threshold', "
                                        "'autovacuum_vacuum_scale_factor', 'autovacuum_vacuum_insert_threshold', 'autovacuum_vacuum_insert_scale_factor', 'autovacuum_vacuum_max_threshold', "
                                        "'autovacuum_freeze_max_age', 'vacuum_freeze_min_age', 'vacuum_freeze_table_age', 'vacuum_failsafe_age') ORDER BY name", tag='autovacuum defaults'),
                     'before': q(adm, "SELECT relfrozenxid::text AS relfrozenxid, age(relfrozenxid) AS age, pg_current_xact_id()::text AS now FROM pg_class WHERE relname = 'users'", tag='relfrozenxid before'),
                     'dave_before': heap_items(lab, adm, 'users', db_, [dl], tag='dave before freeze')[0]}
    q(adm, 'VACUUM (FREEZE, VERBOSE) users', tag='vacuum freeze')
    S['5_freeze']['after'] = q(adm, "SELECT relfrozenxid::text AS relfrozenxid, age(relfrozenxid) AS age FROM pg_class WHERE relname = 'users'", tag='relfrozenxid after')
    S['5_freeze']['dave_after'] = heap_items(lab, adm, 'users', db_, [dl], tag='dave after freeze')[0]
    S['5_freeze']['vm'] = q(adm, "SELECT * FROM pg_visibility_map_summary('users')", tag='vm after freeze')
    S['5_freeze']['datfrozenxid'] = q(adm, "SELECT datname, datfrozenxid::text AS datfrozenxid, age(datfrozenxid) AS age FROM pg_database ORDER BY datname")

    show = lambda it: {k: it.get(k) for k in ('lp', 'lp_flags', 'lp_off', 'lp_len', 't_xmin', 't_xmax', 'flags')}
    print('before', tid, 'free', S['0_before']['free'], 'fsm', S['0_before']['fsm'])
    print('deleted', dx, show(S['1_deleted']['item']), 'admin sees', S['1_deleted']['admin_sees'])
    print('bob still sees', S['2_blocked']['bob_sees'], S['2_blocked']['bob_snapshot'], 'after blocked vacuum', show(S['2_blocked']['item_after_vacuum']))
    print('reclaimed', show(S['3_reclaimed']['item']), 'free', S['3_reclaimed']['free'], 'fsm', S['3_reclaimed']['fsm'], 'index', {k: len(v) for k, v in S['3_reclaimed']['index_entries'].items()})
    print('pages with free space', S['3_reclaimed']['fsm_last_page'])
    print('dave', dtid, show(S['4_dave']['item']))
    print('freeze', S['5_freeze']['before'], '->', S['5_freeze']['after'], show(S['5_freeze']['dave_before'])['flags'], '->', show(S['5_freeze']['dave_after'])['flags'])
    for t in ('vacuum while bob holds snapshot', 'vacuum after bob'):
        v = next(x for x in lab.r['queries'] if x.get('tag') == t)
        print('==', t); print('\n'.join(v.get('notices', [])[1:]))
