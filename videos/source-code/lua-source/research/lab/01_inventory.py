"""Index unmodified pinned sources, Makefile groups, definitions and opcodes.

Run after 00_fetch_sources.py. Outputs carry one-based original source lines.
This is an index, not a C parser or a claim that all listed code was executed.
"""

import hashlib
import json
import re
from pathlib import Path

LAB = Path(__file__).resolve().parent
SRC = LAB.parent / "_src"
VERSION = "5.5.1"


def main():
    root = SRC / f"lua-{VERSION}" / "src"
    make = (root / "Makefile").read_text()
    groups = {}
    for group in ("CORE", "LIB", "LUA", "LUAC"):
        value = re.search(rf"^{group}_O=\s*(.*)$", make, re.M).group(1)
        groups[group] = [s.removesuffix(".o") + ".c" for s in value.split()]
    files = []
    for path in sorted(root.iterdir()):
        if path.suffix not in (".c", ".h"):
            continue
        data = path.read_bytes()
        files.append({
            "file": path.name, "bytes": len(data), "lines": len(data.splitlines()),
            "sha256": hashlib.sha256(data).hexdigest(),
            "makefile_group": next((g for g, names in groups.items() if path.name in names), "header"),
        })
    definitions = []
    # Only column-zero C definitions. Declarations end in ';' and are excluded.
    definition = re.compile(r"^[A-Za-z_][^\n;{}]*?\b(\w+)\s*\(([^;{}]*?)\)\s*\{", re.M)
    for path in sorted(root.glob("*.c")):
        source = path.read_text()
        for match in definition.finditer(source):
            definitions.append({"file": path.name, "symbol": match.group(1),
                                "line": source.count("\n", 0, match.start()) + 1})
    headers = []
    for path in sorted(root.glob("*.h")):
        for number, line in enumerate(path.read_text().splitlines(), 1):
            match = re.match(r"typedef (?:struct|union) (\w+)\s*\{", line)
            if match:
                headers.append({"file": path.name, "symbol": match.group(1), "line": number})
    opcode_source = (root / "lopcodes.h").read_text()
    opcodes = [{"name": match.group(1), "line": opcode_source.count("\n", 0, match.start()) + 1}
               for match in re.finditer(r"^OP_(\w+)(?=\s*(?:,|/\*))", opcode_source, re.M)]
    assert len(opcodes) == len(set(x["name"] for x in opcodes))
    assert opcodes[-1]["name"] == "EXTRAARG"
    result = {
        "checked_on": "2026-11-15", "version": VERSION,
        "archive_manifest": "out_00_sources.json",
        "count_method": "All src/*.c and src/*.h; physical splitlines including comments and blanks; no doc, Makefile or external dependency",
        "groups": groups, "files": files,
        "additional_files": [{"file": name, "bytes": len((root / name).read_bytes()),
                              "lines": len((root / name).read_bytes().splitlines()),
                              "sha256": hashlib.sha256((root / name).read_bytes()).hexdigest()}
                             for name in ("Makefile", "lua.hpp")],
        "totals": {"c_files": sum(x["file"].endswith(".c") for x in files),
                   "h_files": sum(x["file"].endswith(".h") for x in files),
                   "physical_lines": sum(x["lines"] for x in files), "opcodes": len(opcodes)},
        "definitions": definitions, "header_types": headers, "opcode_index": opcodes,
    }
    (LAB / "out_01_inventory.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(result["totals"]))
    for group, names in groups.items():
        print(f"{group}: {', '.join(names)}")
    print(f"Indexed {len(definitions)} column-zero function definitions and {len(headers)} header types")


if __name__ == "__main__":
    main()
