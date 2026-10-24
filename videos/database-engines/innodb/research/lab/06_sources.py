"""06 出处：MySQL 9.7 参考手册（官方页面快照）的原文摘句，与 mysql-9.7.4 源码里的行格式常量。

2026-10-24 本机抓取 dev.mysql.com 与 downloads.mysql.com 一律返回 403（直连与代理都是），所以手册用旧版取证时
2026-10-09 存下的官方页面快照（research/_src/manual/D01–D19，URL 与 SHA-256 记在 research/r8/sources.json）：
先核对快照的 SHA-256 与当时记录一致，再按 MANUAL 里的精确子串在合并空白后的文本里定位摘句，某句找不到就报错。
同日晚些时候直连恢复，第 2 稿新用到的两页（InnoDB 简介、ACID）与片尾引出下一集用的 PostgreSQL 18 文档一页，
直接抓取存进 research/_src/manual_974/，记下 SHA-256。
源码从 GitHub 标签 mysql-9.7.4 取。
"""
import hashlib, html, json, re, time, urllib.request
from lab_common import SOURCE, VIDEO, finish

SNAP = SOURCE / "manual"
MANUAL = [
    ("clustered index stores row data", "D01", "Each InnoDB table has a special index called the clustered index that stores row data."),
    ("secondary record contains primary key", "D01", "each record in a secondary index contains the primary key columns for the row, as well as the columns specified for the secondary index."),
    ("indexes are B-trees", "D02", "With the exception of spatial indexes, InnoDB indexes are B-tree data structures."),
    ("page size 16KB", "D02", "The default size of an index page is 16KB."),
    ("sequential insert fills 15/16", "D02", "If index records are inserted in a sequential order (ascending or descending), the resulting index pages are about 15/16 full."),
    ("DB_TRX_ID 6 bytes", "D03", "A 6-byte DB_TRX_ID field indicates the transaction identifier for the last transaction that inserted or updated the row."),
    ("DB_ROLL_PTR 7 bytes", "D03", "A 7-byte DB_ROLL_PTR field called the roll pointer."),
    ("delete is not immediate", "D03", "a row is not physically removed from the database immediately when you delete it with an SQL statement."),
    ("removed when undo discarded", "D03", "InnoDB only physically removes the corresponding row and its index records when it discards the update undo log record written for the deletion."),
    ("this removal is purge", "D03", "This removal operation is called a purge"),
    ("consistent read = snapshot", "D04", "A consistent read means that InnoDB uses multi-versioning to present to a query a snapshot of the database at a point in time."),
    ("record lock", "D05", "A record lock is a lock on an index record."),
    ("gap lock", "D05", "A gap lock is a lock on a gap between index records"),
    ("next-key lock", "D05", "A next-key lock is a combination of a record lock on the index record and a gap lock on the gap before the index record."),
    ("next-key prevents phantoms", "D05", "InnoDB uses next-key locks for searches and index scans, which prevents phantom rows"),
    ("redo log purpose", "D06", "The redo log is a disk-based data structure used during crash recovery to correct data written by incomplete transactions."),
    ("recovery starts at checkpoint", "D06", "recovery starts at the latest checkpoint LSN."),
    ("crash rolls back uncommitted", "D07", "InnoDB automatically rolls back uncommitted transactions that were present at the time of the crash."),
    ("undo log", "D08", "An undo log is a collection of undo log records associated with a single read-write transaction."),
    ("buffer pool midpoint", "D09", "3/8 of the buffer pool is devoted to the old sublist."),
    ("doublewrite", "D10", "The doublewrite buffer is a storage area where InnoDB writes pages flushed from the buffer pool before writing the pages to their proper positions in the InnoDB data files."),
    ("explicit transaction", "D12", "can perform a multiple-statement transaction by starting it with an explicit START TRANSACTION or BEGIN statement and ending it with a COMMIT or ROLLBACK statement."),
    ("deadlock detection", "D13", "When deadlock detection is enabled (the default) and a deadlock does occur, InnoDB detects the condition and rolls back one of the transactions (the victim)."),
    ("default isolation", "D18", "The default isolation level for InnoDB is REPEATABLE READ"),
    ("RR snapshot by first read", "D18", "Consistent reads within the same transaction read the snapshot established by the first read."),
    # 第 2 稿补
    ("hidden clustered index", "D01", "If a table has no PRIMARY KEY or suitable UNIQUE index, InnoDB generates a hidden clustered index named GEN_CLUST_INDEX on a synthetic column that contains row ID values."),
    ("DB_ROW_ID", "D03", "A 6-byte DB_ROW_ID field contains a row ID that increases monotonically as new rows are inserted."),
    ("commit makes permanent", "D12", "A COMMIT means that the changes made in the current transaction are made permanent and become visible to other sessions."),
    ("rollback cancels all", "D12", "A ROLLBACK statement, on the other hand, cancels all modifications made by the current transaction."),
    ("autocommit default", "D12", "By default, MySQL starts the session for each new connection with autocommit enabled, so MySQL does a commit after each SQL statement if that statement did not return an error."),
    ("autocommit statement is a transaction", "D12", "If autocommit mode is enabled, each SQL statement forms a single transaction on its own."),
    ("isolation is the I", "D18", "Isolation is the I in the acronym ACID"),
    ("four isolation levels", "D18", "InnoDB offers all four transaction isolation levels described by the SQL:1992 standard: READ UNCOMMITTED , READ COMMITTED , REPEATABLE READ , and SERIALIZABLE ."),
    ("read view = committed before", "D18", "a non-locking SELECT statement presents the state of the database from a read view which consists of transactions committed before the read view was created"),
    ("buffer pool caches pages", "D09", "The buffer pool is an area in main memory where InnoDB caches table and index data as it is accessed."),
    ("buffer pool divided into pages", "D09", "the buffer pool is divided into pages that can potentially hold multiple rows."),
    ("LRU ages out", "D09", "data that is rarely used is aged out of the cache using a variation of the least recently used (LRU) algorithm."),
    ("record header links records", "D17", "The header is used to link together consecutive records, and for row-level locking."),
    ("LSN ever-increasing", "D06", "The passage of data through redo log files is represented by an ever-increasing LSN value."),
    ("dirty pages flushed", "D06", "dirty pages are flushed from the buffer pool to tablespace data files"),
    ("doublewrite good copy", "D10", "InnoDB can find a good copy of the page from the doublewrite buffer during crash recovery."),
    ("deadlock victim", "D13", "rolls back one of the transactions (the victim)"),
]
# 2026-10-24 晚些时候本机直连 dev.mysql.com 恢复（返回 200），补抓两页，存进 research/_src/manual_974/，记 SHA-256
LIVE = "https://dev.mysql.com/doc/refman/9.7/en/"
LIVE_QUOTES = [
    ("InnoDB default in 9.7", "innodb-introduction", "In MySQL 9.7, InnoDB is the default MySQL storage engine."),
    ("ACID with commit rollback crash recovery", "innodb-introduction", "Its DML operations follow the ACID model, with transactions featuring commit, rollback, and crash-recovery capabilities to protect user data."),
    ("row locking and consistent reads", "innodb-introduction", "Row-level locking and Oracle-style consistent reads increase multi-user concurrency and performance."),
    ("ACID is about reliability", "mysql-acid", "The ACID model is a set of database design principles that emphasize aspects of reliability that are important for business data and mission-critical applications."),
    ("not corrupted by crashes", "mysql-acid", "so that data is not corrupted and results are not distorted by exceptional conditions such as software crashes and hardware malfunctions."),
    ("atomicity involves transactions", "mysql-acid", "The atomicity aspect of the ACID model mainly involves InnoDB transactions"),
    ("consistency protects from crashes", "mysql-acid", "The consistency aspect of the ACID model mainly involves internal InnoDB processing to protect data from crashes."),
    # 片尾引出下一集用：PostgreSQL 把旧版本留在表里
    ("PostgreSQL keeps old row versions", "pg-routine-vacuuming", "an UPDATE or DELETE of a row does not immediately remove the old version of the row."),
]
PAGES = {"pg-routine-vacuuming": "https://www.postgresql.org/docs/18/routine-vacuuming.html"}
SRC = "https://raw.githubusercontent.com/mysql/mysql-server/mysql-9.7.4/"
SRC_POINTS = [
    ("trx id field length 6", "storage/innobase/include/data0type.h", "constexpr size_t DATA_TRX_ID_LEN = 6;"),
    ("roll ptr field length 7", "storage/innobase/include/data0type.h", "constexpr size_t DATA_ROLL_PTR_LEN = 7;"),
]


