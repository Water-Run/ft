set -u
L=~/luai-video-lab; cd $L && tar xzf /tmp/luai-lab-in2.tgz
IMG=registry.fedoraproject.org/fedora:44
echo "======== P2"; podman run --rm --network host -v $L:/lab:Z $IMG bash /lab/14_prereq.sh > $L/out/out_14_prereq.txt 2>&1; echo "exit $?"
echo "======== X"; podman run --rm --network host -v $L:/lab:Z $IMG bash /lab/15_extra.sh > $L/out/out_15_extra.txt 2>&1; echo "exit $?"
echo "======== N"; podman run --rm --network host -v $L:/lab:Z $IMG bash /lab/16_nolib.sh > $L/out/out_16_nolib.txt 2>&1; echo "exit $?"
ls -la $L/out
