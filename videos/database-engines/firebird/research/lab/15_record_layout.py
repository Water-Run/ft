"""Decode slots and version headers in the existing experiment 08 snapshots.

No database is opened or changed. Generate the two snapshots with the existing
08_clean_versions.py experiment if out/lab/clean_before.fdb or clean_after.fdb
is absent. Source baseline: Firebird v5.0.4 ods.h, sqz.cpp, dpm.epp.
"""
import hashlib
import json
from pathlib import Path
import struct

VIDEO = Path(__file__).resolve().parents[2]
PAGE_SIZE = 8192


def unpack_record(data):
    result = bytearray()
    i = 0
    while i < len(data):
        count = struct.unpack_from("b", data, i)[0]
        i += 1
        if count >= 0:
            assert i + count <= len(data)
            result.extend(data[i:i + count])
            i += count
        else:
            length = -count
            if count in (-1, -2):
                size = 2 if count == -1 else 4
                length = int.from_bytes(data[i:i + size], "little")
                i += size
            assert i < len(data)
            result.extend(bytes([data[i]]) * length)
            i += 1
    return bytes(result)


def apply_difference(current, difference):
    result = bytearray(current)
    i = position = 0
    while i < len(difference) and position < len(result):
        count = struct.unpack_from("b", difference, i)[0]
        i += 1
        if count > 0:
            assert i + count <= len(difference) and position + count <= len(result)
            result[position:position + count] = difference[i:i + count]
            i += count
            position += count
        else:
            position -= count
    assert position <= len(result) and not any(difference[i:])
    return bytes(result[:position])


def slot(blob, page_number, line):
    page = blob[page_number * PAGE_SIZE:(page_number + 1) * PAGE_SIZE]
    assert page[0] == 5
    sequence, relation, count = struct.unpack_from("<IHH", page, 16)
    assert line < count
    offset, length = struct.unpack_from("<HH", page, 24 + 4 * line)
    record = page[offset:offset + length]
    transaction, back_page, back_line, flags, fmt = struct.unpack_from("<IIHHB", record)
    assert not (flags & (4 | 8 | 16 | 1024)), "Only short, complete row headers are decoded"
    payload = record[13:] if flags & 2048 else unpack_record(record[13:])
    return {"page": page_number, "line": line, "page_sequence": sequence, "relation": relation,
            "slot_count": count, "offset_in_page": offset, "record_bytes": length,
            "transaction": transaction, "back_page": back_page, "back_line": back_line,
            "flags": flags, "format": fmt, "payload_hex": payload.hex(), "record_hex": record.hex()}


def main():
    before_path = VIDEO / "out/lab/clean_before.fdb"
    after_path = VIDEO / "out/lab/clean_after.fdb"
    before, after = before_path.read_bytes(), after_path.read_bytes()
    candidates = []
    for page_number in range(len(before) // PAGE_SIZE):
        page = before[page_number * PAGE_SIZE:(page_number + 1) * PAGE_SIZE]
        if page[0] != 5:
            continue
        count = struct.unpack_from("<H", page, 22)[0]
        for line in range(count):
            offset, length = struct.unpack_from("<HH", page, 24 + 4 * line)
            if length and b"alice" in page[offset:offset + length]:
                candidates.append((page_number, line))
    assert len(candidates) == 1
    page_number, line = candidates[0]
    original = slot(before, page_number, line)
    current = slot(after, page_number, line)
    historical = slot(after, current["back_page"], current["back_line"])
    assert current["flags"] & 32 and historical["flags"] & 2
    restored = apply_difference(bytes.fromhex(current["payload_hex"]), bytes.fromhex(historical["payload_hex"]))
    assert restored.hex() == original["payload_hex"]
    assert current["transaction"] != historical["transaction"] == original["transaction"]
    pointers = []
    for pn in range(len(before) // PAGE_SIZE):
        page = before[pn * PAGE_SIZE:(pn + 1) * PAGE_SIZE]
        if page[0] != 4 or struct.unpack_from("<H", page, 26)[0] != original["relation"]:
            continue
        count = struct.unpack_from("<H", page, 24)[0]
        for index in range(count):
            target = struct.unpack_from("<I", page, 32 + 4 * index)[0]
            if target == page_number:
                pointers.append({"pointer_page": pn, "sequence": struct.unpack_from("<I", page, 16)[0],
                                 "entry": index, "data_page": target})
    assert len(pointers) == 1
    changed = [{"offset_in_unpacked_record": i, "before": a, "after": b}
               for i, (a, b) in enumerate(zip(bytes.fromhex(original["payload_hex"]), bytes.fromhex(current["payload_hex"]))) if a != b]
    tips = [pn for pn in range(len(after) // PAGE_SIZE) if after[pn * PAGE_SIZE] == 3]
    assert len(tips) == 1, "This small sample has a single transaction inventory page"
    tip = tips[0]
    transaction = current["transaction"]
    state_offset = tip * PAGE_SIZE + 20 + transaction // 4
    state_shift = (transaction % 4) * 2
    state_after = (after[state_offset] >> state_shift) & 3
    assert state_after == 3
    result = {"source_experiment": "08_clean_versions.py", "source_version": "Firebird 5.0.4 / ODS 13.1",
              "page_size": PAGE_SIZE, "before_sha256": hashlib.sha256(before).hexdigest(),
              "after_sha256": hashlib.sha256(after).hexdigest(), "pointer": pointers[0],
              "original": original, "current": current, "historical_delta": historical,
              "restored_payload_hex": restored.hex(), "restores_original_exactly": True,
              "changed_payload_bytes": changed,
              "transaction_inventory": {"page": tip, "transaction": transaction,
                                        "bits_per_transaction": 2, "state_after_commit": state_after,
                                        "state_names": {"0": "active", "1": "limbo", "2": "dead", "3": "committed"}},
              "scope": "Decoded headers and delta against an existing snapshot pair; not a new live/crash test"}
    output = VIDEO / "research/lab/out_15_record_layout.json"
    output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    report = (f"Firebird 5.0.4 / ODS 13.1; page size {PAGE_SIZE}\n"
              f"Pointer: {pointers[0]}\n"
              f"Before: page {page_number}, slot {line}, offset {original['offset_in_page']}, transaction {original['transaction']}\n"
              f"After: same slot, offset {current['offset_in_page']}, transaction {current['transaction']}\n"
              f"Back pointer: page {historical['page']}, slot {historical['line']}, transaction {historical['transaction']}\n"
              f"Current header delta flag: {bool(current['flags'] & 32)}; historical chained flag: {bool(historical['flags'] & 2)}\n"
              f"Historical difference reconstructs original payload exactly: {result['restores_original_exactly']}\n"
              f"Changed unpacked bytes: {changed}\n")
    report += f"Transaction inventory: page {tip}, transaction {transaction}, state after commit {state_after} (binary 11)\n"
    (VIDEO / "research/lab/out_15_record_layout.txt").write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
