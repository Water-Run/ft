# 01 乘法实验：同一个模型、同一批乘法题，三种问法。
#   direct       只输出结果
#   think_first  先写计算过程，最后一行写答案
#   answer_first 第一行先写答案，再写计算过程
# 用法：python 01_multiply.py        （需要环境变量 DEEPSEEK_API_KEY；不写入任何文件）
# 输出：out_01_multiply.jsonl（每次调用的题目、问法、模型回复、解析出的答案、用量；direct 另带 top-5 logprobs）
#       out_01_multiply.txt  （逐位数、逐问法的正确率汇总）
import os, json, random, re, time, urllib.request, concurrent.futures as cf
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
KEY = os.environ['DEEPSEEK_API_KEY']
URL = 'https://api.deepseek.com/chat/completions'
MODEL = 'deepseek-chat'
SIZES = (3, 4, 5, 6, 7)
PER = 20
SEED = 2026

PROMPTS = {
    'direct': '计算 {a} × {b}。只输出最终结果的数字，不要任何其他文字。',
    'think_first': '计算 {a} × {b}。先一步一步写出计算过程，最后单独一行写「答案：」加最终结果。',
    'answer_first': '计算 {a} × {b}。第一行先写「答案：」加最终结果，然后再写计算过程。',
}


def call(body, tries=6):
    for k in range(tries):
        try:
            req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers={'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=600) as r:
                return json.load(r)
        except Exception as e:
            if k == tries - 1:
                raise
            time.sleep(3 * (k + 1))


def digits(s):
    return re.sub(r'[^0-9]', '', s)


def parse(cond, text):
    if cond == 'direct':
        return digits(text)
    found = re.findall(r'答案[：:]\s*\**\s*([0-9][0-9,，\s]*)', text)
    if not found:
        return ''
    pick = found[-1] if cond == 'think_first' else found[0]
    return digits(pick)


def problems():
    rng = random.Random(SEED)
    out = []
    for n in SIZES:
        for i in range(PER):
            a = rng.randrange(10 ** (n - 1), 10 ** n)
            b = rng.randrange(10 ** (n - 1), 10 ** n)
            out.append({'id': f'n{n}-{i:02d}', 'n': n, 'a': a, 'b': b, 'product': str(a * b)})
    return out


def run(job):
    p, cond = job
    body = {'model': MODEL, 'messages': [{'role': 'user', 'content': PROMPTS[cond].format(a=p['a'], b=p['b'])}], 'temperature': 0, 'max_tokens': 60 if cond == 'direct' else 6000}
    if cond == 'direct':
        body.update(logprobs=True, top_logprobs=5)
    d = call(body)
    ch = d['choices'][0]
    text = ch['message']['content']
    rec = dict(p, cond=cond, prompt=body['messages'][0]['content'], model=d.get('model'), fingerprint=d.get('system_fingerprint'), finish=ch.get('finish_reason'), reply=text, usage=d.get('usage'))
    rec['answer'] = parse(cond, text)
    rec['correct'] = rec['answer'] == p['product']
    if cond == 'direct' and ch.get('logprobs'):
        rec['logprobs'] = [{'token': t['token'], 'p': round(2.718281828459045 ** t['logprob'], 6), 'top': [[x['token'], round(2.718281828459045 ** x['logprob'], 6)] for x in t['top_logprobs']]} for t in ch['logprobs']['content']]
    return rec


def main():
    jobs = [(p, c) for p in problems() for c in PROMPTS]
    with cf.ThreadPoolExecutor(8) as ex:
        recs = list(ex.map(run, jobs))
    with open(os.path.join(HERE, 'out_01_multiply.jsonl'), 'w', encoding='utf-8', newline='\n') as f:
        for r in recs:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')
    acc = defaultdict(lambda: [0, 0])
    toks = defaultdict(list)
    for r in recs:
        acc[(r['n'], r['cond'])][0] += r['correct']
        acc[(r['n'], r['cond'])][1] += 1
        toks[(r['n'], r['cond'])].append(r['usage']['completion_tokens'])
    lines = [f'# 01 乘法实验汇总  model 请求 {MODEL}，返回 {sorted(set(r["model"] for r in recs))}', f'# 每种位数 {PER} 题，种子 {SEED}，temperature 0', '位数\t问法\t正确\t总数\t回复 token 中位数']
    for n in SIZES:
        for c in PROMPTS:
            t = sorted(toks[(n, c)])
            lines.append(f'{n}\t{c}\t{acc[(n, c)][0]}\t{acc[(n, c)][1]}\t{t[len(t) // 2]}')
    lines.append('')
    lines.append('# 未解析出答案的回复：' + str(sum(1 for r in recs if not r['answer'])))
    lines.append('# 因长度截断的回复：' + str(sum(1 for r in recs if r['finish'] != 'stop')))
    open(os.path.join(HERE, 'out_01_multiply.txt'), 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
