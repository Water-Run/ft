# 在另一个干净的 Fedora 44 容器（没有 Lua、没有编译器）里运行构建产物
set -u
run() { echo; echo "\$ $*"; "$@" 2>&1; echo "[exit $?]"; }
mkdir -p /root/moon && tar xzf /lab/out/moon-build.tgz -C /root/moon && cd /root/moon
echo '$ lua -v'; bash -ic 'lua -v' 2>&1 | grep -v 'job control\|ioctl'; echo "[exit ${PIPESTATUS[0]}]"
cp /lab/moon/main.lua /root/moon/ 2>/dev/null
echo; echo '$ lua main.lua'; bash -ic 'lua main.lua' 2>&1 | grep -v 'job control\|ioctl'; echo "[exit ${PIPESTATUS[0]}]"
echo; echo '$ gcc --version'; bash -c 'gcc --version' 2>&1 | head -2
run ./build/moon/moon 2026-10-01
run ./build/moon-onefile 2026-10-01
run ./build/moon-onefile 2026-10-01
ls -la /tmp | grep luainstaller
