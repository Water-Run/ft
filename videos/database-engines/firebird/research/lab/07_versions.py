"""一次 UPDATE 之后，数据页上同一个物理行留下几份副本？

做法：先把 users 表清空重建（得到干净的页），做一次 UPDATE（30 -> 31），
然后反复读取 .fdb 文件，数出数据页上 'alice' 出现了几次，并记下文件里
那一行 age 字节的变化。强制写（Forced Writes）下，事务先写日志，
数据页稍后才落到 .fdb，所以顺带量一下这段间隔。

用法：python 07_versions.py <远端连接串> <本地库文件> <输出目录>
"""

import json
import os
import shutil
import sys
import time

import fdb

USER = "SYSDBA"
# 实验口令由 run_lab.ps1 现场生成，放在环境变量 FTLAB_PASSWORD 里；入库的脚本不写真值
PASSWORD = os.environ.get("FTLAB_PASSWORD", "")
PAGE_SIZE = 8192
NEEDLE = b"alice"


def scan(path):
    """返回 {页号: 该页上 'alice' 的出现次数} 以及每个命中点附近的 age 字节。"""
    with open(path, "rb") as fh:
        blob = fh.read()
    pages = len(blob) // PAGE_SIZE
    hits = []
    start = 0
    while True:
        idx = blob.find(NEEDLE, start)
        if idx < 0:
            break
        pageno = idx // PAGE_SIZE
        ptype = blob[pageno * PAGE_SIZE]
        # name 是 CHAR(10)，'alice' 之后还有 5 字节填充，再后面是 age 的 2 字节
        tail = blob[idx + 10: idx + 12]
        age = int.from_bytes(tail, "little") if len(tail) == 2 else None
        hits.append({"page": pageno, "page_type": ptype, "offset": idx, "age": age})
        start = idx + 1
    return {
        "file_bytes": len(blob),
        "pages": pages,
        "hits": hits,
        "data_page_hits": [h for h in hits if h["page_type"] == 5],
    }


def main():
    remote, local_file, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(out_dir, exist_ok=True)

    con = fdb.connect(remote, user=USER, password=PASSWORD, charset="utf8")
    cur = con.cursor()

    # 1) 干净起点：删掉 users 里的数据再按系列标准重插一次
    con.begin()
    cur.execute("DELETE FROM users")
    cur.execute("DELETE FROM notes")
    for i, (n, a) in enumerate(
        [("alice", 30), ("bob", 25), ("carol", 41), ("dave", 19),
         ("erin", 33), ("frank", 52), ("grace", 28), ("heidi", 36)], start=1):
        cur.execute("INSERT INTO users VALUES (?,?,?)", (i, n, a))
    cur.execute("INSERT INTO notes VALUES (1,'hello')")
    cur.execute("INSERT INTO notes VALUES (2,'Firebird keeps row versions in the data page')")
    cur.execute("INSERT INTO notes VALUES (3,'short')")
    con.commit()
    time.sleep(1.0)

    # 2) 改动前的快照
    before_path = os.path.join(out_dir, "v_before.fdb")
    shutil.copyfile(local_file, before_path)
    before = scan(before_path)

    # 3) 只做一次 UPDATE 并提交
    con.begin()
    cur.execute("UPDATE users SET age = 31 WHERE id = 1")
    con.commit()
    t0 = time.time()

    # 4) 轮询 .fdb，等新副本落盘
    after_path = os.path.join(out_dir, "v_after.fdb")
    flush_seconds = None
    deadline = time.time() + 90
    after = None
    while time.time() < deadline:
        shutil.copyfile(local_file, after_path)
        after = scan(after_path)
        data_hits = after["data_page_hits"]
        if any(h["age"] == 31 for h in data_hits):
            flush_seconds = round(time.time() - t0, 2)
            break
        time.sleep(0.5)

    result = {
        "before": {
            "file_bytes": before["file_bytes"],
            "pages": before["pages"],
            "data_page_hits": before["data_page_hits"],
            "data_page_hit_count": len(before["data_page_hits"]),
        },
        "after": {
            "file_bytes": after["file_bytes"],
            "pages": after["pages"],
            "data_page_hits": after["data_page_hits"],
            "data_page_hit_count": len(after["data_page_hits"]),
        },
        "wal_sidecar_exists": os.path.exists(local_file + ".wal"),
        "seconds_until_new_version_in_fdb": flush_seconds,
    }
    con.close()

    with open(os.path.join(out_dir, "out_07_versions.json"), "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)

    print("before: %d bytes, %d pages, data-page 'alice' hits = %d"
          % (before["file_bytes"], before["pages"], len(before["data_page_hits"])))
    for h in before["data_page_hits"]:
        print("   page %d off %d age=%s" % (h["page"], h["offset"], h["age"]))
    print("after : %d bytes, %d pages, data-page 'alice' hits = %d"
          % (after["file_bytes"], after["pages"], len(after["data_page_hits"])))
    for h in after["data_page_hits"]:
        print("   page %d off %d age=%s" % (h["page"], h["offset"], h["age"]))
    print("wal sidecar exists :", result["wal_sidecar_exists"])
    print("seconds until new version in .fdb :", flush_seconds)
    print("wrote out_07_versions.json")


if __name__ == "__main__":
    main()
