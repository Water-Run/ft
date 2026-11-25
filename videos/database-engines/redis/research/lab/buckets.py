#!/usr/bin/env python3
"""按 Redis 8.12.0 的 SipHash-1-2（src/siphash.c）与本次进程的哈希种子，算出每个键落在哪个桶。
用法：python3 buckets.py <种子的 32 位十六进制> <桶数>   从标准输入读键名，一行一个。
输出：每个键的桶号，再按桶统计链长分布，与 DEBUG HTSTATS 的「Chain length distribution」对照。"""
import sys, json
from collections import Counter

M = (1 << 64) - 1
def rotl(x, b): return ((x << b) | (x >> (64 - b))) & M

def siphash12(data: bytes, key: bytes) -> int:
    k0 = int.from_bytes(key[:8], 'little'); k1 = int.from_bytes(key[8:16], 'little')
    v0 = 0x736f6d6570736575 ^ k0; v1 = 0x646f72616e646f6d ^ k1
    v2 = 0x6c7967656e657261 ^ k0; v3 = 0x7465646279746573 ^ k1
    def rnd():
        nonlocal v0, v1, v2, v3
        v0 = (v0 + v1) & M; v1 = rotl(v1, 13); v1 ^= v0; v0 = rotl(v0, 32)
        v2 = (v2 + v3) & M; v3 = rotl(v3, 16); v3 ^= v2
        v0 = (v0 + v3) & M; v3 = rotl(v3, 21); v3 ^= v0
        v2 = (v2 + v1) & M; v1 = rotl(v1, 17); v1 ^= v2; v2 = rotl(v2, 32)
    n = len(data); end = n - n % 8
    for i in range(0, end, 8):
        m = int.from_bytes(data[i:i + 8], 'little'); v3 ^= m; rnd(); v0 ^= m
    b = (n << 56) & M
    for j, ch in enumerate(data[end:]): b |= ch << (8 * j)
    v3 ^= b; rnd(); v0 ^= b
    v2 ^= 0xff; rnd(); rnd()
    return v0 ^ v1 ^ v2 ^ v3

def main():
    seed = bytes.fromhex(sys.argv[1]); size = int(sys.argv[2])
    keys = [l.strip() for l in sys.stdin if l.strip()]
    where = {k: siphash12(k.encode(), seed) & (size - 1) for k in keys}
    per = Counter(where.values())
    dist = Counter(per.get(i, 0) for i in range(size))
    print('桶数', size, '键数', len(keys), '有键的桶', len(per), '最长链', max(per.values()))
    for L in sorted(dist): print(f'   {L}: {dist[L]} ({dist[L] * 100 / size:.2f}%)')
    a = where.get('user:2050')
    print('user:2050 在第', a, '号桶；同一个桶里的键：', sorted(k for k, v in where.items() if v == a))
    json.dump({'size': size, 'bucket': where}, open(sys.argv[3] if len(sys.argv) > 3 else 'buckets.json', 'w'), ensure_ascii=False)

if __name__ == '__main__':
    main()
