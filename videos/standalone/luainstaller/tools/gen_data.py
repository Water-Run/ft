#!/usr/bin/env python3
# 由 research/lab 里的实测原文与真实产物生成 src/js/data.js。
# 画面上的终端回显、源码、字节、哈希、反汇编、ELF 布局都从这里取，不手写。
# 用法：python videos/standalone/luainstaller/tools/gen_data.py      需要 binutils 的 objdump
# 输入里有两类不入库：取证时取回的构建产物（research/lab/v2/art/）与第三方源码（research/_src/），
# 获取方式见 research/FACTS.md；没有它们时本脚本无法运行，已生成的 src/js/data.js 不受影响。
import base64, json, os, re, struct, subprocess

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
lab = lambda *p: os.path.join(R, "research", "lab", *p)
read = lambda p: open(p, encoding="utf-8", errors="replace").read()


def blocks(text):
    """把 "$ 命令 … [exit n]" 形式的记录切成 {命令: [{out:[行], exit:n}, …]}。"""
    res = {}; cur = None
    for ln in text.split("\n"):
        m = re.match(r"^(?:\[[\d:. ]+\] )?\$ (.*)$", ln)
        if m:
            cur = m.group(1).strip(); res.setdefault(cur, []).append({"out": [], "exit": None}); continue
        if cur is None: continue
        m = re.match(r"^\[exit ?(\d*)\]", ln)
        if m:
            res[cur][-1]["exit"] = int(m.group(1)) if m.group(1) else None; cur = None; continue
        if ln.startswith("### ") or ln.startswith("===="): cur = None; continue
        res[cur][-1]["out"].append(ln.rstrip())
    for k in res:
        for b in res[k]:
            while b["out"] and b["out"][-1] == "": b["out"].pop()
            while b["out"] and b["out"][0] == "": b["out"].pop(0)
    return res


def table(*files):
    t = {}
    for f in files:
        for k, v in blocks(read(lab(*f))).items(): t.setdefault(k, []).extend(v)
    return t


U = table(("v2", "out_11_usage.txt"))          # 构建机：用法全流程
P = table(("v2", "out_14_prereq.txt"))         # 分步的构建前提
X = table(("v2", "out_15_extra.txt"))          # 默认输出、可复现、srlua 经 PATH
N = table(("v2", "out_16_nolib.txt"))          # 没有任何 Lua 的机器
M = table(("v2", "out_18_more.txt"))           # 搜索顺序、进程号
C = table(("v2", "out_12_clean.txt"))          # 干净机器
W2 = table(("v2", "out_20_web.txt"))           # 示例服务：不带 --max-deps 的构建
W3 = table(("v2", "out_21_clean.txt"))         # 示例服务：放到没有 Lua 的机器上启动
J = table(("v2", "out_23_luajit.txt"))          # 用 LuaJIT 运行 luainstaller
SC = table(("v2", "out_25_srcchange.txt"))     # 构建期间源文件被改动
D = {}


def out(tbl, cmd, i=-1, strip_time=True):
    assert cmd in tbl, "实测记录里没有这条命令: " + cmd
    o = list(tbl[cmd][i]["out"])
    if strip_time: o = [l for l in o if l and not re.match(r"^(real|user|sys)\s", l)]
    return o


def secs(tbl, cmd):
    o = tbl[cmd][-1]["out"]; r = [l for l in o if l.startswith("real")][0]
    m = re.search(r"(\d+)m([\d.]+)s", r); return round(int(m.group(1)) * 60 + float(m.group(2)), 1)


