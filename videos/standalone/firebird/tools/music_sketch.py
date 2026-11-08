# 配乐小样（三个方向，各约 60 秒）。纯程序合成，不用外部素材；种子固定，结果可复现。
# 共同动机来自名字本身：FIREBIRD 里能当音名的字母是 F、E、B、D，F 到 B 是三全音。
# 用法：python videos/standalone/firebird/tools/music_sketch.py   输出 out/audition/music/a.mp3 b.mp3 c.mp3
import os, subprocess
import numpy as np

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'out', 'audition', 'music')
FF = os.environ.get('FFMPEG') or os.path.join(ROOT, '..', '..', '..', 'assets', 'ffmpeg', 'bin', 'ffmpeg.exe')
os.makedirs(OUT, exist_ok=True)
NAMES = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}


def hz(name, octave):
    return 440.0 * 2 ** ((NAMES[name] + 12 * (octave + 1) - 69) / 12)


class Track:
    def __init__(self, seconds):
        self.n = int(seconds * SR) + SR * 4
        self.x = np.zeros((self.n, 2))

    def add(self, t, sig, gain=1.0, pan=0.0):
        i = int(t * SR)
        if i >= self.n:
            return
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.column_stack([sig * l * 1.414, sig * r * 1.414])
        e = min(self.n, i + len(sig))
        self.x[i:e] += sig[:e - i] * gain


def filt(x, kind, fc, order=2):
    # 频域实现的巴特沃斯幅度响应（零相位），只依赖 numpy
    n = len(x)
    pad = n + 4096
    X = np.fft.rfft(x, pad, axis=0)
    f = np.maximum(np.fft.rfftfreq(pad, 1 / SR), 1e-6)
    lp = lambda c: 1 / np.sqrt(1 + (f / np.clip(c, 20, SR * 0.45)) ** (2 * order))
    hp = lambda c: 1 / np.sqrt(1 + (np.clip(c, 20, SR * 0.45) / f) ** (2 * order))
    H = lp(fc) if kind == 'lowpass' else hp(fc) if kind == 'highpass' else hp(fc[0]) * lp(fc[1])
    return np.fft.irfft(X * (H[:, None] if x.ndim == 2 else H), pad, axis=0)[:n]


def tl(sec):
    return np.arange(int(sec * SR)) / SR


def kick(rng, punch=1.0):
    t = tl(0.34)
    phase = 2 * np.pi * (46 * t + 90 * 0.035 * (1 - np.exp(-t / 0.035)))
    click = filt(rng.standard_normal(len(t)), 'highpass', 2500) * np.exp(-t / 0.004) * 0.35
    return np.tanh((np.sin(phase) * np.exp(-t / 0.12) + click) * 1.6 * punch) * 0.95


def snare(rng, body=190):
    t = tl(0.26)
    n = filt(rng.standard_normal(len(t)), 'bandpass', [1400, 7800]) * np.exp(-t / 0.075)
    return np.tanh((n * 0.95 + np.sin(2 * np.pi * body * t) * np.exp(-t / 0.05) * 0.7) * 1.5) * 0.7


def hat(rng, d=0.03):
    t = tl(max(0.09, d * 5))
    return filt(rng.standard_normal(len(t)), 'highpass', 7500) * np.exp(-t / d) * 0.4


def crash(rng):
    t = tl(2.4)
    return filt(rng.standard_normal(len(t)), 'highpass', 4200) * np.exp(-t / 0.8) * 0.42


def string(rng, f, sec, damp=0.996, bright=1.0):
    # Karplus-Strong 拨弦，按延迟长度分块递推
    n, p = int(sec * SR), max(2, int(round(SR / f)))
    y = np.zeros(n)
    m = min(n, p)
    noise = rng.uniform(-1, 1, m)
    y[:m] = filt(noise, 'lowpass', 1500 + 7000 * bright) if m > 30 else noise
    for i in range(p, n, p):
        seg = min(p, n - i)
        a = y[i - p:i - p + seg]
        b = np.r_[y[i - p - 1] if i > p else 0.0, a[:-1]]
        y[i:i + seg] = damp / 2 * (a + b)
    return y


def amp(x, drive=9.0, low=110, high=4300):
    y = np.tanh(filt(x, 'highpass', 90) * drive)
    y = np.tanh(filt(y, 'lowpass', 7000) * 2.2)
    return filt(filt(y, 'highpass', low), 'lowpass', high) * 0.5


