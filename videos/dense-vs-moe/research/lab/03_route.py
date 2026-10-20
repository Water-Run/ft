# 03 把演示句送进模型，记下每个 token 在每一层的路由：64 个分数、选中的 8 个专家与权重；另记内存占用与下一个词的预测
import os, json, time, torch, psutil
from common import *
from transformers import AutoTokenizer, AutoModelForCausalLM
out = Tee('03_route')
torch.manual_seed(0)
proc = psutil.Process()
rss0 = proc.memory_info().rss
t0 = time.time()
tok = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForCausalLM.from_pretrained(MODEL_DIR, torch_dtype=torch.bfloat16)
model.eval()
rss1 = proc.memory_info().rss
nparam = sum(p.numel() for p in model.parameters())
out(f'loaded in {time.time() - t0:.1f}s  parameters {nparam:,d}  bytes {sum(p.numel() * p.element_size() for p in model.parameters()):,d}')
out(f'process memory (RSS) before {rss0 / 2**30:.2f} GiB  after load {rss1 / 2**30:.2f} GiB')
# 直接在每层的路由器（mlp.gate）上挂钩子。transformers 5.19 的 OlmoeTopKRouter 返回
# (router_logits, router_scores, router_indices)：64 个原始分数、被选中专家的权重、被选中专家的编号；专家层用的就是后两项
logits, chosen = {}, {}
def hook(i):
    def f(mod, inp, outp):
        logits[i] = outp[0].detach().float().reshape(-1, outp[0].shape[-1])
        chosen[i] = (outp[2].detach().tolist(), outp[1].detach().float().tolist())
    return f
for i, layer in enumerate(model.model.layers): layer.mlp.gate.register_forward_hook(hook(i))
enc = tok(SENTENCE, return_tensors='pt')
ids = enc['input_ids'][0].tolist()
pieces = [tok.decode([t]) for t in ids]
out('sentence', repr(SENTENCE))
out('tokens', len(ids), json.dumps(pieces, ensure_ascii=False))
with torch.no_grad():
    t1 = time.time(); res = model(**enc); dt = time.time() - t1
out(f'forward {len(ids)} tokens in {dt:.2f}s')
nxt = res.logits[0, -1].float().softmax(-1).topk(3)
out('next-token top3', json.dumps([[tok.decode([int(i)]), round(float(p), 4)] for p, i in zip(nxt.values, nxt.indices)], ensure_ascii=False))
K = model.config.num_experts_per_tok
route = []
for li in range(len(model.model.layers)):
    pr = logits[li].softmax(-1)                     # 64 个专家的概率
    w, e = pr.topk(K, dim=-1)                       # 取最高的 8 个（OLMoE 不再归一化：norm_topk_prob=false）
    assert e.tolist() == chosen[li][0], f'layer {li}: 复算的前 8 名与模型实际选中的不一致'
    route.append({'probs': [[round(float(x), 5) for x in row] for row in pr],
                  'experts': e.tolist(), 'weights': [[round(float(x), 5) for x in row] for row in w]})
for li in (0, 7, 15):
    out(f'layer {li}:')
    for ti, p in enumerate(pieces):
        ex = route[li]['experts'][ti]; ww = route[li]['weights'][ti]
        out(f'  {ti:2d} {p!r:16s} ' + ' '.join(f'{e:2d}:{w:.3f}' for e, w in zip(ex, ww)) + f'   sum {sum(ww):.3f}')
out('check: recomputed top-8 == experts the model actually used, all layers: OK')
for li in range(len(route)):
    used = sorted({e for row in route[li]['experts'] for e in row})
    sets = [frozenset(row) for row in route[li]['experts']]
    out(f'layer {li:2d}: experts used by the whole sentence {len(used)}/64; distinct 8-sets {len(set(sets))}/{len(sets)}; max overlap between two tokens {max(len(a & b) for i, a in enumerate(sets) for b in sets[i + 1:])}')
tot = sum(len({e for row in route[li]['experts'] for e in row}) for li in range(len(route)))
out(f'whole sentence, all layers: {tot}/{64 * len(route)} expert slots used ({tot / (64 * len(route)):.4f})')
per_tok = [len({(li, e) for li in range(len(route)) for e in route[li]['experts'][ti]}) for ti in range(len(ids))]
out('expert slots per token (layer, expert):', per_tok)
json.dump({'sentence': SENTENCE, 'ids': ids, 'pieces': pieces, 'route': route, 'next_top3': [[tok.decode([int(i)]), float(p)] for p, i in zip(nxt.values, nxt.indices)]},
          open(os.path.join(LAB, 'route.json'), 'w'), separators=(',', ':'))
