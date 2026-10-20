"""把 approval.json 的内容哈希更新到当前稿（状态仍为 pending）。

用法：python 14_sync_approval.py <视频目录>
"""

import hashlib
import json
import os
import sys


def main():
    video = sys.argv[1]
    ap = os.path.join(video, "review", "approval.json")
    with open(ap, encoding="utf-8") as fh:
        state = json.load(fh)

    # 以 review/ 里最新的导出稿为准（按修改时间，不按哈希字典序）
    reviews = os.path.join(video, "review")
    latest, latest_mtime = None, -1
    for name in os.listdir(reviews):
        if name.startswith("script.") and name.endswith(".md"):
            stem = name[:-3]
            parts = stem.rsplit(".", 1)
            if len(parts) == 2 and len(parts[1]) == 64:
                mtime = os.path.getmtime(os.path.join(reviews, name))
                if mtime > latest_mtime:
                    latest, latest_mtime = parts[1], mtime

    if latest is None:
        raise SystemExit("review/ 里没有导出的校对稿")

    for lang, item in (state.get("languages") or {}).items():
        item["content_sha256"] = latest
    state["languages"] = state["languages"]

    with open(ap, "w", encoding="utf-8") as fh:
        json.dump(state, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print("approval.json 的内容哈希已更新为", latest)


if __name__ == "__main__":
    main()
