#!/usr/bin/env bash
# 从空数据卷按顺序完整重跑 01–12：每个实验的标准输出存成 rerun/out_NN_<名>.txt，全部跑完后写 rerun/DONE。
# 用法（在机器上，lab 目录里）：nohup bash run_all.sh --fresh >/dev/null 2>&1 &
#   --fresh：先删掉本片自己的容器 ch-lab 与数据卷 ch-lab-data（只删这两个名字），再从头来。
# 第一次（2026-11-07）逐个手动运行，08 中途卡住；这个脚本是第二次的完整重跑（2026-11-08）。
set -u
cd "$(dirname "$0")"
CT=ch-lab; VOL=ch-lab-data
if [ "${1:-}" = "--fresh" ]; then
  podman rm -f "$CT" >/dev/null 2>&1 || true
  podman volume rm -f "$VOL" >/dev/null 2>&1 || true
fi
rm -rf rerun; mkdir -p rerun
date '+开始 %F %T' > rerun/START
for f in [0-9][0-9]_*.sh; do
  n=${f%.sh}
  echo "$(date +%T) $f" >> rerun/PROGRESS
  bash "$f" > "rerun/out_${n}.txt" 2>&1 || echo "失败: $f" >> rerun/failures.txt
done
date '+结束 %F %T' > rerun/DONE
