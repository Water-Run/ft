"""08 史实（第 3 稿）：事务这个概念的来历、InnoDB 最早的代码、预写日志、PostgreSQL 的来历。

每一条都取原始文献或源码，存进 research/_src/history/（不入库），记 SHA-256，按精确子串在合并空白后的文本里定位摘句，找不到就报错：
- Jim Gray 1981《The Transaction Concept: Virtues and Limitations》Tandem TR 81.3：作者分发的 .doc 全文（R8 取证时存的 research/_src/web/gray81.doc）
- ACM 图灵奖页面 Jim Gray（2019 年存档，research/_src/web/acm_turing_gray_2019.html）
- Härder、Reuter 1983《Principles of Transaction-Oriented Database Recovery》ACM Computing Surveys 15(4)：德州大学课程阅读材料 PDF
- Mohan 等 1992《ARIES》ACM TODS 17(1)：MIT 课程页 PDF
- Bernstein、Goodman 1983《Multiversion Concurrency Control—Theory and Algorithms》：ACM DL 存档页（research/_src/web/acm_dl_bernstein_goodman_1983.html）
- InnoDB 源码（GitHub 标签 mysql-9.7.4）文件头的「Created … Heikki Tuuri」
- PostgreSQL 18 文档「A Brief History of PostgreSQL」
"""
import hashlib, html, json, re, urllib.request
from lab_common import SOURCE, finish

HIST = SOURCE / "history"
WEB = SOURCE / "web"
DOCS = {
    "gray81": {"local": WEB / "gray81.doc", "kind": "doc", "url": "Tandem TR 81.3（作者分发的 .doc，R8 存档）"},
    "turing_gray": {"local": WEB / "acm_turing_gray_2019.html", "kind": "html", "url": "https://amturing.acm.org/award_winners/gray_3649936.cfm（2019 年存档）"},
    "hr83": {"url": "https://www.cs.utexas.edu/~dsb/cs386d/Readings/Recovery/Principles-of-Recovery.pdf", "kind": "pdf"},
    "aries": {"url": "https://db.csail.mit.edu/madden/html/aries.pdf", "kind": "pdf"},
    "bg83": {"local": WEB / "acm_dl_bernstein_goodman_1983.html", "kind": "html", "url": "https://dl.acm.org/doi/10.1145/319996.319998（存档）"},
    "pg_history": {"url": "https://www.postgresql.org/docs/18/history.html", "kind": "html"},
}
QUOTES = [
    ("gray81", "title and date", "Tandem TR 81.3 The Transaction Concept: Virtues and Limitations Jim Gray Tandem Computers Incorporated"),
    ("gray81", "June 1981", "Cupertino CA 95014 June 1981"),
    ("gray81", "three properties", "A transaction is a transformation of state which has the properties of atomicity (all or nothing), durability (effects survive failures) and consistency (a correct transformation)."),
    ("turing_gray", "IBM San Jose 1972-1980", "Research Staff Member, Computer Science Department, IBM Research, San Jose, CA (1972–1980)"),
    ("turing_gray", "Tandem 1980-1990", "Software Designer, Tandem Computers, Cupertino, CA (1980–1990)"),
    ("turing_gray", "System R", "Gray soon joined this project, which became known as System R."),
    ("turing_gray", "transaction as unit of work", "He defined the transaction as a unit of work, such as moving money from one bank account to another, that must leave the bank’s database in a consistent state whether or not the transaction succeeds: either the money moves, or it stays in the original account."),
    ("turing_gray", "1998 citation", "1998 CITATION For seminal contributions to database and transaction processing research and technical leadership in system implementation."),
    ("hr83", "authors", "THEO HAERDER Fachbereich Informatik, University of Kaiserslautern, West Germany ANDREAS REUTER 1 IBM Research Laboratory, San Jose, California"),
    ("hr83", "journal", "Computing Surveys, Vol. 15, No. 4, December 1983"),
    ("hr83", "ACID", "These four properties, atomicity, consist- ency, isolation, and durability (ACID), de- scribe the major highlights of the transac- tion paradigm"),
    ("aries", "title", "ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking and Partial Rollbacks Using Write-Ahead Logging C. MOHAN IBM Almaden Research Center"),
    ("aries", "WAL", "recovery using write-ahead logging (WAL)"),
    ("aries", "repeating history", "We introduce the paradigm of repeating history to redo all missing updates before performing the rollbacks of the loser transactions during restart after a system failure."),
    ("aries", "journal", "ACM Transactions on Database Systems, Vol. 17, No. 1, March 1992"),
    ("bg83", "date", "ACM Transactions on Database Systems Volume 8 Issue 4 Dec. 1983"),
    ("bg83", "theory", "This paper presents a theory for analyzing the correctness of concurrency control algorithms for multiversion database systems."),
    ("pg_history", "1986", "The implementation of POSTGRES began in 1986."),
    ("pg_history", "Stonebraker", "The POSTGRES project, led by Professor Michael Stonebraker"),
    ("pg_history", "name 1996", "By 1996, it became clear that the name"),
    ("pg_history", "derived from POSTGRES at Berkeley", "is derived from the POSTGRES package written at the University of California at Berkeley"),
]
SRC = "https://raw.githubusercontent.com/mysql/mysql-server/mysql-9.7.4/storage/innobase/"
CREATED = ["page/page0page.cc", "btr/btr0btr.cc", "buf/buf0buf.cc", "trx/trx0trx.cc", "trx/trx0undo.cc", "lock/lock0lock.cc", "read/read0read.cc", "log/log0recv.cc", "row/row0sel.cc"]


