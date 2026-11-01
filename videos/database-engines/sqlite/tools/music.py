# 本片配乐：「页的脉冲」（审片页小样 A，WaterRun 2026-11-01 选定）。96 拍/分，D 小调。
# 每拍一记低音，八分音符上一声很轻的「读页」短响，每两小节换一次根音（D、降 B、C、A）；每章从乐句开头重新起，章节卡落在强拍上。
# 由 mix.py 调用 compose(ctx)，返回 (2, N)；电平、旁白压低与限幅由 mix.py 统一处理。纯 numpy 合成，没有随机数。
import numpy as np

FADE = (2.0, 3.5)
BPM = 96
ROOTS = [38, 34, 36, 33]                          # D2 降B1 C2 A1
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
_cache = {}

def _tone(sr, m, dur, parts, a, d, vol):
    key = (m, dur, parts, a, d, vol)
    if key not in _cache:
        n = int(dur * sr); t = np.arange(n) / sr
        y = sum(w * np.sin(2 * np.pi * hz(m) * k * t) for k, w in parts)
        _cache[key] = vol * y * np.minimum(1, t / a) * np.exp(-t / d)
    return _cache[key]

def _tick(sr, f, vol):
    key = ('tick', f, vol)
    if key not in _cache:
        n = int(0.06 * sr); t = np.arange(n) / sr
        _cache[key] = vol * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.008)
    return _cache[key]

def _thump(sr, vol):
    key = ('thump', vol)
    if key not in _cache:
        n = int(0.25 * sr); t = np.arange(n) / sr
        f = 110 * np.exp(-t * 18) + 45
        _cache[key] = vol * np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-t / 0.09)
    return _cache[key]

def _put(buf, y, i, pan=0.0):
    if i >= buf.shape[1] or i < 0: return
    j = min(buf.shape[1], i + len(y)); seg = y[: j - i]
    buf[0, i:j] += seg * (1 - max(0.0, pan)); buf[1, i:j] += seg * (1 + min(0.0, pan))

def compose(ctx):
    sr, n = ctx['sr'], ctx['n']
    buf = np.zeros((2, n))
    beat = 60 / BPM
    # 各段的「密度」：讲来历与片尾轻一些，讲日志、WAL 时满一些
    dens = {'open': 0.8, 'lib': 0.6, 'store': 0.9, 'find': 0.9, 'page': 0.8, 'journal': 1.0, 'wal': 1.0, 'delete': 0.85, 'five': 0.9, 'end': 0.7, 'credits': 0.5}
    for sc in ctx['scenes']:
        t0, t1, sid = sc['start'], sc['end'], sc['id']
        k = dens.get(sid, 0.85)
        nb = int((t1 - t0) / beat)
        for b in range(nb):
            t = t0 + b * beat; i = int(t * sr)
            bar = b // 4; r = ROOTS[(bar // 2) % 4]
            _put(buf, _tone(sr, r, 0.5, ((1, 0.55), (2, 0.6), (3, 0.3)), 0.005, 0.22, 0.17), i)   # 低音减轻、泛音加重：能量不全压在 150 Hz 以下
            for h in range(2):                                                    # 中音区的「页」：八分音符上很轻的和弦音（D 小调），让中频有东西
                m = r + 24 + (0, 7, 3, 7)[(2 * b + h) % 4]
                _put(buf, _tone(sr, m, 0.35, ((1, 1.0), (2, 0.25)), 0.004, 0.14, 0.22 * k), i + int(h * beat / 2 * sr), pan=-0.2 if h else 0.2)
            if b % 4 == 0: _put(buf, _thump(sr, 0.2 if b else 0.32), i)            # 章首那一下重一点：章节卡落在强拍上
            for h in range(2):                                                    # 八分音符上的「读页」短响，左右轮换
                if k < 0.7 and h == 1: continue
                f = 2600 + 400 * ((b + h) % 3)
                _put(buf, _tick(sr, f, (0.07 if h else 0.1) * k), i + int(h * beat / 2 * sr), pan=0.35 if (b + h) % 2 else -0.35)
            if b % 8 == 6 and k >= 0.8:                                           # 每两小节一声高处的应答
                _put(buf, _tone(sr, r + 31, 0.6, ((1, 1.0), (3, 0.15)), 0.005, 0.35, 0.12 * k), i, pan=0.25)
    return buf
