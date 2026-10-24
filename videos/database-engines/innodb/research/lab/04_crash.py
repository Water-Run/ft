"""04 出错：已提交的修改在、改到一半的回滚掉（MySQL 9.7.4，innodb_flush_log_at_trx_commit=1）。

Alice 把年龄改成 43 并提交；随后管理员开始一条全表 UPDATE（每行 age + 1，逐行放慢），改到一半时强行结束 mysqld。
重启后：Alice 的 43 还在吗？管理员改过的那些行回到原值了吗？错误日志里的恢复过程照录。
同时实查 redo、检查点与 doublewrite 的配置与文件。
"""
import re, time
from lab_common import Cli, Server, build, finish, new_run

CHANGED = ("SELECT SUM(age = 18 + id % 63 + 1) AS changed, SUM(age = 18 + id % 63) AS unchanged "
           "FROM users WHERE id <> 2050")


def log_section(cli):
    s = cli.run("SHOW ENGINE INNODB STATUS", log=False)
    i = s.find("\nLOG\n")
    return s[i:i + 600] if i >= 0 else ""


def main():
    run = new_run("04_crash")
    server = Server(run, "lab", extra=("--log-error-verbosity=3",)).start()   # 记下恢复过程的提示信息
    admin = Cli("admin")
    build(admin, "demo", "users", 4096)
    cfg = admin.rows("SELECT @@innodb_flush_log_at_trx_commit AS flush_at_commit, @@innodb_doublewrite AS doublewrite, "
                     "@@innodb_redo_log_capacity AS redo_capacity, @@innodb_page_size AS page_size, @@innodb_fast_shutdown AS fast_shutdown")[0]
    out = {"config": cfg}

    alice = Cli("Alice", "demo")
    alice.run("UPDATE users SET age = 43 WHERE id = 2050")            # 自动提交
    out["log_before"] = log_section(admin)
    bulk = Cli("admin-bulk", "demo")
    bulk.run("START TRANSACTION")
    bulk.send("UPDATE users SET age = age + 1 + 0 * SLEEP(0.002) WHERE id <> 2050")
    time.sleep(4.0)
    progress = admin.rows("SELECT trx_rows_modified AS rows_modified, trx_state AS state FROM information_schema.innodb_trx")
    out["bulk_progress_at_kill"] = progress
    out["log_at_kill"] = log_section(admin)
    server.kill()

    t0 = time.time()
    server.start()
    out["restart_seconds"] = round(time.time() - t0, 1)
    check = Cli("check", "demo")
    out["alice_after_restart"] = check.rows("SELECT id, name, age FROM users WHERE id = 2050")
    out["bulk_after_restart"] = check.rows(CHANGED)
    check.close()
    server.stop()
    log = (run / "server.log").read_text(encoding="utf-8", errors="replace")
    keep = [l.replace(str(run.resolve()), "<run>").replace(str(run), "<run>") for l in log.splitlines()
            if re.search(r"recover|Rolling back|rollback|redo|crash|Rollback|undo|doublewrite|LSN|checkpoint", l, re.I)]   # 公开记录不留本机路径
    out["server_log_recovery_lines"] = keep[-40:]
    out["summary"] = {"alice": out["alice_after_restart"], "bulk_rows_modified_at_kill": progress,
                      "bulk_after_restart": out["bulk_after_restart"], "config": cfg}
    finish("04", out)


if __name__ == "__main__":
    main()
