#!/usr/bin/env python3
"""从 01_fetch_sources.py 取回的原始文件里，摘出本片引用的原文片段与日期。

用法：python research/lab/02_extract.py > research/lab/out_02_extract.txt
每个来源先打印页面自带的发布日期等元数据，再按下面登记的「标签 → 正则」逐条打印命中处的原文（前后各带一小段上下文）。
没有命中的条目打印 [未命中]，不静默跳过。原文各有版权，这里只摘引用所需的短句。
"""
import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(HERE, '..', '_src', 'web')

# 来源 → [(标签, 正则, 命中后向后取的字符数)]
PAGES = {
    'ms-2016-bash-on-ubuntu.html': [
        ('WSL 的名字首次出现', r'we built new infrastructure within Windows', 230),
        ('可以运行的东西', r'The result is that you can now run native Bash', 200),
    ],
    'ms-2016-build-14316.html': [
        ('预览版 14316', r'Today we are releasing Windows 10 Insider Preview Build 14316', 80),
        ('该版本带有 Bash', r'Run native Bash on Ubuntu on Windows: In this build', 130),
    ],
    'ms-2016-wsl-overview.html': [
        ('日期', r'Last updated on[^\n]{0,14}', 0),
        ('组成', r'Pico provider drivers \(lxss\.sys, lxcore\.sys\)', 150),
        ('翻译系统调用', r'The lxss\.sys and lxcore\.sys drivers translate', 90),
        ('不含 Linux 内核代码', r'The drivers do not contain code from the Linux kernel', 110),
        ('未经修改的二进制', r'By placing unmodified Linux binaries in Pico processes', 110),
        ('文件系统', r'VolFs', 260),
    ],
    'ms-2016-wsl-system-calls.html': [
        ('日期', r'Last updated on[^\n]{0,14}', 0),
        ('一一对应的例子', r'The Linux sched_yield syscall is an example', 290),
        ('没有对应物的例子', r'the Linux fork syscall has no documented equivalent', 60),
    ],
    'ms-2016-anniversary-update.html': [
        ('周年更新发布日', r'published\s+August 2, 2016', 10),
    ],
    'ms-2019-announcing-wsl2.html': [
        ('日期与作者', r'(May \d+(st|nd|rd|th)?, 2019)', 60),
        ('新架构', r'WSL 2 is a new version of the architecture', 260),
        ('真内核', r'ship(ping)? (a |an )?(real|in-house)[^.]{0,80}Linux kernel|in-house custom-built Linux kernel', 260),
        ('内核版本 4.19', r'4\.19', 200),
        ('虚拟机', r'lightweight utility (VM|virtual machine)', 240),
        ('20 倍', r'up to 20x faster', 220),
        ('完整的系统调用兼容', r'full system call compatibility', 220),
        ('Docker', r'Docker', 160),
        ('WSL 1 仍保留', r'WSL 1[^.]{0,80}(continue|remain|not going away|side by side)', 200),
        ('何时可用', r'end of June|Windows Insider', 140),
    ],
    'ms-2019-wsl2-insiders.html': [
        ('日期', r'(June \d+(st|nd|rd|th)?, 2019)', 60),
        ('预览版 18917', r'18917', 160),
    ],
    'ms-2020-wsl2-ga-2004.html': [
        ('日期', r'(March \d+(st|nd|rd|th)?, 2020)', 60),
        ('随 2004 正式提供', r'generally available in Windows 10,? version 2004', 220),
        ('内核改由 Windows Update 分发', r'Windows Update', 200),
    ],
    'ms-2020-may-2020-update.html': [
        ('2004 发布日', r'published\s+May 27, 2020', 10),
        ('即 2004 版', r'version 2004', 120),
    ],
    'ms-docs-compare-versions.html': [
        ('更新日期', r'(Last updated on|updated)[^\n]{0,40}', 30),
        ('WSL 2 是什么', r'WSL 2 uses[^.]{0,200}\.', 200),
        ('对照表：系统调用', r'Full system call compatibility', 80),
        ('对照表：跨系统文件性能', r'Performance across OS file systems', 80),
        ('WSL 1 的例外', r'Exceptions for using WSL 1 rather than WSL 2', 420),
        ('跨系统文件慢', r'across (the )?(Windows and Linux|OS) file systems', 260),
        ('真内核', r'real Linux kernel', 220),
        ('VHD', r'ext4', 200),
        ('WSL 1 是否弃用', r'(deprecat|no plans|continue to support)[^.]{0,160}', 200),
    ],
    'ms-docs-about.html': [
        ('定义', r'Windows Subsystem for Linux \(WSL\) is a feature of Windows', 260),
        ('WSL 2 默认', r'WSL 2 is the default', 200),
    ],
    'ms-docs-basic-commands.html': [
        ('set-version', r'wsl --set-version', 300),
        ('set-default-version', r'wsl --set-default-version', 300),
        ('version', r'wsl --version', 200),
    ],
    'ms-2021-wsl-in-store-preview.html': [
        ('日期', r'(October \d+(st|nd|rd|th)?, 2021)', 60),
        ('与系统版本解耦', r'decoupl|separate[sd]? WSL from|independent of|without needing to modify your Windows version', 260),
    ],
    'ms-2022-store-ga.html': [
        ('日期', r'(November \d+(st|nd|rd|th)?, 2022)', 60),
        ('1.0.0', r'1\.0\.0', 220),
        ('成为默认', r'default (experience|version)', 240),
        ('去掉 Preview', r'dropp|no longer (a )?preview|preview label', 200),
    ],
    'ms-2023-september-update.html': [
        ('日期', r'(September \d+(st|nd|rd|th)?, 2023)', 60),
        ('2.0.0', r'2\.0\.0', 240),
        ('镜像网络', r'mirrored', 200),
    ],
    'ms-2025-open-source.html': [
        ('日期', r'published\s+May 19, 2025', 10),
        ('开源', r'WSL is open source|open sourc(e|ing) WSL|now open source', 260),
        ('组成部分', r'wslservice\.exe', 300),
        ('未开源的部分', r'lxcore\.sys', 260),
        ('最初的版本', r'first (launched|released|announced)[^.]{0,200}', 240),
        ('从系统中分离', r'(split|separat|decoupl)[^.]{0,200}', 240),
    ],
    'ms-2026-wslc-ga.html': [
        ('日期与作者', r'published\s+September 29, 2026', 10),
        ('作者', r'Logan Iyer[^\n]{0,80}', 0),
        ('正式可用', r'generally available', 260),
        ('wslc.exe', r'wslc\.exe', 240),
        ('API', r'\bAPI\b', 240),
        ('如何获得', r'wsl --update', 200),
        ('compose', r'[Cc]ompose', 260),
        ('两倍', r'2x faster', 260),
        ('virtiofs', r'virtiofs|VirtioFS', 240),
        ('企业', r'Intune|Defender', 240),
        ('版本号', r'3\.0', 200),
        ('WSL 2', r'WSL ?2', 200),
    ],
    'ms-2026-wslc-architecture.html': [
        ('日期与作者', r'(September \d+(st|nd|rd|th)?, 2026)', 60),
        ('作者', r'Pierre Boulay[^\n]{0,80}', 0),
        ('服务创建虚拟机', r'wslservice\.exe', 380),
        ('会话进程', r'wslcsession\.exe', 380),
        ('会话是什么', r'[Aa] (WSLC )?session is', 320),
        ('每个会话一个存储 VHD', r'Each WSLC session has its own storage VHD', 240),
        ('卷用 virtiofs', r'virtiofs', 300),
        ('网络', r'ethernet frames', 420),
        ('容器运行时', r'containerd|dockerd|Docker engine|moby|runc', 300),
        ('内核', r'kernel', 240),
        ('与发行版的关系', r'distribution|distro', 260),
        ('WSL 2', r'WSL ?2', 240),
        ('SDK', r'SDK', 260),
        ('HCS', r'HCS', 260),
    ],
    'ms-docs-wsl-container.html': [
        ('更新日期', r'(Last updated on|updated)[^\n]{0,40}', 30),
        ('定义', r'WSL containers?[^.]{0,40} (is|are|lets|allows|provides)[^.]{0,260}\.', 60),
        ('要求', r'(requires?|prerequisite|minimum)[^.]{0,220}', 120),
        ('wslc', r'wslc ', 200),
        ('Docker', r'Docker', 240),
        ('版本', r'version 3|3\.0', 200),
    ],
    'ms-docs-system-error-codes-500-999.html': [('错误码 777 的英文原文', r'ERROR_VERSION_PARSE_ERROR', 60)],
    'ms-docs-system-error-codes-0-499.html': [('错误码 0 的英文原文', r'ERROR_SUCCESS\b', 60)],
    'media-windowslatest-2026-06-28.html': [
        ('转述 Loewen', r'there is no such thing as WSL 3', 260),
    ],
    'media-linuxadictos-2026-10-01.html': [
        ('标题', r'WSL 3\.0 is here', 120),
        ('此前的否认', r'Why was it said that WSL 3 didn', 420),
    ],
    'media-techtimes-2026-06-02.html': [('标题里的 WSL 3', r'WSL 3[^\n]{0,140}', 0)],
    'media-xda-wsl3.html': [('标题里的 WSL 3', r'WSL 3[^\n]{0,140}', 0)],
    'media-itconnect-wsl3.html': [('标题里的 WSL 3', r'WSL 3[^\n]{0,140}', 0)],
    'media-phoronix-wsl-3.0.2.html': [('3.0.2', r'WSL 3\.0\.2[^\n]{0,200}', 0)],
}


