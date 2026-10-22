# Firebird 一集的配乐：柏林学派音序器（1980 年代模拟合成器，InterBase 诞生的年代）。WaterRun 2026-10-21 从两版小样里选定「A 柏林学派音序器」，
# 要求是「小众, 独特, 年代感的电子乐, 契合Firebird的小众」。由 kit/tools/mix.py 调用：compose(ctx) 返回 (2, N)，电平与旁白压低由 mix.py 统一处理。
# 设计：112 拍/分；十六分音符的锯齿波音序经两级共振低通（截止频率随时间缓慢起伏、逐章打开），下面是八分音符的正弦低音与弦乐机铺底，
#   上面是 FM 钟琴的八分琶音；底鼓与踩镲只在讲机制的各章出现。每场从和弦循环的开头重新起，换章前两拍通鼓下行加噪声上扬，新一章第一拍落地。
#   各章的和声进行不同（A 小调里换顺序与和弦），开场与收束各有一次慢速主题；整体做磁带抖晃与轻饱和。
# 制作者听不到声音：数值看 audio.js 的自检，听感由人确认。
import numpy as np

BPM = 112.0
BEAT = 60.0 / BPM
STEP = BEAT / 4
BAR = 4 * BEAT
FADE = (1.5, 4.0)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# 和弦：根音（低八度音序用）、类型、铺底的音
CH = {
    'Am': (45, 'min', [57, 60, 64, 69]),
    'F':  (41, 'maj7', [53, 57, 60, 64]),
    'Em': (40, 'min7', [52, 55, 59, 62]),
    'C':  (48, 'maj7', [55, 60, 64, 67]),
    'Dm': (38, 'min7', [53, 57, 60, 62]),
}
CYCLE = [('Am', 4), ('F', 2), ('Em', 2)]           # 8 小节一轮（缺省）
CYCLES = {
    'open': [('Am', 4), ('F', 2), ('Em', 2)],
    'history': [('Am', 2), ('C', 2), ('F', 2), ('Em', 2)],
    'engine': [('Am', 4), ('Dm', 2), ('Em', 2)],
    'store': [('Am', 4), ('F', 2), ('Em', 2)],
    'query': [('Dm', 2), ('Am', 2), ('F', 2), ('Em', 2)],
    'update': [('F', 2), ('C', 2), ('Am', 4)],
    'durable': [('Am', 2), ('F', 2), ('C', 2), ('Em', 2)],
    'outro': [('F', 2), ('C', 2), ('Am', 4)],
    'next': [('Am', 4), ('F', 2), ('Em', 2)],
    'credits': [('Am', 4), ('F', 4)],
}
SEQ = {'min': [0, 12, 7, 12, 3, 12, 7, 10, 0, 12, 7, 15, 12, 10, 7, 3],
       'min7': [0, 12, 7, 12, 3, 12, 7, 10, 0, 12, 7, 15, 12, 10, 7, 3],
       'maj7': [0, 12, 7, 12, 4, 12, 7, 11, 0, 12, 7, 16, 12, 11, 7, 4]}
ACC = {0, 6, 11}
BELL = {'min': [24, 31, 27, 36, 24, 31, 34, 27], 'min7': [24, 31, 27, 34, 24, 31, 34, 27], 'maj7': [24, 31, 28, 35, 24, 31, 36, 28]}

# 每场各层的电平：pad 铺底、seq 音序、bell 钟琴、kick 底鼓（kmode：0 无、1 半拍、2 四拍）、hat 踩镲、lead 主题
ARR = {
    'open':    dict(pad=1.0, seq=0.55, bell=0.0, kick=0.0, kmode=0, hat=0.0, lead=0.9, cut=0.7),
    'history': dict(pad=0.85, seq=0.8, bell=0.35, kick=0.6, kmode=1, hat=0.0, lead=0.0, cut=0.85),
    'engine':  dict(pad=0.8, seq=0.9, bell=0.3, kick=0.8, kmode=2, hat=0.35, lead=0.0, cut=1.0),
    'store':   dict(pad=0.8, seq=1.0, bell=0.3, kick=0.85, kmode=2, hat=0.45, lead=0.0, cut=1.05),
    'query':   dict(pad=0.8, seq=1.0, bell=0.4, kick=0.85, kmode=2, hat=0.5, lead=0.0, cut=1.15),
    'update':  dict(pad=0.8, seq=1.0, bell=0.35, kick=0.9, kmode=2, hat=0.5, lead=0.0, cut=1.2),
    'durable': dict(pad=0.85, seq=1.0, bell=0.45, kick=0.9, kmode=2, hat=0.55, lead=0.0, cut=1.3),
    'outro':   dict(pad=1.0, seq=0.7, bell=0.6, kick=0.0, kmode=0, hat=0.0, lead=1.0, cut=1.1),
    'next':    dict(pad=1.0, seq=0.45, bell=0.5, kick=0.0, kmode=0, hat=0.0, lead=0.0, cut=0.8),
    'credits': dict(pad=1.0, seq=0.0, bell=0.35, kick=0.0, kmode=0, hat=0.0, lead=0.0, cut=0.6),
}
DEFAULT = ARR['store']


