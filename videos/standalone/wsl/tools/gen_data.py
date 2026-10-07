#!/usr/bin/env python3
"""由取证材料生成画面数据 src/js/data.js。画面上的回显、数字、引文都从这里来，场景里不手写。

用法：python videos/standalone/wsl/tools/gen_data.py
输入：
  research/lab/out_1*.txt           本机实验的回显（入库）
  research/lab/out_03_releases.tsv  GitHub 发布记录整理成的表（入库）
  research/_src/web/*.json          01_fetch_sources.py 取回的接口响应（不入库）
  research/_src/WSL/                microsoft/WSL 在标签 3.0.1 处的源码（不入库；git clone --depth 1 --branch 3.0.1）
缺少不入库的两项时脚本无法运行；已生成的 data.js 不受影响。
英文版里 wsl.exe 的回显：测试机的界面语言是中文，回显是中文的。这里用源码里的 zh-CN 字符串模板从中文回显反解出各项的值，
再套进 en-US 模板；反解不出（模板与实测对不上）就报错退出。Win32 系统错误信息的英文取自微软文档的错误码表。
"""
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
LAB = os.path.join(ROOT, 'research', 'lab')
WEB = os.path.join(ROOT, 'research', '_src', 'web')
SRC = os.path.join(ROOT, 'research', '_src', 'WSL')


def read(name):
    with open(os.path.join(LAB, name), encoding='utf-8') as f:
        return f.read().replace('\r\n', '\n')


def after(text, marker, n=1, skip=0):
    """marker 所在行之后的第 skip+1 … skip+n 行。"""
    lines = text.split('\n')
    for i, l in enumerate(lines):
        if l.startswith(marker):
            got = lines[i + 1 + skip:i + 1 + skip + n]
            return got[0] if n == 1 else got
    sys.exit(f'找不到标记：{marker!r}')


def block(text, marker):
    """marker 所在行之后、到 [exit= 行之前的全部行。"""
    lines = text.split('\n')
    for i, l in enumerate(lines):
        if l.startswith(marker):
            out = []
            for k in lines[i + 1:]:
                if k.startswith('[exit='):
                    return out
                out.append(k)
    sys.exit(f'找不到标记：{marker!r}')


def resw(lang):
    tree = ET.parse(os.path.join(SRC, 'localization', 'strings', lang, 'Resources.resw'))
    return {d.get('name'): (d.find('value').text or '') for d in tree.getroot().iter('data')}


def unformat(template, text):
    """用模板（{} 为占位）从 text 里取出各占位处的值。"""
    pat = '^' + '(.+?)'.join(re.escape(p) for p in template.split('{}')) + '$'
    m = re.match(pat, text, flags=re.S)
    if not m:
        sys.exit(f'模板与实测对不上：{template!r} ← {text!r}')
    return list(m.groups())


