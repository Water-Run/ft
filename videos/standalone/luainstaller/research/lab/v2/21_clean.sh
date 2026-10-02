# 另一台干净机器（没有 Lua、没有编译器、没有 LuaRocks 模块）：只放入 websql 目录包，启动并请求首页。
set -u
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }
mkdir -p /root/a && tar xzf /lab/out/web.tgz -C /root/a && cd /root/a
echo '$ lua -v'; bash -ic 'lua -v' 2>&1 | grep -v 'job control\|ioctl'; echo "[exit 127]"
sh_ 'ls /usr/lib64 | grep -c -i lua; ls /usr/share/lua 2>&1 | head -2'
echo; echo '$ ./websql/websql &'
./websql/websql > /tmp/w.log 2>&1 &
sleep 2; cat /tmp/w.log
sh_ 'curl -si http://127.0.0.1:9090/ | head -1'
sh_ 'curl -si http://127.0.0.1:9090/ | head -8'
pkill -f websql/websql; echo "[stopped]"
