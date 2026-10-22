"""Extract the October 2026 DB-Engines relational DBMS ranking rows for MySQL, PostgreSQL and Firebird.

策划者 2026-10-21 要求开场用“有 Firebird 的最新占比数据，不止 Stack Overflow”。DB-Engines 是按月
发布、同一口径同时覆盖三者的来源；其得分是相对流行度（方法页：两倍分数即两倍流行，不测装机量与使用量），
不是市场份额。Downloaded HTML stays in research/_src/ (ignored); only derived values and hashes are kept.
"""
import hashlib
import html
import json
from pathlib import Path
import re
import urllib.request

VIDEO = Path(__file__).resolve().parents[2]
URL = "https://db-engines.com/en/ranking/relational+dbms"
DEF_URL = "https://db-engines.com/en/ranking_definition"
UA = {"User-Agent": "Mozilla/5.0"}


def fetch(url, name):
    path = VIDEO / "research/_src/web" / name
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())
    return path.read_bytes()


def flat(raw):
    text = html.unescape(re.sub(r"<[^>]+>", "|", raw.decode("utf-8", "replace")))
    return re.sub(r"\s+", " ", re.sub(r"\|+", "|", text))


def main():
    raw = fetch(URL, "dbengines-relational.html")
    page = flat(raw)
    month = re.search(r"(January|February|March|April|May|June|July|August|September|October|November|December) (20\d\d)", page)
    assert month.group(0) == "October 2026"
    rows = []
    for name in ("MySQL", "PostgreSQL", "Firebird"):
        m = re.search(r"\|(\d+)\.\|\s?(\d+)\.\|\s?(\d+)\.\|" + re.escape(name) + r"\|Relational\|(?:[^|]*\|)*?([\d.]+)\|([+-][\d.]+)\|([+-][\d.]+)\|", page)
        assert m, name
        rows.append({"database": name, "rank": int(m.group(1)), "rank_prev_month": int(m.group(2)), "rank_prev_year": int(m.group(3)),
                     "score": float(m.group(4)), "change_month": float(m.group(5)), "change_year": float(m.group(6))})
    by = {r["database"]: r for r in rows}
    assert (by["MySQL"]["rank"], by["MySQL"]["score"]) == (2, 837.96)
    assert (by["PostgreSQL"]["rank"], by["PostgreSQL"]["score"]) == (4, 688.75)
    assert (by["Firebird"]["rank"], by["Firebird"]["score"]) == (21, 18.36)
    count = int(re.search(r"(\d+) systems in ranking", page).group(1))
    definition = fetch(DEF_URL, "dbengines-definition.html")
    dtext = flat(definition)
    quote = "when system A has twice as large a value in the DB-Engines Ranking as system B, then it is twice as popular"
    assert quote in dtext and "does not measure the number of installations" in dtext
    result = {"source": "DB-Engines Ranking of relational DBMS", "url": URL, "month": month.group(0), "systems_in_ranking": count,
              "rows": rows, "measure": "popularity score (relative); not installations or market share",
              "method_url": DEF_URL, "method_quote": quote,
              "ratio_mysql_to_firebird": round(by["MySQL"]["score"] / by["Firebird"]["score"], 1),
              "ratio_postgresql_to_firebird": round(by["PostgreSQL"]["score"] / by["Firebird"]["score"], 1),
              "html_sha256": hashlib.sha256(raw).hexdigest(), "definition_sha256": hashlib.sha256(definition).hexdigest(),
              "caption": f"DB-Engines 关系数据库流行度排名｜2026 年 10 月｜共 {count} 个系统｜得分为相对值，不是装机量或市场份额"}
    target = VIDEO / "research/lab"
    (target / "out_19_dbengines_2026.json").write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    report = result["caption"] + "\n" + "\n".join(f"#{r['rank']} {r['database']}: {r['score']}" for r in rows) + "\n"
    (target / "out_19_dbengines_2026.txt").write_text(report, encoding="utf-8")
    print(json.dumps(result, ensure_ascii=True)[:600])


if __name__ == "__main__":
    main()
