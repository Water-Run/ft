# PHP2Shell 的配乐脚本：project.json 的 audio.music 写 "tools/music.py"，由 kit/tools/mix.py 载入并调用 compose(ctx)。
#
# 题材是一条安全新闻，要「有节奏感、紧张」，同时旁白要听得清。选择：
#   调性  D 弗里几亚（D Eb F G A Bb C）。持续音一直踩在 D 上，Eb（降二级）只用来制造半音摩擦；结尾停在 Eb，不解决。
#   速度  128 拍/分，最小格是 16 分音符（48 kHz 下恰好 5625 个采样）。
#   层    drone  低音持续音（D1/D2/A2 慢拍频）           bass   锯齿合成低音的固定音型，滤波随段落开合
#         pluck  低音高八度的拨奏，只在重音上（小音箱上也听得到音型）
#         kick   低沉的鼓点（心跳 / 推进 / 半拍化）       tick   钟表式的滴答（3.5 kHz 以上，倒计时感）
#         hat    16 分音符的噪声镲                        stab   不协和的高音和弦簇，只落在旁白的空隙里
#         bell   每章开头的动机 D–Eb–D–A（章节卡无旁白）  data   稀疏的「数据」短鸣（原理、时间线两章）
#         shep   时间线一章一路上行的谢泼德音             shim   高处 D6/Eb6 交替的细线
#         rumble 低频隆隆                                  hit    章节落点：次低音下坠 + 金属 + 低音簇（braam）
#         riser  每章之前的滤波噪声上冲，终点与落点同一个采样
#   段落  open    滴答起步、逐层加厚 → 片名卡重击           what    推进：附点式低音、切分鼓点
#         how     收窄：持续音 + 钟表 + 很暗的八分脉冲      time    最密：层层加码，低音最后四小节半音爬升 D→Eb→E→F，谢泼德音持续上行
#         impact  半拍化的沉重鼓点与低音簇                  now     回落：低音与鼓点退场，只剩钟表走到片尾
#         credits 最后一击；钟声动机停在 Eb 不解决，D 的持续音衰减到无
#   对齐  章节卡的标题在场景开始后 0.32 s 砸下（src/js/config.js 在同一时刻登记 thud）：每章的第一拍、落点与上冲的终点都放在这里。
#         片名卡 oT 是无声句，不进 ctx["cues"]：取开场最后一句结束 + 0.5 s（脚本里 gap 0.4，红字在 oT 后 0.1 s 划入）。
#         段落位置一律从 ctx["scenes"] / ctx["cues"] 取；可在 audio.score 里覆盖 hit_offset、title_offset、credits_offset。
#   旁白  mix.py 会整体压低配乐；这里另外在说话时收暗低音的滤波、压低中频的层（pluck、shim、shep、data），高音和弦只落在空隙。
#   性能  逐音符合成并缓存；持续层是与小节对齐的循环（频率取整到循环内整数周），分块叠加；不对整条分轨做变换。
#         随机数全部固定种子，同样的时间线得到逐采样相同的结果。
import numpy as np

FADE = (0.02, 1.2)                          # 冷开场第一拍就要落地；片尾的衰减由持续音自己完成

BPM = 128.0
BEAT = 60.0 / BPM; STEP = BEAT / 4; BAR = 4 * BEAT
ROOT = 38                                   # D2
HIT_OFF = 0.32                              # 章节卡标题砸下的时刻（相对场景开始）
TITLE_OFF = 0.5                             # 片名卡：开场最后一句结束之后
CRED_OFF = 0.4                              # 片尾名单出现（credits 的 lead）
FC = 120.0 * 2 ** (np.arange(16) / 4)       # 低音滤波截止频率的档位（四分之一倍频程一档，120–1600 Hz）

hz = lambda m: 440.0 * 2 ** ((m - 69) / 12.0)

