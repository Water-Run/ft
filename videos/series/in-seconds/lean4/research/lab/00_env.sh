#!/bin/sh
# 取证环境：Lean 与 Lake 的版本。工具链由 elan 按 proof/lean-toolchain 取得（leanprover/lean4:v4.34.1）。
cd "$(dirname "$0")/proof" || exit 1
{
  uname -sm
  lean --version
  lake --version
  cat lean-toolchain
} > ../out_00_env.txt 2>&1
cat ../out_00_env.txt
