"""审片页的配音试听：用同一段代表句（取自 src/js/script.js 的几句，按 SAY 表换成读法）给 5 个候选音色各合成一段。
不是全片配音；全片配音等文案确认后用 kit/tools/tts.js。
用法（仓库根目录）：node videos/database-engines/mongodb/tools/voice_demo.js（写代表句）→ py -3 -X utf8 videos/database-engines/mongodb/tools/voice_demo.py
产物：out/audition/voices/v1.mp3 … v5.mp3 与 voices.json（out/ 不入库）。密钥取 kit 的 minimax_tts（MINIMAX_API_KEY 或 kit/local/minimax-tts.md）。"""
import sys, os, json
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(REPO, 'kit', 'tools'))
import minimax_tts
OUT = os.path.join(os.path.dirname(__file__), '..', 'out', 'audition', 'voices')
text = open(os.path.join(OUT, 'sample.txt'), encoding='utf-8').read().replace('？。', '？')
VOICES = [
    ('v1', 'Chinese (Mandarin)_Gentle_Senior', 1.15),
    ('v2', 'Chinese (Mandarin)_Mature_Woman', 1.15),
    ('v3', 'male-qn-qingse-jingpin', 1.15),
    ('v4', 'Chinese (Mandarin)_Unrestrained_Young_Man', 1.15),
    ('v5', 'Chinese (Mandarin)_Straightforward_Boy', 1.15),
]
res = []
for key, vid, sp in VOICES:
    d = None
    for _ in range(3):
        try:
            d, _w = minimax_tts.synth(text, 'zh', 'speech-2.8-hd', vid, sp, os.path.join(OUT, key + '.mp3')); break
        except Exception as e:
            print('重试', vid, e)
    res.append({'key': key, 'voice': vid, 'speed': sp, 'seconds': d}); print(key, vid, d)
json.dump(res, open(os.path.join(OUT, 'voices.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
