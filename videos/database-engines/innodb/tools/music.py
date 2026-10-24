# InnoDB 配乐：三个候选调调，由 project.json 的 audio.style 选（试听阶段用；选定后只留一个并按章节编排）
#   ledger 「缓冲池」 F 利底亚，84 拍/分：暖铺底 + 电钢琴和弦，最高处加一串木琴音像缓冲池里的页一格格点亮
#   ruler  「刻度」   C 大调，100 拍/分：两支木琴的八分音符固定音型错开一拍交织，最高处每小节一声高音标出刻度
#   commit 「两个事务」A 小调 → C 大调，76 拍/分：两支拨弦声部左右一问一答，乐句收在主音上响一下铃，像一次提交
# 全部由程序合成，不用外部素材。compose(ctx) 返回 (2, N)；结果确定（随机数固定种子）。
# 混响按 2 的幂长度分块做（重叠相加），音符按（乐器、音高、时值）缓存，避免对整条分轨做任意长度的变换。
import numpy as np

FADE = (2.5, 4.0)
TAU = 2 * np.pi
_cache = {}


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def _env(n, sr, a, dur, rel):
    t = np.arange(n) / sr; T = n / sr
    e = np.minimum(1.0, t / max(a, 1e-4))
    r = np.maximum(t - dur, 0)
    return e * np.where(t < dur, 1.0, np.exp(-r / rel) * np.clip((T - t) / max(T - dur, 1e-3), 0, 1))   # 释音到缓冲区末尾正好归零


# ── 乐器（返回单声道） ──
def epiano(f, dur, sr):
    n = int((dur + 1.4) * sr); t = np.arange(n) / sr
    idx = 1.7 * np.exp(-t / 0.30) + 0.30
    y = np.sin(TAU * f * t + idx * np.sin(TAU * f * t))
    y += 0.22 * np.sin(TAU * f * 7.0 * t) * np.exp(-t / 0.12) + 0.06 * np.sin(TAU * f * 3.0 * t) * np.exp(-t / 0.6)          # 音叉的亮点
    y *= np.exp(-t / (2.6 * (261.6 / f) ** 0.35))
    return y * _env(n, sr, 0.004, dur, 0.25)


def mallet(f, dur, sr):
    n = int(1.8 * sr); t = np.arange(n) / sr
    k = (440.0 / f) ** 0.4
    y = (np.sin(TAU * f * t) * np.exp(-t / (0.70 * k))
         + 0.42 * np.sin(TAU * 3.93 * f * t) * np.exp(-t / (0.18 * k))
         + 0.16 * np.sin(TAU * 9.2 * f * t) * np.exp(-t / (0.06 * k)))
    return y * np.minimum(1.0, t / 0.0025)


def pluck(f, dur, sr):
    n = int(min(dur + 0.9, 2.6) * sr); t = np.arange(n) / sr
    y = np.zeros(n)
    for k in range(1, 15):
        if k * f > 11000:
            break
        a = abs(np.sin(np.pi * k * 0.21)) / k ** 0.85
        tau = 1.3 * (220.0 / f) ** 0.25 / (1 + 0.45 * (k - 1))
        y += a * np.sin(TAU * k * f * t + 0.7 * k) * np.exp(-t / tau)
    tail = np.clip((n / sr - t) / 0.15, 0, 1)
    return y * np.minimum(1.0, t / 0.003) * tail


def bell(f, dur, sr):
    n = int(3.6 * sr); t = np.arange(n) / sr
    idx = 1.6 * np.exp(-t / 0.5)
    y = np.sin(TAU * f * t + idx * np.sin(TAU * 3.5 * f * t)) * np.exp(-t / 1.5)
    return y * np.minimum(1.0, t / 0.002)


def glass(f, dur, sr):
    n = int(2.4 * sr); t = np.arange(n) / sr
    y = np.sin(TAU * f * t) * np.exp(-t / 1.1) + 0.25 * np.sin(TAU * 2.76 * f * t) * np.exp(-t / 0.35)
    return y * np.minimum(1.0, t / 0.002)


