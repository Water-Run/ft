"""Build and run 15_table_length.c against the 5.4.9 and 5.5.1 builds from 07.

Requires gcc on PATH and build/research/<version>/liblua.a from 07_build_and_run.py.
Writes out_15_table_length.txt next to this file.
"""
import subprocess
from pathlib import Path

LAB = Path(__file__).resolve().parent
VIDEO = LAB.parent.parent
SRC = VIDEO / "research" / "_src"
BUILD = VIDEO / "build" / "research"
lines = ["Table length probe, 2026-11-21; same Windows x64 / MinGW GCC builds as 07."]
for version in ("5.4.9", "5.5.1"):
    folder = BUILD / version
    if not (folder / "liblua.a").exists():
        raise SystemExit(f"missing build/research/{version}; run 07_build_and_run.py first")
    exe = folder / "table_length.exe"
    subprocess.run(["gcc", "-std=gnu99", "-O2", "-DLUA_USE_APICHECK",
                    "-I", str(SRC / f"lua-{version}" / "src"), str(LAB / "15_table_length.c"),
                    str(folder / "liblua.a"), "-lm", "-o", str(exe)], check=True)
    out = subprocess.run([str(exe)], check=True, capture_output=True, text=True).stdout.strip()
    lines.append(out)
(LAB / "out_15_table_length.txt").write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
print("\n".join(lines))
