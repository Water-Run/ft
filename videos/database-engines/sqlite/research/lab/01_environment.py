"""Fetch pinned SQLite 3.54.1 tools/source into ignored research/_src/.

SHA3-256 values were read from https://www.sqlite.org/download.html on 2026-10-22.
Only Windows x64 tools are bootstrapped; other systems may set FT_SQLITE explicitly.
Third-party archives and extracted code are not committed.
"""
import hashlib
import platform
import sys
import urllib.request
import zipfile
from lab_common import SOURCE, VERSION, Cli, executable, finish, sha256

PRODUCTS = {
    "sqlite-tools-win-x64-3540100.zip": "e171f3993a992edf076746926dd52b5e2ebfabaee38818e74987e1d8112ab987",
    "sqlite-src-3540100.zip": "877c6f4996ce7adb368686bce21638de9e3d91534832ad3d9d119037d1bc22ad",
}
FILES = ["src/btree.c", "src/btreeInt.h", "src/pager.c", "src/wal.c", "src/vdbe.c", "src/os_win.c", "VERSION", "manifest.uuid"]


def main():
    SOURCE.mkdir(parents=True, exist_ok=True)
    archives = []
    for name, expected in PRODUCTS.items():
        target = SOURCE / name
        url = "https://www.sqlite.org/2026/" + name
        if not target.exists():
            with urllib.request.urlopen(url, timeout=60) as response:
                target.write_bytes(response.read())
        blob = target.read_bytes()
        actual = hashlib.sha3_256(blob).hexdigest()
        assert actual == expected, f"Archive checksum mismatch: {name}"
        archives.append({"name": name, "url": url, "bytes": len(blob), "sha256": sha256(blob), "sha3_256": actual})
        with zipfile.ZipFile(target) as archive:
            if "tools" in name:
                member = next(n for n in archive.namelist() if n.endswith("sqlite3.exe"))
                output = SOURCE / "sqlite-tools/sqlite3.exe"
                output.parent.mkdir(exist_ok=True)
                output.write_bytes(archive.read(member))
            else:
                for relative in FILES:
                    member = next(n for n in archive.namelist() if n.endswith("/" + relative))
                    output = SOURCE / "sqlite-source" / relative
                    output.parent.mkdir(parents=True, exist_ok=True)
                    output.write_bytes(archive.read(member))
    with Cli(":memory:", "environment") as c:
        version = c.scalar("SELECT sqlite_version();")
        source_id = c.scalar("SELECT sqlite_source_id();")
        assert version == VERSION
        assert c.scalar("SELECT count(*) FROM dbstat;") == 0
        options = [r["compile_options"] for r in c.q("PRAGMA compile_options;")]
        page_size = c.scalar("PRAGMA page_size;")
    manifest = (SOURCE / "sqlite-source/manifest.uuid").read_text().strip()
    assert manifest == source_id.split()[-1], "Binary and source tree must be the same check-in"
    assert (SOURCE / "sqlite-source/VERSION").read_text().strip() == VERSION
    data = {"summary": {"sqlite": version, "python_runner": sys.version.split()[0], "platform": platform.system(), "default_page_size": page_size},
            "source_id": source_id, "source_manifest": manifest, "executable_sha256": sha256(executable().read_bytes()),
            "archives": archives, "compile_options": options,
            "source_files": [{"file": f, "sha256": sha256((SOURCE / "sqlite-source" / f).read_bytes())} for f in FILES],
            "scope": "All SQL uses this shell, not Python's bundled SQLite; no personal paths recorded."}
    finish("01_environment", data)


if __name__ == "__main__":
    main()