def page_text(path):
    s = open(path, encoding='utf-8', errors='replace').read()
    meta = {}
    for k in ('article:published_time', 'article:modified_time', 'og:title', 'og:site_name'):
        m = (re.search(r'<meta[^>]+(?:property|name)="%s"[^>]+content="([^"]*)"' % re.escape(k), s)
             or re.search(r'<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="%s"' % re.escape(k), s))
        if m:
            meta[k] = html.unescape(m.group(1))
    for k, pat in (('ld:datePublished', r'"datePublished"\s*:\s*"([^"]+)"'), ('ld:dateModified', r'"dateModified"\s*:\s*"([^"]+)"'),
                   ('ms.date', r'<meta name="ms\.date" content="([^"]+)"'), ('updated_at', r'<meta name="updated_at" content="([^"]+)"'),
                   ('title', r'<title[^>]*>([^<]+)</title>')):
        m = re.search(pat, s)
        if m:
            meta[k] = html.unescape(m.group(1)).strip()
    b = re.sub(r'<(script|style|noscript|svg)[^>]*>.*?</\1>', ' ', s, flags=re.S | re.I)
    b = re.sub(r'<(/p|/h\d|/li|br ?/?|/div|/tr|/td|/th)>', '\n', b)
    b = html.unescape(re.sub(r'<[^>]+>', '', b)).replace('\xa0', ' ')
    b = re.sub(r'[ \t\r\f\v]+', ' ', b)
    b = re.sub(r'\n\s*\n+', '\n', b)
    return meta, b


