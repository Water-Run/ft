set -u
export PATH=~/luai-video-lab/rocks/bin:$PATH
export LC_ALL=C.UTF-8
cd ~/luai-video-lab/moon
echo "===== reproducible: same source built twice, different output dirs ====="
rm -rf build/r1 build/r2
luai -b main.lua -o build/r1/moon >/dev/null; luai -b main.lua -o build/r2/moon >/dev/null
sha256sum build/r1/moon/moon build/r2/moon/moon build/moon/moon
sha256sum build/r1/moon/.luai/manifest.lua build/r2/moon/.luai/manifest.lua
sha256sum build/r1/moon/.luai/build/launcher.c build/r2/moon/.luai/build/launcher.c
echo "--- copy project elsewhere and build there"
rm -rf /tmp/luai-lab-copy && mkdir -p /tmp/luai-lab-copy && cp -r main.lua moon /tmp/luai-lab-copy/ && ( cd /tmp/luai-lab-copy && luai -b main.lua -o build/moon >/dev/null && sha256sum build/moon/moon build/moon/.luai/manifest.lua )
grep -c "/home/waterrun" build/moon/.luai/manifest.lua; strings build/moon/moon | grep -c "/home/waterrun"
echo "--- onefile twice"
rm -f build/of1 build/of2; luai -b --file main.lua -o build/of1 >/dev/null; luai -b --file main.lua -o build/of2 >/dev/null; sha256sum build/of1 build/of2 build/moon-onefile
echo
echo "===== onefile extraction location ====="
strace -f -e trace=openat,mkdirat,mkdir,execve -o /tmp/luai-of.strace build/moon-onefile 2026-10-01
grep -E "execve|mkdir" /tmp/luai-of.strace | head -20
grep -o '"/[^"]*luai[^"]*"' /tmp/luai-of.strace | sort -u | head -20
echo "--- cache dir"
d=$(grep -o '"/[^"]*luainstaller[^"]*"' /tmp/luai-of.strace | head -1 | tr -d '"'); echo "$d"
ls -la /tmp | grep -i luai | head; 
find /tmp -maxdepth 3 -path '*luai*' -not -path '*lab-copy*' 2>/dev/null | head -30
echo
echo "===== dynamic require ====="
mkdir -p /tmp/luai-dyn && cd /tmp/luai-dyn && printf 'local name = arg[1] or "a"\nlocal m = require("drivers." .. name)\nprint(m)\n' > main.lua && mkdir -p drivers && echo 'return "driver a"' > drivers/a.lua
echo '$ cat main.lua'; cat main.lua
echo '$ luai -a main.lua'; luai -a main.lua; echo "[exit $?]"
echo '$ luai -a main.lua -d runtime -- a'; luai -a main.lua -d runtime -- a; echo "[exit $?]"
echo '$ luai -a main.lua -d manual --include drivers/a.lua'; luai -a main.lua -d manual --include drivers/a.lua; echo "[exit $?]"
echo
echo "===== library API ====="
cd ~/luai-video-lab/moon
cat > /tmp/luai-api.lua <<'LUA'
local luainstaller = require("luainstaller")
local result = luainstaller.bundle({ entry = "main.lua", out = "build/api/moon" })
if result.ok then print("built " .. result.executable) else print(result.error.type .. ": " .. result.error.message) end
print(luainstaller.VERSION)
LUA
eval "$(luarocks --tree ~/luai-video-lab/rocks path)"; lua /tmp/luai-api.lua
echo
echo "===== timing: build x5 ====="
for i in 1 2 3; do rm -rf build/t; /usr/bin/time -f "%e s" luai -b main.lua -o build/t/moon >/dev/null; done 2>&1
echo "===== sizes ====="
stat -c '%n %s' build/moon/moon build/moon-onefile build/moon/.luai/native/liblua-5.4.so alt/moon-luastatic alt/moon-srlua
du -sb build/moon
cc --version | head -1; uname -srm; cat /etc/fedora-release
