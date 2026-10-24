"""MyISAM 配乐「磷光」：程序合成，按 D1「mysql> 终端」的画面写（P68：「再平淡一点, 注意画面契合音乐」；WaterRun 在第 3 轮三个调调里选定）。
A 小调五声，66 拍/分，几乎无拍：铺底的亮度随一个 12 秒的周期慢慢起伏；稀疏的方波音带三次回声，像屏幕上逐个亮起、余辉渐暗的字符。
不用鼓、铜管、合唱。画面跟它：字节、链箭头逐个点亮时落在方波音上，回声对应余辉。
强度曲线按场景取：audio.energy = {场景号: 0–1}，没写的场景取 0.4；也可直接给 audio.energy_points = [[秒, 强度], …]。
强度决定各层的进出；强度跳升 0.2 以上的场景开头放一记轻的标记音（audio.hits 可直接给秒数，或写 "scenes" 表示每个场景开头都放）。
结果确定：随机数全部由固定种子生成；滤波与混响都在逐个音符或分块上做，不对整条分轨做任意长度的变换。"""
import numpy as np

FADE = (2.0, 4.0)
SR = 48000
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
_cache = {}


def memo(key, make):
    if key not in _cache:
        _cache[key] = make()
    return _cache[key]


# ── 振荡器与滤波 ──
def _blep(ph, dt):
    r = np.zeros_like(ph)
    m = ph < dt; t = ph[m] / dt[m]; r[m] = 2 * t - t * t - 1
    m = ph > 1 - dt; t = (ph[m] - 1) / dt[m]; r[m] = t * t + 2 * t + 1
    return r


def _phase(freq, n, ph0):
    dt = np.broadcast_to(np.asarray(freq, dtype=float) / SR, (n,))
    return (ph0 + np.cumsum(dt)) % 1.0, dt


def saw(freq, n, ph0=0.0):
    ph, dt = _phase(freq, n, ph0)
    return 2 * ph - 1 - _blep(ph, dt)


def pulse(freq, n, width=0.5, ph0=0.0):
    ph, dt = _phase(freq, n, ph0)
    ph2 = (ph + width) % 1.0
    y = (2 * ph - 1 - _blep(ph, dt)) - (2 * ph2 - 1 - _blep(ph2, dt))
    return y - y.mean()


def _filt(x, gain):
    L = len(x); n = 1 << (L + 4095).bit_length()
    f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(np.fft.rfft(x, n) * gain(f), n)[:L]


def lp(x, fc, k=2): return _filt(x, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * k)))
def hp(x, fc, k=2): return _filt(x, lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1.0)) ** (2 * k)))
def bp(x, peaks): return _filt(x, lambda f: sum(a / (1 + ((f - c) / w) ** 2) for c, w, a in peaks))


def env(n, a, r):                            # 正弦起音，末尾 r 秒释放
    t = np.arange(n) / SR
    return np.sin(0.5 * np.pi * np.clip(t / max(a, 1e-3), 0, 1)) * np.clip((n / SR - t) / max(r, 1e-3), 0, 1) ** 1.5


