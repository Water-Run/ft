# PostgreSQL 一集的配乐小样 R3「沉稳」（试听用，约两分钟）。R2「数据的秩序」见提交 e3f8a3e。
# WaterRun 2026-10-26：「配乐也是学术派的, 体现Pg的庞大严谨史诗」→「配乐更体现计算机 数据库海量数据的井井有条 复杂有序的计算机系统」
#   → 听过 R2：「BGM节奏太快 太吵杂 没有体现Pg的沉稳 节奏和前两期差不多」。
# 所以 R3 慢下来、空下来：56 拍/分（前两集用过 66 与 76、84、100，R2 是 112），每小节一个和弦，同时最多四层；
# 秩序靠一支始终不变的八分音符音型（柔音钢琴，中音区），而不是密集的十六分音符；音色都去掉刺耳的高次泛音，不用钟、定音鼓、崩溃。
#   1–2 小节 低音与长和弦 → 3–6 柔音钢琴音型进来，从此不变 → 7–12 大提琴低声奏出赋格主题（时值放大一倍）
#   → 13–18 小提琴高八度回答，钢片琴偶尔点几个音 → 19–20 渐强到属和弦 → 第 21 小节只剩长和弦与低音（一口气）
#   → 22–24 主题开头在高低八度上齐奏 → 第 25 小节落在 D 大调，各层依次退出。
# 全部由程序合成，不用外部素材；结果确定（随机数固定种子）。用法：python music_sketch.py <输出.wav>
import sys
import wave
import numpy as np

SR = 44100
TAU = 2 * np.pi
BPM = 56
BEAT = 60.0 / BPM
E8 = BEAT / 2
_cache = {}


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, dur, rel):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(a, 1e-4))
    r = np.maximum(t - dur, 0)
    return e * np.where(t < dur, 1.0, np.exp(-r / rel))


