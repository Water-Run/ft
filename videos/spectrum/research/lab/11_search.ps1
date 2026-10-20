# 用 Bing 检索并把结果压成「标题 | 链接 | 摘要」三列，存成 out_<输出文件名>.txt。
# 只做 GET；结果只用于定位官方页面，结论一律回到原页核对。Bing 会对高频请求限流，脚本在每次请求之间留间隔。
$ErrorActionPreference = 'Continue'
$outFile = $args[0]
$queries = $args[1..($args.Count - 1)]
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function Search([string]$q) {
  $uri = 'https://www.bing.com/search?q=' + [Uri]::EscapeDataString($q) + '&count=20'
  $r = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 60 -Headers @{ 'User-Agent' = $ua; 'Accept-Language' = 'en-US,en;q=0.9' }
  $html = $r.Content
  $blocks = [regex]::Matches($html, '(?is)<li class="b_algo".*?</li>')
  if ($blocks.Count -eq 0) { "（Bing 未返回可解析的结果块，HTML 长度 $($html.Length)）" }
  $i = 0
  foreach ($b in $blocks) {
    $i++
    $href = [regex]::Match($b.Value, '(?is)<h2>\s*<a[^>]*href="([^"]+)"').Groups[1].Value
    $title = [regex]::Replace([regex]::Match($b.Value, '(?is)<h2>.*?</h2>').Value, '<[^>]+>', '')
    $title = [System.Net.WebUtility]::HtmlDecode([regex]::Replace($title, '\s+', ' ')).Trim()
    $snip = [regex]::Replace([regex]::Match($b.Value, '(?is)<p[^>]*>(.*?)</p>').Value, '<[^>]+>', '')
    $snip = [System.Net.WebUtility]::HtmlDecode([regex]::Replace($snip, '\s+', ' ')).Trim()
    "$i. $title`n   $href`n   $snip"
  }
}

$out = New-Object System.Collections.Generic.List[string]
$out.Add('# 取证时刻（UTC）：' + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
$out.Add('# 检索：' + ($queries -join ' | '))
$out.Add('')
foreach ($q in $queries) {
  $out.Add('=' * 78)
  $out.Add("QUERY: $q")
  try { $out.Add((Search $q)) } catch { $out.Add("ERROR: $($_.Exception.Message)") }
  $out.Add('')
  Start-Sleep -Seconds 2
}
$target = Join-Path $PSScriptRoot $outFile
[IO.File]::WriteAllText($target, ($out -join "`n"), (New-Object Text.UTF8Encoding($false)))
Write-Output "已写入 $target （$($out.Count) 行）"
