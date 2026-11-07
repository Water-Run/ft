# 审片页的 3 段配乐小样（各约 60 秒：引子、推进、最高处、收束）。只用 numpy 做加法合成，不用任何采样或第三方音频。
# 三个方向都从本片的对象出发，与本系列前几集（MyISAM 的终端电子乐、InnoDB 的「两个事务」、PostgreSQL 的 56 拍沉稳钢琴与大提琴、
# SQLite 的「页的脉冲」）区分开：
#   A「秒级」  124 拍/分，E 小调。十六分音符的拨弦琶音像一路列数据流过，低音八分音符推着走，最高处进底鼓；讲「快」。
#   B「列」    100 拍/分，D 多利亚。八个金属槌音各占一个固定的十六分音符位置，像八列数据，一列一列加进来，再一列一列退出；冷、准、克制。
#   C「合并」  88 拍/分，A 小调落到 C 大调。三条旋律线各奏同一个动机的片段、彼此错开，越来越整齐，最高处合成一条齐奏，一声低沉的重击；
#              讲 MergeTree 的合并，史诗感收着用。
# 用法：python videos/database-engines/clickhouse/tools/music_sketch.py   → 本片 out/audition/music-A.mp3 等（不入库）
import os, subprocess, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(FILM, '..', '..', '..'))
OUT = os.path.join(FILM, 'out', 'audition')
os.makedirs(OUT, exist_ok=True)
SR = 44100
rng = np.random.default_rng(20261107)   # 固定种子

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def adsr(n, a, d, s, r, sus_len=None):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sus_len = n - a - d - r if sus_len is None else int(sus_len * SR)
    sus_len = max(0, sus_len)
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(sus_len, s), np.linspace(s, 0, max(r, 1))])
    return np.pad(e, (0, max(0, n - len(e))))[:n]

def tone(f, dur, parts, decay=None, vib=0.0):
    """加法合成：parts = [(倍频, 振幅)…]；decay = 每个分音的衰减时间（秒），越高的分音衰减越快。"""
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * f * t
    if vib: ph += vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.4)
    y = np.zeros(n)
    for k, (mul, amp) in enumerate(parts):
        if f * mul > 16000: continue
        p = np.sin(ph * mul + rng.uniform(0, 6.28))
        if decay: p *= np.exp(-t / (decay / (1 + 0.6 * k)))
        y += amp * p
    return y

SAW = lambda k=10, roll=1.0: [(i, (1 / i) ** roll) for i in range(1, k + 1)]
ODD = lambda k=9: [(i, 1 / i) for i in range(1, k + 1, 2)]
BELL = [(1, 1.0), (2.76, 0.45), (5.40, 0.22), (8.93, 0.10)]

class Track:
    def __init__(self, seconds): self.L = np.zeros(int(seconds * SR) + SR * 4); self.R = self.L.copy()
    def add(self, t, y, gain=1.0, pan=0.0):
        i = int(t * SR); y = y * gain
        j = min(len(self.L), i + len(y)); y = y[: j - i]
        self.L[i:j] += y * np.sqrt(0.5 * (1 - pan)); self.R[i:j] += y * np.sqrt(0.5 * (1 + pan))

def kick(dur=0.45):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 45 + 75 * np.exp(-t / 0.045)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)

def hat(dur=0.06, bright=1.0):
    n = int(dur * SR); x = rng.standard_normal(n)
    x = np.diff(np.diff(x, prepend=0), prepend=0)
    return x * np.exp(-np.arange(n) / SR / (0.012 * bright)) * 0.25

def boom(dur=3.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 38 + 30 * np.exp(-t / 0.25)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.1)
    noise = rng.standard_normal(n) * np.exp(-t / 0.05) * 0.15
    return y + np.convolve(noise, np.ones(40) / 40, 'same')

