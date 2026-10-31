"""本片的配乐：compose(ctx) 由 kit/tools/mix.py 调用（project.json 的 audio.music 指向本文件），返回 (2, N) 的数组。

由 R3「沉稳」小样（tools/music_sketch.py，WaterRun 2026-10-26 选定）扩成整片。全部由本文件合成，不用采样或现成乐曲；随机数固定种子。
  - 速度 56 拍/分，D 小调；每小节一个和弦，同时最多四层。音色只留低次泛音，不用钟、定音鼓。
  - 每章的小节从章节卡落下的那一刻（场景开始后 0.41 秒，与音效里的 thud 同时）重新数起；章首一声低八度的柔音钢琴。
  - 各章用自己的四和弦循环，铺底是长和弦与低音；讲机制的章节（02–09）有那支始终不变的八分音符音型（柔音钢琴），
    历史与取舍的前半只留铺底和钢片琴。
  - 赋格主题（时值放大一倍，正好六小节）在历史、页内、改、删、五个问题几章轮流由大提琴与小提琴奏出；
    主题那六小节的和弦换成小样里配好的 Dm–F–A–Dm–B♭–A。
  - 开场：引子六小节 → 大提琴主题 → Gm、A 推到片名，片名卡上落一个 Dm。
  - 崩溃：不急停（R3 去掉了崩溃急停）。讲到「强行停掉」时音型停下，只留 A 上的长和弦与低音（小样里「一口气」的做法），
    重新启动（w16）时回到 Dm，讲重放（w17）时音型回来。
  - 取舍：讲到四十年后的调查（t11）时小提琴奏主题开头；最后的问题（t15）停在 A 上不解决，片尾才落到 D 大调。
制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
"""
import numpy as np

TAU = 2 * np.pi
BPM = 56
BEAT = 60.0 / BPM
E8 = BEAT / 2
BAR = 4 * BEAT
DROP = 0.41                      # 章节卡落下（thud）在场景开始后的秒数
FADE = (1.0, 5.0)
SR = 48000
_cache = {}


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, dur, rel):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(a, 1e-4))
    r = np.maximum(t - dur, 0)
    return e * np.where(t < dur, 1.0, np.exp(-r / rel))


# ── 乐器（单声道）：与小样相同 ──
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
    dur = round(dur, 2)
    key = (inst, pitch if not isinstance(pitch, list) else tuple(pitch), dur)
    if key not in _cache:
        y = pad([mtof(p) for p in pitch], dur) if inst == 'pad' else INST[inst](mtof(pitch), dur)
        k = min(len(y), int(0.03 * SR)); y = y.copy(); y[-k:] *= np.linspace(1, 0, k)
        _cache[key] = y.astype(np.float32)
    return _cache[key]


class Mix:
    """干声是立体声，混响的送出量合成单声道，最后用立体声的冲激响应一次卷回来（省内存）。"""

    def __init__(self, n):
        self.n = n
        self.dry = np.zeros((2, n), dtype=np.float32); self.send = np.zeros(n, dtype=np.float32)

    def add(self, inst, pitch, t, dur, vel, pan=0.0, rev=0.3, cut=None):
        y = note(inst, pitch, dur) * np.float32(vel)
        i = int(t * SR)
        if i >= self.n or i < 0:
            return
        y = y[:self.n - i]
        if cut is not None:                                   # 到 cut 为止硬收（30 毫秒）
            j = max(0, int((cut - t) * SR))
            if j < len(y):
                y = y[:j + int(0.03 * SR)].copy(); y[j:] *= np.linspace(1, 0, len(y) - j, dtype=np.float32)
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.dry[0, i:i + len(y)] += gl * y
        self.dry[1, i:i + len(y)] += gr * y
        self.send[i:i + len(y)] += y * np.float32(rev)


