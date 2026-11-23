# 审片页的配音候选：10 个 MiniMax 音色读同一段代表句，写进 out/audition/voice/（不入库）。
# 用法：python -I tools/audition_voices.py <repo 根>；代表句由 node 从 src/js/script.js 取出（SAMPLE_IDS），按 SAY 表换成读法。
import json, os, subprocess, sys
REPO = os.path.abspath(sys.argv[1]); HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, 'kit', 'tools'))
import minimax_tts
SAMPLE_IDS = ['o4', 'o5', 'b4', 'b5', 'b6', 'm2', 'x4', 'x7', 'y4', 'y5', 's8', 's9']
VOICES = [  # (id, 性别, 名称)
    ('Chinese (Mandarin)_Unrestrained_Young_Man', '男', '不羁青年'),
    ('male-qn-badao-jingpin', '男', '霸道青年音色-beta'),
    ('Chinese (Mandarin)_Stubborn_Friend', '男', '嘴硬竹马'),
    ('Chinese (Mandarin)_Straightforward_Boy', '男', '率真弟弟'),
    ('junlang_nanyou', '男', '俊朗男友'),
    ('female-yujie-jingpin', '女', '御姐音色-beta'),
    ('Chinese (Mandarin)_Mature_Woman', '女', '傲娇御姐'),
    ('Chinese (Mandarin)_Warm_Bestie', '女', '温暖闺蜜'),
    ('danya_xuejie', '女', '淡雅学姐'),
    ('female-shaonv-jingpin', '女', '少女音色-beta'),
]
js = "const s=require(process.argv[1]);const ids=%s;const out=[];for(const sc of s.SCRIPT)for(const c of sc.cues)if(ids.includes(c[0]))out.push(s.ttsText(c));console.log(JSON.stringify(out))" % json.dumps(SAMPLE_IDS)
texts = json.loads(subprocess.run(['node', '-e', js, os.path.join(HERE, 'src', 'js', 'script.js')], capture_output=True, text=True, encoding='utf-8').stdout)
text = ''.join(texts)
out = os.path.join(HERE, 'out', 'audition', 'voice'); os.makedirs(out, exist_ok=True)
res = []
for i, (vid, g, name) in enumerate(VOICES, 1):
    p = os.path.join(out, 'v%02d.mp3' % i)
    try:
        d, _ = minimax_tts.synth(text, 'zh', 'speech-2.8-hd', vid, 1.0, p); ok = True
    except Exception as e:
        d, ok = None, False; print('FAIL', vid, str(e)[:120])
    res.append({'n': i, 'id': vid, 'gender': g, 'name': name, 'file': 'voice/v%02d.mp3' % i, 'd': d, 'ok': ok})
    print(i, vid, d)
json.dump({'text': text, 'voices': res}, open(os.path.join(out, 'voices.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
