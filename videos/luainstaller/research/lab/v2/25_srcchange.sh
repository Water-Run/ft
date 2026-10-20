# 补充：构建期间源文件被改动（由编译器包装脚本在编译 launcher.c 的那一刻追加一行注释），预期 SourceChangedError，且旧产物不动。
set -u
export LC_ALL=C.UTF-8
dnf install -y -q lua lua-devel luarocks gcc make which util-linux >/dev/null 2>&1; echo "dnf exit $?"
luarocks install luainstaller >/dev/null 2>&1; echo "luarocks exit $?"
useradd -m waterrun 2>/dev/null; cp -r /lab/moon /home/waterrun/moon; chown -R waterrun:waterrun /home/waterrun
mkdir -p /opt/edit && cat > /opt/edit/gcc <<'W'
#!/bin/sh
# 名字仍叫 gcc：在编译 launcher.c 的那一刻改动一个源文件，然后原样转交给真正的 gcc
case "$*" in *launcher.c*) [ -e /tmp/edited ] || { echo "-- edited during the build" >> /home/waterrun/moon/moon/names.lua; touch /tmp/edited; } ;; esac
exec /usr/bin/gcc "$@"
W
chmod +x /opt/edit/gcc
cat > /tmp/u.sh <<'USR'
set -u
export LC_ALL=C.UTF-8
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }
cd ~/moon
sh_ 'luai -b main.lua -o build/moon && sha256sum build/moon/moon'
sh_ 'sha256sum moon/names.lua'
sh_ 'LUAI_CC=/opt/edit/gcc luai -b main.lua -o build/moon'
sh_ 'sha256sum moon/names.lua; tail -1 moon/names.lua'
sh_ 'sha256sum build/moon/moon; ls -a build'
sh_ 'env -i build/moon/moon 2026-10-01'
sh_ 'luai -b main.lua -o build/moon && sha256sum build/moon/moon'
USR
chmod 644 /tmp/u.sh; su waterrun -c 'bash /tmp/u.sh'
