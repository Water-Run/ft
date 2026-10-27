# 配乐 + 配音的一分半试听 demo：选定的男声读一段试听文字，配乐垫在下面，电平与压低量照本片 project.json 的 audio，
# 混法与 kit/tools/mix.py 相同（旁白按响度对齐到 -21 dB 再软限幅；说话时配乐再压低 duck_db），
# 最后照 kit/tools/finish.js 把整体响度提到成片目标（-16 LUFS）并限幅，听起来接近成片。
# 第一版漏了最后这一步，整体只有 -18.1 LUFS（成片是 -16），WaterRun 听了说「声音好像有点太小」（2026-10-27）。
# 同时量过分轨：旁白比配乐响 18.2 LU，InnoDB 一集成片是 16.9 LU，比例本身不偏小。
# WaterRun 2026-10-26：「新Demo还包括BGM+配音的1.5分钟demo」。
# 试听文字只为试听，不是文案，没有取证，不进成片；成片文案按 research/FACTS.md 另写，经校对确认后才配音。
# 用法：python demo_mix.py <试听目录> <配乐.wav> <输出前缀>   需要 MiniMax 密钥；本机要让 api.minimaxi.com 与 .aliyuncs.com 不走代理。
import json, os, re, subprocess, sys, time, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', '..', 'kit', 'tools'))
import minimax_tts

FF = os.environ.get('LVS_FFMPEG') or os.path.join(HERE, '..', '..', '..', '..', 'assets', 'ffmpeg', 'bin', 'ffmpeg.exe')
PROJECT = json.load(open(os.path.join(HERE, '..', 'project.json'), encoding='utf-8'))
TTS, AUD = PROJECT['tts'], PROJECT['audio']
SR = 44100
LEAD, GAP, TAIL = 6.0, 0.9, 4.5         # 配乐先走几秒再开口；段与段之间停多久；最后一句之后配乐再走多久
PARAS = [
    '上一期，我们拆开了 InnoDB：数据按主键排在一棵 B+ 树里；改一行，就在原地改，旧值放进 undo 日志。',
    '这一期，是另一条路。一九八六年，伯克利的一个研究项目，起名 POSTGRES。四十年后，它成了开发者用得最多的数据库。',
    'PostgreSQL 把一张表存成一个堆：文件切成一页一页，每页 8 KB；行放进页里，不按主键排，哪里有空位，就放在哪里。',
    '索引是另一棵独立的 B 树。叶子里不存整行，只存一个地址：第几页、第几个槽，叫 ctid。顺着它回到堆里，才找到那一行。',
    '同样一句 UPDATE，它不覆盖原来那一行，而是在页里再写一个新版本，并在旧版本上记下：从哪个事务起，你不再算数。读的人看旧的，写的人写新的，互不等待。',
    '旧版本不会自己消失，要等 VACUUM 来清点、回收。秩序，是一遍遍整理出来的。',
    '接下来，我们从一个空的数据目录开始，一层一层地看：PostgreSQL 怎样放、怎样找、怎样改和删，怎样让许多人同时读写，又怎样在出错之后，回到正确的状态。',
]
SAY = [('PostgreSQL', 'Postgres Q L'), ('POSTGRES', 'Postgres'), ('InnoDB', 'Inno D B'), ('B+ 树', 'B 加树'), ('8 KB', '八 K B'), ('UPDATE', 'update'), ('VACUUM', 'vacuum')]


def say(s):
    for a, b in SAY:
        s = s.replace(a, b)
    return s


def units(s):
    return len(re.findall(r'[一-鿿]', s)) + len(re.findall(r'[A-Za-z0-9]', s)) / 2.0


def decode(path, ch=1):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    return a if ch == 1 else a.reshape(-1, ch).T


def loudness(path):
    t = subprocess.run([FF, '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    s = t[t.rfind('Summary:'):]
    return {'I': float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1)), 'TP': float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))}


