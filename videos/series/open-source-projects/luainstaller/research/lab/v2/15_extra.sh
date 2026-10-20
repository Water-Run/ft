# 补充实验：默认输出位置、可复现、srlua 经 PATH 启动、单文件重建。root 启动，演示用 waterrun。
set -u
export LC_ALL=C.UTF-8
dnf install -y -q lua lua-devel lua-static luarocks gcc make tar gzip which util-linux >/dev/null 2>&1; echo "dnf exit $?"
luarocks install luainstaller >/dev/null 2>&1; echo "luarocks exit $?"
useradd -m waterrun 2>/dev/null; cp -r /lab/moon /home/waterrun/moon; cp /lab/srlua-103.tar.gz /home/waterrun/; chown -R waterrun:waterrun /home/waterrun
cat > /tmp/u.sh <<'USR'
set -u
export LC_ALL=C.UTF-8
say() { echo; echo "### $*"; }
run() { echo; echo "\$ $*"; "$@" 2>&1; echo "[exit $?]"; }
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }
cd ~/moon
say "default output location"
run luai -b main.lua
run env -i build/main/main 2026-10-01
sh_ 'rm -rf build'
say "reproducible"
sh_ 'luai -b main.lua -o build/r1/moon >/dev/null && luai -b main.lua -o build/r2/moon >/dev/null && sha256sum build/r1/moon/moon build/r2/moon/moon'
sh_ 'mkdir -p /tmp/elsewhere && cp -r main.lua moon /tmp/elsewhere/ && cd /tmp/elsewhere && luai -b main.lua -o build/moon >/dev/null && sha256sum build/moon/moon'
sh_ 'luai -b --file main.lua -o build/f1 >/dev/null && luai -b --file main.lua -o build/f2 >/dev/null && sha256sum build/f1 build/f2'
sh_ 'grep -c /home/waterrun build/r1/moon/.luai/manifest.lua; strings build/r1/moon/moon | grep -c /home/waterrun'
say "single file: rebuild after removing the old one"
sh_ 'luai -b --file main.lua -o build/f1'
sh_ 'rm build/f1 && luai -b --file main.lua -o build/f1'
say "srlua through PATH"
cd ~ && tar xzf srlua-103.tar.gz && cd srlua-103 && make LUA_TOPDIR=/usr LUA_LIBDIR=/usr/lib64 >/dev/null 2>&1
mkdir -p ~/hello ~/bin && cd ~/hello && echo 'print("hello from one script")' > hello.lua
run ~/srlua-103/srglue ~/srlua-103/srlua hello.lua hello
sh_ 'chmod +x hello && ./hello'
sh_ 'cp hello ~/bin/hello && cd /tmp && env PATH=/home/waterrun/bin:/usr/bin hello'
sh_ 'cd /tmp && /home/waterrun/bin/hello'
sh_ 'luai -b hello.lua -o build/hello2 >/dev/null && ln -sf ~/hello/build/hello2/hello2 ~/bin/hello2 && cd /tmp && env PATH=/home/waterrun/bin:/usr/bin hello2'
cd ~/moon && ~/srlua-103/srglue ~/srlua-103/srlua main.lua moon-srlua && chmod +x moon-srlua
luastatic_ok=0
tar czf /tmp/extra.tgz -C ~ hello/hello hello/build/hello2 moon/moon-srlua moon/main.lua moon/moon moon/build/r1/moon
USR
chmod 644 /tmp/u.sh; su waterrun -c 'bash /tmp/u.sh'; cp /tmp/extra.tgz /lab/out/extra.tgz
