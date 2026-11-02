# 02 思考模式：同一批乘法题（01 的题目，每种位数取前 5 题），交给思考模式（deepseek-reasoner），
#    记录它在回答之前写了多少思考、思考的原文、最终答案是否正确。
# 用法：python 02_reasoner.py        （需要环境变量 DEEPSEEK_API_KEY；不写入任何文件）
# 输出：out_02_reasoner.jsonl（每题的思考原文 reasoning、回答 reply、用量 usage）
#       out_02_reasoner.txt  （逐位数的正确数与思考 token 数）
import os, json, re, importlib.util, concurrent.futures as cf
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('m01', os.path.join(HERE, '01_multiply.py'))
m01 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m01)

MODEL = 'deepseek-reasoner'
TAKE = 5
PROMPT = '计算 {a} × {b}。最后单独一行写「答案：」加最终结果。'


def run(p):
    body = {'model': MODEL, 'messages': [{'role': 'user', 'content': PROMPT.format(a=p['a'], b=p['b'])}], 'max_tokens': 32000}
    d = m01.call(body)
    ch = d['choices'][0]
    msg = ch['message']
    text = msg.get('content') or ''
    rec = dict(p, prompt=body['messages'][0]['content'], model=d.get('model'), fingerprint=d.get('system_fingerprint'), finish=ch.get('finish_reason'), reasoning=msg.get('reasoning_content') or '', reply=text, usage=d.get('usage'))
    rec['answer'] = m01.parse('think_first', text)
    rec['correct'] = rec['answer'] == p['product']
    return rec


def main():
    seen = defaultdict(int)
    todo = []
    for p in m01.problems():
        if seen[p['n']] < TAKE:
            seen[p['n']] += 1
            todo.append(p)
    with cf.ThreadPoolExecutor(5) as ex:
        recs = list(ex.map(run, todo))
    with open(os.path.join(HERE, 'out_02_reasoner.jsonl'), 'w', encoding='utf-8', newline='\n') as f:
        for r in recs:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')
    lines = [f'# 02 思考模式汇总  model 请求 {MODEL}，返回 {sorted(set(r["model"] for r in recs))}', f'# 每种位数取 01 的前 {TAKE} 题', '位数\t正确\t总数\t思考 token（逐题）\t思考汉字与字符数（逐题）']
    for n in m01.SIZES:
        rs = [r for r in recs if r['n'] == n]
        rt = [((r['usage'].get('completion_tokens_details') or {}).get('reasoning_tokens')) for r in rs]
        lines.append(f'{n}\t{sum(r["correct"] for r in rs)}\t{len(rs)}\t{rt}\t{[len(r["reasoning"]) for r in rs]}')
    lines.append('# 因长度截断的回复：' + str(sum(1 for r in recs if r['finish'] != 'stop')))
    open(os.path.join(HERE, 'out_02_reasoner.txt'), 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
