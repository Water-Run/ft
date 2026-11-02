# 03 核对：只读 01、02 的回显，重新算出文案与画面要用的每一个数，写进 out_03_check.txt。
# 用法：python 03_check.py        （不联网，不需要密钥）
import os, json, re
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
FEATURED = 'n5-03'          # 贯穿全片的那道题：25992 × 92138
out = []
say = out.append


def load(name):
    return [json.loads(l) for l in open(os.path.join(HERE, name), encoding='utf-8')]


m1 = load('out_01_multiply.jsonl')
m2 = load('out_02_reasoner.jsonl')
say('# 03 核对  由 03_check.py 从 out_01_multiply.jsonl、out_02_reasoner.jsonl 算出')
say('01 请求模型 deepseek-chat，返回 model 字段：%s；system_fingerprint：%s' % (sorted({r['model'] for r in m1}), sorted({r['fingerprint'] for r in m1})))
say('02 请求模型 deepseek-reasoner，返回 model 字段：%s' % sorted({r['model'] for r in m2}))

# 1. 正确率表
say('\n## 1. 正确率（01，每格 20 题）')
acc = defaultdict(int)
for r in m1:
    acc[(r['n'], r['cond'])] += r['correct']
for c in ('direct', 'think_first', 'answer_first'):
    say('%-13s ' % c + '  '.join('%d位 %2d' % (n, acc[(n, c)]) for n in (3, 4, 5, 6, 7)) + '   合计 %d/100' % sum(acc[(n, c)] for n in (3, 4, 5, 6, 7)))

# 2. 直接回答错在哪里：与正确乘积相同的开头位数、结尾位数
say('\n## 2. direct 答错的题：开头、结尾分别有几位与正确乘积相同')
for n in (4, 5, 6, 7):
    rows = []
    for r in m1:
        if r['cond'] != 'direct' or r['n'] != n or r['correct']:
            continue
        p, a = r['product'], r['answer']
        pre = 0
        while pre < min(len(p), len(a)) and p[pre] == a[pre]:
            pre += 1
        suf = 0
        while suf < min(len(p), len(a)) and p[-1 - suf] == a[-1 - suf]:
            suf += 1
        rows.append((pre, suf, len(a) == len(p)))
    if rows:
        say('%d 位：答错 %d 题；位数与正确乘积相同 %d 题；开头至少对 2 位 %d 题；结尾至少对 2 位 %d 题；开头相同位数最少 %d；结尾相同位数最少 %d' % (
            n, len(rows), sum(x[2] for x in rows), sum(x[0] >= 2 for x in rows), sum(x[1] >= 2 for x in rows), min(x[0] for x in rows), min(x[1] for x in rows)))

# 3. 贯穿的那道题
say('\n## 3. 贯穿的题 %s' % FEATURED)
f = {r['cond']: r for r in m1 if r['id'] == FEATURED}
a, b, prod = f['direct']['a'], f['direct']['b'], f['direct']['product']
assert a * b == int(prod)
say('%d × %d = %s（Python 整数乘法）' % (a, b, prod))
d = f['direct']
say('direct：回复 %r，回复 token 数 %d，正确 %s' % (d['reply'], d['usage']['completion_tokens'], d['correct']))
say('  逐个 token：' + ' | '.join(t['token'] for t in d['logprobs']))
for t in d['logprobs']:
    say('  token %-4s 概率 %.6f  候选 %s' % (t['token'], t['p'], ', '.join('%s:%.6f' % (x, q) for x, q in t['top'])))
diff = [i for i, (x, y) in enumerate(zip(prod, d['answer'])) if x != y]
say('  与正确乘积不同的位置（从 0 数）：%s；正确 %s，回答 %s' % (diff, ''.join(prod[i] for i in diff), ''.join(d['answer'][i] for i in diff)))
t = f['think_first']
say('think_first：正确 %s，回复 token 数 %d，答案 %s' % (t['correct'], t['usage']['completion_tokens'], t['answer']))
p1, p2 = a * 92000, a * 138
assert 92000 + 138 == b
say('  拆分：%d × 92000 = %d；%d × 138 = %d；相加 = %d' % (a, p1, a, p2, p1 + p2))
for s in ('2,391,264,000', '3,586,896', '2,394,850,896'):
    say('  think_first 回复里含 %s：%s' % (s, s in t['reply']))
af = f['answer_first']
say('answer_first：第一行 %r，正确 %s，回复 token 数 %d' % (af['reply'].split('\n')[0], af['correct'], af['usage']['completion_tokens']))
body = af['reply'].replace(',', '')
for s in (str(p1), str(p2)):
    say('  过程里含正确的部分积 %s：%s' % (s, s in body))
say('  过程最后一行：%r；正确的和应为 %d；最后一行等于第一行的答案：%s' % (body.strip().split('\n')[-1].strip(), p1 + p2, af['answer'] in body.strip().split('\n')[-1]))

# 4. 先写答案、答错的回复，过程最后停在哪个数
say('\n## 4. answer_first 答错的回复：过程里最后出现的 6 位以上的数')
cat = defaultdict(list)
for r in m1:
    if r['cond'] != 'answer_first' or r['correct']:
        continue
    rest = r['reply'].split('\n', 1)[1] if '\n' in r['reply'] else ''
    nums = re.findall(r'\d{6,}', re.sub(r'[,，\s]', '', rest))
    last = nums[-1] if nums else ''
    cat['等于第一行的错答案' if last == r['answer'] else '等于正确乘积' if last == r['product'] else '其他'].append(r['id'])
tot = sum(len(v) for v in cat.values())
for k, v in cat.items():
    say('%s：%d / %d' % (k, len(v), tot))

# 5. 思考模式
say('\n## 5. 思考模式（02，每种位数 5 题）')
for n in (3, 4, 5, 6, 7):
    rs = [r for r in m2 if r['n'] == n]
    rt = [r['usage']['completion_tokens_details']['reasoning_tokens'] for r in rs]
    say('%d 位：正确 %d/%d；思考 token %s，平均 %.1f' % (n, sum(r['correct'] for r in rs), len(rs), rt, sum(rt) / len(rt)))
say('合计正确 %d/%d' % (sum(r['correct'] for r in m2), len(m2)))
chk = [r['id'] for r in m2 if re.search(r'(?i)\b(check|verify)\b', r['reasoning'])]
say('思考原文含 check 或 verify 的：%d/%d' % (len(chk), len(m2)))
fr = [r for r in m2 if r['id'] == FEATURED][0]
say('%s 的思考（%d 个思考 token）：' % (FEATURED, fr['usage']['completion_tokens_details']['reasoning_tokens']))
for line in fr['reasoning'].split('\n'):
    say('  ' + line)

open(os.path.join(HERE, 'out_03_check.txt'), 'w', encoding='utf-8', newline='\n').write('\n'.join(out) + '\n')
print('\n'.join(out))
