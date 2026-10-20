# 09 第三部分 m1 的模型清单：2026 年 6 月以后在 Hugging Face 发布的开源模型
#    - CHART：画面上的 12 个模型。总参数与激活参数一律取各自模型卡的原话（口径以模型卡为准，不自行折算），
#      架构（MoE / 稠密）另由 config.json 里有没有专家数核对；记录取用时的提交号
#    - SCAN：发布于 2026-06-01 之后、总参数 ≥ 100B 的原创模型（不含量化版、微调版与转存），逐个看 config.json
#      是否含专家数，用来核对旁白「最大的开源模型大多是 MoE，稠密多见于较小的型号」
#    日期取 Hugging Face 的仓库创建时间（createdAt）
import json, os, re, time, urllib.request
LAB = os.path.dirname(os.path.abspath(__file__))
out = open(os.path.join(LAB, 'out_09_survey.txt'), 'w', encoding='utf-8', newline='\n')
def say(*a):
    s = ' '.join(str(x) for x in a); print(s); out.write(s + '\n')
def get(url, as_json=True):
    for k in range(5):   # 偶发连接重置：重试
        try:
            with urllib.request.urlopen(url, timeout=60) as r: b = r.read()
            break
        except OSError:
            if k == 4: raise
            time.sleep(3)
    return json.loads(b) if as_json else b.decode('utf-8')
EXPERT_KEYS = ('num_experts', 'n_routed_experts', 'num_local_experts', 'moe_num_experts', 'num_routed_experts')
def experts(cfg):
    for d in (cfg, cfg.get('text_config') or {}):
        for k in EXPERT_KEYS:
            if d.get(k): return d[k]
    return 0
def num(s):
    m = re.match(r'~?([\d.]+)\s*(T|B|trillion|billion)', s.strip())
    return float(m.group(1)) * (1e12 if m.group(2) in ('T', 'trillion') else 1e9)
TD = r'</strong></td>\s*<td[^>]*>([^<]+)</td>'
CHART = [   # (仓库, 画面上的名字, 总参数的原话正则, 激活参数的原话正则；稠密模型激活=总参数, 记 None, 读 config 的仓库)
    ('moonshotai/Kimi-K3', 'Kimi K3', r'Total Parameters' + TD, r'Activated Parameters' + TD, None),
    ('meituan-longcat/LongCat-2.0', 'LongCat-2.0', r'\*\*([\d.]+ trillion) total parameters\*\*', r'and (~[\d.]+ billion) activated per token', None),
    ('XiaomiMiMo/MiMo-V2.6-Pro-RL', 'MiMo-V2.6-Pro', r'([\d.]+T) total / [\d.]+B activated', r'[\d.]+T total / ([\d.]+B) activated', None),
    ('thinkingmachines/Inkling', 'Inkling', r'### Parameters\s+(\d+B) total', r'### Parameters\s+\d+B total, (\d+B) active', None),
    ('tencent/Hy4-preview', 'Hy4 preview', r'\| Total Parameters \| (\S+) \|', r'\| Activated Parameters \| (\S+) \|', None),
    ('LGAI-EXAONE/K-EXAONE-2.0-750B-A37B', 'K-EXAONE 2.0', r'Number of Parameters' + TD, r'Active Parameters' + TD, None),
    ('nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16', 'Nemotron 3 Ultra', r'\*\*Total Parameters\*\* \| (\S+) \(', r'\*\*Total Parameters\*\* \| \S+ \((\S+) active\)', None),
    ('MiniMaxAI/MiniMax-M3', 'MiniMax-M3', r'It has (~[\d.]+B) parameters', r'and (~[\d.]+B) activated parameters', None),
    ('zai-org/GLM-5.3-Flash', 'GLM-5.3-Flash', r'With (\d+B) total parameters', r'and just (\d+B) active parameters', None),
    ('upstage/Solar-Open2-250B', 'Solar Open 2', r'\| Total Parameters\s+\| (\d+B)', r'\| Active Parameters\s+\| (\d+B)', None),
    ('swiss-ai/Apertus-v1.5-70B', 'Apertus 1.5 70B', r'family of 8B and (70B) parameter language models', None, 'swiss-ai/Apertus-v1.5-70B-base'),   # 本仓库 config 需登录，按同一系列公开的 base 仓库核对
    ('ibm-granite/granite-4.2-30b', 'Granite 4.2 30B', r'\*\*Parameters\*\* \| (\d+B)', None, None),
]
ARCH = {   # 模型卡里点明架构的原话
    'swiss-ai/Apertus-v1.5-70B': r'(the same architecture as the original release, a decoder-only transformer)',
    'ibm-granite/granite-4.2-30b': r'(Decoder-only Dense Transformer)',
}
res = {'chart': [], 'scan': []}
say('== CHART（模型卡原话；config 专家数）')
for repo, name, rx_total, rx_act, cfg_repo in CHART:
    info = get(f'https://huggingface.co/api/models/{repo}')
    sha, created = info['sha'], info['createdAt'][:10]
    card = get(f'https://huggingface.co/{repo}/resolve/{sha}/README.md', False)
    cr = cfg_repo or repo
    csha = sha if cr == repo else get(f'https://huggingface.co/api/models/{cr}')['sha']
    cfg = get(f'https://huggingface.co/{cr}/resolve/{csha}/config.json')
    t = re.search(rx_total, card, re.S).group(1).strip()
    a = re.search(rx_act, card, re.S).group(1).strip() if rx_act else None
    arch = re.search(ARCH[repo], card).group(1) if repo in ARCH else None
    e = experts(cfg)
    assert created >= '2026-06-01', (repo, created)
    assert (e > 0) == (rx_act is not None), (repo, e)
    row = {'repo': repo, 'name': name, 'created': created, 'sha': sha, 'total_text': t, 'active_text': a,
           'total': num(t), 'active': num(a) if a else num(t), 'moe': e > 0, 'experts': e, 'config_from': f'{cr}@{csha[:12]}', 'arch_text': arch}
    res['chart'].append(row)
    say(f'{created} {name:17s} total「{t}」 active「{a or "（稠密，全部）"}」 experts={e}  {repo}@{sha[:12]}' + (f'  config←{cr}' if cfg_repo else '') + (f'\n           arch「{arch}」' if arch else ''))
