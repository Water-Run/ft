# 构建前提的分步实验（修正版）：只装 lua（不装 luarocks，因为它会连带装上 gcc 与 lua-devel），用源码目录自带的安装器
set -u
export LC_ALL=C.UTF-8
say() { echo; echo "### $*"; }
say "stage 1: only the Lua interpreter"
dnf install -y -q lua util-linux which >/dev/null 2>&1; echo "dnf exit $?"
useradd -m waterrun 2>/dev/null; cp -r /lab/moon /home/waterrun/moon; cp -r /lab/luainstaller-src /home/waterrun/luainstaller-src; chown -R waterrun:waterrun /home/waterrun
U() { su waterrun -c "cd ~/moon && export LC_ALL=C.UTF-8 PATH=/home/waterrun/luainstaller/bin:\$PATH && $1" 2>&1; }
echo; echo '$ which cc gcc luarocks'; U 'which cc gcc luarocks'; echo "[exit $?]"
echo; echo '$ ls /usr/include/lua.h'; ls /usr/include/lua.h 2>&1; echo "[exit $?]"
echo; echo '$ lua tools/install.lua --prefix /home/waterrun/luainstaller'; su waterrun -c 'cd ~/luainstaller-src && lua tools/install.lua --prefix /home/waterrun/luainstaller' 2>&1; echo "[exit $?]"
echo; echo '$ luai -v'; U 'luai -v'; echo "[exit $?]"
echo; echo '$ luai -a main.lua'; U 'luai -a main.lua'; echo "[exit $?]"
echo; echo '$ luai -b main.lua -o build/moon'; U 'luai -b main.lua -o build/moon'; echo "[exit $?]"
say "stage 2: + a C compiler, still no Lua headers"
dnf install -y -q gcc >/dev/null 2>&1; echo "dnf exit $?"
echo; echo '$ which cc gcc'; U 'which cc gcc'; echo "[exit $?]"
echo; echo '$ ls /usr/include/lua.h'; ls /usr/include/lua.h 2>&1; echo "[exit $?]"
echo; echo '$ luai -b main.lua -o build/moon'; U 'luai -b main.lua -o build/moon'; echo "[exit $?]"
say "stage 3: + Lua headers and library (lua-devel)"
dnf install -y -q lua-devel >/dev/null 2>&1; echo "dnf exit $?"
echo; echo '$ luai -b main.lua -o build/moon'; U 'luai -b main.lua -o build/moon'; echo "[exit $?]"
echo; echo '$ env -i build/moon/moon 2026-10-01'; U 'env -i build/moon/moon 2026-10-01'; echo "[exit $?]"
