#!/usr/bin/env python3
"""Fetch official references into ignored _src; record hashes and exact locations.
Requires requests and beautifulsoup4. Full third-party text is not committed.
"""
import hashlib
import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / '_src'
TAG = 'mysql-9.7.2'
DOCS = {
 'D01': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-index-types.html',
 'D02': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-physical-structure.html',
 'D03': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-multi-versioning.html',
 'D04': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-consistent-read.html',
 'D05': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-locking.html',
 'D06': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-redo-log.html',
 'D07': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-recovery.html',
 'D08': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-undo-logs.html',
 'D09': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-buffer-pool.html',
 'D10': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-doublewrite-buffer.html',
 'D11': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-file-per-table-tablespaces.html',
 'D12': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-autocommit-commit-rollback.html',
 'D13': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-deadlocks.html',
 'D14': 'https://dev.mysql.com/doc/refman/9.7/en/mysql-releases.html',
 'D15': 'https://dev.mysql.com/downloads/mysql/9.7.html',
 'D16': 'https://dev.mysql.com/doc/relnotes/mysql/9.7/en/news-9-7-3.html',
 'D17': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-row-format.html',
 'D18': 'https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-isolation-levels.html',
 'D19': 'https://dev.mysql.com/doc/refman/9.7/en/myisam-storage-engine.html',
}
FILES = {
 'C01': ('storage/innobase/include/page0types.h', ['PAGE_HEADER','PAGE_N_RECS','PAGE_LEVEL','PAGE_INDEX_ID','PAGE_NEW_INFIMUM']),
 'C02': ('storage/innobase/include/fil0fil.h', ['FIL_PAGE_OFFSET','FIL_PAGE_TYPE','FIL_PAGE_DATA','FIL_PAGE_INDEX']),
 'C03': ('storage/innobase/include/rem0rec.h', ['REC_N_NEW_EXTRA_BYTES','rec_get_next_offs','REC_INFO_DELETED_FLAG']),
 'C04': ('storage/innobase/include/read0types.h', ['changes_visible','m_low_limit_id','m_up_limit_id']),
 'C05': ('storage/innobase/read/read0read.cc', ['ReadView::prepare','MVCC::view_open']),
 'C06': ('storage/innobase/row/row0sel.cc', ['row_search_mvcc','row_sel_build_prev_vers_for_mysql','lock_clust_rec_cons_read_sees']),
 'C07': ('storage/innobase/row/row0vers.cc', ['row_vers_build_for_consistent_read']),
 'C08': ('storage/innobase/trx/trx0trx.cc', ['trx_commit','trx_flush_log_if_needed','trx_assign_read_view']),
 'C09': ('storage/innobase/lock/lock0lock.cc', ['lock_rec_lock','DeadlockChecker','DeadlockNotifier']),
 'C10': ('storage/innobase/log/log0recv.cc', ['recv_recovery_from_checkpoint_start','recv_apply_hashed_log_recs']),
 'C11': ('storage/innobase/trx/trx0roll.cc', ['trx_rollback_or_clean_recovered','trx_rollback_for_mysql']),
 'C12': ('storage/innobase/handler/ha_innodb.cc', ['ha_innobase::index_read','ha_innobase::write_row','ha_innobase::update_row','innobase_commit']),
 'C13': ('storage/innobase/dict/dict0dict.cc', ['dict_index_build_internal_clust','dict_index_build_internal_non_clust']),
 'C14': ('storage/innobase/include/data0type.h', ['DATA_TRX_ID_LEN','DATA_ROLL_PTR_LEN','DATA_ROW_ID_LEN']),
 'C15': ('storage/innobase/include/mach0data.ic', ['mach_write_to_4','mach_read_from_4']),
 'C16': ('storage/innobase/btr/btr0cur.cc', ['btr_cur_search_to_nth_level','btr_cur_optimistic_insert','btr_cur_pessimistic_insert']),
 'C17': ('storage/innobase/include/fil0types.h', ['FIL_PAGE_OFFSET','FIL_PAGE_TYPE','FIL_PAGE_DATA']),
 'C18': ('storage/innobase/rem/rec.h', ['REC_N_NEW_EXTRA_BYTES','REC_INFO_DELETED_FLAG']),
 'C19': ('storage/innobase/include/rem0rec.ic', ['rec_get_next_offs']),
 'C20': ('storage/innobase/include/fsp0types.h', ['FSEG_PAGE_DATA','FSEG_HEADER_SIZE']),
 'C21': ('storage/innobase/buf/buf0buf.cc', ['buf_page_get_gen','buf_page_get_low']),
 'C22': ('storage/innobase/buf/buf0dblwr.cc', ['recover','write_pages','dblwr::write']),
 'C23': ('storage/innobase/row/row0mysql.cc', ['row_mysql_store_col_in_innobase_format','0x80']),
 'C24': ('storage/innobase/lock/lock0wait.cc', ['lock_wait_check_and_resolve_deadlock','lock_wait_rollback_deadlock_victim']),
}


