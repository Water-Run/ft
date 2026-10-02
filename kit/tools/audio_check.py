# 配乐与混音的数值自检（写脚本的模型听不到声音，只能看数）。由 kit/tools/audio.js 在混音后自动调用，也可单独跑：
#   node kit/tools/audio.js <视频> 之后，环境变量 LVS_VIDEO、LVS_LANG、LVS_FFMPEG 齐备时 python kit/tools/audio_check.py
# 输出三样：
#   1. 配乐分轨在各章的三段能量（低 <150 Hz / 中 150–1500 / 高 >1500）：看各层是否按编排进出，低频是否过重
#   2. 章节卡（无旁白）与旁白之下的配乐电平差：看压低是否生效
#   3. 成片混音的峰值、削波采样数、整体响度（ffmpeg ebur128）
import json, os, subprocess, sys, wave
import numpy as np
VIDEO = os.environ["LVS_VIDEO"]; VLANG = os.environ.get("LVS_LANG", "zh").strip()
FF = os.environ.get("LVS_FFMPEG") or "ffmpeg"
OUT = os.path.join(VIDEO, "out", VLANG)
mix = json.load(open(os.path.join(VIDEO, "build", "mix.%s.json" % VLANG), encoding="utf-8"))
def load(name):
    with wave.open(os.path.join(OUT, name), "rb") as w:
        sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32768
    return sr, a.reshape(-1, 2).mean(axis=1)
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9) if len(x) else -99.0
sr, music = load("stem_music.wav"); _, full = load("audio.wav"); _, voice = load("audio_voice.wav")
def bands(x):
    X = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ** 2; f = np.fft.rfftfreq(len(x), 1 / sr); tot = X.sum() + 1e-12
    return [10 * np.log10(X[(f >= a) & (f < b)].sum() / tot + 1e-12) for a, b in ((0, 150), (150, 1500), (1500, 24000))]
print("章          配乐电平   低/中/高（占比 dB）      章节卡处   旁白之下")
for s in mix["scenes"]:
    i, j = int(s["start"] * sr), int(s["end"] * sr); seg = music[i:j]
    if len(seg) < sr // 2: continue
    cues = [c for c in mix["cues"] if s["start"] <= c["start"] < s["end"]]
    card = music[i + int(0.6 * sr): int((cues[0]["start"] - 0.3) * sr)] if cues and cues[0]["start"] - s["start"] > 1.5 else None
    parts = [music[int((c["start"] + 0.4) * sr): int((c["end"] - 0.2) * sr)] for c in cues]
    under = np.concatenate(parts) if parts else seg
    b = bands(seg) if np.abs(seg).max() > 0 else [-99.0, -99.0, -99.0]
    print("%-10s %7.1f dB   %5.1f / %5.1f / %5.1f     %s   %7.1f dB" % (s["id"], db(seg), b[0], b[1], b[2], ("%7.1f dB" % db(card)) if card is not None and len(card) else "    —    ", db(under)))
print("成片混音：峰值 %.3f，|x|>=0.999 的采样 %d 个，旁白 %.1f dB，整体 %.1f dB" % (np.abs(full).max(), int((np.abs(full) >= 0.999).sum()), db(voice[np.abs(voice) > 1e-4]), db(full)))
r = subprocess.run([FF, "-hide_banner", "-nostats", "-i", os.path.join(OUT, "audio.wav"), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True, errors="replace").stderr
tail = r[r.rfind("Summary:"):] if "Summary:" in r else r[-400:]
print(" ".join(l.strip() for l in tail.splitlines() if any(k in l for k in ("I:", "LRA:", "Peak:"))))