def impulse(t60=3.2, seed=7):
    L = int(t60 * SR); t = np.arange(L) / SR
    h = np.random.default_rng(seed).standard_normal((2, L)) * np.exp(-6.9 * t / t60)
    c = np.cumsum(h, axis=1); h = (c[:, 20:] - c[:, :-20]) / 20                # 更暗的混响
    h = np.concatenate([np.zeros((2, int(0.03 * SR))), h], axis=1)
    return h / np.sqrt((h ** 2).sum(axis=1, keepdims=True))


def add_reverb(m, h, block=1 << 16):
    """分块卷积，变换长度取 2 的幂；整块为零的跳过。"""
    n, L = m.n, h.shape[1]
    size = 1 << int(np.ceil(np.log2(block + L)))
    H = np.fft.rfft(h, size)
    for s in range(0, n, block):
        seg = m.send[s:s + block]
        if not seg.any():
            continue
        Y = np.fft.irfft(np.fft.rfft(seg, size)[None, :] * H, size)[:, :len(seg) + L - 1]
        e = min(n, s + Y.shape[1])
        m.dry[:, s:e] += Y[:, :e - s].astype(np.float32)


# ── 和声 ──
CHORDS = {'Dm': (2, [2, 5, 9]), 'Bb': (10, [10, 2, 5]), 'F': (5, [5, 9, 0]), 'Gm': (7, [7, 10, 2]), 'A': (9, [9, 1, 4]),
          'C': (0, [0, 4, 7]), 'D': (2, [2, 6, 9])}
SUBJ = ['Dm', 'F', 'A', 'Dm', 'Bb', 'A']                # 主题六小节下面的和弦
SUBJECT = [(62, 2), (69, 1), (65, 1), (64, .5), (62, .5), (61, 1), (62, 1), (64, 1), (65, 1), (67, .5), (65, .5), (64, 1), (62, 1)]
HEAD = [(62, 2), (69, 1), (65, 1), (64, .5), (62, .5), (61, 1), (62, 4)]
PATTERN = [0, 2, 1, 2, 3, 2, 1, 2]                    # 一小节八个八分音符，在四个和弦音上起伏，全片不变
VOICE = {'cello': (-12, 0.30, -0.15), 'violin': (12, 0.20, 0.25)}

# 每章：和弦循环；音型从第几小节起（None = 不用）与音区；主题（乐器, 起始小节, 旋律）；钢片琴
PLAN = {
    'history': dict(prog=['Dm', 'Bb', 'F', 'A'], felt=None, theme=('cello', 1, SUBJECT), celesta=True),
    'layout': dict(prog=['Dm', 'F', 'Bb', 'A'], felt=0),
    'page': dict(prog=['Dm', 'Gm', 'Bb', 'A'], felt=0, theme=('violin', 4, SUBJECT)),
    'insert': dict(prog=['F', 'C', 'Dm', 'A'], felt=0),
    'query': dict(prog=['Dm', 'Bb', 'Gm', 'A'], felt=0, celesta=True),
    'update': dict(prog=['Dm', 'F', 'Gm', 'A'], felt=0, theme=('cello', 2, SUBJECT)),
    'mvcc': dict(prog=['Bb', 'F', 'Gm', 'A'], felt=0, lo=57, celesta=True),
    'delete': dict(prog=['Dm', 'Bb', 'Gm', 'A'], felt=0, lo=57, theme=('violin', 8, SUBJECT)),
    'five': dict(prog=SUBJ, felt=0, theme=('cello', 0, SUBJECT), pad=0.26),
}


def tones(name, lo):
    """从 lo 起往上取这个和弦的四个音：三个和弦音、再加最低那个的高八度。"""
    root, pcs = CHORDS[name]
    out, m = [], lo
    while len(out) < 3:
        if m % 12 in pcs:
            out.append(m)
        m += 1
    return out + [out[0] + 12]


def bars_between(t0, t1):
    """t0 起每小节一格，直到 t1；最后一格截短。"""
    out, t = [], t0
    while t < t1 - 0.25:
        out.append((t, min(BAR, t1 - t))); t += BAR
    return out


