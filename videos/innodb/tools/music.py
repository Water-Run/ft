"""本片的配乐：compose(ctx) 由 kit/tools/mix.py 调用（project.json 的 audio.music 指向本文件），返回 (2, N) 的数组。

全部由本文件合成，不用任何采样或现成乐曲。方向是 2000 年代中后期的电子乐：电钢琴（FM 合成）的七和弦与九和弦、
轻的碎拍、暖的铺底与圆的低音 —— InnoDB 成为 MySQL 默认引擎的那几年的声音，现代，但已有些年头。
调性是 D 小调（多用多利亚的明亮色彩）。贯穿全片的是一个四音的「提交」动机 A–D–F–E，停在不解决的 E 上，
只在片尾落回主音 D：事务提交之前，结果都悬着。各章的速度与织体有意拉开：
  intro  电钢琴和弦与动机，铺底，没有鼓（84 拍）—— 回顾上一期
  s01    半速的轻拍子，电钢琴切分和弦，低音跟根音（88 拍）—— 讲历史
  s02    碎拍加沙锤，电钢琴加八分的拨弦琶音（90 拍）；ACID 四个字母各一声玻璃钟
  s03    「锁」一段只有边击与低音（92 拍）；「多版本」一段起两条错开的琶音（新旧两个版本）；
         「隔离级别」一段加上鼓与附点回声
  s04    带附点回声的琶音脉冲，像一条日志带在走（94 拍）；OLTP 一段换成完整的碎拍，更密
  s05    柔和方波的十六分琶音（字节），半速底鼓（96 拍）；拆字节的段落加踩镲、更密
  s06    电钢琴八分音型带左右来回的回声（92 拍）—— 缓冲池里来回的页
  s07    电钢琴和弦加铺底，两条错开的琶音（88 拍）；回滚完成那一句一声玻璃钟
  s08    低音与边击（96 拍）；两次等待只留铺底；发现死锁那一句全体停一拍
  s09    十六分脉冲与四拍底鼓（100 拍，日志在刷）；强行结束进程的停顿里全体静音，重启后只剩稀疏的脉冲；
         恢复结果处两声玻璃钟
  s10    电钢琴和弦、铺底与轻拍子（86 拍），动机回来；最后一句撤掉鼓
  end    片尾名单（没有旁白）：动机再奏一遍，第一次落回主音 D
各段在场景交界处各自淡入淡出；每段按均方根对齐到相近的响度。随机数全部用固定种子。
制作者听不到声音：出片前看 audio.js 的数值自检，听感由人确认。
"""
import numpy as np

FADE = (1.0, 4.0)
A4 = 440.0


def hz(m):
    return A4 * 2.0 ** ((m - 69) / 12.0)


