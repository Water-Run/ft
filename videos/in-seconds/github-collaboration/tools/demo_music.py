# 审片页的配乐小样：三个方向，各约 60 秒（引子 → 推进 → 最高处 → 收束），写进 out/audition/music/（不入库）。
# 只是给策划者选方向的 Demo；选定后按本片的时间线重写 tools/music.py（compose(ctx)，由 kit/tools/mix.py 调用）。
# 程序合成，只用 numpy；随机数固定种子，重跑结果相同。节拍都落在 0.25 秒的网格上（系列约定）：
#   A「提交」120 拍/分（一拍 0.5 秒）；B「分支与合并」80 拍/分（一拍 0.75 秒）；C「仓库网络」120 拍/分，半拍感。
# 制作者听不到声音：这里只做电平与削波的数值自检，听感由策划者判断。
# 用法（仓库根）：python videos/in-seconds/github-collaboration/tools/demo_music.py
import json, os, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(VIDEO, '..', '..', '..'))
OUT = os.path.join(VIDEO, 'out', 'audition', 'music')
SR = 44100
DUR = 60.0
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
tt = lambda d: np.arange(int(d * SR)) / SR


class Mix:
    def __init__(self, seed):
        self.dry = np.zeros((2, int(DUR * SR) + SR * 3))
        self.wet = np.zeros_like(self.dry)
        self.rng = np.random.default_rng(seed)

    def put(self, sig, t, g=1.0, pan=0.0, send=0.25):
        i = int(round(t * SR))
        if i < 0 or i >= self.dry.shape[1]: return
        j = min(self.dry.shape[1], i + len(sig))
        l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
        s = sig[: j - i] * g
        self.dry[0, i:j] += s * l; self.dry[1, i:j] += s * r
        self.wet[0, i:j] += s * l * send; self.wet[1, i:j] += s * r * send

    def render(self, room=2.2, damp=4500.0, wet=1.0):
        n = self.dry.shape[1]
        out = self.dry.copy()
        for ch in range(2):                       # 合成的混响：衰减的噪声，频域低通，两声道去相关
            ir = self.rng.standard_normal(int(room * SR)) * np.exp(-tt(room) * (6.9 / room))
            L = 1 << int(np.ceil(np.log2(n + len(ir))))
            f = np.fft.rfftfreq(L, 1 / SR)
            lp = 1 / (1 + (f / damp) ** 2)
            ir_f = np.fft.rfft(ir, L) * lp
            ir_f /= np.sqrt(np.sum(np.abs(ir_f) ** 2) / L) + 1e-9
            out[ch] += np.fft.irfft(np.fft.rfft(self.wet[ch], L) * ir_f, L)[:n] * 0.035 * wet
        out = out[:, : int(DUR * SR)]
        fade = int(3.5 * SR)                      # 结尾收口；开头第一拍就起
        out[:, -fade:] *= np.linspace(1, 0, fade) ** 1.6
        rms = np.sqrt(np.mean(out ** 2)) + 1e-12
        out *= 10 ** (-17 / 20) / rms             # 约 −17 dBFS RMS
        return np.tanh(out * 1.05) / 1.05         # 软限幅，峰值留在 −0.5 dBFS 以内


# ── 音色（全部加法合成）──
def adsr(n, a=0.005, r=0.03):
    e = np.ones(n); na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e

def piano(f, d=2.0, v=1.0):
    x = tt(d); s = np.zeros_like(x)
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > 12000: break
        s += np.sin(2 * np.pi * fk * x) * (1 / k ** 1.4) * np.exp(-x * (1.2 + 0.9 * k))
    return s * adsr(len(x), 0.004, 0.08) * v * 0.5

def marimba(f, v=1.0, d=1.3):
    x = tt(d); s = np.zeros_like(x)
    for ratio, amp, dec in ((1, 1, 3.2), (3.93, 0.32, 10), (9.2, 0.1, 24)):
        s += np.sin(2 * np.pi * f * ratio * x) * amp * np.exp(-x * dec)
    return s * adsr(len(x), 0.002, 0.05) * v * 0.55

