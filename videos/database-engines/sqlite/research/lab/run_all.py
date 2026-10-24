"""Replay all measurements using the pinned shell. No pre-existing outputs are deleted.

Requires Python 3.10+ and network for the first pinned Windows x64 bootstrap.
Databases are created in new ignored out/lab/NN-XXX directories on each run.
Public JSON/text evidence is regenerated; WAL/journal random salts may change.
"""
from pathlib import Path
import subprocess
import sys

STEPS = ["01_environment", "02_structure", "03_queries", "04_reuse", "05_wal", "06_crash", "07_sources", "08_trace"]


if __name__ == "__main__":
    for name in STEPS:
        subprocess.run([sys.executable, str(Path(__file__).with_name(name + ".py"))], check=True)
