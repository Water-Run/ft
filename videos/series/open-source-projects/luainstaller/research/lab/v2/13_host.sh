set -u
L=~/luai-video-lab; rm -rf $L; mkdir -p $L/out
cd $L && tar xzf /tmp/luai-lab-in.tgz
( cd ~/Project/luainstaller && mkdir -p $L/luainstaller-src && git archive HEAD | tar -x -C $L/luainstaller-src )
IMG=registry.fedoraproject.org/fedora:44
podman pull -q $IMG >/dev/null
echo "======== P: prerequisites"
podman run --rm --network host -v $L:/lab:Z $IMG bash /lab/10_prereq.sh > $L/out/out_10_prereq.txt 2>&1; echo "exit $?"
echo "======== A: usage"
podman run --rm --network host -v $L:/lab:Z $IMG bash /lab/11_usage.sh > $L/out/out_11_usage.txt 2>&1; echo "exit $?"
echo "======== B: clean machine"
podman run --rm --network host -v $L:/lab:Z $IMG bash /lab/12_clean.sh > $L/out/out_12_clean.txt 2>&1; echo "exit $?"
ls -la $L/out
