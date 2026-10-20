# 取证数据 → 画面数据：读 research/lab/ 的实验结果，写 src/js/data.js。
# 画面上的 token 切分、参数个数、权重原值、逐层的块大小、路由选中的专家、模型卡原文都出自这里，场景代码不手写这些数。
# 用法：python tools/gen_data.py（在本片目录下，或任意目录）。只用标准库。
# 上游：research/lab/02_params.py 与 03_route.py（OLMoE 实测）、04_qwen_params.py 与 06_qwen_detail.py（Qwen3.8 文件头计数与权重原值）、
#       05_tokenize.py（Qwen3.8 分词器）、07_cards.py（模型卡原文）、08_flash.py 与 10_flash_card.py（Qwen3.8-Flash-Next 的文件头计数与模型卡）、
#       09_survey.py（2026 年 6 月以后的开源模型）、11_recipes.py（vLLM 部署指南的显卡用量）；各自的回显在同目录的 out_*.txt。
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.join(HERE, "..", "research", "lab")
load = lambda n: json.load(open(os.path.join(LAB, n), encoding="utf-8"))
tok, qp, qd, ol, rt, cards = load("tokens.json"), load("qwen_params.json"), load("qwen_detail.json"), load("params.json"), load("route.json"), load("cards.json")
fl, fc, sv, rc = load("flash.json"), load("flash_card.json"), load("survey.json"), load("recipes.json")

d27, dmx = qp["Qwen/Qwen3.8-27B"], qp["Qwen/Qwen3.8-2.4T-A95B"]
c27, cmx = cards["Qwen/Qwen3.8-27B"], cards["Qwen/Qwen3.8-2.4T-A95B"]
x27, xmx = qd["27B"], qd["2.4T"]
LAYER = 7   # OLMoE 的第 8 层（编号 7）：画面上的路由用这一层
# 自洽性核对：文件头逐类计数 = 逐层计数之和 + 层外部分；激活参数按 04 的口径复算
assert d27["layers"] == x27["layers"] == int(c27["layers"]["text"]) == 64
assert dmx["layers"] == xmx["layers"] == int(cmx["layers"]["text"]) == 92
assert d27["cats"]["ffn"] == x27["ffn"][0] * 64
assert d27["cats"]["attention"] == sum(x27["attention"]["linear"]) * 48 + sum(x27["attention"]["full"]) * 16
pl = xmx["per_layer"]
assert dmx["cats"]["routed_experts"] == pl["routed"][0] * 92 and xmx["expert"] * 512 == pl["routed"][0]
assert dmx["active"] == dmx["lm"] - dmx["cats"]["routed_experts"] + dmx["cats"]["routed_experts"] * 10 // 512
assert int(cmx["experts"]["text"]) == dmx["experts"] == 512 and dmx["topk"] == 10
assert ol["cats"]["experts"] == 3 * ol["hidden"] * ol["ffn"] * ol["experts"] * ol["layers"] and ol["cats"]["attention"] % ol["layers"] == 0
for row, ex, w in zip(rt["route"][LAYER]["probs"], rt["route"][LAYER]["experts"], rt["route"][LAYER]["weights"]):
    assert abs(sum(row) - 1) < 1e-3 and sorted(range(64), key=lambda i: -row[i])[:8] == ex and all(abs(row[e] - x) < 1e-4 for e, x in zip(ex, w))
assert len(rt["route"]) == ol["layers"] == 16 and all(len(e) == 8 for e in rt["route"][7]["experts"])

