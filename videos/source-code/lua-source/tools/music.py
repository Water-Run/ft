"""Lua源码全解析 · 配乐「月下」（程序合成，无外部素材）。

用法
  python tools/music.py demo moon <out.wav> [秒数]   审片页的小样（引子、推进、最高处、收束）
  由 mix.py 调用 compose(ctx)                        正式配乐（audio.music 指向本文件）

策划者的要求（2026-11-16）：体现「月、简洁、巴西」，按这个优先级。
  月    72 拍/分；D 大调的 maj9、m11、maj7#11 和弦，长而暗的混响；钟片式的四音下行动机。
  简洁  只有四层：铺底、尼龙弦拨弦、低音、钟片；不用鼓。讲解时只留铺底与拨弦。
  巴西  拨弦按波萨诺瓦的切分扫弦（两小节一型），低音在第一、三拍落下根音与五音。
拨弦用 Karplus–Strong 物理模型：一段噪声在长度为一个周期的延迟线里反复取平均，按周期分块向量化计算。
确定性：随机数全部固定种子；同样的参数得到逐样本相同的结果。
"""
import sys
import wave

import numpy as np

SR = 48000
FADE = (3.0, 5.0)
BPM = 72.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT

# 两小节一个和弦，八小节一循环：Dmaj9 — Bm11 — Gmaj7#11 — Em9 | A7sus4
#   (低音, 拨弦的四个音, 铺底的音)
CHORDS = [
    (50, (54, 57, 61, 64), (66, 69, 73)),      # Dmaj9
    (50, (54, 57, 61, 64), (66, 69, 73)),
    (47, (57, 62, 64, 66), (62, 66, 69)),      # Bm11
    (47, (57, 62, 64, 66), (62, 66, 69)),
    (43, (59, 61, 62, 66), (66, 71, 73)),      # Gmaj7#11
    (43, (59, 61, 62, 66), (66, 71, 73)),
    (40, (55, 59, 62, 66), (67, 71, 74)),      # Em9
    (45, (55, 59, 62, 64), (67, 69, 74)),      # A7sus4
]
# 波萨诺瓦扫弦：以八分音符为格，两小节 16 格
COMP = (0, 3, 6, 8, 10, 13)
# 钟片动机：四个音下行，每拍一个，下一小节休止
MOTIF_A = (81, 78, 76, 74)                     # A5 F#5 E5 D5
MOTIF_B = (81, 78, 76, 73)                     # 以 C#5 收在 Bm 与 A 上


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


_cache = {}


def cached(key, fn):
    if key not in _cache:
        _cache[key] = fn()
    return _cache[key]


def nylon(m, dur, seed=0):
    """Karplus–Strong 拨弦。延迟线长度取整后，整段按音高比例重采样修正音准。"""
    def make():
        f = mtof(m)
        period = SR / f
        N = max(8, int(round(period - 0.5)))         # 两点平均额外延迟半个样本
        n = int(dur * SR * (N + 0.5) / period) + N + 2
        rng = np.random.default_rng(7000 + int(m) * 13 + seed)
        burst = rng.uniform(-1, 1, N)
        for _ in range(6):                           # 尼龙弦：激励先做低通，音色更圆，起音不刺耳
            burst = 0.25 * np.roll(burst, 1) + 0.5 * burst + 0.25 * np.roll(burst, -1)
        pos = int(N * 0.18)                          # 拨弦位置造成的梳状滤波
        burst = burst - 0.6 * np.roll(burst, pos)
        y = np.zeros(n)
        y[:N] = burst
        rho = 0.9965 ** (220.0 / max(f, 60.0)) ** 0.35
        for s in range(N, n, N):
            e = min(s + N, n)
            a = y[s - N:e - N]
            b = y[s - N - 1:e - N - 1] if s - N - 1 >= 0 else np.concatenate([[0.0], y[s - N:e - N - 1]])
            y[s:e] = rho * 0.5 * (a + b)
        # 重采样到准确音高与时长
        k = (N + 0.5) / period
        out_n = int(dur * SR)
        src = np.arange(out_n) * k
        z = np.interp(src, np.arange(n), y)
        t = np.arange(out_n) / SR
        z *= np.minimum(1, t / 0.004) * np.minimum(1, (dur - t) / 0.05).clip(0, 1)
        return z * 0.5
    return cached(('nylon', m, round(dur, 3), seed), make)


