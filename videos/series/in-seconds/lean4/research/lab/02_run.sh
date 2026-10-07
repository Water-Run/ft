#!/bin/sh
# 逐个运行其余实验文件，各存一份回显：
#   Trace   每一步之前的目标            Print   Lean 实际交给内核的证明项      Axioms  定理依赖的公理
#   Wrong   假命题 + rfl：类型不符       Wrong2  假命题 + decide：判为假
#   Sorry   跳过证明：留下 sorryAx       Kernel  手工拼的证明项直接交给内核：被拒
#   Name    名字与命题不符也能通过       Stats   证明项的大小与依赖闭包（JSON）  Count   重放范围内的声明条数（JSON）
cd "$(dirname "$0")/proof" || exit 1
for f in Trace Print Axioms Wrong Wrong2 Sorry Kernel Name Stats Count; do
  lake env lean SumOdd/$f.lean > ../out_02_$f.txt 2>&1
  echo "[exit $?]" >> ../out_02_$f.txt
done
tail -n 3 ../out_02_Trace.txt ../out_02_Axioms.txt ../out_02_Wrong.txt ../out_02_Wrong2.txt ../out_02_Sorry.txt ../out_02_Kernel.txt ../out_02_Name.txt
