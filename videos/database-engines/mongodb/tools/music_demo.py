# -*- coding: utf-8 -*-
"""MongoDB / WiredTiger 一集：配乐的三个调调 Demo（给策划者在本地审片页上选）。

用途
    审片页上并排试听的三段约 60 秒的配乐小样，各有自己的速度、节奏、音色与动机，
    都走「引子 → 推进 → 最高处 → 收束」。不是正式配乐；选定之后，正式的 tools/music.py
    沿用这里的音色函数与编排写法，把段落起止改从 ctx["scenes"] / ctx["cues"] 取
    （见 docs/guides/sound.md 3.1：compose(ctx) 返回 (2, N)，电平、压低与限幅由 mix.py 统一处理）。

运行
    py -3 videos/database-engines/mongodb/tools/music_demo.py          # 三段全做
    py -3 videos/database-engines/mongodb/tools/music_demo.py B        # 只做 B
    产物：out/audition/music-A.wav、music-B.wav、music-C.wav（48 kHz 立体声 24 bit），
    找得到 ffmpeg 时另出同名 .mp3，并用 ebur128 复测响度；数值自检写到 out/audition/music-demo.json。
    只依赖 numpy；随机数全部固定种子，同样的代码得到逐样本相同的结果。

响度
    整体按 BS.1770 的 K 加权与门限算到约 -16 LUFS，采样峰值不超过 -1 dBFS（块级前瞻限幅只兜底）。
    低于 30 Hz 切掉；混响的回授里不留 180 Hz 以下，免得低频发闷。铺底低频持续存在，但不压过中频。

────────────────────────────────────────────────────────────────────────
A「叶脉」  84 拍/分，4/4，F 大调（利底亚色彩）。20 小节 + 3.5 秒余响 ≈ 60.6 秒
    和声：Fmaj9 | C/E | Dm9 | B♭maj9(#11) | C11 | Am7 | Gm9；低音沿 F–E–D–B♭ 往下走，像叶脉从主脉分出去。
    动机：木槌（模态合成，近马林巴的温暖拨击）在 F 五声里「C–F–G–A–G–C」先上扬再回到起点，
          应答句「D–C–A」下行；推进末与最高处末用爬升句「C–F–G–A–B♭–C」把人送上去。
    节奏：中音区木槌琶音按 3+3+2 的八分音符分组（不对称、像枝杈），低音木槌与毡头鼓在最高处走同一 3+3+2。
    段落：引子 0–4（铺底与低频进来，动机只露前半） | 推进 4–11（琶音先只打 3+3+2 的重音，第 6 小节起铺满，第 8 小节进沙锤）
          | 最高处 11–17（铺底开亮、加高八度，动机加八度叠音，低音区的气声长音对位，低音木槌与毡头鼓）
          | 收束 17–20（Dm9 上长音 A，B♭ 上应答句放慢，回到 F：只剩铺底、低频与最后两个音）

B「日志脉搏」 104 拍/分，4/4，A 小调（多利亚色彩）。26 小节 + 2.5 秒余响 ≈ 62.5 秒
    和声：Am9 | Fmaj9(#11) | Dm9 | Esus → E7；最高处转到 Fmaj9(#11) | Cmaj9 | Dm9 | Esus → E7，回 Am9。
    动机：玻璃钟（非谐分音的加法合成）「E–E–A–B」（同音连击像一次次落日志）+ 应答「C–B–A–E」；
          Esus / E 上把 C 换成 D。附点八分的乒乓延迟让每声钟有回声，像日志的回放。
    节奏：低音脉冲是一只「提交的时钟」：引子四分音符，推进起八分音符，最高处反拍加高八度；
          第 8 小节起极轻的十六分「嘀嗒」（日志每 100 ms 落盘的意象，不卡真实时间）。
          铺底随拍子轻微起伏（侧链式的呼吸）。
    段落：引子 0–4（铺底、四分脉冲、一声远处的钟） | 推进 4–14（八分脉冲、钟的动机两次、嘀嗒进来、第 10 小节反拍拨弦）
          | 最高处 14–22（转到大调色彩的 F–C，动机每两小节一次并叠低八度的玻璃长音，十六分拨弦，轻踩的低鼓）
          | 收束 22–26（回到 Am9，脉冲退回四分再到二分，动机最后半句，钟声余响）

C「档案」  70 拍/分，4/4，C 小调。17 小节 + 4 秒余响 ≈ 62.3 秒
    和声：引子在 C 持续低音上 Cm | A♭maj7/C | Fm/C | Cm；推进 Cm | A♭maj7 | E♭ | B♭ | Fm9；
          最高处 A♭ | B♭ | Cm | E♭/B♭；收束 A♭maj7 | Fm9 | Gsus4 → G7 | Cm(add9)。
    动机：低音区钢琴「C–G–A♭–G」（五度上去、半音倚音、落回五度），像翻开一页旧档案；推进里随和声移位并加左手八度。
          最高处由弦乐把动机放宽成「C–E♭ | D–F | G–F | E♭–D」的长音，大提琴低八度齐奏。
    节奏：弦乐长音为主；推进末（第 8 小节后半）定音鼓滚奏渐强，最高处每小节第 1、3 拍一记低沉的大鼓，收束第一拍一记轻的。
    段落：引子 0–4（低弦持续音与暗的弦乐和弦，钢琴动机独奏） | 推进 4–9（钢琴动机加左手，弦乐渐亮渐满）
          | 最高处 9–13（弦乐旋律与高八度、低弦加厚、低鼓；不用铜管与合唱） | 收束 13–17（弦乐收暗，钢琴独自把动机走完，停在 Cm(add9)）
"""
import json, os, re, shutil, subprocess, sys, wave
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
ROOT = VIDEO
while ROOT != os.path.dirname(ROOT) and not os.path.isdir(os.path.join(ROOT, "kit")):
    ROOT = os.path.dirname(ROOT)
OUTDIR = os.path.join(VIDEO, "out", "audition")
TARGET_LUFS = -16.0
CEILING = 10 ** (-1.0 / 20)


# ───────────────────────────── 基础工具 ─────────────────────────────
def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def pow2(n):
    return 1 << int(np.ceil(np.log2(max(2, n))))


def fft_filter(x, mag):
    """零相位的频域滤波；变换长度取 2 的幂并留出余量，避免回卷。"""
    n = x.shape[-1]
    nf = pow2(n + 16384)
    f = np.fft.rfftfreq(nf, 1.0 / SR)
    X = np.fft.rfft(x, nf, axis=-1)
    X *= mag(f)
    return np.fft.irfft(X, nf, axis=-1)[..., :n]


def hp(fc, order=2):
    return lambda f: 1.0 / np.sqrt(1.0 + (fc / np.maximum(f, 1e-3)) ** (2 * order))


def lp(fc, order=2):
    return lambda f: 1.0 / np.sqrt(1.0 + (f / fc) ** (2 * order))


def peq(fc, db, bw_oct):
    return lambda f: 10 ** (db / 20.0 * np.exp(-0.5 * (np.log2(np.maximum(f, 1.0) / fc) / bw_oct) ** 2))


def chain(*fs):
    def g(f):
        out = np.ones_like(f)
        for h in fs:
            out = out * h(f)
        return out
    return g


def env(n, a, dur, r, dec=None, floor=0.0):
    """起音 a 秒（升余弦）→（可选）指数衰减到 floor → dur 秒处开始释放 r 秒。"""
    t = np.arange(n) / SR
    e = np.ones(n)
    if a > 0:
        m = t < a
        e[m] = 0.5 - 0.5 * np.cos(np.pi * t[m] / a)
    if dec:
        m = t >= a
        e[m] *= floor + (1 - floor) * np.exp(-(t[m] - a) / dec)
    m = t >= dur
    if r > 0:
        e[m] *= 0.5 + 0.5 * np.cos(np.pi * np.clip((t[m] - dur) / r, 0, 1))
    else:
        e[m] = 0
    return e


def pan2(sig, pan):
    a = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    return np.vstack([sig * np.cos(a), sig * np.sin(a)])


