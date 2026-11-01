# 本片配乐「CRT 终端」：策划者在审片页选定的小样（tools/music_demos.py 的 compose_crt_terminal，第 1 轮 Kimi K3.1 Pro 设计）按 100 秒的段落重写。
# E 小调开放音程的铺底；限带方波的「数据」动机（像终端吐字，落点不均匀）；三点继电器节奏；细的同步脉冲；三角波低音。120 拍/分，一小节 2 秒。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music = "tools/music.py"）：compose(ctx) 返回 (2, N)，电平与旁白压低由 mix.py 处理。
# 段落取自 ctx["scenes"]，不写死秒数：
#   open    铺底 + 稀疏的数据音（引子）            address/prefix  数据动机铺满 + 低音
#   route   加继电器与同步脉冲（一站站送）          special         同上，略收
#   limit   前半撤掉节奏只留铺底与低音（地址不够了）；lift_cue（e5，IPv6）那一拍抬起，数据动机加倍；e6 之后收
#   outro   只留铺底，最后一个长音
# 结果确定：随机数固定种子；同样的音只算一次（缓存）。制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 120.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FADE = (0.3, 2.5)

CHORDS = [[40, 47, 50, 54, 59], [36, 43, 47, 50, 52], [45, 48, 52, 55, 59], [35, 42, 45, 47, 50]]   # Em(add9) – C – Am – B(sus)
ROOTS = [28, 24, 33, 35]
MOTIF = [4, 2, 3, 1, 2, 0, 3, 1]
DATA = [0.0, 1.0, 1.5, 2.5, 3.5]


