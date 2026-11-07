"""02 视频流一侧：同一处画面变化，H.264 编码后一帧多少字节。

对照 [MS-RDPEGDI] 第 4.1 节的三条带注释的 RDP 绘图指令：
  A 填色   OpaqueRect：把 1024×768 的矩形填成一种颜色            10 字节
  B 打字   FastIndex ：从字形缓存取 9 个字形，排成一行字           47 字节
  C 滚动   ScrBlt    ：把屏幕上 417×241 的一块搬到另一处            13 字节
  D 不变   （RDP 没有变化就不发绘图指令）

这里用同样的变化生成两帧画面（1024×768），交给 libx264 按串流常用的设置编码
（yuv420p、veryfast、zerolatency、CRF 23），读出第二帧（P 帧）的字节数。
第一帧是关键帧（I 帧），也记下来作参照。

运行（仓库根目录）：
  python -I videos/in-seconds/rdp/research/lab/02_h264_frames.py <ffmpeg> <ffprobe>
产物：research/lab/out_02_h264_frames.txt（入库）；帧图与码流写到 research/lab/_frames/（不入库）。
"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

FF, FP = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
WORK = os.path.join(HERE, '_frames')
os.makedirs(WORK, exist_ok=True)
W, H = 1024, 768
MONO = ImageFont.truetype(os.path.join(REPO, 'assets', 'fonts', 'JetBrainsMono.ttf'), 18)

LINES = [
    'Remote Desktop Protocol',
    '',
    'The server sends drawing orders instead of',
    'bitmaps. The client keeps caches of glyphs,',
    'brushes and bitmaps, so an item travels once',
    'and is then referred to by its cache index.',
    '',
    'Fill a rectangle, draw a line of text, move a',
    'block of the screen: each is a short order.',
    '',
]
LINES = LINES * 4


def page(lines, scroll=0, extra=''):
    im = Image.new('RGB', (W, H), (255, 255, 255))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 31], fill=(232, 232, 232))
    d.text((12, 6), 'notes.txt - Notepad', font=MONO, fill=(20, 20, 20))
    y = 44 - scroll
    for i, t in enumerate(lines):
        if i == 2 and extra:
            t = t + extra
        if 36 <= y <= H - 20:
            d.text((14, y), t, font=MONO, fill=(20, 20, 20))
        y += 26
    return im


def desktop():
    return Image.new('RGB', (W, H), (0, 120, 215))


CASES = [
    ('A_fill', desktop(), Image.new('RGB', (W, H), (0x73, 0x02, 0x06)), 'OpaqueRect', 10),
    ('B_type', page(LINES), page(LINES, extra=' 9 glyphs'), 'FastIndex', 47),
    ('C_scroll', page(LINES), page(LINES, scroll=26 * 3), 'ScrBlt', 13),
    ('D_same', page(LINES), page(LINES), '(none)', 0),
]


def frame_sizes(path):
    out = subprocess.run([FP, '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                          'packet=size,flags', '-of', 'csv=p=0', path],
                         capture_output=True, text=True, check=True).stdout.split()
    return [(int(s.split(',')[0]), s.split(',')[1]) for s in out]


rows = []
for name, a, b, order, rdp_bytes in CASES:
    a.save(os.path.join(WORK, f'{name}_0.png'))
    b.save(os.path.join(WORK, f'{name}_1.png'))
    mp4 = os.path.join(WORK, f'{name}.mp4')
    subprocess.run([FF, '-v', 'error', '-y', '-framerate', '60', '-i',
                    os.path.join(WORK, f'{name}_%d.png'), '-c:v', 'libx264',
                    '-preset', 'veryfast', '-tune', 'zerolatency', '-crf', '23',
                    '-pix_fmt', 'yuv420p', '-g', '600', '-bf', '0', mp4], check=True)
    sizes = frame_sizes(mp4)
    rows.append((name, order, rdp_bytes, sizes))

ver = subprocess.run([FF, '-hide_banner', '-version'], capture_output=True, text=True).stdout.splitlines()[0]
ver = ver.split(' Copyright')[0]
print('# 02 H.264 frame sizes for the same screen change')
print(f'# {ver}; libx264 -preset veryfast -tune zerolatency -crf 23 -pix_fmt yuv420p -bf 0; {W}x{H}')
print('# case       rdp_order    rdp_bytes  h264_frame0(I)  h264_frame1(P)')
for name, order, rdp_bytes, sizes in rows:
    (s0, f0), (s1, f1) = sizes[0], sizes[1]
    print(f'{name:<11} {order:<12} {rdp_bytes:>9}  {s0:>9} [{f0}]  {s1:>9} [{f1}]')
