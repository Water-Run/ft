# 审片页的三段配乐小样（各约 60 秒：引子 → 推进 → 最高处 → 收束）。确定性合成，不用外部素材。
# 用法：python tools/music_demos.py <输出目录>   → demo-a.wav、demo-b.wav、demo-c.wav
# A「冷光」：OpenAI 段的气质。108 拍/分，A 小调，正弦与三角波的十六分拨音，轻微的点击节拍，留白多。
# B「暖木」：Anthropic 段的气质。92 拍/分，降 E 大调，木琴似的 FM 槌音与温暖的失谐铺底，沙锤。
# C「双色」：同一个动机与速度（100 拍/分），前半用冷的音色，后半换成暖的音色，示意片中按段落换风格。
# 选定后按本片时间线重写成 tools/music.py（compose(ctx)），段落从 ctx["scenes"] 取。
import os, sys, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(20261103)

def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)

_cache = {}
def tone(kind, midi, dur):
    key = (kind, midi, round(dur, 3))
    if key in _cache:
        return _cache[key]
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(midi)
    if kind == 'pluck':        # 冷：正弦 + 少量三倍泛音，快起快落
        x = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 3 * f * t)
        env = np.exp(-t * 7.0) * np.minimum(1, t / 0.004)
    elif kind == 'glass':      # 冷：高处的玻璃感（正弦 + 失谐）
        x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.004 * t) + 0.12 * np.sin(2 * np.pi * 4.01 * f * t)
        env = np.exp(-t * 3.0) * np.minimum(1, t / 0.01)
    elif kind == 'mallet':     # 暖：FM 槌音（木琴）
        mod = np.sin(2 * np.pi * f * 4 * t) * 2.2 * np.exp(-t * 18)
        x = np.sin(2 * np.pi * f * t + mod)
        env = np.exp(-t * 5.5) * np.minimum(1, t / 0.002)
    elif kind == 'pad':        # 暖或冷的铺底：三条失谐的锯齿近似，低通靠少量泛音
        x = np.zeros(n)
        for d in (-0.006, 0, 0.007):
            for h in range(1, 6):
                x += np.sin(2 * np.pi * f * (1 + d) * h * t) / (h ** 1.6)
        a = min(1.2, dur / 3)
        env = np.minimum(1, t / a) * np.minimum(1, (dur - t) / a)
    elif kind == 'coldpad':    # 冷的铺底：纯正弦和弦音
        x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
        a = min(1.5, dur / 3)
        env = np.minimum(1, t / a) * np.minimum(1, (dur - t) / a)
    elif kind == 'bass':
        x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
        env = np.minimum(1, t / 0.01) * np.exp(-t * 1.8)
    else:
        raise ValueError(kind)
    y = (x * env).astype(np.float32)
    _cache[key] = y
    return y

def noise_hit(kind, dur):
    key = ('n', kind, dur)
    if key in _cache:
        return _cache[key]
    n = int(dur * SR); t = np.arange(n) / SR
    w = rng.standard_normal(n).astype(np.float32)
    if kind == 'click':        # 高频短促
        w = np.diff(np.concatenate([[0], w])) * np.exp(-t * 90)
    elif kind == 'shaker':
        w = np.diff(np.concatenate([[0], w])) * np.exp(-t * 35) * np.minimum(1, t / 0.006)
    elif kind == 'kick':
        f = 50 + 70 * np.exp(-t * 30)
        w = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    y = w.astype(np.float32); _cache[key] = y
    return y

