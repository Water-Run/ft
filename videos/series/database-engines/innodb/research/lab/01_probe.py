#!/usr/bin/env python3
"""Reproduce the basic survey in an isolated, disposable MySQL container.

Requires Python 3, PyMySQL, and Podman. No host ports or external database are used.
Only containers created by this script are killed/removed. SQL uses a Unix socket.
The immutable image reference is recorded in image.json. The temporary
container and its anonymous data volume are always removed after the run.
"""
import json
import os
import tempfile
import pymysql
import subprocess
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

LAB = Path(__file__).resolve().parent
RAW = LAB.parent / '_src'
IMAGE = 'docker.io/library/mysql@sha256:091c9c7c4b6a6b4d2329d54b7f40d323741785ca990469df9a1d706be0db43e7'
NAME = 'ft-innodb-probe-' + uuid.uuid4().hex[:10]
STEPS = []
SOCKET_DIR = None


def command(*args, check=True):
    return subprocess.run(['podman', *args], text=True, capture_output=True, check=check)


class Session:
    def __init__(self, label):
        self.label = label
        self.db = pymysql.connect(unix_socket=str(Path(SOCKET_DIR) / 'mysql.sock'), user='root', autocommit=True, charset='utf8mb4', read_timeout=30)

    def sql(self, statement, *, group='setup', timeout=20, record=True):
        rows = []
        clean = '\n'.join(line for line in statement.splitlines() if not line.lstrip().startswith('--'))
        for query in clean.split(';'):
            if not query.strip():
                continue
            try:
                with self.db.cursor() as cursor:
                    cursor.execute(query)
                    if cursor.description:
                        rows.extend('\t'.join('NULL' if v is None else str(v) for v in row) for row in cursor.fetchall())
            except pymysql.MySQLError as error:
                rows.append('ERROR ' + str(error.args[0]) + ': ' + str(error.args[1]))
        if record:
            STEPS.append({'group': group, 'session': self.label, 'sql': statement, 'output': rows})
        return rows

    def close(self):
        self.db.close()


def ready():
    for _ in range(120):
        # The image starts a temporary server during initialization. Its socket
        # answers ping too; wait until the entrypoint has exec'd the final server.
        process = command('exec', NAME, 'cat', '/proc/1/comm', check=False)
        if process.stdout.strip() != 'mysqld':
            time.sleep(.5)
            continue
        result = command('exec', NAME, 'mysqladmin', '-uroot', '--socket=/socket/mysql.sock', 'ping', check=False)
        if result.returncode == 0:
            return
        time.sleep(.5)
    raise RuntimeError('MySQL did not become ready')


def save():
    LAB.mkdir(parents=True, exist_ok=True)
    (LAB / 'out_01_probe.json').write_text(json.dumps(STEPS, ensure_ascii=False, indent=2) + '\n')
    lines = []
    for step in STEPS:
        lines += ['[' + step['group'] + ' / ' + step['session'] + ']', step['sql'], *step['output'], '']
    (LAB / 'out_01_probe.txt').write_text('\n'.join(lines), encoding='utf-8')


