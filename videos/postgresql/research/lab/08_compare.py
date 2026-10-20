"""独立 PostgreSQL 实例核对部分索引和 JSONB/GIN；不连接已有服务，不做性能排名。"""
from pathlib import Path
import argparse
from datetime import datetime, timedelta, timezone
import json
import os
import platform
import re
import socket
import subprocess
import uuid
import psycopg
from psycopg.rows import dict_row

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bin', required=True, type=Path)
    opt = parser.parse_args()
    suffix = '.exe' if os.name=='nt' else ''
    work = ROOT / 'research/_src' / ('compare-'+uuid.uuid4().hex[:12])
    work.mkdir(parents=True,exist_ok=False)
    cluster, logfile = work/'cluster', work/'server.log'
    with socket.socket() as sock:
        sock.bind(('127.0.0.1',0)); port=sock.getsockname()[1]
    out={'schema':1,'checked_at':datetime.now(timezone(timedelta(hours=8))).isoformat(),
         'scope':'同一合成任务表；索引语义与实际计划核对，不进行跨数据库吞吐/延迟比较',
         'environment':{'os':platform.system(),'work':work.relative_to(ROOT).as_posix(),'python':platform.python_version(),'psycopg':psycopg.__version__},
         'commands':[],'queries':[],'checks':{}}
    active=False; connection=None

    def clean(text):
        for value in [os.environ.get('USERPROFILE'),str(Path.home())]:
            if value:text=text.replace(value,'C:/Users/user')
        name=os.environ.get('USERNAME') or os.environ.get('USER')
        if name:text=re.sub(r'(?i)\b'+re.escape(name)+r'\b','user',text)
        return text.replace(str(ROOT),'<video>').replace(str(ROOT).replace('\\','/'),'<video>')

    def run(program,*args):
        argv=[str(opt.bin/(program+suffix)),*map(str,args)]
        if program=='pg_ctl':
            control=work/'control.log'
            with control.open('wb') as stream:
                p=subprocess.run(argv,stdout=stream,stderr=subprocess.STDOUT,timeout=90)
            output=control.read_text(encoding='utf-8',errors='replace')
        else:
            p=subprocess.run(argv,capture_output=True,encoding='utf-8',errors='replace',timeout=90)
            output=p.stdout+p.stderr
        out['commands'].append({'program':program,'exit':p.returncode,'output':clean(output)})
        if p.returncode:raise RuntimeError(clean(output))

    def query(sql):
        with connection.cursor() as cursor:
            cursor.execute(sql)
            rows=cursor.fetchall() if cursor.description else []
            out['queries'].append({'sql':sql,'rows':rows,'status':cursor.statusmessage})
            return rows

    def check(name,value):
        out['checks'][name]=bool(value)
        if not value:raise AssertionError(name)

    def nodes(plan):
        yield plan
        for child in plan.get('Plans',[]):yield from nodes(child)

    try:
        run('initdb','-D',cluster,'-U','lab_admin','-A','trust','--encoding=UTF8','--locale=C')
        with (cluster/'postgresql.conf').open('a',encoding='utf-8') as stream:
            stream.write(f"\nlisten_addresses='localhost'\nport={port}\nshared_buffers='32MB'\nautovacuum=off\nfsync=on\nsynchronous_commit=on\n")
        run('pg_ctl','-D',cluster,'-l',logfile,'-w','start'); active=True
        connection=psycopg.connect(host='127.0.0.1',port=port,user='lab_admin',dbname='postgres',autocommit=True,row_factory=dict_row)
        out['environment']['server']=query("SELECT version() AS version,current_setting('server_version_num') AS version_num,current_setting('default_transaction_isolation') AS isolation")[0]
        query('CREATE TABLE jobs (id integer PRIMARY KEY,status text NOT NULL,meta jsonb NOT NULL)')
        query("INSERT INTO jobs SELECT i,CASE WHEN i%100=0 THEN 'open' ELSE 'done' END,jsonb_build_object('kind',CASE WHEN i%97=0 THEN 'alert' ELSE 'normal' END,'user_id',i%1000) FROM generate_series(1,20000) AS i")
        query("CREATE INDEX jobs_open_idx ON jobs(id) WHERE status='open'")
        query('CREATE INDEX jobs_meta_gin ON jobs USING gin(meta)')
        query('ANALYZE jobs')
        out['counts']=query("SELECT count(*) AS total,count(*) FILTER (WHERE status='open') AS open,count(*) FILTER (WHERE meta @> '{\"kind\":\"alert\"}') AS alert FROM jobs")[0]
        out['partial_plan']=query("EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT id FROM jobs WHERE status='open' ORDER BY id LIMIT 10")[0]['QUERY PLAN'][0]
        out['jsonb_plan']=query("EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT id FROM jobs WHERE meta @> '{\"kind\":\"alert\"}'")[0]['QUERY PLAN'][0]
        out['indexes']=query("SELECT c.relname,a.amname,pg_get_expr(i.indpred,i.indrelid) AS predicate,pg_relation_size(c.oid) AS bytes FROM pg_class c JOIN pg_index i ON i.indexrelid=c.oid JOIN pg_am a ON a.oid=c.relam WHERE i.indrelid='jobs'::regclass ORDER BY c.relname")
        check('postgresql_18_4',out['environment']['server']['version_num']=='180004')
        check('partial_predicate_selects_200_of_20000',out['counts']['total']==20000 and out['counts']['open']==200)
        check('partial_index_used',any(n.get('Index Name')=='jobs_open_idx' for n in nodes(out['partial_plan']['Plan'])))
        check('jsonb_gin_index_used',any(n.get('Index Name')=='jobs_meta_gin' for n in nodes(out['jsonb_plan']['Plan'])))
        check('jsonb_query_returns_expected_rows',out['counts']['alert']==20000//97)
        out['success']=True
    finally:
        if connection:connection.close()
        if active:run('pg_ctl','-D',cluster,'-m','fast','-w','stop')
        if logfile.exists():(HERE/'out_08_compare.log').write_text(clean(logfile.read_text(encoding='utf-8',errors='replace')),encoding='utf-8',newline='\n')
        (HERE/'out_08_compare.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'success':out.get('success',False),'checks':out['checks'],'counts':out['counts']},ensure_ascii=False))

if __name__=='__main__':main()