def bed(m, t, d, name, pv=0.22, bv=0.34, cut=None):
    """长和弦与低音。"""
    root, pcs = CHORDS[name]
    ch = [p for p in range(50, 70) if p % 12 in pcs][:4]
    m.add('pad', ch, t, d, pv, 0.0, 0.45, cut)
    m.add('bass', 38 + ((root - 2) % 12) - (12 if root in (7, 9, 10) else 0), t, d * 0.96, bv, 0.0, 0.1, cut)


def pattern(m, t, d, name, lo=62, fade=1.0, cut=None):
    tt = tones(name, lo)
    for i, k in enumerate(PATTERN):
        if i * E8 >= d - 0.05:
            break
        m.add('felt', tt[k], t + i * E8, E8 * 1.8, (0.19 + (0.04 if i % 4 == 0 else 0)) * fade, -0.25 + 0.06 * k, 0.3, cut)


def sparkle(m, t, d, name):
    tt = tones(name, 74)
    m.add('celesta', tt[0], t, BEAT, 0.08, 0.4, 0.5)
    if d > 2.2 * BEAT:
        m.add('celesta', tt[2], t + 2 * BEAT, BEAT, 0.07, 0.45, 0.5)


def melody(m, inst, notes, t, scale=2, until=None, vel=None):
    shift, v, pan = VOICE[inst]
    for p, d in notes:
        if until is not None and t >= until - 0.2:
            break
        dur = d * scale * BEAT * 1.02
        if until is not None:
            dur = min(dur, until - t + 0.3)
        m.add(inst, p + shift, t, dur, vel or v, pan, 0.4); t += d * scale * BEAT


def chapter(m, sid, t0, t1):
    """一章：从章节卡落下起数小节；主题那六小节换成主题的和弦。"""
    P = PLAN[sid]
    bars = bars_between(t0, t1)
    names = [P['prog'][i % len(P['prog'])] for i in range(len(bars))]
    th = P.get('theme')
    if th:
        inst, b0, notes = th
        for k in range(6):
            if b0 + k < len(names):
                names[b0 + k] = SUBJ[k]
        if b0 < len(bars):
            melody(m, inst, notes, bars[b0][0], until=t1)
    m.add('felt', 38, t0, 2 * BEAT, 0.18, -0.1, 0.4)                      # 章首：低八度的一声（章节标题不再整屏，这一声也放轻）
    for i, ((t, d), name) in enumerate(zip(bars, names)):
        bed(m, t, d, name, P.get('pad', 0.22) * (1.15 if i == 0 else 1.0))
        if P.get('felt') is not None and i >= P['felt']:
            pattern(m, t, d, name, P.get('lo', 62))
        if P.get('celesta') and i % 2 == 1:
            sparkle(m, t, d, name)


