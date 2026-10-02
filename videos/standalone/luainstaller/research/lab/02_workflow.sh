set -u
export PATH=~/luai-video-lab/rocks/bin:$PATH
export LC_ALL=C.UTF-8
cd ~/luai-video-lab/moon
rm -rf build
run() { echo; echo "\$ $*"; ( time "$@" ) 2>&1; echo "[exit $?]"; }
run lua main.lua 2026-10-01
run luai -a main.lua
run luainstaller analyze main.lua
run luai -t main.lua
run luai -b main.lua -o build/moon
echo; echo '$ find build/moon | sort'; find build/moon -printf '%p  %s bytes\n' | sort
run env -u LUA_PATH -u LUA_CPATH build/moon/moon 2026-10-01
echo; echo '$ env -i build/moon/moon 2026-10-01 (empty environment, no PATH)'; env -i build/moon/moon 2026-10-01; echo "[exit $?]"
run luai -b --file main.lua -o build/moon-onefile
echo; ls -la build/
run env -i build/moon-onefile 2026-10-01
run env -i build/moon-onefile 2026-10-01
run file build/moon/moon build/moon-onefile
run ldd build/moon/moon
run ldd build/moon-onefile
echo; echo '$ cat build/moon/.luai/manifest.lua'; cat build/moon/.luai/manifest.lua
echo; echo '$ head -40 build/moon/.luai/generated-output.txt'; head -40 build/moon/.luai/generated-output.txt
echo; echo '$ wc build/moon/.luai/build/*'; wc -lc build/moon/.luai/build/*
run luainstaller build main.lua -o build/moon2 --verbose
run luainstaller logs --limit 5
