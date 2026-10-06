# 混音：旁白 + 配乐 + 音效 → out/<语言>/audio.wav；另存 audio_voice.wav（仅旁白）、audio_nomusic.wav（旁白 + 音效）与两条分轨 stem_music.wav、stem_sfx.wav
# 由 kit/tools/audio.js 调用（环境变量 LVS_VIDEO、LVS_LANG、LVS_FFMPEG）。输入：
#   build/mix.<语言>.json  {total, cues:[{id,start,end}], scenes:[{id,start,end}]}   旁白与章节的时间
#   build/sfx.<语言>.json  [{n,t,g,p}]                                               画面登记的音效事件（可无）
#   audio/<语言>/cues/<id>.mp3                                                        逐句旁白
# project.json 的 audio 段（均可省略）：
#   music      "pad" 铺底 | "pulse" 铺底加节拍琶音 | "chip" 复古方波 | "score" 按章节编排（见 score 段）| "none" | "<相对视频目录的音频文件>"
#              | "<相对视频目录的 .py 文件>"：本片（或本系列）自带的配乐脚本，见下
#   music_db   无旁白时的配乐电平（默认 -21）      duck_db  旁白出现时再压低多少（默认 9）      sfx_db  音效总电平（默认 -8）
#   voice_norm "rms"（默认：旁白按响度对齐到 -21 dB，再软限幅）| "peak"（按峰值归一到 0.89，早期两部片子的做法）
#   pad_low / pad_top   铺底里低音区与高音区的增益（默认 0.4 / 1.3；最早的两部片子是 1 / 1，约四分之三的能量在 150 Hz 以下，偏闷）
#   limit      true（默认：总输出超过 0.97 时整体压低）| false
#   sfx        true（默认）| false：不铺音效（画面登记的音效事件照常导出，只是不进混音）
#   score      { weights: {层: 增益}, layers: [[层, 起, 止, 电平], …] }，层有 pad arpA arpB bass hat；
#              起止写场景号或句号，可带 .start/.end 与 ±秒，例如 "how"、"h17-0.8"、"outro.end"；后写的覆盖先写的
# 配乐脚本（music 以 .py 结尾）：模块里定义 compose(ctx)，返回 (2, N) 的数组（任意幅度，这里按峰值归一）。
#   ctx = { sr, n, total, scenes: [{id, start, end}], cues: [{id, start, end}], audio: 本片的 audio 段, lang }
#   模块可另给 FADE = (开头淡入秒数, 结尾淡出秒数)，缺省 (2.5, 3.0)。电平、旁白压低与限幅仍由这里统一处理。
# 命令行 key=value 可临时覆盖上述各项，另有 out=<文件名>（默认 audio.wav）
# 配乐与音效都是程序合成的，写脚本的人听不到：出片前要有人试听。
import json, os, subprocess, sys, wave
import numpy as np
VIDEO = os.environ["LVS_VIDEO"]; VLANG = os.environ.get("LVS_LANG", "zh").strip()
FF = os.environ.get("LVS_FFMPEG") or "ffmpeg"
SR = 48000
PROJECT = json.load(open(os.path.join(VIDEO, "project.json"), encoding="utf-8"))
AUD = {**{"music": "pad", "music_db": -21.0, "duck_db": 9.0, "sfx_db": -8.0, "out": "audio.wav", "voice_norm": "rms", "pad_low": 0.4, "pad_top": 1.3, "limit": True, "sfx": True}, **PROJECT.get("audio", {})}
for a in sys.argv[1:]:                      # 命令行可临时覆盖：music=pulse sfx_db=-6 out=audio_b.wav
    k, v = a.split("=", 1); AUD[k] = v if k in ("music", "out", "voice_norm") else (v.lower() == "true") if k in ("limit", "sfx") else float(v)
mix = json.load(open(os.path.join(VIDEO, "build", "mix.%s.json" % VLANG), encoding="utf-8"))
total = mix["total"]; N = int(total * SR) + SR
rng = np.random.default_rng(7)
db = lambda x: 10 ** (x / 20)

