"""SQLite-only laboratory helpers. No Python sqlite3 engine is used.

All SQL is executed by one pinned official shell. Database files stay in out/lab/;
public transcripts contain SQL, results and generic database names, never host paths.
"""
import atexit
import hashlib
import json
import os
from pathlib import Path
import queue
import re
import subprocess
import threading

VIDEO = Path(__file__).resolve().parents[2]
LAB = VIDEO / "research/lab"
SOURCE = VIDEO / "research/_src"
WORK = VIDEO / "out/lab"
VERSION = "3.54.1"
TRANSCRIPT = []
PROCESSES = []


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def save(name, data):
    (LAB / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def finish(number, data):
    save(f"out_{number}.json", data)
    (LAB / f"out_{number}.txt").write_text("\n".join(TRANSCRIPT) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(data.get("summary", {}), ensure_ascii=False))


def new_run(stage):
    WORK.mkdir(parents=True, exist_ok=True)
    for number in range(1, 10000):
        candidate = WORK / f"{stage}-{number:03d}"
        if not candidate.exists():
            candidate.mkdir()
            return candidate
    raise RuntimeError("Too many experiment directories; no files removed")


def executable():
    result = Path(os.environ.get("FT_SQLITE", str(SOURCE / "sqlite-tools/sqlite3.exe")))
    if not result.is_file():
        raise RuntimeError("Run 01_environment.py or set FT_SQLITE to SQLite 3.54.1")
    return result


class Cli:
    def __init__(self, database, label="connection"):
        self.label = label
        self.counter = 0
        self.lines = queue.Queue()
        self.p = subprocess.Popen([str(executable()), "-batch", "-json", "-init", os.devnull, str(database)],
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                  encoding="utf-8", bufsize=1, cwd=VIDEO)
        PROCESSES.append(self.p)
        def read():
            for line in self.p.stdout:
                self.lines.put(line.rstrip("\r\n"))
            self.lines.put(None)
        threading.Thread(target=read, daemon=True).start()
        self.raw(".timeout 0\n.headers on\n.mode json\n.explain off", log=False)
        actual = json.loads(self.raw("SELECT sqlite_version() AS version;", log=False))[0]["version"]
        assert actual == VERSION, f"Expected {VERSION}, got {actual}"

    def raw(self, sql, expected_error=False, log=True):
        self.counter += 1
        marker = f"__SQLITE_LAB_END_{self.counter}__"
        self.p.stdin.write(sql.rstrip() + "\n.print " + marker + "\n")
        self.p.stdin.flush()
        lines = []
        while True:
            line = self.lines.get(timeout=30)
            if line is None:
                raise RuntimeError("SQLite shell exited before end marker")
            if line == marker:
                break
            lines.append(line)
        result = "\n".join(lines)
        if log:
            TRANSCRIPT.extend([f"[{self.label}] {sql}", result or "(no result rows)", ""])
        error = re.search(r"^(?:Runtime error|Parse error|Error)\b", result, re.M) is not None
        if expected_error:
            assert error, result
        elif error:
            raise RuntimeError(result)
        return result

    def q(self, sql):
        raw = self.raw(sql)
        return json.loads(raw) if raw else []

    def scalar(self, sql):
        return next(iter(self.q(sql)[0].values()))

    def close(self):
        if self.p.poll() is None:
            self.p.stdin.write(".quit\n")
            self.p.stdin.flush()
            self.p.wait(timeout=15)

    def kill(self):
        self.p.kill()
        self.p.wait(timeout=15)
        TRANSCRIPT.append(f"[{self.label}] Shell process forcibly terminated, without COMMIT or graceful close.\n")

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


@atexit.register
def stop_shells():
    for process in PROCESSES:
        if process.poll() is None:
            process.kill()
            process.wait(timeout=15)


SCHEMA = "CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER NOT NULL);"


def insert_sql(first, last):
    return (f"WITH RECURSIVE n(i) AS (VALUES({first}) UNION ALL SELECT i+1 FROM n WHERE i<{last}) "
            "INSERT INTO users SELECT i, CASE WHEN i=2050 THEN 'Alice' ELSE printf('User%05d-',i)||"
            "'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN' END, CASE WHEN i=2050 THEN 42 ELSE 18+i%63 END FROM n;")


def build(database, page_size=1024, rows=4096, indexes=True):
    with Cli(database, "build") as c:
        c.raw(f"PRAGMA page_size={page_size};\nPRAGMA auto_vacuum=NONE;\nPRAGMA secure_delete=OFF;")
        c.q("PRAGMA journal_mode=DELETE;")
        c.raw(SCHEMA)
        if rows:
            c.raw(insert_sql(1, rows))
        if indexes:
            c.raw("CREATE INDEX idx_users_name ON users(name);\nCREATE INDEX idx_users_age ON users(age);")
        assert c.scalar("PRAGMA integrity_check;") == "ok"


def current_base():
    meta = json.loads((WORK / "current.json").read_text(encoding="utf-8"))
    result = (WORK / meta["base"]).resolve()
    assert result.is_relative_to(WORK.resolve()) and result.is_file()
    return result
