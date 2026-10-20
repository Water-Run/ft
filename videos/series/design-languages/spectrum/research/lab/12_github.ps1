# 列 Adobe 官方 GitHub 仓库中的文件与原始内容哈希，作为「官方实现」一手的版本与定位依据。
# 只读 GitHub 公共 API；不下载大文件，不写入仓库之外。
$ErrorActionPreference = 'Continue'
$outFile = $args[0]
$targets = $args[1..($args.Count - 1)]
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function Get-Api([string]$url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60 -Headers @{ 'User-Agent' = $ua; 'Accept' = 'application/vnd.github+json' }
    "HTTP $($r.StatusCode)`n" + $r.Content
  } catch { "ERROR: $($_.Exception.Message)" }
}

$out = New-Object System.Collections.Generic.List[string]
$out.Add('# 取证时刻（UTC）：' + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
$out.Add('')
foreach ($t in $targets) {
  $out.Add('=' * 78)
  $out.Add("TARGET: $t")
  if ($t -match '^api:') {
    $out.Add((Get-Api $t.Substring(4)))
  } else {
    # 原始文件：取前若干行与内容哈希
    try {
      $r = Invoke-WebRequest -Uri $t -UseBasicParsing -TimeoutSec 60 -Headers @{ 'User-Agent' = $ua }
      $bytes = [Text.Encoding]::UTF8.GetBytes($r.Content)
      $sha = [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($bytes)).Replace('-', '').ToLower()
      $out.Add("HTTP $($r.StatusCode)  bytes=$($r.RawContentLength)  SHA256(content)=$sha")
      $out.Add('-' * 78)
      $out.Add($r.Content)
    } catch { $out.Add("ERROR: $($_.Exception.Message)") }
  }
  $out.Add('')
}
$target = Join-Path $PSScriptRoot $outFile
[IO.File]::WriteAllText($target, ($out -join "`n"), (New-Object Text.UTF8Encoding($false)))
Write-Output "已写入 $target （$($out.Count) 行）"
