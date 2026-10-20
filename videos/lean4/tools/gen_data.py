# 取证数据 → 画面数据：读 research/lab/ 的源文件与回显，写 src/js/data.js。
# 画面上的 Lean 源码、目标、报错、证明项、节点数、依赖条数、行数与 Mathlib 的统计数都出自这里，场景代码不手写这些内容。
# 用法：python tools/gen_data.py（在本片目录下，或任意目录）。只用标准库。
# 上游：research/lab/ 的 00–05 号脚本，回显在同目录的 out_*.txt；Lean 源文件在 research/lab/proof/。
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.join(HERE, "..", "research", "lab")


def read(name):
    with open(os.path.join(LAB, name), encoding="utf-8") as f:
        return f.read()


def out(name):
    """一份回显：去掉末尾的 [exit N] 行，返回 (各行, 退出码)。"""
    lines = read(name).rstrip("\n").split("\n")
    m = re.fullmatch(r"\[exit (\d+)\]", lines[-1])
    assert m, name
    return lines[:-1], int(m.group(1))


def code(name):
    """一份 Lean 源文件里的代码行：去掉 import、注释与首尾空行。"""
    keep = [l for l in read("proof/SumOdd/" + name).split("\n") if not l.startswith("import ") and not l.lstrip().startswith("--")]
    text = "\n".join(keep)
    text = re.sub(r"/--.*?-/\n", "", text, flags=re.S)          # 文档注释
    return text.strip("\n").split("\n")


# ── 环境 ──
env = read("out_00_env.txt")
ver = re.search(r"Lean \(version ([\d.]+), .*?commit ([0-9a-f]{40})", env)
assert ver and read("proof/lean-toolchain").strip() == "leanprover/lean4:v" + ver.group(1)

# ── 逐个计算与「试到一百万」 ──
build = read("out_01_build.txt")
assert build.rstrip().endswith("[exit 0]") and "Build completed successfully" in build
ev = {int(m.group(1)): m.group(2) for m in re.finditer(r"SumOdd/Test\.lean:(\d+):0: (\[[^\]]*\]|true|false)", build)}
test_src = read("proof/SumOdd/Test.lean").split("\n")
line_of = lambda needle: next(i + 1 for i, l in enumerate(test_src) if l.startswith(needle))
first = json.loads(ev[line_of("#eval (List.range 9).map sumOdd")])
squares = json.loads(ev[line_of("#eval (List.range 9).map (· ^ 2)")])
million = ev[line_of("#eval testUpTo 1000001")]
sums = json.loads(ev[line_of("#eval (List.range 201).map sumOdd")])
assert first == squares == [n * n for n in range(9)] and million == "true"
assert len(sums) == 201 and all(s == n * n for n, s in enumerate(sums))      # 画面只用 Lean 给出的数；这里顺带核对它们确是平方数

# ── 证明：每一步之前的目标 ──
trace, rc = out("out_02_Trace.txt")
assert rc == 0
blocks, cur = [], []
for l in trace:
    if l.startswith("case ") and cur:
        blocks.append(cur); cur = []
    cur.append(l)
blocks.append(cur)
assert len(blocks) == 3 and [b[0] for b in blocks] == ["case zero", "case succ", "case succ"]
goals = [{"case": b[0][5:], "hyps": [l for l in b[1:] if not l.startswith("⊢")], "goal": next(l for l in b if l.startswith("⊢"))[2:]} for b in blocks]

# ── 证明项、公理 ──
term, rc = out("out_02_Print.txt"); assert rc == 0 and term[0].startswith("theorem sumOdd_eq_sq :")
axioms, rc = out("out_02_Axioms.txt"); assert rc == 0 and len(axioms) == 1
ax_list = re.search(r"\[(.*)\]", axioms[0]).group(1).split(", ")

# ── 被拒的与被记下的 ──
wrong, rc = out("out_02_Wrong.txt"); assert rc == 1 and any("Type mismatch" in l for l in wrong)
wrong2, rc = out("out_02_Wrong2.txt"); assert rc == 1 and wrong2[-1] == "is false"
sorry, rc = out("out_02_Sorry.txt"); assert rc == 0 and "sorryAx" in sorry[-1] and "declaration uses `sorry`" in sorry[0]
kernel, rc = out("out_02_Kernel.txt"); assert rc == 1 and "(kernel) declaration type mismatch" in kernel[0]
name, rc = out("out_02_Name.txt"); assert rc == 0 and name == ["'riemann_hypothesis' does not depend on any axioms"]

