#!/usr/bin/env bash
# GitHub 协作编号规则只读取证（2026-11-15）
# 依赖：gh（已登录，任意账号）、curl。全部为只读请求，不创建任何内容。
# 对象：公开仓库 nodejs/node 及其 fork LiviaMedeiros/node；Water-Run/ft 用于确认无 Issue/PR。
# 注意：nodejs/node 活跃，重跑时最新编号会变大；out_01_numbering.txt 是 2026-11-15 的快照。
# 404 探测会让 gh 以非零码退出，脚本不用 set -e，逐条继续。
set -u

echo '== 1. ft 仓库基本信息与空列表（本仓库无 Issue/PR，改用 nodejs/node 取证）=='
gh api repos/Water-Run/ft --jq '{fork: .fork, default_branch: .default_branch, has_issues: .has_issues}'
gh api 'repos/Water-Run/ft/issues?state=all&per_page=100' --jq '.[] | {number, is_pr: (.pull_request != null), title}'
gh api 'repos/Water-Run/ft/pulls?state=all&per_page=100' --jq '.[] | {number, state, head: .head.repo.full_name, base: .base.repo.full_name}'

echo '== 2. issues 端点同时返回 Issue 与 PR（同一仓库共用一套编号）=='
gh api 'repos/nodejs/node/issues?state=all&per_page=20' --jq '.[] | {number, is_pr: (.pull_request != null), title}'

echo '== 2b. 最近 100 条的编号范围与空号 =='
gh api 'repos/nodejs/node/issues?state=all&per_page=100' --jq '[.[].number] | {max: .[0], min: .[-1], count: length}'
gh api 'repos/nodejs/node/issues?state=all&per_page=100' --jq '[.[].number] | . as $n | [range(.[0]; .[-1]; -1)] | map(select(. as $x | $n | index($x) | not))'

echo '== 3. PR 的编号属于 base（目标）仓库，head 可以是 fork =='
gh api 'repos/nodejs/node/pulls?state=all&per_page=8' --jq '.[] | {number, state, head: .head.repo.full_name, base: .base.repo.full_name}'

echo '== 4. 用 issues 端点取 PR 号 67474：返回带 pull_request 字段的同一对象 =='
gh api repos/nodejs/node/issues/67474 --jq '{number, title, pull_request_keys: (.pull_request | keys), state}'

echo '== 5. 空号 67464：转移到 nodejs/help#5185，旧号永久指向转移后的 Issue =='
gh api repos/nodejs/node/issues/67464 --jq '{number, html_url, repository_url, state}'

echo '== 6. 空号 67390/67387/67381：404，删除后编号不回收 =='
gh api repos/nodejs/node/issues/67390 --jq '{number, html_url}'
gh api repos/nodejs/node/issues/67387 --jq '{number, html_url}'
gh api repos/nodejs/node/issues/67381 --jq '{number, html_url}'

echo '== 7. fork 有自己的编号序列（LiviaMedeiros/node 的 PR #1–#4，上游已是 6.7 万号段）=='
gh api repos/LiviaMedeiros/node --jq '{full_name, fork, has_issues, open_issues_count}'
gh api 'repos/LiviaMedeiros/node/issues?state=all&per_page=10' --jq '.[] | {number, is_pr: (.pull_request != null), title, html_url}'

echo '== 8. /issues/N 与 /pull/N 互相跳转（只保留状态行、Date、Location；会话 Cookie 不入库）=='
curl -sI https://github.com/nodejs/node/issues/67474 | grep -Ei '^(HTTP/|Location:|Date:)'
curl -sI https://github.com/nodejs/node/pull/67469 | grep -Ei '^(HTTP/|Location:|Date:)'