"""05 取 Hub 自己公布的参数量口径，与 02 的数法互相印证。

Hugging Face 的模型 API 会返回一个 safetensors 段：它按 dtype 分类给出参数量，
total 是总数。这个数是 Hub 从仓库里的 safetensors 算的，与 02 在本地按张量
shape 数出来的是两条独立路径；两者相等，才能说「参数量」这个数是可复算的。

顺带取 config 与模型卡里的字段，看 Hub 上「一个模型有多少参数」是怎么呈现的。
仓库清单见 models.py。

来源：https://huggingface.co/api/models/<repo>
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hfutil as H
import models


def main():
    print("=" * 100)
    print("05  Hub 公布的参数量（API 的 safetensors 段）—— 2026-10-20", flush=True)
    print("=" * 100, flush=True)
    for repo, label in models.REPOS:
        api = H.get_json(f"api/models/{repo}")
        st = api.get("safetensors") or {}
        params = st.get("parameters") or {}
        total = st.get("total")
        print(f"\n--- {repo}   （{label}）", flush=True)
        print(f"    仓库 commit (sha)         {api.get('sha')}", flush=True)
        print(f"    仓库创建时间               {api.get('createdAt')}", flush=True)
        print(f"    最后更新                   {api.get('lastModified')}", flush=True)
        print(f"    库 / 任务                  {api.get('library_name')} / {api.get('pipeline_tag')}", flush=True)
        print(f"    点赞 / 下载                {api.get('likes')} / {api.get('downloads')}", flush=True)
        print(f"    gated（是否需要登录）       {api.get('gated')}", flush=True)
        print(f"    Hub 公布：按 dtype         {params}", flush=True)
        print(f"    Hub 公布：总参数量         {total:,}  = {H.fmt(total)}" if total
              else "    Hub 公布：总参数量         （无 safetensors 段）", flush=True)
        cfg = api.get("config") or {}
        print(f"    API 的 config.architectures {cfg.get('architectures')}", flush=True)
        card = api.get("cardData") or {}
        print(f"    模型卡 cardData 字段        {sorted(card.keys())}", flush=True)
    print()


if __name__ == "__main__":
    main()
