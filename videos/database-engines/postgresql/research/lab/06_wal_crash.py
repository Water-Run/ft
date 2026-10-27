"""06 出错怎么办：WAL、检查点、整页写、崩溃恢复。

同一张表（pglab.build，再 VACUUM 一次），之后：
1. 检查点；记下控制文件里的检查点位置与 WAL 相关设置的默认值。
2. Carol 开事务改 Bob（2049）的年龄，不提交。
3. Alice 改年龄 42 → 43 并提交：提交前后 WAL 写盘、同步的次数（pg_stat_io 的 wal 一行）；数据文件里第 23 页此时是不是还是旧的
   （直接读文件，和缓冲区里的页比）；这一段 WAL 用 pg_walinspect 列出，再用 pg_waldump 原样读一遍。
4. 同一页再改一次（2051），看第二次还有没有整页镜像。
5. pg_ctl stop -m immediate（相当于断电：不做检查点、不写回脏页），再启动：服务器日志里的恢复过程；
   Alice 是 43，Carol 没提交的那个版本还在页里，但她的事务状态是 aborted，谁都看不见。
用法：python 06_wal_crash.py
"""
import re
from pglab import Lab, build, heap_items, parse_heap_page

WAL_INFO = ("SELECT start_lsn::text, resource_manager, record_type, record_length, fpi_length, block_ref "
            "FROM pg_get_wal_records_info('{a}', '{b}')")


def blk_lp(tid):
    m = re.match(r'\((\d+),(\d+)\)', tid)
    return int(m.group(1)), int(m.group(2))