# ── 01 在它之前 ──
D["srlua"] = {
    "make": out(U, 'make LUA_TOPDIR=/usr LUA_LIBDIR=/usr/lib64 2>&1 | grep -E "^(gcc|cc) "'),
    "glue_cmd": "/home/waterrun/srlua-103/srglue /home/waterrun/srlua-103/srlua main.lua moon-srlua",
    "run_here": out(U, "chmod +x moon-srlua && ./moon-srlua 2026-10-01"),
    "elsewhere": out(U, "cd /tmp && ~/moon/moon-srlua 2026-10-01 2>&1 | head -3"),
    "path": out(M, "cd /tmp && env PATH=/home/waterrun/bin:/usr/bin moon-srlua 2026-10-01"),
    "nolib": out(N, "cd /root/e/moon && ./moon-srlua 2026-10-01"),
    "ldd": out(U, "ldd moon-srlua"),
    "size": int(out(U, "ls -l moon-srlua")[0].split()[4]),
}
assert D["srlua"]["glue_cmd"] in U
ls_full = "luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua /usr/lib64/liblua.a"
D["luastatic"] = {
    "cmd": ls_full, "out": out(U, ls_full),
    "short_cmd": "luastatic main.lua /usr/lib64/liblua.a", "short_out": out(U, "luastatic main.lua /usr/lib64/liblua.a"),
    "short_run": out(U, "cd /tmp && ~/moon/main 2026-10-01 2>&1 | head -4"),
    "nolua_cmd": "luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua",
    "nolua_out": out(U, "luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua 2>&1 | head -3"),
    "undefined": sum(1 for l in out(U, "luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua") if "undefined reference" in l),
    "sizes": {l.split()[-1]: int(l.split()[4]) for l in out(U, "ls -l main main.luastatic.c")},
    "usage4": "[4]: One or more static libraries for a required Lua binary module",
}
assert D["luastatic"]["usage4"] in read(os.path.join(R, "research", "_src", "luastatic.lua"))
D["len"] = {"luastatic": len(ls_full), "luai": len("luai -b main.lua")}
D["luai_short"] = {"cmd": "luai -b main.lua", "out": out(X, "luai -b main.lua")}

# ── 02 概述 ──
D["clean"] = {
    "lua": out(C, "lua -v")[0:1], "lua_main": out(C, "lua main.lua")[0:1],
    "moon": out(N, "./moon/build/moon/moon 2026-10-01"), "onefile": out(N, "./moon/build/moon-onefile 2026-10-01"),
    "ldd": out(N, "ldd ./moon/build/moon/moon | grep -i lua"),
}
D["ltokei"] = out(U, "cd /tmp && env -i ~/ltokei/ltokei ~/luainstaller-src/src")

# ── 03 安装 ──
inst = out(U, "luarocks install luainstaller")
D["install"] = {
    "rocks": ["Installing https://luarocks.org/luainstaller-1.4.0-1.src.rock", [l for l in inst if "is now installed" in l][0]],
    "version": out(U, "luai -v"), "version_long": out(U, "luainstaller version"),
    "standalone_cmd": "lua tools/install.lua --prefix /home/waterrun/luainstaller",
    "standalone": out(P, "lua tools/install.lua --prefix /home/waterrun/luainstaller"),
    "help": out(U, "luai -h"),
    "help_raw": out(U, "luai -h", strip_time=False),
    "mix": [out(U, "luai build main.lua"), out(U, "luainstaller -b main.lua")],
}
D["prereq"] = {
    "analyze": out(P, "luai -a main.lua"),
    "build_fail": [b["out"] for b in P["luai -b main.lua -o build/moon"]][0],
    "build_fail2": [b["out"] for b in P["luai -b main.lua -o build/moon"]][1],
    "build_ok": [b["out"] for b in P["luai -b main.lua -o build/moon"]][2],
    "which1": out(P, "which cc gcc luarocks"),
}
assert "ToolchainError" in D["prereq"]["build_fail"][0] and D["prereq"]["build_ok"][0] == "ok"
setup = read(lab("v2", "out_11_usage.txt"))
D["versions"] = {"lua": re.search(r"^Lua ([\d.]+)", setup, re.M).group(1), "gcc": re.search(r"^gcc \(GCC\) ([\d.]+)", setup, re.M).group(1)}

# ── 04 使用 ──
D["cmd"] = {k: out(U, k) for k in [
    "lua main.lua 2026-10-01", "luai -a main.lua", "luainstaller analyze main.lua", "luai -t main.lua", "luainstaller trace main.lua",
    "ls -l build/moon", "env -u LUA_PATH -u LUA_CPATH build/moon/moon 2026-10-01", "env -i build/moon/moon 2026-10-01",
    "ldd build/moon/moon", "file build/moon/moon", "ls -l build", "ldd build/moon-onefile", "luainstaller logs --limit 6",
]}
D["cmd"]["luai -a main.lua"] = out(U, "luai -a main.lua", 0)                      # 第一次出现的是 ~/moon 里的那一次
D["cmd"]["luai -t main.lua"] = out(U, "luai -t main.lua", 0)
D["cmd"]["luai -b main.lua -o build/moon"] = out(U, "time LUAI_CC=/opt/ccwrap/gcc luai -b main.lua -o build/moon")
D["cmd"]["luai -b --file main.lua -o build/moon-onefile"] = out(U, "time luai -b --file main.lua -o build/moon-onefile")
D["cmd"]["find build/moon"] = out(U, "cd build && find moon | sort")
D["secs"] = {"dir": secs(U, "time LUAI_CC=/opt/ccwrap/gcc luai -b main.lua -o build/moon"), "onefile": secs(U, "time luai -b --file main.lua -o build/moon-onefile"),
             "websql": secs(W2, "time luai -b test/firebird_web_sql/server.lua -o ~/websql")}