def fetch(url):
    last_error = None
    for attempt in range(4):
        try:
            response = requests.get(url, timeout=40)
            response.raise_for_status()
            return response
        except requests.RequestException as error:
            last_error = error
            time.sleep(0.5 * (attempt + 1))
    raise last_error


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    obj = fetch('https://api.github.com/repos/mysql/mysql-server/git/ref/tags/' + TAG).json()['object']
    while obj['type'] == 'tag':
        obj = fetch(obj['url']).json()['object']
    commit = obj['sha']
    (ROOT / 'lab/source_version.json').write_text(json.dumps({'tag':TAG,'commit':commit,'checked':'2026-10-09'},indent=2)+'\n')

    previous = {}
    if (ROOT/'sources.json').exists():
        previous = {r['id']:r for r in json.loads((ROOT/'sources.json').read_text())}

    def cached(sid,url):
        old=previous.get(sid,{})
        if old.get('status')=='fetched' and old.get('url')==url and (ROOT/old['local']).exists():
            if hashlib.sha256((ROOT/old['local']).read_bytes()).hexdigest()==old['sha256']:
                return old

    def doc(item):
        sid,url = item
        old=cached(sid,url)
        if old:
            return old
        result = {'id':sid,'kind':'official_manual','url':url,'checked':'2026-10-09'}
        try:
            r=fetch(url)
            p=RAW/'manual'/(sid+'.html'); p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(r.content)
            soup=BeautifulSoup(r.content,'html.parser')
            main=soup.select_one('#docs-body') or soup.select_one('#main') or soup
            text=main.get_text('\n',strip=True)
            p.with_suffix('.txt').write_text(text,encoding='utf-8')
            result.update(status='fetched',title=soup.title.get_text() if soup.title else '',final_url=r.url,sha256=hashlib.sha256(r.content).hexdigest(),local=str(p.relative_to(ROOT)))
        except Exception as e:
            result.update(status='failed',error=str(e))
        return result

    def code(item):
        sid,(path,symbols)=item
        url='https://raw.githubusercontent.com/mysql/mysql-server/'+commit+'/'+path
        old=cached(sid,url)
        if old:
            return old
        result={'id':sid,'kind':'official_source','url':url,'tag':TAG,'commit':commit,'path':path,'checked':'2026-10-09'}
        try:
            r=fetch(url); p=RAW/'mysql'/path; p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(r.content)
            lines=r.text.splitlines()
            locations={symbol:[i for i,line in enumerate(lines,1) if symbol in line] for symbol in symbols}
            result.update(status='fetched',sha256=hashlib.sha256(r.content).hexdigest(),lines=len(lines),symbols=locations,local=str(p.relative_to(ROOT)))
        except Exception as e:
            result.update(status='failed',error=str(e))
        return result

    with ThreadPoolExecutor(max_workers=3) as pool:
        records=list(pool.map(doc,DOCS.items()))+list(pool.map(code,FILES.items()))
    (ROOT/'sources.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    for row in records:
        print(row['id'],row['status'],row.get('path',row['url']))
    print('Pinned source:',TAG,commit)


if __name__=='__main__':
    main()
