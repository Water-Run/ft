# -*- coding: utf-8 -*-
"""MongoDB / WiredTiger 一集的配乐：审片页选定的小样 C「档案」的整片版本（70 拍/分，C 小调，低音钢琴与弦乐）。

音色与写法沿用 tools/music_demo.py 的 C 方向（直接调用它的合成函数），这里只做编排：
    · 先合成几段 8 小节（约 27.4 秒）的乐句，每段一种情绪：
        intro 引子（低弦持续音、暗的弦乐和弦、钢琴动机「C–G–A♭–G」独奏）
        story 推进（第 01 章 NoSQL 的历史：动机随和声移位、弦乐渐亮）
        calmA / calmB 讲机制（02–07 章：弦乐压暗，钢琴只留动机或稀疏的单音，交替使用免得单调）
        tension 并发（08 章：低音钢琴八分音符的固定音型、偶尔一记低鼓）
        dark 出错（09 章：只留低弦与持续音，低鼓像心跳）
        resolve 收束（10 章的五个问题）
        peak 最高处（片名与片尾的 Redis：弦乐旋律、大提琴齐奏、低鼓）
    · 再按 ctx 里的场景与句子把乐句铺到时间线上：每章从章节卡开始重新起句（循环播放，章与章之间交叉淡变），
      片名（句 oT）与片尾的「Redis」（句 j13 起）换成最高处。不写死秒数，文案或配音变了会自动跟着走。
    · 电平、在旁白下压低、限幅由 kit/tools/mix.py 统一处理；这里返回任意幅度的 (2, N)。
乐句合成较慢，结果缓存在 build/music/（生成物，不入库）；改了这里的编排参数，缓存的版本号会变。
只依赖 numpy；随机数全部固定种子，结果逐样本可复现。
"""
import hashlib, importlib.util, json, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
_spec = importlib.util.spec_from_file_location('mongodb_music_demo', os.path.join(HERE, 'music_demo.py'))
D = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(D)
SR = D.SR
BPM = 70.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FADE = (2.0, 4.0)          # 全片开头淡入、结尾淡出（秒），mix.py 读取

CH = {
    "Cm": ([36, 43], [55, 60, 63, 67]), "AbC": ([36, 44], [56, 60, 63, 67]), "FmC": ([36, 41], [56, 60, 65, 68]),
    "Ab": ([32, 44], [55, 60, 63, 67]), "Eb": ([39, 46], [55, 58, 63, 67]), "Bb": ([34, 46], [53, 58, 62, 65]),
    "Fm9": ([41, 48], [56, 60, 63, 67]), "EbBb": ([34, 46], [55, 58, 63, 67]), "Gs": ([31, 43], [55, 60, 62, 67]),
    "G7": ([31, 43], [55, 59, 62, 65]), "Cm9": ([36, 43], [55, 62, 63, 67]),
}

# 钢琴：(小节, 拍, 音高, 拍长, 力度)
MOTIF = [(0, 48, 1), (1, 55, 1), (2, 56, .5), (2.5, 55, 1.5)]                       # C–G–A♭–G
ANSWER = [(0, 53, 1), (1, 51, 1), (2, 48, 2)]                                       # F–E♭–C
CLOSE = [(0, 43, 1), (1, 48, 3)]


def at(bar, figure, vel, shift=0):
    return [(bar, bt, m + shift, d, vel) for bt, m, d in figure]


