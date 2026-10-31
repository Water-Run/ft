# 本片配乐「巴洛克脉冲」：早期计算机用脉冲音奏一段创意曲式的对位（策划者 2026-10-31 从三段 Demo 里选定 A）。
# 由 kit/tools/mix.py 调用：compose(ctx) 返回 (2, N) 的数组；电平、旁白压低与限幅由 mix.py 统一处理。
#   ctx: { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: project.json 的 audio 段 }
# 设计：
#   - 104 拍/分，D 小调。和声沿五度圈模进：Dm – Gm – C – F – Bb – E° – A – Dm，一小节一个和弦（config.js 的 BEAT 与此同拍）。
#   - 动机：前两拍十六分音符 0 1 2 3 1 2 0 4（以和弦根音为 0 的音阶级数），后两拍八分音符 7 4 5 2 回落。主奏是 25% 占空比的脉冲波。
#   - 低音：三角波四分音符 根–五–八–五。继电器的滴答每拍一下，是全片的「机器在走」。
#   - 编排跟着场景走：open 里先只有滴答与低音（芯片、ENIAC），讲到 1945 年的报告时动机在低八度进来；
#     program 动机回到中音区；cycle 高八度并加众赞歌式第二声部，「几十亿圈」处加三角波分解和弦；
#     bottleneck 前半段和弦停在属音上、主奏只剩每小节一个音（堵住了），加缓存之后恢复，结论处终止在 Dm；片尾一个长和弦。
#   - 全程一层很弱的唱片底噪，与配音的老式处理（tools/vintage_voice.py）同一个年代感。
# 制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
import numpy as np

BPM = 104.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FADE = (0.05, 1.6)
SEQ = [0, 3, 6, 2, 5, 1, 4, 0]                 # 和弦根音的音阶级数（D 小调）：Dm Gm C F Bb E° A Dm
MOTIF16 = [0, 1, 2, 3, 1, 2, 0, 4]
MOTIF8 = [7, 4, 5, 2]
STEPS = [0, 2, 3, 5, 7, 8, 10]
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)


def note(deg, chord, octv=0):
    o, d = divmod(chord + deg, 7)
    m = 62 + 12 * (octv + o) + STEPS[d]
    if chord % 7 == 4 and (m - 62) % 12 == 10:  # 属和弦上 C 升为 C#
        m += 1
    return m


