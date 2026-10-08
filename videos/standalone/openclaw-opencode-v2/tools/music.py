"""本片的配乐：compose(ctx) 由 kit/tools/mix.py 调用（project.json 的 audio.music 指向本文件），返回 (2, N) 的数组。

全部由本文件合成，不用任何采样或现成乐曲。贯穿全片的是一个四音的「记录」动机（E–B–G#–F#），各章的音色与节奏有意拉开：
  open     柔和的钢琴式单音奏出动机（E 大调，70 拍）；「进程在半路死掉」那一刻全体静音一拍，片名处动机落回主音
  before   拨弦的八分音符加钢琴式和弦，轻的拍点（升 C 小调，92 拍）—— 中性的讲解，像翻一页记录
  claw     明亮的马林巴十六分切分加钟琴点缀、轻的鼓（E 大调，108 拍）—— 呼应 OpenClaw 的圆身龙虾
  claw2    同调同速，更稀：马林巴八分、柔和的低音，每四小节一次钟琴
  code     25% 占空比的方波十六分琶音、三角波低音、紧的踩镲（A 小调，120 拍）—— 终端的音色
  crash    低音持续加每拍一次的滴答（A 小调）；「强杀」一句起全体停一拍；「重启」之后起方波脉冲；「两行」处两下钟声
  budget   方波与拨弦轮流的八分（A 小调 → C 大调，104 拍），比 code 段松
  lessons  钢琴式和弦加铺底与钟声（E 大调，80 拍）；六条做法各在开头敲一下钟；收尾一段逐步加层
  outro    动机在钢琴上再奏一遍，落在主音上
各段在场景交界处各自淡入淡出；每段按均方根对齐到相近的响度。随机数全部用固定种子。
"""
import numpy as np

FADE = (1.2, 4.0)
A4 = 440.0


def hz(m):
    return A4 * 2.0 ** ((m - 69) / 12.0)


