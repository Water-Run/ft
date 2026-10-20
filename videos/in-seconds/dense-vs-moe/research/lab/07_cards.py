# 07 按固定提交号取 Qwen3.8 两个模型卡（README.md），按锚点摘出画面要引用的原文行，写成 cards.json
import json, os, re, urllib.request
LAB = os.path.dirname(os.path.abspath(__file__))
CARDS = {   # 仓库 → 提交号（与 04 相同）
    'Qwen/Qwen3.8-27B': '1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0',
    'Qwen/Qwen3.8-2.4T-A95B': '207bd685a7e3696cfaff12ded7c6a7ea0f88c996',
}
ANCHORS = {
    'params': r'Number of Parameters: (.+)$',
    'layers': r'Number of Layers: (\d+)',
    'layout': r'Hidden Layout: (.+)$',
    'experts': r'Number of Experts: (\d+)',
    'activated': r'Number of Activated Experts: (.+)$',
    'dense': r'(a compact, deployment-friendly dense model)',
    'max': r'(\*\*Qwen3\.8-Max\*\* is the official version based on Qwen3\.8-2\.4T-A95B[^.]*)',
}
out = open(os.path.join(LAB, 'out_07_cards.txt'), 'w', encoding='utf-8', newline='\n')
res = {}
for repo, rev in CARDS.items():
    with urllib.request.urlopen(f'https://huggingface.co/{repo}/resolve/{rev}/README.md', timeout=60) as r: text = r.read().decode('utf-8')
    got = {}
    for k, rx in ANCHORS.items():
        for n, line in enumerate(text.splitlines(), 1):
            m = re.search(rx, line)
            if m: got[k] = {'line': n, 'text': m.group(1).strip()}; break
    res[repo] = {'rev': rev, **got}
    out.write(f'== {repo} @ {rev[:12]}  README.md\n')
    for k, v in got.items(): out.write(f'   L{v["line"]:<4d} {k:10s} {v["text"]}\n')
json.dump(res, open(os.path.join(LAB, 'cards.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
out.close(); print(open(os.path.join(LAB, 'out_07_cards.txt'), encoding='utf-8').read())
