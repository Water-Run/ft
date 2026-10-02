# 干净机器，并且把系统自带的 liblua（rpm 依赖它）也移开：验证产物不依赖系统里的任何 Lua
set -u
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }
mkdir -p /root/a /root/e && tar xzf /lab/out/artifacts.tgz -C /root/a && tar xzf /lab/out/extra.tgz -C /root/e && cd /root/a
sh_ 'ls /usr/lib64/liblua*'
mkdir -p /root/hidden && mv /usr/lib64/liblua* /root/hidden/
sh_ 'ls /usr/lib64/liblua* 2>&1; command -v lua gcc'
sh_ './moon/build/moon/moon 2026-10-01'
sh_ 'ldd ./moon/build/moon/moon | grep -i lua'
sh_ './moon/build/moon-onefile 2026-10-01'
sh_ './list/build/list/list /etc/dnf | cut -c1-60'
sh_ '(./websql/websql > /tmp/w.log 2>&1 &); sleep 2; curl -s -i http://127.0.0.1:9090/ | head -2; head -3 /tmp/w.log'
sh_ 'cd /root/e/moon && ./moon-srlua 2026-10-01'
sh_ 'cd /root/e/hello && ./hello'
sh_ 'cd /root/e/hello && ./build/hello2/hello2'
