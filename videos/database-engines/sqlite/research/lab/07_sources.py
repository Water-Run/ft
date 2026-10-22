"""Versioned source anchors for the measured mechanisms; no third-party code copied into Git."""
import re
from lab_common import SOURCE, finish, sha256

ANCHORS = {
    "src/btree.c": [r"^int sqlite3BtreeTableMoveto\(", r"^int sqlite3BtreeIndexMoveto\(",
                    r"^static int balance_quick\(", r"^static int balance_nonroot\(", r"^static int balance_deeper\("],
    "src/pager.c": [r"^static int pager_playback\(.*\)\{", r"^int sqlite3PagerGet\(",
                    r"^int sqlite3PagerWrite\(", r"^int sqlite3PagerCommitPhaseOne\("],
    "src/wal.c": [r"^static int walTryBeginRead\(", r"^int sqlite3WalFindFrame\(",
                  r"^int sqlite3WalReadFrame\(", r"^int sqlite3WalFrames\(", r"^int sqlite3WalCheckpoint\("],
    "src/vdbe.c": [r"^case OP_SeekGE:", r"^case OP_SeekRowid:", r"^case OP_DeferredSeek:"],
    "src/os_win.c": [r"^static int winRead\("],
}


def main():
    sources = []
    for name, patterns in ANCHORS.items():
        path = SOURCE / "sqlite-source" / name
        lines = path.read_text(encoding="utf-8").splitlines()
        anchors = []
        for pattern in patterns:
            matches = [i + 1 for i, line in enumerate(lines) if re.search(pattern, line)]
            assert len(matches) == 1, (name, pattern, matches)
            anchors.append({"pattern": pattern, "line": matches[0]})
        sources.append({"file": name, "sha256": sha256(path.read_bytes()), "anchors": anchors})
    finish("07_sources", {"summary": {"source_files": len(sources), "anchors": sum(len(s["anchors"]) for s in sources)},
                          "source_manifest": (SOURCE / "sqlite-source/manifest.uuid").read_text().strip(),
                          "sources": sources,
                          "limits": "Anchors locate implementation entry points; behavioural claims also require experiments and context."})


if __name__ == "__main__":
    main()
