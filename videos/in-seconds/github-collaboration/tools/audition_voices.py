# 审片页的配音候选：同一组代表句，用几个 MiniMax 音色各读一遍，写进 out/audition/voices/（不入库）。
# 只是试听，不是全片配音：全片仍等文案确认后由 kit/tools/tts.js 合成。
# 用法（在仓库根运行）：
#   node -e "<导出代表句>" > out/audition/voices/lines.json   （见 README「接续」）
#   python videos/in-seconds/github-collaboration/tools/audition_voices.py out/audition/voices/lines.json <速度> <音色1> <音色2> …
# lines.json：[{ "id": "o1", "cap": "字幕", "tts": "送去合成的文本" }, …]，读法取自 src/js/script.js 的 SAY 表。
# 每个音色输出：逐句 mp3、整组拼接的 <音色>.mp3（句间 0.45 秒静音）、durations.json（逐句实测时长）。
# 再用 faster-whisper 回听拼接后的整组，写 <音色>.asr.txt，供人核对漏读与英文、编号的读法（同音字不算错）。
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(REPO, 'kit', 'tools'))
CFG = json.load(open(os.path.join(REPO, 'kit', 'config.local.json'), encoding='utf-8'))
EXE = '.exe' if os.name == 'nt' else ''
_bin = lambda n: CFG.get(n) or next((p for p in [os.path.join(REPO, 'assets', 'ffmpeg', 'bin', n + EXE)] if os.path.exists(p)), n)   # 同 kit/tools/lib.js 的查找顺序
os.environ['LVS_FFPROBE'] = os.environ.get('LVS_FFPROBE') or _bin('ffprobe')
if CFG.get('minimax_base'):
    os.environ.setdefault('LVS_MINIMAX_BASE', CFG['minimax_base'])
import minimax_tts  # noqa: E402  （密钥只在请求头里，不打印、不写盘）

lines_file, speed, voices = sys.argv[1], float(sys.argv[2]), sys.argv[3:]
lines = json.load(open(lines_file, encoding='utf-8'))
OUT = os.path.dirname(os.path.abspath(lines_file))
FF = _bin('ffmpeg')
safe = lambda v: re.sub(r'[^A-Za-z0-9_-]+', '_', v).strip('_')
summary = {}
for v in voices:
    d = os.path.join(OUT, safe(v)); os.makedirs(d, exist_ok=True)
    durs, parts = {}, []
    for ln in lines:
        mp3 = os.path.join(d, ln['id'] + '.mp3')
        if not os.path.exists(mp3):
            for attempt in range(3):
                try:
                    dur, _ = minimax_tts.synth(ln['tts'], 'zh', 'speech-2.8-hd', v, speed, mp3); break
                except Exception as e:  # 失败重试；三次都失败就记下，不中断其余音色
                    err = str(e)
            else:
                durs[ln['id']] = {'error': err}; continue
        durs[ln['id']] = {'d': minimax_tts.probe_seconds(mp3)}
        parts.append(mp3)
    # 拼接：句间 0.45 秒静音，统一 32 kHz 单声道
    if parts:
        inputs, filt = [], []
        for i, p in enumerate(parts):
            inputs += ['-i', p]
            filt.append('[%d:a]aresample=32000,aformat=channel_layouts=mono,apad=pad_dur=0.45[a%d]' % (i, i))
        filt.append(''.join('[a%d]' % i for i in range(len(parts))) + 'concat=n=%d:v=0:a=1[out]' % len(parts))
        joined = os.path.join(OUT, safe(v) + '.mp3')
        subprocess.run([FF, '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filt), '-map', '[out]', '-b:a', '128k', joined], check=True)
    json.dump(durs, open(os.path.join(d, 'durations.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    summary[v] = durs
    print(v, 'ok', sum(x.get('d') or 0 for x in durs.values()), file=sys.stderr)
SUM = os.path.join(OUT, 'summary.json')   # 各音色可用不同语速分批合成，结果并进同一份
old = json.load(open(SUM, encoding='utf-8')) if os.path.exists(SUM) else {'voices': {}}
old['voices'].update({v: {'speed': speed, 'lines': d} for v, d in summary.items()})
json.dump(old, open(SUM, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# 回听
try:
    from faster_whisper import WhisperModel
    name = CFG.get('asr_model') or 'fw-small'
    local = os.path.join(REPO, 'assets', 'whisper')
    if os.path.isdir(os.path.join(local, name)):
        os.chdir(local)
    elif name == 'fw-small':
        name = 'small'
    m = WhisperModel(name, device='cpu', compute_type='int8')
    for v in voices:
        f = os.path.join(OUT, safe(v) + '.mp3')
        if not os.path.exists(f):
            continue
        segs, _ = m.transcribe(f, language='zh', vad_filter=True, condition_on_previous_text=False, initial_prompt='以下是普通话的讲解。')
        open(os.path.join(OUT, safe(v) + '.asr.txt'), 'w', encoding='utf-8').write('\n'.join('%6.2f %6.2f %s' % (s.start, s.end, s.text.strip()) for s in segs))
except Exception as e:
    print('ASR 跳过：', e, file=sys.stderr)
