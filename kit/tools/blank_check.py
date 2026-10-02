# 找出成片里「几乎是空的」时段（换屏途中内容还没进场、或一屏开头等得太久）。由 kit/tools/finish.js 调用，也可单独跑。
# 环境变量：LVS_VIDEO、LVS_LANG、LVS_FFMPEG；可选参数：视频文件（默认 out/<语言>/video.mp4）
# 做法：缩到 320x180 灰度、每秒 10 帧；去掉字幕带与 project.json 里 check.blank_ignore 列出的区域（常驻角标之类），
#       数与底色不同的像素占比。占比 < 0.6% 记为空。blank_ignore 写成 [[x0, y0, x1, y1], …]，各值是 0–1 的比例。
import json, os, subprocess, sys
import numpy as np
VIDEO = os.environ["LVS_VIDEO"]; VLANG = os.environ.get("LVS_LANG", "zh").strip()
FF = os.environ.get("LVS_FFMPEG") or "ffmpeg"
video = sys.argv[1] if len(sys.argv) > 1 else os.path.join(VIDEO, "out", VLANG, "video.mp4")
ignore = json.load(open(os.path.join(VIDEO, "project.json"), encoding="utf-8")).get("check", {}).get("blank_ignore", [])
W, H, FPS = 320, 180, 10
raw = subprocess.run([FF, "-v", "error", "-i", video, "-vf", "fps=%d,scale=%d:%d,format=gray" % (FPS, W, H), "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W)
mask = np.ones((H, W), dtype=bool); mask[int(H * 0.84):, :] = False
for x0, y0, x1, y1 in ignore: mask[int(H * y0): int(H * y1), int(W * x0): int(W * x1)] = False
fill = np.empty(len(fr))
for i, f in enumerate(fr):
    v = f[mask]; bg = np.bincount(v, minlength=256).argmax()
    fill[i] = np.mean(np.abs(v.astype(int) - int(bg)) > 14)
def runs(cond, min_len):
    out = []; i = 0
    while i < len(cond):
        if cond[i]:
            j = i
            while j < len(cond) and cond[j]: j += 1
            if (j - i) / FPS >= min_len: out.append((i / FPS, j / FPS))
            i = j
        else: i += 1
    return out
empty = runs(fill < 0.006, 0.3); sparse = runs(fill < 0.02, 1.2)
print("空画面检查：%d 帧（%.1f 秒）；画面占比 中位 %.1f%%，最小 %.2f%%" % (len(fr), len(fr) / FPS, 100 * np.median(fill), 100 * fill.min()))
print("  空画面（占比 < 0.6%%，持续 ≥ 0.3 秒）：%s" % ("" if empty else "无"))
for a, b in empty: print("    %7.1f – %7.1f  （%.1f 秒）" % (a, b, b - a))
print("  内容很少（占比 < 2%%，持续 ≥ 1.2 秒）：%s" % ("" if sparse else "无"))
for a, b in sparse: print("    %7.1f – %7.1f  （%.1f 秒）  最小 %.2f%%" % (a, b, b - a, 100 * fill[int(a * FPS): int(b * FPS)].min()))
print(json.dumps({"blank": [[round(a, 1), round(b, 1)] for a, b in empty], "sparse": [[round(a, 1), round(b, 1)] for a, b in sparse]}))
