# PostgreSQL 一集的配乐小样 R2「数据的秩序」（试听用，约 70 秒）。
# WaterRun 2026-10-26：「配乐也是学术派的, 体现Pg的庞大严谨史诗」；听过赋格小样后：「配乐更体现计算机 数据库海量数据的井井有条 复杂有序的计算机系统」。
# D 小调，112 拍/分，十六分音符的网格。一层层精确的音型叠起来（像一路路数据流按规矩排好），赋格的主题留作上方的旋律（学院派的线索）：
#   1–4 小节 拨弦琶音单独（数据流）→ 5–8 木琴同一音型错开三个十六分音符跟进（卡农）→ 9–12 低音八分音符脉冲（WAL 的心跳）
#   → 13–18 弦乐长和弦，主题在弦乐上 → 19–22 全部合奏，钟声与定音鼓 → 第 23 小节第一拍全体停住（崩溃）
#   → 数据流从一支声部重新建起 → 27–30 各声部依次退出（VACUUM）→ 落在 D 大调。
# 全部由程序合成，不用外部素材；结果确定（随机数固定种子）。用法：python music_sketch.py <输出.wav>
import sys
import wave
import numpy as np

SR = 44100
TAU = 2 * np.pi
BPM = 112
BEAT = 60.0 / BPM
S16 = BEAT / 4
_cache = {}


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, dur, rel):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(a, 1e-4))
    r = np.maximum(t - dur, 0)
    return e * np.where(t < dur, 1.0, np.exp(-r / rel))


