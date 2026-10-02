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
