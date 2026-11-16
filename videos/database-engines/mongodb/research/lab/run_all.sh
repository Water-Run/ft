# 依次重做全部实验，回显写到同名的 out_NN_xxx.txt。02 与 03 必须连着跑（03 读 02 留下的数据目录）。
set -euo pipefail
cd "$(dirname "$0")"
for s in 01_environment 02_load 03_pages 04_find 05_update 06_delete 07_crash 08_concurrency 09_schema; do
  echo "== $s"; bash "$s.sh" > "out_$s.txt" 2>&1
done
