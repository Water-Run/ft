# 「首 Token 延迟」配乐：已选方向 01「脉冲 · 清晰节拍」，100 BPM，程序合成（NumPy），按 src/design/scenes.md 第 5 节的小节表编排。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music 写成 "tools/music.py"）：compose(ctx) 返回 (2, N) 的数组，电平与旁白压低仍由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: project.json 的 audio 段 }
# 一拍 0.6 秒，一小节 2.4 秒，全片 40 小节；各场的起点都在小节线上。
# 设计：配的是讲解，不是舞曲。每拍一声很轻的「滴答」贯穿（计时器），琶音取自小样的音符环；
#   等待（open 开头）只有滴答与低音、悬着；片名、第一块琥珀落下（r3）、结尾（e2）各抬一次；scale 一场变疏；
#   close 的最后一小节滴答停在小节线上（计时停了）；片尾只剩主和弦铺底，最后淡出。
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 100.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FADE = (0.02, 0.8)                      # 第一拍就起；结尾淡出 0.8 秒
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# C 大调：C – Dm – F – G；音符环 [60,67,64,67,62,69,65,69] 就是 C 与 Dm 的琶音
CHORDS = {
    "C":  {"root": 36, "tones": [60, 64, 67, 72, 76]},
    "Dm": {"root": 38, "tones": [62, 65, 69, 72, 74]},
    "F":  {"root": 41, "tones": [60, 65, 69, 72, 77]},
    "G":  {"root": 31, "tones": [59, 62, 67, 71, 74]},
}
CYCLE = ["C", "Dm", "F", "G"]
ARP = [0, 2, 4, 2, 1, 3, 4, 3]          # 每小节八个八分音符取和弦的第几个音