class Bus:
    def __init__(self, n):
        self.x = np.zeros((2, n))

    def add(self, sig, t0, gain=1.0, pan=0.0):
        i0 = int(round(t0 * SR))
        if i0 >= self.x.shape[1]:
            return
        st = pan2(sig, pan) if sig.ndim == 1 else sig
        if i0 < 0:
            st = st[:, -i0:]
            i0 = 0
        k = min(st.shape[1], self.x.shape[1] - i0)
        self.x[:, i0:i0 + k] += gain * st[:, :k]


def automation(n, pts):
    """pts: [(秒, 增益), …] 分段线性。"""
    ts, gs = zip(*pts)
    return np.interp(np.arange(n) / SR, ts, gs)


def noise(n, seed):
    return np.random.default_rng(seed).standard_normal(n)


# ───────────────────────────── 波表振荡器 ─────────────────────────────
TN = 8192
_PH = np.random.default_rng(1234).uniform(0, 2 * np.pi, TN // 2 + 1)
_TABS = {}


def wtable(f0, bright, tilt=1.0, even=1.0, fmax=15000.0):
    """带限的单周期波表：谐波按 k^-tilt 衰减，再经过 bright Hz 处的二阶低通；even 调偶次谐波（小于 1 更空、更「玻璃」）。"""
    key = (round(f0, 3), int(bright), tilt, even)
    if key in _TABS:
        return _TABS[key]
    K = int(min(fmax, 0.45 * SR) / f0)
    K = max(1, min(K, TN // 2 - 1))
    k = np.arange(1, K + 1, dtype=float)
    a = k ** (-tilt) / np.sqrt(1 + (k * f0 / bright) ** 4)
    a[1::2] *= even
    spec = np.zeros(TN // 2 + 1, complex)
    spec[1:K + 1] = a * TN / 2 * np.exp(1j * (_PH[1:K + 1] - np.pi / 2))
    tab = np.fft.irfft(spec, TN)
    tab /= np.sqrt(np.sum(a ** 2) / 2)
    tab = np.append(tab, tab[0])
    _TABS[key] = tab
    return tab


def wt_read(tab, ph):
    p = (ph - np.floor(ph)) * TN
    i = np.minimum(p.astype(np.int64), TN - 1)
    fr = p - i
    return tab[i] + (tab[i + 1] - tab[i]) * fr


def osc(tabs, f0, n, detunes, seed, vib=0.0, vib_rate=5.2, vib_delay=0.0, drift=0.0, spread=0.6):
    """多个微失谐的声部读同一组波表（tabs = [(表, 权重), …]，权重可随时间变化以平滑改变明暗），按声部散开到左右。"""
    rng = np.random.default_rng(seed)
    t = np.arange(n) / SR
    L = np.zeros(n)
    R = np.zeros(n)
    nv = len(detunes)
    for i, c in enumerate(detunes):
        f = f0 * 2 ** (c / 1200.0)
        mod = np.ones(n)
        if vib:
            ramp = np.clip(t / vib_delay, 0, 1) if vib_delay else 1.0
            mod = mod + vib * ramp * np.sin(2 * np.pi * vib_rate * (1 + 0.06 * rng.uniform(-1, 1)) * t + rng.uniform(0, 2 * np.pi))
        if drift:
            mod = mod + drift * np.sin(2 * np.pi * rng.uniform(0.05, 0.22) * t + rng.uniform(0, 2 * np.pi))
        ph = np.cumsum(f * mod) / SR + rng.random()
        s = np.zeros(n)
        for tab, w in tabs:
            s += w * wt_read(tab, ph)
        p = spread * ((i / (nv - 1)) * 2 - 1) if nv > 1 else 0.0
        a = (p + 1) * np.pi / 4
        L += s * np.cos(a)
        R += s * np.sin(a)
    return np.vstack([L, R]) / np.sqrt(nv)


# ───────────────────────────── 音色 ─────────────────────────────
_CACHE = {}


def cached(key, fn):
    if key not in _CACHE:
        _CACHE[key] = fn()
    return _CACHE[key]


def mallet(m, vel, ring=1.8, bright=1.0):
    """木槌：基音 + 近马林巴的 3.93 / 9.2 倍非谐分音（高分音衰减更快）+ 很短的槌头噪声。"""
    def make():
        f0 = hz(m)
        tau = ring * (440.0 / f0) ** 0.35
        n = int((tau * 4 + 0.05) * SR)
        t = np.arange(n) / SR
        s = np.zeros(n)
        parts = [(1.0, 1.0, tau), (1.0021, 0.18, tau * 0.8), (2.0, 0.07, tau * 0.35),
                 (3.93, 0.26 * bright, tau * 0.16), (9.2, 0.06 * bright, tau * 0.05)]
        for q, (r, a, tq) in enumerate(parts):
            if f0 * r < 14000:
                s += a * np.sin(2 * np.pi * f0 * r * t + q) * np.exp(-t / tq)
        k = int(0.025 * SR)
        click = fft_filter(noise(k, int(m * 7 + 3)), chain(hp(600), lp(2800))) * np.exp(-np.arange(k) / (0.004 * SR))
        s[:k] += 0.06 * bright * click / (np.abs(click).max() + 1e-9)
        s *= env(n, 0.002, n / SR, 0)
        s[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))
        return s
    return vel * cached(("mallet", m, ring, bright), make)


def bell(m, vel, ring=2.4):
    """玻璃钟：Risset 式的非谐分音，基音成对微失谐带出缓慢的拍音。"""
    def make():
        f0 = hz(m)
        n = int(ring * 3.2 * SR)
        t = np.arange(n) / SR
        parts = [(1.0, 1.0, 1.0), (1.0017, 0.55, 0.85), (2.0, 0.2, 0.5), (2.76, 0.42, 0.36),
                 (4.07, 0.17, 0.2), (5.40, 0.18, 0.14), (8.93, 0.05, 0.06)]
        s = np.zeros(n)
        for q, (r, a, tq) in enumerate(parts):
            if f0 * r < 13000:
                s += a * np.sin(2 * np.pi * f0 * r * t + 0.7 * q) * np.exp(-t / (ring * tq))
        s *= env(n, 0.0015, n / SR, 0)
        s[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))
        return s / 1.6
    return vel * cached(("bell", m, ring), make)


def pulse(m, vel, length=0.32, bright=0.35):
    """低音脉冲：正弦 + 2、3 次谐波（小音箱上也听得到），起头一点音高下滑带出「咚」。"""
    def make():
        f0 = hz(m)
        n = int(length * SR)
        t = np.arange(n) / SR
        f = f0 * (1 + 0.22 * np.exp(-t / 0.012))
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = np.sin(ph) + bright * 0.7 * np.sin(2 * ph) + bright * 0.3 * np.sin(3 * ph)
        return s * env(n, 0.004, length - 0.04, 0.04) * np.exp(-t / 0.12)
    return vel * cached(("pulse", m, length, bright), make)


def tick(vel, var):
    def make():
        n = int(0.03 * SR)
        s = fft_filter(noise(n, 900 + var), chain(hp(3800, 3), lp(9000))) * np.exp(-np.arange(n) / (0.0035 * SR))
        return s / (np.abs(s).max() + 1e-9)
    return vel * cached(("tick", var), make)


def shaker(vel, var):
    def make():
        n = int(0.09 * SR)
        t = np.arange(n) / SR
        s = fft_filter(noise(n, 700 + var), chain(hp(4500, 2), lp(11000)))
        s *= (1 - np.exp(-t / 0.004)) * np.exp(-t / 0.028)
        return s / (np.abs(s).max() + 1e-9)
    return vel * cached(("shaker", var), make)


def thump(vel, f_hi=110.0, f_lo=46.0, tau_f=0.035, tau_a=0.32, length=0.9, body=0.0, grit=0.04, seed=5):
    """低沉的鼓：音高从 f_hi 掉到 f_lo；body 加 1.5 倍的鼓身分音，grit 是低通过的鼓皮噪声。"""
    def make():
        n = int(length * SR)
        t = np.arange(n) / SR
        f = f_lo + (f_hi - f_lo) * np.exp(-t / tau_f)
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = np.sin(ph) * np.exp(-t / tau_a)
        if body:
            s += body * np.sin(1.52 * ph + 0.4) * np.exp(-t / (tau_a * 0.45))
        k = int(0.06 * SR)
        g = fft_filter(noise(k, seed), chain(hp(120), lp(900))) * np.exp(-np.arange(k) / (0.012 * SR))
        s[:k] += grit * g / (np.abs(g).max() + 1e-9)
        s *= env(n, 0.002, length - 0.08, 0.08)
        return s
    return vel * cached(("thump", f_hi, f_lo, tau_f, tau_a, length, body, grit, seed), make)


def fm_pluck(m, vel, ring=0.22, ratio=2.0, index=1.1):
    def make():
        f0 = hz(m)
        n = int(ring * 5 * SR)
        t = np.arange(n) / SR
        I = index * np.exp(-t / 0.05)
        s = np.sin(2 * np.pi * f0 * t + I * np.sin(2 * np.pi * f0 * ratio * t))
        s *= env(n, 0.002, n / SR - 0.03, 0.03) * np.exp(-t / ring)
        return s
    return vel * cached(("fm", m, ring, ratio, index), make)


def piano(m, vel, dur):
    """钢琴：拉伸的分音（弦的非谐性）、按击弦点挖掉的谐波、两段式衰减、成对微失谐的弦，松开后 0.3 秒制音。"""
    vq = round(vel, 2)
    dq = round(dur, 3)

    def make():
        f0 = hz(m)
        n = int((dq + 0.45) * SR)
        t = np.arange(n) / SR
        rng = np.random.default_rng(int(m * 31 + vq * 100))
        B = 0.00022
        out = np.zeros(n)
        for k in range(1, 41):
            fk = k * f0 * np.sqrt(1 + B * k * k)
            if fk > 8500:
                break
            amp = k ** -1.05 * (0.3 + 0.7 * abs(np.sin(np.pi * k / 7.3))) * np.exp(-(k - 1) * (0.2 - 0.11 * vq))
            tau = float(np.clip(4.2 * (220.0 / f0) ** 0.45 / (1 + 0.22 * (k - 1)), 0.08, 12))
            e = 0.62 * np.exp(-t / (tau * 0.2)) + 0.38 * np.exp(-t / tau)
            for det in (-0.4, 0.4):
                out += 0.5 * amp * e * np.sin(2 * np.pi * fk * 2 ** (det / 1200) * t + rng.uniform(0, 2 * np.pi))
        k = int(0.03 * SR)
        h = fft_filter(noise(k, int(m * 13)), chain(hp(80), lp(1500))) * np.exp(-np.arange(k) / (0.006 * SR))
        out[:k] += 0.05 * vq * h / (np.abs(h).max() + 1e-9)
        out *= env(n, 0.0015, dq, 0.32)
        return out * (0.35 + 0.65 * vq)
    return cached(("piano", m, vq, dq), make)


# ───────────────────────────── 编排工具 ─────────────────────────────
def chord_events(prog, bpb=4):
    ev = []
    b = 0.0
    for item in prog:
        parts = [(item, bpb)] if isinstance(item, str) else item
        for name, d in parts:
            if ev and ev[-1][0] == name:
                ev[-1][2] += d
            else:
                ev.append([name, b, d])
            b += d
    return ev


def render_sustain(bus, events, notes_of, beat, bright_pts, tilt, even, detunes, attack, release,
                   gain=1.0, seed=10, drift=0.0008, spread=0.8, vib=0.0, vib_delay=0.0, overlap=0.12, octave=0,
                   only=None, attack_fn=None):
    """长音层（铺底、弦乐、低频）：每个和弦一个音组，明暗按 bright_pts（[(秒, Hz), …]）在音内平滑过渡。"""
    bt, bv = zip(*bright_pts)
    for j, (name, sb, db) in enumerate(events):
        t0 = sb * beat
        if only and not (only[0] <= t0 < only[1]):
            continue
        dur = db * beat + overlap
        n = int((dur + release) * SR)
        b0 = float(np.interp(t0, bt, bv))
        b1 = float(np.interp(t0 + dur, bt, bv))
        w = np.linspace(0, 1, n)
        ns = notes_of(name)
        a = attack_fn(t0) if attack_fn else attack
        for q, m in enumerate(ns):
            m2 = m + octave
            f = hz(m2)
            tabs = [(wtable(f, b0, tilt, even), 1 - w), (wtable(f, b1, tilt, even), w)]
            s = osc(tabs, f, n, detunes, seed=seed + 97 * j + q, drift=drift, spread=spread, vib=vib, vib_delay=vib_delay)
            s *= env(n, a, dur, release)
            bus.add(s, t0, gain / np.sqrt(len(ns)))


def make_ir(rt_low, rt_high, predelay, seed, length=None, hp_hz=180.0):
    """合成的立体声混响冲激：三段频带各自衰减（高频衰得快）+ 少量早期反射；回授里切掉 hp_hz 以下。"""
    length = length or min(1.25 * rt_low, 6.0)
    n = int(length * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(seed)
    nf = pow2(n)
    f = np.fft.rfftfreq(nf, 1.0 / SR)
    m_lo = lp(700, 2)(f)
    m_hi = hp(3500, 2)(f)
    m_mid = np.clip(1 - m_lo - m_hi, 0, 1)
    ir = np.zeros((2, n))
    for ch in range(2):
        W = np.fft.rfft(rng.standard_normal(n), nf)
        for mask, rt in ((m_lo, rt_low), (m_mid, 0.82 * rt_low + 0.18 * rt_high), (m_hi, rt_high)):
            ir[ch] += np.fft.irfft(W * mask, nf)[:n] * np.exp(-6.91 * t / rt)
    ir *= 1 - np.exp(-t / 0.012)
    taps = [(0.011, 0.5), (0.017, 0.38), (0.023, 0.42), (0.031, 0.3), (0.043, 0.26), (0.059, 0.2), (0.071, 0.15)]
    for q, (d, g) in enumerate(taps):
        ch = q % 2
        i = int((d + 0.002 * ch) * SR)
        ir[ch, i] += g * 6 * np.sqrt(np.mean(ir[ch, :int(0.2 * SR)] ** 2))
    ir = fft_filter(ir, chain(hp(hp_hz, 2), lp(9000, 1)))
    pd = int(predelay * SR)
    ir = np.concatenate([np.zeros((2, pd)), ir], axis=1)
    ir /= np.sqrt(np.sum(ir ** 2) / 2)
    return ir


def convolve(x, ir):
    n = x.shape[1]
    nf = pow2(n + ir.shape[1])
    return np.fft.irfft(np.fft.rfft(x, nf, axis=-1) * np.fft.rfft(ir, nf, axis=-1), nf, axis=-1)[:, :n]


def pingpong(x, delay_s, fb, repeats):
    n = x.shape[1]
    d = int(delay_s * SR)
    mono = 0.5 * (x[0] + x[1])
    out = np.zeros((2, n))
    g = 1.0
    for r in range(1, repeats + 1):
        g *= fb
        if r * d >= n:
            break
        out[(r - 1) % 2, r * d:] += g * mono[:n - r * d]
    return fft_filter(out, chain(hp(350, 2), lp(3800, 2)))


def pump(n, beat, t_from, t_to, depth_pts, tau=0.17):
    """跟着拍子的轻微「呼吸」：每拍开头压低 depth，随后指数回到 1。"""
    g = np.ones(n)
    dt_, dv_ = zip(*depth_pts)
    k = int(np.ceil(t_from / beat - 1e-9))
    L = int(0.7 * SR)
    tt = np.arange(L) / SR
    shape = (1 - np.exp(-tt / 0.006)) * np.exp(-tt / tau)
    while k * beat < t_to:
        tb = k * beat
        d = float(np.interp(tb, dt_, dv_))
        i0 = int(round(tb * SR))
        i1 = min(n, i0 + L)
        g[i0:i1] *= 1 - d * shape[:i1 - i0]
        k += 1
    return g


# ───────────────────────────── 母带与测量 ─────────────────────────────
def _biquad_mag(b, a, f):
    z = np.exp(-1j * 2 * np.pi * f / SR)
    return np.abs((b[0] + b[1] * z + b[2] * z * z) / (a[0] + a[1] * z + a[2] * z * z))


def lufs(x):
    """BS.1770-4 的整体响度（K 加权按幅频响应做；400 ms 块、75% 重叠、-70 绝对门限与 -10 相对门限）。"""
    kw = lambda f: _biquad_mag([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], f) * \
        _biquad_mag([1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621], f)
    y = fft_filter(x, kw)
    p = y[0] ** 2 + y[1] ** 2
    cs = np.concatenate([[0.0], np.cumsum(p)])
    blk = int(0.4 * SR)
    hop = int(0.1 * SR)
    st = np.arange(0, len(p) - blk + 1, hop)
    z = (cs[st + blk] - cs[st]) / blk
    l = -0.691 + 10 * np.log10(np.maximum(z, 1e-12))
    z1 = z[l > -70]
    thr = -0.691 + 10 * np.log10(z1.mean()) - 10
    z2 = z[l > thr]
    return -0.691 + 10 * np.log10(z2.mean())


def limiter(x, ceiling):
    """块级前瞻限幅：只在超过 ceiling 的地方压，左右声道同压；返回 (结果, 最大压缩 dB)。"""
    n = x.shape[1]
    blk = 240
    nb = int(np.ceil(n / blk))
    a = np.zeros(nb * blk)
    a[:n] = np.abs(x).max(0)
    peaks = a.reshape(nb, blk).max(1)
    g = np.minimum(1.0, ceiling / np.maximum(peaks, 1e-12))
    gp = np.pad(g, (2, 2), mode="edge")
    g2 = np.min(np.vstack([gp[i:i + nb] for i in range(5)]), axis=0)
    rel = np.exp(-blk / (0.12 * SR))
    s = np.empty(nb)
    prev = 1.0
    for i in range(nb):
        prev = min(g2[i], 1 - (1 - prev) * rel)
        s[i] = prev
    centers = (np.arange(nb) + 0.5) * blk
    gs = np.interp(np.arange(n), centers, s)
    return x * gs, float(-20 * np.log10(s.min()))


def find_ffmpeg():
    cand = [os.environ.get("LVS_FFMPEG")]
    try:
        cfg = json.load(open(os.path.join(ROOT, "kit", "config.local.json"), encoding="utf-8"))
        cand.append(cfg.get("ffmpeg"))
    except Exception:
        pass
    for name in ("ffmpeg.exe", "ffmpeg"):
        cand.append(os.path.join(ROOT, "assets", "ffmpeg", "bin", name))
    cand.append(shutil.which("ffmpeg"))
    for c in cand:
        if c and os.path.isfile(c):
            return c
    return None


def write_wav(path, x):
    y = np.clip(x, -1, 1)
    ints = np.ascontiguousarray(np.round(y.T * 8388607).astype("<i4"))
    b = ints.reshape(-1).view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(b)


def band_shares(x):
    m = 0.5 * (x[0] + x[1])
    P = np.abs(np.fft.rfft(m, pow2(len(m)))) ** 2
    f = np.fft.rfftfreq(pow2(len(m)), 1.0 / SR)
    tot = P.sum() + 1e-30
    return [round(10 * np.log10(P[sel].sum() / tot + 1e-30), 1) for sel in (f < 150, (f >= 150) & (f < 1500), f >= 1500)]


def master(dry, wet_in, ir, extra=None, low_shelf=None, high_shelf=None):
    """dry + 混响 + 额外回声 → 30 Hz 高通 → 响度对齐 → 限幅 → 尾部淡出。"""
    wet = convolve(wet_in, ir)
    mix = dry + wet + (extra if extra is not None else 0)
    eq = [hp(30, 3)]
    if low_shelf:
        fc, db_ = low_shelf
        eq.append(lambda f: 10 ** (db_ / 20 / (1 + (f / fc) ** 2)))
    if high_shelf:                          # 只抬 6 kHz 以上的「空气」，不动 1–4 kHz 的语音带
        fh, dh = high_shelf
        eq.append(lambda f: 10 ** (dh / 20 * (f / fh) ** 2 / (1 + (f / fh) ** 2)))
    mix = fft_filter(mix, chain(*eq))
    mix -= mix.mean(axis=1, keepdims=True)
    n = mix.shape[1]
    fi = int(0.02 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    return mix


def finalize(mix):
    g = 10 ** ((TARGET_LUFS - lufs(mix)) / 20)
    y = mix * g
    y, gr = limiter(y, CEILING * 0.995)
    return y, gr


# ───────────────────────────── A「叶脉」 ─────────────────────────────
def direction_A():
    bpm = 84.0
    beat = 60 / bpm
    bar = 4 * beat
    nbars = 20
    total = nbars * bar + 3.5
    n = int(total * SR)
    T = lambda b, bt=0.0: (b * 4 + bt) * beat
    S = dict(intro=(0, 4), build=(4, 11), peak=(11, 17), resolve=(17, 20))
    CH = dict(F=(41, [57, 60, 64, 67]), CE=(40, [55, 60, 62, 67]), Dm=(38, [53, 57, 60, 64]),
              Bb=(34, [57, 60, 62, 64]), C11=(36, [55, 58, 62, 65]), Am=(33, [55, 60, 64, 69]), Gm=(31, [58, 62, 65, 69]))
    prog = ["F", "F", "Dm", "Dm", "F", "CE", "Dm", "Bb", "F", "CE", "C11",
            "Bb", "C11", "Am", "Dm", "Gm", "C11", "Dm", "Bb", "F"]
    ev = chord_events(prog)
    B = {k: Bus(n) for k in ("bed", "pad", "padhi", "arp", "motif", "motif8", "lead", "bassm", "shaker", "drum")}

    # 低频铺底：贯穿全曲
    render_sustain(B["bed"], ev, lambda c: [CH[c][0]], beat, [(0, 240), (T(11), 300), (T(17), 320), (total, 220)],
                   tilt=1.7, even=1.0, detunes=[-3, 3], attack=1.4, release=2.2, gain=1.0, seed=11, spread=0.15, drift=0.0004)
    render_sustain(B["bed"], ev, lambda c: [CH[c][0] + 12], beat, [(0, 500), (total, 500)],
                   tilt=2.2, even=1.0, detunes=[-4, 4], attack=1.6, release=2.0, gain=0.32, seed=12, spread=0.3)
    # 和声铺底：明暗随段落从暗到亮再回暗
    bright = [(0, 950), (T(4), 1500), (T(10), 2400), (T(11), 3600), (T(16.5), 4200), (T(17), 2400), (T(20), 1100), (total, 950)]
    render_sustain(B["pad"], ev, lambda c: CH[c][1], beat, bright, tilt=1.15, even=0.8, detunes=[-7, -2, 3, 8],
                   attack=1.0, release=2.4, attack_fn=lambda t0: 2.5 if t0 < T(1) else 0.6, seed=21)
    render_sustain(B["padhi"], ev, lambda c: CH[c][1][1:], beat, [(0, 3500), (total, 3500)], tilt=1.6, even=0.6,
                   detunes=[-9, 0, 9], attack=1.2, release=2.0, octave=12, seed=31, only=(T(10.9), T(17.1)), spread=1.0)

    # 中音区木槌琶音：3+3+2
    pat = [0, 2, 3, 0, 2, 3, 1, 3]
    vpat = [0.8, 0.45, 0.55, 0.72, 0.45, 0.55, 0.65, 0.45]
    for b in range(4, 19):
        notes = sorted(CH[prog[b]][1])
        pos = [0, 3, 6] if b in (4, 5, 18) else range(8)
        for p in pos:
            v = vpat[p] * (1.08 if S["peak"][0] <= b < S["peak"][1] else 1.0) * (0.75 if b >= 17 else 1.0)
            B["arp"].add(mallet(notes[pat[p]], v, ring=1.2, bright=1.0), T(b, p * 0.5), pan=-0.45 + 0.9 * p / 7)
            if S["peak"][0] <= b < S["peak"][1] and p in (0, 3):
                B["arp"].add(mallet(notes[pat[p]] + 12, 0.28, ring=1.0, bright=0.6), T(b, p * 0.5 + 0.02), pan=0.5 - p * 0.2)

    # 动机
    cell = [(0, 72, .5), (0.5, 77, .5), (1, 79, .5), (1.5, 81, 1), (2.5, 79, .5), (3, 72, 1)]
    ans = [(0, 74, .5), (0.5, 72, .5), (1, 69, 2)]
    climb = [(0, 72, .5), (0.5, 77, .5), (1, 79, .5), (1.5, 81, .5), (2, 82, .5), (2.5, 84, 1.5)]
    cellE = [(bt, 76 if m == 77 else m, d) for bt, m, d in cell]
    plan = {2: ([(0, 72, .5), (0.5, 77, .5), (1, 79, 2)], 0.68), 3: ([(1, 81, 1.5), (2.5, 79, .5), (3, 72, 1)], 0.62),
            4: (cell, 0.7), 5: (ans, 0.68), 6: (cell, 0.75), 7: (ans, 0.72), 8: (cell, 0.8), 9: (ans, 0.78), 10: (climb, 0.85),
            11: (cell, 0.95), 12: (ans, 0.92), 13: (cellE, 0.95), 14: (ans, 0.92), 15: (cell, 0.98), 16: (climb, 1.0),
            17: ([(0, 81, 3)], 0.72), 18: ([(0, 74, 1), (1, 72, 1), (2, 69, 2)], 0.55), 19: ([(0, 72, 1), (1, 77, 3)], 0.45)}
    for b, (ph, v) in plan.items():
        for i, (bt, m, d) in enumerate(ph):
            vv = v * (1.0 if i == 0 else 0.9)
            B["motif"].add(mallet(m, vv, ring=2.2, bright=1.3), T(b, bt), pan=0.08)
            if S["peak"][0] <= b < S["peak"][1]:
                B["motif8"].add(mallet(m + 12, 0.32 * vv, ring=1.6, bright=0.5), T(b, bt + 0.015), pan=-0.25)

    # 最高处的气声长音对位（像低音区的陶笛）
    lead = [(11, 0, 62, 2), (11, 2, 64, 2), (12, 0, 65, 4), (13, 0, 64, 4), (14, 0, 65, 2), (14, 2, 69, 2),
            (15, 0, 70, 2), (15, 2, 69, 2), (16, 0, 67, 4), (17, 0, 69, 4)]
    for i, (b, bt, m, d) in enumerate(lead):
        dur = d * beat + 0.05
        nn = int((dur + 0.9) * SR)
        f = hz(m)
        s = osc([(wtable(f, 1400, 2.4, 0.5), 1.0)], f, nn, [-3, 3], seed=400 + i, vib=0.004, vib_rate=4.8, vib_delay=0.5, spread=0.3)
        br = fft_filter(noise(nn, 410 + i), chain(hp(f * 1.5), lp(f * 4))) * 0.05
        s = s + np.vstack([br, br])
        s *= env(nn, 0.28, dur, 0.9) * (0.7 if b == 17 else 1.0)
        B["lead"].add(s, T(b, bt), gain=1.0)

    # 低音木槌（3+3+2）与毡头鼓：推进后半起轻轻进来，最高处走满
    for b in range(8, 18):
        root = CH[prog[b]][0] + 12
        for k, bt in enumerate((0, 1.5, 3)):
            if b < 11 and k:
                continue
            v = (0.85, 0.6, 0.7)[k] * (0.6 if b < 11 else 1.0) * (0.7 if b == 17 else 1.0)
            B["bassm"].add(mallet(root, v, ring=1.5, bright=0.35), T(b, bt))
    for b in range(11, 17):
        for k, bt in enumerate((0, 1.5, 3)):
            B["drum"].add(thump((0.9, 0.55, 0.65)[k], f_hi=95, f_lo=50, tau_f=0.03, tau_a=0.26, length=0.8, body=0.15, grit=0.06), T(b, bt))
    B["drum"].add(thump(0.5, f_hi=95, f_lo=50, tau_f=0.03, tau_a=0.26, length=0.8, body=0.15, grit=0.06), T(10, 3.5))
    B["drum"].add(thump(0.6, f_hi=95, f_lo=50, tau_f=0.03, tau_a=0.26, length=0.8, body=0.15, grit=0.06), T(17, 0))
    sv = [0.5, 0.22, 0.34, 0.22]
    for b in range(8, 18):
        for s16 in range(16):
            swing = 0.06 if s16 % 2 else 0.0
            v = sv[s16 % 4] * (0.6 if b < 11 else 1.0) * (0.6 if b == 17 else 1.0)
            B["shaker"].add(shaker(v, s16 % 4), T(b, s16 * 0.25 + swing), pan=0.35)

    au = {
        "bed": [(0, 0), (T(1), 0.4), (T(4), 0.46), (T(11), 0.62), (T(17), 0.64), (T(19), 0.47), (total, 0.41)],
        "pad": [(0, 0.38), (T(4), 0.41), (T(10.5), 0.57), (T(11), 0.72), (T(17), 0.72), (T(20), 0.4), (total, 0.34)],
        "padhi": [(0, 0.4), (total, 0.4)],
        "arp": [(0, 0.48), (T(6), 0.52), (T(10.5), 0.68), (T(11), 0.82), (T(17), 0.62), (total, 0.5)],
        "motif": [(0, 0.95), (total, 0.95)],
        "motif8": [(0, 0.5), (total, 0.5)],
        "lead": [(0, 0.3), (total, 0.3)],
        "bassm": [(0, 0.55), (total, 0.55)],
        "shaker": [(0, 0.05), (T(11), 0.075), (total, 0.07)],
        "drum": [(0, 0.5), (total, 0.5)],
    }
    sends = dict(bed=0.03, pad=0.25, padhi=0.4, arp=0.3, motif=0.38, motif8=0.45, lead=0.45, bassm=0.08, shaker=0.25, drum=0.12)
    dry = np.zeros((2, n))
    rin = np.zeros((2, n))
    din = np.zeros((2, n))
    for k, bus in B.items():
        x = bus.x * automation(n, au[k])
        dry += x
        rin += sends[k] * x
        if k in ("motif",):
            din += x
    echo = pingpong(din, 0.75 * beat, 0.38, 6) * 0.35
    rin += 0.5 * echo
    ir = make_ir(2.3, 1.2, 0.018, seed=101)
    mix = master(dry, rin * 0.55, ir, extra=echo, high_shelf=(7000, 2.5))
    secs = {k: (T(a), T(b) if k != "resolve" else total) for k, (a, b) in S.items()}
    return mix, dict(bpm=bpm, sections=secs, total=total)


# ───────────────────────────── B「日志脉搏」 ─────────────────────────────
def direction_B():
    bpm = 104.0
    beat = 60 / bpm
    bar = 4 * beat
    nbars = 26
    total = nbars * bar + 2.5
    n = int(total * SR)
    T = lambda b, bt=0.0: (b * 4 + bt) * beat
    S = dict(intro=(0, 4), build=(4, 14), peak=(14, 22), resolve=(22, 26))
    CH = dict(Am=(33, [60, 64, 67, 71]), F=(29, [57, 60, 64, 71]), Dm=(38, [57, 60, 64, 65]),
              Es=(40, [57, 59, 62, 64]), E=(40, [56, 59, 62, 64]), C=(36, [55, 59, 62, 64]))
    prog = ["Am", "Am", "F", "F",
            "Am", "Am", "F", "F", "Dm", "Dm", "Es", "Es", "Dm", "Es",
            "F", "F", "C", "C", "Dm", "Dm", "Es", "E",
            "Am", "Am", "F", "Am"]
    ev = chord_events(prog)
    B = {k: Bus(n) for k in ("bed", "pad", "air", "pulse", "tick", "kick", "pluck", "bell", "glass", "riser")}
    inpeak = lambda b: S["peak"][0] <= b < S["peak"][1]

    render_sustain(B["bed"], ev, lambda c: [CH[c][0] + 12], beat, [(0, 300), (T(14), 420), (T(22), 300), (total, 260)],
                   tilt=1.8, even=0.7, detunes=[-4, 4], attack=0.8, release=1.6, seed=51, spread=0.2)
    render_sustain(B["bed"], ev, lambda c: [CH[c][0]], beat, [(0, 200), (total, 200)],
                   tilt=2.5, even=1.0, detunes=[0], attack=1.0, release=1.6, gain=0.5, seed=52, spread=0.0)
    bright = [(0, 1100), (T(4), 1700), (T(13), 2800), (T(14), 4200), (T(22), 4500), (T(22.5), 2200), (total, 1200)]
    render_sustain(B["pad"], ev, lambda c: CH[c][1], beat, bright, tilt=1.55, even=0.35, detunes=[-6, 0, 6],
                   attack=0.5, release=1.8, attack_fn=lambda t0: 2.2 if t0 < T(1) else 0.4, seed=61, spread=0.9)
    render_sustain(B["air"], ev, lambda c: [max(CH[c][1]) + 12, max(CH[c][1]) + 7], beat, [(0, 6000), (total, 6000)],
                   tilt=2.6, even=0.3, detunes=[-8, 8], attack=1.5, release=2.0, seed=71, only=(T(13.9), T(22.1)), spread=1.0)

    # 低音脉冲：提交的时钟
    for b in range(0, 26):
        root = CH[prog[b]][0]
        if b < 4 or b in (22, 23):
            steps = [(q, (0.8, 0.5, 0.62, 0.5)[q]) for q in range(4)]
        elif b == 24:
            steps = [(0, 0.7), (2, 0.5)]
        elif b == 25:
            steps = [(0, 0.55)]
        else:
            steps = [(q * 0.5, (0.85, 0.42, 0.6, 0.42, 0.75, 0.42, 0.6, 0.42)[q]) for q in range(8)]
        for bt, v in steps:
            off = inpeak(b) and (bt % 1) == 0.5
            m = root + (12 if off else 0)
            B["pulse"].add(pulse(m, v * (0.8 if off else 1.0), length=0.3 if not off else 0.22, bright=0.45 if inpeak(b) else 0.35), T(b, bt))
    # 嘀嗒：日志落盘的意象
    for b in range(8, 24):
        for s16 in range(16):
            if b < 10 and s16 % 4 != 2:
                continue
            if b >= 22 and s16 % 2:
                continue
            v = (0.55, 0.22, 0.38, 0.22)[s16 % 4] * (1.15 if inpeak(b) else 1.0) * (0.6 if b >= 22 else 1.0)
            B["tick"].add(tick(v, s16 % 3), T(b, s16 * 0.25), pan=0.3 * np.sin(s16 * 0.7))
    # 低鼓：最高处每小节 1、3 拍
    for b in range(14, 22):
        for bt, v in ((0, 0.85), (2, 0.55)):
            B["kick"].add(thump(v, f_hi=120, f_lo=48, tau_f=0.03, tau_a=0.2, length=0.55, grit=0.03, seed=8), T(b, bt))
    B["kick"].add(thump(0.6, f_hi=120, f_lo=48, tau_f=0.03, tau_a=0.3, length=0.8, grit=0.03, seed=8), T(22, 0))
    # 推进末的气声上扬（低通噪声，四档明暗交叉淡化）
    L = int(bar * 2 * SR)
    tt = np.arange(L) / L
    rs = np.zeros(L)
    for q, fc in enumerate((500, 1200, 2800, 6000)):
        nz = fft_filter(noise(L, 300 + q), chain(hp(200), lp(fc, 2)))
        w = np.clip(1 - np.abs(tt * 3 - q), 0, 1)
        rs += nz * w
    rs *= tt ** 2.2 * env(L, 0.0, L / SR - 0.03, 0.03)
    rs /= np.abs(rs).max()
    B["riser"].add(np.vstack([rs, np.roll(rs, 240)]), T(12))
    # 拨弦：推进后段反拍八分，最高处十六分
    arp16 = [0, 1, 2, 3, 2, 1, 3, 2]
    for b in range(10, 23):
        notes = sorted(CH[prog[b]][1])
        if inpeak(b):
            for s16 in range(16):
                v = (0.55, 0.3, 0.42, 0.3)[s16 % 4]
                B["pluck"].add(fm_pluck(notes[arp16[s16 % 8]], v, ring=0.16, index=0.9), T(b, s16 * 0.25), pan=-0.5 + (s16 % 8) / 7)
        else:
            for q in range(4):
                B["pluck"].add(fm_pluck(notes[(q + b) % 4], 0.5 * (0.6 if b == 22 else 1.0), ring=0.2, index=0.8), T(b, q + 0.5), pan=0.4 * (-1) ** q)
    # 钟的动机
    mA = [(0, 76, .5), (0.5, 76, .5), (1, 81, 1), (2, 83, 2)]
    mB = [(0, 84, 1), (1, 83, .5), (1.5, 81, .5), (2, 76, 2)]
    mBd = [(bt, 86 if m == 84 else m, d) for bt, m, d in mB]
    plan = {2: (mA, 0.45), 6: (mA, 0.6), 7: (mB, 0.58), 10: (mA, 0.68), 11: (mBd, 0.66), 12: (mA, 0.72), 13: (mBd, 0.72),
            14: (mA, 0.9), 15: (mB, 0.85), 16: (mA, 0.9), 17: (mB, 0.85), 18: (mA, 0.92), 19: (mB, 0.88), 20: (mA, 0.95), 21: (mBd, 0.9),
            22: (mA, 0.55), 23: (mB, 0.45), 24: ([(0, 76, .5), (0.5, 76, .5), (1, 81, 3)], 0.4)}
    for b, (ph, v) in plan.items():
        for i, (bt, m, d) in enumerate(ph):
            vv = v * (1.0 if i != 1 else 0.75)
            B["bell"].add(bell(m, vv, ring=2.6 if b >= 22 or b == 2 else 2.0), T(b, bt), pan=0.12)
            if inpeak(b):
                dur = d * beat + 0.05
                nn = int((dur + 0.7) * SR)
                f = hz(m - 12)
                s = osc([(wtable(f, 2200, 2.0, 0.4), 1.0)], f, nn, [-5, 5], seed=600 + b * 8 + i, spread=0.7)
                s *= env(nn, 0.03, dur, 0.7)
                B["glass"].add(s, T(b, bt))

    au = {
        "bed": [(0, 0), (T(1), 0.32), (T(4), 0.36), (T(14), 0.47), (T(22), 0.45), (T(25), 0.35), (total, 0.32)],
        "pad": [(0, 0.45), (T(4), 0.5), (T(13.5), 0.66), (T(14), 0.82), (T(22), 0.78), (total, 0.42)],
        "air": [(0, 0.26), (total, 0.26)],
        "pulse": [(0, 0.66), (T(2), 0.95), (T(4), 1.25), (T(13.5), 1.55), (T(14), 1.8), (T(22), 1.35), (total, 1.05)],
        "tick": [(0, 0.16), (T(14), 0.22), (total, 0.18)],
        "kick": [(0, 0.6), (total, 0.6)],
        "pluck": [(0, 0.18), (T(14), 0.26), (total, 0.2)],
        "bell": [(0, 0.9), (total, 0.9)],
        "glass": [(0, 0.16), (total, 0.16)],
        "riser": [(0, 0.05), (total, 0.05)],
    }
    g = pump(n, beat, T(4), T(25), [(0, 0.0), (T(4), 0.16), (T(14), 0.26), (T(22), 0.1), (total, 0.0)])
    sends = dict(bed=0.03, pad=0.22, air=0.5, pulse=0.04, tick=0.15, kick=0.08, pluck=0.25, bell=0.35, glass=0.4, riser=0.4)
    dry = np.zeros((2, n))
    rin = np.zeros((2, n))
    din = np.zeros((2, n))
    for k, bus in B.items():
        x = bus.x * automation(n, au[k])
        if k in ("pad", "air", "bed"):
            x = x * (g if k != "bed" else 1 - 0.4 * (1 - g))
        dry += x
        rin += sends[k] * x
        if k == "bell":
            din += x
    echo = pingpong(din, 0.75 * beat, 0.42, 7) * 0.4
    rin += 0.5 * echo
    ir = make_ir(1.9, 1.0, 0.025, seed=202)
    mix = master(dry, rin * 0.55, ir, extra=echo, high_shelf=(6500, 4.0))
    secs = {k: (T(a), T(b) if k != "resolve" else total) for k, (a, b) in S.items()}
    return mix, dict(bpm=bpm, sections=secs, total=total)


# ───────────────────────────── C「档案」 ─────────────────────────────
def direction_C():
    bpm = 70.0
    beat = 60 / bpm
    bar = 4 * beat
    nbars = 17
    total = nbars * bar + 4.0
    n = int(total * SR)
    T = lambda b, bt=0.0: (b * 4 + bt) * beat
    S = dict(intro=(0, 4), build=(4, 9), peak=(9, 13), resolve=(13, 17))
    CH = {
        "Cm": ([36, 43], [55, 60, 63, 67]), "AbC": ([36, 44], [56, 60, 63, 67]), "FmC": ([36, 41], [56, 60, 65, 68]),
        "Ab": ([32, 44], [55, 60, 63, 67]), "Eb": ([39, 46], [55, 58, 63, 67]), "Bb": ([34, 46], [53, 58, 62, 65]),
        "Fm9": ([41, 48], [56, 60, 63, 67]), "EbBb": ([34, 46], [55, 58, 63, 67]), "Gs": ([31, 43], [55, 60, 62, 67]),
        "G7": ([31, 43], [55, 59, 62, 65]), "Cm9": ([36, 43], [55, 62, 63, 67]),
    }
    prog = ["Cm", "AbC", "FmC", "Cm",
            "Cm", "Ab", "Eb", "Bb", "Fm9",
            "Ab", "Bb", "Cm", "EbBb",
            "Ab", "Fm9", [("Gs", 2), ("G7", 2)], "Cm9"]
    ev = chord_events(prog)
    B = {k: Bus(n) for k in ("pedal", "low", "str", "vln", "mel", "cello", "piano", "taiko")}
    inpeak = lambda t: T(9) <= t < T(13)

    # C 持续低音（引子与收束最清楚），低弦随和声
    render_sustain(B["pedal"], [["C", 0, 16]], lambda c: [36], beat, [(0, 250), (total, 250)], tilt=2.0, even=1.0,
                   detunes=[-2, 2], attack=3.0, release=3.0, seed=81, spread=0.2)
    render_sustain(B["pedal"], [["C", 64, 4]], lambda c: [36], beat, [(0, 250), (total, 250)], tilt=2.0, even=1.0,
                   detunes=[-2, 2], attack=1.5, release=4.0, seed=82, spread=0.2, overlap=3.5)
    lowbright = [(0, 450), (T(4), 700), (T(9), 1300), (T(13), 900), (total, 450)]
    render_sustain(B["low"], ev, lambda c: CH[c][0], beat, lowbright, tilt=1.05, even=1.0, detunes=[-6, -2, 2, 6],
                   attack=1.1, release=2.2, seed=91, vib=0.0016, vib_delay=0.8, spread=0.5)
    # 上方弦乐和弦：引子很暗（近指板），推进渐亮，最高处最亮，收束回暗
    sb = [(0, 1100), (T(4), 1600), (T(8), 2600), (T(9), 3800), (T(12.9), 4200), (T(13), 2000), (total, 800)]
    render_sustain(B["str"], ev, lambda c: CH[c][1], beat, sb, tilt=1.0, even=1.0, detunes=[-9, -5, -2, 2, 5, 9],
                   attack=1.2, release=2.4, attack_fn=lambda t0: 3.0 if t0 < T(1) else 0.9, seed=101,
                   vib=0.0022, vib_delay=0.5, spread=0.9)
    render_sustain(B["vln"], ev, lambda c: CH[c][1][2:], beat, [(0, 4500), (total, 4500)], tilt=1.0, even=1.0,
                   detunes=[-8, -3, 3, 8], attack=1.4, release=2.6, octave=12, seed=111, vib=0.003, vib_delay=0.4,
                   only=(T(7.9), T(13.1)), spread=1.0)
    # 最高处的弦乐旋律：把钢琴动机放宽成长音，大提琴低八度齐奏
    mel = [(9, 0, 72, 2), (9, 2, 75, 2), (10, 0, 74, 2), (10, 2, 77, 2), (11, 0, 79, 3), (11, 3, 77, 1),
           (12, 0, 75, 2), (12, 2, 74, 2), (13, 0, 72, 4)]
    for i, (b, bt, m, d) in enumerate(mel):
        dur = d * beat + 0.12
        for bus, mm, br, vg, sd in ((B["mel"], m, 4200, 1.0, 700), (B["cello"], m - 24, 1800, 1.0, 750)):
            nn = int((dur + 1.6) * SR)
            f = hz(mm)
            s = osc([(wtable(f, br, 1.0, 1.0), 1.0)], f, nn, [-6, -2, 2, 6], seed=sd + i, vib=0.0032, vib_delay=0.35, spread=0.6)
            s *= env(nn, 0.35, dur, 1.6) * (0.7 if b == 13 else 1.0)
            bus.add(s, T(b, bt), gain=vg)

    # 低音区钢琴动机
    P = []
    P += [(1, 0, 48, 1), (1, 1, 55, 1), (1, 2, 56, .5), (1, 2.5, 55, 1.5),
          (2, 0, 53, 1), (2, 1, 51, 1), (2, 2, 48, 2), (3, 0, 43, 1), (3, 1, 48, 3)]
    vel_intro = 0.55
    P = [(b, bt, m, d, vel_intro) for b, bt, m, d in P]
    build = [(4, [(0, 48, 1), (1, 55, 1), (2, 56, .5), (2.5, 55, 1.5)], 36),
             (5, [(0, 60, 1), (1, 58, .5), (1.5, 56, .5), (2, 55, 2)], 44),
             (6, [(0, 51, 1), (1, 58, 1), (2, 60, .5), (2.5, 58, 1.5)], 39),
             (7, [(0, 62, 1), (1, 60, .5), (1.5, 58, .5), (2, 53, 2)], 46),
             (8, [(0, 56, 1), (1, 55, 1), (2, 53, .5), (2.5, 51, .5), (3, 48, 1)], 41)]
    for b, ph, lh in build:
        v = 0.6 + 0.04 * (b - 4)
        P += [(b, bt, m, d, v) for bt, m, d in ph]
        P += [(b, 0, lh, 4, v * 0.8), (b, 0.01, lh + 12, 4, v * 0.6)]
    peakrh = [(9, [(0, 60), (1, 67), (2, 68), (3, 67)], 44), (10, [(0, 62), (1, 65), (2, 67), (3, 65)], 46),
              (11, [(0, 63), (1, 67), (2, 68), (3, 67)], 48), (12, [(0, 63), (1, 62), (2, 58)], 46)]
    for b, ph, lh in peakrh:
        P += [(b, bt, m, 1 if bt < 2 or b != 12 else 2, 0.5) for bt, m in ph]
        P += [(b, 0, lh - 12, 2, 0.85), (b, 0.008, lh, 2, 0.75), (b, 2, lh - 12, 2, 0.6), (b, 2.008, lh, 2, 0.5)]
    P += [(13, 0, 60, 1, .5), (13, 1, 55, 1, .45), (13, 2, 56, .5, .45), (13, 2.5, 55, 1.5, .42), (13, 0, 44, 4, .45),
          (14, 0, 53, 1, .45), (14, 1, 51, 1, .42), (14, 2, 48, 2, .42), (14, 0, 41, 4, .4),
          (15, 0, 50, 2, .42), (15, 2, 47, 2, .4), (15, 0, 43, 4, .38),
          (16, 0, 36, 5.5, .4), (16, 0.0, 48, 5.5, .42), (16, 0.06, 55, 5.4, .36), (16, 0.12, 62, 5.3, .34), (16, 0.18, 63, 5.2, .32)]
    for b, bt, m, d, v in P:
        B["piano"].add(piano(m, v, d * beat), T(b, bt), pan=np.clip((m - 52) / 40, -0.4, 0.4))

    # 低鼓：推进末定音鼓滚奏渐强，最高处 1、3 拍，收束第一拍
    roll = [2.0, 2.5, 2.75, 3.0, 3.25, 3.5, 3.625, 3.75, 3.875]
    for i, bt in enumerate(roll):
        B["taiko"].add(thump(0.18 + 0.07 * i, f_hi=78, f_lo=65, tau_f=0.05, tau_a=0.45, length=1.2, body=0.2, grit=0.05, seed=30 + i % 3), T(8, bt), pan=0.15 * (-1) ** i)
    for b in range(9, 13):
        B["taiko"].add(thump(1.0, f_hi=105, f_lo=52, tau_f=0.04, tau_a=0.5, length=1.4, body=0.25, grit=0.07, seed=21), T(b, 0))
        B["taiko"].add(thump(0.55, f_hi=105, f_lo=52, tau_f=0.04, tau_a=0.5, length=1.4, body=0.25, grit=0.07, seed=21), T(b, 2))
    B["taiko"].add(thump(0.6, f_hi=105, f_lo=52, tau_f=0.04, tau_a=0.7, length=2.0, body=0.2, grit=0.05, seed=21), T(13, 0))

    au = {
        "pedal": [(0, 0.0), (T(1), 0.34), (T(4), 0.32), (T(9), 0.26), (T(13), 0.32), (total, 0.36)],
        "low": [(0, 0.24), (T(3), 0.3), (T(4), 0.42), (T(8), 0.6), (T(9), 0.8), (T(13), 0.55), (T(17), 0.4), (total, 0.35)],
        "str": [(0, 0.24), (T(4), 0.34), (T(8), 0.52), (T(9), 0.65), (T(13), 0.5), (T(16), 0.3), (total, 0.26)],
        "vln": [(0, 0.0), (T(8), 0.0), (T(9), 0.3), (T(13), 0.3), (total, 0.0)],
        "mel": [(0, 0.4), (total, 0.4)],
        "cello": [(0, 0.28), (total, 0.28)],
        "piano": [(0, 1.3), (total, 1.3)],
        "taiko": [(0, 0.42), (total, 0.42)],
    }
    sends = dict(pedal=0.02, low=0.1, str=0.32, vln=0.45, mel=0.4, cello=0.25, piano=0.3, taiko=0.2)
    body = chain(peq(280, 2.5, 0.5), peq(1100, 1.5, 0.6), peq(2900, 1.5, 0.5), peq(650, -1.5, 0.4), lp(7500, 2))
    dry = np.zeros((2, n))
    rin = np.zeros((2, n))
    for k, bus in B.items():
        x = bus.x
        if k in ("str", "vln", "mel", "cello", "low"):
            x = fft_filter(x, body)
        x = x * automation(n, au[k])
        dry += x
        rin += sends[k] * x
    ir = make_ir(3.4, 1.8, 0.032, seed=303)
    mix = master(dry, rin * 0.6, ir)
    secs = {k: (T(a), T(b) if k != "resolve" else total) for k, (a, b) in S.items()}
    return mix, dict(bpm=bpm, sections=secs, total=total)


# ───────────────────────────── 入口 ─────────────────────────────
DIRECTIONS = {
    "A": ("叶脉", direction_A),
    "B": ("日志脉搏", direction_B),
    "C": ("档案", direction_C),
}


def fade_tail(x, seconds):
    k = int(seconds * SR)
    x[:, -k:] *= (0.5 + 0.5 * np.cos(np.linspace(0, np.pi, k)))
    return x


def stats(y, info):
    out = {}
    for name, (a, b) in info["sections"].items():
        seg = y[:, int(a * SR):int(b * SR)]
        rms = np.sqrt(np.mean(seg ** 2))
        half = seg.shape[1] // 2
        r1 = np.sqrt(np.mean(seg[:, :half] ** 2))
        r2 = np.sqrt(np.mean(seg[:, half:] ** 2))
        out[name] = dict(start=round(a, 2), end=round(b, 2), rms_db=round(20 * np.log10(rms), 1),
                         first_half_db=round(20 * np.log10(r1), 1), second_half_db=round(20 * np.log10(r2), 1),
                         low_mid_high_db=band_shares(seg))
    return out


def clicks(y):
    """粗查咔哒声：8 kHz 以上的能量按 5 ms 分块，比前后 100 ms 的中位数高出 18 dB 以上的块数。"""
    h = fft_filter(0.5 * (y[0] + y[1]), hp(8000, 4))
    blk = 240
    nb = len(h) // blk
    e = np.mean(h[:nb * blk].reshape(nb, blk) ** 2, axis=1) + 1e-14
    w = 20
    pad = np.pad(e, (w, w), mode="edge")
    med = np.median(np.lib.stride_tricks.sliding_window_view(pad, 2 * w + 1), axis=1)
    loud = e > np.percentile(e, 20)
    return int(np.sum((10 * np.log10(e / med) > 18) & loud))


def measure_ffmpeg(ff, path):
    r = subprocess.run([ff, "-hide_banner", "-nostats", "-i", path, "-filter_complex", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    txt = r.stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", txt)
    LRA = re.findall(r"LRA:\s+(-?[\d.]+) LU", txt)
    PK = re.findall(r"Peak:\s+(-?[\d.]+|-inf) dBFS", txt)
    return dict(I=float(I[-1]) if I else None, LRA=float(LRA[-1]) if LRA else None, true_peak=float(PK[-1]) if PK else None)


def main(argv):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    which = [a.upper() for a in argv if a.upper() in DIRECTIONS] or list(DIRECTIONS)
    os.makedirs(OUTDIR, exist_ok=True)
    ff = find_ffmpeg()
    report_path = os.path.join(OUTDIR, "music-demo.json")
    try:
        report = json.load(open(report_path, encoding="utf-8"))
    except Exception:
        report = {}
    for key in which:
        title, fn = DIRECTIONS[key]
        _CACHE.clear()
        mix, info = fn()
        mix = fade_tail(mix, 2.5)
        y, gr = finalize(mix)
        wav = os.path.join(OUTDIR, "music-%s.wav" % key)
        write_wav(wav, y)
        rec = dict(title=title, bpm=info["bpm"], duration_s=round(y.shape[1] / SR, 2),
                   lufs_numpy=round(lufs(y), 2), sample_peak_dbfs=round(20 * np.log10(np.abs(y).max()), 2),
                   clipped_samples=int(np.sum(np.abs(y) >= 0.999)), dc=[float("%.2e" % v) for v in y.mean(axis=1)],
                   limiter_max_gr_db=round(gr, 2), low_mid_high_db=band_shares(y), lr_correlation=round(float(np.corrcoef(y[0], y[1])[0, 1]), 3),
                   click_blocks=clicks(y), sections=stats(y, info))
        if ff:
            mp3 = os.path.join(OUTDIR, "music-%s.mp3" % key)
            r = subprocess.run([ff, "-y", "-v", "error", "-i", wav, "-c:a", "libmp3lame", "-q:a", "2", mp3], capture_output=True)
            rec["mp3"] = r.returncode == 0
            rec["ebur128"] = measure_ffmpeg(ff, wav)
        report[key] = rec
        print(json.dumps({key: rec}, ensure_ascii=False, indent=1))
    json.dump(report, open(report_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main(sys.argv[1:])
