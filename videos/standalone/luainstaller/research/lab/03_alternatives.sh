set -u
export LC_ALL=C.UTF-8
cd ~/luai-video-lab
run() { echo; echo "\$ $*"; ( time "$@" ) 2>&1; echo "[exit $?]"; }
echo "===== srlua ====="
rm -rf srlua-103 && tar xzf srlua-103.tar.gz && cd srlua-103
cat README | head -20
run make
run make LUA_TOPDIR=/usr LUA_LIBDIR=/usr/lib64
ls -la
cd ~/luai-video-lab/moon
rm -rf alt && mkdir alt
run ../srlua-103/srglue ../srlua-103/srlua main.lua alt/moon-srlua
chmod +x alt/moon-srlua; ls -la alt
echo; echo '$ alt/moon-srlua 2026-10-01   (cwd = project dir, modules on disk)'; alt/moon-srlua 2026-10-01; echo "[exit $?]"
echo; echo '$ cd /tmp && .../alt/moon-srlua 2026-10-01   (elsewhere)'; ( cd /tmp && env -u LUA_PATH -u LUA_CPATH ~/luai-video-lab/moon/alt/moon-srlua 2026-10-01 ); echo "[exit $?]"
run ldd alt/moon-srlua
echo
echo "===== luastatic ====="
command -v luastatic; rpm -qf $(command -v luastatic) 2>&1; luastatic 2>&1 | head -20
cd ~/luai-video-lab/moon
run luastatic main.lua
run luastatic main.lua /usr/lib64/liblua.a
echo; echo '$ ./main 2026-10-01'; ./main 2026-10-01; echo "[exit $?]"; ( cd /tmp && ~/luai-video-lab/moon/main 2026-10-01 ); echo "[exit elsewhere $?]"
rm -f main main.luastatic.c
run luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua /usr/lib64/liblua.a
echo; echo '$ ./main 2026-10-01 (elsewhere)'; ( cd /tmp && env -i ~/luai-video-lab/moon/main 2026-10-01 ); echo "[exit $?]"
ls -la main main.luastatic.c; run ldd main
rm -f main main.luastatic.c
run luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua -llua
run luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua /usr/lib64/liblua.a -I/usr/include -o alt/moon-luastatic
ls -la alt . | head -30
rm -f main main.luastatic.c