def compose(ctx):
    SR, N, total = ctx["sr"], ctx["n"], ctx["total"]
    rng = np.random.default_rng(2026)
    scenes = {s["id"]: s for s in ctx["scenes"]}
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    beat_of = lambda t: round(t / BEAT) * BEAT
    cs = lambda cid, dflt: cue[cid]["start"] if cid in cue else dflt
    sc = lambda sid, key, dflt: scenes[sid][key] if sid in scenes else dflt
    t_title = beat_of(cs("oT", 12.0))                     # 片名卡落下的那一拍
    t_first = beat_of(cs("r3", sc("prefill", "start", 40.8) + 12.0))   # 第一块琥珀落下（prefill 的 r3）
    t_rise0 = cs("r1", sc("prefill", "start", 40.8) + 0.3) - 0.3
    t_close_lift = beat_of(cs("e2", sc("close", "start", 84.0) + 3.0))
    t_out = sc("outro", "start", total - 3.0)
    t_clock_stop = beat_of(sc("close", "end", t_out)) - BAR          # close 的最后一小节：滴答停在小节线上
    stems = {k: np.zeros((2, N)) for k in ("kick", "hat", "rim", "tick", "bass", "pluck", "arp", "pad", "fx")}

    def put(name, sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0 or i >= N: return
        j = min(N, i + len(sig))
        stems[name][0, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 - pan))
        stems[name][1, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 + pan))

    def put2(name, sig2, t, g=1.0):
        i = int(round(t * SR))
        if i < 0 or i >= N: return
        j = min(N, i + sig2.shape[1]); stems[name][:, i:j] += sig2[:, : j - i] * g

    def tt(d): return np.arange(int(d * SR)) / SR

    # ── 音色 ──
    def kick():
        t = tt(0.30); f = 48 + 66 * np.exp(-t / 0.03)
        body_ = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
        click = rng.standard_normal(len(t)) * np.exp(-t / 0.0015) * 0.2
        return (body_ + click) * np.minimum(1, t / 0.0015)

    def hat(open_=False):
        t = tt(0.14 if open_ else 0.045); x = rng.standard_normal(len(t))
        x = np.diff(np.diff(x, prepend=0), prepend=0)
        return x / (np.abs(x).max() + 1e-9) * np.exp(-t / (0.04 if open_ else 0.011))

    def rim():
        t = tt(0.09); x = np.diff(rng.standard_normal(len(t)), prepend=0)
        return (0.5 * x / (np.abs(x).max() + 1e-9) * np.exp(-t / 0.012) + np.sin(2 * np.pi * 1720 * t) * np.exp(-t / 0.02)) * np.minimum(1, t / 0.001)

    def tick(tock=False):                                  # 计时器：一声很短的木质敲击，嘀与嗒音高不同
        t = tt(0.06); f = 1800 if tock else 2400
        return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.007) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.003)) * np.minimum(1, t / 0.0006)

    def bass(m, d):                                        # 加法合成的锯齿，高次谐波衰减得快
        t = tt(d); f = hz(m); y = np.zeros(len(t))
        for k in range(1, 9):
            if f * k > 1200: break
            y += np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (2.0 + 5.5 * (k - 1)))
        return y * np.minimum(1, t / 0.004) * np.clip((d - t) / 0.02, 0, 1)

    def drone(m, d):                                       # 极低的持续音
        t = tt(d); return (np.sin(2 * np.pi * hz(m) * t) + 0.25 * np.sin(2 * np.pi * 2 * hz(m) * t)) * np.minimum(1, t / 0.4) * np.clip((d - t) / 0.6, 0, 1)

    def pluck(m, d=0.5, bright=0.3):
        t = tt(d); f = hz(m)
        return (np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.06) + 0.5 * bright * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.03)) * np.exp(-t / (d * 0.45)) * np.minimum(1, t / 0.002)

    def pad(ch, d, atk=0.5, rel=0.8):
        t = tt(d + rel); y = np.zeros((2, len(t)))
        env = np.minimum(1, t / atk) * np.clip((d + rel - t) / rel, 0, 1)
        for i, m in enumerate(ch["tones"][:4]):
            f = hz(m - 12); det = f * 0.003; ph = rng.uniform(0, 2 * np.pi, 3)
            tone = np.sin(2 * np.pi * (f - det) * t + ph[0]) + np.sin(2 * np.pi * (f + det) * t + ph[1]) + 0.18 * np.sin(2 * np.pi * 2 * f * t + ph[2])
            pan = [-0.5, 0.35, -0.2, 0.55][i]
            y[0] += tone * np.sqrt(0.5 * (1 - pan)); y[1] += tone * np.sqrt(0.5 * (1 + pan))
        return y * env / 6.0

    def boom():                                            # 抬起的那一拍：很低的一声，加一片向下收的噪声
        t = tt(1.2); f = 36 + 26 * np.exp(-t / 0.09)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.32)
        x = rng.standard_normal(len(t)); X = np.fft.rfft(x); fq = np.fft.rfftfreq(len(x), 1 / SR)
        air = np.fft.irfft(X * (fq > 2500) * (fq < 9000), len(x)) * np.exp(-t / 0.28) * 0.5
        return (y + air / (np.abs(air).max() + 1e-9) * 0.2) * np.minimum(1, t / 0.002)

    def rise(d):                                           # 越来越亮的噪声：读完输入那一段的铺垫
        t = tt(d); x = rng.standard_normal(len(t)); k = t / d
        X = np.fft.rfft(x); fq = np.fft.rfftfreq(len(x), 1 / SR)
        lo = np.fft.irfft(X * (fq > 800) * (fq < 3500), len(x)); hi = np.fft.irfft(X * (fq >= 3500) * (fq < 9000), len(x))
        return (lo * (1 - k) + hi * k) * k ** 2.2 * np.clip((d - t) / 0.02, 0, 1)

    # 混响逐音符做（短变换），同样的音只算一次
    IRN = int(1.3 * SR); t_ir = np.arange(IRN) / SR; r2 = np.random.default_rng(5)
    IR = [r2.standard_normal(IRN) * np.exp(-t_ir / 0.5) for _ in range(2)]
    for c in range(2): IR[c][: int(0.012 * SR)] = 0
    IRF, WET = {}, {}

    def tail(sig2):
        n = sig2.shape[1] + IRN; nf = 1 << int(np.ceil(np.log2(n)))
        if nf not in IRF: IRF[nf] = [np.fft.rfft(IR[c], nf) for c in range(2)]
        out = np.stack([np.fft.irfft(np.fft.rfft(sig2[c], nf) * IRF[nf][c], nf)[:n] for c in range(2)])
        return out * (np.abs(sig2).max() / max(1e-9, np.abs(out).max()))

    def note(name, key, make, t, g, pan, wet=0.3, echo=0.0, fb=0.4, nrep=2):
        if key not in WET: m = make(); WET[key] = (m, tail(np.stack([m, m])))
        m, tl_ = WET[key]
        put(name, m, t, g, pan); put2(name, tl_, t, g * wet)
        for r in range(1, nrep + 1 if echo else 1):
            put(name, m, t + r * echo, g * fb ** r, (0.7 if r % 2 else -0.7))

    def pl(m, d, bright, t, g, pan, echo=True):
        note("pluck", ("p", m, d, bright), lambda: pluck(m, d, bright), t, g, pan, wet=0.3, echo=3 * BEAT / 4 if echo else 0.0)

    K, HC, HO, RM, TK, TC, BM = kick(), hat(), hat(True), rim(), tick(), tick(True), boom()

    # ── 每小节属于哪一场、做什么 ──
    def scene_at(t):
        for sid, s in scenes.items():
            if s["start"] - 1e-6 <= t < s["end"] - 1e-6: return sid, s
        return "outro", scenes.get("outro", {"start": t_out, "end": total})
    nbars = int(np.ceil(total / BAR))
    for b in range(nbars):
        t0 = b * BAR
        if t0 >= t_out - 1e-6: break
        sid, s = scene_at(t0)
        local = int(round((t0 - s["start"]) / BAR))
        ch_name = "C" if sid in ("open", "close") else CYCLE[b % 4]
        ch = CHORDS[ch_name]; tones = ch["tones"]
        # 铺底：每小节一个和弦；等待阶段更轻
        g_pad = 0.55 if (sid == "open" and t0 < t_title - 1e-6) else 0.85 if sid == "scale" else 0.8
        dry = pad(ch, BAR, 0.35 if b else 0.9); put2("pad", dry, t0, g_pad)
        # 分段的律动类型
        if sid == "open":
            kind = "wait" if t0 < t_title - 1e-6 else "hold"
        elif sid in ("define", "write", "length"):
            kind = "groove"
        elif sid == "prefill":
            kind = "build" if t0 + BAR <= t_first - 1e-6 else "groove"
        elif sid == "scale":
            kind = "thin"
        elif sid == "close":
            kind = "groove" if t0 + 1e-6 < t_close_lift else "settle"
        else:
            kind = "settle"
        for beat in range(4):
            tb = t0 + beat * BEAT
            # 计时器滴答：每拍一声，到 close 最后一小节之前
            if tb < t_clock_stop - 1e-6:
                put("tick", TC if (beat % 2) else TK, tb, 0.9 if beat == 0 else 0.6, -0.25 if beat % 2 == 0 else 0.25)
            if kind == "wait":
                if beat == 0: put("bass", drone(ch["root"], BAR), tb, 0.5)
            elif kind in ("hold", "settle"):
                if beat in (0, 2) and kind == "hold": put("kick", K, tb, 0.6)
                if beat == 0: put("bass", bass(ch["root"], 1.4), tb, 0.7)
            elif kind == "build":
                put("hat", HC, tb + BEAT / 2, 0.45, 0.3)
                if beat == 0: put("bass", bass(ch["root"], 1.4), tb, 0.6)
            elif kind == "thin":
                if beat in (0, 2): put("bass", bass(ch["root"], 1.0), tb, 0.6)
                if beat == 0: put("kick", K, tb, 0.45)
            elif kind == "groove":
                put("kick", K, tb, 0.8 if beat == 0 else 0.65)
                put("hat", HC, tb + BEAT / 2, 0.7, 0.3)
                if beat in (1, 3): put("rim", RM, tb, 0.7, 0.2)
                put("bass", bass(ch["root"], 0.24), tb, 0.9)
                put("bass", bass(ch["root"] + (12 if beat == 3 else 0), 0.22), tb + BEAT / 2, 0.65)
                if sid == "length" and beat == 2: put("bass", bass(ch["root"] + 7, 0.3), tb, 0.5)       # 低音走动
        # 琶音：八分音符，取自和弦；等待阶段只在偶数小节的后半拍悬一个单音
        if kind == "wait":
            if local >= 4 and local % 1 == 0:
                pl(tones[2] + 12, 0.9, 0.2, t0 + 3 * BEAT / 2, 0.5, 0.3)
        elif kind in ("groove", "hold"):
            for i in range(8):
                m_ = tones[ARP[(i + (b % 2) * 3) % 8]] + 12
                note("arp", ("a", m_), lambda m_=m_: pluck(m_, 0.28, 0.2), t0 + i * BEAT / 2, 0.7 if i % 2 == 0 else 0.45, 0.5 * np.sin(i * 0.9 + b), wet=0.2, echo=3 * BEAT / 4, fb=0.35, nrep=1)
        elif kind == "thin":
            pl(tones[2] + 12, 1.0, 0.2, t0, 0.6, -0.3); pl(tones[3] + 12, 1.0, 0.2, t0 + 2 * BEAT, 0.45, 0.3)
        elif kind == "settle":
            pl(tones[2] + 12, 1.2, 0.2, t0, 0.5, -0.2)
    # ── 抬起的几拍与几处落点 ──
    put("fx", BM, t_title, 1.0)                                    # 片名
    put("kick", K, t_title, 0.9)
    put("fx", rise(max(0.6, t_first - t_rise0)), t_rise0, 0.8)     # 读完输入的铺垫
    put("fx", BM, t_first, 0.95)                                   # 第一块琥珀落下
    put("fx", BM, t_close_lift, 0.8)                               # 结尾抬一次
    if "length" in scenes: put("bass", bass(24, 1.2), cs("l2", scenes["length"]["start"] + 5.0), 0.8)
    for cid, m_ in (("s1", 84), ("s3", 88)):
        if cid in cue: pl(m_, 1.3, 0.2, beat_of(cue[cid]["start"]), 0.55, 0.0)
    # 片尾：主和弦铺底，最后淡出；开头一声钟音似的高音，没有滴答
    dry = pad(CHORDS["C"], max(1.0, total - t_out - 0.4), 0.25, 1.4); put2("pad", dry, t_out, 1.2)
    for m_, g in ((84, 0.7), (79, 0.4), (72, 0.4)): pl(m_, 2.0, 0.15, t_out + 0.05, g, 0.0, echo=False)

    # ── 混合：低音在底鼓落下的瞬间让一下 ──
    kenv = np.abs(stems["kick"]).max(axis=0)
    w = int(0.05 * SR); csum = np.cumsum(np.concatenate([np.zeros(w // 2 + 1), kenv, np.zeros(w - w // 2)])); kenv = ((csum[w:] - csum[:-w]) / w)[:N]; kenv /= max(1e-9, kenv.max())
    stems["bass"] *= 1 - 0.5 * kenv
    GAIN = {"kick": 0.36, "hat": 0.28, "rim": 0.2, "tick": 0.32, "bass": 0.13, "pluck": 0.36, "arp": 0.30, "pad": 0.18, "fx": 0.34}
    GAIN.update(((ctx.get("audio") or {}).get("score") or {}).get("gains") or {})
    mixd = sum(stems[k] * GAIN[k] for k in stems)
    ctx["stems"] = {k: float(np.sqrt(np.mean((v * GAIN[k]) ** 2))) for k, v in stems.items()}
    return mixd
