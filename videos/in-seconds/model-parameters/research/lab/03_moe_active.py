"""03 MoE 的「总参数」与「激活参数」：从真实权重里算出来。

MoE 模型每个 token 只走一部分专家，于是同一个模型有两个数：
  总参数     = 权重文件里全部张量的元素个数
  激活参数   = 非专家部分 + (每次激活的专家数 ÷ 专家总数) × 专家部分

分片少的仓库全部读头，逐个张量分类累加，是精确值。
分片多的仓库用分片索引里的 weight_map（每个张量名 → 所在分片）统计各类张量的个数，
再按实测形状换算，并抽查几个分片的头验证形状一致。

索引换算的关键是「形状按角色取」：把张量名里的层号与专家号换成 N，
得到角色键（model.layers.N.mlp.experts.N.gate_proj.weight），
同一角色的张量形状相同；每个角色的形状由抽查的分片实测得到。

仓库清单见 models.py。
"""

import re
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hfutil as H
import models

ALL_SHARDS_LIMIT = 30
# 只算片中要讲的那个混合专家例子：分片不多，全部读头即可精确算。
# 量级对照里最大的那个仓库（2.4 万亿，213 个分片）把每层专家存成一个融合张量，
# 按角色换算覆盖不全；它的总参数由 02 与 05 给出，本片不需要它的激活参数。
TARGETS = [models.MOE]


def role(name):
    """把层号与专家号换成 N，得到角色键。"""
    return re.sub(r"\.\d+\.", ".N.", name)


def main():
    print("=" * 100)
    print("03  MoE 的总参数与激活参数 —— 2026-10-20", flush=True)
    print("=" * 100, flush=True)
    for repo in TARGETS:
        cfg = H.fetch_config(repo)
        n_experts = cfg.get("num_local_experts") or cfg.get("n_routed_experts") or cfg.get("num_experts")
        n_top = cfg.get("num_experts_per_tok")
        shards, index = H.weight_files(repo)
        read_all = len(shards) <= ALL_SHARDS_LIMIT
        print(f"\n--- {repo}   （{'全部读头' if read_all else '索引统计 + 抽查'}）", flush=True)
        print(f"    专家总数 num_local_experts / n_routed_experts   {n_experts}", flush=True)
        print(f"    每个 token 激活的专家数 num_experts_per_tok  {n_top}", flush=True)
        print(f"    权重分片数                  {len(shards)}", flush=True)

        if read_all:
            total = expert_total = non_expert_total = 0
            n_expert_tensors = 0
            shapes = defaultdict(set)
            for s in shards:
                header, _ = H.read_safetensors_header(H.file_url(repo, s))
                c, tensors = H.count_params(header)
                total += c
                for name, v in tensors.items():
                    if ".experts." in name:
                        expert_total += v["count"]
                        n_expert_tensors += 1
                        shapes["expert"].add(tuple(v["shape"]))
                    else:
                        non_expert_total += v["count"]
                time.sleep(0.3)
            active = non_expert_total + (n_top / n_experts) * expert_total
            print(f"    专家张量个数                  {n_expert_tensors:,}", flush=True)
            print(f"    专家张量的形状（去重）        {sorted(shapes['expert'])}", flush=True)
        else:
            idx = H.get_json(f"{repo}/resolve/main/{index}")
            wm = idx["weight_map"]
            total_bytes = idx["metadata"]["total_size"]
            names = list(wm.keys())
            counts = Counter(role(n) for n in names)
            exp_roles = {k: v for k, v in counts.items() if ".experts." in k}
            non_roles = {k: v for k, v in counts.items() if ".experts." not in k}
            print(f"    索引里的张量总数              {len(names):,}"
                  f"（专家张量 {sum(exp_roles.values()):,}，非专家张量 {sum(non_roles.values()):,}）", flush=True)
            print(f"    角色数                        {len(counts):,}", flush=True)
            probe = shards[:1] + shards[-1:] + [shards[int(len(shards) * i / 12)] for i in range(1, 12)]
            seen = {}
            for s in probe:
                header, _ = H.read_safetensors_header(H.file_url(repo, s))
                _, tensors = H.count_params(header)
                for name, v in tensors.items():
                    seen.setdefault(role(name), set()).add(tuple(v["shape"]))
            missing = [k for k in counts if k not in seen]
            print(f"    抽查的分片覆盖到的角色数      {len(seen):,}（缺 {len(missing):,}）", flush=True)
            for k in missing[:10]:
                print(f"      未覆盖：{k}  （{counts[k]:,} 个张量）", flush=True)
            if missing:
                print("    **有角色没有被抽查覆盖，换算不可信，本仓库这一路不采用**", flush=True)
                continue
            bad = [k for k, v in seen.items() if len(v) > 1]
            if bad:
                print(f"    **角色 {bad[:3]} 在抽查的分片里形状不一致，换算不可信**", flush=True)
                continue
            expert_total = 0
            non_expert_total = 0
            for k, c in counts.items():
                shape = next(iter(seen[k]))
                elems = 1
                for d in shape:
                    elems *= d
                if ".experts." in k:
                    expert_total += c * elems
                else:
                    non_expert_total += c * elems
            total = expert_total + non_expert_total
            print(f"    各角色换算明细（前 10 个角色）：", flush=True)
            for k in sorted(counts)[:10]:
                shape = next(iter(seen[k]))
                elems = 1
                for d in shape:
                    elems *= d
                print(f"      {k:58} ×{counts[k]:>6} 个，每个 {elems:>12,} 元素  形状 {shape}", flush=True)
            print(f"    按角色换算出的总参数          {total:,}  = {H.fmt(total)}", flush=True)
            print(f"    索引 total_size               {total_bytes:,} 字节"
                  f"（÷2 字节/参数 = {total_bytes // 2:,}）", flush=True)
            print(f"    与索引换算是否一致            {'一致' if total_bytes // 2 == total else '不一致'}", flush=True)
            active = non_expert_total + (n_top / n_experts) * expert_total

        print(f"    专家参数合计                  {expert_total:,}  = {H.fmt(expert_total)}"
              f"（占总参数 {expert_total / total * 100:.1f}%）", flush=True)
        print(f"    非专家参数合计                {non_expert_total:,}  = {H.fmt(non_expert_total)}"
              f"（占总参数 {non_expert_total / total * 100:.1f}%）", flush=True)
        print(f"    总参数                        {total:,}  = {H.fmt(total)}", flush=True)
        print(f"    激活参数 = 非专家 + {n_top}/{n_experts} × 专家   {int(active):,}  = {H.fmt(int(active))}", flush=True)
        print(f"    激活参数 ÷ 总参数             {active / total:.3f}", flush=True)
    print()


if __name__ == "__main__":
    main()
