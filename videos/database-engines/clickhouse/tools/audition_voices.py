# 审片页的配音候选：5 个男声（本系列一集男声、一集女声交替，上一集 SQLite 是女声），读同一段代表句。
# 先用语速 1.0 合成，量出每秒字数，再把语速调到同一个目标（每秒约 TARGET 字）重合成，好比较音色本身。
# 只是试听，不是全片配音（文案确认之前不配全片）。输出到本片 out/audition/（不入库）。
# 用法：python videos/database-engines/clickhouse/tools/audition_voices.py
import json, os, re, sys
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
os.makedirs(OUT, exist_ok=True)
MODEL = 'speech-2.8-hd'
TARGET = 4.9   # 每秒字数（不计标点），本系列前几集成片的语速大致在这一带
TEXT = ('一亿个用户，平均年龄是多少？一条查询，一个数字，零点零零七秒。'
        '这七毫秒里，ClickHouse 从磁盘上读了什么？'
        '名字里有一棵树，可这一集，不会出现一棵 B 树。'
        '它的思路来自一九九六年的 LSM 树：先把写入攒成一段段排好序的数据，再在后台合并。'
        'Alice 是二〇五〇号。二〇五〇比一大、比八一九三小，二分一下，她在第零个颗粒里。')
VOICES = [
    ('presenter_male', '男性主持人'),
    ('male-qn-jingying-jingpin', '精英青年-beta'),
    ('audiobook_male_2', '男性有声书 2'),
    ('Chinese (Mandarin)_Unrestrained_Young_Man', '不羁青年'),
    ('Chinese (Mandarin)_Gentle_Youth', '温润青年'),
]
chars = len(re.sub(r'[，。？：、\s]', '', TEXT))
result = []
for vid, label in VOICES:
    safe = re.sub(r'[^A-Za-z0-9_-]+', '_', vid)
    probe = os.path.join(OUT, f'probe-{safe}.mp3')
    try:
        mm.synth(TEXT, 'zh', MODEL, vid, 1.0, probe)
    except Exception as e:
        print('不可用', vid, e); result.append({'id': vid, 'label': label, 'error': str(e)}); continue
    d1 = mm.probe_seconds(probe)
    speed = round(min(1.35, max(0.9, (chars / d1) and TARGET / (chars / d1))), 2)
    final = os.path.join(OUT, f'voice-{safe}.mp3')
    mm.synth(TEXT, 'zh', MODEL, vid, speed, final)
    d2 = mm.probe_seconds(final)
    os.remove(probe)
    print(f'{vid}: 1.0 → {chars / d1:.2f} 字/秒；语速 {speed} → {d2:.1f} 秒，{chars / d2:.2f} 字/秒')
    result.append({'id': vid, 'label': label, 'file': os.path.basename(final), 'speed': speed, 'seconds': round(d2, 1), 'rate': round(chars / d2, 2)})
json.dump({'model': MODEL, 'text': TEXT, 'chars': chars, 'target': TARGET, 'voices': result},
          open(os.path.join(OUT, 'voices.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
