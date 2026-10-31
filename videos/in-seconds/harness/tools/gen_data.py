# 从实验记录 research/lab/out_01_harness_a.json 生成画面数据 src/js/data.js。画面上的数字与文字只从这里来（FACTS E1–E8）。
# 用法：python tools/gen_data.py   （在本片目录下运行）
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'research', 'lab', 'out_01_harness_a.json')
OUT = os.path.join(HERE, '..', 'src', 'js', 'data.js')

d = json.load(open(SRC, encoding='utf-8'))
demo = os.path.join(HERE, '..', 'research', 'lab', 'demo')
rounds = []
for r in d['rounds']:
    msg = r['response']['choices'][0]['message']
    calls = []
    for c in msg.get('tool_calls') or []:
        calls.append({'name': c['function']['name'], 'args': json.loads(c['function']['arguments'] or '{}')})
    results = [t['result'].replace('\r\n', '\n').rstrip('\n') for t in r['tool_results']]
    rounds.append({
        'n': r['round'],
        'sent': len(r['request']['messages']),            # 这次请求发出的消息条数（E8）
        'roles': [m['role'] for m in r['request']['messages']],
        'tokens': r['response']['usage']['prompt_tokens'],
        'bytes': r['request_bytes'],
        'finish': r['response']['choices'][0]['finish_reason'],
        'say': msg.get('content') or '',
        'calls': calls,
        'results': results,
    })

data = {
    'model': d['model'],
    'date': d['date_utc'],
    'tools': [t['function']['name'] for t in d['tools']],
    'tool_desc': [t['function']['description'] for t in d['tools']],
    'system': d['rounds'][0]['request']['messages'][0]['content'],
    'task': d['rounds'][0]['request']['messages'][1]['content'],
    'cart_before': open(os.path.join(demo, 'cart.py'), encoding='utf-8').read().rstrip('\n'),
    'cart_after': d['after']['cart.py'].rstrip('\n'),
    'rounds': rounds,
}
with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// 由 tools/gen_data.py 从 research/lab/out_01_harness_a.json 生成。不要手改。\n')
    f.write('window.DATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
print(OUT, [(r['n'], r['sent'], r['tokens'], [c['name'] for c in r['calls']]) for r in rounds])
