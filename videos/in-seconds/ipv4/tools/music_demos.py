from pathlib import Path
import json
import wave

import numpy as np


SR = 48000
BPM = 120
BEAT = 60.0 / BPM
BARS = 30
DURATION = BARS * 4 * BEAT
PEAK = 0.72
OUTPUT = Path(__file__).resolve().parents[1] / "out" / "audition"


def midi(note):
    return 440.0 * 2.0 ** ((note - 69) / 12.0)


def place(mix, sound, start, gain=1.0, pan=0.0):
    offset = int(round(start * SR))
    if offset >= mix.shape[1]:
        return
    sound = np.asarray(sound)
    count = min(sound.shape[-1], mix.shape[1] - offset)
    if count <= 0:
        return
    if sound.ndim == 1:
        angle = (pan + 1.0) * np.pi / 4.0
        mix[0, offset:offset + count] += sound[:count] * gain * np.cos(angle)
        mix[1, offset:offset + count] += sound[:count] * gain * np.sin(angle)
    else:
        mix[:, offset:offset + count] += sound[:, :count] * gain


def pad_envelope(t, duration, attack=0.8, release=1.2):
    env = np.ones_like(t)
    attack_n = min(int(attack * SR), len(t))
    release_n = min(int(release * SR), len(t) // 2)
    if attack_n:
        env[:attack_n] = np.linspace(0.0, 1.0, attack_n, endpoint=False)
    if release_n:
        env[-release_n:] *= np.linspace(1.0, 0.0, release_n)
    return env


def pluck_envelope(t, duration, decay=3.8):
    env = (1.0 - np.exp(-t / 0.006)) * np.exp(-decay * t / duration)
    release_n = min(int(0.045 * SR), len(t) // 3)
    if release_n:
        env[-release_n:] *= np.linspace(1.0, 0.0, release_n)
    return env


def pad_voice(note, duration, width=0.003, brightness=0.25, wow=0.0, phase=0.0):
    t = np.arange(int(duration * SR)) / SR
    freq = midi(note)
    channels = []
    for channel, detune in enumerate((-width, width)):
        f = freq * 2.0 ** (detune / 12.0)
        wobble = wow * np.sin(2.0 * np.pi * (0.53 + channel * 0.07) * t + phase)
        angle = 2.0 * np.pi * f * t + wobble
        tone = np.sin(angle) + brightness * (2.0 / np.pi) * np.arcsin(np.sin(angle))
        tone += 0.10 * np.sin(2.0 * angle + 0.3)
        channels.append(tone * pad_envelope(t, duration) * 0.24)
    return np.vstack(channels)


def triangle(note, duration, decay=3.0):
    t = np.arange(int(duration * SR)) / SR
    angle = 2.0 * np.pi * midi(note) * t
    tone = np.sin(angle) + 0.32 * (2.0 / np.pi) * np.arcsin(np.sin(angle))
    return tone * pluck_envelope(t, duration, decay) * 0.48


def bandlimited_square(note, duration, cutoff=5800.0):
    t = np.arange(int(duration * SR)) / SR
    freq = midi(note)
    harmonics = min(24, max(1, int(cutoff / freq)))
    angle = 2.0 * np.pi * freq * t
    tone = np.zeros_like(t)
    for harmonic in range(1, harmonics + 1, 2):
        tone += np.sin(harmonic * angle) / harmonic
    tone *= 4.0 / np.pi
    return tone * pluck_envelope(t, duration, 5.0) * 0.22


def soft_kick(duration=0.32, level=0.55):
    t = np.arange(int(duration * SR)) / SR
    freq = 43.0 + 48.0 * np.exp(-t * 24.0)
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    env = (1.0 - np.exp(-t / 0.003)) * np.exp(-t * 13.0)
    return np.sin(phase) * env * level


def relay(rng, duration=0.075, bright=0.65):
    t = np.arange(int(duration * SR)) / SR
    noise = rng.standard_normal(len(t))
    low = np.convolve(noise, np.ones(7) / 7.0, mode="same")
    noise = noise - low
    click = np.sin(2.0 * np.pi * 1550.0 * t) * np.exp(-t * 75.0)
    body = np.sin(2.0 * np.pi * 170.0 * t) * np.exp(-t * 38.0)
    env = (1.0 - np.exp(-t / 0.001)) * np.exp(-t * 42.0)
    return (bright * noise * env + 0.45 * click + 0.32 * body) * 0.22


def tape_clack(rng):
    t = np.arange(int(0.19 * SR)) / SR
    noise = rng.standard_normal(len(t))
    smooth = np.convolve(noise, np.ones(11) / 11.0, mode="same")
    mechanism = np.sin(2.0 * np.pi * (92.0 * t + 130.0 * t * t))
    env = (1.0 - np.exp(-t / 0.002)) * np.exp(-t * 24.0)
    return (0.48 * mechanism + 0.7 * smooth) * env * 0.42


def section_level(bar):
    if bar < 6:
        return 0.52 + bar * 0.045
    if bar < 18:
        return 0.78 + (bar - 6) * 0.012
    if bar < 24:
        return 1.0
    return max(0.38, 0.9 - (bar - 24) * 0.10)


def compose_tape_drive(rng):
    mix = np.zeros((2, int(DURATION * SR)))
    chords = [
        [50, 53, 57, 60, 64],
        [46, 53, 57, 62, 65],
        [41, 48, 53, 55, 57],
        [48, 52, 55, 57, 62],
    ]
    roots = [38, 34, 41, 36]
    arp_pattern = [0, 2, 4, 1, 3, 2, 4, 1]
    steps = [0.0, 1.5, 2.0, 3.0, 3.5]
    for bar in range(BARS):
        start = bar * 4 * BEAT
        level = section_level(bar)
        chord_index = 0 if bar >= 28 else (bar // 2) % len(chords)
        chord = chords[chord_index]
        if bar % 2 == 0:
            for index, note in enumerate(chord):
                voice = pad_voice(note, 4.15, width=0.0018, brightness=0.20,
                                  wow=0.024, phase=index * 0.7)
                place(mix, voice, start, gain=0.30 * level)
        if 2 <= bar < 28:
            beats = [0.0, 2.0] if bar < 6 or bar >= 24 else [0.0, 1.0, 2.0, 3.0]
            for beat in beats:
                place(mix, triangle(roots[chord_index], 0.43, 4.5), start + beat * BEAT,
                      gain=0.50 * level)
        if 4 <= bar < 28:
            positions = steps + [1.0, 2.5] if 18 <= bar < 24 else steps
            for index, beat in enumerate(sorted(positions)):
                note = chord[arp_pattern[(bar + index) % len(arp_pattern)] % len(chord)] + 12
                pan = (-0.28, 0.22)[(bar + index) % 2]
                place(mix, triangle(note, 0.31, 5.0), start + beat * BEAT,
                      gain=0.22 * level, pan=pan)
        if 6 <= bar < 28:
            accents = [0.0, 2.0] + ([3.5] if 18 <= bar < 24 else [])
            for index, beat in enumerate(accents):
                place(mix, tape_clack(rng), start + beat * BEAT,
                      gain=(0.34 if beat == 0.0 else 0.22) * level,
                      pan=(-0.18, 0.24)[index % 2])
    place(mix, triangle(38, 2.8, 1.8), 28 * 4 * BEAT, gain=0.38)
    return np.tanh(mix * 1.18) / np.tanh(1.18)


def compose_crt_terminal(rng):
    mix = np.zeros((2, int(DURATION * SR)))
    chords = [
        [40, 47, 50, 54, 59],
        [36, 43, 47, 50, 52],
        [45, 48, 52, 55, 59],
        [35, 42, 45, 47, 50],
    ]
    roots = [28, 24, 33, 35]
    motif = [4, 2, 3, 1, 2, 0, 3, 1]
    data_steps = [0.0, 1.0, 1.5, 2.5, 3.5]
    for bar in range(BARS):
        start = bar * 4 * BEAT
        level = section_level(bar)
        chord_index = 0 if bar >= 28 else (bar // 2) % len(chords)
        chord = chords[chord_index]
        if bar % 2 == 0:
            for index, note in enumerate(chord[1:]):
                voice = pad_voice(note, 4.05, width=0.0007, brightness=0.10,
                                  phase=index * 0.9)
                place(mix, voice, start, gain=0.18 * level)
        if 2 <= bar < 28:
            positions = data_steps if bar >= 6 else [0.0, 2.5]
            if 18 <= bar < 24:
                positions = data_steps + [2.0, 3.0]
            for index, beat in enumerate(sorted(positions)):
                note = chord[motif[(2 * bar + index) % len(motif)] % len(chord)] + 24
                sound = bandlimited_square(note, 0.19 if index % 2 else 0.26)
                pan = (-0.38, 0.32)[(bar + index) % 2]
                place(mix, sound, start + beat * BEAT, gain=0.42 * level, pan=pan)
                if 18 <= bar < 24 and index % 3 == 0:
                    place(mix, sound, start + beat * BEAT + 0.25,
                          gain=0.08 * level, pan=-pan)
        if 4 <= bar < 28:
            beats = [0.0, 2.0] if bar < 18 else [0.0, 1.5, 2.0, 3.5]
            for beat in beats:
                place(mix, triangle(roots[chord_index] + 12, 0.30, 5.5),
                      start + beat * BEAT, gain=0.38 * level)
        if 6 <= bar < 28:
            for index, beat in enumerate([0.0, 1.5, 2.5]):
                place(mix, relay(rng), start + beat * BEAT,
                      gain=0.27 * level, pan=(-0.45, 0.40, -0.10)[index])
            for beat in np.arange(0.0, 4.0, 0.5):
                pulse = bandlimited_square(chord[0] + 36, 0.055, cutoff=4200.0)
                place(mix, pulse, start + float(beat) * BEAT,
                      gain=(0.075 if bar < 18 else 0.105) * level, pan=0.12)
    place(mix, bandlimited_square(76, 0.65), 28 * 4 * BEAT, gain=0.20, pan=-0.15)
    return mix


def compose_night_line(rng):
    mix = np.zeros((2, int(DURATION * SR)))
    chords = [
        [47, 54, 57, 59, 61],
        [43, 50, 54, 57, 59],
        [40, 47, 50, 54, 55],
        [45, 52, 55, 57, 59],
        [42, 49, 52, 54, 57],
    ]
    roots = [35, 31, 28, 33, 30]
    for bar in range(BARS):
        start = bar * 4 * BEAT
        level = section_level(bar)
        chord_index = 0 if bar >= 28 else (bar // 2) % len(chords)
        chord = chords[chord_index]
        if bar % 2 == 0:
            for index, note in enumerate(chord):
                voice = pad_voice(note, 4.35, width=0.006, brightness=0.30,
                                  wow=0.005, phase=index * 0.55)
                place(mix, voice, start, gain=0.34 * level)
        if 4 <= bar < 28:
            place(mix, triangle(roots[chord_index] + 12, 1.25, 2.2), start,
                  gain=0.46 * level, pan=-0.08)
            place(mix, triangle(chord[1] - 12, 0.72, 3.2), start + 2.5 * BEAT,
                  gain=0.28 * level, pan=0.08)
        if 6 <= bar < 26:
            for beat in ([0.0, 2.0] if bar < 18 else [0.0, 2.0, 3.5]):
                place(mix, soft_kick(level=0.42), start + beat * BEAT,
                      gain=0.38 * level)
            for beat in ([2.0] if bar < 18 else [1.0, 2.0, 3.0]):
                place(mix, relay(rng, duration=0.12, bright=0.25),
                      start + beat * BEAT, gain=0.12 * level, pan=0.25)
        if 8 <= bar < 28 and bar % 2 == 0:
            for index, note in enumerate((chord[2] + 12, chord[4] + 12)):
                place(mix, triangle(note, 1.15, 2.0), start + (3.0 + index * 0.5) * BEAT,
                      gain=0.13 * level, pan=(-0.5, 0.5)[index])
    place(mix, triangle(35, 3.1, 1.4), 28 * 4 * BEAT, gain=0.32)
    return mix


def write_wav(path, audio):
    if audio.shape != (2, int(DURATION * SR)):
        raise ValueError(f"unexpected audio shape: {audio.shape}")
    if not np.isfinite(audio).all():
        raise ValueError(f"non-finite samples in {path.name}")
    audio = audio - np.mean(audio, axis=1, keepdims=True)
    fade_in = int(0.8 * SR)
    fade_out = int(2.5 * SR)
    audio[:, :fade_in] *= np.linspace(0.0, 1.0, fade_in)
    audio[:, -fade_out:] *= np.linspace(1.0, 0.0, fade_out)
    peak = float(np.max(np.abs(audio)))
    if peak <= 0.0:
        raise ValueError(f"silent render: {path.name}")
    audio *= PEAK / peak
    pcm = np.round(audio.T * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SR)
        wav.writeframes(pcm.tobytes())
    rms = float(np.sqrt(np.mean(audio * audio)))
    return peak, rms


def main():
    audio_dir = OUTPUT / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    demos = [
        {
            "id": "tape-drive",
            "name": "卡带驱动",
            "file": "audio/music-tape-drive.wav",
            "seed": 910194,
            "compose": compose_tape_drive,
            "design": "D 多利亚色彩的磁带回转和声，低频脉动与克制琶音沿八分音符推进；机械落点在最密段增加一层，末段回到长音与磁带底纹。",
        },
        {
            "id": "crt-terminal",
            "name": "CRT 终端",
            "file": "audio/music-crt-terminal.wav",
            "seed": 910227,
            "compose": compose_crt_terminal,
            "design": "E 小调开放音程承载限带方波数据动机，非均匀终端短句与三点继电节奏互相错位；同步脉冲只作细底层，收束时撤去节奏。",
        },
        {
            "id": "night-line",
            "name": "夜间线路",
            "file": "audio/music-night-line.wav",
            "seed": 910260,
            "compose": compose_night_line,
            "design": "B 小调九和弦宽铺底按五组和声缓慢循环，低音以长音和应答音构成半速动机；收着的半速节拍与远处双音信号在结尾逐步退场。",
        },
    ]
    manifest = []
    for demo in demos:
        audio = demo["compose"](np.random.default_rng(demo["seed"]))
        source_peak, rms = write_wav(OUTPUT / demo["file"], audio)
        manifest.append({
            "id": demo["id"],
            "name": demo["name"],
            "file": demo["file"],
            "duration": DURATION,
            "design": demo["design"],
        })
        print(f"{demo['id']}: {DURATION:.1f}s, pre-normalization peak={source_peak:.6f}, "
              f"output peak={PEAK:.6f}, RMS={rms:.6f}")
    with (OUTPUT / "music-manifest.json").open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(manifest, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


if __name__ == "__main__":
    main()
