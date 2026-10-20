set -u
cd ~/luai-video-lab
rm -rf rocks
echo '$ luarocks install luainstaller   (--tree ~/luai-video-lab/rocks)'
( time luarocks --tree ~/luai-video-lab/rocks install luainstaller ) 2>&1
echo "--- bin"; ls -la rocks/bin
echo "--- luai -v"; rocks/bin/luai -v
echo "--- luainstaller version"; rocks/bin/luainstaller version
echo "--- luai -h"; rocks/bin/luai -h
echo "--- luainstaller help"; rocks/bin/luainstaller help