class Synth:
    def __init__(self, sr):
        self.sr = sr
        self.cache = {}
        self.rng = np.random.default_rng(20261010)

    def t(self, dur):
        return np.arange(int(dur * self.sr)) / self.sr

    def tail(self, x, k=0.012):                   # 末尾 12 ms 收掉，避免爆音
        n = min(len(x), int(k * self.sr))
        if n:
            x[-n:] *= np.linspace(1, 0, n)
        return x

    def note(self, kind, m, dur):
        key = (kind, m, round(dur, 3))
        if key not in self.cache:
            self.cache[key] = self.tail(getattr(self, 'i_' + kind)(hz(m), dur))
        return self.cache[key]

    def i_ep(self, f, dur):                       # 电钢琴：两算子 FM，起音带一点「叮」，调制深度随时间变浅
        t = self.t(dur)
        dec = 1.7 * (440.0 / f) ** 0.3
        idx = 1.7 * np.exp(-t * 6.0) + 0.3
        x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
        x += 0.1 * np.sin(2 * np.pi * f * 7.0 * t) * np.exp(-t * 32)
        x *= 1 + 0.08 * np.sin(2 * np.pi * 4.6 * t)
        return x * np.minimum(1, t / 0.004) * np.exp(-t / dec)

    def i_pad(self, f, dur):                      # 暖铺底：三支略失谐的锯齿，高次泛音压低，慢起慢落
        t = self.t(dur); x = np.zeros_like(t)
        for c in (-8, 0, 8):
            fv = f * 2 ** (c / 1200); k = 1
            while fv * k < 2400 and k < 24:
                x += (1.0 / k) * np.exp(-fv * k / 1100) * np.sin(2 * np.pi * fv * k * t + self.rng.uniform(0, 2 * np.pi)); k += 1
        a = np.minimum(1, t / 1.2) * np.minimum(1, np.maximum(0, dur - t) / 1.2)
        return 0.5 * x * a

    def i_sub(self, f, dur):                      # 圆的低音
        t = self.t(dur)
        a = np.minimum(1, t / 0.012) * np.exp(-t / 2.2) * np.minimum(1, np.maximum(0, dur - t) / 0.08)
        return (np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)) * a

    def i_arp(self, f, dur):                      # 拨弦式合成：亮度随时间变暗
        t = self.t(dur); x = np.zeros_like(t); k = 1
        while f * k < 7000 and k < 30:
            x += (1.0 / k) * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (3 + 1.7 * k)); k += 1
        return 0.8 * x * np.minimum(1, t / 0.003) * np.exp(-t / 0.4)

    def i_bit(self, f, dur):                      # 柔和方波：只留前几个奇次泛音（字节的「哔」）
        t = self.t(dur); x = np.zeros_like(t)
        for k in (1, 3, 5, 7):
            x += np.sin(2 * np.pi * f * k * t) / k
        return x * np.minimum(1, t / 0.003) * np.exp(-t / 0.09)

    def i_glass(self, f, dur):                    # 玻璃钟：FM，非整数比
        t = self.t(dur)
        idx = 2.4 * np.exp(-t * 3.5)
        return np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 3.5 * t)) * np.minimum(1, t / 0.002) * np.exp(-t / 1.9)

    def drum(self, name):
        if name in self.cache:
            return self.cache[name]
        sr = self.sr; r = np.random.default_rng(len(name) * 7 + 3)
        if name == 'kick':                        # 柔和的底鼓：110→48 Hz 的下滑正弦
            t = self.t(0.32); ph = 2 * np.pi * (48 * t + (110 - 48) * 0.035 * (1 - np.exp(-t / 0.035)))
            x = np.sin(ph) * np.exp(-t * 11)
            n = int(0.003 * sr); x[:n] += r.uniform(-0.25, 0.25, n)
        elif name == 'snare':                     # 轻的军鼓：带通的噪声加一点鼓皮音
            t = self.t(0.2); nz = r.uniform(-1, 1, len(t)); nz = np.diff(nz, prepend=0.0)
            nz = np.convolve(nz, np.ones(3) / 3, mode='same')
            x = 0.7 * nz * np.exp(-t * 22) + 0.4 * np.sin(2 * np.pi * 196 * t) * np.exp(-t * 30)
        elif name == 'rim':                       # 边击
            t = self.t(0.06)
            x = (np.sin(2 * np.pi * 1750 * t) + 0.6 * np.sin(2 * np.pi * 560 * t)) * np.exp(-t * 90)
        elif name in ('hat', 'ohat'):             # 踩镲：高通的噪声
            d = 0.03 if name == 'hat' else 0.16
            t = self.t(d + 0.05); nz = r.uniform(-1, 1, len(t))
            nz = np.diff(np.diff(nz, prepend=0.0), prepend=0.0)
            x = nz / np.abs(nz).max() * np.exp(-t / (d / 3))
        elif name == 'shk':                       # 沙锤
            t = self.t(0.09); nz = r.uniform(-1, 1, len(t)); nz = np.diff(nz, prepend=0.0)
            x = 0.6 * nz * np.minimum(1, t / 0.012) * np.exp(-t * 45)
        self.cache[name] = self.tail(x, 0.004)
        return self.cache[name]


def put(buf, x, t, g, pan, sr):
    i = int(round(t * sr))
    if i >= buf.shape[1] or i < 0:
        return
    j = min(buf.shape[1], i + len(x)); x = x[:j - i]
    buf[0, i:j] += x * g * np.cos((pan + 1) * np.pi / 4)
    buf[1, i:j] += x * g * np.sin((pan + 1) * np.pi / 4)


