"""Alice's birthday, Alice's deletion, Dave's registration: bytes of the same 56-byte slot at each step.

Files are read after FLUSH TABLES (key cache written back; MyISAM writes rows straight to the data file).
"""
import myi
from lab_common import Cli, Server, build, finish, new_run, stop_all

DEC = [lambda v: int.from_bytes(v[0], "big", signed=True), lambda v: v[0].decode("ascii"), lambda v: v[0][0]]


def snapshot(server, label):
    path = server.data / "demo"
    d, myd = (path / "users.MYI").read_bytes(), (path / "users.MYD").read_bytes()
    h, s, b, kds = myi.header(d)
    slot = myd[114744:114744 + 56]
    name_tree = myi.walk(d, kds[1], s["key_root"][1], b["key_reflength"], b["rec_reflength"], DEC[1])
    age_tree = myi.walk(d, kds[2], s["key_root"][2], b["key_reflength"], b["rec_reflength"], DEC[2])
    find = lambda name: myi.search(d, kds[1], s["key_root"][1], b["key_reflength"], b["rec_reflength"], [name], DEC[1])
    return {"step": label, "myd_bytes": len(myd), "myi_bytes": len(d),
            "state": {k: s[k] for k in ("records", "del", "dellink", "data_file_length")},
            "slot_114744": {"hex": slot.hex(), "flag_byte": slot[0]},
            "name_entries": name_tree["entries"], "age_entries": age_tree["entries"],
            "alice_in_name_index": find(b"Alice")[-1], "dave_in_name_index": find(b"Dave")[-1]}


def main():
    run = new_run("04")
    server = Server(run, "server").start()
    steps = []
    try:
        c = Cli("admin"); build(c); c.close()
        alice = Cli("Alice", "demo"); dave = Cli("Dave", "demo")
        steps.append(snapshot(server, "after 4096 rows"))
        alice.run("UPDATE users SET age=43 WHERE id=2050"); alice.run("FLUSH TABLES")
        steps.append(snapshot(server, "Alice age 43"))
        alice.run("DELETE FROM users WHERE id=2050"); alice.run("FLUSH TABLES")
        steps.append(snapshot(server, "Alice deleted"))
        dave.run("INSERT INTO users VALUES (4097, 'Dave', 30)"); dave.run("FLUSH TABLES")
        steps.append(snapshot(server, "Dave inserted"))
        where = dave.rows("SELECT id, name, age FROM users WHERE id IN (2050, 4097)")
        alice.close(); dave.close()
    finally:
        server.stop(); stop_all()
    a, u, d, v = steps
    assert a["slot_114744"]["hex"][-2:] == "2a" and u["slot_114744"]["hex"][-2:] == "2b"
    assert d["state"]["del"] == 1 and d["state"]["dellink"] == 114744 and d["slot_114744"]["flag_byte"] == 0
    assert v["state"]["del"] == 0 and v["myd_bytes"] == a["myd_bytes"]
    finish("04_update_delete", {
        "summary": {s["step"]: {"slot_hex": s["slot_114744"]["hex"], "records": s["state"]["records"],
                                "deleted": s["state"]["del"], "dellink": s["state"]["dellink"],
                                "myd_bytes": s["myd_bytes"]} for s in steps},
        "steps": steps, "sql_after": where,
        "limits": ["Fixed-row table, concurrent_insert=AUTO; one deleted row is reused by the next insert."]})


if __name__ == "__main__":
    main()
