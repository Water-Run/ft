# 正式配乐：C「流明」（策划者 2026-11-21 选定：「配乐用流明」）。112 BPM，E 小调（Em9 → Cmaj9 → D6/9 → Bm7）。
# 音色与做法沿用审片页小样（tools/music_demo.py 的 demo_c）：侧链呼吸的超锯齿铺底、十六分 FM 琶音（滤波逐渐打开、后半拍上翻八度）、
# 反拍次低音、轻底鼓与镲、乒乓延迟与按频率衰减的混响。这里按本片时间线编排：各层的进出跟着场景走，每章从和弦循环开头重起，
# 章节卡落在强拍上并留一小节「换气」；开场只有铺底与空气，四种模式与通用增强最满，结尾整体退回空间。
# 由 kit/tools/mix.py 调用：compose(ctx) 返回 (2, N)。结果确定：随机数都用固定种子。
import os, sys, importlib.util
import numpy as np

_here = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('dshu_music_demo', os.path.join(_here, 'music_demo.py'))
D = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(D)

BPM = 112
CH = [[52, 59, 62, 66, 71], [48, 55, 59, 62, 67], [50, 57, 62, 64, 69], [47, 54, 59, 62, 66]]   # Em9 Cmaj9 D6/9 Bm7
ORDER = [0, 2, 3, 4, 2, 3, 1, 3]
CHAPS = {'box', 'modes', 'asides'}   # 有章节卡的场景（与 script.js 的 chap 一致）：章节卡那一小节只留铺底
# 各场景的层次：铺底、琶音、琶音上翻八度、次低音、底鼓、镲（0–1）
LAYERS = {
    'open':     (1.0, 0.0, 0.0, 0.35, 0.0, 0.0),
    'box':      (1.0, 0.7, 0.0, 0.6, 0.0, 0.0),
    'modes':    (1.0, 0.9, 0.0, 0.8, 0.6, 0.5),
    'default':  (1.0, 1.0, 0.0, 0.9, 0.8, 0.7),
    'security': (1.0, 1.0, 1.0, 1.0, 0.9, 0.8),
    'reverse':  (1.0, 1.0, 1.0, 1.0, 0.9, 0.8),
    'writing':  (1.0, 0.8, 0.0, 0.7, 0.0, 0.3),
    'asides':   (1.0, 0.9, 0.0, 0.8, 0.6, 0.5),
    'spend':    (1.0, 1.0, 1.0, 1.0, 0.9, 0.8),
    'memory':   (1.0, 0.7, 0.0, 0.6, 0.0, 0.3),
    'outro':    (1.0, 1.0, 1.0, 1.0, 0.7, 0.6),
    'credits':  (0.7, 0.3, 0.0, 0.0, 0.0, 0.0),
}

