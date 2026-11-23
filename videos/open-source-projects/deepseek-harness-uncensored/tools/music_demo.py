# 审片页的配乐小样（第 2 版）：三个方向各约 64 秒（引子、推进、最高处、收束），写进 out/audition/music/（不入库）。
# 策划者 2026-11-21：「配乐都不够好, 优化, 更有质感, 电子, 空灵.」
# 用法：python -I tools/music_demo.py；只依赖 numpy。结果确定：随机数固定种子。
# 做法：振荡器在采样域合成；滤波在 STFT 域按帧做（可随时间变化）；混响是按频率衰减、左右去相关的 6 秒卷积；
#       延迟是带逐级变暗的乒乓抽头卷积；母线做轻饱和与峰值归一。选定方向后，正式配乐另写 tools/music.py（compose(ctx)）。
import os, wave
import numpy as np

SR = 44100
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, 'out', 'audition', 'music')
os.makedirs(OUT, exist_ok=True)
N_FFT, HOP = 4096, 1024
WIN = np.hanning(N_FFT + 1)[:-1]

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def secs(n): return np.arange(n) / SR

# ── STFT ──
def stft(x):
    pad = np.concatenate([np.zeros(N_FFT), x, np.zeros(N_FFT)])
    n = 1 + (len(pad) - N_FFT) // HOP
    idx = np.arange(N_FFT)[None, :] + HOP * np.arange(n)[:, None]
    return np.fft.rfft(pad[idx] * WIN, axis=1)

def istft(X, length):
    fr = np.fft.irfft(X, N_FFT, axis=1) * WIN
    out = np.zeros(HOP * (len(fr) - 1) + N_FFT); norm = np.zeros_like(out)
    for i in range(len(fr)):
        out[i * HOP:i * HOP + N_FFT] += fr[i]; norm[i * HOP:i * HOP + N_FFT] += WIN ** 2
    out /= np.maximum(norm, 1e-6)
    return out[N_FFT:N_FFT + length]

FREQ = np.fft.rfftfreq(N_FFT, 1 / SR)

def filt(x, fc, kind='lp', q=0.0, order=2):
    """按帧的滤波。fc：常数或随时间的函数 f(t 秒)。q>0 时在截止处加一个共振峰。"""
    X = stft(x); t = (np.arange(len(X)) * HOP - N_FFT) / SR
    c = np.asarray(fc(t) if callable(fc) else np.full(len(X), fc), float)[:, None]
    r = FREQ[None, :] / c
    H = 1 / np.sqrt(1 + r ** (2 * order)) if kind == 'lp' else 1 / np.sqrt(1 + (1 / np.maximum(r, 1e-6)) ** (2 * order))
    if q: H = H * (1 + q * np.exp(-((np.log2(np.maximum(r, 1e-6))) ** 2) / 0.02))
    return istft(X * H, len(x))

def bandpass(x, lo, hi): return filt(filt(x, hi, 'lp', order=3), lo, 'hp', order=3)

# ── 空间 ──
def make_ir(seconds, seed, t_low=5.0, t_high=1.2, predelay=0.03, bright=7000):
    rng = np.random.default_rng(seed); n = int(seconds * SR)
    frames = n // HOP + 4
    t = np.arange(frames)[:, None] * HOP / SR
    t60 = t_high + (t_low - t_high) / (1 + (FREQ[None, :] / 900) ** 1.2)
    mag = np.exp(-6.9 * t / t60) / np.sqrt(1 + (FREQ[None, :] / bright) ** 4)
    mag *= np.clip(t / 0.08, 0, 1) ** 0.5                    # 柔和的起音，避免直达声般的尖峰
    X = mag * np.exp(2j * np.pi * rng.random(mag.shape))
    ir = istft(X, n)
    ir = np.concatenate([np.zeros(int(predelay * SR)), ir])
    return ir / np.sqrt(np.sum(ir ** 2))

def conv(x, ir):
    L = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[:len(x)]

