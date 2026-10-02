set -u
L=~/luai-video-lab; mkdir -p $L/screen/out
rm -rf $L/screen/moon $L/screen/luainstaller-src
cp -r $L/moon $L/screen/moon && rm -rf $L/screen/moon/build $L/screen/moon/alt
cp $L/srlua-103.tar.gz $L/screen/
mkdir -p $L/screen/luainstaller-src && ( cd ~/Project/luainstaller && git archive HEAD | tar -x -C $L/screen/luainstaller-src )
cp $L/05.sh $L/06.sh $L/screen/
echo "======== container A: build machine"
podman run --rm --network host -v $L/screen:/lab:Z registry.fedoraproject.org/fedora:44 bash /lab/05.sh
echo "======== container B: clean machine, no Lua"
podman run --rm --network host -v $L/screen:/lab:Z registry.fedoraproject.org/fedora:44 bash /lab/06.sh
