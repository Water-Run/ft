# 取得官方构建的 mongod 9.0.8、mongosh 2.14.2，校验 SHA-256；从 r9.0.8 标签的源码编译 WiredTiger 命令行工具 wt（带 snappy；开诊断模式，verify 才能逐页打印内容）。
# 只下载与编译，不需要 root：snappy 的头文件与库用 apt-get download 取包后解到 $LAB/snappy。
source "$(dirname "$0")/lab_common.sh"
mkdir -p "$LAB"; cd "$LAB"

section "系统"
sh_ 'uname -srm; . /etc/os-release; echo "$PRETTY_NAME"; gcc --version | head -1; cmake --version | head -1'

section "MongoDB $VERSION（官方 ubuntu2404 构建）"
TGZ=mongodb-linux-x86_64-ubuntu2404-$VERSION.tgz
[ -f "$TGZ" ] || curl -sSfLO "https://fastdl.mongodb.org/linux/$TGZ"
[ -d "$MDIR" ] || tar xzf "$TGZ"
sh_ "sha256sum $TGZ"
echo "官方 current.json 给出的 SHA-256：834da9b0eb7cd5dcd95f69a56f3a249505307e12026f7b0951d5e502dde4b26a"
echo
sh_ 'mongod --version'

section "mongosh $MSH_VERSION"
STGZ=mongosh-$MSH_VERSION-linux-x64.tgz
[ -f "$STGZ" ] || curl -sSfLO "https://downloads.mongodb.com/compass/$STGZ"
[ -d "$SDIR" ] || tar xzf "$STGZ"
sh_ "sha256sum $STGZ"
sh_ 'mongosh --version'

section "源码：mongodb/mongo 标签 r$VERSION（只取存储引擎相关的目录）"
if [ ! -d src/.git ]; then
  git clone -q --filter=blob:none --no-checkout --depth 1 --branch "r$VERSION" https://github.com/mongodb/mongo.git src
  git -C src sparse-checkout set --no-cone /src/third_party/wiredtiger /src/mongo/db/storage /src/mongo/db/record_id.h /src/mongo/db/record_id_helpers.cpp /src/mongo/bson /src/mongo/db/exec /src/mongo/db/query/write_ops /src/mongo/db/catalog /src/mongo/db/concurrency
  git -C src checkout -q
fi
sh_ 'git -C src log -1 --format="%H %cd" --date=iso-strict'
sh_ 'cat src/src/third_party/wiredtiger/import.data'

section "WiredTiger 源码：wiredtiger/wiredtiger 的同一提交（MongoDB 自带的副本按 Bazel 构建，没有 CMakeLists.txt）"
WTC=$(python3 -c 'import json;print(json.load(open("src/src/third_party/wiredtiger/import.data"))["commit"])')
if [ ! -d wtsrc/.git ]; then
  mkdir -p wtsrc && git -C wtsrc init -q && git -C wtsrc remote add origin https://github.com/wiredtiger/wiredtiger.git
  git -C wtsrc fetch -q --depth 1 origin "$WTC" && git -C wtsrc checkout -q FETCH_HEAD
fi
sh_ 'git -C wtsrc log -1 --format="%H %cd" --date=iso-strict'
sh_ 'diff -rq wtsrc/src src/src/third_party/wiredtiger/src && echo "src/ 目录与 MongoDB 自带的副本逐文件相同"'

section "snappy（只解包，不安装）"
if [ ! -d snappy ]; then
  mkdir -p snappy-deb && (cd snappy-deb && apt-get download libsnappy1v5 libsnappy-dev >/dev/null 2>&1)
  for d in snappy-deb/*.deb; do dpkg -x "$d" snappy; done
  rm -rf snappy/usr/lib/x86_64-linux-gnu/cmake   # 包里的 CMake 配置写死了 /usr 下的路径，删掉后改按头文件与库文件查找
fi
sh_ 'ls snappy-deb'

section "编译 wt"
if [ ! -x "$WTDIR/bin/wt" ]; then
  cmake -S wtsrc -B wt-build -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=RelWithDebInfo \
    -DENABLE_PYTHON=0 -DENABLE_STATIC=1 -DENABLE_SHARED=0 -DHAVE_BUILTIN_EXTENSION_SNAPPY=1 \
    -DCMAKE_PREFIX_PATH="$LAB/snappy/usr" -DCMAKE_C_FLAGS="-I$LAB/snappy/usr/include" -DCMAKE_EXE_LINKER_FLAGS="-L$LAB/snappy/usr/lib/x86_64-linux-gnu" -DCMAKE_INSTALL_PREFIX="$WTDIR" -DENABLE_STRICT=0 -DHAVE_UNITTEST=0 -DHAVE_DIAGNOSTIC=1 > wt-cmake.log 2>&1
  make -C wt-build -j"$(nproc)" wt > wt-make.log 2>&1
  mkdir -p "$WTDIR/bin" "$WTDIR/lib"; cp wt-build/wt "$WTDIR/bin/wt"; cp -a snappy/usr/lib/x86_64-linux-gnu/libsnappy.so.1* "$WTDIR/lib/"
fi
sh_ 'wt -V'
