# 配音的「老式处理」：策划者 2026-10-31 点选「zh-CN-YunyangNeural 老式」。在 tts.js 之后、audio.js 之前运行：
#   node kit/tools/tts.js videos/in-seconds/von-neumann
#   python videos/in-seconds/von-neumann/tools/vintage_voice.py
#   node kit/tools/audio.js videos/in-seconds/von-neumann
# 做法：把 audio/<语言>/cues/<id>.mp3 的原声移到 audio/<语言>/cues_dry/，处理后的写回 cues/（混音工具读这里）。
# 处理链：收窄频带到约 300–3800 Hz（老收音机、新闻片的声音）、压缩、轻微电子管式饱和、28 毫秒的短房间回声。
# 底噪不加在人声上（逐句加会在句间一开一关），由配乐脚本 tools/music.py 全程铺一层唱片底噪。
# 幂等：manifest 记下每句原声与成品的校验和；tts.js 重新合成了某句（cues/ 里出现了新的原声），只处理这一句。
import hashlib, json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(VIDEO, '..', '..', '..'))
FF = os.environ.get('LVS_FFMPEG') or os.path.join(REPO, 'assets', 'ffmpeg', 'bin', 'ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')
CHAIN = ('highpass=f=300,lowpass=f=3800,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,'
         'asoftclip=type=tanh,aecho=0.8:0.5:28:0.18,volume=1.4')
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()

for lang in (sys.argv[1:] or ['zh']):
    base = os.path.join(VIDEO, 'audio', lang)
    cues, dry = os.path.join(base, 'cues'), os.path.join(base, 'cues_dry')
    if not os.path.isdir(cues):
        sys.exit('没有 %s：先运行 tts.js' % cues)
    os.makedirs(dry, exist_ok=True)
    mpath = os.path.join(base, 'vintage.json')
    man = json.load(open(mpath, encoding='utf-8')) if os.path.exists(mpath) else {}
    made = kept = 0
    for f in sorted(os.listdir(cues)):
        if not f.endswith('.mp3'):
            continue
        cid, cur = f[:-4], os.path.join(cues, f)
        h = sha(cur)
        rec = man.get(cid)
        if rec and rec.get('out') == h and rec.get('chain') == CHAIN:
            kept += 1; continue
        src = os.path.join(dry, f)
        if not (rec and rec.get('out') == h):          # cues/ 里是新的原声（首次，或 tts.js 重新合成了这句）
            shutil.copyfile(cur, src)
        tmp = cur + '.tmp.mp3'
        subprocess.run([FF, '-y', '-v', 'error', '-i', src, '-af', CHAIN, '-ar', '24000', '-ac', '1', '-b:a', '96k', tmp], check=True)
        os.replace(tmp, cur)
        man[cid] = {'dry': sha(src), 'out': sha(cur), 'chain': CHAIN}
        made += 1
    for cid in [k for k in man if not os.path.exists(os.path.join(cues, k + '.mp3'))]:
        del man[cid]
    json.dump(man, open(mpath, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('%s：老式处理 %d 句，已是成品 %d 句' % (lang, made, kept))