sz = {}
for key, names in (("ls -l build/moon", ("moon",)), ("ls -l build", ("moon-onefile",)), ("ls -l build/moon/.luai/native", ("liblua-5.4.so",))):
    for l in out(U, key):
        p = l.split()
        if len(p) >= 9 and p[4].isdigit() and p[-1] in names: sz[p[-1]] = int(p[4])
D["size"] = sz
D["err"] = {
    "bad_date": out(U, 'env -i build/moon/moon not-a-date; echo "exit code $?"'),
    "onefile_exists": out(U, "luai -b --file main.lua -o build/moon-onefile"),
    "max_deps": out(U, "luai -b main.lua -o build/x --max-deps 2"),
    "target_os": out(U, "luai -b main.lua -o build/x --target-os windows"),
    "lua_prefix": out(U, "luai -b main.lua -o build/x --lua-prefix /opt/lua51"),
    "not_found": out(U, "luai -b nothere.lua"),
    "module": out(U, "cd ~/missing && luai -a main.lua"),
    "syntax": out(U, 'cp moon/names.lua /tmp/names.bak && echo "this is not lua (" >> moon/names.lua && luai -b main.lua -o build/moon'),
}
jit_cmd = "luajit bin/luai.lua -a ~/moon/main.lua"
D["err"]["luajit"] = {"cmd": jit_cmd, "out": out(J, jit_cmd), "version": out(J, "luajit -v")[0].split(" -- ")[0],
                      "runtime": out(J, "luai -b main.lua -o build/jit --lua /usr/bin/luajit -d runtime")}