class Synth:
    def __init__(self, sr):
        self.sr = sr
        self.cache = {}
        self.rng = np.random.default_rng(20261008)

    def t(self, dur):
        return np.arange(int(dur * self.sr)) / self.sr

    def env(self, n, a, d):
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

    def i_felt(self, f, dur):                     # 柔和的钢琴式：泛音少、起音慢一点
        t = self.t(dur); x = np.zeros_like(t)
        for k, g in ((1, 1.0), (2, 0.3), (3, 0.12), (4, 0.05)):
            x += g * np.sin(2 * np.pi * f * k * (1 + 0.0003 * k * k) * t) * np.exp(-t * (0.9 + 1.1 * k))
        return x * self.env(len(t), 0.012, 3.2)

    def i_mallet(self, f, dur):                   # 马林巴
        t = self.t(dur)
        x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7.5) + 0.32 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30) + 0.1 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 65)
        return x * self.env(len(t), 0.002, 1.1)

    def i_glock(self, f, dur):                    # 钟琴：高处的短钟声
        t = self.t(dur); x = np.zeros_like(t)
        for r, g, d in ((1, 1.0, 2.6), (2.0, 0.25, 4.0), (5.93, 0.18, 9.0)):
            x += g * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d)
        return x * self.env(len(t), 0.002, 1.5)

    def i_square(self, f, dur):                   # 方波（占空比 25%），泛音叠到 6 kHz 为止
        t = self.t(dur); x = np.zeros_like(t); k = 1
        while f * k < 6000 and k < 40:
            x += (2 / (k * np.pi)) * np.sin(np.pi * k * 0.25) * np.cos(2 * np.pi * f * k * t); k += 1
        return x * self.env(len(t), 0.003, 0.2)

    def i_tri(self, f, dur):                      # 三角波低音
        t = self.t(dur); x = np.zeros_like(t)
        for k in (1, 3, 5, 7):
            x += ((-1) ** ((k - 1) // 2)) * np.sin(2 * np.pi * f * k * t) / (k * k)
        return x * self.env(len(t), 0.006, 0.5)

    def i_pluck(self, f, dur):                    # 拨弦（Karplus-Strong）
        n = int(dur * self.sr); p = max(2, int(round(self.sr / f)))
        buf = self.rng.uniform(-1, 1, p); buf -= buf.mean()
        reps = n // p + 2; out = np.empty(reps * p); cur = buf
        for i in range(reps):
            out[i * p:(i + 1) * p] = cur
            cur = 0.5 * (cur + np.roll(cur, 1)) * 0.995
        return out[:n] * self.env(n, 0.002, 1.3)

    def i_bell(self, f, dur):                     # 钟声
        t = self.t(dur); x = np.zeros_like(t)
        for r, g, d in ((1, 1.0, 1.4), (2.76, 0.4, 3.0), (5.4, 0.2, 5.0), (8.93, 0.08, 8.0)):
            x += g * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d)
        return x * self.env(len(t), 0.003, 2.6)

    def i_pad(self, f, dur):                      # 铺底：三支略失谐的正弦，慢起慢落
        t = self.t(dur); x = np.zeros_like(t)
        for dt, g in ((-0.004, 0.5), (0.0, 0.7), (0.0045, 0.5)):
            x += g * np.sin(2 * np.pi * f * (1 + dt) * t)
        x += 0.15 * np.sin(2 * np.pi * f * 2 * t)
        a = np.minimum(1, t / 0.8) * np.minimum(1, np.maximum(0, (dur - t)) / 0.9)
        return x * a

    def i_sub(self, f, dur):                      # 低音持续
        t = self.t(dur)
        a = np.minimum(1, t / 0.5) * np.minimum(1, np.maximum(0, (dur - t)) / 0.6)
        return np.sin(2 * np.pi * f * t) * a

    def kick(self):
        if 'kick' not in self.cache:
            t = self.t(0.2); ph = 2 * np.pi * (50 * t + (120 - 50) * 0.03 * (1 - np.exp(-t / 0.03)))
            self.cache['kick'] = np.sin(ph) * np.exp(-t * 18)
        return self.cache['kick']

    def hat(self, long=False):
        key = 'hatl' if long else 'hat'
        if key not in self.cache:
            n = int((0.08 if long else 0.03) * self.sr); x = np.random.default_rng(11 if long else 13).uniform(-1, 1, n)
            x = np.diff(x, prepend=0.0); x = np.diff(x, prepend=0.0)
            self.cache[key] = x / np.abs(x).max() * np.exp(-np.arange(n) / ((0.025 if long else 0.008) * self.sr))
        return self.cache[key]

    def tick(self):                               # 滴答：极短的木质点
        if 'tick' not in self.cache:
            t = self.t(0.05)
            self.cache['tick'] = np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 140)
        return self.cache['tick']


def put(buf, x, t, g, pan, sr):
    i = int(t * sr)
    if i >= buf.shape[1] or i < 0:
        return
    j = min(buf.shape[1], i + len(x)); x = x[:j - i]
    buf[0, i:j] += x * g * np.cos((pan + 1) * np.pi / 4)
    buf[1, i:j] += x * g * np.sin((pan + 1) * np.pi / 4)


CH = {  # 和弦：根音（MIDI）与音程
    'E': (52, (0, 4, 7, 11)), 'B': (47, (0, 4, 7, 10)), 'C#m': (49, (0, 3, 7, 10)), 'A': (45, (0, 4, 7, 11)),
    'G#m': (44, (0, 3, 7, 10)), 'F#m': (54, (0, 3, 7, 10)), 'Am': (45, (0, 3, 7, 10)), 'F': (53, (0, 4, 7, 11)),
    'C': (48, (0, 4, 7, 11)), 'G': (43, (0, 4, 7, 10)), 'Dm': (50, (0, 3, 7, 10)), 'Em': (52, (0, 3, 7, 10)),
}
MOTIF = (64, 71, 68, 66)   # E4 B4 G#4 F#4：「记录」动机