def power(rng, f, sec, mute=False, drive=10.0):
    d = 0.94 if mute else 0.9975
    bright = 0.55 if mute else 1.0
    tones = sum(string(rng, f * r * (1 + rng.uniform(-0.0012, 0.0012)), sec, d, bright) * g
                for r, g in [(1, 1.0), (1.4983, 0.85), (2, 0.6)])
    env = np.minimum(1, (sec - tl(sec)) / 0.012)
    return amp(tones, drive=drive, high=3000 if mute else 4300) * env


def saw(f, t, width=1.0):
    ph = (f * t) % 1
    return 2 * ph - 1 if width == 1.0 else np.where(ph < width, 1.0, -1.0)


def bass(f, sec, cut=900, drive=2.2, env_amt=2.0):
    t = tl(sec)
    x = saw(f, t) * 0.7 + np.sin(2 * np.pi * f * t) * 0.7
    fc = cut * (1 + env_amt * np.exp(-t / 0.06))
    lo = filt(x, 'lowpass', float(np.mean(fc)))
    return np.tanh(lo * drive) * np.minimum(1, t / 0.003) * np.minimum(1, (sec - t) / 0.012) * 0.75


def lead(f, sec, wob=5.5, kind='saw', cut=3200, drive=2.6):
    t = tl(sec)
    vib = 1 + 0.005 * np.sin(2 * np.pi * wob * t) * np.minimum(1, t / 0.25)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    if kind == 'saw':
        x = sum(np.sin(ph * k) / k for k in range(1, 12)) * 0.65
    elif kind == 'square':
        x = sum(np.sin(ph * k) / k for k in range(1, 16, 2)) * 0.8
    else:
        x = np.sin(ph + 2.2 * np.sin(ph * 2.002) * np.exp(-t / 0.35)) * 0.8
    env = np.minimum(1, t / 0.008) * np.minimum(1, (sec - t) / 0.03)
    return filt(np.tanh(x * drive), 'lowpass', cut) * env * 0.5


def echo(x, delay, fb=0.4, tone=2600):
    n, d = len(x), int(delay * SR)
    out = x.copy()
    tap = x.copy()
    k = 1
    while k * d < n and fb ** k > 0.03:
        tap = filt(tap, 'lowpass', tone)
        out[k * d:] += tap[:n - k * d] * fb ** k * np.array([1.0, 0.72] if k % 2 else [0.72, 1.0])
        k += 1
    return out


def pump(x, hits, depth=0.55, rel=0.2):
    g = np.ones(len(x))
    for t in hits:
        i = int(t * SR)
        m = min(len(x) - i, int(SR * rel * 3))
        if m > 0:
            g[i:i + m] = np.minimum(g[i:i + m], 1 - depth * np.exp(-np.arange(m) / (SR * rel)))
    return x * g[:, None]


