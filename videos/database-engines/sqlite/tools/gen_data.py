"""research/lab 的实测产物 → src/js/data.js（画面上的页号、树边、计数都从这里取）。

运行：python videos/database-engines/sqlite/tools/gen_data.py
只读 out_02/05/08 的 JSON，不重新做实验。
"""
import json
from pathlib import Path

VIDEO = Path(__file__).resolve().parents[1]
LAB = VIDEO / "research/lab"


def load(name):
    return json.loads((LAB / name).read_text(encoding="utf-8"))


def tree(t, keep_seps=()):
    nodes = []
    for n in t["nodes"]:
        node = {"p": n["page"], "d": n["depth"], "k": "i" if n["kind"].endswith("interior") else "l",
                "n": n["cell_count"], "c": n["children"] or []}
        if n["page"] in keep_seps:
            node["s"] = n["separators"]
        nodes.append(node)
    return {"root": t["root"], "height": t["height"], "pages": t["btree_pages"], "records": t["records"], "nodes": nodes}


def main():
    s02, s05, s08 = load("out_02_structure.json"), load("out_05_wal.json"), load("out_08_trace.json")
    main_db = s02["main"]
    trees = {t["name"]: t for t in main_db["trees"]}

    # 每一页归谁：s 模式表、u users、n 姓名索引、a 年龄索引、t notes、o 长文本续页
    owner = ["?"] * main_db["page_count"]
    code = {"sqlite_schema": "s", "users": "u", "idx_users_name": "n", "idx_users_age": "a", "notes": "t"}
    for name, t in trees.items():
        for n in t["nodes"]:
            owner[n["page"] - 1] = code[name]
        for chain in t["overflow_chains"]:
            for p in chain["pages"] if isinstance(chain, dict) else chain:
                owner[p - 1] = "o"
    assert "?" not in owner, owner.count("?")

    def leaf_cells(t):
        return sum(n["cell_count"] for n in t["nodes"] if n["kind"].endswith("leaf"))

    def interior_cells(t):
        return sum(n["cell_count"] for n in t["nodes"] if n["kind"].endswith("interior"))

    users, names = trees["users"], trees["idx_users_name"]
    split = s02["first_split"]
    after = {t["name"]: t for t in split["after"]["trees"]}["users"]
    data = {
        "file": {"pageSize": main_db["page_size"], "pages": main_db["page_count"], "bytes": main_db["page_size"] * main_db["page_count"],
                 "owner": "".join(owner)},
        "users": tree(users, keep_seps=(2, 133)),
        "names": tree(names, keep_seps=(262, 281)),
        "ageIndex": {"root": trees["idx_users_age"]["root"], "pages": trees["idx_users_age"]["btree_pages"], "height": trees["idx_users_age"]["height"]},
        "counts": {"usersLeafRows": leaf_cells(users), "usersInteriorKeys": interior_cells(users),
                   "namesLeaf": leaf_cells(names), "namesInterior": interior_cells(names)},
        "route": {"index": s02["summary"]["index_route"], "table": s02["summary"]["table_route"],
                  "alice": s02["query_row"][0], "indexCell": s02["index_route_reconstructed"]["cell"]["key"]},
        "split": {"before": split["before_root_cells"], "inserted": split["inserted_id"],
                  "after": [{"p": n["page"], "k": n["kind"], "first": n["first_cell_key"], "last": n["last_cell_key"], "c": n["children"]} for n in after["nodes"]]},
        "bytecode": [{"addr": b["addr"], "op": b["opcode"], "p2": b["p2"], "p4": b["p4"], "note": b["comment"]}
                     for b in s02["plans"]["index_then_table"]["bytecode"]],
        "trace": {k: v for k, v in s08["summary"].items()},
        "wal": {"frames": [f["page"] for f in s05["wal"]["frames"]], "commitPages": s05["wal"]["frames"][-1]["database_pages_if_commit"],
                "summary": s05["summary"], "lockedError": s05["competing_writer_error"].split(": ", 1)[-1]},
    }
    # 与 FACTS 的关键数字逐一核对，防止数据改了画面却没跟上
    assert data["counts"] == {"usersLeafRows": 4096, "usersInteriorKeys": 255, "namesLeaf": 3869, "namesInterior": 227}
    assert data["route"]["index"] == [262, 281, 263] and data["route"]["table"] == [2, 133, 130]
    assert data["trace"]["index_then_table"] == [1, 262, 281, 263, 2, 133, 130]
    assert data["wal"]["frames"] == [130, 505, 519, 520, 521]
    out = VIDEO / "src/js/data.js"
    out.write_text("// 由 tools/gen_data.py 从 research/lab 的实测 JSON 生成，不要手改。\nwindow.DATA = "
                   + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8", newline="\n")
    print(f"{out.relative_to(VIDEO)}  {out.stat().st_size} bytes")


if __name__ == "__main__":
    main()
