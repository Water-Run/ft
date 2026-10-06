# 选出本片演示用的起始时刻 t0（视频第 0 秒对应的 Unix 时间）。
# 时间是任取的；为了让「动态截取」一步在画面上看得清，按下面的规则取当天第一个满足条件的整分钟：
#   1. 四个连续的 30 秒窗口（视频的 0–30、30–60、60–90、90–120 秒）的验证码都不以 0 开头，且互不相同；
#   2. 用来演示计算过程的那个窗口（demo_window）：
#      a. 偏移量（最后一个字节的低 4 位）在 4–9 之间：是一个十进制数字，取出的 4 个字节落在 20 个字节的中段；
#      b. 取出的 4 个字节里，第一个字节的最高位为 1：屏蔽最高位这一步确实改变了数值；
#      c. 31 位整数是 10 位十进制数：取末 6 位时去掉 4 位。
# 条件只影响「演示哪一个时刻」，不改变算法；选出的时刻及其全部中间值由 02_film_values.py 打印。
import calendar, hashlib, json, os, time
from totp_ref import totp_steps

HERE = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(HERE, "params.json"), encoding="utf-8"))
KEY = hashlib.sha1(P["secret_phrase"].encode("utf-8")).digest()
start = calendar.timegm(time.strptime(P["day_utc"] + " " + P["search_from_utc"], "%Y-%m-%d %H:%M:%S"))
day_end = calendar.timegm(time.strptime(P["day_utc"] + " 00:00:00", "%Y-%m-%d %H:%M:%S")) + 86400

def ok(t0):
    w = [totp_steps(KEY, t0 + k * P["period"], P["period"], 0, P["digits"]) for k in range(P["windows"])]
    if any(x["code"][0] == "0" for x in w) or len({x["code"] for x in w}) != len(w): return None
    d = w[P["demo_window"]]
    if not (4 <= d["offset"] <= 9): return None
    if not (d["p"][0] & 0x80): return None
    if d["snum"] < 10 ** 9: return None
    return w

tried = 0
for t0 in range(start, day_end, 60):
    tried += 1
    w = ok(t0)
    if w:
        print("从 %s %s UTC 起逐分钟查找，第 %d 个整分钟满足条件：" % (P["day_utc"], P["search_from_utc"], tried))
        print("t0 = %d（%s UTC）" % (t0, time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(t0))))
        print("四个窗口的验证码：" + " ".join(x["code"] for x in w))
        json.dump({"t0": t0, "utc": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(t0))}, open(os.path.join(HERE, "t0.json"), "w", encoding="utf-8"))
        break
else:
    raise SystemExit("当天没有满足条件的时刻")
