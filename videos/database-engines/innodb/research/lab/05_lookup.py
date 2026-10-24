"""05 查：按主键查与按姓名查各读了哪几页，第二次查是否命中缓冲池（MySQL 9.7.4）。

建表后慢速关机，关掉启动时的缓冲池预热（--innodb-buffer-pool-load-at-startup=OFF），重启后缓冲池是冷的。
每次查询前后读 Innodb_buffer_pool_reads（从磁盘读入的页数）与 Innodb_buffer_pool_read_requests（逻辑读页次数），
并用 information_schema.innodb_buffer_page 列出 users 表此刻在缓冲池里的页号。
"""
from lab_common import Cli, Server, build, finish, new_run


def status(cli):
    rows = cli.rows("SHOW GLOBAL STATUS WHERE Variable_name IN ('Innodb_buffer_pool_reads', 'Innodb_buffer_pool_read_requests')")
    return {r["Variable_name"]: int(r["Value"]) for r in rows}


def pages_in_pool(cli):
    return [int(r["page_number"]) for r in cli.rows(
        "SELECT PAGE_NUMBER AS page_number FROM information_schema.innodb_buffer_page "
        "WHERE TABLE_NAME = '`demo`.`users`' ORDER BY PAGE_NUMBER")]


def main():
    run = new_run("05_lookup")
    server = Server(run, "lab", extra=("--innodb-buffer-pool-load-at-startup=OFF", "--innodb-buffer-pool-dump-at-shutdown=OFF")).start()
    admin = Cli("admin")
    build(admin, "demo", "users", 4096)
    admin.run("SET GLOBAL innodb_fast_shutdown = 0")
    admin.close(); server.stop()

    server.start()
    s = Cli("Bob", "demo")
    out = {"queries": []}
    for label, sql in [("by_id_cold", "SELECT * FROM users WHERE id = 2050"),
                       ("by_id_warm", "SELECT * FROM users WHERE id = 2050"),
                       ("by_name_cold_secondary", "SELECT * FROM users WHERE name = 'Alice'"),
                       ("by_name_warm", "SELECT * FROM users WHERE name = 'Alice'")]:
        before, pool_before = status(s), pages_in_pool(s)
        result = s.rows(sql)
        after, pool_after = status(s), pages_in_pool(s)
        out["queries"].append({"label": label, "sql": sql, "result": result,
                               "disk_reads": after["Innodb_buffer_pool_reads"] - before["Innodb_buffer_pool_reads"],
                               "logical_reads": after["Innodb_buffer_pool_read_requests"] - before["Innodb_buffer_pool_read_requests"],
                               "new_pages_in_pool": sorted(set(pool_after) - set(pool_before))})
    out["explain_by_name"] = s.rows("EXPLAIN SELECT * FROM users WHERE name = 'Alice'")
    out["explain_by_id"] = s.rows("EXPLAIN SELECT * FROM users WHERE id = 2050")
    s.close(); server.stop()
    out["summary"] = [{k: q[k] for k in ("label", "disk_reads", "logical_reads", "new_pages_in_pool")} for q in out["queries"]]
    finish("05", out)


if __name__ == "__main__":
    main()
