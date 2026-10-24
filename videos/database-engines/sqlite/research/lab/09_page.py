"""Inside one page: the leaf page that holds Alice, the long note's overflow chain, the file header.

Pure byte decoding of the measured main database (no SQLite engine is called).
Spec: https://www.sqlite.org/fileformat.html sections 1.3, 1.6, 1.7, 2.1.
"""
from lab_common import current_base, finish
from page_map import record, varint

ALICE_PAGE, NOTE_PAGE = 130, 542


def page(blob, size, number):
    start = (number - 1) * size
    return blob[start:start + size], start


def leaf_page(blob, size, number):
    data, start = page(blob, size, number)
    flag = data[0]
    assert flag == 13, flag                       # 0x0d：表树叶页
    first_free, cells, content, frag = int.from_bytes(data[1:3], "big"), int.from_bytes(data[3:5], "big"), int.from_bytes(data[5:7], "big"), data[7]
    pointers = [int.from_bytes(data[8 + 2 * i:10 + 2 * i], "big") for i in range(cells)]
    out = []
    for slot, off in enumerate(pointers):
        payload_len, a = varint(data, off)
        rowid, b = varint(data, off + a)
        body = off + a + b
        local = min(payload_len, size - 35)       # 表叶页的本地上限 U-35（本库 U=1024）
        item = {"slot": slot, "offset": off, "rowid": rowid, "payload_bytes": payload_len, "cell_header_bytes": a + b}
        if payload_len <= size - 35:
            item["cell_bytes"] = a + b + payload_len
            item["cell_hex"] = data[off:off + a + b + payload_len].hex()
            item["record"] = record(data[body:body + payload_len])
        else:
            m = ((size - 12) * 32 // 255) - 23
            k = m + (payload_len - m) % (size - 4)
            local = k if k <= size - 35 else m
            item["local_payload_bytes"] = local
            item["first_overflow_page"] = int.from_bytes(data[body + local:body + local + 4], "big")
            item["cell_bytes"] = a + b + local + 4
        out.append(item)
    header_end = 8 + 2 * cells
    return {"page": number, "file_offset": start, "flag_hex": f"{flag:02x}", "header_bytes": 8, "cell_count": cells,
            "pointer_array": [header_end - 2 * cells, header_end], "cell_content_start": content,
            "unallocated_bytes": content - header_end, "first_freeblock": first_free, "fragmented_bytes": frag,
            "pointers": pointers, "cells": out}


def overflow_chain(blob, size, first):
    chain, p = [], first
    while p:
        data, _ = page(blob, size, p)
        nxt = int.from_bytes(data[:4], "big")
        chain.append({"page": p, "next": nxt})
        p = nxt
    return chain


def main():
    blob = current_base().read_bytes()
    size = int.from_bytes(blob[16:18], "big")
    header = {"magic": blob[:16].decode("ascii"), "page_size": size, "page_count": int.from_bytes(blob[28:32], "big"),
              "change_counter": int.from_bytes(blob[24:28], "big")}
    alice_page = leaf_page(blob, size, ALICE_PAGE)
    alice = next(c for c in alice_page["cells"] if c["rowid"] == 2050)
    note_page = leaf_page(blob, size, NOTE_PAGE)
    note = note_page["cells"][0]
    chain = overflow_chain(blob, size, note["first_overflow_page"])
    assert header["magic"] == "SQLite format 3\x00" and size == 1024 and header["page_count"] == 553
    assert alice["slot"] == 9 and alice["offset"] == 489 and alice["record"]["values"] == [None, "Alice", 42]
    assert alice["cell_hex"] == "0a9002" + "04001701416c6963652a"   # 长度 10、行号 2050，再接 F01 的 10 字节内容
    assert [c["page"] for c in chain] == list(range(543, 554)) and chain[-1]["next"] == 0
    # 指针按行号排好；单元从页尾往前放：最早插入的第一行在最末尾
    assert [c["rowid"] for c in alice_page["cells"]] == sorted(c["rowid"] for c in alice_page["cells"])
    finish("09_page", {
        "summary": {"file_magic": header["magic"].rstrip("\x00"), "alice_page": ALICE_PAGE, "alice_slot": alice["slot"],
                    "alice_offset": alice["offset"], "alice_cell_bytes": alice["cell_bytes"], "alice_payload_bytes": alice["payload_bytes"],
                    "page130_cells": alice_page["cell_count"], "page130_unallocated_bytes": alice_page["unallocated_bytes"],
                    "note_payload_bytes": note["payload_bytes"], "note_local_bytes": note["local_payload_bytes"],
                    "overflow_pages": [c["page"] for c in chain]},
        "file_header": {k: (v.rstrip("\x00") if isinstance(v, str) else v) for k, v in header.items()},
        "alice_page": alice_page, "note_page": {k: v for k, v in note_page.items() if k != "cells"} | {"cell": note},
        "overflow_chain": chain,
        "limits": ["Bytes decoded from the measured file with the format specification; layout facts are for this file only.",
                   "Local payload limits follow fileformat section 1.6 for a 1024-byte page without reserved bytes."]})


if __name__ == "__main__":
    main()
