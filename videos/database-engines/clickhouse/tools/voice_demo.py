# 审片页的配音试听：策划者 2026-11-08 选定「温润青年」（MiniMax Chinese (Mandarin)_Gentle_Youth），
# 这里用它读新写的「引子」「来历」和「结尾转场」，好在确认文案之前先听一听音色与节奏。试听不是全片配音。
# 文案取自 src/js/script.js（逐句合成并拼接，句间停顿取该句的 gap，与正式制作的做法一致）；读法按 SAY 表。
# 用法：python videos/database-engines/clickhouse/tools/voice_demo.py   → out/audition/demo-intro.mp3、demo-history.mp3、demo-ending.mp3（不入库）
import json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(FILM, '..', '..', '..'))
sys.path.insert(0, os.path.join(REPO, 'kit', 'tools'))
os.environ.setdefault('LVS_REPO', REPO)
os.environ['NO_PROXY'] = ','.join(filter(None, [os.environ.get('NO_PROXY', ''), 'api.minimaxi.com', 'api.minimax.io']))
cfg = json.load(open(os.path.join(REPO, 'kit', 'config.local.json'), encoding='utf-8'))
if cfg.get('minimax_base'): os.environ.setdefault('LVS_MINIMAX_BASE', cfg['minimax_base'])
import minimax_tts as mm

OUT = os.path.join(FILM, 'out', 'audition')
MODEL, VOICE, SPEED = 'speech-2.8-hd', 'Chinese (Mandarin)_Gentle_Youth', 1.18
FF = os.path.join(REPO, 'assets', 'ffmpeg', 'bin', 'ffmpeg.exe')
FF = FF if os.path.exists(FF) else 'ffmpeg'
dump = subprocess.run(['node', '-e', '''
const s = require(process.argv[1]);
const out = {};
for (const id of ["open", "history", "beyond"]) {
  const sc = s.SCRIPT.find((x) => x.id === id);
  out[id] = sc.cues.filter((c) => c[1]).map((c) => ({ id: c[0], text: s.ttsText(c), gap: c[2].gap == null ? 0.3 : c[2].gap }));
}
console.log(JSON.stringify(out));''', os.path.join(FILM, 'src', 'js', 'script.js')], capture_output=True, text=True, encoding='utf-8', check=True).stdout
SC = json.loads(dump)
tmp = tempfile.mkdtemp()
for key, name in (('open', 'demo-intro'), ('history', 'demo-history'), ('beyond', 'demo-ending')):
    parts = []
    for i, c in enumerate(SC[key]):
        f = os.path.join(tmp, f'{key}-{i:02d}.mp3')
        mm.synth(c['text'], 'zh', MODEL, VOICE, SPEED, f)
        w = f[:-4] + '.wav'          # 统一成 32 kHz 单声道 wav 再拼接（mp3 与 wav 混在一起 concat 会出错）
        subprocess.run([FF, '-y', '-loglevel', 'error', '-i', f, '-ar', '32000', '-ac', '1', w], check=True)
        parts.append((w, c['gap']))
    # 用 ffmpeg 的 concat + 静音拼接
    lst = []
    for i, (f, gap) in enumerate(parts):
        lst.append(f)
        sil = os.path.join(tmp, f'sil-{key}-{i}.wav')
        subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', f'anullsrc=r=32000:cl=mono', '-t', f'{gap:.2f}', sil], check=True)
        lst.append(sil)
    listfile = os.path.join(tmp, f'{key}.txt')
    open(listfile, 'w', encoding='utf-8').write(''.join("file '" + x.replace('\\', '/') + "'\n" for x in lst))
    outp = os.path.join(OUT, name + '.mp3')
    subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listfile, '-ar', '32000', '-ac', '1', '-b:a', '128k', outp], check=True)
    import wave
    dur = sum(wave.open(w).getnframes() / 32000 for w, _ in parts) + sum(g for _, g in parts)
    print(name, round(dur, 1), '秒')
