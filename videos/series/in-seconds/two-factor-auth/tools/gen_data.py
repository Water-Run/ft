# 取证数据 → 画面数据：读 research/lab/ 的 film_values.json 与 qr_matrix.json，写 src/js/data.js。
# 画面上的密钥、计数器、HMAC 字节、偏移量、整数、验证码与二维码矩阵都出自这里，场景代码不手写这些数。
# 用法：python tools/gen_data.py（在本片目录下，或任意目录）。只用标准库。
# 上游：research/lab/02_film_values.py（参考实现）与 05_qr.py（二维码），二者的回显在同目录的 out_*.txt。
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.join(HERE, "..", "research", "lab")
film = json.load(open(os.path.join(LAB, "film_values.json"), encoding="utf-8"))
qr = json.load(open(os.path.join(LAB, "qr_matrix.json"), encoding="utf-8"))

def pairs(hx):
    return [hx[i:i + 2] for i in range(0, len(hx), 2)]

wins = []
for w in film["windows"]:
    p = pairs(w["p"])
    masked = "%02x" % (int(p[0], 16) & 0x7F)
    bits = "".join("{:08b}".format(int(b, 16)) for b in p)
    assert int(masked + "".join(p[1:]), 16) == w["snum"] and str(w["snum"] % 10 ** film["digits"]).zfill(film["digits"]) == w["code"]
    wins.append({"unix": w["unix"], "counter": w["counter"], "msg": pairs(w["msg"]), "hs": pairs(w["hs"]), "offset": w["offset"],
                 "last": pairs(w["hs"])[-1], "lastBits": "{:08b}".format(int(pairs(w["hs"])[-1], 16)),
                 "p": p, "masked": masked, "bits": bits, "snum": w["snum"], "code": w["code"]})
data = {"key": pairs(film["key_hex"]), "b32": film["key_b32"], "uri": film["uri"], "algorithm": film["algorithm"], "digits": film["digits"],
        "period": film["period"], "t0": film["t0"], "t0utc": film["t0_utc"], "windows": wins,
        "qr": {"version": qr["version"], "error": qr["error"], "size": qr["size"], "rows": qr["rows"]}}
out = os.path.join(HERE, "..", "src", "js", "data.js")
with open(out, "w", encoding="utf-8", newline="\n") as f:
    f.write("// 由 tools/gen_data.py 从 research/lab/ 的实验结果生成，不要手改。\n")
    f.write("window.DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("写出 src/js/data.js：%d 个窗口，二维码 %d×%d，验证码 %s" % (len(wins), qr["size"], qr["size"], " ".join(w["code"] for w in wins)))
