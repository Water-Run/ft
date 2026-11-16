"""把 wt verify -k -d dump_pages 的输出压成一页一段：页的种类、磁盘映像大小、项数；内部页列出全部分界键，叶页只列第一个与最后一个键。
内存地址（0x…）每次运行都不同，换成按出现顺序的页号。用法：python3 summarize_pages.py pages.txt"""
import re, sys

pages, cur = [], None
for line in open(sys.argv[1], encoding='utf-8', errors='replace'):
    m = re.match(r'- 0x[0-9a-f]+: (row-store (internal|leaf))', line)
    if m:
        cur = {'kind': m.group(2), 'keys': [], 'meta': ''}
        pages.append(cur)
        continue
    if cur is None:
        continue
    if 'disk_img' in line:
        m2 = re.search(r'dsk_mem_size: (\d+).*entries: (\d+)', line)
        cur['meta'] = f'磁盘映像解压后 {m2.group(1)} 字节，{m2.group(2)} 项' if m2 else ''
    m = re.match(r'\tK: \{(.*)\}$', line.rstrip('\n'))
    if m:
        cur['keys'].append(m.group(1))

for i, p in enumerate(pages):
    ks = p['keys']
    if p['kind'] == 'internal':
        print(f'第 {i} 页 内部页：{p["meta"]}；分界键 ' + '、'.join(ks))
    else:
        print(f'第 {i} 页 叶页：{p["meta"]}；键 {ks[0]} … {ks[-1]}（共 {len(ks)} 个键）')
