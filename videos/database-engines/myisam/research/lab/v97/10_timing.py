"""How long one lookup takes on the old episode's 8-row MyISAM table, measured by the server itself.

performance_schema.events_statements_history_long records each statement's TIMER_WAIT in
picoseconds. The client echo rounds to hundredths of a second, which shows 0.00 sec.
"""
import statistics
import subprocess
from lab_common import PORT, TRANSCRIPT, Cli, Server, finish, new_run, stop_all, tool

SETUP = ["CREATE DATABASE myisam_demo DEFAULT CHARACTER SET latin1", "USE myisam_demo",
         "CREATE TABLE users (id INT NOT NULL, name CHAR(10) NOT NULL, age TINYINT NOT NULL, PRIMARY KEY (id), "
         "KEY idx_name (name)) ENGINE=MyISAM",
         "INSERT INTO users VALUES (1,'alice',30),(2,'bob',25),(3,'carol',41),(4,'dave',19),(5,'erin',33),"
         "(6,'frank',52),(7,'grace',28),(8,'heidi',36)"]
QUERY = "SELECT * FROM users WHERE name = 'alice'"


def main():
    server = Server(new_run("10"), "server").start()
    try:
        c = Cli("admin")
        for sql in SETUP:
            c.run(sql)
        c.run("UPDATE performance_schema.setup_consumers SET ENABLED='YES' WHERE NAME='events_statements_history_long'")
        c.run("TRUNCATE performance_schema.events_statements_history_long")
        for _ in range(20):
            c.run(QUERY, log=False)
        rows = c.rows("SELECT TIMER_WAIT FROM performance_schema.events_statements_history_long "
                      "WHERE SQL_TEXT = \"" + QUERY + "\" ORDER BY EVENT_ID")
        echo = subprocess.run([tool("mysql"), "-uroot", "-h127.0.0.1", f"-P{PORT}", "-vvv", "--table", "myisam_demo",
                               "-e", QUERY], capture_output=True, text=True).stdout
        TRANSCRIPT.extend(["[mysql -vvv]", echo.strip(), ""])
        c.close()
    finally:
        server.stop(); stop_all()
    us = [int(r["TIMER_WAIT"]) / 1e6 for r in rows]          # 皮秒 → 微秒
    assert len(us) == 20
    finish("10_timing", {"summary": {"runs": len(us), "first_us": round(us[0], 1), "median_us": round(statistics.median(us), 1),
                                     "min_us": round(min(us), 1), "max_us": round(max(us), 1),
                                     "client_echo": [l for l in echo.splitlines() if "row" in l and "sec" in l]},
                         "timer_wait_us": [round(x, 1) for x in us], "query": QUERY,
                         "limits": ["Server-side statement time on one Windows machine; the table is already open and cached."]})


if __name__ == "__main__":
    main()
