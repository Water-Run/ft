"""04 token 与字的关系：用真实分词器量。

用主例子的真实分词器（tokenizer.json，取自公开仓库）把几段文本切开，
数出 token 数与字符数，看「1 个 token 等于几个字」这件事有多不固定。

同时核对三个容易混在一起的数：
  config.json 的 vocab_size   —— 模型词表（能表示多少种 token）
  len(tokenizer)              —— 分词器全部 token（含特殊 token）
  tokenizer.vocab_size        —— 分词器的基础词表（不含特殊 token）

分词结果按可读文本打印：tokenizer.convert_ids_to_tokens 给的是字节级
BPE 的内部写法，中文会显示成乱码，这里逐个 token 解回文本再拼。
仓库清单见 models.py。
"""

import json
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import models

SAMPLES = [
    ("中文短句", "拿到一个模型，先看它有多少参数。"),
    ("中文长句", "参数量是模型里所有可训练的数字的个数，它只说明模型有多大，不说明模型有多聪明。"),
    ("英文短句", "How many parameters does this model have?"),
    ("英文长句", "The number of parameters tells you how large a model is, not how good it is."),
    ("代码", "def forward(self, x): return self.linear(x)"),
    ("数字与符号", "2026-10-20 3.14 50% #1"),
    ("英文长单词", "tokenization"),
    ("英文常用词", "hello world"),
]


def fetch_config(repo):
    url = f"https://huggingface.co/{repo}/resolve/main/config.json"
    req = urllib.request.Request(url, headers={"User-Agent": "ft-research/model-parameters"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def readable(tok, ids, n=12):
    """把前 n 个 token 解成可读文本，token 之间用 | 标出边界。"""
    out = []
    for i in ids[:n]:
        text = tok.decode([i])
        out.append(text if text.strip() else "␣")
    return " | ".join(out)


def main():
    from transformers import AutoTokenizer
    repo = models.MAIN
    tok = AutoTokenizer.from_pretrained(repo)
    cfg = fetch_config(repo)

    print("=" * 100)
    print(f"04  token 与字的关系 —— 2026-10-20，分词器与配置取自 {repo}", flush=True)
    print("=" * 100, flush=True)
    n_added = len(tok.get_added_vocab())
    print(f"    config.json 的 vocab_size        {cfg['vocab_size']:,}   （模型词表：能表示多少种 token）", flush=True)
    print(f"    len(tokenizer)                    {len(tok):,}          （分词器全部 token，含特殊 token）", flush=True)
    print(f"    tokenizer.vocab_size              {tok.vocab_size:,}      （基础词表，不含特殊 token）", flush=True)
    print(f"    特殊 token 个数                   {n_added:,}", flush=True)
    print(f"    config.vocab_size == len(tokenizer)  {cfg['vocab_size'] == len(tok)}", flush=True)
    print(f"    config.vocab_size == 基础词表        {cfg['vocab_size'] == tok.vocab_size}", flush=True)
    print()

    print(f"    {'样本':<12} {'字符数':>6} {'token 数':>8} {'每 token 字符数':>14}   分词结果（前 12 个）", flush=True)
    print("    " + "-" * 96, flush=True)
    for label, text in SAMPLES:
        ids = tok(text, add_special_tokens=False)["input_ids"]
        ratio = len(text) / len(ids)
        print(f"    {label:<12} {len(text):>6} {len(ids):>8} {ratio:>14.2f}   {readable(tok, ids)}", flush=True)
    print()

    print("    同一个词被切成几个 token：", flush=True)
    for w in ["tokenization", "unbelievable", "hello", "模型参数", "上下文长度", "参数量"]:
        ids = tok(w, add_special_tokens=False)["input_ids"]
        print(f"      {w:<16} → {len(ids)} 个 token：{readable(tok, ids, 12)}", flush=True)
    print()

    print("    同一句话换一种写法，token 数就变了：", flush=True)
    for text in ["3.14", "3.14159", "三点一四", "2026年10月20日", "October 20, 2026"]:
        ids = tok(text, add_special_tokens=False)["input_ids"]
        print(f"      {text:<20} {len(ids)} 个 token", flush=True)
    print()


if __name__ == "__main__":
    main()
