"""两个并发会话实测 Firebird 的行版本（MVCC）。

会话 A 开启事务并更新一行但不提交；会话 B 用自己的连接读同一行。
Firebird 5 默认是 READ COMMITTED + 语句级读一致性，所以
  - A 未提交时，B 读到的是已提交���旧值 30，读不阻塞；
  - A 提交后，B 再读才看到 31。
读完把整个数据页的字节取下来，后面 05_pages.py 用来证明旧版本仍在页上。

用法：python 04_mvcc.py <远端连接串> <本地库文件路径> <输出目录>
"""

import json
import os
import shutil
import sys
import time

import fdb

USER, PASSWORD = "SYSDBA", "ftlab2026fb"


def read_one(cur, ident=1):
    cur.execute("SELECT id, name, age FROM users WHERE id = ?", (ident,))
    row = cur.fetchone()
    return None if row is None else (row[0], row[1].strip(), row[2])


def main():
    remote, local_file, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(out_dir, exist_ok=True)

    log = []
    result = {}

    def record(tag, value):
        log.append("### " + tag + "\n" + (value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)))
        log.append("")
        print("### " + tag)
        print(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False))

    con_a = fdb.connect(remote, user=USER, password=PASSWORD, charset="utf8")
    con_b = fdb.connect(remote, user=USER, password=PASSWORD, charset="utf8")
    cur_a, cur_b = con_a.cursor(), con_b.cursor()

    try:
        # 复位基准值并提交，保证每次运行起点一致
        con_a.begin()
        cur_a.execute("UPDATE users SET age = 30 WHERE id = 1")
        con_a.commit()
        time.sleep(0.4)

        record("B 读取（更新前）", read_one(cur_b))

        # A 开启事务，更新但不提交
        con_a.begin()
        cur_a.execute("UPDATE users SET age = 31 WHERE id = 1")
        record("A 更新后未提交，自己读到", read_one(cur_a))

        # B 另起语句读同一行
        record("B 读取（A 未提交）", read_one(cur_b))

        # B 再读一次，确认不是偶然
        record("B 再读一次（A 仍未提交）", read_one(cur_b))

        con_a.commit()
        time.sleep(0.4)

        record("B 读取（A 已提交）", read_one(cur_b))

        # 事务清单与事务号
        cur_b.execute(
            "SELECT MON$OLDEST_TRANSACTION, MON$OLDEST_ACTIVE, "
            "MON$OLDEST_SNAPSHOT, MON$NEXT_TRANSACTION FROM MON$DATABASE"
        )
        record("事务状态", cur_b.fetchone())

        cur_b.execute("SELECT MON$TRANSACTION_ID, MON$STATE FROM MON$TRANSACTIONS")
        record("事务清单 (id, state)", cur_b.fetchall())

        cur_b.execute(
            "SELECT rdb$get_context('SYSTEM','ENGINE_VERSION') FROM rdb$database"
        )
        record("引擎版本", cur_b.fetchone())

        cur_b.execute(
            "SELECT MON$ODS_MAJOR, MON$ODS_MINOR, MON$PAGES, MON$FORCED_WRITES, "
            "MON$SWEEP_INTERVAL, MON$PAGE_BUFFERS FROM MON$DATABASE"
        )
        record("ODS / 页数 / 强制写 / 清扫间隔 / 缓冲页", cur_b.fetchone())

        result = {
            "remote_dsn": remote,
            "before": read_one(cur_b),
        }
    finally:
        con_b.close()
        con_a.close()

    # 抓一份数据页快照，后面做字节级解析
    snap = os.path.join(out_dir, "after_update.fdb")
    shutil.copyfile(local_file, snap)
    result["snapshot"] = snap
    result["snapshot_bytes"] = os.path.getsize(snap)

    with open(os.path.join(out_dir, "out_04_mvcc.json"), "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "out_04_mvcc.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(log))
    print("\nsnapshot -> " + snap)


if __name__ == "__main__":
    main()
