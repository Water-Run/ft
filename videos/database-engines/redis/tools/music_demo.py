#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Redis（数据库引擎系列第 7 集）配乐 Demo：三个方向，各约 60 秒，供审片页选定方向。

  A 事件循环  124 拍/分  D 小调          十六分音符拨弦琶音 + 嘀嗒：一拍一条命令，像事件循环
  B 微秒      104 拍/分  E 大调（利底亚） 玻璃质感的 FM 钟音、极快的装饰音群、乒乓延迟，留白多
  C 终章       94 拍/分  C 小调→C 大调    失谐锯齿铺底、逐步打开的琶音、收着的高潮与长混响尾

每首都是 引子（稀疏）→ 推进 → 最高处 → 收束（停在持续的和弦上淡出）。

用法：python music_demo.py [A] [B] [C]      缺省三首都做
产物：out/audition/music-{A,B,C}.wav（16 bit）与 .mp3，以及 music-demo.json（说明与实测数值）。

只依赖 numpy（另用标准库的 wave/json/subprocess）。所有声音当场合成，不用采样。
随机数全部固定种子：同样的输入得到逐样本相同的 WAV。
滤波、混响、延迟都在逐个音符上做，或用长度为 2 的幂的 FFT 做整条的卷积。
"""
import json
import math
import os
import re
import shutil
import subprocess
import sys
import wave
from functools import lru_cache
from pathlib import Path

import numpy as np

SR = 48000
HERE = Path(__file__).resolve().parent
VIDEO = HERE.parent
REPO = VIDEO.parents[2]
OUT = VIDEO / 'out' / 'audition'
TARGET_LUFS = -18.0
CEIL_DB = -1.5          # 采样峰值的限幅上限；再核对真峰值 ≤ −1 dBTP
TWO_PI = 2 * np.pi
LAST_TRACK = None


# ───────────────────────── 基础工具 ─────────────────────────

def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def db2a(d):
    return 10 ** (d / 20)


def next_pow2(n):
    return 1 << int(n - 1).bit_length()


def seed_of(*parts):
    """由参数得到确定的种子（不用 Python 的 hash，它每次运行都不同）。"""
    h = 1469598103934665603
    for p in parts:
        for ch in repr(p).encode():
            h = ((h ^ ch) * 1099511628211) & 0xFFFFFFFFFFFFFFFF
    return h


def pan_gains(p):
    a = (p + 1) * np.pi / 4
    return math.cos(a), math.sin(a)


def rcos(n):
    """0→1 的升余弦。"""
    if n <= 0:
        return np.zeros(0)
    return 0.5 - 0.5 * np.cos(np.pi * np.arange(n) / n)


def ar_env(n, att, hold_end, rel):
    """升余弦起音到 1，保持到 hold_end（秒），再用升余弦在 rel 秒内收到 0。"""
    e = np.ones(n)
    na = min(n, max(1, int(att * SR)))
    e[:na] = rcos(na)
    i1 = min(n, int(hold_end * SR))
    nr = max(1, int(rel * SR))
    tail = n - i1
    if tail > 0:
        r = 1 - rcos(nr)
        if len(r) >= tail:
            e[i1:] *= r[:tail]
        else:
            e[i1:i1 + nr] *= r
            e[i1 + nr:] = 0
    return e


def lp(f, fc, order=2):
    return 1 / np.sqrt(1 + (np.asarray(f) / fc) ** (2 * order))


def hp(f, fc, order=2):
    f = np.maximum(np.asarray(f, dtype=float), 1e-3)
    return 1 / np.sqrt(1 + (fc / f) ** (2 * order))


def bell_eq(f, fc, gain_db, oct_bw):
    f = np.maximum(np.asarray(f, dtype=float), 1e-3)
    return 10 ** (gain_db / 20 * np.exp(-0.5 * (np.log2(f / fc) / oct_bw) ** 2))


def fft_filter(x, resp):
    """零相位滤波：resp(f) 给出实数增益。长度补到 2 的幂。"""
    n = x.shape[-1]
    nf = next_pow2(n + 4096)
    X = np.fft.rfft(x, nf)
    f = np.fft.rfftfreq(nf, 1 / SR)
    return np.fft.irfft(X * resp(f), nf)[..., :n]


def fft_conv_mono_to_stereo(x, ir, n_out):
    """单声道送出 × 立体声脉冲响应，FFT 长度取 2 的幂。"""
    nf = next_pow2(len(x) + ir.shape[1])
    X = np.fft.rfft(x, nf)
    out = np.zeros((2, n_out))
    for c in range(2):
        out[c] = np.fft.irfft(X * np.fft.rfft(ir[c], nf), nf)[:n_out]
    return out


def harm_amp(kind, k):
    k = np.asarray(k, dtype=float)
    if kind == 'saw':
        return 1 / k
    if kind == 'square':
        return np.where(k % 2 == 1, 1 / k, 0.12 / k)
    if kind == 'tri':
        return np.where(k % 2 == 1, 1 / k ** 2, 0.0)
    if kind == 'soft':
        return 1 / k ** 1.7
    raise ValueError(kind)


# ───────────────────────── 音色 ─────────────────────────

@lru_cache(maxsize=None)
def pluck(m, dur=0.45, tone=1.0, decay=8.0, kind='saw', maxf=12000.0, att=0.0015):
    """加法合成的拨弦：越高的泛音衰减越快，相当于滤波包络。tone 越大越亮。"""
    f = mtof(m)
    n = int(dur * SR)
    t = np.arange(n) / SR
    K = max(1, min(80, int(min(maxf, SR * 0.45) / f)))
    k = np.arange(1, K + 1)
    a = harm_amp(kind, k)
    rate = decay * (1 + (k * f / 1000.0) / tone)
    keep = a * np.exp(-rate * 0.002) > 1e-4
    k, a, rate = k[keep], a[keep], rate[keep]
    rng = np.random.default_rng(seed_of('pluck', m, kind))
    ph = rng.uniform(0, TWO_PI, len(k))
    sig = np.zeros(n)
    for kk, ak, rk, pk in zip(k, a, rate, ph):
        sig += ak * np.exp(-rk * t) * np.sin(TWO_PI * kk * f * t + pk)
    na = max(1, int(att * SR))
    sig[:na] *= rcos(na)
    nr = int(0.015 * SR)
    sig[-nr:] *= 1 - rcos(nr)
    return sig / 1.2


@lru_cache(maxsize=None)
def tone_note(m, dur, kind='saw', cutoff=3000.0, att=0.01, dec=0.2, sus=0.7, rel=0.2,
              vib=0.0, vib_rate=5.0, vib_delay=0.25, detune=0.0, maxf=9000.0):
    """持续音：加法合成的锯齿/方波，静态低通，ADSR，可加延迟起振的颤音。"""
    f = mtof(m) * 2 ** (detune / 1200)
    n = int((dur + rel) * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(seed_of('tone', m, kind, detune))
    if vib > 0:
        v = vib * np.clip((t - vib_delay) / 0.4, 0, 1) * np.sin(TWO_PI * vib_rate * t + rng.uniform(0, TWO_PI))
        inst = f * 2 ** (v / 1200)
        phase = TWO_PI * np.cumsum(inst) / SR
    else:
        phase = TWO_PI * f * t
    K = max(1, int(min(maxf, cutoff * 4) / f))
    sig = np.zeros(n)
    for k in range(1, K + 1):
        a = float(harm_amp(kind, k)) * float(lp(k * f, cutoff, 2))
        if a < 1e-4:
            continue
        sig += a * np.sin(k * phase + rng.uniform(0, TWO_PI))
    # ADSR
    e = np.full(n, sus)
    na = max(1, int(att * SR))
    nd = max(1, int(dec * SR))
    e[:na] = rcos(na)
    d_end = min(n, na + nd)
    e[na:d_end] = 1 - (1 - sus) * rcos(nd)[:d_end - na]
    i1 = min(n, int(dur * SR))
    nr = n - i1
    if nr > 0:
        e[i1:] = e[i1 - 1] * (1 - rcos(nr))
    return sig * e


@lru_cache(maxsize=None)
def fm_bell(m, tau=1.6, index=1.3, glass=0.35, strike=0.15, length=None):
    """玻璃质感的钟音：谐和的 FM 本体 + 不谐和的高泛音（4.07 倍）+ 极短的击发（7.1 倍）。"""
    f = mtof(m)
    L = length if length else min(6.0, tau * 4.5)
    n = int(L * SR)
    t = np.arange(n) / SR
    I = index * np.exp(-t / 0.35) + 0.15
    body = np.sin(TWO_PI * f * t + I * np.sin(TWO_PI * 2 * f * t)) * np.exp(-t / tau)
    hi = []
    if f * 4.07 < 18000:
        hi.append(glass * np.sin(TWO_PI * f * 4.07 * t + 0.7) * np.exp(-t / (0.18 * tau)))
    if f * 7.1 < 18000:
        hi.append(strike * np.sin(TWO_PI * f * 7.1 * t + 1.9) * np.exp(-t / 0.025))
    sig = body + sum(hi) if hi else body
    na = int(0.002 * SR)
    sig[:na] *= rcos(na)
    nr = int(0.04 * SR)
    sig[-nr:] *= 1 - rcos(nr)
    return sig * 0.8


@lru_cache(maxsize=None)
def sine_pluck(m, tau=0.12, h2=0.15, length=0.6):
    f = mtof(m)
    n = int(length * SR)
    t = np.arange(n) / SR
    sig = (np.sin(TWO_PI * f * t) + h2 * np.sin(TWO_PI * 2 * f * t + 0.3)) * np.exp(-t / tau)
    na = int(0.002 * SR)
    sig[:na] *= rcos(na)
    nr = int(0.02 * SR)
    sig[-nr:] *= 1 - rcos(nr)
    return sig


@lru_cache(maxsize=None)
def sine_bass(m, dur, att=0.08, rel=0.5, drive=1.6, h3=0.0):
    """正弦低音，tanh 轻微饱和出二、三次谐波，小音箱上也听得见音高。"""
    f = mtof(m)
    n = int((dur + rel) * SR)
    t = np.arange(n) / SR
    x = np.sin(TWO_PI * f * t) + 0.25 * np.sin(TWO_PI * 2 * f * t + 0.4) + h3 * np.sin(TWO_PI * 3 * f * t + 1.1)
    sig = np.tanh(drive * x) / np.tanh(drive)
    return sig * ar_env(n, att, dur, rel)


@lru_cache(maxsize=None)
def kick(dec=0.26, f_hi=115.0, f_lo=50.0, click=0.12):
    n = int(dec * 5 * SR)
    t = np.arange(n) / SR
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.03)
    body = np.sin(TWO_PI * np.cumsum(f) / SR) * np.exp(-t / dec)
    rng = np.random.default_rng(7)
    c = rng.standard_normal(n) * np.exp(-t / 0.002)
    c = fft_filter(c, lambda fr: hp(fr, 1500, 2) * lp(fr, 6000, 2))
    sig = body + click * c / (np.abs(c).max() + 1e-9)
    na = int(0.001 * SR)
    sig[:na] *= rcos(na)
    nr = int(0.03 * SR)
    sig[-nr:] *= 1 - rcos(nr)
    return sig


@lru_cache(maxsize=None)
def hat(decay=0.035, lo=7000.0, hi=15000.0, seed=1):
    n = int((decay * 7 + 0.005) * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(seed_of('hat', seed))
    x = fft_filter(rng.standard_normal(n), lambda f: hp(f, lo, 4) * lp(f, hi, 2))
    x = x / (np.abs(x).max() + 1e-9)
    e = np.exp(-t / decay)
    na = int(0.0006 * SR)
    e[:na] *= rcos(na)
    nr = int(0.005 * SR)
    e[-nr:] *= 1 - rcos(nr)
    return x * e


@lru_cache(maxsize=None)
def tick(freq=4200.0, decay=0.006, noise=0.3, seed=3):
    """时钟似的嘀嗒：极短的正弦脉冲加一点噪声。"""
    n = int((decay * 8 + 0.004) * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(seed_of('tick', seed))
    nz = fft_filter(rng.standard_normal(n), lambda f: hp(f, 3000, 2) * lp(f, 12000, 2))
    nz /= np.abs(nz).max() + 1e-9
    sig = (np.sin(TWO_PI * freq * t) + noise * nz) * np.exp(-t / decay)
    na = int(0.0004 * SR)
    sig[:na] *= rcos(na)
    nr = int(0.003 * SR)
    sig[-nr:] *= 1 - rcos(nr)
    return sig


def noise_band(dur, lo, hi, seed, order=2):
    n = int(dur * SR)
    rng = np.random.default_rng(seed_of('nb', seed))
    x = fft_filter(rng.standard_normal(n), lambda f: hp(f, lo, order) * lp(f, hi, order))
    return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)


def pad_note(m, t0, dur, att, rel, cut_pts, voices=3, detune=8.0, spread=0.7, kind='saw',
             drift=2.5, seed=0, maxf=7000.0):
    """失谐的多声部铺底音（立体声）。滤波用随时间变化的泛音幅度实现，cut_pts 为绝对时间上的截止频率折线。"""
    f0 = mtof(m)
    n = int((dur + rel) * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(seed_of('pad', m, round(t0, 4), seed, kind))
    step = 64
    tc = t[::step]
    cc = np.interp(t0 + tc, cut_pts[0], cut_pts[1])
    cmax = cc.max()
    out = np.zeros((2, n))
    offs = np.linspace(-detune, detune, voices) if voices > 1 else [0.0]
    pans = np.linspace(-spread, spread, voices) if voices > 1 else [0.0]
    for vi in range(voices):
        f = f0 * 2 ** (offs[vi] / 1200)
        r1, r2 = rng.uniform(0.07, 0.23), rng.uniform(0.29, 0.61)
        p1, p2, p0 = rng.uniform(0, TWO_PI, 3)
        dr = drift * (0.6 * np.sin(TWO_PI * r1 * t + p1) + 0.4 * np.sin(TWO_PI * r2 * t + p2))
        phase = TWO_PI * np.cumsum(f * 2 ** (dr / 1200)) / SR + p0
        K = max(1, int(min(maxf, 3.5 * cmax) / f))
        sig = np.zeros(n)
        for k in range(1, K + 1):
            pk = rng.uniform(0, TWO_PI)
            ac = float(harm_amp(kind, k)) / np.sqrt(1 + (k * f / cc) ** 8)
            if ac.max() < 2e-4:
                continue
            sig += np.repeat(ac, step)[:n] * np.sin(k * phase + pk)
        gl, gr = pan_gains(pans[vi])
        out[0] += gl * sig
        out[1] += gr * sig
    return out * ar_env(n, att, dur, rel) / math.sqrt(voices)


# ───────────────────────── 空间 ─────────────────────────

def reverb_ir(rt_low, rt_high, length, predelay, seed, hp_hz=180.0, lp_hz=10000.0):
    """合成的立体声混响脉冲：去相关的噪声按频段各自指数衰减（高频衰减快），前面加几次早期反射。"""
    n = int(length * SR)
    nf = next_pow2(n)
    rng = np.random.default_rng(seed_of('ir', seed))
    f = np.fft.rfftfreq(nf, 1 / SR)
    t = np.arange(nf) / SR
    centers = np.array([125.0, 350.0, 1000.0, 2800.0, 8000.0])
    lc = np.log2(centers)
    lf = np.log2(np.maximum(f, 1.0))
    rts = np.interp(lc, [lc[0], lc[-1]], [rt_low, rt_high])
    pd = int(predelay * SR)
    ir = np.zeros((2, n))
    for c in range(2):
        W = np.fft.rfft(rng.standard_normal(nf))
        acc = np.zeros(nf)
        for b in range(len(centers)):
            w = np.zeros_like(f)
            if b > 0:
                seg = (lf >= lc[b - 1]) & (lf <= lc[b])
                w[seg] = (lf[seg] - lc[b - 1]) / (lc[b] - lc[b - 1])
            else:
                w[lf <= lc[0]] = 1
            if b < len(centers) - 1:
                seg = (lf > lc[b]) & (lf < lc[b + 1])
                w[seg] = (lc[b + 1] - lf[seg]) / (lc[b + 1] - lc[b])
            else:
                w[lf >= lc[-1]] = 1
            w = w * hp(f, hp_hz, 2) * lp(f, lp_hz, 2)
            acc += np.fft.irfft(W * w, nf) * np.exp(-6.91 * t / rts[b])
        acc = acc[:n - pd]
        nb = int(0.03 * SR)
        acc[:nb] *= rcos(nb)          # 密度逐渐建立
        ir[c, pd:] = acc
        # 早期反射
        for j in range(6):
            d = pd // 3 + int(rng.uniform(0.004, 0.045) * SR)
            if d < n:
                ir[c, d] += rng.uniform(0.15, 0.4) * (0.8 ** j) * np.sqrt(np.mean(acc[:SR // 10] ** 2)) * 30
    ir /= np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))
    return ir


def pingpong_ir(delay_s, fb, taps, lp0=7000.0, lp_mul=0.72, hp_hz=350.0, first='L'):
    """乒乓延迟的脉冲：第 k 次回声增益 fb^(k-1)，左右交替，每次更暗一些。"""
    n = int((delay_s * taps + 0.1) * SR)
    ir = np.zeros((2, n))
    K = 2048
    imp = np.zeros(K)
    imp[K // 2] = 1
    for k in range(1, taps + 1):
        fc = lp0 * lp_mul ** (k - 1)
        ker = fft_filter(imp, lambda f, fc=fc: lp(f, fc, 2) * hp(f, hp_hz, 1))
        idx = int(round(k * delay_s * SR))
        ch = (k - 1) % 2 if first == 'L' else k % 2
        a, b = idx - K // 2, idx + K // 2
        if a < 0:
            ker, a = ker[-a:], 0
        b = min(b, n)
        ir[ch, a:b] += fb ** (k - 1) * ker[:b - a]
    return ir


# ───────────────────────── 轨 ─────────────────────────

class Track:
    def __init__(self, dur):
        self.n = int(round(dur * SR))
        self.dur = dur
        self.dry = np.zeros((2, self.n))
        self.rev = np.zeros(self.n)
        self.dly = np.zeros(self.n)
        self.stems = {} if os.environ.get('MUSIC_STEMS') else None
        global LAST_TRACK
        LAST_TRACK = self

    def add(self, sig, t, gain=1.0, pan=0.0, rev=0.0, dly=0.0, layer='misc'):
        i = int(round(t * SR))
        if sig.ndim == 1:
            sig = sig[None, :]
            gl, gr = pan_gains(pan)
            st = np.vstack([gl * sig, gr * sig])
        else:
            gl, gr = pan_gains(pan)
            st = sig * np.array([[gl * math.sqrt(2)], [gr * math.sqrt(2)]])
        if i < 0:
            st = st[:, -i:]
            i = 0
        if i >= self.n:
            return
        m = min(st.shape[1], self.n - i)
        st = st[:, :m] * gain
        self.dry[:, i:i + m] += st
        mono = 0.5 * (st[0] + st[1])
        if rev:
            self.rev[i:i + m] += rev * mono
        if dly:
            self.dly[i:i + m] += dly * mono
        if self.stems is not None:
            s = self.stems.setdefault(layer, np.zeros(self.n, dtype=np.float32))
            s[i:i + m] += mono


def render(track, rev_ir, rev_gain, dly_ir=None, dly_gain=0.0, dly_to_rev=0.3,
           eq=None, fade_in=0.03, fade_out=(None, None)):
    mix = track.dry.copy()
    rev_in = track.rev.copy()
    if dly_ir is not None and np.any(track.dly):
        d = fft_conv_mono_to_stereo(track.dly, dly_ir, track.n)
        mix += dly_gain * d
        rev_in += dly_to_rev * dly_gain * 0.5 * (d[0] + d[1])
    mix += rev_gain * fft_conv_mono_to_stereo(rev_in, rev_ir, track.n)
    if eq is not None:
        mix = fft_filter(mix, eq)
    mix -= mix.mean(axis=1, keepdims=True)
    ni = int(fade_in * SR)
    mix[:, :ni] *= rcos(ni)
    fs, fe = fade_out
    if fs is not None:
        a, b = int(fs * SR), min(track.n, int(fe * SR))
        mix[:, a:b] *= (1 - rcos(b - a)) ** 1.5
        mix[:, b:] = 0
    return mix


# ───────────────────────── 响度与限幅 ─────────────────────────

def _biquad_resp(b, a, f):
    z = np.exp(-1j * TWO_PI * f / SR)
    return (b[0] + b[1] * z + b[2] * z ** 2) / (a[0] + a[1] * z + a[2] * z ** 2)


def lufs(x):
    """ITU-R BS.1770-4 的整合响度（K 计权在频域施加，400 ms 块、75% 重叠、绝对与相对门限）。"""
    n = x.shape[1]
    nf = next_pow2(n + SR)
    f = np.fft.rfftfreq(nf, 1 / SR)
    H = _biquad_resp([1.53512485958697, -2.69169618940638, 1.19839281085285],
                     [1.0, -1.69065929318241, 0.73248077421585], f) * \
        _biquad_resp([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621], f)
    y = np.fft.irfft(np.fft.rfft(x, nf) * H, nf)[:, :n]
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    cs = np.concatenate([np.zeros((2, 1)), np.cumsum(y ** 2, axis=1)], axis=1)
    starts = np.arange(0, n - blk + 1, hop)
    z = (cs[:, starts + blk] - cs[:, starts]) / blk
    zs = z.sum(axis=0)
    l = -0.691 + 10 * np.log10(zs + 1e-20)
    g1 = zs[l > -70]
    if not len(g1):
        return -99.0
    rel = -0.691 + 10 * np.log10(g1.mean()) - 10
    g2 = zs[(l > -70) & (l > rel)]
    return float(-0.691 + 10 * np.log10(g2.mean()))


def sliding_min(x, w):
    """长度为 w、居中的滑动最小值（van Herk / Gil-Werman，向量化）。"""
    n = len(x)
    pad = w // 2
    xp = np.concatenate([np.ones(pad), x, np.ones(w)])
    m = int(math.ceil(len(xp) / w)) * w
    xp = np.concatenate([xp, np.ones(m - len(xp))]).reshape(-1, w)
    pre = np.minimum.accumulate(xp, axis=1).ravel()
    suf = np.minimum.accumulate(xp[:, ::-1], axis=1)[:, ::-1].ravel()
    idx = np.arange(n)
    return np.minimum(suf[idx], pre[idx + w - 1])


def limit(x, ceil_db=CEIL_DB, w=480):
    """前瞻限幅：所需增益取滑动最小再滑动平均，保证每个采样都不超过上限。返回 (信号, 最大压缩 dB)。"""
    c = db2a(ceil_db)
    pk = np.abs(x).max(axis=0)
    g = np.minimum(1.0, c / np.maximum(pk, 1e-12))
    if g.min() >= 1.0:
        return x, 0.0
    gm = sliding_min(g, 2 * w + 1)
    cs = np.concatenate([[0.0], np.cumsum(gm)])
    h = w // 2
    lo = np.clip(np.arange(len(g)) - h, 0, len(g))
    hi = np.clip(np.arange(len(g)) + h + 1, 0, len(g))
    gs = (cs[hi] - cs[lo]) / (hi - lo)
    gs = np.minimum(gs, g)
    return x * gs, float(-20 * np.log10(gs.min()))


def normalize(x, target=TARGET_LUFS, ceil_db=CEIL_DB):
    g = db2a(target - lufs(x))
    gr = 0.0
    for _ in range(4):
        y, gr = limit(x * g, ceil_db)
        L = lufs(y)
        if abs(L - target) < 0.05:
            break
        g *= db2a(target - L)
    return y, gr


def to_int16(x, seed):
    rng = np.random.default_rng(seed)
    d = (rng.uniform(-0.5, 0.5, x.shape) + rng.uniform(-0.5, 0.5, x.shape))  # TPDF ±1 LSB
    return np.clip(np.round(x * 32767 + d), -32768, 32767).astype(np.int16)


def write_wav(path, xi16):
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(xi16.T.copy().tobytes())


def read_wav(path):
    with wave.open(str(path), 'rb') as w:
        assert w.getframerate() == SR and w.getsampwidth() == 2
        ch = w.getnchannels()
        d = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, ch).T
    return d.astype(np.float64) / 32768.0


# ───────────────────────── 外部工具 ─────────────────────────

def find_tool(name):
    """与 kit 的查找顺序一致：环境变量 → kit/config.local.json → assets/ffmpeg/bin → PATH。"""
    v = os.environ.get(name.upper())
    if v:
        return v
    try:
        cfg = json.loads((REPO / 'kit' / 'config.local.json').read_text(encoding='utf-8'))
    except Exception:
        cfg = {}
    if cfg.get(name):
        return cfg[name]
    p = REPO / 'assets' / 'ffmpeg' / 'bin' / (name + ('.exe' if os.name == 'nt' else ''))
    if p.exists():
        return str(p)
    return shutil.which(name)


def ffmpeg_ebur128(ff, path):
    r = subprocess.run([ff, '-hide_banner', '-nostats', '-i', str(path),
                        '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    s = r.stderr
    s = s[s.rfind('Summary:'):]
    num = lambda pat: float(re.search(pat, s, re.S).group(1))
    return {'lufs_i': num(r'I:\s*(-?[\d.]+) LUFS'), 'lra': num(r'LRA:\s*(-?[\d.]+) LU'),
            'true_peak_dbtp': num(r'True peak:.*?Peak:\s*(-?[\d.]+|-inf) dBFS')}


def make_mp3(ff, wav, mp3):
    subprocess.run([ff, '-y', '-hide_banner', '-loglevel', 'error', '-i', str(wav),
                    '-codec:a', 'libmp3lame', '-b:a', '192k', '-map_metadata', '-1', str(mp3)], check=True)


# ───────────────────────── 自检 ─────────────────────────

def band_shares(x):
    X = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ** 2
    f = np.fft.rfftfreq(len(x), 1 / SR)
    tot = X.sum() + 1e-12
    return [round(float(10 * np.log10(X[(f >= a) & (f < b)].sum() / tot + 1e-12)), 2)
            for a, b in ((0, 150), (150, 1500), (1500, SR / 2 + 1))]


def centroid(x):
    X = np.abs(np.fft.rfft(x * np.hanning(len(x))))
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return float((f * X).sum() / (X.sum() + 1e-12))


def rms_db(x):
    return float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12))


def analyze(x, sections, fade_start):
    n = x.shape[1]
    mono = 0.5 * (x[0] + x[1])
    side = 0.5 * (x[0] - x[1])
    res = {
        'duration_s': round(n / SR, 3),
        'sample_peak_dbfs': round(float(20 * np.log10(np.abs(x).max())), 2),
        'clipped_samples': int((np.abs(x) >= 0.999).sum()),
        'dc_offset': [float(f'{x[0].mean():.2e}'), float(f'{x[1].mean():.2e}')],
    }
    b = band_shares(mono)
    res['band_db'] = {'lt150': b[0], '150_1500': b[1], 'gt1500': b[2]}
    res['spectral_centroid_hz'] = round(centroid(mono), 1)
    # 静音：50 ms 窗、两声道中较响的一路低于 −60 dBFS
    w = int(0.05 * SR)
    nw = n // w
    wr = np.sqrt(np.mean(x[:, :nw * w].reshape(2, nw, w) ** 2, axis=2)).max(axis=0)
    quiet = 20 * np.log10(wr + 1e-12) < -60
    lim = int(fade_start * SR) // w
    run = best = 0
    for q in quiet[:lim]:
        run = run + 1 if q else 0
        best = max(best, run)
    res['longest_silence_before_fade_s'] = round(best * w / SR, 2)
    # 左右相关：1 秒窗
    W = SR
    cors = []
    for i in range(0, n - W + 1, W):
        L, R = x[0, i:i + W], x[1, i:i + W]
        e = math.sqrt(float(np.sum(L * L) * np.sum(R * R)))
        if e > 1e-8 and rms_db(0.5 * (L + R)) > -50:
            cors.append(float(np.sum(L * R) / e))
    cors = np.array(cors)
    res['lr_correlation'] = {'median': round(float(np.median(cors)), 3), 'min': round(float(cors.min()), 3),
                             'max': round(float(cors.max()), 3),
                             'share_windows_above_0.98': round(float((cors > 0.98).mean()), 3)}
    res['side_to_mid_db'] = round(rms_db(side) - rms_db(mono), 2)
    sec = []
    for name, a, bb in sections:
        seg = mono[int(a * SR):int(min(bb, n / SR) * SR)]
        sb = band_shares(seg)
        sec.append({'name': name, 'start': round(a, 2), 'end': round(min(bb, n / SR), 2), 'rms_db': round(rms_db(seg), 2),
                    'band_db': {'lt150': sb[0], '150_1500': sb[1], 'gt1500': sb[2]},
                    'centroid_hz': round(centroid(seg), 1)})
    res['sections'] = sec
    return res


def mmss(s):
    s = int(round(s))
    return f'{s // 60}:{s % 60:02d}'


# ───────────────────────── A 事件循环 ─────────────────────────

def compose_A():
    bpm = 124
    beat = 60 / bpm
    T = lambda bar, b=0.0: (bar * 4 + b) * beat
    total = 59.5
    tr = Track(total)
    # (名称, 低音, 铺底, 琶音音列)
    CH = [('Dm9', 38, [53, 57, 60, 64], [62, 65, 69, 72, 74, 76]),
          ('B♭maj9', 34, [53, 57, 60, 62], [62, 65, 69, 70, 72, 74]),
          ('Fadd9', 41, [53, 57, 60, 67], [60, 65, 67, 69, 72, 77]),
          ('C6/9', 36, [55, 60, 62, 64], [60, 62, 64, 67, 69, 72])]
    chord = lambda bar: CH[0] if bar >= 24 else CH[(bar // 2) % 4]
    P = [[0, 2, 4, 2, 5, 2, 4, 1, 0, 2, 4, 2, 5, 3, 4, 2],
         [0, 2, 4, 2, 5, 2, 4, 1, 1, 3, 5, 3, 4, 2, 3, 1]]
    ACC = [1.0, 0.55, 0.75, 0.55]
    secs = [('引子', 0.0, T(4)), ('推进', T(4), T(12)), ('最高处', T(12), T(22)), ('收束', T(22), total)]

    # 铺底的截止频率随段落打开、再合上
    cut = ([0, T(4), T(8), T(12), T(14), T(22), T(24), total],
           [450, 500, 800, 1300, 1900, 1900, 1100, 500])

    # 琶音：一拍四个十六分音符一组，组首重音——一条命令接一条命令
    for bar in range(0, 26):
        name, bass, padn, arp = chord(bar)
        pat = P[bar % 2]
        if bar < 2:
            steps = [0, 4, 8, 12]                       # 一拍一下
        elif bar < 4:
            steps = list(range(0, 16, 2))               # 八分
        elif bar < 23:
            steps = list(range(16))                     # 十六分
        elif bar == 23:
            steps = list(range(0, 16, 2))
        elif bar == 24:
            steps = [0, 4, 8, 12]
        else:
            steps = [0]
        tone = 0.7 if bar < 4 else (1.0 if bar < 8 else (1.3 if bar < 12 else (1.7 if bar < 22 else 1.1)))
        lvl = 0.42 if bar < 4 else 0.36
        if bar >= 24:
            lvl = 0.30 * (0.8 if bar == 25 else 1.0)
        for s in steps:
            v = ACC[s % 4]
            if bar >= 24:
                v *= 1.0 - 0.15 * (s // 4)
            sig = pluck(arp[pat[s]], 0.42, tone, 9.0, 'saw')
            tr.add(sig, T(bar, s / 4), lvl * v, pan=(-0.22 if s % 2 else 0.22), rev=0.10, layer='arp')

    # 嘀嗒：每拍一下，从头到尾不变（单线程的时钟）
    for bar in range(0, 25):
        for b in range(4):
            v = 1.0 if b == 0 else 0.7
            tr.add(tick(4600.0, 0.005, 0.3), T(bar, b), 0.12 * v, pan=0.35, rev=0.05, layer='tick')

    # 低音：3-3-2 的十六分节奏型，推进前半只有每小节两下
    BP = [(0, 0), (3, 0), (6, 12), (8, 0), (11, 0), (14, 7)]
    for bar in range(4, 24):
        bass = chord(bar)[1]
        if bar < 8:
            for s in (0, 8):
                tr.add(pluck(bass, 0.7, 0.35, 4.0, 'square', 3000.0), T(bar, s / 4), 0.50, layer='bass')
        else:
            for s, iv in BP:
                v = 1.0 if s in (0, 8) else 0.8
                tr.add(pluck(bass + iv, 0.36, 0.45, 7.0, 'square', 3500.0), T(bar, s / 4), 0.48 * v, layer='bass')
    tr.add(sine_bass(38, T(2), 0.02, 2.5, 1.3), T(24), 0.12, layer='bass')   # 收束：持续的 D

    # 铺底：低通锯齿，推进时进入
    for bar in range(2, 24, 2):
        name, bass, padn, arp = chord(bar)
        for i, m in enumerate(padn):
            tr.add(pad_note(m, T(bar), T(2), 0.25, 0.6, cut, 3, 7.0, 0.7, 'saw', seed=i),
                   T(bar), 0.055, rev=0.25, layer='pad')
    for i, m in enumerate([50, 53, 57, 60, 64]):                               # 最后的 Dm9
        tr.add(pad_note(m, T(24), 8.5, 0.3, 4.0, cut, 3, 7.0, 0.8, 'saw', seed=10 + i),
               T(24), 0.06, rev=0.35, layer='pad')

    # 镲：推进后半起十六分闭镲；最高处加反拍开镲、二四拍的轻击、很轻的底鼓
    HV = [0.9, 0.35, 0.6, 0.35]
    for bar in range(8, 22):
        for s in range(16):
            tr.add(hat(0.022, 8000.0, 15000.0, s % 3), T(bar, s / 4), 0.11 * HV[s % 4],
                   pan=-0.3, rev=0.03, layer='hat')
    for bar in range(4, 22):
        for b in (1, 3):
            tr.add(tick(1900.0, 0.012, 0.8, 5), T(bar, b), 0.10, pan=0.1, rev=0.12, layer='click')
    for bar in range(12, 22):
        for b in range(4):
            tr.add(hat(0.09, 6500.0, 14000.0, 9), T(bar, b + 0.5), 0.07, pan=0.3, rev=0.06, layer='hat')
            tr.add(kick(0.22, 110.0, 52.0, 0.08), T(bar, b), 0.30, layer='kick')

    # 最高处：两个八度之上的正弦点缀（反拍八分，左右交替）
    for bar in range(12, 22):
        arp = chord(bar)[3]
        for j, s in enumerate(range(2, 16, 4)):
            m = arp[[4, 5, 3, 5][j]] + 12
            tr.add(sine_pluck(m, 0.10, 0.1, 0.5), T(bar, s / 4), 0.06, pan=(0.6 if j % 2 else -0.6), rev=0.2,
                   layer='ping')

    # 最高处的短旋律（方波主奏，短音、干净）
    LEAD = [(12, 0, 1, 72), (12, 1, 0.5, 74), (12, 1.5, 0.5, 77), (12, 2, 1.5, 81), (12, 3.5, 0.5, 79),   # Fadd9
            (13, 0, 1, 77), (13, 1, 1, 76), (13, 2, 2, 72),
            (14, 0, 1.5, 79), (14, 1.5, 0.5, 76), (14, 2, 1, 74), (14, 3, 1, 76),                         # C6/9
            (15, 0, 1, 72), (15, 1, 1, 74), (15, 2, 2, 79),
            (16, 0, 1, 77), (16, 1, 0.5, 79), (16, 1.5, 0.5, 81), (16, 2, 1.5, 84), (16, 3.5, 0.5, 81),   # Dm9
            (17, 0, 1, 79), (17, 1, 1, 77), (17, 2, 2, 76),
            (18, 0, 1, 74), (18, 1, 0.5, 77), (18, 1.5, 0.5, 81), (18, 2, 1.5, 81), (18, 3.5, 0.5, 79),   # B♭maj9
            (19, 0, 2, 77), (19, 2, 1, 74), (19, 3, 1, 72),
            (20, 0, 1.5, 81), (20, 1.5, 0.5, 79), (20, 2, 1, 77), (20, 3, 1, 79),                         # Fadd9
            (21, 0, 2, 81), (21, 2, 2, 84),
            (22, 0, 4, 79)]
    for bar, b, d, m in LEAD:
        dd = d * beat * 0.85
        tr.add(tone_note(m, round(dd, 4), 'square', 2600.0, 0.006, 0.12, 0.55, 0.12 if d < 4 else 1.2,
                         vib=6.0 if d >= 1.5 else 0.0, vib_delay=0.2),
               T(bar, b), 0.13, pan=0.05, rev=0.22, layer='lead')

    rev = reverb_ir(1.7, 0.9, 2.5, 0.012, 'A')
    eq = lambda f: hp(f, 32, 2) * bell_eq(f, 2300, -1.5, 0.9)
    mix = render(tr, rev, 0.55, eq=eq, fade_out=(53.0, total))
    meta = dict(id='A', title='事件循环', bpm=bpm, key='D 小调', progression='Dm9 → B♭maj9 → Fadd9 → C6/9（各两小节），收在 Dm9',
                sections=secs, fade_start=53.0)
    s = {k: (mmss(a), mmss(b)) for k, a, b in secs}
    meta['description'] = (
        f'每分钟 124 拍，D 小调。节奏：一拍是一条「命令」——拨弦琶音四个十六分音符一组、组首重音，'
        f'像事件循环一条接一条地执行；高处的嘀嗒每拍一下，从头到尾不变速，是单线程的时钟。'
        f'动机：琶音在每个和弦里走同一个两拍的音型，每个和弦的第二小节后半句变一次；最高处加一条短而干净的方波旋律（C5–C6，「C–D–F–A–G」起句）。'
        f'和声：Dm9 → B♭maj9 → Fadd9 → C6/9，每两小节一换，最高处结束在 F、C 上，再回到 Dm9 收住。'
        f'配器：短衰减的锯齿拨弦、方波拨弦低音（3-3-2 节奏型）、低通的失谐锯齿铺底、十六分闭镲与嘀嗒；'
        f'最高处才有很轻的底鼓、反拍开镲和两个八度之上的正弦点缀，没有铜管和合唱。'
        f'段落：引子 {s["引子"][0]}–{s["引子"][1]} 只有嘀嗒和一拍一下的拨弦（一次一条命令），后半加密到八分、很暗的铺底垫进来；'
        f'推进 {s["推进"][0]}–{s["推进"][1]} 琶音加密到十六分，低音与二四拍的轻击进入，后半闭镲跟上，铺底的滤波逐步打开；'
        f'最高处 {s["最高处"][0]}–{s["最高处"][1]} 旋律、轻底鼓、开镲与点缀进入；'
        f'收束 {s["收束"][0]}–{s["收束"][1]} 层层撤去，琶音从十六分退回八分、四分，停在持续的 Dm9 上淡出。')
    return mix, meta


# ───────────────────────── B 微秒 ─────────────────────────

def compose_B():
    bpm = 104
    beat = 60 / bpm
    T = lambda bar, b=0.0: (bar * 4 + b) * beat
    total = 60.0
    tr = Track(total)
    CH = [('Emaj9', 40, [56, 59, 63, 66]),
          ('C♯m11', 37, [56, 59, 64, 66]),
          ('Amaj9♯11', 33, [56, 59, 61, 63]),
          ('Bsus4(add9)', 35, [54, 59, 61, 64])]
    chord_idx = lambda bar: (bar // 2) % 4
    secs = [('引子', 0.0, T(4)), ('推进', T(4), T(12)), ('最高处', T(12), T(20)), ('收束', T(20), total)]
    EMAJ = [m for m in range(40, 100) if m % 12 in (4, 6, 8, 9, 11, 1, 3)]

    def run_into(m, t, nnotes, gap, lvl, pan, rev, dly, layer='run', scale=EMAJ, up=True):
        """装饰音群：在目标音之前用 nnotes 个极快的音沿音阶冲上去（或落下来）。"""
        below = [x for x in scale if x < m] if up else [x for x in scale if x > m][::-1]
        notes = below[-nnotes:] if up else below[-nnotes:]
        for j, x in enumerate(notes):
            tt = t - gap * (len(notes) - j)
            v = 0.35 + 0.45 * (j + 1) / len(notes)
            tr.add(fm_bell(x, 0.22, 0.9, 0.3, 0.12, 1.0), tt, lvl * v, pan=pan + (j - len(notes) / 2) * 0.08,
                   rev=rev, dly=dly, layer=layer)

    # 每个和弦两小节的钟音乐句：(拍, 音, 是否带装饰音群)
    PH = {0: [(0, 83, 1), (1.5, 78, 0), (2, 80, 0), (5, 87, 1), (6.5, 85, 0), (7, 83, 0)],
          1: [(0, 80, 1), (1.5, 76, 0), (2, 78, 0), (5, 83, 1), (7, 80, 0)],
          2: [(0, 80, 1), (1.5, 85, 0), (2, 87, 0), (5, 88, 1), (6.5, 83, 0), (7, 85, 0)],
          3: [(0, 85, 1), (1.5, 83, 0), (2, 78, 0), (5, 80, 1), (6, 78, 0), (6.5, 76, 0), (7, 78, 0)]}

    # 引子：稀疏的单个钟音，长延迟
    for bar, b, m in [(0, 0, 83), (1, 2, 80), (2, 0, 80), (2, 3, 76), (3, 1.5, 78)]:
        tr.add(fm_bell(m, 1.8), T(bar, b), 0.30, pan=0.1, rev=0.3, dly=0.55, layer='bell')
    run_into(83, T(3, 3.5), 4, 0.032, 0.22, 0.0, 0.3, 0.5)
    tr.add(fm_bell(83, 1.6), T(3, 3.5), 0.26, rev=0.3, dly=0.5, layer='bell')

    # 推进与最高处：乐句 + 装饰音群；最高处装饰音更长更快，八度叠一层
    for bar in range(4, 22, 2):
        ci = chord_idx(bar)
        peak = 12 <= bar < 20
        last = bar >= 20
        for b, m, orn in PH[ci]:
            if last and b > 4:
                break
            t = T(bar, b)
            pan = 0.15 if int(b * 2) % 2 else -0.15
            pk = 1.12 if peak else 1.0
            tr.add(fm_bell(m, 1.6 if orn else 1.0), t, pk * (0.30 if orn else 0.22), pan=pan, rev=0.25, dly=0.38,
                   layer='bell')
            if orn:
                if peak:
                    run_into(m, t, 6, 0.022, 0.20, -pan, 0.25, 0.3)
                else:
                    run_into(m, t, 4, 0.030, 0.20, -pan, 0.25, 0.3)
            if peak:
                tr.add(fm_bell(m + 12, 0.8, 0.8, 0.15, 0.05), t + 0.011, 0.20, pan=-pan * 4, rev=0.3, dly=0.3,
                       layer='bell8va')
        if peak:  # 第二小节末尾落下来的一串
            top = PH[ci][-1][1]
            run_into(top - 12, T(bar + 1, 3.75), 5, 0.024, 0.16, 0.4, 0.3, 0.35, up=False)

    # 铺底：柔和的谐波，慢起慢收；空气声
    cut = ([0, T(4), T(12), T(14), T(20), T(22), total], [900, 1200, 1600, 2600, 2400, 1800, 900])
    for bar in range(0, 22, 2):
        ci = chord_idx(bar)
        att = 2.0 if bar == 0 else 0.9
        for i, m in enumerate(CH[ci][2]):
            tr.add(pad_note(m, T(bar), T(2), att, 1.4, cut, 2, 5.0, 0.8, 'soft', 3.0, seed=i, maxf=6000.0),
                   T(bar), 0.15 if 12 <= bar < 20 else 0.12, rev=0.35, layer='pad')
    air_env_t = [0, T(2), T(12), T(16), T(20), total]
    air_env_v = [0.3, 0.6, 0.8, 1.0, 0.7, 0.3]
    air = noise_band(total, 4500, 11000, 'airB', 2)
    tt = np.arange(len(air)) / SR
    air *= np.interp(tt, air_env_t, air_env_v) * (0.7 + 0.3 * np.sin(TWO_PI * 0.11 * tt))
    tr.add(np.vstack([air, np.roll(air, 4801)]), 0.0, 0.012, rev=0.0, layer='air')

    # 低音：持续的正弦，每个和弦一个音
    for bar in range(4, 22, 2):
        bass = CH[chord_idx(bar)][1]
        tr.add(sine_bass(bass, T(2) - 0.05, 0.25, 0.5, 1.4), T(bar), 0.21, layer='bass')
    # 最高处：低音上方八度的轻柔脉动 + 中音区的玻璃正弦八分音符
    for bar in range(12, 20):
        ci = chord_idx(bar)
        tones = [m + 12 for m in CH[ci][2]]
        for s in range(8):
            m = tones[[0, 2, 1, 3, 2, 0, 3, 1][s]]
            tr.add(sine_pluck(m, 0.07, 0.25, 0.4), T(bar, s / 2), 0.12 * (1.0 if s % 2 == 0 else 0.7),
                   pan=(0.45 if s % 2 else -0.45), rev=0.15, dly=0.12, layer='glass')

    # 极轻的石英嘀嗒：推进后半起二四拍，最高处十六分
    for bar in range(8, 20):
        if bar < 12:
            for b in (1, 3):
                tr.add(tick(7200.0, 0.003, 0.2, 11), T(bar, b), 0.08, pan=0.5, rev=0.1, layer='tick')
        else:
            for s in range(16):
                v = 1.0 if s % 4 == 0 else 0.45
                tr.add(tick(7200.0, 0.003, 0.2, 11), T(bar, s / 4), 0.07 * v, pan=(0.5 if s % 2 else 0.3),
                       rev=0.05, layer='tick')

    # 收束：Emaj9♯11，钟音极快地向上扫一遍（225 毫秒九个音），铺底与低音持续后淡出
    tf = T(22)
    fin = [64, 68, 71, 75, 78, 82, 83, 87, 88]
    for j, m in enumerate(fin):
        tr.add(fm_bell(m, 2.6, 1.0, 0.18, 0.08, 6.0), tf + j * 0.025, 0.20 * (0.8 + 0.2 * j / 8),
               pan=-0.6 + 1.2 * j / 8, rev=0.35, dly=0.3, layer='bell')
    for i, m in enumerate([52, 56, 59, 63, 66, 70]):
        tr.add(pad_note(m, tf, 6.5, 0.5, 3.0, cut, 2, 5.0, 0.8, 'soft', 3.0, seed=20 + i, maxf=6000.0),
               tf, 0.11, rev=0.4, layer='pad')
    tr.add(sine_bass(40, 6.0, 0.3, 3.0, 1.4), tf, 0.19, layer='bass')

    rev = reverb_ir(3.0, 1.7, 4.0, 0.02, 'B')
    dly = pingpong_ir(0.75 * beat, 0.5, 8, 7500.0, 0.75, 400.0)
    eq = lambda f: hp(f, 32, 2) * bell_eq(f, 2300, -1.5, 0.9)
    mix = render(tr, rev, 0.6, dly, 0.55, 0.35, eq=eq, fade_out=(54.0, total))
    meta = dict(id='B', title='微秒', bpm=bpm, key='E 大调（利底亚色彩）',
                progression='Emaj9 → C♯m11 → Amaj9♯11 → Bsus4(add9)（各两小节），收在 Emaj9♯11',
                sections=secs, fade_start=54.0)
    s = {k: (mmss(a), mmss(b)) for k, a, b in secs}
    meta['description'] = (
        f'每分钟 104 拍，E 大调，结尾带利底亚的升四级色彩。节奏：疏，拍子上留出大量空白；快不靠密度，'
        f'而靠装饰音——重要的钟音前面有四到六个 22–32 毫秒一个的极快上行音群「嗖」地冲上去，像一次微秒级的命令；'
        f'乒乓延迟（附点八分）把每个音在左右之间弹开。动机：两小节一句的钟音乐句（B5–F♯5–G♯5 … D♯6），'
        f'每句第一拍和第六拍的长音带装饰音群。和声：Emaj9 → C♯m11 → Amaj9♯11 → Bsus4(add9)，每两小节一换，最后经 A 到 E。'
        f'配器：FM 玻璃钟音（谐和本体加 4.07 倍的不谐和泛音）、柔和谐波的铺底与极轻的高频空气声、持续的正弦低音；'
        f'最高处才加高八度的钟音、中音区的玻璃正弦八分音符和十六分的石英嘀嗒，没有鼓。'
        f'段落：引子 {s["引子"][0]}–{s["引子"][1]} 铺底慢慢浮上来，只有几个单独的钟音和长延迟；'
        f'推进 {s["推进"][0]}–{s["推进"][1]} 乐句与装饰音群进入，低音进入，后半有二四拍的轻嘀嗒；'
        f'最高处 {s["最高处"][0]}–{s["最高处"][1]} 装饰音更长更快、钟音叠高八度、铺底打开；'
        f'收束 {s["收束"][0]}–{s["收束"][1]} 回到单层乐句，最后在 Emaj9♯11 上用九个钟音 0.2 秒扫上去，持续淡出。')
    return mix, meta


# ───────────────────────── C 终章 ─────────────────────────

def compose_C():
    bpm = 94
    beat = 60 / bpm
    T = lambda bar, b=0.0: (bar * 4 + b) * beat
    total = 61.0
    tr = Track(total)
    CH = [('Cm9', 36, [55, 60, 62, 63, 67], [60, 67, 72, 74, 75]),
          ('A♭maj7', 32, [55, 60, 63, 67], [56, 63, 68, 70, 72]),
          ('E♭add9', 39, [55, 58, 63, 65], [63, 70, 75, 77, 79]),
          ('B♭sus4', 34, [53, 58, 63, 65], [58, 65, 70, 72, 75]),
          ('B♭', 34, [53, 58, 62, 65], [58, 65, 70, 72, 74]),
          ('A♭maj9', 32, [55, 60, 63, 67, 70], [56, 63, 68, 70, 72]),
          ('B♭6/9sus', 34, [53, 58, 60, 65, 67], [58, 65, 70, 72, 77]),
          ('C(add9)', 36, [48, 55, 62, 64, 67, 72], [60, 67, 72, 74, 76])]

    def chord(bar):
        if bar >= 20:
            return CH[7]
        if bar == 18:
            return CH[5]
        if bar == 19:
            return CH[6]
        i = ((bar - 4) // 2) % 4          # 引子从 E♭ 起，推进落在 Cm 上，最高处再落一次 Cm
        if i == 3 and bar % 2 == 1:
            return CH[4]
        return CH[i]

    secs = [('引子', 0.0, T(4)), ('推进', T(4), T(12)), ('最高处', T(12), T(18)), ('收束', T(18), total)]
    cut = ([0, T(4), T(8), T(12), T(12.5), T(18), T(20), T(21), total],
           [420, 560, 850, 1500, 2600, 2400, 2000, 2400, 650])

    # 铺底：失谐锯齿，三声部；滤波逐步打开
    for bar in range(0, 20):
        c = chord(bar)
        prev = chord(bar - 1) if bar > 0 else None
        if prev is not None and prev[2] == c[2] and bar not in (0,):
            continue
        # 和弦持续到下一个不同的和弦
        nb = bar + 1
        while nb < 20 and chord(nb)[2] == c[2]:
            nb += 1
        d = T(nb) - T(bar)
        att = 3.5 if bar == 0 else 0.5
        for i, m in enumerate(c[2]):
            tr.add(pad_note(m, T(bar), d, att, 1.0, cut, 3, 9.0, 0.85, 'saw', 3.0, seed=i),
                   T(bar), 0.085, rev=0.35, layer='pad')
        if 12 <= bar < 20:  # 最高处：高八度的柔和一层，让铺底更宽
            for i, m in enumerate(c[2][-3:]):
                tr.add(pad_note(m + 12, T(bar), d, 0.8, 1.2, cut, 2, 6.0, 0.95, 'soft', 3.0, seed=30 + i),
                       T(bar), 0.05, rev=0.45, layer='pad8va')
    tf = T(20)
    for i, m in enumerate(CH[7][2][1:]):
        tr.add(pad_note(m, tf, 6.0, 0.6, 4.0, cut, 3, 9.0, 0.9, 'saw', 3.0, seed=40 + i),
               tf, 0.085, rev=0.45, layer='pad')
    for i, m in enumerate([76, 79, 84]):
        tr.add(pad_note(m, tf, 6.0, 1.5, 4.0, cut, 2, 6.0, 0.95, 'soft', 3.0, seed=50 + i),
               tf, 0.05, rev=0.5, layer='pad8va')

    # 琶音：引子里零星几个暗音，推进为八分、后半十六分，滤波随之打开
    for bar, b in [(1, 0), (1, 2), (2, 0), (2, 2.5), (3, 0), (3, 2), (3, 3)]:
        arp = chord(bar)[3]
        tr.add(pluck(arp[[0, 2, 1, 3, 2, 4, 3][(bar * 2 + int(b)) % 7]], 0.8, 0.45, 5.0, 'saw', 4500.0, 0.004), T(bar, b), 0.32,
               pan=0.3 if int(b) % 2 else -0.3, rev=0.45, dly=0.3, layer='arp')
    PAT = [0, 1, 2, 3, 4, 3, 2, 1]
    for bar in range(4, 20):
        arp = chord(bar)[3]
        if bar < 10:
            steps = [(s / 2, PAT[s]) for s in range(8)]
            tone = 0.45 + 0.08 * (bar - 4)
            lvl = 0.30
        else:
            steps = [(s / 4, PAT[s % 8]) for s in range(16)]
            tone = 0.95 if bar < 12 else (1.2 if bar < 18 else 0.9)
            lvl = 0.22 if bar < 12 else 0.19
        for b, idx in steps:
            v = 1.0 if b == int(b) else 0.75
            tr.add(pluck(arp[idx], 0.5, round(tone, 2), 6.5, 'saw', 6000.0 if bar < 10 else 9000.0, 0.003), T(bar, b), lvl * v,
                   pan=(0.3 if (b * 4) % 2 else -0.3), rev=0.25, dly=0.18, layer='arp')
    for j, (b, m) in enumerate([(0, 72), (0.5, 79), (1, 84), (1.5, 86), (2, 88), (3, 84)]):   # 结尾的回声
        tr.add(pluck(m, 0.9, 0.9, 4.0, 'saw', 9000.0), T(20, b), 0.16 * (1 - 0.1 * j), pan=(-0.4 + 0.16 * j),
               rev=0.5, dly=0.4, layer='arp')

    # 低音：推进后半八分脉动；最高处改为持续 + 正弦次低音缓缓涌起；收束持续
    for bar in range(6, 12):
        bass = chord(bar)[1]
        for s in range(8):
            v = 1.0 if s % 2 == 0 else 0.7
            tr.add(pluck(bass + (12 if s in (3, 7) else 0), 0.30, 0.35, 8.0, 'saw', 2500.0), T(bar, s / 2),
                   0.42 * v, layer='bass')
    for bar in range(12, 20):
        c = chord(bar)
        if bar % 2 == 0 or bar == 19:
            d = T(1 if bar >= 18 else 2) - 0.05
            tr.add(tone_note(c[1] + 12, round(d, 4), 'saw', 420.0, 0.05, 0.4, 0.75, 0.3), T(bar), 0.26, layer='bass')
            tr.add(sine_bass(c[1] + 12, round(d, 4), 1.2, 0.4, 1.1), T(bar), 0.15, layer='sub')
    tr.add(tone_note(48, 6.0, 'saw', 380.0, 0.05, 0.5, 0.75, 3.5), tf, 0.22, layer='bass')
    tr.add(sine_bass(48, 6.0, 1.5, 3.5, 1.1), tf, 0.10, layer='sub')

    # 最高处入口：一次收着的低频「落点」；之前两小节轻轻的噪声上扬
    nsw = int(T(2) * SR)
    lo = noise_band(T(2), 600, 2000, 'rC1')
    hi_ = noise_band(T(2), 2500, 7000, 'rC2')
    x = np.linspace(0, 1, nsw)
    sw = (lo * (1 - x) + hi_ * x) * x ** 2.2
    sw[-int(0.03 * SR):] *= 1 - rcos(int(0.03 * SR))
    tr.add(np.vstack([sw, np.roll(sw, 2400)]), T(10), 0.012, rev=0.3, layer='riser')
    tr.add(kick(0.9, 75.0, 38.0, 0.0), T(12), 0.30, rev=0.5, layer='boom')

    # 心跳般的轻底鼓（推进后半一小节一下，最高处一、三拍）与极轻的沙锤
    for bar in range(8, 18):
        for b in ((0,) if bar < 12 else (0, 2)):
            tr.add(kick(0.3, 100.0, 46.0, 0.05), T(bar, b), 0.22, rev=0.1, layer='kick')
    for bar in range(12, 18):
        for s in range(16):
            v = [0.7, 0.35, 1.0, 0.35][s % 4]
            tr.add(hat(0.045, 5500.0, 12000.0, 20 + s % 4), T(bar, s / 4), 0.022 * v, pan=0.35, rev=0.1,
                   layer='shaker')

    # 主奏：温暖的锯齿，慢起音、延迟起振的颤音；最后一音是 C 大三和弦的三音 E
    LEAD = [(12, 0, 3, 79), (12, 3, 1, 77), (13, 0, 2, 75), (13, 2, 1, 74), (13, 3, 1, 75),
            (14, 0, 4, 72), (15, 0, 2, 75), (15, 2, 2, 77),
            (16, 0, 3, 79), (16, 3, 1, 82), (17, 0, 2, 80), (17, 2, 1, 79), (17, 3, 1, 77),
            (18, 0, 4, 79), (19, 0, 2, 77), (19, 2, 2, 74), (20, 0, 8, 76)]
    for bar, b, d, m in LEAD:
        dd = round(d * beat * 0.95, 4)
        rel = 3.5 if d >= 8 else 0.35
        for det, pn in ((-6.0, -0.3), (6.0, 0.3)):
            tr.add(tone_note(m, dd, 'saw', 2000.0, 0.07, 0.3, 0.8, rel, vib=11.0, vib_rate=5.2,
                             vib_delay=0.35, detune=det),
                   T(bar, b), 0.075, pan=pn, rev=0.35, dly=0.22, layer='lead')

    rev = reverb_ir(4.2, 2.2, 5.0, 0.03, 'C')
    dly = pingpong_ir(beat, 0.38, 6, 5000.0, 0.7, 300.0)
    eq = lambda f: hp(f, 30, 2) * bell_eq(f, 2300, -1.5, 0.9)
    mix = render(tr, rev, 0.6, dly, 0.45, 0.4, eq=eq, fade_out=(55.0, total))
    meta = dict(id='C', title='终章', bpm=bpm, key='C 小调 → C 大调',
                progression='引子 E♭add9 → B♭sus4–B♭；之后 Cm9 → A♭maj7 → E♭add9 → B♭sus4–B♭（各两小节）；收束 A♭maj9 → B♭6/9sus → C(add9)',
                sections=secs, fade_start=55.0)
    s = {k: (mmss(a), mmss(b)) for k, a, b in secs}
    meta['description'] = (
        f'每分钟 94 拍，C 小调，最后转到 C 大调。节奏：由疏到密——琶音从零星的暗音变成八分、再变成十六分，'
        f'低音从八分脉动到最高处改为长音，轻底鼓像心跳一样只在一、三拍。动机：一条慢而宽的主奏旋律（G5–F5–E♭5–D5 … C5），'
        f'从最高处唱到结尾，最后一个音落在 C 大三和弦的三音 E 上，把整个小调的段落「抬」成大调。'
        f'和声：Cm9 → A♭maj7 → E♭add9 → B♭sus4–B♭，每两小节一换；引子从关系大调 E♭ 起、经 B♭ 落到推进开头的 Cm，最高处的入口再落一次 Cm；'
        f'收束走 E♭ → A♭maj9 → B♭6/9sus → C(add9)，即 ♭VI–♭VII–I 的皮卡第式结束。'
        f'配器：三声部失谐锯齿铺底（滤波随段落从约 420 Hz 开到约 2.6 kHz，再合上）、锯齿拨弦琶音、锯齿低音与正弦次低音、'
        f'双声部失谐锯齿主奏（延迟起振的颤音）、四分音符乒乓延迟与约 4 秒的长混响；史诗感靠铺底变宽、低音长音与次低音涌起，'
        f'只用一次低频落点和两小节极轻的噪声上扬，不堆鼓、不用铜管与合唱。'
        f'段落：引子 {s["引子"][0]}–{s["引子"][1]} 暗的铺底慢慢浮起，几个远处的拨弦；'
        f'推进 {s["推进"][0]}–{s["推进"][1]} 琶音八分进入并逐步变亮，后半低音脉动、心跳底鼓进入，最后两小节琶音变成十六分、噪声轻轻上扬；'
        f'最高处 {s["最高处"][0]}–{s["最高处"][1]} 一次落点后铺底全开、加高八度一层，低音长音与次低音涌起，主奏旋律进入；'
        f'收束 {s["收束"][0]}–{s["收束"][1]} 鼓与琶音撤去，经 A♭maj9、B♭6/9sus 落到 C(add9)，主奏停在 E，长混响尾里淡出。')
    return mix, meta


# ───────────────────────── 主程序 ─────────────────────────

COMPOSERS = {'A': compose_A, 'B': compose_B, 'C': compose_C}


def main(argv):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    ids = [a.upper() for a in argv if a.upper() in COMPOSERS] or list(COMPOSERS)
    OUT.mkdir(parents=True, exist_ok=True)
    ff = find_tool('ffmpeg')
    jpath = OUT / 'music-demo.json'
    try:
        doc = json.loads(jpath.read_text(encoding='utf-8'))
    except Exception:
        doc = {}
    doc.setdefault('about', 'Redis 一集配乐 Demo（三个方向，各约 60 秒）。由 tools/music_demo.py 确定地合成；数值为实测。')
    doc['target'] = {'lufs_i': TARGET_LUFS, 'peak_max_dbfs': -1.0,
                     'band_db_guide': {'lt150': -4, '150_1500': -2}}
    doc['methods'] = {
        'lufs_i / lra / true_peak_dbtp': 'ffmpeg ebur128=peak=true 对 16 bit WAV 的测量；lufs_i_numpy 为脚本内 BS.1770 实现，用于归一',
        'band_db': '整段左右平均后加汉宁窗做一次 FFT，<150 Hz、150–1500 Hz、>1500 Hz 的能量占比（dB），与 kit/tools/audio_check.py 同法',
        'spectral_centroid_hz': '同一频谱按幅度加权的平均频率',
        'lr_correlation': '1 秒窗的左右声道相关系数（跳过低于 −50 dB 的窗）',
        'longest_silence_before_fade_s': '淡出开始前，50 ms 窗中较响一路低于 −60 dBFS 的最长连续时长',
        'sections[].rms_db': '各段左右平均的 RMS（dBFS）'}
    doc.setdefault('demos', {})
    import time
    for i in ids:
        t0 = time.time()
        mix, meta = COMPOSERS[i]()
        if os.environ.get('MUSIC_STEMS'):
            tot = sum(float(np.sum(v.astype(np.float64) ** 2)) for v in LAST_TRACK.stems.values())
            for k, v in LAST_TRACK.stems.items():
                v = v.astype(np.float64)
                print(f'   stem {k:8s} energy {10 * np.log10(np.sum(v ** 2) / tot):6.1f} dB  bands {band_shares(v)}')
        y, gr = normalize(mix)
        wav = OUT / f'music-{i}.wav'
        write_wav(wav, to_int16(y, seed_of('dither', i) & 0xFFFFFFFF))
        x = read_wav(wav)
        res = analyze(x, meta['sections'], meta['fade_start'])
        res['lufs_i_numpy'] = round(lufs(x), 2)
        res['limiter_max_gain_reduction_db'] = round(gr, 2)
        if ff:
            res.update(ffmpeg_ebur128(ff, wav))
            mp3 = OUT / f'music-{i}.mp3'
            make_mp3(ff, wav, mp3)
            res['mp3'] = mp3.name
        res['wav'] = wav.name
        res['render_seconds'] = round(time.time() - t0, 1)
        entry = {k: meta[k] for k in ('id', 'title', 'bpm', 'key', 'progression', 'description')}
        entry['sections'] = [{'name': n, 'start': round(a, 2), 'end': round(b, 2)} for n, a, b in meta['sections']]
        entry['measured'] = res
        doc['demos'][i] = entry
        print(f'[{i}] {meta["title"]}  {res["duration_s"]} s  LUFS {res.get("lufs_i")} (numpy {res["lufs_i_numpy"]})  '
              f'TP {res.get("true_peak_dbtp")}  peak {res["sample_peak_dbfs"]}  bands {res["band_db"]}  '
              f'centroid {res["spectral_centroid_hz"]}  corr {res["lr_correlation"]}  GR {gr:.2f} dB  '
              f'({res["render_seconds"]} s)')
        for s in res['sections']:
            print(f'      {s["name"]:4s} {s["start"]:6.2f}–{s["end"]:6.2f}  rms {s["rms_db"]:6.2f}  bands {s["band_db"]}  '
                  f'centroid {s["centroid_hz"]}')
    doc['demos'] = {k: doc['demos'][k] for k in sorted(doc['demos'])}
    jpath.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding='utf-8')
    print('wrote', jpath)


if __name__ == '__main__':
    main(sys.argv[1:])