assert [r['total'] for r in res['chart']] == sorted((r['total'] for r in res['chart']), reverse=True)
SCAN = ['moonshotai/Kimi-K3', 'Qwen/Qwen3.8-2.4T-A95B', 'meituan-longcat/LongCat-2.0', 'deepseek-ai/DeepSeek-V4-Pro-0813', 'moonshotai/Kimi-K2.7-Code',
        'XiaomiMiMo/MiMo-V2.6-Pro-RL', 'thinkingmachines/Inkling', 'tencent/Hy4-preview', 'deepseek-ai/DeepSeek-V4.1-Flash', 'zai-org/GLM-5.2', 'zai-org/GLM-5.3',
        'LGAI-EXAONE/K-EXAONE-2.0-750B-A37B', 'nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16', 'MiniMaxAI/MiniMax-M3', 'internlm/Intern-S2-397B',
        'IFM/K2-Horizon-375B-A23B', 'zai-org/GLM-5.3-Flash', 'IQuestLab/IQuest-Q1', 'Motif-Technologies/Motif-3-Beta', 'XiaomiMiMo/MiMo-V2.6-Flash-RL',
        'deepseek-ai/DeepSeek-V4-Flash-0731', 'tencent/Hy3', 'dots-studio/dots3-note-prev', 'thinkingmachines/Inkling-Small', 'upstage/Solar-Open2-250B',
        'poolside/Laguna-M.1', 'Qwen/Qwen3.8-Flash-Next', 'inclusionAI/Ling-3.0-flash', 'poolside/Laguna-S-2.1']
DENSE_SEEN = ['swiss-ai/Apertus-v1.5-70B-base', 'ibm-granite/granite-4.2-30b', 'Qwen/Qwen3.8-27B', 'ibm-granite/granite-4.2-8b']
say('\n== SCAN（2026-06-01 以后、≥100B 的原创模型；safetensors 总数是 Hugging Face 按张量元素计的，量化打包的仓库会偏离真实参数量，只作排序参考）')
for repo in SCAN + DENSE_SEEN:
    info = get(f'https://huggingface.co/api/models/{repo}')
    cfg = get(f'https://huggingface.co/{repo}/resolve/{info["sha"]}/config.json')
    e, tot = experts(cfg), (info.get('safetensors') or {}).get('total', 0)
    res['scan'].append({'repo': repo, 'created': info['createdAt'][:10], 'st_total': tot, 'experts': e, 'sha': info['sha']})
    say(f'{info["createdAt"][:10]} {tot / 1e9:8.1f}B  {"MoE " + str(e) + " experts" if e else "dense":16s} {repo}')
big = [r for r in res['scan'] if r['repo'] in SCAN]
assert all(r['experts'] > 0 and r['created'] >= '2026-06-01' for r in big)
say(f'\n{len(big)} 个 ≥100B 的原创模型全部为 MoE；见到的稠密新模型最大为 Apertus 1.5 70B')
json.dump(res, open(os.path.join(LAB, 'survey.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
out.close()
