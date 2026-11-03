# 本片配乐：策划者选定的 C「双色」（2026-11-03）。100 拍/分，D 小调四和弦循环（Dm7 → B♭maj7 → Gm7 → A7，每和弦两小节）。
# 同一个动机贯穿全片，音色按段落换：开场到 03 章（OpenAI 段）用冷的正弦拨音与纯正弦铺底；04 章（Anthropic 段）换成暖的木琴槌音与失谐铺底；
# 05 章两种音色交替，收束时只剩铺底。各层的进出按场景起止从 ctx["scenes"] 取，不写死秒数。
# 音色与小样同源：tools/music_demos.py。
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import music_demos as md

FADE = (1.5, 2.5)
BPM = 100
PROG = [[50, 53, 57, 60], [46, 50, 53, 57], [43, 46, 50, 53], [45, 49, 52, 55]]
MOTIF = [(0, 0), (0.75, 2), (1.5, 1), (2, 3), (3, 2)]          # (拍, 和弦音序号)，每小节一遍

# 各段的层电平：铺底 pad、动机 mot、低音 bass、轻拍 tick；音色 warm 为 0 冷、1 暖、0.5 交替
LEVELS = {
    'open':    dict(pad=1.0, mot=0.55, bass=0.0, tick=0.0, warm=0),
    'git':     dict(pad=0.9, mot=0.6, bass=0.5, tick=0.0, warm=0),
    'jam':     dict(pad=0.9, mot=0.75, bass=0.8, tick=0.7, warm=0),
    'oai':     dict(pad=0.9, mot=0.85, bass=0.8, tick=0.8, warm=0),
    'ant':     dict(pad=0.9, mot=0.85, bass=0.8, tick=0.8, warm=1),
    'why':     dict(pad=1.0, mot=0.6, bass=0.5, tick=0.0, warm=0.5),
    'credits': dict(pad=1.0, mot=0.0, bass=0.0, tick=0.0, warm=0.5),
}

def compose(ctx):
    sr = ctx['sr']; n = ctx['n']; total = ctx['total']
    md.SR = sr
    scenes = ctx['scenes']
    def at(t):
        for sc in scenes:
            if sc['start'] <= t < sc['end']:
                return sc['id'], LEVELS.get(sc['id'], LEVELS['open'])
        return 'credits', LEVELS['credits']
    tr = md.Track(total)
    beat = 60 / BPM; bar = 4 * beat; chord_d = 2 * bar
    k = 0; t0 = 0.0
    while t0 < total:
        ch = PROG[k % len(PROG)]
        sid, lv = at(t0 + 0.01)
        warm_pad = lv['warm'] >= 0.5
        for m in ch:
            tr.add(md.tone('pad' if warm_pad else 'coldpad', m, chord_d + 0.6), t0, (0.035 if warm_pad else 0.06) * lv['pad'], pan=(m % 4 - 1.5) * 0.2)
        for b in range(2):
            bt0 = t0 + b * bar
            for i, (bt, idx) in enumerate(MOTIF):
                t = bt0 + bt * beat
                if t >= total: break
                sid, lv = at(t)
                if not lv['mot']: continue
                m = ch[idx % len(ch)] + 12
                warm = lv['warm'] == 1 or (lv['warm'] == 0.5 and b == 1)
                if warm: tr.add(md.tone('mallet', m, 1.1), t, 0.2 * lv['mot'], pan=0.3 * np.sin(t))
                else: tr.add(md.tone('pluck', m + 12, 0.45), t, 0.15 * lv['mot'], pan=0.3 * np.sin(t))
            for kk in (0, 2.5):
                t = bt0 + kk * beat
                sid, lv = at(t)
                if lv['bass'] and t < total: tr.add(md.tone('bass', ch[0] - 12, beat * 1.8), t, 0.15 * lv['bass'])
            for q in range(4):
                t = bt0 + q * beat + beat / 2
                sid, lv = at(t)
                if lv['tick'] and t < total:
                    if lv['warm'] == 1: tr.add(md.noise_hit('shaker', 0.09), t, 0.028 * lv['tick'], pan=0.25)
                    else: tr.add(md.noise_hit('click', 0.05), t, 0.045 * lv['tick'], pan=-0.25)
        t0 += chord_d; k += 1
    out = tr.finish(room=0.3)[:, :n]          # 多抽头延迟的空间感，与小样一致
    if out.shape[1] < n:
        out = np.pad(out, ((0, 0), (0, n - out.shape[1])))
    return out
