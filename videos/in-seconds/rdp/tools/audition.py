"""审片页的配音候选：几个音色读同一组代表句（试听，不是全片配音）。

文案确认之前 tts.js / tts_probe.js 不能运行，所以本片自带这个试听工具：它不写 timing.zh.js，
产物只在 out/audition/voices/（不入库）。

用法（仓库根目录；MiniMax 需要 NO_PROXY 放行 api.minimaxi.com 与 .aliyuncs.com）：
  node -e "<见 README 审片页一节>" > out/cues.json        # 由 script.js 导出代表句的合成文本
  python -I videos/in-seconds/rdp/tools/audition.py <cues.json> <ffmpeg> <ffprobe>

cues.json：{"cues": [[句号, 合成文本], ...], "all_chars": 全片旁白字数, "speech_budget": 全片可用于说话的秒数}
每个音色：逐句合成 → 记下每句时长（最后一个词结束 + 0.12 秒，与 tts.py 同口径）→ 句间 0.45 秒拼成一段 demo.mp3。
"""
import json, os, subprocess, sys, time, asyncio

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(REPO, 'kit', 'tools'))
os.environ.setdefault('LVS_REPO', REPO)
import minimax_tts as mm

CUES_JSON, FF, FP = sys.argv[1], sys.argv[2], sys.argv[3]
os.environ['LVS_FFPROBE'] = FP
OUT = os.path.join(HERE, '..', 'out', 'audition', sys.argv[5] if len(sys.argv) > 5 else 'voices')   # 第 5 个参数：输出子目录（全片试读用 full）

VOICES = [
    # (目录名, 引擎, 音色 id, 语速, 显示名)
    ('gentle-youth', 'minimax', 'Chinese (Mandarin)_Gentle_Youth', 1.2, '温润青年'),
    ('unrestrained', 'minimax', 'Chinese (Mandarin)_Unrestrained_Young_Man', 1.2, '不羁青年'),
    ('daxuesheng', 'minimax', 'male-qn-daxuesheng', 1.2, '青年大学生'),
    ('gentle-senior', 'minimax', 'Chinese (Mandarin)_Gentle_Senior', 1.2, '温柔学姐'),
    ('warm-girl', 'minimax', 'Chinese (Mandarin)_Warm_Girl', 1.2, '温暖少女'),
]
if len(sys.argv) > 4:
    keep = set(sys.argv[4].split(','))
    VOICES = [v for v in VOICES if v[0] in keep]

data = json.load(open(CUES_JSON, encoding='utf-8'))
cues = data['cues']


def chars(s):
    return sum(1 for ch in s if not ch.isspace() and ch not in '，。：；、「」,.:;')


def edge_synth(text, voice, rate, path):
    import edge_tts
    async def go():
        c = edge_tts.Communicate(text, voice, rate=rate)
        words = []
        with open(path, 'wb') as f:
            async for ch in c.stream():
                if ch['type'] == 'audio':
                    f.write(ch['data'])
                elif ch['type'] == 'WordBoundary':
                    words.append((ch['offset'] / 1e7, ch['duration'] / 1e7))
        return words
    w = asyncio.run(go())
    return round(w[-1][0] + w[-1][1] + 0.12, 3)


report = []
for slug, engine, vid, speed, name in VOICES:
    d = os.path.join(OUT, slug)
    os.makedirs(d, exist_ok=True)
    durs, ok = {}, True
    for cid, text in cues:
        p = os.path.join(d, f'{cid}.mp3')
        meta = p + '.json'
        if os.path.exists(meta):
            m = json.load(open(meta, encoding='utf-8'))
            if m.get('text') == text:                       # 文字变了就重合成
                durs[cid] = m['d']; continue
        for attempt in range(4):
            try:
                if engine == 'minimax':
                    dd, _ = mm.synth(text, 'zh', 'speech-2.8-hd', vid, speed, p)
                else:
                    dd = edge_synth(text, vid, speed, p)
                durs[cid] = dd
                json.dump({'d': dd, 'text': text}, open(meta, 'w', encoding='utf-8'), ensure_ascii=False)
                break
            except Exception as e:
                print(slug, cid, 'retry', attempt, e, flush=True)
                time.sleep(4 + 4 * attempt)
        else:
            ok = False; break
        time.sleep(1.2)
    if not ok:
        report.append({'slug': slug, 'name': name, 'id': vid, 'engine': engine, 'speed': speed, 'error': True})
        continue
    # 拼 demo：每句裁到实测时长，句间 0.45 秒
    lst = os.path.join(d, 'concat.txt')
    sil = os.path.join(d, '_gap.wav')
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=32000:cl=mono', '-t', '0.45', sil], check=True)
    parts = []
    for cid, _ in cues:
        cut = os.path.join(d, f'_{cid}.wav')
        subprocess.run([FF, '-v', 'error', '-y', '-i', os.path.join(d, f'{cid}.mp3'), '-t', str(durs[cid]),
                        '-ar', '32000', '-ac', '1', cut], check=True)
        parts += [cut, sil]
    with open(lst, 'w', encoding='utf-8') as f:
        for x in parts:
            f.write("file '%s'\n" % x.replace('\\', '/'))
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c:a', 'libmp3lame',
                    '-b:a', '128k', os.path.join(d, 'demo.mp3')], check=True)
    total_d = sum(durs.values())
    n = sum(chars(t) for _, t in cues)
    cps = n / total_d
    est = data['all_chars'] / cps
    report.append({'slug': slug, 'name': name, 'id': vid, 'engine': engine, 'speed': speed,
                   'seconds': round(total_d, 2), 'chars': n, 'cps': round(cps, 2),
                   'full_estimate': round(est, 1), 'budget': data['speech_budget']})
    print(slug, f'{cps:.2f} 字/秒，全片旁白约 {est:.0f} 秒（可用 {data["speech_budget"]:.0f} 秒）', flush=True)

json.dump(report, open(os.path.join(OUT, 'report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
