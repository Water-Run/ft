set -u; L=~/luai-video-lab; ls $L | head -30; mkdir -p $L/out
cat > $L/20_web.sh <<'EOS20'
# 补充：仓库自带的示例服务，不带 --max-deps 构建（17 个脚本 + 2 个库，默认上限 36 足够），记录耗时。
set -u
export LC_ALL=C.UTF-8
dnf install -y -q lua lua-devel lua-static luarocks gcc make tar gzip which file util-linux binutils zlib-devel procps-ng >/dev/null 2>&1; echo "dnf exit $?"
for r in luainstaller lua-cjson pegasus; do luarocks install $r >/dev/null 2>&1; echo "luarocks $r exit $?"; done
useradd -m waterrun 2>/dev/null; cp -r /lab/luainstaller-src /home/waterrun/luainstaller-src; chown -R waterrun:waterrun /home/waterrun
cat > /tmp/u.sh <<'USR'
set -u
export LC_ALL=C.UTF-8
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }
cd ~/luainstaller-src
sh_ 'luai -a test/firebird_web_sql/server.lua | head -4'
sh_ 'time luai -b test/firebird_web_sql/server.lua -o ~/websql'
sh_ 'time luai -b test/firebird_web_sql/server.lua -o ~/websql2'
sh_ 'sha256sum ~/websql/websql ~/websql2/websql; ls -l ~/websql/websql; du -sh ~/websql; find ~/websql/.luai/native | sort'
cd ~ && tar czf /tmp/web.tgz websql
USR
chmod 644 /tmp/u.sh; su waterrun -c 'bash /tmp/u.sh'; cp /tmp/web.tgz /lab/out/web.tgz
EOS20
cat > $L/21_clean.sh <<'EOS21'
# 另一台干净机器（没有 Lua、没有编译器、没有 LuaRocks 模块）：只放入 websql 目录包，启动并请求首页。
set -u
sh_() { echo; echo "\$ $1"; bash -c "$1" 2>&1; echo "[exit $?]"; }
mkdir -p /root/a && tar xzf /lab/out/web.tgz -C /root/a && cd /root/a
echo '$ lua -v'; bash -ic 'lua -v' 2>&1 | grep -v 'job control\|ioctl'; echo "[exit 127]"
sh_ 'ls /usr/lib64 | grep -c -i lua; ls /usr/share/lua 2>&1 | head -2'
echo; echo '$ ./websql/websql &'
./websql/websql > /tmp/w.log 2>&1 &
sleep 2; cat /tmp/w.log
sh_ 'curl -si http://127.0.0.1:9090/ | head -1'
sh_ 'curl -si http://127.0.0.1:9090/ | head -8'
pkill -f websql/websql; echo "[stopped]"
EOS21
IMG=registry.fedoraproject.org/fedora:44
podman image exists $IMG || podman pull -q $IMG >/dev/null
ls -d $L/luainstaller-src >/dev/null && echo src-ok
( podman run --rm --network host -v $L:/lab:Z $IMG bash /lab/20_web.sh > $L/out/out_20_web.txt 2>&1; echo "A exit $?" >> $L/out/out_20_web.txt
  podman run --rm --network host -v $L:/lab:Z $IMG bash /lab/21_clean.sh > $L/out/out_21_clean.txt 2>&1; echo "B exit $?" >> $L/out/out_21_clean.txt; touch $L/out/web.done ) > /dev/null 2>&1 < /dev/null &
disown; echo started
