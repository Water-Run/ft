"""取 Firebird 标志图里的实际配色，供本片视觉系统用。

只统计完全不透明且非近白的像素，避免背景与抗锯齿边缘。
"""

import collections
import struct
import sys
import zlib


def decode_rgba(path):
    d = open(path, "rb").read()
    pos, idat, w, h, ct = 8, b"", 0, 0, 6
    while pos < len(d):
        ln = struct.unpack(">I", d[pos:pos + 4])[0]
        typ = d[pos + 4:pos + 8]
        data = d[pos + 8:pos + 8 + ln]
        pos += 12 + ln
        if typ == b"IHDR":
            w, h, _bd, ct, _c, _f, _il = struct.unpack(">IIBBBBB", data)
        elif typ == b"IDAT":
            idat += data
        elif typ == b"IEND":
            break
    raw = zlib.decompress(idat)
    bpp = 4 if ct == 6 else 3
    stride = w * bpp
    out = []
    prev = bytearray(stride)
    i = 0
    for _y in range(h):
        f = raw[i]
        i += 1
        line = bytearray(raw[i:i + stride])
        i += stride
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0
            b = prev[x]
            c = prev[x - bpp] if x >= bpp else 0
            if f == 1:
                line[x] = (line[x] + a) & 255
            elif f == 2:
                line[x] = (line[x] + b) & 255
            elif f == 3:
                line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                pa, pb, pc = abs(a + b - c - a), abs(a + b - c - b), abs(a + b - c - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        prev = line
        out.append(bytes(line))
    return w, h, bpp, out


def main():
    path = sys.argv[1]
    w, h, bpp, rows = decode_rgba(path)
    cnt = collections.Counter()
    for row in rows:
        for x in range(0, len(row), bpp):
            r, g, b = row[x], row[x + 1], row[x + 2]
            a = row[x + 3] if bpp == 4 else 255
            if a < 200:
                continue
            if r > 244 and g > 244 and b > 244:
                continue
            cnt[(r, g, b)] += 1
    total = sum(cnt.values())
    print("image %dx%d, opaque coloured pixels: %d" % (w, h, total))
    for (r, g, b), n in cnt.most_common(14):
        print("  #%02X%02X%02X  %6d  %5.1f%%" % (r, g, b, n, 100.0 * n / total))


if __name__ == "__main__":
    main()
