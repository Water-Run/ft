# 本片配乐「分支与合并」：策划者 2026-11-16 在审片页选定小样 B（README「简报」「设计」）。程序合成，只用 numpy；固定种子，重跑结果相同。
# 由 kit/tools/mix.py 调用（project.json 的 audio.music 写 "tools/music.py"）：compose(ctx) 返回 (2, N) 的数组，电平、旁白压低与首尾淡入淡出由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: project.json 的 audio 段, lang }
# 音乐自己演本片的过程，落点取自旁白的句号（改了文案或配音，重新混音时自动跟着走）：
#   开场 —— 一支马林巴（主线）独奏，片名卡（开场最后一句旁白之后）一声钟片；
#   b1「点 Fork」—— 第二支（颤音琴）进来，先逐音照抄主线、晚一个八分音符：复制出来的副本；
#   b3「开一条分支」—— 第二支改走反向的线：分开的工作线，主线照旧；
#   b8「请你拉取」—— 第二支收小，让「PR 是申请」这句话留在前面；
#   b13「点合并」—— 两支在这一拍并成同度（第二支低八度），钟片落在这一拍：合并；
#   编号与边界 —— 减配器，只留合并后的一条线与摇铃；
#   e1（audio.score.lift_cue）—— 结论抬起：低音与铺底回来，钟片；片尾只留铺底与最后一个和弦。
# 80 拍/分，一拍 0.75 秒、一小节 3 秒，拍点都落在 0.25 秒的网格上（系列约定）；事件就近吸到拍上，旋律按全片的八分音符计数，换段不断句。
# D 大调：Dmaj7 – Bm7 – Gmaj7 – A7sus，每小节一个和弦。史诗感收着用：没有鼓、铜管与合唱。
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 80.0
B = 60.0 / BPM          # 一拍 0.75 秒
E = B / 2               # 八分音符 0.375 秒
BAR = 4 * B             # 一小节 3 秒
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
CHORDS = [[50, 57, 61, 66], [47, 54, 57, 62], [43, 50, 54, 59], [45, 52, 55, 62]]     # Dmaj7  Bm7  Gmaj7  A7sus
ROOTS = [38, 35, 31, 33]
LINE1 = [74, 76, 78, 81, 78, 76, 74, 69]       # 主线
LINE2 = [69, 71, 74, 78, 76, 74, 71, 66]       # 分支：同一形状换成和声里的另一条路，反着走


