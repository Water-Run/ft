"""自建 PostgreSQL 18 实例，取证后停止；不连接现有服务，不删除任何实例。"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import socket
import subprocess
import threading
import time
import uuid
import psycopg
from psycopg.rows import dict_row

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = HERE / 'out_01_probe.json'

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--bin', required=True, type=Path, help='包含 initdb、pg_ctl、postgres 的目录')
    opt = ap.parse_args()
    suffix = '.exe' if os.name == 'nt' else ''
    exe = lambda name: str(opt.bin / (name + suffix))
    work = ROOT / 'research' / '_src' / ('lab-' + uuid.uuid4().hex[:12])
    work.mkdir(parents=True, exist_ok=False)
    cluster = work / 'cluster'
    logfile = work / 'server.log'
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    results = {'schema': 1, 'date': '2026-10-19', 'environment': {
        'os': platform.system(), 'machine': platform.machine(),
        'python': platform.python_version(), 'psycopg': psycopg.__version__,
        'topology': '新建独立实例；仅本机回环连接；无既有服务连接',
        'work': work.relative_to(ROOT).as_posix()}, 'commands': [], 'queries': [], 'snapshots': {}, 'checks': {}}
    connections = []
    started = False

    def clean(text):
        # 在任何持久化前替换宿主身份、路径；不采集凭据或现有数据库配置。
        for value in [os.environ.get('USERPROFILE'), str(Path.home())]:
            if value:
                text = text.replace(value, 'C:/Users/user')
        name = os.environ.get('USERNAME') or os.environ.get('USER')
        if name:
            text = re.sub(r'(?i)\b' + re.escape(name) + r'\b', 'user', text)
        return text.replace(str(ROOT), '<video>').replace(str(ROOT).replace('\\', '/'), '<video>')

    def run(name, *args):
        if name == 'pg_ctl':
            # Windows 后台 postgres 会继承句柄。用文件收集 pg_ctl 输出，避免 PIPE 等待后台进程关句柄。
            control = work / 'control.log'
            with control.open('wb') as stream:
                p = subprocess.run([exe(name), *map(str, args)], stdout=stream, stderr=subprocess.STDOUT, timeout=90)
            output = control.read_text(encoding='utf-8', errors='replace')
        else:
            p = subprocess.run([exe(name), *map(str, args)], capture_output=True, encoding='utf-8', errors='replace', timeout=90)
            output = p.stdout + p.stderr
        results['commands'].append({'program': name, 'exit': p.returncode, 'output': clean(output)})
        if p.returncode:
            raise RuntimeError(f'{name}: {clean(output)}')
        return output

    def conn(label):
        c = psycopg.connect(host='127.0.0.1', port=port, user='lab_admin', dbname='postgres', autocommit=True,
                             application_name=label, row_factory=dict_row)
        connections.append(c)
        return c

    def query(c, sql, params=None, label='admin'):
        record = {'connection': label, 'sql': sql, 'params': params}
        try:
            with c.cursor() as cur:
                cur.execute(sql, params)
                record['rows'] = cur.fetchall() if cur.description else []
                record['status'] = cur.statusmessage
        except psycopg.Error as e:
            record['error'] = {'sqlstate': e.sqlstate, 'message': clean(e.diag.message_primary or str(e))}
            results['queries'].append(record)
            raise
        results['queries'].append(record)
        return record['rows']

    def snapshot(c, key):
        raw = bytes(query(c, "SELECT get_raw_page('users', 0) AS bytes")[0]['bytes'])
        (work / (key + '.page')).write_bytes(raw)
        head = query(c, "SELECT * FROM page_header(get_raw_page('users', 0))")[0]
        items = query(c, "SELECT lp, lp_off, lp_flags, lp_len, t_xmin, t_xmax, t_ctid, t_infomask, t_infomask2, t_hoff, encode(t_data, 'hex') AS data_hex FROM heap_page_items(get_raw_page('users', 0)) ORDER BY lp")
        results['snapshots'][key] = {'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw), 'header': head, 'items': items}

    def check(name, value):
        results['checks'][name] = bool(value)
        if not value:
            raise AssertionError(name)

    def serial(value):
        if isinstance(value, bytes):
            return value.hex()
        return str(value)

    try:
        run('initdb', '-D', cluster, '-U', 'lab_admin', '-A', 'trust', '--encoding=UTF8', '--locale=C')
        # 关闭自动清理以便控制取证时机；不把该设置当生产建议。
        with (cluster / 'postgresql.conf').open('a', encoding='utf-8') as f:
            f.write("\nlisten_addresses = 'localhost'\nport = " + str(port) + "\nautovacuum = off\nfsync = on\nsynchronous_commit = on\nfull_page_writes = on\nshared_buffers = '32MB'\nlog_line_prefix = '%m [%p] '\nlog_checkpoints = on\n")
        run('pg_ctl', '-D', cluster, '-l', logfile, '-w', 'start')
        started = True
        admin = conn('lab_admin')
        results['environment']['server'] = query(admin, 'SELECT version() AS version, current_setting(\'server_version_num\') AS version_num')[0]
        results['environment']['settings'] = query(admin, "SELECT name, setting, unit FROM pg_settings WHERE name IN ('block_size','segment_size','fsync','synchronous_commit','full_page_writes','default_transaction_isolation','autovacuum','data_checksums') ORDER BY name")
        query(admin, 'CREATE EXTENSION pageinspect')
        for stmt in (HERE / '00_schema.sql').read_text(encoding='utf-8-sig').split(';'):
            if stmt.strip():
                query(admin, stmt.strip())
        query(admin, 'CHECKPOINT')
        results['layout'] = query(admin, "SELECT c.relname, c.relfilenode, pg_relation_filepath(c.oid) AS path, pg_relation_size(c.oid) AS bytes, am.amname FROM pg_class c JOIN pg_am am ON am.oid=c.relam WHERE c.relname IN ('users','users_pkey','users_name_idx','notes') ORDER BY c.relname")
        results['initial_rows'] = query(admin, 'SELECT id, name, age, xmin::text, xmax::text, ctid::text FROM users ORDER BY id')
        snapshot(admin, 'before')
        results['index_meta'] = query(admin, "SELECT * FROM bt_metap('users_pkey')")
        results['index_items'] = query(admin, "SELECT itemoffset, ctid, itemlen, data, htid FROM bt_page_items('users_pkey', 1)")
        results['plans'] = {'small': query(admin, 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT name, age FROM users WHERE id=1'),
                            'many': query(admin, 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT name, age FROM users_many WHERE id=1')}
        # 两种隔离级别对同一条真实更新的不同观察。
        rr, writer, reader, other = [conn(x) for x in ['rr', 'writer', 'reader', 'other']]
        query(rr, 'BEGIN ISOLATION LEVEL REPEATABLE READ', label='rr')
        query(rr, 'SELECT age FROM users WHERE id=1', label='rr')
        query(writer, 'BEGIN', label='writer')
        upd = query(writer, 'UPDATE users SET age=31 WHERE id=1 RETURNING age, xmin::text, xmax::text, ctid::text', label='writer')[0]
        old = query(reader, 'SELECT age FROM users WHERE id=1', label='reader')[0]
        snapshot(admin, 'uncommitted')
        check('uncommitted_reader_sees_30', old['age'] == 30)
        query(other, "SET lock_timeout='300ms'", label='other')
        try:
            query(other, 'UPDATE users SET age=age+10 WHERE id=1', label='other')
            raise AssertionError('写锁实验未等待')
        except psycopg.errors.LockNotAvailable:
            check('conflicting_update_times_out', True)
        query(writer, 'COMMIT', label='writer')
        new = query(reader, 'SELECT age FROM users WHERE id=1', label='reader')[0]
        pinned = query(rr, 'SELECT age FROM users WHERE id=1', label='rr')[0]
        check('rc_next_statement_sees_31', new['age'] == 31)
        check('rr_keeps_30', pinned['age'] == 30)
        snapshot(admin, 'committed_pinned')
        query(admin, 'VACUUM (VERBOSE, DISABLE_PAGE_SKIPPING) users')
        snapshot(admin, 'vacuum_pinned')
        check('old_version_retained_for_snapshot', any(i['lp'] == 1 and i['lp_flags'] == 1 for i in results['snapshots']['vacuum_pinned']['items']))
        query(rr, 'COMMIT', label='rr')
        query(admin, 'VACUUM (VERBOSE, DISABLE_PAGE_SKIPPING) users')
        snapshot(admin, 'vacuum_released')
        check('old_version_reclaimed_after_release', not any(i['lp'] == 1 and i['lp_flags'] == 1 for i in results['snapshots']['vacuum_released']['items']))
        check('new_ctid_changed', upd['ctid'] != results['initial_rows'][0]['ctid'])
        # 唯一性与多语句事务：失败必须实际发生。
        try:
            query(admin, "INSERT INTO users VALUES (1,'duplicate',20)")
            raise AssertionError('唯一键没有拒绝重复值')
        except psycopg.errors.UniqueViolation:
            check('duplicate_primary_key_rejected', True)
        query(writer, 'BEGIN', label='writer')
        query(writer, 'UPDATE users SET age=99 WHERE id=1', label='writer')
        query(writer, "UPDATE notes SET body='rollback' WHERE id=1", label='writer')
        query(writer, 'ROLLBACK', label='writer')
        check('two_table_rollback', query(admin, "SELECT age, (SELECT body FROM notes WHERE id=1) AS body FROM users WHERE id=1")[0] == {'age': 31, 'body': 'hello'})
        # HOT 与非 HOT 路径。首个更新只改非索引列，且页内有空位。
        query(admin, 'VACUUM users')
        results['hot_bits'] = query(admin, "SELECT lp, raw_flags, combined_flags FROM heap_page_items(get_raw_page('users',0)), LATERAL heap_tuple_infomask_flags(t_infomask,t_infomask2) WHERE lp_flags=1")
        query(admin, "UPDATE users SET name='alicia' WHERE id=1")
        snapshot(admin, 'indexed_update')
        results['index_after_name_change'] = query(admin, "SELECT itemoffset, ctid, itemlen, data, htid FROM bt_page_items('users_name_idx',1)")
        # 类型、运算符与索引配合：内置 point 与 GiST；hstore 是实际安装的扩展。
        query(admin, 'CREATE EXTENSION hstore')
        results['extensions'] = query(admin, 'SELECT extname, extversion FROM pg_extension ORDER BY extname')
        query(admin, 'CREATE TABLE locations (id integer PRIMARY KEY, p point)')
        query(admin, 'INSERT INTO locations SELECT i, point(i%100, i/100) FROM generate_series(1,10000) AS i')
        query(admin, 'CREATE INDEX locations_p_gist ON locations USING gist(p)')
        query(admin, 'ANALYZE locations')
        results['gist_plan'] = query(admin, 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id FROM locations ORDER BY p <-> point(3,4) LIMIT 3')
        results['hstore_result'] = query(admin, "SELECT ('color=>blue, size=>large'::hstore)->'color' AS color")
        # 同一用户的设备预约：范围、GiST、btree_gist 与排他约束共同维护 OLTP 业务规则。
        query(admin, 'CREATE EXTENSION btree_gist')
        query(admin, "CREATE TABLE bookings (id integer PRIMARY KEY, user_id integer REFERENCES users(id), device integer NOT NULL, slot tsrange NOT NULL, EXCLUDE USING gist (device WITH =, slot WITH &&))")
        query(writer, 'BEGIN', label='writer')
        query(writer, "INSERT INTO bookings VALUES (1,1,1,tsrange('2026-01-01 09:00','2026-01-01 10:00','[)'))", label='writer')
        overlap = "INSERT INTO bookings VALUES (2,1,1,tsrange('2026-01-01 09:30','2026-01-01 10:30','[)'))"
        query(other, "SET lock_timeout='5s'", label='other')
        other_pid = query(other, 'SELECT pg_backend_pid() AS pid', label='other')[0]['pid']
        booking_result = {}
        def competing_booking():
            try:
                query(other, overlap, label='other')
                booking_result['sqlstate'] = 'unexpected_success'
            except psycopg.Error as e:
                booking_result['sqlstate'] = e.sqlstate
        worker = threading.Thread(target=competing_booking, daemon=True)
        worker.start()
        waiting = False
        for _ in range(60):
            state = query(admin, 'SELECT wait_event_type,wait_event FROM pg_stat_activity WHERE pid=%s', [other_pid])
            if state and state[0]['wait_event_type']=='Lock':
                waiting = True
                break
            time.sleep(0.05)
        check('concurrent_booking_waits', waiting)
        query(writer, 'COMMIT', label='writer')
        worker.join(timeout=6)
        check('overlapping_booking_rejected', not worker.is_alive() and booking_result.get('sqlstate')=='23P01')
        results['booking_concurrency'] = {'observed_lock_wait':waiting,'after_first_commit_sqlstate':booking_result.get('sqlstate'),
                                          'method':'两个连接；观察第二连接 Lock 等待后提交第一连接；第二连接原 INSERT 返回排他约束错误'}
        query(admin, "INSERT INTO bookings VALUES (3,1,1,tsrange('2026-01-01 10:00','2026-01-01 11:00','[)'))")
        results['bookings'] = query(admin, 'SELECT id,user_id,device,slot::text FROM bookings ORDER BY id')
        check('adjacent_booking_accepted', len(results['bookings']) == 2)
        try:
            query(admin, "INSERT INTO bookings VALUES (4,999,2,tsrange('2026-01-01 10:00','2026-01-01 11:00','[)'))")
            raise AssertionError('外键未拒绝不存在的用户')
        except psycopg.errors.ForeignKeyViolation:
            check('unknown_user_foreign_key_rejected', True)
        results['extensions'] = query(admin, 'SELECT extname, extversion FROM pg_extension ORDER BY extname')
        # 在自建实例内进行 immediate 停机；仅验证进程崩溃恢复，不冒充断电。
        query(admin, 'CHECKPOINT')
        query(admin, 'UPDATE users SET age=32 WHERE id=1')
        results['wal'] = query(admin, 'SELECT pg_current_wal_insert_lsn()::text AS insert_lsn, pg_current_wal_flush_lsn()::text AS flush_lsn, pg_walfile_name(pg_current_wal_insert_lsn()) AS segment')[0]
        query(writer, 'BEGIN', label='writer')
        query(writer, 'UPDATE users SET age=77 WHERE id=2', label='writer')
        run('pg_ctl', '-D', cluster, '-w', '-m', 'immediate', 'stop')
        started = False
        for c in connections:
            c.close()
        connections.clear()
        run('pg_ctl', '-D', cluster, '-l', logfile, '-w', 'start')
        started = True
        admin = conn('after_recovery')
        results['after_recovery'] = query(admin, 'SELECT id, name, age FROM users WHERE id IN (1,2) ORDER BY id')
        check('committed_update_survives', results['after_recovery'][0]['age'] == 32)
        check('uncommitted_update_invisible', results['after_recovery'][1]['age'] == 25)
        snapshot(admin, 'after_recovery')
        results['success'] = True
    finally:
        for c in connections:
            try:
                c.close()
            except Exception:
                pass
        if started:
            run('pg_ctl', '-D', cluster, '-w', '-m', 'fast', 'stop')
        if logfile.exists():
            (HERE / 'out_01_recovery.log').write_text(clean(logfile.read_text(encoding='utf-8', errors='replace')), encoding='utf-8', newline='\n')
        OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2, default=serial) + '\n', encoding='utf-8', newline='\n')
        print(json.dumps({'success': results.get('success', False), 'checks': results['checks'], 'record': OUT.name}, ensure_ascii=False))

if __name__ == '__main__':
    main()