def decode(path, ch=1):
    raw = subprocess.run([FF, "-v", "error", "-i", path, "-f", "f32le", "-ac", str(ch), "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32)
    return a if ch == 1 else a.reshape(-1, ch).T

# ── 旁白 ──
voice = np.zeros(N, dtype=np.float32)
for c in mix["cues"]:
    a = decode(os.path.join(VIDEO, "audio", VLANG, "cues", c["id"] + ".mp3"))
    i = int(c["start"] * SR)
    voice[i:i + len(a)] += a[:max(0, N - i)]
if AUD["voice_norm"] == "peak":
    voice *= 0.89 / max(1e-6, np.abs(voice).max())
else:
    # 旁白按响度对齐（不同音色的峰值/均值比差别很大，按峰值归一会让两种语言相差数 dB），再做软限幅
    act = voice[np.abs(voice) > 1e-4]
    voice *= 10 ** (-21.0 / 20) / max(1e-6, np.sqrt(np.mean(act ** 2)))
    th = 0.7; over = np.abs(voice) > th
    voice[over] = np.sign(voice[over]) * (th + (0.95 - th) * np.tanh((np.abs(voice[over]) - th) / (0.95 - th)))

def smooth(x, k):                            # 滑动平均（累加和实现）
    c = np.cumsum(np.concatenate([np.zeros(k // 2 + 1), x, np.zeros(k - k // 2)]))
    return ((c[k:] - c[:-k]) / k)[: len(x)]
speaking = np.zeros(N)
for c in mix["cues"]:
    speaking[int((c["start"] - 0.15) * SR): int((c["end"] + 0.25) * SR)] = 1
duck = smooth(smooth(speaking, int(0.35 * SR)), int(0.35 * SR))

# ── 配乐 ──
CHORDS = [[38, 45, 54, 57, 61, 64], [35, 42, 50, 57, 61, 66], [31, 38, 47, 54, 57, 62], [33, 40, 47, 52, 54, 61]]   # Dmaj9 / Bm9 / Gmaj9 / A6sus
BPM = 96.0; BEAT = 60.0 / BPM; CHORD_LEN = 16 * BEAT            # 每个和弦 4 小节，整段循环与节拍对齐
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def reverb(x, decay=0.9, length=3.2):       # 指数衰减噪声脉冲；频域相乘 = 循环卷积，循环首尾自然衔接
    L = x.shape[1]; n = int(length * SR); t = np.arange(n) / SR; out = np.zeros_like(x)
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t / decay); ir[: int(0.012 * SR)] = 0
        out[ch] = np.fft.irfft(np.fft.rfft(x[ch]) * np.fft.rfft(np.concatenate([ir, np.zeros(L - n)])), L)
    return out * (np.abs(x).max() / max(1e-9, np.abs(out).max()))
def lowpass(x, fc, order=4):
    L = x.shape[1]; fq = np.fft.rfftfreq(L, 1 / SR); g = 1 / np.sqrt(1 + (fq / fc) ** order)
    return np.stack([np.fft.irfft(np.fft.rfft(x[c]) * g, L) for c in range(2)])
def pad_loop(low_gain, top_gain):       # 低音区（MIDI < 48）与高音区（≥ 58）的增益
    L = int(CHORD_LEN * len(CHORDS) * SR); t = np.arange(L) / SR; out = np.zeros((2, L)); xf = 5.0
    for ci, ch in enumerate(CHORDS):
        d = (t - ci * CHORD_LEN) % (CHORD_LEN * len(CHORDS))
        env = np.sin(np.clip(d / xf, 0, 1) * np.clip((CHORD_LEN + xf - d) / xf, 0, 1) * np.pi / 2) ** 2
        for ni, m in enumerate(ch):
            fr = hz(m); ph = rng.uniform(0, 2 * np.pi, 6); det = fr * 0.0025
            lfo = 0.75 + 0.25 * np.sin(2 * np.pi * rng.uniform(0.04, 0.11) * t + ph[0])
            tone = (np.sin(2 * np.pi * (fr - det) * t + ph[1]) + np.sin(2 * np.pi * (fr + det) * t + ph[2])) * 0.5
            tone += 0.22 * np.sin(2 * np.pi * 2 * fr * t + ph[3]) + 0.07 * np.sin(2 * np.pi * 3 * fr * t + ph[4])
            amp = (0.9 * low_gain if m < 48 else 0.6 if m < 58 else 0.42 * top_gain) * lfo * env; pan = 0.5 + 0.38 * np.sin(ni * 1.7 + ci)
            out[0] += tone * amp * np.sqrt(1 - pan); out[1] += tone * amp * np.sqrt(pan)
    y = lowpass(0.55 * out + 0.6 * reverb(out), 2600)
    return y / np.abs(y).max()
def pulse_loop():
    # 有节拍的一层：八分音符的拨弦琶音走和弦内音，每小节第一拍垫一个很轻的低音
    L = int(CHORD_LEN * len(CHORDS) * SR); out = np.zeros((2, L)); step = BEAT / 2
    def note(freq, dur, bright):
        n = int(dur * SR); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * freq * t) + bright * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t / 0.05)) * np.exp(-t / (dur * 0.28)) * np.minimum(1, t / 0.004)
    pat = [0, 2, 3, 2, 4, 2, 3, 5]
    for ci, ch in enumerate(CHORDS):
        tones = [m + 12 for m in ch[2:]] + [ch[2] + 24, ch[3] + 24]
        for s in range(32):
            i = int((ci * CHORD_LEN + s * step) * SR); m = tones[pat[s % 8] % len(tones)]
            a = note(hz(m), 0.55, 0.35) * (0.9 if s % 4 == 0 else 0.6); pan = 0.5 + 0.3 * np.sin(s * 0.9)
            j = min(L, i + len(a)); out[0, i:j] += a[: j - i] * np.sqrt(1 - pan); out[1, i:j] += a[: j - i] * np.sqrt(pan)
            if j - i < len(a): out[0, : len(a) - (j - i)] += a[j - i:] * np.sqrt(1 - pan); out[1, : len(a) - (j - i)] += a[j - i:] * np.sqrt(pan)
        for bar in range(4):
            i = int((ci * CHORD_LEN + bar * 4 * BEAT) * SR); a = note(hz(ch[0]), 1.6, 0.1) * 0.9; j = min(L, i + len(a))
            out[:, i:j] += a[: j - i] * 0.7
    y = lowpass(0.7 * out + 0.45 * reverb(out, 0.6, 2.2), 3800)
    return y / np.abs(y).max()
def chip_loop():
    # 复古的一层：限带方波的八分音符琶音 + 三角波低音，取材于早期个人电脑的发声方式（仍走同一组和弦）
    L = int(CHORD_LEN * len(CHORDS) * SR); out = np.zeros((2, L)); step = BEAT / 2
    def sq(freq, dur):
        n = int(dur * SR); t = np.arange(n) / SR
        w = sum(np.sin(2 * np.pi * freq * k * t) / k for k in (1, 3, 5, 7) if freq * k < 5000)
        return w * np.exp(-t / (dur * 0.35)) * np.minimum(1, t / 0.003)
    def tri(freq, dur):
        n = int(dur * SR); t = np.arange(n) / SR
        w = sum(((-1) ** i) * np.sin(2 * np.pi * freq * (2 * i + 1) * t) / ((2 * i + 1) ** 2) for i in range(4))
        return w * np.exp(-t / (dur * 0.5)) * np.minimum(1, t / 0.004)
    def put(a, i, gl, gr):
        j = min(L, i + len(a)); out[0, i:j] += a[: j - i] * gl; out[1, i:j] += a[: j - i] * gr
        if j - i < len(a): out[0, : len(a) - (j - i)] += a[j - i:] * gl; out[1, : len(a) - (j - i)] += a[j - i:] * gr
    pat = [0, 2, 1, 3, 2, 4, 3, 5]
    for ci, ch in enumerate(CHORDS):
        tones = [m + 12 for m in ch[2:]] + [ch[2] + 24, ch[3] + 24]
        for s in range(32):
            m = tones[pat[s % 8] % len(tones)]; pan = 0.5 + 0.25 * np.sin(s * 1.3)
            put(sq(hz(m), 0.2) * (0.8 if s % 4 == 0 else 0.5), int((ci * CHORD_LEN + s * step) * SR), np.sqrt(1 - pan), np.sqrt(pan))
        for b in range(16):
            if b % 2 == 0: put(tri(hz(ch[0] + 12), 0.5) * 0.9, int((ci * CHORD_LEN + b * BEAT) * SR), 0.7, 0.7)
    y = lowpass(0.8 * out + 0.25 * reverb(out, 0.4, 1.4), 4200)
    return y / np.abs(y).max()
def tile(loop):
    return np.tile(loop, int(np.ceil(N / loop.shape[1])))[:, :N]

# ── 按章节编排的配乐（music: "score"）：各层都是与和弦循环等长的循环，每一章从循环开头重新起（章节卡落在强拍上），
#    层的进出由章节与句号的时间决定。层：pad 铺底 / arpA 八分音符琶音 / arpB 高八度的稀疏琶音 / bass 每拍一个低音 / hat 极轻的八分音符噪声点
def arp_loop(pat, octave, every, dur, bright, gain_first=0.9, gain_rest=0.6):
    L = int(CHORD_LEN * len(CHORDS) * SR); out = np.zeros((2, L)); step = BEAT / 2
    def note(freq, d, br):
        n = int(d * SR); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * freq * t) + br * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t / 0.05)) * np.exp(-t / (d * 0.28)) * np.minimum(1, t / 0.004)
    for ci, ch in enumerate(CHORDS):
        tones = [m + octave for m in ch[2:]] + [ch[2] + octave + 12, ch[3] + octave + 12]
        for s_ in range(0, 32, every):
            i = int((ci * CHORD_LEN + s_ * step) * SR); m = tones[pat[(s_ // every) % len(pat)] % len(tones)]
            a = note(hz(m), dur, bright) * (gain_first if s_ % 8 == 0 else gain_rest); pan = 0.5 + 0.3 * np.sin(s_ * 0.9 + octave)
            j = min(L, i + len(a)); out[0, i:j] += a[: j - i] * np.sqrt(1 - pan); out[1, i:j] += a[: j - i] * np.sqrt(pan)
            if j - i < len(a): out[0, : len(a) - (j - i)] += a[j - i:] * np.sqrt(1 - pan); out[1, : len(a) - (j - i)] += a[j - i:] * np.sqrt(pan)
    y = lowpass(0.7 * out + 0.45 * reverb(out, 0.6, 2.2), 4200 if octave > 12 else 3800)
    return y / np.abs(y).max()
def bass_loop():
    L = int(CHORD_LEN * len(CHORDS) * SR); out = np.zeros((2, L))
    for ci, ch in enumerate(CHORDS):
        for beat in range(16):
            i = int((ci * CHORD_LEN + beat * BEAT) * SR); n = int(0.5 * SR); t = np.arange(n) / SR; f = hz(ch[0])
            a = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.16) * np.minimum(1, t / 0.006) * (1.0 if beat % 4 == 0 else 0.55)
            j = min(L, i + n); out[:, i:j] += a[: j - i]
    y = lowpass(out, 900)
    return y / np.abs(y).max()
def hat_loop():
    L = int(CHORD_LEN * len(CHORDS) * SR); out = np.zeros((2, L)); step = BEAT / 2; r2 = np.random.default_rng(11)
    for s_ in range(int(CHORD_LEN * len(CHORDS) / step)):
        i = int(s_ * step * SR); n = int(0.05 * SR); x = r2.standard_normal(n) * np.exp(-np.arange(n) / (0.007 * SR))
        x = x - np.concatenate([[0], x[:-1]]) * 0.9                                    # 一阶高通：只留沙沙的高频
        g = 1.0 if s_ % 2 == 0 else 0.5; pan = 0.5 + 0.25 * np.sin(s_ * 1.3); j = min(L, i + n)
        out[0, i:j] += x[: j - i] * g * np.sqrt(1 - pan); out[1, i:j] += x[: j - i] * g * np.sqrt(pan)
    return out / np.abs(out).max()
def score():
    sc = mix.get("scenes", []); S = {x["id"]: x for x in sc}; cue = {c["id"]: c for c in mix["cues"]}
    spec = AUD.get("score") or {}
    def at(ref, is_to):                       # "how" / "h17-0.8" / "outro.end" → 秒；找不到时返回 None（那一条编排被跳过）
        import re
        m = re.match(r"^([A-Za-z_]\w*?)(?:\.(start|end))?([+-][\d.]+)?$", ref)
        if not m: raise SystemExit("score: 看不懂的时间写法 " + ref)
        name, anchor, off = m.group(1), m.group(2), float(m.group(3) or 0)
        if name in S: return S[name]["end" if (anchor or ("end" if is_to else "start")) == "end" else "start"] + off
        if name in cue: return cue[name]["end" if anchor == "end" else "start"] + off
        return None
    loops = {"pad": pad_loop(AUD["pad_low"], AUD["pad_top"]), "arpA": arp_loop([0, 2, 3, 2, 4, 2, 3, 5], 12, 1, 0.55, 0.35), "arpB": arp_loop([4, 5, 3, 5, 2, 5, 4, 3], 24, 2, 0.9, 0.2, 0.8, 0.7), "bass": bass_loop(), "hat": hat_loop()}
    LL = loops["pad"].shape[1]
    # 每章从循环开头起；相邻两章之间交叉淡化
    def placed(loop):
        out = np.zeros((2, N))
        for k, s_ in enumerate(sc):
            a = int(s_["start"] * SR); b = min(N, int(s_["end"] * SR) + int(1.2 * SR)); n = b - a
            seg_ = np.tile(loop, int(np.ceil(n / LL)))[:, :n].copy()
            if k > 0: seg_ *= np.clip(np.arange(n) / (0.5 * SR), 0, 1)
            tail = n - (int(s_["end"] * SR) - a)
            if tail > 0 and k < len(sc) - 1: seg_[:, n - tail:] *= np.linspace(1, 0, tail)
            out[:, a:b] += seg_
        return out
    env = {k: np.zeros(N) for k in loops}
    layers = spec.get("layers") or [["pad", sc[0]["id"], sc[-1]["id"], 1.0]]
    for name, frm, to, level in layers:
        if name not in env: raise SystemExit("score: 没有这一层 " + name)
        a, b = at(frm, False), at(to, True)
        if a is None or b is None: continue
        env[name][int(max(0, a) * SR): int(min(total, b) * SR)] = level
    w = {**{"pad": 1.0, "arpA": 0.62, "arpB": 0.3, "bass": 0.3, "hat": 0.09}, **spec.get("weights", {})}
    out = np.zeros((2, N))
    for k in loops:
        e = smooth(smooth(env[k], int(1.4 * SR)), int(1.4 * SR))
        lay = placed(loops[k]) * e * w[k]
        if k in ("arpA", "arpB", "hat"): lay = lay * (1 - 0.35 * duck)
        out += lay
    return out / np.abs(out).max()

kind = AUD["music"]; FADE_IO = None
if kind == "none":
    music = np.zeros((2, N))
elif kind == "score":
    music = score()
elif kind in ("pad", "pulse", "chip"):
    music = tile(pad_loop(AUD["pad_low"], AUD["pad_top"]))
    if kind == "pulse":
        # 章节开头几秒把节拍层推起来，旁白密集处退到铺底之下
        lift = np.zeros(N)
        for s in mix.get("scenes", []):
            lift[int(s["start"] * SR): int(min(total, s["start"] + 6.0) * SR)] = 1
        lift = smooth(smooth(lift, int(1.2 * SR)), int(1.2 * SR))
        music = music + tile(pulse_loop()) * (0.34 + 0.4 * lift) * (1 - 0.35 * duck)
        music /= np.abs(music).max()
    if kind == "chip":
        lift = np.zeros(N)
        for s in mix.get("scenes", []):
            lift[int(s["start"] * SR): int(min(total, s["start"] + 6.0) * SR)] = 1
        lift = smooth(smooth(lift, int(1.2 * SR)), int(1.2 * SR))
        music = music * 0.7 + tile(chip_loop()) * (0.28 + 0.36 * lift) * (1 - 0.4 * duck)
        music /= np.abs(music).max()
elif kind.endswith(".py"):
    import importlib.util
    _spec = importlib.util.spec_from_file_location("lvs_music", os.path.join(VIDEO, kind)); _mod = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_mod)
    music = np.asarray(_mod.compose({"sr": SR, "n": N, "total": total, "scenes": mix.get("scenes", []), "cues": mix["cues"], "audio": AUD, "lang": VLANG}), dtype=np.float64)
    music /= max(1e-9, np.abs(music).max()); FADE_IO = getattr(_mod, "FADE", None)
else:
    m = decode(os.path.join(VIDEO, kind), ch=2).astype(np.float64)
    m /= max(1e-9, np.abs(m).max()); music = tile(m)
fade_in, fade_out = FADE_IO if FADE_IO else (2.5, 5.5 if kind == "score" else 3.0)
fade = np.clip(np.arange(N) / (fade_in * SR), 0, 1) * np.clip((total * SR - np.arange(N)) / (fade_out * SR), 0, 1)
music = music * db(AUD["music_db"] - AUD["duck_db"] * duck) * fade

# ── 音效：全部程序合成。t 为起点（秒）──
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def onepole(x, fc):                          # 可随时间变化的截止频率
    a = np.exp(-2 * np.pi * np.broadcast_to(fc, x.shape) / SR); y = np.empty_like(x); z = 0.0
    for i in range(len(x)): z = a[i] * z + (1 - a[i]) * x[i]; y[i] = z
    return y
def s_tick(v):
    n = int(0.03 * SR); t = np.arange(n) / SR
    return (0.6 * rng.standard_normal(n) * env_exp(n, 0.0015) + np.sin(2 * np.pi * (2300 + 300 * v) * t) * env_exp(n, 0.006)) * 0.5
def s_key(v):
    n = int(0.02 * SR); t = np.arange(n) / SR
    return (0.8 * rng.standard_normal(n) * env_exp(n, 0.001) + np.sin(2 * np.pi * (1300 + 500 * v) * t) * env_exp(n, 0.004)) * 0.5
def s_blip(v):
    n = int(0.09 * SR); t = np.arange(n) / SR; f = 820 + 520 * (t / t[-1])
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.03) * np.minimum(1, t / 0.003)
def s_pop(v):
    n = int(0.14 * SR); t = np.arange(n) / SR; f = 170 + 360 * np.exp(-t / 0.025)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.04) * np.minimum(1, t / 0.002)
