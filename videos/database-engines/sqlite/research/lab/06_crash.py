"""Kill our own shell mid-transaction after cache spill; verify journal recovery.

This is a process-crash experiment, not a power-cut or storage-hardware guarantee.
Only a newly created isolated copy is modified. Existing files are never removed.
"""
import shutil
from lab_common import Cli, current_base, finish, new_run, sha256


def main():
    directory = new_run("06")
    path = directory / "crash.db"
    shutil.copyfile(current_base(), path)
    with Cli(path, "baseline") as c:
        baseline = c.q("SELECT count(*) AS rows,sum(age) AS age_sum FROM users;")
    before = path.read_bytes()
    writer = Cli(path, "uncommitted-writer")
    writer.q("PRAGMA journal_mode=DELETE;")
    writer.raw("PRAGMA synchronous=FULL;\nPRAGMA cache_size=5;\nPRAGMA cache_spill=ON;\nPRAGMA secure_delete=OFF;")
    writer.raw("BEGIN IMMEDIATE;\nUPDATE users SET age=age+1;")
    journal = path.with_name(path.name + "-journal")
    assert journal.is_file() and journal.stat().st_size > 512
    dirty = path.read_bytes()
    assert dirty != before, "Small cache must have spilled uncommitted pages to main file"
    journal_blob = journal.read_bytes()
    assert journal_blob[:8] == bytes.fromhex("d9d505f920a163d7")
    writer.kill()
    exists_before_reopen = journal.exists()
    with Cli(path, "recovery") as c:
        restored = c.q("SELECT count(*) AS rows,sum(age) AS age_sum FROM users;")
        integrity = c.scalar("PRAGMA integrity_check;")
        alice = c.q("SELECT id,name,age FROM users WHERE id=2050;")
    assert restored == baseline and alice[0]["age"] == 42 and integrity == "ok"
    assert path.read_bytes() == before, "This experiment restored the complete baseline database bytes"
    assert not journal.exists()
    finish("06_crash", {"summary": {"baseline": baseline, "after_recovery": restored,
                                     "uncommitted_main_file_changed": dirty != before,
                                     "journal_present_before_reopen": exists_before_reopen,
                                     "journal_present_after_recovery": journal.exists(), "integrity_check": integrity},
                        "baseline_sha256": sha256(before), "dirty_sha256": sha256(dirty),
                        "recovered_sha256": sha256(path.read_bytes()),
                        "journal_bytes": len(journal_blob), "journal_header_hex": journal_blob[:28].hex(),
                        "journal_sha256": sha256(journal_blob), "alice_after_recovery": alice,
                        "limits": "One controlled process termination with DELETE/FULL/cache_size=5; no power-loss test."})


if __name__ == "__main__":
    main()
