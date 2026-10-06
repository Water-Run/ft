# TOTP / HOTP 的参考实现，只用标准库，按 RFC 4226 第 5.3 节与 RFC 6238 第 4.2 节逐步写出，并返回每一步的中间值。
# 供本目录的各实验脚本与 tools/gen_data.py 共用。
import hashlib, hmac, struct


def hotp_steps(key: bytes, counter: int, digits: int = 6, algo: str = "sha1") -> dict:
    msg = struct.pack(">Q", counter)                       # C：8 字节，大端
    hs = hmac.new(key, msg, getattr(hashlib, algo)).digest()   # 第 1 步：HS = HMAC(K, C)
    offset = hs[-1] & 0x0F                                 # 第 2 步：最后一个字节的低 4 位
    p = hs[offset:offset + 4]                              # 从 offset 起取 4 个字节
    snum = struct.unpack(">I", p)[0] & 0x7FFFFFFF          # 去掉最高位，得到 31 位整数
    code = snum % (10 ** digits)                           # 第 3 步：对 10^digits 取余
    return {"counter": counter, "msg": msg, "hs": hs, "offset": offset, "p": p, "snum": snum,
            "code": str(code).zfill(digits)}


def totp_steps(key: bytes, unix_time: int, period: int = 30, t0: int = 0, digits: int = 6, algo: str = "sha1") -> dict:
    counter = (unix_time - t0) // period                   # T = floor((当前 Unix 时间 - T0) / X)
    out = hotp_steps(key, counter, digits, algo)
    out["unix"] = unix_time
    return out
