# 审片页的混音小样：用选定的音色（Sincere_Adult）把当前稿本的三段代表段落念出来，配上方向 C 的配乐，按 kit/tools/mix.py 的同一套参数混音。
# 只是小样：全片配音仍等文案确认（docs/process.md 第 4 节）。产物在 out/audition/demo/（不入库）。
# 用法（仓库根目录）：python -I videos/database-engines/redis/tools/mix_demo.py
#
# 混音与 mix.py 相同：旁白按有声部分的 RMS 对齐到 -21 dB 再软限幅（所以试听时偏小的音色会被拉到同一电平）；
# 配乐按峰值归一后乘 db(music_db - duck_db * duck)，duck 是「正在说话」经两次 0.35 秒滑动平均；最后按 finish.js 的做法
# 量一次整体响度、算一个固定增益到 -16 LUFS，再限幅到 -1 dBFS 以下。
import json, os, subprocess, sys, hashlib, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); VIDEO = os.path.dirname(HERE); REPO = os.path.abspath(os.path.join(VIDEO, '..', '..', '..'))
sys.path.insert(0, os.path.join(REPO, 'kit', 'tools')); sys.path.insert(0, HERE)
os.environ.setdefault('LVS_REPO', REPO)
BIN = os.path.join(REPO, 'assets', 'ffmpeg', 'bin'); FF = os.path.join(BIN, 'ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')
os.environ.setdefault('LVS_FFPROBE', os.path.join(BIN, 'ffprobe.exe' if os.name == 'nt' else 'ffprobe'))
import minimax_tts, music
SR = 48000
PROJ = json.load(open(os.path.join(VIDEO, 'project.json'), encoding='utf-8'))
TTS = PROJ['tts']; AUD = PROJ['audio']
OUT = os.path.join(VIDEO, 'out', 'audition', 'demo'); CUES = os.path.join(OUT, 'cues'); os.makedirs(CUES, exist_ok=True)

# 三段：scene、从哪句到哪句；peak = (最高处从哪句开始, 落到 C 大调的那一句)，None 表示这一段不要高潮
DEMOS = [
    {'id': 'open', 'title': '开场', 'scene': 'open', 'from': 'o1', 'to': 'o19', 'peak': None},
    {'id': 'concur', 'title': '05 事务与并发（信息最密的一段）', 'scene': 'concur', 'from': 'e1', 'to': 'e17', 'peak': None},
    {'id': 'finale', 'title': '09 旧的 42（终章）', 'scene': 'finale', 'from': 'z1', 'to': 'zT', 'peak': ('z15', 'z23')},   # 第 4 稿：最高处从「undo、旧版本……」起，最后一句落到 C 大调
]

def script():
    js = "const s=require(process.argv[1]);console.log(JSON.stringify(s.SCRIPT.map(sc=>({id:sc.id,lead:sc.lead,chap:sc.chap,cues:sc.cues.map(c=>({id:c[0],cap:c[1],gap:c[2].gap,pause:c[2].pause,tts:c[1]?s.ttsText(c):null}))}))))"
    return json.loads(subprocess.run(['node', '-e', js, os.path.join(VIDEO, 'src', 'js', 'script.js')], capture_output=True, text=True, encoding='utf-8', check=True).stdout)

