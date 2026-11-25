# 环境与缺省配置：版本、系统、不带配置文件启动时的缺省值、进程里有几个线程
source "$(dirname "$0")/lab_common.sh"
fresh; start

section "版本与系统"
"$R/redis-server" --version
uname -srm
grep -m1 'model name' /proc/cpuinfo
printf 'CPU 核数：%s\n' "$(nproc)"
sha256sum /tmp/redis-lab/redis-8.12.0.tar.gz | sed 's#/tmp/redis-lab/##'
info server 'redis_version|redis_mode|os|arch_bits|multiplexing_api|gcc_version|process_id' | sed 's/process_id:.*/process_id:PID/'

section "不带配置文件启动时的缺省值"
for k in save appendonly appendfsync appenddirname dbfilename aof-use-rdb-preamble hash-max-listpack-entries hash-max-listpack-value hash-min-template-entries io-threads maxmemory maxmemory-policy hz activerehashing lazyfree-lazy-user-del aof-load-truncated; do
  cq CONFIG GET "$k" | paste -sd' '
done

section "一个空的 Redis 进程里的线程（ps -T）"
ps -T -p "$(pid)" -o comm= | sort | uniq -c
info memory 'used_memory|used_memory_human|mem_allocator'
info threads 'io_thread_[0-9]+' || echo '（INFO threads 没有 IO 线程）'
info server 'io_threads_active' || true
info stats 'io_threads_active' || true

stop