def dec(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def noise(n, seed): return np.random.default_rng(seed).standard_normal(n)


# ── 乐器（同样的音只算一次）──
def ensemble(m, dur, fc, a, r, voices=5, spread=0.14, vib=0.0, seed=0):      # 合成器铺底：多支失谐锯齿波
    def make():
        n = int((dur + r) * SR); t = np.arange(n) / SR; g = np.random.default_rng(seed * 1000 + m)
        y = np.zeros(n)
        for v in range(voices):
            f = hz(m + spread * (2 * v / max(1, voices - 1) - 1))
            if vib:
                f = f * (1 + vib * np.sin(2 * np.pi * g.uniform(4.6, 5.6) * t + g.uniform(0, 6.3)) * np.clip((t - 0.3) / 0.6, 0, 1))
            y += saw(f, n, g.uniform())
        return lp(y / voices, fc) * env(n, a, r)
    return memo(('ens', m, round(dur, 3), fc, a, r, voices, spread, vib, seed), make)


def breathing(m, dur, t0, seed, period=12.0):  # 亮度随绝对时间缓慢起伏的铺底（不缓存：每个和弦的相位不同）
    n = int((dur + 2.5) * SR); g = np.random.default_rng(seed * 1000 + m)
    y = sum(saw(hz(m + d), n, g.uniform()) for d in (-0.16, -0.05, 0.06, 0.15)) / 4
    s = 0.5 + 0.5 * np.sin(2 * np.pi * (t0 + np.arange(n) / SR) / period)
    return (lp(y, 600) * (1 - s) + lp(y, 2200) * s) * env(n, 2.0, 2.5)


def soft_sq(m, dur, tau=0.6):                # 磨圆的方波：像旧电脑的提示音
    def make():
        n = int((dur + 0.3) * SR)
        return lp(pulse(hz(m), n, 0.5), min(6000.0, hz(m) * 4)) * env(n, 0.006, 0.25) * dec(n, tau)
    return memo(('ssq', m, round(dur, 3), tau), make)


def glass(m):                                # 玻璃音色：轻的调频
    def make():
        n = int(3.0 * SR); t = np.arange(n) / SR; f = hz(m)
        return np.sin(2 * np.pi * f * t + 1.0 * dec(n, 0.4) * np.sin(4 * np.pi * f * t)) * dec(n, 1.4) * env(n, 0.004, 0.3)
    return memo(('glass', m), make)


def sub(m, dur):
    def make():
        n = int((dur + 0.15) * SR); t = np.arange(n) / SR; f = hz(m)
        return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * env(n, 0.03, 0.2)
    return memo(('sub', m, round(dur, 3)), make)


def swell(dur, seed=0):                      # 越来越亮的轻噪声，止于标记音
    def make():
        n = int(dur * SR); t = np.arange(n) / SR
        return hp(noise(n, seed + 71), 3000) * (t / dur) ** 3
    return memo(('swell', round(dur, 3), seed), make)


# ── 混音 ──
class Bus:
    def __init__(self, n):
        self.n = n; self.dry = np.zeros((2, n), np.float32); self.wet = np.zeros((2, n), np.float32)

    def put(self, buf, t, gain=1.0, pan=0.0, send=0.3, right=None):
        i = int(round(t * SR))
        if i >= self.n or i < 0: return
        R = buf if right is None else right
        m = min(len(buf), len(R), self.n - i)
        if np.ndim(gain): gain = gain[:m]
        gl, gr = np.cos((pan + 1) * np.pi / 4) * 1.4142, np.sin((pan + 1) * np.pi / 4) * 1.4142
        for ch, (g, x) in enumerate(((gl, buf), (gr, R))):
            y = (g * gain) * x[:m]
            self.dry[ch, i:i + m] += (1 - 0.5 * send) * y
            self.wet[ch, i:i + m] += send * y

    def echo(self, buf, t, gain, step, times=3, fall=0.42, send=0.35):   # 左右交替的回声
        for e in range(times + 1):
            self.put(buf, t + e * step, gain * fall ** e, pan=(-0.25 if e == 0 else (0.6 if e % 2 else -0.6)), send=send + 0.08 * e)


def _ola(x, h):                              # 分块卷积
    B = 1 << 18; nfft = 1 << (B + len(h) - 1).bit_length()
    H = np.fft.rfft(h, nfft); y = np.zeros(len(x) + len(h))
    for s in range(0, len(x), B):
        seg = x[s:s + B]
        Y = np.fft.irfft(np.fft.rfft(seg, nfft) * H, nfft)[:len(seg) + len(h) - 1]
        y[s:s + len(Y)] += Y
    return y[:len(x)]


def reverb(x, length, decay, damp, pre, seed):
    n = int(length * SR); t = np.arange(n) / SR; out = np.zeros(x.shape)
    for ch in range(2):
        nz = noise(n, seed + 97 * ch)
        ir = 0.35 * nz * np.exp(-t / (decay * 0.35)) + lp(nz, damp) * np.exp(-t / decay)
        ir[:int(pre * SR)] = 0; ir /= np.sqrt(np.sum(ir ** 2))
        out[ch] = _ola(x[ch].astype(np.float64), ir)
    return out


def smooth(x, k):
    c = np.cumsum(np.concatenate([np.zeros(k // 2 + 1), x, np.zeros(k - k // 2)]))
    return ((c[k:] - c[:-k]) / k)[:len(x)]


def energy(ctx):
    a, total = ctx['audio'], ctx['total']
    if a.get('energy_points'):
        pts = [tuple(p) for p in a['energy_points']]
    else:
        tab = a.get('energy', {}); pts = []
        for s in ctx['scenes']:
            v = tab.get(s['id'], 0.4)
            pts += [(s['start'], v), (max(s['start'] + 0.1, s['end'] - 2.0), v)]
    tt = np.array([p[0] for p in pts], float); vv = np.array([p[1] for p in pts], float)
    ct = np.arange(0, total + 2, 0.01); E = smooth(np.interp(ct, tt, vv), 150)
    if a.get('hits') == 'scenes':            # 每个场景（章节）开头一记
        hits = [s['start'] for s in ctx['scenes'][1:]]
    elif a.get('hits') is not None:
        hits = list(a['hits'])
    else:
        hits, prev = [], None
        for s in ctx['scenes']:
            v = a.get('energy', {}).get(s['id'], 0.4)
            if prev is not None and v - prev >= 0.2: hits.append(s['start'])
            prev = v
    return (lambda t: np.interp(t, ct, E)), hits


def ramp(E, lo, hi):
    x = np.clip((E - lo) / (hi - lo), 0, 1)
    return x * x * (3 - 2 * x)


def curve(Ef, t0, n, lo, hi):                # 一个长音持续期间的层增益
    return ramp(Ef(t0 + np.arange(n) / SR), lo, hi)


def marks(bus, hits, chord_at):              # 章节标记：一阵轻噪声接一个玻璃音和弦
    for h in hits:
        if h >= 1.5: bus.put(swell(1.5, 1), h - 1.5, 0.05, send=0.6)
        for j, m in enumerate(chord_at(h)):
            bus.put(glass(m + 12), h + 0.03 * j, 0.06, pan=-0.4 + 0.27 * j, send=0.6)


# ── 编排 ──
def phosphor(bus, Ef, hits, total):
    beat = 60 / 66; bar = 4 * beat
    PROG = [(33, [57, 60, 64, 71]), (29, [57, 60, 64, 65]), (36, [55, 60, 64, 67]), (31, [55, 59, 62, 64])]   # Am(add9) Fmaj7 C G6，各两小节
    PENTA = [69, 72, 74, 76, 79, 81]
    GLOW = [(0, 0), (3, 2), (5, 1), (8, 3), (11, 0), (12, 4), (14, 2), (16, 1), (19, 3), (21, 5), (24, 2), (27, 0), (29, 1)]   # (八分音符位置, 音)
    k = 0
    while k * 2 * bar < total:
        t0 = k * 2 * bar; root, chord = PROG[k % 4]; dur = 2 * bar
        for j, m in enumerate(chord):
            L = breathing(m, dur, t0, 41); R = breathing(m, dur, t0, 42)
            bus.put(L, t0, 0.12 * (0.6 + 0.4 * curve(Ef, t0, len(L), 0.0, 0.4)), pan=-0.7 + 0.47 * j, send=0.6, right=R)
        g = 0.09 * ramp(Ef(t0), 0.3, 0.5)
        if g > 0.003: bus.put(sub(root, dur * 0.95), t0, g, send=0.05)
        for pos, p in GLOW:                  # 稀疏的字符亮起，带余辉般的回声
            if not (16 * (k % 2) <= pos < 16 * (k % 2) + 16): continue
            t = t0 + (pos - 16 * (k % 2)) * beat / 2; g = 0.06 * ramp(Ef(t), 0.12, 0.4)
            if g > 0.003: bus.echo(soft_sq(PENTA[p], beat * 0.8, 0.5), t, g, 0.75 * beat, times=3, send=0.45)
        if Ef(t0) > 0.6:
            for j, m in enumerate(chord[1:]):
                bus.put(ensemble(m + 12, dur, 5000, 2.5, 2.5, voices=4, spread=0.08, vib=0.002, seed=43), t0, 0.045 * curve(Ef, t0, int((dur + 2.5) * SR), 0.6, 0.85), pan=0.5 - 0.5 * j, send=0.7)
        if Ef(t0) > 0.7: bus.put(glass(chord[-1] + 12), t0 + bar, 0.06 * ramp(Ef(t0), 0.7, 0.85), pan=0.3, send=0.6)
        k += 1
    marks(bus, hits, lambda h: PROG[int(h // (2 * bar)) % 4][1])


def compose(ctx):
    global SR
    SR = ctx['sr']; n = ctx['n']; total = ctx['total']
    _cache.clear()
    Ef, hits = energy(ctx)
    bus = Bus(n)
    phosphor(bus, Ef, hits, total)
    out = bus.dry.astype(np.float64) + 0.5 * reverb(bus.wet, 5.0, 2.4, 5000, 0.03, seed=5)
    return out / max(1e-9, np.abs(out).max())
