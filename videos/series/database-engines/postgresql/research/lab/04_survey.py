"""从已保存的调查原页提取全部答题者口径的两库数据；不收集受访者明细。"""
from pathlib import Path
import hashlib
import json
import re
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / 'research/_src/sources'
DEST = Path(__file__).with_name('out_04_survey.json')

def main():
    years = []
    for year, table_id in [(2022,'databasespfb1'),(2023,'databasedmk1u')]:
        path = CACHE / f'survey{year}.html'
        soup = BeautifulSoup(path.read_bytes(),'html.parser')
        table = soup.find('table',id=table_id)
        assert table is not None
        rows = []
        for row in table.find_all('tr'):
            cells = [c.get_text(' ',strip=True) for c in row.find_all(['th','td'])]
            if cells and cells[0] in ['MySQL','PostgreSQL']:
                # 官方旧站将百分比、人数放在同一个单元格。
                value = re.fullmatch(r'([\d.]+)%\s+([\d,]+)', ' '.join(cells[1:]))
                assert value is not None
                rows.append({'name':cells[0],'percent':float(value[1]),'respondents':int(value[2].replace(',',''))})
        assert len(rows)==2
        years.append({'year':year,'source':f'https://survey.stackoverflow.co/{year}/','scope':'All Respondents / used / multiple choice',
                      'table_id':table_id,'source_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'data':rows})
    path = CACHE / 'survey2026.html'
    soup = BeautifulSoup(path.read_bytes(),'html.parser')
    exported = json.loads(soup.find('textarea',id='export-json').get_text())
    assert exported['demographic']['id']=='all-respondents'
    selected = []
    for row in exported['data']:
        if row['response'] in ['PostgreSQL','MySQL']:
            percent = round(row['pct']*100,1)
            assert round(row['count']/exported['demographic']['n']*100,1)==percent
            selected.append({'name':row['response'],'percent':percent,'respondents':row['count']})
    assert len(selected)==2
    years.append({'year':2026,'source':exported['url'],'scope':'All Respondents / used / multiple choice',
                  'question_n':exported['demographic']['n'],'source_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                  'data':selected,'licence':exported['licence']})
    result = {'schema':1,'checked_at':'2026-10-19','attribution':'Stack Exchange Inc. / Stack Overflow Developer Survey，按年署名。2026 数据 ODbL 1.0。',
              'warning':'多选自报开发使用，非全球市场份额；不同年份样本不能当同一批用户迁移。','years':years}
    DEST.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'years':[x['year'] for x in years],'verified':True,'question_n_2026':years[-1]['question_n']},ensure_ascii=False))

if __name__ == '__main__':
    main()
