# 本集配乐：程序合成的布吉伍吉（boogie-woogie）。蒙德里安晚年的《百老汇布吉伍吉》以这种音乐为题，本集的画面取风格派，配乐取同一个来源。
# 系列的约定照旧：120 拍/分、一秒两拍，全片每秒一声「秒针」；编排随场景逐场加层，最后一个正片场景转为半拍并在结论处抬起，片尾只留和弦与秒针。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music 写成 "tools/music.py"）：compose(ctx) 返回 (2, N) 的数组，电平与旁白压低仍由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: project.json 的 audio 段 }
# 小节线在每个场景的起点重新排：换场总落在强拍上；场景结尾不足一小节的部分截短（相当于一个两拍的小节）。开场 24 秒恰好是一遍 12 小节的布鲁斯。
# 音色：钢琴用加法合成（略带非谐和的泛音、高次泛音衰减得快、一声琴槌的噪声），刷子军鼓与踩镲用滤过的噪声。左手走 boogie 低音，右手是六度和弦的反复。
# 八分音符带一点摇摆（后半拍落在 0.6 处）；画面上的重音仍吸附在 0.25 秒的网格上，正拍对齐。
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 120.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
SWING = 0.6                              # 后半拍在一拍里的位置
FADE = (0.02, 0.35)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# C 调 12 小节布鲁斯：I I I I | IV IV I I | V IV I V
FORM = [0, 0, 0, 0, 5, 5, 0, 0, 7, 5, 0, 7]
ROOT = 36                                # C2


