"""Independent byte-level decoder for the measured UTF-8 SQLite databases.

Spec: https://www.sqlite.org/fileformat.html sections 1.6, 1.7, 2.1 and 4.
This rebuilds logical B-tree routes from bytes. It is not a runtime page-I/O trace.
Table interior pages carry rowid separators; index interior cells carry records.
"""
import struct
from lab_common import sha256

KINDS = {2: "index-interior", 5: "table-interior", 10: "index-leaf", 13: "table-leaf"}


def varint(blob, offset):
    value = 0
    start = offset
    for n in range(9):
        byte = blob[offset]
        offset += 1
        if n == 8:
            return (value << 8) | byte, offset - start
        value = (value << 7) | (byte & 127)
        if byte < 128:
            return value, offset - start
    raise AssertionError("Invalid varint")


def record(payload):
    header_size, consumed = varint(payload, 0)
    pos = consumed
    types = []
    while pos < header_size:
        kind, size = varint(payload, pos)
        pos += size
        types.append(kind)
    assert pos == header_size
    pos = header_size
    values = []
    widths = {1: 1, 2: 2, 3: 3, 4: 4, 5: 6, 6: 8, 7: 8}
    for kind in types:
        if kind in (0, 8, 9):
            values.append({0: None, 8: 0, 9: 1}[kind])
            continue
        assert kind not in (10, 11), "Reserved serial type"
        size = widths[kind] if kind < 12 else (kind - 12) // 2
        part = payload[pos:pos + size]
        assert len(part) == size
        pos += size
        if kind == 7:
            value = struct.unpack(">d", part)[0]
        elif kind < 7:
            value = int.from_bytes(part, "big", signed=True)
        elif kind % 2:
            value = part.decode("utf-8")
        else:
            value = {"blob_hex": part.hex()}
        values.append(value)
    assert pos == len(payload)
    return {"header_size": header_size, "serial_types": types, "values": values, "payload_bytes": len(payload)}


def preview(value):
    if isinstance(value, str) and len(value) > 96:
        return {"text_prefix": value[:32], "characters": len(value), "utf8_sha256": sha256(value.encode())}
    return value


