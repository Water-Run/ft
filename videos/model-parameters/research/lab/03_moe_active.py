"""03 MoE 的「总参数」与「激活参数」：从真实权重头里算出来。

MoE 模型每个 token 只走一部分专家，于是同一个模型有两个数：
  总参数     = 权重文件里全部张量的元素个数
  激活参数   = 非专家部分 + (每次激活的专家数 ÷ 专家总数) × 专家部分

两个数都能从 safetensors 头里的张量名与 shape 算出来，再和模型卡上写的数比对。
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hfutil as H

TARGETS = [
    ("mistralai/Mixtral-8x7B-v0.1", 8, 2),
    ("Qwen/Qwen3-235B-A22B", None, 8),  # 专家总数从 config 的 num_experts 读
]


def main():
    print("=" * 100)
    print("03  MoE 的总参数与激活参数 —— 2026-10-20")
    print("=" * 100)
    for repo, n_experts_cfg, n_top_cfg in TARGETS:
        cfg = H.fetch_config(repo)
        n_experts = n_experts_cfg or cfg.get("num_local_experts") or cfg.get("num_experts")
        n_top = n_top_cfg or cfg.get("num_experts_per_tok")
        shards, _ = H.weight_files(repo)
        total = 0
        expert_total = 0
        expert_params = []
        non_expert_total = 0
        n_expert_tensors = 0
        for s in shards:
            header, _ = H.read_safetensors_header(H.file_url(repo, s))
            c, tensors = H.count_params(header)
            total += c
            for name, v in tensors.items():
                if ".experts." in name:
                    expert_total += v["count"]
                    expert_params.append(v["count"])
                    n_expert_tensors += 1
                else:
                    non_expert_total += v["count"]
        active = non_expert_total + (n_top / n_experts) * expert_total
        print(f"\n--- {repo}")
        print(f"    专家总数 num_local_experts / num_experts = {n_experts}")
        print(f"    每个 token 激活的专家数 num_experts_per_tok = {n_top}")
        print(f"    专家张量个数                            {n_expert_tensors}")
        print(f"    专家参数合计                            {expert_total:,}  ({expert_total / total * 100:.1f}%)")
        print(f"    非专家参数合计                          {non_expert_total:,}  ({non_expert_total / total * 100:.1f}%)")
        print(f"    总参数                                  {total:,}  = {H.fmt(total)}")
        print(f"    激活参数 = 非专家 + {n_top}/{n_experts} × 专家   {int(active):,}  = {H.fmt(int(active))}")
        print(f"    激活参数 ÷ 总参数 = {active / total:.3f}")
    print()


if __name__ == "__main__":
    main()
