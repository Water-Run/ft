# 本片配乐「磁贴」（Metro）：程序合成，112 拍/分，A 大调 A – F#m – D – E，每小节一个和弦。策划者 2026-11-07 选定（审片页小样 B）。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music 写成 "tools/music.py"）：compose(ctx) 返回 (2, N) 的数组，电平与旁白压低由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: project.json 的 audio 段 }
# 编排按场景加减层，层的进出落在小节线上（取场景开始之后的第一个小节线）：
#   open 只有切分拨弦；history 加低音；stand、bytes 加底鼓、拍手与踩镲；adapt 再加高处铺底（全曲最满）；
#   limit 抽掉拍手、底鼓减半；end 回到全编制并在结论处抬起；片尾只留铺底与稀疏拨弦。
# 设计：配的是讲解，不是舞曲；音色只用加法合成的方波、正弦与噪声，干净、扁平，对应 Windows 8 的磁贴。
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 112.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FADE = (0.05, 2.0)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
CHORDS = [(45, [69, 73, 76]), (42, [66, 69, 73]), (38, [62, 66, 69]), (40, [64, 68, 71])]   # A – F#m – D – E
RHYTHM = [0, 0.75, 1.5, 2, 2.75, 3.5]                                                       # 切分
LAYERS = {
    'open':    {'pluck'},
    'history': {'pluck', 'bass'},
    'stand':   {'pluck', 'bass', 'kick', 'clap', 'hat'},
    'bytes':   {'pluck', 'bass', 'kick', 'clap', 'hat', 'octave'},
    'adapt':   {'pluck', 'bass', 'kick', 'clap', 'hat', 'octave', 'pad'},
    'limit':   {'pluck', 'bass', 'halfkick', 'hat'},
    'end':     {'pluck', 'bass', 'kick', 'clap', 'hat', 'pad'},
    'outro':   {'pad', 'sparse'},
}


def compose(ctx):
    SR, N = ctx['sr'], ctx['n']
    rng = np.random.default_rng(2012)
    scenes = ctx['scenes']
    out = np.zeros((2, N))

    def tt(d): return np.arange(int(d * SR)) / SR

    def put(sig, t0, g=1.0, pan=0.0):
        i = int(round(t0 * SR))
        if i < 0 or i >= N: return
        j = min(N, i + len(sig))
        out[0, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 - pan))
        out[1, i:j] += sig[: j - i] * g * np.sqrt(0.5 * (1 + pan))

    def env(t, a, d, s=0.0):
        return np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))

    def pluck(f, d=0.22):
        t = tt(d); x = np.zeros_like(t)
        for k in range(1, 8, 2):
            x += np.sin(2 * np.pi * f * k * t) / k
        return x * env(t, 0.002, 0.07)

    def sub(f, d):
        t = tt(d)
        return np.sin(2 * np.pi * f * t) * env(t, 0.01, 0.6, 0.55) * np.minimum(1, (d - t) / 0.05)

    def kick():
        t = tt(0.3); f = 48 + 80 * np.exp(-t / 0.03)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)

    def noise(d, hp, decay):
        t = tt(d); x = rng.standard_normal(len(t))
        for _ in range(hp): x = np.diff(x, prepend=0)
        return x / (np.abs(x).max() + 1e-9) * np.exp(-t / decay)

    def clap():
        t = tt(0.25); x = np.zeros_like(t)
        for k, o in enumerate((0.0, 0.011, 0.022)):
            i = int(o * SR); nb = noise(0.25 - o, 1, 0.012 if k < 2 else 0.06); x[i:i + len(nb)] += nb[: len(x) - i]
        return x * 0.6

    def pad(fs, d):
        t = tt(d); x = np.zeros_like(t)
        for f in fs:
            for det in (-0.1, 0.0, 0.1):
                ff = f * 2 ** (det / 12); x += np.sin(2 * np.pi * ff * t + rng.uniform(0, 6.28)) + 0.3 * np.sin(4 * np.pi * ff * t)
        x /= len(fs) * 3
        return x * np.clip(np.minimum(t / 0.8, (d - t) / 0.6), 0, 1)

    def scene_at(t):
        cur = scenes[0]['id']
        for sc in scenes:
            if sc['start'] <= t + 1e-6: cur = sc['id']
        return cur

    nbars = int(np.ceil(ctx['total'] / BAR)) + 1
    for b in range(nbars):
        t0 = b * BAR
        if t0 >= ctx['total']: break
        L = LAYERS.get(scene_at(t0), {'pluck'})
        root, tones = CHORDS[b % 4]
        if 'pluck' in L:
            for k, r in enumerate(RHYTHM):
                m = tones[k % 3] + (12 if (k == 4 and 'octave' in L) else 0)
                put(pluck(hz(m)), t0 + r * BEAT, 0.22, 0.25 if k % 2 else -0.25)
        if 'sparse' in L:
            put(pluck(hz(tones[b % 3] + 12), 0.5), t0, 0.16, 0.2)
        if 'bass' in L:
            for q in (0, 1.5, 2.5, 3):
                put(sub(hz(root - 12), BEAT * 0.45), t0 + q * BEAT, 0.6)
        if 'kick' in L or 'halfkick' in L:
            for q in ((0, 2) if 'kick' in L else (0,)):
                put(kick(), t0 + q * BEAT, 0.9)
        if 'clap' in L:
            for q in (1, 3):
                put(clap(), t0 + q * BEAT, 0.35, 0.1)
        if 'hat' in L:
            for e in range(8):
                put(noise(0.04, 2, 0.008), t0 + e * BEAT / 2, 0.06 if e % 2 else 0.03, 0.35)
        if 'pad' in L:
            fs = [hz(m + 12) for m in tones]
            put(pad(fs, BAR + 0.6), t0, 0.13, -0.8); put(pad(fs, BAR + 0.6), t0, 0.13, 0.8)
    # 结论抬起：audio.score.lift_cue 那一句开始后就近的拍子上，一声高八度的拨弦和弦
    spec = (ctx.get('audio') or {}).get('score') or {}
    cue = {c['id']: c for c in ctx.get('cues', [])}
    if spec.get('lift_cue') in cue:
        tl = round((cue[spec['lift_cue']]['start'] + 0.2) / BEAT) * BEAT
        for m in (81, 85, 88):
            put(pluck(hz(m), 0.6), tl, 0.18)
    return out