class Database:
    def __init__(self, blob):
        self.blob = blob
        assert blob[:16] == b"SQLite format 3\x00"
        encoded = int.from_bytes(blob[16:18], "big")
        self.size = 65536 if encoded == 1 else encoded
        self.usable = self.size - blob[20]
        assert len(blob) % self.size == 0
        assert int.from_bytes(blob[56:60], "big") == 1, "Only UTF-8 is decoded in this lab"
        self.count = len(blob) // self.size
        self.cache = {}

    def raw(self, number):
        assert 1 <= number <= self.count
        return self.blob[(number - 1) * self.size:number * self.size]

    def payload(self, page, pos, amount, table):
        maximum = self.usable - 35 if table else ((self.usable - 12) * 64 // 255) - 23
        minimum = ((self.usable - 12) * 32 // 255) - 23
        local = amount
        if amount > maximum:
            local = minimum + (amount - minimum) % (self.usable - 4)
            if local > maximum:
                local = minimum
        result = bytearray(page[pos:pos + local])
        overflow = []
        if local < amount:
            number = int.from_bytes(page[pos + local:pos + local + 4], "big")
            while len(result) < amount:
                assert number not in overflow and number != 0
                overflow.append(number)
                other = self.raw(number)
                remaining = amount - len(result)
                result.extend(other[4:4 + min(remaining, self.usable - 4)])
                number = int.from_bytes(other[:4], "big")
            assert number == 0
        assert len(result) == amount
        return bytes(result), local, overflow

    def page(self, number):
        if number in self.cache:
            return self.cache[number]
        blob = self.raw(number)
        h = 100 if number == 1 else 0
        kind = blob[h]
        assert kind in KINDS
        count = int.from_bytes(blob[h + 3:h + 5], "big")
        interior = kind in (2, 5)
        header = 12 if interior else 8
        cells = []
        for slot in range(count):
            ptr = h + header + slot * 2
            offset = int.from_bytes(blob[ptr:ptr + 2], "big")
            pos = offset
            cell = {"slot": slot, "offset_in_page": offset, "offset_in_file": (number - 1) * self.size + offset}
            if interior:
                cell["left_child"] = int.from_bytes(blob[pos:pos + 4], "big")
                pos += 4
            if kind == 5:
                key, n = varint(blob, pos)
                cell["key"] = key
                cell["cell_hex"] = blob[offset:pos + n].hex()
            else:
                amount, n = varint(blob, pos)
                pos += n
                if kind == 13:
                    key, n = varint(blob, pos)
                    pos += n
                    cell["rowid"] = key
                payload, local, overflow = self.payload(blob, pos, amount, kind == 13)
                decoded = record(payload)
                cell.update({"record": decoded, "local_payload_bytes": local, "overflow_pages": overflow,
                             "payload_sha256": sha256(payload), "payload_prefix_hex": payload[:96].hex()})
                cell["key"] = cell["rowid"] if kind == 13 else decoded["values"]
            cells.append(cell)
        children = [c["left_child"] for c in cells] if interior else []
        if interior:
            children.append(int.from_bytes(blob[h + 8:h + 12], "big"))
        result = {"page": number, "kind": KINDS[kind], "type_byte": kind, "cell_count": count,
                  "header_offset_in_page": h, "header_hex": blob[h:h + header].hex(),
                  "children": children, "cells": cells}
        self.cache[number] = result
        return result

    def freelist(self):
        next_trunk = int.from_bytes(self.blob[32:36], "big")
        declared = int.from_bytes(self.blob[36:40], "big")
        pages = set()
        trunks = []
        while next_trunk:
            assert next_trunk not in pages
            pages.add(next_trunk)
            blob = self.raw(next_trunk)
            following, count = struct.unpack(">II", blob[:8])
            assert count <= self.usable // 4 - 2
            leaves = list(struct.unpack(">" + str(count) + "I", blob[8:8 + count * 4]))
            for leaf in leaves:
                assert 1 <= leaf <= self.count and leaf not in pages
                pages.add(leaf)
            trunks.append({"page": next_trunk, "next_trunk": following, "leaves": leaves})
            next_trunk = following
        assert len(pages) == declared
        return {"declared_pages": declared, "pages": sorted(pages), "trunks": trunks}

    def tree(self, name, root, dbstat):
        nodes = []
        overflow = []
        visited = set()
        entries = 0
        def walk(number, depth):
            nonlocal entries
            assert number not in visited
            visited.add(number)
            page = self.page(number)
            carries_records = page["kind"] != "table-interior"
            if carries_records:
                entries += page["cell_count"]
            keys = [c["key"] for c in page["cells"]]
            for cell in page["cells"]:
                if cell.get("overflow_pages"):
                    overflow.append({"owner_page": number, "slot": cell["slot"], "pages": cell["overflow_pages"],
                                     "local_bytes": cell["local_payload_bytes"], "payload_bytes": cell["record"]["payload_bytes"]})
            nodes.append({"page": number, "depth": depth, "kind": page["kind"], "cell_count": page["cell_count"],
                          "children": page["children"], "first_cell_key": keys[0] if keys else None,
                          "last_cell_key": keys[-1] if keys else None,
                          "separators": keys if page["children"] else [], "header_hex": page["header_hex"]})
            for child in page["children"]:
                walk(child, depth + 1)
        walk(root, 0)
        assert len({n["depth"] for n in nodes if not n["children"]}) == 1, "All leaves must have equal depth"
        expected = [r for r in dbstat if r["name"] == name and r["pagetype"] != "overflow"]
        assert visited == {r["pageno"] for r in expected}, name
        for node in nodes:
            match = next(r for r in expected if r["pageno"] == node["page"])
            assert node["cell_count"] == match["ncell"]
            assert node["depth"] == match["path"].count("/") - 1
        raw_overflow = {p for chain in overflow for p in chain["pages"]}
        assert raw_overflow == {r["pageno"] for r in dbstat if r["name"] == name and r["pagetype"] == "overflow"}
        return {"name": name, "root": root, "height": max(n["depth"] for n in nodes) + 1,
                "btree_pages": len(nodes), "records": entries, "nodes": nodes, "overflow_chains": overflow,
                "dbstat_cross_check": True}

    def route(self, root, target):
        steps = []
        number = root
        while True:
            p = self.page(number)
            keys = [c["key"] for c in p["cells"]]
            if isinstance(target, tuple):
                keys = [tuple(k) for k in keys]
            if p["kind"] == "index-interior" and target in keys:
                slot = keys.index(target)
                steps.append({"page": number, "kind": p["kind"], "found_slot": slot, "found_in_interior": True})
                return {"steps": steps, "cell": self.cell_preview(p["cells"][slot])}
            if not p["children"]:
                slot = keys.index(target)
                steps.append({"page": number, "kind": p["kind"], "found_slot": slot})
                return {"steps": steps, "cell": self.cell_preview(p["cells"][slot])}
            slot = next((i for i, key in enumerate(keys) if target <= key), len(keys))
            child = p["children"][slot]
            steps.append({"page": number, "kind": p["kind"], "chosen_child": child,
                          "upper_separator": keys[slot] if slot < len(keys) else None})
            number = child

    @staticmethod
    def cell_preview(cell):
        result = {k: v for k, v in cell.items() if k != "record"}
        if "record" in cell:
            result["record"] = {**cell["record"], "values": [preview(v) for v in cell["record"]["values"]]}
        return result


def measure(c, database):
    blob = database.read_bytes()
    parsed = Database(blob)
    schema = c.q("SELECT name,type,tbl_name,rootpage,sql FROM sqlite_schema WHERE rootpage>0 ORDER BY rootpage;")
    stat = c.q("SELECT name,path,pageno,pagetype,ncell,payload,unused,mx_payload,pgsize FROM dbstat ORDER BY name,path;")
    roots = [("sqlite_schema", 1)] + [(r["name"], r["rootpage"]) for r in schema]
    trees = [parsed.tree(name, root, stat) for name, root in roots]
    free = parsed.freelist()
    assert free["declared_pages"] == c.scalar("PRAGMA freelist_count;")
    assigned = set(free["pages"])
    for tree in trees:
        pages = {n["page"] for n in tree["nodes"]}
        pages.update(p for chain in tree["overflow_chains"] for p in chain["pages"])
        assert not assigned.intersection(pages), "A page cannot belong to two structures"
        assigned.update(pages)
    assert assigned == set(range(1, parsed.count + 1)), "Every page must be accounted for in this non-auto-vacuum small database"
    return {"page_size": parsed.size, "page_count": parsed.count, "sha256": sha256(blob), "schema": schema,
            "trees": trees, "freelist_count": free["declared_pages"], "freelist": free, "all_pages_accounted_for": True,
            "cross_check": "Every B-tree edge decoded from bytes; page set, cell counts, depths and overflow pages checked against dbstat; freelist decoded and all file pages accounted for."}
