#!/bin/sh
# Mathlib 官方统计页上的三个数：定义、定理、贡献者。页面随 Mathlib 每日更新，回显里记下取数的日期（UTC）。
cd "$(dirname "$0")" || exit 1
URL=https://leanprover-community.github.io/mathlib_stats.html
{
  echo "$URL"
  echo "fetched $(date -u +%Y-%m-%dT%H:%MZ)"
  curl -sSL "$URL" | tr '\n' ' ' | sed 's/<[^>]*>/ /g' | tr -s ' ' | grep -o 'Counts Definitions Theorems Contributors [0-9]* [0-9]* [0-9]*'
} > out_05_mathlib_stats.txt 2>&1
cat out_05_mathlib_stats.txt