def reverb(L, R, wet=0.22, secs=2.4):
    n = int(secs * SR); t = np.arange(n) / SR
    out = []
    for ch, seed in ((L, 1), (R, 2)):
        ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-t / (secs / 6.0))
        ir = np.convolve(ir, np.ones(8) / 8, 'same'); ir /= np.sqrt(np.sum(ir ** 2))
        size = 1 << int(np.ceil(np.log2(len(ch) + n)))
        w = np.fft.irfft(np.fft.rfft(ch, size) * np.fft.rfft(ir, size), size)[: len(ch)]
        out.append(ch * (1 - wet) + w * wet)
    return out

def finish(tr, name, seconds):
    L, R = reverb(tr.L, tr.R)
    n = int(seconds * SR); L, R = L[:n], R[:n]
    fade = int(2.5 * SR); ramp = np.linspace(1, 0, fade)
    L[-fade:] *= ramp; R[-fade:] *= ramp
    peak = max(np.abs(L).max(), np.abs(R).max()); L, R = L / peak * 0.89, R / peak * 0.89
    pcm = (np.stack([L, R], 1) * 32767).astype('<i2')
    wav = os.path.join(OUT, name + '.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    ff = os.path.join(REPO, 'assets', 'ffmpeg', 'bin', 'ffmpeg.exe')
    ff = ff if os.path.exists(ff) else 'ffmpeg'
    subprocess.run([ff, '-y', '-loglevel', 'error', '-i', wav, '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '192k', os.path.join(OUT, name + '.mp3')], check=True)
    os.remove(wav)
    print(name, 'ok')

# ── A「秒级」 ──
def music_a():
    bpm = 124; b = 60 / bpm; bar = 4 * b; bars = 31; tr = Track(bars * bar)
    prog = [(52, [64, 67, 71, 74]), (48, [64, 67, 71, 72]), (55, [62, 67, 71, 74]), (54, [62, 66, 69, 74])]   # Em9 → Cmaj7 → G → D/F#
    for k in range(bars):
        t0 = k * bar; root, ch = prog[(k // 2) % 4]
        sec = 0 if k < 8 else 1 if k < 16 else 2 if k < 26 else 3
        bright = [3, 5, 8, 4][sec]
        if k % 2 == 0:
            for m in ch: tr.add(t0, tone(hz(m), 2 * bar, SAW(6, 1.6)) * adsr(int(2 * bar * SR), 0.6, 0.5, 0.7, 0.9), 0.05, rng.uniform(-0.4, 0.4))
        arp = [ch[0], ch[1], ch[2], ch[3], ch[2] + 12, ch[1], ch[2], ch[3] - 12 + 12]
        for s in range(16):
            m = arp[s % 8] + (12 if sec == 2 and s % 4 == 3 else 0)
            tr.add(t0 + s * b / 4, tone(hz(m), 0.5, SAW(bright, 1.2), decay=0.35), 0.10 * (1.0 if s % 4 == 0 else 0.7), -0.3 + 0.6 * (s % 2))
        if sec >= 1:
            for e in range(8):
                tr.add(t0 + e * b / 2, tone(hz(root - 12), b / 2 * 0.9, SAW(5, 1.4), decay=0.5) * adsr(int(b / 2 * 0.9 * SR), 0.005, 0.1, 0.8, 0.05), 0.22)
            for s in range(16): tr.add(t0 + s * b / 4, hat(0.05 if s % 2 else 0.09), 0.5 if s % 4 == 2 else 0.25, 0.25)
        if sec == 2:
            for q in range(4): tr.add(t0 + q * b, kick(), 0.55)
            if k % 2 == 1:
                for j, m in enumerate([76, 74, 71, 74]): tr.add(t0 + j * b, tone(hz(m), b * 0.95, ODD(7), vib=0.004) * adsr(int(b * 0.95 * SR), 0.02, 0.2, 0.6, 0.2), 0.06, 0.1)
    finish(tr, 'music-A', bars * bar + 1.5)

# ── B「列」 ──
def music_b():
    bpm = 100; b = 60 / bpm; bar = 4 * b; bars = 25; tr = Track(bars * bar)
    cols = [(62, 0), (69, 3), (65, 6), (72, 8), (67, 10), (74, 13), (60, 14), (77, 5)]   # 八列：音高与在一小节里的十六分音符位置
    for k in range(bars):
        t0 = k * bar
        tr.add(t0, tone(hz(38), bar, [(1, 1), (2, 0.3), (3, 0.1)]) * adsr(int(bar * SR), 0.3, 0.2, 0.9, 0.4), 0.10)
        if k % 2 == 0: tr.add(t0, tone(hz(45), 2 * bar, [(1, 1), (2, 0.2)]) * adsr(int(2 * bar * SR), 1.0, 0.5, 0.8, 0.8), 0.05, 0.3)
        active = min(8, k + 1) if k < 17 else max(0, 8 - (k - 16))
        for i, (m, pos) in enumerate(cols[:active]):
            for rep in (0, 1) if i < 4 else (0,):
                tr.add(t0 + (pos + rep * 16 * 0) * b / 4 + rep * bar / 2 * (i < 4), tone(hz(m), 1.2, BELL, decay=0.9), 0.11, -0.7 + 1.4 * i / 7)
        for s in range(16): tr.add(t0 + s * b / 4, hat(0.02, 0.5), 0.12 if s % 4 else 0.2, -0.2)
        if 9 <= k < 17:
            for q in range(4): tr.add(t0 + q * b, tone(hz(26), b * 0.8, [(1, 1), (2, 0.4)]) * adsr(int(b * 0.8 * SR), 0.01, 0.2, 0.5, 0.2), 0.28)
            if k % 2 == 1:
                for m in (62, 65, 69, 72, 76): tr.add(t0, tone(hz(m), 2 * bar, SAW(5, 1.8)) * adsr(int(2 * bar * SR), 0.8, 0.4, 0.6, 1.0), 0.035, rng.uniform(-0.5, 0.5))
    finish(tr, 'music-B', bars * bar + 1.5)

# ── C「合并」 ──
def music_c():
    bpm = 88; b = 60 / bpm; bar = 4 * b; bars = 22; tr = Track(bars * bar)
    motif = [(0, 69, 1), (1, 72, 0.5), (1.5, 71, 0.5), (2, 69, 1), (3, 76, 1)]          # 拍位、音高、拍长
    chords = [[45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62], [40, 55, 59, 64]]    # Am → F → G → Em
    for k in range(bars):
        t0 = k * bar; ch = chords[k % 4] if k < 18 else [36, 55, 60, 64]
        for m in ch[1:]: tr.add(t0, tone(hz(m), bar * 1.1, SAW(7, 1.5)) * adsr(int(bar * 1.1 * SR), 0.5, 0.3, 0.7, 0.6), 0.04 + 0.03 * (12 <= k < 18), rng.uniform(-0.5, 0.5))
        tr.add(t0, tone(hz(ch[0]), bar, SAW(8, 1.2)) * adsr(int(bar * SR), 0.2, 0.3, 0.7, 0.5), 0.10)
        if k >= 18: continue
        stage = 0 if k < 6 else 1 if k < 12 else 2
        lines = [(12, ODD(5), 0.07, 0.4, 0.0), (0, ODD(9), 0.08, -0.4, 0.004), (-12, SAW(9, 1.1), 0.09, 0.0, 0.003)]
        for li, (oct_, parts, g, pan, vib) in enumerate(lines):
            if stage == 0 and li > 0 and k < 2 * li: continue
            off = [0.0, 1.5, 2.5][li] * (1 - stage / 2) if stage < 2 else 0.0          # 三条线先错开，越往后越齐
            frag = motif if stage == 2 else motif[li % 2::2] if stage == 0 else motif[:3 + li % 2]
            for beat, m, ln in frag:
                at = t0 + ((beat + off) % 4) * b
                tr.add(at, tone(hz(m + oct_), ln * b * 1.05, parts, vib=vib) * adsr(int(ln * b * 1.05 * SR), 0.03, 0.15, 0.75, 0.2), g * (1.25 if stage == 2 else 1), pan)
        if k == 12: tr.add(t0, boom(), 0.7)
    tr.add(18 * bar, boom(4.0), 0.45)
    finish(tr, 'music-C', bars * bar + 2.0)

music_a(); music_b(); music_c()
