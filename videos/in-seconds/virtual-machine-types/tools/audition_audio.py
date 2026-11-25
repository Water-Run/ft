"""Render the music and the shared voice excerpt for the local review page."""
# SPDX-License-Identifier: GPL-3.0-or-later
import argparse
import asyncio
import json
import subprocess
import tempfile
import wave
from pathlib import Path

import edge_tts
import numpy as np

PROJECT = Path(__file__).resolve().parents[1]
OUT = PROJECT / "out/audition/audio"
ROOT = PROJECT.parents[2]
SR = 24000
SECONDS = 60


def encode(ffmpeg, source, dest, lufs):
    subprocess.run([
        ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", source,
        "-af", f"loudnorm=I={lufs}:TP=-2:LRA=9", "-ar", "44100",
        "-codec:a", "libmp3lame", "-q:a", "3", dest,
    ], check=True)


async def audition_voice(ffmpeg, speech, option, temp):
    target = OUT / f"voice-{option['id']}.mp3"
    raw = temp / f"{option['id']}.mp3"
    await edge_tts.Communicate(speech, option["voice"], rate="+6%").save(raw)
    encode(ffmpeg, raw, target, -18)


async def voices(ffmpeg, speech, choices, temp):
    await asyncio.gather(*(audition_voice(ffmpeg, speech, option, temp) for option in choices))


def note_hz(note):
    return 440 * 2 ** ((note - 69) / 12)


def strike(mix, start, dur, note, gain, pan=0, shape="tone"):
    begin = round(start * SR)
    samples = min(round(dur * SR), len(mix) - begin)
    t = np.arange(samples) / SR
    phase = 2 * np.pi * note_hz(note) * t
    if shape == "pad":
        envelope = np.minimum(t / 1.4, 1) * np.minimum((dur - t) / 1.7, 1)
        signal = (np.sin(phase) + .17 * np.sin(phase * 1.003) + .08 * np.sin(phase * 2)) * envelope
    elif shape == "tick":
        signal = (np.sin(phase) + .32 * np.sin(phase * 3.24)) * np.exp(-38 * t)
    else:
        signal = (np.sin(phase) + .23 * np.sin(phase * 2) + .11 * np.sin(phase * 3.01)) * np.exp(-3.8 * t / dur)
    fade = np.minimum(t / .008, 1) * np.clip((dur - t) / .035, 0, 1)
    mix[begin:begin + samples] += gain * (signal * fade)[:, None] * np.array([1 - pan, 1 + pan])


def backplane(mix):
    roots = [38, 38, 34, 36, 38, 41, 34, 36, 38, 34, 36, 38, 34, 36, 38]
    for bar, root in enumerate(roots):
        start = bar * 4
        strike(mix, start, 4.65, root - 12, .18, shape="pad")
        strike(mix, start + 1, 3.5, root + 7, .07, pan=-.15, shape="pad")
        for beat in range(4):
            strike(mix, start + beat, .42, root, .16 if beat == 0 else .10)
            if 2 <= bar < 13:
                strike(mix, start + beat + .5, .08, 88, .04, pan=.2, shape="tick")
        if 3 <= bar < 13:
            strike(mix, start + 1.5, .8, root + 24, .1, pan=-.22)
            strike(mix, start + 2.75, .8, root + 19, .08, pan=.24)


def control_room(mix):
    chords = [(38, 53, 57), (34, 53, 60), (36, 55, 62), (33, 52, 57), (38, 53, 64),
              (41, 57, 60), (34, 57, 62), (36, 55, 64), (38, 53, 62), (38, 57, 62)]
    for bar, (root, middle, high) in enumerate(chords):
        start = bar * 6
        strike(mix, start, 7.8, root - 12, .19, shape="pad")
        strike(mix, start + .25, 6.75, middle, .09, pan=-.32, shape="pad")
        strike(mix, start + 1, 5.8, high, .065, pan=.32, shape="pad")
        if 1 <= bar < 9:
            strike(mix, start + 1, 1.6, root, .12)
            strike(mix, start + 4, 1.45, root + 12, .06, pan=.1)
        if 4 <= bar < 8:
            strike(mix, start + 2.5, 2.2, high + 12, .07, pan=.3)


def single_step(mix):
    roots = [36, 36, 39, 34, 36, 36, 39, 41, 36, 39, 34, 36, 39, 34, 36]
    for bar, root in enumerate(roots):
        start = bar * 4
        strike(mix, start, 4.3, root - 12, .12, shape="pad")
        for offset in (0, 1.5, 2, 3.25):
            strike(mix, start + offset, .29, root, .19 if offset == 0 else .12)
        if 1 <= bar < 14:
            for offset, pitch in ((.25, 85), (1, 78), (1.75, 91), (2.75, 85), (3.5, 78)):
                strike(mix, start + offset, .07, pitch, .055, pan=.27, shape="tick")
        if 3 <= bar <= 12:
            for offset, interval in ((.5, 12), (1.25, 19), (2.5, 15)):
                strike(mix, start + offset, .56, root + interval, .12, pan=-.17)


# 金属机架：120 BPM，一小节 2 秒。金属感来自非谐波泛音：钢板的敲击模态、
# 808 式六个方波叠成的金属镲，以及 1:1.4 的调频钟声；底下是低频铺底。
PLATE = (1, 2.756, 5.404, 8.933, 13.34)
CYMBAL = (205.3, 304.4, 369.6, 522.7, 540.0, 800.0)


