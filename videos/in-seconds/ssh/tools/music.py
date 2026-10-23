# 《256 秒搞懂 SSH》的配乐：程序合成的 90 年代 8 位电子乐。
# 策划者 2026-10-23：配乐用 90 年代 8 位电子乐。不采样外部音源。
# 由 kit/tools/mix.py 调用。compose(ctx) 返回 (2, N)。
#   ctx: { sr, n, total, scenes, cues, audio, lang }
#
# 方波主旋律、三角波低音、噪声击打。120 拍/分，与 0.2 秒的画面步进对齐（一拍 0.5 秒，内含两个 12 帧）。
# 织体随场景加厚，c1 处抬起，片尾只留低音。
import numpy as np

BPM = 120.0
BEAT = 60.0 / BPM
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# 场景 → 密度。不认识的场景按 walk。
KIND = {
    "open": "intro", "what": "walk", "kex": "drive", "dh": "drive", "hostkey": "seal",
    "derive": "drive", "userauth": "peak", "edge": "thin", "close": "lift", "outro": "outro",
}
LEAD = {
    "intro": [None, 72, None, 74, None, 76, None, 74],
    "walk": [67, None, 70, None, 72, None, 70, 67],
    "drive": [72, 72, 74, None, 76, 74, 72, 70],
    "seal": [76, None, 79, None, 77, 76, 74, 72],
    "peak": [79, 76, 74, 76, 79, None, 81, 79],
    "thin": [67, None, None, 70, None, None, 72, None],
    "lift": [72, 76, 79, 84, 79, 76, 74, 72],
    "outro": [None, None, 60, None, None, None, None, None],
}
BASS = {
    "intro": [36, None, None, None, 36, None, None, None],
    "walk": [36, None, 36, None, 43, None, 41, None],
    "drive": [36, 36, 43, None, 41, 41, 38, None],
    "seal": [41, None, 41, None, 36, None, 43, None],
    "peak": [36, 36, 36, 43, 41, 41, 38, 36],
    "thin": [36, None, None, None, 41, None, None, None],
    "lift": [36, None, 43, None, 41, None, 36, 48],
    "outro": [36, None, None, None, None, None, None, None],
}


def compose(ctx):
    SR, N, total = ctx["sr"], ctx["n"], ctx["total"]
    rng = np.random.default_rng(20261023)
    scenes = ctx["scenes"]
    spec = (ctx.get("audio") or {}).get("score") or {}
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    t_out = scenes[-1]["start"] if scenes else total
    lift = None
    if spec.get("lift_cue") in cue:
        lift = cue[spec["lift_cue"]]["start"]
    stems = {k: np.zeros((2, N)) for k in ("lead", "bass", "hat", "arp")}

    def put(name, sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0 or i >= N or len(sig) == 0:
            return
        j = min(N, i + len(sig))
        stems[name][0, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 - pan))
        stems[name][1, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 + pan))

    def env(n, dur, attack=0.004, release=0.02):
        t = np.arange(n) / SR
        return np.minimum(1.0, t / attack) * np.clip((dur - t) / release, 0, 1)

    def pulse(midi, dur, duty=0.25):
        n = max(1, int(dur * SR))
        phase = (np.arange(n) * hz(midi) / SR) % 1.0
        return np.where(phase < duty, 1.0, -1.0) * env(n, dur)

    def tri(midi, dur):
        n = max(1, int(dur * SR))
        phase = (np.arange(n) * hz(midi) / SR) % 1.0
        return (2 * np.abs(2 * phase - 1) - 1) * env(n, dur, 0.008, 0.04)

    def hat(dur=0.04):
        n = max(1, int(dur * SR))
        return rng.uniform(-1, 1, n) * env(n, dur, 0.001, 0.008)

    def kind_at(t):
        name = "walk"
        for sc in scenes:
            if sc["start"] <= t < sc["end"]:
                name = KIND.get(sc["id"], "walk")
        return name

    step = BEAT / 2
    t = 0.0
    i = 0
    while t < t_out - 0.01:
        kind = "lift" if lift is not None and t >= lift else kind_at(t)
        slot = i % 8
        lead = LEAD[kind][slot]
        bass = BASS[kind][slot]
        if lead is not None:
            put("lead", pulse(lead, step * 0.9, 0.25 if kind != "peak" else 0.125), t, 0.22, 0.15)
        if bass is not None:
            put("bass", tri(bass, step * 0.95), t, 0.34, -0.05)
        if slot % 2 == 0 and kind not in ("intro", "outro", "thin"):
            put("hat", hat(0.035), t, 0.16 if slot % 4 else 0.28, 0.2)
        if kind in ("drive", "peak", "seal", "lift") and slot % 4 == 2:
            put("arp", pulse(lead + 12 if lead else 84, step * 0.45, 0.125), t + step * 0.5, 0.12, -0.2)
        t += step
        i += 1

    GAIN = {"lead": 0.34, "bass": 0.42, "hat": 0.22, "arp": 0.2}
    mixd = sum(stems[k] * GAIN[k] for k in stems)
    peak = float(np.abs(mixd).max()) if N else 0.0
    if peak > 0:
        mixd = mixd / peak * 0.9
    ctx["stems"] = {k: float(np.sqrt(np.mean((v * GAIN[k]) ** 2))) for k, v in stems.items()}
    return mixd
