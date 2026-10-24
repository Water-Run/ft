"""Rollback-journal mode, same controlled order as 05: one open reader, one writer.

Three real shell processes on a copy of the main database in DELETE journal mode.
Shows which steps succeed and which return "database is locked" (busy timeout 0),
for comparison with the WAL run in 05. Ordered steps, not a race or stress test.
"""
import shutil
from lab_common import Cli, current_base, finish, new_run

AGE = "SELECT age FROM users WHERE id=2050;"


def main():
    directory = new_run("10")
    path = directory / "journal.db"
    shutil.copyfile(current_base(), path)
    steps = []

    def step(who, what, result):
        steps.append({"process": who, "action": what, "result": result})

    with Cli(path, "writer") as writer, Cli(path, "old-reader") as reader, Cli(path, "new-reader") as fresh:
        assert writer.scalar("PRAGMA journal_mode=DELETE;") == "delete"
        writer.raw("PRAGMA synchronous=FULL;")
        reader.raw("BEGIN;")
        step("old-reader", "BEGIN; SELECT age", reader.scalar(AGE))
        writer.raw("BEGIN IMMEDIATE;\nUPDATE users SET age=43 WHERE id=2050;")
        step("writer", "BEGIN IMMEDIATE; UPDATE age=43", "ok")
        step("new-reader", "SELECT age while writer has not committed", fresh.scalar(AGE))
        blocked = writer.raw("COMMIT;", expected_error=True)
        assert "locked" in blocked.lower(), blocked
        step("writer", "COMMIT while old reader still reading", blocked.splitlines()[-1].split(": ", 1)[-1])
        late = fresh.raw(AGE, expected_error=True)
        assert "locked" in late.lower(), late
        step("new-reader", "SELECT age after the failed COMMIT", late.splitlines()[-1].split(": ", 1)[-1])
        step("old-reader", "SELECT age again", reader.scalar(AGE))
        reader.raw("COMMIT;")
        step("old-reader", "COMMIT (ends read transaction)", "ok")
        writer.raw("COMMIT;")
        step("writer", "COMMIT again", "ok")
        step("new-reader", "SELECT age", fresh.scalar(AGE))
        step("old-reader", "SELECT age", reader.scalar(AGE))
        assert writer.scalar("PRAGMA integrity_check;") == "ok"
    results = [s["result"] for s in steps]
    assert results[0] == 42 and results[2] == 42 and results[5] == 42 and results[-2:] == [43, 43]
    finish("10_locks", {
        "summary": {"journal_mode": "delete", "reader_during_uncommitted_write": results[2],
                    "commit_with_open_reader": results[3], "new_reader_after_failed_commit": results[4],
                    "commit_after_reader_finished": results[7], "values_after": results[-2:]},
        "steps": steps,
        "limits": ["Busy timeout 0, so every conflict returns immediately instead of waiting.",
                   "Controlled sequential order between real processes on one Windows host; not a race test.",
                   "Lock names follow atomiccommit.html sections 3.2-3.12; the shell reports only success or 'locked'."]})


if __name__ == "__main__":
    main()
