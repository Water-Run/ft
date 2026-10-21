"""补证查询路径；使用既有 5.0.4 安装包，新建独立嵌入式库，不改旧实验。

在仓库根目录运行：python videos/database-engines/firebird/research/lab/13_query_path.py
二进制留在 out/lab/，回显只记录公开的 SQL、版本、执行计划与结果。
"""
import json
import os
from pathlib import Path
import subprocess
import tempfile

import fdb


def main():
    video = Path(__file__).resolve().parents[2]
    engine = video / "research/_src/fb504"
    fdb.load_api(str(engine / "fbclient.dll"))
    output = video / "out/lab"
    output.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="13_query_", dir=output))
    database = work / "query.fdb"
    con = fdb.create_database(database=str(database), user="SYSDBA", password="", page_size=8192)
    try:
        cur = con.cursor()
        schema = (video / "research/lab/03_schema.sql").read_text(encoding="utf-8")
        schema = "\n".join(line for line in schema.splitlines() if not line.lstrip().startswith("--"))
        for statement in schema.split(";"):
            statement = statement.strip()
            if statement.upper() == "COMMIT":
                con.commit()
                break
            if statement:
                cur.execute(statement)
                if statement.upper().startswith("CREATE "):
                    con.commit()
        cur.execute("SELECT RDB$GET_CONTEXT('SYSTEM', 'ENGINE_VERSION') FROM RDB$DATABASE")
        version = cur.fetchone()[0]
        cur.execute("SELECT age FROM users WHERE name = 'alice'")
        rows = cur.fetchall()
        con.commit()
    finally:
        con.close()
    sql = "SET EXPLAIN ON;\nSELECT age FROM users WHERE name = 'alice';\nQUIT;\n"
    sqlfile = work / "query.sql"
    sqlfile.write_text(sql, encoding="ascii")
    env = {key: value for key, value in os.environ.items() if key not in ("ISC_USER", "ISC_PASSWORD")}
    proc = subprocess.run([str(engine / "isql.exe"), "-user", "SYSDBA", "-input", str(sqlfile), str(database)],
                          capture_output=True, text=True, env=env, check=True)
    if proc.stderr.strip():
        raise RuntimeError(proc.stderr.replace(str(video), "<video>"))
    assert "Bitmap" in proc.stdout and "IDX_USERS_NAME" in proc.stdout, proc.stdout
    assert rows == [(30,)], rows
    record = {"version": version, "page_size": 8192, "query": "SELECT age FROM users WHERE name = 'alice'",
              "rows": rows, "explain": proc.stdout.strip(), "connection": "embedded; local file; no server started"}
    target = video / "research/lab"
    (target / "out_13_query_path.json").write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = "Firebird " + version + "\n" + sql + "\n" + proc.stdout
    (target / "out_13_query_path.txt").write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
