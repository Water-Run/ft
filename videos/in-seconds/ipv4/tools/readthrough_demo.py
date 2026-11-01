# 审稿用的全文试读：用选定的音色逐句合成、量出每句时长，按脚本的定点摆好，混成一条 100 秒的音轨。
# 不是正式配音：不写 src/js/timing.zh.js，文案确认后仍用 kit/tools/tts.js 合成全片。
# 用法：python tools/readthrough_demo.py   → out/audition/audio/readthrough-yunjian.mp3 与 out/audition/readthrough/durations.json
import asyncio
import json
import re
import shutil
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
WORK = ROOT / "out" / "audition" / "readthrough"
OUT = ROOT / "out" / "audition" / "audio" / "readthrough-yunjian.mp3"
VOICE, RATE = "zh-CN-YunjianNeural", "+6%"
FFMPEG = shutil.which("ffmpeg") or str(REPO / "assets" / "ffmpeg" / "bin" / "ffmpeg.exe")
LAYOUT = r"""
const S = require(process.argv[1]); const dur = process.argv[2] ? JSON.parse(require('fs').readFileSync(process.argv[2], 'utf8')) : null;
const DUR = {}; if (dur) for (const k in dur) DUR[k] = { d: dur[k], words: null };
const L = S.layoutScript(DUR);
const cues = L.order.filter((i) => !L.cues[i].silent).map((i) => ({ id: i, tts: L.cues[i].tts.replace(/([；，：。？])。$/, '$1'), start: L.cues[i].start }));
console.log(JSON.stringify({ cues, problems: L.problems, total: S.TOTAL, slack: L.scenes.map((s) => [s.id, s.slack]) }));
"""


def layout(durations=None):
    args = ["node", "-e", LAYOUT, str(ROOT / "src" / "js" / "script.js")]
    if durations:
        args.append(str(durations))
    return json.loads(subprocess.run(args, capture_output=True, text=True, encoding="utf-8", check=True).stdout)


def speech_len(path):
    err = subprocess.run([FFMPEG, "-hide_banner", "-i", str(path), "-af", "silencedetect=n=-45dB:d=0.12", "-f", "null", "-"], capture_output=True, text=True).stderr
    h, m, sec = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).groups()
    total = int(h) * 3600 + int(m) * 60 + float(sec)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    head = ends[0] if starts and starts[0] < 0.05 and ends else 0.0
    tail = starts[-1] if starts and (not ends or starts[-1] > ends[-1]) else total
    return round(tail - head, 3)


async def synth(cues):
    WORK.mkdir(parents=True, exist_ok=True)
    out = {}
    for c in cues:
        p = WORK / f"{c['id']}.mp3"
        await edge_tts.Communicate(c["tts"], VOICE, rate=RATE).save(str(p))
        out[c["id"]] = speech_len(p)
        print(c["id"], out[c["id"]], flush=True)
    return out


def main():
    first = layout()
    durations = asyncio.run(synth(first["cues"]))
    dfile = WORK / "durations.json"
    dfile.write_text(json.dumps(durations, ensure_ascii=False, indent=1), encoding="utf-8")
    lay = layout(dfile)
    print("problems:", lay["problems"] or "无", "slack:", lay["slack"])
    args = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error"]
    for c in lay["cues"]:
        args += ["-i", str(WORK / f"{c['id']}.mp3")]
    parts = [f"[{k}:a]silenceremove=start_periods=1:start_threshold=-45dB,aresample=48000,adelay={round(c['start'] * 1000)}:all=1[a{k}]" for k, c in enumerate(lay["cues"])]
    mix = "".join(f"[a{k}]" for k in range(len(lay["cues"]))) + f"amix=inputs={len(lay['cues'])}:normalize=0,apad=whole_dur={lay['total']},atrim=0:{lay['total']}[out]"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(args + ["-filter_complex", ";".join(parts) + ";" + mix, "-map", "[out]", "-ac", "2", "-b:a", "160k", str(OUT)], check=True)
    print("已生成", OUT)


if __name__ == "__main__":
    main()
