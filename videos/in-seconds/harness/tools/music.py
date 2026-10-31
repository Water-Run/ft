# 本片的配乐：WaterRun 2026-10-31 从三个 Demo 里选了 A「秒针」（120 拍、每秒一声秒针、拨弦琶音、轻底鼓）。
# 正式版按本片重写：和弦走 D 小调 i–iv–VII–III（Dm–Gm–C–F），不用系列起点的 i–VI–III–VII；
# 母题是「一圈」：每发出一次请求（a4 之后、l1、l4、l6、l7 各一次），落一声钟音，和画面上指针回到「模型」一站同拍。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music）：compose(ctx) 返回 (2, N) 的数组，电平与旁白压低由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: project.json 的 audio 段 }
# 段落：open 引子（秒针 + 铺底，片名卡一记重音）→ ask/loop 主段（加底鼓、贝斯、八分音符琶音）→ more 抬一层（十六分音符的高音）
#   → end 半拍、抬起（audio.score.lift_cue）→ 片尾只留铺底与秒针，最后一声钟。
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 120.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
CHORDS = [
    (38, [62, 65, 69, 72]),     # Dm7：D F A C
    (43, [62, 67, 70, 74]),     # Gm：D G Bb D
    (36, [60, 64, 67, 72]),     # C：C E G C
    (41, [60, 65, 69, 72]),     # F：C F A C
]


def compose(ctx):
    SR, N = ctx["sr"], ctx["n"]
    rng = np.random.default_rng(150)
    scenes = {s["id"]: s for s in ctx["scenes"]}
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    spec = (ctx.get("audio") or {}).get("score") or {}
    out = np.zeros((2, N))

    def put(sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0 or i >= N:
            return
        j = min(N, i + len(sig))
        out[0, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 - pan))
        out[1, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 + pan))

    def tt(d):
        return np.arange(int(d * SR)) / SR

    # ── 音色 ──
    def tick(tock=False):                       # 秒针：高通的噪声加一点金属的谐音，很短
        t = tt(0.05)
        w = np.diff(rng.standard_normal(len(t)), prepend=0)
        f = 2300 if tock else 3100
        return (0.6 * w / (np.abs(w).max() + 1e-9) + np.sin(2 * np.pi * f * t)) * np.exp(-t / 0.008)

    def kick():
        t = tt(0.3)
        f = 44 + 72 * np.exp(-t / 0.03)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * np.minimum(1, t / 0.002)

    def marimba(m, d=0.42):
        t = tt(d)
        f = hz(m)
        return np.sin(2 * np.pi * f * t + 0.9 * np.exp(-t * 18) * np.sin(2 * np.pi * 4 * f * t)) * np.exp(-t / (d * 0.3)) * np.minimum(1, t / 0.002)

    def bell(m, d=2.2):
        t = tt(d)
        f = hz(m)
        return np.sin(2 * np.pi * f * t + 1.5 * np.exp(-t * 5) * np.sin(2 * np.pi * 3.5 * f * t)) * np.exp(-t / (d * 0.32)) * np.minimum(1, t / 0.003)

    def bass(m, d):
        t = tt(d)
        f = hz(m)
        y = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (1.5 + 4 * (k - 1))) for k in range(1, 7) if f * k < 1500)
        return y * np.minimum(1, t / 0.005) * np.clip((d - t) / 0.03, 0, 1)

    def pad(tones, d, atk=0.6, rel=0.9):
        t = tt(d + rel)
        env = np.minimum(1, t / atk) * np.clip((d + rel - t) / rel, 0, 1)
        y = np.zeros((2, len(t)))
        for i, m in enumerate(tones[:3]):
            f = hz(m - 12)
            ph = rng.uniform(0, 2 * np.pi, 2)
            for det, side in ((-0.0025, 0), (0.0025, 1)):
                y[side] += sum(np.sin(2 * np.pi * f * (1 + det) * k * t + ph[side]) / k for k in range(1, 5)) * env
        return y / 3

    def put_pad(tones, t0, d, g):
        y = pad(tones, d)
        i = int(round(t0 * SR))
        j = min(N, i + y.shape[1])
        if i < N:
            out[:, i:j] += y[:, : j - i] * g

    # ── 段落的边界 ──
    t_ask = scenes["ask"]["start"]
    t_more = scenes["more"]["start"]
    t_end = scenes["end"]["start"]
    t_out = scenes["outro"]["start"]
    total = ctx["total"]
    t_card = cue["oT"]["start"] if "oT" in cue else 17.5
    lift = None
    if spec.get("lift_cue") in cue:
        lift = round((cue[spec["lift_cue"]]["start"] + 0.2) / BEAT) * BEAT

    nbars = int(np.ceil(total / BAR))
    for b in range(nbars):
        t0 = b * BAR
        root, tones = CHORDS[b % 4]
        body = t_ask <= t0 < t_out
        hi = t_more <= t0 < t_end
        half = t_end <= t0 < t_out
        put_pad(tones, t0, BAR, 0.05 if t0 < t_ask else 0.06 if not hi else 0.07)
        if body or (t0 >= t_card + 2.5 and t0 < t_ask):
            put(bass(root - 12, BAR * 0.95), t0, 0.16)
        if body:
            if half:
                put(kick(), t0, 0.22)
                put(kick(), t0 + 2 * BEAT, 0.14)
            else:
                for k in range(4):
                    put(kick(), t0 + k * BEAT, 0.2 if k % 2 == 0 else 0.12)
            pat = [0, 1, 2, 3, 2, 1, 2, 3] if b % 2 == 0 else [0, 2, 1, 3, 2, 3, 1, 2]
            step = 1 if not half else 2
            for k in range(0, 8, step):
                put(marimba(tones[pat[k]]), t0 + k * BEAT / 2, 0.07, -0.3 if k % 2 else 0.3)
        if hi:
            for k in range(16):
                put(marimba(tones[[0, 2, 3, 2][k % 4]] + 12, 0.18), t0 + k * BEAT / 4, 0.025, 0.5 if k % 2 else -0.5)

    # 秒针：全片每秒一声；换小节的那一声低一点（嗒）
    for s_ in range(int(total)):
        put(tick(tock=(s_ % 2 == 0)), float(s_), 0.08 if s_ % 2 == 0 else 0.06, -0.15)
    # 片名卡：一记低音与钟
    put(kick(), round(t_card / BEAT) * BEAT, 0.3)
    put(bell(74, 2.6), round(t_card / BEAT) * BEAT, 0.08)
    # 每发出一次请求，落一声钟音（和画面上指针回到「模型」一站同拍）
    sends = []
    if "a4" in cue:
        sends.append(cue["a4"]["end"] + 0.15)
    for cid in ("l1", "l4", "l6", "l7"):
        if cid in cue:
            sends.append(cue[cid]["start"] + 0.4)
    for i, ts in enumerate(sends):
        put(bell([69, 72, 74, 76, 81][min(i, 4)], 2.0), round(ts / (BEAT / 2)) * (BEAT / 2), 0.07, 0.2)
    # 抬起：结论那一拍
    if lift is not None:
        put(kick(), lift, 0.32)
        put(bell(74, 3.0), lift, 0.09)
        put_pad([62, 69, 74], lift, 2 * BAR, 0.05)
    # 片尾：最后一声钟，收口
    put(bell(62, 3.0), max(0.0, total - 3.2), 0.1)
    fade = np.ones(N)
    k = int(0.4 * SR)
    fade[-k:] = np.linspace(1, 0, k) ** 1.5
    out *= fade
    out = np.tanh(out * 1.3) / np.tanh(1.3)
    return out
