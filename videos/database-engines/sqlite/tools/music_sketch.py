# 审片页的配乐小样：三个方向各约 32 秒，按 WaterRun 2026-10-22「简洁有力的音乐」与本片「一个文件，一片纸」的朴素视觉，
# 只用少数几个音色、短促、落在拍上。纯 numpy 合成，确定性（无随机数）。输出 out/audition/music/{a,b,c}.mp3（不入库）。
# 用法：python videos/database-engines/sqlite/tools/music_sketch.py
import os, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); VIDEO = os.path.dirname(HERE); REPO = os.path.dirname(os.path.dirname(os.path.dirname(VIDEO)))
FF = os.path.join(REPO, 'assets', 'ffmpeg', 'bin', 'ffmpeg.exe')
SR = 44100
OUT = os.path.join(VIDEO, 'out', 'audition', 'music'); os.makedirs(OUT, exist_ok=True)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def env(n, a=0.005, d=0.25):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)

def tone(m, dur, parts=((1, 1.0),), a=0.005, d=0.3, vol=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    y = sum(w * np.sin(2 * np.pi * hz(m) * k * t) for k, w in parts)
    return vol * y * env(n, a, d)

def tick(dur=0.06, vol=0.12, f=3200):
    n = int(dur * SR); t = np.arange(n) / SR
    return vol * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.008)

def thump(vol=0.5):
    n = int(0.25 * SR); t = np.arange(n) / SR
    f = 110 * np.exp(-t * 18) + 45
    return vol * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09)

def put(buf, y, t):
    i = int(t * SR); j = min(len(buf), i + len(y)); buf[i:j] += y[: j - i]

def finish(buf, name):
    n = len(buf); fade = int(1.5 * SR)
    buf[:fade] *= np.linspace(0, 1, fade); buf[-fade:] *= np.linspace(1, 0, fade)
    buf = buf / (np.abs(buf).max() + 1e-9) * 0.8
    pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
    wav = os.path.join(OUT, name + '.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    subprocess.run([FF, '-v', 'quiet', '-y', '-i', wav, '-b:a', '160k', os.path.join(OUT, name + '.mp3')], check=True)
    os.remove(wav)

DUR = 32.0

# A 「页的脉冲」：96 BPM，D 小调。每拍一记低音，八分音符上一声很轻的「读页」短响；每四小节换一次和声根音
def demo_a():
    buf = np.zeros(int(DUR * SR)); beat = 60 / 96
    roots = [38, 34, 36, 33]                      # D2 Bb1 C2 A1
    for b in range(int(DUR / beat)):
        t = b * beat; bar = b // 4; r = roots[(bar // 2) % 4]
        put(buf, tone(r, 0.5, ((1, 1.0), (2, 0.3)), d=0.22, vol=0.42), t)
        if b % 4 == 0: put(buf, thump(0.35), t)
        for k in range(2): put(buf, tick(vol=0.07 if k else 0.1, f=2600 + 400 * ((b + k) % 3)), t + k * beat / 2)
        if b % 8 == 6: put(buf, tone(r + 24 + 7, 0.6, ((1, 1.0), (3, 0.15)), d=0.35, vol=0.12), t)
    return buf

# B 「拨弦琶音」：88 BPM，A 小调。像钢琴的拨弦（基频加几个衰减快的泛音），八分音符琶音，低音落在 1、3 拍
def demo_b():
    buf = np.zeros(int(DUR * SR)); beat = 60 / 88
    chords = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67], [52, 55, 59, 64]]   # Am F G Em
    pluck = ((1, 1.0), (2, 0.45), (3, 0.2), (4, 0.08))
    for b in range(int(DUR / beat)):
        t = b * beat; ch = chords[(b // 8) % 4]
        for k in range(2):
            m = ch[(2 * b + k) % 4]
            put(buf, tone(m, 0.9, pluck, a=0.003, d=0.4, vol=0.17), t + k * beat / 2)
        if b % 2 == 0: put(buf, tone(ch[0] - 24, 1.2, ((1, 1.0), (2, 0.25)), d=0.5, vol=0.32), t)
    return buf

# C 「木琴固定音型」：104 BPM，E 小调。木琴式音色（1、4、10 倍泛音，衰减很快）反复一个四音型，底下一个长低音与每小节一记闷鼓
def demo_c():
    buf = np.zeros(int(DUR * SR)); beat = 60 / 104
    cell = [64, 67, 71, 67]                       # E G B G
    mar = ((1, 1.0), (4, 0.35), (10, 0.1))
    shifts = [0, 0, -4, -2]                       # Em Em C D 的位置
    for b in range(int(DUR / beat)):
        t = b * beat; s = shifts[(b // 8) % 4]
        for k in range(2): put(buf, tone(cell[(2 * b + k) % 4] + s, 0.5, mar, a=0.002, d=0.12, vol=0.2), t + k * beat / 2)
        if b % 4 == 0:
            put(buf, thump(0.4), t)
            put(buf, tone(40 + s, 4 * beat, ((1, 1.0), (2, 0.2)), a=0.08, d=1.6, vol=0.22), t)
    return buf

for name, fn in (('a', demo_a), ('b', demo_b), ('c', demo_c)):
    finish(fn(), name); print(name, 'ok')