def main():
    r8 = json.loads((VIDEO / "research/r8/sources.json").read_text(encoding="utf-8"))
    items = r8 if isinstance(r8, list) else r8.get("sources", r8)
    meta = {it["id"]: it for it in items if isinstance(it, dict) and "id" in it}
    out = {"manual_snapshots": {}, "quotes": [], "source": {}, "points": [], "note": __doc__.strip().splitlines()[2:4]}
    texts = {}
    for d in sorted({m[1] for m in MANUAL}):
        raw = (SNAP / f"{d}.html").read_bytes()
        sha = hashlib.sha256(raw).hexdigest()
        rec = meta.get(d, {})
        recorded = rec.get("sha256") or rec.get("html_sha256")
        out["manual_snapshots"][d] = {"url": rec.get("url"), "title": rec.get("title"), "sha256": sha, "matches_r8_record": (recorded == sha) if recorded else None}
        texts[d] = re.sub(r"\s+", " ", (SNAP / f"{d}.txt").read_text(encoding="utf-8", errors="replace"))
    for what, d, needle in MANUAL:
        n = re.sub(r"\s+", " ", needle)
        hit = texts[d].find(n)
        if hit < 0:
            hit = texts[d].replace(" ,", ",").find(n)
        assert hit >= 0, (what, d, needle)
        out["quotes"].append({"what": what, "doc": d, "url": out["manual_snapshots"][d]["url"], "quote": needle})
    out["live_pages"], ldir = {}, SOURCE / "manual_974"
    ldir.mkdir(parents=True, exist_ok=True)
    for name in sorted({q[1] for q in LIVE_QUOTES}):
        p = ldir / f"{name}.html"
        if not p.exists():
            p.write_bytes(urllib.request.urlopen(PAGES.get(name, LIVE + name + ".html"), timeout=60).read())
        raw = p.read_bytes()
        body = re.sub(r"<[^>]+>", " ", raw.decode("utf-8", errors="replace"))
        texts[name] = re.sub(r"\s+", " ", html.unescape(body))
        out["live_pages"][name] = {"url": PAGES.get(name, LIVE + name + ".html"), "fetched": time.strftime("%Y-%m-%d", time.localtime(p.stat().st_mtime)),
                                   "sha256": hashlib.sha256(raw).hexdigest()}
    for what, name, needle in LIVE_QUOTES:
        assert texts[name].find(needle) >= 0, (what, name, needle)
        out["quotes"].append({"what": what, "doc": name, "url": PAGES.get(name, LIVE + name + ".html"), "quote": needle})
    sdir = SOURCE / "src_974"; sdir.mkdir(parents=True, exist_ok=True)
    for what, rel, needle in SRC_POINTS:
        p = sdir / rel.replace("/", "__")
        if not p.exists():
            p.write_bytes(urllib.request.urlopen(SRC + rel, timeout=60).read())
        lines = p.read_text(encoding="utf-8", errors="replace").splitlines()
        hits = [i + 1 for i, l in enumerate(lines) if needle in l]
        assert len(hits) == 1, (rel, needle, hits)
        out["source"][rel] = {"url": SRC + rel, "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
        out["points"].append({"what": what, "file": rel, "line": hits[0], "text": lines[hits[0] - 1].strip()})
    out["summary"] = {"quotes": len(out["quotes"]), "snapshots": {d: v["matches_r8_record"] for d, v in out["manual_snapshots"].items()},
                      "points": [f"{p['file']}:{p['line']}" for p in out["points"]]}
    finish("06", out)


if __name__ == "__main__":
    main()