# ── 乐器（单声道） ──
def pluck(f, dur):
    n = int(min(dur + 0.8, 2.2) * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for k in range(1, 14):
        if k * f > 11000:
            break
        a = abs(np.sin(np.pi * k * 0.23)) / k ** 0.9
        tau = 0.9 * (220.0 / f) ** 0.25 / (1 + 0.5 * (k - 1))
        y += a * np.sin(TAU * k * f * t + 0.7 * k) * np.exp(-t / tau)
    tail = np.clip((n / SR - t) / 0.12, 0, 1)
    return y * np.minimum(1.0, t / 0.002) * tail


def mallet(f, dur):
    n = int(1.4 * SR); t = np.arange(n) / SR
    k = (440.0 / f) ** 0.4
    y = (np.sin(TAU * f * t) * np.exp(-t / (0.55 * k))
         + 0.38 * np.sin(TAU * 3.93 * f * t) * np.exp(-t / (0.14 * k))
         + 0.12 * np.sin(TAU * 9.2 * f * t) * np.exp(-t / (0.05 * k)))
    return y * np.minimum(1.0, t / 0.002)


def bell(f, dur):
    n = int(3.2 * SR); t = np.arange(n) / SR
    idx = 1.4 * np.exp(-t / 0.5)
    return np.sin(TAU * f * t + idx * np.sin(TAU * 3.5 * f * t)) * np.exp(-t / 1.4) * np.minimum(1.0, t / 0.002)


def sub(f, dur):
    n = int((dur + 0.3) * SR); t = np.arange(n) / SR
    y = np.sin(TAU * f * t) + 0.25 * np.sin(2 * TAU * f * t) + 0.08 * np.sin(3 * TAU * f * t)
    return y * env(n, 0.006, dur, 0.08) * (0.8 + 0.2 * np.exp(-t / 0.15))


def strings(f, dur):
    n = int((dur + 0.9) * SR); t = np.arange(n) / SR
    vib = 1 + 0.0026 * np.sin(TAU * 5.4 * t) * np.minimum(1.0, t / 0.6)
    y = np.zeros(n)
    for cents, ph in ((-6, 0.0), (0, 1.3), (6, 2.6)):
        ff = f * 2 ** (cents / 1200)
        phase = TAU * np.cumsum(ff * vib) / SR + ph
        for k in range(1, int(9000 / ff) + 1):
            y += np.sin(k * phase) / k / (1 + (k * ff / 2400.0) ** 2)
    return y / 3.2 * env(n, 0.22, dur, 0.5)


def timpani(f, dur):
    n = int(2.4 * SR); t = np.arange(n) / SR
    ph = TAU * np.cumsum(f * (1 + 0.04 * np.exp(-t / 0.05))) / SR
    y = np.sin(ph) * np.exp(-t / 1.0) + 0.35 * np.sin(1.5 * ph) * np.exp(-t / 0.3)
    noise = np.random.default_rng(3).standard_normal(n) * np.exp(-t / 0.025)
    return (y + 0.5 * np.convolve(noise, np.ones(40) / 40, mode='same')) * np.minimum(1.0, t / 0.002)


def pad(freqs, dur, seed=1):
    n = int((dur + 1.8) * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(seed)
    y = np.zeros(n)
    for f0 in freqs:
        for cents in (-8, 0, 8):
            f = f0 * 2 ** (cents / 1200); ph = TAU * f * t + rng.uniform(0, TAU)
            for k in range(1, int(3600 / f) + 1):
                y += np.sin(k * ph) / k / (1 + (k * f / 1100.0) ** 4)
    y /= max(1e-9, np.abs(y).max())
    return y * env(n, 0.9, dur, 1.6)


INST = {'pluck': pluck, 'mallet': mallet, 'bell': bell, 'sub': sub, 'strings': strings, 'timpani': timpani}


def note(inst, pitch, dur):
    key = (inst, pitch if not isinstance(pitch, list) else tuple(pitch), round(dur, 3))
    if key not in _cache:
        y = pad([mtof(p) for p in pitch], dur) if inst == 'pad' else INST[inst](mtof(pitch), dur)
        k = min(len(y), int(0.02 * SR)); y = y.copy(); y[-k:] *= np.linspace(1, 0, k)
        _cache[key] = y
    return _cache[key]


class Mix:
    def __init__(self, seconds):
        self.n = int(seconds * SR)
        self.dry = np.zeros((2, self.n)); self.send = np.zeros((2, self.n))

    def add(self, inst, pitch, t, dur, vel, pan=0.0, rev=0.25):
        y = note(inst, pitch, dur) * vel
        i = int(t * SR)
        if i >= self.n:
            return
        y = y[:self.n - i]
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        for ch, g in ((0, gl), (1, gr)):
            self.dry[ch, i:i + len(y)] += g * y
            self.send[ch, i:i + len(y)] += g * y * rev


def impulse(t60=2.4, seed=7):
    L = int(t60 * SR); t = np.arange(L) / SR
    h = np.random.default_rng(seed).standard_normal((2, L)) * np.exp(-6.9 * t / t60)
    c = np.cumsum(h, axis=1); h = (c[:, 14:] - c[:, :-14]) / 14
    h = np.concatenate([np.zeros((2, int(0.02 * SR))), h], axis=1)
    return h / np.sqrt((h ** 2).sum(axis=1, keepdims=True))


def reverb(x, h, block=1 << 16):
    n, L = x.shape[1], h.shape[1]
    size = 1 << int(np.ceil(np.log2(block + L)))
    H = np.fft.rfft(h, size)
    y = np.zeros((2, n + L))
    for s in range(0, n, block):
        seg = x[:, s:s + block]
        Y = np.fft.irfft(np.fft.rfft(seg, size) * H, size)[:, :seg.shape[1] + L - 1]
        y[:, s:s + Y.shape[1]] += Y
    return y[:, :n]


# ── 和声：每小节一个和弦（根音, 和弦音的音级） ──
CHORDS = {'Dm': (2, [2, 5, 9]), 'Bb': (10, [10, 2, 5]), 'F': (5, [5, 9, 0]), 'C': (0, [0, 4, 7]), 'Gm': (7, [7, 10, 2]),
          'A': (9, [9, 1, 4]), 'D': (2, [2, 6, 9])}
BARS = (['Dm', 'Bb', 'F', 'C'] * 2 + ['Gm', 'Dm', 'A', 'A'] + ['Dm', 'Dm', 'A', 'Dm', 'Gm', 'A'] + ['Dm', 'Bb', 'Gm', 'A']
        + ['Dm', 'Bb', 'F', 'C'] + ['Bb', 'A', 'D', 'D', 'D', 'D'])            # 32 小节
SUBJECT = [(62, 2), (69, 1), (65, 1), (64, .5), (62, .5), (61, 1), (62, 1), (64, 1), (65, 1), (67, .5), (65, .5), (64, 1), (62, 1)]
PATTERN = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 1, 0, 1]      # 一小节十六个十六分音符，在四个和弦音上走


def tones(name, lo):
    """从 lo 起往上取这个和弦的四个音：根、三、五、高八度的根。"""
    root, pcs = CHORDS[name]
    out, m = [], lo
    while len(out) < 3:
        if m % 12 in pcs:
            out.append(m)
        m += 1
    return out + [out[0] + 12]


def bar_t(b):
    return b * 4 * BEAT


def compose():
    nb = len(BARS)
    m = Mix(nb * 4 * BEAT + 4.0)
    crash = 22                                                            # 第 23 小节（从 0 数）
    for b, name in enumerate(BARS):
        t0 = bar_t(b); root = CHORDS[name][0]
        restart = b >= crash
        # L1 拨弦琶音：全片都在（崩溃后从这一支重新开始）；VACUUM 段（28 小节起）只剩它，最后两小节也退出
        if b < 30:
            tt = tones(name, 62)
            for i, k in enumerate(PATTERN):
                m.add('pluck', tt[k], t0 + i * S16, S16 * 1.6, 0.30 + (0.06 if i % 4 == 0 else 0), -0.35, 0.2)
        # L2 木琴卡农：同一音型高八度、晚三个十六分音符；第 5 小节进，崩溃后第 25 小节重新进，第 28 小节退出（VACUUM）
        if (4 <= b < crash) or (24 <= b < 28):
            tt = tones(name, 74)
            for i, k in enumerate(PATTERN):
                m.add('mallet', tt[k], t0 + (i + 3) * S16, S16, 0.20, 0.4, 0.25)
        # L3 低音八分音符脉冲：第 9 小节进；崩溃后第 26 小节重新进；第 29 小节退出
        if (8 <= b < crash) or (25 <= b < 29):
            base = 38 + ((root - 2) % 12)
            if base > 45:
                base -= 12
            for i in range(8):
                m.add('sub', base + (12 if i % 4 == 3 else 0), t0 + i * 2 * S16, 2 * S16 * 0.9, 0.42 if i % 2 == 0 else 0.30, 0.0, 0.05)
        # L4 弦乐长和弦：第 13 小节进到崩溃；崩溃后在收尾段回来
        if (12 <= b < crash) or b >= 26:
            r = CHORDS[name][1]
            ch = [m_ for m_ in range(50, 70) if m_ % 12 in r][:4]
            m.add('pad', ch, t0, 4 * BEAT, 0.20 if b < 18 else 0.30, 0.0, 0.45)
        # 高潮：钟声与定音鼓（19–22 小节）
        if 18 <= b < crash:
            m.add('bell', tones(name, 74)[0] + 12, t0, 1.0, 0.16, 0.2, 0.5)
            m.add('timpani', 38 + ((root - 2) % 12) if root != 10 else 46, t0, 1.0, 0.65)
    # 主题：弦乐，上方旋律，第 13 小节起按 1.5 倍时值；高潮再奏一次（高八度，前半）
    b0 = bar_t(12)
    for p, d in SUBJECT:
        m.add('strings', p + 12, b0, d * 1.5 * BEAT * 1.02, 0.30, 0.25, 0.4); b0 += d * 1.5 * BEAT
    b0 = bar_t(18)
    for p, d in SUBJECT[:8]:
        m.add('strings', p + 12, b0, d * 2 * BEAT * 1.02, 0.34, 0.25, 0.4); b0 += d * 2 * BEAT
    # 收尾：D 大调长和弦与一声钟
    m.add('pad', [50, 54, 57, 62, 66, 69], bar_t(28), 4 * 4 * BEAT, 0.42, 0.0, 0.5)
    m.add('bell', 74, bar_t(28), 2.0, 0.18, 0.1, 0.6)
    m.add('sub', 38, bar_t(28), 4 * 4 * BEAT, 0.30, 0.0, 0.1)
    y = m.dry + reverb(m.send, impulse())
    # 崩溃：第 23 小节第一拍整体静音（连混响尾巴一起切断）
    a, b = int(bar_t(crash) * SR), int((bar_t(crash) + BEAT) * SR)
    g = np.ones(y.shape[1]); k = int(0.012 * SR)
    g[a:b] = 0.0; g[a - k:a] = np.linspace(1, 0, k); g[b:b + k] = np.linspace(0, 1, k)
    y *= g
    k1 = int(0.2 * SR); y[:, :k1] *= np.linspace(0, 1, k1)
    k2 = int(3.0 * SR); y[:, -k2:] *= np.linspace(1, 0, k2)
    return y / max(1e-9, np.abs(y).max()) * 0.89


def write_wav(path, y):
    pcm = (np.clip(y.T, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    write_wav(sys.argv[1], compose())
    print('ok', sys.argv[1], 'bars', len(BARS), 'crash at', round(bar_t(22), 2), 's')