def compose(ctx):
    SR, N = ctx["sr"], ctx["n"]
    rng = np.random.default_rng(1945)
    sc = {s["id"]: s for s in ctx["scenes"]}
    cue = {c["id"]: c for c in ctx.get("cues", [])}
    L = np.zeros(N); R = np.zeros(N)

    def add(t0, sig, g, pan=0.0):
        i = int(round(t0 * SR))
        if i >= N or i + len(sig) <= 0:
            return
        if i < 0:
            sig = sig[-i:]; i = 0
        sig = sig[:N - i] * g
        L[i:i + len(sig)] += sig * np.cos((pan + 1) * np.pi / 4)
        R[i:i + len(sig)] += sig * np.sin((pan + 1) * np.pi / 4)

    def env(n, a, d, s, r):
        a, d, r = max(int(a * SR), 1), max(int(d * SR), 1), max(int(r * SR), 1)
        e = np.concatenate([np.linspace(0, 1, a), np.linspace(1, s, d), np.full(max(n - a - d, 0), s)])[:n]
        return np.concatenate([e, np.linspace(e[-1] if len(e) else s, 0, r)])

    def pulse(f, dur, duty=0.25, harm=24):
        n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
        for k in range(1, int(min(harm, (SR / 2.2) / f)) + 1):
            out += (2 / (k * np.pi)) * np.sin(k * np.pi * duty) * np.cos(2 * np.pi * k * f * t)
        return out

    def tri(f, dur):
        n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
        for k in range(1, int((SR / 2.2) / f) + 1, 2):
            out += ((-1) ** ((k - 1) // 2)) / k ** 2 * np.sin(2 * np.pi * k * f * t)
        return out * 8 / np.pi ** 2

    def click(tone):
        n = int(0.025 * SR); t = np.arange(n) / SR
        return rng.uniform(-1, 1, n) * np.exp(-t * 260) * 0.5 + np.sin(2 * np.pi * tone * t) * np.exp(-t * 180) * 0.6

    def voice(kind, f, dur, g, pan, a=0.003, d=0.05, s=0.7, r=0.02, duty=0.25):
        e = env(int(dur * SR), a, d, s, r)                     # 包络含释音段，音源按同样长度生成，结尾不爆音
        sig = (tri(f, len(e) / SR + 0.001) if kind == "tri" else pulse(f, len(e) / SR + 0.001, duty))[:len(e)]
        add(t_cur[0], sig * e[:len(sig)], g, pan)

    t_cur = [0.0]
    def at(t):
        t_cur[0] = t

    # 场景时刻
    s_prog, s_cyc, s_bot, s_cr = sc["program"]["start"], sc["cycle"]["start"], sc["bottleneck"]["start"], sc["credits"]["start"]
    t_report = cue["a1"]["start"] if "a1" in cue else 17.7
    t_spin = cue["c5"]["start"] + 2.6 if "c5" in cue else 77.5
    t_spin_end = cue["c5"]["end"] + 0.25 if "c5" in cue else 79.5
    t_jam0 = cue["d1"]["start"] if "d1" in cue else s_bot
    t_cache = cue["d4"]["start"] if "d4" in cue else s_bot + 11
    t_end = cue["d6"]["end"] if "d6" in cue else s_cr - 3.5
    n_bars = int(np.ceil(ctx["total"] / BAR)) + 1
    # 结论终止：d6 说完后的第一个小节线落在主和弦上
    k_final = int(np.ceil((t_end - 0.2) / BAR))

    for k in range(n_bars):
        t0 = k * BAR
        if t0 >= ctx["total"]:
            break
        mid = t0 + BAR / 2
        chord = SEQ[k % 8]
        if k_final - 1 <= k <= k_final:
            chord = 4 if k == k_final - 1 else 0
        jam = t_jam0 <= mid < t_cache
        if jam:
            chord = 4                           # 堵住：一直停在属和弦上，等不到解决
        if k > k_final:
            # 结论之后（含片尾）：一个长的主和弦，慢慢消失
            if k == k_final + 1:
                for d_, g in ((0, 0.16), (2, 0.11), (4, 0.11), (7, 0.08)):
                    at(t0); voice("pulse", hz(note(d_, 0, 0 if d_ else -1)), 3 * BAR, g, -0.2 + d_ * 0.08, a=0.02, d=0.8, s=0.45, r=1.5, duty=0.125)
                at(t0); voice("tri", hz(note(0, 0, -2)), 3 * BAR, 0.4, 0, a=0.01, d=0.6, s=0.55, r=1.5)
                for j in range(3):
                    add(t0 + j * BAR, click(2400), 0.12, 0.5)
            continue
        # ── 继电器滴答：每拍一下，第一拍高一点 ──
        for j in range(4):
            add(t0 + j * BEAT, click(2400 if j == 0 else 1600), 0.15 if j == 0 else 0.09, 0.5)
        if jam:
            for j in (1, 3):                    # 堵住时多一声错拍的滴答，像在原地空转
                add(t0 + j * BEAT + BEAT / 2, click(1200), 0.06, -0.5)
        # ── 低音 ──
        if jam:
            for j in range(4):
                at(t0 + j * BEAT); voice("tri", hz(note(0, 4, -2)), BEAT * 0.9, 0.42, -0.2, d=0.1, s=0.6, r=0.05)
        else:
            for j, d_ in enumerate([0, 4, 7, 4]):
                at(t0 + j * BEAT); voice("tri", hz(note(d_, chord, -2)), BEAT * 0.9, 0.42, -0.2, d=0.1, s=0.6, r=0.05)
        # ── 主奏 ──
        if t0 + 0.01 < t_report - BAR * 0.5:
            continue                            # 芯片、片名、ENIAC：只有滴答与低音
        if jam:
            at(t0); voice("pulse", hz(note(4, 4, 1)), BEAT * 0.8, 0.16, 0.15, d=0.1, s=0.5, r=0.1)
            continue
        octv = -1 if t0 < s_prog - 0.5 else (0 if t0 < s_cyc - 0.5 else 1)
        if t0 >= t_cache - 0.5:
            octv = 0
        for j, d_ in enumerate(MOTIF16):
            at(t0 + j * BEAT / 4); voice("pulse", hz(note(d_, chord, octv)), BEAT / 4 * 0.85, 0.2, 0.15)
        for j, d_ in enumerate(MOTIF8):
            at(t0 + 2 * BEAT + j * BEAT / 2); voice("pulse", hz(note(d_, chord, octv)), BEAT / 2 * 0.85, 0.2, 0.15, d=0.08, s=0.65, r=0.03)
        # ── 第二声部：cycle 起，和弦三音、五音的二分音符（窄脉冲，众赞歌式）──
        if t0 >= s_cyc - 0.5:
            for j, d_ in enumerate([2, 4]):
                at(t0 + j * 2 * BEAT); voice("pulse", hz(note(d_, chord, 0)), 2 * BEAT * 0.95, 0.11, -0.35, a=0.02, d=0.2, s=0.6, r=0.1, duty=0.125)
        # ── 「几十亿圈」：三角波八分音符分解和弦，像数据流 ──
        if t_spin - BAR < t0 < t_spin_end:
            for j in range(8):
                at(t0 + j * BEAT / 2); voice("tri", hz(note([0, 2, 4, 7, 9, 7, 4, 2][j], chord, 1)), BEAT / 2 * 0.6, 0.1, 0.45, a=0.002, d=0.04, s=0.4, r=0.02)

    st = np.stack([L, R])
    # 短房间混响（固定种子的噪声脉冲响应）
    n_ir = int(1.4 * SR); t = np.arange(n_ir) / SR
    ir = np.random.default_rng(7).normal(0, 1, n_ir) * np.exp(-t * 6.9 / 1.4); ir[:int(0.012 * SR)] = 0; ir /= np.sqrt(np.sum(ir ** 2))
    M = 1 << int(np.ceil(np.log2(N + n_ir)))
    IR = np.fft.rfft(ir, M)
    for c in range(2):
        wet = np.fft.irfft(np.fft.rfft(st[c], M) * IR, M)[:N]
        st[c] = st[c] * 0.82 + wet * 0.11
    # 唱片底噪：很弱的粉噪加稀疏的爆豆声，全程一样
    white = np.random.default_rng(1951).normal(0, 1, N)
    pink = np.fft.irfft(np.fft.rfft(white) / np.sqrt(np.maximum(np.arange(N // 2 + 1), 1)), N)
    pink /= np.max(np.abs(pink)) + 1e-9
    crackle = np.zeros(N)
    pos = np.random.default_rng(1952).integers(0, N, int(ctx["total"] * 6))
    crackle[pos] = np.random.default_rng(1953).uniform(-1, 1, len(pos))
    crackle = np.convolve(crackle, np.exp(-np.arange(int(0.002 * SR)) / (0.0004 * SR)), "same")
    peak = np.max(np.abs(st)) + 1e-9
    st += (pink * 0.012 + crackle * 0.05) * peak
    return st