with Lab('06_wal_crash') as lab:
    adm = lab.conn('admin'); q = lab.q
    build(lab, adm)
    q(adm, 'VACUUM users', tag='settle')
    S = lab.r['steps'] = {}
    path = q(adm, "SELECT pg_relation_filepath('users') AS p")[0]['p']
    ab, al = blk_lp(q(adm, "SELECT ctid::text AS ctid FROM users WHERE id = 2050")[0]['ctid'])

    def disk_page(blk):
        with open(lab.data / path, 'rb') as f:
            f.seek(blk * 8192)
            return f.read(8192)

    # 1. 检查点与设置
    q(adm, 'CHECKPOINT', tag='checkpoint 1')
    S['1_checkpoint'] = {'control': q(adm, 'SELECT checkpoint_lsn::text, redo_lsn::text, timeline_id, checkpoint_time IS NOT NULL AS has_time FROM pg_control_checkpoint()', tag='control checkpoint'),
                         'settings': q(adm, "SELECT name, setting, boot_val, unit FROM pg_settings WHERE name IN ('wal_level', 'synchronous_commit', 'fsync', 'full_page_writes', "
                                            "'wal_log_hints', 'data_checksums', 'checkpoint_timeout', 'max_wal_size', 'min_wal_size', 'wal_buffers', 'wal_writer_delay', 'wal_sync_method') ORDER BY name", tag='wal settings')}

    # 2. Carol 不提交
    carol = lab.conn('carol')
    c0 = q(adm, 'SELECT pg_current_wal_insert_lsn()::text AS l')[0]['l']
    q(carol, 'BEGIN')
    cx = q(carol, 'SELECT pg_current_xact_id()::text AS xid')[0]['xid']
    q(carol, 'UPDATE users SET age = 99 WHERE id = 2049', tag='carol uncommitted update of 2049')
    cb, cl = blk_lp(q(carol, "SELECT ctid::text AS ctid FROM users WHERE id = 2049")[0]['ctid'])
    c1 = q(adm, 'SELECT pg_current_wal_insert_lsn()::text AS l')[0]['l']
    S['2_carol'] = {'xid': cx, 'new_ctid': f'({cb},{cl})', 'wal_range': [c0, c1]}   # 这段 WAL 还在缓冲区里没落盘，pg_walinspect 读不到；Alice 提交后再读

    # 3. Alice 改并提交
    alice = lab.conn('alice')
    io0 = q(adm, "SELECT writes, fsyncs FROM pg_stat_io WHERE object = 'wal' AND context = 'normal' AND backend_type = 'client backend'", tag='wal io before')
    lsn0 = q(adm, 'SELECT pg_current_wal_insert_lsn()::text AS l')[0]['l']
    q(alice, 'BEGIN')
    ax = q(alice, 'SELECT pg_current_xact_id()::text AS xid')[0]['xid']
    q(alice, 'UPDATE users SET age = 43 WHERE id = 2050', tag='alice update')
    flush_before_commit = q(adm, 'SELECT pg_current_wal_flush_lsn()::text AS f, pg_current_wal_insert_lsn()::text AS i', tag='flush vs insert before commit')[0]
    q(alice, 'COMMIT', tag='alice commit')
    lsn1 = q(adm, 'SELECT pg_current_wal_insert_lsn()::text AS l')[0]['l']
    flush_after_commit = q(adm, 'SELECT pg_current_wal_flush_lsn()::text AS f, pg_current_wal_insert_lsn()::text AS i', tag='flush vs insert after commit')[0]
    q(adm, 'SELECT pg_stat_force_next_flush()', record=False)
    q(alice, 'SELECT pg_stat_force_next_flush()', record=False)
    io1 = q(adm, "SELECT writes, fsyncs FROM pg_stat_io WHERE object = 'wal' AND context = 'normal' AND backend_type = 'client backend'", tag='wal io after')
    S['2_carol']['wal'] = q(adm, WAL_INFO.format(a=c0, b=c1), tag='wal of carol uncommitted update (read after alice commit flushed it)')
    buf = bytes.fromhex(q(adm, f"SELECT get_raw_page('users', {ab}) AS r", record=False)[0]['r'].hex())
    disk = disk_page(ab)
    pb, pd = parse_heap_page(buf), parse_heap_page(disk)
    item = lambda p: next(i for i in p['items'] if i['lp'] == al)
    S['3_alice_commit'] = {'xid': ax, 'lsn_before': lsn0, 'lsn_after': lsn1, 'flush_before_commit': flush_before_commit, 'flush_after_commit': flush_after_commit,
                           'wal_io_before': io0, 'wal_io_after': io1,
                           'page_in_buffer': {'pd_lsn': pb['pd_lsn'], 'alice_xmax': item(pb)['t_xmax'], 'alice_ctid': item(pb)['t_ctid']},
                           'page_on_disk': {'pd_lsn': pd['pd_lsn'], 'alice_xmax': item(pd)['t_xmax'], 'alice_ctid': item(pd)['t_ctid']},
                           'wal': q(adm, WAL_INFO.format(a=lsn0, b=lsn1), tag='wal of alice update')}
    walfile = q(adm, f"SELECT pg_walfile_name('{lsn0}') AS f")[0]['f']
    S['3_alice_commit']['pg_waldump'] = lab.run('pg_waldump', '-p', lab.data / 'pg_wal', '-s', lsn0, '-e', lsn1, check=False)
    S['3_alice_commit']['walfile'] = walfile

    # 4. 同一页再改一次：还有没有整页镜像
    l2 = q(adm, 'SELECT pg_current_wal_insert_lsn()::text AS l')[0]['l']
    q(adm, 'UPDATE users SET age = age WHERE id = 2051', tag='second change on page 23')
    l3 = q(adm, 'SELECT pg_current_wal_insert_lsn()::text AS l')[0]['l']
    S['4_second_change'] = {'wal': q(adm, WAL_INFO.format(a=l2, b=l3), tag='wal of second change')}

    # 5. 断电式停机，再启动
    lab.r['server_log_before_crash'] = lab.server_log()
    lab.stop('immediate')
    log_len = len(lab.server_log())
    lab.start()
    adm = lab.conn('after-crash')
    S['5_recovery'] = {'server_log': lab.server_log()[log_len:],
                       'alice': q(adm, 'SELECT age, ctid::text AS ctid FROM users WHERE id = 2050', tag='alice after recovery')[0],
                       'bob': q(adm, 'SELECT age, ctid::text AS ctid FROM users WHERE id = 2049', tag='bob after recovery')[0],
                       'carol_status': q(adm, f"SELECT pg_xact_status('{cx}') AS s", tag='carol status after recovery')[0]['s'],
                       'alice_status': q(adm, f"SELECT pg_xact_status('{ax}') AS s", tag='alice status after recovery')[0]['s'],
                       'carol_version_in_page': heap_items(lab, adm, 'users', cb, [cl], tag='carol version after recovery')}

    s3 = S['3_alice_commit']
    print('flush before commit', s3['flush_before_commit'], 'after', s3['flush_after_commit'])
    print('wal io', s3['wal_io_before'], '->', s3['wal_io_after'])
    print('buffer', s3['page_in_buffer'], 'disk', s3['page_on_disk'])
    print('wal', [(w['resource_manager'], w['record_type'], w['record_length'], w['fpi_length']) for w in s3['wal']])
    print('second', [(w['resource_manager'], w['record_type'], w['record_length'], w['fpi_length']) for w in S['4_second_change']['wal']])
    print('waldump:\n' + s3['pg_waldump'][:2500])
    print('recovery log:\n' + S['5_recovery']['server_log'])
    print({k: v for k, v in S['5_recovery'].items() if k not in ('server_log', 'carol_version_in_page')})
    print('carol version', [(i['lp'], i['t_xmin'], i['t_xmax'], i.get('flags')) for i in S['5_recovery']['carol_version_in_page']])
