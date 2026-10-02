# 越界自检（按像素量，带镜头运动、SVG、canvas 的画面都适用）。由 kit/tools/margin.js 调用。
# 对「每句旁白说完那一刻」的画面，量出内容的外接范围，列出贴近画面左右边缘或顶边的句子。
# 环境变量：LVS_VIDEO、LVS_LANG；参数：安全边距（1080p 下的像素，默认 60）。
# 画面取自 shots/sheets/<语言>-margin/（margin.js 先让 sheets.js 出好）。有意出血的句子写进 project.json 的 check.margin_skip：{ 句号: 原因 }。
import json, os, sys
import numpy as np
from PIL import Image
VIDEO = os.environ["LVS_VIDEO"]; lang = os.environ.get("LVS_LANG", "zh").strip()
safe = int(sys.argv[1]) if len(sys.argv) > 1 else 60
SKIP = json.load(open(os.path.join(VIDEO, "project.json"), encoding="utf-8")).get("check", {}).get("margin_skip", {})
D = os.path.join(VIDEO, "shots", "sheets", "%s-margin" % lang)
items = json.load(open(os.path.join(D, "times.json"), encoding="utf-8"))
bad = 0; skipped = 0
for i, it in enumerate(items):
    cid = it["label"].split()[0]
    im = np.asarray(Image.open(os.path.join(D, "f_%04d.jpg" % i)).convert("RGB")).astype(int)
    H, W, _ = im.shape; k = 1920 / W
    bg = np.median(im[int(H * 0.5):int(H * 0.8), :8].reshape(-1, 3), axis=0)          # 左缘中段的颜色当底色
    m = np.abs(im - bg).sum(axis=2) > 60
    m[int(H * 0.86):, :] = False                                                   # 字幕带
    m[: int(H * 0.07), int(W * 0.40): int(W * 0.60)] = False                         # 顶部的句号标签（sheets.js 打上去的）
    cols = m.sum(axis=0); rows = m.sum(axis=1)                                     # 忽略单像素噪点：一列或一行里至少两个像素才算
    xi = np.nonzero(cols >= 2)[0]; yi = np.nonzero(rows >= 2)[0]
    if len(xi) == 0 or len(yi) == 0: continue
    x0, x1, y0 = xi[0] * k, (xi[-1] + 1) * k, yi[0] * k
    flags = []
    if x1 > 1920 - safe: flags.append("右 %d" % (1920 - x1))
    if x0 < safe: flags.append("左 %d" % x0)
    if y0 < 36: flags.append("上 %d" % y0)
    if flags:
        if cid in SKIP: skipped += 1; continue
        bad += 1; print("  %-5s %7.1fs  内容范围 x %4d–%4d, y≥%3d   距边：%s" % (cid, it["t"], x0, x1, y0, "，".join(flags)))
print("%s：%d 句里有 %d 句的内容进入了 %dpx 的安全边距%s" % (lang, len(items), bad, safe, ("（另有 %d 句按 check.margin_skip 略过）" % skipped) if skipped else ""))
sys.exit(1 if bad else 0)
