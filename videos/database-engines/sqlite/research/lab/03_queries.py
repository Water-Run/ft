"""Actual query results and shell statement counters, distinct from reconstructed routes.

Cache misses are SQLite page-cache misses, not an OS/device I/O trace. A fresh
shell connection is used for each scenario; two successive runs show cache reuse.
"""
import json
import re
from lab_common import Cli, current_base, finish


def counters(raw):
    names = {"page_cache_hits": "Page cache hits", "page_cache_misses": "Page cache misses",
             "fullscan_steps": "Fullscan Steps", "vm_steps": "VM-steps"}
    result = {}
    for key, label in names.items():
        hit = re.search(re.escape(label) + r":\s+(\d+)", raw, re.I)
        assert hit, label
        result[key] = int(hit[1])
    return result


def main():
    base = current_base()
    scenarios = {}
    for name, sql in {"index_then_table": "SELECT id,name,age FROM users WHERE name='Alice';",
                      "covering": "SELECT id,name FROM users WHERE name='Alice';",
                      "table_scan": "SELECT id,name,age FROM users NOT INDEXED WHERE name='Alice';"}.items():
        with Cli(base, name) as c:
            c.raw(".stats on")
            runs = []
            for _ in range(2):
                raw = c.raw(sql)
                rows, _ = json.JSONDecoder().raw_decode(raw)
                runs.append({"result": rows, "counters": counters(raw)})
            c.raw(".stats off")
        assert runs[0]["result"][0]["id"] == 2050
        scenarios[name] = {"sql": sql, "runs": runs}
    indexed = scenarios["index_then_table"]["runs"]
    scan = scenarios["table_scan"]["runs"]
    assert indexed[0]["counters"]["page_cache_misses"] > 0
    assert indexed[1]["counters"]["page_cache_misses"] == 0
    assert scan[0]["counters"]["fullscan_steps"] == 4095
    assert scan[0]["counters"]["page_cache_misses"] > indexed[0]["counters"]["page_cache_misses"]
    finish("03_queries", {"summary": {name: [r["counters"] for r in s["runs"]] for name, s in scenarios.items()},
                          "scenarios": scenarios,
                          "limits": ["A fresh connection is not a cold OS filesystem cache.",
                                     "These counters do not identify individual pages or physical disk reads.",
                                     "No timing or general performance conclusion is drawn from this dataset."]})


if __name__ == "__main__":
    main()
