"""MyISAM table-level locks with real client sessions: Bob reads, Alice and Carol write, Dave inserts.

A statement holds the table lock while it runs; SLEEP inside a statement keeps it open for about
three seconds. Bob's read scans the whole table (a single-row primary-key lookup is read during
optimization and its lock released early, so it would not show the wait). Waiting sessions are
observed in performance_schema.processlist; every session's finishing time is measured
independently from t0.
"""
import threading
import time
from lab_common import Cli, Server, build, finish, new_run, stop_all

BOB_SCAN = "SELECT COUNT(*) AS n, SLEEP(3) AS reading FROM users WHERE age > 0"


def states(observer):
    return [[r["who"], r["state"], r["info"]] for r in observer.rows(
        "SELECT ID AS who, STATE AS state, LEFT(INFO, 50) AS info FROM performance_schema.processlist "
        "WHERE COMMAND = 'Query' AND INFO NOT LIKE '%processlist%' ORDER BY ID")]


def start_timers(t0, sessions, out):
    """Wait for every session in its own thread, recording when each statement finished."""
    def wait(name, cli):
        text = cli.wait()
        out[name] = {"seconds": round(time.monotonic() - t0, 2), "last_line": text.splitlines()[-2] if text else ""}
    threads = [threading.Thread(target=wait, args=item) for item in sessions.items()]
    for t in threads:
        t.start()
    return threads


def scenario(obs, first, others):
    """first = (name, cli, sql) starts at t0; others start 0.3 s later; states are sampled at 1.0 s."""
    done = {}
    t0 = time.monotonic()
    first[1].send(first[2])
    threads = start_timers(t0, {first[0]: first[1]}, done)
    time.sleep(0.3)
    for _, cli, sql in others:
        cli.send(sql)
    threads += start_timers(t0, {name: cli for name, cli, _ in others}, done)
    time.sleep(0.7)
    seen = states(obs)
    for t in threads:
        t.join()
    return {"first": [first[0], first[2]], "then": [[n, s] for n, _, s in others], "states_at_1s": seen, "finished": done}


def main():
    run = new_run("06")
    server = Server(run, "server").start()
    parts = {}
    try:
        admin = Cli("admin"); build(admin)
        bob, alice, carol, dave, obs = (Cli(n, "demo") for n in ("Bob", "Alice", "Carol", "Dave", "observer"))
        ids = {n: c.rows("SELECT CONNECTION_ID() AS id")[0]["id"] for n, c in
               (("Bob", bob), ("Alice", alice), ("Carol", carol), ("Dave", dave))}
        parts["Bob reads the whole table; Alice and Carol write"] = scenario(obs, ("Bob", bob, BOB_SCAN), [
            ("Alice", alice, "UPDATE users SET age=43 WHERE id=2050"),
            ("Carol", carol, "UPDATE users SET age=31 WHERE id=2052")])
        parts["Alice writes slowly; Bob reads, Dave inserts"] = scenario(obs, ("Alice", alice,
            "UPDATE users SET age=44 + 0*SLEEP(3) WHERE id=2050"), [
            ("Bob", bob, "SELECT age FROM users WHERE id=2050"),
            ("Dave", dave, "INSERT INTO users VALUES (4097, 'Dave', 30)")])
        parts["Bob reads the whole table; Dave appends, Carol writes"] = scenario(obs, ("Bob", bob, BOB_SCAN), [
            ("Dave", dave, "INSERT INTO users VALUES (4098, 'Dave2', 31)"),
            ("Carol", carol, "UPDATE users SET age=32 WHERE id=2052")])
        # 四、删掉一行、文件中间有了空位之后，Bob 读着时新用户的插入也要等
        admin.run("DELETE FROM demo.users WHERE id=2")
        parts["after a deletion leaves a hole: Bob reads, a new user inserts"] = scenario(obs, ("Bob", bob, BOB_SCAN), [
            ("Dave", dave, "INSERT INTO users VALUES (4099, 'User04099-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN', 30)")])
        final = admin.rows("SELECT id, name, age FROM demo.users WHERE id IN (2050, 2052, 4097, 4098, 4099) ORDER BY id")
        for c in (admin, bob, alice, carol, dave, obs):
            c.close()
    finally:
        server.stop(); stop_all()
    p1, p2, p3, p4 = parts.values()
    who = {v: k for k, v in ids.items()}
    for p in parts.values():
        for s in p["states_at_1s"]:
            s[0] = who.get(s[0], s[0])
    assert p1["finished"]["Alice"]["seconds"] >= 2.9 and p1["finished"]["Carol"]["seconds"] >= 2.9
    assert p2["finished"]["Bob"]["seconds"] >= 2.9 and p2["finished"]["Dave"]["seconds"] >= 2.9
    assert p3["finished"]["Dave"]["seconds"] < 0.6 and p3["finished"]["Carol"]["seconds"] >= 2.9
    assert p4["finished"]["Dave"]["seconds"] >= 2.9
    finish("05_locks", {
        "summary": {name: {"states_at_1s": [s[:2] for s in p["states_at_1s"]],
                           "finished_s": {k: v["seconds"] for k, v in p["finished"].items()}} for name, p in parts.items()},
        "parts": parts, "final_rows": final, "connections": ids,
        "limits": ["SLEEP keeps a statement (and its table lock) open for about 3 s; wall-clock timings on one host.",
                   "A single-row primary-key SELECT is read during optimization and does not hold the lock for its whole run.",
                   "concurrent_insert=AUTO: appends skip the wait only while the data file has no holes (parts 3 and 4)."]})


if __name__ == "__main__":
    main()
