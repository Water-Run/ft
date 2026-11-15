"""Fetch pinned official Lua releases; third-party files stay in ignored _src.

Run from the repository root:
  python videos/source-code/lua-source/research/lab/00_fetch_sources.py
Python 3.12+; standard library only. No checkout or existing source is modified.
"""

import hashlib
import json
import tarfile
import urllib.request
from pathlib import Path

LAB = Path(__file__).resolve().parent
SRC = LAB.parent / "_src"
RELEASES = {
    "5.5.1": "1c4b4068d67061f2a2231ad2b5422e77acea1487ea9890f6320af614f4373dce",
    "5.4.9": "2335b6c582a52654f94612bf10d2f4672805d05329aa6568b1d8cd9e5c6fb8e6",
    "5.3.6": "fc5fd69bb8736323f026672b1b7235da613d7177e72558893a0bdcd320466d60",
    "5.2.4": "b9e2e4aad6789b3b63a056d442f7b39f0ecfca3ae0f1fc0ae4e9614401b69f4b",
    "5.1.5": "2640fc56a795f29d28ef15e13c34a47e223960b0240e8cb0a82d9b0738695333",
    "5.0.3": "1193a61b0e08acaa6eee0eecf29709179ee49c71baebc59b682a25c3b5a45671",
    "4.0.1": "df746e149cf6939e90009d2e540eee918d585b4d1bc6d68b19316a050d484d2a",
}
PAGES = {
    "download.html": "https://www.lua.org/download.html",
    "ftp.html": "https://www.lua.org/ftp/",
    "versions.html": "https://www.lua.org/versions.html",
    "bugs.html": "https://www.lua.org/bugs.html",
    "source-5.5.html": "https://www.lua.org/source/5.5/",
    "manual-5.5.html": "https://www.lua.org/manual/5.5/manual.html",
    "manual-5.4.html": "https://www.lua.org/manual/5.4/manual.html",
    "manual-5.3.html": "https://www.lua.org/manual/5.3/manual.html",
    "manual-5.2.html": "https://www.lua.org/manual/5.2/manual.html",
    "manual-5.1.html": "https://www.lua.org/manual/5.1/manual.html",
    "manual-5.0.html": "https://www.lua.org/manual/5.0/manual.html",
}


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Lua-source-research/1.0"})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def main():
    SRC.mkdir(parents=True, exist_ok=True)
    manifest = {"checked_on": "2026-11-15", "releases": [], "pages": []}
    for version, expected in RELEASES.items():
        name = f"lua-{version}.tar.gz"
        url = f"https://www.lua.org/ftp/{name}"
        archive = SRC / name
        if not archive.exists():
            archive.write_bytes(fetch(url))
        data = archive.read_bytes()
        actual = hashlib.sha256(data).hexdigest()
        if actual != expected:
            raise RuntimeError(f"Checksum mismatch: {name}; no extraction performed")
        target = SRC / f"lua-{version}"
        if not target.exists():
            with tarfile.open(archive) as package:
                package.extractall(SRC, filter="data")
        # Older packages use lua/ as the root. Rename only the newly extracted root.
        if not target.exists() and (SRC / "lua").exists():
            (SRC / "lua").rename(target)
        assert target.exists(), f"Unexpected archive root for {version}"
        manifest["releases"].append({
            "version": version, "url": url, "bytes": len(data), "sha256": actual,
            "official_checksum_url": "https://www.lua.org/ftp/",
            "checksum_matches": True,
        })
        print(f"{version}: {len(data)} bytes; sha256={actual}; verified")
    pages = SRC / "pages"
    pages.mkdir(exist_ok=True)
    for name, url in PAGES.items():
        data = fetch(url)
        (pages / name).write_bytes(data)
        manifest["pages"].append({
            "file": name, "url": url, "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
        })
        print(f"page: {name}; {len(data)} bytes")
    output = json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"
    (LAB / "out_00_sources.json").write_text(output, encoding="utf-8", newline="\n")
    print("Saved lab/out_00_sources.json; third-party material remains in _src/")


if __name__ == "__main__":
    main()