def sub(f, dur, sr):
    n = int((dur + 0.6) * sr); t = np.arange(n) / sr
    y = np.sin(TAU * f * t) + 0.16 * np.sin(2 * TAU * f * t)
    return y * _env(n, sr, 0.03, dur, 0.35) * (0.85 + 0.15 * np.exp(-t / 0.6))


def pad(freqs, dur, sr, fc=1000.0, att=1.2, rel=1.8, seed=1):
    n = int((dur + rel) * sr); t = np.arange(n) / sr
    rng = np.random.default_rng(seed)
    y = np.zeros(n)
    for f0 in freqs:
        for cents in (-7, 0, 7):
            f = f0 * 2 ** (cents / 1200); ph = TAU * f * t + rng.uniform(0, TAU)
            for k in range(1, int(min(4 * fc, 9000) / f) + 1):
                y += np.sin(k * ph) / k / (1 + (k * f / fc) ** 4)
    y /= max(1e-9, np.abs(y).max())
    return y * _env(n, sr, att, dur, rel)


INST = {'epiano': epiano, 'mallet': mallet, 'pluck': pluck, 'bell': bell, 'glass': glass, 'sub': sub}


def _note(inst, pitch, dur, sr, **kw):
    key = (inst, pitch if not isinstance(pitch, list) else tuple(pitch), round(dur, 3), tuple(sorted(kw.items())))
    if key not in _cache:
        if inst == 'pad':
            _cache[key] = pad([mtof(p) for p in pitch], dur, sr, **kw)
        else:
            _cache[key] = INST[inst](mtof(pitch), dur, sr)
        y = _cache[key]; k = min(len(y), int(0.03 * sr))
        y[-k:] *= np.linspace(1, 0, k)                               # 每个音的末尾 30 毫秒淡出，截断处不出咔嗒声
    return _cache[key]


def _impulse(sr, t60=2.6, seed=7):
    L = int(t60 * sr); t = np.arange(L) / sr
    rng = np.random.default_rng(seed)
    h = rng.standard_normal((2, L)) * np.exp(-6.9 * t / t60)
    c = np.cumsum(h, axis=1); h = (c[:, 12:] - c[:, :-12]) / 12        # 轻微低通，尾巴不刺耳
    pre = int(0.02 * sr)
    h = np.concatenate([np.zeros((2, pre)), h], axis=1)
    return h / np.sqrt((h ** 2).sum(axis=1, keepdims=True))


def _reverb(x, h, block=1 << 16):
    n, L = x.shape[1], h.shape[1]
    size = 1 << int(np.ceil(np.log2(block + L)))
    H = np.fft.rfft(h, size)
    y = np.zeros((2, n + L))
    for s in range(0, n, block):
        seg = x[:, s:s + block]
        Y = np.fft.irfft(np.fft.rfft(seg, size) * H, size)[:, :seg.shape[1] + L - 1]
        y[:, s:s + Y.shape[1]] += Y
    return y[:, :n]


class Mix:
    def __init__(self, n, sr):
        self.sr, self.n = sr, n
        self.dry = np.zeros((2, n)); self.send = np.zeros((2, n))

    def add(self, inst, pitch, start, dur, vel, pan=0.0, rev=0.3, **kw):
        y = _note(inst, pitch, dur, self.sr, **kw) * vel
        i = int(start * self.sr)
        if i >= self.n or i < 0:
            return
        y = y[:self.n - i]
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        for ch, g in ((0, gl), (1, gr)):
            self.dry[ch, i:i + len(y)] += g * y
            self.send[ch, i:i + len(y)] += g * y * rev


# ── 段落：引子 → 推进 → 最高处 → 收束；起点取 audio.hits（秒），没有时按片长比例 ──
def _sections(ctx, bar):
    total = ctx['total']
    hits = (ctx.get('audio') or {}).get('hits') or [total * 0.23, total * 0.47, total * 0.87]
    return [round(h / bar) * bar for h in hits]