# ── 乐器（单声道）：都只留低次泛音，起音偏软 ──
def felt(f, dur):
    """柔音钢琴：五个泛音、指数衰减，抬手后很快止音。"""
    n = int((dur + 1.0) * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for k, a in ((1, 1.0), (2, 0.36), (3, 0.14), (4, 0.06), (5, 0.025)):
        if k * f > 5000:
            break
        tau = 1.7 * (220.0 / f) ** 0.35 / (1 + 0.7 * (k - 1))
        y += a * np.sin(TAU * k * f * t + 0.4 * k) * np.exp(-t / tau)
    off = np.where(t < dur + 0.2, 1.0, np.exp(-(t - dur - 0.2) / 0.22))
    return y * np.minimum(1.0, t / 0.008) * off


def celesta(f, dur):
    n = int(2.6 * SR); t = np.arange(n) / SR
    y = np.sin(TAU * f * t) * np.exp(-t / 1.1) + 0.18 * np.sin(TAU * 4 * f * t) * np.exp(-t / 0.18) + 0.08 * np.sin(TAU * 2 * f * t) * np.exp(-t / 0.5)
    return y * np.minimum(1.0, t / 0.004)


def bass(f, dur):
    n = int((dur + 1.4) * SR); t = np.arange(n) / SR
    y = np.sin(TAU * f * t) + 0.28 * np.sin(2 * TAU * f * t) + 0.08 * np.sin(3 * TAU * f * t)
    return y * env(n, 0.14, dur, 0.8)


def strings(f, dur, attack=0.45):
    n = int((dur + 1.2) * SR); t = np.arange(n) / SR
    vib = 1 + 0.0022 * np.sin(TAU * 5.0 * t) * np.minimum(1.0, t / 0.9)
    y = np.zeros(n)
    for cents, ph in ((-5, 0.0), (0, 1.3), (5, 2.6)):
        ff = f * 2 ** (cents / 1200)
        phase = TAU * np.cumsum(ff * vib) / SR + ph
        for k in range(1, int(6000 / ff) + 1):
            y += np.sin(k * phase) / k / (1 + (k * ff / 1600.0) ** 2)
    return y / 3.2 * env(n, attack, dur, 0.7)


def pad(freqs, dur, seed=1):
    n = int((dur + 2.2) * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(seed)
    y = np.zeros(n)
    for f0 in freqs:
        for cents in (-7, 0, 7):
            f = f0 * 2 ** (cents / 1200); ph = TAU * f * t + rng.uniform(0, TAU)
            for k in range(1, int(3000 / f) + 1):
                y += np.sin(k * ph) / k / (1 + (k * f / 900.0) ** 4)
    y /= max(1e-9, np.abs(y).max())
    return y * env(n, 1.4, dur, 2.0)


INST = {'felt': felt, 'celesta': celesta, 'bass': bass, 'cello': strings, 'violin': lambda f, d: strings(f, d, 0.6)}


def note(inst, pitch, dur):
    key = (inst, pitch if not isinstance(pitch, list) else tuple(pitch), round(dur, 3))
    if key not in _cache:
        y = pad([mtof(p) for p in pitch], dur) if inst == 'pad' else INST[inst](mtof(pitch), dur)
        k = min(len(y), int(0.03 * SR)); y = y.copy(); y[-k:] *= np.linspace(1, 0, k)
        _cache[key] = y
    return _cache[key]


class Mix:
    def __init__(self, seconds):
        self.n = int(seconds * SR)
        self.dry = np.zeros((2, self.n)); self.send = np.zeros((2, self.n))

    def add(self, inst, pitch, t, dur, vel, pan=0.0, rev=0.3):
        y = note(inst, pitch, dur) * vel
        i = int(t * SR)
        if i >= self.n:
            return
        y = y[:self.n - i]
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        for ch, g in ((0, gl), (1, gr)):
            self.dry[ch, i:i + len(y)] += g * y
            self.send[ch, i:i + len(y)] += g * y * rev


def impulse(t60=3.2, seed=7):
    L = int(t60 * SR); t = np.arange(L) / SR
    h = np.random.default_rng(seed).standard_normal((2, L)) * np.exp(-6.9 * t / t60)
    c = np.cumsum(h, axis=1); h = (c[:, 20:] - c[:, :-20]) / 20                # 更暗的混响
    h = np.concatenate([np.zeros((2, int(0.03 * SR))), h], axis=1)
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
CHORDS = {'Dm': (2, [2, 5, 9]), 'Bb': (10, [10, 2, 5]), 'F': (5, [5, 9, 0]), 'Gm': (7, [7, 10, 2]), 'A': (9, [9, 1, 4]), 'D': (2, [2, 6, 9])}
BARS = (['Dm', 'Dm', 'Dm', 'Bb', 'Gm', 'A']            # 引子
        + ['Dm', 'F', 'A', 'Dm', 'Bb', 'A']            # 主题（大提琴）
        + ['Dm', 'F', 'A', 'Dm', 'Bb', 'A']            # 回答（小提琴）
        + ['Gm', 'A', 'A']                             # 渐强到属和弦、一口气
        + ['Dm', 'F', 'A', 'D', 'D', 'D', 'D'])        # 主题开头齐奏，落在 D 大调；共 28 小节
SUBJECT = [(62, 2), (69, 1), (65, 1), (64, .5), (62, .5), (61, 1), (62, 1), (64, 1), (65, 1), (67, .5), (65, .5), (64, 1), (62, 1)]
HEAD = [(62, 2), (69, 1), (65, 1), (64, .5), (62, .5), (61, 1), (62, 4)]
PATTERN = [0, 2, 1, 2, 3, 2, 1, 2]                    # 一小节八个八分音符，在四个和弦音上起伏，全曲不变
BREATH = 20                                            # 第 21 小节（从 0 数）


def tones(name, lo):
    """从 lo 起往上取这个和弦的四个音：根、三、五、高八度的根（转位按音高排）。"""
    root, pcs = CHORDS[name]
    out, m = [], lo
    while len(out) < 3:
        if m % 12 in pcs:
            out.append(m)
        m += 1
    return out + [out[0] + 12]


def bar_t(b):
    return b * 4 * BEAT


def line(m, inst, notes, b, scale, vel, shift, pan):
    t = bar_t(b)
    for p, d in notes:
        m.add(inst, p + shift, t, d * scale * BEAT * 1.02, vel, pan, 0.4); t += d * scale * BEAT


def compose():
    nb = len(BARS)
    m = Mix(nb * 4 * BEAT + 3.0)
    for b, name in enumerate(BARS):
        t0 = bar_t(b); root, pcs = CHORDS[name]
        if b < 24:
            # 长和弦与低音：每小节一次，渐强段（19–20 小节）更响，「一口气」那一小节轻
            ch = [p for p in range(50, 70) if p % 12 in pcs][:4]
            v = 0.30 if 18 <= b < BREATH else 0.15 if b == BREATH else 0.15 if b < 2 else 0.22
            m.add('pad', ch, t0, 4 * BEAT, v, 0.0, 0.45)
            m.add('bass', 38 + ((root - 2) % 12) - (12 if root in (7, 9, 10) else 0), t0, 4 * BEAT * 0.96, 0.34 if b != BREATH else 0.24, 0.0, 0.1)
        # 柔音钢琴音型：第 3 小节进，「一口气」那一小节停，第 26 小节以后退出；拍头略重
        if 2 <= b < 26 and b != BREATH:
            tt = tones(name, 62)
            fade = 1.0 if b < 24 else 0.7 if b == 24 else 0.45
            for i, k in enumerate(PATTERN):
                m.add('felt', tt[k], t0 + i * E8, E8 * 1.8, (0.19 + (0.04 if i % 4 == 0 else 0)) * fade, -0.25 + 0.06 * k, 0.3)
        # 钢片琴：回答那几小节，每小节两个音（一、三拍），很轻
        if 14 <= b < 20:
            tt = tones(name, 74)
            m.add('celesta', tt[0], t0, BEAT, 0.08, 0.4, 0.5)
            m.add('celesta', tt[2], t0 + 2 * BEAT, BEAT, 0.07, 0.45, 0.5)
    line(m, 'cello', SUBJECT, 6, 2, 0.30, -12, -0.15)                 # 主题：大提琴，时值放大一倍，正好六小节
    line(m, 'violin', SUBJECT, 12, 2, 0.20, 12, 0.25)                 # 回答：小提琴高八度
    m.add('cello', 55, bar_t(18), 4 * BEAT, 0.26, -0.15, 0.4)          # 渐强：低音弦乐 G → A
    m.add('cello', 57, bar_t(19), 8 * BEAT, 0.30, -0.15, 0.4)
    line(m, 'cello', HEAD, 21, 2, 0.30, -12, -0.15)                   # 主题开头齐奏，最后的 D 落在 D 大调上
    line(m, 'violin', HEAD, 21, 2, 0.18, 12, 0.25)
    # 收尾：D 大调长和弦、低音、钢片琴一声
    m.add('pad', [50, 54, 57, 62, 66, 69], bar_t(24), 4 * 4 * BEAT, 0.32, 0.0, 0.5)
    m.add('bass', 38, bar_t(24), 4 * 4 * BEAT * 0.9, 0.30, 0.0, 0.1)
    m.add('celesta', 74, bar_t(24), 2.0, 0.09, 0.3, 0.6)
    y = m.dry + reverb(m.send, impulse())
    k1 = int(1.0 * SR); y[:, :k1] *= np.linspace(0, 1, k1)
    k2 = int(5.0 * SR); y[:, -k2:] *= np.linspace(1, 0, k2)
    return y / max(1e-9, np.abs(y).max()) * 0.89


def write_wav(path, y):
    pcm = (np.clip(y.T, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    y = compose()
    write_wav(sys.argv[1], y)
    print('ok', sys.argv[1], 'bars', len(BARS), 'seconds', round(y.shape[1] / SR, 1), 'breath at', round(bar_t(BREATH), 1), 's')
