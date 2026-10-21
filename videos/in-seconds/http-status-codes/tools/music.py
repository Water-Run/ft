# 本片的配乐：8 位电子乐，90 年代计算机的音色（策划者 2026-10-21 的硬约束）。程序合成，不用任何外部素材。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music 写成 "tools/music.py"）：compose(ctx) 返回 (2, N) 的数组，电平与旁白压低由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio, lang }
# 音色只有游戏机芯片的四路：两路方波（占空比 12.5% / 25% / 50%）、一路 4 位阶梯的三角波（低音）、一路线性反馈移位寄存器的噪声（鼓）。
# 音量包络按 60 Hz 的帧一级一级地走（芯片的做法），不是平滑的。
# 速度 120 拍/分：一拍 0.5 秒，十六分音符 0.125 秒；画面上的重音吸附在 0.25 秒的格上，正好落在八分音符上。
# 编排按场景：open 引子，片名卡上一记合奏；what 起鼓；history 抽掉鼓，只剩细占空比的琶音（「从前」）；common 最密；
# who 换到更暗的和声；close 主旋律进来，x4 那一句抬起；outro 收在一个长和弦上。各段从最近的一拍开始（与全片的拍子同格）。
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 120.0
BEAT = 60.0 / BPM
STEP = BEAT / 4                          # 十六分音符
BAR = 4 * BEAT
FADE = (0.02, 0.8)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# 和弦：根音（MIDI）与三个和弦音。A 小调
CH = {
    'Am': (45, [57, 60, 64]), 'F': (41, [57, 60, 65]), 'C': (48, [55, 60, 64]), 'G': (43, [55, 59, 62]),
    'Em': (40, [55, 59, 64]), 'E': (40, [56, 59, 64]), 'Dm': (38, [57, 62, 65]), 'Bb': (46, [58, 62, 65]),
}
PROG = {
    'open': ['Am', 'Am', 'F', 'G'],
    'what': ['Am', 'F', 'C', 'G'],
    'history': ['Am', 'Em', 'F', 'E'],
    'common': ['Am', 'F', 'C', 'G'],
    'who': ['Dm', 'Am', 'Bb', 'E'],
    'close': ['F', 'G', 'Am', 'Am'],
    'outro': ['Am'],
}
# 鼓：每小节 16 格。K 底鼓、S 军鼓、h 闭镲、o 开镲
DRUMS = {
    'what':   ['K...S...K.K.S...', '..h...h...h...h.'],
    'common': ['K..KS...K.K.S..K', 'hhhhhhhhhhhhhhhh'],
    'who':    ['K...S..K..K.S...', '..h...h...h.o...'],
    'close':  ['K...K...K...K...', '..o...o...o...o.', '....S.......S...'],
}
# 主旋律（close 段）：每小节的十六分音符，数字是相对 A4（69）的半音，'.' 延续、'-' 休止
MELODY = [
    ['0', '.', '.', '3', '.', '.', '7', '.', '5', '.', '3', '.', '0', '.', '-', '-'],
    ['2', '.', '.', '5', '.', '.', '10', '.', '7', '.', '.', '.', '5', '.', '-', '-'],
    ['3', '.', '.', '7', '.', '.', '12', '.', '.', '.', '10', '.', '7', '.', '3', '.'],
    ['0', '.', '.', '.', '.', '.', '.', '.', '-', '-', '-', '-', '-', '-', '-', '-'],
]
# 「三位数」动机：开场的片名卡上，三个音一记（四、零、四 → 主音上的大跳与回落）
MOTIF = [(0, 69 + 12), (1, 69), (2, 69 + 12)]


