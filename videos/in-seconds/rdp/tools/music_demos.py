"""审片页的三段配乐小样（各约 24 秒）。选定一个方向后，按它改写 tools/music.py 的 compose(ctx)，配全片。

三个方向都取 Windows 自己的年代感，旋律与和声为本片原创，不引用任何系统提示音：
  A 开机   76 拍  降 E 利底亚：长铺底 + FM 钟琴上行琶音 + 轻沙锤，温暖、开阔（NT / 2000 年代的「开机」气质）
  B Metro  112 拍 A 大调：切分的短促方波拨弦 + 干净的底鼓与拍手 + 低音，利落、扁平（Windows 8 / 10 的磁贴气质）
  C 九八   100 拍 F 大调：FM 电钢七和弦下行 + 行走低音 + 鼓机 + 方波小旋律（Win9x 时代 MIDI 伴奏的气质）

用法（仓库根目录）：python -I videos/in-seconds/rdp/tools/music_demos.py
产物：videos/in-seconds/rdp/out/audition/music/{A,B,C}.wav（不入库）。制作者听不到声音，这里只打印电平数值。
"""
import os, wave
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'out', 'audition', 'music')
os.makedirs(OUT, exist_ok=True)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
rng = np.random.default_rng(1998)


def tt(d):
    return np.arange(int(d * SR)) / SR


def env(t, a, d, s=0.0, r=None, dur=None):
    """简单的 ADSR：a 起音、d 衰减到 s；dur 之后用 r 释放。"""
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    if dur is not None and r:
        e = e * np.where(t > dur, np.exp(-(t - dur) / r), 1.0)
    return e


class Track:
    def __init__(self, seconds):
        self.n = int(seconds * SR)
        self.buf = np.zeros((2, self.n))

    def put(self, sig, t0, g=1.0, pan=0.0):
        i = int(round(t0 * SR))
        if i >= self.n:
            return
        j = min(self.n, i + len(sig))
        self.buf[0, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 - pan))
        self.buf[1, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 + pan))

    def finish(self, path, fade_in=0.05, fade_out=2.5):
        x = self.buf
        n = x.shape[1]
        fi = np.minimum(1, np.arange(n) / (fade_in * SR))
        fo = np.minimum(1, (n - np.arange(n)) / (fade_out * SR))
        x = x * fi * fo
        rms = np.sqrt(np.mean(x ** 2)) + 1e-12
        x = x * (10 ** (-18 / 20) / rms)                      # 统一到约 −18 dBFS RMS
        pk = np.abs(x).max()
        if pk > 0.89:
            x = np.tanh(x / 0.89 * 1.2) / np.tanh(1.2) * 0.89   # 软限幅
        with wave.open(path, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(x.T, -1, 1) * 32767).astype('<i2').tobytes())
        r = 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
        p = 20 * np.log10(np.abs(x).max() + 1e-12)
        print(f'{os.path.basename(path)}: {n / SR:.1f} s  RMS {r:.1f} dBFS  峰值 {p:.1f} dBFS')


# ── 音色 ──
def fm_bell(f, d=2.4):
    t = tt(d)
    idx = 2.2 * np.exp(-t / 0.5)
    return np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 3.5 * t)) * env(t, 0.003, 0.9)


def pad(fs, d, bright=0.25):
    t = tt(d)
    x = np.zeros_like(t)
    for k, f in enumerate(fs):
        for det in (-0.12, 0.0, 0.12):                       # 三个微失谐的声部
            ff = f * 2 ** (det / 12)
            ph = rng.uniform(0, 2 * np.pi)
            x += np.sin(2 * np.pi * ff * t + ph) + bright * np.sin(2 * np.pi * 2 * ff * t + ph) / 2
    x /= (len(fs) * 3)
    a = np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.0)
    return x * np.clip(a, 0, 1)


def sub(f, d):
    t = tt(d)
    return np.sin(2 * np.pi * f * t) * env(t, 0.01, 0.6, 0.55, 0.15, d - 0.15)


def kick(level=1.0):
    t = tt(0.3)
    f = 48 + 80 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * level


def noise_hit(d, tone_hp=2, decay=0.03):
    t = tt(d)
    x = rng.standard_normal(len(t))
    for _ in range(tone_hp):
        x = np.diff(x, prepend=0)
    x /= np.abs(x).max() + 1e-9
    return x * np.exp(-t / decay)


def clap():
    t = tt(0.25)
    x = np.zeros_like(t)
    for k, o in enumerate((0.0, 0.011, 0.022)):
        i = int(o * SR)
        nb = noise_hit(0.25 - o, 1, 0.012 if k < 2 else 0.06)
        x[i:i + len(nb)] += nb[: len(x) - i]
    return x * 0.6


def square_pluck(f, d=0.22, bright=4):
    t = tt(d)
    x = np.zeros_like(t)
    for k in range(1, bright * 2, 2):                        # 加法合成的方波，奇次谐波
        if f * k > SR / 2.5:
            break
        x += np.sin(2 * np.pi * f * k * t) / k
    return x * env(t, 0.002, 0.07)


def fm_epiano(f, d=1.6):
    t = tt(d)
    idx = 1.8 * np.exp(-t / 0.25)
    tine = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    bark = 0.25 * np.sin(2 * np.pi * f * 14 * t) * np.exp(-t / 0.02)
    return (tine + bark) * env(t, 0.004, 0.9, 0.0, 0.2, d - 0.2)


def snare():
    t = tt(0.22)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.5
    return body + noise_hit(0.22, 1, 0.07) * 0.7


