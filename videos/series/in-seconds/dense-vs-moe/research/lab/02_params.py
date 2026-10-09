# 02 只读 safetensors 文件头，按类别数参数：总参数与每个 token 实际用到的参数
import os, json, struct, re
from common import *
out = Tee('02_params')
cfg = json.load(open(os.path.join(MODEL_DIR, 'config.json')))
E, K, L = cfg['num_experts'], cfg['num_experts_per_tok'], cfg['num_hidden_layers']
H, I, V = cfg['hidden_size'], cfg['intermediate_size'], cfg['vocab_size']
out(f'config: layers {L}  experts/layer {E}  experts/token {K}  hidden {H}  expert ffn {I}  vocab {V}  norm_topk_prob {cfg["norm_topk_prob"]}  dtype {cfg["torch_dtype"]}')
cats = {}
def add(cat, n): cats[cat] = cats.get(cat, 0) + n
names = 0
for fn in sorted(os.listdir(MODEL_DIR)):
    if not fn.endswith('.safetensors'): continue
    with open(os.path.join(MODEL_DIR, fn), 'rb') as f:
        n = struct.unpack('<Q', f.read(8))[0]; hdr = json.loads(f.read(n))
    for name, meta in hdr.items():
        if name == '__metadata__': continue
        names += 1
        cnt = 1
        for d in meta['shape']: cnt *= d
        if re.search(r'\.mlp\.experts\.\d+\.', name): add('experts', cnt)
        elif name.endswith('.mlp.gate.weight'): add('router', cnt)
        elif '.self_attn.' in name: add('attention', cnt)
        elif 'embed_tokens' in name: add('embedding', cnt)
        elif name.startswith('lm_head'): add('lm_head', cnt)
        elif 'norm' in name: add('norm', cnt)
        else: add('other:' + name, cnt)
out('tensors', names)
for k, v in cats.items(): out(f'{k:12s} {v:>15,d}')
total = sum(cats.values())
active = total - cats['experts'] + cats['experts'] * K // E
out(f'total        {total:>15,d}')
out(f'active/token {active:>15,d}   (experts counted {K}/{E})')
out(f'active share {active / total:.4f}   total/active {total / active:.3f}')
per_expert = 3 * H * I
out(f'one expert (gate+up+down) 3*{H}*{I} = {per_expert:,d}; experts per layer {E} -> {E * per_expert:,d}')
out(f'{K} experts x ffn {I} = ffn width {K * I}; dense ffn of width {K * I} = 3*{H}*{K * I} = {3 * H * K * I:,d} = {K} experts')
out(f'expert slots in model {E * L}; used per token {K * L}')
import math
out(f'combinations per layer C({E},{K}) = {math.comb(E, K):,d}')
json.dump({'layers': L, 'experts': E, 'topk': K, 'hidden': H, 'ffn': I, 'vocab': V, 'cats': cats, 'total': total, 'active': active},
          open(os.path.join(LAB, 'params.json'), 'w'), indent=1)