def main():
    global SOCKET_DIR
    socket_temp = tempfile.TemporaryDirectory(prefix='ft-innodb-socket-')
    SOCKET_DIR = socket_temp.name
    os.chmod(SOCKET_DIR, 0o777)
    sessions = []
    RAW.mkdir(parents=True, exist_ok=True)
    command('run', '-d', '--name', NAME, '--hostname', 'db-lab', '--network', 'none',
            '--memory', '1536m', '-v', SOCKET_DIR + ':/socket:Z', '-e', 'MYSQL_ALLOW_EMPTY_PASSWORD=yes', IMAGE,
            '--socket=/socket/mysql.sock', '--skip-networking', '--skip-log-bin', '--innodb-buffer-pool-size=134217728',
            '--innodb-redo-log-capacity=104857600', '--innodb-flush-log-at-trx-commit=1',
            '--log-error-verbosity=3')
    try:
        ready()
        a, b, observer = (Session(x) for x in ('A', 'B', 'observer'))
        sessions.extend((a, b, observer))
        env = a.sql('SELECT VERSION(), @@version_comment, @@innodb_page_size, '
                    '@@transaction_isolation, @@innodb_flush_log_at_trx_commit, '
                    '@@innodb_file_per_table, @@log_bin, @@innodb_doublewrite, '
                    '@@innodb_default_row_format', group='environment')
        assert env[0].startswith('9.7.2\t'), env
        a.sql((LAB / '00_schema.sql').read_text(), group='schema')
        for client in (b, observer):
            client.sql('USE innodb_demo')
        a.sql("SELECT ENGINE, SUPPORT, TRANSACTIONS, XA, SAVEPOINTS FROM information_schema.ENGINES WHERE ENGINE IN ('InnoDB','MyISAM') ORDER BY ENGINE", group='environment')
        a.sql('SELECT * FROM users ORDER BY id; SHOW CREATE TABLE users; SHOW CREATE TABLE notes', group='storage')
        a.sql("SELECT t.NAME, i.NAME, i.INDEX_ID, i.TYPE, i.N_FIELDS, i.PAGE_NO, i.SPACE FROM information_schema.INNODB_INDEXES i JOIN information_schema.INNODB_TABLES t ON i.TABLE_ID=t.TABLE_ID WHERE t.NAME LIKE 'innodb_demo/%' ORDER BY t.NAME,i.INDEX_ID", group='index_metadata')
        a.sql("SELECT NAME, ROW_FORMAT, PAGE_SIZE, FILE_SIZE, ALLOCATED_SIZE FROM information_schema.INNODB_TABLESPACES WHERE NAME LIKE 'innodb_demo/%' ORDER BY NAME", group='tablespaces')
        a.sql("EXPLAIN SELECT id,name FROM users FORCE INDEX(idx_name) WHERE name='carol'; EXPLAIN SELECT age FROM users FORCE INDEX(idx_name) WHERE name='carol'; SELECT id,name,age FROM users WHERE name='carol'", group='secondary_lookup')

        a.sql('START TRANSACTION; UPDATE users SET age=31 WHERE id=1; UPDATE notes SET body=\'birthday\' WHERE id=1; SELECT age FROM users WHERE id=1; SELECT body FROM notes WHERE id=1', group='rollback')
        assert b.sql('SELECT age FROM users WHERE id=1; SELECT body FROM notes WHERE id=1', group='rollback') == ['30','hello']
        a.sql('ROLLBACK', group='rollback')
        assert a.sql('SELECT age FROM users WHERE id=1; SELECT body FROM notes WHERE id=1', group='rollback') == ['30','hello']
        a.sql('START TRANSACTION; UPDATE users_myisam SET age=31 WHERE id=1; ROLLBACK; SHOW WARNINGS; SELECT age FROM users_myisam WHERE id=1', group='myisam_control')
        assert a.sql('SELECT age FROM users_myisam WHERE id=1', group='myisam_control') == ['31']

        a.sql('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ; START TRANSACTION', group='rr_snapshot')
        b.sql('UPDATE users SET age=31 WHERE id=1', group='rr_snapshot')
        assert a.sql('SELECT age FROM users WHERE id=1', group='rr_snapshot') == ['31']
        b.sql('UPDATE users SET age=32 WHERE id=1', group='rr_snapshot')
        assert a.sql('SELECT age FROM users WHERE id=1', group='rr_snapshot') == ['31']
        assert a.sql('SELECT age FROM users WHERE id=1 FOR UPDATE', group='rr_snapshot') == ['32']
        a.sql('ROLLBACK', group='rr_snapshot')
        a.sql('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED; START TRANSACTION', group='rc_snapshot')
        assert a.sql('SELECT age FROM users WHERE id=1', group='rc_snapshot') == ['32']
        b.sql('UPDATE users SET age=33 WHERE id=1', group='rc_snapshot')
        assert a.sql('SELECT age FROM users WHERE id=1', group='rc_snapshot') == ['33']
        a.sql('ROLLBACK; SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ', group='rc_snapshot')

        a.sql('START TRANSACTION; SELECT id,age FROM users WHERE id=1 FOR UPDATE', group='record_locks')
        b.sql('SET SESSION innodb_lock_wait_timeout=2; START TRANSACTION; UPDATE users SET age=26 WHERE id=2', group='record_locks')
        observer.sql("SELECT OBJECT_NAME, INDEX_NAME, LOCK_TYPE, LOCK_MODE, LOCK_STATUS, LOCK_DATA FROM performance_schema.data_locks WHERE OBJECT_SCHEMA='innodb_demo' ORDER BY OBJECT_NAME,INDEX_NAME,LOCK_DATA,LOCK_MODE", group='record_locks')
        blocked = b.sql('UPDATE users SET age=34 WHERE id=1', group='record_locks')
        assert any('1205' in row for row in blocked), blocked
        b.sql('ROLLBACK', group='record_locks')
        a.sql('ROLLBACK', group='record_locks')

        a.sql('START TRANSACTION; SELECT id FROM users_gap WHERE id>10 AND id<30 FOR UPDATE', group='gap_locks')
        observer.sql("SELECT OBJECT_NAME, INDEX_NAME, LOCK_TYPE, LOCK_MODE, LOCK_STATUS, LOCK_DATA FROM performance_schema.data_locks WHERE OBJECT_SCHEMA='innodb_demo' ORDER BY OBJECT_NAME,INDEX_NAME,LOCK_DATA,LOCK_MODE", group='gap_locks')
        assert b.sql('SELECT id FROM users_gap ORDER BY id', group='gap_locks') == ['10','20','30']
        blocked = b.sql("INSERT INTO users_gap VALUES(15,'new',20)", group='gap_locks')
        assert any('1205' in row for row in blocked), blocked
        a.sql('ROLLBACK', group='gap_locks')
        b.sql("INSERT INTO users_gap VALUES(15,'new',20); SELECT id FROM users_gap ORDER BY id", group='gap_locks')

        a.sql('START TRANSACTION; UPDATE users SET age=age+1 WHERE id=1', group='deadlock')
        b.sql('START TRANSACTION; UPDATE users SET age=age+1 WHERE id=2', group='deadlock')
        with ThreadPoolExecutor(max_workers=1) as pool:
            waiting = pool.submit(a.sql, 'UPDATE users SET age=age+1 WHERE id=2', group='deadlock')
            for _ in range(30):
                if observer.sql('SELECT COUNT(*) FROM performance_schema.data_lock_waits', record=False) != ['0']:
                    break
                time.sleep(.1)
            result_b = b.sql('UPDATE users SET age=age+1 WHERE id=1', group='deadlock')
            result_a = waiting.result(timeout=10)
        assert any('1213' in row for row in result_a + result_b), (result_a,result_b)
        a.sql('ROLLBACK', group='deadlock')
        b.sql('ROLLBACK', group='deadlock')

        a.sql("INSERT INTO users VALUES(90,'committed',40)", group='crash')
        b.sql("START TRANSACTION; INSERT INTO users VALUES(91,'pending',41); SELECT id,name FROM users WHERE id>=90 ORDER BY id", group='crash')
        assert observer.sql('SELECT id,name FROM users WHERE id>=90 ORDER BY id', group='crash') == ['90\tcommitted']
        STEPS.append({'group':'crash','session':'controller','sql':'SIGKILL dedicated MySQL container, then restart the same data directory','output':[]})
        command('kill','--signal','KILL',NAME)
        command('start',NAME)
        ready()
        recovered = Session('recovered')
        sessions.append(recovered)
        recovered.sql('USE innodb_demo')
        assert recovered.sql('SELECT id,name FROM users WHERE id>=90 ORDER BY id', group='crash_recovery') == ['90\tcommitted']
        recovered.sql('CHECK TABLE users', group='crash_recovery')
        logs = command('logs',NAME)
        (LAB / 'out_01_recovery.log').write_text(logs.stdout + logs.stderr)
        recovered.sql('DELETE FROM users WHERE id>=90; UPDATE users SET age=30 WHERE id=1', group='restore_baseline')
        command('stop','--time','30',NAME)
        for table in ('users','notes','users_gap'):
            command('cp', NAME + ':/var/lib/mysql/innodb_demo/' + table + '.ibd', str(RAW / (table + '.ibd')))
        details = json.loads(command('image','inspect',IMAGE).stdout)[0]
        (LAB/'image.json').write_text(json.dumps({'image':IMAGE,'id':details['Id'],'repo_digests':details['RepoDigests'],'mysql_version':'9.7.2','os_arch':'Linux x86_64','network':'none; Unix socket only','binlog':False,'durability':'innodb_flush_log_at_trx_commit=1; innodb_doublewrite=ON','date':'2026-10-09'},indent=2)+'\n')
        save()
        print('Completed: rollback, MyISAM control, RR/RC, record/gap locks, deadlock, crash recovery, .ibd snapshots')
    finally:
        save()
        for session in sessions:
            session.close()
        command('rm','-f','-v',NAME,check=False)
        socket_temp.cleanup()


if __name__ == '__main__':
    main()
