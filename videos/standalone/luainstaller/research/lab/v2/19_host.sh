L=~/luai-video-lab; cd $L && cat > 18_more.sh < /tmp/luai-18.sh
podman run --rm --network host -v $L:/lab:Z registry.fedoraproject.org/fedora:44 bash /lab/18_more.sh > $L/out/out_18_more.txt 2>&1; echo "exit $?"; cat $L/out/out_18_more.txt
