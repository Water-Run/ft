# 10 按固定提交号取 Qwen3.8-Flash-Next 的模型卡（README.md），摘出画面要引用的原文行与第一张成绩表（语言任务）里 Flash-Next 与 27B 的两列，
#    写成 flash_card.json。第二张表（多模态）只做比较计数，画面不用
import html, json, os, re, urllib.request
LAB = os.path.dirname(os.path.abspath(__file__))
REPO, REV = 'Qwen/Qwen3.8-Flash-Next', 'de4b8e4d43b917e7706784d8bb445c9af86a3540'   # 与 04 / 08 相同
ANCHORS = {
    'params': r'Number of Parameters: (.+)$',
    'layers': r'Number of Layers: (\d+)',
    'layout': r'Hidden Layout: (.+)$',
    'experts': r'Number of Experts: (\d+)',
    'activated': r'Number of Activated Experts: (.+)$',
    'official': r'(\*\*Qwen3\.8-Flash\*\* is the official version based on Qwen3\.8-Flash-Next)',
}
with urllib.request.urlopen(f'https://huggingface.co/{REPO}/resolve/{REV}/README.md', timeout=60) as r: text = r.read().decode('utf-8')
out = open(os.path.join(LAB, 'out_10_flash_card.txt'), 'w', encoding='utf-8', newline='\n')
def say(*a):
    s = ' '.join(str(x) for x in a); print(s); out.write(s + '\n')
say(f'== {REPO} @ {REV[:12]}  README.md')
got = {}
for k, rx in ANCHORS.items():
    for n, line in enumerate(text.splitlines(), 1):
        m = re.search(rx, line)
        if m: got[k] = {'line': n, 'text': m.group(1).strip()}; break
    say(f'   L{got[k]["line"]:<4d} {k:10s} {got[k]["text"]}')
def rows(tb):
    for tr in re.findall(r'<tr.*?</tr>', tb, re.S):
        yield [re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' | ', c))).strip(' |') for c in re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', tr, re.S)]
def parts(cell): return [x for x in re.split(r'\s*\|\s*', cell) if x]
def first_num(cell):   # 「Pass@1 | 24.3 | Score | 51.2」这类单元格取第一个分数（Pass@1）
    m = re.search(r'(?<![@\w])(\d+(?:\.\d+)?)(?![@\w])', cell.replace('Pass@1', '').replace('Pass@3', ''))
    return float(m.group(1)) if m else None
tables = re.findall(r'<table.*?</table>', text, re.S)
head = next(rows(tables[0]))
assert head[1] == 'Qwen3.8-Flash-Next' and head[2] == 'Qwen3.8-27B', head
scores, info = [], {}
for r in rows(tables[0]):
    if len(r) < 3 or r == head: continue
    if r[0].startswith('#'): info[r[0]] = (r[1], r[2]); continue
    name = parts(r[0])[-1]
    a, b = first_num(r[1]), first_num(r[2])
    scores.append({'bench': name, 'cap': parts(r[0])[0], 'flash': a, 'q27': b, 'metric': 'Pass@1' if 'Pass@1' in r[1] else None})
say('   表头参数行：', '；'.join(f'{k} Flash-Next {v[0]} / 27B {v[1]}' for k, v in info.items()))
for s in scores: say(f'   {s["bench"]:34s} Flash-Next {s["flash"]:5.1f}   27B {s["q27"]:5.1f}' + (f'   ({s["metric"]})' if s['metric'] else ''))
assert len(scores) == 12 and all(s['flash'] > s['q27'] for s in scores)
say(f'   语言任务 {len(scores)} 项，Flash-Next 全部高于 27B')
mm = [r for r in rows(tables[1]) if len(r) >= 3 and r[0] and not r[0].startswith('#')]
cmp = [(parts(r[0])[-1], first_num(r[1]), first_num(r[2])) for r in mm]
cmp = [c for c in cmp if c[1] is not None and c[2] is not None]
say(f'   多模态表 {len(cmp)} 项（按每格第一个分数）：高于 {sum(a > b for _, a, b in cmp)}，持平 {sum(a == b for _, a, b in cmp)}（' + '、'.join(n for n, a, b in cmp if a == b) + f'），低于 {sum(a < b for _, a, b in cmp)}')
json.dump({'repo': REPO, 'rev': REV, **got, 'head': info, 'scores': scores}, open(os.path.join(LAB, 'flash_card.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
out.close()
