# 在干净的 Fedora 44 容器里走一遍片中出现的全部命令（构建机）。由 06 脚本在容器内以 root 启动。
set -u
export LC_ALL=C.UTF-8
say() { echo; echo "### $*"; }
run() { echo; echo "\$ $*"; "$@" 2>&1; echo "[exit $?]"; }
say "prerequisites (as root)"
dnf install -y -q lua lua-devel lua-static luarocks gcc make tar gzip which file util-linux >/dev/null 2>&1; echo "dnf exit $?"
lua -v; gcc --version | head -1; luarocks --version | head -1
say "install (as root)"
run luarocks install luainstaller
run luarocks install luastatic
useradd -m waterrun 2>/dev/null
cp -r /lab/moon /home/waterrun/moon && cp /lab/srlua-103.tar.gz /home/waterrun/ && chown -R waterrun:waterrun /home/waterrun
cat > /tmp/user.sh <<'USR'
set -u
export LC_ALL=C.UTF-8
say() { echo; echo "### $*"; }
run() { echo; echo "\$ $*"; "$@" 2>&1; echo "[exit $?]"; }
cd ~/moon
say "versions"
run luai -v
run luainstaller version
say "the program"
run lua main.lua 2026-10-01
say "analyze"
run luai -a main.lua
run luainstaller analyze main.lua
run luai -t main.lua
say "build dir"
echo; echo '$ time luai -b main.lua -o build/moon'; ( time luai -b main.lua -o build/moon ) 2>&1
echo; echo '$ find build/moon'; ( cd build && find moon | sort )
run ls -l build/moon
say "run with empty environment"
run env -i build/moon/moon 2026-10-01
say "entry only, default output"
run luai -b main.lua
run env -i build/main/main 2026-10-01
rm -rf build/main
say "onefile"
echo; echo '$ time luai -b --file main.lua -o build/moon-onefile'; ( time luai -b --file main.lua -o build/moon-onefile ) 2>&1
run ls -l build
run env -i build/moon-onefile 2026-10-01
run sha256sum build/moon/moon build/moon-onefile
say "library API"
cat > /tmp/api.lua <<'LUA'
local luainstaller = require("luainstaller")

local result = luainstaller.bundle({
    entry = "main.lua",
    out = "build/api/moon",
})

if result.ok then
    print("built " .. result.executable)
else
    print(result.error.type .. ": " .. result.error.message)
end
LUA
run lua /tmp/api.lua
say "standalone install from source tree"
cd /lab/luainstaller-src && run lua tools/install.lua --prefix /home/waterrun/luainstaller
run /home/waterrun/luainstaller/bin/luai -v
cd ~/moon
say "srlua"
cd ~ && tar xzf srlua-103.tar.gz && cd srlua-103
echo; echo '$ make LUA_TOPDIR=/usr LUA_LIBDIR=/usr/lib64'; make LUA_TOPDIR=/usr LUA_LIBDIR=/usr/lib64 2>&1 | grep -E "^(gcc|cc)|srglue srlua" ; echo "[exit ${PIPESTATUS[0]}]"
cd ~/moon
run ~/srlua-103/srglue ~/srlua-103/srlua main.lua moon-srlua
chmod +x moon-srlua
run ./moon-srlua 2026-10-01
echo; echo '$ cd /tmp && ~/moon/moon-srlua 2026-10-01'; ( cd /tmp && ~/moon/moon-srlua 2026-10-01 2>&1 | head -4 ); echo "[exit]"
say "luastatic"
run luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua /usr/lib64/liblua.a
echo; echo '$ cd /tmp && ~/moon/main 2026-10-01'; ( cd /tmp && ~/moon/main 2026-10-01 2>&1 | head -4 ); echo "[exit]"
run luastatic main.lua /usr/lib64/liblua.a
echo; echo '$ cd /tmp && ~/moon/main 2026-10-01   (modules not listed)'; ( cd /tmp && ~/moon/main 2026-10-01 2>&1 | head -5 ); echo "[exit]"
rm -f main main.luastatic.c moon-srlua
tar czf /tmp/moon-build.tgz -C ~/moon build
USR
chmod 644 /tmp/user.sh
su waterrun -c 'bash /tmp/user.sh'
cp /tmp/moon-build.tgz /lab/out/moon-build.tgz
