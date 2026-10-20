#!/bin/sh
# 编译整个工程：定义（Def）、逐个计算与「试到一百万」（Test）、证明（Proof）。#eval 的结果在编译回显里。
cd "$(dirname "$0")/proof" || exit 1
rm -rf .lake
lake build > ../out_01_build.txt 2>&1
echo "[exit $?]" >> ../out_01_build.txt
cat ../out_01_build.txt
