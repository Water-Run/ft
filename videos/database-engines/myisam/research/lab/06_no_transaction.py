"""No transactions: ROLLBACK cannot undo a MyISAM change; the same statements on an InnoDB copy are undone."""
from lab_common import Cli, Server, build, finish, new_run, stop_all


def main():
    server = Server(new_run("07"), "server").start()
    try:
        c = Cli("admin"); build(c)
        c.run("CREATE TABLE users_innodb ENGINE=InnoDB AS SELECT * FROM users")
        alice = Cli("Alice", "demo")
        out = {}
        for table in ("users", "users_innodb"):
            alice.run("START TRANSACTION")
            alice.run(f"UPDATE {table} SET age=43 WHERE id=2050")
            text = alice.run("ROLLBACK; SHOW WARNINGS")             # 同一批里取警告：之后的语句会清空警告
            lines = [l for l in text.splitlines() if l.startswith("|")]
            head = [x.strip() for x in lines[0].strip("|").split("|")] if lines else []
            warnings = [dict(zip(head, [x.strip() for x in l.strip("|").split("|")])) for l in lines[1:]]
            age = alice.rows(f"SELECT age FROM {table} WHERE id=2050")[0]["age"]
            engine = alice.rows(f"SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA='demo' AND TABLE_NAME='{table}'")[0]["ENGINE"]
            out[table] = {"engine": engine, "rollback_output": text, "warnings": warnings, "age_after_rollback": int(age)}
        alice.close(); c.close()
    finally:
        server.stop(); stop_all()
    assert out["users"]["age_after_rollback"] == 43 and out["users_innodb"]["age_after_rollback"] == 42
    assert any(w.get("Code") == "1196" for w in out["users"]["warnings"])
    finish("06_no_transaction", {"summary": {t: {"engine": v["engine"], "age_after_rollback": v["age_after_rollback"],
                                                 "warning_codes": [w.get("Code") for w in v["warnings"]]} for t, v in out.items()},
                                 "tables": out})


if __name__ == "__main__":
    main()
