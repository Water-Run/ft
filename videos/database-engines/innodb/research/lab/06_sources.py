"""06 出处：MySQL 9.7 参考手册（官方页面快照）的原文摘句，与 mysql-9.7.4 源码里的行格式常量。

2026-10-24 本机抓取 dev.mysql.com 与 downloads.mysql.com 一律返回 403（直连与代理都是），所以手册用旧版取证时
2026-10-09 存下的官方页面快照（research/_src/manual/D01–D19，URL 与 SHA-256 记在 research/r8/sources.json）：
先核对快照的 SHA-256 与当时记录一致，再按 MANUAL 里的精确子串在合并空白后的文本里定位摘句，某句找不到就报错。
源码从 GitHub 标签 mysql-9.7.4 取。
"""
import hashlib, json, re, time, urllib.request
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
]
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
