# 11_search.ps1 —— 在大众官方资料站（volkswagen-newsroom.com）做站内检索，取出服务端渲染的结果摘要与链接。
# 用法：pwsh -File 11_search.ps1 -Query "EA211" -Max 8
# 回显：与脚本同名的 out_11_search.txt（每次运行覆盖，只留最近一次的结果）。
# 本机没有 bash，实验脚本一律用 PowerShell；脚本与回显都留在 research/lab/。
# 说明：本片取证时，通用网页检索端点（DuckDuckGo）多次返回人机验证页；改用厂商自己的
# 站内检索，摘要与链接都在页面里服务端渲染，可直接读到，比通用检索更贴题。
param(
  [Parameter(Mandatory = $true)][string]$Query,
  [string]$Out = (Join-Path $PSScriptRoot 'out_11_search.txt'),
  [int]$Max = 8
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

$url = 'https://www.volkswagen-newsroom.com/en/search?query=' + [uri]::EscapeDataString($Query)
$html = $null
for ($attempt = 1; $attempt -le 4 -and -not $html; $attempt++) {
  try { $html = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60 -Headers @{ 'User-Agent' = $ua }).Content }
  catch { Write-Output "attempt ${attempt} failed: $($_.Exception.Message)"; Start-Sleep -Seconds (4 * $attempt) }
}
if (-not $html) { throw "站内检索失败：$Query" }

$text = $html -replace '(?s)<script.*?</script>', ' ' -replace '(?s)<style.*?</style>', ' ' -replace '<[^>]+>', ' ' -replace '\s+', ' '

$blocks = New-Object System.Collections.Generic.List[string]
foreach ($b in ($text -split '(?<=\.)\s{2,}')) {
  $b = $b.Trim()
  if ($b.Length -lt 40) { continue }
  if ($b -notmatch [regex]::Escape($Query)) { continue }
  if ($b -match '^(Albums|Latest Photos|Model Albums|Back to top|Imprint|Cookie|Privacy|Terms|Topics|Media Service)') { continue }
  $blocks.Add($b)
  if ($blocks.Count -ge $Max) { break }
}

$links = @([regex]::Matches($html, 'href="(/en/[^"#?]+)"') | ForEach-Object { $_.Groups[1].Value } |
  Where-Object { $_ -notmatch '^/en/(models|company|e-mobility|volkswagen-classic|media-service|images|images-and-graphics|videos|press-releases|publications|basic-infos|media-contacts|publication-data|privacy|terms|cookie|third-party|newsroom|search|register|collection|index|startseite)?$' } |
  Sort-Object -Unique)

$buf = New-Object System.Collections.Generic.List[string]
$buf.Add("=== QUERY: $Query")
$buf.Add("=== FETCHED: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz'))")
$buf.Add("=== ENDPOINT: $url")
$buf.Add('=== 结果摘要（服务端渲染） ===')
$buf.AddRange([string[]]$blocks)
$buf.Add('=== 页面内 /en/ 链接 ===')
$buf.AddRange([string[]]$links)
Set-Content -Path $Out -Value ($buf -join "`n") -Encoding utf8
$blocks | ForEach-Object { $_ }
Write-Output "written: $Out"