def compose(ctx):
    SR, N = ctx["sr"], ctx["n"]
    rng = np.random.default_rng(1981)
    sc = {s["id"]: s for s in ctx["scenes"]}
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    spec = (ctx.get("audio") or {}).get("score") or {}
    lift = None
    if spec.get("lift_cue") in cue:
        lift = round((cue[spec["lift_cue"]]["start"] + 0.2) / BEAT) * BEAT
    mix = np.zeros((2, N))
    cache = {}
    midi = lambda m: 440.0 * 2.0 ** ((m - 69) / 12.0)

    def place(sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0 or i >= N:
            return
        sig = np.asarray(sig)
        if sig.ndim == 1:
            a = (pan + 1.0) * np.pi / 4.0
            sig = np.vstack([sig * np.cos(a), sig * np.sin(a)])
        j = min(N, i + sig.shape[1])
        mix[:, i:j] += sig[:, : j - i] * g

    def env_pluck(n, d, decay):
        t = np.arange(n) / SR
        e = (1.0 - np.exp(-t / 0.006)) * np.exp(-decay * t / d)
        r = min(int(0.045 * SR), n // 3)
        if r:
            e[-r:] *= np.linspace(1.0, 0.0, r)
        return e

    def square(note, d, cutoff=5800.0):
        k = ("sq", note, d, cutoff)
        if k not in cache:
            n = int(d * SR); t = np.arange(n) / SR; f = midi(note)
            x = np.zeros(n)
            for hmn in range(1, min(24, max(1, int(cutoff / f))) + 1, 2):
                x += np.sin(2 * np.pi * hmn * f * t) / hmn
            cache[k] = x * (4 / np.pi) * env_pluck(n, d, 5.0) * 0.22
        return cache[k]

    def tri(note, d, decay=5.5):
        k = ("tri", note, d)
        if k not in cache:
            n = int(d * SR); t = np.arange(n) / SR; a = 2 * np.pi * midi(note) * t
            cache[k] = (np.sin(a) + 0.32 * (2 / np.pi) * np.arcsin(np.sin(a))) * env_pluck(n, d, decay) * 0.48
        return cache[k]

    def pad(note, d, ph):
        k = ("pad", note, d, ph)
        if k not in cache:
            n = int(d * SR); t = np.arange(n) / SR; f = midi(note)
            e = np.ones(n); at = min(int(0.8 * SR), n); rl = min(int(1.2 * SR), n // 2)
            e[:at] = np.linspace(0, 1, at, endpoint=False); e[-rl:] *= np.linspace(1, 0, rl)
            ch = []
            for det in (-0.0007, 0.0007):
                a = 2 * np.pi * f * 2 ** (det / 12) * t + ph
                ch.append((np.sin(a) + 0.10 * (2 / np.pi) * np.arcsin(np.sin(a)) + 0.10 * np.sin(2 * a + 0.3)) * e * 0.24)
            cache[k] = np.vstack(ch)
        return cache[k]

    relays = []
    for _ in range(6):
        n = int(0.075 * SR); t = np.arange(n) / SR; z = rng.standard_normal(n); z = z - np.convolve(z, np.ones(7) / 7, mode="same")
        e = (1 - np.exp(-t / 0.001)) * np.exp(-t * 42)
        relays.append((0.65 * z * e + 0.45 * np.sin(2 * np.pi * 1550 * t) * np.exp(-t * 75) + 0.32 * np.sin(2 * np.pi * 170 * t) * np.exp(-t * 38)) * 0.22)

    def sec(t):
        # 每个时刻属于哪一段、各层多少电平
        def inside(i):
            s = sc.get(i)
            return s and s["start"] <= t < s["end"]
        if inside("open"):
            k = min(1.0, t / 12.0)
            return dict(pad=0.9, data=0.35 + 0.35 * k, sparse=True, bass=0.0, relay=0.0, pulse=0.0)
        if inside("address") or inside("prefix"):
            return dict(pad=0.85, data=0.8, sparse=False, bass=0.75, relay=0.0, pulse=0.0)
        if inside("route"):
            return dict(pad=0.8, data=0.85, sparse=False, bass=0.85, relay=1.0, pulse=1.0)
        if inside("special"):
            return dict(pad=0.8, data=0.75, sparse=False, bass=0.8, relay=0.8, pulse=0.8)
        if inside("limit"):
            if lift is not None and t < lift:
                return dict(pad=0.95, data=0.25, sparse=True, bass=0.7, relay=0.0, pulse=0.0)
            last = cue.get("e6")
            tail = last and t > last["end"]
            return dict(pad=0.9, data=0.5 if tail else 1.0, sparse=bool(tail), bass=0.8, relay=0.0 if tail else 0.9, pulse=0.0 if tail else 1.1, double=not tail)
        return dict(pad=0.8, data=0.0, sparse=True, bass=0.0, relay=0.0, pulse=0.0)

    total = ctx["total"]
    nbars = int(np.ceil(total / BAR))
    outro = sc.get("outro")
    for bar in range(nbars):
        t0 = bar * BAR
        ci = (bar // 2) % 4
        chord = CHORDS[ci]
        if outro and t0 >= outro["start"] - 0.01:
            chord = CHORDS[0]; ci = 0
        L0 = sec(t0 + 0.01)
        if bar % 2 == 0 or (outro and abs(t0 - round(outro["start"] / BAR) * BAR) < 0.01):
            for i, nt in enumerate(chord[1:]):
                place(pad(nt, 4.05, i * 0.9), t0, 0.15 * L0["pad"])
        for beat_i in range(4):
            tb = t0 + beat_i * BEAT
            Lb = sec(tb + 0.01)
            if beat_i in (0, 2) and Lb["bass"]:
                place(tri(ROOTS[ci] + 12, 0.30), tb, 0.26 * Lb["bass"])
        if L0["data"]:
            pos = [0.0, 2.5] if L0["sparse"] else list(DATA)
            if L0.get("double"):
                pos = sorted(pos + [2.0, 3.0])
            for i, b in enumerate(pos):
                tb = t0 + b * BEAT
                Lb = sec(tb + 0.01)
                if not Lb["data"]:
                    continue
                nt = chord[MOTIF[(2 * bar + i) % 8] % len(chord)] + 24
                pan = (-0.38, 0.32)[(bar + i) % 2]
                place(square(nt, 0.19 if i % 2 else 0.26), tb, 0.42 * Lb["data"], pan)
                if Lb.get("double") and i % 3 == 0:
                    place(square(nt, 0.19), tb + 0.25, 0.08 * Lb["data"], -pan)
        if L0["relay"]:
            for i, b in enumerate([0.0, 1.5, 2.5]):
                place(relays[(bar + i) % 6], t0 + b * BEAT, 0.27 * L0["relay"], (-0.45, 0.40, -0.10)[i])
        if L0["pulse"]:
            for b in np.arange(0.0, 4.0, 0.5):
                place(square(chord[0] + 36, 0.055, 4200.0), t0 + float(b) * BEAT, 0.085 * L0["pulse"], 0.12)
    if lift is not None:
        place(square(CHORDS[0][4] + 24, 0.65), lift, 0.22, -0.15)
    if outro:
        place(square(76, 1.2), round((outro["start"] + 0.2) / BEAT) * BEAT, 0.18, -0.15)
    return mix
