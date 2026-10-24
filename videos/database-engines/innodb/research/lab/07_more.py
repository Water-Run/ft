"""07 第 2 稿补的取证：一行一行插入时树怎样长、Alice 插进两棵树的位置、页内目录、读视图、两种引擎的文件。

A. 生长：新建空表，按 id 1..4096 一行一行插入（自动提交，与系列数据同一规则）。每插一行查
   INFORMATION_SCHEMA.INNODB_BUFFER_PAGE 里主键树与姓名索引树的页，页的集合一变就记下：插到第几行、各页几条记录。
   插 2050 号 Alice 前后比较各页记录数，看她落进哪一页。最后慢速关机、按页解析，与 01 的整棵树对照。
B. 文件：同一个库里再建一张 MyISAM 副本，列出库目录里两种引擎各自的文件与大小（只列文件名）。
C. 页内目录：解析 01 存下的 users.ibd（先核对 SHA-256），列出叶页 27 的目录槽：每槽指向哪条记录、管几条；
   再按 InnoDB 的做法在槽上二分找 2050，记下比较的次数与最后沿链走的几步。
D. 快照的两种顺序：可重复读下 Bob 先读、Alice 后改（未提交），以及 Alice 先改、Bob 后读；
   各记 Bob 每次读到的值与 information_schema.innodb_trx 里两笔事务的编号（9.7.4 的 INNODB STATUS 不再打印读视图的界限，
   可见性的判断取自源码 read0types.h）。
E. 覆盖索引：EXPLAIN FORMAT=TREE 比较「按名字取整行」与「按名字只取编号」。
F. 源码：页目录每槽管几条、页头里的左右兄弟、范围扫描走到右边的兄弟页、读视图的可见性判断、提交时写 redo 的分支
   （GitHub 标签 mysql-9.7.4）。
另记三个缺省值：自动提交、默认存储引擎、锁等待超时。
"""
import hashlib, json, re, shutil, urllib.request
import ibd
from lab_common import SOURCE, LAB, Cli, Server, finish, new_run, insert_sql, SCHEMA, TRANSCRIPT

SRC = "https://raw.githubusercontent.com/mysql/mysql-server/mysql-9.7.4/"
SRC_POINTS = [
    ("dir slot owns at most 8", "storage/innobase/include/page0page.h", r"PAGE_DIR_SLOT_MAX_N_OWNED\s*=\s*8"),
    ("dir slot owns at least 4", "storage/innobase/include/page0page.h", r"PAGE_DIR_SLOT_MIN_N_OWNED\s*=\s*4"),
    ("page header prev", "storage/innobase/include/fil0types.h", r"FIL_PAGE_PREV\s*=\s*8"),
    ("page header next", "storage/innobase/include/fil0types.h", r"FIL_PAGE_NEXT\s*=\s*12"),
    ("scan moves to next leaf", "storage/innobase/btr/btr0pcur.cc", r"auto next_page_no = btr_page_get_next\(page, mtr\);"),
    ("visible if below up limit", "storage/innobase/include/read0types.h", r"if \(id < m_up_limit_id \|\| id == m_creator_trx_id\)"),
    ("invisible if at or above low limit", "storage/innobase/include/read0types.h", r"if \(id >= m_low_limit_id\)"),
    ("invisible if active at snapshot", "storage/innobase/include/read0types.h", r"return \(!std::binary_search\(p, p \+ m_ids\.size\(\), id\)\)"),
    ("flush_log_at_trx_commit=1 writes and flushes", "storage/innobase/trx/trx0trx.cc", r"/\* Write the log and optionally flush it to disk \*/"),
]
TREE = {"PRIMARY", "idx_name"}


def buffer_pages(cli, db):
    # 每插一行查一次，不进回显（只把页的集合变化记进 out_07.json）
    text = cli.run("SELECT INDEX_NAME AS idx, PAGE_NUMBER AS page, NUMBER_RECORDS AS n FROM INFORMATION_SCHEMA.INNODB_BUFFER_PAGE "
                   f"WHERE TABLE_NAME = '`{db}`.`users`' AND PAGE_TYPE = 'INDEX' AND INDEX_NAME IN ('PRIMARY', 'idx_name')", log=False)
    out = {}
    for line in [l for l in text.splitlines() if l.startswith("|")][1:]:
        idx, page, n = [c.strip() for c in line.strip("|").split("|")]
        out.setdefault(idx, {})[int(page)] = int(n)
    return {k: dict(sorted(v.items())) for k, v in out.items()}


