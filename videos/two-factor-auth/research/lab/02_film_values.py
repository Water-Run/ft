# 打印本片四个 30 秒窗口的全部中间值：密钥、计数、HMAC-SHA-1 的 20 个字节、偏移量、取出的 4 个字节、31 位整数、6 位验证码。
# 结果另存为 film_values.json，由 tools/gen_data.py 转成画面数据。
import base64, hashlib, json, os, time
from totp_ref import totp_steps

HERE = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(HERE, "params.json"), encoding="utf-8"))
T0 = json.load(open(os.path.join(HERE, "t0.json"), encoding="utf-8"))["t0"]
KEY = hashlib.sha1(P["secret_phrase"].encode("utf-8")).digest()
B32 = base64.b32encode(KEY).decode("ascii")
URI = "otpauth://totp/%s:%s?secret=%s&issuer=%s" % (P["issuer"], P["account"], B32, P["issuer"])

print("密钥（由 params.json 的 secret_phrase 取 SHA-1，20 字节 = 160 位）")
print("  十六进制  " + KEY.hex())
print("  Base32    " + B32)
print("密钥 URI     " + URI)
print("算法 HMAC-%s，%d 位，步长 %d 秒，T0 = 0" % (P["algorithm"], P["digits"], P["period"]))
print("视频第 0 秒对应 Unix 时间 %d（%s UTC）" % (T0, time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(T0))))
wins = []
for k in range(P["windows"]):
    s = totp_steps(KEY, T0 + k * P["period"], P["period"], 0, P["digits"])
    full = int.from_bytes(s["p"], "big")
    print("窗口 %d（视频 %d–%d 秒，Unix %d–%d）" % (k, k * P["period"], (k + 1) * P["period"], s["unix"], s["unix"] + P["period"] - 1))
    print("  计数 T = floor(%d / %d) = %d   8 字节：%s" % (s["unix"], P["period"], s["counter"], s["msg"].hex()))
    print("  HMAC-SHA-1（20 字节）  " + " ".join("%02x" % b for b in s["hs"]))
    print("  最后一个字节 0x%02x，低 4 位 = %d（偏移量）" % (s["hs"][-1], s["offset"]))
    print("  第 %d–%d 个字节（从 0 数起）  %s  = 0x%08x" % (s["offset"], s["offset"] + 3, " ".join("%02x" % b for b in s["p"]), full))
    print("  去掉最高位  0x%08x = %d" % (s["snum"], s["snum"]))
    print("  %d mod 10^%d = %s" % (s["snum"], P["digits"], s["code"]))
    wins.append({"k": k, "unix": s["unix"], "counter": s["counter"], "msg": s["msg"].hex(), "hs": s["hs"].hex(), "offset": s["offset"],
                 "p": s["p"].hex(), "p_int": full, "snum": s["snum"], "code": s["code"]})
json.dump({"key_hex": KEY.hex(), "key_b32": B32, "uri": URI, "algorithm": P["algorithm"], "digits": P["digits"], "period": P["period"],
           "t0": T0, "t0_utc": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(T0)), "windows": wins},
          open(os.path.join(HERE, "film_values.json"), "w", encoding="utf-8"), indent=1)
