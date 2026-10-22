"""Extract the 2026 all-respondent database usage from the official survey data page.

策划者 2026-10-21 要求开场占比改用 2026 年最新数据。Keeps the downloaded HTML in
research/_src/ (ignored) and records derived values plus a hash only. The 2026
question lists 31 options; Firebird is not one of them, so it gets no percentage.
"""
import hashlib
import json
from pathlib import Path
import re
import urllib.request

VIDEO = Path(__file__).resolve().parents[2]
URL = "https://survey.stackoverflow.co/2026/technology/data/databases"


def main():
    source = VIDEO / "research/_src/web/survey-2026-databases.html"
    if not source.exists():
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_bytes(urllib.request.urlopen(URL, timeout=60).read())
    raw = source.read_bytes()
    text = raw.decode("utf-8")
    items = re.findall(r'"propertyID":"Databases","name":"([^"]+)","value":([\d.]+),"unitText":"PERCENT",'
                       r'"description":"([\d,]+) of ([\d,]+) respondents \(All Respondents\)"', text)
    options = [{"database": n, "percent": float(v), "respondents": int(c.replace(",", ""))} for n, v, c, _ in items]
    totals = {int(t.replace(",", "")) for *_, t in items}
    assert len(options) == 31 and totals == {12061}
    by = {o["database"]: o for o in options}
    assert by["PostgreSQL"]["percent"] == 57.9 and by["MySQL"]["percent"] == 35.1
    listed = any("firebird" in o["database"].lower() for o in options)
    assert not listed
    result = {"year": 2026, "source": "Stack Overflow Developer Survey", "url": URL,
              "population": "All Respondents", "question_respondents": 12061,
              "measure": "Extensive development work over the past year; multiple selections allowed",
              "rows": [{"database": "PostgreSQL", "percent": by["PostgreSQL"]["percent"]},
                       {"database": "MySQL", "percent": by["MySQL"]["percent"]},
                       {"database": "Firebird", "percent": None, "listed": False}],
              "option_count": len(options), "smallest_listed": min(options, key=lambda o: o["percent"]),
              "options": [o["database"] for o in options], "html_sha256": hashlib.sha256(raw).hexdigest(),
              "caption": "2026 Stack Overflow 开发者调查｜数据库使用率｜全部答题者｜多选｜n=12,061",
              "licence": {"name": "ODbL 1.0", "holder": "Stack Exchange Inc.", "url": "https://opendatacommons.org/licenses/odbl/1-0/"},
              "not_global_market_share": True}
    target = VIDEO / "research/lab"
    (target / "out_18_usage_2026.json").write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    report = (result["caption"] + "\nPostgreSQL: 57.9%\nMySQL: 35.1%\nFirebird: 未列入 31 个选项（最少的选项 "
              f"{result['smallest_listed']['database']} {result['smallest_listed']['percent']}%）\n")
    (target / "out_18_usage_2026.txt").write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
