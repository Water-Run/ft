# 本片配乐脚本：三个方向，先各出约 60 秒的小样给策划者选（tools/audition.py music），选定后在 compose(ctx) 里按章节铺满全片。
#   A「落字」  毡音钢琴，76 拍/分。一拍一个音，像 token 一块一块落下；推进时加低音与铺底，最高处加高声部，收束回到单音。
#   B「运算」  柔和的拨弦脉冲，104 拍/分。两条长度不同的十六分音型错开相位（12 与 13 格），低音落在小节头，最高处加钢片琴旋律。
#   C「长句」  弦乐长音与钢片琴，66 拍/分。两小节换一个和弦，四个音的动机像一句问话；渐强到最高处后收回单个和弦。
# 三个方向都不用鼓、铜管和合唱，不用 kit 内置预设的和弦与 96 拍/分，也不用速通系列 120 拍/分的时钟音型。
# 结果是确定的：所有噪声都来自固定种子。混响用分块 FFT 卷积（块长 2 的幂），不对整条分轨做任意长度的变换。
import numpy as np

SR = 44100
FADE = (2.0, 3.5)
_cache = {}


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    e = np.full(n, s, dtype=np.float64)
    if a:
        e[:min(a, n)] = np.linspace(0, 1, a)[:min(a, n)]
    if d and a < n:
        k = min(d, n - a)
        e[a:a + k] = np.linspace(1, s, d)[:k]
    if r:
        k = min(r, n)
        e[n - k:] *= np.linspace(1, 0, k)
    return e


def onepole(x, cut, sr=SR):
    # 一阶低通，逐采样；只用在短的音符上
    a = np.exp(-2 * np.pi * cut / sr)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


# ── 音色 ──
def felt_piano(m, dur, vel):
    vel = round(vel * 20) / 20
    key = ('fp', m, round(dur, 2), vel)
    if key in _cache:
        return _cache[key]
    f = hz(m)
    n = int((dur + 2.5) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    B = 0.0004
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > 9000:
            break
        amp = (1.0 / k ** 1.6) * (0.55 + 0.45 * vel)
        dec = (0.9 + 0.25 * k) * (1 + (m - 60) / 40.0)
        out += amp * np.sin(2 * np.pi * fk * t + k * 0.7) * np.exp(-t * dec)
    att = np.minimum(1, t / 0.006)
    rel = np.ones(n)
    off = int(dur * SR)
    if off < n:
        rel[off:] = np.exp(-(t[off:] - t[off]) * 6.0)
    rng = np.random.default_rng(m * 7 + 1)
    thump = rng.standard_normal(int(0.03 * SR)) * np.exp(-np.arange(int(0.03 * SR)) / (0.004 * SR)) * 0.08 * vel
    out = out * att * rel
    out[:len(thump)] += thump
    out *= vel
    _cache[key] = out
    return out


def pluck(m, dur, vel, seed=0):
    key = ('pl', m, round(dur, 2), seed)
    if key in _cache:
        return _cache[key] * vel
    f = hz(m)
    n = int((dur + 1.2) * SR)
    p = max(2, int(round(SR / f)))
    rng = np.random.default_rng(1000 + m + seed * 131)
    buf = onepole(rng.uniform(-1, 1, p), 2400)
    out = np.empty(n)
    damp = 0.996 if m < 60 else 0.994
    for i in range(n):
        v = buf[i % p]
        out[i] = v
        buf[i % p] = damp * 0.5 * (v + buf[(i + 1) % p])
    out = onepole(out, 3200) * env_adsr(n, 0.002, 0.0, 1.0, 0.25)
    _cache[key] = out
    return out * vel


def bell(m, dur, vel):
    key = ('bl', m, round(dur, 2))
    if key in _cache:
        return _cache[key] * vel
    f = hz(m)
    n = int((dur + 3.0) * SR)
    t = np.arange(n) / SR
    idx = 2.2 * np.exp(-t * 3.0)
    out = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 1.6)
    out += 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3.5)
    out *= np.minimum(1, t / 0.003)
    _cache[key] = out
    return out * vel


