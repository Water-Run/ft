# 《256 秒搞懂 SSH》的配乐：程序合成的 20 年代管弦，写给「一次连接往前推」的劲头。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music 写成 "tools/music.py"）：compose(ctx) 返回 (2, N) 的数组，电平与旁白压低仍由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: project.json 的 audio 段, lang }
#
# 织体（策划者指定：20 年代管弦质感）：
#   - 弦乐层：短促重复的 ostinato，一直往前冲；机制章（dh）里加密到十六分音符。
#   - 铜管：落在关键揭示上——主机密钥签名生效（hostkey）、结论抬起（close），以及每次换场的重音。
#   - 打击乐：给节奏骨架，不花哨；另有一层每秒一声的「秒针」，保留系列基座的定长识别。
#   - 和声：D 小调，低音半音下行 D–C–C♯–B，第三个和弦是减七，棱角来自那里。
#   - 动态：随场景逐层加厚（intro → walk → drive → race → seal → forge → peak），edge 收一层，close 推到最满。
#
# 与系列基座的关系：基座是「120 拍/分、每秒一声秒针」的极简配乐；本片换成自带的管弦配乐，但把秒针保留在打击层里当节奏骨架，
# 这样定长时间线的系列识别不至于全丢。秒针与管弦的取舍见 review/NOTES.md，等策划者确认。
#
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 120.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FADE = (0.05, 1.2)                     # 几乎立刻起；最后的一秒多交给配乐自己收
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# 和声循环：低音半音下行 D–C–C♯–B。第三个是减七，第四个属七，两个和弦互相磨。
CH = [
    {"bass": 38, "vo": [62, 65, 69, 72], "name": "Dm7"},
    {"bass": 37, "vo": [60, 63, 67, 70], "name": "Cm7"},
    {"bass": 36, "vo": [61, 64, 67, 70], "name": "C#m7b5"},
    {"bass": 35, "vo": [59, 62, 66, 69], "name": "B7"},
]

# 铜管主题：主机密钥签名生效时出现一次，结论处再出现一次。（音高, 拍数）
THEME = [(62, 2.0), (65, 1.0), (69, 1.0), (67, 1.0), (65, 3.0)]

# 场景 → 织体。顺序与 script.js 的场景一致；不认识的场景按 drive 处理。
KIND = {
    "open": "intro", "what": "walk", "kex": "drive", "dh": "race", "hostkey": "seal",
    "derive": "forge", "userauth": "peak", "edge": "edge", "close": "lift",
}
# 各织体的层数与力度
LAYER = {
    "intro": {"bass": 0.0, "str": 0.0, "perc": 0.0, "brass": 0.55, "pad": 1.0},
    "walk": {"bass": 0.55, "str": 0.45, "perc": 0.0, "brass": 0.7, "pad": 0.8},
    "drive": {"bass": 0.95, "str": 0.75, "perc": 0.8, "brass": 0.9, "pad": 0.45},
    "race": {"bass": 1.0, "str": 1.0, "perc": 0.95, "brass": 0.85, "pad": 0.35},
    "seal": {"bass": 1.0, "str": 0.95, "perc": 1.0, "brass": 1.0, "pad": 0.4},
    "forge": {"bass": 1.0, "str": 1.0, "perc": 0.95, "brass": 0.95, "pad": 0.45},
    "peak": {"bass": 1.0, "str": 1.05, "perc": 1.0, "brass": 1.0, "pad": 0.5},
    "edge": {"bass": 0.95, "str": 0.8, "perc": 0.85, "brass": 0.0, "pad": 0.7},
    "lift": {"bass": 1.0, "str": 1.1, "perc": 1.0, "brass": 1.1, "pad": 0.6},
    "outro": {"bass": 0.0, "str": 0.0, "perc": 0.0, "brass": 0.0, "pad": 0.9},
}


