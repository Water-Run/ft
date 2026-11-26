# 回显与产物 → 画面数据：读 research/lab/ 的回显与 buckets.json，写 src/js/data.js（由本脚本生成，不要手改）。
# 用法（仓库根目录）：python -I videos/database-engines/redis/tools/gen_data.py
# 画面上的字节、计数、时刻都从这里来；每一项都在下面断言过它与回显一致（FACTS 的编号写在旁边）。
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
LAB = os.path.join(VIDEO, 'research', 'lab')
def read(name): return open(os.path.join(LAB, name), encoding='utf-8').read()

def section(text, title):
    m = re.search(r'==== ' + re.escape(title) + r'[^\n]*====\n(.*?)(?=\n==== |\Z)', text, re.S)
    assert m, title
    return m.group(1)

def htstats(block):
    size = int(re.search(r'table size: (\d+)', block).group(1))
    n = int(re.search(r'number of elements: (\d+)', block).group(1))
    dist = {int(a): int(b) for a, b in re.findall(r'^\s+(\d+): (\d+) \(', block, re.M)}
    return {'size': size, 'elements': n, 'dist': dist, 'maxChain': int(re.search(r'max chain length: (\d+)', block).group(1))}

def main():
    out = {}
    # 桶：每个键的桶号（K07），与同一进程的 HTSTATS 对照
    b = json.load(open(os.path.join(LAB, 'buckets.json'), encoding='utf-8'))
    size = b['size']; where = b['bucket']
    counts = [0] * size
    for k, v in where.items(): counts[v] += 1
    hs = htstats(section(read('out_10_buckets.txt'), 'DEBUG HTSTATS 0 FULL（写完 1 秒后）'))
    dist = {}
    for c in counts: dist[c] = dist.get(c, 0) + 1
    assert hs['size'] == size and hs['elements'] == len(where) == 4096, hs
    assert {k: v for k, v in dist.items()} == hs['dist'], (dist, hs['dist'])          # K07：逐项相同
    alice = where['user:2050']
    out['buckets'] = {'size': size, 'counts': ''.join(str(c) for c in counts), 'alice': alice,
                      'dist': hs['dist'], 'maxChain': hs['maxChain'], 'used': sum(1 for c in counts if c),
                      'aliceMates': sorted(k for k, v in where.items() if v == alice)}
    longest = [i for i, c in enumerate(counts) if c == hs['maxChain']]
    out['buckets']['longest'] = {'bucket': longest[0], 'keys': sorted(k for k, v in where.items() if v == longest[0])}
    # Alice 的 listpack（L03）与 dump.rdb 里那一项（L04）
    t = read('out_08_persist.txt')
    hexline = re.search(r'\n(1009757365723a32303530[0-9a-f]+)\n', t).group(1)
    rdb = bytes.fromhex(hexline)
    assert rdb[0] == 0x10 and rdb[1] == 9 and rdb[2:11] == b'user:2050' and rdb[11] == 27
    lp = rdb[12:12 + 27]
    assert lp[:4] == bytes([27, 0, 0, 0]) and lp[4:6] == bytes([4, 0]) and lp[-1] == 0xff
    out['listpack'] = {'hex': lp.hex(), 'parts': [
        {'from': 0, 'len': 4, 'what': '总长 27'}, {'from': 4, 'len': 2, 'what': '4 项'},
        {'from': 6, 'len': 6, 'what': 'name'}, {'from': 12, 'len': 7, 'what': 'Alice'},
        {'from': 19, 'len': 5, 'what': 'age'}, {'from': 24, 'len': 2, 'what': '42'}, {'from': 26, 'len': 1, 'what': '结束'}]}
    out['rdbEntry'] = {'hex': rdb[:12 + 27].hex(), 'offset': int(re.search(r'偏移：(\d+)', t).group(1))}
    m = re.search(r'(\d+) data/dump\.rdb', t); out['rdbSize'] = int(m.group(1))                     # P02
    assert out['rdbSize'] == 347102
    head = section(t, 'dump.rdb 的开头（魔数与版本号）').split('\n')[0]
    assert head == 'REDIS0017'; out['rdbMagic'] = head
    # AOF 里多出来的那一段（P06）
    rows = [l for l in section(t, 'Alice 过生日：HSET user:2050 age 43。incr 文件里多出来的就是这条命令本身').split('--- base')[0].splitlines() if re.match(r'^[0-9a-f]{8}: ', l)]
    aofhex = ''.join(l[10:49].replace(' ', '') for l in rows)      # xxd：偏移 + 8 组十六进制 + 文本
    aof = bytes.fromhex(aofhex); assert len(aof) == 69 and b'HSET\r\n$9\r\nuser:2050\r\n$3\r\nage\r\n$2\r\n43\r\n' in aof
    out['aof'] = aof.decode()
    # 实测数
    f = read('out_04_find.txt')
    out['hgetallUs'] = [int(x) for x in re.findall(r'服务端用时（微秒）与命令：(\d+) HGETALL', f)]              # Q01
    out['scanUs'] = [int(x) for x in re.findall(r'服务端用时（微秒）：(\d+)', section(f, '按名字找 Alice：没有索引，只能用 SCAN 把 4096 个键都看一遍（服务端的 Lua 脚本）'))]  # Q03
    out['rps'] = float(re.search(r'throughput summary: ([\d.]+) requests per second', f).group(1))       # Q02
    out['usecPerCall'] = float(re.search(r'usec_per_call=([\d.]+)', f).group(1))
    assert out['hgetallUs'] == [5, 4, 6, 6, 5] and out['scanUs'] == [3590, 3670, 4155] and out['usecPerCall'] == 0.24   # 与 FACTS Q01–Q03、文案 o3 c3 c5 c6 c10 一致
    l = read('out_02_load.txt')
    out['mem'] = {'before': int(re.search(r'写入之前 ====\nused_memory:(\d+)', l).group(1)),
                  'after': int(re.findall(r'used_memory:(\d+)', l)[1]),
                  'alice': int(re.search(r'MEMORY USAGE user:2050\n(\d+)', l).group(1)),
                  'other': int(re.search(r'MEMORY USAGE user:2049\n(\d+)', l).group(1))}
    assert out['mem']['alice'] == 55 and out['mem']['other'] == 100
    x = read('out_09_crash.txt')
    out['crashCounter'] = [int(re.search(r'最后收到的回复： (\d+)', x).group(1)), int(re.search(r'重启后 counter：(\d+)', x).group(1))]  # X04
    assert out['crashCounter'] == [33287, 33287]                                                          # 文案 f28 f29
    r = read('out_03_rehash.txt')
    nums = [int(n) for n in re.findall(r'number of elements: (\d+)', section(r, '再做 100 次读（每次查找顺手搬一格）'))]
    out['rehash100'] = nums; assert nums == [3895, 201]                                                   # R02
    # 更多画面数字（分镜用），各自对照回显断言
    m = re.search(r'写入 4095 个用户 ====\n.*?table size: (\d+)\n number of elements: (\d+)', r, re.S)
    out['rehashBefore'] = [int(m.group(1)), int(m.group(2))]; assert out['rehashBefore'] == [4096, 4095]      # R02
    out['fork'] = {'usec': int(re.search(r'latest_fork_usec:(\d+)', t).group(1))}; assert out['fork']['usec'] == 275  # P01
    d = read('out_06_delete.txt')
    ek = [int(x) for x in re.findall(r'expired_keys:(\d+)', d)]; ds = [int(x) for x in re.findall(r'DBSIZE\n(\d+)', d)]
    out['expire'] = {'expiredKeys': ek, 'dbsize': ds}; assert ek == [0, 1, 2] and ds[:6] == [4096, 4095, 4096, 4097, 4096, 4096]   # D01 D03
    out['oom'] = re.search(r"(OOM command not allowed[^\n]*)", d).group(1)                                            # D04
    out['evicted'] = int(re.search(r'evicted_keys:(\d+)', d).group(1)); assert out['evicted'] == 464
    c = read('out_07_concurrency.txt')
    out['conc'] = {'wait': float(re.search(r'等了 ([\d.]+) 秒', c).group(1)), 'sum': 20000, 'retryAge': 44}
    assert out['conc']['wait'] == 0.40 and "'20000'" in c and "'44'" in c and 'None' in c and 'EXECABORT' in c       # C02 C03 C06 C08
    out['crash'] = {'rdbOnlyKeys': int(re.findall(r'DBSIZE\n(\d+)', x)[1]), 'snapshotAge': 42}
    assert out['crash']['rdbOnlyKeys'] == 0 and re.search(r'HGET user:2050 age\n42', x)                                # X01 X02
    out['aofSize'] = int(re.search(r'incr 文件 (\d+) →', x).group(1)); assert out['aofSize'] == 461764                  # X07
    js = '// 由 tools/gen_data.py 从 research/lab/ 生成，不要手改。\nwindow.DATA = ' + json.dumps(out, ensure_ascii=False) + ';\n'
    open(os.path.join(VIDEO, 'src', 'js', 'data.js'), 'w', encoding='utf-8', newline='\n').write(js)
    print('src/js/data.js', len(js), '字节；Alice 在第', alice, '号桶；最长链', out['buckets']['longest'])

if __name__ == '__main__':
    main()
