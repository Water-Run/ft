"""Three original, one-minute listening sketches for the PowerPC Macintosh review."""
import math
import subprocess
import numpy as np
from pathlib import Path

VIDEO = Path(__file__).resolve().parents[1]
SR = 32000
LENGTH = 60
TAU = 2 * math.pi
# Each sketch has its own meter, harmonic plan and melodic shape.
SCORES = {
    "m1": (84, 4, [[50,57,61,64], [47,54,57,62], [43,50,57,59], [45,52,55,59]]),
    "m2": (96, 3, [[53,60,64,67], [50,57,60,64], [46,53,57,60], [48,55,58,62]]),
    "m3": (70, 4, [[45,52,55,59], [41,48,52,55], [43,50,55,57], [40,47,52,55]]),
}


def render(key):
    bpm, meter, chords = SCORES[key]
    beat = 60 / bpm
    audio = np.zeros((SR * LENGTH, 2))
    rng = np.random.default_rng(601)
    def note(at, pitch, duration, gain, sound, pan=0):
        offset = int(at * SR)
        n = min(int(duration * SR), len(audio) - offset)
        if n < 2:
            return
        t = np.arange(n) / SR
        phase = TAU * (440 * 2 ** ((pitch - 69) / 12)) * t
        if sound == "felt":
            y = (np.sin(phase) + .26*np.sin(2*phase) + .12*np.sin(3.003*phase)) * np.exp(-2.9*t)
            attack = .009
        elif sound == "glass":
            y = np.sin(phase + .75*np.exp(-6*t)*np.sin(3*phase)) * np.exp(-2.25*t)
            attack = .006
        elif sound == "brush":
            y = rng.standard_normal(n) * np.exp(-38*t) * .22
            attack = .018
        elif sound == "strings":
            y = (np.sin(phase) + .35*np.sin(phase*1.003) + .22*np.sin(phase*2)) / 1.57
            attack = .70
        else:
            y = (np.sin(phase) + .16*np.sin(2*phase)) * np.exp(-1.4*t)
            attack = .035
        y *= np.minimum(1, t/attack) * np.minimum(1, (duration-t)/min(.42,duration/3)) * gain
        audio[offset:offset+n,0] += y * math.sqrt((1-pan)/2)
        audio[offset:offset+n,1] += y * math.sqrt((1+pan)/2)

    for bar in range(math.ceil(LENGTH/(meter*beat))):
        start = bar*meter*beat
        chord = chords[(bar//2)%len(chords)]
        middle = 12 < start < 47
        if key == "m1":
            # Two quiet felt-key gestures answer each other across the stereo field.
            for i in [0,1,3]:
                note(start+i*.047, chord[i], beat*3.6, .21, "felt", -.25+i*.12)
            for pos,i in [(1.5,2),(2.75,1)] if middle else [(2.5,2)]:
                note(start+pos*beat, chord[i]+12, beat*1.8,.18,"felt",.3)
            if middle:
                note(start, chord[0]-12, 2*beat,.17,"bass",-.1)
        elif key == "m2":
            # A lilting three-beat phrase, with an off-beat glass answer in the middle.
            note(start,chord[0]-12,beat*2.7,.25,"bass")
            for pos,i in [(0,1),(1,3),(2.5,2)]:
                note(start+pos*beat,chord[i]+12,1.3,.19,"glass",(i-2)*.38)
            if middle:
                note(start+1.5*beat,chord[1],.9,.15,"felt",-.3)
                note(start+2*beat,72,.19,.13,"brush",.45)
        else:
            # Low sustaining voices give way to isolated high notes in the last phrase.
            for i in [0,1,2]:
                note(start+i*.14, chord[i], beat*meter*.98,.11,"strings",(i-1)*.46)
            if bar%2 == 0 or middle:
                note(start+beat,chord[3]+12,beat*2.7,.26,"felt",.18)
            if middle and bar%2:
                note(start+2.5*beat,chord[2]+12,1.8,.13,"glass",-.38)
    # A short, original stereo room tail. Leave a full resolution at the end.
    delay = int(.147*SR)
    audio[delay:] += .11*audio[:-delay,::-1]
    t = np.arange(len(audio))/SR
    audio *= (np.minimum(1,t/1.3)*np.minimum(1,(LENGTH-t)/4.2))[:,None]
    return (audio * (.76/max(abs(audio).max(),1e-8))).astype("<f4")


if __name__ == "__main__":
    root = VIDEO / "out/audition/sound"
    root.mkdir(parents=True,exist_ok=True)
    ffmpeg = subprocess.check_output(["node","-p","require('./kit/tools/lib').ffmpegPath()"],
                                     cwd=VIDEO.parents[2],encoding="utf8").strip()
    for key in SCORES:
        subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-f", "f32le",
                        "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "loudnorm=I=-19:TP=-2:LRA=9",
                        "-ar","44100","-c:a","libmp3lame","-b:a","160k",str(root/(key+".mp3"))],
                       input=render(key).tobytes(),check=True)
