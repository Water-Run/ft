"""本集取证的公共部分。

用本机已装的 PostgreSQL 18 二进制另起一个独立集群：临时数据目录（research/_src/ 下，不入库）、随机端口、只听 127.0.0.1，
initdb 用 C 区域与 UTF8、本机信任认证，不设口令。不连接、不改动已有的服务 postgresql-x64-18。
每条命令与查询的完整回显记进结果 JSON；写入之前把个人目录、用户名、本片路径换成通用写法。结束时停掉集群并删除临时目录。
二进制目录默认 C:/Program Files/PostgreSQL/18/bin，可用环境变量 PG_BIN 指定。
"""
from __future__ import annotations
import hashlib
import json
import os
import platform
import re
import shutil
import socket
import subprocess
import time
import uuid
from pathlib import Path

import psycopg
from psycopg.rows import dict_row

LAB = Path(__file__).resolve().parent
VIDEO = LAB.parent.parent
PG_BIN = Path(os.environ.get('PG_BIN', r'C:\Program Files\PostgreSQL\18\bin'))
EXE = '.exe' if os.name == 'nt' else ''

# 全系列共用的数据：4096 个用户，2050 号是 Alice（42 岁）；其他人名 50 字节（User + 5 位编号 + 固定的 40 个字母），年龄 18 + id % 63。
# 与 MyISAM、InnoDB 两集的规则相同。PostgreSQL 没有 TINYINT，年龄用 smallint；人名用 char(50)（定长、空格补齐，和前两集的 CHAR(50) 一样）。
SCHEMA = [
    'CREATE TABLE users (id int NOT NULL PRIMARY KEY, name char(50) NOT NULL, age smallint NOT NULL)',
    'CREATE INDEX idx_name ON users (name)',
    'CREATE INDEX idx_age ON users (age)',
]
TAIL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN'
ROW_SQL = ("INSERT INTO users SELECT i, CASE WHEN i = 2050 THEN 'Alice' ELSE 'User' || lpad(i::text, 5, '0') || '-" + TAIL + "' END, "
           "CASE WHEN i = 2050 THEN 42 ELSE 18 + i %% 63 END FROM generate_series(%s::int, %s::int) AS i")   # %% 是 psycopg 的转义，执行时为 %


EXTENSIONS = ['pageinspect', 'pg_freespacemap', 'pg_visibility', 'pg_buffercache', 'pg_walinspect']


def build(lab, c, on_row=None):
    """各实验从同一张表出发：同样的扩展、同样的建表语句，按注册顺序逐行插入（每行一句、自动提交）。
    语句序列完全相同，所以各实验里的事务号、页号、行的位置都一致。on_row(i) 在每插一行后调用（01 用它记生长）。"""
    for ext in EXTENSIONS:
        lab.q(c, f'CREATE EXTENSION {ext}')
    for s in SCHEMA:
        lab.q(c, s)
    for i in range(1, 4097):
        lab.q(c, ROW_SQL, (i, i), record=i in (1, 2050, 4096), tag=f'insert {i}')
        if on_row:
            on_row(i)


def heap_items(lab, c, rel, blk, lps=None, tag=None):
    """一页堆页的项目指针与元组头（pageinspect），附上标志位的名字。"""
    where = f' WHERE lp IN ({",".join(map(str, lps))})' if lps else ''
    rows = lab.q(c, f"SELECT lp, lp_off, lp_flags, lp_len, t_xmin::text AS t_xmin, t_xmax::text AS t_xmax, t_ctid::text AS t_ctid, "
                    f"t_infomask2, t_infomask, t_hoff, t_data FROM heap_page_items(get_raw_page('{rel}', {blk})){where} ORDER BY lp", tag=tag)
    for r in rows:
        if r['t_infomask'] is not None:
            r['flags'] = flags(r['t_infomask'], r['t_infomask2'])
    return rows


def page_head(lab, c, rel, blk, tag=None):
    return lab.q(c, f"SELECT * FROM page_header(get_raw_page('{rel}', {blk}))", tag=tag)[0]


def index_entries(lab, c, idx, tids, tag=None):
    """在一个 B 树索引的所有叶子页里找指向这些行地址的项（含合并存放的 posting list）。"""
    n = lab.q(c, f"SELECT pg_relation_size('{idx}') / 8192 AS n", record=False)[0]['n']
    out = []
    for b in range(1, n):
        if lab.q(c, f"SELECT type FROM bt_page_stats('{idx}', {b})", record=False)[0]['type'] != 'l':
            continue
        for t in tids:
            for it in lab.q(c, f"SELECT itemoffset, ctid::text AS ctid, itemlen, htid::text AS htid, tids::text AS tids, dead, data "
                               f"FROM bt_page_items('{idx}', {b}) WHERE htid = '{t}' OR '{t}' = ANY(tids)", record=False):
                out.append({'index': idx, 'leaf': b, 'points_to': t, **it})
    lab.r.setdefault('index_entries', []).append({'tag': tag, 'index': idx, 'tids': tids, 'found': out})
    return out


