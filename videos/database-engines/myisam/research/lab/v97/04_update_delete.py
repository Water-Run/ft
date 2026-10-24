"""Fixed rows changing in place: Alice's birthday, two users deleting their accounts, new users filling the holes.

Users 2 and 5 delete their accounts (rows 1 and 4); Dave and then user 4098 register and take
the holes from the head of the chain; user 4099 finds no hole and goes to the end of the file.
Files are read after FLUSH TABLES (MyISAM writes rows straight to the data file).
"""
import myi
from lab_common import Cli, Server, build, finish, new_run, stop_all

REC = 56
WATCH = {"Alice (row 2049)": 2049, "row 1 (user 2)": 1, "row 4 (user 5)": 4, "row 4096 (end)": 4096}


def snapshot(server, label):
    path = server.data / "demo"
    d, myd = (path / "users.MYI").read_bytes(), (path / "users.MYD").read_bytes()
    h, s, b, kds = myi.header(d)
    slots = {}
    for name, n in WATCH.items():
        raw = myd[n * REC:(n + 1) * REC]
        slots[name] = {"offset": n * REC, "hex": raw.hex() if raw else None,
                       "flag_byte": raw[0] if raw else None,
                       "chain_next_row": int.from_bytes(raw[1:7], "big") if raw and raw[0] == 0 else None}   # 链里存行号，文件头存字节偏移
    return {"step": label, "myd_bytes": len(myd),
            "state": {"records": s["records"], "deleted": s["del"], "chain_head": s["dellink"]}, "slots": slots}


def main():
    server = Server(new_run("04"), "server").start()
    steps = []
    try:
        c = Cli("admin"); build(c); c.close()
        alice, dave, other = Cli("Alice", "demo"), Cli("Dave", "demo"), Cli("users", "demo")
        steps.append(snapshot(server, "4096 rows"))
        alice.run("UPDATE users SET age=43 WHERE id=2050"); alice.run("FLUSH TABLES")
        steps.append(snapshot(server, "Alice's birthday"))
        other.run("DELETE FROM users WHERE id=2"); other.run("FLUSH TABLES")
        steps.append(snapshot(server, "user 2 deleted"))
        other.run("DELETE FROM users WHERE id=5"); other.run("FLUSH TABLES")
        steps.append(snapshot(server, "user 5 deleted"))
        dave.run("INSERT INTO users VALUES (4097, 'Dave', 30)"); dave.run("FLUSH TABLES")
        steps.append(snapshot(server, "Dave registers"))
        other.run("INSERT INTO users VALUES (4098, 'User04098-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN', 29)")
        other.run("FLUSH TABLES")
        steps.append(snapshot(server, "user 4098 registers"))
        other.run("INSERT INTO users VALUES (4099, 'User04099-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN', 30)")
        other.run("FLUSH TABLES")
        steps.append(snapshot(server, "user 4099 registers"))
        order = other.rows("SELECT id, name FROM users LIMIT 6")          # 表扫描顺序即文件顺序
        for x in (alice, dave, other):
            x.close()
    finally:
        server.stop(); stop_all()
    s = {x["step"]: x for x in steps}
    assert s["Alice's birthday"]["slots"]["Alice (row 2049)"]["hex"][-2:] == "2b"
    assert s["user 5 deleted"]["state"]["chain_head"] == 4 * REC and s["user 5 deleted"]["slots"]["row 4 (user 5)"]["chain_next_row"] == 1
    assert s["Dave registers"]["slots"]["row 4 (user 5)"]["hex"][10:18] == "44617665"            # 'Dave' 写进 5 号的空位
    assert s["user 4098 registers"]["state"]["deleted"] == 0
    assert s["user 4099 registers"]["myd_bytes"] == 4097 * REC
    finish("04_update_delete", {
        "summary": {x["step"]: {"records": x["state"]["records"], "deleted": x["state"]["deleted"],
                                "chain_head": x["state"]["chain_head"], "myd_bytes": x["myd_bytes"]} for x in steps},
        "steps": steps, "scan_order_first_rows": order,
        "limits": ["Fixed-row table; the delete chain is last-in first-out as in mi_statrec.cc."]})


if __name__ == "__main__":
    main()
