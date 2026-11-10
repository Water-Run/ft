#!/usr/bin/env python3
"""审片页的三段配乐小样（各 60 秒），程序合成，固定种子。写出 WAV，由 audition.js 转 MP3。

用法：python tools/music_sketch.py <输出目录>
A 一档档变粗：电钢琴与拨弦，音色按 16→8→4→3→1 位逐段被真的量化，最后干净的和弦回来。
B 刻度：两台马林巴反复同一短句，一个 12 步、一个 16 步，错开又对齐；木质刻度声贯穿。
C 毛毡钢琴：半速的琴与低音弦，最安静的一版。
制作者听不到声音：这里只能保证电平与结构，听感由人确认。
"""
import os
import sys
import wave

import numpy as np

SR = 44100
LEN = 60.0
STEP = 0.25            # 全片节拍网格；120 拍/分的八分音符
N = int(SR * LEN)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
rng = np.random.default_rng(20261109)


def env(n, a, d, s=0.0, r=0.05):
    """ADSR；时间单位秒，n 为总采样数"""
    t = np.arange(n) / SR
    y = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = int(r * SR)
    if rel and rel < n:
        y[-rel:] *= np.linspace(1, 0, rel)
    return y


def put(buf, at, x, gain=1.0, pan=0.0):
    i = int(at * SR)
    x = x[: max(0, buf.shape[1] - i)]
    if len(x) == 0:
        return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(x)] += x * gain * l
    buf[1, i:i + len(x)] += x * gain * r


def lowpass(x, fc):
    X = np.fft.rfft(x, axis=-1)
    f = np.fft.rfftfreq(x.shape[-1], 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), n=x.shape[-1], axis=-1)


def reverb(x, t60=2.2, wet=0.25, seed=7):
    n = int(SR * t60)
    r = np.random.default_rng(seed)
    t = np.arange(n) / SR
    ir = np.stack([r.standard_normal(n), r.standard_normal(n)]) * 10 ** (-3 * t / t60)
    ir = lowpass(ir, 5200)
    ir /= np.sqrt((ir ** 2).sum(axis=-1, keepdims=True))
    size = x.shape[1] + n
    w = np.fft.irfft(np.fft.rfft(x, size, axis=-1) * np.fft.rfft(ir, size, axis=-1), size, axis=-1)[:, :x.shape[1]]
    return x + wet * w


def crush(x, bits, hold=1):
    """真的把信号量化：bits 位、每 hold 个采样取一次"""
    y = x.copy()
    if hold > 1:
        idx = (np.arange(x.shape[1]) // hold) * hold
        y = y[:, idx]
    q = 2 ** (bits - 1)
    return np.round(y * q) / q


def additive(f, dur, partials, inharm=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for k, (amp, decay) in enumerate(partials, 1):
        fk = f * k * np.sqrt(1 + inharm * k * k)
        if fk > SR * 0.45:
            break
        y += amp * np.sin(2 * np.pi * fk * t) * np.exp(-t / decay)
    return y


def epiano(f, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    mod = 1.1 * np.exp(-t / 0.5) * np.sin(2 * np.pi * f * 2 * t)
    return np.sin(2 * np.pi * f * t + mod) * env(n, 0.006, 1.1, 0.2, 0.2)


def marimba(f, dur=0.7):
    return additive(f, dur, [(1, 0.28), (0, 1), (0, 1), (0.45, 0.07), (0, 1), (0, 1), (0, 1), (0, 1), (0.14, 0.03)]) * env(int(dur * SR), 0.002, 9, 1, 0.02)


def felt(f, dur=3.0):
    p = [(1 / k ** 1.5, 2.4 / k ** 0.8) for k in range(1, 9)]
    return additive(f, dur, p, 0.0003) * env(int(dur * SR), 0.016, 9, 1, 0.3)


def bowed(f, dur, bright=900):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * np.sin(2 * np.pi * 5.1 * t))) / k for k in range(1, 12) if f * k < SR * 0.4)
    y = y * env(n, 0.5, 9, 1, 0.8)
    return lowpass(y, bright)


def tick(freq=2300, dur=0.03):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.5 * rng.standard_normal(n)) * np.exp(-t / 0.006)


def kick(dur=0.25):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * (46 * t + 60 * 0.03 * (1 - np.exp(-t / 0.03)))) * np.exp(-t / 0.09)


def sect(t, a, b):
    return a <= t < b


def direction_a():
    """一档档变粗。D 小调，Dm9 Bbmaj7 Gm9 Asus，每个和弦 4 秒。"""
    chords = [(38, [62, 65, 69, 72, 76]), (34, [58, 62, 65, 69, 72]), (31, [58, 62, 65, 69, 74]), (33, [57, 62, 64, 69, 74])]
    music = np.zeros((2, N))
    low = np.zeros((2, N))
    arp = [0, 2, 4, 3, 1, 3, 2, 4]
    for bar in range(int(LEN / 4)):
        t0 = bar * 4.0
        root, tones = chords[bar % 4]
        if t0 >= 56:
            continue
        for k, m in enumerate(tones[:4]):
            put(music, t0 + k * 0.012, epiano(hz(m), 3.9), 0.10)
        put(low, t0, bowed(hz(root), 3.95, 260), 0.17)
        for s in range(16):
            t = t0 + s * STEP
            if s % 2 == 1 and t < 12:
                continue
            m = tones[arp[s % 8]] + (12 if s % 8 in (2, 5) else 0)
            put(music, t, epiano(hz(m), 0.5), 0.085, 0.45 * np.sin(s * 1.3))
    # 逐段真的量化
    segs = [(0, 12, None), (12, 24, (8, 1)), (24, 36, (5, 1)), (36, 48, (3, 2)), (48, 55, (1.5, 7))]
    out = np.zeros_like(music)
    fade = int(0.04 * SR)
    for a, b, c in segs:
        y = music if c is None else crush(music * (0.9 if c[0] < 3 else 1), *c) * (0.6 if c[0] < 3 else 1)
        w = np.zeros(N)
        ia, ib = int(a * SR), int(b * SR)
        w[ia:ib] = 1
        w[ia:ia + fade] = np.linspace(0, 1, fade)
        w[ib - fade:ib] = np.linspace(1, 0, fade)
        out += y * w
    for s in range(int(LEN / STEP)):
        t = s * STEP
        if t >= 54:
            break
        if t >= 12 and s % 8 == 0:
            put(out, t, kick(), 0.42)
        if s % 2 == 0 or t >= 24:
            put(out, t, tick(5200, 0.02), 0.05 if s % 4 else 0.09, 0.3 * ((s % 2) * 2 - 1))
    # 干净的和弦回来
    for k, m in enumerate([50, 62, 69, 72, 76, 81]):
        put(out, 55.5 + k * 0.02, epiano(hz(m), 4.4) * np.linspace(1, 0.4, int(4.4 * SR)), 0.14)
    return reverb(out + low, 1.6, 0.22)


