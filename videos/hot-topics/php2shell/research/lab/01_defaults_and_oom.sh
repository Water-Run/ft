#!/bin/sh
# 在干净的官方容器里查看修复前最后一版 PHP 8.5.11：
#   1. 版本；2. 与本次漏洞相关的几项缺省配置（容器里没有 php.ini，取的是内置缺省值）；
#   3. 内存超限时的行为：同一段脚本先分配一大块内存，超出 memory_limit。
# 用法：sh 01_defaults_and_oom.sh > out_01_defaults_and_oom.txt 2>&1
set -u
for v in 8.5.11; do   # 8.5.12 的 linux/amd64 官方镜像在取证时（2026-10-22）尚未发布
  img="php:${v}-cli"
  echo "===== ${img} ====="
  docker run --rm "$img" php -v | head -1
  docker run --rm "$img" php -r 'foreach (["session.upload_progress.enabled","session.upload_progress.name","memory_limit","post_max_size","max_file_uploads","fatal_error_backtraces"] as $k) printf("%-34s %s\n", $k, var_export(ini_get($k), true));'
  echo "--- OOM: memory_limit=16M, str_repeat 64 MiB, then echo after ---"
  docker run --rm "$img" php -d memory_limit=16M -d display_errors=stderr -r 'register_shutdown_function(function(){ echo "[shutdown function ran]\n"; }); $a = str_repeat("A", 64*1024*1024); echo "after\n";'
  echo "exit code: $?"
  echo
done
