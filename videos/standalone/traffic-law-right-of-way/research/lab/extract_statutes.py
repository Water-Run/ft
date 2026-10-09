"""Extract selected public statutory articles from archived official text.

Requires ignored research/_src snapshots and their matching manifest hashes.
Does not fetch, determine current legal force, or validate legal interpretation.
No news case narratives or personal details are copied into the output.
"""
from hashlib import sha256
from pathlib import Path
import json
import re

RESEARCH = Path(__file__).resolve().parents[1]
SELECTION = {
    'L01V': ['第二十二条','第二十五条','第三十五条','第三十八条','第四十四条',
             '第四十五条','第四十七条','第五十三条','第六十二条','第七十六条','第一百一十九条'],
    'L02': ['第三十八条','第三十九条','第四十条','第四十一条','第四十二条','第四十四条',
            '第四十八条','第四十九条','第五十一条','第五十二条','第五十三条','第五十七条',
            '第七十条','第九十一条'],
    'L03': ['第五十九条','第六十条'],
    'J02': ['第三条','第十二条'],
}


def extract():
    records = {s['id']: s for s in json.loads((RESEARCH/'lab/source_snapshot_manifest.json').read_text(encoding='utf-8'))['sources']}
    result = []
    for source_id, articles in SELECTION.items():
        record = records[source_id]
        if record['status'] != 'captured':
            raise ValueError(f'{source_id}: no successful capture')
        raw = (RESEARCH.parent/record['txt_path']).read_bytes()
        if sha256(raw).hexdigest() != record['txt_sha256']:
            raise ValueError(f'{source_id}: snapshot hash mismatch')
        text = raw.decode('utf-8')
        matches = list(re.finditer(r'(?m)^第[一二三四五六七八九十百零〇]+条(?:\s|$)', text))
        for article in articles:
            found = [i for i,m in enumerate(matches) if text[m.start():].startswith(article)]
            if len(found) != 1:
                raise ValueError(f'{source_id}: expected exactly one {article}, found {len(found)}')
            i = found[0]
            end = matches[i+1].start() if i+1<len(matches) else len(text)
            excerpt = text[matches[i].start():end].strip()
            excerpt = re.split(r'(?m)^第[一二三四五六七八九十百]+章', excerpt)[0].strip()
            if source_id == 'J02' and article == '第十二条':
                excerpt = excerpt.split('相关链接：')[0].strip()
            result.append(dict(source_id=source_id,article=article,source_url=record['url'],
                snapshot_sha256=record['txt_sha256'],text=excerpt))
    return dict(research_date='2026-10-09',note='规范文本摘录，非现行效力判定。L03 版本缺口与其他限制见 FACTS。',excerpts=result)


if __name__ == '__main__':
    result = extract()
    (RESEARCH/'lab/statutory-excerpts.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f"Extracted {len(result['excerpts'])} statutory articles from {len(SELECTION)} sources.")