# Flash-Next：文件头计数（08）与模型卡（10）对得上
fpl = fl["per_layer"]
assert int(fc["layers"]["text"]) == 48 and int(fc["experts"]["text"]) == 512 and fc["activated"]["text"] == "10 Routed + 1 Shared"
assert fl["cats"]["routed_experts"] == fpl["expert"] * 512 * 48 and round(fl["lm"] / 1e9) in (125, 126) and round(fl["active"] / 1e9) == 6
assert fc["head"]["# Params"] == ["125B", "27B"] and fc["head"]["# Activated params"] == ["6B", "27B"]
assert all(r["flash"] > r["q27"] for r in fc["scores"]) and len(fc["scores"]) == 12
mx24 = next(r for r in rc["max"]["rows"] if r[0] == "BF16")
# 两边的权重都是 BF16（每个参数 2 字节）：语言模型的字节数 = 参数个数 × 2，与 08 的实测字节数一致
assert list(x27["bytes_by_dtype"]) == ["BF16"] and fl["lm_bytes"] == fl["lm"] * 2
data = {
    "tok": {lang: {"pieces": v["pieces"], "n": len(v["ids"])} for lang, v in tok.items()},
    "q27": {"lm": d27["lm"], "total": d27["total"], "layers": 64, "ffn": x27["ffn"][0],
            "attnLinear": x27["attention"]["linear"][0], "attnFull": x27["attention"]["full"][0],
            "types": x27["types"], "bytes": x27["bytes_by_dtype"]["BF16"], "card": c27["params"]["text"],
            "layout": c27["layout"]["text"], "quote": c27["dense"]["text"], "lmBytes": d27["lm"] * 2},
    "qmax": {"lm": dmx["lm"], "active": dmx["active"], "share": dmx["active"] / dmx["lm"], "layers": 92, "experts": 512, "topk": 10,
             "expert": xmx["expert"], "shared": pl["shared"][0], "router": pl["router"][0], "attn": pl["attention"],
             "embedding": dmx["cats"]["embedding"], "bytes": xmx["bytes_by_dtype"]["BF16"], "card": cmx["params"]["text"],
             "layout": cmx["layout"]["text"], "activated": cmx["activated"]["text"]},
    "flash": {"lm": fl["lm"], "active": fl["active"], "share": fl["active"] / fl["lm"], "layers": 48, "experts": 512, "topk": 10,
              "expert": fpl["expert"], "shared": fpl["shared"], "router": fpl["router"], "other": fpl["other"],
              "attn": [fpl["attention"]["full"], fpl["attention"]["linear"]],                      # 每 4 层的第 4 层是全注意力
              "bytes": fl["lm_bytes"], "ngram": fl["cats"]["ngram_embedding"], "mtp": fl["cats"]["mtp"],
              "card": fc["params"]["text"], "official": fc["official"]["text"].replace("**", ""),
              "cardParams": [125e9, 27e9], "cardActive": [6e9, 27e9],                                 # 模型卡成绩表的表头：Flash-Next / 27B
              "scores": [[r["bench"], r["flash"], r["q27"]] for r in fc["scores"]]},
    # 2026 年 6 月以后发布的开源模型（09）：总参数与激活参数取各自模型卡的原话
    "survey": {"rows": [[r["name"], r["total"], r["active"], r["moe"], r["total_text"], r["active_text"]] for r in sv["chart"]],
               "scanN": sum(1 for r in sv["scan"] if r["st_total"] >= 100e9), "scanMoE": sum(1 for r in sv["scan"] if r["st_total"] >= 100e9 and r["experts"] > 0)},
    # vLLM 部署指南（11）：2.4T 的 BF16 权重要几张卡；27B 一张卡
    "recipe": {"maxGB": int(mx24[2].split()[0]), "maxB300": int(mx24[3].split()[0]), "maxH200": int(mx24[5].split()[0]), "fit27": rc["q27"]["fit"].split(":")[0]},
    # 先后关系（论文与发布博客原文，见 research/FACTS.md 的文献表）：总参数与每个 token 激活的参数
    "history": [["GPT-3", 2020, 175e9, 175e9], ["GLaM", 2021, 1.2e12, 96.6e9], ["DeepSeek-V3", 2024, 671e9, 37e9], ["Llama 4 Maverick", 2025, 400e9, 17e9]],
    # OLMoE 论文图 4 的对照实验（arXiv:2409.02060v2，图 4 题注与正文第 4 节）：稠密模型 1.3B、MoE 激活 1.3B / 总 6.9B，两者都训练 130B token；
    # MoE 用约 3 倍少的 token 追平稠密的最终表现，按训练时间约快 2 倍。这几个数取自论文原文，不是本片的实测
    "fig4": {"dense": 1.3e9, "tokens": 130e9, "fewerTokens": 3, "fasterTime": 2},
    "w": {"tensor": qd["weights"]["tensor"], "rows": [[round(x, 4) for x in r] for r in qd["weights"]["rows"]]},
    "olmoe": {"total": ol["total"], "active": ol["active"], "experts": ol["experts"], "topk": ol["topk"], "layers": ol["layers"],
              "attnLayer": ol["cats"]["attention"] // ol["layers"], "routerLayer": ol["cats"]["router"] // ol["layers"],
              "expertsLayer": ol["cats"]["experts"] // ol["layers"], "expert": ol["cats"]["experts"] // ol["layers"] // ol["experts"],
              "layer": LAYER, "pieces": rt["pieces"], "route": rt["route"][LAYER]["experts"],
              "probs": [[round(x, 4) for x in row] for row in rt["route"][LAYER]["probs"]],          # 每个 token 对 64 个专家的路由概率（softmax 之后）
              "weights": rt["route"][LAYER]["weights"]},                                            # 选中的 8 个专家各自的概率
}
out = os.path.join(HERE, "..", "src", "js", "data.js")
with open(out, "w", encoding="utf-8", newline="\n") as f:
    f.write("// 由 tools/gen_data.py 从 research/lab/ 的实验结果生成，不要手改。\n")
    f.write("window.DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("写出 src/js/data.js：token %d/%d，27B %s，2.4T %s / 激活 %s（%.4f），OLMoE 第 %d 层路由 %d 个 token" % (
    data["tok"]["zh"]["n"], data["tok"]["en"]["n"], f'{d27["lm"]:,}', f'{dmx["lm"]:,}', f'{dmx["active"]:,}', data["qmax"]["share"], LAYER, len(data["olmoe"]["route"])))
