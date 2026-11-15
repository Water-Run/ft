"""Production-side probes for the Lua source film (added 2026-11-15).

Run after 00, 01 and 07 (needs their unpacked sources and the 5.x builds).
Builds two old compilers that 07 left as static references (4.0.1, 5.0.3),
compiles the private-layout probe 11_internals.c against the 5.5.1 build, and
records: instruction words, a stack snapshot, string interning, hash
collisions, the 12_probes.lua checks, and the same small snippets listed by
every compiler. Artifacts go only to this video's ignored build/; the log
uses relative paths and replaces pointer values with <address>.
"""

import re
import subprocess
from pathlib import Path

LAB = Path(__file__).resolve().parent
VIDEO = LAB.parent.parent
SRC = LAB.parent / "_src"
BUILD = VIDEO / "build" / "research"
OUT = LAB / "out_12_producer_runs.txt"
LOG = []
ADDR = re.compile(r"\b(?:0x)?[0-9A-Fa-f]{12,16}\b")  # pointers; 8-digit instruction words stay


def rel(path, cwd):
    import os
    return os.path.relpath(path, cwd).replace("\\", "/")


def run(args, cwd, expected=0, record=True):
    cmd = [str(a) for a in args]
    exe = str((cwd / cmd[0]).resolve()) if ("/" in cmd[0] or "\\" in cmd[0]) else None
    result = subprocess.run(cmd, executable=exe, cwd=cwd, capture_output=True, timeout=300)
    text = (result.stdout + result.stderr).decode("utf-8", errors="replace").replace("\r\n", "\n")
    if record:
        LOG.append("$ " + " ".join(cmd))
        if text.strip():
            LOG.append(ADDR.sub("<address>", text.rstrip()))
        LOG.append(f"exit={result.returncode}")
    if result.returncode != expected:
        raise RuntimeError(f"{cmd[0]} failed with {result.returncode}:\n{text}")
    return text


def build_old(version):
    """4.0.1 and 5.0.3 keep core and lib in src/ and src/lib, luac in src/luac."""
    folder = BUILD / version
    folder.mkdir(parents=True, exist_ok=True)
    root = SRC / f"lua-{version}"
    core = sorted(p for p in (root / "src").glob("l*.c") if p.name not in ("ltests.c",))
    flags = ["-std=gnu89", "-O2", "-w", "-I", rel(root / "include", folder), "-I", rel(root / "src", folder)]
    run(["gcc", *flags, "-c", *(rel(p, folder) for p in core)], folder)
    run(["ar", "rcs", "libcore.a", *(p.stem + ".o" for p in core)], folder)
    luac = sorted((root / "src" / "luac").glob("*.c"))
    extra = []
    if version == "5.0.3":
        # src/luac/Makefile: lopcodes.c again with -DLUA_OPNAMES, plus lauxlib from src/lib
        run(["gcc", *flags, "-DLUA_OPNAMES", "-c", rel(root / "src" / "lopcodes.c", folder),
             "-o", "lopcodes_names.o"], folder)
        extra = ["lopcodes_names.o", rel(root / "src" / "lib" / "lauxlib.c", folder)]
    run(["gcc", *flags, "-I", rel(root / "src" / "luac", folder), *(rel(p, folder) for p in luac),
         *extra, "libcore.a", "-lm", "-o", "luac.exe"], folder)


def main():
    for v in ("5.5.1", "5.4.9", "5.1.5"):
        if not (BUILD / v / "luac.exe").exists():
            raise SystemExit(f"missing build/research/{v}; run 07_build_and_run.py first")
    LOG.append("Production probes, 2026-11-15; same Windows x64 / MinGW GCC environment as 07.")
    LOG.append("Old compilers built only to list bytecode; their interpreters were not run.")
    for v in ("4.0.1", "5.0.3"):
        build_old(v)
    b55 = BUILD / "5.5.1"
    run(["gcc", "-std=gnu99", "-O2", "-Wall", "-DLUA_USE_APICHECK", "-I", rel(SRC / "lua-5.5.1" / "src", b55),
         rel(LAB / "11_internals.c", b55), "liblua.a", "-lm", "-o", "internals.exe"], b55)
    LOG.append("\n[11_internals.c on 5.5.1; cwd=research/lab]")
    run([rel(b55 / "internals.exe", LAB)], LAB)
    LOG.append("\n[12_probes.lua on 5.5.1; cwd=research/lab]")
    run([rel(b55 / "lua.exe", LAB), "12_probes.lua"], LAB)
    LOG.append("\n[13_language.lua on 5.5.1: language-level behaviour; cwd=research/lab]")
    run([rel(b55 / "lua.exe", LAB), "13_language.lua"], LAB)
    LOG.append("\n[same snippet, every compiler; cwd=research/lab]")
    for v in ("4.0.1", "5.0.3", "5.1.5", "5.2.4", "5.3.6", "5.4.9", "5.5.1"):
        luac = rel(BUILD / v / "luac.exe", LAB)
        run([luac, "-l", "-p", "snippets/add.lua"], LAB)
    LOG.append("\n[constant folding and immediate operands, 5.5.1]")
    run([rel(b55 / "luac.exe", LAB), "-l", "-p", "snippets/fold.lua"], LAB)
    OUT.write_text("\n".join(LOG) + "\n", encoding="utf-8", newline="\n")
    print(f"wrote {OUT.name}")


if __name__ == "__main__":
    main()
