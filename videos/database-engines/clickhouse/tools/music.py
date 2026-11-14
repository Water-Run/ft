# 配乐：审片页选定的「小样 B（列）× 小样 C（合并）」的整片版本。96 拍/分，D 多利亚（Dm7 → C → Am7 → Gsus），克制、冷、准。
# 动机取自片子的对象，随各章内容进出，不写死秒数（段落与关键句的位置从 ctx 取）：
#   · 八个金属槌音各占一个固定的十六分音符位置，像八列数据：第 03 章一列一列加进来（一列挨一列），之后各章留 2–4 列；
#   · 三条旋律线奏同一个动机，起初错开、越来越整齐：第 05 章合并时逐步收拢，在「倒过来看，像一棵树」（m12b）那一刻八个槌音叠成一个和弦、一声低沉的重击；
#   · 第 10 章（出错怎么办）转暗：只留低音与铺底，换成 Dm → B♭ → Gm → A 的走向，不进节拍；
#   · 第 11、12 章（五个问题、取舍）再进八列与三线，最后一章（SQL 之外）退回单音，片尾只剩铺底。
# 只用 numpy 做加法合成，不用采样或第三方音频；随机数固定种子，结果可复现。
import numpy as np

BPM = 96
B = 60 / BPM
BAR = 4 * B
FADE = (3.0, 4.0)

COLS = [(62, 0), (69, 3), (65, 6), (72, 8), (67, 10), (74, 13), (60, 14), (77, 5)]       # 八列：音高与一小节里的十六分音符位置
MOTIF = [(0, 69, 1), (1, 72, 0.5), (1.5, 71, 0.5), (2, 69, 1), (3, 76, 1)]              # 拍位、音高、拍长
CH_LIGHT = [(38, [53, 57, 60]), (36, [55, 60, 64]), (45, [55, 60, 64]), (43, [55, 60, 62])]   # Dm7 → C → Am7 → Gsus
CH_DARK = [(38, [53, 57, 62]), (34, [53, 58, 62]), (43, [55, 58, 62]), (45, [55, 61, 64])]    # Dm → B♭ → Gm → A（转暗）


