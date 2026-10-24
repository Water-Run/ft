"""Replay all MyISAM measurements on the pinned MySQL 9.7.4 LTS. No existing outputs are deleted.

Requires Windows x64, Python 3.10+, and network for the first download (official ZIP checked by MD5).
Source files for 08 come from the mysql-9.7.4 tag (raw.githubusercontent.com) into the ignored research/_src/.
Every run uses new ignored out/lab/NN-XXX directories; the crash split point (07) varies between runs.
"""
from pathlib import Path
import subprocess
import sys

STEPS = ["01_environment", "02_structure", "03_queries", "04_update_delete", "05_locks", "06_no_transaction",
         "07_crash", "08_sources"]

if __name__ == "__main__":
    for name in STEPS:
        subprocess.run([sys.executable, str(Path(__file__).with_name(name + ".py"))], check=True)
