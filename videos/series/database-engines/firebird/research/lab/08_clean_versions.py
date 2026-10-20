"""干净的「一次 UPDATE = 页上多一份副本」实验。

前一个脚本 07_versions.py 是在同一��库里反复改 age，页上因此积了十几份历史
版本。本脚本另建一个全新的库文件：建表、插 8 行、拍一次快照，
只做一次 UPDATE（30 -> 31）并提交，再拍一次快照，
数出数据页上 'alice' 出现了几次。

用法：python 08_clean_versions.py <远端连接串前缀> <本地库文件> <输出目录>
"""

import json
import os
import shutil
import sys
import time

import fdb

USER, PASSWORD = "SYSDBA", "ftlab2026fb"
PAGE_SIZE = 8192
NEEDLE = b"alice"


def scan(path):
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
        if ptype == 5:
            hits.append({"page": pageno, "offset": idx})
        start = idx + 1
    return {"file_bytes": len(blob), "pages": pages, "data_page_hits": hits}


def main():
    remote, local_file, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(out_dir, exist_ok=True)

    con = fdb.connect(remote, user=USER, password=PASSWORD, charset="utf8")
    cur = con.cursor()

    # 库与表由 08a_create.sql 用 isql 建好（这里只做快照与那一次 UPDATE）
    cur.execute("SELECT COUNT(*) FROM users")
    row_count = cur.fetchone()[0]
    if row_count != 8:
        raise SystemExit("users 行数不是 8：%r" % (row_count,))

    before_path = os.path.join(out_dir, "clean_before.fdb")
    shutil.copyfile(local_file, before_path)
    before = scan(before_path)

    # 只做一次 UPDATE
    con.begin()
    cur.execute("UPDATE users SET age = 31 WHERE id = 1")
    con.commit()
    t0 = time.time()

    after_path = os.path.join(out_dir, "clean_after.fdb")
    flush_seconds = None
    deadline = time.time() + 120
    after = None
    while time.time() < deadline:
        shutil.copyfile(local_file, after_path)
        after = scan(after_path)
        if len(after["data_page_hits"]) > len(before["data_page_hits"]):
            flush_seconds = round(time.time() - t0, 2)
            break
        time.sleep(0.5)

    # 两次快照的差：多出来的那份副本在文件的哪个位置
    before_offsets = {h["offset"] for h in before["data_page_hits"]}
    new_hits = [h for h in after["data_page_hits"] if h["offset"] not in before_offsets]

    # 把新副本前后的原始字节抓出来，给画面用
    detail = []
    if new_hits:
        with open(after_path, "rb") as fh:
            blob = fh.read()
        for h in new_hits:
            off = h["offset"]
            detail.append(
                {
                    "offset": off,
                    "page": h["page"],
                    "page_type": 5,
                    "hex_before": blob[off - 24: off].hex(),
                    "hex_row": blob[off: off + 40].hex(),
                    "ascii": blob[off: off + 40].decode("latin-1").replace("\x00", "."),
                }
            )

    result = {
        "before_hits": len(before["data_page_hits"]),
        "after_hits": len(after["data_page_hits"]),
        "before_offsets": sorted(before_offsets),
        "new_hits": new_hits,
        "new_hit_detail": detail,
        "before_bytes": before["file_bytes"],
        "after_bytes": after["file_bytes"],
        "pages": after["pages"],
        "seconds_until_new_copy_in_fdb": flush_seconds,
        "wal_sidecar_exists": os.path.exists(local_file + ".wal"),
    }
    con.close()

    with open(os.path.join(out_dir, "out_08_clean_versions.json"), "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)

    print("data-page 'alice' copies: before=%d after=%d" % (len(before["data_page_hits"]), len(after["data_page_hits"])))
    print("new copy offsets:", [h["offset"] for h in new_hits])
    for d in detail:
        print("  page %d off %d" % (d["page"], d["offset"]))
        print("    hex : " + d["hex_before"] + " | " + d["hex_row"])
        print("    ascii: " + d["ascii"])
    print("seconds until new copy in .fdb :", flush_seconds)
    print("wrote out_08_clean_versions.json")


if __name__ == "__main__":
    main()