PHRASES = {
    "intro": dict(prog=["Cm", "AbC", "FmC", "Cm"] * 2, bright=(1000, 1500), str_g=0.24, low_g=0.30, pedal_g=0.34, level=0.70,
                  piano=at(1, MOTIF, .55) + at(2, ANSWER, .52) + at(3, CLOSE, .5) + at(5, MOTIF, .58) + at(6, ANSWER, .55) + at(7, CLOSE, .5)),
    "story": dict(prog=["Cm", "Ab", "Eb", "Bb", "Fm9", "Ab", "Bb", "Cm"], bright=(1500, 2600), str_g=0.36, low_g=0.42, pedal_g=0.28, level=0.78,
                  piano=at(0, MOTIF, .6) + at(1, [(0, 60, 1), (1, 58, .5), (1.5, 56, .5), (2, 55, 2)], .62) + at(2, [(0, 51, 1), (1, 58, 1), (2, 60, .5), (2.5, 58, 1.5)], .62)
                  + at(3, [(0, 62, 1), (1, 60, .5), (1.5, 58, .5), (2, 53, 2)], .64) + at(4, [(0, 56, 1), (1, 55, 1), (2, 53, .5), (2.5, 51, .5), (3, 48, 1)], .62)
                  + at(5, MOTIF, .58, 8) + at(6, ANSWER, .58, 5) + at(7, CLOSE, .55, 5)
                  + [(b, 0, CH[c][0][1] - 12, 4, .45) for b, c in enumerate(["Cm", "Ab", "Eb", "Bb", "Fm9", "Ab", "Bb", "Cm"])]),
    "calmA": dict(prog=["Cm", "AbC", "FmC", "Cm", "Cm", "Ab", "Eb", "Bb"], bright=(1100, 1300), str_g=0.22, low_g=0.30, pedal_g=0.30, level=0.60,
                  piano=at(1, MOTIF, .42) + at(2, ANSWER, .4) + at(5, MOTIF, .42, 3) + at(6, ANSWER, .4, 3)),
    "calmB": dict(prog=["Ab", "Eb", "Fm9", "Cm", "Ab", "Bb", "Cm", "Cm"], bright=(1200, 1400), str_g=0.22, low_g=0.30, pedal_g=0.26, level=0.60,
                  piano=[(b, bt, CH[c][1][(b + k) % 4] + 12, 1.5, .34) for b, c in enumerate(["Ab", "Eb", "Fm9", "Cm", "Ab", "Bb", "Cm", "Cm"]) for k, bt in enumerate((0, 2))]),
    "tension": dict(prog=["Cm", "Cm", "Ab", "Ab", "Fm9", "Fm9", "Gs", "G7"], bright=(1700, 2200), str_g=0.30, low_g=0.40, pedal_g=0.30, level=0.74,
                    piano=[(b, k * 0.5, (36 if k % 2 == 0 else 43) + {"Cm": 0, "Ab": -4, "Fm9": 5, "Gs": -5, "G7": -5}[c], 0.5, .30 + .06 * (k % 4 == 0))
                           for b, c in enumerate(["Cm", "Cm", "Ab", "Ab", "Fm9", "Fm9", "Gs", "G7"]) for k in range(8)] + at(2, MOTIF, .5, 12) + at(6, ANSWER, .5, 12),
                    taiko=[(b, 0, .35) for b in (0, 2, 4, 6)]),
    "dark": dict(prog=["Cm", "FmC", "Cm", "FmC", "Ab", "Fm9", "Gs", "G7"], bright=(800, 950), str_g=0.12, low_g=0.50, pedal_g=0.40, level=0.66,
                 piano=[(b, 0, m, 4, .5) for b, m in ((0, 36), (2, 36), (4, 32), (6, 31))] + at(1, MOTIF, .38, -12) + at(5, ANSWER, .38, -12),
                 taiko=[(b, bt, v) for b in range(8) for bt, v in ((0, .26), (0.5, .16))]),
    "resolve": dict(prog=["Ab", "Fm9", [("Gs", 2), ("G7", 2)], "Cm9"] * 2, bright=(2000, 1200), str_g=0.30, low_g=0.40, pedal_g=0.30, level=0.74,
                    piano=at(0, [(0, 60, 1), (1, 55, 1), (2, 56, .5), (2.5, 55, 1.5)], .5) + at(1, ANSWER, .45) + at(2, [(0, 50, 2), (2, 47, 2)], .42) + at(3, [(0, 48, 4), (0.06, 55, 4), (0.12, 62, 4), (0.18, 63, 4)], .38)
                    + at(4, MOTIF, .5, 12) + at(5, ANSWER, .45, 12) + at(6, [(0, 50, 2), (2, 47, 2)], .42, 12) + at(7, [(0, 48, 4), (0.06, 55, 4), (0.12, 62, 4)], .36)),
    "peak": dict(prog=["Ab", "Bb", "Cm", "EbBb"] * 2, bright=(3400, 4000), str_g=0.62, low_g=0.80, pedal_g=0.26, level=1.0,
                 mel=[(b + o, bt, m, d) for o in (0, 4) for b, bt, m, d in [(0, 0, 72, 2), (0, 2, 75, 2), (1, 0, 74, 2), (1, 2, 77, 2), (2, 0, 79, 3), (2, 3, 77, 1), (3, 0, 75, 2), (3, 2, 74, 2)]],
                 piano=[(b + o, bt, m, 1, .5) for o in (0, 4) for b, ph in ((0, [(0, 60), (1, 67), (2, 68), (3, 67)]), (1, [(0, 62), (1, 65), (2, 67), (3, 65)]), (2, [(0, 63), (1, 67), (2, 68), (3, 67)]), (3, [(0, 63), (1, 62), (2, 58), (3, 60)])) for bt, m in ph]
                 + [(b + o, bt, lh, 2, v) for o in (0, 4) for b, lh in ((0, 32), (1, 34), (2, 36), (3, 34)) for bt, v in ((0, .8), (2, .6))],
                 taiko=[(b, bt, v) for b in range(8) for bt, v in ((0, 1.0), (2, .55))]),
}
VERSION = hashlib.sha1(json.dumps(PHRASES, sort_keys=True, default=str).encode()).hexdigest()[:10]
_IR = None


