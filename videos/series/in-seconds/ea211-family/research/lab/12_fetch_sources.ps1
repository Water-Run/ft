# 12_fetch_sources.ps1 —— 抓取 sources.txt 里的一手网页，抽取正文文字，逐页写入回显。
# 用法：pwsh -File 12_fetch_sources.ps1
# 回显：与脚本同名的 out_12_sources.txt（每次运行覆盖，页与页之间用分隔行隔开）。
# 本机没有 bash，实验脚本一律用 PowerShell；只抓公开的厂商官方新闻稿与官方技术页。
# 脱敏：脚本不读取也不输出环境变量、主机名、用户目录；回显里只保留网页正文文字。
param(
  [string]$List = (Join-Path $PSScriptRoot 'sources.txt'),
  [string]$Out = (Join-Path $PSScriptRoot 'out_12_sources.txt'),
  [int]$MaxChars = 32000
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

function Get-Text([string]$url) {
  $html = $null
  for ($i = 1; $i -le 4 -and -not $html; $i++) {
    try { $html = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60 -Headers @{ 'User-Agent' = $ua; 'Accept-Language' = 'en-US,en;q=0.9' }).Content }
    catch { Start-Sleep -Seconds (3 * $i) }
  }
  if (-not $html) { return $null }
  $t = $html
  $t = $t -replace '(?s)<script.*?</script>', ' '
  $t = $t -replace '(?s)<style.*?</style>', ' '
  $t = $t -replace '(?s)<!--.*?-->', ' '
  $t = $t -replace '<[^>]+>', ' '
  $t = $t -replace '&#\d+;', ' '
  $t = $t -replace '&nbsp;', ' '
  $t = $t -replace '&amp;', '&'
  $t = $t -replace '&quot;', '"'
  $t = $t -replace '&#39;', "'"
  $t = $t -replace '&#8211;|&#8212;', '-'
  $t = $t -replace '\s+', ' '
  return $t.Trim()
}

$stamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')
$buf = New-Object System.Collections.Generic.List[string]
$buf.Add("=== FETCH RUN: $stamp ===")
$buf.Add('=== 脚本：12_fetch_sources.ps1；清单：sources.txt；抓取的是公开的一手网页 ===')

foreach ($line in Get-Content $List -Encoding utf8) {
  $line = $line.Trim()
  if (-not $line -or $line.StartsWith('#')) { continue }
  $parts = $line -split '\s*\|\s*', 2
  if ($parts.Count -lt 2) { continue }
  $label, $url = $parts[0], $parts[1]
  $text = Get-Text $url
  $buf.Add('')
  $buf.Add("########## $label")
  $buf.Add("########## URL: $url")
  if (-not $text) { $buf.Add('########## FETCH FAILED'); continue }
  $buf.Add("########## CHARS: $($text.Length)")
  if ($text.Length -gt $MaxChars) {
    $buf.Add("########## TRUNCATED to $MaxChars chars")
    $buf.Add($text.Substring(0, $MaxChars))
  } else {
    $buf.Add($text)
  }
}

Set-Content -Path $Out -Value ($buf -join "`n") -Encoding utf8
Write-Output "written: $Out ($((Get-Item $Out).Length) bytes)"
