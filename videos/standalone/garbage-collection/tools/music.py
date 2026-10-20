# 《垃圾回收的艺术》的配乐：程序合成，108 拍/分，十六分音符带一点摇摆（swing）。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music = "tools/music.py"）：compose(ctx) 返回 (2, N) 的数组，电平与旁白压低由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: project.json 的 audio 段 }
# 设计（与「XX 秒速通」的 120 拍/分、D 小调 i–VI–III–VII、秒针与拨弦区分开）：
#   - 节奏：四踩底鼓 + 二四拍掌声 + 摇摆的十六分沙锤，副歌段加开镲；低音是带侧链压缩感的正弦低音，跟着和弦根音切分。
#   - 音色：马林巴式的木槌（加法合成，泛音 1 : 3.93 : 9.2）弹交错的固定音型；暖铺底贯穿全片，给低频分量。
#   - 和声：多利亚调式的两和弦摇摆（i9 – IV9），每一章换一个调（C、Eb、F、G、A、Bb，收束回到 C）。
#   - 结构：每张章节卡落在强拍上，那一拍砸下低频与镲；故事里「停住」的地方配乐真的停：内存耗尽、1960 年那一停好几秒、冤杀、
#     麦卡锡的脚注只留铺底；「平衡」一句是全片的终止式。片尾只留木槌与铺底。
#   - 画面里的重音（方块落位、金线、章节卡）用同一条拍网：src/js/config.js 的 BPM 与这里相同，换章时刻用同一条公式就近取拍。
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。确定性：随机数固定种子。
import numpy as np

BPM = 108.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
SWING = 0.16                                  # 后半个十六分音符推迟的比例
FADE = (0.3, 3.5)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# 每章的调（主音的 MIDI 音高）：i9 与 IV9 两个和弦来回
KEYS = {"open": 60, "count": 63, "trace": 65, "gen": 67, "tri": 69, "cost": 70, "close": 60}


def chord_tones(root, which):
    # i9：1 b3 5 b7 9；IV9：4 6 1 b3 5（相对主音）
    return [root + x for x in ([0, 3, 7, 10, 14] if which == 0 else [5, 9, 12, 15, 19])]


