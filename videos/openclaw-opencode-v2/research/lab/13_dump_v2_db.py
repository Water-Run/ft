# 从 OpenCode v2.0.24 的两份数据库快照（强杀之后、恢复之后）里导出画面要用的行：
# session_message（按会话序号）、event_sequence、session_v2 的执行声明字段。
# 用法：python -I 13_dump_v2_db.py <强杀后的库> <恢复后的库> > exp_v2/db_rows.json
# 快照本身不入库（各约 6 MB），它们由 12_crash_v2.sh 产生；校验和记在 FACTS.md。
import json, sqlite3, sys, shutil, tempfile, os

def dump(path):
    tmp = tempfile.mkdtemp()
    for suffix in ('', '-wal'):
        if os.path.exists(path + suffix):
            shutil.copy(path + suffix, os.path.join(tmp, 'db' + suffix))
    con = sqlite3.connect(os.path.join(tmp, 'db'))
    out = {'tables': [r[0] for r in con.execute("select name from sqlite_master where type='table' order by name")]}
    out['event_sequence'] = [list(r) for r in con.execute('select aggregate_id, seq from event_sequence')]
    out['event_rows'] = con.execute('select count(*) from event').fetchone()[0]
    cols = [r[1] for r in con.execute('pragma table_info(session_message)')]
    out['session_message'] = []
    for r in con.execute('select * from session_message order by seq'):
        d = dict(zip(cols, r))
        out['session_message'].append({'seq': d['seq'], 'type': d['type'], 'data': json.loads(d['data'])})
    cols = [r[1] for r in con.execute('pragma table_info(session_v2)')]
    out['session_v2'] = [{k: v for k, v in zip(cols, r) if k in ('id', 'directory', 'version', 'time_suspended', 'resume_attempts', 'time_idle', 'idle_outcome')} for r in con.execute('select * from session_v2')]
    con.close()
    shutil.rmtree(tmp)
    return out

print(json.dumps({'after_kill': dump(sys.argv[1]), 'after_recovery': dump(sys.argv[2])}, ensure_ascii=False, indent=1))
