# IANA IPv4 地址空间登记表：256 个 /8 块各自的用途与分配年月，给结尾的「总地址池见底」画面用。
# 原始 CSV 不入库：缺少时从 IANA 下载到 research/_src/（2026-11-01 取得的版本共 256 行数据）。
# 用法：python research/lab/20_iana_pool.py > research/lab/out_20_iana_pool.txt
import csv
import sys
import urllib.request
from collections import Counter
from pathlib import Path

URL = "https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.csv"
SRC = Path(__file__).resolve().parents[1] / "_src" / "ipv4-address-space.csv"

if not SRC.exists():
    SRC.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(URL, SRC)

rows = list(csv.DictReader(SRC.open(encoding="utf-8")))
assert len(rows) == 256, len(rows)


def kind(row):
    # L：2011 年 2 月 IANA 分出的最后五块；R：IANA 保留或特殊用途（本网络、私有、环回、组播、将来使用）；A：其余已分配
    if row["Date"].startswith("2011-02"):
        return "L"
    if row["Status [1]"].startswith("RESERVED") or row["Designation"].startswith(("IANA", "Multicast", "Future")):
        return "R"
    return "A"


kinds = "".join(kind(r) for r in rows)
print(f"python={sys.version.split()[0]}")
print(f"source={URL}")
print(f"blocks={len(rows)}")
print(f"kinds_count={dict(Counter(kinds))}")
print(f"kinds={kinds}")
print("last_five=" + "; ".join(f"{r['Prefix']} {r['Designation']} {r['Date']}" for r in rows if kind(r) == "L"))
print("reserved=" + "; ".join(f"{r['Prefix']} {r['Designation']}" for r in rows if kind(r) == "R" and not r["Designation"].startswith(("Multicast", "Future"))))
years = Counter(r["Date"][:4] for r in rows if kind(r) != "R" and r["Date"])
print("allocated_by_year=" + ", ".join(f"{y}:{n}" for y, n in sorted(years.items())))
assert Counter(kinds)["L"] == 5
assert {r["Designation"] for r in rows if kind(r) == "L"} == {"AFRINIC", "APNIC", "ARIN", "LACNIC", "RIPE NCC"}
