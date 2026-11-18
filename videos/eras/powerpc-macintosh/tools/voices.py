"""Make the five review excerpts from o2–o4. Full-film narration uses the studio toolchain."""
import argparse
import hashlib
import json
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

VIDEO = Path(__file__).resolve().parents[1]
REPO = VIDEO.parents[2]
sys.path.insert(0, str(REPO / "kit" / "tools"))
from minimax_tts import synth

MODEL = "speech-2.8-hd"


def build(force=False):
    credits = json.loads((VIDEO / "project.json").read_text(encoding="utf8"))["credits"]
    service = next(s for s in credits["services"] if s["name"] == "MiniMax " + MODEL)
    script = """const {SCRIPT,ttsText}=require('./src/js/script');
    const selected=['o2','o3','o4'];
    process.stdout.write(JSON.stringify(selected.map(id=>ttsText(SCRIPT[0].cues.find(c=>c[0]===id))).join('')));"""
    line = json.loads(subprocess.check_output(["node", "-e", script], cwd=VIDEO, encoding="utf8"))
    root = VIDEO / "out" / "audition" / "sound"
    root.mkdir(exist_ok=True, parents=True)
    cache = VIDEO / "audio" / "audition"
    cache.mkdir(exist_ok=True, parents=True)
    ffmpeg = subprocess.check_output(["node", "-p", "require('./kit/tools/lib').ffmpegPath()"],
                                     cwd=REPO, encoding="utf8").strip()

    def sample(entry):
        slug, voice = entry["id"], entry["voice_id"]
        key = hashlib.sha256((MODEL + voice + line).encode()).hexdigest()
        dest = root / (slug + ".mp3")
        original = cache / (slug + "-" + key + ".mp3")
        if force or not original.exists():
            staged = original.with_suffix(".part.mp3")
            synth(line, "zh", MODEL, voice, 1.0, str(staged))
            staged.replace(original)
        temp = dest.with_suffix(".part.mp3")
        subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
                        "-i", str(original), "-af", "loudnorm=I=-19:TP=-2:LRA=9",
                        "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "128k", str(temp)],
                       check=True)
        temp.replace(dest)
        print(slug, voice, dest.stat().st_size, flush=True)

    with ThreadPoolExecutor(max_workers=2) as workers:
        list(workers.map(sample, service["audition_voices"]))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    build(parser.parse_args().force)
