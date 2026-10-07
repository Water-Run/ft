# 本集的配乐：程序合成，120 拍/分，一秒两拍；每个正片场景 32 秒，正好 16 小节，段落交界落在换场的那一拍上。
# 沿用系列的做法（tools/music.py 由 kit/tools/mix.py 调用，compose(ctx) 返回 (2, N) 的数组；全片每秒一声「秒针」；
# 结论处抬起，片尾只留铺底与秒针），但六段各有各的编排，不是一套铺底用到底：
#   0 open    引子：前四小节只有铺底、长低音与秒针，随后加轻的底鼓与稀疏的拨弦
#   1 formal  律动 A：四拍底鼓、反拍镲、八分音符低音、稀疏拨弦（时间轴一路向右）
#   2 types   律动 B：换成大调起头的和弦，加十六分音符的上行琶音；mark_cues 里的那一句（「无穷多个 n 全部覆盖」）落一声重音，琶音升高八度
#   3 kernel  机械：没有拨弦与琶音，十六分音符的边击按固定的图案走，低音在根音与八度之间跳，中音区是不带回声的断奏（内核逐个节点地查）
#   4 trust   开阔：半拍的鼓，铺底加厚，高处是带回声的稀疏音；mark_cues 里的那一句（Mathlib）起加上琶音
#   5 edge    收束：半拍；audio.score.lift_cue 那一句（结论）起恢复四拍并加上拨弦
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: project.json 的 audio 段 }
#   audio.score.lift_cue：结论那一句的句号。抬起的那一拍 = 该句开始后 0.2 秒就近取整拍（场景里的大字也落在这一拍）。
#   audio.score.mark_cues：{ 场景号: 句号 }，该场景里落重音的那一句。
# 设计：配的是讲解，不是舞曲。底鼓很轻，没有主旋律；音色只用正弦、加法合成的锯齿与噪声。
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 120.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FADE = (0.02, 0.35)                     # 第一拍就起，不做慢淡入；结尾只留一个很短的收口
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# D 小调。每小节一个和弦；各段的和弦走向不同，段尾三小节都停在 VI、VII、VII 上，悬到下一段的第一拍解决
CHORDS = {
    "Dm":  {"root": 38, "tones": [62, 65, 69, 72, 76]},     # D F A C E
    "Bb":  {"root": 34, "tones": [58, 62, 65, 69, 72]},     # Bb D F A C
    "F":   {"root": 41, "tones": [60, 65, 69, 72, 76]},     # C F A C E
    "C":   {"root": 36, "tones": [60, 62, 67, 72, 74]},     # C D G C D（挂二）
    "Gm":  {"root": 31, "tones": [58, 62, 65, 67, 74]},     # Bb D F G D（加七）
    "As":  {"root": 33, "tones": [57, 62, 64, 69, 74]},     # A D E A D（挂四，不带三音）
    "D5":  {"root": 38, "tones": [62, 69, 74, 76, 81]},     # 片尾：D A D E A，不带三音
}
STYLES = ["intro", "grooveA", "grooveB", "machine", "wide", "half"]
CYCLES = {
    "intro":   ["Dm", "Bb", "F", "C"],
    "grooveA": ["Dm", "Bb", "F", "C"],
    "grooveB": ["F", "C", "Dm", "Bb"],
    "machine": ["Dm", "Dm", "Gm", "As"],
    "wide":    ["Bb", "F", "C", "Dm"],
    "half":    ["Dm", "Bb", "F", "C"],
}
MACHINE = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1]          # 「机械」一段边击的十六分音符图案


