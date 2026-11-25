# 在 Linux 上按顺序重做全部实验（Redis 8.12.0 源码编译在 /tmp/redis-lab/redis-8.12.0，见 FACTS「取证环境」）。
# 回显写到同名的 out_*.txt。
cd "$(dirname "$0")"
for s in 01_environment 02_load 03_rehash 04_find 05_update 06_delete 07_concurrency 08_persist 09_crash 10_buckets; do
  bash "$s.sh" > "out_$s.txt" 2>&1
done