def write(mix, name, sec):
    mix = mix[:int((sec + 2.2) * SR)]
    fade = np.minimum(1, (len(mix) - np.arange(len(mix))) / (SR * 2.0))
    mix = mix * fade[:, None]
    mix = np.tanh(mix / max(1e-6, np.percentile(np.abs(mix), 99.7)) * 1.05) * 0.86
    mix -= mix.mean(axis=0)
    wav = os.path.join(OUT, name + '.wav')
    raw = (np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes()
    p = subprocess.run([FF, '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', 'pipe:0', '-af', 'loudnorm=I=-15:TP=-1.2:LRA=9', '-ar', '44100', '-b:a', '192k', wav.replace('.wav', '.mp3')], input=raw)
    assert p.returncode == 0
    l = np.sqrt(np.mean(mix ** 2))
    print(name, f'{len(mix) / SR:.1f}s', 'rms', round(float(l), 3), 'peak', round(float(np.abs(mix).max()), 3))


MOTIF = [('F', 0, 10), ('E', 10, 6), ('B', 16, 8), ('D', 24, 8)]    # 两小节 32 个十六分音符


def oct_of(n, base):
    return base - 1 if n == 'B' else base


def piece_a():
    """A：工业电摇。128 BPM，四拍底鼓，十六分合成贝斯，失真吉他切分。"""
    rng = np.random.default_rng(1984)
    bpm, bars = 128, 32
    step = 60 / bpm / 4
    sec = step * 16 * bars
    dr, bs, gt, ld, fx = (Track(sec) for _ in range(5))
    kicks = []
    gate = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0]
    for b in range(bars):
        t0 = b * 16 * step
        ph = b % 2
        full = 4 <= b < 20 or b >= 24
        for s in range(16):
            t = t0 + s * step
            if full and s % 4 == 0:
                dr.add(t, kick(rng), 1.0)
                kicks.append(t)
            if full and s in (4, 12):
                dr.add(t, snare(rng), 0.85)
            if b >= 2 and s % 2 == 0:
                dr.add(t, hat(rng, 0.018 if s % 4 else 0.04), 0.42 if b >= 4 else 0.25, 0.25)
            if b >= 20 and b < 24 and s % 4 == 0:
                dr.add(t, hat(rng, 0.09), 0.3, -0.2)
            pos = ph * 16 + s
            nm = next(n for n, a, l in MOTIF if a <= pos < a + l)
            cut = 240 + 1500 * min(1.0, b / 12) if b < 12 else 1800
            bs.add(t, bass(hz(nm, oct_of(nm, 1) + 1) * (2 if s % 8 == 7 else 1), step * 0.9, cut=cut), 0.8 if s % 4 else 1.0)
        if 12 <= b < 20 or b >= 24:
            for s, on in enumerate(gate):
                if on:
                    pos = ph * 16 + s
                    nm = next(n for n, a, l in MOTIF if a <= pos < a + l)
                    f = hz(nm, oct_of(nm, 2))
                    t = t0 + s * step
                    gt.add(t, power(rng, f, step * 1.7, mute=True), 0.72, -0.55)
                    gt.add(t + 0.009, power(rng, f * 1.001, step * 1.7, mute=True), 0.72, 0.55)
        if 20 <= b < 24 or b >= 26:
            for nm, a, l in MOTIF:
                if a // 16 == ph:
                    o = 4 if b % 4 < 2 else 5
                    ld.add(t0 + (a - ph * 16) * step, lead(hz(nm, oct_of(nm, o)), l * step * 0.96, kind='saw', cut=3600), 0.5)
    for b in (4, 12, 24):
        fx.add(b * 16 * step, crash(rng), 0.8)
    r = tl(step * 16 * 2)
    fx.add(2 * 16 * step, filt(rng.standard_normal(len(r)), 'highpass', 1800) * (r / r[-1]) ** 2 * 0.2, 1.0)
    end = step * 16 * bars
    dr.add(end, kick(rng), 1.0)
    gt.add(end, power(rng, hz('F', 2), 3.0), 0.9, -0.5)
    gt.add(end + 0.01, power(rng, hz('F', 2) * 1.001, 3.0), 0.9, 0.5)
    mix = dr.x * 1.0 + pump(bs.x, kicks, 0.5) * 0.9 + pump(gt.x, kicks, 0.3) * 0.72 + echo(ld.x, step * 3, 0.36) * 0.62 + fx.x * 0.7
    write(mix, 'a', sec)


def piece_b():
    """B：车库电子朋克。168 BPM，快八分鼓，震音冲浪吉他，芯片琶音，停顿打点。"""
    rng = np.random.default_rng(2000)
    bpm, bars = 168, 40
    step = 60 / bpm / 4
    sec = step * 16 * bars
    dr, bs, gt, ch, fx = (Track(sec) for _ in range(5))
    prog = ['F', 'F', 'E', 'E', 'B', 'B', 'D', 'D']
    for b in range(bars):
        t0 = b * 16 * step
        nm = prog[b % 8]
        stop = b % 8 == 7 and b >= 8
        drums = b >= 4
        if drums:
            for s in range(0, 16, 2):
                t = t0 + s * step
                if stop and s >= 8:
                    continue
                if s in (0, 8) or (s == 10 and b % 2):
                    dr.add(t, kick(rng, 0.9), 0.95)
                if s in (4, 12):
                    dr.add(t, snare(rng, 210), 0.9)
                dr.add(t, hat(rng, 0.022), 0.4, 0.2)
        if stop:
            for s in (8, 11, 14):
                t = t0 + s * step
                dr.add(t, snare(rng, 210), 1.0)
                gt.add(t, power(rng, hz(nm, oct_of(nm, 2)), step * 2.4, drive=12), 0.95, -0.4)
                gt.add(t + 0.008, power(rng, hz(nm, oct_of(nm, 2)) * 1.001, step * 2.4, drive=12), 0.95, 0.4)
            continue
        f = hz(nm, oct_of(nm, 1) + 1)
        for s in range(0, 16, 2):
            bs.add(t0 + s * step, bass(f, step * 1.8, cut=1100, drive=3.0), 0.9)
        if b >= 8:
            for s in range(0, 16, 8):
                t = t0 + s * step
                gt.add(t, power(rng, hz(nm, oct_of(nm, 2)), step * 7.6, drive=9), 0.62, -0.6)
                gt.add(t + 0.011, power(rng, hz(nm, oct_of(nm, 2)) * 1.0012, step * 7.6, drive=9), 0.62, 0.6)
        if b < 4 or 16 <= b < 24 or b >= 32:
            for s in range(16):
                t = t0 + s * step
                note = hz(nm, oct_of(nm, 4)) * 2 ** ((0, 7, 12, 7)[s % 4] / 12)
                ch.add(t, lead(note, step * 0.82, kind='square', cut=6000, drive=1.3), 0.34, 0.15)
        if 12 <= b < 16 or 24 <= b < 32:
            for s in range(16):
                t = t0 + s * step
                x = amp(string(rng, hz(nm, oct_of(nm, 4)), step * 1.4, 0.985), drive=4.0, high=5200)
                gt.add(t, x, 0.42, 0.1)
    for b in (4, 8, 16, 24, 32):
        fx.add(b * 16 * step, crash(rng), 0.9)
    end = step * 16 * bars
    dr.add(end, kick(rng), 1.0)
    dr.add(end, snare(rng, 210), 0.9)
    gt.add(end, power(rng, hz('F', 2), 3.0, drive=12), 0.9, -0.5)
    gt.add(end + 0.012, power(rng, hz('F', 2) * 1.001, 3.0, drive=12), 0.9, 0.5)
    ch2 = echo(ch.x, step * 3, 0.3, 4000)
    mix = dr.x + bs.x * 0.78 + gt.x * 0.74 + ch2 * 0.55 + fx.x * 0.62
    write(mix, 'b', sec)