# ── 证明项的大小与依赖闭包 ──
stats, rc = out("out_02_Stats.txt"); assert rc == 0
stats = json.loads(stats[-1])
t, c = stats["term"], stats["closure"]
assert t["dag"] == sum(p["dag"] for p in t["parts"]) == len(t["seq"]) and t["tree"] == sum(p["tree"] for p in t["parts"])
assert c["total"] == len(c["kinds"]) == sum(c["byKind"].values()) and sorted(c["axioms"]) == sorted(ax_list)
count, rc = out("out_02_Count.txt"); assert rc == 0
count = json.loads(count[-1])
assert count["total"] == sum(count["byKind"].values())
recheck = read("out_03_recheck.txt").split("\n")
i = recheck.index("$ lake env leanchecker --fresh SumOdd.Proof")
m1, m2 = re.fullmatch(r"\[exit (\d+)\] \[(\d+) s\]", recheck[1]), re.fullmatch(r"\[exit (\d+)\] \[(\d+) s\]", recheck[i + 1])
assert m1 and m2 and m1.group(1) == m2.group(1) == "0", "leanchecker 应当无输出且退出码为 0"

# ── 源码行数 ──
size = {}
ks = read("out_04_kernel_size.txt").split("\n")
assert ks[0].startswith("lean4 v" + ver.group(1) + " " + ver.group(2))
for l in ks[1:]:
    m = re.fullmatch(r"src/(\w+) (cxx|lean) files=(\d+) lines=(\d+)", l)
    if m:
        size[m.group(1)] = {"files": int(m.group(3)), "lines": int(m.group(4))}
rest = sum(size[d]["lines"] for d in ("Init", "Std", "Lean", "lake"))

# ── Mathlib 的官方统计 ──
ms = read("out_05_mathlib_stats.txt")
m = re.search(r"fetched (\d{4}-\d{2}-\d{2})T.*\nCounts Definitions Theorems Contributors (\d+) (\d+) (\d+)", ms)
assert m

data = {
    "lean": {"version": ver.group(1), "commit": ver.group(2)[:7]},
    "first": first, "million": million == "true", "sums": sums,
    "src": {"def": code("Def.lean"), "proof": code("Proof.lean"), "wrong": code("Wrong.lean"), "sorry": code("Sorry.lean"), "name": code("Name.lean")},
    "goals": goals, "term": {"lines": term, "dag": t["dag"], "tree": t["tree"], "seq": t["seq"], "parts": [{k: p[k] for k in ("name", "dag", "tree")} for p in t["parts"]]},
    "axioms": {"line": axioms[0], "list": ax_list},
    "wrong": wrong, "wrong2": wrong2, "sorry": sorry, "kernel": kernel, "name": name,
    "closure": {"total": c["total"], "byKind": c["byKind"], "kinds": c["kinds"]},
    "replay": {"total": count["total"], "modules": count["modules"], "byKind": count["byKind"], "seconds": int(m2.group(2))},
    "size": {"tag": "v" + ver.group(1), "kernel": size["kernel"], "rest": {"lines": rest, "files": sum(size[d]["files"] for d in ("Init", "Std", "Lean", "lake"))},
             "parts": {d: size[d] for d in ("Init", "Std", "Lean", "lake", "runtime", "util", "library")}},
    "mathlib": {"date": m.group(1), "definitions": int(m.group(2)), "theorems": int(m.group(3)), "contributors": int(m.group(4))},
}
dst = os.path.join(HERE, "..", "src", "js", "data.js")
with open(dst, "w", encoding="utf-8", newline="\n") as f:
    f.write("// 由 tools/gen_data.py 从 research/lab/ 的实验结果生成，不要手改。\n")
    f.write("window.DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("data.js:", os.path.getsize(dst), "bytes;",
      "term", data["term"]["tree"], "/", data["term"]["dag"], "closure", data["closure"]["total"], "replay", data["replay"]["total"],
      "kernel", data["size"]["kernel"]["lines"], "rest", rest, "mathlib", data["mathlib"]["theorems"], data["mathlib"]["date"])
