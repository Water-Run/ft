"""09 原文：PostgreSQL 18 官方文档、官网新闻与 ACM 图灵奖页里，本集要用的句子。

各页重新下载到 research/_src/docs-<日期>/（不入库），转成纯文本，按关键词找出原句，逐字写进 out_09_docs.json，
附网址、取得日期与原页的 SHA-256。一条关键词组没找到句子就报出来（不编造、不改写）。
用法：python 09_docs.py
"""
import hashlib
import json
import re
import time
import urllib.request
from pathlib import Path
from bs4 import BeautifulSoup

LAB = Path(__file__).resolve().parent
DEST = LAB.parent / '_src' / ('docs-' + time.strftime('%Y-%m-%d'))
D = 'https://www.postgresql.org/docs/18/'
# 每页：要找的句子各用一组关键词（全部出现在同一句里才算）
PAGES = {
    'page-layout': (D + 'storage-page-layout.html', [['24 bytes', 'page header'], ['ItemIdData'], ['23 bytes'], ['t_xmin'], ['t_xmax'], ['t_ctid'],
                                                     ['number of item identifiers', 'pd_lower'], ['item identifier is never moved']]),
    'file-layout': (D + 'storage-file-layout.html', [['filenode'], ['exceeds 1 GB'], ['_fsm'], ['_vm'], ['free space map'], ['visibility map']]),
    'fsm': (D + 'storage-fsm.html', [['free space map'], ['binary tree']]),
    'vm': (D + 'storage-vm.html', [['all-visible'], ['all tuples on the page have been frozen'], ['index-only scans']]),
    'hot': (D + 'storage-hot.html', [['does not modify any columns referenced'], ['sufficient free space'], ['New index entries are not needed'],
                                     ['Indexes always refer'], ['new index entries for each updated row']]),
    'mvcc-intro': (D + 'mvcc-intro.html', [['snapshot'], ['reading never blocks writing']]),
    'isolation': (D + 'transaction-iso.html', [['Read Committed', 'default'], ['could not serialize access due to concurrent update'],
                                              ['Repeatable Read', 'only sees data committed before the transaction began'],
                                              ['would-be updater will wait'], ['apply its operation to the updated version']]),
    'explicit-locking': (D + 'explicit-locking.html', [['deadlock'], ['Row-level locks do not affect data querying'], ['no limit on the number of rows locked']]),
    'create-index': (D + 'sql-createindex.html', [['B-trees', 'leaf pages are filled'], ['default', 'fillfactor', '90']]),
    'vacuum': (D + 'routine-vacuuming.html', [['dead row versions'], ['32 bits'], ['two billion transactions'], ['frozen'], ['autovacuum'],
                                              ['vacuum threshold', 'base threshold', 'scale factor'], ['autovacuum_vacuum_max_threshold']]),
    'wal-intro': (D + 'wal-intro.html', [['changes to data files', 'only after those changes have been logged'], ['in the event of a crash'], ['fsync']]),
    'wal-reliability': (D + 'wal-reliability.html', [['full page images', 'before modifying'], ['checksummed by default']]),
    'wal-config': (D + 'wal-configuration.html', [['Checkpoints', 'points in the sequence of transactions'], ['checkpoint_timeout'], ['max_wal_size']]),
    'index-only': (D + 'indexes-index-only-scans.html', [['All indexes in PostgreSQL are secondary indexes'], ['visibility map']]),
    'btree-dedup': (D + 'btree.html', [['deduplication'], ['posting list']]),
    'history': (D + 'history.html', [['POSTGRES', '1986'], ['led by Professor Michael Stonebraker'], ['Andrew Yu'], ['new name, PostgreSQL'], ['6.0']]),
    'features': (D + 'features.html', [['SQL:2023'], ['Core conformance'], ['no current version']]),
    'release-18': ('https://www.postgresql.org/about/news/postgresql-18-released-3142/', [['2025-09-25'], ['checksums']]),
    'release-notes-18': (D + 'release-18.html', [['data checksums', 'initdb'], ['Release date']]),
    # 图灵奖：ACM 自己的页面（amturing.acm.org、awards.acm.org、acm.org、cacm）在本机取证环境一律 403，改读下面两处，另有 LWN 一处见 FACTS
    'berkeley-stonebraker': ('https://www2.eecs.berkeley.edu/Faculty/Homepages/stonebraker.html', [['INGRES', 'POSTGRES'], ['Turing Award']]),
    'turing-mit': ('https://news.mit.edu/2015/michael-stonebraker-wins-turing-award-0325', [['Turing Award', 'Nobel Prize of computing'], ['invented many of the concepts'],
                                                                                          ['Publication Date']]),
    'hellerstein': ('https://arxiv.org/html/1901.01973v1', [['Post-Ingres'], ['arXiv:1901.01973v1']]),
}


def text_of(html: bytes) -> str:
    soup = BeautifulSoup(html, 'html.parser')
    for t in soup(['script', 'style', 'nav', 'header', 'footer']):
        t.decompose()
    return re.sub(r'\s+', ' ', soup.get_text(' ')).strip()


def sentences(t: str):
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+(?=[A-Z(])', t) if s.strip()]


DEST.mkdir(parents=True, exist_ok=True)
out = {'script': '09_docs', 'date': time.strftime('%Y-%m-%d'), 'pages': {}}
for key, (url, groups) in PAGES.items():
    rec = {'url': url}
    try:
        raw = None
        for attempt in range(3):          # 代理偶尔断开连接，重试两次
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=60) as r:
                    raw = r.read()
                break
            except urllib.error.URLError:
                time.sleep(3)
        if raw is None:
            # 三次都断开：用今天早些时候下载的那一份（同一天、同一网址），并注明
            if not (DEST / f'{key}.html').exists():
                raise RuntimeError('下载失败，今天也没有已下载的副本')
            raw = (DEST / f'{key}.html').read_bytes()
            rec['note'] = '本次下载三次都断开，用的是今天早些时候下载的副本'
        (DEST / f'{key}.html').write_bytes(raw)
        rec['sha256'] = hashlib.sha256(raw).hexdigest()
        rec['fetched'] = time.strftime('%Y-%m-%d')
        ss = sentences(text_of(raw))
        rec['found'] = {}
        for g in groups:
            hits = [s for s in ss if all(k.lower() in s.lower() for k in g)]
            rec['found'][' + '.join(g)] = hits[:4] if hits else 'NOT FOUND'
    except Exception as e:
        rec['error'] = f'{type(e).__name__}: {e}'
    out['pages'][key] = rec
    missing = [k for k, v in rec.get('found', {}).items() if v == 'NOT FOUND']
    print(key, 'ok' if 'found' in rec else rec['error'], ('missing: ' + '; '.join(missing)) if missing else '')
(LAB / 'out_09_docs.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