def ledger(m, total, ctx):
    bpm = 84; beat = 60 / bpm; bar = 4 * beat
    h1, h2, h3 = _sections(ctx, bar)
    chords = [(41, [57, 60, 64, 67]),      # Fmaj9
              (41, [55, 59, 62, 64]),      # G6/F（利底亚的升四级）
              (38, [53, 57, 60, 64]),      # Dm9
              (34, [50, 53, 57, 60])]      # B♭maj9
    nb = int(total / bar) + 1
    for b in range(0, nb, 2):
        t0 = b * bar
        root, v = chords[(b // 2) % 4]
        last = t0 + 2 * bar >= total - 0.5
        if last:
            root, v = chords[0]
        m.add('pad', [root + 12] + v, t0, 2 * bar - 0.05 if not last else total - t0, 0.40, 0, 0.35, fc=1500.0)
        if h1 <= t0 < h3 + 2 * bar:
            m.add('sub', root, t0, 2 * bar - 0.1, 0.38 if t0 < h2 else 0.45, 0, 0.05)
        for k in range(2):
            tb = t0 + k * bar
            if tb >= total - 1:
                break
            if tb < h1 or tb >= h3:
                if k == 0:
                    for j, p in enumerate(v):
                        m.add('epiano', p, tb + 0.012 * j, 2 * bar - 0.3, 0.30, -0.15 + 0.1 * j, 0.4)
                continue
            vel = 0.34 if tb < h2 else 0.40
            for beat_at, notes in ((0.0, v), (1.5, v[1:]), (3.0, v[1:])):
                for j, p in enumerate(notes):
                    m.add('epiano', p, tb + beat_at * beat + 0.01 * j, beat * (1.2 if beat_at else 1.4), vel * (1 if beat_at == 0 else 0.75), -0.15 + 0.1 * j, 0.35)
            if h2 <= tb < h3 and k == 0:                     # 最高处：一串木琴音像页一格格点亮
                up = [p + 12 for p in v]
                for s, ix in enumerate([0, 2, 1, 3, 2, 0, 1, 3]):
                    m.add('mallet', up[ix], tb + s * beat / 2, beat / 2, 0.24, -0.35 if s % 2 else 0.35, 0.45)
    for t, p in ((h2, 77), (h3, 81)):
        m.add('bell', p, t, 2.0, 0.22, 0.2, 0.6)


def ruler(m, total, ctx):
    bpm = 100; beat = 60 / bpm; bar = 4 * beat; e8 = beat / 2
    h1, h2, h3 = _sections(ctx, bar)
    chords = [(36, [52, 55, 62]),          # Cadd9
              (33, [52, 55, 60]),          # Am7
              (41, [52, 57, 60]),          # Fmaj7
              (43, [50, 55, 59, 64])]      # G6
    pat = [76, 67, 74, 67, 72, 67, 74, 69]   # E5 G4 D5 G4 C5 G4 D5 A4
    nb = int(total / bar) + 1
    for b in range(0, nb, 2):
        t0 = b * bar
        root, v = chords[(b // 2) % 4]
        last = t0 + 2 * bar >= total - 0.5
        if last:
            root, v = chords[0]
        m.add('pad', [root + 12] + v, t0, 2 * bar - 0.05 if not last else total - t0, 0.5, 0, 0.3, fc=1100.0, att=0.8)
        if h1 <= t0 < h3:
            for k in range(4):
                m.add('sub', root, t0 + k * 2 * beat, 2 * beat - 0.08, 0.5, 0, 0.05)
    for s in range(int(total / e8)):
        t = s * e8
        if t > total - 2.5:
            break
        fade = 1.0 if t < h3 else max(0.0, 1 - (t - h3) / (total - 2.5 - h3))
        if t >= h3 and s % 2:                                # 收束：音型变稀
            continue
        va = (0.30 if t < h1 else 0.36) * fade
        m.add('mallet', pat[s % 8], t, e8, va, -0.3, 0.3)
        if h1 <= t < h3:                                     # 第二支错开一个八分音符
            m.add('mallet', pat[(s - 1) % 8] - 12 if t < h2 else pat[(s - 1) % 8], t + 0.004, e8, 0.22, 0.35, 0.3)
    for b in range(nb):
        t = b * bar
        if h2 <= t < h3:
            m.add('glass', 91 if b % 2 == 0 else 88, t, 1.0, 0.16, 0.1, 0.55)
    m.add('bell', 84, h2, 2.0, 0.18, 0, 0.6)
    m.add('glass', 88, max(0, total - 4.5), 1.0, 0.14, 0, 0.7)


def commit(m, total, ctx):
    bpm = 76; beat = 60 / bpm; bar = 4 * beat
    h1, h2, h3 = _sections(ctx, bar)
    chords = [(33, [60, 64, 67, 71]),      # Am9
              (41, [57, 60, 64, 67]),      # Fmaj9
              (40, [55, 59, 60, 64]),      # C/E
              (43, [62, 67, 69, 72])]      # G6sus
    alice = [[76, 74, 72, 71], [72, 71, 69, 67], [67, 69, 71, 72], [74, 72, 71, 74]]
    bob = [[64, 67, 69, 71], [60, 64, 65, 67], [64, 62, 60, 59], [62, 65, 67, 71]]
    rhythm = [0, 1, 2, 3]
    nb = int(total / bar) + 1
    end_c = None
    for b in range(0, nb, 2):
        t0 = b * bar
        ci = (b // 2) % 4
        root, v = chords[ci]
        last = t0 + 2 * bar >= total - 0.5
        if last:                                             # 收在 C 大调：一次提交
            root, v = 36, [52, 55, 60, 64]
            end_c = t0
        m.add('pad', [root + 12] + v, t0, 2 * bar - 0.05 if not last else total - t0, 0.55, 0, 0.35, fc=2000.0, att=1.6)
        if h1 <= t0 < h3 + 2 * bar:
            m.add('sub', root, t0, 2 * bar - 0.1, 0.36, 0, 0.05)
        if last:
            for j, p in enumerate([72, 67, 64]):
                m.add('pluck', p, t0 + j * beat, 1.6, 0.42, -0.4, 0.35)
            m.add('bell', 84, t0 + 3 * beat, 2.5, 0.25, 0.1, 0.6)
            break
        a, o = alice[ci], bob[ci]
        va = 0.36 if t0 < h1 else 0.42
        for j, r in enumerate(rhythm):                       # Alice：左声道，第一小节
            m.add('pluck', a[j], t0 + r * beat, beat * 0.95, va, -0.45, 0.3)
        if t0 >= h1:                                         # Bob：右声道，第二小节回答
            for j, r in enumerate(rhythm):
                m.add('pluck', o[j], t0 + bar + r * beat, beat * 0.95, 0.36, 0.45, 0.3)
        if h2 <= t0 < h3:                                    # 最高处：两人同时进行，声部交错
            for j, r in enumerate(rhythm):
                m.add('pluck', o[3 - j] - 12, t0 + (r + 0.5) * beat, beat * 0.8, 0.26, 0.45, 0.3)
                m.add('pluck', a[3 - j], t0 + bar + (r + 0.5) * beat, beat * 0.8, 0.26, -0.45, 0.3)
        if ci == 3 and t0 >= h1:                             # 一轮结束：提交的铃
            m.add('bell', 79, t0 + 2 * bar - beat, 2.0, 0.18, 0.15, 0.6)


STYLES = {'ledger': ledger, 'ruler': ruler, 'commit': commit}


def compose(ctx):
    sr, n, total = ctx['sr'], ctx['n'], ctx['total']
    style = (ctx.get('audio') or {}).get('style', 'ledger')
    m = Mix(n, sr)
    STYLES[style](m, total, ctx)
    wet = _reverb(m.send, _impulse(sr))
    x = m.dry + 0.55 * wet
    return x / max(1e-9, np.abs(x).max())
