#!/usr/bin/env python3
# 同一个库文件，两种打开方式：嵌入式（程序自己加载引擎）与服务端（经 TCP 连接 firebird.exe）。
# 用法：python research/lab/01_two_modes.py <解压后的 Firebird 5.0.4 目录>
# 口令现场生成，不写入回显；实验完删除库、停服务。
import os, secrets, subprocess, sys, time, pathlib, shutil
FB = pathlib.Path(sys.argv[1]).resolve()
W = FB / 'demo'; shutil.rmtree(W, ignore_errors=True); W.mkdir()
DB = 'demo/shop.fdb'
env = dict(os.environ, FIREBIRD=str(FB), ISC_USER='', ISC_PASSWORD='')
pw = secrets.token_hex(6)
def isql(db, sql, user=None, pwd=None, show=None):
    a = [str(FB/'isql.exe'), '-q']
    if user: a += ['-user', user]
    if pwd: a += ['-password', pwd]
    if db: a += [db]
    shown = ' '.join(['isql', '-q'] + (['-user', user] if user else []) + ([db] if db else []))
    r = subprocess.run(a, input=sql, capture_output=True, text=True, cwd=FB, env=env, timeout=60)
    print('$ ' + shown); print(show if show is not None else sql.strip())
    print('--- out'); print(r.stdout.replace(pw, '<pw>').strip()); 
    if r.stderr.strip(): print('--- err'); print(r.stderr.replace(pw,'<pw>').strip())
    print()
print('## 版本'); isql(None, "show version;\nquit;\n", show='show version;')
print('## 嵌入式：没有服务进程，直接建库、建表、写一行')
isql(None, f"create database '{DB}' user 'SYSDBA';\ncreate table t (id int, name varchar(20));\ninsert into t values (1, 'phoenix');\ncommit;\nselect * from t;\nquit;\n")
print('## 初始化安全库（口令现场生成，不入回显）')
isql('security5.fdb', f"create or alter user SYSDBA password '{pw}';\ncommit;\nquit;\n", user='SYSDBA', show="create or alter user SYSDBA password '<pw>';")
print('## 启动服务（端口 3051，配置全用默认）')
p = subprocess.Popen([str(FB/'firebird.exe'), '-a', '-p', '3051'], cwd=FB, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(4)
print('## 服务端：同一个文件，走 TCP')
url = f"inet://127.0.0.1:3051/{FB.as_posix()}/{DB}"
r = subprocess.run([str(FB/'isql.exe'), '-q', '-user', 'SYSDBA', '-password', pw, url], input="select * from t;\nselect mon$remote_protocol from mon$attachments where mon$attachment_id = current_connection;\nquit;\n", capture_output=True, text=True, cwd=FB, env=env, timeout=60)
print('$ isql -q -user SYSDBA inet://127.0.0.1:3051/.../demo/shop.fdb'); print(r.stdout.replace(str(FB),'<fb>').replace(FB.as_posix(),'<fb>').strip()); print(r.stderr.replace(pw,'<pw>').replace(FB.as_posix(),'<fb>').strip()); print()
subprocess.run(['taskkill','/PID',str(p.pid),'/T','/F'],capture_output=True); time.sleep(2)
print('## 服务已停：同一个文件，嵌入式仍能打开')
isql(DB, "select * from t;\nselect mon$remote_protocol from mon$attachments where mon$attachment_id = current_connection;\nquit;\n", user='SYSDBA')
print('## 体积（字节）')
for f in ['firebird.exe','fbclient.dll','plugins/engine13.dll']:
    print(f, (FB/f).stat().st_size)
print('shop.fdb', (FB/DB).stat().st_size)
shutil.rmtree(W, ignore_errors=True)
