# 抓取 Adobe 官方仓库的原始文件，按正则筛出需要的行（令牌定义、颜色值），并记录文件哈希与行号。
# 用法：pwsh -File 14_extract.ps1 <输出文件名> <URL>=<筛选正则> [URL=正则 ...]
# 只读 raw.githubusercontent.com；不写仓库之外。
$ErrorActionPreference = 'Continue'
$outFile = $args[0]
$specs = $args[1..($args.Count - 1)]
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

$out = New-Object System.Collections.Generic.List[string]
$out.Add('# 取证时刻（UTC）：' + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
$out.Add('')

foreach ($s in $specs) {
  $i = $s.IndexOf('=')
  $url = $s.Substring(0, $i)
  $pattern = $s.Substring($i + 1)
  $ctx = 0
  if ($pattern -match '^(.*)@(\d+)$') { $pattern = $Matches[1]; $ctx = [int]$Matches[2] }
  $out.Add('=' * 78)
  $out.Add("URL: $url")
  $out.Add("FILTER: $pattern   CONTEXT_LINES: $ctx")
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 90 -Headers @{ 'User-Agent' = $ua }
    $bytes = [Text.Encoding]::UTF8.GetBytes($r.Content)
    $sha = [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($bytes)).Replace('-', '').ToLower()
    $lines = $r.Content -split "`r?`n"
    $out.Add("HTTP $($r.StatusCode)  bytes=$($r.RawContentLength)  lines=$($lines.Count)  SHA256(content)=$sha")
    $hits = 0
    for ($n = 0; $n -lt $lines.Count; $n++) {
      if ($lines[$n] -match $pattern) {
        $out.Add(("{0,5}: {1}" -f ($n + 1), $lines[$n].Trim()))
        $hits++
        if ($ctx -gt 0) {
          for ($c = 1; $c -le $ctx -and ($n + $c) -lt $lines.Count; $c++) {
            $out.Add(("{0,5}:   {1}" -f ($n + $c + 1), $lines[$n + $c].Trim()))
          }
        }
        if ($hits -ge 400) { $out.Add('（超过 400 行，截断）'); break }
      }
    }
    $out.Add("命中行数：$hits")
  } catch { $out.Add("ERROR: $($_.Exception.Message)") }
  $out.Add('')
}

$target = Join-Path $PSScriptRoot $outFile
[IO.File]::WriteAllText($target, ($out -join "`n"), (New-Object Text.UTF8Encoding($false)))
Write-Output "已写入 $target （$($out.Count) 行）"
