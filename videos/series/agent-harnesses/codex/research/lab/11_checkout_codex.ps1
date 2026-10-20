# 11_checkout_codex.ps1 —— 检出记录（openai/codex）
# 用途：固定本片所依据的那一份检出。片中所有「路径:行号」都以本次输出里的 SHA 为准。
# 运行：pwsh -File 11_checkout_codex.ps1
# 说明：脚本只用相对路径定位检出目录，回显里不出现本机绝对路径。

$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\_src\codex')).Path
Set-Location $repo

Write-Output "=== 1. 仓库标识 ==="
Write-Output ("origin            : " + (git remote get-url origin))
Write-Output ("检出日期         : " + (Get-Date -Format 'yyyy-MM-dd'))
Write-Output ("本机 git 版本    : " + (git --version))

Write-Output ""
Write-Output "=== 2. 本次检出的固定点 ==="
$head = git rev-parse HEAD
Write-Output ("HEAD commit      : " + $head)
Write-Output ("提交时间         : " + (git log -1 --format='%cI'))
Write-Output ("提交标题         : " + (git log -1 --format='%s'))
Write-Output ("所在分支         : " + (git rev-parse --abbrev-ref HEAD))
Write-Output ("默认分支         : " + (git symbolic-ref --short refs/remotes/origin/HEAD))
Write-Output ("该提交可达的提交数: " + (git rev-list --count HEAD))
Write-Output ("工作区是否干净   : " + $(if ((git status --porcelain | Measure-Object).Count -eq 0) { 'clean' } else { 'dirty' }))

Write-Output ""
Write-Output "=== 3. 许可证文件位置 ==="
Write-Output ("LICENSE 路径     : " + (git ls-files -- LICENSE))
Write-Output ("LICENSE 首 3 行  :")
Get-Content LICENSE -TotalCount 3 | ForEach-Object { Write-Output ("    " + $_) }
Write-Output ("LICENSE SHA-256  : " + (Get-FileHash LICENSE -Algorithm SHA256).Hash)
$notice = git ls-files -- NOTICE
Write-Output ("NOTICE 路径      : " + $notice)
$apache = git ls-files -- 'sdk/*' 'codex-rs/*' | Where-Object { $_ -match 'LICENSE' }
Write-Output ("子目录内 LICENSE : " + $(if ($apache) { ($apache | Select-Object -First 8) -join ', ' } else { '（本次未另见）' }))

Write-Output ""
Write-Output "=== 4. 历史起点 ==="
Write-Output "最早的 5 个提交："
git log --reverse --format='%H|%cI|%s' | Select-Object -First 5 | ForEach-Object { Write-Output ("    " + $_) }
