# 本集配乐：包豪斯式的「机械音乐」。施莱默的《三人芭蕾》（1922）把舞台拆成圆、方、三角与红黄蓝，后来的上演用机械管风琴伴奏；
# 本集的画面取同一套几何，配乐取同一种质感：节奏方正、音型短促、像机器一样咬合，底下一层持续的簧管式铺底，不用氛围长音。
# 系列的约定照旧：120 拍/分、一秒两拍，全片每秒一声「秒针」；各场逐场加层，收束一场转半拍并在结论句抬起（audio.score.lift_cue），片尾只留铺底与秒针。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music 写成 "tools/music.py"）：compose(ctx) 返回 (2, N) 的数组，电平、旁白压低与限幅由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}]（只含有旁白的句子）, audio: project.json 的 audio 段 }
# 小节线在每个场景的起点重新排，换场总落在强拍上。和声用四度叠置（A D G C / F B E A / C G D G / G C D A），一个和弦两小节。
# 节奏骨架是 3+3+2：一小节八个八分音符，重音落在第 1、4、7 个上——低音、马林巴、木块都按这个格子走，画面上的形状落位也吸附在 0.25 秒的网格上。
# 层：bass（低音脉冲，持续的低频）、organ（簧管铺底）、mar（马林巴音型）、xyl（木琴的三音动机）、wood（木块）、click（极轻的十六分）、tick（秒针）、fx（落点）。
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 120.0
BEAT = 60.0 / BPM
E8 = BEAT / 2
BAR = 4 * BEAT
FADE = (0.02, 0.4)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# 四个和弦：低音、簧管铺底、马林巴取音（由低到高）
CH = {
    "A": (33, [45, 52, 57, 62, 67], [57, 62, 67, 72, 74, 79]),
    "F": (29, [41, 48, 53, 59, 64], [53, 59, 64, 69, 71, 76]),
    "C": (36, [48, 55, 60, 62, 67], [55, 60, 62, 67, 72, 74]),
    "G": (31, [43, 50, 55, 60, 62], [55, 60, 62, 69, 72, 74]),
}
CYCLE = ["A", "F", "C", "G"]
ACC = [1.0, 0.5, 0.58, 0.92, 0.5, 0.58, 0.88, 0.62]        # 3+3+2 的力度
MAR_PAT = [0, 2, 1, 3, 1, 2, 4, 3]                          # 马林巴每小节八个音取第几个和弦音


