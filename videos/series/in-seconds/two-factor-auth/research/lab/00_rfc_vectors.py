# 用 RFC 自带的测试向量核对参考实现（totp_ref.py）。
# RFC 4226 附录 D：密钥为 ASCII "12345678901234567890"，计数 0–9 的 HMAC 中间值、截取结果与 6 位 HOTP。
# RFC 6238 附录 B：同一密钥，时间步长 30 秒，T0 = 0，SHA-1 模式的 8 位 TOTP。
from totp_ref import hotp_steps, totp_steps

KEY = b"12345678901234567890"

RFC4226_D = [  # (计数, HMAC-SHA-1 十六进制, 截取后的十进制, HOTP)
    (0, "cc93cf18508d94934c64b65d8ba7667fb7cde4b0", 1284755224, "755224"),
    (1, "75a48a19d4cbe100644e8ac1397eea747a2d33ab", 1094287082, "287082"),
    (2, "0bacb7fa082fef30782211938bc1c5e70416ff44", 137359152, "359152"),
    (3, "66c28227d03a2d5529262ff016a1e6ef76557ece", 1726969429, "969429"),
    (4, "a904c900a64b35909874b33e61c5938a8e15ed1c", 1640338314, "338314"),
    (5, "a37e783d7b7233c083d4f62926c7a25f238d0316", 868254676, "254676"),
    (6, "bc9cd28561042c83f219324d3c607256c03272ae", 1918287922, "287922"),
    (7, "a4fb960c0bc06e1eabb804e5b397cdc4b45596fa", 82162583, "162583"),
    (8, "1b3c89f65e6c9e883012052823443f048b4332db", 673399871, "399871"),
    (9, "1637409809a679dc698207310c8c7fc07290d9e5", 645520489, "520489"),
]
RFC6238_B = [  # (Unix 时间, T 的十六进制, 8 位 TOTP)
    (59, "0000000000000001", "94287082"),
    (1111111109, "00000000023523EC", "07081804"),
    (1111111111, "00000000023523ED", "14050471"),
    (1234567890, "000000000273EF07", "89005924"),
    (2000000000, "0000000003F940AA", "69279037"),
    (20000000000, "0000000027BC86AA", "65353130"),
]

ok = True
print("RFC 4226 附录 D（HOTP，6 位）")
for c, hs, dec, otp in RFC4226_D:
    s = hotp_steps(KEY, c, 6)
    good = s["hs"].hex() == hs and s["snum"] == dec and s["code"] == otp
    ok &= good
    print("  计数 %d  HMAC %s  截取 %-10d  HOTP %s  %s" % (c, s["hs"].hex(), s["snum"], s["code"], "一致" if good else "不一致"))
print("RFC 6238 附录 B（TOTP，SHA-1，8 位）")
for t, thex, otp in RFC6238_B:
    s = totp_steps(KEY, t, 30, 0, 8)
    good = ("%016X" % s["counter"]) == thex and s["code"] == otp
    ok &= good
    print("  时间 %-11d  T %016X  TOTP %s  末 6 位 %s  %s" % (t, s["counter"], s["code"], s["code"][-6:], "一致" if good else "不一致"))
print("结论：" + ("全部一致" if ok else "有不一致"))
raise SystemExit(0 if ok else 1)
