"""Verify this film's evidence integrity without rendering or touching shared files.

Run after 00, 01, 07. This checks provenance/index/log consistency, not whether
every prose interpretation is correct and not the repository's handoff gate.
"""

import base64
import hashlib
import json
import re
import tarfile
from pathlib import Path

LAB = Path(__file__).resolve().parent
RESEARCH = LAB.parent
SRC = RESEARCH / "_src"
VIDEO = RESEARCH.parent


def main():
    messages = []
    manifest = json.loads((LAB / "out_00_sources.json").read_text())
    checked_files = 0
    for release in manifest["releases"]:
        version = release["version"]
        archive = SRC / f"lua-{version}.tar.gz"
        assert hashlib.sha256(archive.read_bytes()).hexdigest() == release["sha256"]
        with tarfile.open(archive) as package:
            for member in package.getmembers():
                parts = Path(member.name).parts[1:]
                if not member.isfile() or not parts:
                    continue
                relative = Path(*parts)
                if not (relative.parts[0] == "src" and (relative.suffix in (".c", ".h", ".hpp") or relative.name == "Makefile")) and str(relative).replace("\\", "/") != "doc/manual.html":
                    continue
                original = package.extractfile(member).read()
                assert (SRC / f"lua-{version}" / relative).read_bytes() == original
                checked_files += 1
    messages.append(f"PASS 7 archive checksums; {checked_files} extracted source/header/Makefile/manual files identical to archives")

    inventory = json.loads((LAB / "out_01_inventory.json").read_text())
    for item in [*inventory["files"], *inventory["additional_files"]]:
        data = (SRC / "lua-5.5.1" / "src" / item["file"]).read_bytes()
        assert hashlib.sha256(data).hexdigest() == item["sha256"]
        assert len(data.splitlines()) == item["lines"]
    grouped = [name for names in inventory["groups"].values() for name in names]
    assert len(grouped) == len(set(grouped)) == inventory["totals"]["c_files"]
    assert inventory["totals"] == {"c_files": 34, "h_files": 27, "physical_lines": 32202, "opcodes": 85}
    facts = (RESEARCH / "FACTS.md").read_text(encoding="utf-8")
    expanded = re.sub(r"(\w+)\.c/h", r"\1.c \1.h", facts)
    for item in inventory["files"]:
        assert item["file"] in expanded, f"Missing module: {item['file']}"
    messages.append("PASS all 61 source/header hashes, line counts, build grouping and prose module coverage")

    expected = {"V": 5, "F": 50, "T": 8, "N": 8, "H": 6, "B": 4, "U": 8}
    ids = re.findall(r"^\| ((?:V|F|T|N|H|B|U)\d+)\b", facts, re.M)
    assert len(ids) == len(set(ids)) == sum(expected.values())
    assert set(ids) == {f"{prefix}{n:02d}" for prefix, count in expected.items() for n in range(1, count + 1)}
    for path in (VIDEO / "README.md", RESEARCH / "FACTS.md"):
        for link in re.findall(r"\]\(([^)]+)\)", path.read_text(encoding="utf-8")):
            if link.startswith(("https://", "http://", "#")):
                continue
            assert (path.parent / link.split("#")[0]).exists(), f"Broken local link: {link}"
    messages.append("PASS 89 unique research IDs (including 8 open items) and local document links")

    captures = json.loads((LAB / "out_07_processes.json").read_text())["processes"]
    assert captures
    for index, capture in enumerate(captures):
        expected_exit = 1 if index == len(captures) - 1 else 0
        assert capture["exit"] == expected_exit
        for field in ("stdout_base64", "stderr_base64"):
            raw = base64.b64decode(capture[field], validate=True)
            assert not re.search(rb"[A-Za-z]:[\\/](?:Users|Coding)[\\/]", raw), "Absolute local path in raw stream"
    summary = (LAB / "out_07_build_and_run.txt").read_text(encoding="utf-8")
    assert "All probe assertions passed" in summary
    assert "NUM_OPCODES=85" in summary
    assert "observed_gc_bytes_delta=9268" in summary and "observed_gc_bytes_delta=16440" in summary
    assert "sparse-keys 1,4,8 array_capacity=8" in summary
    assert "sparse-keys 1,4,8 array_capacity=1" in summary
    assert "bad binary format (version mismatch)" in summary
    messages.append(f"PASS {len(captures)} exact subprocess captures; expected cross-version rejection; observed dimensions and capacities")

    for version, file in (("5.5.1", "02_counter"), ("5.4.9", "02_counter"), ("5.5.1", "04_lua55")):
        raw = (SRC / f"listing-{version}-{file}.lua.txt").read_bytes()
        assert hashlib.sha256(raw).hexdigest() in summary
        normalized = (LAB / f"out_{file}_{version}_bytecode.txt").read_bytes()
        assert b"<address>" in normalized
        assert not re.search(rb"(?:at |for |; )(?:0x)?[0-9a-fA-F]{8,}", normalized)
    messages.append("PASS bytecode listing raw hashes and address normalization")
    for path in [VIDEO / "README.md", *RESEARCH.rglob("*")]:
        if not path.is_file() or "_src" in path.parts or "__pycache__" in path.parts:
            continue
        data = path.read_bytes()
        assert not re.search(rb"[A-Za-z]:[\\/](?:Users|Coding)[\\/]", data), "Absolute local path in tracked evidence"
    messages.append("PASS no absolute personal/workspace paths in candidate evidence files; no shared files written")
    output = "\n".join(messages) + "\n"
    (LAB / "out_09_verify_evidence.txt").write_bytes(output.encode("utf-8"))
    print(output, end="")


if __name__ == "__main__":
    main()
