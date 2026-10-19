"""保留第 3 稿比较与选型材料的公开原页、哈希；不执行网页或下载扩展二进制。"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path
import hashlib
import json
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[2]
CACHE=ROOT/'research/_src/sources'
URLS={
 'survey2026':'https://survey.stackoverflow.co/2026/technology/data/databases',
 'partial':'https://www.postgresql.org/docs/18/indexes-partial.html',
 'jsonb':'https://www.postgresql.org/docs/18/datatype-json.html',
 'index-only':'https://www.postgresql.org/docs/18/indexes-index-only-scans.html',
 'pg-about':'https://www.postgresql.org/about/',
 'pg-license':'https://www.postgresql.org/about/licence/',
 'mysql-indexes':'https://dev.mysql.com/doc/refman/9.7/en/innodb-index-types.html',
 'mysql-isolation':'https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-isolation-levels.html',
 'mysql-json':'https://dev.mysql.com/doc/refman/9.7/en/json.html',
 'mysql-spatial':'https://dev.mysql.com/doc/refman/9.7/en/spatial-types.html',
 'django':'https://docs.djangoproject.com/en/5.2/intro/tutorial02/',
 'supabase':'https://supabase.com/docs/guides/database/overview',
 'pgvector':'https://github.com/pgvector/pgvector',
}

def fetch(item):
    key,url=item
    try:
        response=requests.get(url,timeout=45,headers={'User-Agent':'ft-postgresql-research/1.0'})
        response.raise_for_status()
        content=response.content
        (CACHE/f'compare-{key}.html').write_bytes(content)
        soup=BeautifulSoup(content,'html.parser')
        for tag in soup(['script','style','nav']):tag.decompose()
        (CACHE/f'compare-{key}.txt').write_text(soup.get_text('\n',strip=True),encoding='utf-8')
        return {'id':key,'url':url,'status':'fetched','sha256':hashlib.sha256(content).hexdigest()}
    except Exception as e:
        return {'id':key,'url':url,'status':'unavailable','error':type(e).__name__,
                'alternate_verification':'原页已通过网页工具读取；抓取失败不记作已缓存'}

def main():
    CACHE.mkdir(parents=True,exist_ok=True)
    with ThreadPoolExecutor(max_workers=5) as pool:items=list(pool.map(fetch,URLS.items()))
    record={'schema':1,'checked_at':datetime.now(timezone(timedelta(hours=8))).isoformat(),'scope':'第3稿比较与选型的一手资料，技术能力与采用案例分开','sources':items}
    (ROOT/'research/comparison-sources.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'fetched':sum(x['status']=='fetched' for x in items),'unavailable':[x['id'] for x in items if x['status']!='fetched']},ensure_ascii=False))

if __name__=='__main__':main()