def compose(ctx):
    SR, N, total = ctx["sr"], ctx["n"], ctx["total"]
    rng = np.random.default_rng(1943)
    scenes = ctx["scenes"]
    spec = (ctx.get("audio") or {}).get("score") or {}
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    body, outro = scenes[:-1], scenes[-1]
    t_out = outro["start"]
    lift = round((cue[spec["lift_cue"]]["start"] + 0.2) / BEAT) * BEAT if spec.get("lift_cue") in cue else None
    title = round(cue["oT"]["start"] / BEAT) * BEAT if "oT" in cue else None
    stems = {k: np.zeros((2, N)) for k in ("kick", "brush", "hat", "tick", "lh", "rh", "pad", "fx")}

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
    PIANO = {}
    def piano(m, d, vel=1.0):                                               # 同样的音只算一次
        key = (m, round(d, 3), round(vel, 2))
        if key in PIANO: return PIANO[key]
        t = tt(d + 0.25); f = hz(m); y = np.zeros(len(t)); B = 0.0004            # B：弦的非谐和系数
        for k in range(1, 11):
            fk = f * k * np.sqrt(1 + B * k * k)
            if fk > 9000: break
            y += np.sin(2 * np.pi * fk * t) / k ** (1.1 - 0.3 * vel) * np.exp(-t * (1.6 + 2.2 * k + 0.004 * f))
        hammer = rng.standard_normal(len(t)) * np.exp(-t / 0.004) * 0.08 * vel
        env = np.minimum(1, t / 0.003) * np.clip((d + 0.25 - t) / 0.25, 0, 1)    # 抬键：最后四分之一秒收掉
        PIANO[key] = (y + hammer) * env
        return PIANO[key]
    def chord(ms, d, vel=1.0, roll=0.0):
        n = int((d + 0.25 + roll * len(ms)) * SR) + 1; y = np.zeros(n)
        for i, m in enumerate(ms):
            s = piano(m, d, vel); o = int(i * roll * SR); y[o:o + len(s)] += s[: n - o]
        return y / max(1, len(ms)) ** 0.5
    def kick():
        t = tt(0.3); f = 48 + 60 * np.exp(-t / 0.03)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * np.minimum(1, t / 0.002)
    def brush(long_=False):                                                 # 刷子军鼓：中频噪声，起得慢一点
        t = tt(0.22 if long_ else 0.14); x = rng.standard_normal(len(t))
        X = np.fft.rfft(x); fq = np.fft.rfftfreq(len(x), 1 / SR); x = np.fft.irfft(X * (fq > 900) * (fq < 7000), len(x))
        return x / (np.abs(x).max() + 1e-9) * np.minimum(1, t / 0.012) * np.exp(-t / (0.08 if long_ else 0.045))
    def hat():
        t = tt(0.05); x = np.diff(np.diff(rng.standard_normal(len(t)), prepend=0), prepend=0)
        return x / (np.abs(x).max() + 1e-9) * np.exp(-t / 0.012)
    def tick(tock=False):                                                   # 秒针：系列共用的木质敲击
        t = tt(0.06); f = 1900 if tock else 2500
        return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.007) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.003)) * np.minimum(1, t / 0.0006)
    def boom():
        t = tt(1.4); f = 34 + 26 * np.exp(-t / 0.09)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35)
        x = rng.standard_normal(len(t)); X = np.fft.rfft(x); fq = np.fft.rfftfreq(len(x), 1 / SR)
        air = np.fft.irfft(X * (fq > 2500) * (fq < 9000), len(x)) * np.exp(-t / 0.3) * 0.5
        return (y + air / (np.abs(air).max() + 1e-9) * 0.22) * np.minimum(1, t / 0.002)
    def pad(ms, d, atk=0.6, rel=1.0):
        t = tt(d + rel); y = np.zeros((2, len(t))); env = np.minimum(1, t / atk) * np.clip((d + rel - t) / rel, 0, 1)
        for i, m in enumerate(ms):
            f = hz(m); ph = rng.uniform(0, 2 * np.pi, 2)
            tone = np.sin(2 * np.pi * f * 0.997 * t + ph[0]) + np.sin(2 * np.pi * f * 1.003 * t + ph[1])
            pan = [-0.5, 0.4, -0.2, 0.5, 0.0][i % 5]
            y[0] += tone * np.sqrt(0.5 * (1 - pan)); y[1] += tone * np.sqrt(0.5 * (1 + pan))
        return y * env / 8.0
    # 混响：短冲激响应，逐个和弦做（长度取 2 的幂），不对整条分轨做变换
    IRN = int(1.2 * SR); t_ir = np.arange(IRN) / SR; r2 = np.random.default_rng(7)
    IR = [r2.standard_normal(IRN) * np.exp(-t_ir / 0.4) for _ in range(2)]
    for c in range(2): IR[c][: int(0.01 * SR)] = 0
    IRF = {}
    def wet(sig):
        n = len(sig) + IRN; nf = 1 << int(np.ceil(np.log2(n)))
        if nf not in IRF: IRF[nf] = [np.fft.rfft(IR[c], nf) for c in range(2)]
        out = np.stack([np.fft.irfft(np.fft.rfft(sig, nf) * IRF[nf][c], nf)[:n] for c in range(2)])
        return out * (np.abs(sig).max() / max(1e-9, np.abs(out).max()))

    K, BR, BRL, HC, TK, TC, BM = kick(), brush(), brush(True), hat(), tick(), tick(True), boom()
    def sw(tb, half):                                                       # 一拍里的前半拍 / 带摇摆的后半拍
        return tb + (SWING * BEAT if half else 0.0)

    # ── 每小节：属于哪一场、在布鲁斯里的第几小节 ──
    def scene_of(t):
        for k, s in enumerate(body):
            if s["start"] - 1e-6 <= t < s["end"] - 1e-6: return k, s
        return len(body), outro
    plan = []
    for k, s in enumerate(scenes):                                       # 每一场从布鲁斯的第一小节重新起
        kind = "outro" if k == len(body) else "intro" if k == 0 else "half" if k == len(body) - 1 else "groove"
        local = 0
        while s["start"] + local * BAR < s["end"] - 1e-6:
            t0 = s["start"] + local * BAR
            plan.append({"t": t0, "end": min(t0 + BAR, s["end"]), "k": k, "kind": kind, "local": local, "deg": FORM[local % 12]})
            local += 1

    # ── 弱起：第 0–1 秒，右手一串上行的音，落到第一小节 ──
    for i, m in enumerate([55, 57, 60, 64, 67, 69]):
        put("rh", piano(m, 0.2, 0.7), 0.05 + i * BEAT / 3, 0.55, -0.2 + 0.08 * i)

    # ── 秒针：全片每秒一声 ──
    for sec in range(int(total)):
        put("tick", TC if sec % 2 else TK, float(sec), 1.0 if sec % 2 == 0 else 0.8, -0.25 if sec % 2 == 0 else 0.25)

    LH = [0, 4, 7, 9, 10, 9, 7, 4]                                          # boogie 左手：1 3 5 6 b7 6 5 3
    for p in plan:
        t0, kind, deg, k = p["t"], p["kind"], p["deg"], p["k"]
        if t0 >= t_out - 1e-6: continue
        r = ROOT + deg
        lifted = lift is not None and kind == "half" and t0 + 1e-6 >= lift - BAR
        # 铺底：每小节的属七和弦，很轻
        pm = [r + 24, r + 28, r + 31, r + 34]
        put2("pad", pad(pm, p["end"] - t0, 0.4, 0.8), t0, {"intro": 0.8, "groove": 0.6, "half": 0.9}[kind])
        for beat in range(4):
            tb = t0 + beat * BEAT
            if tb >= t_out - 1e-6 or tb >= p["end"] - 1e-6: break
            full = kind == "groove" or (kind == "half" and lift is not None and tb + 1e-6 >= lift) or (kind == "intro" and p["local"] >= 4)
            # 左手
            if kind == "intro" and p["local"] < 4:
                if beat in (0, 2): put("lh", piano(r + LH[beat * 2], 0.9, 0.6), tb, 0.6, -0.3)
            elif kind == "half" and not full:
                if beat in (0, 2): put("lh", chord([r, r + 12], 0.9, 0.8), tb, 0.8, -0.3)
            else:
                for half in (0, 1):
                    m = r + LH[beat * 2 + half]
                    put("lh", chord([m, m + 12], 0.28, 0.85 if half == 0 else 0.7), sw(tb, half), 0.85 if half == 0 else 0.62, -0.3)
            # 鼓：刷子在 2、4 拍，踩镲带摇摆；开场只在后半段进来
            if kind == "groove" or full:
                if beat in (0, 2): put("kick", K, tb, 0.7 if k >= 2 else 0.55)
                if beat in (1, 3): put("brush", BR, tb, 0.8, 0.15)
                put("hat", HC, tb, 0.45, 0.35); put("hat", HC, sw(tb, 1), 0.7, 0.35)
            elif kind == "half":
                if beat == 2: put("brush", BRL, tb, 0.9, 0.15)
                put("hat", HC, sw(tb, 1), 0.4, 0.35)
            elif kind == "intro" and p["local"] >= 8:
                put("hat", HC, sw(tb, 1), 0.5, 0.35)
        # 右手：六度和弦的反复（3-5、3-6、3-b7、3-6），开场第 5 小节起进来；第 3 场起加摇摆的后半拍
        if kind == "outro": continue
        rh_on = kind == "groove" or lifted or (kind == "intro" and p["local"] >= 4)
        if rh_on:
            top = [7, 9, 10, 9]
            for beat in range(4):
                tb = t0 + beat * BEAT
                if tb >= t_out - 1e-6 or tb >= p["end"] - 1e-6: break
                ms = [r + 28, r + 24 + top[beat]]                          # 三音在下，上面一个音走 5、6、b7、6
                vel = 0.75 if kind == "intro" else 0.9
                put("rh", chord(ms, 0.22, vel), sw(tb, 1) if kind == "intro" else tb, 0.55 if kind == "intro" else 0.7, 0.25)
                if k >= 2 or lifted: put("rh", chord(ms, 0.16, 0.8), sw(tb, 1), 0.45, 0.3)
        elif kind == "half":
            ms = [r + 28, r + 34]
            put("rh", chord(ms, 0.8, 0.7), t0 + BEAT, 0.5, 0.25); put("rh", chord(ms, 0.8, 0.7), t0 + 3 * BEAT, 0.4, 0.25)
        # 每一遍布鲁斯的最后一小节（V）：一串下行的三连音，引回第一小节
        if p["local"] % 12 == 11 and kind != "half" and p["end"] - t0 > 3 * BEAT:
            for i, m in enumerate([79, 76, 74, 72, 70, 67]):
                put("rh", piano(m, 0.18, 0.8), t0 + 2 * BEAT + i * BEAT / 3, 0.45, 0.3 - 0.1 * i)

    # ── 落点：片名卡、各场的第一拍、结论、片尾 ──
    HIT = chord([48, 52, 55, 58, 62, 64], 1.6, 1.0, 0.012)                  # C9：一记带滚奏的和弦
    HW = wet(HIT)
    def hit(t, g):
        put("rh", HIT, t, g, 0.0); put2("fx", HW, t, g * 0.4); put("fx", BM, t, g)
    if title is not None: hit(title, 0.9)
    for s in body[1:]: put("fx", BM, s["start"], 0.8)
    if lift is not None: hit(lift, 1.0)
    # 片尾：C6/9 的长和弦，随后只剩秒针；倒数第二秒一声高音
    END = chord([48, 55, 60, 64, 67, 69, 74], 3.5, 0.8, 0.05); put("rh", END, t_out, 0.9, 0.0); put2("fx", wet(END), t_out, 0.4)
    put2("pad", pad([60, 64, 67, 69, 74], max(1.0, total - t_out - 2.5), 0.3, 1.5), t_out, 1.6)
    te = np.floor(total) - 2.0
    put("rh", piano(84, 1.6, 0.6), te, 0.5, 0.2); put("rh", piano(76, 1.6, 0.6), te + BEAT / 3, 0.3, -0.2)

    # ── 混合：左手在底鼓落下的瞬间让一下 ──
    kenv = np.abs(stems["kick"]).max(axis=0)
    w = int(0.05 * SR); cs = np.cumsum(np.concatenate([np.zeros(w // 2 + 1), kenv, np.zeros(w - w // 2)])); kenv = ((cs[w:] - cs[:-w]) / w)[:N]; kenv /= max(1e-9, kenv.max())
    stems["lh"] *= 1 - 0.35 * kenv
    GAIN = {"kick": 0.40, "brush": 0.20, "hat": 0.22, "tick": 0.30, "lh": 0.30, "rh": 0.26, "pad": 0.16, "fx": 0.34}
    GAIN.update(spec.get("gains") or {})
    mixd = sum(stems[k] * GAIN[k] for k in stems)
    ctx["stems"] = {k: float(np.sqrt(np.mean((v * GAIN[k]) ** 2))) for k, v in stems.items()}
    return mixd