# 每小节 16 格。低音：(格, 相对根音的半音, 长度/格, 力度)
BASS = {
    "soft8": [(s, 0, 2, 1.0 if s % 8 == 0 else 0.8 if s % 4 == 0 else 0.55) for s in range(0, 16, 2)],
    "p8":    [(0, 0, 2, 1.0), (2, 0, 2, .6), (4, 12, 1, .8), (6, 0, 2, .6), (8, 0, 2, .9), (10, 0, 2, .6), (12, 12, 1, .8), (14, 1, 2, .65)],
    "gal":   [(0, 0, 2, 1.0), (2, 0, 1, .55), (3, 0, 1, .7), (4, 0, 2, .85), (6, 0, 1, .55), (7, 0, 1, .7), (8, 0, 2, .95),
              (10, 0, 1, .55), (11, 0, 1, .7), (12, 12, 2, .85), (14, 0, 1, .55), (15, 1, 1, .75)],
    "s16":   [(s, 12 if s in (6, 14) else 1 if s == 15 else 0, 1, 1.0 if s in (0, 8) else .85 if s in (3, 6, 11, 14) else .5) for s in range(16)],
    "half":  [(0, 0, 6, 1.0), (6, 0, 2, .7), (8, 0, 4, .9), (12, 1, 3, .8)],
    "q":     [(0, 0, 3, 1.0), (4, 0, 3, .65), (8, 0, 3, .85), (12, 0, 3, .65)],
}
KICK = {
    "down":  [(0, 1.0)],
    "heart": [(0, 1.0), (3, .55), (8, .85), (11, .45)],
    "drive": [(0, 1.0), (6, .8), (10, .85)],
    "dense": [(0, 1.0), (3, .6), (6, .85), (8, .8), (10, .85), (13, .5), (14, .7)],
    "half":  [(0, 1.0), (11, .55)],
}
TOM = {"half": [(8, 1.0)]}
TICK = {                                    # (格, 0 = tick / 1 = tock, 力度)
    "q": [(s, 0 if s % 8 == 0 else 1, 1.0 if s % 8 == 0 else .8) for s in (0, 4, 8, 12)],
    "e": [(s, 0 if s % 4 == 0 else 1, 1.0 if s % 4 == 0 else .55) for s in range(0, 16, 2)],
    "s": [(s, 0 if s % 4 == 0 else 1, 1.0 if s % 4 == 0 else .6 if s % 2 == 0 else .35) for s in range(16)],
}
HAT = {"s": [(s, [.35, .2, .8, .2][s % 4]) for s in range(16)], "off": [(s, .8) for s in (2, 6, 10, 14)]}
# 动机：(相对落点的格, MIDI, 力度)。章节卡约 2 s 没有旁白，动机就放在这里
MOTIF = {
    "title":   [(2, 74, 1.0), (4, 75, .9), (6, 74, .8), (10, 69, .9), (16, 62, .7)],
    "what":    [(4, 74, 1.0), (6, 75, .9), (8, 74, .8), (12, 69, .85)],
    "how":     [(4, 62, 1.0), (8, 63, .85), (14, 62, .6)],
    "time":    [(2, 74, 1.0), (3, 75, .8), (4, 74, .8), (5, 75, .8), (6, 74, .85), (8, 69, .9), (10, 81, .55)],
    "impact":  [(4, 62, 1.0), (6, 63, .9), (8, 62, .8), (12, 57, .9)],
    "now":     [(4, 74, .9), (6, 75, .8), (8, 74, .7), (12, 75, .75)],
    "credits": [(4, 74, .8), (10, 75, .7), (16, 74, .6), (24, 75, .65)],
}
# 各段编排。关键帧写成 (段内位置 0–1, 值)；音型写成 (段内位置, 音型名)，在小节线上切换
DEF = dict(rhythm=True, roots=[0], rise=False, heavy=False, bass=[(0, None)], bass_v=[(0, .8)], fc=[(0, 400)], pluck=[(0, 0)], kick=[(0, None)],
           kick_v=[(0, .8)], tom=[(0, None)], tick=[(0, None)], tick_v=[(0, .8)], hat=[(0, None)], hat_v=[(0, .5)], stab=0, stab_oct=0,
           stab_v=.8, data=[(0, 0)], drone=[(0, .7)], shim=[(0, 0)], rumble=[(0, 0)], shep=[(0, 0)])
