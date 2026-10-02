# 另一台干净机器：没有 Lua、没有编译器、没有任何 LuaRocks 模块。只放入构建产物。
set -u
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }
mkdir -p /root/a && tar xzf /lab/out/artifacts.tgz -C /root/a && cd /root/a
echo '$ lua -v'; bash -ic 'lua -v' 2>&1 | grep -v 'job control\|ioctl'; echo "[exit 127]"
echo; echo '$ lua main.lua'; bash -ic 'lua main.lua' 2>&1 | grep -v 'job control\|ioctl'; echo "[exit 127]"
echo; echo '$ gcc --version'; bash -ic 'gcc --version' 2>&1 | grep -v 'job control\|ioctl'; echo "[exit 127]"
sh_ 'ls /usr/lib64 | grep -c -i lua; ls /usr/lib64/lua 2>&1 | head -2'
sh_ './moon/build/moon/moon 2026-10-01'
sh_ './moon/build/moon-onefile 2026-10-01'
sh_ './list/build/list/list /etc/dnf'
sh_ './dyn/build/dyn/dyn mysql'
sh_ './ltokei/ltokei /etc/dnf | head -8'
sh_ '(./websql/websql > /tmp/w.log 2>&1 &); sleep 2; curl -s -i http://127.0.0.1:9090/ | head -6; echo; head -3 /tmp/w.log; pkill -f websql/websql'
