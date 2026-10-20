"""01 取一份真实模型仓库的配置文件，看清「一串参数」到底有多少项。

从 Hugging Face 公开仓库取 config.json 原件，存一份副本，列出全部字段。
来源：https://huggingface.co/<repo>/blob/main/config.json
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hfutil as H

REPOS = [
    ("google-bert/bert-base-uncased", "BERT-base（编码器，百万级）"),
    ("HuggingFaceTB/SmolLM2-135M", "SmolLM2-135M（生成式，最小一档）"),
    ("unsloth/Llama-3.2-1B", "Llama-3.2-1B（本片主例子）"),
    ("unsloth/Llama-3.1-8B", "Llama-3.1-8B（十亿级）"),
    ("mistralai/Mixtral-8x7B-v0.1", "Mixtral-8x7B（MoE）"),
    ("Qwen/Qwen3-235B-A22B", "Qwen3-235B-A22B（MoE，千亿级）"),
]

FIELDS = ["hidden_size", "num_hidden_layers", "num_attention_heads",
          "num_key_value_heads", "intermediate_size", "max_position_embeddings",
          "vocab_size", "num_local_experts", "num_experts_per_tok", "rope_theta"]


def main():
    out = H.lab_dir() / "configs"
    out.mkdir(parents=True, exist_ok=True)
    print("=" * 100)
    print("01  模型仓库配置文件（config.json）—— 2026-10-20 取自 huggingface.co 公开仓库")
    print("=" * 100)
    for repo, label in REPOS:
        cfg = H.fetch_config(repo)
        slug = repo.replace("/", "__")
        H.save_json(out / f"{slug}.json", cfg)
        keys = sorted(cfg.keys())
        print(f"\n--- {repo}  （{label}）")
        print(f"    字段总数 {len(keys)}")
        for f in FIELDS:
            if f in cfg:
                print(f"    {f:26} = {cfg[f]}")
        if "architectures" in cfg:
            print(f"    {'architectures':26} = {cfg['architectures']}")
        print(f"    全部字段名：{', '.join(keys)}")
    print()


if __name__ == "__main__":
    main()