def main():
    zh, en = resw('zh-CN'), resw('en-US')
    D = {}

    # ── 10：两套版本号 ──
    o10 = read('out_10_versions.txt')
    ver_zh = block(o10, 'PS> wsl --version')
    vals = unformat(zh['MessagePackageVersions'].replace('\r\n', '\n').strip(), '\n'.join(ver_zh).strip())
    ver_en = en['MessagePackageVersions'].replace('\r\n', '\n').strip().split('\n')
    ver_en = [t.replace('{}', v) for t, v in zip(ver_en, vals)]
    assert vals[0] == '3.0.2.0', vals
    lst = block(o10, 'PS> wsl -l -v')
    assert lst[0].split() == ['NAME', 'STATE', 'VERSION'] and lst[1].split()[-1] == '2', lst
    others = re.search(r'另有 (\d+) 个.*?VERSION 列依次为：(.+?)）', lst[2])
    err_zh = block(o10, 'PS> wsl --set-default-version 3')
    assert err_zh[0].strip() == '无法解析版本号。' and 'Wsl/ERROR_VERSION_PARSE_ERROR' in err_zh[1], err_zh
    st_zh = block(o10, 'PS> wsl --status')
    dv = unformat(zh['MessageStatusDefaultVersion'].strip(), st_zh[1].strip())[0]
    exes = {l.split()[0]: l.split()[1:] for l in block(o10 + '\n[exit=', "PS> Get-ChildItem 'C:\\Program Files\\WSL'") if l.strip() and l.split()[0].endswith('.exe')}
    D['version'] = {
        'pkg': vals[0], 'kernelPkg': vals[1], 'windows': vals[6],
        'zh': ver_zh[:2], 'en': ver_en[:2],
        'list': {'header': lst[0], 'row': lst[1], 'others': int(others.group(1)), 'othersVersions': others.group(2).split('、')},
        'status': {'zh': st_zh[1].strip(), 'en': en['MessageStatusDefaultVersion'].strip().replace('{}', dv)},
        'set3': {'zh': [err_zh[0].strip(), err_zh[1].strip()],
                 'en': ['A version number could not be parsed.', 'Error code: Wsl/ERROR_VERSION_PARSE_ERROR']},
        'wslc': after(o10, 'PS> wslc --version'),
        'sameBinary': after(o10, 'PS> (Get-FileHash wslc.exe)') == 'True',
        'exes': {k: {'bytes': int(v[0]), 'ver': v[1] if len(v) > 1 else ''} for k, v in exes.items()},
    }
    assert D['version']['sameBinary'] and exes['wslc.exe'][0] == exes['container.exe'][0]

    # ── 11–12：同一个根文件系统，版本 1 与版本 2 ──
    o11, o12 = read('out_11_wsl1_vs_wsl2.txt'), read('out_12_followup.txt')
    a = re.search(r'^(alpine-minirootfs-(\S+?)-x86_64\.tar\.gz)\s+(\d+) 字节\s+sha256=(\w+)', o11, flags=re.M)
    s = re.search(r'^(WSL-3\.0\.1\.tar\.gz)\s+(\d+) 字节\s+sha256=(\w+)', o11, flags=re.M)
    assert 'Alpine 校验和与发布清单一致' in o11
    D['alpine'] = {'file': a.group(1), 'release': a.group(2), 'bytes': int(a.group(3)), 'sha256': a.group(4)}
    D['srcpkg'] = {'file': s.group(1), 'bytes': int(s.group(2)), 'sha256': s.group(3)}
    imp = [l for l in o11.split('\n') if l.startswith('PS> wsl --import')]
    ok_zh = after(o11, 'PS> wsl --import ft-wsl1')
    assert ok_zh == '操作成功完成。' and after(o11, 'PS> wsl --import ft-wsl2') == ok_zh
    # 导入成功时打印的是 Win32 的 0 号系统信息；英文取自微软文档的错误码表（ERROR_SUCCESS）
    D['import'] = {'wsl1': imp[0][4:], 'wsl2': imp[1][4:], 'ok': {'zh': ok_zh, 'en': 'The operation completed successfully.'}}
    rows = [l for l in o11.split('\n') if re.match(r'^\s+ft-wsl\d\s', l)]
    D['labList'] = {'header': after(o11, 'PS> wsl -l -v', 1), 'rows': rows}
    assert rows[0].split()[-1] == '1' and rows[1].split()[-1] == '2', rows

    def both(cmd):
        return after(o11, f'[ft-wsl1]\\$ {cmd}'), after(o11, f'[ft-wsl2]\\$ {cmd}')

    u1, u2 = both('uname -r')
    p1, p2 = both('cat /proc/version')
    assert u1 == '4.4.0-26100-Microsoft' and u2.endswith('-microsoft-standard-WSL2'), (u1, u2)
    assert both('cat /etc/alpine-release') == (D['alpine']['release'],) * 2
    D['uname'] = {'wsl1': u1, 'wsl2': u2}
    D['procVersion'] = {'wsl1': p1, 'wsl2': p2}
    nt = after(o12, 'PS> (Get-Item C:\\Windows\\System32\\ntoskrnl.exe)')
    lx = re.search(r'ProductVersion  : (\S+)\nFileDescription : (.+)\nLength          : (\d+)', o12)
    m = re.match(r'^4\.4\.0-(\d+)-Microsoft$', u1)
    r = re.search(r'#(\d+)-Microsoft', p1)
    assert nt.split('.')[2] == m.group(1) and nt.split('.')[3] == r.group(1), (nt, u1, p1)   # 26100 与 9587 正是 Windows 内核文件的版本号
    D['nt'] = {'ntoskrnl': nt, 'build': m.group(1), 'rev': r.group(1), 'lxcore': {'ver': lx.group(1), 'desc': lx.group(2), 'bytes': int(lx.group(3))}}

    d1, d2 = both('dmesg 2>&1 | head -3')
    n1, n2 = both('unshare -U id -u 2>&1; echo "rc=$?"')
    c1 = after(o11, '[ft-wsl1]\\$ mkdir -p /tmp/cg')
    c2 = after(o11, '[ft-wsl2]\\$ mkdir -p /tmp/cg', 1, 1)
    assert 'Function not implemented' in d1 and 'Invalid argument' in n1 and 'No such device' in c1 and n2 == '65534' and c2.startswith('cpuset'), (d1, n1, c1, n2, c2)
    D['probes'] = {
        'cmd': {'dmesg': 'dmesg', 'userns': 'unshare -U id -u', 'cgroup': 'mount -t cgroup2 none /tmp/cg'},
        'wsl1': {'dmesg': d1, 'userns': n1, 'cgroup': c1},
        'wsl2': {'dmesg': d2, 'userns': n2, 'cgroup': c2},
    }
    m1 = after(o11, '[ft-wsl1]\\$ grep -E " / | /mnt/c "', 2)
    m2 = after(o11, '[ft-wsl2]\\$ grep -E " / | /mnt/c "', 2)
    vh = re.search(r'ext4\.vhdx\s+(\d+)', o11)
    fc = re.search(r'wsl1\\rootfs 下：(\d+) 个文件，(\d+) 个目录', o11)
    top = after(o11, 'PS> Get-ChildItem C:\\ftlab\\wsl1\\rootfs', 8)
    assert m1[0].split()[2] == 'wslfs' and m1[1].split()[2] == 'drvfs' and m2[0].split()[2] == 'ext4' and m2[1].split()[2] == '9p', (m1, m2)
    D['storage'] = {
        'wsl1': {'root': m1[0].split()[2], 'c': m1[1].split()[2], 'files': int(fc.group(1)), 'dirs': int(fc.group(2)), 'top': top},
        'wsl2': {'root': m2[0].split()[2], 'dev': m2[0].split()[0], 'c': m2[1].split()[2], 'vhdx': int(vh.group(1))},
    }

    # ── 13：解压计时 ──
    o13 = read('out_13_untar_timing.txt')
    t = {}
    for l in o13.split('\n'):
        mm = re.match(r'^(ft-wsl\d)\s+\|\s+(基线|Linux 文件系统|Windows 文件系统)[^|]*\|\s+([\d ]+?)\s+\|\s+中位\s+(\d+)', l)
        if mm:
            key = {'基线': 'base', 'Linux 文件系统': 'linux', 'Windows 文件系统': 'win'}[mm.group(2)]
            t[mm.group(1)[3:] + '_' + key] = {'runs': [int(x) for x in mm.group(3).split()], 'median': int(mm.group(4))}
    nat = re.search(r'^tar\.exe\s+\|[^|]+\|\s+([\d ]+?)\s+\|\s+中位\s+(\d+)', o13, flags=re.M)
    fl = re.search(r'文件数核对：(\d+)', o13)
    net = {k: t[f'{d}_{k}']['median'] - t[f'{d}_base']['median'] for d in ('wsl1', 'wsl2') for k in ('linux', 'win') for k in [k]}
    net = {f'{d}_{k}': t[f'{d}_{k}']['median'] - t[f'{d}_base']['median'] for d in ('wsl1', 'wsl2') for k in ('linux', 'win')}
    D['timing'] = {'files': int(fl.group(1)), 'dirs': 221, 'raw': t, 'ms': net, 'native': int(nat.group(2)),
                   'ratioLinux': round(net['wsl1_linux'] / net['wsl2_linux'], 1), 'ratioWin': round(net['wsl2_win'] / net['wsl1_win'], 1)}
    assert D['timing']['files'] == 1489 and 'dirs: 221' in o12

    # ── 14–15：WSL 容器 ──
    o14, o15 = read('out_14_wslc.txt'), read('out_15_port_and_nosync.txt')
    uc = after(o14, 'PS> wslc run --rm ft-alpine:3.24.2 uname -r')
    pc = after(o14, 'PS> wslc run --rm ft-alpine:3.24.2 cat /proc/version')
    assert uc == u2 and pc == p2, '容器里与版本 2 发行版里的内核版本应逐字相同'
    D['uname']['wslc'] = uc
    D['procVersion']['wslc'] = pc
    img = [l for l in block(o14, 'PS> wslc images')]
    imgs = [l for l in o14.split('\n') if l.startswith('ft-alpine ')][0].split()
    procs = [l.split()[1] for l in block(o14, 'PS> wslc system session run ps -e') if re.match(r'^\s*\d+\s', l)]
    kt = re.search(r'其余 (\d+) 个内核线程从略', o14)
    owners = dict(re.findall(r'^(wslservice\.exe|wslcsession\.exe)\s+属主=(\S+)', o14, flags=re.M))
    vms = re.findall(r'^(vmmem\S+)\s+属主=', o14, flags=re.M)
    sess = re.search(r'sessions\\(\S+)\\storage\.vhdx\s+(\d+)', o14)
    swap = re.search(r'swap\.vhdx\s+(\d+)', o14)
    dv2 = after(o14, 'PS> wslc system session run dockerd --version')
    cdv = after(o14, 'PS> wslc system session run containerd --version')
    runc = re.search(r'runc:\n\s+Version:\s+(\S+)', o14)
    vol = after(o14, 'PS> wslc run --rm -v C:\\ftlab\\share:/data ft-alpine:3.24.2 grep /data /proc/mounts')
    vcat = after(o14, 'PS> wslc run --rm -v C:\\ftlab\\share:/data ft-alpine:3.24.2 cat /data/hello.txt')
    cg = after(o14, 'PS> wslc exec ft-sleep cat /sys/fs/cgroup/cgroup.controllers')
    ov = after(o14, 'PS> wslc exec ft-sleep grep -E "^overlay | / " /proc/mounts')
    cl = after(o14, 'PS> wslc system session run cat /proc/cmdline')
    cl2 = after(o11, '[ft-wsl2]\\$ cat /proc/cmdline')
    sl = [l for l in o14.split('\n') if re.match(r'^\s+ft-wsl\d\s', l)]
    port = re.search(r'(127\.0\.0\.1:\d+->\d+/tcp)', o15)
    got = re.search(r'收到 (\d+) 字节：(\S+)', o15)
    assert owners == {'wslservice.exe': 'SYSTEM', 'wslcsession.exe': '当前用户'}, owners
    assert vol.split()[2] == 'virtiofs' and vcat == 'hello from Windows' and 'WSLC_ROOT_INIT=1' in cl and 'WSL_ROOT_INIT=1' in cl2
    assert {'containerd', 'dockerd', 'containerd-shim', 'sleep'} <= set(procs), procs
    assert all(l.split()[1] == 'Stopped' for l in sl), '容器运行期间，两个实验发行版应保持 Stopped'
    D['wslc'] = {
        'import': 'wslc import C:\\ftlab\\' + D['alpine']['file'] + ' ft-alpine:' + D['alpine']['release'],
        'importId': after(o14, 'PS> wslc import '), 'image': imgs[0] + ':' + imgs[1], 'imageSize': imgs[-1],
        'run': 'wslc run --rm ft-alpine:' + D['alpine']['release'] + ' uname -r',
        'owners': {'wslservice': owners['wslservice.exe'], 'wslcsession': owners['wslcsession.exe']},
        'vms': sorted(v.replace('<用户>', 'user') for v in vms),
        'session': sess.group(1).replace('<用户>', 'user'), 'storageVhdx': int(sess.group(2)), 'swapVhdx': int(swap.group(1)),
        'procs': [p for p in procs if p != 'ps'], 'kthreads': int(kt.group(1)),
        'dockerd': re.search(r'Docker version (\S+?),', dv2).group(1), 'containerd': cdv.split()[2], 'runc': runc.group(1),
        'volume': {'cmd': 'wslc run --rm -v C:\\ftlab\\share:/data ft-alpine:' + D['alpine']['release'] + ' grep /data /proc/mounts', 'mount': vol, 'fs': vol.split()[2]},
        'cgroup': cg, 'overlay': ov.split()[2] == 'overlay', 'dockerRoot': '/var/lib/docker' in ov,
        'initFlag': {'wsl2': 'WSL_ROOT_INIT=1', 'wslc': 'WSLC_ROOT_INIT=1'},
        'distroStateWhileRunning': [l.split()[1] for l in sl],
        'port': port.group(1), 'portReply': got.group(2),
    }

    # ── 03：发布记录 ──
    rel = []
    for l in read('out_03_releases.tsv').split('\n'):
        if not l or l.startswith('#') or l.startswith('tag\t'):
            continue
        tag, pub, pre, major = l.split('\t')
        rel.append([tag, pub[:10], int(pre), int(major)])
    firsts = {}
    for tag, day, pre, major in rel:
        firsts.setdefault(major, [tag, day])
    assert firsts[0][0] == '0.47.1' and firsts[1][0] == '1.0.0' and firsts[2][0] == '2.0.0' and firsts[3][0] == '3.0.1', firsts
    D['releases'] = {'rows': rel, 'count': len(rel), 'firsts': {str(k): v for k, v in firsts.items()}}
    prev = [r for r in rel if r[0] == '2.9.3'][0]
    assert prev[2] == 1 and prev[1] == '2026-06-29'
    D['releases']['preview'] = {'tag': prev[0], 'date': prev[1]}

    # ── 原始响应：帖子、发布页、仓库 ──
    def web(n):
        with open(os.path.join(WEB, n), encoding='utf-8') as f:
            return json.load(f)

    tw = web('x-loewen-2069420597487055276.json')
    tw = tw.get('tweet', tw)
    r301, r302 = web('gh-release-3.0.1.json'), web('gh-release-3.0.2.json')
    text = tw['text']
    assert text.startswith('As a PSA, there is no such thing as WSL 3!') and tw['created_at'].startswith('Tue Jun 23') and tw['created_at'].endswith('2026')
    head = r301['body'].replace('\r', '').split('\n')[0].lstrip('# ').strip()
    cmp_ = re.search(r'compare/(\S+?)\.\.\.(\S+)', r301['body'])
    assert not r301['prerelease'] and r302['prerelease'] and r301['published_at'].startswith('2026-09-29') and r302['published_at'].startswith('2026-10-05')
    D['quotes'] = {
        'loewen': {'name': tw['author']['name'], 'handle': '@' + tw['author']['screen_name'], 'bio': tw['author']['description'],
                   'date': '2026-06-23', 'first': text.split('!')[0] + '!', 'second': text.split('! ', 1)[1].split('\n')[0].strip(),
                   'rest': text.split('\n\n', 1)[1].strip() if '\n\n' in text else ''},
        'r301': {'tag': r301['tag_name'], 'date': r301['published_at'][:10], 'time': r301['published_at'][11:16], 'head': head, 'from': cmp_.group(1), 'to': cmp_.group(2)},
        'r302': {'tag': r302['tag_name'], 'date': r302['published_at'][:10], 'prerelease': True},
        'media': [
            {'site': 'TechTimes', 'date': '2026-06-02', 'title': 'WSL 3 at Build 2026: Near-Native GPU and NPU Passthrough Brings Local AI to Windows'},
            {'site': 'IT-Connect', 'date': '2026-06-04', 'title': 'WSL 3 and WSL Containers: Microsoft’s Next Windows Update'},
        ],
        'ga': {'title': 'WSL containers is now generally available', 'site': 'Windows Developer Blog', 'date': '2026-09-29', 'wsl3Count': 0},
    }
    # 媒体标题与官方文章的「WSL 3」计数，回到存档的网页上核对
    import html as _h

    def page(n):
        with open(os.path.join(WEB, n), encoding='utf-8', errors='replace') as f:
            return f.read()
    for mda, fn in zip(D['quotes']['media'], ('media-techtimes-2026-06-02.html', 'media-itconnect-wsl3.html')):
        pg = page(fn)
        ttl = _h.unescape(re.search(r'<title[^>]*>([^<]+)</title>', pg).group(1)).strip()
        dt = (re.search(r'"datePublished"\s*:\s*"([^"]+)"', pg) or re.search(r'article:published_time"[^>]+content="([^"]+)"', pg)).group(1)
        assert ttl.startswith(mda['title']) and dt.startswith(mda['date']), (ttl, dt)
    ga = page('ms-2026-wslc-ga.html')
    art = re.search(r'<article.*?</article>', ga, flags=re.S).group(0)
    art = ' '.join(_h.unescape(re.sub(r'<[^>]+>', ' ', re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', art, flags=re.S))).split())
    assert len(re.findall(r'WSL ?3\b', art)) == 0 and D['quotes']['ga']['title'] in ga and 'generally available today' in art

    # ── 源码：版本号的校验 ──
    with open(os.path.join(SRC, 'src', 'windows', 'common', 'WslClient.cpp'), encoding='utf-8') as f:
        cpp = f.read().split('\n')
    ln = [i for i, l in enumerate(cpp) if 'ERROR_VERSION_PARSE_ERROR' in l]
    assert len(ln) == 1
    i = ln[0]
    fn_start = max(k for k in range(i) if cpp[k].startswith('ParseVersionString'))
    with open(os.path.join(SRC, 'src', 'windows', 'service', 'inc', 'wslservice.idl'), encoding='utf-8') as f:
        defs = [re.search(r'#define (LXSS_WSL_VERSION_\w+) (\d+)', l) for l in f.read().split('\n')]
    defs = [[m.group(1), int(m.group(2))] for m in defs if m]
    with open(os.path.join(SRC, 'src', 'windows', 'wslcsession', 'DockerHTTPClient.cpp'), encoding='utf-8') as f:
        dhc = f.read()
    assert '/var/run/docker.sock' in dhc and 'hvsocket' in dhc
    # 创建与启动容器的两条请求：路径与方法都取自源码
    assert re.search(r'URL::Create\("/containers/create"\);.{0,260}?verb::post', dhc, flags=re.S)
    assert re.search(r'URL::Create\("/containers/\{\}/start", Id\);.{0,260}?verb::post', dhc, flags=re.S)
    with open(os.path.join(SRC, 'src', 'windows', 'common', 'hcs.cpp'), encoding='utf-8') as f:
        assert '::HcsCreateComputeSystem(' in f.read()
    D['src'] = {'tag': '3.0.1', 'file': 'src/windows/common/WslClient.cpp', 'line': i + 1, 'fnLine': fn_start + 1,
                'fn': [l.rstrip() for l in cpp[fn_start - 1:i + 4]], 'check': cpp[i].strip(), 'defines': defs,
                'docker': {'file': 'src/windows/wslcsession/DockerHTTPClient.cpp', 'sock': '/var/run/docker.sock',
                           'calls': ['POST /containers/create', 'POST /containers/{id}/start']},
                'hcs': {'file': 'src/windows/common/hcs.cpp', 'call': 'HcsCreateComputeSystem'}}
    assert '(version != LXSS_WSL_VERSION_1) && (version != LXSS_WSL_VERSION_2)' in D['src']['check']
    assert ['LXSS_WSL_VERSION_1', 1] in defs and ['LXSS_WSL_VERSION_2', 2] in defs and not any(d[0] == 'LXSS_WSL_VERSION_3' for d in defs)

    out = os.path.join(ROOT, 'src', 'js', 'data.js')
    body = json.dumps(D, ensure_ascii=False, indent=1)
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write('// 由 tools/gen_data.py 从 research/lab/ 与 research/_src/ 生成，不要手改。\n')
        f.write('window.DATA = ' + body + ';\n')
    print('已写', os.path.relpath(out, ROOT), len(body), '字节')
    print('uname:', D['uname'])
    print('计时(ms):', D['timing']['ms'], '比值', D['timing']['ratioLinux'], D['timing']['ratioWin'])
    print('版本:', D['version']['zh'], D['version']['en'])
    print('源码:', D['src']['file'], D['src']['line'], D['src']['check'])
    print('发布:', D['releases']['count'], D['releases']['firsts'])


if __name__ == '__main__':
    main()
