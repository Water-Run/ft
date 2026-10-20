# 抓取 Adobe Spectrum 官方页面并把正文转成纯文本存盘，作为本片 FACTS 的一手材料。
# 用法：pwsh -File 10_fetch.ps1 <输出文件名> <URL 1> <URL 2> ...
# 只做 GET，不改任何远端状态；输出与脚本同名（out_<输出文件名>.txt）。
$ErrorActionPreference = 'Continue'
$outFile = $args[0]
$urls = $args[1..($args.Count - 1)]

function Get-PlainText([string]$html) {
  $t = $html
  $t = [regex]::Replace($t, '(?is)<script.*?</script>', ' ')
  $t = [regex]::Replace($t, '(?is)<style.*?</style>', ' ')
  $t = [regex]::Replace($t, '(?is)<!--.*?-->', ' ')
  $t = [regex]::Replace($t, '(?is)<(br|/p|/div|/li|/h[1-6]|/tr|/section|/header|/footer)[^>]*>', "`n")
  $t = [regex]::Replace($t, '(?is)<[^>]+>', ' ')
  $t = [System.Net.WebUtility]::HtmlDecode($t)
  $t = [regex]::Replace($t, '[ \t\u00a0]+', ' ')
  $lines = $t -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
  ($lines -join "`n")
}

$out = New-Object System.Collections.Generic.List[string]
$out.Add('# 取证时刻（UTC）：' + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
$out.Add('# 工具：' + $PSVersionTable.PSVersion.ToString() + ' / Invoke-WebRequest')
$out.Add('')

foreach ($u in $urls) {
  $out.Add('=' * 78)
  $out.Add("URL: $u")
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 60 -Headers @{ 'User-Agent' = 'Mozilla/5.0 (research fetch)' }
    $out.Add("HTTP: $($r.StatusCode)  bytes=$($r.RawContentLength)  content-type=$($r.Headers['Content-Type'])")
    $out.Add("SHA256(content): " + [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($r.Content))).Replace('-', '').ToLower())
    $out.Add('-' * 78)
    $out.Add((Get-PlainText $r.Content))
  } catch {
    $out.Add("ERROR: $($_.Exception.Message)")
  }
  $out.Add('')
}

$target = Join-Path $PSScriptRoot $outFile
[IO.File]::WriteAllText($target, ($out -join "`n"), (New-Object Text.UTF8Encoding($false)))
Write-Output "已写入 $target （$($out.Count) 行）"
