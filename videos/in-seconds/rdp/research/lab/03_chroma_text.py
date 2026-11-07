"""03 视频流一侧：彩色小字经过 H.264（yuv420p）编码后的样子。

微软远程桌面团队写过：4:2:0 压缩会丢掉一部分色度信息，彩色文字因此发虚
（RDP 10 AVC/H.264 一文，见 FACTS.md）。这里把一行红字、一行蓝字画在白底上，
按 02 相同的设置编码成一帧，再解码回来，裁出同一块放大 8 倍，与原图并排。
另记下原图与解码图在这块区域里的平均色差。

运行（仓库根目录）：
  python -I videos/in-seconds/rdp/research/lab/03_chroma_text.py <ffmpeg>
产物：out_03_chroma_text.txt（入库）；_frames/03_*.png（不入库，画面素材由 gen_data 时重做）。
"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageStat

FF = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
WORK = os.path.join(HERE, '_frames')
os.makedirs(WORK, exist_ok=True)
W, H = 320, 96
F = ImageFont.truetype(os.path.join(REPO, 'assets', 'fonts', 'NotoSansSC.ttf'), 14)

im = Image.new('RGB', (W, H), (255, 255, 255))
d = ImageDraw.Draw(im)
d.text((8, 10), 'ERROR 0x204 远程桌面', font=F, fill=(220, 0, 0))
d.text((8, 40), 'mstsc /v:server 蓝色链接', font=F, fill=(0, 0, 230))
d.text((8, 70), 'black text 黑色文字', font=F, fill=(0, 0, 0))
src = os.path.join(WORK, '03_src.png')
im.save(src)
enc = os.path.join(WORK, '03_enc.mp4')
dec = os.path.join(WORK, '03_dec.png')
subprocess.run([FF, '-v', 'error', '-y', '-i', src, '-c:v', 'libx264', '-preset', 'veryfast',
                '-tune', 'zerolatency', '-crf', '23', '-pix_fmt', 'yuv420p', enc], check=True)
subprocess.run([FF, '-v', 'error', '-y', '-i', enc, '-frames:v', '1', dec], check=True)
out = Image.open(dec).convert('RGB')

print('# 03 colored text through H.264 yuv420p (libx264 veryfast zerolatency crf 23)')
print(f'# canvas {W}x{H}, NotoSansSC 14px; mean absolute RGB difference per row band')
for name, box in [('red', (0, 4, W, 32)), ('blue', (0, 34, W, 62)), ('black', (0, 64, W, 92))]:
    diff = ImageChops.difference(im.crop(box), out.crop(box))
    m = ImageStat.Stat(diff).mean
    print(f'{name:<6} R {m[0]:6.2f}  G {m[1]:6.2f}  B {m[2]:6.2f}')
crop = (8, 8, 88, 32)
z = 8
pair = Image.new('RGB', ((crop[2] - crop[0]) * z * 2 + z, (crop[3] - crop[1]) * z), (128, 128, 128))
pair.paste(im.crop(crop).resize(((crop[2] - crop[0]) * z, (crop[3] - crop[1]) * z), Image.NEAREST), (0, 0))
pair.paste(out.crop(crop).resize(((crop[2] - crop[0]) * z, (crop[3] - crop[1]) * z), Image.NEAREST),
           ((crop[2] - crop[0]) * z + z, 0))
pair.save(os.path.join(WORK, '03_pair.png'))
print(f'# zoom pair (original | decoded), crop {crop}, x{z}: _frames/03_pair.png')