_IRS = {}
def reverb(x, key='hall', **kw):
    if key not in _IRS:
        base = dict(seconds=6.0, t_low=5.5, t_high=1.4)
        base.update(kw)
        _IRS[key] = (make_ir(seed=11, **base), make_ir(seed=23, **base))
    a, b = _IRS[key]
    return conv(x, a), conv(x, b)

def pingpong(x, delay, fb=0.5, taps=8, blur=0.0006):
    """乒乓延迟：左右交替的抽头，每一跳更暗（高斯抹开）。返回 (L, R)。"""
    n = int(delay * SR * taps + SR); irL = np.zeros(n); irR = np.zeros(n)
    for k in range(1, taps + 1):
        w = blur * k; m = int(w * SR * 4) + 1; g = np.exp(-0.5 * (np.arange(-m, m + 1) / (w * SR)) ** 2); g /= g.sum()
        i = int(k * delay * SR) - m
        (irL if k % 2 else irR)[i:i + len(g)] += (fb ** (k - 1)) * g
    return conv(x, irL), conv(x, irR)

# ── 音源 ──
def adsr(n, a, d, s, r, hold):
    t = secs(n); e = np.zeros(n)
    e = np.where(t < a, t / max(a, 1e-4), e)
    m = (t >= a) & (t < a + d); e[m] = 1 - (1 - s) * (t[m] - a) / max(d, 1e-4)
    m = (t >= a + d) & (t < hold); e[m] = s
    h = max(hold, a + d); m = t >= h; e[m] = s * np.exp(-(t[m] - h) / max(r, 1e-4) * 3)
    return e

def supersaw(f, dur, voices=7, spread=0.12, seed=0, a=1.5, r=3.0, pw=0.55):
    rng = np.random.default_rng(seed); n = int((dur + r) * SR); t = secs(n)
    det = np.linspace(-1, 1, voices) * spread / 12          # 半音的若干分之一
    L = np.zeros(n); R = np.zeros(n)
    for i, d in enumerate(det):
        ph = (f * 2 ** d * t + rng.random()) % 1.0
        v = 2 * ph - 1
        pan = 0.5 + ((i / (voices - 1)) - 0.5) * pw if voices > 1 else .5
        L += v * np.cos(pan * np.pi / 2); R += v * np.sin(pan * np.pi / 2)
    e = adsr(n, a, 1.0, 0.85, r, dur)
    return L * e / voices, R * e / voices

def fm_bell(f, dur, ratio=3.5, index=2.2, decay=2.4, seed=0):
    n = int((dur + decay * 1.5) * SR); t = secs(n)
    idx = index * np.exp(-t * 4) + 0.25
    y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * ratio * t))
    y += 0.3 * np.sin(2 * np.pi * f * 2.001 * t) * np.exp(-t * 3)
    return y * np.exp(-t / decay) * np.clip(t / 0.003, 0, 1)

def sine_pad(f, dur, a=2.0, r=3.0):
    n = int((dur + r) * SR); t = secs(n)
    y = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t + 0.3)
    return y * adsr(n, a, 1, 0.9, r, dur)

def sub(f, dur):
    n = int((dur + 0.3) * SR); t = secs(n)
    y = np.tanh(1.6 * np.sin(2 * np.pi * f * t)) * adsr(n, 0.02, 0.3, 0.8, 0.3, dur)
    return y

def kick(soft=1.0):
    n = int(0.6 * SR); t = secs(n)
    f = 46 + 70 * np.exp(-t * 30)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    return np.tanh(1.4 * y) * soft

def noise(n, seed): return np.random.default_rng(seed).standard_normal(n)

def hat(seed, length=0.05, tone=9000):
    n = int(length * 3 * SR); x = noise(n, seed) * np.exp(-secs(n) / length * 4)
    return filt(x, tone, 'hp', order=2)

def snare(seed):
    n = int(0.4 * SR); t = secs(n)
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 28) * 0.6
    nz = bandpass(noise(n, seed), 1200, 7000) * np.exp(-t * 14)
    return body + nz

def put(buf, w, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(w)); buf[i:j] += g * w[:j - i]

def curve(n, pts):
    xs, ys = zip(*pts); return np.interp(secs(n), xs, ys)