def compose(ctx):
    sr, total = ctx['sr'], ctx['total']
    if sr != D.SR:   # 小样按 44.1 kHz 写，混音是 48 kHz：改模块的采样率并重算频率表（STFT 滤波与混响都按它算）
        D.SR = sr; D.FREQ = np.fft.rfftfreq(D.N_FFT, 1 / sr); D._IRS.clear()
    b = 60 / BPM; bar = 4 * b
    n = int((total + 6) * sr)
    PL, PR, AR, S, K, HT, RM = (np.zeros(n) for _ in range(7))
    scenes = ctx['scenes']
    # 每个场景的起点对齐到小节；有章节卡的场景：章节卡那一小节只留铺底（换气）
    starts = [(round(s['start'] / bar), s) for s in scenes]
    def scene_at(k):
        cur = starts[0]
        for st in starts:
            if st[0] <= k: cur = st
        return cur
    bars = int(np.ceil(total / bar)) + 1
    arp_bars = []
    for k in range(bars):
        k0, sc = scene_at(k); lay = LAYERS.get(sc['id'], LAYERS['modes'])
        rel = k - k0; c = CH[(rel // 2) % 4]; t0 = k * bar
        breath = sc['id'] in CHAPS and rel < 1
        if rel % 2 == 0 and lay[0] > 0:                       # 铺底：两小节一个和弦，每章从 Em9 起
            for j, nn in enumerate(c[1:]):
                l, r = D.supersaw(D.midi(nn), 2 * bar, voices=7, spread=0.1, seed=200 + k * 5 + j, a=0.8, r=2)
                D.put(PL, l, t0, 0.2 * lay[0]); D.put(PR, r, t0, 0.2 * lay[0])
        if breath: continue
        if lay[1] > 0:                                        # 十六分琶音
            arp_bars.append(k)
            for s16 in range(16):
                nn = c[ORDER[s16 % 8]] + 12 + (12 if (s16 // 8) % 2 and lay[2] > 0 else 0)
                D.put(AR, D.fm_bell(D.midi(nn), 0.1, ratio=1.0, index=2.5, decay=0.22, seed=k), t0 + s16 * b / 4, (0.12 if s16 % 4 == 0 else 0.07) * lay[1])
        if lay[3] > 0:                                        # 反拍次低音
            for q in range(4): D.put(S, D.sub(D.midi(c[0] - 12), b * 0.9), t0 + q * b + b / 2, 0.45 * lay[3])
        if lay[4] > 0:                                        # 底鼓
            for q in range(4): D.put(K, D.kick(0.8), t0 + q * b, 0.6 * lay[4])
        if lay[5] > 0:                                        # 镲与反拍的轻响
            for e8 in range(8): D.put(HT, D.hat(500 + k * 8 + e8, 0.04, 8000), t0 + e8 * b / 2, (0.05 if e8 % 2 else 0.025) * lay[5])
            D.put(RM, D.hat(900 + k, 0.08, 2500), t0 + 3.5 * b, 0.12 * lay[5])
    # 侧链：有底鼓的小节铺底随拍呼吸得深，其余浅
    kicks = [k * bar + q * b for k in range(bars) for q in range(4) if not (scene_at(k)[1]['id'] in CHAPS and k - scene_at(k)[0] < 1) and LAYERS.get(scene_at(k)[1]['id'], LAYERS['modes'])[4] > 0]
    g = D.duck(n, kicks, 0.55)
    gp = D.duck(n, [i * b for i in range(int(total / b) + 4)], 0.22)
    # 琶音的滤波：开场后逐渐打开，结尾收回
    fc_p = lambda t: 900 + 2500 * np.clip((t - 2) / 20, 0, 1)
    fc_a = lambda t: 700 + 4800 * np.clip((t - 16) / 50, 0, 1) ** 1.2 * (1 - 0.6 * np.clip((t - (total - 22)) / 14, 0, 1))
    PL, PR = D.filt(PL, fc_p, q=0.5) * g * gp, D.filt(PR, fc_p, q=0.5) * g * gp
    AR = D.filt(AR, fc_a, q=0.8)
    dL, dR = D.pingpong(AR, 0.75 * b, fb=0.45, taps=6)
    A = D.air(n, 9, 3000, 10000, 9.0) * 0.008
    send = PL + PR + AR + 0.6 * (dL + dR) + RM
    rL, rR = D.reverb(send, 'lumen', seconds=5, t_low=4.2, t_high=1.2, bright=8000)
    L = 0.8 * PL + 1.0 * AR + 0.5 * dL + 0.32 * S + 0.6 * K + 1.3 * HT + 0.3 * RM + 0.55 * rL + 4.0 * A
    R = 0.8 * PR + 1.0 * AR + 0.5 * dR + 0.32 * S + 0.6 * K + 1.3 * np.roll(HT, 400) + 0.3 * RM + 0.55 * rR + 4.0 * np.roll(A, 1700)
    # 整体的起伏：开场轻，结尾标语处最后一次抬起，片尾名单退回空间
    sc_t = {s['id']: s for s in scenes}
    arc = [(0, 0.75), (sc_t['open']['end'], 0.8), (sc_t['modes']['start'], 0.85), (sc_t['asides']['start'], 0.9), (sc_t['outro']['start'], 0.95), (sc_t['outro']['end'] - 4, 1.0), (sc_t['credits']['start'] + 2, 0.6), (total + 6, 0.3)]
    gg = D.curve(n, arc)
    out = np.stack([L * gg, R * gg])[:, :ctx['n']]
    if out.shape[1] < ctx['n']: out = np.pad(out, ((0, 0), (0, ctx['n'] - out.shape[1])))
    return out
