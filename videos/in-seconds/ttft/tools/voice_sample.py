"""用已选音色合成新稿的代表句（不是全片配音），量出每句时长，供审片页试听与估算时间线。
用法：python tools/voice_sample.py    需要网络与 edge-tts、ffprobe（取时长用 mutagen 亦可）。"""
import asyncio, json, pathlib, subprocess, sys
import edge_tts

BASE = pathlib.Path(__file__).resolve().parents[1]
OUT = BASE / 'out' / 'audition'
CAL = OUT / 'cal'
import os
FFMPEG = os.environ.get('FFMPEG', 'ffmpeg'); FFPROBE = os.environ.get('FFPROBE', 'ffprobe')
VOICE, RATE = 'zh-CN-XiaoyiNeural', '+6%'
# 句号 → 读法文本（与 script.js 的 SAY 一致：TTFT→T T F T，Token→托肯）；选的是最长与最有读法风险的句子
LINES = {
    'o1': '向 L L M 提问之后，光标闪一会儿，第一个字才出现。',
    'o2': '之后文字却一个接一个冒出来。',
    'o3': '这段等待，是对话里体感延迟的主要来源。',
    'd1': '回答是一小段一小段写出来的，每一小段叫一个 托肯。',
    'd3': '这段时间就是 首 托肯 延迟，缩写 T T F T。',
    'w2': '写每一个新 托肯，都要参考前面所有的 托肯。',
    'r2': '输入的 托肯 同时处理，中间结果存进缓存。',
    'r3': '之后每个新 托肯，只在缓存上续一小步。',
    'r4': '重复提问时，开头相同的部分会命中缓存，',
    'r5': '不用重新读，首 托肯 延迟通常更短。',
    'l1': '同样的问题，附上整个代码文件。',
    's1': '聊天里，首 托肯 延迟一秒以内算快。',
    's3': '开着深度思考的模型，要等几十秒以上。',
    'e1': '第一个 托肯 慢，是因为要先读完输入，',
}   # 读法与 script.js 的 SAY / tts 一致：Token → 托肯

def dur(path):
    r = subprocess.run([FFPROBE, '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)], capture_output=True, text=True)
    return float(r.stdout.strip())

async def main():
    CAL.mkdir(parents=True, exist_ok=True)
    res = {}
    for k, t in LINES.items():
        f = CAL / (k + '.mp3')
        words = []
        with open(f, 'wb') as fh:
            async for ch in edge_tts.Communicate(t, VOICE, rate=RATE, boundary='WordBoundary').stream():
                if ch['type'] == 'audio':
                    fh.write(ch['data'])
                elif ch['type'] == 'WordBoundary':
                    words.append(ch)
        d = round(words[-1]['offset'] / 1e7 + words[-1]['duration'] / 1e7 + 0.12, 3)   # 与 kit/tools/tts.py 同一口径
        res[k] = {'text': t, 'd': d, 'file': round(dur(f), 3), 'chars': len(''.join(c for c in t if c not in '，。：；、 '))}
        print(k, res[k]['d'], res[k]['chars'])
    (CAL / 'durations.json').write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf8')
    tot_c = sum(v['chars'] for v in res.values()); tot_d = sum(v['d'] for v in res.values())
    print('chars/sec', round(tot_c / tot_d, 2), 'sec/line-overhead check', round(tot_d, 2))
    # 拼成一段小样（句间 0.4 秒）供审片页试听
    lst = CAL / 'list.txt'
    sil = CAL / 'sil.mp3'
    subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.4', '-q:a', '9', str(sil)])
    order = list(LINES)
    lst.write_text(''.join(f"file '{k}.mp3'\nfile 'sil.mp3'\n" for k in order), encoding='utf8')
    subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c:a', 'libmp3lame', '-q:a', '4', str(OUT / 'voice-v2.mp3')])
    print('ok', OUT / 'voice-v2.mp3')

asyncio.run(main())
