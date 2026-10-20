"""解析 Firebird 5.0.4 的 .fdb 文件：页结构与行版本的字节证据。

依据 Firebird 5.0.4 源码（src/jrd/ods.h）：
  struct pag { UCHAR pag_type; UCHAR pag_flags; USHORT pag_reserved;
               ULONG pag_generation; ULONG pag_scn; ULONG pag_pageno; };  // 16 字节
  pag_type: 1=header 2=inventory 3=transactions(TIP) 4=pointer 5=data
            6=index root 7=index 8=blob 9=gen-ids 10=SCN inventory

用法：python 05_pages.py <fdb 路径> <页大小> <要查找的行内容>
输出：out_05_pages.json
"""

import json
import sys
from collections import Counter

PAGE_TYPES = {
    1: "header",
    2: "page inventory",
    3: "transactions (TIP)",
    4: "pointer",
    5: "data",
    6: "index root",
    7: "index (B-tree)",
    8: "blob data",
    9: "gen-ids",
    10: "SCN inventory",
}


def parse(path, page_size, needle):
    with open(path, "rb") as fh:
        blob = fh.read()

    total = len(blob)
    pages = total // page_size
    types = Counter()
    page_type_list = []

    for pageno in range(pages):
        off = pageno * page_size
        ptype = blob[off]
        types[ptype] += 1
        page_type_list.append(ptype)

    # 找出目标行内容在文件里的每一处出现：数据页上同一行的多个版本
    hits = []
    start = 0
    while True:
        idx = blob.find(needle, start)
        if idx < 0:
            break
        pageno, within = divmod(idx, page_size)
        hits.append(
            {
                "file_offset": idx,
                "page_no": pageno,
                "offset_in_page": within,
                "page_type": page_type_list[pageno],
                "page_type_name": PAGE_TYPES.get(page_type_list[pageno], "?"),
                "context_hex": blob[max(0, idx - 16): idx + len(needle) + 16].hex(),
            }
        )
        start = idx + 1

    data_pages = [i for i, t in enumerate(page_type_list) if t == 5]

    return {
        "file": path,
        "file_bytes": total,
        "page_size": page_size,
        "page_count_from_file": pages,
        "page_type_counts": {
            PAGE_TYPES.get(k, str(k)): v for k, v in sorted(types.items())
        },
        "page_type_numbers": {str(k): v for k, v in sorted(types.items())},
        "data_page_numbers": data_pages,
        "needle": needle.decode("ascii", "replace"),
        "needle_hits": hits,
    }


def main():
    path = sys.argv[1]
    page_size = int(sys.argv[2])
    needle = sys.argv[3].encode("ascii")
    out = sys.argv[4] if len(sys.argv) > 4 else "out_05_pages.json"

    result = parse(path, page_size, needle)
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)

    print("file bytes      :", result["file_bytes"])
    print("page size       :", page_size)
    print("pages in file   :", result["page_count_from_file"])
    print("page types      :", result["page_type_counts"])
    print("data pages      :", result["data_page_numbers"])
    print("needle %r hits : %d" % (result["needle"], len(result["needle_hits"])))
    for h in result["needle_hits"]:
        print(
            "  page %-4d off %-6d type %-16s ctx %s"
            % (
                h["page_no"],
                h["file_offset"],
                h["page_type_name"],
                h["context_hex"],
            )
        )
    print("wrote " + out)


if __name__ == "__main__":
    main()