def bell(m, dur):
    """钟片：基音加两个不谐和泛音，软起音，长衰减。"""
    def make():
        n = int(dur * SR)
        t = np.arange(n) / SR
        f = mtof(m)
        y = (np.sin(2 * np.pi * f * t) * np.exp(-t * 1.1)
             + 0.28 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3.2)
             + 0.10 * np.sin(2 * np.pi * f * 5.40 * t) * np.exp(-t * 7.0))
        return y * np.minimum(1, t / 0.008) * 0.2
    return cached(('bell', m, round(dur, 3)), make)


def pad(notes, dur, attack=2.4, release=3.2):
    """铺底：每个音两支略微失谐的正弦加少量二次谐波，慢起慢收。"""
    def make():
        n = int((dur + release) * SR)
        t = np.arange(n) / SR
        L = np.zeros(n)
        R = np.zeros(n)
        for i, m in enumerate(notes):
            f = mtof(m)
            for det, ch in ((-0.0021, L), (0.0019, R)):
                ff = f * (1 + det)
                ch += np.sin(2 * np.pi * ff * t + i) + 0.12 * np.sin(4 * np.pi * ff * t)
        env = np.minimum(1, t / attack) * np.where(t < dur, 1.0, np.exp(-(t - dur) / (release / 3)))
        g = env / (2 * max(1, len(notes))) * 0.35
        return np.vstack([L * g, R * g])
    return cached(('pad', tuple(notes), round(dur, 3)), make)


def bass(m, dur):
    def make():
        n = int(dur * SR)
        t = np.arange(n) / SR
        f = mtof(m)
        y = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)
        env = np.minimum(1, t / 0.012) * np.exp(-t * 1.6)
        return y * env * 0.45
    return cached(('bass', m, round(dur, 3)), make)


class Track:
    def __init__(self, n):
        self.st = np.zeros((2, n))
        self.n = n

    def add(self, x, at, gain=1.0, pan=0.0):
        i = int(round(at * SR))
        if x.ndim == 1:
            gl, gr = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
            x = np.vstack([x * gl, x * gr])
        if i >= self.n:
            return
        j = min(self.n, i + x.shape[1])
        self.st[:, i:j] += x[:, :j - i] * gain