def vibes(f, v=1.0, d=2.2):
    x = tt(d)
    s = np.sin(2 * np.pi * f * x) * np.exp(-x * 1.1) + 0.22 * np.sin(2 * np.pi * f * 4 * x) * np.exp(-x * 5)
    return s * (1 - 0.22 * (0.5 + 0.5 * np.sin(2 * np.pi * 5.2 * x))) * adsr(len(x), 0.003, 0.2) * v * 0.45

def bell(f, v=1.0, d=3.0):
    x = tt(d); s = np.zeros_like(x)
    for ratio, amp, dec in ((1, 1, 1.4), (2.76, 0.45, 2.4), (5.4, 0.2, 3.8), (8.93, 0.08, 6)):
        s += np.sin(2 * np.pi * f * ratio * x) * amp * np.exp(-x * dec)
    return s * adsr(len(x), 0.002, 0.3) * v * 0.3

def pad(freqs, d, v=1.0, bright=0.78):
    x = tt(d); s = np.zeros_like(x)
    for f in freqs:
        for det in (-0.0028, 0.0031):
            for k in range(1, 11):
                if f * k > 6000: break
                s += np.sin(2 * np.pi * f * (1 + det) * k * x + k * 0.7) * (bright ** k) / k
    s /= max(1, len(freqs))
    return s * adsr(len(x), min(1.6, d / 3), min(1.6, d / 3)) * v * 0.32

def glass(f, v=1.0, d=0.4):
    x = tt(d)
    return np.sin(2 * np.pi * f * x + 1.6 * np.exp(-x * 9) * np.sin(2 * np.pi * 2 * f * x)) * np.exp(-x * 7) * adsr(len(x), 0.002, 0.05) * v * 0.35

def sub(f, d, v=1.0):
    x = tt(d)
    return (np.sin(2 * np.pi * f * x) + 0.18 * np.sin(4 * np.pi * f * x)) * adsr(len(x), 0.012, 0.09) * v * 0.6

def kick(v=1.0):
    x = tt(0.38); ph = 2 * np.pi * np.cumsum(44 + 85 * np.exp(-x * 32)) / SR
    return np.sin(ph) * np.exp(-x * 8.5) * adsr(len(x), 0.001, 0.05) * v * 0.8

def click(rng, v=1.0):                               # 机械键盘式的「咔」：极短的噪声瞬态加一点 2.6 kHz 的木质感
    x = tt(0.03); n = np.diff(rng.standard_normal(len(x) + 1))
    return (n * np.exp(-x * 700) * 0.5 + np.sin(2 * np.pi * 2600 * x) * np.exp(-x * 260) * 0.4) * v * 0.32

def shaker(rng, v=1.0):
    x = tt(0.08); n = np.diff(np.diff(rng.standard_normal(len(x) + 2)))
    return n * np.exp(-x * 55) * adsr(len(x), 0.006, 0.02) * v * 0.07

def rim(rng, v=1.0):
    x = tt(0.09)
    return (np.sin(2 * np.pi * 1750 * x) * np.exp(-x * 60) + 0.4 * rng.standard_normal(len(x)) * np.exp(-x * 120)) * v * 0.22


def section(t):
    return 'intro' if t < 12 else 'build' if t < 30 else 'peak' if t < 48 else 'res'