def place(mix, start, signal, gain, pan=0):
    begin = round(start * SR)
    signal = signal[:max(0, len(mix) - begin)]
    mix[begin:begin + len(signal)] += gain * signal[:, None] * np.array([1 - pan, 1 + pan])


def plate(freq, dur):
    t = np.arange(round(dur * SR)) / SR
    hit = sum(np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t * (2.2 + 3.1 * k)) / (1 + .55 * k)
              for k, ratio in enumerate(PLATE))
    return hit * np.minimum(t / .002, 1)


def cymbal(dur, bright=1.0):
    t = np.arange(round(dur * SR)) / SR
    tone = sum(np.sign(np.sin(2 * np.pi * f * 1.6 * bright * t)) for f in CYMBAL) / 6
    edge = np.diff(tone, prepend=0)          # 一阶差分代替高通，只留下刺耳的边沿
    return edge * np.exp(-t / .045) * 6


def bell(freq, dur, index=3.2, ratio=1.4):
    t = np.arange(round(dur * SR)) / SR
    depth = index * np.exp(-t * 2.4)
    tone = np.sin(2 * np.pi * freq * t + depth * np.sin(2 * np.pi * freq * ratio * t))
    return tone * np.exp(-t * 1.5) * np.minimum(t / .004, 1)


def thump(dur=.42):
    t = np.arange(round(dur * SR)) / SR
    sweep = 2 * np.pi * np.cumsum(45 + 85 * np.exp(-t * 28)) / SR
    return np.sin(sweep) * np.exp(-t * 9)


def bowed(freq, dur):
    t = np.arange(round(dur * SR)) / SR
    swell = np.sin(np.pi * t / dur) ** 2
    tone = np.sin(2 * np.pi * freq * t + (1.1 + .6 * np.sin(2 * np.pi * .23 * t)) * np.sin(2 * np.pi * freq * 2.01 * t))
    return tone * swell


def metal_rack(mix):
    bars = 30
    roots = [50, 50, 48, 46, 50, 50, 53, 48]          # D、C、B♭、F 的循环
    motif = [(0, 74), (.75, 77), (1.25, 81), (1.5, 72)]
    for bar in range(bars):
        start, root = bar * 2, roots[bar % len(roots)]
        if bar % 4 == 0:
            strike(mix, start, 8.6, root - 24, .2, shape="pad")
            strike(mix, start + .5, 7.6, root - 5, .05, pan=-.3, shape="pad")
        if 2 <= bar < 27:
            place(mix, start, plate(note_hz(root - 12), 1.8), .16 if bar % 2 == 0 else .1, pan=-.12)
        if 2 <= bar < 6:
            place(mix, start + 1, plate(note_hz(root + 12), 1.2), .05, pan=.22)
        if 6 <= bar < 26:
            for beat in (0, 1):
                place(mix, start + beat, thump(), .34)
            for eighth in range(4):
                place(mix, start + eighth * .5 + .25, cymbal(.16, 1.0 + .05 * (eighth % 2)), .03, pan=.3)
            place(mix, start + 1.5, plate(note_hz(root + 19), .5), .06, pan=.28)
        if 8 <= bar < 24 and bar % 2 == 0:
            shift = 0 if bar < 16 else (-2 if bar % 4 else 3)
            for offset, pitch in motif:
                place(mix, start + offset, bell(note_hz(pitch + shift), 1.6), .07, pan=-.2 + .13 * offset)
        if bar in (14, 18):
            place(mix, start, bowed(note_hz(root + 7), 7.5), .055, pan=.18)
    for offset, pitch in ((52, 74), (54, 69), (56, 62)):
        place(mix, offset, bell(note_hz(pitch), 3.6, index=2.4), .08)
    place(mix, 52, plate(note_hz(38), 6.0), .14)


def music(ffmpeg, temp):
    for key, score in zip("abcd", (backplane, control_room, single_step, metal_rack)):
        mix = np.zeros((SR * SECONDS, 2))
        score(mix)
        fade = np.linspace(1, 0, SR * 3)[:, None]
        mix[-len(fade):] *= fade
        raw = temp / f"music-{key}.wav"
        with wave.open(str(raw), "wb") as file:
            file.setparams((2, 2, SR, len(mix), "NONE", "not compressed"))
            file.writeframes((mix * 0.85 / np.abs(mix).max() * 32767).astype("<i2").tobytes())
        encode(ffmpeg, raw, OUT / f"music-{key}.mp3", -22)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--music-only", action="store_true")
    parser.add_argument("--voices-only", action="store_true")
    args = parser.parse_args()
    spec = json.loads(subprocess.check_output(["node", "-e", """
        const { FFMPEG } = require('./kit/tools/lib');
        const { voices, sample } = require('./videos/in-seconds/virtual-machine-types/src/design/audition');
        const layout = require('./videos/in-seconds/virtual-machine-types/src/js/script').layoutScript();
        console.log(JSON.stringify({ ffmpeg: FFMPEG(), voices, speech: sample.map(id => layout.cues[id].tts).join(' ') }));
    """], cwd=ROOT, encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as directory:
        temp = Path(directory)
        if not args.voices_only:
            music(spec["ffmpeg"], temp)
        if not args.music_only:
            asyncio.run(voices(spec["ffmpeg"], spec["speech"], spec["voices"], temp))
            (OUT / "voices.json").write_text(
                json.dumps({"clips": spec["voices"], "speech": spec["speech"]}, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            print("Voice candidates:", ", ".join(clip["voice"] for clip in spec["voices"]))


if __name__ == "__main__":
    main()
