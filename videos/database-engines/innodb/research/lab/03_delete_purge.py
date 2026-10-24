"""03 删除：删除标记 → purge → 页内空间复用（MySQL 9.7.4）。

Bob 开着一个一致性快照时，管理员删掉 Alice 并提交：Bob 仍读到她；此刻把表空间落盘（FLUSH TABLES … FOR EXPORT）
解析叶页，Alice 那一行还在，只是打了删除标记。Bob 结束后等 purge 做完再落盘：那一行从记录链上摘掉，空间进了页内空闲链。
Dave 插入同一个主键：看他的行是否落在 Alice 留下的空间里。
"""
import shutil, time
import ibd
from lab_common import SOURCE, Cli, Server, build, finish, new_run


def snapshot(server, admin, tag):
    admin.run("FLUSH TABLES users FOR EXPORT")
    dst = SOURCE / f"v974_03_{tag}.ibd"
    shutil.copyfile(server.file("demo", "users.ibd"), dst)
    admin.run("UNLOCK TABLES")
    data = dst.read_bytes()
    p = ibd.page(data, 27)
    h = ibd.header(p)
    recs = []
    for o, info, st in ibd.records(p):
        r = ibd.decode(p, o, "PRIMARY", True)
        if 2048 <= r["id"] <= 2052:
            recs.append({"offset": o, "id": r["id"], "name": r["name"], "age": r["age"], "trx_id": r["trx_id"],
                         "roll_ptr": r["roll_ptr"], "deleted": bool(info & 2)})
    free = ibd.u16(p, 44)
    return {"page": 27, "n_recs": h["n_recs"], "garbage": h["garbage"], "heap_top": h["heap_top"], "page_free_offset": free, "records": recs}


def history_length(admin):
    s = admin.run("SHOW ENGINE INNODB STATUS", log=False)
    i = s.find("History list length")
    return int(s[i:].split()[3]) if i >= 0 else None


def main():
    run = new_run("03_delete")
    server = Server(run, "lab").start()
    admin = Cli("admin")
    build(admin, "demo", "users", 4096)
    out = {"start": snapshot(server, admin, "start")}

    bob = Cli("Bob", "demo")
    bob.run("START TRANSACTION WITH CONSISTENT SNAPSHOT")
    out["bob_before"] = bob.rows("SELECT id, name, age FROM users WHERE id = 2050")
    admin.run("DELETE FROM users WHERE id = 2050")
    out["admin_sees"] = admin.rows("SELECT COUNT(*) AS n FROM users WHERE id = 2050")
    out["bob_after_delete"] = bob.rows("SELECT id, name, age FROM users WHERE id = 2050")
    out["history_while_bob_open"] = history_length(admin)
    out["delete_marked"] = snapshot(server, admin, "marked")

    bob.run("COMMIT")
    for _ in range(60):                          # 等 purge 把历史清空
        if history_length(admin) == 0:
            break
        time.sleep(0.5)
    out["history_after"] = history_length(admin)
    out["purged"] = snapshot(server, admin, "purged")

    dave = Cli("Dave", "demo")
    dave.run("INSERT INTO users VALUES (2050, 'Dave', 35)")
    out["dave"] = snapshot(server, admin, "dave")
    for c in (bob, dave, admin):
        c.close()
    server.stop()

    alice_off = next(r["offset"] for r in out["start"]["records"] if r["id"] == 2050)
    dave_rec = next((r for r in out["dave"]["records"] if r["id"] == 2050), None)
    out["summary"] = {
        "bob_still_sees_alice": out["bob_after_delete"],
        "marked": next((r for r in out["delete_marked"]["records"] if r["id"] == 2050), None),
        "after_purge_has_2050": any(r["id"] == 2050 for r in out["purged"]["records"]),
        "garbage": [out[k]["garbage"] for k in ("start", "delete_marked", "purged", "dave")],
        "alice_offset": alice_off, "dave_offset": dave_rec["offset"] if dave_rec else None,
        "page_free_after_purge": out["purged"]["page_free_offset"]}
    finish("03", out)


if __name__ == "__main__":
    main()
