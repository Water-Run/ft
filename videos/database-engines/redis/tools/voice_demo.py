# 配音试听：5 个候选男声（本系列旁白一集男、一集女，Redis 一集是男声）读同一组代表句。
# 只是试听，不是全片配音；全片配音等文案经校对者确认之后再做（docs/process.md 第 4 节）。
# 代表句取自当前稿本 src/js/script.js（送去合成的读法，经 SAY 表换算）；音频写进 out/audition/voices/（不入库）。
# 用法（仓库根目录）：python -I videos/database-engines/redis/tools/voice_demo.py
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(VIDEO, '..', '..', '..'))
sys.path.insert(0, os.path.join(REPO, 'kit', 'tools'))
os.environ.setdefault('LVS_REPO', REPO)
import minimax_tts

MODEL, SPEED = 'speech-2.8-hd', 1.15
VOICES = [
    ('Chinese (Mandarin)_Male_Announcer', '播报男声'),
    ('Chinese (Mandarin)_Radio_Host', '电台男主播'),
    ('Chinese (Mandarin)_Sincere_Adult', '真诚青年'),
    ('male-qn-jingying-jingpin', '精英青年（beta）'),
    ('male-qn-daxuesheng-jingpin', '青年大学生（beta）'),
]
# 代表句：开场的钩子、一句带英文命令与数字的解释、并发一章的问答、出错一章的实验结论、终章的收束
LINES = ['o1', 'o2', 'o3', 'o5', 'o6', 'c1', 'e18', 'e20', 'f15', 'f16', 'z22', 'z23', 'z24', 'z27', 'z28']

def script_texts():
    js = ("const s=require(process.argv[1]);const ids=JSON.parse(process.argv[2]);const out=[];"
          "for(const sc of s.SCRIPT)for(const c of sc.cues)if(ids.includes(c[0]))out.push([c[0],c[1],s.ttsText(c)]);"
          "console.log(JSON.stringify(out))")
    r = subprocess.run(['node', '-e', js, os.path.join(VIDEO, 'src', 'js', 'script.js'), json.dumps(LINES)], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)

def main():
    cfg = json.load(open(os.path.join(REPO, 'kit', 'config.local.json'), encoding='utf-8'))
    bin_ = os.path.join(REPO, 'assets', 'ffmpeg', 'bin')
    os.environ.setdefault('LVS_FFPROBE', cfg.get('ffprobe') or os.path.join(bin_, 'ffprobe.exe' if os.name == 'nt' else 'ffprobe'))
    out = os.path.join(VIDEO, 'out', 'audition', 'voices'); os.makedirs(out, exist_ok=True)
    lines = script_texts()
    text = ''.join(t for _, _, t in lines)
    meta = {'model': MODEL, 'speed': SPEED, 'lines': [[i, cap] for i, cap, _ in lines], 'tts_text': text, 'voices': []}
    for vid, name in VOICES:
        slug = vid.replace('Chinese (Mandarin)_', '').replace(' ', '_')
        mp3 = os.path.join(out, slug + '.mp3')
        if not os.path.exists(mp3):
            tmp = os.path.join(out, slug + '.raw.mp3')
            minimax_tts.synth(text, 'zh', MODEL, vid, SPEED, tmp)
            os.replace(tmp, mp3)
        dur = float(subprocess.run([os.environ['LVS_FFPROBE'], '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3], capture_output=True, text=True).stdout.strip() or 0)
        chars = len([ch for ch in text if '一' <= ch <= '鿿'])
        meta['voices'].append({'id': vid, 'name': name, 'file': 'voices/' + slug + '.mp3', 'seconds': round(dur, 2), 'cjk_per_sec': round(chars / dur, 2) if dur else None})
        print(f'{vid:42} {name:12} {dur:6.2f}s')
    json.dump(meta, open(os.path.join(out, 'voices.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main()