def grow(cli):
    cli.run("CREATE DATABASE grow")
    cli.run("USE grow")
    cli.run(SCHEMA.format(t="users"))
    events, before, at_alice = [], buffer_pages(cli, "grow"), None
    events.append({"after_row": 0, "pages": before})
    for i in range(1, 4097):
        cli.run(insert_sql(i, i), log=False)
        now = buffer_pages(cli, "grow")
        for idx in TREE:
            if set(now.get(idx, {})) != set(before.get(idx, {})):
                events.append({"after_row": i, "index": idx, "pages": now[idx],
                               "before": before.get(idx, {})})
        if i == 2050:
            at_alice = {idx: {p: now[idx][p] - before.get(idx, {}).get(p, 0) for p in now[idx] if now[idx][p] != before.get(idx, {}).get(p, 0)}
                        for idx in TREE}
        before = now
    TRANSCRIPT.append(f"[admin] INSERT 1..4096 one row per statement (autocommit); {len(events) - 1} page-set changes recorded in out_07.json\n")
    return events, at_alice


def page_directory(data, no, key):
    """叶页的目录槽：从页尾往前，每槽 2 字节，存一条记录的偏移；该记录头里的 n_owned 是这一槽管的记录数。"""
    p = ibd.page(data, no)
    h = ibd.header(p)
    slots = []
    for k in range(h["n_dir_slots"]):
        off = ibd.u16(p, ibd.PAGE - 8 - 2 * (k + 1))
        owned = p[off - 5] & 0x0F
        status = ibd.u16(p, off - 4) & 7
        name = "infimum" if status == 2 else "supremum" if status == 3 else ibd.int_key(p[off:off + 4])
        slots.append({"slot": k, "offset": off, "key": name, "n_owned": owned})
    # 在槽上二分（page_cur_search_with_match 的做法：找最后一个键不大于目标的槽），再沿记录链往后走
    lo, hi, probes = 0, len(slots) - 1, []
    while hi - lo > 1:
        mid = (lo + hi) // 2
        k = slots[mid]["key"]
        probes.append({"slot": mid, "key": k})
        if k == "supremum" or (k != "infimum" and k > key):
            hi = mid
        else:
            lo = mid
    o, walk = slots[lo]["offset"], []
    while True:
        k = ibd.int_key(p[o:o + 4]) if (ibd.u16(p, o - 4) & 7) == 0 else None
        walk.append(k if k is not None else "infimum")
        if k == key:
            break
        o = (o + ibd.s16(p, o - 2)) % ibd.PAGE
    owned = [s["n_owned"] for s in slots]
    return {"page": no, "n_recs": h["n_recs"], "n_dir_slots": h["n_dir_slots"], "owned_min_max_user_slots": [min(owned[1:-1]), max(owned[1:-1])],
            "first_slots": slots[:4], "last_slots": slots[-3:], "binary_search_probes": probes, "start_slot": slots[lo],
            "walk_from_slot": walk}


def read_views(server):
    out = {}
    for order in ("bob_first", "alice_first"):
        admin = Cli("admin", "demo")
        bob, alice = Cli("Bob", "demo"), Cli("Alice", "demo")
        bob.run("SET SESSION transaction_isolation = 'REPEATABLE-READ'")
        if order == "bob_first":
            bob.run("START TRANSACTION")
            first = bob.rows("SELECT age FROM users WHERE id = 2050")
            alice.run("START TRANSACTION")
            alice.run("UPDATE users SET age = 43 WHERE id = 2050")
        else:
            alice.run("START TRANSACTION")
            alice.run("UPDATE users SET age = 43 WHERE id = 2050")
            bob.run("START TRANSACTION")
            first = bob.rows("SELECT age FROM users WHERE id = 2050")
        trx = admin.rows("SELECT trx_id, trx_state, trx_rows_modified FROM information_schema.innodb_trx ORDER BY trx_started")
        alice.run("COMMIT")
        after = bob.rows("SELECT age FROM users WHERE id = 2050")
        locking = bob.rows("SELECT age FROM users WHERE id = 2050 FOR SHARE")
        bob.run("COMMIT")
        admin.run("UPDATE users SET age = 42 WHERE id = 2050")      # 复原
        out[order] = {"bob_first_read": first, "innodb_trx": trx, "bob_after_alice_commit": after, "bob_locking_read": locking}
        for c in (bob, alice, admin):
            c.close()
    return out


