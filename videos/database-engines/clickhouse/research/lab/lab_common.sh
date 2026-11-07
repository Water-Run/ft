# 各实验共用：容器、数据卷，启动与停止服务端，以及把查询连同结果写成终端样式的回显。
# 运行环境：一台 x86-64 的 Linux 物理机（Rocky Linux 10.2，8 线程，16 GB 内存），rootless Podman 运行官方镜像
#   docker.io/clickhouse/clickhouse-server:26.8.34.13（26.8 LTS）。数据放在命名卷里，容器内路径是标准的 /var/lib/clickhouse。
# 不发布端口：客户端在容器里运行，不与机器上已有的服务冲突。
# 用法：把本目录拷到机器上，逐个运行 bash NN_xxx.sh，标准输出就是 out_NN_xxx.txt。
set -euo pipefail
export LC_ALL=C.UTF-8
VERSION=26.8.34.13
IMG=docker.io/clickhouse/clickhouse-server:$VERSION
CT=ch-lab            # 容器名
VOL=ch-lab-data      # 数据卷
DATA=/var/lib/clickhouse

ch() { podman exec "$CT" clickhouse-client "$@"; }   # 不接标准输入：INSERT … VALUES 的数据写在查询里
inct() { podman exec -i "$CT" bash -c "$1"; }
alive() { ch -q "SELECT 1" >/dev/null 2>&1; }

start_server() {
  if ! podman container exists "$CT"; then
    podman run -d --name "$CT" --hostname clickhouse --memory 8g \
      --ulimit nofile=262144:262144 -v "$VOL:$DATA" "$IMG" >/dev/null
  elif [ "$(podman inspect -f '{{.State.Running}}' "$CT")" != true ]; then
    podman start "$CT" >/dev/null
  fi
  for _ in $(seq 1 240); do alive && return 0; sleep 0.5; done
  echo "服务端没有启动"; exit 1
}

stop_server() { podman stop -t 60 "$CT" >/dev/null; }

# q '查询' [附加参数…]：先打印提示符与查询，再打印结果，像在终端里执行一样。
q() {
  local sql=$1; shift
  printf ':) %s\n\n' "$sql"
  local fmt=(--format PrettyCompactMonoBlock)
  [[ " $* " == *" --format "* ]] && fmt=()
  ch "${fmt[@]}" "$@" -q "$sql" 2>&1 || true
  printf '\n'
}

# qv '查询'：只取结果的值（TSV，无表头），给脚本内部用。
qv() { ch --format TSVRaw -q "$1"; }

# sh_ '命令'：在容器里执行，打印 $ 提示符、命令与输出。
sh_() { printf '$ %s\n' "$1"; inct "$1" 2>&1 || true; printf '\n'; }

section() { printf '\n==== %s ====\n\n' "$1"; }

# 片段目录（容器内绝对路径）
part_path() { qv "SELECT path FROM system.parts WHERE database='$1' AND table='$2' AND name='$3'"; }
flush_logs() { ch -q "SYSTEM FLUSH LOGS"; }
