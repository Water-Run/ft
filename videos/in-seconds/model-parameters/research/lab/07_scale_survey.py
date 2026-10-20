"""07 量级普查：2026-08-01 之后发布、且被用起来的模型，各有多少参数。

用实验 06 筛出的候选集合，按点赞 / 趋势 / 下载取到的公开仓库，逐个查 API，
记录：创建时间、点赞、下载、Hub 公布的参数量、配置里的关键字段。
按参数量排序，给出「同一口径下的量级跨度」——本片画面上那一列数字的来源。

只用 Hub API 的公开字段，不下载权重。
来源：https://huggingface.co/api/models
"""

import sys
import time
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hfutil as H

CUTOFF = "2026-08-01"
SORTS = ["likes", "trendingScore", "downloads"]
PAGES = 3
LIMIT = 100


def api_list(params):
    return H.get_json("api/models?" + urllib.parse.urlencode(params))


def main():
    print("=" * 112)
    print(f"07  2026-08-01 之后发布的模型的参数量普查 —— 2026-10-20", flush=True)
    print("=" * 112, flush=True)
    seen = {}
    for sort in SORTS:
        for page in range(PAGES):
            try:
                rows = api_list({"sort": sort, "direction": -1, "limit": LIMIT,
                                 "offset": page * LIMIT, "filter": "text-generation",
                                 "full": "false"})
            except Exception as e:  # noqa: BLE001
                print(f"    取 {sort} 第 {page + 1} 页失败：{str(e)[:50]}", flush=True)
                break
            if not rows:
                break
            for m in rows:
                seen.setdefault(m["id"], m)
            time.sleep(0.2)
    fresh = [m for m in seen.values() if (m.get("createdAt") or "") >= CUTOFF]
    fresh.sort(key=lambda m: -(m.get("likes") or 0))
    print(f"    候选仓库数 {len(seen)}，其中创建于 {CUTOFF} 之后的 {len(fresh)}", flush=True)
    print()

    rows = []
    for m in fresh:
        mid = m["id"]
        try:
            api = H.get_json(f"api/models/{mid}")
        except Exception:  # noqa: BLE001
            continue
        st = api.get("safetensors") or {}
        total = st.get("total")
        try:
            cfg = H.fetch_config(mid)
        except Exception:  # noqa: BLE001
            cfg = {}
        text = cfg.get("text_config") if isinstance(cfg.get("text_config"), dict) else cfg
        fields = ""
        if text:
            fields = (f"层{text.get('num_hidden_layers')} 隐{text.get('hidden_size')} "
                      f"头{text.get('num_attention_heads')} 上限{text.get('max_position_embeddings')} "
                      f"词表{text.get('vocab_size')}")
            ne = text.get("num_local_experts") or text.get("n_routed_experts") or text.get("num_experts")
            if ne:
                fields += f" 专家{ne}/每token{text.get('num_experts_per_tok')}"
        rows.append({
            "id": mid, "created": (api.get("createdAt") or "")[:10],
            "likes": api.get("likes") or 0, "downloads": api.get("downloads") or 0,
            "params": total, "fields": fields, "gated": api.get("gated"),
        })
        time.sleep(0.15)

    withw = [r for r in rows if r["params"]]
    withw.sort(key=lambda r: r["params"])
    print(f"    查到参数量的模型数 {len(withw)}（共查 {len(rows)} 个）", flush=True)
    print()
    print(f"    {'仓库':<44} {'创建':<11} {'赞':>5} {'参数':>10}  关键字段", flush=True)
    print("    " + "-" * 104)
    for r in withw:
        print(f"    {r['id']:<44} {r['created']:<11} {r['likes']:>5} {H.fmt(r['params']):>10}  {r['fields']}", flush=True)
    print()
    print("    跨度：", flush=True)
    print(f"      最小 {withw[0]['id']}  {withw[0]['params']:,}  = {H.fmt(withw[0]['params'])}", flush=True)
    print(f"      最大 {withw[-1]['id']}  {withw[-1]['params']:,}  = {H.fmt(withw[-1]['params'])}", flush=True)
    print(f"      中位 {withw[len(withw) // 2]['id']}  {withw[len(withw) // 2]['params']:,}", flush=True)
    print()


if __name__ == "__main__":
    main()
