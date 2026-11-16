"""在 wt dump -x 的输出里找键或值含有某段十六进制的那一项，连同前后各 N 项一起打印（键一行、值一行）。
用法：python3 find_kv.py dump.txt <十六进制> [N]"""
import sys

lines = open(sys.argv[1], encoding='utf-8').read().split('\n')
needle, n = sys.argv[2].lower(), int(sys.argv[3]) if len(sys.argv) > 3 else 1
start = lines.index('Data') + 1
pairs = [(lines[i], lines[i + 1]) for i in range(start, len(lines) - 1, 2) if lines[i]]
print(f'（共 {len(pairs)} 项）')
for i, (k, v) in enumerate(pairs):
    if needle in k.lower() or needle in v.lower():
        for j in range(max(0, i - n), min(len(pairs), i + n + 1)):
            mark = '→' if j == i else ' '
            print(f'{mark} 第 {j + 1} 项')
            print(f'    键 {pairs[j][0]}')
            print(f'    值 {pairs[j][1] or "（空）"}')
        break
else:
    print('没有找到')