# ── A「提交」：F 大调，钢琴分解和弦 + 键盘声的八分音符；最高处加一句钟片旋律 ──
def demo_a():
    m = Mix(101); B = 0.5; BAR = 4 * B
    prog = [[53, 57, 60, 64], [52, 55, 60, 64], [50, 57, 60, 65], [46, 53, 57, 62]]      # Fmaj7  C/E  Dm7  Bbmaj9
    roots = [41, 40, 38, 34]
    motif = [72, 69, 65, 67, 69, 72, 74, 72]                                               # 钟片：C A F G | A C D C
    for bar in range(int(DUR / BAR)):
        t0 = bar * BAR; c = prog[(bar // 2) % 4]; sec = section(t0)
        if bar % 2 == 0:
            for k, n in enumerate(c):
                m.put(piano(hz(n), 3.6, 0.75 if sec == 'intro' else 0.5), t0 + k * 0.012, pan=-0.2 + 0.13 * k, send=0.35)
        if sec != 'intro':
            pattern = [c[0], c[2], c[1] + 12, c[2], c[3], c[2], c[1] + 12, c[2]]
            for i, n in enumerate(pattern):
                m.put(piano(hz(n + 12), 0.9, 0.24 + 0.06 * (i % 2 == 0)), t0 + i * B / 2, pan=0.25, send=0.3)
            for i in range(8):
                if sec == 'res' and i % 2: continue
                m.put(click(m.rng, 0.6 + 0.4 * m.rng.random() if i % 2 == 0 else 0.35), t0 + i * B / 2 + 0.004 * m.rng.standard_normal(), pan=0.45, send=0.05)
        if sec in ('peak', 'res'):
            m.put(sub(hz(roots[(bar // 2) % 4]), BAR * 0.95, 0.42), t0, send=0.0)
        if sec == 'peak':
            m.put(kick(0.32), t0); m.put(kick(0.22), t0 + 2 * B)
            if bar % 2 == 0:                                                               # 每两小节一句，四分音符
                for i, n in enumerate(motif):
                    m.put(bell(hz(n + 12), 0.3), t0 + i * B, pan=-0.3, send=0.45)
    m.put(piano(hz(53), 6, 0.4), 56.0); m.put(piano(hz(57), 6, 0.35), 56.02); m.put(piano(hz(64), 6, 0.3), 56.04); m.put(piano(hz(67), 6, 0.25), 56.06)
    return m.render(room=1.8, damp=5200)


# ── B「分支与合并」：D 大调，两支马林巴从同一句出发、分成两条线，最高处的末尾并回同度 ──
def demo_b():
    m = Mix(202); B = 0.75; E = B / 2; BAR = 4 * B
    chords = [[50, 57, 61, 66], [47, 54, 57, 62], [43, 50, 54, 59], [45, 52, 55, 62]]     # Dmaj7  Bm7  Gmaj7  A7sus
    roots = [38, 35, 31, 33]
    line1 = [74, 76, 78, 81, 78, 76, 74, 69]                                                # 主线
    line2 = [69, 71, 74, 78, 76, 74, 71, 66]                                                # 分支：同一形状，换成和声里的另一条路
    for bar in range(int(DUR / BAR)):
        t0 = bar * BAR; ch = chords[bar % 4]; sec = section(t0)
        merged = t0 >= 45.0                                                                 # 第 16 小节起合并
        for i in range(8):
            n1 = line1[i] + (0 if bar % 2 == 0 else -2 if i in (2, 3) else 0)
            m.put(marimba(hz(n1), 0.62 if i % 2 == 0 else 0.45), t0 + i * E, pan=-0.35 if not merged else -0.05, send=0.3)
            if sec != 'intro':
                if merged:
                    n2 = n1 - 12
                    m.put(vibes(hz(n2), 0.42), t0 + i * E, pan=0.05, send=0.35)
                else:
                    n2 = line2[(i + 1) % 8] if sec == 'build' else line2[(7 - i) % 8]           # 推进：错一个八分的卡农；最高处：反向，两条线各走各的
                    m.put(vibes(hz(n2), 0.38), t0 + i * E + (E if sec == 'build' and i == 7 else 0), pan=0.4, send=0.35)
        m.put(pad([hz(n) for n in ch], BAR + 0.6, 0.55 if sec != 'intro' else 0.35), t0, send=0.5)
        if sec in ('peak', 'res'):
            m.put(sub(hz(roots[bar % 4]), BAR * 0.9, 0.42), t0, send=0.0)
            for i in range(4):
                m.put(shaker(m.rng, 0.8 if i % 2 else 0.5), t0 + i * B + E, pan=0.3, send=0.1)
        if merged and bar == 15:
            m.put(bell(hz(86), 0.5), t0, send=0.6)                                          # 合并的那一拍
    m.put(marimba(hz(74), 0.6, 2.5), 57.0, send=0.4); m.put(vibes(hz(62), 0.5, 3.0), 57.0, send=0.4)
    return m.render(room=2.6, damp=4200)


# ── C「仓库网络」：A 小调到 C 的明亮色彩，铺底 + 玻璃质感的十六分音符琶音；半拍的底鼓，旋律很慢 ──
def demo_c():
    m = Mix(303); B = 0.5; S = B / 4; BAR = 4 * B
    chords = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [48, 55, 57, 62, 64], [43, 50, 55, 57, 62]]   # Am9  Fmaj9  C6/9  G6sus
    roots = [33, 29, 36, 31]
    lead = [76, None, 74, 72, None, 71, 72, None]
    for bar in range(int(DUR / BAR)):
        t0 = bar * BAR; ch = chords[(bar // 2) % 4]; sec = section(t0)
        if bar % 2 == 0:
            m.put(pad([hz(n) for n in ch], 2 * BAR + 0.8, 1.0 if sec in ('intro', 'res') else 0.6, bright=0.74 if sec in ('intro', 'res') else 0.8), t0, send=0.55)
        if sec != 'intro' or bar >= 4:
            ramp = min(1.0, max(0.0, (t0 - 8) / 14))
            if sec == 'res': ramp = max(0.0, 1 - (t0 - 48) / 8)
            arp = [ch[0] + 12, ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12]
            for i in range(16):
                m.put(glass(hz(arp[i % 8]), (0.5 if i % 4 == 0 else 0.3) * ramp), t0 + i * S, pan=0.5 * np.sin(i * 0.8), send=0.4)
        if sec in ('build', 'peak'):
            m.put(sub(hz(roots[(bar // 2) % 4]), BAR * 0.95, 0.3 if sec == 'build' else 0.45), t0, send=0.0)
        if sec == 'peak':
            m.put(kick(0.35), t0); m.put(rim(m.rng, 0.45), t0 + 2 * B, pan=-0.1, send=0.25)
            for i in range(8):
                m.put(shaker(m.rng, 0.6), t0 + i * B / 2 + B / 4, pan=0.35, send=0.05)
            if bar % 2 == 0:
                for i, n in enumerate(lead):
                    if n: m.put(vibes(hz(n), 0.4, 2.4), t0 + i * B, pan=-0.25, send=0.5)
    m.put(pad([hz(n) for n in [45, 57, 60, 64, 71]], 6.5, 0.6), 53.5, send=0.6)
    return m.render(room=3.0, damp=3800)


def write(name, x):
    os.makedirs(OUT, exist_ok=True)
    wav = os.path.join(OUT, name + '.wav')
    pcm = (np.clip(x.T, -1, 1) * 32767).astype('<i2')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    exe = '.exe' if os.name == 'nt' else ''
    ff = os.path.join(REPO, 'assets', 'ffmpeg', 'bin', 'ffmpeg' + exe)
    ff = ff if os.path.exists(ff) else 'ffmpeg'
    subprocess.run([ff, '-y', '-loglevel', 'error', '-i', wav, '-b:a', '192k', os.path.join(OUT, name + '.mp3')], check=True)
    os.remove(wav)
    peak = float(np.max(np.abs(x))); rms = float(np.sqrt(np.mean(x ** 2)))
    sections = {k: float(np.sqrt(np.mean(x[:, int(a * SR):int(b * SR)] ** 2))) for k, (a, b) in {'intro': (0, 12), 'build': (12, 30), 'peak': (30, 48), 'res': (48, 60)}.items()}
    return {'peak_dbfs': round(20 * np.log10(peak), 1), 'rms_dbfs': round(20 * np.log10(rms), 1), 'sections_rms_dbfs': {k: round(20 * np.log10(v + 1e-12), 1) for k, v in sections.items()}}


if __name__ == '__main__':
    stats = {}
    for name, fn in (('A-commit', demo_a), ('B-branch-merge', demo_b), ('C-network', demo_c)):
        stats[name] = write(name, fn()); print(name, stats[name], file=sys.stderr)
    json.dump(stats, open(os.path.join(OUT, 'stats.json'), 'w'), indent=1)
