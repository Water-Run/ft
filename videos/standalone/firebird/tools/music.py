# 全片配乐：Motorik 电子摇滚（策划者 2026-11-09 选定小样 C）。118 BPM，动机来自名字 F、E、B、D。
# 由 audio.music 调用：compose(ctx) 返回 (2, N)。段落位置取自 ctx["scenes"]，音符按缓存只算一次，种子固定。
import os, sys, zlib
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import music_sketch as ms

FADE = (1.0, 2.0)
BPM = 118
STEP = 60 / BPM / 4
BAR = STEP * 16
ROOTS = ['F', 'F', 'E', 'E', 'B', 'B', 'D', 'D']

# 各章的层：鼓、踩镲、贝斯、吉他琶音、长线条、失真，以及贝斯的滤波开度
LV = {
    'open':    dict(d=0.0, h=.55, b=.7, g=0, l=0, f=0, cut=320),
    'shower':  dict(d=.7, h=.8, b=.8, g=.55, l=0, f=0, cut=620),
    'xmas':    dict(d=.45, h=.35, b=.95, g=0, l=.5, f=0, cut=360),
    'fork':    dict(d=1, h=1, b=1, g=.8, l=.9, f=.55, cut=1100),
    'door':    dict(d=0, h=.6, b=.9, g=.35, l=0, f=0, cut=300),
    'name':    dict(d=.85, h=.9, b=.9, g=.6, l=.5, f=.3, cut=800),
    'today':   dict(d=.95, h=1, b=.95, g=.75, l=.8, f=.35, cut=1150),
    'end':     dict(d=.7, h=.8, b=.8, g=.7, l=1, f=.55, cut=1000),
    'credits': dict(d=0, h=0, b=.5, g=.4, l=.6, f=0, cut=400),
}


def compose(ctx):
    sr = ctx['sr']
    ms.SR = sr
    n = ctx['n']
    x = np.zeros((n, 2))
    cache = {}

    def rng_of(key):
        return np.random.default_rng(zlib.crc32(repr(key).encode()))

    def note(key, fn):
        if key not in cache:
            cache[key] = fn(rng_of(key))
        return cache[key]

    def add(t, s, g=1.0, pan=0.0, until=None):
        i = int(t * sr)
        if i >= n or i < 0:
            return
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        e = min(n, i + len(s))
        if until is not None and int(until * sr) < e:
            e = int(until * sr)
            m = e - i
            if m <= 0:
                return
            fade = np.minimum(1.0, (m - np.arange(m)) / (0.04 * sr))
            s = s[:m] * fade
        x[i:e, 0] += s[:e - i] * g * l
        x[i:e, 1] += s[:e - i] * g * r

    scenes = ctx['scenes']
    cues = {c['id']: c for c in ctx['cues']}

    def scene_at(t):
        for s in scenes:
            if s['start'] <= t < s['end']:
                return s['id']
        return scenes[-1]['id']

    # 每章从自己的起点起拍，翻页就落在小节头；上一章多出的半小节被下一章切断
    grid = []
    for sc in scenes:
        k = 0
        while sc['start'] + k * BAR < sc['end']:
            grid.append((sc['start'] + k * BAR, sc['id'], sc['end'], k))
            k += 1
    for t0, sid, send, b in grid:
        lv = LV.get(sid, LV['open'])
        nm = ROOTS[b % 8]
        o1 = ms.oct_of(nm, 1) + 1
        f = ms.hz(nm, o1)
        for s in range(16):
            t = t0 + s * STEP
            if t >= send:
                break
            if lv['d']:
                if s in (0, 6, 8, 14):
                    add(t, note(('k',), lambda r: ms.kick(r, .8)), .86 * lv['d'])
                if s in (4, 12):
                    add(t, note(('s', s % 8), lambda r: ms.snare(r, 170)), .62 * lv['d'])
            if lv['h'] and s % 2 == 0:
                d = .05 if s % 4 == 2 else .02
                add(t, note(('h', d), lambda r: ms.hat(r, d)), .34 * lv['h'], -.15)
            if lv['b']:
                ratio = (1, 1, 2, 1, 1.4983, 1, 2, 1.4983)[s % 8]
                cut = lv['cut']
                add(t, note(('b', nm, o1, ratio, cut), lambda r: ms.bass(f * ratio, STEP * .92, cut=cut, drive=1.8)), .82 * lv['b'])
        if lv['g']:
            pat = (0, 12, 7, 19, 12, 7)
            for i in range(0, 16, 3):
                semi = pat[(i // 3) % 6]
                o3 = ms.oct_of(nm, 3)
                def pluck(r, nm=nm, o3=o3, semi=semi):
                    return ms.amp(ms.string(r, ms.hz(nm, o3) * 2 ** (semi / 12), STEP * 5, .994), drive=1.5, low=200, high=6000)
                tone = note(('g', nm, o3, semi), pluck)
                t = t0 + i * STEP
                pan = .35 if i % 2 else -.35
                if t >= send:
                    continue
                add(t, tone, .5 * lv['g'], pan, send)
                add(t + STEP * 3, tone, .19 * lv['g'], -pan, send)
                add(t + STEP * 6, tone, .08 * lv['g'], pan, send)
        if lv['l'] and b % 2 == 0:
            o4 = ms.oct_of(nm, 4)
            cut = int(1200 + lv['cut'])
            add(t0, note(('l', nm, o4, cut), lambda r: ms.lead(ms.hz(nm, o4), STEP * 30, wob=4.6, kind='saw', cut=cut, drive=2.2)), .5 * lv['l'], 0.0, send)
        if lv['f']:
            o2 = ms.oct_of(nm, 2)
            def fuzz(r, nm=nm, o2=o2):
                return ms.power(r, ms.hz(nm, o2), STEP * 15.5, drive=14)
            s1 = note(('f', nm, o2, 0), fuzz)
            add(t0, s1, .42 * lv['f'], -.45, send)
            add(t0 + .012, s1, .42 * lv['f'], .45, send)

    for sc in scenes[1:]:
        if sc['id'] != 'credits':
            add(sc['start'], note(('k',), lambda r: ms.kick(r, .8)), 1.0)
            add(sc['start'], note(('cr', 'chap'), lambda r: ms.crash(r)), .34)

    # 关键字上的落点：吸附到最近的十六分音符
    def snap(t):
        return round(t / STEP) * STEP

    SPOKEN = {'d2': 0.84, 'd3': 0.71}    # 读到英文词的实际时刻（按音频能量核对）
    for cid in ('d2', 'd3'):
        if cid in cues:
            t = cues[cid]['start'] + SPOKEN[cid]
            s1 = note(('stab', cid), lambda r: ms.power(r, ms.hz('F', 2), STEP * 7, drive=15))
            add(t, s1, .8, -.4)
            add(t + .011, s1, .8, .4)
            add(t, note(('k',), lambda r: ms.kick(r, .8)), 1.0)
    for cid in ('c4', 'e6', 'f5', 'g5'):
        if cid in cues:
            add(snap(cues[cid]['start']), note(('cr', cid), lambda r: ms.crash(r)), .55)
    # 压住鼓点峰值，让配乐整体电平上来（混音按峰值归一）
    ref = max(1e-6, float(np.percentile(np.abs(x), 99.5)))
    x = np.tanh(x / ref * 1.3) / np.tanh(1.3)
    return x.T
