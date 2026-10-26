# PostgreSQL 一集的男声预选（试听用）：同一段试听文字，三个 MiniMax 男声，语速对齐到 InnoDB 一集旁白的实际语速，
# 只比音色。WaterRun 2026-10-26：「配音3个男声预选」。系列一集男声、一集女声交替，本集男声。
# 用法：python voice_audition.py <输出目录>；需要 MiniMax 密钥，本机要让 api.minimaxi.com 与 .aliyuncs.com 不走代理。
import json, os, re, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'kit', 'tools'))
import minimax_tts

MODEL = 'speech-2.8-hd'
TARGET = 4.69          # InnoDB 一集旁白的实际语速（字/秒，拉丁字母按半字计），2026-10-26 由其配音缓存算出
TEXT = '一九八六年，伯克利的一个研究项目，起名 POSTGRES。四十年后，它成了开发者用得最多的数据库。同一张表，同一句 UPDATE：InnoDB 原地改掉这一行，把旧值放进 undo；PostgreSQL 不覆盖，它在页里，再写一个新版本。'
SAY = TEXT.replace('POSTGRES', 'Postgres').replace('UPDATE', 'update').replace('InnoDB', 'Inno D B').replace('PostgreSQL', 'Postgres Q L')
# 语速：MiniMax 每次合成的时长有波动，自动收敛不稳定；按 2026-10-26 实测取各自最接近 TARGET 的倍率，写死以便复现
VOICES = [
    ('Chinese (Mandarin)_Male_Announcer', '播报男声', '中年、磁性、清晰权威（旧版本集用过，当时 WaterRun 选的严肃男声）', 1.2),
    ('Chinese (Mandarin)_Reliable_Executive', '沉稳高管', '中年、沉稳可靠', 1.1),
    ('Chinese (Mandarin)_Radio_Host', '电台男主播', '青年、富有诗意、叙事流畅', 1.0),
]


def units(s):
    return len(re.findall(r'[一-鿿]', s)) + len(re.findall(r'[A-Za-z0-9]', s)) / 2.0


def main(out):
    os.makedirs(out, exist_ok=True)
    rows = []
    for vid, name, desc, speed in VOICES:
        path = os.path.join(out, 'voice_%s.mp3' % re.sub(r'[^A-Za-z]+', '_', vid).strip('_'))
        d, _ = minimax_tts.synth(SAY, 'zh', MODEL, vid, speed, path)
        rate = units(TEXT) / d
        print(name, 'speed', speed, 'dur', round(d, 2), 'rate', round(rate, 2), flush=True)
        rows.append({'voice': vid, 'name': name, 'desc': desc, 'speed': speed, 'seconds': round(d, 2), 'rate': round(rate, 2), 'file': os.path.basename(path)})
        time.sleep(4)
    json.dump({'text': TEXT, 'target_rate': TARGET, 'model': MODEL, 'voices': rows}, open(os.path.join(out, 'voices.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main(sys.argv[1])
