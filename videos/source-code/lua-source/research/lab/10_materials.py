"""Fetch the visual materials of the object (Lua logo program, lua.org styles).

Added by the production side, 2026-11-15. Originals go to the ignored
research/_src/materials/; this script writes out_10_materials.json with URLs,
sizes and SHA-256. tools/gen_logo.py renders the logo from the PostScript
program fetched here.
"""

import hashlib
import json
import time
import urllib.request
from pathlib import Path

LAB = Path(__file__).resolve().parent
DEST = LAB.parent / "_src" / "materials"
ITEMS = [
    ("logo-page", "https://www.lua.org/images/"),
    ("logo-nolabel-ps", "https://www.lua.org/images/lua-logo-nolabel.ps"),
    ("logo-gif-128", "https://www.lua.org/images/lua-logo.gif"),
    ("site-css", "https://www.lua.org/lua.css"),
    ("manual-css", "https://www.lua.org/manual/manual.css"),
    ("about-page", "https://www.lua.org/about.html"),
    ("home-page", "https://www.lua.org/home.html"),
    # Helvetica metric clone used to set the word "Lua" of the logo program
    ("font-texgyreheros", "https://mirrors.ctan.org/fonts/tex-gyre/opentype/texgyreheros-regular.otf"),
    ("font-license", "https://mirrors.ctan.org/fonts/tex-gyre/doc/GUST-FONT-LICENSE.txt"),
]
NAMES = {
    "logo-page": "lua-images.html", "logo-nolabel-ps": "lua-logo-nolabel.ps",
    "logo-gif-128": "lua-logo.gif", "site-css": "lua.css", "manual-css": "manual.css",
    "about-page": "about.html", "home-page": "home.html",
    "font-texgyreheros": "texgyreheros-regular.otf", "font-license": "GUST-FONT-LICENSE.txt",
}


def fetch(url):
    last = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "ft-research/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as error:  # TLS handshakes to lua.org fail intermittently
            last = error
            time.sleep(2 + attempt)
    raise last


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    record = {"checked_on": "2026-11-15", "items": []}
    for key, url in ITEMS:
        data = fetch(url)
        (DEST / NAMES[key]).write_bytes(data)
        record["items"].append({"id": key, "url": url, "file": "_src/materials/" + NAMES[key],
                                "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
        print(key, len(data))
    (LAB / "out_10_materials.json").write_text(json.dumps(record, indent=1) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
