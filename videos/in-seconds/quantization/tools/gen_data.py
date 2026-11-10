#!/usr/bin/env python3
"""由 research/lab/ 的回显生成画面数据 src/js/data.js。画面上的数字只从这里来。

用法：python tools/gen_data.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAB = os.path.join(ROOT, "research", "lab")
pub = open(os.path.join(LAB, "out_02_public_numbers.txt"), encoding="utf-8").read()
w = json.load(open(os.path.join(LAB, "weights_32.json"), encoding="utf-8"))
eff = open(os.path.join(LAB, "out_03_by_effort.txt"), encoding="utf-8").read()

total = int(re.search(r"'BF16': (\d+)", pub).group(1))
sec = pub[pub.index("GPQA Diamond, xhigh（缺省"):pub.index("GPQA Diamond, xhigh（第二张")]
sec2 = pub[pub.index("GPQA Diamond, xhigh（第二张"):pub.index("Terminal-Bench")]


def score(text, name):
    return float(re.search(re.escape(name) + r"\s+([\d.]+)%", text).group(1))


# 体积取 Quesma 评测所用文件的体积（见 FACTS.md 的「未解决」），分数取同一篇评测
FILES = [
    {"id": "bf16", "tier": "16 位", "name": "BF16", "file": "Qwen3.8-27B-BF16", "gb": 55, "score": score(sec, "BF16"), "levels": 65536},
    {"id": "q8", "tier": "8 位档", "name": "Q8_0", "file": "Qwen3.8-27B-Q8_0", "gb": 29, "score": score(sec, "Q8_0"), "levels": 256},
    {"id": "q4", "tier": "4 位档", "name": "Q4_K_M", "file": "Qwen3.8-27B-Q4_K_M", "gb": 17, "score": score(sec, "Q4_K_M"), "levels": 16},
    {"id": "q2", "tier": "2 位档", "name": "UD-Q2_K_XL", "file": "Qwen3.8-27B-UD-Q2_K_XL", "gb": 10.7, "score": score(sec, "UD-Q2_K_XL"), "levels": 4},
    {"id": "q1", "tier": "1 位档", "name": "UD-IQ1_S", "file": "Qwen3.8-27B-UD-IQ1_S", "gb": 6.2, "score": score(sec2, "UD-IQ1_S"), "levels": 2},
]

# 只放在 Hugging Face 上 Qwen3.8-27B 相关仓库、llama.cpp 或英伟达文档里实际出现的名字（FACTS D1–D5）
NAMES = ["BF16", "F16", "FP8", "INT8", "Q8_0", "Q8_K_XL", "Q6_K", "Q6_K_XL", "Q5_K_M", "Q5_K_XL", "Q5_1", "Q4_K_M", "Q4_K_S", "Q4_K_XL", "Q4_0", "Q4_1", "Q3_K_XL", "Q3_K_M", "Q2_K_XL", "Q2_K", "IQ4_XS", "IQ3_S", "IQ3_XXS", "IQ2_S", "IQ2_XXS", "IQ1_M", "IQ1_S", "NVFP4", "MXFP4", "FP4", "AWQ", "INT4", "W4A16", "GPTQ", "AutoRound", "MLX-4bit", "MLX-8bit", "bnb-4bit", "GSQ-RCO", "PTQ", "GGUF"]

# 少想（low）时的分数：图二给出 4 位、2 位、1 位；原版与 8 位在图一里，颜色用 4 位的那个点对上（FACTS E11）
fig2 = {m.group(1): dict(re.findall(r"(\S+)\s+([\d.]+)%", m.group(2))) for m in re.finditer(r"x=\s*([\d.]+)\s{2}(.*)", eff[eff.index("== 图二的点"):eff.index("== 图一的文字")])}
low2 = {k: float(v) for k, v in fig2["128.3"].items()}
fig1 = [dict((int(x), float(v)) for x, v in re.findall(r"x=(\d+):([\d.]+)%", line)) for line in eff[eff.index("== 图一的点"):eff.index("== 正文原句")].splitlines()[1:]]
low1 = next(r for r in fig1 if r and r[200] == low2["Q4_K_M"] and r[89] == low2["UD-Q2_K_XL"])
LOW = {"bf16": low1[479], "q8": low1[327], "q4": low2["Q4_K_M"], "q2": low2["UD-Q2_K_XL"], "q1": low2["UD-IQ1_S"]}
# 与原版逐词一致的比例（FACTS E12）与多步编程任务做成的个数（FACTS E13）
agr = pub[pub.index("与 BF16 逐词一致率"):]
AGREE = {"q8": score(agr, "Q8_0"), "q4": score(agr, "Q4_K_M"), "q2": score(agr, "UD-Q2_K_XL"), "q1": score(agr, "UD-IQ1_S")}
tb = [int(n) for n in re.findall(r"约 (\d+)/89", pub)]
for r in FILES:
    r["low"] = LOW[r["id"]]
    if r["id"] in AGREE:
        r["agree"] = AGREE[r["id"]]

same = [i for i, c in enumerate(w["codes"]) if c == 13]
data = {
    "params": total,
    "group": {"tensor": w["tensor"], "index": w["group"], "values": w["bf16"], "codes": w["codes"], "d": w["d"], "decoded": w["decoded"], "sameCode": same},
    "files": FILES,
    "names": NAMES,
    "speed": {"bf16": 14.6, "fp8": 20.6, "nvfp4": 38.6},
    "tasks": {"total": 89, "q2": tb[0], "q4": tb[1], "bf16": tb[2]},
}
assert same == [2, 3, 14, 23] and abs(w["d"] - 0.002775) < 1e-5, "真实数据和文案说的四个数对不上"
assert FILES[0]["score"] == 89.9 and FILES[4]["score"] == 10.4
assert LOW == {"bf16": 86.4, "q8": 82.3, "q4": 81.7, "q2": 81.3, "q1": 15.7} and AGREE["q4"] == 94.8 and tb == [57, 63, 63], "文案说的少想分数、逐词一致率或任务数对不上"
out = os.path.join(ROOT, "src", "js", "data.js")
with open(out, "w", encoding="utf-8", newline="\n") as f:
    f.write("// 由 tools/gen_data.py 从 research/lab/ 生成，不要手改。\n")
    f.write("window.DATA = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("写入", os.path.relpath(out, ROOT), "· 同一刻度的四个数", same)
