set -u; L=~/luai-video-lab; rm -f $L/out/lsp.done
cat > $L/27_luastatic_path.sh <<'EOS27'
# 补充：luastatic 的产物只用名字、经 PATH 启动（对照表「经 PATH 启动」一格的依据）。
set -u
export LC_ALL=C.UTF-8
dnf install -y -q lua lua-devel lua-static luarocks gcc make which util-linux >/dev/null 2>&1; echo "dnf exit $?"
luarocks install luastatic >/dev/null 2>&1; echo "luarocks exit $?"
useradd -m waterrun 2>/dev/null; cp -r /lab/moon /home/waterrun/moon; chown -R waterrun:waterrun /home/waterrun
cat > /tmp/u.sh <<'USR'
set -u
export LC_ALL=C.UTF-8
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }
cd ~/moon && mkdir -p ~/bin
sh_ 'luastatic main.lua moon/phase.lua moon/julian.lua moon/names.lua /usr/lib64/liblua.a >/dev/null 2>&1; ls -l main'
sh_ 'cp main ~/bin/moon-static && cd /tmp && env PATH=/home/waterrun/bin:/usr/bin moon-static 2026-10-01'
sh_ 'ldd main'
USR
chmod 644 /tmp/u.sh; su waterrun -c 'bash /tmp/u.sh'
EOS27
IMG=registry.fedoraproject.org/fedora:44
( podman run --rm --network host -v $L:/lab:Z $IMG bash /lab/27_luastatic_path.sh > $L/out/out_27_luastatic_path.txt 2>&1; echo "exit $?" >> $L/out/out_27_luastatic_path.txt; touch $L/out/lsp.done ) > /dev/null 2>&1 < /dev/null &
disown; echo started
