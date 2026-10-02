# 补充：srlua 经 PATH 启动（月相程序）、解析搜索顺序、单文件进程号是否不变
set -u
export LC_ALL=C.UTF-8
dnf install -y -q lua lua-devel luarocks gcc make tar gzip which util-linux >/dev/null 2>&1; echo "dnf exit $?"
luarocks install luainstaller >/dev/null 2>&1; echo "luarocks exit $?"
useradd -m waterrun 2>/dev/null; cp -r /lab/moon /home/waterrun/moon; cp /lab/srlua-103.tar.gz /home/waterrun/; chown -R waterrun:waterrun /home/waterrun
cat > /tmp/u.sh <<'USR'
set -u
export LC_ALL=C.UTF-8
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }
cd ~ && tar xzf srlua-103.tar.gz && cd srlua-103 && make LUA_TOPDIR=/usr LUA_LIBDIR=/usr/lib64 >/dev/null 2>&1
mkdir -p ~/bin; cd ~/moon
sh_ '~/srlua-103/srglue ~/srlua-103/srlua main.lua moon-srlua && chmod +x moon-srlua && cp moon-srlua ~/bin/'
sh_ 'cd /tmp && env PATH=/home/waterrun/bin:/usr/bin moon-srlua 2026-10-01'
sh_ 'cd /tmp && /home/waterrun/bin/moon-srlua 2026-10-01 2>&1 | head -1'
rm -f moon-srlua
echo; echo "### search order"
sh_ 'printf "local m = require(\"moon.tides\")\n" > probe.lua && luai -a probe.lua; rm -f probe.lua'
echo; echo "### onefile process identity"
mkdir -p ~/pid && cd ~/pid
cat > main.lua <<'LUA'
local f = assert(io.open("/proc/self/stat"))
local pid = f:read("n"); f:close()
print("pid inside the program: " .. pid)
LUA
sh_ 'luai -b --file main.lua -o build/pid >/dev/null && luai -b main.lua -o build/piddir >/dev/null; ls build'
sh_ 'build/pid & echo "pid started by the shell: $!"; wait'
sh_ 'build/pid & echo "pid started by the shell: $!"; wait'
sh_ 'build/piddir/piddir & echo "pid started by the shell: $!"; wait'
USR
chmod 644 /tmp/u.sh; su waterrun -c 'bash /tmp/u.sh'
