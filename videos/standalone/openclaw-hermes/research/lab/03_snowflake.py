#!/usr/bin/env python3
"""取证脚本 03：由 X（Twitter）帖子编号换算发布时间（雪花 ID：高位是自 2010-11-04 起的毫秒数）。
两个帖子的编号取自检索结果中的帖子地址（作者 steipete 的公开帖子）；本脚本只做换算，不抓取帖子正文。
独立印证：Forbes 2026-02-16 的报道标题与 OpenClaw 仓库 README 的基金会说明（见 FACTS.md）。
用法：python3 03_snowflake.py > out_13_x_posts.json
"""
import datetime, json
EPOCH_MS = 1288834974657
POSTS = {
    'joins_openai': {'url': 'https://x.com/steipete/status/2023154018714100102', 'id': 2023154018714100102},
    'foundation_independent': {'url': 'https://x.com/steipete/status/2075046949896736835', 'id': 2075046949896736835},
}
out = {}
for k, v in POSTS.items():
    t = datetime.datetime.fromtimestamp(((v['id'] >> 22) + EPOCH_MS) / 1000, datetime.timezone.utc)
    out[k] = {'url': v['url'], 'utc': t.strftime('%Y-%m-%dT%H:%M:%SZ'), 'date': t.strftime('%Y-%m-%d')}
print(json.dumps(out, indent=1))
