"""本片的配乐：compose(ctx) 由 kit/tools/mix.py 调用（project.json 的 audio.music 指向本文件），返回 (2, N) 的数组。

全部由本文件合成，不用采样或现成乐曲。方向是严肃的工业风：D 小调，72 拍/分。
WaterRun 反馈（2026-10-19，P27）：InnoDB、OpenCart 的配乐太弱，MyISAM 那样一直在、有分量的铺底才对。
所以这一版以「持续的底」为主，旋律为辅：
  - 低音铺底：根音的正弦 + 柔和锯齿（低通），整小节持续，章与章之间不断；这是 MyISAM 那种分量的来源。
  - 弦乐垫：三个声部各三层失谐，再加低八度，慢起慢收，每两小节换和弦（Dm – B♭ – F – C；章末 Gm – A）。
  - 机械脉冲：讲机制的章节（02–07）每拍一记低沉的「心跳」，每半拍一记很轻的金属声（高通的短噪声），像机器在稳定运转；
    历史与比较章节只留心跳的第一拍；开场与片尾不用。
  - 钢琴：每小节第一拍一个单音，四音动机 D–A–F–E（停在不解决的 E 上），片尾落回主音 D。
  - 每章开头一声低八度的钢琴与定音鼓式的低频落点；崩溃那一句（w10）全体停一拍，重启后再起。
随机数用固定种子。制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
"""
import numpy as np

A4 = 440.0
BPM = 72.0
BEAT = 60.0 / BPM
BAR = BEAT * 4


def hz(m):
    return A4 * 2.0 ** ((m - 69) / 12.0)


CH = {
    'Dm': ([62, 65, 69], 38), 'Bb': ([62, 65, 70], 34), 'F': ([60, 65, 69], 41), 'C': ([60, 64, 67], 36),
    'Gm': ([62, 67, 70], 43), 'A': ([61, 64, 69], 33),
}
PROG = ['Dm', 'Dm', 'Bb', 'Bb', 'F', 'F', 'C', 'C']
MOTIF = [74, 69, 65, 64]
MECH = {'storage', 'query', 'modify', 'mvcc', 'maintenance', 'recovery'}


