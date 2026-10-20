# 抓取网页并在原始 HTML 上按正则筛行（用于 meta、link 之类没有正文文本的元素）。
# 用法：pwsh -File 17_grep_html.ps1 <输出文件名> <URL>=<正则> [URL=正则 ...]
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
  $out.Add('=' * 78)
  $out.Add("URL: $url")
  $out.Add("FILTER: $pattern")
  $tmp = [IO.Path]::GetTempFileName()
  try {
    & curl.exe -sS -L --max-time 90 -A $ua -o $tmp $url 2>&1 | Out-Null
    $raw = [IO.File]::ReadAllText($tmp)
    $bytes = [Text.Encoding]::UTF8.GetBytes($raw)
    $sha = [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($bytes)).Replace('-', '').ToLower()
    $out.Add("bytes=$($bytes.Length)  SHA256(content)=$sha")
    $lines = $raw -split "`r?`n"
    $n = 0
    for ($k = 0; $k -lt $lines.Count; $k++) {
      if ($lines[$k] -match $pattern) { $out.Add(("{0,5}: {1}" -f ($k + 1), $lines[$k].Trim())); $n++ }
    }
    $out.Add("命中行数：$n")
  } catch { $out.Add("ERROR: $($_.Exception.Message)") }
  finally { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
  $out.Add('')
}
$target = Join-Path $PSScriptRoot $outFile
[IO.File]::WriteAllText($target, ($out -join "`n"), (New-Object Text.UTF8Encoding($false)))
Write-Output "已写入 $target （$($out.Count) 行）"