def decode(path):
    r = subprocess.run([FF, '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)

def synth(text):
    key = hashlib.sha1(json.dumps([TTS['model'], TTS['voice']['zh'], TTS['speed']['zh'], text], ensure_ascii=False).encode()).hexdigest()[:16]
    p = os.path.join(CUES, key + '.mp3'); j = p + '.json'
    if not os.path.exists(j):
        for k in range(4):
            try:
                d, words = minimax_tts.synth(text, 'zh', TTS['model'], TTS['voice']['zh'], TTS['speed']['zh'], p); break
            except Exception as e:
                if k == 3: raise
                print('  重试', e)
        json.dump({'d': d}, open(j, 'w'))
    return p, json.load(open(j))['d']

def smooth(x, k):
    c = np.cumsum(np.concatenate([np.zeros(k // 2 + 1), x, np.zeros(k - k // 2)]))
    return ((c[k:] - c[:-k]) / k)[:len(x)]

def lufs(path):
    r = subprocess.run([FF, '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='replace')
    tail = r.stderr[r.stderr.rfind('Summary:'):]
    I = float(tail.split('I:')[1].split('LUFS')[0]); P = float(tail.split('Peak:')[1].split('dBFS')[0])
    return I, P

def write(path, st):
    x = np.clip(st, -1, 1); xi = (x.T * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(xi.tobytes())

def main():
    sc = {s['id']: s for s in script()}
    report = []
    for D in DEMOS:
        s = sc[D['scene']]; ids = [c['id'] for c in s['cues']]
        cues = s['cues'][ids.index(D['from']): ids.index(D['to']) + 1]
        t = s['lead'] or 1.0; placed = []
        for c in cues:
            if c.get('pause') is not None:
                t += c['pause']; continue
            p, d = synth(c['tts']); placed.append((c['id'], c['cap'], t, d, p))
            t += d + (c.get('gap') if c.get('gap') is not None else 0.3)
        total = t + (9.0 if D['peak'] else 3.0)   # 终章：最后一句之后让 C 大调完整响一会儿再淡出
        N = int(total * SR)
        voice = np.zeros(N); speaking = np.zeros(N)
        for cid, cap, st, d, p in placed:
            a = decode(p); i = int(st * SR); voice[i:i + len(a)] += a[:max(0, N - i)]
            speaking[max(0, int((st - 0.15) * SR)): int((st + d + 0.25) * SR)] = 1
        raw_rms = 20 * np.log10(np.sqrt(np.mean(voice[np.abs(voice) > 1e-4] ** 2)))
        act = voice[np.abs(voice) > 1e-4]; voice *= 10 ** (-21.0 / 20) / max(1e-6, np.sqrt(np.mean(act ** 2)))
        th = 0.7; over = np.abs(voice) > th
        voice[over] = np.sign(voice[over]) * (th + (0.95 - th) * np.tanh((np.abs(voice[over]) - th) / (0.95 - th)))
        duck = smooth(smooth(speaking, int(0.35 * SR)), int(0.35 * SR))
        # 配乐：小节计划
        I = 4
        if D['peak']:
            st = {cid: s_ for cid, _, s_, _, _ in placed}
            B = music.bar_of(st[D['peak'][0]]); P = music.bar_of(st[D['peak'][1]]) - 2
            B = min(B, P - 2)
        else:
            B = P = 10 ** 6
        m = music.compose_plan(total, I, B, P)[:, :N]
        if m.shape[1] < N: m = np.pad(m, ((0, 0), (0, N - m.shape[1])))
        m /= max(1e-9, np.abs(m).max())
        fade = np.clip(np.arange(N) / (music.FADE[0] * SR), 0, 1) * np.clip((N - np.arange(N)) / (music.FADE[1] * SR), 0, 1)
        m = m * 10 ** ((AUD['music_db'] - AUD['duck_db'] * duck) / 20) * fade
        mixd = m + voice[None, :]
        mixd *= min(1.0, 0.97 / max(1e-6, np.abs(mixd).max()))
        tmp = os.path.join(OUT, D['id'] + '.tmp.wav'); write(tmp, mixd)
        I0, _ = lufs(tmp); g = 10 ** ((-16.0 - I0) / 20)
        out = mixd * g
        pk = np.abs(out).max(); ceil = 10 ** (-1.2 / 20)
        if pk > ceil:   # 简单的软限幅：只压超出部分
            over = np.abs(out) > ceil * 0.8
            out[over] = np.sign(out[over]) * (ceil * 0.8 + (ceil * 0.2) * np.tanh((np.abs(out[over]) - ceil * 0.8) / (ceil * 0.2)))
        wav = os.path.join(OUT, D['id'] + '.wav'); write(wav, out); os.remove(tmp)
        mp3 = os.path.join(OUT, D['id'] + '.mp3')
        subprocess.run([FF, '-y', '-v', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '192k', mp3], check=True)
        I1, P1 = lufs(mp3)
        vo = voice * g; vrms = 20 * np.log10(np.sqrt(np.mean(vo[np.abs(vo) > 1e-4] ** 2)))
        sp = duck > 0.5
        mrms = 20 * np.log10(np.sqrt(np.mean((m.mean(axis=0) * g)[sp] ** 2)) + 1e-12)
        report.append({'id': D['id'], 'title': D['title'], 'file': 'demo/' + D['id'] + '.mp3', 'seconds': round(total, 1), 'lufs': I1, 'peak': P1,
                       'voice_raw_rms_db': round(raw_rms, 1), 'voice_rms_db': round(vrms, 1), 'music_under_voice_db': round(mrms, 1),
                       'plan': {'I': I, 'B': None if B > 10 ** 5 else B, 'P': None if P > 10 ** 5 else P, 'bar_s': round(music.BAR, 3)},
                       'cues': [[cid, cap, round(st_, 2), round(d, 2)] for cid, cap, st_, d, _ in placed]})
        print(f"{D['id']:7} {total:6.1f}s  {I1:6.1f} LUFS  peak {P1:5.1f}  voice raw {raw_rms:6.1f} → {vrms:6.1f} dB, music under voice {mrms:6.1f} dB")
    json.dump({'voice': TTS['voice']['zh'], 'speed': TTS['speed']['zh'], 'music': 'C 终章（tools/music.py compose_plan）', 'audio': AUD, 'demos': report},
              open(os.path.join(OUT, 'demo.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main()
