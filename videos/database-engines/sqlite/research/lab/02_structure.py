"""Measure the complete table/index trees, exact first root split and query routes.

Main illustration uses explicitly configured 1024-byte pages; a separate 4096-byte
database checks the same dataset at the measured build default. B-tree routes are
reconstructed from bytes and checked against SQL/dbstat, not reported as I/O traces.
"""
import json
from lab_common import Cli, WORK, build, finish, insert_sql, new_run, save
from page_map import Database, measure


def main():
    directory = new_run("02")
    main_db = directory / "main.db"
    build(main_db)
    with Cli(main_db, "main") as c:
        c.raw("CREATE TABLE notes(id INTEGER PRIMARY KEY, body TEXT NOT NULL);"
              "\nINSERT INTO notes VALUES(1,replace(hex(zeroblob(6000)),'0','N'));")
        mapped = measure(c, main_db)
        sql_row = c.q("SELECT id,name,age FROM users WHERE name='Alice';")
        target = sql_row[0]
        roots = {r["name"]: r["rootpage"] for r in mapped["schema"]}
        parsed = Database(main_db.read_bytes())
        index_route = parsed.route(roots["idx_users_name"], ("Alice", target["id"]))
        table_route = parsed.route(roots["users"], target["id"])
        assert table_route["cell"]["record"]["values"] == [None, "Alice", 42]
        assert index_route["cell"]["record"]["values"] == ["Alice", target["id"]]
        plans = {}
        for name, query in {"table_scan": "SELECT id,name,age FROM users NOT INDEXED WHERE name='Alice'",
                            "index_then_table": "SELECT id,name,age FROM users WHERE name='Alice'",
                            "covering": "SELECT id,name FROM users WHERE name='Alice'",
                            "rowid": "SELECT id,name,age FROM users WHERE id=2050"}.items():
            plans[name] = {"sql": query, "plan": c.q("EXPLAIN QUERY PLAN " + query + ";"),
                           "bytecode": c.q("EXPLAIN " + query + ";"), "result": c.q(query + ";")}
        index_tree = next(t for t in mapped["trees"] if t["name"] == "idx_users_name")
        interior = next(n for n in index_tree["nodes"] if n["kind"] == "index-interior" and n["cell_count"])
        interior_record = parsed.page(interior["page"])["cells"][0]["record"]["values"]
        assert c.q("SELECT name,id FROM users WHERE name='" + interior_record[0] + "';")[0]["id"] == interior_record[1]
        note_route = parsed.route(roots["notes"], 1)
        assert note_route["cell"]["record"]["values"][1]["characters"] == 12000
    default_db = directory / "default-4096.db"
    build(default_db, page_size=4096)
    with Cli(default_db, "default-pages") as c:
        default = measure(c, default_db)
    growth_db = directory / "growth.db"
    build(growth_db, rows=0, indexes=False)
    split = None
    with Cli(growth_db, "growth") as c:
        previous = measure(c, growth_db)
        for count in range(1, 257):
            before_blob = growth_db.read_bytes()
            c.raw(insert_sql(count, count))
            kind = c.scalar("SELECT pagetype FROM dbstat WHERE name='users' AND path='/';")
            if kind == "internal":
                (directory / "before-first-split.db").write_bytes(before_blob)
                after = measure(c, growth_db)
                before_parsed = Database(before_blob)
                split = {"inserted_id": count, "before_rows": count - 1, "after_rows": count,
                         "before_root": before_parsed.page(2)["kind"],
                         "before_root_cells": before_parsed.page(2)["cell_count"],
                         "before_database_sha256": previous["sha256"], "after": after}
                break
            previous = measure(c, growth_db)
        assert split is not None
    WORK.mkdir(exist_ok=True)
    (WORK / "current.json").write_text(json.dumps({"base": str(main_db.relative_to(WORK)).replace("\\", "/")}), encoding="utf-8")
    by_name = {t["name"]: t for t in mapped["trees"]}
    summary = {"rows": 4096, "page_size": mapped["page_size"], "pages": mapped["page_count"],
               "users_height": by_name["users"]["height"], "users_pages": by_name["users"]["btree_pages"],
               "name_index_height": by_name["idx_users_name"]["height"],
               "first_root_split_on_insert": split["inserted_id"],
               "index_route": [s["page"] for s in index_route["steps"]],
               "table_route": [s["page"] for s in table_route["steps"]],
               "overflow_pages": note_route["cell"]["overflow_pages"]}
    lines = ["Complete measured trees; every edge is cross-checked against dbstat.",
             "Logical topology and reconstructed routes, not physical I/O observations.", ""]
    for tree in mapped["trees"]:
        lines.append(f"{tree['name']}: root={tree['root']}, height={tree['height']}, records={tree['records']}")
        for node in tree["nodes"]:
            lines.append("  " * node["depth"] + f"p{node['page']} {node['kind']} cells={node['cell_count']} "
                         f"first={node['first_cell_key']} last={node['last_cell_key']} children={node['children']}")
        for chain in tree["overflow_chains"]:
            lines.append(f"  overflow from p{chain['owner_page']} slot {chain['slot']}: {chain['pages']}")
        lines.append("")
    lines.extend(["Alice name-index route: " + " -> ".join(str(s["page"]) for s in index_route["steps"]),
                  "Alice table route: " + " -> ".join(str(s["page"]) for s in table_route["steps"])])
    from lab_common import LAB
    (LAB / "out_02_trees.txt").write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    finish("02_structure", {"summary": summary, "main": mapped, "default_4096": default,
                            "first_split": split, "plans": plans, "query_row": sql_row,
                            "index_route_reconstructed": index_route, "table_route_reconstructed": table_route,
                            "index_interior_real_record": {"page": interior["page"], "record": interior_record},
                            "long_note": note_route,
                            "limits": ["1024-byte pages and synthetic data are explicit teaching experiment choices.",
                                       "Routes are reconstructed logical searches, not observed cache misses or physical reads.",
                                       "EXPLAIN lists the generated program; it is not a dynamic execution trace.",
                                       "Table rowid B-trees and index B-trees must not be drawn as identical B+ trees."]})


if __name__ == "__main__":
    main()
