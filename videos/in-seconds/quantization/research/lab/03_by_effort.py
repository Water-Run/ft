#!/usr/bin/env python3
"""Quesma 评测里「按推理强度」的分数：同一份卷子，想得短和想得长，各量化档差多少。

第二张图（GPQA Diamond accuracy vs reasoning effort）每条线是一个量化档，横轴是推理强度。
脚本把每个点的坐标按纵轴刻度反算成百分比，并摘出正文里讲长推理、长任务的原句。
用法：python 03_by_effort.py > out_03_by_effort.txt
"""
import html
import re
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; ft-research)"}
URL = "https://quesma.com/blog/qwen38-27b-quantizations-benchmarked/"
with urllib.request.urlopen(urllib.request.Request(URL, headers=UA), timeout=60) as r:
    page = r.read().decode("utf-8", "replace")
svgs = {m.group(1): m.group(0) for m in re.finditer(r'<svg[^>]*aria-label="([^"]+)"[^>]*>.*?</svg>', page, re.S)}
print("页面里的图：")
for k in svgs:
    print("  ", k)


def texts(svg):
    out = []
    for attrs, body in re.findall(r"<text\b([^>]*)>(.*?)</text>", svg, re.S):
        x, y = re.search(r'\bx="([\d.-]+)"', attrs), re.search(r'\by="([\d.-]+)"', attrs)
        out.append((float(x[1]) if x else None, float(y[1]) if y else None, html.unescape(re.sub(r"<[^>]+>", "", body)).strip()))
    return out


def points(svg):
    out = []
    for c in re.findall(r"<circle\b([^>]*)>", svg):
        fill = re.search(r'fill="([^"]+)"', c)[1]
        if fill != "transparent":
            out.append((float(re.search(r'cx="([\d.]+)"', c)[1]), float(re.search(r'cy="([\d.]+)"', c)[1]), fill))
    return out


# 图二：y=396 是 0%，y=24 是 100%（与 02_public_numbers.py 同一刻度）。
s = svgs["GPQA Diamond accuracy vs reasoning effort"]
print("\n== 图二的文字（坐标，内容）")
for x, y, t in texts(s):
    if t:
        print(f"  x={x} y={y}  {t}")
colors = {"#1baf7a": "Q4_K_M", "#2a78d6": "UD-Q2_K_XL", "#eda100": "UD-IQ1_M", "#d62828": "UD-IQ1_S"}
print("\n== 图二的点：横坐标（推理强度） → 各档分数")
rows = {}
for x, y, fill in points(s):
    rows.setdefault(round(x, 1), {})[colors.get(fill, fill)] = (396 - y) / 3.72
for x in sorted(rows):
    print(f"  x={x:6.1f}  " + "  ".join(f"{n} {v:5.1f}%" for n, v in sorted(rows[x].items())))

# 图一：按文件大小，每种颜色一档推理强度。y=416 是 70%，y=26 是 100%。
s = svgs["GPQA Diamond accuracy vs model size, by reasoning effort"]
print("\n== 图一的文字")
for x, y, t in texts(s):
    if t:
        print(f"  x={x} y={y}  {t}")
print("== 图一的点：颜色（推理强度） → 横坐标（文件大小）与分数")
by = {}
for x, y, fill in points(s):
    by.setdefault(fill, []).append((x, 70 + (416 - y) / 13))
for fill, pts in by.items():
    print(f"  {fill}  " + "  ".join(f"x={x:.0f}:{v:.1f}%" for x, v in sorted(pts)))

# 正文里讲长推理、长任务、逐词偏差的原句
body = html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style|svg)\b.*?</\1>", " ", page, flags=re.S)))
body = re.sub(r"\s+", " ", body)
print("\n== 正文原句（含关键词）")
seen = set()
for sent in re.split(r"(?<=[.!?])\s+", body):
    if re.search(r"reasoning effort|run out|runs out|token budget|empty|longer|long-horizon|compound|accumul|agentic|Terminal-Bench|agreement|drift|diverg", sent, re.I) and 30 < len(sent) < 420 and sent not in seen:
        seen.add(sent)
        print("  -", sent)