def compose(ctx):
    SR, N, total = ctx["sr"], ctx["n"], ctx["total"]
    rng = np.random.default_rng(2026)
    scenes = ctx["scenes"]
    spec = (ctx.get("audio") or {}).get("score") or {}
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    body, outro = scenes[:-1], scenes[-1]
    t_out = outro["start"]
    on_beat = lambda t: round(t / BEAT) * BEAT
    lift = on_beat(cue[spec["lift_cue"]]["start"] + 0.2) if spec.get("lift_cue") in cue else None
    marks = {sid: on_beat(cue[cid]["start"] + 0.2) for sid, cid in (spec.get("mark_cues") or {}).items() if cid in cue}
    style_of = lambda k: STYLES[k] if len(body) == len(STYLES) else ("intro" if k == 0 else "half" if k == len(body) - 1 else "grooveA")
    stems = {k: np.zeros((2, N)) for k in ("kick", "hat", "rim", "tick", "bass", "pluck", "arp", "pad", "fx")}

    def put(name, sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0 or i >= N: return
        j = min(N, i + len(sig))
        stems[name][0, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 - pan))
        stems[name][1, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 + pan))

    def tt(d): return np.arange(int(d * SR)) / SR

    # ── 音色 ──
    def kick():
        t = tt(0.32); f = 46 + 70 * np.exp(-t / 0.028)
        body_ = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13)
        click = rng.standard_normal(len(t)) * np.exp(-t / 0.0015) * 0.25
        return (body_ + click) * np.minimum(1, t / 0.0015)
    def hat(open_=False):
        t = tt(0.16 if open_ else 0.05); x = rng.standard_normal(len(t))
        x = np.diff(np.diff(x, prepend=0), prepend=0)                       # 两次差分：只留高频
        return x / (np.abs(x).max() + 1e-9) * np.exp(-t / (0.045 if open_ else 0.012))
    def rim():
        t = tt(0.09); x = np.diff(rng.standard_normal(len(t)), prepend=0)
        return (0.6 * x / (np.abs(x).max() + 1e-9) * np.exp(-t / 0.012) + np.sin(2 * np.pi * 1720 * t) * np.exp(-t / 0.02)) * np.minimum(1, t / 0.001)
    def tick(tock=False):                                                   # 秒针：一声很短的木质敲击，嘀与嗒音高不同
        t = tt(0.06); f = 1900 if tock else 2500
        return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.007) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.003)) * np.minimum(1, t / 0.0006)
    def bass(m, d):                                                         # 加法合成的锯齿，高次谐波衰减得快：相当于滤波器随时间关上
        t = tt(d); f = hz(m); y = np.zeros(len(t))
        for k in range(1, 9):
            if f * k > 1400: break
            y += np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (2.0 + 5.5 * (k - 1)))
        return y * np.minimum(1, t / 0.004) * np.clip((d - t) / 0.02, 0, 1)
    def pluck(m, d=0.5, bright=0.3):
        t = tt(d); f = hz(m)
        return (np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.06) + 0.5 * bright * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.03) + 0.3 * bright * np.sin(2 * np.pi * 5 * f * t) * np.exp(-t / 0.012)) * np.exp(-t / (d * 0.24)) * np.minimum(1, t / 0.002)
    def pad(ch, d, atk=0.5, rel=0.8):
        t = tt(d + rel); y = np.zeros((2, len(t)))
        env = np.minimum(1, t / atk) * np.clip((d + rel - t) / rel, 0, 1)
        for i, m in enumerate(ch["tones"][:4]):
            f = hz(m - 12); det = f * 0.003; ph = rng.uniform(0, 2 * np.pi, 3)
            tone = np.sin(2 * np.pi * (f - det) * t + ph[0]) + np.sin(2 * np.pi * (f + det) * t + ph[1]) + 0.18 * np.sin(2 * np.pi * 2 * f * t + ph[2])
            pan = [-0.5, 0.35, -0.2, 0.55][i]
            y[0] += tone * np.sqrt(0.5 * (1 - pan)); y[1] += tone * np.sqrt(0.5 * (1 + pan))
        return y * env / 6.0
    def put2(name, sig2, t, g=1.0):
        i = int(round(t * SR))
        if i < 0 or i >= N: return
        j = min(N, i + sig2.shape[1]); stems[name][:, i:j] += sig2[:, : j - i] * g
    # 混响逐音符做（短变换），不对整条分轨做变换：同样的音只算一次，放进缓存
    IRN = int(1.5 * SR); t_ir = np.arange(IRN) / SR; r2 = np.random.default_rng(5)
    IR = [r2.standard_normal(IRN) * np.exp(-t_ir / 0.55) for _ in range(2)]
    for c in range(2): IR[c][: int(0.012 * SR)] = 0
    IRF, WET = {}, {}
    def tail(sig2):                                                          # (2, n) → (2, n + IRN) 的混响，峰值归一到原信号的峰值
        n = sig2.shape[1] + IRN; nf = 1 << int(np.ceil(np.log2(n)))
        if nf not in IRF: IRF[nf] = [np.fft.rfft(IR[c], nf) for c in range(2)]
        out = np.stack([np.fft.irfft(np.fft.rfft(sig2[c], nf) * IRF[nf][c], nf)[:n] for c in range(2)])
        return out * (np.abs(sig2).max() / max(1e-9, np.abs(out).max()))
    def note(name, key, make, t, g, pan, wet=0.3, echo=0.0, fb=0.42, nrep=3):
        if key not in WET: m = make(); WET[key] = (m, tail(np.stack([m, m])))
        m, tl_ = WET[key]
        put(name, m, t, g, pan); put2(name, tl_, t, g * wet)
        for r in range(1, nrep + 1 if echo else 1):                          # 左右交替的回声
            put(name, m, t + r * echo, g * fb ** r, (0.7 if r % 2 else -0.7))
    def noise_rise(d):                                                      # 段落末尾的铺垫：越来越亮的噪声
        t = tt(d); x = rng.standard_normal(len(t)); k = t / d
        X = np.fft.rfft(x); fq = np.fft.rfftfreq(len(x), 1 / SR)
        lo = np.fft.irfft(X * (fq > 800) * (fq < 3500), len(x)); hi = np.fft.irfft(X * (fq >= 3500) * (fq < 9000), len(x))
        return (lo * (1 - k) + hi * k) * k ** 2.2 * np.clip((d - t) / 0.02, 0, 1)
    def boom():                                                             # 段落第一拍：很低的一声，加一片向下收的噪声
        t = tt(1.4); f = 34 + 26 * np.exp(-t / 0.09)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35)
        x = rng.standard_normal(len(t)); X = np.fft.rfft(x); fq = np.fft.rfftfreq(len(x), 1 / SR)
        air = np.fft.irfft(X * (fq > 2500) * (fq < 9000), len(x)) * np.exp(-t / 0.3) * 0.5
        return (y + air / (np.abs(air).max() + 1e-9) * 0.22) * np.minimum(1, t / 0.002)

    K, HC, HO, RM, TK, TC, BM = kick(), hat(), hat(True), rim(), tick(), tick(True), boom()
    def pl(m, d, bright, t, g, pan, echo=True):
        note("pluck", ("p", m, d, bright), lambda: pluck(m, d, bright), t, g, pan, wet=0.32, echo=3 * BEAT / 4 if echo else 0.0)
    def ar(m, t, g, pan):
        note("arp", ("a", m), lambda: pluck(m, 0.2, 0.15), t, g, pan, wet=0.2, echo=3 * BEAT / 4, fb=0.33, nrep=2)

    # ── 每小节属于哪一段、用哪个和弦 ──
    def section_of(t):
        for k, s in enumerate(body):
            if s["start"] - 1e-6 <= t < s["end"] - 1e-6: return k, s
        return len(body), outro
    nbars = int(np.ceil(total / BAR))
    plan = []
    for b in range(nbars):
        t0 = b * BAR; k, s = section_of(t0)
        local = int(round((t0 - s["start"]) / BAR)); left = int(round((s["end"] - t0) / BAR))      # 段内第几小节、离段尾还有几小节
        kind = "outro" if k == len(body) else style_of(k)
        ch = "D5" if kind == "outro" else (["Bb", "C", "C"][3 - left] if left <= 3 and kind != "half" else CYCLES[kind][local % 4])
        mark = marks.get(s["id"])
        plan.append({"b": b, "t": t0, "k": k, "kind": kind, "local": local, "left": left, "ch": ch, "marked": mark is not None and t0 + 1e-6 >= mark})

    # ── 铺底：每小节一个和弦，首尾交叠 ──
    PADS = {}
    def pad_wet(name, d, atk, rel=0.8):
        key = (name, round(d, 3), atk)
        if key not in PADS: dry = pad(CHORDS[name], d, atk, rel); PADS[key] = (dry, tail(dry))
        return PADS[key]
    PAD_G = {"intro": 0.9, "grooveA": 0.8, "grooveB": 0.75, "machine": 0.8, "wide": 1.2, "half": 1.15}
    for p in plan:
        if p["t"] >= t_out: continue
        g = PAD_G[p["kind"]]
        dry, wt = pad_wet(p["ch"], BAR, 0.35 if p["b"] else 0.9)
        put2("pad", dry, p["t"], g * 0.7); put2("pad", wt, p["t"], g * 0.5)
    dry, wt = pad_wet("D5", max(1.0, total - t_out - 3.4), 0.25, 1.6)
    put2("pad", dry, t_out, 1.6 * 0.7); put2("pad", wt, t_out, 1.6 * 0.4)

    # ── 秒针：全片每秒一声，嘀嗒交替，左右略分 ──
    for sec in range(int(total)):
        put("tick", TC if sec % 2 else TK, float(sec), 1.0 if sec % 2 == 0 else 0.8, -0.25 if sec % 2 == 0 else 0.25)

    # ── 鼓、低音与各段自己的层 ──
    for p in plan:
        t0, kind, left, local, ch = p["t"], p["kind"], p["left"], p["local"], CHORDS[p["ch"]]
        tones = ch["tones"]
        if kind == "outro": continue
        for beat in range(4):
            tb = t0 + beat * BEAT
            if tb >= t_out - 1e-6: break
            in_lift = lift is not None and kind == "half" and tb + 1e-6 >= lift
            if kind == "intro":
                if local >= 4 and beat in (0, 2): put("kick", K, tb, 0.5)
                if local >= 4: put("hat", HC, tb + BEAT / 2, 0.55, 0.3)
                if local < 4:
                    if beat == 0: put("bass", bass(ch["root"], 1.6), tb, 0.42)
                else:
                    put("bass", bass(ch["root"], 0.24), tb, 0.95); put("bass", bass(ch["root"] + (12 if beat == 3 else 0), 0.22), tb + BEAT / 2, 0.7)
            elif kind in ("grooveA", "grooveB"):
                put("kick", K, tb, 0.85 if beat == 0 else 0.72)
                put("hat", HC, tb + BEAT / 2, 0.8, 0.3)
                if kind == "grooveB":
                    put("hat", HC, tb + BEAT / 4, 0.3, -0.3); put("hat", HC, tb + 3 * BEAT / 4, 0.3, -0.3)
                    if beat in (1, 3): put("rim", RM, tb, 0.8, 0.2)
                if beat == 3 and local % 4 == 3: put("hat", HO, tb + BEAT / 2, 0.5, 0.3)
                put("bass", bass(ch["root"], 0.24), tb, 0.95); put("bass", bass(ch["root"] + (12 if beat == 3 else 0), 0.22), tb + BEAT / 2, 0.7)
            elif kind == "machine":
                put("kick", K, tb, 0.7 if beat in (0, 2) else 0.3)
                for i in range(4):
                    if MACHINE[beat * 4 + i]: put("rim", RM, tb + i * BEAT / 4, 0.5 if i else 0.75, 0.35 if (beat * 4 + i) % 3 else -0.35)
                put("hat", HC, tb + BEAT / 2, 0.4, 0.3)
                for i in range(4):                                             # 低音：十六分音符，根音与八度交替
                    put("bass", bass(ch["root"] + (12 if i % 2 else 0), 0.12), tb + i * BEAT / 4, 0.5 if i == 0 else 0.3)
                for i, idx in enumerate((0, 2)):                               # 中音区的断奏：八分音符，和弦的根音与五音交替，不带回声
                    m_ = tones[idx]
                    note("arp", ("m", m_), lambda m_=m_: pluck(m_, 0.16, 0.45), tb + i * BEAT / 2, 1.1 if i == 0 else 0.8, -0.35 if i == 0 else 0.35, wet=0.12)
            elif kind == "wide":
                if beat == 0: put("kick", K, tb, 0.8)
                if beat == 2: put("rim", RM, tb, 0.85, 0.2)
                put("hat", HC, tb + BEAT / 2, 0.45, 0.3)
                if beat in (0, 2): put("bass", bass(ch["root"], 1.0), tb, 0.9 if beat == 0 else 0.55)
            elif kind == "half":
                if in_lift:
                    put("kick", K, tb, 0.85 if beat == 0 else 0.72); put("hat", HC, tb + BEAT / 2, 0.8, 0.3)
                    if beat in (1, 3): put("rim", RM, tb, 0.8, 0.2)
                    put("bass", bass(ch["root"], 0.24), tb, 0.95); put("bass", bass(ch["root"] + (12 if beat == 3 else 0), 0.22), tb + BEAT / 2, 0.7)
                else:
                    if beat == 0: put("kick", K, tb, 0.8)
                    if beat == 2: put("rim", RM, tb, 0.9, 0.2)
                    put("hat", HC, tb + BEAT / 2, 0.45, 0.3)
                    if beat in (0, 2): put("bass", bass(ch["root"], 0.9), tb, 0.9 if beat == 0 else 0.6)
        # 拨弦与琶音
        lifted = lift is not None and kind == "half" and t0 + 1e-6 >= lift
        if kind in ("grooveA", "grooveB") or lifted:
            for i, (st, idx) in enumerate([(0, 0), (1.5, 2), (2.5, 1), (4, 3), (5.5, 2), (7, 4)] if local % 2 == 0 else [(0, 1), (1.5, 3), (3, 2), (4, 4), (5.5, 1), (6.5, 2)]):
                tn = t0 + st * BEAT / 2
                if tn < t_out: pl(tones[idx] + 12, 0.55, 0.3, tn, 0.9 if st == 0 else 0.65, [-0.4, 0.4, -0.15, 0.3, -0.3, 0.15][i])
        elif kind == "intro" and local >= 4 and local % 2 == 0:
            pl(tones[2] + 12, 0.9, 0.2, t0, 0.7, -0.3); pl(tones[4] + 12, 0.9, 0.2, t0 + 3 * BEAT / 2, 0.5, 0.3)
        elif kind == "half":
            pl(tones[2] + 12, 1.0, 0.2, t0, 0.7, -0.3); pl(tones[3] + 12, 1.0, 0.2, t0 + 2 * BEAT, 0.5, 0.3)
        elif kind == "wide":                                                  # 高处带回声的稀疏音，每小节两个
            pl(tones[4] + 12, 1.2, 0.2, t0 + BEAT, 0.7, 0.45); pl(tones[2] + 24, 1.2, 0.15, t0 + 3 * BEAT, 0.45, -0.45)
        if kind == "grooveB":                                                 # 十六分音符的上行琶音：一小节里从低到高走两遍；重音之后升高八度
            up = [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 4, 2] if local % 2 else [0, 1, 2, 3, 1, 2, 3, 4, 0, 1, 2, 3, 2, 3, 4, 4]
            for i in range(16):
                if i % 4 == 3 and local % 2 == 0 and not p["marked"]: continue
                ar(tones[up[i]] + (36 if p["marked"] else 24), t0 + i * BEAT / 4, 0.75 if i % 4 == 0 else 0.45, 0.6 * np.sin(i * 0.8 + p["b"]))
        if kind == "wide" and p["marked"]:                                    # Mathlib 之后：加上稀疏的琶音
            for i in (0, 3, 6, 8, 11, 14):
                ar(tones[(i * 3 + local) % 5] + 24, t0 + i * BEAT / 4, 0.6, 0.6 * np.sin(i * 0.9 + p["b"]))
        # 段尾三小节：噪声渐起；最后一小节加十六分音符的滚奏，最后一拍加密
        if left == 2 and kind != "half":
            put("fx", noise_rise(2 * BAR), t0, 0.9)
        if left == 1 and kind != "half":
            for i in range(16):
                put("rim", RM, t0 + i * BEAT / 4, 0.25 + 0.5 * i / 16, 0.0)
            for i in range(4): put("rim", RM, t0 + 3 * BEAT + (i + 0.5) * BEAT / 4, 0.6, 0.0)
    # ── 段落第一拍（换场）、段内的重音与片尾的落点 ──
    for s in body[1:]:
        put("fx", BM, s["start"], 1.0)
    for sid, tm in marks.items():
        put("fx", BM, tm, 0.9); put("hat", HO, tm, 0.7, 0.0)
        put("fx", noise_rise(1.5), tm - 1.5, 0.6)
    put("fx", BM, t_out, 0.9)
    # 片尾：两小节上行的拨弦，倒数第二秒一声钟音似的高音，随后只剩秒针
    for i, m in enumerate([74, 76, 81, 86]):
        pl(m, 1.2, 0.2, t_out + 0.5 + i * BEAT, 0.8, -0.3 + 0.2 * i)
    te = np.floor(total) - 2.0
    for m, g in ((86, 0.9), (81, 0.5), (74, 0.5)): pl(m, 2.2, 0.15, te, g, 0.0, echo=False)

    # ── 混合：低音在底鼓落下的瞬间让一下 ──
    kenv = np.abs(stems["kick"]).max(axis=0)
    w = int(0.05 * SR); cs = np.cumsum(np.concatenate([np.zeros(w // 2 + 1), kenv, np.zeros(w - w // 2)])); kenv = ((cs[w:] - cs[:-w]) / w)[:N]; kenv /= max(1e-9, kenv.max())
    stems["bass"] *= 1 - 0.55 * kenv
    GAIN = {"kick": 0.44, "hat": 0.30, "rim": 0.22, "tick": 0.30, "bass": 0.17, "pluck": 0.34, "arp": 0.26, "pad": 0.20, "fx": 0.36}
    GAIN.update(spec.get("gains") or {})
    mixd = sum(stems[k] * GAIN[k] for k in stems)
    ctx["stems"] = {k: float(np.sqrt(np.mean((v * GAIN[k]) ** 2))) for k, v in stems.items()}       # 各分轨进入混合后的电平，供检查
    return mixd
