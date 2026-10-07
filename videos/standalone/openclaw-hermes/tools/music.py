"""本片的配乐：compose(ctx) 由 kit/tools/mix.py 调用（project.json 的 audio.music 指向本文件），返回 (2, N) 的数组。

全部由本文件合成，不用任何采样或现成乐曲。各章的音色与节奏有意拉开：
  open     稀疏的钢琴式单音（D 小调，72 拍）
  kind     木质的马林巴八分音符（F 大调，96 拍）—— 中性的讲解
  claw     方波琶音加三角波低音与轻的鼓点（A 小调，112 拍）—— 呼应像素龙虾的 8 位机音色；星标陡增的那几句加一层高八度
  clawi    闷的方波低音与细密的拍点（A 小调，100 拍），偶尔一句五声音阶的短句
  hermes   拨弦（Karplus-Strong）的三连音琶音加钟声（C 小调，84 拍）—— 里拉琴式的音色
  hermesi  同一调：每小节前四个音不变（「前缀」），后半小节变化；低音脉冲
  both     马林巴打底，方波与拨弦逐小节轮流（F 大调，92 拍）
  mini     三角波行走低音与八分的拍点，方波与拨弦短句交替（D 小调，100 拍）
  outro    回到开场的钢琴动机，转 D 大调，加拨弦
各段在场景交界处各自淡入淡出；每段按均方根对齐到相近的响度，讲解密集的两段略低。随机数全部用固定种子。
"""
import numpy as np

FADE = (1.5, 4.0)
A4 = 440.0


def hz(m):
    return A4 * 2.0 ** ((m - 69) / 12.0)