def duck(n, times, depth=0.5, rel=0.28):
    g = np.ones(n)
    for t0 in times:
        i = int(t0 * SR)
        if i >= n: continue
        k = secs(min(int(rel * 3 * SR), n - i))
        g[i:i + len(k)] = np.minimum(g[i:i + len(k)], 1 - depth * np.exp(-k / rel * 2.5))
    return g

def master(name, L, R, width=1.0, arc=None):
    if arc:
        g = curve(len(L), arc); L, R = L * g, R * g
    M, S = (L + R) / 2, (L - R) / 2 * width
    L, R = M + S, M - S
    pk = max(np.max(np.abs(L)), np.max(np.abs(R))) or 1
    L, R = np.tanh(1.3 * L / pk) / np.tanh(1.3), np.tanh(1.3 * R / pk) / np.tanh(1.3)
    L, R = L * 0.89, R * 0.89
    n = len(L); fi, fo = int(0.04 * SR), int(3.0 * SR)
    for ch in (L, R):
        ch[:fi] *= np.linspace(0, 1, fi); ch[-fo:] *= np.linspace(1, 0, fo) ** 1.5
    pcm = (np.stack([L, R], 1) * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(name, round(n / SR, 1), 's')

def air(n, seed, lo, hi, breathe):
    """空气层：带通噪声，随慢速 LFO 呼吸。"""
    x = bandpass(noise(n, seed), lo, hi)
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * secs(n) / breathe)) ** 2

