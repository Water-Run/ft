"""Build verified Lua sources and save observations on Windows x64 / MinGW.

Requires Python 3.12+, gcc and ar on PATH; no downloads, package installation,
network Lua modules or changes to third-party sources. Run 00 then 01 first.
Artifacts go only in this video's ignored build/. Logs use relative paths.
The luac listings alone replace pointer addresses with <address>; raw bytes
and their SHA-256 are retained under ignored _src/ and logged for provenance.
"""

import base64
import hashlib
import json
import os
import platform
import re
import subprocess
import sys
from pathlib import Path

LAB = Path(__file__).resolve().parent
VIDEO = LAB.parent.parent
SRC = LAB.parent / "_src"
BUILD = VIDEO / "build" / "research"
VERSIONS = ("5.5.1", "5.4.9", "5.3.6", "5.2.4", "5.1.5")
LOG = []
CAPTURES = []


def relative(path, cwd):
    return os.path.relpath(path, cwd).replace("\\", "/")


def executable_path(cmd, cwd):
    # On Windows, cwd is not used to resolve a relative executable by CreateProcess.
    # Keep argv[0] relative so Lua's own error prefix does not expose a local path.
    if "/" in cmd[0] or "\\" in cmd[0]:
        return str((cwd / cmd[0]).resolve())
    return None


def execute(args, cwd, expected=0):
    cmd = [str(a) for a in args]
    LOG.append("$ " + " ".join(cmd))
    result = subprocess.run(cmd, executable=executable_path(cmd, cwd), cwd=cwd, capture_output=True, timeout=180)
    CAPTURES.append({"argv": cmd, "cwd_from_video": relative(cwd, VIDEO),
                     "exit": result.returncode,
                     "stdout_base64": base64.b64encode(result.stdout).decode("ascii"),
                     "stderr_base64": base64.b64encode(result.stderr).decode("ascii")})
    for stream in (result.stdout, result.stderr):
        if stream:
            LOG.append(stream.decode("utf-8", errors="replace").rstrip())
    LOG.append(f"exit={result.returncode}")
    if result.returncode != expected:
        raise RuntimeError(f"Command failed: {cmd[0]}; see out_07_build_and_run.txt")
    return result.stdout


def build(version):
    folder = BUILD / version
    folder.mkdir(parents=True, exist_ok=True)
    source = SRC / f"lua-{version}" / "src"
    make = (source / "Makefile").read_text().replace("\\\n", " ")
    names = []
    for group in ("CORE", "LIB"):
        value = re.search(rf"^{group}_O=\s*(.*)$", make, re.M).group(1)
        names.extend(part.removesuffix(".o") for part in value.split())
    flags = ["-std=gnu99", "-O2", "-DLUA_USE_APICHECK"]
    objects = [folder / f"{name}.o" for name in names]
    # Always recompile: flags and source changes cannot silently reuse objects.
    execute(["gcc", *flags, "-I", relative(source, folder), "-c",
             *(relative(source / f"{name}.c", folder) for name in names)], folder)
    execute(["ar", "rcs", "liblua.a", *(p.name for p in objects)], folder)
    for program in ("lua", "luac"):
        program_objects = re.search(rf"^{program.upper()}_O=\s*(.*)$", make, re.M).group(1).split()
        execute(["gcc", *flags, "-I", relative(source, folder),
                 *(relative(source / (name.removesuffix(".o") + ".c"), folder) for name in program_objects),
                 "liblua.a", "-lm", "-o", f"{program}.exe"], folder)
    if version in ("5.5.1", "5.4.9"):
        execute(["gcc", *flags, "-I", relative(source, folder), relative(LAB / "06_c_api.c", folder),
                 "liblua.a", "-lm", "-o", "c_api.exe"], folder)
    return folder


def normalize_listing(raw):
    # POSIX prints 0x-prefixed pointers; MinGW may print bare hexadecimal.
    # Match bare addresses only in luac's pointer contexts, not instruction operands.
    raw = re.sub(rb"0x[0-9a-fA-F]+", b"<address>", raw)
    return re.sub(rb"(?<=at )[0-9a-fA-F]{8,}|(?<=for )[0-9a-fA-F]{8,}|(?<=; )[0-9a-fA-F]{8,}(?=\r?$)",
                  b"<address>", raw, flags=re.M)