def s_whoosh(v):
    n = int(0.6 * SR); t = np.arange(n) / SR; e = np.sin(np.pi * np.clip(t / 0.6, 0, 1)) ** 2
    x = rng.standard_normal(n); fc = 400 + 3200 * (t / 0.6) ** 1.5
    return (onepole(x, fc) - onepole(x, fc * 0.25)) * e * 1.6
def s_thud(v):
    n = int(0.7 * SR); t = np.arange(n) / SR; f = 42 + 38 * np.exp(-t / 0.06)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.16)
    click = onepole(rng.standard_normal(n), np.full(n, 900.0)) * env_exp(n, 0.008) * 0.8
    return (body + click) * np.minimum(1, t / 0.002)
def s_chime(v):
    n = int(1.6 * SR); t = np.arange(n) / SR; f0 = 880.0
    y = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 0.5), (2.0, 0.5, 0.35), (2.76, 0.32, 0.25), (5.4, 0.16, 0.12)])
    return y * np.minimum(1, t / 0.003) * 0.6
def s_error(v):
    n = int(0.34 * SR); t = np.arange(n) / SR
    saw = lambda f: 2 * ((f * t) % 1) - 1
    return onepole(saw(98.0) + saw(104.0), np.full(n, 700.0)) * np.minimum(1, t / 0.004) * np.clip((0.34 - t) / 0.08, 0, 1) * 1.3
