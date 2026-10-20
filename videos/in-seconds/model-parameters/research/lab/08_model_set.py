"""08 本片四个仓库的底账：分片数、索引、Hub 公布数、是否 gated。

选定模型集时用的小检查：确认每个仓库都能匿名访问、都有 safetensors，
以及分片多少（决定实验 02 用「全读头」还是「索引换算 + 抽查」）。
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hfutil as H
import models


def main():
    print("=" * 100)
    print("08  本片模型集底账 —— 2026-10-20", flush=True)
    print("=" * 100, flush=True)
    for repo, label in models.REPOS + [(models.MOE, "混合专家例子")]:
        try:
            shards, index = H.weight_files(repo)
            api = H.get_json(f"api/models/{repo}")
            st = (api.get("safetensors") or {}).get("total")
            print(f"    {repo:<40} 分片 {len(shards):>4}  索引 {'有' if index else '无':<3} "
                  f"参数 {st if st else '—'}  createdAt {api.get('createdAt')}  "
                  f"gated {api.get('gated')}  赞 {api.get('likes')}  下载 {api.get('downloads')}", flush=True)
        except Exception as e:  # noqa: BLE001
            print(f"    {repo:<40} 失败：{str(e)[:60]}", flush=True)
    print()


if __name__ == "__main__":
    main()
