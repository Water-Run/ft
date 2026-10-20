# 12_codex_layout_codex.ps1 —— 仓库布局与主体语言（openai/codex）
# 用途：核实「主体语言与目录」这一条，不凭 README 的一句话。
# 运行：pwsh -File 12_codex_layout_codex.ps1

$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\_src\codex')).Path
Set-Location $repo

Write-Output "=== 1. 顶层条目 ==="
Get-ChildItem -Force -Name | Where-Object { $_ -ne '.git' } | Sort-Object | ForEach-Object { Write-Output ("    " + $_) }

Write-Output ""
Write-Output "=== 2. 各语言文件数（按扩展名，取前 12） ==="
Get-ChildItem -Recurse -File -Force |
  Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' } |
  Group-Object { if ($_.Extension) { $_.Extension.ToLower() } else { '(无扩展名)' } } |
  Sort-Object Count -Descending | Select-Object -First 12 |
  ForEach-Object { Write-Output ("    {0,-10} {1,6} 个文件" -f $_.Name, $_.Count) }

Write-Output ""
Write-Output "=== 3. codex-rs 下的 crate 数量 ==="
$crates = Get-ChildItem 'codex-rs' -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'Cargo.toml') }
Write-Output ("    crate 目录数: " + $crates.Count)

Write-Output ""
Write-Output "=== 4. 关键 crate 的 Rust 源文件数与行数 ==="
foreach ($c in @('codex-rs/core', 'codex-rs/cli', 'codex-rs/tui', 'codex-rs/protocol', 'codex-rs/sandboxing', 'codex-rs/tools', 'codex-rs/app-server', 'codex-rs/execpolicy')) {
  if (Test-Path $c) {
    $files = Get-ChildItem $c -Recurse -File -Filter '*.rs'
    $lines = 0
    foreach ($f in $files) { $lines += (Get-Content $f.FullName | Measure-Object -Line).Lines }
    Write-Output ("    {0,-24} {1,5} 个 .rs  {2,8} 行" -f $c, $files.Count, $lines)
  }
}

Write-Output ""
Write-Output "=== 5. 非 Rust 的入口 ==="
Write-Output ("    codex-cli/  : " + ((Get-ChildItem 'codex-cli' -Recurse -File | Measure-Object).Count) + " 个文件（npm 包的 JS 入口）")
Write-Output ("    sdk/       : " + ((Get-ChildItem 'sdk' -Directory | Select-Object -ExpandProperty Name) -join ', '))
Write-Output ("    docs/      : " + ((Get-ChildItem 'docs' -File -Name) -join ', '))

Write-Output ""
Write-Output "=== 6. 包管理根文件 ==="
foreach ($f in @('package.json', 'pnpm-workspace.yaml', 'bun.lock', 'Cargo.toml')) {
  if (Test-Path $f) { Write-Output ("    存在: " + $f) }
}
Write-Output ("    codex-rs/Cargo.toml 首行 : " + (Get-Content 'codex-rs/Cargo.toml' -TotalCount 1))
