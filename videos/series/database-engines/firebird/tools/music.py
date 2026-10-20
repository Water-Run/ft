# Firebird 一集的配乐：程序合成的电子乐，124 拍/分，四踩贯穿全片。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music 写成 "tools/music.py"）：compose(ctx) 返回 (2, N) 的数组，
# 电平、旁白压低与限幅仍由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: project.json 的 audio 段 }
#
# 为什么是电子乐而不是又一层铺底（docs/feedback.md P27、P3 与 F06）：
#   本片讲的是「一个引擎既是服务端又是库」——同一个东西两种形态。这条线索天然适合
#   一段有明确节拍、层次逐章叠加的电子乐：每章加一层，听众不用看画面也感觉得到结构。
#   与系列其他片的差别：2FA 是 120 拍/分的稀疏纪实（以秒针贯穿），PostgreSQL 是 72 拍/分的工业铺底，
#   InnoDB 偏 MyISAM 式的持续低频。本片是 124 拍/分、十六分音符驱动的酸性贝斯加方波琶音，
#   听感上明显是「电子」而不是「纪录片配乐」。
#
# 母题：火焰三层（金/橙/红）对应三个音高，构成一个上行后回落的三音动机，
#   在章首与结论处出现，其余段落只保留它的节拍骨架。
#
# 分层按 ctx["scenes"] 的顺序推进：每章进入时加一层，outro 全开，credits 收到只剩铺底与低音。
#   open    只有低频脉冲与滤波噪声（还没点火）
#   history 方波拨弦进场
#   engine  四踩 + 十六分酸性贝斯（本片的主段）
#   modes   加宽立体声垫
#   store   十六分琶音 + 打击
#   update  密度上升，章末一个 riser
#   concur  峰值：双倍细分的 hat 与十六分跑动
#   durable 回到稳定的四踩
#   outro   全开，结论处抬起
#   next    收拢
#   credits 只剩铺底与低音
#
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 124.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FADE = (0.02, 1.2)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# A 小调：Am – F – C – G，每小节一个和弦，四小节一轮
CHORDS = {
    "Am": {"root": 33, "tones": [57, 60, 64, 69, 72]},   # A C E A C
    "F":  {"root": 29, "tones": [53, 57, 60, 65, 69]},   # F A C F A
    "C":  {"root": 36, "tones": [60, 64, 67, 72, 76]},   # C E G C E
    "G":  {"root": 31, "tones": [55, 59, 62, 67, 71]},   # G B D G B
    "Am5": {"root": 33, "tones": [57, 64, 69, 72, 76]},  # 片尾：Am 上加五度
}
CYCLE = ["Am", "F", "C", "G"]

# 每章的层配置：pad / kick / sub / acid / hat / rim / arp / pluck / fx
LAYERS = {
    "open":    {"pad": 0.35, "kick": 0.0, "sub": 0.5, "hat": 0.0, "acid": 0.0, "arp": 0.0, "pluck": 0.0, "rim": 0.0},
    "history": {"pad": 0.7,  "kick": 0.55, "sub": 0.7, "hat": 0.35, "acid": 0.0, "arp": 0.0, "pluck": 0.75, "rim": 0.3},
    "engine":  {"pad": 0.85, "kick": 0.95, "sub": 0.85, "hat": 0.6, "acid": 0.85, "arp": 0.0, "pluck": 0.5, "rim": 0.5},
    "modes":   {"pad": 1.0,  "kick": 0.9,  "sub": 0.8, "hat": 0.55, "acid": 0.7, "arp": 0.0, "pluck": 0.6, "rim": 0.45},
    "store":   {"pad": 0.9,  "kick": 0.9,  "sub": 0.8, "hat": 0.7, "acid": 0.6, "arp": 0.8, "pluck": 0.5, "rim": 0.6},
    "update":  {"pad": 0.9,  "kick": 0.95, "sub": 0.85, "hat": 0.8, "acid": 0.75, "arp": 0.85, "pluck": 0.45, "rim": 0.7},
    "concur":  {"pad": 1.0,  "kick": 1.0,  "sub": 0.9, "hat": 0.95, "acid": 0.95, "arp": 1.0, "pluck": 0.4, "rim": 0.8},
    "durable": {"pad": 0.95, "kick": 0.95, "sub": 0.9, "hat": 0.7, "acid": 0.7, "arp": 0.6, "pluck": 0.45, "rim": 0.6},
    "outro":   {"pad": 1.0,  "kick": 0.95, "sub": 0.9, "hat": 0.8, "acid": 0.8, "arp": 0.9, "pluck": 0.5, "rim": 0.7},
    "next":    {"pad": 0.8,  "kick": 0.6,  "sub": 0.7, "hat": 0.4, "acid": 0.35, "arp": 0.5, "pluck": 0.5, "rim": 0.35},
    "credits": {"pad": 0.75, "kick": 0.0,  "sub": 0.55, "hat": 0.0, "acid": 0.0, "arp": 0.0, "pluck": 0.0, "rim": 0.0},
}


