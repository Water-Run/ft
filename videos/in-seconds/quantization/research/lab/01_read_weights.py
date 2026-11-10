#!/usr/bin/env python3
"""从 Hugging Face 上 Qwen3.8-27B 的两个真实 GGUF 文件里，读出同一位置的 32 个权重。

BF16 文件里是原始的 16 位浮点数；Q4_0 文件里是 4 位格子号加一个刻度 d。
只用 HTTP 范围请求读文件头和几十个字节，不下载整个模型。

GGUF 格式：https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
Q4_0 的存法：llama.cpp ggml/src/ggml-common.h 的 block_q4_0，
             解码见 ggml/src/ggml-quants.c 的 dequantize_row_q4_0。

用法：python 01_read_weights.py > out_01_read_weights.txt
同时写出 weights_32.json，供 tools/gen_data.py 生成画面数据。
"""
import json
import os
import struct
import sys
import urllib.request

REPO = "unsloth/Qwen3.8-27B-GGUF"
BASE = f"https://huggingface.co/{REPO}/resolve/main/"
BF16_PARTS = ["BF16/Qwen3.8-27B-BF16-00001-of-00002.gguf", "BF16/Qwen3.8-27B-BF16-00002-of-00002.gguf"]
Q4_FILE = "Qwen3.8-27B-Q4_0.gguf"
TENSOR = sys.argv[1] if len(sys.argv) > 1 else "blk.13.ffn_down.weight"
GROUP = int(sys.argv[2]) if len(sys.argv) > 2 else 1000   # 第几组（每组 32 个数）

TYPES = {0: "F32", 1: "F16", 2: "Q4_0", 8: "Q8_0", 10: "Q2_K", 12: "Q4_K", 14: "Q6_K", 30: "BF16"}
UA = {"User-Agent": "ft-research/1.0"}


def fetch(path, start, length):
    req = urllib.request.Request(BASE + path, headers={**UA, "Range": f"bytes={start}-{start + length - 1}"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


class Cur:
    def __init__(self, b):
        self.b, self.p = b, 0

    def take(self, fmt):
        v = struct.unpack_from("<" + fmt, self.b, self.p)
        self.p += struct.calcsize("<" + fmt)
        return v[0]

    def string(self):
        n = self.take("Q")
        s = self.b[self.p:self.p + n].decode("utf-8", "replace")
        self.p += n
        return s

    def value(self, t):
        scalar = {0: "B", 1: "b", 2: "H", 3: "h", 4: "I", 5: "i", 6: "f", 7: "?", 10: "Q", 11: "q", 12: "d"}
        if t in scalar:
            return self.take(scalar[t])
        if t == 8:
            return self.string()
        if t == 9:
            it, n = self.take("I"), self.take("Q")
            return [self.value(it) for _ in range(n)]
        raise ValueError(t)


def header(path):
    size = 32 * 1024 * 1024
    while True:
        b = fetch(path, 0, size)
        try:
            c = Cur(b)
            assert b[:4] == b"GGUF"
            c.p = 4
            version, n_t, n_kv = c.take("I"), c.take("Q"), c.take("Q")
            kv = {}
            for _ in range(n_kv):
                k = c.string()
                kv[k] = c.value(c.take("I"))
            tensors = {}
            for _ in range(n_t):
                name = c.string()
                dims = [c.take("Q") for _ in range(c.take("I"))]
                tensors[name] = {"dims": dims, "type": c.take("I"), "offset": c.take("Q")}
            align = kv.get("general.alignment", 32)
            data = (c.p + align - 1) // align * align
            return version, kv, tensors, data
        except (struct.error, IndexError):
            size *= 2


def bf16(b):
    # bfloat16：1 位符号、8 位指数、7 位尾数，等于 float32 的高 16 位
    return [struct.unpack("<f", b"\x00\x00" + b[i:i + 2])[0] for i in range(0, len(b), 2)]


def half(v):
    return struct.unpack("<e", struct.pack("<H", v))[0]


found = None
for part in BF16_PARTS:
    ver, kv, ts, data = header(part)
    if TENSOR in ts:
        found = (part, ts[TENSOR], data, kv)
        break
if not found:
    sys.exit(f"没有找到张量 {TENSOR}")
part, t, data, kv = found
print(f"模型文件: {REPO}")
print(f"BF16 所在分卷: {part}")
print(f"张量: {TENSOR}  形状 {t['dims']}  类型 {TYPES.get(t['type'], t['type'])}")
if TYPES.get(t["type"]) != "BF16":
    sys.exit("这个张量不是 BF16")

start = GROUP * 32
raw = fetch(part, data + t["offset"] + start * 2, 64)
xs = bf16(raw)

_, _, q_ts, q_data = header(Q4_FILE)
q = q_ts[TENSOR]
print(f"4 位文件: {Q4_FILE}  同一张量类型 {TYPES.get(q['type'], q['type'])}")
if TYPES.get(q["type"]) != "Q4_0":
    sys.exit("这个张量在 4 位文件里不是 Q4_0")
blk = fetch(Q4_FILE, q_data + q["offset"] + GROUP * 18, 18)
d = half(struct.unpack("<H", blk[:2])[0])
codes = [0] * 32
for j in range(16):
    codes[j] = blk[2 + j] & 0x0F
    codes[16 + j] = blk[2 + j] >> 4
ys = [(c - 8) * d for c in codes]

amax_v = max(xs, key=abs)
print(f"第 {GROUP} 组（第 {start} 到 {start + 31} 个数）")
print(f"组内绝对值最大的数: {amax_v:.6f}    按 llama.cpp 的算法 d = 最大值 / -8 = {amax_v / -8:.6f}")
print(f"文件里存的刻度 d: {d:.6f}")
print()
print(f"{'#':>3} {'BF16 原值':>12} {'格子号':>6} {'还原值':>12} {'误差':>11}")
errs = []
for i, (x, c, y) in enumerate(zip(xs, codes, ys)):
    errs.append(y - x)
    print(f"{i:>3} {x:>12.6f} {c:>6} {y:>12.6f} {y - x:>+11.6f}")
print()
maxerr = max(abs(e) for e in errs)
mean_abs = sum(abs(x) for x in xs) / 32
print(f"最大误差 {maxerr:.6f}（半格 {abs(d) / 2:.6f}）")
print(f"平均误差 {sum(abs(e) for e in errs) / 32:.6f}，这组数绝对值的平均 {mean_abs:.6f}")
print(f"占用: BF16 {32 * 16} 位；Q4_0 16 位刻度 + {32 * 4} 位格子号 = {16 + 32 * 4} 位（每个数 {(16 + 32 * 4) / 32} 位）")

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "weights_32.json"), "w", encoding="utf-8") as f:
    json.dump({"repo": REPO, "tensor": TENSOR, "group": GROUP, "bf16": [round(x, 7) for x in xs], "codes": codes, "d": d, "decoded": [round(y, 7) for y in ys]}, f, ensure_ascii=False, indent=1)
