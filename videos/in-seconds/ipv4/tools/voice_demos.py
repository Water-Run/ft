import asyncio
import json
import os
from pathlib import Path
import shutil
import subprocess

import edge_tts

# 2026-11-01：换成新稿的开头（o1–o3）与结尾（e1–e5），试新加的年份、阿帕网、IPv6 读法
TEXT = "一九八一年，I P V 四的规范发布；一九八三年元旦，阿帕网全部改用它。今天，数据怎样靠它找到正确的设备？共用，是因为三十二位只能排出约四十三亿个地址。私有地址和地址转换，都是九十年代为省地址想的办法。二〇一一年，全球总地址池见了底。接班的 I P V 六，把地址加长到一百二十八位；找路的办法没变：地址、前缀、下一站。"
RATE = "+6%"
VOICES = [
    ("zh-CN-XiaoxiaoNeural", "晓晓（温暖女声）"),
    ("zh-CN-XiaoyiNeural", "晓伊（活泼女声）"),
    ("zh-CN-YunjianNeural", "云健（有力男声）"),
    ("zh-CN-YunxiNeural", "云希（明快男声）"),
    ("zh-CN-YunyangNeural", "云扬（稳健男声）"),
]
ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
OUT = ROOT / "out" / "audition"
AUDIO = OUT / "audio"


def ffprobe_path():
    return os.environ.get("FFPROBE") or shutil.which("ffprobe") or str(REPO / "assets" / "ffmpeg" / "bin" / "ffprobe.exe")


def probe(path):
    result = subprocess.run(
        [
            ffprobe_path(),
            "-v",
            "error",
            "-show_entries",
            "format=duration:stream=codec_name,codec_type",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
        timeout=30,
    )
    info = json.loads(result.stdout)
    streams = [s for s in info.get("streams", []) if s.get("codec_type") == "audio"]
    if path.stat().st_size <= 0 or not streams or streams[0].get("codec_name") != "mp3":
        raise RuntimeError(f"Invalid MP3 output: {path}")
    duration = float(info["format"]["duration"])
    if duration <= 0:
        raise RuntimeError(f"Empty audio duration: {path}")
    return duration, streams[0]["codec_name"]


async def main():
    available = {v["ShortName"] for v in await edge_tts.list_voices()}
    missing = [voice for voice, _ in VOICES if voice not in available]
    if missing:
        raise RuntimeError("Unavailable Edge voices: " + ", ".join(missing))
    AUDIO.mkdir(parents=True, exist_ok=True)
    manifest = []
    for index, (voice, display_name) in enumerate(VOICES, 1):
        filename = f"voice-{index:02d}.mp3"
        path = AUDIO / filename
        await edge_tts.Communicate(TEXT, voice, rate=RATE).save(str(path))
        duration, codec = probe(path)
        manifest.append(
            {
                "index": index,
                "engine": "edge-tts",
                "voice_id": voice,
                "display_name": display_name,
                "file": f"audio/{filename}",
                "duration_seconds": round(duration, 3),
                "rate": RATE,
                "codec": codec,
            }
        )
        print(f"{index}/5 {voice}: {duration:.3f}s, {codec}, {path.stat().st_size} bytes", flush=True)
    (OUT / "voice-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    asyncio.run(main())
