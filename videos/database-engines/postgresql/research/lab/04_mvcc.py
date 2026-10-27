"""04 事务与并发。

同一张表（pglab.build，再 VACUUM 一次）。几个连接按时间顺序：
1. Alice 开事务改年龄 42 → 43，不提交：事务号、pg_xact 里的状态、页里的两个版本（get_raw_page，不触发剪枝）。
2. Bob（默认的读已提交）此时读 → 42；Bob2（可重复读）开事务读 → 42，记下他的快照（xmin:xmax:xip）。
3. Carol 也要改这一行（age = age + 1）：她在等谁（pg_stat_activity 的等待事件、pg_blocking_pids、pg_locks）。
4. Alice 提交：pg_xact 状态；Carol 继续，在 43 上加一得到 44（读已提交下重新检查最新版本），随后回滚；
   Bob 再读 → 43；Bob2 仍是 42，他再去改这一行 → 报串行化失败。
5. 另一个事务插入一行后回滚：它的行在页里，状态是 aborted，谁都看不见。
6. 死锁：两个事务交叉改 2050、2051，记下报错与细节。
用法：python 04_mvcc.py
"""
import re
import threading
import time
import psycopg
from pglab import Lab, build, heap_items


def blk_lp(tid):
    m = re.match(r'\((\d+),(\d+)\)', tid)
    return int(m.group(1)), int(m.group(2))


