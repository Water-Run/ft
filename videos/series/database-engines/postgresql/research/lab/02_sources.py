"""下载固定版本官方源码及公开文档；原文只放忽略目录，索引与校验和入库。"""
from pathlib import Path
import concurrent.futures
import hashlib
import json
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / 'research/_src/sources'
CACHE.mkdir(parents=True, exist_ok=True)
TAG = 'REL_18_4'

def get(url):
    r = requests.get(url, timeout=60, headers={'User-Agent': 'ft-postgresql-research/1.0'})
    r.raise_for_status()
    return r.content

def main():
    ref = json.loads(get(f'https://api.github.com/repos/postgres/postgres/git/ref/tags/{TAG}'))['object']
    if ref['type'] == 'tag':
        ref = json.loads(get(ref['url']))['object']
    commit = ref['sha']
    files = {
        'src/include/storage/bufpage.h': ['PageHeaderData', 'SizeOfPageHeaderData'],
        'src/include/storage/itemid.h': ['ItemIdData', 'LP_REDIRECT'],
        'src/include/access/htup_details.h': ['HeapTupleHeaderData', 'HEAP_HOT_UPDATED', 'HEAP_ONLY_TUPLE'],
        'src/backend/access/heap/heapam.c': ['heap_update', 'use_hot_update', 'HeapTupleHeaderSetXmax'],
        'src/backend/access/heap/hio.c': ['RelationGetBufferForTuple', 'GetPageWithFreeSpace', 'RecordAndGetPageWithFreeSpace'],
        'src/backend/access/heap/heapam_visibility.c': ['HeapTupleSatisfiesMVCC'],
        'src/backend/access/heap/vacuumlazy.c': ['heap_vacuum_rel', 'lazy_scan_heap'],
        'src/backend/access/transam/xact.c': ['RecordTransactionCommit', 'XLogFlush'],
        'src/backend/access/transam/xlogrecovery.c': ['PerformWalRecovery', 'redo starts'],
        'src/backend/tcop/postgres.c': ['exec_simple_query', 'pg_parse_query', 'pg_plan_queries'],
        'src/backend/executor/nodeIndexscan.c': ['IndexNext'],
        'src/backend/access/heap/README.HOT': ['HOT', 'index'],
        'src/backend/access/nbtree/README': ['Lehman', 'heap'],
        'doc/src/sgml/history.sgml': ['1986', '1994', '1996'],
        'doc/src/sgml/storage.sgml': ['pd_lower', 'pd_upper', 'HOT'],
        'doc/src/sgml/mvcc.sgml': ['Read Committed', 'Repeatable Read'],
        'doc/src/sgml/wal.sgml': ['Write-Ahead', 'synchronous_commit'],
        'contrib/hstore/hstore.control': ['default_version'],
        'src/backend/utils/adt/geo_ops.c': ['point_distance'],
        'src/backend/access/gist/gistproc.c': ['gist_point_distance'],
        'src/backend/executor/execIndexing.c': ['check_exclusion_or_unique_constraint', 'CEOUC_WAIT', 'XactLockTableWait'],
        'contrib/btree_gist/btree_gist.control': ['default_version'],
        'src/include/pg_config.h.in': ['PG_VERSION', 'BLCKSZ'],
    }
    web = {
        'history': 'https://www.postgresql.org/docs/18/history.html',
        'hellerstein': 'https://arxiv.org/html/1901.01973v1',
        'codd': 'https://research.ibm.com/publications/a-relational-model-of-data-for-large-shared-data-banks',
        'ibm-history': 'https://www.ibm.com/history/relational-database',
        'stonebraker': 'https://www2.eecs.berkeley.edu/Faculty/Homepages/stonebraker.html',
        'wong': 'https://www2.eecs.berkeley.edu/Faculty/Homepages/wong.html',
        'release60': 'https://www.postgresql.org/docs/9.0/release-6-0.html',
        'release65': 'https://www.postgresql.org/docs/7.1/release-6-5.html',
        'release71': 'https://www.postgresql.org/docs/7.1/release.html',
        'survey2022': 'https://survey.stackoverflow.co/2022/',
        'survey2023': 'https://survey.stackoverflow.co/2023/',
        'survey2026': 'https://survey.stackoverflow.co/2026/technology/data/databases',
        'survey-method2026': 'https://survey.stackoverflow.co/2026/methodology',
        'page': 'https://www.postgresql.org/docs/18/storage-page-layout.html',
        'files': 'https://www.postgresql.org/docs/18/storage-file-layout.html',
        'fsm': 'https://www.postgresql.org/docs/18/storage-fsm.html',
        'hot': 'https://www.postgresql.org/docs/18/storage-hot.html',
        'isolation': 'https://www.postgresql.org/docs/18/transaction-iso.html',
        'vacuum': 'https://www.postgresql.org/docs/18/routine-vacuuming.html',
        'wal': 'https://www.postgresql.org/docs/18/wal-intro.html',
        'sync': 'https://www.postgresql.org/docs/18/runtime-config-wal.html',
        'indexes': 'https://www.postgresql.org/docs/18/indexes-types.html',
        'index-only': 'https://www.postgresql.org/docs/18/indexes-index-only-scans.html',
        'extensibility': 'https://www.postgresql.org/docs/18/extend.html',
        'gist': 'https://www.postgresql.org/docs/18/gist.html',
        'ranges': 'https://www.postgresql.org/docs/18/rangetypes.html',
        'btree-gist': 'https://www.postgresql.org/docs/18/btree-gist.html',
        'constraints': 'https://www.postgresql.org/docs/18/ddl-constraints.html',
        'transactions': 'https://www.postgresql.org/docs/18/tutorial-transactions.html',
        'tableam': 'https://www.postgresql.org/docs/18/tableam.html',
        'hstore': 'https://www.postgresql.org/docs/18/hstore.html',
        'json': 'https://www.postgresql.org/docs/18/datatype-json.html',
        'postgis': 'https://postgis.net/documentation/getting_started/',
        'innodb-versions': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-multi-versioning.html',
        'innodb-indexes': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-index-types.html',
        'pg-logo': 'https://wiki.postgresql.org/wiki/Logo',
        'pg-license': 'https://www.postgresql.org/about/licence/',
    }

    def source_file(item):
        path, needles = item
        url = f'https://raw.githubusercontent.com/postgres/postgres/{commit}/{path}'
        content = get(url)
        dest = CACHE / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(content)
        lines = content.decode('utf-8').splitlines()
        return {'kind': 'code', 'path': path, 'url': f'https://github.com/postgres/postgres/blob/{commit}/{path}',
                'sha256': hashlib.sha256(content).hexdigest(), 'lines': len(lines),
                'symbols': {n: [i for i, line in enumerate(lines, 1) if n in line][:12] for n in needles}}

    def webpage(item):
        key, url = item
        try:
            content = get(url)
            (CACHE / (key + '.html')).write_bytes(content)
            soup = BeautifulSoup(content, 'html.parser')
            for node in soup(['script', 'style', 'nav']):
                node.decompose()
            (CACHE / (key + '.txt')).write_text(soup.get_text('\n', strip=True), encoding='utf-8')
            return {'kind': 'web', 'id': key, 'url': url, 'sha256': hashlib.sha256(content).hexdigest(), 'status': 'fetched'}
        except Exception as e:
            return {'kind': 'web', 'id': key, 'url': url, 'status': 'unavailable', 'error': type(e).__name__}

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        code = list(pool.map(source_file, files.items()))
        pages = list(pool.map(webpage, web.items()))
    result = {'schema': 1, 'checked_at': '2026-10-19', 'tag': TAG, 'commit': commit,
              'code': code, 'web': pages}
    (ROOT / 'research/sources.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'tag': TAG, 'commit': commit, 'code_files': len(code), 'web_fetched': sum(x['status']=='fetched' for x in pages),
                      'unavailable': [x['id'] for x in pages if x['status']!='fetched']}, ensure_ascii=False))

if __name__ == '__main__':
    main()
