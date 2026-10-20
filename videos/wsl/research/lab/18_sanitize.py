#!/usr/bin/env python3
"""回显入库前的脱敏与折叠。对 out_1*.txt 原地处理，可重复执行。

用法：python research/lab/18_sanitize.py --user <测试机的用户名> --host <测试机的主机名>
要替换掉的用户名与主机名由参数给出，不写在脚本里。做四件事，并在每个被改动的文件头部留一行说明：
  1. 删去每条 wsl 命令之前重复出现的同一行提示（本机设了回环代理时 wsl.exe 打印的「检测到 localhost 代理配置…」）；
  2. 用户名 → <用户>，主机名 → <主机>；
  3. 私有网段的地址（10/8、172.16/12 中非 docker 默认网桥的部分、192.168/16）→ <内网地址>；docker 默认网桥 172.17.0.0/16 保留；
  4. 会话虚拟机里 ps 列出的内核线程折成一行计数，只保留用户态进程。
"""
import argparse
import glob
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
PROXY = '检测到 localhost 代理配置'
NOTE = '# 入库前处理（18_sanitize.py）：'
USERLAND = {'init', 'GnsEngine', 'PortRelay', 'containerd', 'dockerd', 'containerd-shim', 'sleep', 'ps', 'nc', 'cat'}
PRIVATE = re.compile(r'\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b')


def keep_ip(m):
    ip = m.group(0)
    return ip if ip.startswith('172.17.') else '<内网地址>'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--user', required=True)
    ap.add_argument('--host', required=True)
    a = ap.parse_args()
    for path in sorted(glob.glob(os.path.join(HERE, 'out_1*.txt'))):
        with open(path, encoding='utf-8') as f:
            lines = f.read().replace('\r\n', '\n').split('\n')
        lines = [l for l in lines if not l.startswith(NOTE)]
        did = []
        n0 = len(lines)
        lines = [l for l in lines if PROXY not in l]
        if len(lines) != n0:
            did.append(f'删去 {n0 - len(lines)} 行重复的代理提示')
        out, in_ps, kthreads, swapped, ips = [], False, 0, 0, 0
        for l in lines:
            if l.startswith('PS> wslc system session run ps '):
                in_ps = True
            elif in_ps and l.startswith('[exit='):
                if kthreads:
                    out.append(f'  （其余 {kthreads} 个内核线程从略）')
                    did.append(f'折叠 {kthreads} 个内核线程')
                in_ps, kthreads = False, 0
            elif in_ps and re.match(r'^\s*\d+\s+\S', l):
                if l.split(None, 1)[1].strip() not in USERLAND:
                    kthreads += 1
                    continue
            new = l
            for old, rep in ((a.user, '<用户>'), (a.host, '<主机>')):
                if old and old.lower() in new.lower():
                    new = re.sub(re.escape(old), rep, new, flags=re.I)
            swapped += new != l
            new2 = PRIVATE.sub(keep_ip, new)
            ips += new2 != new
            out.append(new2)
        if swapped:
            did.append(f'{swapped} 行里的用户名或主机名已替换')
        if ips:
            did.append(f'{ips} 行里的内网地址已替换')
        # 已折叠过的文件再次执行时保留原有的「从略」行，不重复记
        if did:
            out.insert(0, NOTE + '；'.join(dict.fromkeys(did)) + '。')
        text = '\n'.join(out).rstrip('\n') + '\n'
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)
        print(os.path.basename(path), '：', '；'.join(dict.fromkeys(did)) if did else '无需处理')


if __name__ == '__main__':
    main()
