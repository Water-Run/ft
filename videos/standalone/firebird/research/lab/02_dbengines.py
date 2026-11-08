#!/usr/bin/env python3
# DB-Engines 关系数据库排名：取回当月页面，按「排名 排名 排名 名称 模型 得分」的顺序解析。
# 用法：python research/lab/02_dbengines.py
import re, html, urllib.request, hashlib, datetime
URL = 'https://db-engines.com/en/ranking/relational+dbms'
raw = urllib.request.urlopen(urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read()
print('取回', datetime.date.today().isoformat(), URL); print('SHA-256', hashlib.sha256(raw).hexdigest())
t = html.unescape(re.sub(r'<[^>]+>', '|', raw.decode('utf-8', 'replace')))
t = re.sub(r'(\|\s*)+', '|', t)
print(re.search(r'\d+ systems in ranking, \w+ \d{4}', t).group(0))
for n in ('MySQL', 'PostgreSQL', 'SQLite', 'Firebird'):
    m = re.search(r'\|(\d+)\.\|\s*(\d+)\.\|\s*(\d+)\.\|' + n + r'\|', t)
    tail = t[m.end():m.end() + 160]
    score = re.search(r'\|?(\d+\.\d\d)\|', tail).group(1)
    print(f'{n}: 本月第 {m.group(1)}，得分 {score}')