def tone(ch, i, octv=0):
    root, iv = CH[ch]
    return root + iv[i % len(iv)] + 12 * (i // len(iv)) + 12 * octv


def compose(ctx):
    sr, n = ctx['sr'], ctx['n']
    S = Synth(sr)
    scenes = {s['id']: (s['start'], s['end']) for s in ctx['scenes']}
    cues = {c['id']: c for c in ctx['cues']} if isinstance(ctx['cues'], list) else ctx['cues']
    cue_t = lambda cid, d=1e9: (cues[cid]['start'] if cid in cues else d)
    cue_e = lambda cid, d=1e9: (cues[cid]['end'] if cid in cues else d)
    out = np.zeros((2, n))

    def section(sid, bpm, steps, fn, level=1.0, lead=0.0, mute=()):
        """sid 场景；steps 每小节的步数；fn(bar, step, t, buf, 绝对时刻) 在每一步上放音。mute：[(起, 止)] 这些时段整段静音。"""
        if sid not in scenes:
            return
        t0, t1 = scenes[sid]; t0 += lead
        buf = np.zeros((2, int((t1 - t0 + 6) * sr)))
        step = 60.0 / bpm * 4 / steps
        nb = int((t1 - t0) / (step * steps)) + 1
        for b in range(nb):
            for s_ in range(steps):
                t = (b * steps + s_) * step
                at = t0 + t
                if at < t1 - 0.2 and not any(a <= at < z for a, z in mute):
                    fn(b, s_, t, buf, at)
        m = buf.shape[1]; e = np.ones(m); fi = int(0.9 * sr); fo = int(2.0 * sr); end = int((t1 - t0 + 0.6) * sr)
        e[:fi] = np.linspace(0, 1, fi); e[max(0, end - fo):end] *= np.linspace(1, 0, min(fo, end)); e[end:] = 0
        for a, z in mute:      # 静音段：短促地收掉，结束时再放开
            ia, iz = int((a - t0) * sr), int((z - t0) * sr)
            if 0 <= ia < m:
                k = int(0.04 * sr); e[ia:ia + k] *= np.linspace(1, 0, min(k, m - ia)); e[ia + k:max(ia + k, iz)] = 0
        buf *= e
        r = np.sqrt(np.mean(buf[:, :end] ** 2)) + 1e-9
        buf *= level * 0.1 / r
        i = int(t0 * sr); j = min(n, i + m)
        out[:, i:j] += buf[:, :j - i]

    P = lambda buf, kind, m, dur, t, g, pan=0.0: put(buf, S.note(kind, m, dur), t, g, pan, sr)

    # ── open：动机在钢琴式的音色上；「死掉」一拍静音；片名处落回主音 ──
    kill = cue_t('o6') + (cue_e('o6') - cue_t('o6')) * 0.25
    title = cue_t('oT')
    def f_open(b, s_, t, buf, at):
        ch = ('E', 'C#m', 'A', 'B')[b % 4]
        if s_ == 0: P(buf, 'felt', tone(ch, 0, -1), 3.2, t, 0.8, -0.1); P(buf, 'pad', tone(ch, 0, 0), 3.5, t, 0.18)
        if s_ in (2, 3, 5, 6): P(buf, 'felt', MOTIF[(s_ - 2) if s_ < 4 else (s_ - 3)], 2.2, t, 0.5, 0.15)
        if at >= title and s_ == 4: P(buf, 'bell', 76, 3.0, t, 0.3, 0.0)
    section('open', 70, 8, f_open, 1.0, mute=[(kill, kill + 60 / 70 * 1.5)])

    # ── before：拨弦八分 + 钢琴和弦 + 轻拍点 ──
    def f_before(b, s_, t, buf, at):
        ch = ('C#m', 'A', 'E', 'B')[b % 4]; pat = (0, 2, 1, 3, 2, 1, 2, 3)
        P(buf, 'pluck', tone(ch, pat[s_], 1), 1.2, t, 0.55 if s_ % 4 == 0 else 0.35, -0.3 + 0.08 * s_)
        if s_ == 0: [P(buf, 'felt', tone(ch, k, 0), 2.6, t, 0.32, (k - 1) * 0.2) for k in range(3)]; P(buf, 'tri', tone(ch, 0, -1), 1.4, t, 0.5)
        if s_ % 2 == 1: put(buf, S.hat(), t, 0.07, 0.25, sr)
        if b % 4 == 3 and s_ >= 4: P(buf, 'felt', MOTIF[s_ - 4] + 12, 1.6, t, 0.25, 0.3)
    section('before', 92, 8, f_before, 0.95, lead=1.4)

    # ── claw：马林巴十六分切分 + 钟琴 + 轻鼓（E 大调）──
    def f_claw(b, s_, t, buf, at):
        ch = ('E', 'B', 'C#m', 'A')[b % 4]; pat = (0, 2, 1, 4, 2, 1, 3, 2, 0, 4, 2, 1, 3, 2, 4, 1)
        if s_ not in (3, 11): P(buf, 'mallet', tone(ch, pat[s_], 1), 0.9, t, 0.55 if s_ % 4 == 0 else 0.34, -0.3 if s_ % 2 else 0.3)
        if s_ % 8 == 0: P(buf, 'tri', tone(ch, 0, 0), 0.8, t, 0.55)
        if s_ in (0, 10): put(buf, S.kick(), t, 0.32, 0, sr)
        if s_ % 4 == 2: put(buf, S.hat(), t, 0.12, -0.2, sr)
        if b % 2 == 1 and s_ in (6, 14): P(buf, 'glock', tone(ch, 2, 2), 1.4, t, 0.25, 0.35)
    section('claw', 108, 16, f_claw, 1.0, lead=1.4)

    # ── claw2：同调同速，更稀 ──
    def f_claw2(b, s_, t, buf, at):
        ch = ('C#m', 'A', 'E', 'B')[b % 4]; pat = (0, 2, 4, 2, 1, 2, 3, 2)
        P(buf, 'mallet', tone(ch, pat[s_], 1), 0.9, t, 0.5 if s_ % 4 == 0 else 0.3, -0.25 + 0.07 * s_)
        if s_ in (0, 4): P(buf, 'tri', tone(ch, 0, 0), 0.9, t, 0.5)
        if s_ % 4 == 2: put(buf, S.hat(), t, 0.08, 0.2, sr)
        if b % 4 == 0 and s_ == 0: P(buf, 'glock', MOTIF[b // 4 % 4] + 12, 2.0, t, 0.3, -0.2)
    section('claw2', 108, 8, f_claw2, 0.9, lead=0.6)

    # ── code：方波十六分琶音 + 三角波低音 + 紧的踩镲（A 小调）──
    def f_code(b, s_, t, buf, at):
        ch = ('Am', 'F', 'C', 'G')[b % 4]; pat = (0, 2, 4, 2, 1, 2, 4, 6, 0, 2, 4, 2, 3, 2, 4, 5)
        P(buf, 'square', tone(ch, pat[s_], 1), 0.25, t, 0.42 if s_ % 4 == 0 else 0.28, -0.35 if s_ % 2 else 0.35)
        if s_ % 4 == 0: P(buf, 'tri', tone(ch, 0, 0), 0.45, t, 0.4)
        if s_ % 2 == 1: put(buf, S.hat(), t, 0.1, 0.15, sr)
        if s_ in (0, 8): put(buf, S.kick(), t, 0.28, 0, sr)
    section('code', 120, 16, f_code, 0.95, lead=1.4)

    # ── crash：低音持续 + 滴答；强杀时停；重启后方波脉冲；两行处钟声 ──
    kill2 = cue_t('e4') + (cue_e('e4') - cue_t('e4')) * 0.6
    restart = cue_t('e9'); two = cue_t('e14')
    def f_crash(b, s_, t, buf, at):
        ch = ('Am', 'Am', 'F', 'E')[b % 4]
        if s_ == 0: P(buf, 'sub', tone(ch, 0, -1), 60 / 96 * 4 + 0.2, t, 0.28); P(buf, 'pad', tone(ch, 2, 0), 60 / 96 * 4 + 0.3, t, 0.3); P(buf, 'pad', tone(ch, 0, 1), 60 / 96 * 4 + 0.3, t, 0.18)
        if s_ % 2 == 0: put(buf, S.tick(), t, 0.22 if s_ % 4 == 0 else 0.12, 0.3 if s_ % 4 else -0.3, sr)
        if restart <= at and s_ % 2 == 1: P(buf, 'square', tone(ch, (s_ // 2) % 4, 1), 0.2, t, 0.22, 0.2)
        if two <= at < two + 60 / 96 * 4 and s_ in (0, 2): P(buf, 'bell', 76, 3.0, t, 0.4, -0.2 if s_ else 0.2)
    section('crash', 96, 8, f_crash, 0.85, lead=0.5, mute=[(kill2, kill2 + 1.1)])

    # ── budget：方波与拨弦轮流的八分，A 小调转 C 大调 ──
    def f_budget(b, s_, t, buf, at):
        ch = ('Am', 'F', 'C', 'G')[b % 4] if b < 8 else ('C', 'G', 'Am', 'F')[b % 4]; pat = (0, 2, 4, 2, 1, 2, 4, 3)
        P(buf, 'square' if b % 2 == 0 else 'pluck', tone(ch, pat[s_], 1), 0.3 if b % 2 == 0 else 1.1, t, 0.32, -0.3 + 0.08 * s_)
        if s_ == 0: P(buf, 'tri', tone(ch, 0, -1), 1.2, t, 0.35)
        if s_ % 2 == 1: put(buf, S.hat(), t, 0.06, -0.2, sr)
    section('budget', 104, 8, f_budget, 0.85, lead=0.5)

    # ── lessons：钢琴和弦 + 铺底 + 钟声；每条开头一下钟；收尾逐步加层 ──
    heads = [cue_t(c) for c in ('l2', 'l4', 'l7', 'l9', 'l13', 'l16')]
    fin = cue_t('l19')
    def f_less(b, s_, t, buf, at):
        ch = ('E', 'C#m', 'A', 'B')[b % 4]
        if s_ == 0:
            [P(buf, 'felt', tone(ch, k, 0), 3.0, t, 0.35, (k - 1) * 0.25) for k in range(3)]
            P(buf, 'pad', tone(ch, 0, 0), 3.2, t, 0.2); P(buf, 'tri', tone(ch, 0, -1), 2.0, t, 0.45)
        if s_ in (2, 6): P(buf, 'felt', tone(ch, 3 if s_ == 2 else 1, 1), 2.0, t, 0.28, 0.3)
        if any(h - 0.2 <= at < h + 0.55 for h in heads) and s_ % 4 == 0: P(buf, 'bell', tone(ch, 2, 2), 2.6, t, 0.35, 0.0)
        if at >= fin:
            if s_ % 2 == 1: P(buf, 'pluck', tone(ch, s_ // 2 + 1, 1), 1.0, t, 0.3, -0.3)
            if s_ in (3, 7): put(buf, S.hat(), t, 0.07, 0.2, sr)
            if s_ == 4: P(buf, 'felt', MOTIF[b % 4] + 12, 2.0, t, 0.3, 0.2)
    section('lessons', 80, 8, f_less, 0.95, lead=1.4)

    # ── outro：动机在钢琴上，落在主音 ──
    def f_out(b, s_, t, buf, at):
        if s_ == 0: P(buf, 'felt', 52, 4.0, t, 0.7, -0.1); P(buf, 'pad', 64, 4.0, t, 0.18)
        if 1 <= s_ <= 4: P(buf, 'felt', MOTIF[s_ - 1], 2.4, t, 0.5, 0.15)
        if s_ == 6: P(buf, 'felt', 64, 3.0, t, 0.5, 0.0); P(buf, 'bell', 76, 3.0, t, 0.2, 0.25)
    section('outro', 70, 8, f_out, 0.9)

    # 轻的空间感：几条短延迟（早期反射），不做长混响
    wet = np.zeros_like(out)
    for d, g in ((0.029, 0.2), (0.053, 0.15), (0.083, 0.11), (0.137, 0.07), (0.199, 0.045)):
        k = int(d * sr)
        wet[0, k:] += out[1, :-k] * g; wet[1, k:] += out[0, :-k] * g
    return out + wet
