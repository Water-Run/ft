# 抓取网页并转成纯文本存盘；对存档页等大页面可只保留匹配行。
# 用法：pwsh -File 15_webtext.ps1 <输出文件名> <URL> [URL ...] [--filter=正则] [--max=行数]
# 用 curl.exe 取页（Invoke-WebRequest 访问 web.archive.org 会失败），正文去标签后按行输出。
$ErrorActionPreference = 'Continue'
$outFile = $args[0]
$rest = $args[1..($args.Count - 1)]
$filter = ''
$max = 400
$urls = @()
foreach ($a in $rest) {
  if ($a -like '--filter=*') { $filter = $a.Substring(9) }
  elseif ($a -like '--max=*') { $max = [int]$a.Substring(6) }
  else { $urls += $a }
}

function Get-PlainText([string]$html) {
  $t = $html
  $t = [regex]::Replace($t, '(?is)<script.*?</script>', ' ')
  $t = [regex]::Replace($t, '(?is)<style.*?</style>', ' ')
  $t = [regex]::Replace($t, '(?is)<!--.*?-->', ' ')
  $t = [regex]::Replace($t, '(?is)<(br|/p|/div|/li|/h[1-6]|/tr|/section|/header|/footer|/td)[^>]*>', "`n")
  $t = [regex]::Replace($t, '(?is)<[^>]+>', ' ')
  $t = [System.Net.WebUtility]::HtmlDecode($t)
  $t = [regex]::Replace($t, '[ \t\u00a0]+', ' ')
  ($t -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }) -join "`n"
}

$out = New-Object System.Collections.Generic.List[string]
$out.Add('# 取证时刻（UTC）：' + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
$out.Add('# 工具：' + $PSVersionTable.PSVersion.ToString() + ' / curl.exe')
$out.Add('')

foreach ($u in $urls) {
  $out.Add('=' * 78)
  $out.Add("URL: $u")
  $tmp = [IO.Path]::GetTempFileName()
  try {
    & curl.exe -sS -L --max-time 90 -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' -o $tmp $u 2>&1 | Out-Null
    $raw = [IO.File]::ReadAllText($tmp)
    $bytes = [Text.Encoding]::UTF8.GetBytes($raw)
    $sha = [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($bytes)).Replace('-', '').ToLower()
    $out.Add("bytes=$($bytes.Length)  SHA256(content)=$sha")
    $text = Get-PlainText $raw
    $lines = $text -split "`n"
    $out.Add("正文行数：$($lines.Count)")
    if ($filter) {
      $n = 0
      foreach ($l in $lines) { if ($l -match $filter) { $out.Add($l); $n++; if ($n -ge $max) { $out.Add('（达到上限，截断）'); break } } }
      $out.Add("匹配行数：$n")
    } else {
      $out.Add($text)
    }
  } catch { $out.Add("ERROR: $($_.Exception.Message)") }
  finally { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
  $out.Add('')
}

$target = Join-Path $PSScriptRoot $outFile
[IO.File]::WriteAllText($target, ($out -join "`n"), (New-Object Text.UTF8Encoding($false)))
Write-Output "已写入 $target （$($out.Count) 行）"