PROF = {
    "open": dict(roots=[0, 0, 0, 1], bass=[(0, None), (.2, "soft8"), (.46, "p8"), (.74, "gal")], bass_v=[(0, .5), (1, .95)], fc=[(0, 190), (1, 720)],
                 pluck=[(0, 0), (.46, .45), (1, .9)], kick=[(0, None), (.3, "heart"), (.74, "drive")], kick_v=[(0, .55), (1, .9)], tick=[(0, "q"), (.4, "e")], tick_v=[(0, .75), (1, .9)],
                 hat=[(0, None), (.58, "s")], hat_v=[(0, .3), (1, .6)], stab=2, stab_v=.8,
                 drone=[(0, .45), (1, .85)], shim=[(0, .7), (.6, .4), (1, .2)], rumble=[(0, .2), (1, .5)]),
    "title": dict(rhythm=False, drone=[(0, 1.0), (1, .7)], shim=[(0, .15), (1, .45)], rumble=[(0, .9), (1, .35)]),
    "what": dict(roots=[0, 0, -4, 1, 0, 0, -2, 1], bass=[(0, "gal")], bass_v=[(0, .85), (1, .9)], fc=[(0, 460), (1, 560)], pluck=[(0, .75), (1, .85)],
                 kick=[(0, "drive")], kick_v=[(0, .8)], tick=[(0, "e")], tick_v=[(0, .7)], hat=[(0, "s")], hat_v=[(0, .5)], stab=2, stab_v=.75,
                 drone=[(0, .7)], shim=[(0, .15)], rumble=[(0, .25)]),
    "how": dict(roots=[0, 0, 0, 0, 1, 1, 0, 0, -4, -4, 1, 1, 0, 0, 0, 0], bass=[(0, "soft8")], bass_v=[(0, .45), (1, .6)], fc=[(0, 160), (1, 230)], pluck=[(0, .2), (1, .3)],
                kick=[(0, "down")], kick_v=[(0, .45)], tick=[(0, "q")], tick_v=[(0, .9)], stab=4, stab_v=.5, data=[(0, 0), (.1, .06), (1, .1)],
                drone=[(0, .8)], shim=[(0, .4), (.5, .55), (1, .4)], rumble=[(0, .2)]),
    "time": dict(roots=[0, 0, 1, 0, 0, 0, 1, 1], rise=True, bass=[(0, "p8"), (.3, "gal"), (.62, "s16")], bass_v=[(0, .75), (1, 1.0)], fc=[(0, 360), (1, 950)], pluck=[(0, .55), (1, 1.0)],
                 kick=[(0, "heart"), (.3, "drive"), (.68, "dense")], kick_v=[(0, .7), (1, .95)], tick=[(0, "e"), (.5, "s")], tick_v=[(0, .75), (1, .95)],
                 hat=[(0, None), (.15, "s")], hat_v=[(0, .4), (1, .75)], stab=1, stab_v=.75, data=[(0, .05), (1, .12)],
                 drone=[(0, .6), (1, .9)], rumble=[(0, .2), (1, .55)], shep=[(0, 0), (.08, .35), (1, 1.0)]),
    "impact": dict(roots=[0, 0, -4, 1], heavy=True, bass=[(0, "half")], bass_v=[(0, .95), (1, .85)], fc=[(0, 620), (1, 460)], pluck=[(0, .85), (1, .7)],
                   kick=[(0, "half")], kick_v=[(0, 1.0)], tom=[(0, "half")], tick=[(0, "e")], tick_v=[(0, .55)], hat=[(0, "off")], hat_v=[(0, .6)],
                   stab=4, stab_oct=-1, stab_v=.9, drone=[(0, .85), (1, .7)], rumble=[(0, .6), (1, .4)]),
    "now": dict(roots=[0, 0, -4, -2], bass=[(0, "soft8"), (.45, "q"), (.72, None)], bass_v=[(0, .55), (.72, .25)], fc=[(0, 220), (1, 160)], pluck=[(0, .35), (.45, 0)],
                kick=[(0, "heart"), (.4, None)], kick_v=[(0, .45), (.4, .2)], tick=[(0, "q")], tick_v=[(0, .75), (1, .85)],
                drone=[(0, .75), (1, .55)], shim=[(0, .3), (1, .6)], rumble=[(0, .15)]),
    "credits": dict(rhythm=False, drone=[(0, .85), (.35, .55), (.75, .18), (1, 0)], shim=[(0, .5), (.6, .25), (1, 0)], rumble=[(0, .7), (.5, .2), (1, 0)]),
}
# 各层的总增益（混音时整体按峰值归一，峰值落在片名与「影响」两次重击上）
G = dict(bass=.13, pluck=.70, kick=.17, tom=.17, tick=.26, hat=.28, data=.08, stab=.45, bell=.28, riser=.35, drone=.08, shim=.12, rumble=.04, shep=.07,
         hit={"open": .55, "mid": .6, "big": 1.0, "final": .85})