def listing(version, file):
    exe = BUILD / version / "luac.exe"
    command = [relative(exe, LAB), "-l", "-l", "-p", file]
    raw = subprocess.run(command, executable=executable_path(command, LAB), cwd=LAB, capture_output=True, timeout=30)
    if raw.returncode:
        raise RuntimeError(raw.stderr.decode())
    raw_file = SRC / f"listing-{version}-{file}.txt"
    raw_file.write_bytes(raw.stdout)
    normalized = normalize_listing(raw.stdout)
    (LAB / f"out_{file.removesuffix('.lua')}_{version}_bytecode.txt").write_bytes(normalized)
    LOG.extend(["$ " + " ".join(command),
                f"listing_raw_sha256={hashlib.sha256(raw.stdout).hexdigest()}",
                "Only pointer addresses normalized to <address>; instruction bytes/operands not changed.", "exit=0"])


def main():
    assert platform.system() == "Windows", "This build recipe is specifically for MinGW on Windows"
    manifest = json.loads((LAB / "out_00_sources.json").read_text())
    for release in manifest["releases"]:
        archive = SRC / f"lua-{release['version']}.tar.gz"
        assert hashlib.sha256(archive.read_bytes()).hexdigest() == release["sha256"]
    LOG.extend(["Observed on 2026-11-15; existing Windows environment, not a clean VM/container.",
                f"OS={platform.system()} {platform.release()} machine={platform.machine()}",
                f"Python={sys.version.split()[0]}",
                "Flags=-std=gnu99 -O2 -DLUA_USE_APICHECK; Windows detected by upstream luaconf.h; default numeric configuration.",
                "All commands below run in their version's build/research/<version>/ unless a probe is listed."])
    execute(["gcc", "--version"], LAB)
    folders = {version: build(version) for version in VERSIONS}
    for version, folder in folders.items():
        LOG.append(f"\n[PROBES {version}; cwd=research/lab]")
        lua = relative(folder / "lua.exe", LAB)
        execute([lua, "-v"], LAB)
        execute([lua, "02_counter.lua"], LAB)
        execute([lua, "05_versions.lua"], LAB)
        if version in ("5.5.1", "5.4.9"):
            execute([lua, "03_runtime.lua"], LAB)
            execute([relative(folder / "c_api.exe", LAB)], LAB)
        if version == "5.5.1":
            execute([lua, "04_lua55.lua"], LAB)
            execute([lua, "08_known_bugs.lua"], LAB)
            listing(version, "02_counter.lua")
            listing(version, "04_lua55.lua")
        if version == "5.4.9":
            listing(version, "02_counter.lua")
    # Genuine cross-version binary rejection, not a fabricated header.
    LOG.append("\n[CROSS-VERSION CHUNK; cwd=research/lab]")
    chunk = BUILD / "5.4.9" / "counter.luac"
    execute([relative(folders["5.4.9"] / "luac.exe", LAB), "-o", relative(chunk, LAB), "02_counter.lua"], LAB)
    execute([relative(folders["5.5.1"] / "lua.exe", LAB), relative(chunk, LAB)], LAB, expected=1)
    LOG.append("\nAll probe assertions passed; this is not the upstream Lua test suite or video acceptance.")


if __name__ == "__main__":
    try:
        main()
    finally:
        data = ("\n".join(LOG) + "\n").encode("utf-8")
        (LAB / "out_07_build_and_run.txt").write_bytes(data)
        (LAB / "out_07_processes.json").write_text(
            json.dumps({"description": "Exact subprocess streams encoded as base64; no newline conversion. luac listing raw hashes are in out_07_build_and_run.txt.",
                        "processes": CAPTURES}, indent=2) + "\n", encoding="utf-8", newline="\n")
        print(data.decode("utf-8"))
