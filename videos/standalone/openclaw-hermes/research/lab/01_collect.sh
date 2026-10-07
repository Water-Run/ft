#!/usr/bin/env bash
# 取证脚本 01：从公开接口取回「来历与时间线」所需的原始数据，裁剪字段后写成 out_*.json / out_*.txt。
# 取证日期：2026-10-06。接口只读、无需凭据；未认证的 GitHub API 每小时 60 次，本脚本约用 25 次。
# 重跑会得到更新后的数字（星标、提交数会变）；发布列表按 CUTOFF 截断，所以发布数与取证当天一致。
# 依赖：bash、curl、jq、python3。用法：bash 01_collect.sh [输出目录]
set -euo pipefail
OUT="${1:-.}"; mkdir -p "$OUT"; cd "$OUT"
CUTOFF="2026-10-06T00:00:00Z"
RETRY="--retry 4 --retry-delay 2 --retry-all-errors"
GH() { curl -fsS -m 60 $RETRY -H "Accept: application/vnd.github+json" "$@"; }
GHRAW() { curl -fsS -m 60 $RETRY -H "Accept: application/vnd.github.raw" "$@"; }   # 文件原文（经 API，避开 raw 域名的限流）

# ── 1. 仓库元数据、提交总数、最早的提交 ──
{
  echo '{'
  first=1
  for r in openclaw/openclaw NousResearch/hermes-agent earendil-works/pi; do
    [ $first = 1 ] || echo ','; first=0
    meta=$(GH "https://api.github.com/repos/$r" | jq '{full_name, created_at, pushed_at, stargazers_count, forks_count, license: .license.spdx_id, language, default_branch, description, topics}')
    last=$(curl -fsS -m 60 $RETRY -D - -o /dev/null -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$r/commits?per_page=1" | tr -d '\r' | grep -i '^link:' | grep -o 'page=[0-9]*>; rel="last"' | grep -o '[0-9]*' || echo "")
    oldest=null; [ -n "$last" ] && oldest=$(GH "https://api.github.com/repos/$r/commits?per_page=1&page=$last" | jq '.[0] | {sha, date: .commit.author.date, message: (.commit.message|split("\n")[0])}')
    head=$(GH "https://api.github.com/repos/$r/commits?per_page=1" | jq '.[0] | {sha, date: .commit.committer.date, message: (.commit.message|split("\n")[0])}')
    echo "\"$r\": $(jq -n --argjson m "$meta" --arg last "${last:-0}" --argjson o "$oldest" --argjson h "$head" '$m + {commits_total: ($last|tonumber), oldest_commit: $o, head_commit: $h}')"
  done
  echo '}'
} | jq . > out_01_github.json

# ── 2. 发布列表（截至 CUTOFF）──
for r in openclaw/openclaw NousResearch/hermes-agent; do
  n=$(echo "$r" | cut -d/ -f2)
  : > "_rel_$n.json"
  for p in 1 2 3 4; do
    GH "https://api.github.com/repos/$r/releases?per_page=100&page=$p" > "_rel_${n}_$p.json"
    c=$(jq length "_rel_${n}_$p.json"); [ "$c" = 100 ] || break
  done
  jq -s --arg cut "$CUTOFF" 'add | map(select(.published_at < $cut) | {tag: .tag_name, name, published_at, prerelease}) | sort_by(.published_at)' _rel_${n}_*.json > "_rel_$n.trim.json"
  rm -f _rel_${n}_*.json "_rel_$n.json"
done
jq -n --slurpfile a _rel_openclaw.trim.json --slurpfile b _rel_hermes-agent.trim.json '{cutoff: "'"$CUTOFF"'", openclaw: $a[0], hermes: $b[0]}' > out_02_releases.json
rm -f _rel_*.trim.json
# Hermes v0.2.0 发布说明的开头
GH "https://api.github.com/repos/NousResearch/hermes-agent/releases/tags/v2026.3.12" | jq -r '.body' | sed -n 1,8p > out_02_hermes_v0.2.0_notes.txt

# ── 3. npm 注册表：包的创建时间、首个版本、标签 ──
{
  echo '{'
  first=1
  for p in warelay clawdis clawdbot moltbot openclaw @openclaw/feishu @m1heng-clawd/feishu @larksuiteoapi/feishu-openclaw-plugin; do
    [ $first = 1 ] || echo ','; first=0
    curl -fsS -m 180 $RETRY "https://registry.npmjs.org/$p" > _pack.json
    echo "\"$p\": $(jq '{created: .time.created, modified: .time.modified, versions: (.versions|length), first: (.time|to_entries|map(select(.key|test("^[0-9]")))|sort_by(.value)|.[0]|{version: .key, time: .value}), latest: .["dist-tags"].latest, description: (.versions[.["dist-tags"].latest].description), repository: (.versions[.["dist-tags"].latest].repository.url // null)}' _pack.json)"
  done
  echo '}'
} | jq . > out_03_npm.json
rm -f _pack.json
curl -fsS -m 60 $RETRY https://registry.npmjs.org/-/package/openclaw/dist-tags > out_03_openclaw_dist_tags.json
curl -fsS -m 60 $RETRY https://registry.npmjs.org/openclaw/2026.9.8 | jq '{name, version, license, engines, unpackedSize: .dist.unpackedSize, fileCount: .dist.fileCount, dependencies: (.dependencies|length)}' > out_03_openclaw_2026.9.8.json

# ── 4. 各历史标签的 README 标题与首段（OpenClaw 的前身与更名；Hermes 的自述）──
{
  for t in v0.1.1 v1.3.0 v2.0.0-beta1 v2026.1.5 v2026.1.29 v2026.8.1; do
    echo "######## openclaw/openclaw @ $t"
    GHRAW "https://api.github.com/repos/openclaw/openclaw/contents/README.md?ref=$t" | grep -v -E '^\s*$|^\s*<' | sed -n 1,3p | cut -c1-400
  done
  for t in v2026.4.16 v2026.9.24; do
    echo "######## NousResearch/hermes-agent @ $t"
    GHRAW "https://api.github.com/repos/NousResearch/hermes-agent/contents/README.md?ref=$t" | grep -v -E '^\s*$|^\s*<' | sed -n 1,2p | cut -c1-500
  done
} > out_04_readmes.txt

# ── 4b. 前身时期的 README 原句（来历一章逐字引用）──
{
  echo "######## v0.1.1";       GHRAW "https://api.github.com/repos/openclaw/openclaw/contents/README.md?ref=v0.1.1"       | grep -E '^Send, receive, auto-reply, and inspect WhatsApp'
  echo "######## v2.0.0-beta1"; GHRAW "https://api.github.com/repos/openclaw/openclaw/contents/README.md?ref=v2.0.0-beta1" | grep -E 'is a TypeScript/Node gateway|Gateway control plane|Sessions\*\* —|ws://127\.0\.0\.1:18789 \(default'
  echo "######## v2026.1.5";    GHRAW "https://api.github.com/repos/openclaw/openclaw/contents/README.md?ref=v2026.1.5"    | grep -E '^\*\*Clawdbot\*\* is a'
} > out_04_readme_lines.txt

# ── 5. Hermes 模型线：Hugging Face 仓库创建时间、arXiv 技术报告、Nous 发布页 ──
arxiv() { curl -fsS -m 60 $RETRY "https://export.arxiv.org/api/query?id_list=$1" | python3 -c '
import sys, re, json
x = sys.stdin.read(); e = re.search(r"<entry>(.*?)</entry>", x, re.S).group(1)
print(json.dumps({"title": re.sub(r"\s+", " ", re.search(r"<title>(.*?)</title>", e, re.S).group(1)), "published": re.search(r"<published>(.*?)</published>", e).group(1)}))'; }
{
  echo '{"huggingface": {'
  first=1
  for m in Nous-Hermes-13b Hermes-2-Pro-Mistral-7B Hermes-3-Llama-3.1-405B Hermes-4-405B; do
    [ $first = 1 ] || echo ','; first=0
    echo "\"NousResearch/$m\": $(curl -fsS -m 60 $RETRY "https://huggingface.co/api/models/NousResearch/$m" | jq '{createdAt}')"
  done
  echo '}, "arxiv": {'
  first=1
  for a in 2408.11857 2508.18255; do
    [ $first = 1 ] || echo ','; first=0
    echo "\"$a\": $(arxiv $a)"
  done
  echo '}}'
} | jq . > out_05_models.json
curl -fsS -m 60 $RETRY "https://export.arxiv.org/api/query?id_list=2408.11857" | python3 -c '
import sys, re
x = sys.stdin.read(); e = re.search(r"<entry>(.*?)</entry>", x, re.S).group(1)
print(re.sub(r"\s+", " ", re.search(r"<summary>(.*?)</summary>", e, re.S).group(1)).strip())' > out_05_hermes3_abstract.txt
curl -fsS -m 60 $RETRY "https://huggingface.co/NousResearch/Hermes-2-Pro-Mistral-7B/raw/main/README.md" | grep -i -E "Function Calling and JSON Mode dataset" | cut -c1-300 > out_05_hermes2pro_card.txt
curl -fsS -m 60 $RETRY -L https://nousresearch.com/releases | grep -o -E "02/25/26|An autonomous agent that lives on your server, remembers what it learns, and gets more capable the longer it runs\.|08/24/24|08/26/25|12/03/25|05/14/25|04/29/25|Hermes-4-Llama-3\.1-405B|Hermes 3 405B|Hermes-4\.3-Seed-36B|Atropos|Psyche Network" | sort -u > out_06_nous_releases.txt

# ── 6. 飞书官方 SDK（长连接）：Node SDK README 的相关段落 ──
GHRAW "https://api.github.com/repos/larksuite/node-sdk/contents/README.md" | sed -n '/^### Subscribing to Events Using Long Connection Mode/,/^### /p' | sed -n 1,45p > out_07_feishu_node_sdk.txt

# ── 7. 安全公告：OpenClaw 仓库公开的最早一批公告与 CVE-2026-25253 ──
GH "https://api.github.com/repos/openclaw/openclaw/security-advisories?per_page=100&state=published&sort=published&direction=asc&page=1" \
  | jq '{earliest: (sort_by(.published_at)|.[0]|{ghsa_id, published_at, severity, summary}), target: (.[]|select(.summary|test("gatewayUrl"))|select(.published_at<"2026-02-01")|{ghsa_id, published_at, severity, cvss_score: .cvss.score, summary, patched: .vulnerabilities[0].patched_versions, vulnerable: .vulnerabilities[0].vulnerable_version_range})}' > out_08_advisory.json
curl -fsS -m 60 $RETRY "https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2026-25253" | jq '.vulnerabilities[0].cve | {id, published, vulnStatus, description: .descriptions[0].value, cvss31: .metrics.cvssMetricV31[0].cvssData | {baseScore, vectorString}, github_advisory: ([.references[].url]|map(select(test("GHSA")))|.[0])}' > out_08_nvd_CVE-2026-25253.json
echo done
