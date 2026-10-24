"""Pinned MySQL 9.7.4 LTS: archive checksums, server identity, storage engines, MyISAM settings, source files."""
import hashlib
import urllib.request
from lab_common import BASE, SOURCE, VERSION, Cli, Server, digest, ensure_binary, finish, new_run, stop_all

SRC = SOURCE / "mysql-9.7.4-src"        # 取自 github.com/mysql/mysql-server 标签 mysql-9.7.4 的 raw 文件
SOURCE_FILES = ["storage/myisam/mi_search.cc", "storage/myisam/mi_open.cc", "storage/myisam/mi_key.cc",
                "storage/myisam/mi_write.cc", "storage/myisam/mi_delete.cc", "storage/myisam/mi_update.cc",
                "storage/myisam/mi_statrec.cc", "storage/myisam/mi_locking.cc", "storage/myisam/mi_check.cc",
                "storage/myisam/mi_rkey.cc", "storage/myisam/ha_myisam.cc", "storage/myisam/myisamdef.h",
                "include/myisam.h", "include/my_base.h", "include/my_compare.h", "mysys/mf_keycache.cc",
                "mysys/thr_lock.cc"]


def main():
    ensure_binary()
    archive = SOURCE / "mysql-9.7.4-winx64.zip"
    server = Server(new_run("01"), "server").start()
    try:
        c = Cli("client")
        version = c.rows("SELECT VERSION() AS v")[0]["v"]
        assert version == VERSION, version
        engines = c.rows("SELECT ENGINE, SUPPORT, TRANSACTIONS FROM information_schema.ENGINES ORDER BY ENGINE")
        settings = c.rows("SHOW VARIABLES WHERE Variable_name IN ('default_storage_engine','key_buffer_size',"
                          "'key_cache_block_size','concurrent_insert','myisam_recover_options','myisam_data_pointer_size',"
                          "'lock_wait_timeout')")
        c.close()
    finally:
        server.stop()
        stop_all()
    sources = []
    for rel in SOURCE_FILES:
        path = SRC / rel
        if not path.is_file():
            path.parent.mkdir(parents=True, exist_ok=True)
            urllib.request.urlretrieve(f"https://raw.githubusercontent.com/mysql/mysql-server/mysql-9.7.4/{rel}", path)
        sources.append({"file": rel, "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                        "lines": path.read_bytes().count(b"\n")})
    myisam = next(e for e in engines if e["ENGINE"] == "MyISAM")
    innodb = next(e for e in engines if e["ENGINE"] == "InnoDB")
    finish("01_environment", {
        "summary": {"version": version, "myisam": myisam, "innodb": innodb,
                    "default_storage_engine": next(s["Value"] for s in settings if s["Variable_name"] == "default_storage_engine")},
        "archive": {"url": "https://cdn.mysql.com/Downloads/MySQL-9.7/mysql-9.7.4-winx64.zip",
                    "md5": digest(archive, "md5"), "sha256": digest(archive, "sha256"),
                    "bytes": archive.stat().st_size, "official_md5_source": "https://dev.mysql.com/downloads/mysql/ (2026-10-24)"},
        "mysqld_sha256": digest(BASE / "bin/mysqld.exe", "sha256"),
        "engines": engines, "settings": settings,
        "source": {"repository": "https://github.com/mysql/mysql-server", "tag": "mysql-9.7.4", "files": sources},
        "limits": ["Windows 11 x64, official noinstall ZIP, fresh data directory, 127.0.0.1 only, root without password."]})


if __name__ == "__main__":
    main()
