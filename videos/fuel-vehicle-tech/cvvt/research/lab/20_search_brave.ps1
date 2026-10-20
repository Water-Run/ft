# 用 Brave 搜索定位官方页面，并把结果压成「标题 | 链接 | 摘要」存成 out_<输出文件名>.txt。
# 只做 GET；结果只用于定位官方页面，结论一律回到原页核对。
$ErrorActionPreference = 'Continue'
$outFile = $args[0]
$queries = $args[1..($args.Count - 1)]
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function Search([string]$q) {
  $uri = 'https://search.brave.com/search?q=' + [Uri]::EscapeDataString($q)
  $tmp = [IO.Path]::GetTempFileName()
  try {
    & curl.exe -sS -L --max-time 60 -A $ua -o $tmp $uri 2>&1 | Out-Null
    $html = [IO.File]::ReadAllText($tmp)
  } finally { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
  $blocks = [regex]::Matches($html, '(?is)<div class="snippet[^"]*".*?(?=<div class="snippet|<div id="sui-srp)')
  $seen = @{}
  $i = 0
  foreach ($b in $blocks) {
    $href = [regex]::Match($b.Value, '(?is)<a[^>]+href="(https?://[^"]+)"').Groups[1].Value
    if (-not $href -or $href -match 'brave\.com|bing\.com') { continue }
    if ($seen.ContainsKey($href)) { continue }
    $seen[$href] = $true
    $title = [regex]::Replace([regex]::Match($b.Value, '(?is)<div class="title[^"]*">(.*?)</div>').Value, '<[^>]+>', '')
    if (-not $title) { $title = [regex]::Replace([regex]::Match($b.Value, '(?is)<a[^>]*>(.*?)</a>').Value, '<[^>]+>', '') }
    $title = [System.Net.WebUtility]::HtmlDecode([regex]::Replace($title, '\s+', ' ')).Trim()
    $snip = [regex]::Replace([regex]::Match($b.Value, '(?is)<div class="snippet-description[^"]*">(.*?)</div>').Value, '<[^>]+>', '')
    $snip = [System.Net.WebUtility]::HtmlDecode([regex]::Replace($snip, '\s+', ' ')).Trim()
    $i++
    "$i. $title`n   $href`n   $snip"
    if ($i -ge 12) { break }
  }
  if ($i -eq 0) {
    # 回退：直接抽取结果页里的外部链接与锚文本
    $anchors = [regex]::Matches($html, '(?is)<a[^>]+href="(https?://(?![^"]*brave\.com)[^"]+)"[^>]*>(.*?)</a>')
    $seen2 = @{}
    foreach ($a in $anchors) {
      $href = $a.Groups[1].Value
      if ($seen2.ContainsKey($href)) { continue }
      $seen2[$href] = $true
      $t = [regex]::Replace($a.Groups[2].Value, '<[^>]+>', '')
      $t = [System.Net.WebUtility]::HtmlDecode([regex]::Replace($t, '\s+', ' ')).Trim()
      if (-not $t -or $t.Length -lt 4) { continue }
      $i++
      "$i. $t`n   $href"
      if ($i -ge 15) { break }
    }
  }
  if ($i -eq 0) { "（未解析到结果；HTML 长度 $($html.Length)）" }
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