def s_riser(v):
    n = int(1.2 * SR); t = np.arange(n) / SR; k = t / 1.2
    y = onepole(rng.standard_normal(n), 300 + 5000 * k ** 2) * 1.4 + 0.5 * np.sin(2 * np.pi * np.cumsum(180 + 900 * k ** 2) / SR)
    return y * k ** 1.6 * np.clip((1.2 - t) / 0.03, 0, 1)
def s_beep(v):                               # 机箱扬声器式的方波短鸣（两种音高）
    n = int(0.11 * SR); t = np.arange(n) / SR; f = 880.0 if v < 0.5 else 660.0
    y = sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 3, 5, 7, 9))
    return y * np.minimum(1, t / 0.002) * np.clip((0.11 - t) / 0.01, 0, 1) * 0.5
def s_drive(v):                              # 软驱寻道：一串低沉的步进声
    n = int(0.46 * SR); y = np.zeros(n)
    for k in range(7):
        i = int(k * 0.055 * SR); m = int(0.03 * SR); tt = np.arange(m) / SR
        y[i:i + m] += np.sin(2 * np.pi * (95 + 12 * ((k + int(v * 3)) % 3)) * tt) * np.exp(-tt / 0.012) + 0.25 * rng.standard_normal(m) * np.exp(-tt / 0.003)
    return y
