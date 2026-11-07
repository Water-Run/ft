"""审片页的全片试读：把选定音色逐句合成的旁白按时间线放进 192 秒（试听，不是正式配音）。

输入：out/audition/full/layout.json（由 script.js 的 layoutScript 与逐句实测时长算出：[[句号, 开始秒, 时长秒], ...]）
     out/audition/full/<音色目录>/<句号>.mp3（tools/audition.py 第 5 个参数为 full 时生成）
输出：out/audition/full/readthrough.mp3（不入库）

用法（仓库根目录）：python -I videos/in-seconds/rdp/tools/readthrough.py <ffmpeg> <音色目录名>
"""
import json, os, subprocess, sys
import numpy as np

FF, VOICE = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, '..', 'out', 'audition', 'full')
SR = 32000
lay = json.load(open(os.path.join(BASE, 'layout.json'), encoding='utf-8'))
buf = np.zeros(int(lay['total'] * SR) + SR)
for cid, start, d in lay['cues']:
    raw = subprocess.run([FF, '-v', 'error', '-i', os.path.join(BASE, VOICE, f'{cid}.mp3'), '-t', str(d),
                          '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<i2').astype(np.float64) / 32768
    i = int(round(start * SR))
    buf[i:i + len(x)] += x[: len(buf) - i]
buf = buf[: int(lay['total'] * SR)]
pcm = (np.clip(buf, -1, 1) * 32767).astype('<i2').tobytes()
out = os.path.join(BASE, 'readthrough.mp3')
subprocess.run([FF, '-v', 'error', '-y', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-i', '-', '-c:a', 'libmp3lame',
                '-b:a', '128k', out], input=pcm, check=True)
print(f'{out}: {len(buf) / SR:.2f} s, {len(lay["cues"])} 句')

# 第 3 个参数 --music：垫上 tools/music.py 的配乐，粗略按 project.json 的 music_db / duck_db 压低（正式混音由 kit 的 mix.py 做）
if '--music' in sys.argv:
    import importlib.util
    proj = json.load(open(os.path.join(HERE, '..', 'project.json'), encoding='utf-8'))
    aud = proj.get('audio', {})
    spec = importlib.util.spec_from_file_location('music', os.path.join(HERE, 'music.py'))
    mus = importlib.util.module_from_spec(spec); spec.loader.exec_module(mus)
    n = len(buf)
    m = mus.compose({'sr': SR, 'n': n, 'total': lay['total'], 'scenes': lay['scenes'], 'cues': lay['allcues'], 'audio': aud})
    fi, fo = getattr(mus, 'FADE', (2.5, 3.0))
    ramp = np.minimum(1, np.minimum(np.arange(n) / max(1, fi * SR), (n - np.arange(n)) / max(1, fo * SR)))
    m = m * ramp
    talk = np.zeros(n)
    for cid, start, d in lay['cues']:
        talk[int(start * SR): int((start + d) * SR)] = 1
    vr = np.sqrt(np.mean(buf[talk > 0] ** 2)) + 1e-12
    buf = buf * (10 ** (-20 / 20) / vr); vr = 10 ** (-20 / 20)              # 人声说话段统一到约 −20 dBFS
    m = m / (np.sqrt(np.mean(m ** 2)) + 1e-12) * vr * 10 ** ((aud.get('music_db', -12) + 6) / 20)   # 无旁白处比人声低约 6 dB
    k = int(0.25 * SR)
    talk = np.convolve(talk, np.ones(k) / k, mode='same')                  # 压低的起落约 0.25 秒
    gain = 10 ** (-aud.get('duck_db', 7) * np.clip(talk * 1.5, 0, 1) / 20)
    mix = m * gain + buf[None, :]
    pk = np.abs(mix).max()
    if pk > 0.95: mix = mix / pk * 0.95
    pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2').tobytes()
    out2 = os.path.join(BASE, 'readthrough_music.mp3')
    subprocess.run([FF, '-v', 'error', '-y', '-f', 's16le', '-ac', '2', '-ar', str(SR), '-i', '-', '-c:a', 'libmp3lame',
                    '-b:a', '160k', out2], input=pcm, check=True)
    print(f'{out2}: 旁白 + 配乐（粗混）')