def compose(ctx):
    SR, N, total = ctx['sr'], ctx['n'], ctx['total']
    rng = np.random.default_rng(20261108)
    scenes = ctx['scenes']
    cue = {c['id']: c for c in ctx.get('cues', [])}
    L = np.zeros(N + SR * 6); R = np.zeros(N + SR * 6)

    def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

    def adsr(n, a, d, s, r):
        a, d, r = max(1, int(a * SR)), max(1, int(d * SR)), max(1, int(r * SR))
        sus = max(0, n - a - d - r)
        e = np.concatenate([np.linspace(0, 1, a), np.linspace(1, s, d), np.full(sus, s), np.linspace(s, 0, r)])
        return np.pad(e, (0, max(0, n - len(e))))[:n]

    cache = {}

    def tone(f, dur, parts, decay=None, vib=0.0, key=None):
        k = (round(f, 2), round(dur, 3), key, decay, vib)
        if key is not None and k in cache: return cache[k]
        n = int(dur * SR); t = np.arange(n) / SR
        ph = 2 * np.pi * f * t
        if vib: ph = ph + vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.4)
        y = np.zeros(n)
        for i, (mul, amp) in enumerate(parts):
            if f * mul > 16000: continue
            p = np.sin(ph * mul + rng.uniform(0, 6.28))
            if decay: p = p * np.exp(-t / (decay / (1 + 0.6 * i)))
            y += amp * p
        if key is not None: cache[k] = y
        return y

    SAW = lambda k=10, roll=1.0: [(i, (1 / i) ** roll) for i in range(1, k + 1)]
    ODD = lambda k=9: [(i, 1 / i) for i in range(1, k + 1, 2)]
    BELL = [(1, 1.0), (2.76, 0.45), (5.40, 0.22), (8.93, 0.10)]

    def put(y, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0 or i >= N: return
        j = min(len(L), i + len(y)); y = y[: j - i] * g
        L[i:j] += y * np.sqrt(0.5 * (1 - pan)); R[i:j] += y * np.sqrt(0.5 * (1 + pan))

    def hat(dur=0.02, bright=0.5):
        n = int(dur * SR); x = rng.standard_normal(n)
        x = np.diff(np.diff(x, prepend=0), prepend=0)
        return x * np.exp(-np.arange(n) / SR / (0.012 * bright)) * 0.25

    def boom(dur=3.0):
        n = int(dur * SR); t = np.arange(n) / SR
        f = 38 + 30 * np.exp(-t / 0.25)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.1)
        noise = rng.standard_normal(n) * np.exp(-t / 0.05) * 0.15
        return y + np.convolve(noise, np.ones(40) / 40, 'same')

    # 各章的配方：pad 铺底、bass 低音脉冲、hat 极轻的节拍、bells 在这个进度（0–1）上有几列槌音、lines 旋律线的段（0 无，1 错开，2 收拢，3 齐奏）
    def conv_bells(p): return 8
    PLAN = {
        'open':    dict(pad=0.7, bass=0.0, hat=0.0, bells=lambda p: int(p * 3.2), lines=lambda p: 0),
        'history': dict(pad=0.8, bass=0.0, hat=0.0, bells=lambda p: 1 + int(p * 2.4), lines=lambda p: 0),
        'engine':  dict(pad=0.9, bass=0.5, hat=0.5, bells=lambda p: 2 + int(p * 3), lines=lambda p: 0),
        'column':  dict(pad=1.0, bass=0.8, hat=1.0, bells=lambda p: 1 + int(p * 7.99), lines=lambda p: 0),
        'part':    dict(pad=1.0, bass=0.9, hat=1.0, bells=lambda p: 4 + int(p * 2), lines=lambda p: 0),
        'merge':   dict(pad=1.1, bass=1.0, hat=1.0, bells=lambda p: 8, lines=lambda p: 1 if p < 0.35 else 2 if p < 0.62 else 3),
        'index':   dict(pad=1.0, bass=0.9, hat=0.8, bells=lambda p: 3, lines=lambda p: 0),
        'update':  dict(pad=0.9, bass=0.7, hat=0.6, bells=lambda p: 2, lines=lambda p: 0),
        'delete':  dict(pad=0.9, bass=0.7, hat=0.5, bells=lambda p: 2, lines=lambda p: 0),
        'concur':  dict(pad=1.0, bass=0.8, hat=0.8, bells=lambda p: 4, lines=lambda p: 1),
        'crash':   dict(pad=1.0, bass=0.35, hat=0.0, bells=lambda p: 1, lines=lambda p: 0, dark=True),
        'five':    dict(pad=1.1, bass=1.0, hat=1.0, bells=lambda p: 8, lines=lambda p: 3),
        'close':   dict(pad=1.0, bass=0.7, hat=0.5, bells=lambda p: 8 if p < 0.5 else 4, lines=lambda p: 3 if p < 0.5 else 0),
        'beyond':  dict(pad=0.8, bass=0.0, hat=0.0, bells=lambda p: 3 if p < 0.5 else 1, lines=lambda p: 0),
        'credits': dict(pad=0.6, bass=0.0, hat=0.0, bells=lambda p: 1, lines=lambda p: 0),
    }
    LINES = [(12, ODD(5), 0.07, 0.4, 0.0), (0, ODD(9), 0.08, -0.4, 0.004), (-12, SAW(9, 1.1), 0.09, 0.0, 0.003)]

    # 关键时刻：对齐到最近的小节头
    def snap(t): return round(t / BAR) * BAR
    big = snap(cue['m12b']['start']) if 'm12b' in cue else None          # 八个槌音叠成一个和弦：八列并成一个片段
    title = snap(cue['oT']['start']) if 'oT' in cue else None            # 片名
    five = snap(cue['f1']['start']) if 'f1' in cue else None             # 五个问题：抬起
    ending = snap(cue['s8']['start']) if 's8' in cue else None           # 下一个数据库：收到单音

    def which(t):
        for sc in scenes:
            if sc['start'] <= t < sc['end']: return sc
        return scenes[-1]

    nbars = int(total / BAR) + 2
    for k in range(nbars):
        t0 = k * BAR
        if t0 >= total + 1: break
        sc = which(t0); plan = PLAN.get(sc['id'], PLAN['engine'])
        p = min(1.0, max(0.0, (t0 - sc['start']) / max(1e-6, sc['end'] - sc['start'])))
        dark = plan.get('dark', False)
        root, ups = (CH_DARK if dark else CH_LIGHT)[(k // 1) % 4]
        # 铺底与低音长音
        put(tone(hz(root), BAR * 1.05, SAW(8, 1.2), key='bs%d' % root) * adsr(int(BAR * 1.05 * SR), 0.25, 0.3, 0.7, 0.5), t0, 0.10 * plan['pad'])
        if plan['pad'] >= 0.9 or k % 2 == 0:
            for m in ups:
                put(tone(hz(m), BAR * 1.1, SAW(6, 1.6), key='pd%d' % m) * adsr(int(BAR * 1.1 * SR), 0.5, 0.3, 0.7, 0.6), t0, 0.03 * plan['pad'], rng.uniform(-0.5, 0.5))
        # 八列槌音
        nb = int(plan['bells'](p))
        for i, (m, pos) in enumerate(COLS[:max(0, min(8, nb))]):
            conv = 0.0
            if sc['id'] == 'merge':
                conv = min(1.0, max(0.0, (p - 0.35) / 0.4))
            elif sc['id'] == 'close' and p < 0.5:
                conv = min(1.0, p / 0.3)
            for rep in ((0, 1) if i < 4 else (0,)):
                put(tone(hz(m), 1.2, BELL, decay=0.9, key='bl%d' % m), t0 + (pos * (1 - conv)) * B / 4 + rep * BAR / 2, 0.11, -0.7 + 1.4 * i / 7)
        # 节拍与低音脉冲
        if plan['hat'] > 0:
            for s16 in range(16):
                put(hat(0.02, 0.5), t0 + s16 * B / 4, (0.12 if s16 % 4 else 0.2) * plan['hat'], -0.2)
        if plan['bass'] > 0:
            for q in range(4):
                put(tone(hz(root - 12 if root > 36 else 26), B * 0.8, [(1, 1), (2, 0.4)], key='bp%d' % root) * adsr(int(B * 0.8 * SR), 0.01, 0.2, 0.5, 0.2), t0 + q * B, 0.26 * plan['bass'])
        # 三条旋律线：先错开，越往后越齐，最后齐奏
        stage = int(plan['lines'](p))
        if stage > 0:
            for li, (oct_, parts, g, pan, vib) in enumerate(LINES):
                if stage == 1 and li == 2: continue
                off = [0.0, 1.5, 2.5][li] * (1 - (0.5 if stage == 2 else 1.0)) if stage < 3 else 0.0
                frag = MOTIF if stage == 3 else MOTIF[li % 2::2] if stage == 1 else MOTIF[:3 + li % 2]
                for beat, m, ln in frag:
                    put(tone(hz(m + oct_), ln * B * 1.05, parts, vib=vib, key='ln%d_%d' % (li, m)) * adsr(int(ln * B * 1.05 * SR), 0.03, 0.15, 0.75, 0.2), t0 + ((beat + off) % 4) * B, g * (1.25 if stage == 3 else 1), pan)
        # 关键时刻
        if big is not None and abs(t0 - big) < 1e-6:
            put(boom(4.0), t0, 0.62)
            for i, (m, _) in enumerate(COLS): put(tone(hz(m), 2.2 * BAR, ODD(7), key='ch%d' % m) * adsr(int(2.2 * BAR * SR), 0.04, 0.4, 0.55, 1.2), t0, 0.07, -0.6 + 1.2 * i / 7)
        if title is not None and abs(t0 - title) < 1e-6:
            put(boom(3.5), t0, 0.5)
        if five is not None and abs(t0 - five) < 1e-6:
            put(boom(2.5), t0, 0.22)
        if ending is not None and abs(t0 - ending) < 1e-6:
            put(boom(3.5), t0, 0.3)

    # 轻薄的空间感：几条交错的延迟（整条 O(N)，不做大窗口卷积）
    for dly, g, sw in ((0.31, 0.18, 1), (0.57, 0.12, 0), (0.83, 0.07, 1)):
        d = int(dly * SR)
        a, b = (R, L) if sw else (L, R)
        L2 = np.zeros_like(L); R2 = np.zeros_like(R)
        L2[d:] = a[:-d] * g; R2[d:] = b[:-d] * g
        L += L2; R += R2
    X = np.stack([L[:N], R[:N]])
    X = X / (np.sqrt(np.mean(X ** 2)) * 3.0 + 1e-9)       # 低频重击的峰值远高于其余声部：先按有效值拉齐，再软限幅，混音时才不会被它压得整体过轻
    return np.tanh(X)
