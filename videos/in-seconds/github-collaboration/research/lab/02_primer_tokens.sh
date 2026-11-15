#!/usr/bin/env bash
# Primer 官方设计令牌取证（2026-11-15）
# 依赖：gh（已登录，任意账号）、curl。全部为只读请求。
# 对象：primer/primitives 提交 47736486bf67b2a14ba1ada61fa0f57af29bb875（main，2026-11-15 查询）
#       与 npm 包 @primer/primitives@11.10.0 的编译产物。
# 用法：bash 02_primer_tokens.sh > out_02_primer_tokens.txt 2>&1
set -u
SHA=47736486bf67b2a14ba1ada61fa0f57af29bb875
RAW="https://raw.githubusercontent.com/primer/primitives/$SHA"

echo '== 1. 功能色（light 主题编译产物，@primer/primitives@11.10.0）=='
curl -sL https://unpkg.com/@primer/primitives@11.10.0/dist/css/functional/themes/light.css \
  | grep -E -- '--(fgColor-(default|muted|accent|success|attention|danger|done|open|closed)|bgColor-(default|muted|accent-muted|success-muted|attention-muted|danger-muted|done-muted)|borderColor-(default|muted|accent-emphasis|success-emphasis|done-emphasis)):' \
  | sort -u

echo '== 2. 字体栈（源令牌 font-stack.json5）=='
curl -sL "$RAW/src/tokens/functional/typography/font-stack.json5" | grep -E '\$value'

echo '== 3. diff 行/词背景（源令牌 diffBlob.json5 的 $value 引用）=='
curl -sL "$RAW/src/tokens/component/diffBlob.json5" | grep -nE 'additionLine|additionWord|additionNum|deletionLine|deletionWord|deletionNum|\$value' | head -40

echo '== 4. 基础色阶 green.0/1 与 red.0/1（源令牌 base/color/light/light.json5）=='
curl -sL "$RAW/src/tokens/base/color/light/light.json5" | grep -A6 -E "^      (green|red):" | grep -E 'green|red|hex' | head -8

echo '== 5. Mona Sans / Hubot Sans 许可（GitHub API）=='
gh api repos/github/mona-sans --jq '{name, license: .license.spdx_id}'
gh api repos/github/hubot-sans --jq '{name, license: .license.spdx_id}'