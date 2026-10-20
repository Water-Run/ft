# 用法与行为的完整实验。干净的 fedora:44 容器，root 启动，演示以普通用户 waterrun 进行。
set -u
export LC_ALL=C.UTF-8
say() { echo; echo "### $*"; }
say "setup (root)"
dnf install -y -q lua lua-devel lua-static compat-lua-devel luarocks gcc make tar gzip which file util-linux binutils zlib-devel procps-ng >/dev/null 2>&1; echo "dnf exit $?"
lua -v; gcc --version | head -1; luarocks --version | head -1
for r in luainstaller luastatic luafilesystem lua-cjson pegasus; do echo; echo "\$ luarocks install $r"; luarocks install $r 2>&1 | grep -v "^$" | tail -4; echo "[exit ${PIPESTATUS[0]}]"; done
useradd -m waterrun 2>/dev/null
cp -r /lab/moon /home/waterrun/moon; cp /lab/srlua-103.tar.gz /home/waterrun/; cp -r /lab/luainstaller-src /home/waterrun/luainstaller-src
# 记录编译命令的包装器：名字仍叫 gcc，原样转交给真正的 gcc
mkdir -p /opt/ccwrap && cat > /opt/ccwrap/gcc <<'W'
#!/bin/sh
printf '%s\n' "gcc $*" >> /tmp/cc.log
exec /usr/bin/gcc "$@"
W
chmod +x /opt/ccwrap/gcc; touch /tmp/cc.log; chmod 666 /tmp/cc.log
# 5.1 的开发文件前缀（用于演示版本不匹配）
mkdir -p /opt/lua51/include /opt/lua51/lib && cp /usr/include/lua-5.1/*.h /opt/lua51/include/ && cp -P /usr/lib64/liblua-5.1.so* /opt/lua51/lib/ 2>/dev/null; ls /opt/lua51/include /opt/lua51/lib
chown -R waterrun:waterrun /home/waterrun
cp /lab/11_user.sh /tmp/11_user.sh; chmod 644 /tmp/11_user.sh
su waterrun -c 'bash /tmp/11_user.sh'
cp /tmp/artifacts.tgz /lab/out/artifacts.tgz 2>/dev/null; cp /tmp/cc.log /lab/out/cc.log 2>/dev/null; ls -la /lab/out