def compose(ctx):
    global SR
    SR = ctx['sr']; _cache.clear()
    cue = {c['id']: c for c in ctx['cues']}
    sc = {s['id']: s for s in ctx['scenes']}
    order = [s['id'] for s in ctx['scenes']]
    total = ctx['total']
    m = Mix(ctx['n'])
    # 各章的小节对齐到同一张全片的节拍网格：换章时拍子接着走，不在章首重新数小节（WaterRun 看 r7：「BGM连续性优化」）
    grid0 = sc[order[1]]['start'] + DROP if len(order) > 1 else 0.0
    snap = lambda t: grid0 + round((t - grid0) / BAR) * BAR
    g0 = lambda sid: 0.0 if sid == 'open' else snap(sc[sid]['start'] + DROP)
    g1 = lambda sid: g0(order[order.index(sid) + 1]) if order.index(sid) + 1 < len(order) else total
    at = lambda cid, frac=0.0, dflt=None: (cue[cid]['start'] + frac * (cue[cid]['end'] - cue[cid]['start'])) if cid in cue else dflt

    # 开场：引子 → 大提琴主题 → Gm、A 推到片名 → 片名卡上落 Dm
    tC = at('oT', 0, sc['open']['end'] - 3.0) - 0.1
    names = ['Dm', 'Dm', 'Dm', 'Bb', 'Gm', 'A'] + SUBJ
    bars = bars_between(0.0, tC)
    for i, (t, d) in enumerate(bars):
        name = names[i] if i < len(names) else ['Gm', 'A'][(i - len(names)) % 2]
        bed(m, t, d, name, 0.15 if i < 2 else 0.24 if i >= len(names) else 0.22)
        if i >= 2:
            pattern(m, t, d, name)
    melody(m, 'cello', SUBJECT, bars[6][0], until=tC)
    tE = g1('open')
    m.add('pad', [50, 53, 57, 62, 65, 69], tC, tE - tC, 0.34, 0.0, 0.5)
    m.add('bass', 38, tC, tE - tC, 0.36, 0.0, 0.1)
    m.add('cello', 50, tC, tE - tC, 0.26, -0.15, 0.4)
    m.add('celesta', 74, tC, 2.0, 0.10, 0.3, 0.6)
    m.add('felt', 38, tC, 2 * BEAT, 0.32, -0.1, 0.4)

    for sid in PLAN:
        if sid in sc:
            chapter(m, sid, g0(sid), g1(sid))

    # 崩溃：强行停机时音型停下，只留一口气；重启时回到 Dm，讲重放时音型回来
    t0, t1 = g0('crash'), g1('crash')
    tStop = at('w15', 0.75, t1)
    tRe = at('w16', 0.0, t1)
    m.add('felt', 38, t0, 2 * BEAT, 0.30, -0.1, 0.4)
    for i, (t, d) in enumerate(bars_between(t0, tStop)):
        name = ['Dm', 'Bb', 'F', 'A'][i % 4]
        bed(m, t, d, name, 0.25 if i == 0 else 0.22); pattern(m, t, d, name, cut=tStop)
    if tRe - tStop > 0.3:
        bed(m, tStop, tRe - tStop, 'A', 0.15, 0.24)
    tR = at('w17', 0.0, tRe)
    for i, (t, d) in enumerate(bars_between(tRe, t1)):
        name = SUBJ[i % 6]
        bed(m, t, d, name, 0.24)
        if t >= tR - BAR * 0.5:
            pattern(m, t, d, name)

    # 取舍：前半只有铺底；t5 起音型进来；t11 小提琴奏主题开头；t15 停在 A 上
    t0, t1 = g0('tradeoff'), g1('tradeoff')
    tF, tL, tQ = at('t5', 0.0, t0), at('t11', 0.0, t1), at('t15', 0.0, t1)
    m.add('felt', 38, t0, 2 * BEAT, 0.28, -0.1, 0.4)
    bars = bars_between(t0, t1)
    bL = next((i for i, (t, _) in enumerate(bars) if t >= tL - BAR * 0.5), len(bars))
    bQ = next((i for i, (t, _) in enumerate(bars) if t >= tQ - BAR * 0.5), len(bars))
    for i, (t, d) in enumerate(bars):
        name = 'A' if i >= bQ else SUBJ[i - bL] if i >= bL else ['Bb', 'F', 'Gm', 'A'][i % 4]
        bed(m, t, d, name, 0.20 if i < bL else 0.24)
        if t >= tF - BAR * 0.5 and i < bQ:
            pattern(m, t, d, name)
    if bL < len(bars):
        melody(m, 'violin', HEAD, bars[bL][0], until=t1)

    # 片尾：落在 D 大调
    if 'credits' in sc:
        t0 = sc['credits']['start']
        d = max(2.0, total - t0)
        m.add('pad', [50, 54, 57, 62, 66, 69], t0, d, 0.32, 0.0, 0.5)
        m.add('bass', 38, t0, d * 0.9, 0.30, 0.0, 0.1)
        m.add('celesta', 74, t0, 2.0, 0.09, 0.3, 0.6)
        m.add('felt', 50, t0, 2 * BEAT, 0.26, -0.1, 0.4)
        pattern(m, t0, BAR, 'D', 62, 0.6)
        if total - t0 > 2 * BAR:
            pattern(m, t0 + BAR, BAR, 'D', 62, 0.4)

    add_reverb(m, impulse())
    return m.dry