def render_phrase(kind):
    """一段乐句：8 小节 + 4 秒余响，(2, n)，按 RMS 对齐后乘以本段的相对电平。"""
    global _IR
    spec = PHRASES[kind]
    prog = spec["prog"]
    ev = D.chord_events(prog)
    nbeats = sum(4 if isinstance(p, str) else sum(d for _, d in p) for p in prog)
    total = nbeats * BEAT + 4.0
    n = int(total * SR)
    T = lambda b, bt=0.0: (b * 4 + bt) * BEAT
    B = {k: D.Bus(n) for k in ("pedal", "low", "str", "mel", "cello", "piano", "taiko")}
    D.render_sustain(B["pedal"], [["C", 0, nbeats]], lambda c: [36], BEAT, [(0, 250), (total, 250)], tilt=2.0, even=1.0,
                     detunes=[-2, 2], attack=2.0, release=3.0, seed=81, spread=0.2)
    b0, b1 = spec["bright"]
    D.render_sustain(B["low"], ev, lambda c: CH[c][0], BEAT, [(0, 0.45 * b0), (total, 0.45 * b1)], tilt=1.05, even=1.0,
                     detunes=[-6, -2, 2, 6], attack=1.1, release=2.2, seed=91, vib=0.0016, vib_delay=0.8, spread=0.5)
    D.render_sustain(B["str"], ev, lambda c: CH[c][1], BEAT, [(0, b0), (total, b1)], tilt=1.0, even=1.0,
                     detunes=[-9, -5, -2, 2, 5, 9], attack=1.2, release=2.4, seed=101, vib=0.0022, vib_delay=0.5, spread=0.9)
    for i, (b, bt, m, d) in enumerate(spec.get("mel", [])):
        dur = d * BEAT + 0.12
        for bus, mm, br, sd in ((B["mel"], m, 4200, 700), (B["cello"], m - 24, 1800, 750)):
            nn = int((dur + 1.6) * SR)
            f = D.hz(mm)
            sg = D.osc([(D.wtable(f, br, 1.0, 1.0), 1.0)], f, nn, [-6, -2, 2, 6], seed=sd + i, vib=0.0032, vib_delay=0.35, spread=0.6)
            sg *= D.env(nn, 0.35, dur, 1.6)
            bus.add(sg, T(b, bt))
    for b, bt, m, d, v in spec.get("piano", []):
        B["piano"].add(D.piano(m, v, d * BEAT), T(b, bt), pan=float(np.clip((m - 52) / 40, -0.4, 0.4)))
    for b, bt, v in spec.get("taiko", []):
        B["taiko"].add(D.thump(v, f_hi=105, f_lo=52, tau_f=0.04, tau_a=0.5, length=1.4, body=0.25, grit=0.07, seed=21), T(b, bt))
    gains = dict(pedal=spec["pedal_g"], low=spec["low_g"], str=spec["str_g"], mel=0.4, cello=0.28, piano=1.25, taiko=0.42)
    sends = dict(pedal=0.02, low=0.1, str=0.32, mel=0.4, cello=0.25, piano=0.3, taiko=0.2)
    body = D.chain(D.peq(280, 2.5, 0.5), D.peq(1100, 1.5, 0.6), D.peq(2900, 1.5, 0.5), D.peq(650, -1.5, 0.4), D.lp(7500, 2))
    dry = np.zeros((2, n)); rin = np.zeros((2, n))
    for k, bus in B.items():
        x = bus.x
        if not x.any():
            continue
        if k in ("str", "mel", "cello", "low"):
            x = D.fft_filter(x, body)
        dry += gains[k] * x
        rin += sends[k] * gains[k] * x
    if _IR is None:
        _IR = D.make_ir(3.4, 1.8, 0.032, seed=303)
    out = D.master(dry, rin * 0.6, _IR)
    body_n = int(nbeats * BEAT * SR)
    rms = np.sqrt(np.mean(out[:, :body_n] ** 2)) + 1e-12
    return out / rms * 0.1 * spec["level"], nbeats * BEAT


