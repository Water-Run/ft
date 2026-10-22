"""Map every slot of data page 231 and the page-type of every page in the experiment 08 snapshots.

Read-only, like 15_record_layout.py: no database is opened or changed. Inputs are
out/lab/clean_before.fdb and clean_after.fdb from 08_clean_versions.py (ignored files).
Used only to draw the page to scale; field meanings follow v5.0.4 ods.h (data_page, rhd).
"""
import hashlib
import json
from pathlib import Path
import struct

VIDEO = Path(__file__).resolve().parents[2]
PAGE_SIZE = 8192
LAB = VIDEO / "out" / "lab"


def page_map(blob, number):
    page = blob[number * PAGE_SIZE:(number + 1) * PAGE_SIZE]
    assert page[0] == 5, "not a data page"
    sequence, relation, count = struct.unpack_from("<IHH", page, 16)
    slots = []
    for line in range(count):
        offset, length = struct.unpack_from("<HH", page, 24 + 4 * line)
        item = {"line": line, "offset": offset, "length": length}
        if length >= 13:
            tx, b_page, b_line, flags, fmt = struct.unpack_from("<IIHHB", page, offset)
            item.update({"transaction": tx, "back_page": b_page, "back_line": b_line, "flags": flags})
        slots.append(item)
    return {"page": number, "type": page[0], "sequence": sequence, "relation": relation,
            "slot_count": count, "header_bytes": 24, "slot_bytes": 4 * count, "slots": slots}


def btree_pages(blob, relation):
    """B-tree pages (type 7) of one relation: header fields from ods.h btree_page; whether the key bytes 'alice' occur."""
    out = []
    for i in range(len(blob) // PAGE_SIZE):
        page = blob[i * PAGE_SIZE:(i + 1) * PAGE_SIZE]
        if page[0] != 7:
            continue
        sibling, left, _prefix, rel, length, idx, level = struct.unpack_from("<IIiHHBB", page, 16)
        if rel == relation:
            out.append({"page": i, "index_id": idx, "level": level, "right_sibling": sibling, "left_sibling": left,
                        "length": length, "has_alice": b"alice" in page[:length]})
    return out


def tip_states(blob, page_number, upto):
    """Header next-transaction counter and the 2-bit TIP states (tra.h: 0 active, 1 limbo, 2 dead, 3 committed)."""
    hdr = blob[:PAGE_SIZE]
    oit, oat, nxt = struct.unpack_from("<III", hdr, 28)
    page = blob[page_number * PAGE_SIZE:(page_number + 1) * PAGE_SIZE]
    assert page[0] == 3, "not a TIP page"
    states = [(page[20 + t // 4] >> ((t % 4) * 2)) & 3 for t in range(upto + 1)]
    return {"oldest_transaction": oit, "oldest_active": oat, "next_transaction": nxt, "tip_page": page_number, "states": states}


def kinds(blob):
    return [blob[i * PAGE_SIZE] for i in range(len(blob) // PAGE_SIZE)]


result = {}
for name in ("clean_before", "clean_after"):
    blob = (LAB / (name + ".fdb")).read_bytes()
    result[name] = {"sha256": hashlib.sha256(blob).hexdigest(), "pages": len(blob) // PAGE_SIZE,
                    "page_types": kinds(blob), "data_page_231": page_map(blob, 231),
                    "users_btree_pages": btree_pages(blob, 128),
                    "tip": tip_states(blob, 222, struct.unpack_from("<I", blob, 36)[0])}
out = VIDEO / "research" / "lab" / "out_17_page_map.json"
out.write_text(json.dumps(result, indent=1), encoding="utf-8")
for name, r in result.items():
    p = r["data_page_231"]
    print(name, r["sha256"][:12], "pages", r["pages"], "slots", p["slot_count"],
          [(s["line"], s["offset"], s["length"], s.get("transaction")) for s in p["slots"]])
    print("  users b-tree pages:", r["users_btree_pages"])
    print("  tip:", r["tip"])
