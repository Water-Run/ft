"""MySQL 9.7.4 LTS laboratory helpers for the MyISAM episode.

The official Windows ZIP is downloaded once into the ignored research/_src/ and
checked against the MD5 published on the download page. Every run initializes a
fresh data directory under the ignored out/lab/, listens on 127.0.0.1 only, and
uses root without a password. Public transcripts keep SQL and results, never host
paths, keys or the generated TLS files in the data directory.
"""
import hashlib
import json
import os
from pathlib import Path
import queue
import re
import shutil
import subprocess
import threading
import time
import urllib.request
import zipfile

VIDEO = Path(__file__).resolve().parents[2]
LAB = VIDEO / "research/lab"
SOURCE = VIDEO / "research/_src"
WORK = VIDEO / "out/lab"
VERSION = "9.7.4"
ZIP_URL = "https://cdn.mysql.com/Downloads/MySQL-9.7/mysql-9.7.4-winx64.zip"
ZIP_MD5 = "e05aaa40639d8548e0f68b7a70685a3b"        # dev.mysql.com/downloads/mysql/，2026-10-24
BASE = SOURCE / "mysql-9.7.4-winx64"
PORT = 33974
TRANSCRIPT = []
PROCESSES = []


def digest(path, name):
    h = hashlib.new(name)
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def ensure_binary():
    if (BASE / "bin/mysqld.exe").is_file():
        return BASE
    archive = SOURCE / "mysql-9.7.4-winx64.zip"
    SOURCE.mkdir(parents=True, exist_ok=True)
    if not archive.is_file():
        urllib.request.urlretrieve(ZIP_URL, archive)
    assert digest(archive, "md5") == ZIP_MD5, "MD5 mismatch; archive kept for inspection"
    with zipfile.ZipFile(archive) as z:
        z.extractall(SOURCE)
    return BASE


def tool(name):
    return str(ensure_binary() / "bin" / (name + ".exe"))


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


class Server:
    """One mysqld on a fresh data directory. stop() shuts down cleanly; kill() simulates a crash."""

    def __init__(self, run_dir, label="server"):
        self.dir = Path(run_dir)
        self.data = self.dir / "data"
        self.label = label
        self.proc = None
        if not self.data.exists():
            out = subprocess.run([tool("mysqld"), "--no-defaults", "--initialize-insecure", f"--basedir={BASE}",
                                  f"--datadir={self.data}", "--console"], capture_output=True, text=True)
            assert out.returncode == 0, out.stdout + out.stderr

    def start(self):
        busy = subprocess.run([tool("mysqladmin"), "-uroot", "-h127.0.0.1", f"-P{PORT}", "ping"], capture_output=True, text=True)
        if "alive" in busy.stdout:
            raise RuntimeError(f"port {PORT} already has a server; stop the stale lab mysqld first")
        log = open(self.dir / "server.log", "a", encoding="utf-8")
        self.proc = subprocess.Popen([tool("mysqld"), "--no-defaults", f"--basedir={BASE}", f"--datadir={self.data}",
                                      f"--port={PORT}", "--bind-address=127.0.0.1", "--mysqlx=OFF", "--console"],
                                     stdout=log, stderr=subprocess.STDOUT)
        PROCESSES.append(self.proc)
        for _ in range(120):
            ping = subprocess.run([tool("mysqladmin"), "-uroot", "-h127.0.0.1", f"-P{PORT}", "ping"], capture_output=True, text=True)
            if "alive" in ping.stdout:
                return self
            if self.proc.poll() is not None:
                raise RuntimeError("mysqld exited during start-up; see server.log in the run directory")
            time.sleep(0.5)
        raise RuntimeError("mysqld did not answer within 60 s")

    def stop(self):
        if self.proc and self.proc.poll() is None:
            subprocess.run([tool("mysqladmin"), "-uroot", "-h127.0.0.1", f"-P{PORT}", "shutdown"], capture_output=True)
            self.proc.wait(timeout=60)

    def kill(self):
        # Windows 上 mysqld 由一个监控进程拉起真正的服务进程，要连同子进程一起强行结束
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(self.proc.pid)], capture_output=True)
        self.proc.wait(timeout=30)
        for _ in range(60):
            ping = subprocess.run([tool("mysqladmin"), "-uroot", "-h127.0.0.1", f"-P{PORT}", "ping"], capture_output=True, text=True)
            if "alive" not in ping.stdout:
                break
            time.sleep(0.5)
        TRANSCRIPT.append(f"[{self.label}] mysqld forcibly terminated (no shutdown).\n")

    def file(self, db, name):
        return self.data / db / name


