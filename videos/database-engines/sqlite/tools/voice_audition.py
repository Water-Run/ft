# 审片页的配音候选：5 个女声（本集 PART 4，上一集 PostgreSQL 是男声）读同一段第 4 稿的代表句，语速 1.1。
# 只是试听，不是配音：全片合成要等文案确认。输出到 out/audition/voices/（不入库）。
# 用法：python videos/database-engines/sqlite/tools/voice_audition.py   （需要 MiniMax 密钥，同 kit/tools/tts.js；本机连 api.minimaxi.com 可能要 NO_PROXY）
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); VIDEO = os.path.dirname(HERE); REPO = os.path.dirname(os.path.dirname(os.path.dirname(VIDEO)))
sys.path.insert(0, os.path.join(REPO, 'kit', 'tools'))
import minimax_tts

MODEL = 'speech-2.8-hd'
# 避开近几集用过的音色（InnoDB、Firebird、配置文件格式、HTTP 等片的女声）
# 语速按第一次试合成的时长对齐到约 34 秒（约 4.4 字/秒），比的是音色而不是快慢（WaterRun 嫌 1.0 太慢）
VOICES = [
    ('Chinese (Mandarin)_Wise_Women', '知性女声', '1.1'),
    ('Chinese (Mandarin)_Mature_Woman', '成熟女声', '1.3'),
    ('Chinese (Mandarin)_Lyrical_Voice', '抒情女声', '1.32'),
    ('female-yujie-jingpin', '御姐（精品）', '1.3'),
    ('Chinese (Mandarin)_Warm_Girl', '温暖少女', '0.95'),
]
# 第 4 稿的代表句（句号 o4、s14、s22、j9、w11、e12），读法按本片 SAY 表手写
CUES = ['o4', 's14', 's22', 'j9', 'w11', 'e12']
TEXT = ('这么小的一个库，怎样把一个关系数据库装进一个文件，还不出错？'
        '只存分界和子页的页，叫内部页；存数据的，叫叶页。'
        '只在叶页存数据的树，叫B加树：S Q Lite的每张表都是这样。'
        '主文件写好，删掉日志：删掉的那一刻，就是提交。'
        'Bob再看，仍是42：他看的是自己开始时的那一版，叫快照。'
        '数据库的另一端是Click House：每一列单独存放，只读要用的那几列。')

out = os.path.join(VIDEO, 'out', 'audition', 'voices'); os.makedirs(out, exist_ok=True)
meta = []
for vid, label, SPEED in VOICES:
    fn = vid.replace('Chinese (Mandarin)_', 'zh_').replace(' ', '_') + '-' + SPEED + '.mp3'
    p = os.path.join(out, fn)
    if not os.path.exists(p):
        d, words = minimax_tts.synth(TEXT, 'zh', MODEL, vid, SPEED, p)
    else:
        d = None
    meta.append({'id': vid, 'label': label, 'speed': SPEED, 'file': 'voices/' + fn, 'd': d})
    print(vid, d, flush=True)
json.dump({'text': TEXT, 'cues': CUES, 'model': MODEL, 'voices': meta}, open(os.path.join(out, 'voices.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
