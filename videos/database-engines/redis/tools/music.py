#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Redis 一集的配乐：方向 C「终章」（2026-11-25 选定）。94 拍/分，C 小调，收在 C 大调。

compose_plan(total, I, B, P) 按小节号排出一段：
  0–I 引子（暗的铺底、零星拨弦）→ I–B 推进（琶音由八分到十六分、低音脉动、心跳般的轻底鼓）
  → B–P 最高处（一次收着的低频落点、铺底打开、慢而宽的主奏）→ P、P+1 两小节收束（A♭maj9 → B♭6/9sus）
  → P+2 落到 C(add9)，主奏停在三音 E 上，长混响里淡出。
  B ≥ P 表示这一段不要高潮（只铺底与琶音，结尾淡出）。
音色与写法取自 tools/music_demo.py 的 C；工具函数从那里导入。

compose(ctx) 是 kit/tools/mix.py 调用的入口（project.json 的 audio.music）。全片的段落编排要等文案确认、配音有了实测时长之后再写；
现在只用于审片页的混音小样（tools/mix_demo.py）。
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import music_demo as M  # noqa: E402

BPM = 94
BEAT = 60 / BPM
BAR = 4 * BEAT
FADE = (2.5, 4.0)

CH = [('Cm9', 36, [55, 60, 62, 63, 67], [60, 67, 72, 74, 75]),
      ('A♭maj7', 32, [55, 60, 63, 67], [56, 63, 68, 70, 72]),
      ('E♭add9', 39, [55, 58, 63, 65], [63, 70, 75, 77, 79]),
      ('B♭sus4', 34, [53, 58, 63, 65], [58, 65, 70, 72, 75]),
      ('B♭', 34, [53, 58, 62, 65], [58, 65, 70, 72, 74]),
      ('A♭maj9', 32, [55, 60, 63, 67, 70], [56, 63, 68, 70, 72]),
      ('B♭6/9sus', 34, [53, 58, 60, 65, 67], [58, 65, 70, 72, 77]),
      ('C(add9)', 36, [48, 55, 62, 64, 67, 72], [60, 67, 72, 74, 76])]
LEAD = [(0, 0, 3, 79), (0, 3, 1, 77), (1, 0, 2, 75), (1, 2, 1, 74), (1, 3, 1, 75),
        (2, 0, 4, 72), (3, 0, 2, 75), (3, 2, 2, 77),
        (4, 0, 3, 79), (4, 3, 1, 82), (5, 0, 2, 80), (5, 2, 1, 79), (5, 3, 1, 77)]       # 最高处的乐句，按到 P 的距离排
LEAD_END = [(0, 0, 4, 79), (1, 0, 2, 77), (1, 2, 2, 74), (2, 0, 8, 76)]                    # P、P+1、P+2（停在 E）


