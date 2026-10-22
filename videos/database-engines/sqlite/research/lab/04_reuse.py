"""Measure deletion, freelist reuse and VACUUM on an isolated copy of the dataset."""
import shutil
from lab_common import Cli, current_base, finish, insert_sql, new_run
from page_map import measure


def main():
    path = new_run("04") / "reuse.db"
    shutil.copyfile(current_base(), path)
    snapshots = {}
    with Cli(path, "reuse") as c:
        for label, sql in [("before", None), ("deleted", "DELETE FROM users WHERE id>1024;"),
                           ("reused", insert_sql(4097, 5120)), ("vacuumed", "VACUUM;")]:
            if sql:
                c.raw(sql)
            mapped = measure(c, path)
            assert c.scalar("PRAGMA integrity_check;") == "ok"
            snapshots[label] = {"rows": c.scalar("SELECT count(*) FROM users;"), "file_bytes": path.stat().st_size,
                                "structure": mapped}
    before, deleted, reused, vacuumed = [snapshots[k] for k in ("before", "deleted", "reused", "vacuumed")]
    assert deleted["rows"] == 1024 and reused["rows"] == vacuumed["rows"] == 2048
    assert before["file_bytes"] == deleted["file_bytes"] == reused["file_bytes"]
    assert deleted["structure"]["freelist_count"] > reused["structure"]["freelist_count"] > 0
    assert vacuumed["file_bytes"] < reused["file_bytes"] and vacuumed["structure"]["freelist_count"] == 0
    summary = {name: {"rows": s["rows"], "page_count": s["structure"]["page_count"],
                      "freelist_count": s["structure"]["freelist_count"], "file_bytes": s["file_bytes"]}
               for name, s in snapshots.items()}
    finish("04_reuse", {"summary": summary, "snapshots": snapshots,
                        "limits": "auto_vacuum=NONE; file-size behaviour is limited to this measured workload and settings."})


if __name__ == "__main__":
    main()
