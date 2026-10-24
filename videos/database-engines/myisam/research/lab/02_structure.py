"""Whole structure of the MyISAM users table: files, fixed rows, three complete B-trees, Alice's routes,
and the first split of the name index while rows arrive one by one.

Trees are rebuilt from bytes with myi.py after a clean shutdown and cross-checked with myisamchk.
"""
import subprocess
import myi
from lab_common import TRANSCRIPT, Cli, Server, build, finish, insert_sql, new_run, stop_all, tool, SCHEMA

DECODE = [lambda v: int.from_bytes(v[0], "big", signed=True), lambda v: v[0].decode("ascii"), lambda v: v[0][0]]
KEYS = ["PRIMARY(id)", "idx_name(name)", "idx_age(age)"]


def row(myd, rowref, reclength):
    raw = myd[rowref * reclength:(rowref + 1) * reclength]
    return {"rowref": rowref, "offset": rowref * reclength, "bytes": reclength, "hex": raw.hex(),
            "flag_byte": raw[0], "id": int.from_bytes(raw[1:5], "little", signed=True),
            "name": raw[5:55].decode("ascii").rstrip(" "), "age": raw[55]}


def read_tables(path):
    d = (path / "users.MYI").read_bytes()
    myd = (path / "users.MYD").read_bytes()
    h, s, b, kds = myi.header(d)
    trees = []
    for i, kd in enumerate(kds):
        t = myi.walk(d, kd, s["key_root"][i], b["key_reflength"], b["rec_reflength"], DECODE[i])
        t.update(name=KEYS[i], key_flag=kd["flag"], key_length=kd["keylength"], block_length=kd["block_length"],
                 packed=bool(kd["flag"] & myi.HA_PACK_KEY))
        trees.append(t)
    return d, myd, h, s, b, kds, trees


def chk(args, path):
    out = subprocess.run([tool("myisamchk")] + args + [str(path / "users.MYI")], capture_output=True, text=True)
    text = (out.stdout + out.stderr).replace(str(path / "users.MYI"), "users.MYI")
    TRANSCRIPT.extend([f"[myisamchk {' '.join(args)}]", text.strip(), ""])
    return text


def growth(run):
    """Insert rows one at a time into a fresh table; stop after the name index first grows a level."""
    server = Server(run, "growth").start()
    c = Cli("growth")
    c.run("CREATE DATABASE grow"); c.run("USE grow"); c.run(SCHEMA)
    path = server.data / "grow"
    history = []
    for n in range(1, 200):
        c.run(insert_sql(n, n), log=False)
        c.run("FLUSH TABLES", log=False)
        d = (path / "users.MYI").read_bytes()
        h, s, b, kds = myi.header(d)
        t = myi.walk(d, kds[1], s["key_root"][1], b["key_reflength"], b["rec_reflength"], DECODE[1])
        history.append({"rows": n, "height": t["height"], "blocks": t["blocks"], "nodes": t["nodes"]})
        if t["height"] == 2:
            break
    TRANSCRIPT.extend([f"[growth] inserted rows 1..{n} one statement each, FLUSH TABLES after each", ""])
    c.close(); server.stop()
    before, after = history[-2], history[-1]
    return {"split_on_row": after["rows"], "before": before, "after": after}


def main():
    run = new_run("02")
    server = Server(run, "server").start()
    try:
        c = Cli("client")
        build(c)
        status = c.rows("SHOW TABLE STATUS LIKE 'users'")[0]
        alice = c.rows("SELECT id, name, age FROM users WHERE name='Alice'")
        explain = c.rows("EXPLAIN SELECT id, name, age FROM users WHERE name='Alice'")
        files = sorted((p.name, p.stat().st_size) for p in (server.data / "demo").iterdir())
        TRANSCRIPT.extend(["[files in demo/]", "\n".join(f"{n} {s}" for n, s in files), ""])
        c.close()
        server.stop()
        path = server.data / "demo"
        d, myd, h, s, b, kds, trees = read_tables(path)
        name_route = myi.search(d, kds[1], s["key_root"][1], b["key_reflength"], b["rec_reflength"], [b"Alice"], DECODE[1])
        id_route = myi.search(d, kds[0], s["key_root"][0], b["key_reflength"], b["rec_reflength"],
                              [(2050).to_bytes(4, "big")], DECODE[0])
        hit = name_route[-1]["rowref"]
        assert id_route[-1]["rowref"] == hit
        alice_row = row(myd, hit, b["reclength"])
        assert (alice_row["id"], alice_row["name"], alice_row["age"]) == (2050, "Alice", 42)
        assert len(myd) == 4096 * b["reclength"] and all(t["entries"] == 4096 for t in trees)
        info = chk(["-dvv"], path)
        stats = chk(["-i", "-e"], path)
        levels = [int(x) for x in __import__("re").findall(r"Max levels:\s+(\d+)", stats)]
        assert levels == [t["height"] for t in trees], (levels, [t["height"] for t in trees])
        grow = growth(new_run("02g"))
    finally:
        stop_all()
    finish("02_structure", {
        "summary": {"files": files, "reclength": b["reclength"], "rows": 4096, "myd_bytes": len(myd),
                    "trees": [{"name": t["name"], "root_block": t["root_block"], "height": t["height"],
                               "blocks": t["blocks"], "levels": t["levels"]} for t in trees],
                    "name_route": [x["block"] for x in name_route], "id_route": [x["block"] for x in id_route],
                    "alice": {k: alice_row[k] for k in ("rowref", "offset", "id", "name", "age")},
                    "first_name_index_split_on_row": grow["split_on_row"], "myisamchk_max_levels": levels},
        "table_status": status, "explain": explain, "alice_sql": alice,
        "header": {"magic": h["magic"], "keys": h["keys"], "state": {k: v for k, v in s.items()},
                   "base": {k: b[k] for k in ("keystart", "reclength", "rec_reflength", "key_reflength")}},
        "trees": trees, "name_route": name_route, "id_route": id_route, "alice_row": alice_row, "growth": grow,
        "limits": ["Routes are reconstructed from bytes; they are not observed reads (see 03 for key cache counters).",
                   "One fixed-row table with NOT NULL columns; name uses CHARACTER SET ascii so CHAR(50) takes 50 bytes."]})


if __name__ == "__main__":
    main()