def compose_plan(total, I, B, P):
    T = lambda bar, b=0.0: (bar * 4 + b) * BEAT
    peak = B < P
    tr = M.Track(total)
    nbars = int(total / BAR) + 1
    END = P + 2 if peak else nbars + 4

    def chord(bar):
        if peak and bar >= P + 2:
            return CH[7]
        if peak and bar == P:
            return CH[5]
        if peak and bar == P + 1:
            return CH[6]
        i = ((bar - I) // 2) % 4
        if i == 3 and bar % 2 == 1:
            return CH[4]
        return CH[i]

    last = min(END, nbars)
    cut = ([0, T(I), T(I + 4), T(B) if peak else total * 0.7, (T(B) + T(0.125)) if peak else total * 0.8,
            T(P) if peak else total * 0.9, T(P + 2) if peak else total, total + 1, total + 2],
           [420, 560, 850, 1500, 2600, 2400, 2000, 2400, 650] if peak else [420, 560, 850, 1100, 1150, 1150, 1000, 900, 650])
    # 铺底
    bar = 0
    while bar < last:
        c = chord(bar)
        nb = bar + 1
        while nb < last and chord(nb)[2] == c[2]:
            nb += 1
        d = min(T(nb), total) - T(bar)
        for i, m in enumerate(c[2]):
            tr.add(M.pad_note(m, T(bar), d, 3.5 if bar == 0 else 0.5, 1.0, cut, 3, 9.0, 0.85, 'saw', 3.0, seed=i), T(bar), 0.085, rev=0.35, layer='pad')
        if peak and B <= bar < P + 2:
            for i, m in enumerate(c[2][-3:]):
                tr.add(M.pad_note(m + 12, T(bar), d, 0.8, 1.2, cut, 2, 6.0, 0.95, 'soft', 3.0, seed=30 + i), T(bar), 0.05, rev=0.45, layer='pad8va')
        bar = nb
    if peak:
        tf = T(P + 2); hold = max(6.0, total - tf)
        for i, m in enumerate(CH[7][2][1:]):
            tr.add(M.pad_note(m, tf, hold, 0.6, 4.0, cut, 3, 9.0, 0.9, 'saw', 3.0, seed=40 + i), tf, 0.085, rev=0.45, layer='pad')
        for i, m in enumerate([76, 79, 84]):
            tr.add(M.pad_note(m, tf, hold, 1.5, 4.0, cut, 2, 6.0, 0.95, 'soft', 3.0, seed=50 + i), tf, 0.05, rev=0.5, layer='pad8va')
    # 琶音
    for bar_, b in [(x, b) for x in range(1, I) for b in (0, 2)]:
        arp = chord(bar_)[3]
        tr.add(M.pluck(arp[[0, 2, 1, 3, 2, 4, 3][(bar_ * 2 + int(b)) % 7]], 0.8, 0.45, 5.0, 'saw', 4500.0, 0.004), T(bar_, b), 0.32,
               pan=0.3 if int(b) % 2 else -0.3, rev=0.45, dly=0.3, layer='arp')
    PAT = [0, 1, 2, 3, 4, 3, 2, 1]
    dense = I + 6
    for bar_ in range(I, min(END, nbars)):
        arp = chord(bar_)[3]
        if bar_ < dense:
            steps = [(s / 2, PAT[s]) for s in range(8)]; tone = 0.45 + 0.08 * min(6, bar_ - I); lvl = 0.30
        else:
            steps = [(s / 4, PAT[s % 8]) for s in range(16)]
            tone = 0.95 if (not peak or bar_ < B) else (1.2 if bar_ < P else 0.9); lvl = 0.22 if (not peak or bar_ < B) else 0.19
        for b, idx in steps:
            tr.add(M.pluck(arp[idx], 0.5, round(tone, 2), 6.5, 'saw', 6000.0 if bar_ < dense else 9000.0, 0.003), T(bar_, b),
                   lvl * (1.0 if b == int(b) else 0.75), pan=(0.3 if (b * 4) % 2 else -0.3), rev=0.25, dly=0.18, layer='arp')
    # 低音
    for bar_ in range(I + 2, min(B if peak else END, nbars)):
        bass = chord(bar_)[1]
        for s in range(8):
            tr.add(M.pluck(bass + (12 if s in (3, 7) else 0), 0.30, 0.35, 8.0, 'saw', 2500.0), T(bar_, s / 2), 0.42 * (1.0 if s % 2 == 0 else 0.7), layer='bass')
    if peak:
        for bar_ in range(B, P + 2):
            c = chord(bar_)
            if (bar_ - B) % 2 == 0 or bar_ >= P:
                d = T(1 if bar_ >= P else 2) - 0.05
                tr.add(M.tone_note(c[1] + 12, round(d, 4), 'saw', 420.0, 0.05, 0.4, 0.75, 0.3), T(bar_), 0.26, layer='bass')
                tr.add(M.sine_bass(c[1] + 12, round(d, 4), 1.2, 0.4, 1.1), T(bar_), 0.15, layer='sub')
        tr.add(M.tone_note(48, hold, 'saw', 380.0, 0.05, 0.5, 0.75, 3.5), tf, 0.22, layer='bass')
        tr.add(M.sine_bass(48, hold, 1.5, 3.5, 1.1), tf, 0.10, layer='sub')
        # 最高处入口：两小节轻的噪声上扬，一次收着的低频落点
        nsw = int(T(2) * M.SR); x = np.linspace(0, 1, nsw)
        sw = (M.noise_band(T(2), 600, 2000, 'rC1') * (1 - x) + M.noise_band(T(2), 2500, 7000, 'rC2') * x) * x ** 2.2
        sw[-int(0.03 * M.SR):] *= 1 - M.rcos(int(0.03 * M.SR))
        tr.add(np.vstack([sw, np.roll(sw, 2400)]), T(B - 2), 0.012, rev=0.3, layer='riser')
        tr.add(M.kick(0.9, 75.0, 38.0, 0.0), T(B), 0.30, rev=0.5, layer='boom')
    # 心跳般的轻底鼓与沙锤
    for bar_ in range(I + 4, min(P if peak else END, nbars)):
        for b in ((0,) if (not peak or bar_ < B) else (0, 2)):
            tr.add(M.kick(0.3, 100.0, 46.0, 0.05), T(bar_, b), 0.22, rev=0.1, layer='kick')
    if peak:
        for bar_ in range(B, P):
            for s in range(16):
                tr.add(M.hat(0.045, 5500.0, 12000.0, 20 + s % 4), T(bar_, s / 4), 0.022 * [0.7, 0.35, 1.0, 0.35][s % 4], pan=0.35, rev=0.1, layer='shaker')
        # 主奏：最高处的乐句排在 P 之前（不早于 B），收束两小节，最后停在 C 大三和弦的三音 E
        notes = [(P - 6 + bar_, b, d, m) for bar_, b, d, m in LEAD if P - 6 + bar_ >= B] + [(P + bar_, b, d, m) for bar_, b, d, m in LEAD_END]
        for bar_, b, d, m in notes:
            dd = round(d * BEAT * 0.95, 4); rel = 3.5 if d >= 8 else 0.35
            for det, pn in ((-6.0, -0.3), (6.0, 0.3)):
                tr.add(M.tone_note(m, dd, 'saw', 2000.0, 0.07, 0.3, 0.8, rel, vib=11.0, vib_rate=5.2, vib_delay=0.35, detune=det),
                       T(bar_, b), 0.075, pan=pn, rev=0.35, dly=0.22, layer='lead')
        for j, (b, m) in enumerate([(0, 72), (0.5, 79), (1, 84), (1.5, 86), (2, 88), (3, 84)]):
            tr.add(M.pluck(m, 0.9, 0.9, 4.0, 'saw', 9000.0), T(P + 2, b), 0.16 * (1 - 0.1 * j), pan=(-0.4 + 0.16 * j), rev=0.5, dly=0.4, layer='arp')
    rev = M.reverb_ir(4.2, 2.2, 5.0, 0.03, 'C')
    dly = M.pingpong_ir(BEAT, 0.38, 6, 5000.0, 0.7, 300.0)
    eq = lambda f: M.hp(f, 30, 2) * M.bell_eq(f, 2300, -1.5, 0.9)
    return M.render(tr, rev, 0.6, dly, 0.45, 0.4, eq=eq, fade_out=(total - 5.0, total))


def bar_of(t):
    return int(t / BAR)


def compose(ctx):
    raise NotImplementedError('全片的配乐编排在文案确认、配音有实测时长之后再写；现在只有 compose_plan 供 tools/mix_demo.py 用')
