# 审片页的配音候选：女声（本集 PART 4，上一集 PostgreSQL 是男声）读同一段第 4 稿的代表句，各自对齐语速。
# 只是试听，不是配音：全片合成要等文案确认。输出到 out/audition/voices/（不入库）。
# 用法：python videos/database-engines/sqlite/tools/voice_audition.py   （需要 MiniMax 密钥，同 kit/tools/tts.js；本机连 api.minimaxi.com 可能要 NO_PROXY）
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); VIDEO = os.path.dirname(HERE); REPO = os.path.dirname(os.path.dirname(os.path.dirname(VIDEO)))
sys.path.insert(0, os.path.join(REPO, 'kit', 'tools'))
import minimax_tts

MODEL = 'speech-2.8-hd'
# 候选：MiniMax 系统音色里全部普通话女声，只去掉本系列前三期用过的女声——InnoDB 的 female-chengshu-jingpin（MyISAM、PostgreSQL 是男声）。
# WaterRun 2026-11-01：「配音只需要不和前三期重复的女声即可, 给我候选, 都要MiniMax的」。男女按 get_voice 的名字与描述认定。
# 语速按 1.2 试合成的时长对齐到约 34.5 秒（约 4.4 字/秒），比的是音色而不是快慢；有的音色语速与时长不成比例，按实测再合成一次
VOICES = [   # (音色, get_voice 里的名字, 语速, 批次)。批次只记合成的先后
    ('Chinese (Mandarin)_Wise_Women', '阅历姐姐', '1.1', 1),
    ('Chinese (Mandarin)_Mature_Woman', '傲娇御姐', '1.3', 1),
    ('Chinese (Mandarin)_Lyrical_Voice', '抒情男声（第一批误列，不上审片页）', '1.32', 1),
    ('female-yujie-jingpin', '御姐音色-beta', '1.3', 1),
    ('Chinese (Mandarin)_Warm_Girl', '温暖少女', '0.95', 1),
    ('Chinese (Mandarin)_Gentle_Senior', '温柔学姐', '0.9', 2),
    ('Chinese (Mandarin)_Warm_Bestie', '温暖闺蜜', '0.95', 2),
    ('female-tianmei-jingpin', '甜美女性音色-beta', '1.1', 2),
    ('female-shaonv-jingpin', '少女音色-beta', '0.95', 2),
    ('Chinese (Mandarin)_News_Anchor', '新闻女声', '1.0', 2),
    ('female-shaonv', '少女音色', '0.95', 3),
    ('female-yujie', '御姐音色', '1.25', 3),
    ('female-chengshu', '成熟女性音色', '1.05', 3),
    ('female-tianmei', '甜美女性音色', '1.05', 3),
    ('lovely_girl', '萌萌女童', '1.7', 3),
    ('tianxin_xiaoling', '甜心小玲', '1', 3),
    ('qiaopi_mengmei', '俏皮萌妹', '1.15', 3),
    ('wumei_yujie', '妩媚御姐', '1', 3),
    ('diadia_xuemei', '嗲嗲学妹', '1.1', 3),
    ('danya_xuejie', '淡雅学姐', '1.05', 3),
    ('Arrogant_Miss', '嚣张小姐', '1', 3),
    ('Chinese (Mandarin)_Kind-hearted_Antie', '热心大婶', '1.15', 3),
    ('Chinese (Mandarin)_HK_Flight_Attendant', '港普空姐', '1.15', 3),
    ('Chinese (Mandarin)_Sweet_Lady', '甜美女声', '1.05', 3),
    ('Chinese (Mandarin)_Kind-hearted_Elder', '花甲奶奶', '1.3', 3),
    ('Chinese (Mandarin)_Crisp_Girl', '清脆少女', '1.15', 3),
    ('Chinese (Mandarin)_Soft_Girl', '软软女孩', '1.15', 3),
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
for vid, label, SPEED, batch in VOICES:
    fn = vid.replace('Chinese (Mandarin)_', 'zh_').replace(' ', '_') + '-' + SPEED + '.mp3'
    p = os.path.join(out, fn)
    if not os.path.exists(p):
        d, words = minimax_tts.synth(TEXT, 'zh', MODEL, vid, SPEED, p)
    else:   # 已合成过：量文件时长
        import subprocess
        FP = os.path.join(REPO, 'assets', 'ffmpeg', 'bin', 'ffprobe.exe')
        d = float(subprocess.run([FP, '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout.strip() or 0)
    meta.append({'id': vid, 'label': label, 'speed': SPEED, 'file': 'voices/' + fn, 'd': d, 'batch': batch, 'male': 'Lyrical_Voice' in vid})
    print(vid, d, flush=True)
json.dump({'text': TEXT, 'cues': CUES, 'model': MODEL, 'voices': meta}, open(os.path.join(out, 'voices.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