def sources():
    sdir = SOURCE / "src_974"
    sdir.mkdir(parents=True, exist_ok=True)
    pts, files = [], {}
    for what, rel, pattern in SRC_POINTS:
        p = sdir / rel.replace("/", "__")
        if not p.exists():
            p.write_bytes(urllib.request.urlopen(SRC + rel, timeout=60).read())
        lines = p.read_text(encoding="utf-8", errors="replace").splitlines()
        hits = [i + 1 for i, l in enumerate(lines) if re.search(pattern, l)]
        assert len(hits) == 1, (rel, pattern, hits)
        files[rel] = {"url": SRC + rel, "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
        pts.append({"what": what, "file": rel, "line": hits[0], "text": lines[hits[0] - 1].strip()})
    return files, pts


def main():
    out = {}
    # C. 页内目录：用 01 存下的文件，先核对它就是 01 解析过的那一份
    o1 = json.loads((LAB / "out_01.json").read_text(encoding="utf-8"))
    f = SOURCE / "v974_users.ibd"
    assert hashlib.sha256(f.read_bytes()).hexdigest() == o1["tables"]["users"]["sha256"]
    out["C_page_directory"] = page_directory(f.read_bytes(), 27, 2050)

    run = new_run("07_more")
    server = Server(run, "lab").start()
    admin = Cli("admin")
    out["defaults"] = admin.rows("SELECT @@autocommit AS autocommit, @@default_storage_engine AS default_engine, "
                                 "@@innodb_lock_wait_timeout AS lock_wait_timeout")[0]
    out["A_events"], out["A_alice_insert"] = grow(admin)

    # B. 两种引擎的文件
    admin.run("CREATE TABLE users_myisam LIKE users")              # 同样的列与索引，只换引擎
    admin.run("ALTER TABLE users_myisam ENGINE=MyISAM")
    admin.run("INSERT INTO users_myisam SELECT * FROM users")
    admin.run("SET GLOBAL innodb_fast_shutdown = 0")
    admin.close()
    server.stop()
    out["B_files"] = sorted([{"file": p.name, "bytes": p.stat().st_size} for p in (server.data / "grow").iterdir()], key=lambda r: r["file"])

    dst = SOURCE / "v974_07_grow.ibd"
    shutil.copyfile(server.file("grow", "users.ibd"), dst)
    data = dst.read_bytes()
    final = {}
    for idx, root in (("PRIMARY", 4), ("idx_name", 5)):
        levels = ibd.walk(data, root, idx)
        final[idx] = [{"level": lv[0]["level"], "pages": [(p["page"], p["n_recs"]) for p in lv]} for lv in levels]
    out["A_final_tree"] = final
    o1p = o1["tables"]["users"]["trees"]["PRIMARY"]["levels"][1]["page_list"]
    out["A_same_as_01"] = [(p["page"], p["n_recs"]) for p in o1p] == [tuple(x) for x in final["PRIMARY"][-1]["pages"]]

    # D、E：在 01 同样的建表方式上
    server.start()
    admin = Cli("admin")
    admin.run("CREATE DATABASE demo")
    admin.run("USE demo")
    admin.run("SET SESSION cte_max_recursion_depth = 10000")
    admin.run(SCHEMA.format(t="users"))
    admin.run(insert_sql(1, 4096))
    out["E_explain"] = {
        "whole_row": admin.run("EXPLAIN FORMAT=TREE SELECT * FROM users WHERE name = 'Alice'"),
        "id_only": admin.run("EXPLAIN FORMAT=TREE SELECT id FROM users WHERE name = 'Alice'"),
    }
    admin.close()
    out["D_read_view"] = read_views(server)
    server.stop()

    out["F_source"], out["F_points"] = sources()
    ev = [e for e in out["A_events"] if e.get("index") == "PRIMARY"][:4]
    out["summary"] = {
        "primary_first_changes": [(e["after_row"], e["pages"]) for e in ev],
        "name_first_change": next((e["after_row"], e["pages"]) for e in out["A_events"] if e.get("index") == "idx_name"),
        "alice_insert": out["A_alice_insert"],
        "same_as_01": out["A_same_as_01"],
        "files": out["B_files"],
        "dir": {k: out["C_page_directory"][k] for k in ("n_recs", "n_dir_slots", "owned_min_max_user_slots", "binary_search_probes", "walk_from_slot")},
        "snapshot": {k: ([r["age"] for r in v["bob_first_read"] + v["bob_after_alice_commit"] + v["bob_locking_read"]],
                         [r["trx_id"] for r in v["innodb_trx"]]) for k, v in out["D_read_view"].items()},
        "defaults": out["defaults"],
    }
    finish("07", out)


if __name__ == "__main__":
    main()