class Track:
    def __init__(self, sec):
        self.L = np.zeros(int(sec * SR) + SR * 4, np.float32); self.R = self.L.copy(); self.sec = sec
    def add(self, y, at, gain=1.0, pan=0.0):
        i = int(at * SR); j = min(len(self.L), i + len(y))
        if i >= len(self.L): return
        l = gain * np.sqrt((1 - pan) / 2); r = gain * np.sqrt((1 + pan) / 2)
        self.L[i:j] += y[:j - i] * l; self.R[i:j] += y[:j - i] * r
    def finish(self, room=0.25):
        out = np.stack([self.L, self.R])
        # 简单的多抽头延迟模拟空间感（逐抽头向量相加，确定性）
        wet = np.zeros_like(out)
        for k, (d, g) in enumerate([(0.031, 0.5), (0.053, 0.42), (0.089, 0.33), (0.137, 0.25), (0.211, 0.18), (0.293, 0.12)]):
            s = int(d * SR); ch = k % 2
            wet[ch, s:] += out[1 - ch, :-s] * g
            wet[1 - ch, s:] += out[ch, :-s] * g * 0.6
        out = out + room * wet
        n = int(self.sec * SR); out = out[:, :n]
        fade_in, fade_out = int(1.0 * SR), int(3.0 * SR)
        out[:, :fade_in] *= np.linspace(0, 1, fade_in)
        out[:, -fade_out:] *= np.linspace(1, 0, fade_out) ** 1.5
        return out / (np.abs(out).max() + 1e-9) * 0.89

def section_level(t, marks):
    """marks: [(起点秒, 电平)]，返回 t 处的电平（阶梯）"""
    lv = 0
    for s, v in marks:
        if t >= s: lv = v
    return lv

def chords_of(prog, beats_per_chord, bpm, total):
    """返回 [(起点, 时长, 和弦音列表)]"""
    out, t, i = [], 0.0, 0
    dur = beats_per_chord * 60 / bpm
    while t < total:
        out.append((t, dur, prog[i % len(prog)])); t += dur; i += 1
    return out

# ── A 冷光 ──
def demo_a(sec=60):
    bpm = 108; beat = 60 / bpm; tr = Track(sec)
    prog = [[57, 60, 64, 67, 71], [53, 57, 60, 64], [48, 52, 55, 60, 62], [55, 59, 62, 64]]   # Am9 Fmaj7 Cadd9 G6
    marks = {'arp': [(7.1, 0.5), (17.8, 0.8), (35.6, 1.0), (49.0, 0.35)],
             'bass': [(17.8, 0.8), (49.0, 0.0)], 'click': [(26.7, 0.6), (35.6, 1.0), (49.0, 0.0)],
             'glass': [(35.6, 0.7), (53.0, 0.0)]}
    for t0, d, ch in chords_of(prog, 8, bpm, sec):
        for m in ch[:4]: tr.add(tone('coldpad', m, d + 0.6), t0, 0.07, pan=(m % 5 - 2) * 0.15)
        b = ch[0] - 12
        for k in range(8):
            t = t0 + k * beat
            lv = section_level(t, marks['bass'])
            if lv and k in (0, 3, 6): tr.add(tone('bass', b, beat * 1.5), t, 0.30 * lv)
            ck = section_level(t, marks['click'])
            if ck: tr.add(noise_hit('click', 0.05), t + beat / 2, 0.05 * ck, pan=0.3)
        patt = [0, 2, 1, 3, 2, 4, 1, 2]
        for k in range(32):
            t = t0 + k * beat / 4
            lv = section_level(t, marks['arp'])
            if not lv or (k % 4 == 3 and t < 35.6): continue
            m = ch[patt[k % 8] % len(ch)] + (12 if t >= 35.6 and k % 8 in (5, 6) else 0)
            tr.add(tone('pluck', m + 12, 0.35), t, 0.16 * lv, pan=0.35 * np.sin(k * 0.7))
        gl = section_level(t0, marks['glass'])
        if gl:
            for k, m in enumerate([ch[-1] + 24, ch[1] + 24]):
                tr.add(tone('glass', m, 2.4), t0 + k * 4 * beat, 0.06 * gl, pan=-0.4 + 0.8 * k)
    return tr.finish(room=0.3)