def compose(ctx):
    SR, N = ctx["sr"], ctx["n"]
    rng = np.random.default_rng(2026)
    scenes = {s["id"]: s for s in ctx.get("scenes", [])}
    cues = {c["id"]: c for c in ctx.get("cues", [])}
    spec = (ctx.get("audio") or {}).get("score") or {}
    tt = lambda d: np.arange(int(d * SR)) / SR
    snap = lambda t: round(t / B) * B

    def at(cid, scene=None, end=False, dflt=None):   # 句号的时刻；句号不在（改了文案）就退到场景的开头
        if cid in cues: return cues[cid]["end" if end else "start"]
        if scene in scenes: return scenes[scene]["start"]
        return dflt

    total = ctx["total"]
    t_what = scenes.get("what", {}).get("start", 15.0)
    t_title = snap(max([c["end"] for c in cues.values() if c["start"] < t_what] or [10.0]) + 0.4)   # 片名卡：开场最后一句说完
    t_fork = snap(at("b1", "how", dflt=40.0))
    t_branch = snap(at("b3", "how", dflt=48.0))
    t_pr0, t_pr1 = at("b8", "how", dflt=66.0), at("b9", "how", end=True, dflt=72.0)
    t_merge = snap(at("b13", "numbers", dflt=85.0) + 1.0)
    t_num = scenes.get("numbers", {}).get("start", t_merge + 6)
    t_close = scenes.get("close", {}).get("start", total - 26)
    t_lift = snap(at(spec.get("lift_cue", "e1"), "close", dflt=total - 24) + 0.2)
    t_out = scenes.get("outro", {}).get("start", total - 7.5)

    dry = np.zeros((2, N)); wet = np.zeros((2, N))

    def put(sig, t, g=1.0, pan=0.0, send=0.3):
        i = int(round(t * SR))
        if g <= 0 or i < 0 or i >= N: return
        j = min(N, i + len(sig)); s = sig[: j - i] * g
        l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
        dry[0, i:j] += s * l; dry[1, i:j] += s * r; wet[0, i:j] += s * l * send; wet[1, i:j] += s * r * send

    def env(n, a=0.004, r=0.05):
        e = np.ones(n); na, nr = max(1, int(a * SR)), max(1, int(r * SR))
        e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e

    def marimba(f, d=1.3):
        x = tt(d); s = np.zeros_like(x)
        for ratio, amp, dec in ((1, 1, 3.2), (3.93, 0.32, 10), (9.2, 0.1, 24)):
            s += np.sin(2 * np.pi * f * ratio * x) * amp * np.exp(-x * dec)
        return s * env(len(x), 0.002) * 0.55

    def vibes(f, d=2.0):
        x = tt(d)
        s = np.sin(2 * np.pi * f * x) * np.exp(-x * 1.1) + 0.22 * np.sin(2 * np.pi * f * 4 * x) * np.exp(-x * 5)
        return s * (1 - 0.22 * (0.5 + 0.5 * np.sin(2 * np.pi * 5.2 * x))) * env(len(x), 0.003, 0.2) * 0.45

    def bell(f, d=3.0):
        x = tt(d); s = np.zeros_like(x)
        for ratio, amp, dec in ((1, 1, 1.4), (2.76, 0.45, 2.4), (5.4, 0.2, 3.8), (8.93, 0.08, 6)):
            s += np.sin(2 * np.pi * f * ratio * x) * amp * np.exp(-x * dec)
        return s * env(len(x), 0.002, 0.3) * 0.3

    def pad(freqs, d, bright=0.76):
        x = tt(d); s = np.zeros_like(x)
        for f in freqs:
            for det in (-0.0028, 0.0031):
                for k in range(1, 10):
                    if f * k > 6000: break
                    s += np.sin(2 * np.pi * f * (1 + det) * k * x + k * 0.7) * (bright ** k) / k
        return s / len(freqs) * env(len(x), min(1.2, d / 3), min(1.2, d / 3)) * 0.32

    def sub(f, d):
        x = tt(d)
        return (np.sin(2 * np.pi * f * x) + 0.18 * np.sin(4 * np.pi * f * x)) * env(len(x), 0.012, 0.09) * 0.6

    def shaker():
        x = tt(0.08); n = np.diff(np.diff(rng.standard_normal(len(x) + 2)))
        return n * np.exp(-x * 55) * env(len(x), 0.006, 0.02) * 0.07

    # ── 铺底与低音：每小节一个和弦 ──
    for bar in range(int(np.ceil(total / BAR)) + 1):
        t0 = bar * BAR
        if t0 >= total: break
        ch = CHORDS[bar % 4]
        g = 0.35 if t0 < t_title else 0.45 if t0 < t_fork else 0.5
        if t0 >= t_out: g = 0.55
        put(pad([hz(n) for n in ch], BAR + 0.6, 0.8 if t_lift <= t0 < t_out else 0.74), t0, g, send=0.5)
        in_sub = (t_fork <= t0 < t_num) or (t_lift - 0.01 <= t0 < t_out)
        if in_sub: put(sub(hz(ROOTS[bar % 4]), BAR * 0.9), t0, 0.4, send=0.0)
        if t_num <= t0 < t_out:                        # 编号、边界、结论：摇铃，反拍
            for i in range(4): put(shaker(), t0 + i * B + E, 0.8 if i % 2 else 0.5, pan=0.3, send=0.1)

    # ── 两支旋律：按全片的八分音符计数 ──
    tail = total - t_out                               # 片尾名单的长度（r2 起 4 秒）
    end_lines = t_out + min(BAR, tail * 0.4)
    k = 0
    while k * E < end_lines:
        t = k * E; bar = int(t // BAR); i = k % 8
        n1 = LINE1[i] - (2 if bar % 2 and i in (2, 3) else 0)
        g1 = (0.5 if i % 2 == 0 else 0.36) * (0.8 if t < t_title else 1.0) * (0.75 if t_num <= t < t_lift else 1.0) * (0.6 if t >= t_out else 1.0)
        merged = t >= t_merge
        put(marimba(hz(n1)), t, g1, pan=-0.05 if merged else -0.35, send=0.3)
        if t >= t_fork:
            if merged:
                n2, g2, pan2 = n1 - 12, 0.4, 0.05
            elif t < t_branch:                         # 副本：同一句，晚一个八分音符
                n2, g2, pan2 = LINE1[(i - 1) % 8] - (2 if bar % 2 and (i - 1) % 8 in (2, 3) else 0), 0.34, 0.4
            else:                                      # 分支：反向的另一条线
                n2, g2, pan2 = LINE2[(7 - i) % 8], 0.38, 0.4
            if t_pr0 <= t < t_pr1: g2 *= 0.55
            if t_num <= t < t_lift: g2 *= 0.75
            if t >= t_out: g2 *= 0.6
            put(vibes(hz(n2)), t, g2, pan=pan2, send=0.35)
        k += 1

    # ── 钟片：片名卡、合并、结论各一声；片尾最后一个和弦 ──
    put(bell(hz(86)), t_title, 0.45, send=0.6)
    put(bell(hz(86)), t_merge, 0.55, send=0.6); put(bell(hz(81)), t_merge + B, 0.3, send=0.6)
    put(bell(hz(86)), t_lift, 0.45, send=0.6)
    t_end = snap(t_out + min(2 * BAR, tail * 0.4))      # 最后一个和弦：名单短时提前落下，留出余音
    if t_end < total - 0.5:
        put(marimba(hz(74), 2.5), t_end, 0.5, send=0.4); put(vibes(hz(62), 3.0), t_end, 0.45, send=0.4)
        put(pad([hz(n) for n in [50, 57, 62, 66, 69]], total - t_end + 0.5), t_end, 0.5, send=0.6)

    # ── 混响：衰减的噪声，频域低通，两声道去相关 ──
    out = dry.copy(); room = 2.6
    for ch in range(2):
        ir = rng.standard_normal(int(room * SR)) * np.exp(-tt(room) * (6.9 / room))
        L = 1 << int(np.ceil(np.log2(N + len(ir))))
        f = np.fft.rfftfreq(L, 1 / SR)
        irf = np.fft.rfft(ir, L) / (1 + (f / 4200.0) ** 2)
        irf /= np.sqrt(np.sum(np.abs(irf) ** 2) / L) + 1e-9
        out[ch] += np.fft.irfft(np.fft.rfft(wet[ch], L) * irf, L)[:N] * 0.035
    return out
