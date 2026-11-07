"""05 「远程桌面连接」体验选项里的连接速度，以及慢网上传一帧要多久。

1. 从本机中文版 mstsc.exe.mui（UTF-16 字符串资源）里找出连接速度选项的原文。
2. 按选项里的带宽，算实验 02 的「往下翻一页」那一帧（H.264，23159 字节）与 RDP 搬移指令（14 字节，MS-RDPEGDI 4.1.7）
   各要传多久。只算传输时间（字节 × 8 ÷ 带宽），不含延迟与协议开销。

运行（仓库根目录）：python -I videos/in-seconds/rdp/research/lab/05_connection_speed.py > videos/in-seconds/rdp/research/lab/out_05_connection_speed.txt
"""
import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')
MUI = os.path.join(os.environ.get('SystemRoot', r'C:\Windows'), 'System32', 'zh-CN', 'mstsc.exe.mui')
t = open(MUI, 'rb').read().decode('utf-16le', 'ignore')
print('# mstsc.exe.mui（zh-CN）里含 kbps / Mbps 的连接速度字符串')
seen = []
for m in re.finditer(r'[\u4e00-\u9fffA-Za-z ]{1,12}\([0-9.]+ ?[kM]bps[^)\x00]*\)', t):
    s = m.group(0).strip()
    if s not in seen:
        seen.append(s); print(' ', s)
print()
print('# 传输时间 = 字节 × 8 ÷ 带宽')
frames = [('H.264 往下翻一页那一帧（out_02 C_scroll）', 23159), ('RDP ScrBlt 搬移指令（MS-RDPEGDI 4.1.7）', 14)]
for name, bps in [('调制解调器 56 kbps', 56_000), ('卫星 下限 2 Mbps', 2_000_000)]:
    for what, n in frames:
        sec = n * 8 / bps
        print(f'{name:<16} {what:<36} {n:>6} B  {sec * 1000:10.2f} ms')
