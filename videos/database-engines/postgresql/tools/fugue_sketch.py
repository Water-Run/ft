# PostgreSQL 一集的配乐小样「赋格」（试听用，约 65 秒）：WaterRun 2026-10-26「配乐也是学术派的, 体现Pg的庞大严谨史诗」。
# D 小调，66 拍/分。主题由管风琴单独奏出 → 弦乐在属音上回答、管风琴转奏对题 → 低音声部第三次进入 →
# 嵌段向上模进 → 全声部合奏（合唱式和声与定音鼓）→ 全体停一拍（崩溃）→ 主题从头重新进入 → 落在 D 大调。
# 全部由程序合成，不用外部素材；结果确定（随机数固定种子）。用法：python fugue_sketch.py <输出.wav>
import sys
import wave
import numpy as np

SR = 44100
TAU = 2 * np.pi
BPM = 66
BEAT = 60.0 / BPM
_cache = {}


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, dur, rel):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(a, 1e-4))
    r = np.maximum(t - dur, 0)
    return e * np.where(t < dur, 1.0, np.exp(-r / rel))


# ── 乐器（单声道） ──
def organ(f, dur):
    """管风琴的主音栓：8'、4'、2' 与一点 2⅔'，两支略微走音的管子合在一起。"""
    n = int((dur + 0.5) * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for cents in (-2.0, 2.0):
        ff = f * 2 ** (cents / 1200)
        for k, a in ((1, 1.0), (2, 0.55), (3, 0.16), (4, 0.30), (6, 0.07), (8, 0.12)):
            if k * ff < 12000:
                y += a * np.sin(TAU * k * ff * t + 0.3 * k)
    return y / 2.2 * env(n, 0.045, dur, 0.22)


def strings(f, dur):
    """弦乐合奏：三支略微走音的锯齿波，低通，五赫兹多一点的揉弦，起音慢。"""
    n = int((dur + 0.9) * SR); t = np.arange(n) / SR
    vib = 1 + 0.0028 * np.sin(TAU * 5.4 * t) * np.minimum(1.0, t / 0.6)
    y = np.zeros(n)
    fc = 2400.0
    for cents, ph in ((-6, 0.0), (0, 1.3), (6, 2.6)):
        ff = f * 2 ** (cents / 1200)
        phase = TAU * np.cumsum(ff * vib) / SR + ph
        for k in range(1, int(9000 / ff) + 1):
            y += np.sin(k * phase) / k / (1 + (k * ff / fc) ** 2)
    return y / 3.2 * env(n, 0.28, dur, 0.55)


def pedal(f, dur):
    """管风琴的 16' 踏板：基音、八度与一点十二度，下面再垫半个八度的低音。"""
    n = int((dur + 0.6) * SR); t = np.arange(n) / SR
    y = np.sin(TAU * f * t) + 0.55 * np.sin(TAU * 2 * f * t) + 0.18 * np.sin(TAU * 3 * f * t) + 0.45 * np.sin(TAU * 0.5 * f * t)
    return y / 2.0 * env(n, 0.09, dur, 0.35)


def timpani(f, dur):
    """定音鼓：音高从略高处落下，鼓皮的几个泛音很快衰减，加一点击打的噪声。"""
    n = int(2.6 * SR); t = np.arange(n) / SR
    glide = f * (1 + 0.04 * np.exp(-t / 0.05))
    ph = TAU * np.cumsum(glide) / SR
    y = np.sin(ph) * np.exp(-t / 1.1) + 0.35 * np.sin(1.5 * ph) * np.exp(-t / 0.35) + 0.2 * np.sin(1.99 * ph) * np.exp(-t / 0.2)
    rng = np.random.default_rng(3)
    noise = rng.standard_normal(n) * np.exp(-t / 0.03)
    noise = np.convolve(noise, np.ones(40) / 40, mode='same')
    return (y + 0.6 * noise) * np.minimum(1.0, t / 0.002)


def choir(freqs, dur, seed=1):
    """合唱式和声垫：每个音三支走音的柔和锯齿，低通更重，起音与释音都慢。"""
    n = int((dur + 2.2) * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(seed)
    y = np.zeros(n)
    for f0 in freqs:
        for cents in (-9, 0, 9):
            f = f0 * 2 ** (cents / 1200); ph = TAU * f * t + rng.uniform(0, TAU)
            for k in range(1, int(min(3200, 9000) / f) + 1):
                y += np.sin(k * ph) / k / (1 + (k * f / 900.0) ** 4)
    y /= max(1e-9, np.abs(y).max())
    return y * env(n, 1.4, dur, 2.0)


INST = {'organ': organ, 'strings': strings, 'pedal': pedal, 'timpani': timpani}


def note(inst, pitch, dur):
    key = (inst, pitch if not isinstance(pitch, list) else tuple(pitch), round(dur, 3))
    if key not in _cache:
        y = choir([mtof(p) for p in pitch], dur) if inst == 'choir' else INST[inst](mtof(pitch), dur)
        k = min(len(y), int(0.03 * SR)); y = y.copy(); y[-k:] *= np.linspace(1, 0, k)
        _cache[key] = y
    return _cache[key]


class Mix:
    def __init__(self, seconds):
        self.n = int(seconds * SR)
        self.dry = np.zeros((2, self.n)); self.send = np.zeros((2, self.n))

    def add(self, inst, pitch, beat, beats, vel, pan=0.0, rev=0.35):
        y = note(inst, pitch, beats * BEAT) * vel
        i = int(beat * BEAT * SR)
        if i >= self.n:
            return
        y = y[:self.n - i]
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        for ch, g in ((0, gl), (1, gr)):
            self.dry[ch, i:i + len(y)] += g * y
            self.send[ch, i:i + len(y)] += g * y * rev


def impulse(t60=3.4, seed=7):
    L = int(t60 * SR); t = np.arange(L) / SR
    rng = np.random.default_rng(seed)
    h = rng.standard_normal((2, L)) * np.exp(-6.9 * t / t60)
    c = np.cumsum(h, axis=1); h = (c[:, 16:] - c[:, :-16]) / 16
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


# ── 乐思 ──
# 主题（3 小节，D 小调）：（音高, 拍数）
SUBJECT = [(62, 2), (69, 1), (65, 1),
           (64, .5), (62, .5), (61, 1), (62, 1), (64, 1),
           (65, 1), (67, .5), (65, .5), (64, 1), (62, 1)]
ANSWER = [(p + 7, d) for p, d in SUBJECT]            # 在属音上回答

# 每小节两个和弦（半小节一个）：和弦音的音级
CH = {
    'Dm': [2, 5, 9], 'Am': [9, 0, 4], 'E': [4, 8, 11], 'A': [9, 1, 4], 'A7': [9, 1, 4, 7], 'F': [5, 9, 0],
    'Gm': [7, 10, 2], 'Bb': [10, 2, 5], 'C': [0, 4, 7], 'D': [2, 6, 9], 'Gm6': [7, 10, 2, 4],
}
PLAN = ['Dm', 'Dm', 'Dm', 'Dm', 'Dm', 'A', 'Am', 'Am', 'E', 'Am', 'Am', 'A', 'Dm', 'Dm', 'A7', 'Dm', 'Dm', 'F',
        'Gm', 'Gm', 'A', 'A', 'Bb', 'A', 'Dm', 'Gm', 'Bb', 'A7', 'Dm', 'A', 'Dm', 'A7', 'D', 'D', 'D', 'D']
SCALE_MINOR = {2, 4, 5, 7, 9, 10, 0}


def chord_at(beat):
    return CH[PLAN[min(int(beat // 2), len(PLAN) - 1)]]


def line(beat0, beats, lo, hi, start, step=1.0, seed=0):
    """在 [lo, hi] 里走一条副声部：每拍落在当时和弦的和弦音上，尽量级进；三度跳进时补一个经过音。"""
    out, prev, b = [], start, beat0
    rng = np.random.default_rng(seed)
    while b < beat0 + beats - 1e-6:
        pcs = chord_at(b)
        cands = [m for m in range(lo, hi + 1) if m % 12 in pcs and m != prev]
        cands.sort(key=lambda m: (abs(m - prev), rng.random()))
        tgt = cands[0]
        if abs(tgt - prev) in (3, 4) and step >= 1.0:
            mid = [m for m in range(min(prev, tgt) + 1, max(prev, tgt)) if (m % 12) in (SCALE_MINOR | {1} if 9 in pcs and 1 in pcs else SCALE_MINOR)]
            if mid:
                out.append((prev, b, step / 2)); out.append((mid[0], b + step / 2, step / 2)); prev = tgt; b += step; continue
        out.append((tgt, b, step)); prev = tgt; b += step
    return out


def play_melody(m, inst, mel, beat0, vel, pan, transpose=0, rev=0.35):
    b = beat0
    for p, d in mel:
        m.add(inst, p + transpose, b, d * 1.02, vel, pan, rev)
        b += d
    return b


def compose():
    total_beats = 72
    m = Mix(total_beats * BEAT + 5.0)
    # 1–3 小节：主题，管风琴单独
    play_melody(m, 'organ', SUBJECT, 0, 0.55, -0.15)
    # 4–6 小节：弦乐在属音上回答；管风琴奏对题
    play_melody(m, 'strings', ANSWER, 12, 0.50, 0.35)
    for p, b, d in line(12, 12, 55, 67, 62, seed=1):
        m.add('organ', p, b, d * 1.02, 0.36, -0.2)
    # 7–9 小节：低音声部第三次进入（低八度的主题，踏板加弦乐低音），上面两声部对位
    play_melody(m, 'pedal', SUBJECT, 24, 0.62, 0.0, transpose=-12)
    play_melody(m, 'strings', SUBJECT, 24, 0.22, 0.0, transpose=-12)
    for p, b, d in line(24, 12, 69, 81, 72, seed=2):
        m.add('strings', p, b, d * 1.02, 0.30, 0.4)
    for p, b, d in line(24, 12, 57, 69, 64, seed=3):
        m.add('organ', p, b, d * 1.02, 0.32, -0.3)
    # 10–12 小节：嵌段，主题开头三个音向上模进（G 小调 → A → B♭ → A），低音走和弦根音
    head = [(0, 2), (7, 1), (3, 1)]
    for i, root in enumerate([67, 69, 70, 69]):
        play_melody(m, 'strings', [(root + iv, d * 0.75) for iv, d in head], 36 + i * 3, 0.42, 0.35)
        play_melody(m, 'organ', [(root - 12 + iv + 7, d * 0.75) for iv, d in head], 37.5 + i * 3, 0.30, -0.3)
        m.add('pedal', root - 24, 36 + i * 3, 3.0, 0.5)
    # 13–14 小节：全声部合奏：高音弦乐奏主题（高八度），管风琴与踏板奏和弦根音，合唱和声垫，定音鼓
    play_melody(m, 'strings', SUBJECT[:8], 48, 0.55, 0.3, transpose=12)
    play_melody(m, 'organ', SUBJECT[:8], 48, 0.40, -0.25)
    for i, (ch, root) in enumerate([([50, 57, 62, 65, 69], 38), ([55, 58, 62, 67, 70], 43), ([57, 61, 64, 67, 69], 45), ([50, 57, 62, 65, 69], 38)]):
        m.add('choir', ch, 48 + i * 2, 2.1, 0.42, 0.0, 0.5)
        m.add('pedal', root, 48 + i * 2, 2.0, 0.6)
        m.add('timpani', root + 12 if root < 40 else root, 48 + i * 2, 1.0, 0.75 if i % 2 == 0 else 0.5)
    # 15–16 小节：第一拍全体停住（崩溃），之后主题从头重新进入，管风琴单独，轻
    play_melody(m, 'organ', SUBJECT[:8], 57, 0.50, -0.1)
    m.add('pedal', 38, 57, 7.0, 0.35)
    # 17–18 小节：落在 D 大调（主音上的大三和弦），合唱与弦乐长音，定音鼓轻滚
    m.add('choir', [50, 54, 57, 62, 66, 69], 64, 7.0, 0.55, 0.0, 0.55)
    m.add('strings', 74, 64, 7.0, 0.30, 0.3)
    m.add('strings', 66, 64, 7.0, 0.26, -0.3)
    m.add('pedal', 38, 64, 7.0, 0.62)
    m.add('organ', [62][0], 64, 7.0, 0.30, -0.1)
    for k in range(6):
        m.add('timpani', 50, 64 + k * 0.25, 0.3, 0.18 + 0.04 * k)
    y = m.dry + reverb(m.send, impulse())
    # 崩溃：第 57 拍前一拍（第 56 拍）整体静音，连混响尾巴一起切断，前后各 15 毫秒淡入淡出
    a, b = int(56 * BEAT * SR), int(57 * BEAT * SR)
    g = np.ones(y.shape[1]); k = int(0.015 * SR)
    g[a:b] = 0.0; g[a - k:a] = np.linspace(1, 0, k); g[b:b + k] = np.linspace(0, 1, k)
    y *= g
    # 开头淡入、结尾淡出
    k1 = int(0.3 * SR); y[:, :k1] *= np.linspace(0, 1, k1)
    k2 = int(3.0 * SR); y[:, -k2:] *= np.linspace(1, 0, k2)
    return y / max(1e-9, np.abs(y).max()) * 0.89


def write_wav(path, y):
    pcm = (np.clip(y.T, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    write_wav(sys.argv[1], compose())
    print('ok', sys.argv[1])
