# 从官方样式表里抽出用到的颜色值与字体声明，作为「视觉取自讲解对象」的一手依据。
# 用法：pwsh -File 16_cssvars.ps1 <输出文件名> <CSS URL> [CSS URL ...]
$ErrorActionPreference = 'Continue'
$outFile = $args[0]
$urls = $args[1..($args.Count - 1)]
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

$out = New-Object System.Collections.Generic.List[string]
$out.Add('# 取证时刻（UTC）：' + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
$out.Add('')
foreach ($u in $urls) {
  $out.Add('=' * 78)
  $out.Add("URL: $u")
  $tmp = [IO.Path]::GetTempFileName()
  try {
    & curl.exe -sS -L --max-time 90 -A $ua -o $tmp $u 2>&1 | Out-Null
    $raw = [IO.File]::ReadAllText($tmp)
    $bytes = [Text.Encoding]::UTF8.GetBytes($raw)
    $sha = [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($bytes)).Replace('-', '').ToLower()
    $out.Add("bytes=$($bytes.Length)  SHA256(content)=$sha")
    $hex = [regex]::Matches($raw, '#[0-9a-fA-F]{3,8}\b') | ForEach-Object { $_.Value.ToLower() }
    $out.Add('十六进制颜色（去重，按出现次数降序，前 60 个）：')
    $hex | Group-Object | Sort-Object Count -Descending | Select-Object -First 60 | ForEach-Object { $out.Add("  {0,-9} x{1}" -f $_.Name, $_.Count) }
    $out.Add("颜色值总数（去重）：$(($hex | Select-Object -Unique).Count)")
    $out.Add('font-family 声明：')
    [regex]::Matches($raw, 'font-family\s*:\s*([^;}]+)') | ForEach-Object { $_.Groups[1].Value.Trim() } | Select-Object -Unique | ForEach-Object { $out.Add("  $_") }
    $out.Add('--* 自定义属性名（前 120 个）：')
    [regex]::Matches($raw, '(--[a-z0-9-]+)\s*:') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique | Select-Object -First 120 | ForEach-Object { $out.Add("  $_") }
  } catch { $out.Add("ERROR: $($_.Exception.Message)") }
  finally { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
  $out.Add('')
}
$target = Join-Path $PSScriptRoot $outFile
[IO.File]::WriteAllText($target, ($out -join "`n"), (New-Object Text.UTF8Encoding($false)))
Write-Output "已写入 $target （$($out.Count) 行）"