# ── A 开机 ──
def demo_a():
    bpm = 76; beat = 60 / bpm; bar = 4 * beat
    chords = [  # 降 E 利底亚：Ebmaj9 – Cm9 – Abmaj7(#11) – Bbsus4
        (51, [63, 67, 70, 74, 77]), (48, [63, 67, 70, 74]), (44, [60, 63, 67, 69]), (46, [63, 65, 70, 72])]
    T = Track(8 * bar + 2.0)
    motif = [0, 2, 4, 3, 1, 4, 2, 4]                        # 钟琴在和弦音上的上行琶音，每小节一句
    for b in range(8):
        root, tones = chords[b % 4]
        t0 = b * bar
        T.put(pad([hz(m) for m in tones], bar + 1.2, 0.2), t0, 0.4, -0.85); T.put(pad([hz(m) for m in tones], bar + 1.2, 0.2), t0, 0.4, 0.85)
        T.put(sub(hz(root - 12), bar), t0, 0.5)
        if b >= 1:
            for k, ix in enumerate(motif):
                if b < 2 and k % 2:
                    continue
                T.put(fm_bell(hz(tones[ix % len(tones)] + 12)), t0 + k * beat / 2, 0.16, pan=-0.4 + 0.1 * k)
        if b >= 2:
            for k in range(8):                                # 轻沙锤
                T.put(noise_hit(0.06, 2, 0.015), t0 + k * beat / 2 + (0.02 if k % 2 else 0), 0.025 if k % 2 else 0.015, 0.3)
        if b >= 4:
            T.put(kick(0.5), t0, 0.5); T.put(kick(0.4), t0 + 2.5 * beat, 0.4)
    T.put(fm_bell(hz(75 + 12), 3.5), 8 * bar, 0.2)             # 收尾一声
    T.put(pad([hz(m) for m in chords[0][1]], 2.0), 8 * bar, 0.4)
    T.finish(os.path.join(OUT, 'A.wav'), fade_out=1.5)


# ── B Metro ──
def demo_b():
    bpm = 112; beat = 60 / bpm; bar = 4 * beat
    chords = [(45, [69, 73, 76]), (42, [66, 69, 73]), (38, [62, 66, 69]), (40, [64, 68, 71])]  # A – F#m – D – E
    rhythm = [0, 0.75, 1.5, 2, 2.75, 3.5]                     # 切分
    T = Track(11 * bar + 1.5)
    for b in range(11):
        root, tones = chords[b % 4]
        t0 = b * bar
        for k, r in enumerate(rhythm):
            m = tones[k % 3] + (12 if k == 4 else 0)
            T.put(square_pluck(hz(m)), t0 + r * beat, 0.22, pan=0.25 if k % 2 else -0.25)
        if b >= 2:
            for q in range(4):
                if q in (0, 2):
                    T.put(kick(0.9), t0 + q * beat, 0.9)
                else:
                    T.put(clap(), t0 + q * beat, 0.35, 0.1)
            for e in range(8):
                T.put(noise_hit(0.04, 2, 0.008), t0 + e * beat / 2, 0.06 if e % 2 else 0.03, 0.35)
        if b >= 1:
            for q in (0, 1.5, 2.5, 3):
                T.put(sub(hz(root - 12), beat * 0.45), t0 + q * beat, 0.6)
        if b >= 4:
            T.put(pad([hz(m + 12) for m in tones], bar, 0.4), t0, 0.13, -0.8); T.put(pad([hz(m + 12) for m in tones], bar, 0.4), t0, 0.13, 0.8)
    T.put(square_pluck(hz(81), 0.6), 11 * bar, 0.3)
    T.finish(os.path.join(OUT, 'B.wav'), fade_out=1.2)


# ── C 九八 ──
def demo_c():
    bpm = 100; beat = 60 / bpm; bar = 4 * beat
    chords = [  # Fmaj7 – Em7 – Dm7 – Cmaj7，下行
        (41, [64, 65, 69, 72]), (40, [62, 64, 67, 71]), (38, [60, 62, 65, 69]), (36, [59, 60, 64, 67])]
    walk = [[0, 4, 7, 9], [0, 3, 7, 5], [0, 3, 7, 10], [0, 4, 7, 2]]
    melody = [(0, 77, 1), (1.5, 76, 0.5), (2, 72, 1), (3, 74, 1)]   # 小旋律（拍、音、时值）
    T = Track(10 * bar + 1.5)
    for b in range(10):
        root, tones = chords[b % 4]
        t0 = b * bar
        for hit in (0, 1.5, 2.5):                              # 电钢的和弦节奏
            for m in tones:
                T.put(fm_epiano(hz(m), beat * (1.4 if hit == 0 else 0.9)), t0 + hit * beat, 0.12, pan=-0.2)
        if b >= 1:
            for q, iv in enumerate(walk[b % 4]):
                T.put(sub(hz(root - 12 + iv), beat * 0.9) + 0.15 * square_pluck(hz(root + iv), beat * 0.9, 2),
                      t0 + q * beat, 0.55)
        if b >= 2:
            for q in range(4):
                T.put(kick(0.8), t0 + q * beat, 0.8) if q in (0, 2) else T.put(snare(), t0 + q * beat, 0.32, 0.1)
            for e in range(8):
                T.put(noise_hit(0.05, 2, 0.01), t0 + e * beat / 2 + (0.03 if e % 2 else 0), 0.045, 0.3)
        if b >= 4 and b % 2 == 0:
            for (q, m, dur) in melody:
                T.put(square_pluck(hz(m), beat * dur, 4) * 0.9, t0 + q * beat, 0.2, pan=0.3)
    for m in chords[0][1]:
        T.put(fm_epiano(hz(m), 2.5), 10 * bar, 0.14)
    T.finish(os.path.join(OUT, 'C.wav'), fade_out=1.2)


demo_a(); demo_b(); demo_c()
