"""04 token 与字的关系：用真实分词器量。

用 Llama-3.2-1B 的真实分词器（tokenizer.json，取自公开仓库）把几段文本切开，
数出 token 数与字符数，看「1 个 token 等于几个字」这件事有多不固定。

同时核对：分词器自己的词表大小与 config.json 里的 vocab_size 是否一致。
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

REPO = "unsloth/Llama-3.2-1B"

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


def main():
    from transformers import AutoTokenizer
    tok = AutoTokenizer.from_pretrained(REPO)
    print("=" * 100)
    print(f"04  token 与字的关系 —— 2026-10-20，分词器取自 {REPO}")
    print("=" * 100)
    print(f"    分词器词表大小（len(tokenizer)）  {len(tok):,}")
    print(f"    config.json 的 vocab_size        {tok.vocab_size:,}")
    print(f"    两者是否一致                      {len(tok) == tok.vocab_size}")
    print()
    print(f"    {'样本':<12} {'字符数':>6} {'token 数':>8} {'每 token 字符数':>14}   分词结果（前 12 个）")
    print("    " + "-" * 96)
    for label, text in SAMPLES:
        ids = tok(text, add_special_tokens=False)["input_ids"]
        toks = tok.convert_ids_to_tokens(ids)
        ratio = len(text) / len(ids)
        head = " ".join(t.replace("Ġ", "▁") for t in toks[:12])
        print(f"    {label:<12} {len(text):>6} {len(ids):>8} {ratio:>14.2f}   {head}")
    print()

    # 一个词可以被切成几个 token
    print("    同一个词被切成几个 token：")
    for w in ["tokenization", "unbelievable", "hello", "模型参数", "上下文长度", "参数量"]:
        ids = tok(w, add_special_tokens=False)["input_ids"]
        toks = tok.convert_ids_to_tokens(ids)
        print(f"      {w:<16} → {len(ids)} 个 token：{' '.join(t.replace('Ġ', '▁') for t in toks)}")
    print()

    # 同一句话，不同写法的 token 数不同
    print("    同一句话换一种写法，token 数就变了：")
    for text in ["3.14", "3.14159", "三点一四", "2026年10月20日", "October 20, 2026"]:
        ids = tok(text, add_special_tokens=False)["input_ids"]
        print(f"      {text:<20} {len(ids)} 个 token")
    print()


if __name__ == "__main__":
    main()