def compose(ctx):
    SR, N, total = ctx["sr"], ctx["n"], ctx["total"]
    rng = np.random.default_rng(1960)
    scenes = ctx["scenes"]
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    out = np.zeros((2, N))
    low = np.zeros((2, N))                     # 低音与铺底的总线
    side = np.ones(N)                          # 低音与铺底的侧链：底鼓一响就让一下

    def tt(d): return np.arange(int(d * SR)) / SR

    def put(sig, t, g=1.0, pan=0.0, dst=None):
        i = int(round(t * SR))
        if i < 0 or i >= N: return
        j = min(N, i + len(sig))
        d = out if dst is None else dst
        d[0, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 - pan))
        d[1, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 + pan))

    bank = {}
    def cached(key, fn):
        if key not in bank: bank[key] = fn()
        return bank[key]

    def onepole_lp(x, fc):
        a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); z = 0.0
        for k in range(len(x)): z = a * z + (1 - a) * x[k]; y[k] = z
        return y

    def bandpass(x, fc, q):                    # 二阶带通（RBJ），只用在很短的样本上
        w = 2 * np.pi * fc / SR; al = np.sin(w) / (2 * q)
        b0, b2, a0, a1, a2 = al, -al, 1 + al, -2 * np.cos(w), 1 - al
        y = np.zeros_like(x); x1 = x2 = y1 = y2 = 0.0
        for k in range(len(x)):
            v = (b0 * x[k] + b2 * x2 - a1 * y1 - a2 * y2) / a0
            x2, x1, y2, y1 = x1, x[k], y1, v; y[k] = v
        return y

    # ── 音色 ──
    def kick():
        t = tt(0.34); f = 54 + 120 * np.exp(-t / 0.026)
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.11)
        knock = 0.45 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.018)
        click = rng.standard_normal(len(t)) * np.exp(-t / 0.002) * 0.5
        body = body + knock
        return np.tanh(1.6 * (body + click)) * np.minimum(1, t / 0.001)
    def clap():
        t = tt(0.28); n = rng.standard_normal(len(t))
        env = sum(np.exp(-np.clip(t - d, 0, None) / 0.006) * (t >= d) for d in (0.0, 0.011, 0.022)) * 0.6 + np.exp(-t / 0.09) * (t >= 0.03)
        return bandpass(n, 1400, 0.9) * env * 3.2
    def shaker(acc):
        t = tt(0.07); x = np.diff(np.diff(rng.standard_normal(len(t)), prepend=0), prepend=0)
        x = x / (np.abs(x).max() + 1e-9)
        return x * np.exp(-t / (0.022 if acc else 0.012)) * np.minimum(1, t / 0.004)
    def ohat():
        t = tt(0.3); x = np.diff(rng.standard_normal(len(t)), prepend=0)
        return bandpass(x, 7600, 0.7) * np.exp(-t / 0.09) * 2.2
    def crash():
        t = tt(2.2); x = np.diff(rng.standard_normal(len(t)), prepend=0)
        return (bandpass(x, 5200, 0.5) * 1.6 + bandpass(x, 9000, 0.6)) * np.exp(-t / 0.7) * np.minimum(1, t / 0.002)
    def boom():                                # 换章时的低频一砸
        t = tt(1.6); f = 38 + 60 * np.exp(-t / 0.08)
        return np.tanh(1.3 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55)) * np.minimum(1, t / 0.002)
    def mallet(m, d=0.9, bright=1.0):          # 马林巴式：基音 + 3.93 倍 + 9.2 倍泛音，高泛音衰减得快
        t = tt(d); f = hz(m)
        y = np.sin(2 * np.pi * f * t) * np.exp(-t / (d * 0.32))
        y += 0.32 * bright * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.05)
        y += 0.12 * bright * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.012)
        y += 0.25 * rng.standard_normal(len(t)) * np.exp(-t / 0.0015) * bright
        return y * np.minimum(1, t / 0.0015)
    def bass(m, d):
        t = tt(d + 0.05); f = hz(m)
        y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.12) + 0.12 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.06)
        env = np.minimum(1, t / 0.006) * np.clip((d + 0.05 - t) / 0.05, 0, 1) * (0.75 + 0.25 * np.exp(-t / 0.15))
        return np.tanh(1.4 * y) * env
    def pad(tones, d):
        t = tt(d + 1.0); y = np.zeros(len(t))
        env = np.minimum(1, t / 0.6) * np.clip((d + 1.0 - t) / 1.0, 0, 1)
        for k, m in enumerate(tones[:4]):
            f = hz(m)
            for det in (-0.0035, 0.0035):
                ph = rng.uniform(0, 2 * np.pi)
                y += (np.sin(2 * np.pi * f * (1 + det) * t + ph) + 0.25 * np.sin(2 * np.pi * 2 * f * (1 + det) * t + ph) + 0.08 * np.sin(2 * np.pi * 3 * f * (1 + det) * t)) / (1 + 0.2 * k)
        return y * env / 4.0
    def blip(m):                               # 字节感的短音：方波的前几次谐波，音高一步一步跳
        t = tt(0.09); f = hz(m)
        y = sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 3, 5))
        return y * np.exp(-t / 0.03) * np.minimum(1, t / 0.001)

    # ── 时间线上的定点（从脚本的句号推出；找不到的句号跳过）──
    def cs(i, k="start", off=0.0):
        return cue[i][k] + off if i in cue else None
    q = lambda t: None if t is None else round(t / BEAT) * BEAT
    sc = {s_["id"]: s_ for s_ in scenes}
    drops = [q(s_["start"] + 0.25) for s_ in scenes[1:]]                       # 换章：与 config.js 的 coverAt 同一条公式
    stops = []                                                                 # [起, 止]：配乐整段停住
    if cs("o3b"): stops.append((q(cs("o3b", "end", -0.6)), q(cs("o4", "start", 0.1))))       # 内存耗尽
    if cs("b6"): stops.append((q(cs("b6", "start", 1.6)), q(cs("b6", "start", 1.6)) + 2 * BAR))   # 「这一停就是好几秒」
    if cs("e7ac"): stops.append((q(cs("e7ac", "end", -0.7)), q(cs("e8", "start", 0.2))))     # 冤杀
    hush = []                                                                  # 只留铺底：错误墙、脚注、拆环器之前的一口气
    if cs("o4"): hush.append((q(cs("o4", "start", 0.1)), q(cs("o5", "start", 0.6))))
    if cs("h4b"): hush.append((q(cs("h4b", "start")), q(cs("h7", "start", -0.4))))
    hits = []                                                                  # 额外的重拍
    for i, k, off in (("o10b", "end", -0.7), ("o5", "end", -0.6), ("e8", "end", -1.0), ("e10b", "end", -0.6), ("h7c", "end", -0.4)):
        if cs(i): hits.append(q(cs(i, k, off)))
    final = q(cs("h7c", "end", -0.4)) if cs("h7c") else None
    credits = cs("gCredit")

    # 每一段的编配：层的电平（0–1）。按场景给基础值，再按句号细分
    def section(t):
        s_ = next((x for x in scenes if x["start"] <= t < x["end"]), scenes[-1])
        return s_["id"]
    def level(t):
        sid = section(t)
        L = dict(kick=1, clap=1, shk=1, hat=0, bass=1, mal=1, motif=0, pad=1, blip=0)
        if sid == "open":
            if t < (cs("o2", "start") if cs("o2") else 6): L.update(kick=0, clap=0, bass=0.5, hat=0)
            elif cs("o3") and t < cs("o3", "start"): L.update(hat=1, motif=1, blip=1)
            elif cs("o5") and t < cs("o5", "start"): L.update(hat=0.6)
            elif cs("o7") and t < cs("o7", "start"): L.update(hat=0.4, blip=1)
            elif cs("o9") and t < cs("o9", "start"): L.update(hat=1, motif=1)
            elif cs("o10") and t < cs("o10", "start"): L.update(kick=0.6, clap=0.5, hat=0)
            else: L.update(hat=1, motif=1, blip=1)
        elif sid == "count": L.update(hat=0.3, motif=0.6)
        elif sid == "trace":
            if cs("b4") and cs("b7") and cs("b4", "start") <= t < cs("b7", "start"): L.update(kick=0.5, clap=0, hat=0, mal=0.5, blip=1)   # 1960：老机器
            else: L.update(hat=0.7, motif=0.5)
        elif sid == "gen": L.update(hat=1, blip=0.6, motif=0.5)
        elif sid == "tri":
            if cs("e7") and cs("e8") and cs("e7", "start") <= t < cs("e8", "start"): L.update(kick=0.7, clap=0.3, hat=0, mal=0.6, bass=1)      # 惊险
            elif cs("e11b") and cs("e12") and cs("e11b", "start") - 0.5 <= t < cs("e12", "start"): L.update(hat=1, motif=1, blip=1)
            elif cs("e13") and cs("e18") and cs("e13", "start") <= t < cs("e18", "start"): L.update(hat=1, blip=1, motif=0.4)                 # 419 步
            else: L.update(hat=0.6, motif=0.6)
        elif sid == "cost":
            if cs("g8") and t >= cs("g8", "start") - 0.4: L.update(hat=1, motif=1, blip=0.5)
            else: L.update(hat=0.5, motif=0.3)
        elif sid == "close":
            if credits and t >= credits: L.update(kick=0.55, clap=0.4, shk=0.8, hat=0, bass=0.7, motif=0.6)
            elif cs("h7") and t >= cs("h7", "start", -0.4): L.update(hat=0.8, motif=1)
            else: L.update(kick=0.5, clap=0.3, hat=0, motif=0.4)
        for a, b in stops:
            if a <= t < b: return {k: 0 for k in L}
        for a, b in hush:
            if a <= t < b: return {k: (L[k] * 0.9 if k == "pad" else 0.15 if k == "bass" else 0) for k in L}
        if final is not None and final <= t < (credits or total): L = dict(kick=0, clap=0, shk=0, hat=0, bass=0.6, mal=0.5, motif=0, pad=1, blip=0)
        return L

    # ── 逐小节铺 ──
    nbar = int(total / BAR) + 2
    MAL_PAT = [[0, 2, 1, 3, 2, 4, 1, 3, 0, 2, 4, 3, 1, 2, 3, 4], [0, -1, 2, -1, 1, 3, -1, 2, 4, -1, 3, 1, -1, 2, 0, -1]]
    MOTIF = [(0, 0, 7), (3, 0, 5), (6, 0, 3), (8, 0, 2), (12, 1, 0)]          # (十六分位置, 和弦, 音阶级)——一个四音的「收集」动机
    for bi in range(nbar):
        t0 = bi * BAR
        if t0 >= total: break
        sid = section(t0 + 0.01)
        root = KEYS.get(sid, 60)
        which = (bi // 2) % 2
        tones = chord_tones(root, which)
        Lb = level(t0 + 0.01)
        # 铺底：每两小节一个和弦
        if bi % 2 == 0:
            pl = max(level(t0 + 0.01)["pad"], 0)
            if pl > 0: put(cached(("pad", tuple(tones)), lambda: pad(tones, 2 * BAR)), t0, 0.42 * pl, 0, dst=low)
        for st in range(16):
            t = t0 + st * S16 + (SWING * S16 if st % 2 else 0)
            if t >= total: break
            L = level(t)
            # 底鼓：四踩；1960 与收束改成一、三拍
            half = section(t) in ("close",) or (L["kick"] < 0.8)
            if st % 4 == 0 and L["kick"] > 0 and (not half or st % 8 == 0):
                put(cached("kick", kick), t, 0.8 * L["kick"])
                i = int(t * SR); j = min(N, i + int(0.24 * SR))
                if i < N: side[i:j] = np.minimum(side[i:j], 1 - 0.55 * L["kick"] * np.exp(-np.arange(j - i) / (0.07 * SR)))
            if st in (4, 12) and L["clap"] > 0: put(cached("clap", clap), t, 0.62 * L["clap"], 0.08)
            if L["shk"] > 0:
                acc = st % 4 == 2
                put(cached(("shk", acc, st % 3), lambda: shaker(acc)), t, (0.22 if acc else 0.12) * L["shk"], 0.35 if st % 2 else -0.25)
            if st % 4 == 2 and L["hat"] > 0: put(cached(("oh", st), ohat), t, 0.16 * L["hat"], 0.3)
            # 木槌固定音型：两条交错（左右各一）
            pat = MAL_PAT[0][st]
            if L["mal"] > 0 and pat >= 0:
                m = tones[pat] + 12
                put(cached(("mal", m, 0), lambda: mallet(m, 0.7, 0.9)), t, 0.34 * L["mal"] * (1.0 if st % 4 == 0 else 0.7), -0.45)
            pat2 = MAL_PAT[1][st]
            if L["mal"] > 0 and pat2 >= 0 and bi % 2 == 1:
                m = tones[pat2] + 24
                put(cached(("mal", m, 1), lambda: mallet(m, 0.5, 0.7)), t, 0.21 * L["mal"], 0.5)
            # 低音：根音切分（1、「2 的后半」、「3」、「4 的后半」）
            if L["bass"] > 0 and st in (0, 6, 8, 14):
                bm = (root - 24) + (5 if which else 0) + (7 if st == 14 else 0)
                dur = S16 * (5 if st in (0, 8) else 2)
                put(cached(("bass", bm, round(dur, 3)), lambda: bass(bm, dur)), t, 0.27 * L["bass"], 0, dst=low)
            # 字节感的短音：每小节最后两个十六分
            if L["blip"] > 0 and st in (13, 15) and bi % 2 == 1:
                m = tones[(st + bi) % 5] + 24
                put(cached(("blip", m), lambda: blip(m)), t, 0.09 * L["blip"], 0.6 if st == 13 else -0.6)
        # 动机：每四小节一次
        if Lb["motif"] > 0 and bi % 4 == 3:
            for st, ch, deg in MOTIF:
                t = t0 + st * S16
                m = chord_tones(root, ch)[min(4, deg // 2)] + 24 + (0 if deg % 2 == 0 else 0)
                put(cached(("mot", m), lambda: mallet(m, 1.2, 1.2)), t, 0.22 * Lb["motif"], 0.1)

    # 侧链：低音与铺底单独在 low 这条总线上，乘以底鼓留下的包络后再并回来
    out += low * side

    # 换章与重拍：低频一砸 + 镲；之前留出半拍空白，让砸下去的那一拍更响
    for d in drops + hits:
        if d is None: continue
        i0, i1 = int((d - BEAT / 2) * SR), int(d * SR)
        if 0 <= i0 < i1 <= N: out[:, i0:i1] *= np.linspace(1, 0.25, i1 - i0)
        put(cached("boom", boom), d, 0.55)
        put(cached("crash", crash), d, 0.28, -0.2)
        put(cached("kick", kick), d, 0.7)
    if final is not None:
        tones = chord_tones(60, 0)
        for k, m in enumerate(tones):
            put(cached(("mot", m + 24), lambda: mallet(m + 24, 1.2, 1.2)), final + k * S16, 0.25, -0.4 + 0.2 * k)
    # 停住的段落：彻底静音（尾音截断时给 30 ms 的收口）
    for a_, b_ in stops:
        i0, i1 = int(a_ * SR), int(b_ * SR); r = int(0.03 * SR)
        if i0 >= N: continue
        out[:, i0:min(N, i0 + r)] *= np.linspace(1, 0, min(N, i0 + r) - i0)
        out[:, min(N, i0 + r):min(N, i1)] = 0
    return out