def piece_c():
    """C：德式电子摇滚（Motorik）。118 BPM，匀速推进的鼓，琶音贝斯，延音吉他，长线条模拟合成。"""
    rng = np.random.default_rng(1910)
    bpm, bars = 118, 30
    step = 60 / bpm / 4
    sec = step * 16 * bars
    dr, bs, gt, ld, fx = (Track(sec) for _ in range(5))
    kicks = []
    roots = ['F', 'F', 'E', 'E', 'B', 'B', 'D', 'D']
    for b in range(bars):
        t0 = b * 16 * step
        nm = roots[b % 8]
        if b >= 2:
            for s in range(16):
                t = t0 + s * step
                if s in (0, 6, 8, 14):
                    dr.add(t, kick(rng, 0.8), 0.86)
                    kicks.append(t)
                if s in (4, 12):
                    dr.add(t, snare(rng, 170), 0.62)
                if s % 2 == 0:
                    dr.add(t, hat(rng, 0.05 if s % 4 == 2 else 0.02), 0.34, -0.15)
        f = hz(nm, oct_of(nm, 1) + 1)
        for s in range(0, 16):
            n = f * (1, 1, 2, 1, 1.4983, 1, 2, 1.4983)[s % 8]
            cut = 260 + 900 * min(1.0, b / 10) + 500 * np.sin(b * 0.4) ** 2
            bs.add(t0 + s * step, bass(n, step * 0.92, cut=cut, drive=1.8), 0.82)
        if b >= 6:
            pat = (0, 12, 7, 19, 12, 7)
            for i in range(0, 16, 3):
                note = hz(nm, oct_of(nm, 3)) * 2 ** (pat[(i // 3) % 6] / 12)
                x = amp(string(rng, note, step * 5, 0.994), drive=1.5, low=200, high=6000)
                gt.add(t0 + i * step, x, 0.5, 0.35 if i % 2 else -0.35)
        if b >= 14 and b % 2 == 0:
            ld.add(t0, lead(hz(nm, oct_of(nm, 4)), step * 30, wob=4.6, kind='saw', cut=1400 + 170 * (b - 14), drive=2.2), 0.56)
        if b >= 22:
            x = power(rng, hz(nm, oct_of(nm, 2)), step * 15.5, drive=14)
            fx.add(t0, x, 0.5, -0.45)
            fx.add(t0 + 0.012, power(rng, hz(nm, oct_of(nm, 2)) * 1.0012, step * 15.5, drive=14), 0.5, 0.45)
    end = step * 16 * bars
    dr.add(end, kick(rng), 1.0)
    fx.add(end, power(rng, hz('F', 2), 3.0, drive=13), 0.82, 0.0)
    mix = dr.x + pump(bs.x, kicks, 0.28, 0.14) * 0.84 + echo(gt.x, step * 3, 0.42, 3200) * 0.7 + echo(ld.x, step * 6, 0.32) * 0.56 + fx.x * 0.62
    write(mix, 'c', sec)


if __name__ == '__main__':
    piece_a()
    piece_b()
    piece_c()