def compose(ctx):
    SR, N, total = ctx["sr"], ctx["n"], ctx["total"]
    rng = np.random.default_rng(20261020)
    scenes = ctx["scenes"]
    spec = (ctx.get("audio") or {}).get("score") or {}
    cue = {c["id"]: c for c in ctx.get("cues", [])}

    # 母题：火焰三层，上行后回落
    MOTIF = [69, 72, 76]        # A C E
    MOTIF_UP = [76, 72, 69]

    # 结论处抬起的落点
    lift = None
    if spec.get("lift_cue") in cue:
        lift = round((cue[spec["lift_cue"]]["start"] + 0.15) / BEAT) * BEAT

    stems = {k: np.zeros((2, N)) for k in
             ("pad", "kick", "sub", "acid", "hat", "rim", "arp", "pluck", "fx")}

    def put(name, sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0 or i >= N:
            return
        j = min(N, i + len(sig))
        stems[name][0, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 - pan))
        stems[name][1, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 + pan))

    def put2(name, sig2, t, g=1.0):
        i = int(round(t * SR))
        if i < 0 or i >= N:
            return
        j = min(N, i + sig2.shape[1])
        stems[name][:, i:j] += sig2[:, : j - i] * g

    def tt(d):
        return np.arange(int(d * SR)) / SR

    # ── 音色 ──
    def kick():
        t = tt(0.34)
        f = 52 + 96 * np.exp(-t / 0.022)
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
        click = rng.standard_normal(len(t)) * np.exp(-t / 0.0012) * 0.3
        return (body + click) * np.minimum(1, t / 0.0012)

    def sub(m, d):
        t = tt(d)
        y = np.sin(2 * np.pi * hz(m) * t) + 0.22 * np.sin(2 * np.pi * hz(m) * 2 * t)
        return y * np.minimum(1, t / 0.006) * np.clip((d - t) / 0.04, 0, 1)

    def acid(m, d, cut=1.0):
        """酸性贝斯：加法合成的锯齿，高次谐波衰减快，滤波器随包络关上。"""
        t = tt(d)
        f = hz(m)
        y = np.zeros(len(t))
        for k in range(1, 10):
            if f * k > 3200:
                break
            y += np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (1.6 + 5.2 * (k - 1)) * cut)
        return y * np.minimum(1, t / 0.003) * np.clip((d - t) / 0.012, 0, 1)

    def square(m, d, duty=0.5):
        """方波拨弦：少量二次谐波，避免纯方波的刺耳。"""
        t = tt(d)
        f = hz(m)
        ph = (f * t) % 1.0
        out = np.where(ph < duty, 1.0, -1.0)
        out = out + 0.18 * np.sin(2 * np.pi * 2 * f * t)
        return out * np.exp(-t / (d * 0.22)) * np.minimum(1, t / 0.002)

    def pluck(m, d=0.32):
        t = tt(d)
        f = hz(m)
        y = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.05) \
            + 0.3 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.025)
        return y * np.exp(-t / (d * 0.2)) * np.minimum(1, t / 0.002)

    def hat(open_=False):
        t = tt(0.18 if open_ else 0.045)
        x = rng.standard_normal(len(t))
        x = np.diff(np.diff(x, prepend=0), prepend=0)
        return x / (np.abs(x).max() + 1e-9) * np.exp(-t / (0.05 if open_ else 0.011))

    def rim():
        t = tt(0.085)
        x = np.diff(rng.standard_normal(len(t)), prepend=0)
        return (0.6 * x / (np.abs(x).max() + 1e-9) * np.exp(-t / 0.011)
                + np.sin(2 * np.pi * 1760 * t) * np.exp(-t / 0.018)) * np.minimum(1, t / 0.0008)

    def pad(ch, d, atk=0.4, rel=0.9):
        t = tt(d + rel)
        y = np.zeros((2, len(t)))
        env = np.minimum(1, t / atk) * np.clip((d + rel - t) / rel, 0, 1)
        for i, m in enumerate(ch["tones"][:4]):
            f = hz(m - 12)
            det = f * 0.004
            ph = rng.uniform(0, 2 * np.pi, 3)
            tone = np.sin(2 * np.pi * (f - det) * t + ph[0]) \
                + np.sin(2 * np.pi * (f + det) * t + ph[1]) \
                + 0.2 * np.sin(2 * np.pi * 2 * f * t + ph[2])
            pan = [-0.55, 0.4, -0.2, 0.6][i]
            y[0] += tone * np.sqrt(0.5 * (1 - pan))
            y[1] += tone * np.sqrt(0.5 * (1 + pan))
        return y * env / 6.0

    def riser(d):
        t = tt(d)
        x = rng.standard_normal(len(t))
        X = np.fft.rfft(x)
        fq = np.fft.rfftfreq(len(x), 1 / SR)
        k = t / d
        lo = np.fft.irfft(X * (fq > 200) * (fq < 2000), len(x))
        hi = np.fft.irfft(X * (fq >= 2000) * (fq < 9000), len(x))
        return (lo * (1 - k) + hi * k) * k ** 2.4 * np.clip((d - t) / 0.02, 0, 1)

    def boom():
        t = tt(1.2)
        f = 38 + 30 * np.exp(-t / 0.08)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.3)
        x = rng.standard_normal(len(t))
        X = np.fft.rfft(x)
        fq = np.fft.rfftfreq(len(x), 1 / SR)
        air = np.fft.irfft(X * (fq > 2600) * (fq < 9000), len(x)) * np.exp(-t / 0.26)
        return (y + air / (np.abs(air).max() + 1e-9) * 0.2) * np.minimum(1, t / 0.002)

    K, HC, HO, RM, BM = kick(), hat(), hat(True), rim(), boom()

    # 混响逐音符做（短变换），不对整条分轨做变换：同样的音只算一次，放进缓存
    IRN = int(1.2 * SR)
    t_ir = np.arange(IRN) / SR
    r2 = np.random.default_rng(77)
    IR = [r2.standard_normal(IRN) * np.exp(-t_ir / 0.42) for _ in range(2)]
    for c in range(2):
        IR[c][: int(0.010 * SR)] = 0
    IRF, WET = {}, {}

    def tail(sig2):
        n = sig2.shape[1] + IRN
        nf = 1 << int(np.ceil(np.log2(n)))
        if nf not in IRF:
            IRF[nf] = [np.fft.rfft(IR[c], nf) for c in range(2)]
        out = np.stack([np.fft.irfft(np.fft.rfft(sig2[c], nf) * IRF[nf][c], nf)[:n] for c in range(2)])
        return out * (np.abs(sig2).max() / max(1e-9, np.abs(out).max()))

    PADS = {}

    def pad_wet(ch, d, atk, rel=0.9):
        key = (ch, round(d, 3), atk)
        if key not in PADS:
            dry = pad(CHORDS[ch], d, atk, rel)
            PADS[key] = (dry, tail(dry))
        return PADS[key]

    def note(name, key, make, t, g, pan, wet=0.28, echo=0.0, fb=0.4, nrep=2):
        if key not in WET:
            m = make()
            WET[key] = (m, tail(np.stack([m, m])))
        m, tl_ = WET[key]
        put(name, m, t, g, pan)
        put2(name, tl_, t, g * wet)
        for r in range(1, nrep + 1 if echo else 1):
            put(name, m, t + r * echo, g * fb ** r, (0.7 if r % 2 else -0.7))

    def sq(name, m, d, t, g, pan, echo=0.0, fb=0.38):
        note(name, ("s", m, d), lambda: square(m, d), t, g, pan, wet=0.22, echo=echo, fb=fb, nrep=2)

    # ── 每小节属于哪一段、用哪个和弦 ──
    def section_of(t):
        for s in scenes:
            if s["start"] - 1e-6 <= t < s["end"] - 1e-6:
                return s
        return scenes[-1]

    nbars = int(np.ceil(total / BAR))
    plan = []
    for b in range(nbars):
        t0 = b * BAR
        s = section_of(t0)
        local = int(round((t0 - s["start"]) / BAR))
        ch = "Am5" if s["id"] == "credits" else CYCLE[local % 4]
        plan.append({"b": b, "t": t0, "s": s, "local": local, "ch": ch,
                     "w": LAYERS.get(s["id"], LAYERS["open"])})

    # ── 铺底：每小节一个和弦，首尾交叠 ──
    for p in plan:
        if p["s"]["id"] == "credits":
            continue
        g = p["w"]["pad"]
        if g <= 0:
            continue
        dry, wt = pad_wet(p["ch"], BAR, 0.3 if p["b"] else 0.8)
        put2("pad", dry, p["t"], g * 0.75)
        put2("pad", wt, p["t"], g * 0.5)

    # ── 鼓、贝斯、琶音 ──
    for p in plan:
        t0, sid, w, ch = p["t"], p["s"]["id"], p["w"], CHORDS[p["ch"]]
        tones = ch["tones"]
        for beat in range(4):
            tb = t0 + beat * BEAT
            # 四踩底鼓：每一拍都落
            if w["kick"] > 0:
                put("kick", K, tb, w["kick"] * (1.0 if beat == 0 else 0.86))
            # 低音：根音，八分音符
            if w["sub"] > 0:
                put("sub", sub(ch["root"], BEAT * 0.48), tb, w["sub"] * 0.5)
                put("sub", sub(ch["root"], BEAT * 0.4), tb + BEAT * 0.5, w["sub"] * 0.36)
            # hat：八分；章节越密，十六分
            if w["hat"] > 0:
                put("hat", HC, tb + BEAT * 0.5, w["hat"] * 0.85, 0.28)
                if sid in ("store", "update", "concur", "outro"):
                    put("hat", HC, tb + BEAT * 0.25, w["hat"] * 0.4, -0.26)
                    put("hat", HC, tb + BEAT * 0.75, w["hat"] * 0.4, -0.26)
            if w["rim"] > 0 and beat in (1, 3):
                put("rim", RM, tb, w["rim"] * 0.75, 0.2)
            # 酸性贝斯：十六分音符型
            if w["acid"] > 0:
                pat = [0, 0, 7, 0, 3, 0, 7, 10]
                for i in range(4):
                    deg = pat[(i + p["local"]) % 8]
                    mm = ch["root"] + 12 + deg
                    put("acid", acid(mm, BEAT * 0.22, 1.0), tb + i * BEAT * 0.25,
                        w["acid"] * (0.95 if i == 0 else 0.6))
        # 方波琶音：十六分音符的跑动，只在信息密的章节
        if w["arp"] > 0:
            pat = [0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 4, 1, 3, 1, 2, 4]
            for i in range(16):
                mm = tones[pat[(i + p["local"] * 5) % 16]] + 12
                note("arp", ("a", mm), lambda mm=mm: pluck(mm, 0.22), t0 + i * BEAT * 0.25,
                     w["arp"] * (0.8 if i % 4 == 0 else 0.45),
                     0.55 * np.sin(i * 0.9 + p["b"]), wet=0.2, echo=BEAT * 0.75, fb=0.3, nrep=2)
        # 方波拨弦：每小节两个切分音
        if w["pluck"] > 0:
            for st, idx, g in ((0.0, 0, 0.85), (1.5, 3, 0.6), (2.5, 2, 0.55)):
                sq("pluck", tones[idx] + 12, 0.3, t0 + st * BEAT * 0.5, w["pluck"] * g,
                   [-0.35, 0.4, -0.1][int(st) % 3], echo=BEAT * 0.5)

    # ── 章节切换：落点与母题 ──
    for s in scenes[1:]:
        put("fx", BM, s["start"], 1.0)
        # 母题：章首三音，上行后回落
        for i, m in enumerate(MOTIF):
            sq("pluck", m, 0.34, s["start"] + 0.10 + i * BEAT * 0.5, 0.55, -0.3 + 0.3 * i)
        if s["id"] == "update":
            put("fx", riser(2 * BAR), max(0.0, s["end"] - 2 * BAR), 0.9)

    # 结论处：母题上行抬起
    if lift is not None:
        for i, m in enumerate(MOTIF_UP):
            sq("pluck", m + 12, 0.5, lift + i * BEAT * 0.5, 0.7, 0.0, echo=BEAT)

    # ── 片尾：只剩铺底与低音 ──
    cred = [s for s in scenes if s["id"] == "credits"]
    if cred:
        t_out = cred[0]["start"]
        dry, wt = pad_wet("Am5", max(1.5, total - t_out - 2.0), 0.3, 1.4)
        put2("pad", dry, t_out, 1.5 * 0.75)
        put2("pad", wt, t_out, 1.5 * 0.5)
        for i, m in enumerate([45, 45, 52, 57]):
            put("sub", sub(m, 1.4), t_out + i * BEAT, 0.4)

    # ── 混合：低音在底鼓落下的瞬间让一下 ──
    kenv = np.abs(stems["kick"]).max(axis=0)
    w = int(0.04 * SR)
    cs = np.cumsum(np.concatenate([np.zeros(w // 2 + 1), kenv, np.zeros(w - w // 2)]))
    kenv = ((cs[w:] - cs[:-w]) / w)[:N]
    kenv /= max(1e-9, kenv.max())
    stems["sub"] *= 1 - 0.5 * kenv
    stems["acid"] *= 1 - 0.35 * kenv

    GAIN = {"pad": 0.20, "kick": 0.46, "sub": 0.20, "acid": 0.20, "hat": 0.16,
            "rim": 0.16, "arp": 0.15, "pluck": 0.20, "fx": 0.30}
    GAIN.update(spec.get("gains") or {})
    mixd = sum(stems[k] * GAIN[k] for k in stems)
    ctx["stems"] = {k: float(np.sqrt(np.mean((v * GAIN[k]) ** 2))) for k, v in stems.items()}
    return mixd
