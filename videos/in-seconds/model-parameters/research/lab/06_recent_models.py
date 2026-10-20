"""06 按策划者的要求选模型：不能太老，至少是 2026 年 8 月之后发布的。

（策划者 2026-10-20 原话：「模型不要太老，至少 26 年 8 月之后的」；
并指出「qwen3 这种一年半前的模型就属于典型的太老」。）

两条路一起走：
  甲  候选核对：把 2026 年 9–10 月公开发布的模型逐个查 Hub API，看 createdAt、
      参数量、配置字段与是否带 safetensors。候选来自当月的公开发布综述。
  乙  热度扫描：Hub 的 API 没有「创建时间晚于某天」的过滤条件，只能反过来取——
      按点赞、趋势、下载分别取一批生成式模型，再筛 createdAt 晚于 2026-08-01 的。

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

# 甲：2026 年 9–10 月公开发布的模型（据当月发布综述，仓库名待核）
CANDIDATES = [
    "deepseek-ai/DeepSeek-V4.1-Flash",
    "zai-org/GLM-5.3-FlashX",
    "zai-org/GLM-5.2",
    "stepfun-ai/Step-5",
    "stepfun-ai/Step-5-Pro",
    "XiaomiMiMo/MiMo-V2.6-Flash",
    "XiaomiMiMo/MiMo-V2.6",
    "ChinaTelecom/Xing4.0-29B-A4B",
    "ZDTaichu/ZDTaichu5.0-9B",
    "zai-org/ZDTaichu5.0-9B",
    "xai-org/grok-4.7",
    "moonshotai/Kimi-K3",
    "moonshotai/Kimi-K3-Instruct",
    "Qwen/Qwen3.5-9B",
    "Qwen/Qwen3.5-4B",
    "tencent/Hunyuan-M2.7",
    "MiniMaxAI/MiniMax-M3",
    "inclusionAI/Ling-2.0",
]


def api_list(params):
    # 注意：H.get_json 会自己拼上 https://huggingface.co，这里只能给相对路径
    return H.get_json("api/models?" + urllib.parse.urlencode(params))

def show(mid, api):
    st = api.get("safetensors") or {}
    total = st.get("total")
    names = [s["rfilename"] for s in api.get("siblings", [])]
    has_w = any(n.endswith(".safetensors") for n in names)
    try:
        cfg = H.fetch_config(mid)
    except Exception:  # noqa: BLE001
        cfg = {}
    fields = ""
    if cfg:
        fields = (f"层{cfg.get('num_hidden_layers')} 隐{cfg.get('hidden_size')} "
                  f"头{cfg.get('num_attention_heads')} 上限{cfg.get('max_position_embeddings')} "
                  f"词表{cfg.get('vocab_size')}")
        if cfg.get("num_local_experts") or cfg.get("num_experts"):
            fields += f" 专家{cfg.get('num_local_experts') or cfg.get('num_experts')}/每token{cfg.get('num_experts_per_tok')}"
    print(f"    {mid:<44} 创建 {(api.get('createdAt') or '')[:19]:<20} 更新 {(api.get('lastModified') or '')[:10]}"
          f" 赞{api.get('likes') or 0:>5} 载{(api.get('downloads') or 0):>9} "
          f"{H.fmt(total) if total else '—':>9}  {fields}{'' if has_w else '  [无 safetensors]'}", flush=True)


def main():
    print("=" * 116)
    print(f"06  筛选 {CUTOFF} 之后发布的模型 —— 2026-10-20", flush=True)
    print("=" * 116, flush=True)

    print("\n【甲】候选核对（2026 年 9–10 月公开发布的模型）", flush=True)
    for mid in CANDIDATES:
        try:
            api = H.get_json(f"api/models/{mid}")
        except Exception as e:  # noqa: BLE001
            print(f"    {mid:<44} 取不到：{str(e)[:60]}", flush=True)
            continue
        show(mid, api)
        time.sleep(0.2)
    print("\n【乙】热度扫描：按点赞 / 趋势 / 下载取，再筛创建时间", flush=True)
    seen = {}
    for sort in SORTS:
        for page in range(PAGES):
            try:
                rows = api_list({"sort": sort, "direction": -1, "limit": LIMIT,
                                 "offset": page * LIMIT, "filter": "text-generation",
                                 "full": "false"})
            except Exception as e:  # noqa: BLE001
                print(f"    取 {sort} 第 {page + 1} 页失败：{str(e)[:60]}", flush=True)
                break
            if not rows:
                break
            for m in rows:
                seen.setdefault(m["id"], m)
            time.sleep(0.3)
    print(f"    取到的仓库数                  {len(seen)}", flush=True)
    fresh = [m for m in seen.values() if (m.get("createdAt") or "") >= CUTOFF]
    fresh.sort(key=lambda m: -(m.get("likes") or 0))
    print(f"    其中创建于 {CUTOFF} 之后的     {len(fresh)}", flush=True)
    print(f"    {'仓库':<44} {'创建':<20} {'赞':>5} {'下载':>10} {'参数':>10}  关键字段", flush=True)
    for m in fresh[:25]:
        mid = m["id"]
        try:
            api = H.get_json(f"api/models/{mid}")
        except Exception:  # noqa: BLE001
            continue
        show(mid, api)
        time.sleep(0.2)
    print()


if __name__ == "__main__":
    main()
