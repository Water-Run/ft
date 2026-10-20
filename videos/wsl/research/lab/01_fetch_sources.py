#!/usr/bin/env python3
"""取回本片引用的原始网页与接口响应，原样存到 research/_src/web/（不入库），并打印索引。

用法：python research/lab/01_fetch_sources.py [名称 …]      # 不带参数时取全部；已取回的跳过，--force 重取
输出：每个来源一行（名称、HTTP 状态、字节数、SHA-256、取回时刻、地址），重定向到 out_01_fetch_sources.txt 存档。
第三方网页各有自己的版权，这里只存校验和与获取方式；片中引用的原文片段由 02_extract.py 从这些文件里摘出。
"""
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.join(HERE, '..', '_src', 'web')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0 Safari/537.36'

# 名称 → 地址。名称同时是存档的文件名。
SOURCES = {
    # ── WSL 1（2016）──
    'ms-2016-bash-on-ubuntu.html': 'https://blogs.windows.com/windowsdeveloper/2016/03/30/run-bash-on-ubuntu-on-windows/',
    'ms-2016-build-14316.html': 'https://blogs.windows.com/windows-insider/2016/04/06/announcing-windows-10-insider-preview-build-14316/',
    'ms-2016-wsl-overview.html': 'https://learn.microsoft.com/en-us/archive/blogs/wsl/windows-subsystem-for-linux-overview',
    'ms-2016-pico-process.html': 'https://learn.microsoft.com/en-us/archive/blogs/wsl/pico-process-overview',
    'ms-2016-wsl-system-calls.html': 'https://learn.microsoft.com/en-us/archive/blogs/wsl/wsl-system-calls',
    'ms-2016-wsl-file-system.html': 'https://learn.microsoft.com/en-us/archive/blogs/wsl/wsl-file-system-support',
    'ms-2016-anniversary-update.html': 'https://blogs.windows.com/windowsexperience/2016/08/02/how-to-get-the-windows-10-anniversary-update/',
    # ── WSL 2（2019–2020）──
    'ms-2019-announcing-wsl2.html': 'https://devblogs.microsoft.com/commandline/announcing-wsl-2/',
    'ms-2019-wsl2-insiders.html': 'https://devblogs.microsoft.com/commandline/wsl-2-is-now-available-in-windows-insiders/',
    'ms-2020-wsl2-ga-2004.html': 'https://devblogs.microsoft.com/commandline/wsl2-will-be-generally-available-in-windows-10-version-2004/',
    'ms-2020-may-2020-update.html': 'https://blogs.windows.com/windowsexperience/2020/05/27/how-to-get-the-windows-10-may-2020-update/',
    'ms-docs-compare-versions.html': 'https://learn.microsoft.com/en-us/windows/wsl/compare-versions',
    'ms-docs-about.html': 'https://learn.microsoft.com/en-us/windows/wsl/about',
    'ms-docs-basic-commands.html': 'https://learn.microsoft.com/en-us/windows/wsl/basic-commands',
    # ── 软件包版本（2021–2025）──
    'ms-2021-wsl-in-store-preview.html': 'https://devblogs.microsoft.com/commandline/a-preview-of-wsl-in-the-microsoft-store-is-now-available/',
    'ms-2022-store-ga.html': 'https://devblogs.microsoft.com/commandline/the-windows-subsystem-for-linux-in-the-microsoft-store-is-now-generally-available-on-windows-10-and-11/',
    'ms-2023-september-update.html': 'https://devblogs.microsoft.com/commandline/windows-subsystem-for-linux-september-2023-update/',
    'ms-2025-open-source.html': 'https://blogs.windows.com/windowsdeveloper/2025/05/19/the-windows-subsystem-for-linux-is-now-open-source/',
    # ── 3.0 与 WSL 容器（2026）──
    'ms-2026-wslc-ga.html': 'https://blogs.windows.com/windowsdeveloper/2026/09/29/wsl-containers-now-generally-available/',
    'ms-2026-wslc-architecture.html': 'https://devblogs.microsoft.com/commandline/wslc-architecture-deep-dive/',
    'ms-docs-wsl-container.html': 'https://learn.microsoft.com/en-us/windows/wsl/wsl-container',
    'gh-release-3.0.1.json': 'https://api.github.com/repos/microsoft/WSL/releases/tags/3.0.1',
    'gh-release-3.0.2.json': 'https://api.github.com/repos/microsoft/WSL/releases/tags/3.0.2',
    'gh-releases-p1.json': 'https://api.github.com/repos/microsoft/WSL/releases?per_page=100&page=1',
    'gh-releases-p2.json': 'https://api.github.com/repos/microsoft/WSL/releases?per_page=100&page=2',
    'gh-releases-p3.json': 'https://api.github.com/repos/microsoft/WSL/releases?per_page=100&page=3',
    'gh-releases-p4.json': 'https://api.github.com/repos/microsoft/WSL/releases?per_page=100&page=4',
    'gh-repo.json': 'https://api.github.com/repos/microsoft/WSL',
    # 微软的 WSL 2 内核仓库：最早的一批标签（印证首批内核为 4.19）与全部发布（印证实测的内核版本）
    'gh-kernel-tags-4.19.json': 'https://api.github.com/repos/microsoft/WSL2-Linux-Kernel/git/matching-refs/tags/4.19',
    'gh-kernel-tags-msft-4.19.json': 'https://api.github.com/repos/microsoft/WSL2-Linux-Kernel/git/matching-refs/tags/linux-msft-4.19',
    'gh-kernel-releases.json': 'https://api.github.com/repos/microsoft/WSL2-Linux-Kernel/releases?per_page=100',
    # ── 报错信息的英文原文（Win32 系统错误码）──
    'ms-docs-system-error-codes-0-499.html': 'https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-',
    'ms-docs-system-error-codes-500-999.html': 'https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--500-999-',
    # ── 「没有 WSL 3」──
    'x-loewen-2069420597487055276.json': 'https://api.fxtwitter.com/craigaloewen/status/2069420597487055276',
    'media-windowslatest-2026-06-28.html': 'https://www.windowslatest.com/2026/06/28/microsoft-denies-wsl-3-exists-reveals-windows-11s-wsl-containers-ship-next-week/',
    'media-linuxadictos-2026-10-01.html': 'https://en.linuxadictos.com/WSL-3.0-is-here%21-Microsoft-reinvents-its-Linux-integration-in-Windows.html',
    'media-phoronix-wsl-3.0.2.html': 'https://www.phoronix.com/news/Microsoft-WSL-3.0.2',
    'media-techtimes-2026-06-02.html': 'https://www.techtimes.com/articles/317598/20260602/wsl-3-build-2026-near-native-gpu-npu-passthrough-brings-local-ai-windows.htm',
    'media-xda-wsl3.html': 'https://www.xda-developers.com/wsl-3-will-finally-let-linux-apps-use-your-gpu-without-the-performance-tax/',
    'media-itconnect-wsl3.html': 'https://www.it-connect.tech/microsoft-unveils-wsl-3-and-wsl-containers-for-windows/',
}


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': '*/*', 'Accept-Language': 'en-US,en;q=0.9'})
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return r.status, r.read(), r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, e.read(), url
    except Exception as e:  # 网络错误：记下来，不中断其余来源
        return 0, str(e).encode(), url


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    force = '--force' in sys.argv
    os.makedirs(DEST, exist_ok=True)
    meta_path = os.path.join(DEST, '_index.json')
    meta = json.load(open(meta_path, encoding='utf-8')) if os.path.exists(meta_path) else {}
    for name, url in SOURCES.items():
        if args and name not in args:
            continue
        path = os.path.join(DEST, name)
        if os.path.exists(path) and name in meta and meta[name]['status'] == 200 and not force:
            continue
        status, body, final = fetch(url)
        if status == 200:
            with open(path, 'wb') as f:
                f.write(body)
        meta[name] = {
            'url': url, 'final_url': final, 'status': status, 'bytes': len(body) if status == 200 else 0,
            'sha256': hashlib.sha256(body).hexdigest() if status == 200 else '',
            'fetched_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'error': '' if status == 200 else body[:160].decode('utf-8', 'replace'),
        }
        time.sleep(0.4)
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)
    print('# 名称\tHTTP\t字节\tSHA-256\t取回时刻(UTC)\t地址')
    for name in SOURCES:
        m = meta.get(name)
        if not m:
            print(f'{name}\t-\t-\t-\t-\t{SOURCES[name]}')
            continue
        print(f"{name}\t{m['status']}\t{m['bytes']}\t{m['sha256']}\t{m['fetched_utc']}\t{m['url']}")
        if m['status'] != 200:
            print(f"#   未取回：{m['error']!r}")


if __name__ == '__main__':
    main()