def compose(ctx):
    SR, N, total = ctx["sr"], ctx["n"], ctx["total"]
    rng = np.random.default_rng(20261019)
    scenes = ctx["scenes"]
    spec = (ctx.get("audio") or {}).get("score") or {}
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    body, outro = scenes[:-1], scenes[-1]
    t_out = outro["start"]
    lift = None
    if spec.get("lift_cue") in cue:
        lift = round((cue[spec["lift_cue"]]["start"] + 0.2) / BEAT) * BEAT
    stems = {k: np.zeros((2, N)) for k in ("tick", "bass", "str", "brass", "perc", "pad")}

    def put(name, sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0 or i >= N:
            return
        j = min(N, i + len(sig))
        stems[name][0, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 - pan))
        stems[name][1, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 + pan))

    def tt(d):
        return np.arange(max(1, int(d * SR))) / SR

    # ── 音色 ──
    def boom(d=0.7):                                     # 定音鼓：低频一沉
        t = tt(d)
        f = 84 * np.exp(-t / 0.10) + 40
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.24) * np.minimum(1, t / 0.004)

    def rim(d=0.14):                                    # 边击：短、干
        t = tt(d)
        x = np.diff(rng.standard_normal(len(t)), prepend=0)
        return (x / (np.abs(x).max() + 1e-9) * np.exp(-t / 0.022)
                + np.sin(2 * np.pi * 1850 * t) * np.exp(-t / 0.010)) * np.minimum(1, t / 0.001)

    def tick(tock=False):                               # 秒针：一声很短的木质敲击，嘀与嗒音高不同
        t = tt(0.07)
        f = 2050 if tock else 2600
        return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.008)
                + 0.30 * np.sin(2 * np.pi * f * 2.7 * t) * np.exp(-t / 0.003)) * np.minimum(1, t / 0.0006)

    def string(m, d, bright=1.6, vib=5.0):              # 弓弦：加法合成锯齿，带一点揉弦
        t = tt(d)
        f = hz(m)
        y = np.zeros(len(t))
        for k in range(1, 9):
            if f * k > 6000:
                break
            y += np.sin(2 * np.pi * f * k * t + vib * np.sin(2 * np.pi * 5.2 * t)) / (k ** bright)
        e = np.minimum(1, t / 0.035) * np.clip((d - t) / 0.07, 0, 1)
        return y / 1.9 * e

    def brass(m, d, bright=1.15):                       # 铜管：起音慢一点，芯厚
        t = tt(d)
        f = hz(m)
        y = np.zeros(len(t))
        for k in range(1, 11):
            if f * k > 5200:
                break
            y += np.sin(2 * np.pi * f * k * t) / (k ** bright)
        e = np.minimum(1, t / 0.055) * np.clip((d - t) / 0.12, 0, 1)
        return y / 1.7 * e

    def bass_note(m, d):                                # 低音：拨弦，衰减快
        t = tt(d)
        f = hz(m)
        y = np.zeros(len(t))
        for k in range(1, 7):
            y += np.sin(2 * np.pi * f * k * t) / (k ** 2.4)
        return y * np.exp(-t / (d * 0.75)) * np.minimum(1, t / 0.005)

    def pad(m, d):                                      # 铺底：低音弦乐，缓慢起伏
        t = tt(d)
        f = hz(m)
        y = np.zeros(len(t))
        for k in range(1, 7):
            y += np.sin(2 * np.pi * f * k * t + 0.6 * np.sin(2 * np.pi * 4.1 * t)) / k
        e = np.minimum(1, t / 0.45) * np.clip((d - t) / 0.45, 0, 1)
        return y / 2.3 * e

    def noise_rise(d):                                  # 段尾的噪声渐起
        t = tt(d)
        x = rng.standard_normal(len(t))
        return x / (np.abs(x).max() + 1e-9) * (t / d) ** 2 * 0.5

    def play_theme(t0, g=1.0):
        t = t0
        for m, beats in THEME:
            put("brass", brass(m, beats * BEAT * 0.95), t, g, 0.0)
            put("str", string(m + 12, beats * BEAT * 0.95, bright=1.9), t, g * 0.5, -0.2)
            t += beats * BEAT

    def kind_at(t):
        for sc in scenes:
            if sc["start"] <= t < sc["end"]:
                return KIND.get(sc["id"], "drive"), sc
        return "outro", None

    # ── 逐小节铺开 ──
    nbar = int(np.ceil(total / BAR)) + 1
    for b in range(nbar):
        t0 = b * BAR
        if t0 >= t_out:
            break
        ch = CH[b % 4]
        kind, sc = kind_at(t0)
        L = LAYER.get(kind, LAYER["drive"])
        # 结论处：最后一支正片场景转半拍，织体抬起
        if lift is not None and t0 >= lift and kind not in ("lift",):
            L = dict(L)
        # 铺底：每两小节换一次低音
        if b % 2 == 0:
            for m in ch["vo"][:2]:
                put("pad", pad(m - 24, BAR * 2.1), t0, L["pad"] * 0.55, 0.0)
        # 低音：八分音符推着走
        if L["bass"] > 0:
            for i in range(8):
                t = t0 + i * BEAT / 2
                put("bass", bass_note(ch["bass"], BEAT / 2 * 0.92), t, L["bass"] * (1.0 if i % 2 == 0 else 0.62), 0.0)
        # 弦乐 ostinato：八分音符；dh 之后加密到十六分
        if L["str"] > 0:
            step = BEAT / 4 if kind == "race" else BEAT / 2
            n = int(BAR / step)
            fig = ch["vo"]
            for i in range(n):
                t = t0 + i * step
                m = fig[0] + 12 if i % 4 == 0 else (fig[2] + 12 if i % 4 == 2 else fig[1] + 12)
                accent = 1.0 if i % 4 == 0 else (0.72 if i % 2 == 0 else 0.55)
                put("str", string(m, step * 0.86, bright=1.75), t, L["str"] * accent, -0.12 if i % 2 == 0 else 0.12)
        # 打击乐：底鼓在强弱拍，边击在反拍
        if L["perc"] > 0:
            for beat in (0, 2):
                put("perc", boom(), t0 + beat * BEAT, L["perc"] * 0.85, 0.0)
            for beat in (1, 3):
                put("perc", rim(), t0 + beat * BEAT, L["perc"] * 0.55, 0.18)
            if kind in ("race", "forge", "peak"):
                for i in range(4):
                    put("perc", rim(), t0 + 3 * BEAT + i * BEAT / 4, L["perc"] * (0.28 + 0.16 * i), 0.0)
        # 铜管：每场开头一记重音
        if L["brass"] > 0 and sc is not None and abs(t0 - sc["start"]) < 1e-6:
            put("brass", brass(ch["vo"][0] + 12, 0.9), t0, L["brass"], 0.0)
            put("brass", brass(ch["vo"][1] + 12, 0.9), t0 + BEAT / 2, L["brass"] * 0.7, -0.15)
        # 主机密钥那一章：主题出现一次
        if sc is not None and sc["id"] == "hostkey" and abs(t0 - sc["start"]) < 1e-6:
            play_theme(t0 + BEAT, 0.95)
        # 段尾噪声渐起：最后两小节
        if kind not in ("intro", "outro", "edge") and b % 2 == 1:
            nxt = kind_at(t0 + BAR * 2)
            if nxt[0] != kind:
                put("perc", noise_rise(BAR * 2), t0, 0.55, 0.0)

    # ── 秒针：每秒一声，贯穿全片（系列的定长识别）──
    s = 0
    while s < total:
        put("tick", tick(tock=bool(s % 2)), s + 0.02, 0.55 if s < t_out else 0.4, -0.35)
        s += 1.0

    # ── 结论处抬起：主题再现，整支乐队推上去 ──
    if lift is not None:
        play_theme(lift, 1.15)
        for m in (50, 57, 62, 65, 69, 74):
            put("brass", brass(m, 4.0), lift, 0.34, 0.0)
        for m in (38, 45, 50):
            put("pad", pad(m, 6.0), lift, 0.8, 0.0)

    # ── 片尾：只留铺底、一记和弦与秒针 ──
    for m, g in ((62, 0.5), (57, 0.4), (50, 0.45)):
        put("brass", brass(m, 3.2), t_out + 0.1, g, 0.0)
    for m in (50, 57, 62, 65):
        put("pad", pad(m, total - t_out + 1.0), t_out, 0.5, 0.0)

    # ── 混合 ──
    GAIN = {"tick": 0.30, "bass": 0.30, "str": 0.34, "brass": 0.26, "perc": 0.34, "pad": 0.26}
    GAIN.update(spec.get("gains") or {})
    mixd = sum(stems[k] * GAIN[k] for k in stems)
    peak = float(np.abs(mixd).max())
    if peak > 0:
        mixd = mixd / peak * 0.9
    ctx["stems"] = {k: float(np.sqrt(np.mean((v * GAIN[k]) ** 2))) for k, v in stems.items()}
    return mixd
