# 把密钥 URI 编成二维码（segno，本次用 1.6.6），打印版本、纠错等级与模块矩阵，并用 OpenCV 的二维码识别器解码回文本，确认与 URI 相同。
# 矩阵另存为 qr_matrix.json，由 tools/gen_data.py 转成画面数据。需要 segno、opencv-python-headless、numpy。
import json, os
import cv2, numpy as np, segno

HERE = os.path.dirname(os.path.abspath(__file__))
film = json.load(open(os.path.join(HERE, "film_values.json"), encoding="utf-8"))
qr = segno.make(film["uri"], error="m", micro=False, boost_error=False)
rows = [[1 if v else 0 for v in row] for row in qr.matrix]
n = len(rows)
print("内容  " + film["uri"])
print("版本 %s，纠错等级 %s，掩码 %s，%d × %d 个模块（不含静区）" % (qr.version, qr.error, qr.mask, n, n))
for r in rows:
    print("".join("#" if v else "." for v in r))
scale, quiet = 10, 4
img = np.full(((n + 2 * quiet) * scale, (n + 2 * quiet) * scale), 255, np.uint8)
for y, r in enumerate(rows):
    for x, v in enumerate(r):
        if v: img[(y + quiet) * scale:(y + quiet + 1) * scale, (x + quiet) * scale:(x + quiet + 1) * scale] = 0
text, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
same = text == film["uri"]
print("OpenCV %s 解码  %s" % (cv2.__version__, text))
print("结论：" + ("解码结果与密钥 URI 相同" if same else "解码结果不同"))
json.dump({"version": qr.version, "error": qr.error, "mask": qr.mask, "size": n, "rows": ["".join(str(v) for v in r) for r in rows]},
          open(os.path.join(HERE, "qr_matrix.json"), "w", encoding="utf-8"), indent=1)
raise SystemExit(0 if same else 1)