def smooth(x, k):                           # 滑动平均（累加和实现）
    k = max(1, int(k)); c = np.cumsum(np.concatenate([np.zeros(k // 2 + 1), x, np.zeros(k - k // 2)]))
    return ((c[k:] - c[:-k]) / k)[: len(x)]


def lv(kf, f):                              # 关键帧插值
    return float(np.interp(f, [k[0] for k in kf], [k[1] for k in kf]))


def pat(kf, f):                             # 当前生效的音型
    name = None
    for k, v in kf:
        if k <= f + 1e-9: name = v
    return name


class Kit:
    """逐音符合成，同样的音只算一次。返回 float32：立体声 (2, n) 或单声道 (n,)。"""

    def __init__(self, sr):
        self.sr = sr; self.c = {}

    def t(self, n): return np.arange(n) / self.sr
    def tail(self, n, d=0.25): return np.clip((n - np.arange(n)) / (d * self.sr), 0, 1)    # 截断处收尾，免得咔哒
    def nfft(self, n): return 1 << int(np.ceil(np.log2(max(2, n))))

    def filt(self, x, mask, pad=4096):      # 静态 FFT 滤波，补零到 2 的幂
        n = x.shape[-1]; nf = self.nfft(n + pad); fr = np.fft.rfftfreq(nf, 1 / self.sr)
        return np.fft.irfft(np.fft.rfft(x, nf) * mask(fr), nf)[..., :n]

    def ir(self, tau, length):
        key = ("ir", tau, length)
        if key not in self.c:
            n = int(length * self.sr); rng = np.random.default_rng(int(tau * 1000) + 7)
            ir = rng.standard_normal((2, n)) * np.exp(-self.t(n) / tau)
            ir = self.filt(ir, lambda f: 1 / np.sqrt(1 + (f / 4500) ** 2))
            ir[:, : int(0.018 * self.sr)] = 0
            self.c[key] = ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
        return self.c[key]

    def verb(self, x, tau, length, wet):    # 干声 + 湿声（逐音符卷积）
        if x.ndim == 1: x = np.stack([x, x])
        ir = self.ir(tau, length); n = x.shape[1] + ir.shape[1]; nf = self.nfft(n)
        y = wet * np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[:, :n]
        y[:, : x.shape[1]] += x
        return y

    def _saw_lp(self, freqs, n, fc_bright, fc_dark, tau):   # 朴素锯齿叠加 → 两档低通，亮档按 tau 衰减到暗档
        t = self.t(n); x = np.zeros((2, n))
        for i, (f, a) in enumerate(freqs):
            for ch, d in ((0, -1), (1, 1)):
                x[ch] += a * (2 * ((f * (1 + d * 0.0035) * t + 0.37 * i + 0.21 * ch) % 1.0) - 1)
        nf = self.nfft(n + 2048); fr = np.fft.rfftfreq(nf, 1 / self.sr); X = np.fft.rfft(x, nf)
        hp = (fr / 55.0) ** 2 / np.sqrt(1 + (fr / 55.0) ** 4)                                   # 55 Hz 以下收掉：小音箱放不出，只占电平
        lp = lambda c: hp * (1 / np.sqrt(1 + (fr / c) ** 8) + 0.45 * np.exp(-0.5 * ((fr - c) / (0.16 * c)) ** 2))
        dark = np.fft.irfft(X * lp(fc_dark), nf)[:, :n]; bright = np.fft.irfft(X * lp(fc_bright), nf)[:, :n]
        return dark + (bright - dark) * np.exp(-t / tau)

    def bass(self, midi, nst, fci):
        key = ("bass", midi, nst, fci)
        if key not in self.c:
            gate = nst * STEP * 0.86; n = int((gate + 0.035) * self.sr); t = self.t(n); f = hz(midi); fc = FC[fci]
            y = self._saw_lp([(f, 1.0)], n, fc, max(110.0, fc * 0.4), 0.07)
            env = np.minimum(1, t / 0.003) * np.clip((gate + 0.035 - t) / 0.035, 0, 1) * (0.75 + 0.25 * np.exp(-t / 0.12))
            self.c[key] = (np.tanh(1.25 * y * env) / np.tanh(1.25)).astype(np.float32)
        return self.c[key]

    def pluck(self, midi, nst, fci):        # 拨奏：两支略微失谐的锯齿，滤波很快合上
        key = ("pluck", midi, nst, fci)
        if key not in self.c:
            n = int((nst * STEP * 0.9 + 0.03) * self.sr); t = self.t(n); fc = FC[fci]
            y = self._saw_lp([(hz(midi), 1.0), (hz(midi) * 1.002, 0.6)], n, fc, max(200.0, fc * 0.3), 0.05)
            env = np.minimum(1, t / 0.002) * np.exp(-t / 0.09) * np.clip((n / self.sr - t) / 0.02, 0, 1)
            self.c[key] = (y * env).astype(np.float32)
        return self.c[key]

    def kick(self, heavy):
        key = ("kick", heavy)
        if key not in self.c:
            n = int((0.8 if heavy else 0.5) * self.sr); t = self.t(n)
            f = (48 + 115 * np.exp(-t / 0.045)) if heavy else (56 + 110 * np.exp(-t / 0.03))
            body = np.sin(2 * np.pi * np.cumsum(f) / self.sr) * np.exp(-t / (0.22 if heavy else 0.1))
            click = self.filt(np.random.default_rng(21).standard_normal(n) * np.exp(-t / 0.0035), lambda fr: 1 / np.sqrt(1 + (fr / 4000) ** 4))
            y = np.tanh(1.6 * (body + 0.6 * click)) * np.minimum(1, t / 0.0015) * np.clip((n / self.sr - t) / 0.02, 0, 1)
            self.c[key] = y.astype(np.float32)
        return self.c[key]

    def tom(self):
        if "tom" not in self.c:
            n = int(0.9 * self.sr); t = self.t(n)
            body = np.sin(2 * np.pi * np.cumsum(64 + 60 * np.exp(-t / 0.05)) / self.sr) * np.exp(-t / 0.32)
            nz = self.filt(np.random.default_rng(23).standard_normal(n) * np.exp(-t / 0.02), lambda fr: 1 / np.sqrt(1 + (fr / 600) ** 4))
            y = np.tanh(1.4 * (body + 0.25 * nz)) * np.minimum(1, t / 0.002) * self.tail(n)
            y = self.verb(y, 0.5, 1.2, 0.25); self.c["tom"] = (y / np.abs(y).max()).astype(np.float32)
        return self.c["tom"]

    def hat(self, var, opened):
        key = ("hat", var, opened)
        if key not in self.c:
            n = int((0.28 if opened else 0.07) * self.sr); t = self.t(n)
            x = np.random.default_rng(31 + var).standard_normal(n)
            x = self.filt(x, lambda f: (f / 7000) ** 4 / (1 + (f / 7000) ** 4) * (1 + 0.6 * np.exp(-0.5 * ((f - 10500) / 1500) ** 2)))
            self.c[key] = (x * np.exp(-t / (0.07 if opened else 0.013)) * np.minimum(1, t / 0.0005)).astype(np.float32)
        return self.c[key]

    def tick(self, kind):                   # 钟表的滴 / 答：几乎全在 3.5 kHz 以上
        key = ("tick", kind)
        if key not in self.c:
            n = int(0.06 * self.sr); t = self.t(n)
            parts = ((4200, 1.0, .006), (6350, .6, .004), (9100, .35, .0025)) if kind == 0 else ((3500, 1.0, .007), (5600, .55, .0045), (8200, .3, .003))
            y = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in parts)
            cl = np.random.default_rng(41 + kind).standard_normal(n) * np.exp(-t / 0.0006); cl = cl - np.concatenate([[0], cl[:-1]])
            self.c[key] = ((y + 0.5 * cl) * np.minimum(1, t / 0.0003)).astype(np.float32)
        return self.c[key]

    def blip(self, var):                    # 「数据」短鸣：限带方波（A6 / D7 / Eb7 / Ab7）
        key = ("blip", var)
        if key not in self.c:
            n = int(0.05 * self.sr); t = self.t(n); f = hz((93, 98, 99, 104)[var])
            y = sum(np.sin(2 * np.pi * k * f * t) / k for k in range(1, 12, 2) if k * f < 12000)
            self.c[key] = (y * np.exp(-t / 0.01) * np.clip((0.03 - t) / 0.004, 0, 1) * np.minimum(1, t / 0.001)).astype(np.float32)
        return self.c[key]

    def stab(self, semi, octv):             # 半音簇 D5+Eb5+A5（随根音移动），限带锯齿 + 混响
        key = ("stab", semi, octv)
        if key not in self.c:
            n = int(0.32 * self.sr); t = self.t(n); x = np.zeros((2, n)); fmax = 3200 if octv >= 0 else 1800
            for i, m in enumerate((74, 75, 81)):
                f0 = hz(m + semi + 12 * octv); pan = (-0.5, 0.5, 0.0)[i]
                for ch, d in ((0, -1), (1, 1)):
                    f = f0 * (1 + d * 0.0045)
                    w = sum(np.sin(2 * np.pi * k * f * t + 0.7 * k * i) / k ** 1.2 for k in range(1, 40) if k * f < fmax)
                    x[ch] += w * np.sqrt(1 + (pan if ch else -pan))
            env = np.minimum(1, t / 0.004) * (0.15 + 0.85 * np.exp(-t / 0.1)) * np.clip((0.32 - t) / 0.06, 0, 1)
            y = self.verb(x * env, 0.55, 2.2, 0.9); self.c[key] = (y / np.abs(y).max()).astype(np.float32)
        return self.c[key]

    def bell(self, midi):                   # FM 钟声，调制比 1.4（非整数，偏玻璃质感）
        key = ("bell", midi)
        if key not in self.c:
            n = int(2.6 * self.sr); t = self.t(n); f = hz(midi)
            idx = 2.2 * np.exp(-t / 0.25) + 0.3
            y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * 1.4 * f * t)) * np.exp(-t / 0.9)
            y += 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.3); y *= self.tail(n, 0.4)
            y = self.verb(y * np.minimum(1, t / 0.002), 0.8, 2.4, 0.45); self.c[key] = (y / np.abs(y).max()).astype(np.float32)
        return self.c[key]

    def hit(self, kind):                    # open / mid / big / final
        if ("hit", kind) not in self.c:
            L = {"open": 3.0, "mid": 3.5, "big": 6.0, "final": 9.0}[kind]; n = int(L * self.sr); t = self.t(n)
            tb = {"open": .45, "mid": .5, "big": .8, "final": 1.6}[kind]
            nz = lambda x: x / max(1e-9, np.abs(x).max())            # 各成分先按峰值归一，再定比例：落点的峰值可控
            boom = 0.42 * nz(np.tanh(1.4 * np.sin(2 * np.pi * np.cumsum(38 + 80 * np.exp(-t / 0.07)) / self.sr) * np.exp(-t / tb)) * np.minimum(1, t / 0.001))
            cr = self.filt(np.random.default_rng(51).standard_normal(n) * np.exp(-t / 0.045), lambda f: 1 / np.sqrt(1 + (f / (2400 if kind in ("big", "final") else 1600)) ** 4))
            base = hz(26 if kind == "final" else 38); metal = np.zeros((2, n)); slow = 2.6 if kind in ("big", "final") else 1.6
            for i, r in enumerate((1.0, 1.52, 2.07, 2.71, 3.39, 4.23, 5.47)):
                for ch, d in ((0, -1), (1, 1)):
                    metal[ch] += np.sin(2 * np.pi * base * r * (1 + d * 0.0015) * t + i) * np.exp(-t / (slow / (1 + 0.45 * i))) / (1 + 0.55 * i)
            fe = self.tail(n, 0.6)
            y = self.verb((0.3 * nz(cr) + 0.3 * nz(metal)) * fe, 1.2, 3.5, 0.6)
            y[:, :n] += boom * fe
            if kind in ("big", "final"):    # braam：D1 D2 A2 D3 Eb3 的锯齿簇，D3 与 Eb3 相差半音，约 8 Hz 的拍频
                br = self._saw_lp([(hz(m), a) for m, a in ((26, 1.0), (38, .8), (45, .5), (50, .45), (51, .45))], n, 1400.0, 380.0, 0.6)
                env = np.minimum(1, t / 0.04) * np.exp(-t / (3.0 if kind == "final" else 1.5))
                y[:, :n] += 0.3 * nz(np.tanh(1.2 * br * env)) * fe
            self.c[("hit", kind)] = y.astype(np.float32)
        return self.c[("hit", kind)]

    def riser(self, L):                     # 带通噪声从 250 Hz 扫到 7 kHz + 按八分音符颤动的上滑音，终点即落点
        key = ("riser", L)
        if key not in self.c:
            n = int(L * self.sr); t = self.t(n); k = t / L
            x = np.random.default_rng(61).standard_normal((2, n)); W, H = 2048, 512
            win = np.hanning(W); fr = np.fft.rfftfreq(W, 1 / self.sr); lf = np.log2(np.maximum(fr, 1.0))
            xp = np.concatenate([np.zeros((2, W)), x, np.zeros((2, W))], axis=1); y = np.zeros_like(xp)
            for p in range(0, n + W, H):
                c = np.clip((p + W / 2 - W) / n, 0, 1); fc = 250 * (7000 / 250) ** (c ** 1.6)
                m = np.exp(-0.5 * ((lf - np.log2(fc)) / 0.7) ** 2)
                y[:, p:p + W] += win * np.fft.irfft(np.fft.rfft(win * xp[:, p:p + W]) * m, W)
            band = y[:, W:W + n] / 1.5
            band /= max(1e-9, np.sqrt(np.mean(band[:, -n // 8:] ** 2)) * 4)
            tone = np.sin(2 * np.pi * np.cumsum(hz(50 + 36 * k ** 1.5)) / self.sr) * (0.55 + 0.45 * np.cos(2 * np.pi * (L - t) / (2 * STEP)))
            y = (band + 0.25 * k ** 1.5 * tone) * k ** 2.2 * np.clip((L - t) / 0.01, 0, 1)
            self.c[key] = y.astype(np.float32)
        return self.c[key]

    def loop_len(self): return int(round(8 * BAR * self.sr))

    def drone(self):                        # 8 小节的循环；频率取整到循环内的整数周，首尾无缝
        n = self.loop_len(); Ls = n / self.sr; t = self.t(n); q = lambda f: round(f * Ls) / Ls; y = np.zeros((2, n))
        parts = [(hz(26), .08, 0, 0.0), (hz(26) + .13, .06, 0, 1.3), (hz(38), .36, -.25, .4), (hz(38) + .19, .27, .25, 2.1),
                 (hz(45), .3, .3, 1.0), (hz(45) - .11, .22, -.3, 2.8), (hz(50), .16, -.1, .7), (hz(57), .08, .2, 1.9), (hz(62), .05, -.3, .2)]
        parts += [(hz(38) * k, 0.24 / k ** 1.1, 0.15 * (-1) ** k, 0.5 * k) for k in range(2, 9)]
        for i, (f, a, p, ph) in enumerate(parts):
            s = a * np.sin(2 * np.pi * q(f) * t + ph) * (0.78 + 0.22 * np.sin(2 * np.pi * (1 + i % 3) * t / Ls + 1.7 * ph))
            y[0] += s * np.sqrt(1 - p); y[1] += s * np.sqrt(1 + p)
        return (y / np.abs(y).max()).astype(np.float32)

    def shim(self):                         # 高处的细线：D6 与 Eb6 交替浮现，A6、D7 若有若无
        n = self.loop_len(); Ls = n / self.sr; t = self.t(n); q = lambda f: round(f * Ls) / Ls; y = np.zeros((2, n))
        sw = 0.5 + 0.5 * np.sin(2 * np.pi * 2 * t / Ls)
        for f, a, p, e in ((hz(86), .5, -.4, sw), (hz(87), .4, .4, 1 - sw), (hz(93), .25, -.2, 0.6 + 0.4 * np.sin(2 * np.pi * 3 * t / Ls)), (hz(98), .12, .3, 1.0)):
            s = a * e * (np.sin(2 * np.pi * q(f) * t) + np.sin(2 * np.pi * q(f + 0.6) * t + 1.0)) * 0.5
            y[0] += s * np.sqrt(1 - p); y[1] += s * np.sqrt(1 + p)
        return (y / np.abs(y).max()).astype(np.float32)

    def rumble(self):                       # 低频隆隆：长度 2 的幂的噪声做循环滤波，首尾无缝
        n = 1 << 20; fr = np.fft.rfftfreq(n, 1 / self.sr); y = np.zeros((2, n))
        m = 1 / (1 + (fr / 70) ** 4) * (fr / 25) ** 2 / (1 + (fr / 25) ** 2)
        for ch in range(2):
            y[ch] = np.fft.irfft(np.fft.rfft(np.random.default_rng(71 + ch).standard_normal(n)) * m, n)
        return (y / (4 * np.sqrt(np.mean(y ** 2)))).astype(np.float32)

    def shepard(self, tt, t0):              # 谢泼德音：6 个八度间隔的分量一起上行，升余弦包络让首尾分量隐没；按八分音符颤动
        K, rate, fmin = 6, 0.06, 140.0; y = np.zeros(len(tt)); d = tt - t0
        for i in range(K):
            p = (i + rate * d) % K
            amp = (0.5 - 0.5 * np.cos(2 * np.pi * p / K)) ** 2
            y += amp * np.sin(2 * np.pi * fmin * 2 ** p / (rate * np.log(2)) + 1.3 * i)
        y *= 0.65 + 0.35 * np.cos(2 * np.pi * d / (2 * STEP))
        return np.stack([y, np.roll(y, int(0.011 * self.sr))])


def compose(ctx):
    sr = int(ctx["sr"]); N = int(ctx["n"]); total = float(ctx["total"])
    opts = (ctx.get("audio") or {}).get("score"); opts = opts if isinstance(opts, dict) else {}
    hit_off = float(opts.get("hit_offset", HIT_OFF)); title_off = float(opts.get("title_offset", TITLE_OFF)); cred_off = float(opts.get("credits_offset", CRED_OFF))
    cues = sorted(ctx.get("cues") or [], key=lambda c: c["start"])
    scenes = sorted(ctx.get("scenes") or [], key=lambda s: s["start"]) or [{"id": "open", "start": 0.0, "end": total}]
    K = Kit(sr); out = np.zeros((2, N), dtype=np.float32)

    # 说话的包络（200 Hz 控制率）：speak 平滑，talk 用来找旁白的空隙
    CR = 200; nc = int(total * CR) + 2 * CR; talk = np.zeros(nc)
    for c in cues: talk[max(0, int((c["start"] - 0.1) * CR)): max(0, int((c["end"] + 0.15) * CR))] = 1
    sm = smooth(smooth(talk, 0.25 * CR), 0.25 * CR); xc = np.arange(nc)
    speak = lambda t: np.interp(np.asarray(t) * CR, xc, sm)
    quiet = lambda t, a, b: not talk[max(0, int((t + a) * CR)): max(0, int((t + b) * CR))].any()

    # 段落：开场（自 0 起）→ 片名卡 → 各章（落点 = 场景开始 + 0.32 s）→ 片尾
    R = []
    for k, s in enumerate(scenes):
        sid = s["id"]; has_voice = any(s["start"] <= c["start"] < s["end"] for c in cues)
        if k == 0:
            R.append(dict(p=sid if sid in PROF else "open", t0=s["start"], hit="open"))
            own = [c for c in cues if s["start"] <= c["start"] < s["end"]]
            tt = (own[-1]["end"] + title_off) if own else s["end"] - 3.6
            if s["start"] + 4 < tt < s["end"] - 1.0: R.append(dict(p="title", t0=tt, hit="big"))
        elif sid == "credits" or (k == len(scenes) - 1 and not has_voice):
            R.append(dict(p="credits", t0=min(s["start"] + cred_off, s["end"]), hit="final"))
        else:
            p = sid if sid in PROF and sid not in ("open", "title", "credits") else "what"
            R.append(dict(p=p, t0=s["start"] + hit_off, hit="big" if p == "impact" else "mid"))
    for i, r in enumerate(R):
        r["t1"] = R[i + 1]["t0"] if i + 1 < len(R) else total
        r["P"] = {**DEF, **PROF[r["p"]]}

    def put(y, t, g, pan=0.0):
        i = int(round(t * sr))
        if g <= 0 or i >= N: return
        if i < 0: y = y[..., -i:]; i = 0
        j = min(N, i + y.shape[-1]); gl, gr = g * np.sqrt(1 - pan), g * np.sqrt(1 + pan)
        if y.ndim == 1: out[0, i:j] += y[: j - i] * gl; out[1, i:j] += y[: j - i] * gr
        else: out[0, i:j] += y[0, : j - i] * gl; out[1, i:j] += y[1, : j - i] * gr

    fci = lambda fc: int(np.clip(round(4 * np.log2(max(fc, 1.0) / FC[0])), 0, len(FC) - 1))

    # ── 有节拍的层：每段从落点起排小节；下一段之前留一到两拍的空，让上冲独自顶上去 ──
    for ri, r in enumerate(R):
        P = r["P"]
        if not P["rhythm"]: continue
        s0, t1 = r["t0"], r["t1"]; nxt = R[ri + 1]["p"] if ri + 1 < len(R) else None
        brk = 2 * BEAT if nxt in ("title", "impact") else BEAT if nxt else 0.0
        stop = t1 - brk; dur = max(1e-6, t1 - s0)
        bars = []
        while s0 + len(bars) * BAR + BEAT <= stop: bars.append(len(bars))
        nb = len(bars); rng = np.random.default_rng(100 + ri)
        for b in bars:
            tb = s0 + b * BAR; f = (tb - s0) / dur
            root = P["roots"][b % len(P["roots"])]
            if P["rise"] and nb >= 6 and b >= nb - 4: root = (0, 1, 2, 3)[b - (nb - 4)]      # 时间线的最后四小节：D → Eb → E → F
            bp = pat(P["bass"], f)
            if bp:
                gv = lv(P["bass_v"], f); fcv = lv(P["fc"], f); pl = lv(P["pluck"], f)
                for st, semi, ln, vel in BASS[bp]:
                    t = tb + st * STEP
                    if t >= stop - 0.02: continue
                    ln = max(1, min(ln, int((stop - t) / STEP + 1e-6))); sp = float(speak(t))
                    fc = fcv * (0.75 + 0.35 * vel) * (1 - 0.3 * sp)
                    put(K.bass(ROOT + root + semi, ln, fci(fc)), t, G["bass"] * gv * vel)
                    if pl > 0 and vel >= 0.7:
                        put(K.pluck(ROOT + 12 + root + semi, min(ln, 2), fci(3 * fc)), t, G["pluck"] * pl * vel * (1 - 0.5 * sp), 0.2 if st % 8 else -0.2)
            kp = pat(P["kick"], f)
            if kp:
                for st, vel in KICK[kp]:
                    t = tb + st * STEP
                    if (b, st) != (0, 0) and t < stop - 0.02: put(K.kick(P["heavy"]), t, G["kick"] * lv(P["kick_v"], f) * vel)
            tp = pat(P["tom"], f)
            if tp:
                for st, vel in TOM[tp]:
                    t = tb + st * STEP
                    if b > 0 and t < stop - 0.02: put(K.tom(), t, G["tom"] * vel, 0.15)
            cp = pat(P["tick"], f)
            if cp:
                for st, kind, vel in TICK[cp]:
                    t = tb + st * STEP
                    if t < stop - 0.01: put(K.tick(kind), t, G["tick"] * lv(P["tick_v"], f) * vel, -0.3)
            hp = pat(P["hat"], f)
            if hp:
                for st, vel in HAT[hp]:
                    t = tb + st * STEP
                    if t < stop - 0.01: put(K.hat((b * 16 + st) % 4, hp == "s" and st == 14 and b % 2 == 1), t, G["hat"] * lv(P["hat_v"], f) * vel, 0.35)
            dd = lv(P["data"], f)
            for st in range(16):                     # 每格都取一次随机数，结果不随编排的其余部分变化
                u, v, pn = rng.random(), int(rng.integers(4)), float(rng.uniform(-0.7, 0.7)); t = tb + st * STEP
                if u < dd and t < stop - 0.05: put(K.blip(v), t, G["data"] * (1 - 0.5 * float(speak(t))), pn)
            ks = P["stab"]
            if ks and b > 0 and b % ks == 0:
                t = tb + (0, 6, 10)[(b // ks) % 3] * STEP
                if t < stop - 0.3 and quiet(t, -0.08, 0.55): put(K.stab(root, P["stab_oct"]), t, G["stab"] * P["stab_v"])

    # ── 落点、动机、上冲 ──
    for ri, r in enumerate(R):
        put(K.hit(r["hit"]), r["t0"], G["hit"][r["hit"]])
        if r["p"] == "open": put(K.stab(0, 0), r["t0"], G["stab"] * 0.9)                 # 冷开场的第一声
        for st, m, vel in MOTIF.get(r["p"], []):
            t = r["t0"] + st * STEP
            if t < r["t1"] - 0.2: put(K.bell(m), t, G["bell"] * vel, 0.3 if st % 4 else -0.3)
        if ri > 0 and r["hit"] in ("mid", "big"):
            L = min({"title": BAR, "impact": 2 * BAR}.get(r["p"], BAR), 0.6 * (r["t0"] - R[ri - 1]["t0"]))
            if L > 0.4:
                y = K.riser(round(L, 4)); i0 = int(round(r["t0"] * sr)) - y.shape[1]
                put(y, i0 / sr, G["riser"] * {"impact": 1.0, "title": .9, "time": .85}.get(r["p"], .7))

    # ── 持续层：关键帧换算到绝对时间，相邻两段在交界处约 0.6 s 内过渡；分块叠加 ──
    def keys(name):
        xs, ys = [], []
        for r in R:
            kf = sorted(r["P"][name]); kf = ([(0.0, kf[0][1])] if kf[0][0] > 0 else []) + kf + ([(1.0, kf[-1][1])] if kf[-1][0] < 1 else [])
            a, b = r["t0"], r["t1"]; pad = min(0.3, 0.1 * (b - a))
            for f, v in kf: xs.append(a + pad + f * (b - a - 2 * pad)); ys.append(v)
        xs = np.maximum.accumulate(np.asarray(xs) + np.arange(len(xs)) * 1e-6)
        return xs, np.asarray(ys, dtype=float)
    loops = {"drone": K.drone(), "shim": K.shim(), "rumble": K.rumble()}
    kd, ks_, kr, kp_ = keys("drone"), keys("shim"), keys("rumble"), keys("shep")
    shep_t0 = next((r["t0"] for r in R if max(v for _, v in r["P"]["shep"]) > 0), 0.0)
    CH = 1 << 18
    for c0 in range(0, N, CH):
        c1 = min(N, c0 + CH); idx = np.arange(c0, c1); tt = idx / sr; sp = speak(tt)
        out[:, c0:c1] += np.take(loops["drone"], idx, axis=1, mode="wrap") * (np.interp(tt, *kd) * G["drone"])
        g = np.interp(tt, *ks_) * G["shim"] * (1 - 0.6 * sp)
        if g.max() > 0: out[:, c0:c1] += np.take(loops["shim"], idx, axis=1, mode="wrap") * g
        g = np.interp(tt, *kr) * G["rumble"]
        if g.max() > 0: out[:, c0:c1] += np.take(loops["rumble"], idx, axis=1, mode="wrap") * g
        g = np.interp(tt, *kp_) * G["shep"] * (1 - 0.5 * sp)
        if g.max() > 0: out[:, c0:c1] += K.shepard(tt, shep_t0) * g
    return out
