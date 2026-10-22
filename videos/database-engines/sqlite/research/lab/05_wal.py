"""Three real shell processes: snapshot readers, serialized writers, checkpoint.

Parse/checksum actual WAL frames and overlay only committed frames onto main-db
bytes. All statements run in deliberately controlled order; no race is assumed.
"""
import shutil
import struct
from lab_common import Cli, current_base, finish, new_run, sha256
from page_map import Database


def wal(blob):
    assert len(blob) >= 32
    magic, version, size, sequence, salt1, salt2, check1, check2 = struct.unpack(">8I", blob[:32])
    assert magic in (0x377f0682, 0x377f0683)
    endian = "<" if magic == 0x377f0682 else ">"
    def checksum(part, state=(0, 0)):
        a, b = state
        words = struct.unpack(endian + str(len(part) // 4) + "I", part)
        for i in range(0, len(words), 2):
            a = (a + words[i] + b) & 0xffffffff
            b = (b + words[i + 1] + a) & 0xffffffff
        return a, b
    state = checksum(blob[:24])
    assert state == (check1, check2)
    assert (len(blob) - 32) % (size + 24) == 0
    frames = []
    for offset in range(32, len(blob), size + 24):
        header = blob[offset:offset + 24]
        page, commit_size, s1, s2, c1, c2 = struct.unpack(">6I", header)
        payload = blob[offset + 24:offset + 24 + size]
        state = checksum(header[:8] + payload, state)
        assert (s1, s2) == (salt1, salt2) and state == (c1, c2)
        frames.append({"frame": len(frames) + 1, "page": page, "database_pages_if_commit": commit_size,
                       "payload_sha256": sha256(payload), "checksum_valid": True})
    return {"page_size": size, "header_hex": blob[:32].hex(), "frame_count": len(frames), "frames": frames,
            "last_commit_frame": max((f["frame"] for f in frames if f["database_pages_if_commit"]), default=0)}


def main():
    directory = new_run("05")
    path = directory / "wal.db"
    shutil.copyfile(current_base(), path)
    with Cli(path, "writer") as writer, Cli(path, "old-reader") as reader, Cli(path, "other-writer") as other:
        assert writer.scalar("PRAGMA journal_mode=WAL;") == "wal"
        writer.raw("PRAGMA synchronous=FULL;\nPRAGMA wal_autocheckpoint=0;")
        before = path.read_bytes()
        reader.raw("BEGIN;")
        old = reader.scalar("SELECT age FROM users WHERE id=2050;")
        writer.raw("BEGIN IMMEDIATE;\nUPDATE users SET age=43 WHERE id=2050;")
        competing = other.raw("BEGIN IMMEDIATE;", expected_error=True)
        assert "locked" in competing.lower()
        writer.raw("COMMIT;")
        old_after = reader.scalar("SELECT age FROM users WHERE id=2050;")
        fresh = other.scalar("SELECT age FROM users WHERE id=2050;")
        assert (old, old_after, fresh) == (42, 42, 43)
        after = path.read_bytes()
        assert before == after, "Commit must not have checkpointed main db in this controlled experiment"
        raw_wal = path.with_name(path.name + "-wal").read_bytes()
        (directory / "committed-wal.bin").write_bytes(raw_wal)
        decoded = wal(raw_wal)
        assert decoded["last_commit_frame"] > 0
        overlay = bytearray(after)
        size = decoded["page_size"]
        for frame in decoded["frames"][:decoded["last_commit_frame"]]:
            offset = 32 + (frame["frame"] - 1) * (size + 24) + 24
            page_offset = (frame["page"] - 1) * size
            overlay[page_offset:page_offset + size] = raw_wal[offset:offset + size]
        root = writer.scalar("SELECT rootpage FROM sqlite_schema WHERE name='users';")
        main_value = Database(after).route(root, 2050)["cell"]["record"]["values"][2]
        overlay_value = Database(overlay).route(root, 2050)["cell"]["record"]["values"][2]
        assert (main_value, overlay_value) == (42, 43)
        held_checkpoint = writer.q("PRAGMA wal_checkpoint(PASSIVE);")
        assert held_checkpoint[0]["checkpointed"] < held_checkpoint[0]["log"]
        reader.raw("COMMIT;")
        final_checkpoint = writer.q("PRAGMA wal_checkpoint(TRUNCATE);")
        assert list(final_checkpoint[0].values()) == [0, 0, 0]
        assert path.with_name(path.name + "-wal").stat().st_size == 0
        updated = Database(path.read_bytes()).route(root, 2050)["cell"]["record"]["values"][2]
        assert updated == 43 and writer.scalar("PRAGMA integrity_check;") == "ok"
    finish("05_wal", {"summary": {"reader_before": old, "old_reader_after_commit": old_after,
                                   "fresh_reader_after_commit": fresh, "main_file_before_checkpoint": main_value,
                                   "committed_overlay": overlay_value, "main_file_after_checkpoint": updated,
                                   "wal_frames": decoded["frame_count"]},
                      "competing_writer_error": competing, "main_hash_before": sha256(before),
                      "main_hash_after_commit": sha256(after), "wal": decoded,
                      "checkpoint_with_reader": held_checkpoint, "checkpoint_after_reader": final_checkpoint,
                      "limits": ["Real separate processes, synchronized sequentially; not a stress/race test.",
                                 "WAL salts are intentionally random; WAL hashes need not repeat across runs.",
                                 "No real power loss or hardware durability test performed."]})


if __name__ == "__main__":
    main()
