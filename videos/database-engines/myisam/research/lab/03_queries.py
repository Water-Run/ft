"""Finding Alice: which file reads mysqld actually issues on users.MYI / users.MYD, and key-cache counters.

performance_schema.file_summary_by_instance counts mysqld's read calls per file. The key cache
is emptied by restarting the server before each scenario; each query then runs twice.
"""
from lab_common import Cli, Server, build, finish, new_run, stop_all

QUERIES = {"index": "SELECT id, name, age FROM users WHERE name='Alice'",
           "scan": "SELECT id, name, age FROM users IGNORE INDEX (idx_name) WHERE name='Alice'",
           "covering": "SELECT id FROM users WHERE name='Alice'"}


def file_reads(c):
    rows = c.rows("SELECT SUBSTRING_INDEX(REPLACE(FILE_NAME, CHAR(92), '/'), '/', -1) AS f, COUNT_READ AS n_read, "
                  "SUM_NUMBER_OF_BYTES_READ AS bytes FROM performance_schema.file_summary_by_instance "
                  "WHERE EVENT_NAME IN ('wait/io/file/myisam/kfile', 'wait/io/file/myisam/dfile') "
                  "AND FILE_NAME LIKE '%users.MY%' ORDER BY f")
    return {r["f"]: {"reads": int(r["n_read"]), "bytes": int(r["bytes"])} for r in rows}


def counters(c):
    rows = c.rows("SHOW GLOBAL STATUS WHERE Variable_name IN ('Key_read_requests','Key_reads','Handler_read_key',"
                  "'Handler_read_next','Handler_read_rnd_next')")
    return {r["Variable_name"]: int(r["Value"]) for r in rows}


def main():
    run = new_run("03")
    server = Server(run, "server").start()
    results = {}
    try:
        c = Cli("build"); build(c); c.close()
        for name, sql in QUERIES.items():
            server.stop(); server.start()              # 空的键缓存
            c = Cli(name, "demo")
            c.run("SELECT COUNT(*) FROM users")         # 先打开表，把打开表本身的读取排除在外
            runs = []
            for _ in range(2):
                c.run("TRUNCATE performance_schema.file_summary_by_instance")
                before = counters(c)
                result = c.rows(sql)
                after = counters(c)
                runs.append({"result": result, "file_reads": file_reads(c),
                             "counters": {k: after[k] - before[k] for k in after}})
            c.close()
            results[name] = {"sql": sql, "runs": runs}
    finally:
        server.stop(); stop_all()
    idx = results["index"]["runs"]
    assert idx[0]["result"] == [{"id": "2050", "name": "Alice", "age": "42"}]
    finish("03_queries", {
        "summary": {name: [{"Key_reads": r["counters"]["Key_reads"], "Key_read_requests": r["counters"]["Key_read_requests"],
                            "Handler_read_rnd_next": r["counters"]["Handler_read_rnd_next"],
                            "file_reads": r["file_reads"]} for r in v["runs"]] for name, v in results.items()},
        "scenarios": results,
        "limits": ["Counters are global; nothing else runs on this private server during a scenario.",
                   "Status queries themselves touch no MyISAM user table.",
                   "File reads are mysqld's calls to the OS; OS cache and device are not observed."]})


if __name__ == "__main__":
    main()
