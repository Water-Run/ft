# 第三方库核对：用 PyOTP 由同一个 Base32 密钥在相同时刻生成验证码，与 film_values.json 比较；
# 另用它解析密钥 URI，确认 URI 里的参数能还原出同一个密钥。需要 pyotp（本次用 2.10.0）。
import json, os
import pyotp

HERE = os.path.dirname(os.path.abspath(__file__))
film = json.load(open(os.path.join(HERE, "film_values.json"), encoding="utf-8"))
t = pyotp.TOTP(film["key_b32"])
ok = True
for w in film["windows"]:
    got = t.at(w["unix"])
    late = t.at(w["unix"] + film["period"] - 1)
    same = got == w["code"] == late
    ok &= same
    print("窗口 %d  Unix %d  PyOTP %s  窗口最后一秒 %s  参考实现 %s  %s" % (w["k"], w["unix"], got, late, w["code"], "一致" if same else "不一致"))
p = pyotp.parse_uri(film["uri"])
same = p.secret == film["key_b32"] and p.interval == film["period"] and p.digits == film["digits"]
ok &= same
print("解析密钥 URI：secret %s  步长 %d  位数 %d  %s" % (p.secret, p.interval, p.digits, "一致" if same else "不一致"))
print("结论：" + ("全部一致" if ok else "有不一致"))
raise SystemExit(0 if ok else 1)
