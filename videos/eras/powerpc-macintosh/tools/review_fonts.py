"""Embed small, offline Noto subsets for the Chinese characters used on the review page."""
import sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

text = sys.stdin.buffer.read().decode("utf8") + "".join(chr(n) for n in range(32, 127))
video = Path(__file__).resolve().parents[1]
output = video / "out" / "audition" / "fonts"
output.mkdir(exist_ok=True)
for name in ["NotoSansSC","NotoSerifSC"]:
    opts = subset.Options()
    opts.name_IDs = ["*"]
    font = TTFont(video.parents[2] / "assets" / "fonts" / (name + ".ttf"))
    builder = subset.Subsetter(options=opts)
    builder.populate(text=text)
    builder.subset(font)
    font.flavor = "woff2"
    font.save(output / (name+".woff2"))
