"""01 整棵树：users（4096 行）与 users_big（1 000 000 行）的主键树、姓名索引树，逐页解析。

在全新的数据目录里建表、正常关机（脏页全部写回），复制 .ibd 到忽略目录 research/_src/，再按页解析：
每棵树每层有哪些页、每页多少条记录、首尾键、左右兄弟；以及从根走到 Alice（id 2050）那一行的路径与字节。
根页号与索引号取自 INFORMATION_SCHEMA.INNODB_INDEXES，与页头里的 index_id 互相印证。
"""
import shutil
import ibd
from lab_common import SOURCE, Cli, Server, build, finish, new_run, digest

TABLES = [("users", 4096), ("users_big", 1_000_000)]


def main():
    run = new_run("01_trees")
    server = Server(run, "lab").start()
    s = Cli("admin")
    settings = s.rows("SELECT @@version AS version, @@innodb_page_size AS page_size, @@innodb_file_per_table AS file_per_table, "
                      "@@innodb_default_row_format AS row_format, @@innodb_fill_factor AS fill_factor, @@log_bin AS log_bin, "
                      "@@transaction_isolation AS isolation, @@innodb_change_buffering AS change_buffering, "
                      "@@innodb_buffer_pool_size AS buffer_pool, @@innodb_doublewrite AS doublewrite, "
                      "@@innodb_flush_log_at_trx_commit AS flush_log_at_trx_commit")[0]
    for t, n in TABLES:
        build(s, "demo", t, n)
    meta = s.rows("SELECT t.NAME AS tbl, i.NAME AS idx, i.INDEX_ID AS index_id, i.PAGE_NO AS root, i.SPACE AS space "
                  "FROM INFORMATION_SCHEMA.INNODB_INDEXES i JOIN INFORMATION_SCHEMA.INNODB_TABLES t USING (TABLE_ID) "
                  "WHERE t.NAME LIKE 'demo/%' ORDER BY t.NAME, i.INDEX_ID")
    counts = {t: s.rows(f"SELECT COUNT(*) AS n FROM demo.{t}")[0]["n"] for t, _ in TABLES}
    alice = s.rows("SELECT id, name, age FROM demo.users WHERE id = 2050")
    s.run("SET GLOBAL innodb_fast_shutdown = 0")      # 慢速关机：合并 change buffer、做完 purge，.ibd 里是完整的树
    s.close()
    server.stop()                                    # 正常关机：脏页写回 .ibd

    out = {"environment": settings, "indexes": meta, "row_counts": counts, "alice": alice, "tables": {}}
    for t, n in TABLES:
        src = server.file("demo", f"{t}.ibd")
        dst = SOURCE / f"v974_{t}.ibd"
        shutil.copyfile(src, dst)
        data = dst.read_bytes()
        tdesc = {"file_bytes": len(data), "pages": len(data) // ibd.PAGE, "sha256": digest(dst, "sha256"), "trees": {}}
        for m in [m for m in meta if m["tbl"] == f"demo/{t}" and m["idx"] in ("PRIMARY", "idx_name")]:
            levels = ibd.walk(data, int(m["root"]), m["idx"])
            assert all(p["level"] == len(levels) - 1 - k for k, lv in enumerate(levels) for p in lv)
            tree = {"root": int(m["root"]), "index_id": int(m["index_id"]), "height": len(levels), "levels": []}
            for k, lv in enumerate(levels):
                recs = [p["n_recs"] for p in lv]
                entry = {"level": lv[0]["level"], "pages": len(lv), "records": sum(recs), "min_recs": min(recs), "max_recs": max(recs),
                         "fill_bytes_avg": round(sum(p["heap_top"] for p in lv) / len(lv))}
                if len(lv) <= 40:                    # 小树逐页列出；大树只列统计
                    entry["page_list"] = [{k2: p[k2] for k2 in ("page", "n_recs", "prev", "next", "heap_top")}
                                          | {"first": {kk: vv for kk, vv in p["first"].items() if kk in ("id", "name", "child")},
                                             "last": {kk: vv for kk, vv in p["last"].items() if kk in ("id", "name", "child")}}
                                          for p in lv]
                if k == 0:
                    entry["root_entries"] = [{kk: vv for kk, vv in r.items() if kk in ("id", "name", "child")} for r in lv[0]["_recs"]][:60]
                tree["levels"].append(entry)
            key, val = ("id", 2050) if m["idx"] == "PRIMARY" else ("name", "Alice")
            if t == "users":
                path, rec = ibd.find_leaf_record(data, int(m["root"]), m["idx"], key, val)
                tree["alice_path"] = path
                tree["alice_record"] = rec
            tdesc["trees"][m["idx"]] = tree
        out["tables"][t] = tdesc

    U = out["tables"]["users"]["trees"]
    out["summary"] = {t: {idx: [lv["pages"] for lv in tr["levels"]] for idx, tr in out["tables"][t]["trees"].items()} for t, _ in TABLES}
    out["summary"]["alice"] = {"primary_path": [p["page"] for p in U["PRIMARY"]["alice_path"]],
                               "name_path": [p["page"] for p in U["idx_name"]["alice_path"]],
                               "row": U["PRIMARY"]["alice_record"]["record"] if U["PRIMARY"]["alice_record"] else None}
    finish("01", out)


if __name__ == "__main__":
    main()
