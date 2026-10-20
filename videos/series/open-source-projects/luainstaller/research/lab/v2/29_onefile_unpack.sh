# 补充：单文件产物到底带了什么。在本机（WSL Ubuntu x86_64）运行 Fedora 上构建的 build/moon-onefile，
# 让它解包到一个空的 TMPDIR，再列出解出的每个文件与字节数，并核对它们是否原样（未压缩）出现在单文件里。
set -u
cd "$(dirname "$(readlink -f "$0")")"
W=$(mktemp -d); cp art/moon/build/moon-onefile "$W/"; chmod +x "$W/moon-onefile"; mkdir "$W/tmp"
echo '$ TMPDIR=<empty dir> ./moon-onefile 2026-10-01'
( cd "$W" && TMPDIR="$W/tmp" ./moon-onefile 2026-10-01 ); echo "[exit $?]"
echo; echo '$ find $TMPDIR -type f -printf "%s %P\n" | sort -k2'
( cd "$W/tmp" && find . -type f -printf '%s %P\n' | sort -k2 ); echo "[exit 0]"
echo; echo '$ python3: 每个解出的文件在 moon-onefile 里的偏移（原样查找）'
python3 - "$W" <<'PY'
import os, sys
w = sys.argv[1]; one = open(os.path.join(w, "moon-onefile"), "rb").read(); tot = 0; n = 0
for dp, _, fs in sorted(os.walk(os.path.join(w, "tmp"))):
    for f in sorted(fs):
        b = open(os.path.join(dp, f), "rb").read(); i = one.find(b); tot += len(b); n += 1
        print("%8d  %-50s %s" % (len(b), os.path.relpath(os.path.join(dp, f), os.path.join(w, "tmp")).split("/", 2)[2], "at 0x%x" % i if i >= 0 else "NOT FOUND"))
print("files %d  payload bytes %d  onefile bytes %d  remainder %d" % (n, tot, len(one), len(one) - tot))
PY
echo "[exit 0]"
rm -rf "$W"