def pad(ms, dur, vel, bright=900.0, attack=1.6, release=2.4, seed=0):
    key = ('pd', tuple(ms), round(dur, 2), round(vel, 2), bright, attack, release, seed)
    if key in _cache:
        return _cache[key]
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    rng = np.random.default_rng(77 + seed)
    for m in ms:
        f = hz(m)
        for det in (-0.08, 0.0, 0.07):
            ph = rng.uniform(0, 2 * np.pi)
            fd = f * 2 ** (det / 12)
            for k in range(1, 7):
                if fd * k > bright * 3:
                    break
                out += (1.0 / k ** 1.3) * np.exp(-(fd * k / bright) ** 2) * np.sin(2 * np.pi * fd * k * t + ph * k)
    e = env_adsr(n, attack, 0.0, 1.0, release)
    out = out * e * vel / max(1, len(ms))
    _cache[key] = out
    return out


def strings(ms, dur, vel, seed=0):
    key = ('st', tuple(ms), round(dur, 2), round(vel, 2), seed)
    if key in _cache:
        return _cache[key]
    n = int((dur + 2.0) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    rng = np.random.default_rng(300 + seed)
    for j, m in enumerate(ms):
        f = hz(m)
        for v in range(3):
            vib = 0.0035 * np.sin(2 * np.pi * (4.6 + 0.3 * v) * t + rng.uniform(0, 6.28))
            fd = f * (1 + 0.0025 * (v - 1))
            ph = np.cumsum(2 * np.pi * fd * (1 + vib) / SR)
            for k in range(1, 9):
                if fd * k > 7000:
                    break
                out += (0.9 ** k / k) * np.sin(k * ph + rng.uniform(0, 6.28))
    e = env_adsr(n, 1.4, 0.0, 1.0, 2.0)
    out = out * e * vel / (3 * max(1, len(ms)))
    _cache[key] = out
    return out


# ── 混响：衰减噪声脉冲，分块 FFT 卷积 ──
def reverb(x, seconds=2.6, mix=0.28, seed=5):
    rng = np.random.default_rng(seed)
    L = int(seconds * SR)
    ir = rng.standard_normal(L) * np.exp(-np.arange(L) / (SR * seconds / 6.9))
    ir = onepole_block(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    B = 1 << 16
    nfft = 1 << int(np.ceil(np.log2(B + L - 1)))
    H = np.fft.rfft(ir, nfft)
    y = np.zeros(len(x) + L)
    for s in range(0, len(x), B):
        blk = x[s:s + B]
        Y = np.fft.irfft(np.fft.rfft(blk, nfft) * H, nfft)[:len(blk) + L - 1]
        y[s:s + len(Y)] += Y
    return (1 - mix) * np.pad(x, (0, L)) + mix * y * 0.9


def onepole_block(x, cut):
    # 向量化近似：对 IR 用频域低通（IR 长度固定，只做一次）
    n = 1 << int(np.ceil(np.log2(len(x))))
    X = np.fft.rfft(x, n)
    f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / cut) ** 2), n)[:len(x)]


def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= len(buf):
        return
    k = min(len(sig), len(buf) - i)
    buf[i:i + k] += sig[:k] * gain


def stereo(mono_l, mono_r):
    return np.vstack([mono_l, mono_r])


def finish(L, R, total):
    n = int(total * SR)
    L, R = reverb(L)[:n], reverb(R, seed=6)[:n]
    out = np.vstack([L, R])
    fi, fo = int(FADE[0] * SR), int(FADE[1] * SR)
    out[:, :fi] *= np.linspace(0, 1, fi)
    out[:, -fo:] *= np.linspace(1, 0, fo)
    return out / (np.max(np.abs(out)) + 1e-9) * 0.70