def compose(ctx):
    SR, N = ctx["sr"], ctx["n"]
    rng = np.random.default_rng(1922)
    scenes = ctx["scenes"]
    spec = (ctx.get("audio") or {}).get("score") or {}
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    body, outro = scenes[:-1], scenes[-1]
    t_out = outro["start"]
    sid = [s["id"] for s in scenes]
    q = lambda t: round(t / E8) * E8
    lift = q(cue[spec["lift_cue"]]["start"] + 0.1) if spec.get("lift_cue") in cue else None
    title = q(cue["o3b"]["end"] + 0.1) if "o3b" in cue else None
    mar_in = q(cue["o4"]["start"]) if "o4" in cue else None
    stems = {k: np.zeros((2, N), dtype=np.float32) for k in ("bass", "organ", "mar", "xyl", "wood", "click", "tick", "fx")}

    def put(name, sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0 or i >= N or g <= 0: return
        j = min(N, i + len(sig))
        stems[name][0, i:j] += (sig[: j - i] * (g * np.sqrt(0.5 * (1 - pan)))).astype(np.float32)
        stems[name][1, i:j] += (sig[: j - i] * (g * np.sqrt(0.5 * (1 + pan)))).astype(np.float32)
    def put2(name, sig2, t, g=1.0):
        i = int(round(t * SR))
        if i < 0 or i >= N: return
        j = min(N, i + sig2.shape[1]); stems[name][:, i:j] += (sig2[:, : j - i] * g).astype(np.float32)
    def tt(d): return np.arange(int(d * SR)) / SR

    # ── 音色（同样的音只算一次）──
    CACHE = {}
    def cached(key, fn):
        if key not in CACHE: CACHE[key] = fn()
        return CACHE[key]
    def marimba(m, vel=1.0):                                    # 木质音条：基音 + 约 3.9 倍、9.2 倍的泛音，高泛音衰减得快，一声琴槌
        def make():
            t = tt(0.9); f = hz(m)
            y = np.sin(2 * np.pi * f * t) * np.exp(-t / (0.32 - 0.0006 * (m - 60) * 4))
            y += 0.32 * vel * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.06)
            y += 0.10 * vel * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.018)
            click = rng.standard_normal(len(t)) * np.exp(-t / 0.0025) * 0.05
            return (y + click) * np.minimum(1, t / 0.0015)
        return cached(("mar", m, round(vel, 2)), make)
    def xylo(m):                                                # 木琴：更亮、更短
        def make():
            t = tt(0.45); f = hz(m)
            y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.13) + 0.45 * np.sin(2 * np.pi * f * 3.0 * t) * np.exp(-t / 0.05) + 0.18 * np.sin(2 * np.pi * f * 6.2 * t) * np.exp(-t / 0.02)
            return y * np.minimum(1, t / 0.001)
        return cached(("xyl", m), make)
    def bass(m, vel=1.0, d=0.22):                               # 低音脉冲：正弦 + 少量二、三次谐波，拨一下就收
        def make():
            t = tt(d + 0.08); f = hz(m)
            env = np.minimum(1, t / 0.004) * np.exp(-t / (d * 0.75)) * np.clip((d + 0.08 - t) / 0.08, 0, 1)
            y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
            return np.tanh(1.6 * y * env) / np.tanh(1.6)
        return cached(("bass", m, round(vel, 2), round(d, 3)), make)
    def organ(ms, d, atk=0.08, rel=0.5):                        # 簧管铺底：几根谐波叠出来的方正音色，不加颤音；左右声道略错开音高
        def make():
            t = tt(d + rel); env = np.minimum(1, t / atk) * np.clip((d + rel - t) / rel, 0, 1)
            y = np.zeros((2, len(t)))
            for i, m in enumerate(ms):
                f = hz(m)
                for c, det in enumerate((0.9985, 1.0015)):
                    ph = 2 * np.pi * f * det * t
                    y[c] += (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.28 * np.sin(3 * ph) + 0.12 * np.sin(4 * ph)) * (0.45 if m < 50 else 0.8)
            return y * env / (2.2 * len(ms))
        return cached(("org", tuple(ms), round(d, 3), atk, rel), make)
    def wood(high=True):                                        # 木块：两个不和谐的音高，极短
        def make():
            t = tt(0.08); f = 1250 if high else 820
            y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012) + 0.5 * np.sin(2 * np.pi * f * 2.71 * t) * np.exp(-t / 0.005)
            return y * np.minimum(1, t / 0.0005)
        return cached(("wood", high), make)
    def click():
        def make():
            t = tt(0.025); x = np.diff(rng.standard_normal(len(t) + 1))
            return x / (np.abs(x).max() + 1e-9) * np.exp(-t / 0.004)
        return cached(("click",), make)
    def tick(tock=False):                                       # 秒针：系列共用的木质敲击
        def make():
            t = tt(0.06); f = 1900 if tock else 2500
            return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.007) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.003)) * np.minimum(1, t / 0.0006)
        return cached(("tick", tock), make)
    def boom():                                                 # 落点的低频：音高下滑的正弦
        def make():
            t = tt(1.2); f = 36 + 30 * np.exp(-t / 0.08)
            return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.32) * np.minimum(1, t / 0.002)
        return cached(("boom",), make)
    def glock(m):                                               # 钢片琴：落点上方一声亮音
        def make():
            t = tt(1.6); f = hz(m)
            return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.55) + 0.25 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.12)) * np.minimum(1, t / 0.001)
        return cached(("glock", m), make)

    # ── 每小节的计划：属于哪一场、第几小节、用哪个和弦 ──
    plan = []
    for k, s in enumerate(scenes):
        local = 0
        while s["start"] + local * BAR < s["end"] - 1e-6:
            t0 = s["start"] + local * BAR
            plan.append({"t": t0, "end": min(t0 + BAR, s["end"]), "k": k, "id": s["id"], "local": local, "ch": CYCLE[(local // 2) % 4]})
            local += 1

    # ── 秒针：全片每秒一声 ──
    for sec in range(int(ctx["total"])):
        put("tick", tick(sec % 2 == 1), float(sec), 1.0 if sec % 2 == 0 else 0.8, -0.25 if sec % 2 == 0 else 0.25)

    for p in plan:
        t0, sc, local = p["t"], p["id"], p["local"]
        if t0 >= t_out - 1e-6: continue
        bm, om, mm = CH[p["ch"]]
        half = sc == "close" and (lift is None or t0 < lift - 1e-6)
        # 铺底：每两小节一个和弦（场景开头那一小节起）；收束场在抬起之前收薄
        if local % 2 == 0:
            seg_end = min(t0 + 2 * BAR, scenes[p["k"]]["end"])
            put2("organ", organ(om, seg_end - t0, 0.08 if sc != "open" else 0.6, 0.45), t0, {"open": 0.85, "session": 0.7, "jwt": 0.65, "authn": 0.7, "oauth": 0.7, "close": 1.0}.get(sc, 0.7))
        for e in range(8):
            te = t0 + e * E8
            if te >= p["end"] - 1e-6 or te >= t_out - 1e-6: break
            acc = e in (0, 3, 6)
            # 低音：开场只在重音上，正片八分音符都走，收束场半拍（只在第一、三拍）
            if sc == "open":
                if mar_in is not None and te >= mar_in: put("bass", bass(bm, 1.0, 0.2), te, 0.85 * ACC[e])
                elif acc: put("bass", bass(bm, 1.0, 0.32), te, 0.75 * ACC[e])
            elif half:
                if e in (0, 4): put("bass", bass(bm, 1.0, 0.7), te, 0.9)
            else:
                put("bass", bass(bm if acc or e % 2 == 0 else bm + 7, 1.0, 0.2), te, 0.95 * ACC[e])
            # 马林巴：o4 起进来；会话场起每个八分音符都有；第三方登录一场左右两组交替（两个黑框之间来回传）
            mar_on = (sc == "open" and mar_in is not None and te >= mar_in) or sc in ("session", "jwt", "authn", "oauth") or (sc == "close" and not half)
            if mar_on and (not half):
                m = mm[MAR_PAT[e] % len(mm)]
                pan = (-0.45 if (local % 2 == 0) else 0.45) if sc == "oauth" else (-0.2 + 0.4 * (e / 7))
                g = (0.55 if sc == "open" else 0.8) * ACC[e]
                put("mar", marimba(m, ACC[e]), te, g, pan)
                if sc == "authn" and e in (1, 4, 7): put("mar", marimba(m - 12, 0.7), te + E8 / 2, 0.45, -pan)
            elif half and e in (0, 3, 6):
                put("mar", marimba(mm[[0, 3, 4][(0, 3, 6).index(e)]], 0.7), te, 0.45, 0.2)
            # 木块：会话场起，落在第 3、7 个八分音符（3+3+2 的第二、三组开头之后）
            if sc in ("session", "jwt", "authn", "oauth") and e in (2, 6):
                put("wood", wood(e == 2), te, 0.55, 0.35 if e == 2 else -0.35)
            # 极轻的十六分：信息最密的两场
            if sc in ("jwt", "authn"):
                put("click", click(), te, 0.18 if acc else 0.11, 0.5); put("click", click(), te + E8 / 2, 0.08, 0.5)
        # 木琴的三音动机：JWT 一场起，每两小节一次（第 2、3、4 拍），收束场不用
        if sc in ("jwt", "authn", "oauth") and local % 2 == 1:
            r = mm[2] + 12
            for i, m in enumerate([r, r + 5, r + 7]):
                put("xyl", xylo(m), t0 + (1 + i) * BEAT, 0.5 - 0.06 * i, 0.3)

    # ── 落点：片名、各场第一拍、结论、片尾 ──
    def hit(t, chord_key, g=1.0):
        mm = CH[chord_key][2]
        put("fx", boom(), t, g)
        for i, m in enumerate(mm[:5]): put("mar", marimba(m, 1.0), t + i * 0.018, 0.5 * g, -0.4 + 0.2 * i)
        put("fx", glock(mm[3] + 12), t, 0.35 * g, 0.2)
    if title is not None: hit(title, "A", 1.0)
    for s in body[1:]:
        put("fx", boom(), s["start"], 0.55); put("wood", wood(False), s["start"], 0.7, 0.0)
    if lift is not None:
        hit(lift, "C", 1.1)
        put2("organ", organ([36, 48, 55, 60, 64, 67], max(1.0, t_out - lift), 0.35, 0.8), lift, 1.1)
    # 片尾：C 和弦的长音，随后只剩铺底与秒针；倒数第二秒一声钢片琴
    put2("organ", organ([36, 48, 55, 62, 64, 67], max(1.0, ctx["total"] - t_out - 0.5), 0.6, 1.8), t_out, 0.9)
    put("fx", glock(84), np.floor(ctx["total"]) - 2.0, 0.35, 0.2)

    # ── 混合 ──
    GAIN = {"bass": 0.30, "organ": 0.26, "mar": 0.42, "xyl": 0.26, "wood": 0.24, "click": 0.14, "tick": 0.30, "fx": 0.30}
    GAIN.update(spec.get("gains") or {})
    mixd = np.zeros((2, N), dtype=np.float64)
    for k, v in stems.items(): mixd += v.astype(np.float64) * GAIN[k]
    ctx["stems"] = {k: float(np.sqrt(np.mean((v.astype(np.float64) * GAIN[k]) ** 2))) for k, v in stems.items()}
    return mixd
