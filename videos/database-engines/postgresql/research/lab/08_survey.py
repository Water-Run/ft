"""08 开场：Stack Overflow 开发者调查 2022–2026 年数据库题「全部答题者」口径的 PostgreSQL、MySQL 使用比例。

先重新下载各年原页（存进 research/_src/survey-<日期>/，不入库）；下载失败才用 2026-10-19 旧版取证时的缓存（research/_src/sources/），
结果里写明每年用的是哪一份、SHA-256 与取得日期。只读公开页面上的汇总百分比与人数，不收集受访者明细。
页面结构各年不同：2022、2023 是表格（百分比与人数同格）；2024、2025 是 SVG 柱状图（只有百分比）；2026 页面里附有导出的 JSON（含人数与分母）。
各年是不同样本的多选自报；不是市场份额，也不是同一批人的迁移。
用法：python 08_survey.py
"""
import hashlib
import json
import re
import time
import urllib.request
from pathlib import Path
from bs4 import BeautifulSoup

LAB = Path(__file__).resolve().parent
SRC = LAB.parent / '_src'
NEW = SRC / ('survey-' + time.strftime('%Y-%m-%d'))
OLD = SRC / 'sources'
URLS = {2022: 'https://survey.stackoverflow.co/2022/', 2023: 'https://survey.stackoverflow.co/2023/',
        2024: 'https://survey.stackoverflow.co/2024/technology', 2025: 'https://survey.stackoverflow.co/2025/technology',
        2026: 'https://survey.stackoverflow.co/2026/technology/data/databases'}
OLDNAME = {2022: 'survey2022.html', 2023: 'survey2023.html', 2024: 'trend-survey2024.html', 2025: 'trend-survey2025.html', 2026: 'survey2026.html'}
NAMES = ('MySQL', 'PostgreSQL')


def get(year):
    NEW.mkdir(parents=True, exist_ok=True)
    dest = NEW / f'{year}.html'
    try:
        req = urllib.request.Request(URLS[year], headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as r:
            dest.write_bytes(r.read())
        return dest, 'fetched ' + time.strftime('%Y-%m-%d')
    except Exception as e:
        return OLD / OLDNAME[year], f'cache 2026-10-19 (fetch failed: {type(e).__name__})'


def context(text, i, n=600):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', text[max(0, i - n):i]))[-240:]


def table(path, table_id):
    soup = BeautifulSoup(path.read_bytes(), 'html.parser')
    t = soup.find('table', id=table_id)
    out = {}
    for tr in t.find_all('tr'):
        cells = [c.get_text(' ', strip=True) for c in tr.find_all(['th', 'td'])]
        if cells and cells[0] in NAMES:
            m = re.fullmatch(r'([\d.]+)%\s+([\d,]+)', ' '.join(cells[1:]))
            out[cells[0]] = {'percent': float(m[1]), 'respondents': int(m[2].replace(',', ''))}
    # 口径：表格在 figure#most-popular-technologies-database 里；切换到它的标签按钮标题是「All Respondents」（-prof、-learn 是另两个口径）
    fig = t.find_parent('figure')
    raw = path.read_text(encoding='utf-8')
    m = re.search(r'href="#' + fig['id'] + r'"\s+data-group="section-most-popular-technologies-databases"\s+title="([^"]+)"', raw)
    assert m and m[1] == 'All Respondents', (fig['id'], m and m[1])
    return out


def svg(path, chart):
    s = path.read_text(encoding='utf-8')
    out = {}
    for name, gid in (('PostgreSQL', 'postgre-sql'), ('MySQL', 'my-sql')):
        i = s.index(f'id="{gid}-{chart}"')
        out[name] = {'percent': float(re.search(r'>([\d.]+)%</text>', s[i:i + 1500])[1])}
    i = s.index(f'id="postgre-sql-{chart}"')
    head = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s[i - 12000:i]))
    assert 'Databases' in head and 'All Respondents' in head[-60:], head[-300:]
    return out, head[-160:]


def exported(path):
    soup = BeautifulSoup(path.read_bytes(), 'html.parser')
    e = json.loads(soup.find('textarea', id='export-json').get_text())
    assert e['demographic']['id'] == 'all-respondents'
    out = {}
    for row in e['data']:
        if row['response'] in NAMES:
            pct = round(row['pct'] * 100, 1)
            assert round(row['count'] / e['demographic']['n'] * 100, 1) == pct
            out[row['response']] = {'percent': pct, 'respondents': row['count']}
    return out, {k: e.get(k) for k in ('url', 'licence', 'question', 'title') if k in e} | {'n': e['demographic']['n'], 'demographic': e['demographic'].get('name')}


years = []
for y in sorted(URLS):
    path, how = get(y)
    rec = {'year': y, 'url': URLS[y], 'copy': how, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'scope': 'All Respondents'}
    if y in (2022, 2023):
        rec['data'] = table(path, {2022: 'databasespfb1', 2023: 'databasedmk1u'}[y]); rec['table_id'] = {2022: 'databasespfb1', 2023: 'databasedmk1u'}[y]
    elif y in (2024, 2025):
        rec['data'], rec['context'] = svg(path, {2024: 'gfrds', 2025: 's17'}[y])
    else:
        rec['data'], rec['export'] = exported(path)
    rec['leader'] = max(NAMES, key=lambda n: rec['data'][n]['percent'])
    years.append(rec)
    print(y, how, {n: rec['data'][n] for n in NAMES}, 'leader', rec['leader'])

out = {'script': '08_survey', 'date': time.strftime('%Y-%m-%d'), 'attribution': 'Stack Exchange Inc. / Stack Overflow Developer Survey，按年署名',
       'warning': '各年为不同样本的多选自报使用比例；不是市场份额，也不是同一批用户的迁移。', 'years': years}
(LAB / 'out_08_survey.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