assert "UnsupportedLuaVersionError" in D["err"]["luajit"]["out"][0]
D["path_start"] = out(U, "ln -sf ~/moon/build/moon/moon ~/bin/moon && cd /tmp && env -i PATH=/home/waterrun/bin moon 2026-10-01")
D["rebuild"] = {
    "extra": out(U, 'echo "my notes" > build/moon/NOTES.txt && luai -b main.lua -o build/moon'),
    "edited": out(U, 'echo "edited" >> build/moon/THIRD_PARTY_NOTICES.md && luai -b main.lua -o build/moon'),
    "edited_cmd": 'echo "edited" >> build/moon/THIRD_PARTY_NOTICES.md && luai -b main.lua -o build/moon',
    "foreign": out(U, "mkdir -p build/mine && echo data > build/mine/file.txt && luai -b main.lua -o build/mine"),
    "before": out(U, "sha256sum build/moon/moon")[0].split()[0],
    "after": out(U, "sha256sum build/moon/moon && env -i build/moon/moon 2026-10-01")[0].split()[0],
}
assert D["rebuild"]["before"] == D["rebuild"]["after"]
D["dyn"] = {
    "src": out(U, "cat main.lua", 0), "static": out(U, "luai -a main.lua", 1),
    "runtime_mysql": out(U, "luai -a main.lua -d runtime -- mysql"), "runtime_default": out(U, "luai -a main.lua -d runtime"),
    "manual_cmd": "luai -a main.lua -d manual --include drivers/sqlite.lua --include drivers/mysql.lua",
    "manual": out(U, "luai -a main.lua -d manual --include drivers/sqlite.lua --include drivers/mysql.lua"),
    "run": out(U, "cd /tmp && env -i ~/dyn/build/dyn/dyn mysql && env -i ~/dyn/build/dyn/dyn sqlite"),
}
assert "DynamicRequireError" in D["dyn"]["static"][0]
D["native"] = {
    "src": out(U, "cat main.lua", 1) if False else "local lfs = require(\"lfs\")",
    "analyze": out(U, "luai -a main.lua", 3), "trace": out(U, "luai -t main.lua", 2)[2], "warning": out(U, "luai -t main.lua", 2)[-1],
    "files": out(U, "cd build/list && find .luai/native | sort")[1:], "run": out(U, "env -i build/list/list /usr/share/lua"),
    "build": out(U, "luai -b main.lua -o build/list"), "find": out(U, "cd build/list && find .luai/native | sort"),
}
assert "lfs.so" in D["native"]["analyze"][-1] and D["native"]["trace"].startswith("1: native resolved lfs")
D["api"] = out(U, "lua /tmp/api.lua")
usr = read(lab("v2", "11_user.sh"))
D["api_src"] = re.search(r"cat > /tmp/api\.lua <<'LUA'\n(.*?)\nLUA\n", usr, re.S).group(1).split("\n")
D["default_out"] = out(X, "luai -b main.lua")
D["logs"] = out(U, "luainstaller logs --level error --limit 3")
web_a = out(U, "luai -a test/firebird_web_sql/server.lua")
D["web"] = {
    "analyze": web_a, "scripts": int(web_a[2].split()[1]), "libraries": int(web_a[3].split()[1]),
    "trace": out(U, "luai -t test/firebird_web_sql/server.lua --max-deps 250 | head -60")[2:28],
    "build_cmd": "luai -b test/firebird_web_sql/server.lua -o ~/websql",
    "build": out(W2, "time luai -b test/firebird_web_sql/server.lua -o ~/websql"),
    "du": out(W2, "sha256sum ~/websql/websql ~/websql2/websql; ls -l ~/websql/websql; du -sh ~/websql; find ~/websql/.luai/native | sort")[3].split()[0],
    "clean": {k: out(W3, k) for k in ("lua -v", "./websql/websql &", "curl -si http://127.0.0.1:9090/ | head -1")},
    "native": [l for l in out(U, "cd ~/websql && find . -maxdepth 3 | sort | head -40; du -sh .") if "/native/" in l],
    "http": out(N, "(./websql/websql > /tmp/w.log 2>&1 &); sleep 2; curl -s -i http://127.0.0.1:9090/ | head -2; head -3 /tmp/w.log"),
}
assert D["web"]["http"][0] == "HTTP/1.1 200 OK"
assert D["web"]["clean"]["curl -si http://127.0.0.1:9090/ | head -1"] == ["HTTP/1.1 200 OK"] and out(W2, "luai -a test/firebird_web_sql/server.lua | head -4")[2:] == ["scripts: 17", "libraries: 2"]
# Windows（MSVC + Lua 5.5）
w = read(lab("out_w9_windows.txt")); wb = blocks(w)
D["win"] = {k: v[-1]["out"] for k, v in wb.items()}
cl = re.search(r"Compiler Version (\d+\.\d+)", w).group(1); build = int(re.search(r"Windows \[Version 10\.0\.(\d+)", w).group(1))
D["win_note"] = "Windows %s · MSVC %s · Lua %s" % ("11" if build >= 22000 else "10", cl, re.search(r"^Lua ([\d.]+)", w, re.M).group(1))
D["win_sizes"] = {n: int(s.replace(",", "")) for s, n in re.findall(r"\s([\d,]+) (moon\.exe|lua55\.dll)", w)}

# ── 06 实现原理：真实产物 ──
art = lambda *p: lab("v2", "art", *p)
D["src"] = {n: read(lab("moon", p)).rstrip("\n").split("\n") for n, p in [("main", "main.lua"), ("phase", "moon/phase.lua"), ("julian", "moon/julian.lua"), ("names", "moon/names.lua")]}
D["search"] = out(M, 'printf "local m = require(\\"moon.tides\\")\\n" > probe.lua && luai -a probe.lua; rm -f probe.lua')[1].replace("Searched: ", "").split(", ")
man = read(art("moon", "build", "moon", ".luai", "manifest.lua"))
D["manifest"] = [{"id": i, "sha": h, "dest": d} for h, d, i in re.findall(r'content_hash = "([0-9a-f]{64})",\s+destination_path = "([^"]+)",\s+source_id = "([^"]+)"', man)]
D["manifest"].sort(key=lambda x: (x["id"] != "main.lua", x["id"]))
assert [m["id"] for m in D["manifest"]] == ["main.lua", "moon/julian.lua", "moon/names.lua", "moon/phase.lua"]
D["trace"] = out(U, "luai -t main.lua", 0)[2:5]
cc = [l for l in read(lab("v2", "cc.log")).split("\n") if l.startswith("gcc -std")]
short = lambda l: re.sub(r"/home/waterrun/moon/build/\.luai-staging-[0-9a-f-]+/", "", re.sub(r"/tmp/luainstaller-toolchain-[^/]+/", "", l))
D["cc"] = {"probe_native": short(cc[0]), "probe": short(cc[1]), "launcher": short(cc[2]), "abi": short(cc[3]),
           "staging": re.search(r"(build/\.luai-staging-[0-9a-f]+-[0-9a-f]+)/", cc[2]).group(1)}