with Lab('04_mvcc', conf={'deadlock_timeout': "'1s'"}) as lab:
    adm = lab.conn('admin'); q = lab.q
    build(lab, adm)
    q(adm, 'VACUUM users')
    ob, ol = blk_lp(q(adm, "SELECT ctid::text AS ctid FROM users WHERE id = 2050")[0]['ctid'])
    S = lab.r['steps'] = {}

    alice, bob, bob2, carol = lab.conn('alice'), lab.conn('bob'), lab.conn('bob_rr'), lab.conn('carol')
    pid = {k: q(c, 'SELECT pg_backend_pid() AS p', record=False)[0]['p'] for k, c in (('alice', alice), ('bob', bob), ('bob_rr', bob2), ('carol', carol))}
    lab.r['pids_are_roles'] = '连接名即角色；进程号只用于对照等待关系'

    # 1. Alice 改，不提交
    q(alice, 'BEGIN')
    ax = q(alice, 'SELECT pg_current_xact_id()::text AS xid')[0]['xid']
    q(alice, 'UPDATE users SET age = 43 WHERE id = 2050', tag='alice update (uncommitted)')
    S['1_alice_uncommitted'] = {'xid': ax, 'status': q(adm, f"SELECT pg_xact_status('{ax}') AS s", tag='status while uncommitted')[0]['s'],
                                'alice_sees': q(alice, 'SELECT age, ctid::text AS ctid FROM users WHERE id = 2050', tag='alice reads own change')[0]}
    old = heap_items(lab, adm, 'users', ob, [ol], tag='old version while uncommitted')[0]
    nb, nl = blk_lp(old['t_ctid'])
    S['1_alice_uncommitted']['old_version'] = old
    S['1_alice_uncommitted']['new_version'] = heap_items(lab, adm, 'users', nb, [nl], tag='new version while uncommitted')[0]

    # 2. Bob 读；Bob2 以可重复读开事务读
    S['2_bob'] = {'isolation': q(bob, 'SHOW transaction_isolation')[0]['transaction_isolation'],
                  'reads': q(bob, 'SELECT age FROM users WHERE id = 2050', tag='bob reads during alice tx')[0]['age'],
                  'snapshot': q(bob, 'SELECT pg_current_snapshot()::text AS snap')[0]['snap']}
    q(bob2, 'BEGIN ISOLATION LEVEL REPEATABLE READ')
    S['2_bob_rr'] = {'reads': q(bob2, 'SELECT age FROM users WHERE id = 2050', tag='bob_rr reads during alice tx')[0]['age'],
                     'snapshot': q(bob2, 'SELECT pg_current_snapshot()::text AS snap', tag='bob_rr snapshot')[0]['snap']}

    # 3. Carol 也要改：在后台线程里执行（会等），主线程看等待关系
    carol_result = {}

    def carol_work():
        try:
            q(carol, 'BEGIN')
            carol_result['xid'] = q(carol, 'SELECT pg_current_xact_id()::text AS xid')[0]['xid']
            t0 = time.monotonic()
            carol_result['returning'] = q(carol, 'UPDATE users SET age = age + 1 WHERE id = 2050 RETURNING age', tag='carol update (waits)')
            carol_result['waited_s'] = round(time.monotonic() - t0, 1)
        except psycopg.Error as e:
            carol_result['error'] = str(e)
    th = threading.Thread(target=carol_work); th.start()
    for _ in range(100):
        w = q(adm, f"SELECT wait_event_type, wait_event, state FROM pg_stat_activity WHERE pid = {pid['carol']}", record=False)
        if w and w[0]['wait_event_type'] == 'Lock':
            break
        time.sleep(0.05)
    S['3_carol_waits'] = {
        'activity': q(adm, f"SELECT application_name, state, wait_event_type, wait_event, query FROM pg_stat_activity WHERE pid IN ({pid['alice']}, {pid['carol']}) ORDER BY application_name", tag='who waits'),
        'blocked_by_alice': q(adm, f"SELECT pg_blocking_pids({pid['carol']}) = ARRAY[{pid['alice']}] AS b", tag='carol blocked by alice')[0]['b'],
        'locks': q(adm, f"SELECT a.application_name, l.locktype, l.transactionid::text AS transactionid, l.relation::regclass::text AS relation, l.page, l.tuple, l.mode, l.granted "
                        f"FROM pg_locks l JOIN pg_stat_activity a ON a.pid = l.pid WHERE l.pid IN ({pid['alice']}, {pid['carol']}) AND l.locktype IN ('transactionid', 'tuple') "
                        f"ORDER BY a.application_name, l.locktype", tag='locks')}

    # 4. Alice 提交
    time.sleep(1.0)
    q(alice, 'COMMIT', tag='alice commit')
    th.join(10)
    S['4_after_commit'] = {'alice_status': q(adm, f"SELECT pg_xact_status('{ax}') AS s", tag='status after commit')[0]['s'],
                           'carol': carol_result}
    q(carol, 'ROLLBACK', tag='carol rollback')
    S['4_after_commit']['carol_status'] = q(adm, f"SELECT pg_xact_status('{carol_result['xid']}') AS s", tag='carol status after rollback')[0]['s']
    S['4_after_commit']['bob_reads'] = q(bob, 'SELECT age FROM users WHERE id = 2050', tag='bob reads after commit')[0]['age']
    S['4_after_commit']['bob_rr_reads'] = q(bob2, 'SELECT age FROM users WHERE id = 2050', tag='bob_rr reads after commit')[0]['age']
    try:
        q(bob2, 'UPDATE users SET age = 50 WHERE id = 2050', tag='bob_rr tries to update')
        S['4_after_commit']['bob_rr_update'] = 'succeeded'
    except psycopg.Error as e:
        S['4_after_commit']['bob_rr_update'] = {'sqlstate': e.sqlstate, 'message': e.diag.message_primary}
    q(bob2, 'ROLLBACK')

    # 5. 回滚的插入
    q(alice, 'BEGIN')
    rx = q(alice, 'SELECT pg_current_xact_id()::text AS xid')[0]['xid']
    ins = q(alice, "INSERT INTO users VALUES (5000, 'Mallory', 30) RETURNING ctid::text AS ctid", tag='insert then rollback')[0]['ctid']
    q(alice, 'ROLLBACK')
    b5, l5 = blk_lp(ins)
    S['5_rolled_back_insert'] = {'xid': rx, 'ctid': ins, 'status': q(adm, f"SELECT pg_xact_status('{rx}') AS s", tag='rolled back status')[0]['s'],
                                 'item_before_read': heap_items(lab, adm, 'users', b5, [l5], tag='aborted tuple before read')[0],
                                 'visible': q(adm, 'SELECT count(*) AS n FROM users WHERE id = 5000', tag='anyone sees mallory?')[0]['n'],
                                 'item_after_read': heap_items(lab, adm, 'users', b5, [l5], tag='aborted tuple after read')[0]}

    # 6. 死锁
    d1, d2 = lab.conn('deadlock_1'), lab.conn('deadlock_2')
    dead = {}
    q(d1, 'BEGIN'); q(d2, 'BEGIN')
    q(d1, 'UPDATE users SET age = age WHERE id = 2050', tag='d1 locks 2050')
    q(d2, 'UPDATE users SET age = age WHERE id = 2051', tag='d2 locks 2051')

    def cross(c, key, rid):
        try:
            q(c, f'UPDATE users SET age = age WHERE id = {rid}', tag=f'{key} wants {rid}')
            dead[key] = 'ok'
        except psycopg.Error as e:
            dead[key] = {'sqlstate': e.sqlstate, 'message': e.diag.message_primary, 'detail': lab.clean(e.diag.message_detail or ''), 'hint': e.diag.message_hint}
    t1 = threading.Thread(target=cross, args=(d1, 'deadlock_1', 2051)); t1.start()
    time.sleep(0.3)
    t2 = threading.Thread(target=cross, args=(d2, 'deadlock_2', 2050)); t2.start()
    t1.join(15); t2.join(15)
    q(d1, 'ROLLBACK'); q(d2, 'ROLLBACK')
    S['6_deadlock'] = dead

    for k, v in S.items():
        print('==', k, {kk: vv for kk, vv in v.items() if kk not in ('old_version', 'new_version', 'locks', 'activity', 'item_before_read', 'item_after_read')} if isinstance(v, dict) else v)
    print('old', {k: S['1_alice_uncommitted']['old_version'][k] for k in ('lp', 't_xmin', 't_xmax', 't_ctid', 'flags')})
    print('new', {k: S['1_alice_uncommitted']['new_version'][k] for k in ('lp', 't_xmin', 't_xmax', 't_ctid', 'flags')})
    print('locks', [(l['application_name'], l['locktype'], l['transactionid'], l['tuple'], l['mode'], l['granted']) for l in S['3_carol_waits']['locks']])
    print('activity', [(r['application_name'], r['wait_event_type'], r['wait_event']) for r in S['3_carol_waits']['activity']])
    print('aborted', S['5_rolled_back_insert']['item_before_read']['flags'], '->', S['5_rolled_back_insert']['item_after_read'].get('flags'))