class Synth:
    def __init__(self, sr):
        self.sr = sr
        self.cache = {}
        self.rng = np.random.default_rng(20261007)

    def t(self, dur):
        return np.arange(int(dur * self.sr)) / self.sr

    def env(self, n, a, d):
        """起音 a 秒线性，之后以时间常数 d 指数衰减，末尾 8 ms 收尾。"""
        t = np.arange(n) / self.sr
        e = np.minimum(1.0, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
        k = min(n, int(0.008 * self.sr))
        if k:
            e[-k:] *= np.linspace(1, 0, k)
        return e

    def note(self, kind, m, dur):
        key = (kind, m, round(dur, 3))
        if key not in self.cache:
            self.cache[key] = getattr(self, 'i_' + kind)(hz(m), dur)
        return self.cache[key]

    # ── 音色 ──
    def i_piano(self, f, dur):                    # 钢琴式：基音加几次泛音，高次衰减更快，轻微失谐
        t = self.t(dur); x = np.zeros_like(t)
        for k, g in ((1, 1.0), (2, 0.42), (3, 0.2), (4, 0.1), (5, 0.05)):
            x += g * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (1.1 + 0.9 * k))
        return x * self.env(len(t), 0.006, 3.0)

    def i_mallet(self, f, dur):                   # 马林巴：基音加四倍频的短促敲击
        t = self.t(dur)
        x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 28) + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 60)
        return x * self.env(len(t), 0.002, 1.2)

    def i_square(self, f, dur):                   # 方波（占空比 25%），按泛音叠加到 6 kHz 为止，避免混叠
        t = self.t(dur); x = np.zeros_like(t); k = 1
        while f * k < 6000 and k < 40:
            x += (2 / (k * np.pi)) * np.sin(np.pi * k * 0.25) * np.cos(2 * np.pi * f * k * t); k += 1
        return x * self.env(len(t), 0.003, 0.22)

    def i_sqbass(self, f, dur):                   # 闷的方波低音：只取到 900 Hz
        t = self.t(dur); x = np.zeros_like(t); k = 1
        while f * k < 900:
            x += (1 / k) * np.sin(2 * np.pi * f * k * t) * (1 if k % 2 else 0.25); k += 1
        return x * self.env(len(t), 0.004, 0.18)

    def i_tri(self, f, dur):                      # 三角波低音
        t = self.t(dur); x = np.zeros_like(t)
        for k in (1, 3, 5, 7):
            x += ((-1) ** ((k - 1) // 2)) * np.sin(2 * np.pi * f * k * t) / (k * k)
        return x * self.env(len(t), 0.006, 0.5)

    def i_pluck(self, f, dur):                    # 拨弦：Karplus-Strong（延迟线里的噪声逐圈取平均）
        n = int(dur * self.sr); p = max(2, int(round(self.sr / f)))
        buf = self.rng.uniform(-1, 1, p); buf -= buf.mean()
        reps = n // p + 2; out = np.empty(reps * p); cur = buf
        for i in range(reps):
            out[i * p:(i + 1) * p] = cur
            cur = 0.5 * (cur + np.roll(cur, 1)) * 0.996
        return out[:n] * self.env(n, 0.002, 1.6)

    def i_bell(self, f, dur):                     # 钟声：非整数倍的泛音
        t = self.t(dur); x = np.zeros_like(t)
        for r, g, d in ((1, 1.0, 1.6), (2.76, 0.4, 3.2), (5.4, 0.22, 5.5), (8.93, 0.1, 9.0)):
            x += g * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d)
        return x * self.env(len(t), 0.003, 2.5)

    def i_sub(self, f, dur):
        t = self.t(dur)
        return np.sin(2 * np.pi * f * t) * self.env(len(t), 0.01, 0.35)

    def kick(self):
        if 'kick' not in self.cache:
            t = self.t(0.22); ph = 2 * np.pi * (48 * t + (110 - 48) * 0.035 * (1 - np.exp(-t / 0.035)))
            self.cache['kick'] = np.sin(ph) * np.exp(-t * 16)
        return self.cache['kick']

    def hat(self, long=False):
        key = 'hatl' if long else 'hat'
        if key not in self.cache:
            n = int((0.09 if long else 0.035) * self.sr); x = np.random.default_rng(7 if long else 5).uniform(-1, 1, n)
            x = np.diff(x, prepend=0.0); x = np.diff(x, prepend=0.0)            # 两次差分 = 高通
            self.cache[key] = x / np.abs(x).max() * np.exp(-np.arange(n) / ((0.03 if long else 0.01) * self.sr))
        return self.cache[key]


def put(buf, x, t, g, pan, sr):
    i = int(t * sr)
    if i >= buf.shape[1] or i < 0:
        return
    j = min(buf.shape[1], i + len(x)); x = x[:j - i]
    buf[0, i:j] += x * g * np.cos((pan + 1) * np.pi / 4)
    buf[1, i:j] += x * g * np.sin((pan + 1) * np.pi / 4)


CH = {  # 和弦：根音（MIDI）与音程
    'Dm': (50, (0, 3, 7, 10)), 'Bb': (46, (0, 4, 7, 11)), 'F': (53, (0, 4, 7, 9)), 'C': (48, (0, 4, 7, 10)),
    'Am': (45, (0, 3, 7, 10)), 'G': (43, (0, 4, 7, 9)), 'Cm': (48, (0, 3, 7, 10)), 'Ab': (44, (0, 4, 7, 11)),
    'Eb': (51, (0, 4, 7, 9)), 'Bb2': (46, (0, 4, 7, 9)), 'D': (50, (0, 4, 7, 11)), 'Bm': (47, (0, 3, 7, 10)), 'A': (45, (0, 4, 7, 10)),
}


def tone(ch, i, octv=0):
    root, iv = CH[ch]
    return root + iv[i % len(iv)] + 12 * (i // len(iv)) + 12 * octv


def compose(ctx):
    sr, n = ctx['sr'], ctx['n']
    S = Synth(sr)
    scenes = {s['id']: (s['start'], s['end']) for s in ctx['scenes']}
    cues = {c['id']: c for c in ctx['cues']} if isinstance(ctx['cues'], list) else ctx['cues']
    cue_t = lambda cid, d=0.0: (cues[cid]['start'] if cid in cues else d)
    out = np.zeros((2, n))

    def section(sid, bpm, steps, bars_fn, level=1.0, lead=0.0):
        """sid 场景；steps 每小节的步数；bars_fn(bar, step, t, buf) 在每一步上放音。lead：章节卡之后再起。"""
        if sid not in scenes:
            return
        t0, t1 = scenes[sid]; t0 += lead
        buf = np.zeros((2, int((t1 - t0 + 6) * sr)))
        step = 60.0 / bpm * 4 / steps
        nb = int((t1 - t0) / (step * steps)) + 1
        for b in range(nb):
            for s_ in range(steps):
                t = (b * steps + s_) * step
                if t0 + t < t1 - 0.2:
                    bars_fn(b, s_, t, buf, t0 + t)
        # 段内淡入淡出，与相邻的段在交界处交叠
        m = buf.shape[1]; e = np.ones(m); fi = int(0.9 * sr); fo = int(2.2 * sr); end = int((t1 - t0 + 0.6) * sr)
        e[:fi] = np.linspace(0, 1, fi); e[max(0, end - fo):end] *= np.linspace(1, 0, min(fo, end)); e[end:] = 0
        buf *= e
        r = np.sqrt(np.mean(buf[:, :end] ** 2)) + 1e-9
        buf *= level * 0.1 / r
        i = int(t0 * sr); j = min(n, i + m)
        out[:, i:j] += buf[:, :j - i]

    P = lambda buf, kind, m, dur, t, g, pan=0.0: put(buf, S.note(kind, m, dur), t, g, pan, sr)

    # ── open：钢琴式单音，稀疏 ──
    prog_o = ['Dm', 'Bb', 'F', 'C']
    def f_open(b, s_, t, buf, at):
        ch = prog_o[b % 4]
        if s_ == 0: P(buf, 'piano', tone(ch, 0, -1), 3.0, t, 0.8, -0.15)
        if s_ == 3: P(buf, 'piano', tone(ch, 2, 1), 2.4, t, 0.55, 0.2)
        if s_ == 5: P(buf, 'piano', tone(ch, 1 if b % 2 else 3, 1), 2.4, t, 0.5, 0.05)
        if s_ == 6 and b % 2: P(buf, 'piano', tone(ch, 4, 1), 2.0, t, 0.4, 0.3)
    section('open', 72, 8, f_open, 1.0)

    # ── kind：马林巴 ──
    prog_k = ['F', 'Dm', 'Bb', 'C']
    def f_kind(b, s_, t, buf, at):
        ch = prog_k[b % 4]; pat = (0, 2, 1, 2, 4, 2, 1, 2)
        P(buf, 'mallet', tone(ch, pat[s_], 1), 0.9, t, 0.75 if s_ % 4 == 0 else 0.45, -0.25 + 0.07 * s_)
        if s_ == 0: P(buf, 'tri', tone(ch, 0, -1), 1.2, t, 0.6)
        if s_ == 6 and b % 4 == 3: P(buf, 'mallet', tone(ch, 5, 1), 0.9, t, 0.5, 0.3)
    section('kind', 96, 8, f_kind, 1.0, lead=1.2)

    # ── claw：方波琶音、三角波低音、轻的鼓点；星标陡增时加高八度 ──
    prog_c = ['Am', 'F', 'C', 'G']
    boom0, boom1 = cue_t('c6', 1e9), cue_t('c9', 1e9)
    def f_claw(b, s_, t, buf, at):
        ch = prog_c[b % 4]; pat = (0, 1, 2, 4, 2, 1, 2, 4, 0, 2, 1, 4, 2, 1, 4, 2)
        hot = boom0 - 0.5 <= at < boom1 - 0.5
        if s_ % 2 == 0 or hot: P(buf, 'square', tone(ch, pat[s_], 1), 0.3, t, 0.5 if s_ % 4 == 0 else 0.34, -0.3 if s_ % 2 else 0.3)
        if hot and s_ % 4 == 2: P(buf, 'square', tone(ch, pat[(s_ + 5) % 16], 2), 0.3, t, 0.22, 0.0)
        if s_ % 4 == 0: P(buf, 'tri', tone(ch, 0, 0), 0.5, t, 0.5)
        if s_ in (0, 8) or (hot and s_ == 6): put(buf, S.kick(), t, 0.38, 0, sr)
        if s_ % 4 == 2: put(buf, S.hat(), t, 0.16, 0.2, sr)
    section('claw', 112, 16, f_claw, 1.1, lead=1.2)

    # ── clawi：闷的方波低音与拍点，偶尔一句短句 ──
    prog_i = ['Am', 'Am', 'F', 'G']; penta = (57, 60, 62, 64, 67, 69, 72)
    def f_clawi(b, s_, t, buf, at):
        ch = prog_i[b % 4]
        if s_ % 2 == 0: P(buf, 'sqbass', tone(ch, 0, 0) + (7 if s_ == 12 else 0), 0.3, t, 0.5 if s_ % 8 == 0 else 0.32)
        if s_ % 2 == 1: put(buf, S.hat(), t, 0.13, 0.25 if s_ % 4 == 1 else -0.25, sr)
        if s_ == 8: put(buf, S.hat(True), t, 0.12, 0, sr)
        if b % 2 == 1 and s_ in (0, 3, 6, 10): P(buf, 'square', penta[(b * 3 + s_) % 7], 0.3, t, 0.3, 0.3 - 0.06 * s_)
        if b % 2 == 0 and s_ in (4, 12): P(buf, 'mallet', tone(ch, 2 if s_ == 4 else 4, 1), 0.8, t, 0.26, -0.2)
        if b % 4 == 3 and s_ == 14: P(buf, 'mallet', penta[(b + 2) % 7] + 12, 0.8, t, 0.3, -0.3)
    section('clawi', 100, 16, f_clawi, 0.85)

    # ── hermes：拨弦的三连音琶音加钟声 ──
    prog_h = ['Cm', 'Ab', 'Eb', 'Bb2']
    def f_hermes(b, s_, t, buf, at):
        ch = prog_h[b % 4]; pat = (0, 2, 4, 5, 4, 2, 1, 2, 4, 6, 4, 2)
        P(buf, 'pluck', tone(ch, pat[s_], 0), 1.6, t, 0.6 if s_ % 3 == 0 else 0.36, -0.35 + 0.06 * s_)
        if s_ == 0: P(buf, 'sub', tone(ch, 0, 0), 1.2, t, 0.4)
        if s_ == 0 and b % 2 == 0: P(buf, 'bell', tone(ch, 2, 2), 3.0, t, 0.22, 0.25)
        if s_ == 6 and b % 4 == 3: P(buf, 'bell', tone(ch, 4, 2), 3.0, t, 0.18, -0.25)
    section('hermes', 84, 12, f_hermes, 1.05, lead=1.2)

    # ── hermesi：每小节前四个音不变（前缀），后半小节变化 ──
    prefix = (60, 63, 67, 70); tails = ((72, 70, 67, 63), (75, 72, 70, 67), (67, 65, 63, 60), (70, 67, 68, 67))
    def f_hermesi(b, s_, t, buf, at):
        ch = prog_h[b % 4]
        m = prefix[s_] if s_ < 4 else tails[b % 4][s_ - 4]
        P(buf, 'pluck', m, 1.4, t, 0.6 if s_ < 4 else 0.4, -0.3 if s_ < 4 else 0.3)
        if s_ in (0, 5): P(buf, 'sub', tone(ch, 0, 0), 0.8, t, 0.32)
        if s_ % 2 == 1: put(buf, S.hat(), t, 0.07, 0.3, sr)
        if b % 4 == 1 and s_ == 4: P(buf, 'bell', tone(ch, 4, 2), 2.6, t, 0.16, 0.0)
    section('hermesi', 88, 8, f_hermesi, 0.85)

    # ── both：马林巴打底，方波与拨弦逐小节轮流 ──
    prog_b = ['F', 'Am', 'Dm', 'C']
    def f_both(b, s_, t, buf, at):
        ch = prog_b[b % 4]; pat = (0, 2, 4, 2, 1, 2, 4, 2)
        if s_ % 2 == 0: P(buf, 'mallet', tone(ch, pat[s_], 1), 0.9, t, 0.6, 0.0)
        if s_ == 0: P(buf, 'tri', tone(ch, 0, -1), 1.0, t, 0.6)
        if b % 2 == 0 and s_ in (1, 3, 5): P(buf, 'square', tone(ch, pat[s_] + 2, 1), 0.3, t, 0.3, -0.45)
        if b % 2 == 1 and s_ in (1, 3, 5, 7): P(buf, 'pluck', tone(ch, pat[s_] + 2, 0), 1.2, t, 0.45, 0.45)
    section('both', 92, 8, f_both, 1.0, lead=1.2)

    # ── mini：行走低音与拍点，方波与拨弦的短句交替；后半加马林巴 ──
    walk = ((0, 2, 3, 4), (0, 1, 2, 4), (0, 2, 4, 2), (0, 4, 2, 1)); late = cue_t('m12', 1e9)
    def f_mini(b, s_, t, buf, at):
        ch = prog_o[b % 4]
        if s_ % 2 == 0: P(buf, 'tri', tone(ch, walk[b % 4][s_ // 2], 0), 0.5, t, 0.5)
        put(buf, S.hat(), t, 0.12 if s_ % 2 == 0 else 0.07, -0.2 if s_ % 2 else 0.2, sr)
        if b % 2 == 0 and s_ in (2, 3): P(buf, 'square', tone(ch, 2 + s_, 1), 0.3, t, 0.3, -0.4)
        if b % 2 == 1 and s_ in (2, 3, 6): P(buf, 'pluck', tone(ch, 1 + s_, 0), 1.2, t, 0.45, 0.4)
        if at >= late and s_ in (0, 5): P(buf, 'mallet', tone(ch, 4 if s_ else 2, 1), 0.9, t, 0.4, 0.0)
        if s_ == 0 and b % 2 == 0: put(buf, S.kick(), t, 0.28, 0, sr)
    section('mini', 100, 8, f_mini, 0.95, lead=1.2)

    # ── outro：开场的动机转大调，加拨弦 ──
    prog_x = ['D', 'Bm', 'G', 'A']
    def f_outro(b, s_, t, buf, at):
        ch = prog_x[b % 4]
        if s_ == 0: P(buf, 'piano', tone(ch, 0, -1), 3.0, t, 0.8, -0.15)
        if s_ == 3: P(buf, 'piano', tone(ch, 2, 1), 2.4, t, 0.55, 0.2)
        if s_ == 5: P(buf, 'piano', tone(ch, 1 if b % 2 else 3, 1), 2.4, t, 0.5, 0.05)
        if s_ in (2, 4, 6): P(buf, 'pluck', tone(ch, s_ // 2 + 1, 0), 1.6, t, 0.3, 0.35)
        if s_ == 0 and b % 2 == 0: P(buf, 'bell', tone(ch, 2, 2), 3.0, t, 0.12, -0.3)
    section('outro', 72, 8, f_outro, 1.0)

    # 轻的空间感：几条短延迟（早期反射），不做长混响
    wet = np.zeros_like(out)
    for d, g in ((0.031, 0.22), (0.057, 0.16), (0.089, 0.12), (0.143, 0.08), (0.211, 0.05)):
        k = int(d * sr)
        wet[0, k:] += out[1, :-k] * g; wet[1, k:] += out[0, :-k] * g
    return out + wet
