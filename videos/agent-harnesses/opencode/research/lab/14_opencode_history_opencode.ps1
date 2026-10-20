# 14_opencode_history_opencode.ps1 —— 沿革：Go 实现、TypeScript 重写、分家与改名（anomalyco/opencode）
# 用途：把「沿革」一节的事实固定成仓库自己的记录（提交历史、文件改名、遗留目录）。
# 运行：pwsh -File 14_opencode_history_opencode.ps1

$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\_src\opencode')).Path
Set-Location $repo

Write-Output "=== 1. 最早的提交（仓库起于何时） ==="
git log --reverse --format='    %H|%cI|%s' | Select-Object -First 6

Write-Output ""
Write-Output "=== 2. Go 实现的证据：go.mod 何时被删 ==="
Write-Output "删除 go.mod 的提交："
git log --diff-filter=D --format='    %H|%cI|%s' -- 'go.mod' | Select-Object -First 3
Write-Output "该提交同时新增了 packages/opencode/package.json："
git log --diff-filter=A --format='    %H|%cI|%s' -- 'packages/opencode/package.json' | Select-Object -Last 3
Write-Output "该 Go 提交是否为当前 HEAD 的祖先（0 = 是）："
git merge-base --is-ancestor f3da73553c45f17e04b1e77cb13eb0fca714d1bd HEAD
Write-Output ("    " + $LASTEXITCODE)

Write-Output ""
Write-Output "=== 3. Go 时代 README 的自述 ==="
Write-Output "--- f3da73553c45f17e04b1e77cb13eb0fca714d1bd^:README.md 的开头 ---"
git show 'f3da73553c45f17e04b1e77cb13eb0fca714d1bd^:README.md' 2>&1 | Select-Object -First 12 | ForEach-Object { Write-Output ("    " + $_) }
Write-Output "--- 同一提交的顶层文件 ---"
git ls-tree --name-only 'f3da73553c45f17e04b1e77cb13eb0fca714d1bd^' 2>&1 | ForEach-Object { Write-Output ("    " + $_) }

Write-Output ""
Write-Output "=== 4. 共享包改名：packages/opencode -> packages/core ==="
git log --diff-filter=A --format='    %H|%cI|%s' -- 'packages/core/package.json' | Select-Object -Last 3
Write-Output "packages/opencode 在当前检出中是否还存在： " + (Test-Path 'packages/opencode')

Write-Output ""
Write-Output "=== 5. 上一代留下的痕迹：v1 遗留目录 ==="
Get-ChildItem 'packages/core/src/v1' -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object { Write-Output ("    " + $_.FullName.Replace($repo + '\', '')) }
Write-Output "--- core/src/v1/config 目录内容 ---"
Get-ChildItem 'packages/core/src/v1/config' -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object { Write-Output ("    " + $_.FullName.Replace($repo + '\', '')) }
Write-Output "--- v1 迁移相关的提交 ---"
git log --format='    %H|%cI|%s' -- 'packages/core/src/database/v1-migration.bun.ts' | Select-Object -Last 3

Write-Output ""
Write-Output "=== 6. 兼容旧配置项的痕迹 ==="
Select-String -Path 'packages/web/src/content/docs/permissions.mdx' -Pattern 'deprecated|legacy|v1\.1\.1' |
  Select-Object -First 6 | ForEach-Object { Write-Output ("    packages/web/src/content/docs/permissions.mdx:" + $_.LineNumber + ": " + $_.Line.Trim()) }

Write-Output ""
Write-Output "=== 7. 品牌与仓库归属的痕迹 ==="
Select-String -Path 'LICENSE' -Pattern 'Copyright' | ForEach-Object { Write-Output ("    LICENSE:" + $_.LineNumber + ": " + $_.Line.Trim()) }
Select-String -Path 'packages/web/src/content/docs/index.mdx' -Pattern 'open source|Anomaly|SST' -ErrorAction SilentlyContinue |
  Select-Object -First 5 | ForEach-Object { Write-Output ("    packages/web/src/content/docs/index.mdx:" + $_.LineNumber + ": " + $_.Line.Trim()) }
Write-Output "--- 变更日志头部 ---"
Get-Content 'CHANGELOG.md' -TotalCount 14 | ForEach-Object { Write-Output ("    " + $_) }
