# 04 不下载权重，只用 HTTP 范围请求读 Qwen3.8 三个模型每个 safetensors 分片的文件头，逐个张量数参数：
#    总参数、按类别分列、每个 token 实际用到的参数（路由专家按 选中数/专家数 计）
import json, os, re, struct, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
LAB = os.path.dirname(os.path.abspath(__file__))
MODELS = {   # 仓库 → 提交号（2026-10-08 取得）
    'Qwen/Qwen3.8-27B': '1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0',
    'Qwen/Qwen3.8-Flash-Next': 'de4b8e4d43b917e7706784d8bb445c9af86a3540',
    'Qwen/Qwen3.8-2.4T-A95B': '207bd685a7e3696cfaff12ded7c6a7ea0f88c996',
}
out = open(os.path.join(LAB, 'out_04_qwen_params.txt'), 'w', encoding='utf-8', newline='\n')
def say(*a):
    s = ' '.join(str(x) for x in a); print(s); out.write(s + '\n'); out.flush()
def get(url, rng=None):
    for i in range(5):
        try:
            req = urllib.request.Request(url, headers={'Range': f'bytes={rng[0]}-{rng[1]}'} if rng else {})
            with urllib.request.urlopen(req, timeout=60) as r: return r.read()
        except Exception as e:
            if i == 4: raise
            time.sleep(2 + 3 * i)
def cat(name):
    if name.startswith('mtp.'): return 'mtp'
    if 'visual' in name: return 'vision'
    if '.ple.' in name or 'ngram' in name: return 'ngram_embedding'
    if re.search(r'\.mlp\.experts\.', name): return 'routed_experts'
    if '.mlp.shared_expert' in name: return 'shared_expert'
    if name.endswith('.mlp.gate.weight'): return 'router'
    if re.search(r'\.mlp\.(gate|up|down)_proj\.', name): return 'ffn'
    if '.self_attn.' in name or '.linear_attn.' in name: return 'attention'
    if 'embed_tokens' in name or name.startswith('lm_head'): return 'embedding'
    return 'other'
result = {}
for repo, rev in MODELS.items():
    base = f'https://huggingface.co/{repo}/resolve/{rev}/'
    cfg = json.loads(get(base + 'config.json')); tc = cfg.get('text_config', cfg)
    idx = json.loads(get(base + 'model.safetensors.index.json'))
    shards = sorted(set(idx['weight_map'].values()))
    cache = os.path.join(os.path.dirname(LAB), '_src', 'headers', repo.replace('/', '__') + '@' + rev[:12])   # 文件头缓存（不入库）
    os.makedirs(cache, exist_ok=True)
    def header(sh):
        p = os.path.join(cache, sh + '.json')
        if os.path.exists(p): return json.load(open(p))
        hlen = struct.unpack('<Q', get(base + sh, (0, 7)))[0]
        h = json.loads(get(base + sh, (8, 8 + hlen - 1)))
        json.dump(h, open(p, 'w')); return h
    with ThreadPoolExecutor(16) as ex: hdrs = list(ex.map(header, shards))
    cats, n = {}, 0
    for hdr in hdrs:
        for name, meta in hdr.items():
            if name == '__metadata__': continue
            cnt = 1
            for d in meta['shape']: cnt *= d
            c = cat(name); cats[c] = cats.get(c, 0) + cnt; n += 1
    total = sum(cats.values())
    E, K = tc.get('num_experts'), tc.get('num_experts_per_tok')
    lm = total - cats.get('mtp', 0) - cats.get('vision', 0)            # 语言模型本体（不含 MTP 草稿头与视觉编码器）
    say(f'== {repo} @ {rev[:12]}  shards {len(shards)}  tensors {n}')
    say(f'   layers {tc["num_hidden_layers"]}  hidden {tc["hidden_size"]}  ' + (f'experts {E}  routed/token {K}  expert ffn {tc.get("moe_intermediate_size")}  shared expert ffn {tc.get("shared_expert_intermediate_size")}' if E else f'ffn {tc.get("intermediate_size")}  (no experts: dense)'))
    for k in sorted(cats): say(f'   {k:16s} {cats[k]:>19,d}')
    say(f'   total (all tensors)        {total:>19,d}')
    say(f'   language model (no MTP/vision) {lm:>15,d}')
    r = dict(repo=repo, rev=rev, cats=cats, total=total, lm=lm, layers=tc['num_hidden_layers'], experts=E, topk=K)
    if E:
        act = lm - cats['routed_experts'] + cats['routed_experts'] * K // E
        act_no_ng = act - cats.get('ngram_embedding', 0)
        say(f'   active per token = LM - routed + routed*{K}/{E} = {act:,d}' + (f'   (without n-gram embedding {act_no_ng:,d})' if cats.get('ngram_embedding') else ''))
        say(f'   active share of LM {act / lm:.4f}' + (f'   without n-gram: {act_no_ng / (lm - cats["ngram_embedding"]):.4f}' if cats.get('ngram_embedding') else ''))
        r.update(active=act, active_no_ngram=act_no_ng)
    result[repo] = r
json.dump(result, open(os.path.join(LAB, 'qwen_params.json'), 'w'), indent=1)