c = read(art("moon", "build", "moon", ".luai", "build", "launcher.c")); cl_ = c.split("\n")
m = re.search(r"luai_bootstrap\[\] = \{(.*?)\};", c, re.S)
by = [int(x, 16) for x in re.findall(r"0x[0-9A-Fa-f]{2}", m.group(1))]
boot = bytes(by).decode("utf-8"); bl = boot.split("\n")
D["boot"] = {
    "size": len(by), "lines": c.count("\n"), "array_rows": (len(by) + 11) // 12, "head": by[:96], "text": bl[:8],
    "insert": next(l.strip() for l in bl if "table.insert(searchers" in l),
    "modules": [l for l in bl if re.match(r'^    \["moon\.', l)],
    "cmain": [l.strip() for l in cl_ if re.search(r"L = luaL_newstate\(\);|^\s+luaL_openlibs\(L\);|luai_push_arg\(L, argc, argv\);|status = luai_load_bootstrap\(L\);|status = lua_pcall\(L, 0, LUA_MULTRET, traceback_index\);", l)],
    "guard": [l for l in cl_ if "LUA_VERSION_NUM != " in l or "generated for a different Lua ABI" in l],
    "decl": "static const unsigned char luai_bootstrap[] = {",
    "first_rows": [l.strip() for l in cl_ if l.strip().startswith("0x")][:8],
}
D["boot"]["src"] = bl                                              # 引导脚本全文（由 launcher.c 里的数组还原）
assert sum(len(l.encode()) + 1 for l in bl) - 1 == len(by)
ln = lambda pat: next(i + 1 for i, l in enumerate(cl_) if re.search(pat, l))     # 1 起的行号
body = lambda pat: (lambda i: cl_[i:cl_.index("}", i) + 1])(ln(pat) - 1)
D["launcher"] = {
    "lines": c.count("\n"), "decl_line": ln(r"luai_bootstrap\[\] = \{"), "size_line": ln(r"luai_bootstrap_size = "), "error_line": ln(r"^#error"),
    "main_line": ln(r"^int main\("), "load_line": ln(r"^static int luai_load_bootstrap"), "main": body(r"^int main\("), "load": body(r"^static int luai_load_bootstrap"), "matches": body(r"^static int luai_runtime_matches"),
    "last_rows": [l.strip() for l in cl_ if l.strip().startswith("0x")][-2:],
}
assert D["launcher"]["lines"] == D["boot"]["lines"] and '"t"' in "".join(D["launcher"]["load"])
D["launcher"]["lens"] = [len(l) for l in cl_[:D["launcher"]["lines"]]]               # 每行的长度：画 launcher.c 的缩略图
bd = art("moon", "build", "moon")
D["bundle_files"] = sorted(({"path": os.path.relpath(os.path.join(dp, f), bd), "size": os.path.getsize(os.path.join(dp, f))} for dp, _, fs in os.walk(bd) for f in fs), key=lambda x: -x["size"])
assert sum(f["size"] for f in D["bundle_files"]) < D["size"]["moon-onefile"]
D["versions"]["lua_v"] = re.search(r"^Lua [\d.]+ +Copyright.*$", setup, re.M).group(0).strip()
sc_cmd = "LUAI_CC=/opt/edit/gcc luai -b main.lua -o build/moon"
D["srcchange"] = {
    "cmd": sc_cmd, "err": out(SC, sc_cmd),
    "before": out(SC, "sha256sum moon/names.lua")[0].split()[0], "after": out(SC, "sha256sum moon/names.lua; tail -1 moon/names.lua")[0].split()[0],
    "built": out(SC, "luai -b main.lua -o build/moon && sha256sum build/moon/moon", 0)[-1].split()[0],
    "kept": out(SC, "sha256sum build/moon/moon; ls -a build")[0].split()[0], "ls": out(SC, "sha256sum build/moon/moon; ls -a build")[1:],
    "rebuilt": out(SC, "luai -b main.lua -o build/moon && sha256sum build/moon/moon", 1)[-1].split()[0],
}
sc = D["srcchange"]
assert "SourceChangedError" in sc["err"][0] and sc["before"] == [m for m in D["manifest"] if m["id"] == "moon/names.lua"][0]["sha"] and sc["before"] != sc["after"]
assert sc["built"] == sc["kept"] == out(U, "sha256sum build/moon/moon")[0].split()[0] and sc["ls"] == [".", "..", "moon"] and sc["rebuilt"] != sc["built"]
# 核验用的探针：源码模板在 src/bundler.lua 的 abiProbeSource 里，这里按本次构建的版本代入
D["abi_probe"] = ['lua_getglobal(state, "_VERSION");', 'version = lua_tostring(state, -1);', 'matches = version != NULL && strcmp(version, "Lua 5.4") == 0;', 'return matches ? 0 : 42;']
bsrc = read(os.path.join(R, "research", "_src", "luainstaller", "src", "bundler.lua"))
for l in D["abi_probe"]: assert l.replace("Lua 5.4", "@LUA_VERSION@") in bsrc, l
D["privacy"] = out(X, "grep -c /home/waterrun build/r1/moon/.luai/manifest.lua; strings build/r1/moon/moon | grep -c /home/waterrun")
assert D["privacy"] == ["0", "0"]
exe = open(art("moon", "build", "moon", "moon"), "rb").read()
assert len(exe) == D["size"]["moon"]
D["exe"] = {"size": len(exe), "b64": base64.b64encode(exe).decode(), "sha": out(U, "sha256sum build/moon/moon")[0].split()[0]}
# ELF 节表（直接解析文件）
assert exe[:4] == b"\x7fELF" and exe[4] == 2
shoff, = struct.unpack_from("<Q", exe, 0x28); shentsize, shnum, shstrndx = struct.unpack_from("<HHH", exe, 0x3A)
sh = [struct.unpack_from("<IIQQQQIIQQ", exe, shoff + i * shentsize) for i in range(shnum)]
stroff = sh[shstrndx][4]
name = lambda n: exe[stroff + n: exe.index(b"\0", stroff + n)].decode()
D["exe"]["sections"] = [{"name": name(s[0]), "off": s[4], "size": s[5]} for s in sh if s[3] != 8 and s[5] > 0 and name(s[0])]
D["exe"]["shoff"] = shoff
i0 = exe.find(b"-- luainstaller generated bootstrap"); assert i0 > 0 and exe[i0:i0 + len(by)] == bytes(by)
j0 = exe.find(b"local phase = require")
D["exe"]["boot_off"] = i0; D["exe"]["src_off"] = j0
xxd = lambda off, n: [("%08x: " % (off + r)) + " ".join(exe[off + r + k: off + r + k + 2].hex() for k in range(0, 16, 2)) + "  " + "".join(chr(b) if 32 <= b < 127 else "." for b in exe[off + r: off + r + 16]) for r in range(0, n, 16)]
D["exe"]["xxd_src"] = xxd(j0 - (j0 % 16), 192)
D["exe"]["xxd_head"] = xxd(0, 64)
dis = subprocess.run(["objdump", "-d", "--disassemble=main", art("moon", "build", "moon", "moon")], capture_output=True, text=True).stdout
rows = []
for l in dis.split("\n"):
    mm = re.match(r"^\s+([0-9a-f]+):\t([0-9a-f ]+?)\s*\t(.*)$", l)
    if mm: rows.append({"addr": mm.group(1), "bytes": mm.group(2).strip(), "asm": re.sub(r"\s+", " ", mm.group(3)).strip()})
