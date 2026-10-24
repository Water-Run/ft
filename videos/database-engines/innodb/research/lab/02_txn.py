"""02 事务：改与回滚、行头变化、多版本读、行锁、间隙锁、死锁（MySQL 9.7.4，InnoDB，默认可重复读）。

A. 行头：慢速关机后解析 Alice 所在的叶页 → 提交一次 UPDATE → 再慢速关机解析，比较事务号与回滚指针。
B. 回滚：同一句 START TRANSACTION / UPDATE / ROLLBACK，分别作用于 InnoDB 的 users 与 MyISAM 副本 users_myisam。
C. 多版本：Bob 在可重复读下开事务先读，Alice 改并提交，Bob 再读（快照）与锁定读；读已提交下重做一遍。
D. 行锁：Alice 未提交的 UPDATE 持有 2050 的记录锁，Carol 改同一行等待直到超时（1205）；改别的行不等。
E. 间隙锁：删掉 2050 并提交后，Bob 以范围锁定读 id 2049..2051，Dave 插入 2050 被挡住（等待超时）；Bob 结束后插入成功。
F. 死锁：Alice 锁 2049 再要 2051，Carol 锁 2051 再要 2049，InnoDB 检测到死锁并回滚其中一个（1213）。
锁的种类取自 performance_schema.data_locks。
"""
import ibd
from lab_common import SOURCE, Cli, Server, build, finish, new_run, TRANSCRIPT
import shutil, time


def leaf_record(server, tag):
    dst = SOURCE / f"v974_02_{tag}.ibd"
    shutil.copyfile(server.file("demo", "users.ibd"), dst)
    data = dst.read_bytes()
    path, rec = ibd.find_leaf_record(data, 4, "PRIMARY", "id", 2050)
    p = ibd.page(data, rec["page"])
    return {"path": [x["page"] for x in path], "page": rec["page"], "offset": rec["offset"], "header_hex": rec["header_hex"],
            "fields_hex": rec["fields_hex"], "record": rec["record"], "page_max_trx_id": ibd.header(p)["max_trx_id"]}


def locks(cli):
    return cli.rows("SELECT ENGINE_TRANSACTION_ID AS trx, INDEX_NAME AS idx, LOCK_TYPE AS type, LOCK_MODE AS mode, "
                    "LOCK_STATUS AS status, LOCK_DATA AS data FROM performance_schema.data_locks "
                    "WHERE OBJECT_NAME='users' ORDER BY ENGINE_TRANSACTION_ID, LOCK_TYPE, LOCK_DATA")