# ── B 暖木 ──
def demo_b(sec=60):
    bpm = 92; beat = 60 / bpm; tr = Track(sec)
    prog = [[51, 55, 58, 62], [48, 51, 55, 58], [44, 48, 51, 55], [46, 50, 53, 55]]   # Ebmaj7 Cm7 Abmaj7 Bb6
    motif = [0, 1, 2, 3, 2, 1, 3, 2]
    for t0, d, ch in chords_of(prog, 8, bpm, sec):
        for m in ch: tr.add(tone('pad', m, d + 0.8), t0, 0.035, pan=(m % 4 - 1.5) * 0.2)
        lv_m = section_level(t0, [(5.2, 0.45), (15.6, 0.8), (31.3, 1.0), (46.9, 0.4)])
        lv_b = section_level(t0, [(15.6, 0.8), (46.9, 0.0)])
        lv_s = section_level(t0, [(26.1, 0.7), (31.3, 1.0), (46.9, 0.0)])
        for k in range(8):
            t = t0 + k * beat
            if lv_m:
                m = ch[motif[k] % len(ch)] + 12
                tr.add(tone('mallet', m, 1.2), t, 0.22 * lv_m, pan=-0.25 + 0.5 * (k % 2))
                if t >= 31.3 and k % 2 == 1:
                    tr.add(tone('mallet', m + 7, 0.9), t + beat / 2, 0.11 * lv_m, pan=0.4)
            if lv_b and k in (0, 4, 6): tr.add(tone('bass', ch[0] - 12, beat * 2), t, 0.18 * lv_b)
            if lv_s:
                tr.add(noise_hit('shaker', 0.09), t, 0.035 * lv_s, pan=0.25)
                tr.add(noise_hit('shaker', 0.09), t + beat / 2, 0.022 * lv_s, pan=0.25)
            if lv_s and k in (0, 4): tr.add(noise_hit('kick', 0.35), t, 0.12 * lv_s)
    return tr.finish(room=0.35)

# ── C 双色 ──
def demo_c(sec=60):
    bpm = 100; beat = 60 / bpm; tr = Track(sec)
    prog = [[50, 53, 57, 60], [46, 50, 53, 57], [43, 46, 50, 53], [45, 49, 52, 55]]   # Dm7 Bbmaj7 Gm7 A7
    motif = [(0, 0), (0.75, 2), (1.5, 1), (2, 3), (3, 2)]                          # (拍, 和弦音序号)
    SWITCH = 28.8                                                                  # 前冷后暖
    for t0, d, ch in chords_of(prog, 8, bpm, sec):
        warm = t0 >= SWITCH
        for m in ch: tr.add(tone('pad' if warm else 'coldpad', m, d + 0.6), t0, 0.04 if warm else 0.07, pan=(m % 4 - 1.5) * 0.2)
        lv = section_level(t0, [(4.8, 0.5), (14.4, 0.85), (SWITCH, 0.8), (38.4, 1.0), (52.8, 0.35)])
        lv_b = section_level(t0, [(14.4, 0.8), (52.8, 0.0)])
        for bar in range(2):
            for bt, idx in motif:
                t = t0 + (bar * 4 + bt) * beat
                m = ch[idx % len(ch)] + 12 + (12 if (t >= 38.4 and t < 52.8 and bt >= 2) else 0)
                if warm: tr.add(tone('mallet', m, 1.1), t, 0.22 * lv, pan=0.3 * np.sin(t))
                else: tr.add(tone('pluck', m + 12, 0.45), t, 0.17 * lv, pan=0.3 * np.sin(t))
            if lv_b:
                for k in (0, 2.5):
                    tr.add(tone('bass', ch[0] - 12, beat * 1.8), t0 + (bar * 4 + k) * beat, 0.15 * lv_b)
        for k in range(8):
            t = t0 + k * beat
            if 19.2 <= t < 52.8:
                if warm: tr.add(noise_hit('shaker', 0.09), t + beat / 2, 0.03, pan=0.25)
                else: tr.add(noise_hit('click', 0.05), t + beat / 2, 0.05, pan=-0.25)
    return tr.finish(room=0.3)

def write_wav(path, x):
    y = (np.clip(x, -1, 1) * 32767).astype('<i2').T.copy()
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    for name, fn in (('a', demo_a), ('b', demo_b), ('c', demo_c)):
        write_wav(os.path.join(out, 'demo-%s.wav' % name), fn())
        print('demo-%s.wav' % name)