D["exe"]["main"] = rows[:6]
calls = [r for r in rows if r["asm"].startswith("call")]
want = ["luaL_newstate", "luaL_openlibs", "luai_push_arg", "luai_load_bootstrap", "lua_pcallk"]
D["exe"]["calls"] = [next(r for r in calls if w_ in r["asm"]) for w_ in want]
D["exe"]["main_addr"] = rows[0]["addr"]
D["exe"]["file"] = out(U, "file build/moon/moon")[0]
marker = read(art("moon", "build", "moon", ".luai", "generated-output.txt")).rstrip("\n").split("\n")
D["marker"] = marker
D["repro"] = {"dir": [l.split() for l in out(X, "luai -b main.lua -o build/r1/moon >/dev/null && luai -b main.lua -o build/r2/moon >/dev/null && sha256sum build/r1/moon/moon build/r2/moon/moon")],
              "elsewhere": out(X, "mkdir -p /tmp/elsewhere && cp -r main.lua moon /tmp/elsewhere/ && cd /tmp/elsewhere && luai -b main.lua -o build/moon >/dev/null && sha256sum build/moon/moon")[0].split()[0],
              "onefile": [l.split() for l in out(X, "luai -b --file main.lua -o build/f1 >/dev/null && luai -b --file main.lua -o build/f2 >/dev/null && sha256sum build/f1 build/f2")]}
