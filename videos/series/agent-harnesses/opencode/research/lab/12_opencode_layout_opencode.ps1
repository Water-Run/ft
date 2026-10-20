# 12_opencode_layout_opencode.ps1 —— 仓库布局与主体语言（anomalyco/opencode）
# 用途：核实「主体语言与目录」，并看清客户端 / 服务端 / 插件各自分几个包。
# 运行：pwsh -File 12_opencode_layout_opencode.ps1

$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\_src\opencode')).Path
Set-Location $repo

Write-Output "=== 1. 顶层条目（只列目录与关键文件） ==="
Get-ChildItem -Force -Name | Where-Object { $_ -ne '.git' } | Sort-Object | ForEach-Object { Write-Output ("    " + $_) }

Write-Output ""
Write-Output "=== 2. 各语言文件数（按扩展名，取前 12） ==="
Get-ChildItem -Recurse -File -Force |
  Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' } |
  Group-Object { if ($_.Extension) { $_.Extension.ToLower() } else { '(无扩展名)' } } |
  Sort-Object Count -Descending | Select-Object -First 12 |
  ForEach-Object { Write-Output ("    {0,-10} {1,6} 个文件" -f $_.Name, $_.Count) }

Write-Output ""
Write-Output "=== 3. packages/ 下的包 ==="
Get-ChildItem 'packages' -Directory | Sort-Object Name | ForEach-Object { Write-Output ("    " + $_.Name) }

Write-Output ""
Write-Output "=== 4. 关键包的源文件数与行数 ==="
foreach ($c in @('packages/core', 'packages/cli', 'packages/tui', 'packages/server', 'packages/plugin', 'packages/sdk', 'packages/web', 'packages/ai', 'packages/schema')) {
  if (Test-Path $c) {
    $files = Get-ChildItem $c -Recurse -File -Filter '*.ts' -ErrorAction SilentlyContinue
    $lines = 0
    foreach ($f in $files) { $lines += (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines }
    Write-Output ("    {0,-22} {1,5} 个 .ts  {2,9} 行" -f $c, $files.Count, $lines)
  }
}

Write-Output ""
Write-Output "=== 5. 官方文档在仓库里的位置 ==="
Write-Output ("    文档源文件目录: packages/web/src/content/docs")
Write-Output ("    文档条目数    : " + (Get-ChildItem 'packages/web/src/content/docs' -File -Filter '*.mdx' | Measure-Object).Count)
Write-Output ("    与本片相关的  : " + ((Get-ChildItem 'packages/web/src/content/docs' -File -Filter '*.mdx' | Where-Object { $_.Name -match 'permissions|plugins|lsp|server|tools|config|sdk' } | Select-Object -ExpandProperty Name) -join ', '))

Write-Output ""
Write-Output "=== 6. 运行时与包管理 ==="
foreach ($f in @('package.json', 'bun.lock', 'bunfig.toml', 'turbo.json', 'pnpm-workspace.yaml')) {
  if (Test-Path $f) { Write-Output ("    存在: " + $f) }
}
$pkg = Get-Content 'package.json' -Raw | ConvertFrom-Json
Write-Output ("    package.json 的 packageManager: " + $pkg.packageManager)
Write-Output ("    workspace 包名: " + (($pkg.workspaces.packages) -join ', '))
