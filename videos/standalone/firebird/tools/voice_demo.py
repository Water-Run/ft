# 配音候选试听：5 个音色读同一组代表句（只是试听，全片配音等文案确认）。
# 用法：python videos/standalone/firebird/tools/voice_demo.py   输出 out/audition/voice/*.mp3 与 voices.json
import json, os, sys, time, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, '..', '..', '..', 'kit', 'tools'))
import minimax_tts
TEXT = ('火狐浏览器，你多半用过。可在二零零三年，它叫 Firebird，火鸟。这个名字只用了十个月，因为它早就有主了。主人是一个数据库。'
        '启动资金二百四十三块五美元。一把椅子，两个文件柜，架上一扇门，就是办公桌。猫睡在电脑上，维修工每周上门吸一次猫毛。'
        '七月二十五号，同一天两份新闻稿。一份说，不卖了。另一份说，源码放出来了。'
        '用户名，politically。密码，correct。'
        '要省事，一个文件放进程序里，那是 S Q Lite。Firebird 两边都站。')
VOICES = [('Chinese (Mandarin)_Unrestrained_Young_Man', '不羁青年', '男'), ('Chinese (Mandarin)_Stubborn_Friend', '嘴硬竹马', '男'),
          ('male-qn-daxuesheng-jingpin', '青年大学生', '男'), ('Arrogant_Miss', '嚣张小姐', '女'), ('Chinese (Mandarin)_Warm_Bestie', '温暖闺蜜', '女')]
OUT = os.path.join(ROOT, 'out', 'audition', 'voice'); os.makedirs(OUT, exist_ok=True)
SPEED = float(os.environ.get('SPEED', '1.2')); res = []
n = sum(1 for c in TEXT if '一' <= c <= '鿿')
for i, (vid, name, sex) in enumerate(VOICES):
    p = os.path.join(OUT, f'v{i+1}.mp3')
    r = None
    for a in range(5):
        if os.path.exists(p) and i == 0 and os.path.getsize(p) > 1000: break
        try:
            r = minimax_tts.synth(TEXT, 'zh', 'speech-2.8-hd', vid, SPEED, p); break
        except Exception as e:
            print('retry', vid, str(e)[:120]); time.sleep(8)
    d = float(subprocess.run([os.environ.get('FFPROBE') or os.path.join(ROOT, '..', '..', '..', 'assets', 'ffmpeg', 'bin', 'ffprobe.exe'), '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
    res.append({'file': f'voice/v{i+1}.mp3', 'id': vid, 'name': name, 'sex': sex, 'speed': SPEED, 'sec': round(d, 1), 'cps': round(n / d, 2)})
    print(res[-1]); time.sleep(3)
json.dump({'text': TEXT, 'voices': res}, open(os.path.join(OUT, 'voices.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