def smooth(x, k):
    c = np.cumsum(np.concatenate([np.zeros(k // 2 + 1), x, np.zeros(k - k // 2)]))
    return ((c[k:] - c[:-k]) / k)[: len(x)]


def main(d, music_wav, prefix):
    cache = os.path.join(d, 'demo_voice'); os.makedirs(cache, exist_ok=True)
    voice_id, speed = TTS['voice']['zh'], TTS['speed']['zh']
    segs, t = [], LEAD
    for i, text in enumerate(PARAS):
        mp3 = os.path.join(cache, 'p%d.mp3' % (i + 1)); stamp = mp3 + '.txt'
        key = '%s|%s|%s|%s' % (TTS['model'], voice_id, speed, say(text))
        if not (os.path.exists(mp3) and os.path.exists(stamp) and open(stamp, encoding='utf-8').read() == key):
            minimax_tts.synth(say(text), 'zh', TTS['model'], voice_id, speed, mp3)
            open(stamp, 'w', encoding='utf-8').write(key); time.sleep(3)
        a = decode(mp3)
        segs.append({'start': round(t, 3), 'end': round(t + len(a) / SR, 3), 'text': text, 'audio': a})
        t += len(a) / SR + GAP
    total = segs[-1]['end'] + TAIL; N = int(total * SR)
    voice = np.zeros(N)
    for s in segs:
        i = int(s['start'] * SR); voice[i:i + len(s['audio'])] += s['audio'][:N - i]
    act = voice[np.abs(voice) > 1e-4]
    voice *= 10 ** (-21.0 / 20) / max(1e-6, np.sqrt(np.mean(act ** 2)))
    th = 0.7; over = np.abs(voice) > th
    voice[over] = np.sign(voice[over]) * (th + (0.95 - th) * np.tanh((np.abs(voice[over]) - th) / (0.95 - th)))
    speaking = np.zeros(N)
    for s in segs:
        speaking[max(0, int((s['start'] - 0.15) * SR)): int((s['end'] + 0.25) * SR)] = 1
    duck = smooth(smooth(speaking, int(0.35 * SR)), int(0.35 * SR))
    music = decode(music_wav, 2)
    music = music / max(1e-9, np.abs(music).max())
    music = np.pad(music, ((0, 0), (0, max(0, N - music.shape[1]))))[:, :N]
    fade = np.clip(np.arange(N) / (2.5 * SR), 0, 1) * np.clip((N - np.arange(N)) / (3.5 * SR), 0, 1)
    music = music * (10 ** ((AUD['music_db'] - AUD['duck_db'] * duck) / 20) * fade)
    out = music + voice
    peak = np.abs(out).max()
    if peak > 0.97:
        out *= 0.97 / peak; music *= 0.97 / peak; voice *= 0.97 / peak

    def write(path, y):
        y = np.broadcast_to(y, (2, N)) if y.ndim == 1 else y
        with wave.open(path, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y.T, -1, 1) * 32767).astype('<i2').tobytes())
    wav = os.path.join(d, prefix + '.wav'); write(wav, out)
    # 分轨各量一次响度：旁白比配乐响多少 LU（同一位置量，和别的片子的成片分轨可比）
    write(os.path.join(d, prefix + '_voice.wav'), voice); write(os.path.join(d, prefix + '_music.wav'), music)
    gap = round(loudness(os.path.join(d, prefix + '_voice.wav'))['I'] - loudness(os.path.join(d, prefix + '_music.wav'))['I'], 1)
    # 最后一步照 kit/tools/finish.js：按实测响度加一个固定增益到目标（audio.lufs，缺省 -16 LUFS），再限幅；真峰值超过 -1 dBFS 就压低限幅上限重做
    target = float(AUD.get('lufs', -16)); m0 = loudness(wav)
    gain = max(-6.0, min(20.0, target - m0['I'] + 0.4)); lim = 0.84
    final = os.path.join(d, prefix + '_final.wav')
    for _ in range(3):
        subprocess.run([FF, '-v', 'error', '-y', '-i', wav, '-af', 'volume=%.1fdB,alimiter=limit=%.3f:level=disabled:attack=5:release=80' % (gain, lim), final], check=True)
        m1 = loudness(final)
        if m1['TP'] <= -1.0:
            break
        lim *= 10 ** ((-1.0 - m1['TP'] - 0.05) / 20)
    subprocess.run([FF, '-v', 'error', '-y', '-i', final, '-codec:a', 'libmp3lame', '-b:a', '192k', os.path.join(d, prefix + '.mp3')], check=True)
    speech = sum(s['end'] - s['start'] for s in segs)
    meta = {'voice': voice_id, 'speed': speed, 'model': TTS['model'], 'music_db': AUD['music_db'], 'duck_db': AUD['duck_db'], 'seconds': round(total, 2),
            'lufs': m1['I'], 'true_peak': m1['TP'], 'gain_db': round(gain, 1), 'voice_over_music_lu': gap,
            'rate': round(sum(units(p) for p in PARAS) / speech, 2), 'segments': [{k: s[k] for k in ('start', 'end', 'text')} for s in segs]}
    json.dump(meta, open(os.path.join(d, prefix + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(prefix, 'total', round(total, 1), 's', 'speech', round(speech, 1), 's', 'rate', meta['rate'], 'before', m0['I'], 'LUFS', 'gain', round(gain, 1), 'dB', 'after', m1['I'], 'LUFS', 'TP', m1['TP'], 'dBFS', 'voice-music', gap, 'LU')


if __name__ == '__main__':
    main(*sys.argv[1:4])