def compose(ctx):
    SR, N = ctx['sr'], ctx['n']
    rng = np.random.default_rng(1984)
    stems = {k: np.zeros((2, N)) for k in ('pad', 'seq', 'sub', 'bell', 'kick', 'hat', 'lead', 'fx')}
    send = np.zeros((2, N))

    def put(name, sig, t, g=1.0, pan=0.0, rev=0.0):
        i = int(round(t * SR))
        if i >= N or g == 0:
            return
        if i < 0:
            sig = sig[-i:]; i = 0
        n = min(len(sig), N - i)
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        stems[name][0, i:i + n] += sig[:n] * g * l * 1.414
        stems[name][1, i:i + n] += sig[:n] * g * r * 1.414
        if rev:
            send[0, i:i + n] += sig[:n] * g * l * rev
            send[1, i:i + n] += sig[:n] * g * r * rev

    cache = {}

    def seqnote(m, acc, cut):
        key = ('s', m, acc, cut)
        if key in cache:
            return cache[key]
        f0 = hz(m); dur = STEP * 1.7; n = int(dur * SR); t = np.arange(n) / SR
        base = 260 * 2 ** (cut / 6.0)                      # cut 0..23 → 260 Hz … ~4 kHz
        fc = np.minimum(base * (1 + (5.5 if acc else 2.6) * np.exp(-t / (0.09 if acc else 0.06))), SR * 0.4)
        q = 3.2 if acc else 2.4
        out = np.zeros(n)
        for k in range(1, min(70, int(SR * 0.42 / f0)) + 1):
            x = k * f0 / fc
            mag = 1.0 / ((1 - x * x) ** 2 + (x / q) ** 2)            # 两级二阶，约 24 dB/倍频程
            if mag.max() < 2e-4:
                break
            out += mag * np.sin(2 * np.pi * k * f0 * t + 0.7 * k) / k
        env = np.minimum(1, t / 0.003) * np.where(t < STEP * 0.85, 1.0, np.exp(-(t - STEP * 0.85) / 0.05))
        out = np.tanh(out * env * (1.4 if acc else 1.0) * 0.9)
        cache[key] = out
        return out

    def padchord(name, dur):
        key = ('p', name, round(dur, 3))
        if key in cache:
            return cache[key]
        n = int((dur + 2.0) * SR); t = np.arange(n) / SR
        L = np.zeros(n); R = np.zeros(n)
        for j, m in enumerate(CH[name][2]):
            for d, (pl, pr) in zip((-0.11, 0.0, 0.12), ((0.9, 0.3), (0.6, 0.6), (0.3, 0.9))):
                f0 = hz(m) * 2 ** (d / 12)
                vib = 1 + 0.0016 * np.sin(2 * np.pi * (5.3 + 0.4 * j + d) * t + j * 1.3 + d * 7)
                ph = 2 * np.pi * np.cumsum(f0 * vib) / SR
                s = np.zeros(n)
                for k in range(1, 18):
                    if k * f0 > 3200:
                        break
                    s += np.sin(k * ph + k * 0.9 + j) / k * (1.0 / (1 + (k * f0 / 1400) ** 2))
                L += s * pl; R += s * pr
        env = np.minimum(1, t / 1.2) * np.clip((dur + 2.0 - t) / 2.0, 0, 1)
        out = np.stack([L * env, R * env]) * 0.16
        cache[key] = out
        return out

    def bell(m):
        key = ('b', m)
        if key in cache:
            return cache[key]
        f = hz(m); n = int(1.6 * SR); t = np.arange(n) / SR
        idx = 2.2 * np.exp(-t / 0.18)
        s = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t / 0.55) * np.minimum(1, t / 0.002)
        cache[key] = s
        return s

    def sub(m, dur):
        key = ('u', m, round(dur, 3))
        if key in cache:
            return cache[key]
        f = hz(m); n = int(dur * SR); t = np.arange(n) / SR
        ph = 2 * np.pi * f * t
        s = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
        env = np.minimum(1, t / 0.01) * np.exp(-t / (dur * 0.9)) * np.clip((dur - t) / 0.02, 0, 1)
        cache[key] = s * env
        return s * env

    def kick():
        if 'k' in cache:
            return cache['k']
        n = int(0.45 * SR); t = np.arange(n) / SR
        f = 48 + 110 * np.exp(-t / 0.03)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22) + 0.25 * rng.standard_normal(n) * np.exp(-t / 0.004)
        cache['k'] = np.tanh(1.6 * s)
        return cache['k']

    def hat(open_=False):
        key = ('h', open_)
        if key in cache:
            return cache[key]
        n = int((0.25 if open_ else 0.06) * SR); t = np.arange(n) / SR
        x = rng.standard_normal(n); x = np.diff(np.diff(x, prepend=0), prepend=0)
        s = x * np.exp(-t / (0.06 if open_ else 0.012)) * 0.25
        cache[key] = s
        return s

    def tom(f0):
        key = ('t', f0)
        if key in cache:
            return cache[key]
        n = int(0.5 * SR); t = np.arange(n) / SR
        f = f0 * (1 + 0.9 * np.exp(-t / 0.05))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2) + 0.12 * rng.standard_normal(n) * np.exp(-t / 0.01)
        cache[key] = s * 0.8
        return s * 0.8

    def lead(notes, t0):
        # 慢速主题：锯齿加正弦，滑音，颤音渐入
        tot = sum(d for _, d in notes) * BEAT + 1.5
        n = int(tot * SR); t = np.arange(n) / SR
        f = np.zeros(n); tt = 0.0
        for m, d in notes:
            a, b = int(tt * BEAT * SR), int((tt + d) * BEAT * SR)
            f[a:b] = hz(m); tt += d
        f[int(tt * BEAT * SR):] = hz(notes[-1][0])
        k = int(0.07 * SR); f = np.convolve(np.pad(f, (k, k), mode='edge'), np.ones(k) / k, 'same')[k:-k]
        f = f * (1 + 0.004 * np.minimum(1, t / 3) * np.sin(2 * np.pi * 5.2 * t))
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.18 * np.sin(3 * ph) + 0.08 * np.sin(4 * ph)
        env = np.minimum(1, t / 0.25) * np.clip((tot - t) / 1.5, 0, 1)
        put('lead', s * env * 0.22, t0, pan=-0.15, rev=0.5)

    scenes = ctx.get('scenes') or [{'id': 'all', 'start': 0, 'end': ctx['total']}]
    MOTIF = [(69, 2), (76, 1), (74, 1), (72, 2), (71, 2), (69, 4)]
    for si, sc in enumerate(scenes):
        a = ARR.get(sc['id'], DEFAULT)
        t0, t1 = sc['start'], sc['end']
        nxt = scenes[si + 1] if si + 1 < len(scenes) else None
        cut0 = a['cut'] * 12
        bars = int(np.ceil((t1 - t0) / BAR)) + 1
        # 和弦表：按 8 小节一轮
        chords = []
        while len(chords) < bars:
            for nm, nb in CYCLES.get(sc['id'], CYCLE):
                chords += [nm] * nb
        # 铺底：一个和弦一块
        b = 0
        while b < bars:
            nm = chords[b]; nb = 1
            while b + nb < bars and chords[b + nb] == nm:
                nb += 1
            ts = t0 + b * BAR
            if ts < t1:
                blk = padchord(nm, nb * BAR)
                cutn = int(min(len(blk[0]), (t1 + 0.6 - ts) * SR))
                if cutn > 0:
                    g = blk[:, :cutn].copy(); fl = int(0.6 * SR)
                    if cutn > fl:
                        g[:, -fl:] *= np.linspace(1, 0, fl)
                    i = int(ts * SR); n = min(cutn, N - i)
                    if n > 0:
                        stems['pad'][:, i:i + n] += g[:, :n] * a['pad']
                        send[:, i:i + n] += g[:, :n] * a['pad'] * 0.6
            b += nb
        # 音序与节拍
        nsteps = int((t1 - t0) / STEP)
        for st in range(nsteps):
            ts = t0 + st * STEP
            bar = st // 16; s16 = st % 16
            root, kind, _ = CH[chords[bar]]
            prog = st / max(1, nsteps)
            cut = cut0 + 4 * np.sin(2 * np.pi * (ts / 23.0)) + 3 * prog
            cq = int(round(cut))
            if a['seq'] > 0:
                put('seq', seqnote(root + SEQ[kind][s16], s16 in ACC, cq), ts, g=a['seq'] * (1.0 if s16 in ACC else 0.8), pan=0.25 * np.sin(st * 0.37), rev=0.08)
                # 延迟回声：三个十六分之后，另一侧
                put('seq', seqnote(root + SEQ[kind][s16], False, max(0, cq - 4)), ts + 3 * STEP, g=a['seq'] * 0.28, pan=-0.6 * np.sign(np.sin(st * 0.37) + 0.01))
            if a['bell'] > 0 and s16 % 2 == 0 and (bar % 4) in (1, 3):
                m = root + BELL[kind][s16 // 2]
                put('bell', bell(m), ts, g=a['bell'] * 0.25, pan=0.5 if s16 % 4 == 0 else -0.5, rev=0.35)
            if a['seq'] > 0 and s16 % 2 == 0:
                put('sub', sub(root - 12 + (12 if root < 40 else 0), STEP * 2), ts, g=a['seq'] * (1.0 if s16 % 8 == 0 else 0.7))
            if a['kick'] > 0 and s16 % 4 == 0 and (a['kmode'] == 2 or s16 % 8 == 0):
                put('kick', kick(), ts, g=a['kick'] * 0.55)
            if a['hat'] > 0 and s16 % 4 == 2:
                put('hat', hat(s16 == 14), ts, g=a['hat'] * (0.8 if s16 == 14 else 0.6), pan=0.3)
            if a['hat'] > 0 and s16 % 2 == 1:
                put('hat', hat(), ts, g=a['hat'] * 0.25, pan=-0.3)
        # 主题
        if a['lead'] > 0:
            lead(MOTIF, t0 + 2 * BAR)
        # 换章：前一场结尾两拍的通鼓下行，加噪声上扬；新一场第一拍落地
        if nxt is not None and ARR.get(nxt['id'], DEFAULT)['kick'] > 0:
            tb = nxt['start']
            for j, f0 in enumerate((180, 150, 120, 95)):
                put('fx', tom(f0), tb - BEAT * 2 + j * BEAT / 2, g=0.5, pan=0.5 - j * 0.33, rev=0.2)
            n = int(1.6 * SR); tt = np.arange(n) / SR
            x = rng.standard_normal(n)
            x = np.diff(x, prepend=0) * (tt / tt[-1]) ** 2 * 0.25
            put('fx', x, tb - 1.6, g=0.6, rev=0.4)
            put('kick', kick(), tb, g=0.8)
            put('fx', hat(True) * 2.5, tb, g=0.5, rev=0.6)

    cues = {c['id']: c for c in ctx.get('cues', [])}
    for cid, g in (('o6', 0.9), ('z1', 0.6)):
        if cid in cues:
            tc = cues[cid]['start']
            n = int(1.4 * SR); tt = np.arange(n) / SR
            x = np.diff(rng.standard_normal(n), prepend=0) * (tt / tt[-1]) ** 2 * 0.22
            put('fx', x, tc - 1.4, g=0.5 * g, rev=0.4)
            put('kick', kick(), tc, g=0.75 * g)
            put('fx', hat(True) * 2.5, tc, g=0.45 * g, rev=0.6)
    if 'n5' in cues:
        tc = cues['n5']['end']
        lead([(69, 2), (72, 2), (76, 4)], tc - 2 * BEAT)
    mix = (stems['pad'] * 1.0 + stems['seq'] * 0.55 + stems['sub'] * 0.75 + stems['bell'] * 0.8 + stems['kick'] * 0.9 + stems['hat'] * 0.7 + stems['lead'] * 0.9 + stems['fx'] * 0.6)
    # 混响：指数衰减噪声的冲激响应，按 2 的幂分块卷积
    ir_n = 1 << 16; tt = np.arange(ir_n) / SR
    ir = rng.standard_normal((2, ir_n)) * np.exp(-tt / 0.55); ir[:, :int(0.012 * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    B = 1 << 16; F = 1 << 17
    wet = np.zeros((2, N + ir_n))
    for c in range(2):
        H = np.fft.rfft(ir[c], F)
        for i in range(0, N, B):
            seg = send[c, i:i + B]
            y = np.fft.irfft(np.fft.rfft(seg, F) * H, F)
            wet[c, i:i + F] += y[:min(F, N + ir_n - i)]
    mix = mix + wet[:, :N] * 0.35
    # 磁带：轻微的抖晃与饱和
    t = np.arange(N) / SR
    d = 0.0011 * np.sin(2 * np.pi * 0.43 * t) + 0.0004 * np.sin(2 * np.pi * 0.13 * t + 1.0)
    src = np.clip(np.arange(N) - d * SR, 0, N - 1)
    mix = np.stack([np.interp(src, np.arange(N), mix[0]), np.interp(src, np.arange(N), mix[1])])
    mix /= max(1e-9, np.abs(mix).max())
    return np.tanh(1.5 * mix) / np.tanh(1.5)
