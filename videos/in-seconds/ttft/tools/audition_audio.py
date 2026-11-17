"""Generate short voice comparisons and three synthesized music sketches in out/."""
import asyncio
import math
import pathlib
import wave

import edge_tts
import numpy as np

OUT = pathlib.Path(__file__).resolve().parents[1] / 'out' / 'audition'
OUT.mkdir(parents=True, exist_ok=True)
VOICES = ['zh-CN-XiaoxiaoNeural', 'zh-CN-XiaoyiNeural', 'zh-CN-YunjianNeural',
          'zh-CN-YunxiNeural', 'zh-CN-YunxiaNeural']
SAMPLE = '消息发出去了，为什么回答迟迟不出现？请求先经过网络，到达服务端。如果服务正忙，还可能需要排队。'


async def voice(name):
    try:
        await edge_tts.Communicate(SAMPLE, name, rate='+6%').save(str(OUT / (name + '.mp3')))
        print('voice ok', name)
    except Exception as exc:
        print('voice failed', name, type(exc).__name__, str(exc)[:200])


def music(index, bpm, notes):
    sr = 22050
    duration = 60
    t = np.arange(sr * duration) / sr
    y = np.zeros_like(t)
    beat = 60 / bpm
    for n in range(int(duration / beat)):
        start = int(n * beat * sr)
        length = min(int(beat * sr * 1.6), len(t) - start)
        if length <= 0:
            continue
        x = np.arange(length) / sr
        hz = 440 * 2 ** ((notes[n % len(notes)] - 69) / 12)
        decay = np.exp(-x * (3.2 if index == 1 else 2.0))
        env = np.minimum(x * 25, 1) * decay
        wavelet = np.sin(2 * math.pi * hz * x)
        if index == 2:
            wavelet += .25 * np.sin(2 * math.pi * hz * 2 * x)
        if index == 3:
            wavelet += .18 * np.sin(2 * math.pi * hz * 1.5 * x)
        level = .08 if n * beat < 8 else .13 if n * beat < 42 else .09
        y[start:start + length] += level * env * wavelet
    fade = np.minimum(1, np.minimum(t / 2, (duration - t) / 3))
    pcm = (np.clip(y * fade, -.9, .9) * 32767).astype('<i2')
    with wave.open(str(OUT / f'music-{index}.wav'), 'wb') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sr)
        f.writeframes(pcm.tobytes())


async def main():
    await asyncio.gather(*(voice(name) for name in VOICES))
    music(1, 100, [60, 67, 64, 67, 62, 69, 65, 69])
    music(2, 120, [57, 64, 67, 64, 60, 67, 71, 67])
    music(3, 80, [55, 62, 67, 71, 57, 64, 69, 72])


if __name__ == '__main__':
    asyncio.run(main())
