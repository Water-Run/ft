# 补充：用 LuaJIT 运行 luainstaller 会怎样；以及把 LuaJIT 指定为运行时发现的解释器会怎样。
set -u
export LC_ALL=C.UTF-8
dnf install -y -q lua lua-devel luarocks gcc make which util-linux luajit >/dev/null 2>&1; echo "dnf exit $?"
luarocks install luainstaller >/dev/null 2>&1; echo "luarocks exit $?"
useradd -m waterrun 2>/dev/null; cp -r /lab/moon /home/waterrun/moon; cp -r /lab/luainstaller-src /home/waterrun/luainstaller-src; chown -R waterrun:waterrun /home/waterrun
cat > /tmp/u.sh <<'USR'
set -u
export LC_ALL=C.UTF-8
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }
sh_ 'luajit -v'
cd ~/luainstaller-src
sh_ 'lua bin/luai.lua -v'
sh_ 'luajit bin/luai.lua -v'
sh_ 'luajit bin/luai.lua -a ~/moon/main.lua'
sh_ 'luajit bin/luai.lua -b ~/moon/main.lua -o /tmp/jit'
cd ~/moon
sh_ 'luai -b main.lua -o build/jit --lua /usr/bin/luajit -d runtime'
USR
chmod 644 /tmp/u.sh; su waterrun -c 'bash /tmp/u.sh'
