"""Independent byte decoder for MyISAM .MYI / static .MYD files (MySQL 9.7.4 source as the spec).

Header and key definitions follow storage/myisam/mi_open.cc (mi_state_info_write,
mi_base_info_write, mi_keydef_write, mi_keyseg_write); packed keys follow
mi_search.cc _mi_get_pack_key; child pointers _mi_kpos (block number x 1024);
row pointers _mi_dpos (row number x record length for static rows).
This reconstructs whole trees from bytes. It is not a runtime I/O trace.
"""
import collections

HA_PACK_KEY, HA_BINARY_PACK_KEY = 2, 32                  # key flags, include/my_base.h
HA_SPACE_PACK, HA_VAR_LENGTH_PART, HA_NULL_PART, HA_BLOB_PART = 1, 8, 16, 32   # segment flags
MIN_BLOCK = 1024                                           # MI_MIN_KEY_BLOCK_LENGTH


def be(b):
    return int.from_bytes(b, "big")


def key_length(d, pos):
    """my_compare.h get_key_length: one byte, or 255 followed by two bytes."""
    if d[pos] != 255:
        return d[pos], pos + 1
    return be(d[pos + 1:pos + 3]), pos + 3


def header(d):
    h = {"magic": d[0:4].hex(), "options": be(d[4:6]), "header_length": be(d[6:8]),
         "state_info_length": be(d[8:10]), "base_info_length": be(d[10:12]), "base_pos": be(d[12:14]),
         "key_parts": be(d[14:16]), "unique_key_parts": be(d[16:18]), "keys": d[18], "uniques": d[19],
         "max_block_size_index": d[21]}
    p, s = 24, {}

    def take(n, name):
        nonlocal p
        s[name] = be(d[p:p + n])
        p += n
    take(2, "open_count"); take(1, "changed"); take(1, "sortkey")
    for n in ["records", "del", "split", "dellink", "key_file_length", "data_file_length", "empty",
              "key_empty", "auto_increment", "checksum"]:
        take(8, n)
    for n in ["process", "unique", "status", "update_count"]:
        take(4, n)
    p += h["state_info_length"] - (24 + 14 * 8 + 7 * 4 + 2 * 2 + 8)   # state_diff_length
    s["key_root"] = []
    for _ in range(h["keys"]):
        s["key_root"].append(be(d[p:p + 8])); p += 8
    s["key_del"] = []
    for _ in range(h["max_block_size_index"]):
        s["key_del"].append(be(d[p:p + 8])); p += 8
    p, b = h["base_pos"], {}

    def tb(n, name):
        nonlocal p
        b[name] = be(d[p:p + n])
        p += n
    for n in ["keystart", "max_data_file_length", "max_key_file_length", "records", "reloc"]:
        tb(8, n)
    for n in ["mean_row_length", "reclength", "pack_reclength", "min_pack_length", "max_pack_length",
              "min_block_length", "fields", "pack_fields"]:
        tb(4, n)
    for n in ["rec_reflength", "key_reflength", "keys", "auto_key"]:
        tb(1, n)
    for n in ["pack_bits", "blobs", "max_key_block_length", "max_key_length", "extra_alloc_bytes"]:
        tb(2, n)
    tb(1, "extra_alloc_procent")
    p += 13
    keydefs = []
    for _ in range(h["keys"]):
        kd = {"keysegs": d[p], "key_alg": d[p + 1], "flag": be(d[p + 2:p + 4]), "block_length": be(d[p + 4:p + 6]),
              "keylength": be(d[p + 6:p + 8]), "minlength": be(d[p + 8:p + 10]), "maxlength": be(d[p + 10:p + 12])}
        p += 12
        kd["segs"] = []
        for _ in range(kd["keysegs"]):
            kd["segs"].append({"type": d[p], "null_bit": d[p + 2], "flag": be(d[p + 6:p + 8]),
                               "length": be(d[p + 8:p + 10]), "start": be(d[p + 10:p + 14])})
            p += 18
        keydefs.append(kd)
    return h, s, b, keydefs


