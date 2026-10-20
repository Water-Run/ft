# 取证数据 → 画面数据：读 research/lab/ 下的摘录、版本日期与实验回显，写 src/js/data.js（由本脚本生成，不要手改）。
# 用法：python -I tools/gen_data.py   （在视频目录下运行，或给出视频目录作参数）
import json, os, sys, glob, re

V = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAB = os.path.join(V, 'research', 'lab')
J = lambda *p: json.load(open(os.path.join(LAB, *p), encoding='utf-8'))

EMOJI = re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F]\\s?')
strip_emoji = lambda t: EMOJI.sub('', t)
ex = {e['key']: {'repo': e['repo'], 'ver': e['version'], 'path': e['file'], 'line': e['line'], 'text': '\n'.join(e['text'])} for e in J('out_01_excerpts.json')}
meta = J('out_02_meta.json')
for t_, ls in meta['openclaw_readme_lines'].items():
    for l in ls: l['text'] = strip_emoji(l['text'])

def reqs(d):
    out = []
    for f in sorted(glob.glob(os.path.join(LAB, d, 'model', 'req_*.json'))):
        r = json.load(open(f, encoding='utf-8'))
        b = r['body'] if isinstance(r['body'], dict) else {}
        msgs = []
        for m in b.get('messages', []):
            c = m.get('content')
            if isinstance(c, list):
                c = ' '.join(x.get('text', '') for x in c if isinstance(x, dict))
            item = {'role': m['role'], 'text': (c or '') if m['role'] != 'system' else ''}
            if m.get('tool_calls'):
                item['calls'] = [{'id': tc['id'], 'name': tc['function']['name'], 'args': json.loads(tc['function']['arguments'])} for tc in m['tool_calls']]
            if m['role'] == 'tool':
                item['id'] = m.get('tool_call_id')
            msgs.append(item)
        out.append({'n': r['n'], 'tools': len(b.get('tools', [])), 'stream': b.get('stream'), 'messages': msgs})
    return out

def text(d, f):
    return open(os.path.join(LAB, d, f), encoding='utf-8').read().rstrip('\n').split('\n')

def tree(d, f):
    return text(d, f)

def parts(d, sub):
    out = []
    base = os.path.join(LAB, d, sub)
    for f in sorted(glob.glob(os.path.join(base, 'part', '*', '*.json'))):
        p = json.load(open(f, encoding='utf-8'))
        if p.get('type') == 'tool':
            out.append({'file': os.path.relpath(f, base).replace(os.sep, '/'), 'tool': p['tool'], 'status': p['state']['status'], 'command': p['state']['input']['command'], 'start': p['state'].get('time', {}).get('start')})
    return out

db = J('exp_v2', 'db_rows.json')
def rows(k):
    out = []
    for m in db[k]['session_message']:
        d = m['data']; item = {'seq': m['seq'], 'type': m['type']}
        if m['type'] in ('user', 'synthetic'):
            item['text'] = d.get('text', '')
        if m['type'] == 'assistant':
            for c in d.get('content', []):
                if c['type'] == 'tool':
                    st = c['state']
                    item['tool'] = {'id': c['id'], 'name': c['name'], 'status': st['status'], 'command': st['input']['command'], 'error': st.get('error'), 'created': c.get('time', {}).get('created'), 'ran': c.get('time', {}).get('ran')}
                if c['type'] == 'text':
                    item['text'] = c['text']
        if m['type'] == 'idle':
            item['outcome'] = d.get('outcome')
        out.append(item)
    return out

data = {
    'ex': ex,
    'meta': meta,
    'exp': {
        'v1': {'timeline': text('exp_v1', 'timeline.txt'), 'decisions': text('exp_v1', 'decisions.txt'), 'ps_before': text('exp_v1', 'ps_before.txt'), 'ps_after': text('exp_v1', 'ps_after_kill.txt'),
               'storage': tree('exp_v1', 'storage_after_kill.txt'), 'parts_after_kill': parts('exp_v1', 'storage_after_kill'), 'parts_final': parts('exp_v1', 'storage_final'), 'req': reqs('exp_v1')},
        'v2': {'timeline': text('exp_v2', 'timeline.txt'), 'decisions': text('exp_v2', 'decisions.txt'), 'ps_before': text('exp_v2', 'ps_before.txt'), 'ps_after': text('exp_v2', 'ps_after_kill.txt'),
               'rows_kill': rows('after_kill'), 'rows_final': rows('after_recovery'), 'seq_kill': db['after_kill']['event_sequence'][0][1], 'seq_final': db['after_recovery']['event_sequence'][0][1],
               'claim_kill': db['after_kill']['session_v2'][0], 'claim_final': db['after_recovery']['session_v2'][0], 'tables': db['after_kill']['tables'], 'req': reqs('exp_v2')},
    },
}
js = '// 由 tools/gen_data.py 从 research/lab/ 生成，不要手改。\nwindow.DATA = ' + json.dumps(data, ensure_ascii=False, indent=0) + ';\n'
open(os.path.join(V, 'src', 'js', 'data.js'), 'w', encoding='utf-8', newline='\n').write(js)
print('data.js', len(js), 'bytes;', len(ex), 'excerpts')
