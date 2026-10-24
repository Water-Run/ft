"""Minimal reader for the InnoDB B+ tree pages of the series' users table (MySQL 9.7.4, 16 KiB pages).

Only what this film needs: the users schema has no NULL-able and no variable-length columns
(id INT, name CHAR(50) ascii, age TINYINT UNSIGNED), so a COMPACT/DYNAMIC record is just
the 5-byte record header followed by the fixed-length fields. Not a general .ibd parser.

Page layout (storage/innobase/include/fil0types.h, page0types.h, rem0rec.h):
  FIL header 38 bytes: page_no @4, prev @8, next @12, LSN @16, type @24, space @34
  INDEX header @38:    n_dir_slots, heap_top, n_heap, free, garbage, last_insert, direction,
                       n_direction, n_recs, max_trx_id(8), level, index_id(8)
  infimum origin @99, supremum origin @112 (compact format)
  record header (5 bytes before the origin): info_bits|n_owned, heap_no<<3|status, next (signed, relative)
"""
import struct

PAGE = 16384
FIL_PAGE_INDEX = 17855
INFIMUM = 99


def u16(b, o): return struct.unpack_from(">H", b, o)[0]
def u32(b, o): return struct.unpack_from(">I", b, o)[0]
def u64(b, o): return struct.unpack_from(">Q", b, o)[0]
def s16(b, o): return struct.unpack_from(">h", b, o)[0]
def int_key(b): return u32(b, 0) ^ 0x80000000          # INT 以翻转符号位的大端序存放


def page(data, no):
    return data[no * PAGE:(no + 1) * PAGE]


def header(p):
    return {
        "page_no": u32(p, 4), "prev": u32(p, 8), "next": u32(p, 12), "lsn": u64(p, 16), "type": u16(p, 24),
        "n_dir_slots": u16(p, 38), "heap_top": u16(p, 40), "n_heap": u16(p, 42) & 0x7FFF,
        "garbage": u16(p, 46), "n_recs": u16(p, 54), "max_trx_id": u64(p, 56), "level": u16(p, 64), "index_id": u64(p, 66),
    }


def records(p):
    """User records in key order: (origin, info_bits, status) following the next-record chain."""
    out, o = [], INFIMUM
    while True:
        o = (o + s16(p, o - 2)) % PAGE
        status = u16(p, o - 4) & 7
        if status == 3:                      # supremum
            return out
        out.append((o, p[o - 5] >> 4, status))


# 每种索引在叶子与非叶子上的字段（字节数）
LAYOUT = {
    "PRIMARY":  {"leaf": [("id", 4), ("trx_id", 6), ("roll_ptr", 7), ("name", 50), ("age", 1)], "node": [("id", 4), ("child", 4)]},
    "idx_name": {"leaf": [("name", 50), ("id", 4)], "node": [("name", 50), ("id", 4), ("child", 4)]},
    "idx_age":  {"leaf": [("age", 1), ("id", 4)], "node": [("age", 1), ("id", 4), ("child", 4)]},
}


def decode(p, origin, index, leaf):
    rec, o = {}, origin
    for name, n in LAYOUT[index]["leaf" if leaf else "node"]:
        raw = p[o:o + n]
        if name == "id": rec[name] = int_key(raw)
        elif name in ("child",): rec[name] = u32(raw, 0)
        elif name == "trx_id": rec[name] = int.from_bytes(raw, "big")
        elif name == "roll_ptr": rec[name] = raw.hex()
        elif name == "name": rec[name] = raw.decode("ascii").rstrip(" ")
        elif name == "age": rec[name] = raw[0]
        o += n
    rec["_bytes"] = o - origin
    return rec


def walk(data, root, index):
    """Visit every page of one B+ tree from its root. Returns pages grouped by level (top first)."""
    levels, frontier = [], [root]
    while frontier:
        level_pages, nxt = [], []
        for no in frontier:
            p = page(data, no)
            h = header(p)
            assert h["type"] == FIL_PAGE_INDEX, (index, no, h["type"])
            leaf = h["level"] == 0
            recs = [decode(p, o, index, leaf) | {"deleted": bool(info & 2)} for o, info, st in records(p)]
            level_pages.append({"page": no, **{k: h[k] for k in ("level", "n_recs", "prev", "next", "heap_top", "garbage")},
                                "first": recs[0] if recs else None, "last": recs[-1] if recs else None,
                                "children": [r["child"] for r in recs] if not leaf else None, "_recs": recs})
            if not leaf:
                nxt.extend(r["child"] for r in recs)
        levels.append(level_pages)
        frontier = nxt
    return levels


def find_leaf_record(data, root, index, key_name, key_value):
    """Follow the tree from the root to the leaf record whose key equals key_value; returns path and raw bytes."""
    path, no = [], root
    while True:
        p = page(data, no)
        h = header(p)
        recs = [(o, info, decode(p, o, index, h["level"] == 0)) for o, info, st in records(p)]
        path.append({"page": no, "level": h["level"]})
        if h["level"] == 0:
            for o, info, r in recs:
                if r[key_name] == key_value:
                    return path, {"page": no, "offset": o, "header_hex": p[o - 5:o].hex(), "fields_hex": p[o:o + r["_bytes"]].hex(), "record": r}
            return path, None
        child = recs[0][2]["child"]
        for o, info, r in recs:                      # 节点指针：最后一个键不大于目标的那一项
            if r[key_name] <= key_value:
                child = r["child"]
        no = child
