"""192 秒稿：核对同一版本的配置、分词与词表，不下载权重。

运行：research/_src/venv/Scripts/python.exe -X utf8 research/lab/09_single_model.py
普通文本不加特殊 token；完整回显自动保存在本脚本旁。
"""
import hashlib
import json
import time
import urllib.request
from pathlib import Path

from tokenizers import Tokenizer

REPO = "LiquidAI/LFM2.5-24B-A2B"
REVISION = "1769516ac588c4c558089c94f27d96b0dc67b183"


def fetch(filename):
    url = f"https://huggingface.co/{REPO}/resolve/{REVISION}/{filename}"
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "ft-research/model-parameters"})
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def main():
    raw = fetch("tokenizer.json")
    cfg = json.loads(fetch("config.json"))
    tok = Tokenizer.from_str(raw.decode("utf-8"))
    lines = [f"repo={REPO}", f"revision={REVISION}",
             f"tokenizer_sha256={hashlib.sha256(raw).hexdigest()}"]
    for key in ("vocab_size", "hidden_size", "num_hidden_layers",
                "num_attention_heads", "max_position_embeddings"):
        lines.append(f"config.{key}={cfg[key]}")
    lines.append(f"layer_types={json.dumps(cfg['layer_types'])}")
    lines.append(f"tokenizer_vocab_size={tok.get_vocab_size(with_added_tokens=True)}")
    for text in ("模型参数", "参数量", "上下文长度", "模型", "你好", "拿到一个模型，先看它有多少参数。"):
        encoded = tok.encode(text, add_special_tokens=False)
        pieces = [tok.decode([i], skip_special_tokens=False) for i in encoded.ids]
        lines.append(json.dumps({"text": text, "characters": len(text),
                                 "tokens": len(encoded.ids), "ids": encoded.ids,
                                 "pieces": pieces}, ensure_ascii=False))
    result = "\n".join(lines) + "\n"
    Path(__file__).with_name("out_09_single_model.txt").write_text(result, encoding="utf-8")
    print(result, end="", flush=True)


if __name__ == "__main__":
    main()