def reverb(st, seconds=3.6, mix=0.32, seed=11):
    """暗色混响：指数衰减的噪声脉冲，脉冲本身先做低通；变换长度取 2 的幂。"""
    rng = np.random.default_rng(seed)
    m = int(seconds * SR)
    t = np.arange(m) / SR
    size = 1 << int(np.ceil(np.log2(st.shape[1] + m)))
    freqs = np.fft.rfftfreq(size, 1 / SR)
    lp = 1 / (1 + (freqs / 3200.0) ** 2)
    out = np.zeros_like(st)
    for c in range(2):
        ir = rng.standard_normal(m) * np.exp(-t * (6.9 / seconds))
        ir[: int(0.02 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        wet = np.fft.irfft(np.fft.rfft(st[c], size) * np.fft.rfft(ir, size) * lp, size)[: st.shape[1]]
        out[c] = st[c] * (1 - mix) + wet * mix * 1.8
    return out


def moon(total, sections):
    """sections: [(秒, 强度)]，强度 0 只有铺底，1 加拨弦（稀疏），1.5 拨弦扫弦加低音，2 以上加钟片动机。"""
    n = int(total * SR) + SR * 6
    tr = {k: Track(n) for k in ('pad', 'gtr', 'bass', 'bell')}
    inten = lambda t: float(np.interp(t, [s[0] for s in sections], [s[1] for s in sections]))
    nbars = int(total / BAR) + 1
    motif_n = 0
    for b in range(nbars):
        t0 = b * BAR
        if t0 >= total:
            break
        k = inten(t0)
        root, voicing, top = CHORDS[b % 8]
        if b % 2 == 0 or b % 8 == 7:
            span = BAR * (1 if b % 8 >= 6 else 2)
            tr['pad'].add(pad(top, span + 0.3), t0, 0.85 if k < 2 else 1.0)
        if k >= 0.5:
            hits = COMP if k >= 1.2 else (0,)
            for step in hits:
                if (b % 2 == 0 and step >= 8) or (b % 2 == 1 and step < 8):
                    continue
                ts = t0 + (step % 8) * BEAT / 2
                accent = 1.0 if step in (0, 8) else 0.8
                for j, m in enumerate(voicing):                # 由低到高的轻扫
                    tr['gtr'].add(nylon(m, 1.4 if k >= 1.2 else 2.6, seed=j), ts + j * 0.018,
                                  0.32 * accent * min(1.0, 0.5 + 0.2 * k), pan=-0.22 + 0.08 * j)
        if k >= 1.2:
            fifth = root + 7 if root + 7 <= 52 else root - 5      # 低音在 E2–E3 之间（82–165 Hz）
            tr['bass'].add(bass(root, BEAT * 1.8), t0, 0.8)
            tr['bass'].add(bass(fifth, BEAT * 1.6), t0 + 2 * BEAT, 0.55)
        if k >= 2 and b % 2 == 0:
            motif = MOTIF_A if (motif_n % 2 == 0) else MOTIF_B
            for i, m in enumerate(motif):
                tr['bell'].add(bell(m, 4.0), t0 + i * BEAT, 0.95 - 0.1 * i, pan=0.3)
            motif_n += 1
    mix = tr['pad'].st * 0.8 + tr['gtr'].st * 1.0 + tr['bass'].st * 0.6 + tr['bell'].st * 0.9
    return reverb(mix[:, : int(total * SR)])


STYLES = {'moon': moon}
# 小样（84 秒，约 25 小节）：引子（铺底，几下拨弦）→ 推进（扫弦与低音）→ 最高处（钟片动机）→ 收束
DEMO_SECTIONS = [(0, 0.2), (6, 0.6), (13, 1.3), (40, 1.4), (40.1, 2.2), (66, 2.2), (67, 1.0), (76, 0.5), (84, 0.2)]


def master(st, total):
    n = st.shape[1]
    t = np.arange(n) / SR
    env = np.minimum(1, t / FADE[0]) * np.minimum(1, np.maximum(0, (total - t) / FADE[1]))
    st = st * env
    peak = np.abs(st).max() or 1
    return st * (10 ** (-1.0 / 20) / peak)


def write_wav(path, st):
    data = (np.clip(st.T, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def compose(ctx):
    """正式配乐：开场、认识 Lua 与结语用到钟片动机；讲机制的章节只留铺底与拨弦；章节卡处推进一下。
    段落由 ctx['scenes'] 定位，配乐方向确认后再细排。"""
    global SR
    SR = ctx['sr']
    total = ctx['total']
    sections = [(0.0, 0.4)]
    for sc in ctx['scenes']:
        high = sc['id'] in ('open', 'intro', 'end')
        sections += [(sc['start'], 1.4), (sc['start'] + 4.0, 2.2 if high else 1.0), (max(sc['start'] + 4.1, sc['end'] - 2.0), 2.2 if high else 1.0)]
    sections.append((total, 0.2))
    return moon(total, sections)


if __name__ == '__main__':
    if len(sys.argv) >= 4 and sys.argv[1] == 'demo':
        name, out = sys.argv[2], sys.argv[3]
        total = float(sys.argv[4]) if len(sys.argv) > 4 else 84.0
        st = STYLES[name](total, DEMO_SECTIONS)
        write_wav(out, master(st, total))
        print('wrote', out, f'{total:.0f}s')
    else:
        print(__doc__)
