"""Stack Overflow 开发者调查 2018–2026 年数据库题「全部答题者」口径的 MySQL / PostgreSQL 使用比例，供开场趋势折线。

原页缓存在 research/_src/sources/trend-survey<年>.html（2022、2023、2026 沿用 04 的缓存）；加 --fetch 重新下载。
只读公开页面上的汇总百分比，不收集受访者明细。各年题目措辞与样本不同，不能当成同一批人的迁移。
"""
from pathlib import Path
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / 'research/_src/sources'
DEST = Path(__file__).with_name('out_10_trend.json')
URLS = {
    2018: 'https://survey.stackoverflow.co/2018/',
    2019: 'https://survey.stackoverflow.co/2019/',
    2020: 'https://survey.stackoverflow.co/2020/',
    2021: 'https://survey.stackoverflow.co/2021/',
    2024: 'https://survey.stackoverflow.co/2024/technology',
    2025: 'https://survey.stackoverflow.co/2025/technology',
}
NAMES = ('MySQL', 'PostgreSQL')

def fetch():
    import requests
    for year, url in URLS.items():
        for direct in (False, True):
            try:
                s = requests.Session(); s.trust_env = not direct
                r = s.get(url, timeout=60, headers={'User-Agent': 'Mozilla/5.0'}); r.raise_for_status()
                (CACHE / f'trend-survey{year}.html').write_bytes(r.content)
                break
            except Exception:
                if direct:
                    raise

def bars(year, pane_id):
    # 2018–2019：柱状图 div.bar-row，按「全部答题者」标签页的 id 定位
    from bs4 import BeautifulSoup
    soup = BeautifulSoup((CACHE / f'trend-survey{year}.html').read_bytes(), 'html.parser')
    pane = soup.find(id=pane_id)
    assert pane is not None, (year, pane_id)
    out = {}
    for row in pane.find_all('div', class_='bar-row'):
        label = row.find('div', class_='bar-label').get_text(strip=True)
        if label in NAMES and label not in out:
            out[label] = float(re.search(r'([\d.]+)%', row.get_text(' ', strip=True))[1])
    return out

def table(year, pane_id):
    # 2020–2021：表格；2021 的单元格另带人数
    from bs4 import BeautifulSoup
    soup = BeautifulSoup((CACHE / f'trend-survey{year}.html').read_bytes(), 'html.parser')
    pane = soup.find(id=pane_id)
    assert pane is not None, (year, pane_id)
    out = {}
    for tr in pane.find_all('tr'):
        cells = [c.get_text(' ', strip=True) for c in tr.find_all(['th', 'td'])]
        if cells and cells[0] in NAMES:
            out[cells[0]] = float(re.match(r'([\d.]+)%', cells[1])[1])
    return out

def svg(year, chart):
    # 2024–2025：SVG 柱状图；chart 为 Databases 题「All Respondents」第一张图的组后缀
    s = (CACHE / f'trend-survey{year}.html').read_text(encoding='utf-8')
    out = {}
    for name, gid in (('PostgreSQL', 'postgre-sql'), ('MySQL', 'my-sql')):
        i = s.index(f'id="{gid}-{chart}"')
        out[name] = float(re.search(r'>([\d.]+)%</text>', s[i:i + 1500])[1])
    head = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s[s.index(f'id="postgre-sql-{chart}"') - 12000:s.index(f'id="postgre-sql-{chart}"')]))
    assert 'Databases' in head and 'All Respondents Professional Developers' in head and 'All Respondents' in head[-40:], (year, head[-200:])
    return out

def main():
    if '--fetch' in sys.argv:
        fetch()
    prior = {y['year']: y for y in json.loads((Path(__file__).with_name('out_04_survey.json')).read_text(encoding='utf-8'))['years']}
    rows = {
        2018: bars(2018, 'technology-most-popular-technologies-all-respondents3'),
        2019: bars(2019, 'technology-most-popular-technologies-all-respondents4'),
        2020: table(2020, 'technology-databases-all-respondents4'),
        2021: table(2021, 'database'),
        2024: svg(2024, 'gfrds'),
        2025: svg(2025, 's17'),
    }
    for y in (2022, 2023, 2026):
        rows[y] = {d['name']: d['percent'] for d in prior[y]['data']}
    years = []
    for y in sorted(rows):
        v = rows[y]
        assert set(v) == set(NAMES), y
        src = CACHE / (f'trend-survey{y}.html' if y in URLS else f'survey{y}.html')
        years.append({'year': y, 'source': URLS.get(y) or prior[y]['source'], 'scope': 'All Respondents',
                      'source_sha256': hashlib.sha256(src.read_bytes()).hexdigest(),
                      'MySQL': v['MySQL'], 'PostgreSQL': v['PostgreSQL'], 'leader': max(v, key=v.get)})
    # 与官方说明交叉：2022 MySQL 居首、2023 起 PostgreSQL 居首（S01/S02）；2024 原页说明 2018 年 PG 约 33%、MySQL 约 59%
    lead = {y['year']: y['leader'] for y in years}
    assert all(lead[y] == 'MySQL' for y in range(2018, 2023)) and all(lead[y] == 'PostgreSQL' for y in range(2023, 2027))
    assert round(rows[2018]['MySQL']) == 59 and round(rows[2018]['PostgreSQL']) == 33
    result = {'schema': 1, 'checked_at': '2026-10-19',
              'attribution': 'Stack Exchange Inc. / Stack Overflow Developer Survey，按年署名。',
              'warning': '各年为不同样本的多选自报使用比例；2024 起题目改为“过去一年做过大量开发工作”的数据库。不是市场份额，也不是同一批用户的迁移。',
              'crossover': 2023, 'years': years}
    DEST.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps({y['year']: [y['MySQL'], y['PostgreSQL']] for y in years}, ensure_ascii=False))

if __name__ == '__main__':
    main()