# ── A 深潜：76 BPM，D 小调。宽阔的锯齿铺底随滤波缓慢打开，次低音，FM 玻璃钟动机走乒乓延迟，呼吸的空气层；中段一记很轻的底鼓 ──
def demo_a():
    bpm = 76; b = 60 / bpm; bar = 4 * b; bars = 20; total = bars * bar + 4; n = int(total * SR)
    PL, PR, S, BL, K, SH = (np.zeros(n) for _ in range(6))
    chords = [[50, 57, 60, 64, 65], [46, 53, 57, 60, 62], [43, 50, 53, 58, 62], [45, 52, 55, 61, 64]]   # Dm(add9) Bbmaj9 Gm9 A7sus→A
    for k in range(bars // 2):
        t0 = k * 2 * bar; c = chords[k % 4]
        for j, nn in enumerate(c):
            l, r = supersaw(midi(nn), 2 * bar, seed=k * 10 + j, spread=0.14, a=2.2, r=3.5)
            put(PL, l, t0, 0.22); put(PR, r, t0, 0.22)
            put(SH, sine_pad(midi(nn + 24), 2 * bar, a=3, r=4), t0, 0.09 if j % 2 == 0 else 0.04)
        if k >= 1: put(S, sub(midi(c[0] - 12), 2 * bar - 0.1), t0, 0.5)
    motif = [(0, 74), (1.5, 77), (2, 76), (3, 72), (4.5, 74), (6, 69)]
    for k in range(2, 9):
        for off, nn in motif:
            if k % 2 == 1 and off > 4: continue
            put(BL, fm_bell(midi(nn + (12 if k in (5, 6) else 0)), 0.6, ratio=3.5, index=2.0, decay=2.0, seed=k), k * 2 * bar + off * b, 0.2)
    for i in range(int(8 * 4), int(17 * 4)):
        t0 = i * b
        if i % 4 in (0, 2) or i >= 12 * 4: put(K, kick(0.8), t0, 0.55 if i % 4 == 0 else 0.35)
    g = duck(n, [i * b for i in range(32, 68)], 0.35)
    fc = lambda t: 500 + 3800 * np.clip((t - 2) / 34, 0, 1) ** 1.6 * (1 - 0.6 * np.clip((t - 46) / 14, 0, 1))
    PL, PR = filt(PL, fc, q=0.6) * g, filt(PR, fc, q=0.6) * g
    A = air(n, 5, 2500, 9000, 7.0) * 0.012 * curve(n, [(0, 1), (40, 1.6), (total, 0.8)])
    dL, dR = pingpong(BL, 0.75 * b, fb=0.55)
    send = PL + PR + 1.2 * SH + BL + 0.6 * (dL + dR)
    rL, rR = reverb(send, 'deep', seconds=7, t_low=6.5, t_high=1.6, bright=6000)
    L = 0.55 * PL + 0.3 * S + 0.55 * K + 0.6 * BL + 0.4 * dL + 0.6 * rL + 2.2 * A + 0.5 * SH
    R = 0.55 * PR + 0.3 * S + 0.55 * K + 0.6 * BL + 0.4 * dR + 0.6 * rR + 2.2 * np.roll(A, 1500) + 0.5 * SH
    master('a.wav', L, R, width=0.85, arc=[(0, 0.32), (12, 0.5), (25, 0.8), (34, 1), (52, 1), (60, 0.6), (total, 0.4)])

# ── B 冰原：92 BPM，F# 小调 / A 大调。水晶般的 FM 拨奏琶音走附点延迟，人声感的共振峰铺底，半速的轻拍、远处的军鼓和沙锤 ──
def demo_b():
    bpm = 92; b = 60 / bpm; bar = 4 * b; bars = 24; total = bars * bar + 4; n = int(total * SR)
    PL, PR, PL2, K, SN, HT = (np.zeros(n) for _ in range(6))
    chords = [[54, 61, 64, 68, 73], [50, 57, 61, 64, 69], [57, 61, 64, 68, 71], [52, 59, 64, 66, 71]]   # F#m9 Dmaj9 Amaj9 E(add9)/sus
    arp = [0, 2, 4, 3, 1, 3, 4, 2]
    for k in range(bars):
        t0 = k * bar; c = chords[(k // 2) % 4]
        if k % 2 == 0:
            for j, nn in enumerate(c[:4]):
                l, r = supersaw(midi(nn), 2 * bar, voices=5, spread=0.08, seed=100 + k * 5 + j, a=1.8, r=3)
                put(PL, l, t0, 0.2); put(PR, r, t0, 0.2)
        if 2 <= k < 22:
            for s8, ai in enumerate(arp):
                v = 0.16 if s8 % 2 == 0 else 0.1
                put(PL2, fm_bell(midi(c[ai] + 12), 0.25, ratio=2.0 + 0.01 * ai, index=1.4, decay=0.7, seed=k), t0 + s8 * b / 2, v)
        if 8 <= k < 20:
            put(K, kick(0.7), t0, 0.6); put(K, kick(0.5), t0 + 2.5 * b, 0.35)
            put(SN, snare(k), t0 + 2 * b, 0.35)
            for s16 in range(16): put(HT, hat(300 + k * 16 + s16, 0.03, 7000), t0 + s16 * b / 4, [0.05, 0.02, 0.035, 0.02][s16 % 4])
    # 共振峰铺底：同一组铺底，削成「啊」的元音（730、1090、2440 Hz 附近）
    vow = lambda x: 0.6 * bandpass(x, 600, 900) + 0.45 * bandpass(x, 950, 1250) + 0.25 * bandpass(x, 2200, 2700)
    fc = lambda t: 1200 + 3000 * np.clip((t - 4) / 30, 0, 1) * (1 - 0.7 * np.clip((t - 50) / 12, 0, 1))
    PLf, PRf = filt(PL, fc, q=0.4), filt(PR, fc, q=0.4)
    VL, VR = vow(PL) * 1.4, vow(PR) * 1.4
    dL, dR = pingpong(PL2, 0.75 * b, fb=0.5, taps=7)
    A = air(n, 7, 4000, 12000, 5.0) * 0.022
    send = PLf + PRf + VL + VR + PL2 + 0.7 * (dL + dR) + 0.8 * SN
    rL, rR = reverb(send, 'ice', seconds=6, t_low=5, t_high=1.8, bright=9000)
    L = 0.5 * PLf + 0.4 * VL + 0.45 * PL2 + 0.4 * dL + 0.7 * K + 0.25 * SN + 0.6 * HT + 0.6 * rL + A
    R = 0.5 * PRf + 0.4 * VR + 0.45 * PL2 + 0.4 * dR + 0.7 * K + 0.25 * SN + 0.6 * np.roll(HT, 300) + 0.6 * rR + np.roll(A, 2000)
    master('b.wav', L, R, width=0.7, arc=[(0, 0.35), (10, 0.55), (21, 0.8), (28, 1), (52, 1), (58, 0.6), (total, 0.4)])

# ── C 流明：112 BPM，E 小调。侧链呼吸的铺底、逐渐打开的十六分音符琶音、温暖的次低音与轻底鼓；高处之后整体退回空间 ──
def demo_c():
    bpm = 112; b = 60 / bpm; bar = 4 * b; bars = 30; total = bars * bar + 4; n = int(total * SR)
    PL, PR, AR, S, K, HT, RM = (np.zeros(n) for _ in range(7))
    chords = [[52, 59, 62, 66, 71], [48, 55, 59, 62, 67], [50, 57, 62, 64, 69], [47, 54, 59, 62, 66]]   # Em9 Cmaj9 D6/9 Bm7
    order = [0, 2, 3, 4, 2, 3, 1, 3]
    for k in range(bars):
        t0 = k * bar; c = chords[(k // 2) % 4]
        if k % 2 == 0:
            for j, nn in enumerate(c[1:]):
                l, r = supersaw(midi(nn), 2 * bar, voices=7, spread=0.1, seed=200 + k * 5 + j, a=0.8, r=2)
                put(PL, l, t0, 0.2); put(PR, r, t0, 0.2)
        if 4 <= k < 26:
            for s16 in range(16):
                nn = c[order[s16 % 8]] + 12 + (12 if (s16 // 8) % 2 and k >= 14 else 0)
                put(AR, fm_bell(midi(nn), 0.1, ratio=1.0, index=2.5, decay=0.22, seed=k), t0 + s16 * b / 4, 0.12 if s16 % 4 == 0 else 0.07)
        if 8 <= k < 26:
            for q in range(4): put(S, sub(midi(c[0] - 12), b * 0.9), t0 + q * b + b / 2, 0.45)
        if 10 <= k < 24:
            for q in range(4): put(K, kick(0.8), t0 + q * b, 0.6)
            for e8 in range(8): put(HT, hat(500 + k * 8 + e8, 0.04, 8000), t0 + e8 * b / 2, 0.05 if e8 % 2 else 0.025)
            put(RM, hat(900 + k, 0.08, 2500), t0 + 3.5 * b, 0.12)
    g = duck(n, [i * b for i in range(int(10 * 4), int(24 * 4))], 0.6)
    gp = duck(n, [i * b for i in range(0, int(total / b))], 0.25)
    fc_p = lambda t: 900 + 2500 * np.clip((t - 2) / 20, 0, 1)
    fc_a = lambda t: 600 + 5200 * np.clip((t - 8) / 40, 0, 1) ** 1.3 * (1 - 0.75 * np.clip((t - 50) / 10, 0, 1))
    PL, PR = filt(PL, fc_p, q=0.5) * g * gp, filt(PR, fc_p, q=0.5) * g * gp
    AR = filt(AR, fc_a, q=0.8)
    dL, dR = pingpong(AR, 0.75 * b, fb=0.45, taps=6)
    A = air(n, 9, 3000, 10000, 9.0) * 0.008
    send = PL + PR + AR + 0.6 * (dL + dR) + RM
    rL, rR = reverb(send, 'lumen', seconds=5, t_low=4.2, t_high=1.2, bright=8000)
    L = 0.8 * PL + 1.0 * AR + 0.5 * dL + 0.32 * S + 0.6 * K + 1.3 * HT + 0.3 * RM + 0.55 * rL + 4.0 * A
    R = 0.8 * PR + 1.0 * AR + 0.5 * dR + 0.32 * S + 0.6 * K + 1.3 * np.roll(HT, 400) + 0.3 * RM + 0.55 * rR + 4.0 * np.roll(A, 1700)
    master('c.wav', L, R, arc=[(0, 0.35), (8, 0.5), (20, 0.75), (21.5, 1), (50, 1), (57, 0.6), (total, 0.4)])

if __name__ == '__main__':
    demo_a(); demo_b(); demo_c()
