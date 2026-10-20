# 14_codex_history_codex.ps1 —— 沿革：改名、迁移、上一代留下的痕迹（openai/codex）
# 用途：把「沿革」一节的事实固定成仓库自己的记录（提交历史、文件迁移、兼容代码）。
# 运行：pwsh -File 14_codex_history_codex.ps1

$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\_src\codex')).Path
Set-Location $repo

Write-Output "=== 1. 仓库创建与首次公开（仓库自己的提交） ==="
git log --reverse --format='    %H|%cI|%s' | Select-Object -First 8

Write-Output ""
Write-Output "=== 2. 代理循环所在文件的历史迁移 ==="
Write-Output "「codex-rs/core/src/codex.rs」被删除的那次提交："
git log --diff-filter=D --format='    %H|%cI|%s' -- 'codex-rs/core/src/codex.rs' | Select-Object -First 3
Write-Output "现「codex-rs/core/src/session/turn.rs」最早的提交："
git log --diff-filter=A --format='    %H|%cI|%s' -- 'codex-rs/core/src/session/turn.rs' | Select-Object -Last 3
Write-Output "该文件是否在当前检出中存在： " + $(if (Test-Path 'codex-rs/core/src/session/turn.rs') { 'True' } else { 'False' })

Write-Output ""
Write-Output "=== 3. 上一代留下的痕迹：npm 包装层 ==="
Write-Output "codex-cli/package.json 的关键字段："
Select-String -Path 'codex-cli/package.json' -Pattern '"name"|"bin"|"codex"|"license"' |
  ForEach-Object { Write-Output ("    codex-cli/package.json:" + $_.LineNumber + ": " + $_.Line.Trim()) }
Write-Output "codex-cli/bin/codex.js 的入口说明："
Get-Content 'codex-cli/bin/codex.js' -TotalCount 3 | ForEach-Object { Write-Output ("    codex-cli/bin/codex.js:" + $_) }

Write-Output ""
Write-Output "=== 4. 协议层的兼容与弃用痕迹 ==="
Write-Output "legacy 命名的文件："
Get-ChildItem 'codex-rs' -Recurse -File -Filter '*legacy*' -ErrorAction SilentlyContinue |
  ForEach-Object { Write-Output ("    " + $_.FullName.Replace($repo + '\', '')) }
Write-Output "标注 legacy 的协议文件行："
Select-String -Path 'codex-rs/protocol/src/legacy_events.rs' -Pattern 'legacy|Legacy' |
  Select-Object -First 6 | ForEach-Object { Write-Output ("    codex-rs/protocol/src/legacy_events.rs:" + $_.LineNumber + ": " + $_.Line.Trim()) }

Write-Output ""
Write-Output "=== 5. 沙箱实现的代际痕迹 ==="
Write-Output "landlock 旧路径仍被引用："
Select-String -Path 'codex-rs/cli/src/debug_sandbox.rs' -Pattern 'use_legacy_landlock' |
  Select-Object -First 4 | ForEach-Object { Write-Output ("    codex-rs/cli/src/debug_sandbox.rs:" + $_.LineNumber + ": " + $_.Line.Trim()) }
Write-Output "WSL1 停止支持的说明所在文件："
Get-ChildItem 'codex-rs' -Recurse -File -Filter '*.rs' -ErrorAction SilentlyContinue | ForEach-Object {
  $f = $_
  $m = Select-String -Path $f.FullName -Pattern 'WSL1' -ErrorAction SilentlyContinue
  if ($m) { $m | Select-Object -First 1 | ForEach-Object { Write-Output ("    " + $f.FullName.Replace($repo + '\','') + ":" + $_.LineNumber + ": " + $_.Line.Trim()) } }
} | Select-Object -First 3

Write-Output ""
Write-Output "=== 6. 变更日志头部 ==="
Get-Content 'CHANGELOG.md' -TotalCount 20 | ForEach-Object { Write-Output ("    " + $_) }
