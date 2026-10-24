# 《256 秒搞懂 SSH》的配乐：程序合成的 90 年代 8 位电子乐。策划者 2026-10-23：「配乐: 90年代8位电子乐.」
# 由 kit/tools/mix.py 调用：compose(ctx) 返回 (2, N)。ctx: { sr, n, total, scenes, cues, audio, lang }。不采样任何外部音源。
#
# 只用四种 8 位声部：两路方波（琶音、主旋律，带边沿抗混叠）、一路 16 级阶梯三角波（低音）、一路噪声（鼓）。
# 120 拍/分，一小节 2 秒，每小节一个和弦。调性 A 小调。各段跟着握手的四道关换和声与织体：
#   open   引子：只有琶音；片名卡处一记镲，低音进来；四道关处加踩镲
#   what   年代：琶音与低音，不打鼓
#   kex    对算法：Am–F–C–G，十六分琶音、八分低音、底鼓与踩镲
#   dh     换密钥：Dm–F–Am–E，琶音放慢一半，只留底鼓
#   hostkey认主机：Am–E–F–E（和声小调的升 G），加军鼓
#   edge   盲区：F–E 来回，撤掉琶音，只剩低音持续音与踩镲，留出紧张
#   userauth 证明你：回到 Am–F–C–G，全编制
#   close  收束：s58 起主旋律唱完整句，镲一记抬起；最后落在 A 大三和弦
#   outro  片尾：A 大三和弦的慢琶音，淡出
import numpy as np

BPM = 120.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FADE = (1.2, 3.5)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

CH = {  # 和弦：根音（低音八度）与三个和弦音（琶音八度）
    "Am": (45, [69, 72, 76]), "F": (41, [65, 69, 72]), "C": (48, [67, 72, 76]), "G": (43, [67, 71, 74]),
    "Dm": (38, [62, 65, 69]), "E": (40, [64, 68, 71]), "E7": (40, [64, 68, 74]), "A": (45, [69, 73, 76]),
}
PROG = {
    "open": ["Am", "F", "C", "G"], "what": ["Am", "F", "C", "G"], "kex": ["Am", "F", "C", "G"],
    "dh": ["Dm", "F", "Am", "E"], "hostkey": ["Am", "E", "F", "E7"], "edge": ["F", "E", "F", "E"],
    "userauth": ["Am", "F", "C", "G"], "close": ["F", "G", "Am", "Am"], "lift": ["F", "G", "C", "E7"], "outro": ["A", "A", "A", "A"],
}
# 每段的声部：arp 琶音（16 = 十六分，8 = 八分，0 = 无）、bass 低音型、drum 鼓型
LAYER = {
    "open": dict(arp=16, bass="none", drum="none"), "what": dict(arp=16, bass="pulse", drum="none"),
    "kex": dict(arp=16, bass="drive", drum="kh"), "dh": dict(arp=8, bass="pulse", drum="k"),
    "hostkey": dict(arp=16, bass="drive", drum="khs"), "edge": dict(arp=0, bass="drone", drum="h"),
    "userauth": dict(arp=16, bass="drive", drum="khs"), "close": dict(arp=16, bass="drive", drum="khs"),
    "lift": dict(arp=16, bass="drive", drum="khs"), "outro": dict(arp=8, bass="none", drum="none"),
}
# 主旋律：八分音符一格，两小节一句。None 为休止
MOTIF = {
    "a": [69, None, 72, None, 76, None, 74, 72, 69, None, None, 72, 71, None, 67, None],
    "b": [72, None, 76, None, 79, None, 77, 76, 74, None, 71, None, 67, None, None, None],
    "lift1": [77, None, 76, 77, 81, None, 79, 77, 79, None, 77, 76, 74, None, 71, None],
    "lift2": [72, None, 76, 79, 84, None, 83, 81, 80, None, None, None, 76, None, None, None],
}