assert D["repro"]["dir"][0][0] == D["repro"]["dir"][1][0] == D["repro"]["elsewhere"] == D["exe"]["sha"]
D["onefile_find"] = out(U, "find /tmp/luainstaller-onefile-$(id -u) -maxdepth 2 | sort")
# 单文件的真实布局：解出的每个文件在 moon-onefile 里的偏移（out_29，本机运行 Fedora 上构建的产物）
o29 = read(lab("v2", "out_29_onefile_unpack.txt"))
D["onefile_map"] = sorted(({"size": int(a_), "path": b_, "off": int(c_, 16)} for a_, b_, c_ in re.findall(r"^\s*(\d+)\s+(\S+)\s+at 0x([0-9a-f]+)$", o29, re.M)), key=lambda x: x["off"])
m29 = re.search(r"files (\d+)\s+payload bytes (\d+)\s+onefile bytes (\d+)\s+remainder (\d+)", o29)
D["onefile_sum"] = {"files": int(m29.group(1)), "payload": int(m29.group(2)), "total": int(m29.group(3)), "rest": int(m29.group(4))}
assert D["onefile_sum"]["total"] == D["size"]["moon-onefile"] and len(D["onefile_map"]) == D["onefile_sum"]["files"] == 12 and "NOT FOUND" not in o29
assert sum(f["size"] for f in D["onefile_map"]) == D["onefile_sum"]["payload"]
for x, y in zip(D["onefile_map"], D["onefile_map"][1:]): assert x["off"] + x["size"] <= y["off"]            # 互不重叠，按偏移有序
inner = [f for f in D["onefile_map"] if f["path"] == "inner"][0]
assert inner["size"] == D["size"]["moon"]
assert re.search(r"onefile-\d+/([0-9a-f]{64})/inner", o29).group(1) == [l for l in D["onefile_find"] if l.endswith("/inner")][0].split("/")[-2]   # 两台机器上解包目录同名：按内容哈希
D["onefile"] = {"cache": [l for l in out(U, "find /tmp/luainstaller-onefile-$(id -u) -maxdepth 2 | sort") if l.endswith("/inner")][0].rsplit("/", 1)[0],
                "pid": out(M, 'build/pid & echo "pid started by the shell: $!"; wait', 0)}
D["onefile"]["pid_cmd"] = 'build/pid & echo "pid started by the shell: $!"; wait'
D["onefile"]["pid_dir"] = out(M, 'build/piddir/piddir & echo "pid started by the shell: $!"; wait')
pids = [int(re.search(r"(\d+)$", l).group(1)) for l in D["onefile"]["pid"]]; assert pids[0] == pids[1]

open(os.path.join(R, "src", "js", "data.js"), "w", encoding="utf-8").write("// 由 tools/gen_data.py 从 research/lab 的实测原文与真实产物生成，不要手改\nwindow.DATA = " + json.dumps(D, ensure_ascii=False, indent=1) + ";\n")
print("data.js written:", os.path.getsize(os.path.join(R, "src", "js", "data.js")), "bytes")
for k in ("len", "secs", "size", "versions"): print(" ", k, D[k])
print("  sections:", ", ".join("%s@%x+%d" % (s["name"], s["off"], s["size"]) for s in D["exe"]["sections"] if s["size"] > 200))
print("  calls:", [(r["bytes"], r["asm"]) for r in D["exe"]["calls"]])
print("  xxd:", D["exe"]["xxd_src"][1])
print("  cc:", D["cc"]["launcher"])
print("  web:", D["web"]["scripts"], D["web"]["libraries"], D["web"]["native"])
print("  search:", D["search"][:4])
