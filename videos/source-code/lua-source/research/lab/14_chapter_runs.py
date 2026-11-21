"""Chapter programs for the Lua source film, draft 4 (added 2026-11-21).

The planner asked for a fitting program in each chapter instead of one program
carried through the whole film. Each file in chapters/ is run on the 5.5.1
build from 07_build_and_run.py; a few are also run on older builds where the
script compares versions. Output goes to out_14_chapter_runs.txt with relative
paths; pointer values are replaced by <address>.
"""

import re
import subprocess
from pathlib import Path

LAB = Path(__file__).resolve().parent
VIDEO = LAB.parent.parent
BUILD = VIDEO / "build" / "research"
OUT = LAB / "out_14_chapter_runs.txt"
ADDR = re.compile(r"\b(?:0x)?[0-9A-Fa-f]{12,16}\b")
LOG = []

# (program, versions to run it on, also list bytecode with luac 5.5.1)
PROGRAMS = [
    ("c04_value.lua", ["5.5.1"], False),
    ("c05_lex.lua", ["5.5.1"], False),
    ("c06_compile.lua", [], True),
    ("c08_vm.lua", ["5.3.6", "5.4.9", "5.5.1"], False),
    ("c09_call.lua", ["5.5.1"], False),
    ("c10_closure.lua", ["5.5.1"], True),
    ("c11_table.lua", ["5.4.9", "5.5.1"], False),
    ("c12_meta.lua", ["5.5.1"], False),
    ("c13_error.lua", ["5.5.1"], False),
    ("c14_coro.lua", ["5.5.1"], False),
    ("c15_gc.lua", ["5.5.1"], False),
]


def run(exe, args):
    cmd = [str(exe.relative_to(LAB.parent.parent)).replace("\\", "/")] + args
    result = subprocess.run([str(exe)] + args, cwd=LAB, capture_output=True, timeout=600)
    text = (result.stdout + result.stderr).decode("utf-8", errors="replace").replace("\r\n", "\n")
    LOG.append("$ " + " ".join(["<build>/" + exe.parent.name + "/" + exe.name] + args))
    if text.strip():
        LOG.append(ADDR.sub("<address>", text.rstrip()))
    LOG.append(f"exit={result.returncode}")
    return result.returncode


def main():
    for v in ("5.3.6", "5.4.9", "5.5.1"):
        if not (BUILD / v / "lua.exe").exists():
            raise SystemExit(f"missing build/research/{v}; run 07_build_and_run.py first")
    LOG.append("Chapter programs, 2026-11-21; same Windows x64 / MinGW GCC builds as 07 (<build> = video build/research).")
    for name, versions, listing in PROGRAMS:
        LOG.append(f"\n[{name}]")
        for v in versions:
            code = run(BUILD / v / "lua.exe", ["chapters/" + name])
            if code != 0:
                raise SystemExit(f"{name} failed on {v}")
        if listing:
            run(BUILD / "5.5.1" / "luac.exe", ["-l", "-p", "chapters/" + name])
    OUT.write_text("\n".join(LOG) + "\n", encoding="utf-8", newline="\n")
    print(f"wrote {OUT.name}")


if __name__ == "__main__":
    main()