def compose(ctx):
    SR, N = ctx["sr"], ctx["n"]
    scenes = ctx["scenes"]
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    rng = np.random.default_rng(20261024)
    L = np.zeros(N)
    R = np.zeros(N)

    def put(sig, t, g, pan=0.0):
        i = int(round(t * SR))
        if i >= N or len(sig) == 0:
            return
        if i < 0:
            sig, i = sig[-i:], 0
        j = min(N, i + len(sig))
        L[i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 - pan))
        R[i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 + pan))

    def adsr(n, a=0.003, d=0.08, s=0.55, r=0.03):
        t = np.arange(n) / SR
        dur = n / SR
        e = np.where(t < a, t / a, s + (1 - s) * np.exp(-(t - a) / d))
        return e * np.clip((dur - t) / r, 0, 1)

    def blep(p, dt):
        # 方波边沿的 polyBLEP 修正，去掉刺耳的混叠
        out = np.zeros_like(p)
        dt = np.broadcast_to(dt, p.shape)
        m = p < dt
        x = p[m] / dt[m]
        out[m] = x + x - x * x - 1
        m2 = p > 1 - dt
        x = (p[m2] - 1) / dt[m2]
        out[m2] = x * x + x + x + 1
        return out

    def pulse(midi, dur, duty=0.25, vib=0.0):
        n = max(1, int(dur * SR))
        f = hz(midi) * np.ones(n)
        if vib:
            tt = np.arange(n) / SR
            f = f * (1 + vib * np.clip((tt - 0.12) / 0.1, 0, 1) * np.sin(2 * np.pi * 5.5 * tt))
        dt = f / SR
        p = np.cumsum(dt) % 1.0
        y = np.where(p < duty, 1.0, -1.0)
        y += blep(p, dt)
        y -= blep((p - duty) % 1.0, dt)
        return y - (2 * duty - 1)

    def tri(midi, dur):
        n = max(1, int(dur * SR))
        p = (np.arange(n) * hz(midi) / SR) % 1.0
        y = 2 * np.abs(2 * p - 1) - 1
        return np.round(y * 7.5) / 7.5            # 16 级阶梯，红白机式的三角波

    def noise(dur, hold=1):
        n = max(1, int(dur * SR))
        v = rng.uniform(-1, 1, n // hold + 1)
        return np.repeat(v, hold)[:n]

    def kick(t, g):
        n = int(0.16 * SR)
        tt = np.arange(n) / SR
        f = 45 + 110 * np.exp(-tt / 0.025)
        y = (2 * np.abs(2 * ((np.cumsum(f) / SR) % 1.0) - 1) - 1)
        y = np.round(y * 7.5) / 7.5 * np.exp(-tt / 0.07)
        y[: int(0.004 * SR)] += noise(0.004)[: int(0.004 * SR)] * 0.6
        put(y, t, g)

    def snare(t, g):
        n = int(0.14 * SR)
        y = noise(0.14, 3) * np.exp(-np.arange(n) / SR / 0.045)
        put(y, t, g, 0.1)

    def hat(t, g, open_=False):
        d = 0.09 if open_ else 0.03
        n = int(d * SR)
        y = noise(d) * np.exp(-np.arange(n) / SR / (0.03 if open_ else 0.008))
        put(y, t, g, 0.25)

    def crash(t, g):
        n = int(1.4 * SR)
        y = noise(1.4, 2) * np.exp(-np.arange(n) / SR / 0.45)
        put(y, t, g, -0.1)

    # 每小节属于哪一段：取小节起点所在的场景；s58 之后为 lift
    lift_t = cue["s58"]["start"] if "s58" in cue else None
    out_t = next((s["start"] for s in scenes if s["id"] == "outro"), ctx["total"])

    def sec_of(t):
        if t >= out_t - 1e-6:
            return "outro"
        if lift_t is not None and t >= lift_t - 0.25:
            return "lift"
        name = scenes[0]["id"] if scenes else "kex"
        for s in scenes:
            if s["start"] <= t + 1e-6:
                name = s["id"]
        return name if name in PROG else "kex"

    nbar = int(np.ceil(ctx["total"] / BAR)) + 1
    first = {}
    for b in range(nbar):
        first.setdefault(sec_of(b * BAR), b)

    title_t = cue["s03"]["start"] if "s03" in cue else 9.0
    gates_t = cue["s05"]["start"] if "s05" in cue else 28.0
    for b in range(nbar):
        t0 = b * BAR
        if t0 >= ctx["total"]:
            break
        sec = sec_of(t0)
        lay = dict(LAYER[sec])
        if sec == "open":
            if t0 + BAR > title_t:
                lay["bass"] = "pulse"
            if t0 >= gates_t - 1:
                lay["drum"] = "h"
        prog = PROG[sec]
        k = (b - first[sec]) % len(prog)
        root, tones = CH[prog[k]]
        intro_gain = 0.55 if (sec == "open" and t0 < title_t) else 1.0
        # 琶音：上行再下行，一拍四个音
        if lay["arp"]:
            step = BEAT / 4 if lay["arp"] == 16 else BEAT / 2
            seq = tones + [tones[0] + 12] + tones[::-1][1:] + [tones[0] - 12 + 12]
            nn = int(round(BAR / step))
            for i in range(nn):
                m = seq[i % len(seq)]
                if sec == "outro":
                    m += 0
                put(pulse(m, step * 0.92, 0.125) * adsr(int(step * 0.92 * SR), d=0.05, s=0.35), t0 + i * step, 0.21 * intro_gain, -0.25)
        # 低音
        if lay["bass"] == "drive":
            pat = [root, root, root + 12, root, root + 7, root, root + 12, root + 7]
            for i, m in enumerate(pat):
                put(tri(m, BEAT / 2 * 0.9) * adsr(int(BEAT / 2 * 0.9 * SR), d=0.2, s=0.7), t0 + i * BEAT / 2, 0.50, 0.05)
        elif lay["bass"] == "pulse":
            for i, m in enumerate([root, None, root + 7, None, root, None, root + 12, None]):
                if m is not None:
                    put(tri(m, BEAT * 0.9) * adsr(int(BEAT * 0.9 * SR), d=0.3, s=0.6), t0 + i * BEAT / 2, 0.40, 0.05)
        elif lay["bass"] == "drone":
            put(tri(root, BAR * 0.98) * adsr(int(BAR * 0.98 * SR), d=1.0, s=0.75, r=0.1), t0, 0.40, 0.0)
            put(pulse(root + 24, BEAT * 0.25, 0.5) * adsr(int(BEAT * 0.25 * SR), d=0.04, s=0.2), t0 + 3 * BEAT, 0.07, 0.3)
        # 鼓
        d = lay["drum"]
        if "k" in d:
            for i in range(4):
                if i % 2 == 0 or (sec in ("userauth", "lift") and i == 3):
                    kick(t0 + i * BEAT, 0.42)
        if "s" in d:
            snare(t0 + BEAT, 0.24)
            snare(t0 + 3 * BEAT, 0.24)
        if "h" in d:
            for i in range(8):
                hat(t0 + i * BEAT / 2, 0.10 if i % 2 else 0.16, open_=(i == 7 and sec != "edge"))
        # 主旋律：每段开头唱一句（压在旁白下面，混音会自动让开），lift 段唱完整
        if sec == "lift" or (b - first[sec] < 2 and sec in ("kex", "dh", "hostkey", "userauth")):
            rel = b - first[sec]
            if sec == "lift":
                ph = MOTIF["lift1"] if rel % 4 < 2 else MOTIF["lift2"]
                g = 0.20
            else:
                ph = MOTIF["a"] if prog[0] in ("Am", "Dm") else MOTIF["b"]
                if sec == "dh":
                    ph = [None if m is None else m - 7 for m in MOTIF["a"]]
                if sec == "hostkey":
                    ph = [None if m is None else (m + 1 if m % 12 == 7 else m) for m in MOTIF["a"]]
                g = 0.13
            half = (rel % 2) * 8
            for i in range(8):
                m = ph[half + i]
                if m is None:
                    continue
                ln = 1
                while i + ln < 8 and ph[half + i + ln] is None and ln < 3:
                    ln += 1
                dur = ln * BEAT / 2 * 0.95
                put(pulse(m, dur, 0.25, vib=0.004) * adsr(int(dur * SR), d=0.25, s=0.6, r=0.04), t0 + i * BEAT / 2, g, 0.15)
    # 片名卡与收束处各一记镲
    crash(title_t - 0.02, 0.15)
    if lift_t is not None:
        crash(lift_t - 0.02, 0.17)
    y = np.stack([L, R])
    peak = float(np.abs(y).max()) or 1.0
    return y / peak * 0.9
