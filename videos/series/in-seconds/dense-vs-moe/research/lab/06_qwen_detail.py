# 06 用 04 缓存的文件头（research/_src/headers）逐层计数，并用 HTTP 范围请求取 Qwen3.8-27B 一小块真实权重：
#    - 27B：每层的前馈与注意力（含两种注意力层）各多少参数
#    - 2.4T-A95B：每层的注意力、共享专家、路由器、512 个路由专家各多少参数；权重文件的数据类型与字节数
#    - 27B 第 0 层 up_proj 左上角 6 行 × 8 列的权重（BF16 原值），画面开场的「数字」用它
import json, os, re, struct, time, urllib.request
LAB = os.path.dirname(os.path.abspath(__file__))
HDR = os.path.join(os.path.dirname(LAB), '_src', 'headers')
out = open(os.path.join(LAB, 'out_06_qwen_detail.txt'), 'w', encoding='utf-8', newline='\n')
def say(*a):
    s = ' '.join(str(x) for x in a); print(s); out.write(s + '\n'); out.flush()
def get(url, rng):
    for i in range(5):
        try:
            req = urllib.request.Request(url, headers={'Range': f'bytes={rng[0]}-{rng[1]}'})
            with urllib.request.urlopen(req, timeout=60) as r: return r.read()
        except Exception:
            if i == 4: raise
            time.sleep(2 + 3 * i)
def load(repo, rev):
    d = os.path.join(HDR, repo.replace('/', '__') + '@' + rev[:12]); hs = {}
    for f in sorted(os.listdir(d)): hs[f[:-5]] = json.load(open(os.path.join(d, f)))
    return hs
def numel(meta):
    n = 1
    for x in meta['shape']: n *= x
    return n
res = {}
# ── 27B：逐层 ──
R27, V27 = 'Qwen/Qwen3.8-27B', '1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0'
h27 = load(R27, V27)
layers = {}
for sh, hdr in h27.items():
    for name, meta in hdr.items():
        m = re.match(r'model\.language_model\.layers\.(\d+)\.(.+)', name)
        if not m: continue
        i, rest = int(m.group(1)), m.group(2)
        kind = 'ffn' if re.match(r'mlp\.(gate|up|down)_proj\.', rest) else 'attention' if rest.startswith(('self_attn.', 'linear_attn.')) else 'norm'
        typ = 'full' if rest.startswith('self_attn.') else 'linear' if rest.startswith('linear_attn.') else None
        L = layers.setdefault(i, {'ffn': 0, 'attention': 0, 'norm': 0, 'type': None})
        L[kind] += numel(meta)
        if typ: L['type'] = typ
say(f'== {R27} @ {V27[:12]}: per layer')
for i in sorted(layers):
    L = layers[i]; say(f'   layer {i:2d} {L["type"]:6s} ffn {L["ffn"]:>12,d}  attention {L["attention"]:>12,d}  norm {L["norm"]:>6,d}')
dt27 = {}
for hdr in h27.values():
    for name, meta in hdr.items():
        if name != '__metadata__': dt27[meta['dtype']] = dt27.get(meta['dtype'], 0) + meta['data_offsets'][1] - meta['data_offsets'][0]
say('   bytes by dtype (all tensors): ' + ', '.join(f'{k} {v:,d}' for k, v in sorted(dt27.items())))
ffns = {L['ffn'] for L in layers.values()}; atts = sorted({L['attention'] for L in layers.values()})
say(f'   distinct ffn sizes {sorted(ffns)}  distinct attention sizes {atts}')
say(f'   every layer: ffn > attention: {all(L["ffn"] > L["attention"] for L in layers.values())}')
res['27B'] = {'layers': len(layers), 'ffn': sorted(ffns), 'attention': {t: sorted({L['attention'] for L in layers.values() if L['type'] == t}) for t in ('linear', 'full')},
              'bytes_by_dtype': dt27, 'types': ''.join('F' if layers[i]['type'] == 'full' else 'L' for i in sorted(layers))}
# ── 2.4T：逐层 ──
RM, VM = 'Qwen/Qwen3.8-2.4T-A95B', '207bd685a7e3696cfaff12ded7c6a7ea0f88c996'
hm = load(RM, VM)
ml, dt = {}, {}
for sh, hdr in hm.items():
    for name, meta in hdr.items():
        if name == '__metadata__': continue
        b = meta['data_offsets'][1] - meta['data_offsets'][0]
        dt[meta['dtype']] = dt.get(meta['dtype'], 0) + b
        m = re.match(r'model\.(?:language_model\.)?layers\.(\d+)\.(.+)', name)   # 2.4T 的张量名没有 language_model 这一级
        if not m: continue
        i, rest = int(m.group(1)), m.group(2)
        if rest.startswith('mlp.experts.'): k = 'routed'
        elif rest.startswith('mlp.shared_expert_gate'): k = 'shared_gate'
        elif rest.startswith('mlp.shared_expert'): k = 'shared'
        elif rest == 'mlp.gate.weight': k = 'router'
        elif rest.startswith(('self_attn.', 'linear_attn.')): k = 'attention'
        else: k = 'norm'
        L = ml.setdefault(i, {}); L[k] = L.get(k, 0) + numel(meta)
say(f'== {RM} @ {VM[:12]}: per layer (first two and last)')
for i in (0, 3, max(ml)):
    say(f'   layer {i:2d} ' + '  '.join(f'{k} {v:,d}' for k, v in sorted(ml[i].items())))
per = {k: sorted({L.get(k, 0) for L in ml.values()}) for k in ('routed', 'shared', 'shared_gate', 'router', 'attention')}
say('   distinct sizes per layer: ' + json.dumps(per))
E = 512
say(f'   one routed expert = {per["routed"][0] // E:,d} params; shared expert = {per["shared"][0]:,d}')
say('   bytes by dtype (all tensors): ' + ', '.join(f'{k} {v:,d}' for k, v in sorted(dt.items())))
res['2.4T'] = {'layers': len(ml), 'per_layer': per, 'expert': per['routed'][0] // E, 'bytes_by_dtype': dt}
# ── 27B 第 0 层 up_proj 的一小块真实权重 ──
name = 'model.language_model.layers.0.mlp.up_proj.weight'
sh = next(s for s, hdr in h27.items() if name in hdr); meta = h27[sh][name]
say(f'== {name}  shard {sh}  dtype {meta["dtype"]}  shape {meta["shape"]}')
assert meta['dtype'] == 'BF16'
base = f'https://huggingface.co/{R27}/resolve/{V27}/{sh}'
hlen = struct.unpack('<Q', get(base, (0, 7)))[0]
start = 8 + hlen + meta['data_offsets'][0]; cols = meta['shape'][1]
rows, take = 6, 8
vals = []
for r in range(rows):
    raw = get(base, (start + r * cols * 2, start + r * cols * 2 + take * 2 - 1))
    row = [struct.unpack('<f', struct.pack('<I', v << 16))[0] for v in struct.unpack(f'<{take}H', raw)]
    vals.append(row); say('   row', r, ' '.join(f'{x:+.4f}' for x in row))
res['weights'] = {'tensor': name, 'shard': sh, 'rows': vals}
json.dump(res, open(os.path.join(LAB, 'qwen_detail.json'), 'w'), indent=1)
