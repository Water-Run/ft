set -u
export LC_ALL=C.UTF-8
say() { echo; echo "### $*"; }
run() { echo; echo "\$ $*"; "$@" 2>&1; echo "[exit $?]"; }
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }     # 带 shell 语法的命令
cd ~/moon

say "versions and help"
run luai -v
run luainstaller version
run luai -h
run luainstaller help

say "the program"
run lua main.lua 2026-10-01

say "analyze and trace"
run luai -a main.lua
run luainstaller analyze main.lua
run luai -t main.lua
run luainstaller trace main.lua
run luai -t main.lua --verbose

say "build a directory bundle (compiler commands are recorded by a pass-through wrapper)"
: > /tmp/cc.log
sh_ 'time LUAI_CC=/opt/ccwrap/gcc luai -b main.lua -o build/moon'
sh_ 'cat /tmp/cc.log'
sh_ 'cd build && find moon | sort'
run ls -l build/moon
run ls -l build/moon/.luai/native
run ldd build/moon/moon
run file build/moon/moon

say "run it"
run env -u LUA_PATH -u LUA_CPATH build/moon/moon 2026-10-01
run env -i build/moon/moon 2026-10-01
sh_ 'env -i build/moon/moon; echo "exit code $?"'
sh_ 'env -i build/moon/moon not-a-date; echo "exit code $?"'
sh_ 'lua main.lua not-a-date; echo "exit code $?"'

say "start through PATH and through a symlink"
mkdir -p ~/bin
sh_ 'ln -sf ~/moon/build/moon/moon ~/bin/moon && cd /tmp && env -i PATH=/home/waterrun/bin moon 2026-10-01'

say "single file"
sh_ 'time luai -b --file main.lua -o build/moon-onefile'
run ls -l build
sh_ 'ls /tmp | grep luainstaller-onefile; echo "(before first run)"'
sh_ 'time env -i build/moon-onefile 2026-10-01'
sh_ 'time env -i build/moon-onefile 2026-10-01'
sh_ 'find /tmp/luainstaller-onefile-$(id -u) -maxdepth 2 | sort'
run ldd build/moon-onefile
sh_ 'luai -b --file main.lua -o build/moon-onefile'

say "rebuild in place"
run luai -b main.lua -o build/moon
sh_ 'echo "my notes" > build/moon/NOTES.txt && luai -b main.lua -o build/moon'
sh_ 'rm build/moon/NOTES.txt && luai -b main.lua -o build/moon'
sh_ 'echo "edited" >> build/moon/THIRD_PARTY_NOTICES.md && luai -b main.lua -o build/moon'
sh_ 'rm -rf build/moon && luai -b main.lua -o build/moon'
sh_ 'mkdir -p build/mine && echo data > build/mine/file.txt && luai -b main.lua -o build/mine'
sh_ 'head -4 build/moon/.luai/generated-output.txt'

say "a failed build leaves the previous bundle untouched"
sh_ 'sha256sum build/moon/moon'
sh_ 'cp moon/names.lua /tmp/names.bak && echo "this is not lua (" >> moon/names.lua && luai -b main.lua -o build/moon'
sh_ 'sha256sum build/moon/moon && env -i build/moon/moon 2026-10-01'
sh_ 'cp /tmp/names.bak moon/names.lua && luai -b main.lua -o build/moon'

say "limits and errors"
run luai -b main.lua -o build/x --max-deps 2
run luai -b main.lua -o build/x --target-os windows
run luai -b main.lua -o build/x --lua-prefix /opt/lua51
run luai -b nothere.lua
run luai build main.lua
run luainstaller -b main.lua
mkdir -p ~/missing && printf 'local m = require("not.installed")\nprint(m)\n' > ~/missing/main.lua
sh_ 'cd ~/missing && luai -a main.lua'

say "discovery modes"
mkdir -p ~/dyn/drivers && cd ~/dyn
printf 'local name = arg[1] or "sqlite"\nlocal driver = require("drivers." .. name)\nprint(driver.name)\n' > main.lua
printf 'return { name = "sqlite driver" }\n' > drivers/sqlite.lua
printf 'return { name = "mysql driver" }\n' > drivers/mysql.lua
sh_ 'cat main.lua'
run lua main.lua mysql
run luai -a main.lua
run luai -a main.lua -d runtime -- mysql
run luai -a main.lua -d runtime
run luai -a main.lua -d manual --include drivers/sqlite.lua --include drivers/mysql.lua
run luai -b main.lua -d manual --include drivers/sqlite.lua --include drivers/mysql.lua -o build/dyn
sh_ 'cd /tmp && env -i ~/dyn/build/dyn/dyn mysql && env -i ~/dyn/build/dyn/dyn sqlite'
mkdir -p ~/pc && cd ~/pc
printf 'local ok, lfs = pcall(require, "lfs")\nprint(ok and "lfs loaded" or "lfs missing")\n' > main.lua
sh_ 'cat main.lua'
run luai -a main.lua
run luai -t main.lua

say "native C module"
mkdir -p ~/list && cd ~/list
cat > main.lua <<'LUA'
-- list: print the entries of a directory, using LuaFileSystem (a C module).
local lfs = require("lfs")