def main():
    only = sys.argv[1:]
    for name, items in PAGES.items():
        if only and name not in only:
            continue
        path = os.path.join(WEB, name)
        if not os.path.exists(path):
            print(f'===== {name}\n  [未取回]\n')
            continue
        meta, body = page_text(path)
        print(f'===== {name}')
        for k, v in meta.items():
            print(f'  {k}: {v}')
        for label, pat, after in items:
            ms = list(re.finditer(pat, body, flags=re.I))
            if not ms:
                print(f'  [未命中] {label}: /{pat}/')
                continue
            seen = set()
            for m in ms[:3]:
                a = max(0, m.start() - 90)
                e = min(len(body), m.end() + after)
                frag = ' '.join(body[a:e].split())
                key = frag[:80]
                if key in seen:
                    continue
                seen.add(key)
                print(f'  · {label}: …{frag}…')
        print()

    # ── 接口响应 ──
    def load(n):
        with open(os.path.join(WEB, n), encoding='utf-8') as f:
            return json.load(f)

    if not only:
        t = load('x-loewen-2069420597487055276.json')
        tw = t.get('tweet', t)
        print('===== x-loewen-2069420597487055276.json（经 fxtwitter 镜像接口取回的帖子原文）')
        print('  author:', tw['author']['name'], '@' + tw['author']['screen_name'])
        print('  author.description:', tw['author'].get('description'))
        print('  created_at:', tw.get('created_at'))
        print('  url:', tw.get('url'))
        print('  text:', json.dumps(tw.get('text'), ensure_ascii=False))
        print()
        for n in ('gh-release-3.0.1.json', 'gh-release-3.0.2.json'):
            r = load(n)
            print(f'===== {n}')
            for k in ('tag_name', 'name', 'prerelease', 'draft', 'created_at', 'published_at', 'html_url'):
                print(f'  {k}: {r[k]}')
            body = r['body'].replace('\r', '')
            head = body.split("## What's Changed")[0].strip()
            if head:
                print('  正文开头:', ' / '.join(x.strip() for x in head.split('\n') if x.strip()))
            m = re.search(r'\*\*Full Changelog\*\*: (\S+)', body)
            print('  Full Changelog:', m.group(1) if m else '-')
            print('  条目数:', len(re.findall(r'^\* ', body, flags=re.M)))
            for line in body.split('\n'):
                if re.search(r'(?i)wslc|container|consomm|virtiofs|sparse|vNUMA|kernel', line):
                    print('  ·', line.strip()[:200])
            print()
        k1, k2, kr = load('gh-kernel-tags-4.19.json'), load('gh-kernel-tags-msft-4.19.json'), load('gh-kernel-releases.json')
        print('===== gh-kernel-*.json（microsoft/WSL2-Linux-Kernel）')
        names = sorted([x['ref'].split('/')[-1] for x in k1 + k2], key=lambda n: [int(v) for v in re.findall(r'\d+', n)[:3]])
        print('  4.19 系列的标签共', len(names), '个；最早', names[0], '，最晚', names[-1])
        kr = sorted(kr, key=lambda x: x['published_at'])
        print('  发布共', len(kr), '个；最早', kr[0]['tag_name'], kr[0]['published_at'][:10], '；最晚', kr[-1]['tag_name'], kr[-1]['published_at'][:10])
        for x in kr:
            if '6.18.40.1' in x['tag_name']:
                print('  ·', x['tag_name'], x['published_at'])
        print()
        g = load('gh-repo.json')
        print('===== gh-repo.json')
        for k in ('full_name', 'description', 'created_at', 'default_branch'):
            print(f'  {k}: {g[k]}')
        print('  license:', (g.get('license') or {}).get('spdx_id'))


if __name__ == '__main__':
    main()
