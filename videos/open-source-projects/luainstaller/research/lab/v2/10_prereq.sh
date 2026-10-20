# 构建前提的分步实验：只有 Lua → 加编译器 → 加头文件。干净的 fedora:44 容器，root 启动。
set -u
export LC_ALL=C.UTF-8
say() { echo; echo "### $*"; }
say "stage 1: lua + luarocks only"
dnf install -y -q lua luarocks util-linux which >/dev/null 2>&1; echo "dnf exit $?"
echo; echo '$ luarocks install luainstaller'; luarocks install luainstaller 2>&1; echo "[exit $?]"
useradd -m waterrun 2>/dev/null; cp -r /lab/moon /home/waterrun/moon; chown -R waterrun:waterrun /home/waterrun
U() { su waterrun -c "cd ~/moon && export LC_ALL=C.UTF-8 && $1" 2>&1; }
echo; echo '$ which cc gcc'; U 'which cc gcc'; echo "[exit $?]"
echo; echo '$ luai -a main.lua'; U 'luai -a main.lua'; echo "[exit $?]"
echo; echo '$ luai -b main.lua -o build/moon'; U 'luai -b main.lua -o build/moon'; echo "[exit $?]"
say "stage 2: + gcc (no Lua headers)"
dnf install -y -q gcc >/dev/null 2>&1; echo "dnf exit $?"
echo; echo '$ ls /usr/include/lua.h'; ls /usr/include/lua.h 2>&1; echo "[exit $?]"
echo; echo '$ luai -b main.lua -o build/moon'; U 'luai -b main.lua -o build/moon'; echo "[exit $?]"
say "stage 3: + lua-devel"
dnf install -y -q lua-devel >/dev/null 2>&1; echo "dnf exit $?"
echo; echo '$ luai -b main.lua -o build/moon'; U 'luai -b main.lua -o build/moon'; echo "[exit $?]"
echo; echo '$ env -i build/moon/moon 2026-10-01'; U 'env -i build/moon/moon 2026-10-01'; echo "[exit $?]"
