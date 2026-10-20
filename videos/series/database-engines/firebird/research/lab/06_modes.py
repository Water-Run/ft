"""同一份 .fdb 文件，三条路都能连上：远程、环回、嵌入式。

这是 Firebird 3.0 起的核心结构：引擎是一个库，服务端只是一个转发连接��壳。
本实验用同一个库文件分别走三种连接串，核对：
  - 连接是否成功
  - MON$ATTACHMENTS 里能看到几个 attachment（服务端进程里还有
    Cache Writer 与 Garbage Collector 两个内部 attachment；嵌入式没有服务端，
    也就没有这两个）
  - 各二进制文件的实际大小：引擎在库里，服务端只是个壳

用法：python 06_modes.py <远端连接串> <本地库文件> <Firebird 根目录> <输出目录>
"""

import json
import os
import sys

import fdb

USER, PASSWORD = "SYSDBA", "ftlab2026fb"


def probe(label, dsn, root, out, hold_remote=None):
    rec = {"label": label, "dsn": dsn}
    try:
        con = fdb.connect(dsn, user=USER, password=PASSWORD, charset="utf8")
        cur = con.cursor()
        cur.execute("SELECT id, name, age FROM users WHERE id = 1")
        rec["rows"] = cur.fetchall()
        cur.execute("SELECT MON$ATTACHMENT_ID, MON$USER, MON$REMOTE_PROTOCOL FROM MON$ATTACHMENTS ORDER BY MON$ATTACHMENT_ID")
        rec["attachments"] = cur.fetchall()
        cur.execute("SELECT COUNT(*) FROM MON$ATTACHMENTS")
        rec["attachment_count"] = cur.fetchone()[0]
        cur.execute(
            "SELECT MON$DATABASE_NAME, MON$PAGE_SIZE, MON$ODS_MAJOR, MON$ODS_MINOR "
            "FROM MON$DATABASE"
        )
        rec["database"] = cur.fetchone()
        con.close()
        rec["ok"] = True
    except Exception as exc:
        rec["ok"] = False
        rec["error"] = "%s: %s" % (type(exc).__name__, str(exc).replace("\n", " | "))
    out.append(rec)
    print("[%s] ok=%s %s" % (label, rec["ok"], rec.get("error", "")))
    return rec


def main():
    remote, local_file, root, out_dir = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    server_off = len(sys.argv) > 5 and sys.argv[5] == "server-off"
    os.makedirs(out_dir, exist_ok=True)
    out = []

    if server_off:
        # 服务端已停：只有嵌入式这条路还能走通
        print("== 服务端已停止 ==")
        probe("remote inet:// (server off)", remote, root, out)
        probe("loopback xnet:// (server off)", "xnet://" + local_file, root, out)
        probe("embedded local path (server off)", local_file, root, out)
    else:
        # 1) 远程：inet://
        probe("remote inet://", remote, root, out)

        # 2) 环回：xnet://（Windows 本机共享内存协议，走本机服务端）
        probe("loopback xnet://", "xnet://" + local_file, root, out)

        # 3) 嵌入式：直接给本地文件路径，引擎在客户端进程内
        #    先在服务端没有用户连接时试
        probe("embedded local path (server idle)", local_file, root, out)

        # 4) 服务端有用户连接时，再试嵌入式
        hold = fdb.connect(remote, user=USER, password=PASSWORD, charset="utf8")
        cur = hold.cursor()
        cur.execute("SELECT id FROM users WHERE id = 1")
        cur.fetchall()
        probe("embedded local path (server has client)", local_file, root, out)
        probe("loopback xnet:// (server has client)", "xnet://" + local_file, root, out)
        hold.close()

    # 二进制体积：引擎在库里，服务端只是壳
    sizes = {}
    for name in (
        "firebird.exe",
        "fbclient.dll",
        os.path.join("plugins", "engine13.dll"),
        os.path.join("plugins", "srp.dll"),
    ):
        p = os.path.join(root, name)
        sizes[name] = os.path.getsize(p) if os.path.exists(p) else None
    print("\nbinary sizes:")
    for k, v in sizes.items():
        print("  %-28s %s" % (k, v))

    result = {
        "modes": out,
        "binary_sizes": sizes,
        "firebird_root": "Firebird 5.0.4.1812 (Windows x64 zip)",
    }
    with open(os.path.join(out_dir, "out_06_modes.json"), "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)
    print("\nwrote out_06_modes.json")


if __name__ == "__main__":
    main()