def text_of(kind, raw):
    if kind == "pdf":
        import io, pypdf
        return " ".join((p.extract_text() or "") for p in pypdf.PdfReader(io.BytesIO(raw)).pages)
    if kind == "doc":
        return re.sub(rb"[^\x20-\x7e\r\n]+", b" ", raw).decode("ascii", "replace")
    return html.unescape(re.sub(r"<[^>]+>", " ", raw.decode("utf-8", errors="replace")))


def main():
    HIST.mkdir(parents=True, exist_ok=True)
    out, texts = {"documents": {}, "quotes": [], "innodb_created": []}, {}
    for key, d in DOCS.items():
        if "local" in d:
            raw = d["local"].read_bytes()
        else:
            p = HIST / (key + "." + d["kind"])
            if not p.exists():
                req = urllib.request.Request(d["url"], headers={"User-Agent": "Mozilla/5.0"})
                p.write_bytes(urllib.request.urlopen(req, timeout=90).read())
            raw = p.read_bytes()
        texts[key] = re.sub(r"\s+", " ", text_of(d["kind"], raw))
        out["documents"][key] = {"source": d["url"], "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    for key, what, needle in QUOTES:
        n = re.sub(r"\s+", " ", needle)
        assert texts[key].find(n) >= 0, (key, what, needle)
        out["quotes"].append({"doc": key, "what": what, "quote": needle})
    sdir = SOURCE / "src_974"; sdir.mkdir(parents=True, exist_ok=True)
    for rel in CREATED:
        p = sdir / ("storage__innobase__" + rel.replace("/", "__"))
        if not p.exists():
            p.write_bytes(urllib.request.urlopen(SRC + rel, timeout=60).read())
        lines = p.read_text(encoding="utf-8", errors="replace").splitlines()
        hit = [(i + 1, l.strip()) for i, l in enumerate(lines) if re.match(r"\s*Created \d+/\d+/\d{4} Heikki Tuuri", l)]
        assert len(hit) == 1, (rel, hit)
        out["innodb_created"].append({"file": "storage/innobase/" + rel, "line": hit[0][0], "text": hit[0][1],
                                      "year": int(re.search(r"/(\d{4}) ", hit[0][1]).group(1)), "sha256": hashlib.sha256(p.read_bytes()).hexdigest()})
    out["summary"] = {"quotes": len(out["quotes"]), "created": {c["file"].split("/")[-1]: c["year"] for c in out["innodb_created"]}}
    finish("08", out)


if __name__ == "__main__":
    main()
