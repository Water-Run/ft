#!/bin/sh
# 数一数 Lean 4 源码各部分的行数（v4.34.1）。源码取到 research/_src/lean4（不入库）。
# 口径：wc -l，含空行与注释。内核 = src/kernel 下的 .cpp 与 .h。
cd "$(dirname "$0")" || exit 1
SRC=../_src/lean4
if [ ! -d "$SRC/.git" ]; then
  mkdir -p ../_src
  git clone -q --depth 1 --branch v4.34.1 --filter=blob:none --sparse https://github.com/leanprover/lean4.git "$SRC" || exit 1
  git -C "$SRC" sparse-checkout set src/kernel src/Init src/Std src/Lean src/lake src/runtime src/util src/library > /dev/null || exit 1
fi
{
  echo "lean4 $(git -C "$SRC" describe --tags) $(git -C "$SRC" log -1 --format='%H %cI')"
  for d in kernel runtime util library; do
    n=$(find "$SRC/src/$d" \( -name '*.cpp' -o -name '*.h' \) | wc -l)
    l=$(find "$SRC/src/$d" \( -name '*.cpp' -o -name '*.h' \) -print0 | xargs -0 cat | wc -l)
    echo "src/$d cxx files=$n lines=$l"
  done
  for d in Init Std Lean lake; do
    n=$(find "$SRC/src/$d" -name '*.lean' | wc -l)
    l=$(find "$SRC/src/$d" -name '*.lean' -print0 | xargs -0 cat | wc -l)
    echo "src/$d lean files=$n lines=$l"
  done
} > out_04_kernel_size.txt 2>&1
cat out_04_kernel_size.txt