def main():
    run = new_run("02_txn")
    out = {}
    server = Server(run, "lab").start()
    admin = Cli("admin")
    build(admin, "demo", "users", 4096)
    admin.run("CREATE TABLE users_myisam ENGINE=MyISAM AS SELECT * FROM users")
    admin.run("SET GLOBAL innodb_fast_shutdown = 0")
    admin.close(); server.stop()
    out["A_before"] = leaf_record(server, "before")

    # A. 提交一次修改，再看行头
    server.start()
    alice = Cli("Alice", "demo")
    alice.run("START TRANSACTION")
    alice.run("UPDATE users SET age = 43 WHERE id = 2050")
    out["A_trx_id_while_open"] = alice.rows("SELECT trx_id FROM information_schema.innodb_trx")
    alice.run("COMMIT")
    alice.run("SET GLOBAL innodb_fast_shutdown = 0")
    alice.close(); server.stop()
    out["A_after"] = leaf_record(server, "after")

    server.start()
    admin = Cli("admin", "demo")
    admin.run("UPDATE users SET age = 42 WHERE id = 2050")             # 复原，后面的演示从 42 开始
    admin.run("UPDATE users_myisam SET age = 42 WHERE id = 2050")

    # B. 同一句 ROLLBACK
    alice = Cli("Alice", "demo")
    out["B"] = {}
    for table in ("users", "users_myisam"):
        alice.run("START TRANSACTION")
        alice.run(f"UPDATE {table} SET age = 43 WHERE id = 2050")
        text = alice.run("ROLLBACK; SHOW WARNINGS")
        out["B"][table] = {"after_rollback": alice.rows(f"SELECT age FROM {table} WHERE id = 2050")[0]["age"], "warnings": text}
    admin.run("UPDATE users_myisam SET age = 42 WHERE id = 2050")

    # C. 多版本读：可重复读，再读已提交
    bob = Cli("Bob", "demo")
    out["C"] = {}
    for iso in ("REPEATABLE READ", "READ COMMITTED"):
        bob.run(f"SET SESSION TRANSACTION ISOLATION LEVEL {iso}")
        bob.run("START TRANSACTION")
        r1 = bob.rows("SELECT age FROM users WHERE id = 2050")[0]["age"]
        alice.run("START TRANSACTION"); alice.run("UPDATE users SET age = 43 WHERE id = 2050")
        r2 = bob.rows("SELECT age FROM users WHERE id = 2050")[0]["age"]          # Alice 未提交
        alice.run("COMMIT")
        r3 = bob.rows("SELECT age FROM users WHERE id = 2050")[0]["age"]          # Alice 已提交
        r4 = bob.rows("SELECT age FROM users WHERE id = 2050 FOR SHARE")[0]["age"]  # 锁定读：读最新已提交的版本
        bob.run("COMMIT")
        out["C"][iso] = {"bob_first": r1, "bob_while_alice_uncommitted": r2, "bob_after_alice_commit": r3, "bob_locking_read": r4}
        admin.run("UPDATE users SET age = 42 WHERE id = 2050")

    # D. 行锁：Carol 改同一行要等
    carol = Cli("Carol", "demo")
    carol.run("SET SESSION innodb_lock_wait_timeout = 3")
    alice.run("START TRANSACTION"); alice.run("UPDATE users SET age = 43 WHERE id = 2050")
    t0 = time.time()
    carol.send("UPDATE users SET age = 44 WHERE id = 2050")
    time.sleep(1.0)
    waiting = locks(admin)
    text = carol.wait(timeout=30)
    out["D"] = {"locks_while_carol_waits": waiting, "carol_result": text, "carol_waited_s": round(time.time() - t0, 1),
                "carol_other_row": carol.run("UPDATE users SET age = age WHERE id = 2051")}
    alice.run("ROLLBACK")

    # E. 间隙锁：删掉 2050 留下空隙，范围锁定读挡住插入
    admin.run("DELETE FROM users WHERE id = 2050")
    dave = Cli("Dave", "demo")
    dave.run("SET SESSION innodb_lock_wait_timeout = 3")
    bob.run("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ")
    bob.run("START TRANSACTION")
    first = bob.rows("SELECT id FROM users WHERE id BETWEEN 2049 AND 2051 FOR UPDATE")
    gap_locks = locks(admin)
    t0 = time.time()
    blocked = dave.run("INSERT INTO users VALUES (2050, 'Dave', 35)", expect_error=True)
    waited = round(time.time() - t0, 1)
    second = bob.rows("SELECT id FROM users WHERE id BETWEEN 2049 AND 2051 FOR UPDATE")
    bob.run("COMMIT")
    ok = dave.run("INSERT INTO users VALUES (2050, 'Dave', 35)")
    out["E"] = {"bob_first": [r["id"] for r in first], "locks": gap_locks, "dave_blocked": blocked, "dave_waited_s": waited,
                "bob_second": [r["id"] for r in second], "dave_after_bob": ok,
                "final": admin.rows("SELECT id, name, age FROM users WHERE id BETWEEN 2049 AND 2051")}
    admin.run("DELETE FROM users WHERE id = 2050"); admin.run("INSERT INTO users VALUES (2050, 'Alice', 42)")

    # F. 死锁
    alice.run("START TRANSACTION"); carol.run("START TRANSACTION")
    alice.run("UPDATE users SET age = age + 1 WHERE id = 2049")
    carol.run("UPDATE users SET age = age + 1 WHERE id = 2051")
    alice.send("UPDATE users SET age = age + 1 WHERE id = 2051")
    time.sleep(1.0)
    carol_text = carol.run("UPDATE users SET age = age + 1 WHERE id = 2049", expect_error=True)
    alice_text = alice.wait(timeout=30)
    alice.run("COMMIT")
    status = admin.run("SHOW ENGINE INNODB STATUS", log=False)
    dl = status[status.find("LATEST DETECTED DEADLOCK"):status.find("TRANSACTIONS", status.find("LATEST DETECTED DEADLOCK"))]
    out["F"] = {"carol": carol_text, "alice": alice_text, "deadlock_section_head": dl[:1200],
                "final": admin.rows("SELECT id, age FROM users WHERE id IN (2049, 2051)")}
    for c in (alice, bob, carol, dave, admin):
        c.close()
    server.stop()

    out["summary"] = {
        "row_header": {"before": {k: out["A_before"]["record"][k] for k in ("trx_id", "roll_ptr", "age")},
                       "after": {k: out["A_after"]["record"][k] for k in ("trx_id", "roll_ptr", "age")}},
        "rollback": {t: out["B"][t]["after_rollback"] for t in out["B"]},
        "mvcc": out["C"], "carol": out["D"]["carol_result"][:80], "dave_blocked": out["E"]["dave_blocked"][:80],
        "deadlock": out["F"]["carol"][:90]}
    finish("02", out)


if __name__ == "__main__":
    main()