CH = {  # 和弦：根音（MIDI）与音程
    'Dm9': (50, (0, 3, 7, 10, 14)), 'Bbmaj9': (46, (0, 4, 7, 11, 14)), 'Fmaj7': (53, (0, 4, 7, 11)), 'C69': (48, (0, 4, 7, 9, 14)),
    'Gm9': (43, (0, 3, 7, 10, 14)), 'A7sus': (45, (0, 5, 7, 10)), 'Am7': (45, (0, 3, 7, 10)), 'G9': (43, (0, 4, 7, 10, 14)),
    'Ebmaj7': (51, (0, 4, 7, 11)), 'Dadd9': (50, (0, 4, 7, 14)),
}
MOTIF = (69, 74, 77, 76)   # A4 D5 F5 E5：「提交」动机，停在 E 上；片尾才落回 D


def voicing(ch, lo=53):
    """电钢琴的和弦排法：根音之上的各音，整体挪到 lo 以上"""
    root, iv = CH[ch]
    ns = [root + i for i in iv[1:]]
    while min(ns) < lo:
        ns = [n + 12 for n in ns]
    return ns


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
    out = np.zeros((2, n), dtype=np.float32)

    def section(sid, bpm, steps, fn, level=1.0, mute=(), swing=0.0, echo=None):
        """sid 场景；steps 每小节的步数；fn(bar, step, t, B, 绝对时刻) 在每一步上放音，B['d'] 是干声、B['e'] 是送回声的；
        mute：[(起, 止)] 这些时段整段静音；swing：偶数步之后那一步推后的比例；echo：(延迟拍数, 反馈, 湿声) 左右来回的回声。"""
        if sid not in scenes:
            return
        t0, t1 = scenes[sid]
        m = int((t1 - t0 + 6) * sr)
        B = {'d': np.zeros((2, m)), 'e': np.zeros((2, m))}
        step = 60.0 / bpm * 4 / steps
        nb = int((t1 - t0) / (step * steps)) + 1
        for b in range(nb):
            for s_ in range(steps):
                t = (b * steps + s_) * step + (swing * step if s_ % 2 else 0.0)
                at = t0 + t
                if at < t1 - 0.2 and not any(a <= at < z for a, z in mute):
                    fn(b, s_, t, B, at)
        buf = B['d']
        if echo:                                  # 左右来回的回声：第 k 次重复落在交替的一侧，逐次变弱
            beats, fb, wet = echo; d = int(60.0 / bpm * beats * sr)
            mono = B['e'].sum(0); buf += B['e']
            for k in range(1, 7):
                sh = k * d
                if sh >= m:
                    break
                buf[k % 2, sh:] += mono[:m - sh] * wet * fb ** (k - 1)
        e = np.ones(m); fi = int(0.9 * sr); fo = int(2.0 * sr); end = int((t1 - t0 + 0.6) * sr)
        e[:fi] = np.linspace(0, 1, fi); e[max(0, end - fo):end] *= np.linspace(1, 0, min(fo, end)); e[end:] = 0
        for a, z in mute:      # 静音段：短促地收掉，结束时再放开
            ia, iz = int((a - t0) * sr), int((z - t0) * sr)
            if 0 <= ia < m:
                k = int(0.04 * sr); e[ia:ia + k] *= np.linspace(1, 0, min(k, m - ia)); e[ia + k:max(ia + k, iz)] = 0
        buf *= e
        # 轻的空间感：几条交叉的短延迟（早期反射），段内做，不做长混响
        wet = np.zeros_like(buf)
        for dl, g in ((0.029, 0.2), (0.053, 0.15), (0.083, 0.1), (0.131, 0.065), (0.197, 0.04)):
            k = int(dl * sr)
            wet[0, k:] += buf[1, :-k] * g; wet[1, k:] += buf[0, :-k] * g
        buf += wet
        r = np.sqrt(np.mean(buf[:, :end] ** 2)) + 1e-9
        buf *= level * 0.1 / r
        i = int(t0 * sr); j = min(n, i + m)
        out[:, i:j] += buf[:, :j - i].astype(np.float32)

    def P(B, kind, m, dur, t, g, pan=0.0, bus='d'):
        if kind == 'sub':
            g *= 0.65          # 低音按均方根算占得多，压一点，让电钢琴与琶音站到前面
        put(B[bus], S.note(kind, m, dur), t, g, pan, sr)

    def D(B, name, t, g, pan=0.0):
        put(B['d'], S.drum(name), t, g, pan, sr)

    def chord(B, ch, t, dur, g, bus='d', spread=0.5):
        vs = voicing(ch)
        for k, m in enumerate(vs):
            P(B, 'ep', m, dur, t + 0.012 * k, g, -spread / 2 + spread * k / max(1, len(vs) - 1), bus)

    def beat(B, s_, t, kind, g=1.0):
        """几种 16 步的轻碎拍。kind：half 半速、break 碎拍、four 四拍底鼓"""
        if kind == 'half':
            if s_ in (0, 10): D(B, 'kick', t, 0.55 * g)
            if s_ == 8: D(B, 'rim', t, 0.18 * g, 0.2)
            if s_ % 4 == 2: D(B, 'hat', t, 0.07 * g, 0.3)
        elif kind == 'break':
            if s_ in (0, 7, 10): D(B, 'kick', t, (0.55 if s_ == 0 else 0.4) * g)
            if s_ in (4, 12): D(B, 'snare', t, 0.24 * g, 0.05)
            if s_ % 2 == 0: D(B, 'hat', t, (0.08 if s_ % 4 == 2 else 0.05) * g, 0.3)
            if s_ == 14: D(B, 'ohat', t, 0.05 * g, 0.3)
        elif kind == 'four':
            if s_ % 4 == 0: D(B, 'kick', t, 0.5 * g)
            if s_ % 4 == 2: D(B, 'hat', t, 0.08 * g, 0.3)
            if s_ in (4, 12): D(B, 'rim', t, 0.14 * g, -0.2)

    BAR = lambda bpm: 60.0 / bpm * 4

    # ── intro：电钢琴和弦与动机，铺底，没有鼓 ──
    def f_intro(b, s_, t, B, at):
        ch = ('Dm9', 'Bbmaj9', 'Fmaj7', 'C69')[b % 4]; bar = BAR(84)
        if s_ == 0:
            chord(B, ch, t, bar + 0.4, 0.2); P(B, 'pad', tone(ch, 0, 1), bar + 0.6, t, 0.1); P(B, 'sub', tone(ch, 0, -1) if CH[ch][0] > 47 else tone(ch, 0, 0), bar, t, 0.32)
        if b % 2 == 1 and s_ in (2, 4, 6, 8): P(B, 'ep', MOTIF[s_ // 2 - 1], 1.6, t, 0.26, 0.2, 'e')
    section('intro', 84, 16, f_intro, 0.95, echo=(0.75, 0.42, 0.3))

    # ── s01：半速的轻拍子，电钢琴切分和弦，低音跟根音 ──
    def f_s01(b, s_, t, B, at):
        ch = ('Bbmaj9', 'Fmaj7', 'Gm9', 'A7sus')[b % 4]; bar = BAR(88)
        if s_ in (0, 6): chord(B, ch, t, 1.4 if s_ else 1.0, 0.17 if s_ else 0.2)
        if s_ in (0, 10): P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), 0.9 if s_ == 0 else 0.5, t, 0.34)
        if s_ == 0: P(B, 'pad', tone(ch, 1, 1), bar + 0.4, t, 0.07)
        beat(B, s_, t, 'half')
    section('s01', 88, 16, f_s01, 0.9, swing=0.1)

    # ── s02：碎拍加沙锤，电钢琴加八分琶音；ACID 四个字母各一声玻璃钟 ──
    acid = [cue_t(c) for c in ('q2', 'q3', 'q4', 'q5')]
    def f_s02(b, s_, t, B, at):
        ch = ('Dm9', 'Gm9', 'Bbmaj9', 'A7sus')[b % 4]; bar = BAR(90)
        if s_ in (0, 7): chord(B, ch, t, 1.3, 0.16)
        if s_ in (0, 10): P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), 0.6, t, 0.32)
        if s_ % 2 == 0: P(B, 'arp', tone(ch, (0, 2, 1, 3, 2, 4, 3, 1)[s_ // 2], 1) if tone(ch, 0, 1) < 62 else tone(ch, (0, 2, 1, 3, 2, 4, 3, 1)[s_ // 2], 0), 0.6, t, 0.13, 0.35 if s_ % 4 else -0.35)
        if s_ % 2 == 1: D(B, 'shk', t, 0.05, -0.3)
        beat(B, s_, t, 'break', 0.8)
        if any(a - 0.08 <= at < a - 0.08 + 60 / 90 / 4 for a in acid): P(B, 'glass', 81, 2.4, t, 0.16, 0.0)
    section('s02', 90, 16, f_s02, 0.9, swing=0.1)

    # ── s03：锁一段只有边击与低音；多版本一段两条错开的琶音；隔离级别一段加鼓与回声 ──
    mv0, iso0 = cue_t('m1'), cue_t('p0')
    def f_s03(b, s_, t, B, at):
        ch = ('Dm9', 'Dm9', 'Bbmaj9', 'A7sus')[b % 4]; bar = BAR(92)
        if s_ == 0: P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), bar, t, 0.3); P(B, 'pad', tone(ch, 2, 1), bar + 0.4, t, 0.1)
        if at < mv0:
            if s_ % 4 == 0: D(B, 'rim', t, 0.16 if s_ % 8 == 0 else 0.1, 0.3 if s_ % 8 else -0.3)
            if s_ == 8: chord(B, ch, t, 1.6, 0.12)
        else:
            if s_ % 4 == 0: P(B, 'arp', tone(ch, (0, 1, 2, 3)[s_ // 4], 1) + (0 if CH[ch][0] < 47 else -12), 0.7, t, 0.15, -0.45)
            if s_ % 4 == 2: P(B, 'arp', tone(ch, (2, 3, 1, 4)[s_ // 4], 1) + (0 if CH[ch][0] < 47 else -12), 0.7, t, 0.11, 0.45)   # 另一个版本，错开半拍
            if s_ in (0, 9): chord(B, ch, t, 1.2, 0.12)
            if at >= iso0:
                beat(B, s_, t, 'half', 0.85)
                if s_ == 6: P(B, 'ep', tone(ch, 3, 1) + (0 if CH[ch][0] < 47 else -12), 0.8, t, 0.12, 0.2, 'e')
    section('s03', 92, 16, f_s03, 0.88, echo=(0.75, 0.4, 0.28))

    # ── s04：带附点回声的琶音脉冲；OLTP 一段换成完整的碎拍 ──
    oltp = cue_t('o1')
    def f_s04(b, s_, t, B, at):
        ch = ('Gm9', 'Dm9', 'Bbmaj9', 'C69')[b % 4]; bar = BAR(94)
        dense = at >= oltp
        if s_ % 2 == 0: P(B, 'arp', tone(ch, (0, 2, 3, 2, 1, 2, 4, 2)[s_ // 2], 1) - (12 if tone(ch, 0, 1) >= 62 else 0), 0.5, t, 0.14 if s_ % 4 == 0 else 0.1, 0.25, 'e')
        if s_ == 0: P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), 1.2, t, 0.32); chord(B, ch, t, bar, 0.12)
        if dense:
            beat(B, s_, t, 'break', 0.9)
            if s_ % 2 == 1: D(B, 'shk', t, 0.05, -0.3)
            if s_ == 10: P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), 0.5, t, 0.28)
        elif s_ in (0, 8):
            D(B, 'kick', t, 0.4)
    section('s04', 94, 16, f_s04, 0.9, swing=0.08, echo=(0.75, 0.38, 0.3))

    # ── s05：柔和方波的十六分琶音（字节），半速底鼓；拆字节的段落加踩镲、更密 ──
    bytes0, bytes1 = cue_t('a12'), cue_t('a20', 1e9) + 2.0
    def f_s05(b, s_, t, B, at):
        ch = ('Dm9', 'Bbmaj9', 'Gm9', 'A7sus')[b % 4]; bar = BAR(96)
        busy = bytes0 <= at < bytes1
        base = 0 if tone(ch, 0, 1) < 62 else -12
        if s_ % 2 == 0 or busy: P(B, 'bit', tone(ch, (0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 4, 2, 3, 2, 1, 2)[s_], 1) + base, 0.15, t, 0.12 if s_ % 4 == 0 else 0.07, -0.3 if s_ % 2 else 0.3)
        if s_ == 0: P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), bar, t, 0.3); P(B, 'pad', tone(ch, 1, 1), bar + 0.4, t, 0.08)
        if s_ == 8: chord(B, ch, t, 1.4, 0.11)
        beat(B, s_, t, 'half', 0.8)
        if busy and s_ % 2 == 1: D(B, 'hat', t, 0.05, 0.3)
    section('s05', 96, 16, f_s05, 0.9)

    # ── s06：电钢琴八分音型，左右来回的回声 ──
    def f_s06(b, s_, t, B, at):
        ch = ('Bbmaj9', 'Fmaj7', 'Gm9', 'Dm9')[b % 4]; bar = BAR(92)
        vs = voicing(ch)
        if s_ % 2 == 0: P(B, 'ep', vs[(0, 2, 1, 3, 2, 1, 0, 2)[s_ // 2] % len(vs)], 0.9, t, 0.13 if s_ % 4 == 0 else 0.09, -0.3, 'e')
        if s_ == 0: P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), bar, t, 0.3); P(B, 'pad', tone(ch, 2, 1), bar + 0.4, t, 0.08)
        if s_ in (0, 8): D(B, 'kick', t, 0.42)
        if s_ == 12: D(B, 'rim', t, 0.14, 0.2)
        if s_ % 4 == 2: D(B, 'hat', t, 0.05, 0.3)
    section('s06', 92, 16, f_s06, 0.88, echo=(0.75, 0.45, 0.32))

    # ── s07：电钢琴和弦加铺底，两条错开的琶音；回滚完成那一句一声玻璃钟 ──
    rb = cue_t('e7') + 0.3
    def f_s07(b, s_, t, B, at):
        ch = ('Dm9', 'Gm9', 'Ebmaj7', 'A7sus')[b % 4]; bar = BAR(88)
        base = 0 if tone(ch, 0, 1) < 62 else -12
        if s_ == 0: chord(B, ch, t, bar + 0.3, 0.17); P(B, 'pad', tone(ch, 0, 1), bar + 0.5, t, 0.09); P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), bar, t, 0.3)
        if s_ in (4, 12): P(B, 'arp', tone(ch, 2 if s_ == 4 else 3, 1) + base, 0.8, t, 0.11, -0.4)
        if s_ in (6, 14): P(B, 'arp', tone(ch, 1 if s_ == 6 else 2, 1) + base, 0.8, t, 0.08, 0.4)
        if s_ in (0, 10): D(B, 'kick', t, 0.35)
        if s_ % 4 == 2: D(B, 'hat', t, 0.04, 0.3)
        if rb <= at < rb + 60 / 88 / 4: P(B, 'glass', 86, 2.6, t, 0.16, 0.0)
    section('s07', 88, 16, f_s07, 0.88, swing=0.08)

    # ── s08：低音与边击；两次等待只留铺底；发现死锁那一句全体停一拍 ──
    waits = [(cue_t('f6') + (cue_e('f6') - cue_t('f6')) * 0.3, cue_e('f6')), (cue_t('f11') + (cue_e('f11') - cue_t('f11')) * 0.4, cue_e('f11'))]
    dl = cue_t('f15')
    def f_s08(b, s_, t, B, at):
        ch = ('Dm9', 'Dm9', 'Gm9', 'A7sus')[b % 4]; bar = BAR(96)
        if s_ == 0: P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), bar, t, 0.3); P(B, 'pad', tone(ch, 1, 1), bar + 0.4, t, 0.1)
        if any(a <= at < z for a, z in waits): return
        if s_ % 2 == 0: D(B, 'rim', t, 0.13 if s_ % 4 == 0 else 0.07, -0.3 if s_ % 4 else 0.3)
        if s_ in (3, 11): chord(B, ch, t, 0.5, 0.1)
        if s_ in (0, 8): D(B, 'kick', t, 0.36)
    section('s08', 96, 16, f_s08, 0.85, mute=[(dl, dl + 60 / 96 * 1.5)])

    # ── s09：十六分脉冲与四拍底鼓；强行结束进程的停顿里全体静音；重启后只剩稀疏的脉冲；恢复结果两声玻璃钟 ──
    kill = cue_t('hT'); rest = cue_t('h4'); res = cue_t('h7')
    def f_s09(b, s_, t, B, at):
        ch = ('Dm9', 'Bbmaj9', 'Gm9', 'A7sus')[b % 4]; bar = BAR(100)
        sparse = rest <= at < res
        base = 0 if tone(ch, 0, 1) < 62 else -12
        if s_ == 0: P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), bar, t, 0.3); P(B, 'pad', tone(ch, 2, 1), bar + 0.4, t, 0.09)
        if not sparse or s_ % 4 == 0: P(B, 'bit', tone(ch, (0, 1, 2, 1, 3, 1, 2, 1)[s_ % 8], 1) + base, 0.15, t, 0.09 if s_ % 4 == 0 else 0.05, 0.3 if s_ % 2 else -0.3)
        if not sparse: beat(B, s_, t, 'four', 0.85)
        if not sparse and s_ == 8: chord(B, ch, t, 1.0, 0.1)
        if res + 0.6 <= at < res + 0.6 + 60 / 100 * 2 and s_ in (0, 8): P(B, 'glass', 86 if s_ else 81, 2.6, t, 0.16, -0.2 if s_ else 0.2)
    section('s09', 100, 16, f_s09, 0.88, mute=[(kill, cue_e('hT') + 0.1)])

    # ── s10：电钢琴和弦、铺底与轻拍子，动机回来；最后一句撤掉鼓 ──
    last = cue_t('k9')
    def f_s10(b, s_, t, B, at):
        ch = ('Bbmaj9', 'C69', 'Dm9', 'A7sus')[b % 4]; bar = BAR(86)
        if s_ == 0: chord(B, ch, t, bar + 0.3, 0.18); P(B, 'pad', tone(ch, 0, 1), bar + 0.5, t, 0.09); P(B, 'sub', tone(ch, 0, 0) if CH[ch][0] < 47 else tone(ch, 0, -1), bar, t, 0.3)
        if b % 2 == 1 and s_ in (2, 4, 6, 8): P(B, 'ep', MOTIF[s_ // 2 - 1], 1.6, t, 0.22, 0.2, 'e')
        if at < last: beat(B, s_, t, 'half', 0.75)
    section('s10', 86, 16, f_s10, 0.88, swing=0.08, echo=(0.75, 0.4, 0.28))

    # ── end：片尾名单，动机再奏一遍，第一次落回主音 D ──
    def f_end(b, s_, t, B, at):
        bar = BAR(84)
        if b == 0 and s_ == 0: chord(B, 'Bbmaj9', t, bar + 0.4, 0.18); P(B, 'sub', 46, bar, t, 0.3); P(B, 'pad', 58, bar + 0.6, t, 0.09)
        if b == 1 and s_ == 0: chord(B, 'A7sus', t, bar + 0.4, 0.18); P(B, 'sub', 45, bar, t, 0.3); P(B, 'pad', 57, bar + 0.6, t, 0.09)
        if b == 2 and s_ == 0: chord(B, 'Dadd9', t, bar * 1.6, 0.2); P(B, 'sub', 38, bar * 1.5, t, 0.32); P(B, 'pad', 62, bar * 1.6, t, 0.1)
        if b == 0 and s_ in (2, 4, 6, 8): P(B, 'ep', MOTIF[s_ // 2 - 1], 1.8, t, 0.24, 0.2, 'e')
        if b == 1 and s_ in (2, 4, 6): P(B, 'ep', MOTIF[s_ // 2 - 1], 1.8, t, 0.24, 0.2, 'e')
        if b == 1 and s_ == 10: P(B, 'ep', 74, 3.2, t, 0.26, 0.1, 'e')          # 第二遍不停在 E，落回 D
        if b == 2 and s_ == 0: P(B, 'glass', 86, 3.0, t, 0.12, 0.25)
    section('end', 84, 16, f_end, 0.85, echo=(0.75, 0.42, 0.3))
    return out
