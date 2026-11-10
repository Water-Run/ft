#!/usr/bin/env python3
"""审片页的配音候选：5 个音色读同一组代表句，并量出语速，用来核对 120 秒放不放得下。

这是试听，不是全片配音；全片配音等文案确认（docs/process.md 第 4 节）。
用法：FFMPEG=<ffmpeg 路径> python tools/voice_demo.py <输出目录> [语速]
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "..", "..", "..", "kit", "tools"))
os.environ["NO_PROXY"] = os.environ.get("NO_PROXY", "") + ",api.minimaxi.com,minimaxi.com,.aliyuncs.com"
os.environ["no_proxy"] = os.environ["NO_PROXY"]
os.environ.setdefault("LVS_MINIMAX_BASE", "https://api.minimaxi.com")
import minimax_tts  # noqa: E402

FF = os.environ["FFMPEG"]
OUT = sys.argv[1]
SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 1.2
VOICES = [
    ("Chinese (Mandarin)_Unrestrained_Young_Man", "不羁青年", "男"),
    ("Chinese (Mandarin)_Warm_Bestie", "温暖闺蜜", "女"),
    ("male-qn-jingying-jingpin", "精英青年 beta", "男"),
    ("Chinese (Mandarin)_Gentle_Senior", "温柔学姐", "女"),
    ("Chinese (Mandarin)_Pure-hearted_Boy", "清澈邻家弟弟", "男"),
]
PICK = ["o1", "o2", "o3", "o4", "a3", "b2", "b4", "b5", "c2", "c3", "h1", "h3", "t4", "t6", "z1", "z2", "z3", "z4"]

js = "const s=require(process.argv[1]);const o={};for(const sc of s.SCRIPT)for(const c of sc.cues)if(c[1])o[c[0]]=s.ttsText(c);console.log(JSON.stringify(o))"
env = {**os.environ, "VLANG": "zh"}
ALL = json.loads(subprocess.run(["node", "-e", js, os.path.join(ROOT, "src", "js", "script.js")], capture_output=True, text=True, encoding="utf-8", env=env, check=True).stdout)
count = lambda t: len(re.sub(r"[，。：；、？！\s]", "", t))


def dur(path):
    r = subprocess.run([FF, "-hide_banner", "-i", path], capture_output=True, text=True, encoding="utf-8", errors="replace")
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


results = []
total_chars = sum(count(t) for t in ALL.values())
for n, (vid, name, sex) in enumerate(VOICES, 1):
    with tempfile.TemporaryDirectory() as tmp:
        parts, spoken, chars = [], 0.0, 0
        for c in PICK:
            p = os.path.join(tmp, f"{c}.mp3")
            for attempt in range(8):  # 每分钟请求数有上限，撞上就等一等再来
                try:
                    minimax_tts.synth(ALL[c], "zh", "speech-2.8-hd", vid, SPEED, p)
                    break
                except minimax_tts.ApiError as err:
                    if "rate limit" not in str(err) or attempt == 7:
                        raise
                    time.sleep(20)
            spoken += dur(p)
            chars += count(ALL[c])
            parts.append(p)
        lst = os.path.join(tmp, "list.txt")
        sil = os.path.join(tmp, "sil.mp3")
        subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=32000:cl=mono", "-t", "0.45", "-q:a", "4", sil], check=True)
        with open(lst, "w", encoding="utf-8") as f:
            for p in parts:
                f.write(f"file '{p}'\nfile '{sil}'\n")
        dst = os.path.join(OUT, f"voice-{n}.mp3")
        subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-ar", "44100", "-ac", "1", "-b:a", "128k", dst], check=True)
    rate = chars / spoken
    print(f"{n} {name} ({sex}) {vid}: {chars} 字 / {spoken:.1f} 秒 = {rate:.2f} 字/秒，全稿 {total_chars} 字约 {total_chars / rate:.0f} 秒")
    results.append({"n": n, "id": vid, "name": name, "sex": sex, "speed": SPEED, "rate": round(rate, 2), "full": round(total_chars / rate, 1)})
with open(os.path.join(OUT, "voices.json"), "w", encoding="utf-8") as f:
    json.dump({"cues": PICK, "text": {c: ALL[c] for c in PICK}, "voices": results, "chars": total_chars}, f, ensure_ascii=False, indent=1)
