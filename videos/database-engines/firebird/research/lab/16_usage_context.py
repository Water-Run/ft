"""Extract the 2024 all-respondent database chart from its official HTML.

Keeps downloaded third-party HTML in research/_src/; records derived values
and a hash only. The question is multi-select usage, not global market share.
2024 is selected because it lists all three databases as survey choices.
"""
import hashlib
import html
import json
from pathlib import Path
import re
import urllib.request

VIDEO = Path(__file__).resolve().parents[2]
URL = "https://survey.stackoverflow.co/2024/technology/"


def clean(text):
    return html.unescape(re.sub(r"<[^>]+>", "", text)).strip()


def main():
    source = VIDEO / "research/_src/web/survey-2024-technology.html"
    if not source.exists():
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_bytes(urllib.request.urlopen(URL, timeout=40).read())
    raw = source.read_bytes()
    text = raw.decode("utf-8")
    first = text.index('id="firebird-')
    start, end = text.rfind("<svg", 0, first), text.index("</svg>", first)
    assert "All Respondents" in text[start - 2000:start]
    entries = re.findall(r'<g id="[^"]+"><g role="listitem".*?<text aria-label="Response"[^>]*>(.*?)</text><text aria-label="Unit"[^>]*>(.*?)</text>', text[start:end], re.S)
    values = {clean(name): float(clean(percent).rstrip("%")) for name, percent in entries}
    rows = [{"database": name, "percent": values[name]} for name in ("PostgreSQL", "MySQL", "Firebird")]
    assert [row["percent"] for row in rows] == [48.7, 40.3, 1.1]
    footer = clean(text[end:end + 30000])
    respondents = int(re.search(r"Responses:\s*([\d,]+)", footer).group(1).replace(",", ""))
    assert respondents == 52418
    result = {"year": 2024, "source": "Stack Overflow Developer Survey", "url": URL,
              "population": "All Respondents", "question_respondents": respondents,
              "measure": "Extensive development work over the past year; multiple selections allowed",
              "rows": rows, "html_sha256": hashlib.sha256(raw).hexdigest(),
              "caption": "2024 Stack Overflow 开发者调查｜数据库使用率｜全部答题者｜多选｜n=52,418",
              "licence": {"name": "ODbL 1.0", "holder": "Stack Exchange Inc.", "url": "https://opendatacommons.org/licenses/odbl/1-0/"},
              "not_global_market_share": True,
              "selection_reason": "2025 lists Firebird only among write-ins; 2026 does not list Firebird separately; no missing value is treated as zero"}
    target = VIDEO / "research/lab"
    (target / "out_16_usage_context.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    report = result["caption"] + "\n" + "\n".join(f"{row['database']}: {row['percent']:.1f}%" for row in rows) + "\n"
    (target / "out_16_usage_context.txt").write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
