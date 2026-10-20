# 13_evidence.ps1 —— 在 12_fetch_sources.ps1 的回显里按关键词取证：按句切分，只打印命中的句子及其前后文。
# 用法：pwsh -File 13_evidence.ps1 -Label vw-mqb-10years -Pattern 'EA211|MQB|engines' -Before 0 -After 0
# 回显：与脚本同名的 out_13_evidence.txt（每次运行追加）。只读 out_12_sources.txt，不联网。
param(
  [Parameter(Mandatory = $true)][string]$Label,
  [Parameter(Mandatory = $true)][string]$Pattern,
  [int]$Before = 0,
  [int]$After = 0,
  [string]$Out = (Join-Path $PSScriptRoot 'out_13_evidence.txt')
)

$ErrorActionPreference = 'Stop'
$src = Join-Path $PSScriptRoot 'out_12_sources.txt'
$raw = Get-Content $src -Raw -Encoding utf8

# 标签行是形如 "########## <tag>" 且后面不是 URL:/CHARS:/TRUNCATED/FETCH FAILED 的行
$tags = [regex]::Matches($raw, '(?m)^########## (.+)$') | ForEach-Object {
  $v = $_.Groups[1].Value.Trim()
  if ($v -match '^(URL:|CHARS:|TRUNCATED|FETCH FAILED)') { return }
  [pscustomobject]@{ Tag = $v; Index = $_.Index }
}
$hit = $tags | Where-Object { $_.Tag -eq $Label } | Select-Object -First 1
if (-not $hit) { throw "label not found in $src : $Label" }
$pos = [array]::IndexOf($tags, $hit)
$from = $hit.Index
$to = if ($pos -lt $tags.Count - 1) { $tags[$pos + 1].Index } else { $raw.Length }
$section = $raw.Substring($from, $to - $from)

# 按句号切句（英文正文），并把标题/网址行与站点导航去掉
$body = ($section -split "`n" | Where-Object { $_ -notmatch '^##########' }) -join ' '
$body = $body -replace '\s+', ' '
$nav = $body.LastIndexOf('Open this page')          # 导航栏最后出现处即正文起点
if ($nav -ge 0) { $body = $body.Substring($nav + 'Open this page'.Length) }
$foot = $body.IndexOf('Media contacts', 200)        # 页脚起点
if ($foot -gt 0) { $body = $body.Substring(0, $foot) }
$sentences = $body -split '(?<=[.!?])\s+(?=[A-Z“"(])'

$hits = New-Object System.Collections.Generic.List[int]
for ($i = 0; $i -lt $sentences.Count; $i++) {
  if ($sentences[$i] -match $Pattern) { $hits.Add($i) }
}

$buf = New-Object System.Collections.Generic.List[string]
$buf.Add("`n=== LABEL: $Label | PATTERN: $Pattern | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
if ($hits.Count -eq 0) { $buf.Add('(no match)') }
$seen = @{}
foreach ($i in $hits) {
  $from = [Math]::Max(0, $i - $Before); $to = [Math]::Min($sentences.Count - 1, $i + $After)
  for ($j = $from; $j -le $to; $j++) {
    if ($seen.ContainsKey($j)) { continue }
    $seen[$j] = $true
    $buf.Add("- " + $sentences[$j].Trim())
  }
}
Add-Content -Path $Out -Value ($buf -join "`n") -Encoding utf8
$buf | ForEach-Object { $_ }