def sha256(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


class Lab:
    def __init__(self, name: str, conf: dict | None = None, out: str | None = None):
        self.name = name
        self.work = VIDEO / 'research' / '_src' / f'lab-{name}-{uuid.uuid4().hex[:8]}'
        self.data = self.work / 'cluster'
        self.log = self.work / 'server.log'
        self.out = LAB / (out or f'out_{name}.json')
        with socket.socket() as s:
            s.bind(('127.0.0.1', 0))
            self.port = s.getsockname()[1]
        self.conf = {'listen_addresses': "'127.0.0.1'", 'port': str(self.port), 'autovacuum': 'off', 'fsync': 'on',
                     'synchronous_commit': 'on', 'full_page_writes': 'on', 'log_line_prefix': "'%m [%p] '", 'log_checkpoints': 'on',
                     'lc_messages': "'C'"}
        self.conf.update(conf or {})
        self.conns: list[psycopg.Connection] = []
        self.r = {'script': name, 'date': time.strftime('%Y-%m-%d'),
                  'environment': {'os': platform.system(), 'release': platform.release(), 'machine': platform.machine(),
                                  'python': platform.python_version(), 'psycopg': psycopg.__version__,
                                  'topology': '新建独立集群（临时目录、随机端口、只听 127.0.0.1）；不连接已有服务',
                                  'conf': {k: v for k, v in self.conf.items() if k != 'port'}},
                  'commands': [], 'queries': [], 'notes': []}

    # ── 脱敏 ──
    def clean(self, text: str) -> str:
        for v in [str(self.work), str(self.work).replace('\\', '/')]:
            text = text.replace(v, '<work>')
        for v in [str(VIDEO), str(VIDEO).replace('\\', '/')]:
            text = text.replace(v, '<video>')
        for v in [os.environ.get('USERPROFILE'), str(Path.home())]:
            if v:
                text = text.replace(v, r'C:\Users\user').replace(v.replace('\\', '/'), 'C:/Users/user')
        user = os.environ.get('USERNAME') or os.environ.get('USER')
        if user:
            text = re.sub(r'(?i)\b' + re.escape(user) + r'\b', 'user', text)
        host = platform.node()
        if host:
            text = re.sub(r'(?i)\b' + re.escape(host) + r'\b', 'host', text)
        return text

    # ── 集群 ──
    def run(self, prog: str, *args, check=True, timeout=120) -> str:
        cmd = [str(PG_BIN / (prog + EXE)), *map(str, args)]
        if prog == 'pg_ctl':
            # Windows 上后台的 postgres 会继承管道句柄，pg_ctl 的输出改写到文件，免得一直等管道关闭
            ctl = self.work / 'pg_ctl.out'
            with ctl.open('wb') as f:
                p = subprocess.run(cmd, stdout=f, stderr=subprocess.STDOUT, timeout=timeout)
            output = ctl.read_text(encoding='utf-8', errors='replace')
        else:
            p = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace', timeout=timeout)
            output = p.stdout + p.stderr
        self.r['commands'].append({'program': prog, 'args': [self.clean(str(a)) for a in args], 'exit': p.returncode, 'output': self.clean(output)})
        if check and p.returncode:
            raise RuntimeError(f'{prog} 退出码 {p.returncode}：{self.clean(output)}')
        return output

    def init(self):
        self.work.mkdir(parents=True, exist_ok=False)
        self.run('initdb', '-D', self.data, '-U', 'lab', '-A', 'trust', '--encoding=UTF8', '--locale=C')
        with (self.data / 'postgresql.conf').open('a', encoding='utf-8') as f:
            f.write('\n# 取证用设置\n' + ''.join(f'{k} = {v}\n' for k, v in self.conf.items()))
        self.start()

    def start(self):
        self.run('pg_ctl', '-D', self.data, '-l', self.log, '-w', 'start')

    def stop(self, mode='fast'):
        for c in self.conns:
            try:
                c.close()
            except Exception:
                pass
        self.conns.clear()
        self.run('pg_ctl', '-D', self.data, '-m', mode, '-w', 'stop', check=False)

    def server_log(self) -> str:
        return self.clean(self.log.read_text(encoding='utf-8', errors='replace')) if self.log.exists() else ''

    def conn(self, label='admin', autocommit=True) -> psycopg.Connection:
        c = psycopg.connect(host='127.0.0.1', port=self.port, user='lab', dbname='postgres', autocommit=autocommit,
                            application_name=label, row_factory=dict_row)
        c.label = label
        c.lab_notices = []                     # VACUUM VERBOSE 等的 INFO 消息；通知对象只在回调里有效，当场取出文字
        c.add_notice_handler(lambda d, c=c: c.lab_notices.append('\n'.join(x for x in (d.severity, d.message_primary, d.message_detail) if x)))
        self.conns.append(c)
        return c

    # ── 查询：每条都记下 SQL、结果或错误 ──
    def q(self, c, sql, params=None, record=True, tag=None):
        rec = {'conn': getattr(c, 'label', '?'), 'sql': sql}
        if params is not None:
            rec['params'] = [str(p) for p in params]
        if tag:
            rec['tag'] = tag
        c.lab_notices.clear()
        try:
            with c.cursor() as cur:
                cur.execute(sql, params)
                rows = cur.fetchall() if cur.description else []
                rec['status'] = cur.statusmessage
        except psycopg.Error as e:
            rec['error'] = {'sqlstate': e.sqlstate, 'message': self.clean(e.diag.message_primary or str(e)),
                            'detail': self.clean(e.diag.message_detail or ''), 'hint': self.clean(e.diag.message_hint or '')}
            if record:
                self.r['queries'].append(rec)
            raise
        if record:
            rec['rows'] = [{k: self._v(v) for k, v in row.items()} for row in rows]
            if c.lab_notices:
                rec['notices'] = [self.clean(t) for t in c.lab_notices]
            self.r['queries'].append(rec)
        return rows

    @staticmethod
    def _v(v):
        if isinstance(v, (bytes, bytearray, memoryview)):
            return bytes(v).hex()
        if isinstance(v, (int, float, str, bool)) or v is None:
            return v
        return str(v)

    def note(self, text):
        self.r['notes'].append(text)

    def save(self):
        self.r['server_log'] = self.server_log()
        text = json.dumps(self.r, ensure_ascii=False, indent=1, default=str)
        self.out.write_text(self.clean(text), encoding='utf-8', newline='\n')

    def __enter__(self):
        self.init()
        return self

    def __exit__(self, et, ev, tb):
        if et is not None:
            self.r['failure'] = self.clean(f'{et.__name__}: {ev}')
        try:
            self.stop()
        finally:
            self.save()
            time.sleep(0.5)
            shutil.rmtree(self.work, ignore_errors=True)
        return False


# ── 页的解析（自写一路，和 pageinspect 互相核对） ──
def parse_heap_page(raw: bytes) -> dict:
    """按 src/include/storage/bufpage.h、itemid.h 与 access/htup_details.h 的布局解析一页堆页。"""
    import struct
    lsn_hi, lsn_lo, checksum, flags, lower, upper, special, psv, prune = struct.unpack_from('<IIHHHHHHI', raw, 0)
    n = (lower - 24) // 4
    items = []
    for i in range(n):
        (w,) = struct.unpack_from('<I', raw, 24 + 4 * i)
        off, fl, ln = w & 0x7FFF, (w >> 15) & 3, (w >> 17) & 0x7FFF
        it = {'lp': i + 1, 'lp_off': off, 'lp_flags': fl, 'lp_len': ln}
        if fl == 1 and ln:
            xmin, xmax, cid = struct.unpack_from('<III', raw, off)
            bhi, blo, pos = struct.unpack_from('<HHH', raw, off + 12)
            im2, im, hoff = struct.unpack_from('<HHB', raw, off + 18)
            it.update({'t_xmin': xmin, 't_xmax': xmax, 't_field3': cid, 't_ctid': f'({(bhi << 16) | blo},{pos})',
                       't_infomask2': im2, 't_infomask': im, 't_hoff': hoff, 'natts': im2 & 0x07FF,
                       'header_hex': raw[off:off + hoff].hex(), 'data_hex': raw[off + hoff:off + ln].hex()})
        items.append(it)
    return {'pd_lsn': f'{lsn_hi:X}/{lsn_lo:X}', 'pd_checksum': checksum, 'pd_flags': flags, 'pd_lower': lower, 'pd_upper': upper,
            'pd_special': special, 'pd_pagesize': psv & 0xFF00, 'pd_version': psv & 0xFF, 'pd_prune_xid': prune, 'items': items}


INFOMASK = {0x0001: 'HEAP_HASNULL', 0x0002: 'HEAP_HASVARWIDTH', 0x0004: 'HEAP_HASEXTERNAL', 0x0008: 'HEAP_HASOID_OLD', 0x0010: 'HEAP_XMAX_KEYSHR_LOCK',
            0x0020: 'HEAP_COMBOCID', 0x0040: 'HEAP_XMAX_EXCL_LOCK', 0x0080: 'HEAP_XMAX_LOCK_ONLY', 0x0100: 'HEAP_XMIN_COMMITTED',
            0x0200: 'HEAP_XMIN_INVALID', 0x0400: 'HEAP_XMAX_COMMITTED', 0x0800: 'HEAP_XMAX_INVALID', 0x1000: 'HEAP_XMAX_IS_MULTI',
            0x2000: 'HEAP_UPDATED', 0x4000: 'HEAP_MOVED_OFF', 0x8000: 'HEAP_MOVED_IN'}
INFOMASK2 = {0x2000: 'HEAP_KEYS_UPDATED', 0x4000: 'HEAP_HOT_UPDATED', 0x8000: 'HEAP_ONLY_TUPLE'}


def flags(im: int, im2: int) -> list[str]:
    return [v for k, v in INFOMASK.items() if im & k] + [v for k, v in INFOMASK2.items() if im2 & k]