def unpack_key(d, pos, kd, prev, nod_len, rec_len):
    """Decode one key entry at pos: segment values, row pointer, following child pointer."""
    assert not kd["flag"] & HA_BINARY_PACK_KEY, "binary-packed keys are not used in this table"
    vals = []
    for i, seg in enumerate(kd["segs"]):
        f = seg["flag"]
        assert not f & HA_NULL_PART, "NOT NULL columns only"
        if f & HA_PACK_KEY:
            first = d[pos]
            packed = first & 128
            if seg["length"] >= 127:
                length = be(d[pos:pos + 2]) & 32767; pos += 2
            else:
                length = first & 127; pos += 1
            if packed:
                if length == 0:                                     # 与上一项相同
                    vals.append(prev[i]); continue
                rest, pos = key_length(d, pos)
                vals.append(prev[i][:length] + d[pos:pos + rest]); pos += rest
            else:
                vals.append(d[pos:pos + length]); pos += length
        elif f & (HA_VAR_LENGTH_PART | HA_BLOB_PART | HA_SPACE_PACK):
            length, pos = key_length(d, pos)
            vals.append(d[pos:pos + length]); pos += length
        else:
            vals.append(d[pos:pos + seg["length"]]); pos += seg["length"]
    rowref = be(d[pos:pos + rec_len]); pos += rec_len
    child = None
    if nod_len:
        child = be(d[pos:pos + nod_len]) * MIN_BLOCK; pos += nod_len
    return vals, rowref, child, pos


def page_entries(d, pos, kd, key_reflength, rec_len):
    """All entries of one key block: (nod, leftmost child, [(values, rowref, child)])."""
    used = be(d[pos:pos + 2])
    nod = bool(used & 0x8000)
    used &= 0x7FFF
    nod_len = key_reflength if nod else 0
    p, end = pos + 2, pos + used
    first_child = None
    if nod:
        first_child = be(d[p:p + nod_len]) * MIN_BLOCK; p += nod_len
    entries, prev = [], [b""] * len(kd["segs"])
    while p < end:
        vals, rowref, child, p = unpack_key(d, p, kd, prev, nod_len, rec_len)
        entries.append((vals, rowref, child))
        prev = vals
    assert p == end, f"key block at {pos} decoded to {p}, expected {end}"
    return {"nod": nod, "used": used, "first_child": first_child, "entries": entries}


def walk(d, kd, root, key_reflength, rec_len, decode):
    """Every block of one index tree, breadth by depth; decode(vals) makes values printable."""
    nodes, total = [], 0
    stack = [(root, 0)]
    while stack:
        pos, depth = stack.pop(0)
        pg = page_entries(d, pos, kd, key_reflength, rec_len)
        children = ([pg["first_child"]] + [e[2] for e in pg["entries"]]) if pg["nod"] else []
        total += len(pg["entries"])
        nodes.append({"block": pos // MIN_BLOCK, "offset": pos, "depth": depth, "kind": "node" if pg["nod"] else "leaf",
                      "used_bytes": pg["used"], "entries": len(pg["entries"]),
                      "first": decode(pg["entries"][0][0]), "last": decode(pg["entries"][-1][0]),
                      "children": [c // MIN_BLOCK for c in children],
                      "separators": [[decode(e[0]), e[1]] for e in pg["entries"]] if pg["nod"] else None})
        stack.extend((c, depth + 1) for c in children)
    levels = collections.Counter((n["depth"], n["kind"]) for n in nodes)
    return {"root_block": root // MIN_BLOCK, "height": 1 + max(n["depth"] for n in nodes), "blocks": len(nodes),
            "entries": total, "levels": sorted([list(k) + [v] for k, v in levels.items()]), "nodes": nodes}


def search(d, kd, root, key_reflength, rec_len, target, decode):
    """Reconstructed lookup of the first entry equal to target (list of segment values)."""
    route, pos = [], root
    while True:
        pg = page_entries(d, pos, kd, key_reflength, rec_len)
        found = None
        for i, (vals, rowref, child) in enumerate(pg["entries"]):
            if vals >= target:
                found = i
                break
        step = {"block": pos // MIN_BLOCK, "kind": "node" if pg["nod"] else "leaf", "entries": len(pg["entries"])}
        if found is not None and pg["entries"][found][0] == target:
            step.update(hit_slot=found, rowref=pg["entries"][found][1]); route.append(step)
            return route
        if not pg["nod"]:
            step.update(miss=True); route.append(step)
            return route
        nxt = pg["first_child"] if found == 0 else (pg["entries"][found - 1][2] if found is not None else pg["entries"][-1][2])
        step.update(go_child=nxt // MIN_BLOCK, before_slot=found); route.append(step)
        pos = nxt