def compose(ctx):
    SR, N = ctx['sr'], ctx['n']
    scenes = ctx['scenes']
    cue = {c['id']: c for c in ctx.get('cues', [])}
    out = np.zeros((2, N))
    cache = {}

    def put(sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= N or i + len(sig) <= 0: return
        a, b = max(0, i), min(N, i + len(sig))
        s = sig[a - i: b - i] * g
        out[0, a:b] += s * np.sqrt(0.5 * (1 - pan)); out[1, a:b] += s * np.sqrt(0.5 * (1 + pan))

    def frames(env):                              # 包络按 60 Hz 一帧一级，量化成 16 级（4 位音量）
        step = max(1, int(SR / 60))
        e = env[::step]
        e = np.floor(e * 15 + 0.5) / 15
        return np.repeat(e, step)[: len(env)]

    def pulse(m, dur, duty=0.5, decay=0.25, sus=0.0, fc=7000):
        key = ('p', m, round(dur, 4), duty, decay, sus, fc)
        if key in cache: return cache[key]
        n = int(dur * SR); t = np.arange(n) / SR
        ph = (t * hz(m)) % 1.0
        x = np.where(ph < duty, 1.0, -1.0) - (2 * duty - 1)        # 去直流
        env = np.maximum(sus, np.exp(-t / decay)) if decay else np.ones(n)
        rel = np.clip((dur - t) / 0.02, 0, 1)
        y = x * frames(env) * rel
        y = lfilter1(y, fc)
        cache[key] = y; return y

    def lfilter1(x, fc):
        a = np.exp(-2 * np.pi * fc / SR)
        # 一阶 IIR 的闭式：y[n] = (1-a) Σ a^k x[n-k]，用分块卷积近似（核取到 a^k < 1e-4）
        L = int(min(len(x), max(8, np.ceil(np.log(1e-4) / np.log(a)))))
        k = (1 - a) * a ** np.arange(L)
        return np.convolve(x, k)[: len(x)]

    def tri(m, dur, decay=0.0):
        key = ('t', m, round(dur, 4), decay)
        if key in cache: return cache[key]
        n = int(dur * SR); t = np.arange(n) / SR
        ph = (t * hz(m)) % 1.0
        x = 1 - 4 * np.abs(ph - 0.5)                                 # -1..1 的三角波
        x = np.floor((x + 1) * 7.5 + 0.5) / 7.5 - 1                  # 4 位阶梯（16 级）
        env = np.exp(-t / decay) if decay else np.ones(n)
        rel = np.clip((dur - t) / 0.015, 0, 1)
        y = x * env * rel
        cache[key] = y; return y

    def noise(dur, rate, decay, seed, short=False):
        key = ('n', round(dur, 4), rate, decay, seed, short)
        if key in cache: return cache[key]
        n = int(dur * SR)
        reg, bits = 1, []
        steps = int(dur * rate) + 2
        for _ in range(steps):                   # 15 位 LFSR；short 模式取第 6 位反馈，音色更「金属」
            fb = (reg ^ (reg >> (6 if short else 1))) & 1
            reg = (reg >> 1) | (fb << 14)
            bits.append(1.0 if reg & 1 else -1.0)
        idx = (np.arange(n) * rate / SR).astype(int)
        x = np.array(bits)[np.minimum(idx, len(bits) - 1)]
        t = np.arange(n) / SR
        y = x * frames(np.exp(-t / decay))
        cache[key] = y; return y

    def kick():
        if 'kick' in cache: return cache['kick']
        n = int(0.22 * SR); t = np.arange(n) / SR
        f = 55 + 140 * np.exp(-t / 0.03)
        ph = np.cumsum(f) / SR % 1.0
        x = 1 - 4 * np.abs(ph - 0.5)
        y = np.floor((x + 1) * 7.5 + 0.5) / 7.5 - 1
        y = y * np.exp(-t / 0.09)
        cache['kick'] = y; return y

    snare = lambda: noise(0.16, 9000, 0.05, 1)
    hat = lambda: noise(0.04, 22000, 0.012, 2, short=True)
    ohat = lambda: noise(0.16, 22000, 0.06, 3, short=True)
    crash = lambda: noise(1.4, 16000, 0.45, 4)

    # 每一段从离场景起点最近的一拍开始；段内的小节从这一拍数起
    secs = []
    for i, s in enumerate(scenes):
        a = round(s['start'] / BEAT) * BEAT
        b = round(scenes[i + 1]['start'] / BEAT) * BEAT if i + 1 < len(scenes) else ctx['total']
        secs.append((s['id'], a, b))

    for sid, a, b in secs:
        prog = PROG.get(sid, ['Am'])
        nbars = int(np.ceil((b - a) / BAR - 1e-6))
        for bi in range(nbars):
            t0 = a + bi * BAR
            root, tones = CH[prog[bi % len(prog)]]
            for st in range(16):
                t = t0 + st * STEP
                if t >= b - 1e-6: break
                # ── 低音（三角波）──
                if sid == 'common':
                    m = root + (12 if st % 4 == 2 else 0)
                    put(tri(m, STEP * 0.9), t, 0.42)
                elif sid in ('what', 'who', 'close'):
                    if st % 2 == 0:
                        m = root + (12 if st % 4 == 2 else 0)
                        put(tri(m, STEP * 1.8), t, 0.55)
                elif sid == 'open':
                    if st % 4 == 0: put(tri(root, BEAT * 0.9, 0.4), t, 0.36)
                elif sid == 'history':
                    if st % 8 == 0: put(tri(root, BEAT * 1.9, 0.9), t, 0.3)
                elif sid == 'outro':
                    if bi == 0 and st == 0: put(tri(root, b - a, 1.2), t, 0.3)
                # ── 琶音（方波）：十六分音符在和弦音上来回 ──
                arp = tones + [x + 12 for x in tones]
                seq = arp + arp[-2:0:-1]
                m = seq[st % len(seq)]
                if sid == 'open':
                    if st % 2 == 0: put(pulse(m, STEP * 0.9, 0.5, 0.06), t, 0.24 if bi >= 1 else 0.14, 0.25)
                elif sid == 'history':
                    put(pulse(m, STEP * 0.9, 0.125, 0.07), t, 0.26, -0.3 + 0.6 * ((st // 4) % 2))
                elif sid in ('what', 'who'):
                    put(pulse(m, STEP * 0.9, 0.5, 0.05), t, 0.13, 0.3)
                elif sid == 'common':
                    put(pulse(m, STEP * 0.9, 0.25, 0.05), t, 0.18, 0.35 - 0.7 * (st % 2))
                elif sid == 'close':
                    put(pulse(m, STEP * 0.9, 0.5, 0.05), t, 0.1, -0.3)
                elif sid == 'outro' and bi == 0 and st < 12:
                    put(pulse(m, STEP * 0.9, 0.5, 0.08 + st * 0.01), t, 0.26 * (1 - st / 14), 0.2)
                # ── 鼓 ──
                pat = DRUMS.get(sid)
                if pat:
                    for row in pat:
                        c = row[st]
                        if c == 'K': put(kick(), t, 0.9)
                        elif c == 'S': put(snare(), t, 0.42)
                        elif c == 'h': put(hat(), t, 0.16, 0.4)
                        elif c == 'o': put(ohat(), t, 0.14, -0.4)
                # ── 主旋律（close）──
                if sid == 'close':
                    v = MELODY[bi % len(MELODY)][st]
                    if v not in ('.', '-'):
                        L = 1
                        row = MELODY[bi % len(MELODY)]
                        while st + L < 16 and row[st + L] == '.': L += 1
                        put(pulse(69 + int(v), STEP * L * 0.95, 0.25, 0.35, 0.35), t, 0.2, -0.1)
        # 段与段的接缝：下一段的第一拍之前一小节，噪声往上推（只在有鼓的段落之前）
        if sid in ('history', 'common', 'close'):
            put(noise(BAR * 0.5, 6000, 0.6, 7) * np.linspace(0, 1, int(BAR * 0.5 * SR)), a - BAR * 0.5, 0.12)

    # 片名卡：一记合奏（镲 + 低音 + 「三位数」动机）
    if 'oT' in cue:
        tT = round((cue['oT']['start'] - 0.15) / STEP) * STEP
        put(crash(), tT, 0.3)
        put(kick(), tT, 1.0)
        put(tri(45 - 12 + 12, BEAT * 2, 0.6), tT, 0.7)
        for k, m in MOTIF:
            put(pulse(m, STEP * 1.8, 0.25, 0.2), tT + 0.25 + k * 2 * STEP, 0.22, 0.1)
    # close 的 x4：抬起——镲与一记长的大三和弦
    if 'x4' in cue:
        tx = round((cue['x4']['start'] + 0.2) / BEAT) * BEAT
        put(crash(), tx, 0.25)
        for m in (57, 61, 64, 69):
            put(pulse(m, BAR * 1.5, 0.5, 0.9, 0.3), tx, 0.08)
    return out