def direction_b():
    """刻度。A 小调五声；马林巴 12 步对 16 步。"""
    out = np.zeros((2, N))
    pat = [69, 72, 76, 74, 72, 69, 67, 69, 72, 64, 67, 72]
    pat2 = [57, 64, 60, 67, 64, 69, 60, 64, 67, 62, 64, 57, 60, 67, 69, 64]
    roots = [33, 29, 36, 31]
    for s in range(int(LEN / STEP)):
        t = s * STEP
        if t >= 56:
            break
        acc = (s % 4 == 0)
        put(out, t, tick(2300 if acc else 3400, 0.03), 0.17 if acc else 0.08)
        if t >= 2:
            put(out, t, marimba(hz(pat[s % 12])), 0.30 if acc else 0.2, -0.5)
        if t >= 14:
            put(out, t, marimba(hz(pat2[s % 16])), 0.22, 0.5)
        if 30 <= t < 50 and s % 8 == 4:
            put(out, t, marimba(hz(pat[(s // 3) % 12] + 12), 1.0), 0.18)
        if s % 16 == 0 and 8 <= t < 54:
            put(out, t, kick(0.3), 0.3)
    for k in range(int(LEN / 8)):
        t0 = k * 8.0
        if 4 <= t0 < 56:
            put(out, t0, bowed(hz(roots[k % 4]), 7.9, 420), 0.17)
            if t0 >= 24:
                for m in (roots[k % 4] + 24, roots[k % 4] + 31):
                    put(out, t0, bowed(hz(m), 7.9, 1700), 0.035, 0.4 if m % 2 else -0.4)
    put(out, 56, marimba(hz(57), 1.5) * np.linspace(1, 0.5, int(1.5 * SR)), 0.3)
    return reverb(out, 1.0, 0.12, 11)


def direction_c():
    """毛毡钢琴。E 小调，半速。"""
    out = np.zeros((2, N))
    chords = [(40, [55, 59, 62, 66]), (36, [55, 59, 64, 67]), (33, [52, 57, 60, 64]), (35, [54, 59, 61, 64])]
    motif = [76, 74, 71, 69, 71, 67, 66, 64]
    for bar in range(14):
        t0 = bar * 4.0
        root, tones = chords[bar % 4]
        put(out, t0, felt(hz(root), 3.9), 0.34)
        for k, m in enumerate(tones):
            put(out, t0 + 0.5 + k * 0.5, felt(hz(m), 3.0), 0.16, 0.25 * np.sin(k * 2.1))
        if 8 <= t0 < 52:
            step = bar % 8
            for i in range(4):
                put(out, t0 + i * 1.0, felt(hz(motif[(step + i) % 8]), 2.4), 0.20 + (0.05 if t0 >= 24 else 0), 0.15)
        if t0 >= 16:
            put(out, t0, bowed(hz(root + 12), 3.98, 700), 0.09)
        if 32 <= t0 < 48:
            for i in range(8):
                put(out, t0 + i * 0.5, felt(hz(tones[i % 4] + 12), 1.2), 0.06 + 0.02 * (i % 2), -0.3)
    put(out, 56, felt(hz(40), 4.0) * np.linspace(1, 0.3, int(4.0 * SR)), 0.34)
    put(out, 56.06, felt(hz(64), 4.0) * np.linspace(1, 0.3, int(4.0 * SR)), 0.14)
    return reverb(out, 2.8, 0.3, 23)


def finish(x):
    x = x - x.mean(axis=1, keepdims=True)
    fade = np.ones(N)
    fade[:int(0.02 * SR)] = np.linspace(0, 1, int(0.02 * SR))
    fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR))
    x = x * fade
    x = np.tanh(x * 1.1) / np.tanh(1.1)
    return x / (np.abs(x).max() + 1e-9) * 0.89


def write(path, x):
    pcm = (x.T * 32767).astype(np.int16)
    with wave.open(path, "wb") as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(pcm.tobytes())


if __name__ == "__main__":
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for name, fn in (("a", direction_a), ("b", direction_b), ("c", direction_c)):
        x = finish(fn())
        write(os.path.join(out, f"music-{name}.wav"), x)
        segs = [np.sqrt((x[:, int(a * SR):int((a + 12) * SR)] ** 2).mean()) for a in range(0, 60, 12)]
        print(name, "RMS 各 12 秒段:", " ".join(f"{20 * np.log10(s + 1e-9):6.1f}" for s in segs), "dB")
