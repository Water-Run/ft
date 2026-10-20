"""配乐脚本的离线自检：不连数据库，只用脚本排出的场景与句号合成一段，
检查是否有异常、峰值是否合理、各分轨电平是否非零。

用法：python 10_music_smoke.py <music.py 路径> <输出 json 路径>
"""

import importlib.util
import json
import os
import sys

import numpy as np

# 与 src/js/script.js 的场景与句号一致（估算时长，够用来试跑）
SCENES = [
    ("open", 0.9, 25.8), ("history", 3.2, 35.4), ("engine", 3.4, 54.5),
    ("modes", 3.4, 40.7), ("store", 3.2, 41.0), ("update", 3.2, 36.1),
    ("concur", 3.2, 46.1), ("durable", 3.2, 29.3), ("outro", 3.2, 31.9),
    ("next", 2.8, 21.5), ("credits", 0.4, 13.6),
]


def main():
    music_path, out_path = sys.argv[1], sys.argv[2]
    spec = importlib.util.spec_from_file_location("music", music_path)
    music = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(music)

    sr = 48000
    scenes, t = [], 0.0
    for sid, lead, dur in SCENES:
        scenes.append({"id": sid, "start": t, "end": t + dur})
        t += dur
    total = t

    cues = []
    for s in scenes:
        cues.append({"id": s["id"] + "-x", "start": s["start"], "end": s["end"]})

    ctx = {"sr": sr, "n": int(total * sr), "total": total, "scenes": scenes,
           "cues": cues, "audio": {"score": {"lift_cue": "outro-x"}}}

    out = music.compose(ctx)
    out = np.asarray(out)
    peak = float(np.abs(out).max())
    rms = float(np.sqrt(np.mean(out ** 2)))
    print("shape       :", out.shape)
    print("total sec   : %.1f" % total)
    print("peak        : %.4f" % peak)
    print("rms         : %.5f" % rms)
    print("stems       :")
    for k, v in (ctx.get("stems") or {}).items():
        print("   %-8s %.6f" % (k, v))

    # 分段能量：确认每一章都有内容（不能有整章无声）
    print("per-scene rms:")
    for s in scenes:
        i0, i1 = int(s["start"] * sr), int(s["end"] * sr)
        seg = out[:, i0:i1]
        r = float(np.sqrt(np.mean(seg ** 2))) if seg.size else 0.0
        print("   %-9s %.5f" % (s["id"], r))

    result = {"shape": list(out.shape), "total": total, "peak": peak, "rms": rms,
              "stems": ctx.get("stems")}
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)
    print("wrote " + out_path)


if __name__ == "__main__":
    main()