def phrase(kind):
    cache = os.path.join(VIDEO, "build", "music")
    os.makedirs(cache, exist_ok=True)
    f = os.path.join(cache, f"{kind}-{VERSION}.npz")
    if os.path.exists(f):
        z = np.load(f)
        return z["x"], float(z["L"])
    x, L = render_phrase(kind)
    np.savez(f, x=x.astype(np.float32), L=L)
    return x.astype(np.float32), L


def compose(ctx):
    sr, N = ctx["sr"], ctx["n"]
    assert sr == SR, "music.py 按 48 kHz 合成"
    scenes = ctx["scenes"]
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    out = np.zeros((2, N), dtype=np.float32)
    plan = {"open": "intro", "nosql": "story", "whole": "calmA", "insert": "calmB", "flush": "calmA", "find": "calmB",
            "update": "calmA", "delete": "calmB", "concur": "tension", "crash": "dark", "five": "resolve", "trade": "resolve", "credits": "resolve"}
    segs = []
    for i, s in enumerate(scenes):
        a, b = s["start"], (scenes[i + 1]["start"] if i + 1 < len(scenes) else s["end"])
        segs.append([plan.get(s["id"], "calmA"), a, b])
    # 片名换成最高处；片尾从「这个系列的最后一站」起换成最高处，一直延到名单结束
    if "oT" in cue:
        t = cue["oT"]["start"] - 1.0
        segs = [[k, a, min(b, t) if k == "intro" else b] for k, a, b in segs]
        segs.insert(1, ["peak", t, scenes[1]["start"] + 1.5])
    if "j13" in cue:
        t = cue["j13"]["start"] - 0.5
        segs = [[k, a, min(b, t)] if a < t else [k, a, b] for k, a, b in segs if a < t]
        segs.append(["peak", t, scenes[-1]["end"]])

    def lay(kind, a, b, fin, fout):
        x, L = phrase(kind)
        i0, i1 = int(a * SR), min(N, int((b + fout) * SR))
        if i1 <= i0:
            return
        seg = np.zeros((2, i1 - i0), dtype=np.float32)
        k = 0
        while k * L < (i1 - i0) / SR:
            j = int(k * L * SR)
            m = min(x.shape[1], seg.shape[1] - j)
            seg[:, j:j + m] += x[:, :m]
            k += 1
        env = np.ones(seg.shape[1], dtype=np.float32)
        nf = int(fin * SR)
        if nf: env[:nf] = np.linspace(0, 1, nf)
        no = int(fout * 2 * SR)
        if no: env[-no:] *= np.linspace(1, 0, no)
        out[:, i0:i1] += seg * env

    for idx, (kind, a, b) in enumerate(segs):
        lay(kind, a, b, 0.0 if idx == 0 else 1.2, 1.5)
    return out
