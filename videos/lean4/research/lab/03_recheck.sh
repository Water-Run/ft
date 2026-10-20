#!/bin/sh
# 用工具链自带的 leanchecker 把编译结果重新交给内核：
#   第一次只重放 SumOdd.Proof 自己新增的声明；第二次（--fresh）从空环境起，重放它导入的全部声明。
# 没有输出、退出码为 0 即全部通过。耗时取决于机器，这里只作记录。
cd "$(dirname "$0")/proof" || exit 1
{
  echo '$ lake env leanchecker SumOdd.Proof'
  s=$(date +%s); lake env leanchecker SumOdd.Proof; echo "[exit $?] [$(( $(date +%s) - s )) s]"
  echo '$ lake env leanchecker --fresh SumOdd.Proof'
  s=$(date +%s); lake env leanchecker --fresh SumOdd.Proof; echo "[exit $?] [$(( $(date +%s) - s )) s]"
} > ../out_03_recheck.txt 2>&1
cat ../out_03_recheck.txt
