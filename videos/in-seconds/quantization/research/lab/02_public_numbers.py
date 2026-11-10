#!/usr/bin/env python3
"""收集 Qwen3.8-27B 各量化档的公开数字：文件体积、参数量、Quesma 评测图上的分数。

Quesma 的分数画在页面内嵌的 SVG 里，脚本按纵轴刻度把点的坐标反算成百分比。
用法：python 02_public_numbers.py > out_02_public_numbers.txt
"""
import json
import re
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; ft-research)"}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def tree(repo):
    return json.loads(get(f"https://huggingface.co/api/models/{repo}/tree/main?recursive=true"))


print("== 官方权重的参数量")
info = json.loads(get("https://huggingface.co/api/models/Qwen/Qwen3.8-27B?expand[]=safetensors&expand[]=createdAt"))
total = info["safetensors"]["total"]
print("createdAt", info.get("createdAt"), info["safetensors"]["parameters"])
print(f"total × 2 字节 = {total * 2 / 1e9:.2f} GB")

print("\n== safetensors 仓库总量（十进制 GB）")
for repo in ["Qwen/Qwen3.8-27B", "Qwen/Qwen3.8-27B-FP8", "nvidia/Qwen3.8-27B-NVFP4", "unsloth/Qwen3.8-27B-NVFP4", "cyankiwi/Qwen3.8-27B-AWQ-INT4", "lmstudio-community/Qwen3.8-27B-MLX-4bit"]:
    size = sum(f["size"] for f in tree(repo) if f.get("type") == "file" and f["path"].endswith(".safetensors"))
    print(f"{size / 1e9:8.2f}  {repo}")

print("\n== unsloth/Qwen3.8-27B-GGUF 的文件（十进制 GB）")
files = [f for f in tree("unsloth/Qwen3.8-27B-GGUF") if f.get("type") == "file" and f["path"].endswith(".gguf")]
for f in sorted(files, key=lambda x: -x["size"]):
    print(f"{f['size'] / 1e9:8.3f}  {f['path']}")

print("\n== Quesma 评测的分数（由 SVG 坐标反算）")
page = get("https://quesma.com/blog/qwen38-27b-quantizations-benchmarked/").decode("utf-8", "replace")
svgs = {m.group(1): m.group(0) for m in re.finditer(r'<svg[^>]*aria-label="([^"]+)"[^>]*>.*?</svg>', page, re.S)}


def points(svg, keep=None):
    out = []
    for c in re.findall(r"<circle\b([^>]*)>", svg):
        fill = re.search(r'fill="([^"]+)"', c)[1]
        if fill == "transparent" or (keep and fill != keep):
            continue
        out.append((float(re.search(r'cx="([\d.]+)"', c)[1]), float(re.search(r'cy="([\d.]+)"', c)[1]), fill))
    return out


# 图一：GPQA Diamond 按文件大小。y=416 是 70%，y=26 是 100%；蓝点是缺省的 xhigh。
s = svgs["GPQA Diamond accuracy vs model size, by reasoning effort"]
names = {89.35: "UD-Q2_K_XL", 199.81: "Q4_K_M", 327.24: "Q8_0", 478.65: "BF16"}
print("GPQA Diamond, xhigh（缺省推理强度）:")
for x, y, _ in points(s, "#2a78d6"):
    name = names[min(names, key=lambda k: abs(k - x))]
    print(f"  {name:12} {70 + (416 - y) / 13:6.1f}%")

# 图二：GPQA Diamond 按推理强度。y=396 是 0%，y=24 是 100%；x=417.67 是 xhigh。
s = svgs["GPQA Diamond accuracy vs reasoning effort"]
colors = {"#1baf7a": "Q4_K_M", "#2a78d6": "UD-Q2_K_XL", "#eda100": "UD-IQ1_M", "#d62828": "UD-IQ1_S"}
print("GPQA Diamond, xhigh（第二张图，含 1 位档）:")
for x, y, fill in points(s):
    if abs(x - 417.67) < 1:
        print(f"  {colors[fill]:12} {(396 - y) / 3.72:6.1f}%")

# 图三：Terminal-Bench 2.1。y=171.3 是 70%，y=120.1 是 75%。
s = svgs["Terminal-Bench 2.1 pass rate vs model size"]
print("Terminal-Bench 2.1（89 题）:")
for x, y, fill in points(s):
    v = 70 + (171.3 - y) / 10.24
    print(f"  x={x:6.1f} {v:6.1f}%  约 {round(v * 89 / 100)}/89")

# 图四：逐词一致率。y=36.65 是 100%，y=143.1 是 90%。
s = svgs["top-1 token agreement with BF16 vs model size"]
names = ["UD-IQ1_S", "UD-IQ1_M", "UD-Q2_K_XL", "Q4_K_M", "Q8_0", "BF16"]
print("与 BF16 逐词一致率:")
for n, (x, y, _) in zip(names, points(s)):
    print(f"  {n:12} {100 - (y - 36.65) / 10.645:6.1f}%")
