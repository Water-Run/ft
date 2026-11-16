# 各实验共用：版本、目录，启动与停止 mongod，以及把命令连同结果写成终端样式的回显。
# 运行环境：WSL2 里的 Ubuntu 24.04（x86-64），官方构建的 MongoDB 9.0.8 Community（ubuntu2404 tgz）与 mongosh 2.14.2；
#   不用系统包，不需要 root。所有文件放在 $LAB（缺省 ~/mongolab），每个实验从一个新的空数据目录开始。
# 用法：bash NN_xxx.sh > out_NN_xxx.txt（run_all.sh 依次运行全部）。先运行一次 01_environment.sh 取得二进制与 wt 工具。
set -euo pipefail
export LC_ALL=C.UTF-8 TZ=UTC
VERSION=9.0.8
MSH_VERSION=2.14.2
LAB=${LAB:-$HOME/mongolab}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
MDIR=$LAB/mongodb-linux-x86_64-ubuntu2404-$VERSION
SDIR=$LAB/mongosh-$MSH_VERSION-linux-x64
WTDIR=$LAB/wt                       # 由 01 从同版本源码编译的 WiredTiger 命令行工具
export PATH=$MDIR/bin:$SDIR/bin:$WTDIR/bin:$PATH
export LD_LIBRARY_PATH=$WTDIR/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}
PORT=${PORT:-27917}                 # 不用缺省端口，避免与本机已有的服务冲突
DB=db                               # 数据目录（相对 $LAB），回显里的路径因此是干净的相对路径

section() { printf '\n==== %s ====\n\n' "$1"; }

fresh() { cd "$LAB"; rm -rf "$DB" "$DB.log"; mkdir -p "$DB"; }   # 一个新的空数据目录

# start [附加参数…]：后台启动 mongod，等到能连上为止
start() {
  cd "$LAB"
  mongod --dbpath "$DB" --port "$PORT" --bind_ip 127.0.0.1 --logpath "$DB.log" --logappend --fork "$@" >/dev/null
  for _ in $(seq 1 200); do mongosh --quiet --port "$PORT" --eval 1 >/dev/null 2>&1 && return 0; sleep 0.1; done
  echo "mongod 没有启动"; tail -20 "$DB.log"; exit 1
}
stop() { mongosh --quiet --port "$PORT" admin --eval 'db.shutdownServer()' >/dev/null 2>&1 || true; wait_gone; }
wait_gone() { for _ in $(seq 1 300); do pgrep -f "mongod --dbpath $DB --port $PORT" >/dev/null || return 0; sleep 0.1; done; echo "mongod 没有退出"; exit 1; }
pid() { pgrep -f "mongod --dbpath $DB --port $PORT"; }

# m 'JS'：像在 mongosh 里输入一样，先打印提示符与输入，再打印结果
m() { printf 'lab> %s\n' "$1"; mongosh --quiet --port "$PORT" lab --eval "$1" 2>&1 || true; printf '\n'; }
# mv_ 'JS'：只取结果，给脚本内部用
mv_() { mongosh --quiet --port "$PORT" lab --eval "$1"; }
# sh_ '命令'：打印 $ 提示符、命令与输出（在 $LAB 里执行）
sh_() { printf '$ %s\n' "$1"; (cd "$LAB" && bash -c "$1") 2>&1 || true; printf '\n'; }

# 本系列的 4096 个用户，按注册顺序 1..4096 写入；Alice 是第 2050 个、42 岁；其他人姓名为 50 字节的演示串，年龄 18 + i % 63。
# 文档里不写 _id：由驱动（mongosh 内置的 Node.js 驱动）生成 ObjectId，所以每次重做 _id 的值都不同。
LOAD_JS='
const docs = [];
for (let i = 1; i <= 4096; i++) {
  docs.push(i === 2050
    ? { name: "Alice", age: 42 }
    : { name: "User" + String(i).padStart(5, "0") + "-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN", age: 18 + i % 63 });
}
db.users.insertMany(docs).insertedIds.length'

# 准备好 4096 个用户与姓名索引（一个新的空库）
load() { fresh; start "$@"; mv_ "$LOAD_JS" >/dev/null; mv_ 'db.users.createIndex({ name: 1 })' >/dev/null; idents; }
# 记下集合与两个索引的 ident、Alice 的 ObjectId：COLL、ID_IDX、NAME_IDX、ALICE_OID_HEX
idents() {
  mv_ 'const s = db.users.stats({ indexDetails: true }); const id = (u) => u.replace("statistics:table:", "");
print("COLL=" + id(s.wiredTiger.uri)); print("ID_IDX=" + id(s.indexDetails._id_.uri)); print("NAME_IDX=" + id(s.indexDetails.name_1.uri));
print("ALICE_OID_HEX=" + db.users.findOne({ name: "Alice" })._id.toHexString())' > "$LAB/idents.sh"
  source "$LAB/idents.sh"
}
# wt 在数据目录的副本上运行（wt 打开数据库时会做恢复与检查点，不碰 mongod 的原目录）
WTC='log=(enabled=true,path=journal,compressor=snappy)'
snap() { rm -rf "$LAB/wtcopy"; cp -a "$LAB/$DB" "$LAB/wtcopy"; }
w() { printf '$ wt %s\n' "$*"; (cd "$LAB/wtcopy" && wt -C "$WTC" "$@" 2>&1 | grep -v 'NOTICE\|scratch buffer') || true; printf '\n'; }
wq() { (cd "$LAB/wtcopy" && wt -C "$WTC" "$@" 2>/dev/null) || true; }   # 只取结果
# 集合文件里空着、可以复用的字节数（WiredTiger 块管理器的统计）
REUSE='db.users.stats().wiredTiger["block-manager"]["file bytes available for reuse"]'