def section_level(t, marks):
    # marks: [(秒, 电平), …] 线性插值
    xs, ys = zip(*marks)
    return float(np.interp(t, xs, ys))


# ── A 落字：毡音钢琴 ──
def demo_a(total=60.0):
    bpm = 76.0
    beat = 60 / bpm
    n = int((total + 4) * SR)
    L, R = np.zeros(n), np.zeros(n)
    prog = [(57, [57, 60, 64, 71]), (53, [53, 57, 60, 64]), (48, [52, 55, 60, 62]), (55, [55, 59, 62, 64])]  # Am(add9) Fmaj7 C/E(add9) G6
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    marks = [(0, 0.35), (12, 0.5), (32, 0.75), (40, 1.0), (48, 0.8), (60, 0.35)]
    t, bar = 0.0, 0
    while t < total - 1:
        root, ch = prog[(bar // 2) % 4]
        lv = section_level(t, marks)
        for i, step in enumerate(pattern):
            tt = t + i * beat / 2 if t >= 12 else t + i * beat
            if tt >= total - 1 or (t < 12 and i >= 4):
                break
            m = ch[step] + 12
            v = 0.32 + 0.12 * lv + (0.06 if i % 4 == 0 else 0)
            sig = felt_piano(m, beat * 0.9, v)
            pan = 0.5 + 0.25 * np.sin(m)
            place(L, sig, tt, 1 - pan * 0.6)
            place(R, sig, tt, 0.4 + pan * 0.6)
        if t >= 12:
            sig = felt_piano(root - 12, beat * 3.6, 0.42 * lv)
            place(L, sig, t, 0.9)
            place(R, sig, t, 0.7)
        if 20 <= t < 52:
            p = pad([x - 12 for x in ch], beat * 4, 0.10 * lv, bright=700, seed=bar)
            place(L, p, t, 1.0)
            place(R, p, t, 1.0)
        if 32 <= t < 48:
            mel = [76, 79, 77, 74] if bar % 2 == 0 else [76, 74, 72, 71]
            for j, mm in enumerate(mel):
                sig = felt_piano(mm + 0, beat * 1.8, 0.30)
                place(L, sig, t + j * beat, 0.6)
                place(R, sig, t + j * beat, 0.9)
        t += 4 * beat
        bar += 1
    for m in (45, 57, 64, 71):
        s = felt_piano(m, 4.0, 0.35)
        place(L, s, total - 4.2, 0.8)
        place(R, s, total - 4.2, 0.8)
    return finish(L, R, total)


# ── B 运算：拨弦脉冲 ──
def demo_b(total=60.0):
    bpm = 104.0
    s16 = 60 / bpm / 4
    n = int((total + 4) * SR)
    L, R = np.zeros(n), np.zeros(n)
    prog = [[50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [53, 60, 65, 69, 72], [48, 55, 60, 64, 67]]  # Dm  Bb  F  C
    pa = [0, 2, 4, 1, 3, 2, 4, 1, 3, 0, 2, 4]
    pb = [4, 1, 3, 0, 2, 4, 1, 3, 2, 4, 0, 1, 3]
    marks = [(0, 0.3), (14, 0.55), (30, 0.8), (36, 1.0), (48, 0.75), (60, 0.3)]
    bar_len = 16 * s16
    i = 0
    while i * s16 < total - 1:
        t = i * s16
        bar = int(t // bar_len)
        ch = prog[(bar // 2) % 4]
        lv = section_level(t, marks)
        m = ch[pa[i % len(pa)]] + 12
        acc = 1.0 if i % 4 == 0 else 0.7
        sig = pluck(m, s16 * 2, 0.30 * acc * (0.6 + 0.4 * lv), seed=i % 3)
        place(L, sig, t, 0.85)
        place(R, sig, t, 0.55)
        if t >= 10:
            m2 = ch[pb[i % len(pb)]] + 24
            sig = pluck(m2, s16 * 2, 0.20 * (0.5 + 0.5 * lv), seed=1 + i % 2)
            place(L, sig, t + 0.004, 0.45)
            place(R, sig, t + 0.004, 0.9)
        if i % 16 == 0:
            if t >= 14:
                b = pluck(ch[0] - 12, bar_len * 0.9, 0.55 * lv, seed=9)
                place(L, b, t, 0.8)
                place(R, b, t, 0.8)
            p = pad([x for x in ch[:4]], bar_len, 0.08 + 0.08 * lv, bright=650 + 500 * lv, attack=1.0, seed=bar)
            place(L, p, t, 1.0)
            place(R, p, t, 1.0)
        if 30 <= t < 50 and i % 8 == 0:
            mel = [81, 79, 77, 76, 77, 79, 74, 76]
            mm = mel[(i // 8) % len(mel)]
            sig = bell(mm, s16 * 6, 0.16)
            place(L, sig, t, 0.7)
            place(R, sig, t, 0.7)
        i += 1
    for m in (50, 57, 62, 65, 69):
        s = pluck(m, 3.0, 0.3, seed=2)
        place(L, s, total - 4.0, 0.8)
        place(R, s, total - 4.0, 0.8)
    return finish(L, R, total)


# ── C 长句：弦乐与钢片琴 ──
def demo_c(total=60.0):
    bpm = 66.0
    beat = 60 / bpm
    bar = 4 * beat
    n = int((total + 4) * SR)
    L, R = np.zeros(n), np.zeros(n)
    prog = [[50, 57, 62, 65], [46, 53, 62, 65], [41, 53, 60, 69], [48, 55, 64, 67],
            [43, 55, 62, 70], [46, 58, 65, 69], [45, 57, 65, 72], [48, 55, 65, 67]]  # Dm Bb/D F C | Gm Bb F/A Csus4
    marks = [(0, 0.35), (14, 0.55), (34, 0.9), (42, 1.0), (50, 0.65), (60, 0.35)]
    motif = [(0, 69), (1, 72), (2, 74), (3.0, 76)]  # 四个音，上行，停在没有解决的音上
    k = 0
    t = 0.0
    while t < total - 2:
        ch = prog[k % len(prog)]
        lv = section_level(t, marks)
        voices = ch if t >= 14 else ch[1:]
        s = strings(voices, 2 * bar, 0.55 * lv, seed=k)
        place(L, s, t, 0.9)
        place(R, s, t, 0.8)
        if t >= 14:
            c = strings([ch[0] - 12], 2 * bar, 0.45 * lv, seed=50 + k)
            place(L, c, t, 0.8)
            place(R, c, t, 0.9)
        if k % 2 == 0 and t < total - 8:
            up = 12 if 34 <= t < 50 else 0
            for (b, m) in motif:
                sig = bell(m + up - (0 if k % 4 == 0 else 2), beat * 1.5, 0.15 + 0.06 * lv)
                place(L, sig, t + b * beat, 0.6 + 0.2 * (b / 3))
                place(R, sig, t + b * beat, 0.8 - 0.2 * (b / 3))
        t += 2 * bar
        k += 1
    s = strings([50, 57, 62, 64], 4.5, 0.4, seed=99)
    place(L, s, total - 5.0, 0.9)
    place(R, s, total - 5.0, 0.9)
    sig = bell(76, 3.0, 0.14)
    place(L, sig, total - 4.0, 0.7)
    place(R, sig, total - 4.0, 0.7)
    return finish(L, R, total)


DEMOS = {'A': ('落字', demo_a), 'B': ('运算', demo_b), 'C': ('长句', demo_c)}


def compose(ctx):
    # 选定方向之前只是占位：按选定方向铺满全片的写法，等策划者选定后再写（按章节进出）。
    raise SystemExit('配乐方向尚未选定：先用 tools/audition.py music 出小样，选定后再写 compose()')