SFX = {"tick": (s_tick, 0.20, 6), "key": (s_key, 0.10, 6), "blip": (s_blip, 0.26, 1), "pop": (s_pop, 0.42, 1), "whoosh": (s_whoosh, 0.34, 3),
       "thud": (s_thud, 0.85, 1), "chime": (s_chime, 0.30, 1), "error": (s_error, 0.36, 1), "riser": (s_riser, 0.30, 2),
       "beep": (s_beep, 0.16, 2), "drive": (s_drive, 0.5, 2)}
bank = {}
def sample(name, k):
    fn, gain, nvar = SFX[name]; v = k % nvar
    if (name, v) not in bank:
        y = fn(v / max(1, nvar - 1) if nvar > 1 else 0.0); bank[(name, v)] = (y / max(1e-9, np.abs(y).max()) * gain).astype(np.float64)
    return bank[(name, v)]
sfx = np.zeros((2, N)); events = []
p = os.path.join(VIDEO, "build", "sfx.%s.json" % VLANG)
if os.path.exists(p) and AUD["sfx"]: events = json.load(open(p, encoding="utf-8"))
unknown = sorted({e["n"] for e in events if e["n"] not in SFX})
if unknown: print("unknown sfx:", unknown)
for k, e in enumerate(events):
    if e["n"] not in SFX or e["t"] < 0 or e["t"] >= total: continue
    y = sample(e["n"], k) * e.get("g", 1); i = int(e["t"] * SR); j = min(N, i + len(y)); pan = 0.5 + 0.5 * np.clip(e.get("p", 0), -1, 1) * 0.7
    sfx[0, i:j] += y[: j - i] * np.sqrt(2 * (1 - pan)); sfx[1, i:j] += y[: j - i] * np.sqrt(2 * pan)
