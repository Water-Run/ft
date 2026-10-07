#!/usr/bin/env python3
"""把 GitHub 上 microsoft/WSL 的全部发布记录整理成一张表。

输入：01_fetch_sources.py 取回的 gh-releases-p*.json（GitHub REST 接口 /repos/microsoft/WSL/releases 的原始响应）。
用法：python research/lab/03_releases.py > research/lab/out_03_releases.tsv
输出：每个发布一行（按发布时刻升序）：标签、发布时刻（UTC）、是否预发布、主版本号；末尾以 # 开头的行是汇总。
只取标签、时刻与预发布标记这三项事实，不含发布说明的正文。
"""
import glob
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(HERE, '..', '_src', 'web')


def main():
    rel = []
    for p in sorted(glob.glob(os.path.join(WEB, 'gh-releases-p*.json'))):
        with open(p, encoding='utf-8') as f:
            rel += json.load(f)
    rows = {}
    for r in rel:
        if r.get('draft'):
            continue
        m = re.match(r'^v?(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?$', r['tag_name'])
        rows[r['tag_name']] = (r['published_at'], r['tag_name'], bool(r['prerelease']), int(m.group(1)) if m else -1)
    rows = sorted(rows.values())
    print('tag\tpublished_utc\tprerelease\tmajor')
    for pub, tag, pre, major in rows:
        print(f'{tag}\t{pub}\t{int(pre)}\t{major}')
    print(f'# 共 {len(rows)} 个发布；最早 {rows[0][1]}（{rows[0][0]}），最晚 {rows[-1][1]}（{rows[-1][0]}）')
    for major in sorted({r[3] for r in rows}):
        sub = [r for r in rows if r[3] == major]
        stable = [r for r in sub if not r[2]]
        first_stable = f'{stable[0][1]}（{stable[0][0]}）' if stable else '无'
        print(f'# 主版本 {major}：{len(sub)} 个，其中非预发布 {len(stable)} 个；首个 {sub[0][1]}（{sub[0][0]}），'
              f'首个非预发布 {first_stable}，最后一个 {sub[-1][1]}（{sub[-1][0]}）')


if __name__ == '__main__':
    main()
