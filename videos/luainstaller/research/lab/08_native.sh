set -u
export PATH=~/luai-video-lab/rocks/bin:$PATH
export LC_ALL=C.UTF-8
eval "$(luarocks path)"
rm -rf ~/luai-video-lab/native && mkdir -p ~/luai-video-lab/native && cd ~/luai-video-lab/native
cat > main.lua <<'LUA'
-- list: print the entries of a directory, using LuaFileSystem (a C module).
local lfs = require("lfs")

local dir = arg[1] or "."
local names = {}
for name in lfs.dir(dir) do
    if name ~= "." and name ~= ".." then
        names[#names + 1] = name
    end
end
table.sort(names)
print(table.concat(names, "  "))
LUA
run() { echo; echo "\$ $*"; "$@" 2>&1; echo "[exit $?]"; }
echo '$ cat main.lua'; cat main.lua; echo '[exit 0]'
run lua main.lua /usr/share/lua
run luai -a main.lua
run luai -t main.lua
run luai -b main.lua -o build/list
echo; echo '$ find build/list/.luai/native'; ( cd build/list && find .luai/native | sort ); echo '[exit 0]'
run env -i build/list/list /usr/share/lua
run ldd build/list/.luai/native/lfs.so