sfx *= db(AUD["sfx_db"]) * (1 - 0.3 * duck)

def save(path, st):
    st = np.clip(st[:, : int(total * SR)], -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st.T * 32767).astype("<i2").tobytes())
out = os.path.join(VIDEO, "out", VLANG); os.makedirs(out, exist_ok=True)
vs = np.stack([voice, voice]).astype(np.float64)
save(os.path.join(out, "audio_voice.wav"), vs)
save(os.path.join(out, "stem_music.wav"), music)
save(os.path.join(out, "stem_sfx.wav"), sfx)
def limited(x): return x * min(1.0, 0.97 / max(1e-6, np.abs(x).max())) if AUD["limit"] else x
full = limited(vs + music + sfx)
save(os.path.join(out, AUD["out"]), full)
if AUD["out"] == "audio.wav" and kind != "none":            # 正式混音时顺带出一条无配乐的（旁白 + 音效），finish.js 用它封装「无配乐版」
    save(os.path.join(out, "audio_nomusic.wav"), limited(vs + sfx))
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
for s_ in mix.get("scenes", []):
    i, j = int(s_["start"] * SR), int(s_["end"] * SR); sp = duck[i:j] > 0.5
    mm = np.mean(music[:, i:j], axis=0); vv = voice[i:j]
    print("  %-8s %6.1f-%6.1f  music %6.1f dB (under voice %6.1f)  voice %6.1f dB  sfx %6.1f dB" % (s_["id"], s_["start"], s_["end"], rms(mm), rms(mm[sp]) if sp.any() else -99, rms(vv[np.abs(vv) > 1e-4]) if (np.abs(vv) > 1e-4).any() else -99, rms(np.mean(sfx[:, i:j], axis=0))))
print("total %.2fs  music=%s  voice %.1f dB  music %.1f dB  sfx %.1f dB (%d events)  peak %.2f" % (total, kind, rms(voice[voice != 0]), rms(music), rms(sfx[sfx != 0]) if sfx.any() else -99, len(events), np.abs(full).max()))
