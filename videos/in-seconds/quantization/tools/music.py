#!/usr/bin/env python3
"""「色带」的配乐：刻度（方向 B，策划者 2026-11-10 选定）。
两台马林巴反复同一短句，一个 12 步、一个 16 步，错开又对齐（每 12 秒对齐一次）；木质的刻度声贯穿全片；
低音弦在每 8 秒换一个根音；换到「一模一样」那一刻留一拍静默，再由一个音效强调结果；片尾只剩一个收束的音。
由 kit/tools/mix.py 调用（project.json 的 audio.music 写成 "tools/music.py"）：compose(ctx) 返回 (2, N) 的数组，
电平与旁白压低仍由 mix.py 统一处理。确定性：随机数固定种子。
  ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio, lang }
段落位置全部从 ctx 取，不写死秒数。听感由人确认；出片前看 audio.js 的数值自检。
"""
import numpy as np

SR = 44100
STEP = 0.25                                     # 八分音符的网格；120 拍/分
FADE = (0.3, 2.5)                               # 开头几乎不淡入（画面一开始就有声），结尾收口
rng = np.random.default_rng(20261110)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

PAT12 = [69, 72, 76, 74, 72, 69, 67, 69, 72, 64, 67, 72]     # A 小调五声，12 步
PAT16 = [57, 64, 60, 67, 64, 69, 60, 64, 67, 62, 64, 57, 60, 67, 69, 64]   # 16 步
ROOTS = [33, 29, 36, 31]                         # 低音弦的根音，每 8 秒换一个

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


def marimba(f, dur=0.7):
    return additive(f, dur, [(1, 0.28), (0, 1), (0, 1), (0.45, 0.07), (0, 1), (0, 1), (0, 1), (0, 1), (0.14, 0.03)]) * env(int(dur * SR), 0.002, 9, 1, 0.02)


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




def in_span(t, span):
    return span[0] <= t < span[1]


def compose(ctx):
    global SR, rng
    SR = ctx["sr"]
    N, total = ctx["n"], ctx["total"]
    S = {s["id"]: s for s in ctx["scenes"]}
    C = {c["id"]: c for c in ctx["cues"]}
    t_what, t_how = S["what"]["start"], S["how"]["start"]
    t_cost, t_test = S["cost"]["start"], S["test"]["start"]
    t_close, t_outro = S["close"]["start"], S["outro"]["start"]
    quiet = (C["c2"]["start"] - 0.1, C["c2"]["start"] + 0.9)   # 「一模一样」前后留一拍静默
    out = np.zeros((2, N))

    for s in range(int(total / STEP)):
        t = s * STEP
        if t >= t_outro:
            break
        acc = (s % 4 == 0)
        put(out, t, tick(2300 if acc else 3400, 0.03), 0.12 if acc else 0.06)     # 木质的刻度声，全片
        if t >= 0.5 and not in_span(t, quiet):                                   # 开场就有一条很轻的马林巴，进入「它是什么」再加重
            g = (0.14 if acc else 0.10) if t < t_what else (0.30 if acc else 0.20)
            put(out, t, marimba(hz(PAT12[s % 12])), g, -0.5)
        if t >= t_how + 0.2 and not in_span(t, quiet):
            put(out, t, marimba(hz(PAT16[s % 16])), 0.22, 0.5)
        if t_test + 2 <= t < t_close and s % 8 == 4:                             # 测试段：高八度的一句，给画面加一层
            put(out, t, marimba(hz(PAT12[(s // 3) % 12] + 12), 1.0), 0.16)

    # 低音弦：从成本段开始，每 8 秒一个根音，直到收尾
    k = 0
    t0 = t_cost
    while t0 < t_close:
        put(out, t0, bowed(hz(ROOTS[k % 4]), 7.9, 420), 0.17)
        if t0 >= t_test:
            for m in (ROOTS[k % 4] + 24, ROOTS[k % 4] + 31):
                put(out, t0, bowed(hz(m), 7.9, 1700), 0.03, 0.4 if m % 2 else -0.4)
        k += 1
        t0 += 8.0

    # 片尾：一个收束的音，然后只留低音弦慢慢散去
    put(out, t_outro, marimba(hz(62), 2.0) * np.linspace(1, 0.6, int(2.0 * SR)), 0.28)
    put(out, t_outro + 0.4, marimba(hz(57), 2.0) * np.linspace(1, 0.5, int(2.0 * SR)), 0.20, 0.3)
    put(out, t_outro, bowed(hz(ROOTS[0]), 7.5, 380), 0.14)
    return out