local dir = arg[1] or "."
local names = {}
for name in lfs.dir(dir) do
    if name ~= "." and name ~= ".." then
        names[#names + 1] = name
    end
end
table.sort(names)
print(table.concat(names, "  "))
LUA
run lua main.lua /usr/share/lua
run luai -a main.lua
run luai -t main.lua
run luai -b main.lua -o build/list
sh_ 'cd build/list && find .luai/native | sort'
run env -i build/list/list /usr/share/lua
run ldd build/list/.luai/native/lfs.so

say "library API"
cd ~/moon
cat > /tmp/api.lua <<'LUA'
local luainstaller = require("luainstaller")
print("VERSION", luainstaller.VERSION)

local a = luainstaller.analyze({ entry = "main.lua" })
print("analyze.ok", a.ok, "scripts", #a.dependencies.scripts, "libraries", #a.dependencies.libraries)

local c = luainstaller.compatibility({ entry = "main.lua" })
print("compatibility", c.compatibility.summary)
print("host", c.compatibility.host.os, c.compatibility.host.arch, "lua", c.compatibility.lua.version)

local b = luainstaller.bundle({ entry = "main.lua", out = "build/api/moon" })
print("bundle.ok", b.ok, b.executable)

local bad = luainstaller.bundle({ entry = "main.lua", out = "build/api/moon", colour = "blue" })
print("bad.ok", bad.ok, bad.error.type, bad.error.message)

local e = luainstaller.analyze({ entry = "/home/waterrun/dyn/main.lua" })
print("dyn.ok", e.ok, e.error.type)

local logs = luainstaller.getLogs({ limit = 2 })
print("logs", #logs, logs[1] and logs[1].action, logs[1] and logs[1].level)
LUA
run lua /tmp/api.lua

say "logs"
run luainstaller logs --limit 6
run luainstaller logs --level error --limit 3
sh_ 'ls ~/.luainstaller | head'

say "standalone install"
sh_ 'cd ~/luainstaller-src && lua tools/install.lua --prefix /home/waterrun/luainstaller && /home/waterrun/luainstaller/bin/luai -v && ls /home/waterrun/luainstaller /home/waterrun/luainstaller/bin'
sh_ 'cd ~/luainstaller-src && lua bin/luai.lua -v'

say "srlua"
cd ~ && tar xzf srlua-103.tar.gz && cd srlua-103
sh_ 'make LUA_TOPDIR=/usr LUA_LIBDIR=/usr/lib64 2>&1 | grep -E "^(gcc|cc) "'
cd ~/moon
run ~/srlua-103/srglue ~/srlua-103/srlua main.lua moon-srlua
sh_ 'chmod +x moon-srlua && ./moon-srlua 2026-10-01'
sh_ 'cd /tmp && ~/moon/moon-srlua 2026-10-01 2>&1 | head -3'
sh_ 'cp moon-srlua ~/bin/ && cd ~/moon && env PATH=/home/waterrun/bin:/usr/bin moon-srlua 2026-10-01'
run ls -l moon-srlua
run ldd moon-srlua

say "luastatic"
run luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua /usr/lib64/liblua.a
sh_ 'cd /tmp && ~/moon/main 2026-10-01'
run ls -l main main.luastatic.c
run luastatic main.lua /usr/lib64/liblua.a
sh_ 'cd /tmp && ~/moon/main 2026-10-01 2>&1 | head -4'
run luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua
sh_ 'luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua 2>&1 | head -3'
rm -f main main.luastatic.c moon-srlua

say "larger samples from the repository"
cd ~/luainstaller-src
run lua test/ltokei/main.lua src
run luai -a test/ltokei/main.lua
run luai -b test/ltokei/main.lua -o /home/waterrun/ltokei
sh_ 'cd /tmp && env -i ~/ltokei/ltokei ~/luainstaller-src/src'
sh_ 'cd ~/ltokei && find .luai/native | sort'
run lua test/firebird_web_sql/smoke_test.lua
run luai -a test/firebird_web_sql/server.lua
run luai -a test/firebird_web_sql/server.lua --max-deps 250
sh_ 'luai -t test/firebird_web_sql/server.lua --max-deps 250 | head -60'
sh_ 'time luai -b test/firebird_web_sql/server.lua -o /home/waterrun/websql --max-deps 250'
sh_ 'cd ~/websql && find . -maxdepth 3 | sort | head -40; du -sh .'
sh_ 'cd /tmp && (env -i FIREBIRD_WEB_SQL_PORT=9090 ~/websql/websql > /tmp/websql.log 2>&1 &) ; sleep 2; curl -s -i http://127.0.0.1:9090/ | head -8; echo; curl -s -H "X-Auth-Token: changeme_PLEASE" http://127.0.0.1:9090/api/tables | head -c 400; echo; cat /tmp/websql.log | head -5; pkill -f websql/websql'

say "artifacts"
cd ~ && tar czf /tmp/artifacts.tgz moon/build/moon moon/build/moon-onefile websql ltokei list/build/list dyn/build/dyn 2>/dev/null; ls -la /tmp/artifacts.tgz
