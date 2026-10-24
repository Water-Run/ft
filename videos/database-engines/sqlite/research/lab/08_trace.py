"""Which file pages one query actually reads, observed at the VFS layer.

The pinned shell's -vfstrace option logs every call SQLite makes to the OS file
interface. A 1024-byte read at offset o is page o/1024+1. This is SQLite's own
read request to the operating system; it does not observe the OS cache or the device.
Each scenario runs in a fresh read-only shell process; the same query runs twice.
"""
import os
import re
import subprocess
from lab_common import TRANSCRIPT, VIDEO, current_base, executable, finish

PAGE = 1024
MARK = "@@SECOND_RUN@@"
READ = re.compile(r"trace\.xRead\(main\.db,n=(\d+),ofst=(\d+)\) -> (\w+)")


def run(base, sql):
    script = f"{sql}\n.print {MARK}\n{sql}\n"
    out = subprocess.run([str(executable()), "-batch", "-readonly", "-vfstrace", "-init", os.devnull, str(base)],
                         input=script, capture_output=True, encoding="utf-8", cwd=VIDEO).stdout
    # 公开记录不带本机路径：主库统一写成 main.db，其余路径写成 path
    public = []
    for line in out.splitlines():
        line = line.replace(str(base), "main.db").replace(str(base).replace("\\", "/"), "main.db")
        line = re.sub(r'"[^"]*(main\.db-(?:journal|wal))"', r'"\1"', line)
        public.append(line)
    return public


def reads(lines):
    """Split page reads into first and second run at the result rows."""
    runs, current, rows = [], [], []
    for line in lines:
        hit = READ.search(line)
        if hit:
            n, ofst, rc = int(hit[1]), int(hit[2]), hit[3]
            assert rc == "SQLITE_OK", line
            current.append({"bytes": n, "offset": ofst, "page": ofst // PAGE + 1 if n == PAGE else None})
        elif "|" in line and not line.startswith("trace."):
            rows.append(line)
        elif line == MARK:
            runs.append(current)
            current = []
    runs.append(current)
    return runs, rows


def main():
    base = current_base()
    scenarios = {}
    for name, sql in {"index_then_table": "SELECT id,name,age FROM users WHERE name='Alice';",
                      "covering": "SELECT id,name FROM users WHERE name='Alice';",
                      "table_scan": "SELECT id,name,age FROM users NOT INDEXED WHERE name='Alice';"}.items():
        lines = run(base, sql)
        TRANSCRIPT.extend([f"[{name}] sqlite3 -readonly -vfstrace main.db", sql, MARK, sql] + lines + [""])
        (first, second), rows = reads(lines)
        pages = [r["page"] for r in first if r["page"] is not None]
        scenarios[name] = {"sql": sql, "result_rows": rows,
                           "first_run_page_reads": pages,
                           "first_run_other_reads": [r for r in first if r["page"] is None],
                           "second_run_page_reads": [r["page"] for r in second if r["page"] is not None],
                           "second_run_other_reads": [r for r in second if r["page"] is None]}
    indexed = scenarios["index_then_table"]
    # 去掉打开连接时那一次读第 1 页（随即关闭再打开）之后，查询读入的页与 02 重建的路线逐一对照
    assert indexed["result_rows"][:1] == ["2050|Alice|42"]
    assert indexed["first_run_page_reads"][-7:] == [1, 262, 281, 263, 2, 133, 130], indexed["first_run_page_reads"]
    assert scenarios["covering"]["first_run_page_reads"][-4:] == [1, 262, 281, 263]
    for s in scenarios.values():
        assert s["second_run_page_reads"] == [], s["second_run_page_reads"]
    scan = scenarios["table_scan"]["first_run_page_reads"]
    finish("08_trace", {
        "summary": {"index_then_table": indexed["first_run_page_reads"][-7:],
                    "covering": scenarios["covering"]["first_run_page_reads"][-4:],
                    "table_scan_distinct_pages": len(set(scan[-261:])),
                    "second_run_page_reads": 0},
        "scenarios": scenarios,
        "limits": ["The shell opens the database once at start-up and reopens it; that first page-1 read "
                   "precedes the query and is listed separately in first_run_page_reads.",
                   "VFS reads are requests to the OS; OS page cache and device reads are not observed.",
                   "One pinned build on Windows; no timing conclusion is drawn."]})


if __name__ == "__main__":
    main()
