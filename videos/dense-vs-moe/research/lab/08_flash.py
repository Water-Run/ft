# 08 用 04 缓存的文件头（research/_src/headers）给 Qwen3.8-Flash-Next 逐类计数，按模型卡的口径复算
#    卡上：「125B with 6B activated, plus 51B n-gram embedding and 4B MTP」
#    - 125B：语言模型（不含 n-gram 嵌入、MTP 头、视觉编码器），含词表的输入嵌入与输出层
#    - 6B 激活：不含词表的输入嵌入与输出层；路由专家按 10/512 计
#    另算各类张量的字节数（BF16），以及与 Qwen3.8-27B 语言模型的比值
import json, os, re
LAB = os.path.dirname(os.path.abspath(__file__))
HDR = os.path.join(os.path.dirname(LAB), '_src', 'headers', 'Qwen__Qwen3.8-Flash-Next@de4b8e4d43b9')
out = open(os.path.join(LAB, 'out_08_flash.txt'), 'w', encoding='utf-8', newline='\n')
def say(*a):
    s = ' '.join(str(x) for x in a); print(s); out.write(s + '\n')
def cat(name):
    if name.startswith('mtp.'): return 'mtp'
    if 'visual' in name: return 'vision'
    if '.ple.' in name or 'ngram' in name: return 'ngram_embedding'
    if re.search(r'\.mlp\.experts\.', name): return 'routed_experts'
    if '.mlp.shared_expert' in name: return 'shared_expert'
    if name.endswith('.mlp.gate.weight'): return 'router'
    if '.self_attn.' in name or '.linear_attn.' in name: return 'attention'
    if 'embed_tokens' in name: return 'input_embedding'
    if name.startswith('lm_head'): return 'output_layer'
    return 'other'
n, b, other, per = {}, {}, {}, {}   # per：语言模型逐层（层号 → 类别 → 个数），画参数墙用
for f in sorted(os.listdir(HDR)):
    for name, meta in json.load(open(os.path.join(HDR, f))).items():
        if name == '__metadata__': continue
        k = 1
        for d in meta['shape']: k *= d
        c = cat(name); n[c] = n.get(c, 0) + k; b[c] = b.get(c, 0) + meta['data_offsets'][1] - meta['data_offsets'][0]
        if c == 'other': key = re.sub(r'\.\d+\.', '.N.', name); other[key] = other.get(key, 0) + k
        m = re.match(r'model\.language_model\.layers\.(\d+)\.', name)
        if m: L = per.setdefault(int(m.group(1)), {}); L[c] = L.get(c, 0) + k
for c in sorted(n): say(f'{c:16s} {n[c]:>16,d} params  {b[c]:>18,d} bytes')
say('other =', ', '.join(f'{k} {v:,d}' for k, v in sorted(other.items(), key=lambda x: -x[1])[:6]))
E, K = 512, 10
lm = sum(v for c, v in n.items() if c not in ('mtp', 'vision', 'ngram_embedding'))
lm_bytes = sum(v for c, v in b.items() if c not in ('mtp', 'vision', 'ngram_embedding'))
act = lm - n['input_embedding'] - n['output_layer'] - n['routed_experts'] + n['routed_experts'] * K // E
say(f'language model (no n-gram / MTP / vision) {lm:,d}   bytes {lm_bytes:,d}')
say(f'active per token (no input embedding / output layer; routed 10/512) {act:,d}   share of LM {act / lm:.4f}')
say(f'all tensors bytes {sum(b.values()):,d}')
q27 = json.load(open(os.path.join(LAB, 'qwen_params.json')))['Qwen/Qwen3.8-27B']['lm']
say(f'Qwen3.8-27B LM {q27:,d}   ratio Flash/27B {lm / q27:.3f}   27B/Flash {q27 / lm:.3f}')
# 逐层：每 4 层里前 3 层是线性注意力（Gated DeltaNet），第 4 层是全注意力（Qwen Sparse Attention）
assert sorted(per) == list(range(48))
att = {('full' if i % 4 == 3 else 'linear'): per[i]['attention'] for i in per}
assert all(per[i]['attention'] == att['full' if i % 4 == 3 else 'linear'] for i in per)
expert = n['routed_experts'] // 48 // E
assert all(per[i]['routed_experts'] == expert * E and per[i]['shared_expert'] == per[0]['shared_expert'] and per[i]['router'] == per[0]['router'] for i in per)
say(f'per layer: attention linear {att["linear"]:,d} / full {att["full"]:,d}; shared expert {per[0]["shared_expert"]:,d}; router {per[0]["router"]:,d}; '
    f'one routed expert {expert:,d} (x{E}); other {per[0].get("other", 0):,d}')
json.dump({'per_layer': {'attention': att, 'shared': per[0]['shared_expert'], 'router': per[0]['router'], 'other': per[0].get('other', 0), 'expert': expert},
           'lm': lm, 'lm_bytes': lm_bytes, 'active': act, 'cats': n, 'bytes': b, 'all_bytes': sum(b.values())}, open(os.path.join(LAB, 'flash.json'), 'w'), indent=1)