class Cli:
    """A persistent mysql client session. send() writes without waiting; wait() reads to the end marker."""

    def __init__(self, label, database=None):
        self.label = label
        self.counter = 0
        self.lines = queue.Queue()
        args = [tool("mysql"), "-uroot", "-h127.0.0.1", f"-P{PORT}", "--batch", "--unbuffered", "--force", "--table"]
        if database:
            args.append(database)
        self.p = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                  encoding="utf-8", bufsize=1)
        PROCESSES.append(self.p)
        threading.Thread(target=self._read, daemon=True).start()
        self.pending = None

    def _read(self):
        for line in self.p.stdout:
            self.lines.put(line.rstrip("\r\n"))
        self.lines.put(None)

    def send(self, sql):
        assert self.pending is None, "previous statement still pending"
        self.counter += 1
        marker = f"__END_{self.counter}__"
        self.p.stdin.write(sql.rstrip().rstrip(";") + ";\nSELECT '" + marker + "' AS m;\n")
        self.p.stdin.flush()
        self.pending = (sql, marker)

    def wait(self, timeout=60, log=True):
        sql, marker = self.pending
        out = []
        while True:
            line = self.lines.get(timeout=timeout)
            if line is None:
                raise RuntimeError("mysql client exited")
            if marker in line:
                self.lines.get(timeout=timeout)      # 结束标记表格的底边
                break
            out.append(line)
        # 去掉 --table 给结束标记画的边框行
        if len(out) >= 3 and re.fullmatch(r"\| m +\|", out[-2]):
            del out[-3:]
        self.pending = None
        text = "\n".join(out)
        if log:
            TRANSCRIPT.extend([f"[{self.label}] {sql.strip()}", text or "(no result rows)", ""])
        return text

    def run(self, sql, log=True, expect_error=False):
        self.send(sql)
        text = self.wait(log=log)
        failed = re.search(r"^ERROR \d+", text, re.M) is not None
        if failed != expect_error:
            raise RuntimeError(f"[{self.label}] {sql}\n{text}")
        return text

    def rows(self, sql):
        """Run a query and return rows as dicts (parses the --table output)."""
        text = self.run(sql)
        lines = [l for l in text.splitlines() if l.startswith("|")]
        if not lines:
            return []
        head = [c.strip() for c in lines[0].strip("|").split("|")]
        return [dict(zip(head, [c.strip() for c in l.strip("|").split("|")])) for l in lines[1:]]

    def close(self):
        if self.p.poll() is None:
            self.p.stdin.close()        # 批处理模式读到文件尾即退出
            try:
                self.p.wait(timeout=15)
            except subprocess.TimeoutExpired:
                self.p.kill()


def stop_all():
    for p in PROCESSES:
        if p.poll() is None:
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(p.pid)], capture_output=True)


import atexit
atexit.register(stop_all)          # 脚本出错退出时也不留下服务进程


# 全系列共用的数据：4096 个用户，2050 号是 Alice（42 岁）；其他人名为 50 字节，年龄 18 + id % 63。
# 与 SQLite 一集 research/lab/lab_common.py 的 insert_sql() 规则相同，换成 MySQL 写法。
SCHEMA = ("CREATE TABLE users(id INT NOT NULL PRIMARY KEY, name CHAR(50) CHARACTER SET ascii NOT NULL, "
          "age TINYINT UNSIGNED NOT NULL, KEY idx_name(name), KEY idx_age(age)) ENGINE=MyISAM")


def insert_sql(first, last):
    return ("INSERT INTO users WITH RECURSIVE n(i) AS (SELECT %d UNION ALL SELECT i+1 FROM n WHERE i<%d) "
            "SELECT i, IF(i=2050,'Alice',CONCAT('User',LPAD(i,5,'0'),'-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN')), "
            "IF(i=2050,42,18+i%%63) FROM n" % (first, last))


def build(cli, db="demo"):
    cli.run(f"CREATE DATABASE {db}")
    cli.run(f"USE {db}")
    cli.run("SET SESSION cte_max_recursion_depth=10000")
    cli.run(SCHEMA)
    cli.run(insert_sql(1, 4096))
    cli.run("FLUSH TABLES")
