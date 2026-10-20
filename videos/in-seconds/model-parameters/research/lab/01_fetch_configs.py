"""01 取一份真实模型仓库的配置文件，看清「一串参数」到底有多少项。

从 Hugging Face 公开仓库取 config.json 原件，存一份副本，列出全部字段。
来源：https://huggingface.co/<repo>/blob/main/config.json
仓库清单见 models.py（策划者要求：2026-08 之后发布的模型）。
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hfutil as H
import models

FIELDS = ["hidden_size", "num_hidden_layers", "num_attention_heads",
          "num_key_value_heads", "intermediate_size", "max_position_embeddings",
          "vocab_size", "num_local_experts", "n_routed_experts", "num_experts",
          "num_experts_per_tok", "n_shared_experts", "moe_intermediate_size",
          "num_dense_layers", "head_dim", "tie_word_embeddings"]


def main():
    out = H.lab_dir() / "configs"
    out.mkdir(parents=True, exist_ok=True)
    print("=" * 100)
    print("01  模型仓库配置文件（config.json）—— 2026-10-20 取自 huggingface.co 公开仓库", flush=True)
    print("=" * 100, flush=True)
    for repo, label in models.REPOS:
        cfg = H.fetch_config(repo)
        slug = repo.replace("/", "__")
        H.save_json(out / f"{slug}.json", cfg)
        # 有的模型把语言模型的部分放在 text_config 里
        text = cfg.get("text_config") if isinstance(cfg.get("text_config"), dict) else cfg
        keys = sorted(text.keys())
        print(f"\n--- {repo}  （{label}）", flush=True)
        print(f"    字段总数 {len(keys)}", flush=True)
        for f in FIELDS:
            if f in text:
                print(f"    {f:26} = {text[f]}", flush=True)
        if "architectures" in cfg:
            print(f"    {'architectures':26} = {cfg['architectures']}", flush=True)
        if "model_type" in cfg:
            print(f"    {'model_type':26} = {cfg['model_type']}", flush=True)
        print(f"    全部字段名：{', '.join(keys)}", flush=True)
    print()


if __name__ == "__main__":
    main()
