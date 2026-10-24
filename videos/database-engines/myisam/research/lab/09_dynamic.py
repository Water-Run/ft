"""Variable-length rows: notes from Alice, Bob and Carol; Alice's note grows and splits; OPTIMIZE TABLE rejoins it.

A VARCHAR column makes the table use the dynamic row format. Blocks in notes.MYD are walked
with the header layout of storage/myisam/mi_dynrec.cc _mi_get_block_info (types 0-13).
"""
from lab_common import TRANSCRIPT, Cli, Server, finish, new_run, stop_all
import subprocess
from lab_common import tool

SCHEMA = ("CREATE TABLE notes(id INT NOT NULL PRIMARY KEY, author CHAR(10) CHARACTER SET ascii NOT NULL, "
          "body VARCHAR(200) CHARACTER SET ascii NOT NULL) ENGINE=MyISAM")
LONG = ("Today is my birthday. I am 43 now. Thanks to everyone who sent a message, "
        "and see you all at the party on Saturday evening.")


def u2(b, i): return int.from_bytes(b[i:i + 2], "big")
def u3(b, i): return int.from_bytes(b[i:i + 3], "big")
def u4(b, i): return int.from_bytes(b[i:i + 4], "big")
def u8(b, i): return int.from_bytes(b[i:i + 8], "big")


def block(d, pos):
    """One block header -> (kind, header_len, data_len, block_len, next_pos); per mi_dynrec.cc."""
    t = d[pos]
    if t == 0:
        return {"type": 0, "kind": "deleted", "header": 20, "data": 0, "block": u3(d, pos + 1), "next": u8(d, pos + 4), "total": u3(d, pos + 1)}
    table = {1: ("whole", 3, lambda: (u2(d, pos + 1), u2(d, pos + 1), None)),
             2: ("whole", 4, lambda: (u3(d, pos + 1), u3(d, pos + 1), None)),
             3: ("whole", 4, lambda: (u2(d, pos + 1), u2(d, pos + 1) + d[pos + 3], None)),
             4: ("whole", 5, lambda: (u3(d, pos + 1), u3(d, pos + 1) + d[pos + 4], None)),
             5: ("first part", 13, lambda: (u2(d, pos + 3), u2(d, pos + 3), u8(d, pos + 5))),
             6: ("first part", 15, lambda: (u3(d, pos + 4), u3(d, pos + 4), u8(d, pos + 7))),
             7: ("last part", 3, lambda: (u2(d, pos + 1), u2(d, pos + 1), None)),
             8: ("last part", 4, lambda: (u3(d, pos + 1), u3(d, pos + 1), None)),
             9: ("last part", 4, lambda: (u2(d, pos + 1), u2(d, pos + 1) + d[pos + 3], None)),
             10: ("last part", 5, lambda: (u3(d, pos + 1), u3(d, pos + 1) + d[pos + 4], None)),
             11: ("middle part", 11, lambda: (u2(d, pos + 1), u2(d, pos + 1), u8(d, pos + 3))),
             12: ("middle part", 12, lambda: (u3(d, pos + 1), u3(d, pos + 1), u8(d, pos + 4))),
             13: ("first part", 16, lambda: (u3(d, pos + 5), u3(d, pos + 5), u8(d, pos + 8)))}
    kind, hl, f = table[t]
    data_len, block_len, nxt = f()
    raw = d[pos + hl:pos + hl + data_len]
    return {"type": t, "kind": kind, "header": hl, "data": data_len, "block": block_len, "next": nxt,
            "total": hl + block_len, "text": raw.decode("ascii", "replace")}


def walk(path):
    d = path.read_bytes()
    out, pos = [], 0
    while pos < len(d):
        b = block(d, pos)
        b["offset"] = pos
        out.append(b)
        pos += b["total"]
    assert pos == len(d), (pos, len(d))
    return {"bytes": len(d), "blocks": out}


def main():
    server = Server(new_run("09"), "server").start()
    stages = {}
    try:
        c = Cli("notes")
        c.run("CREATE DATABASE demo"); c.run("USE demo"); c.run(SCHEMA)
        c.run("INSERT INTO notes VALUES (1, 'Alice', 'Hello'), (2, 'Bob', 'Hi Alice'), (3, 'Carol', 'See you')")
        c.run("FLUSH TABLES")
        path = server.data / "demo" / "notes.MYD"
        status = lambda: c.rows("SHOW TABLE STATUS LIKE 'notes'")[0]
        stages["three short notes"] = {"file": walk(path), "row_format": status()["Row_format"]}
        c.run(f"UPDATE notes SET body='{LONG}' WHERE id=1"); c.run("FLUSH TABLES")
        stages["Alice's note grows"] = {"file": walk(path), "read_back": c.rows("SELECT id, LENGTH(body) AS len FROM notes WHERE id=1")}
        c.run("OPTIMIZE TABLE notes"); c.run("FLUSH TABLES")
        stages["after OPTIMIZE TABLE"] = {"file": walk(path)}
        c.close()
        server.stop()
        chk = subprocess.run([tool("myisamchk"), "-dvv", str(path.with_suffix(".MYI"))], capture_output=True, text=True)
        TRANSCRIPT.extend(["[myisamchk -dvv notes.MYI]", chk.stdout.replace(str(path.with_suffix(".MYI")), "notes.MYI").strip(), ""])
    finally:
        server.stop(); stop_all()
    grown = stages["Alice's note grows"]["file"]["blocks"]
    assert any(b["kind"] == "first part" for b in grown) and any(b["kind"] == "last part" for b in grown)
    after = stages["after OPTIMIZE TABLE"]["file"]["blocks"]
    assert all(b["kind"] == "whole" for b in after)
    finish("09_dynamic", {
        "summary": {name: [[b["offset"], b["kind"], b["total"], b.get("next"), b.get("text", "")[:24]] for b in st["file"]["blocks"]]
                    for name, st in stages.items()},
        "stages": stages,
        "limits": ["Three rows only; block sizes depend on row lengths and MyISAM's minimum block of 20 bytes."]})


if __name__ == "__main__":
    main()