def lowpass(x, sr, fc):
    a = np.exp(-2 * np.pi * fc / sr)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def compose(ctx):
    sr, n = ctx['sr'], ctx['n']
    rng = np.random.default_rng(20261019)
    out = np.zeros((2, n), dtype=np.float64)
    scenes = ctx['scenes']
    cues = {c['id']: c for c in ctx['cues']} if isinstance(ctx['cues'], list) else ctx['cues']
    total = ctx['total']

    def add(sig, t0, pan=0.0, g=1.0):
        i = int(t0 * sr)
        if i >= n or i + len(sig) <= 0:
            return
        a, b = max(0, i), min(n, i + len(sig))
        s = sig[a - i:b - i] * g
        out[0, a:b] += s * np.sqrt(0.5 * (1 - pan))
        out[1, a:b] += s * np.sqrt(0.5 * (1 + pan))

    cache = {}

    def pad_note(m, dur):
        key = ('pad', m, round(dur, 2))
        if key in cache:
            return cache[key]
        t = np.arange(int((dur + 1.4) * sr)) / sr
        sig = np.zeros_like(t)
        for det in (-0.07, 0.0, 0.08):
            ff = hz(m) * 2 ** (det / 12)
            for k in range(1, 8):
                sig += np.sin(2 * np.pi * ff * k * t + rng.uniform(0, 6.28)) / (k ** 1.5)
        att, rel = 0.9, 1.4
        env = np.clip(t / att, 0, 1) * np.clip((dur + rel - t) / rel, 0, 1)
        cache[key] = sig * env * 0.06
        return cache[key]

    def drone(m, dur):
        key = ('drone', m, round(dur, 2))
        if key in cache:
            return cache[key]
        t = np.arange(int((dur + 0.6) * sr)) / sr
        f = hz(m)
        saw = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 10))
        sig = np.sin(2 * np.pi * f * t) * 0.9 + lowpass(saw, sr, 260) * 0.7 + np.sin(2 * np.pi * f / 2 * t) * 0.5
        env = np.clip(t / 0.25, 0, 1) * np.clip((dur + 0.5 - t) / 0.5, 0, 1)
        cache[key] = sig * env * 0.16
        return cache[key]

    def piano(m, dur=3.0, g=1.0):
        t = np.arange(int(dur * sr)) / sr
        f = hz(m)
        sig = sum(np.sin(2 * np.pi * f * k * t) * (0.6 ** (k - 1)) * np.exp(-t * (1.6 + k * 0.9)) for k in range(1, 6))
        return sig * np.clip(t / 0.006, 0, 1) * 0.15 * g

    def thump(g=1.0):
        t = np.arange(int(0.45 * sr)) / sr
        f = 55 * np.exp(-t * 9) + 38
        ph = 2 * np.pi * np.cumsum(f) / sr
        return np.sin(ph) * np.exp(-t * 9) * 0.55 * g

    noise = rng.standard_normal(int(0.08 * sr))
    hp = noise - lowpass(noise, sr, 3500)
    tick = hp * np.exp(-np.arange(len(hp)) / sr * 60) * 0.05

    def boom():
        t = np.arange(int(2.5 * sr)) / sr
        f = 70 * np.exp(-t * 3) + 32
        ph = 2 * np.pi * np.cumsum(f) / sr
        return np.sin(ph) * np.exp(-t * 2.2) * 0.7

    crash = cues.get('w10'), cues.get('w11')
    quiet = (crash[0]['end'] - 0.1, crash[1]['start'] + 0.2) if crash[0] and crash[1] else (-1, -1)
    credit_t = cues['zCredit']['start'] if 'zCredit' in cues else total - 14
    nbar = int(credit_t / BAR) + 1
    for b in range(nbar):
        t0 = b * BAR
        if t0 >= credit_t - 0.3:
            break
        if quiet[0] <= t0 < quiet[1]:
            continue
        sc = next((s for s in scenes if s['start'] <= t0 < s['end']), scenes[-1])
        nearEnd = sc['end'] - t0 < 2 * BAR
        name = ('Gm' if (b % 2 == 0) else 'A') if nearEnd and sc['id'] != 'outro' else PROG[b % len(PROG)]
        notes, root = CH[name]
        dur = min(BAR, credit_t - t0)
        for m in notes:
            add(pad_note(m, dur), t0, pan=rng.uniform(-0.5, 0.5))
        add(pad_note(notes[0] - 12, dur), t0, g=0.8)
        add(drone(root, dur), t0)
        add(piano(MOTIF[b % 4], 3.2), t0, pan=-0.15, g=0.9)
        if sc['id'] in MECH:
            for k in range(4):
                tb = t0 + k * BEAT
                if quiet[0] <= tb < quiet[1]:
                    continue
                add(thump(1.0 if k % 2 == 0 else 0.6), tb)
                add(tick, tb + BEAT / 2, pan=0.3 if k % 2 else -0.3)
        elif sc['id'] not in ('open', 'outro'):
            add(thump(0.7), t0)
    for s in scenes:
        if s['id'] == 'open':
            continue
        add(boom(), s['start'] + 0.1)
        add(piano(50, 4.0, g=1.2), s['start'] + 0.1)
        add(piano(38, 4.0, g=0.9), s['start'] + 0.1)
    # 片尾：动机一遍，落回 D
    for i, m in enumerate(MOTIF + [62]):
        add(piano(m, 4.0, g=1.1), credit_t + 0.4 + i * BAR / 2)
    for m in CH['Dm'][0]:
        add(pad_note(m, max(1.0, total - credit_t - 3.0)), credit_t + 0.2)
    add(drone(38, max(1.0, total - credit_t - 2.5)), credit_t + 0.2)
    add(boom(), credit_t + 0.4 + 4 * BAR / 2)
    fi = int(1.5 * sr); out[:, :fi] *= np.linspace(0, 1, fi)
    fo = int(3.0 * sr); out[:, n - fo:] *= np.linspace(1, 0, fo)
    peak = np.max(np.abs(out)) or 1.0
    return (out / peak * 0.85).astype(np.float32)
