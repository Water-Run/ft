"""No log: the administrator adds one to every age, mysqld is killed half-way, and the table restarts half-changed.

The UPDATE sleeps 1 ms per row so it runs for several seconds; the server process is killed
about 2 s in. After restart: how many rows changed, the .MYI open counter left by the crash,
CHECK TABLE, and REPAIR TABLE.
"""
import time
import myi
from lab_common import TRANSCRIPT, Cli, Server, build, finish, new_run, stop_all

CHANGED = "SELECT SUM(age = 18 + id % 63 + 1) AS changed, SUM(age = 18 + id % 63) AS unchanged FROM users WHERE id <> 2050"


def main():
    run = new_run("08")
    server = Server(run, "server").start()
    try:
        c = Cli("admin"); build(c)
        c.run("UPDATE users SET age=42 WHERE id=2050")
        before = c.rows(CHANGED)
        admin = Cli("admin-batch", "demo")
        admin.send("UPDATE users SET age = age + 1 + 0 * SLEEP(0.001)")
        time.sleep(2.0)
        server.kill()
        state_after_kill = myi.header(server.file("demo", "users.MYI").read_bytes())[1]
        server.start()
        c = Cli("after-restart", "demo")
        counts = c.rows(CHANGED)
        alice = c.rows("SELECT id, name, age FROM users WHERE id = 2050")
        first_unchanged = c.rows("SELECT MIN(id) AS id FROM users WHERE id <> 2050 AND age = 18 + id % 63")
        check = c.rows("CHECK TABLE users")
        repair = c.rows("REPAIR TABLE users")
        check_after = c.rows("CHECK TABLE users")
        counts_after_repair = c.rows(CHANGED)
        c.close()
    finally:
        server.stop(); stop_all()
    changed, unchanged = int(counts[0]["changed"]), int(counts[0]["unchanged"])
    assert changed > 0 and unchanged > 0 and changed + unchanged == 4095
    finish("07_crash", {
        "summary": {"changed_rows": changed, "unchanged_rows": unchanged, "first_unchanged_id": first_unchanged[0]["id"],
                    "alice": alice, "open_count_after_kill": state_after_kill["open_count"],
                    "check": [[r["Msg_type"], r["Msg_text"]] for r in check],
                    "repair": [[r["Msg_type"], r["Msg_text"]] for r in repair],
                    "check_after_repair": [[r["Msg_type"], r["Msg_text"]] for r in check_after]},
        "before": before, "after_restart": counts, "after_repair": counts_after_repair,
        "state_after_kill": {k: state_after_kill[k] for k in ("open_count", "changed", "records", "del")},
        "limits": ["Process kill on one host, not a power loss; rows are updated in place one by one, so the split point "
                   "depends on timing and differs between runs.", "myisam_recover_options=OFF (default)."]})


if __name__ == "__main__":
    main()
