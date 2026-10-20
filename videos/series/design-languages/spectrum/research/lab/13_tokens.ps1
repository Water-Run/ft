# 在 Adobe 官方仓库里定位设计令牌文件，并抽取带令牌名的颜色值。
# 步骤：1) 读 git tree（recursive）筛出候选路径；2) 打印候选；3) 对指定文件抽取十六进制颜色及其令牌名。
# 只读 GitHub 公共 API；不克隆仓库。
$ErrorActionPreference = 'Continue'
$outFile = $args[0]
$repos = @('adobe/spectrum-css', 'adobe/react-spectrum')
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function Get-Json([string]$url) {
  $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 90 -Headers @{ 'User-Agent' = $ua; 'Accept' = 'application/vnd.github+json' }
  ($r.Content | ConvertFrom-Json)
}

$out = New-Object System.Collections.Generic.List[string]
$out.Add('# 取证时刻（UTC）：' + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
$out.Add('')

foreach ($repo in $repos) {
  $out.Add('=' * 78)
  $out.Add("REPO: $repo")
  try {
    $meta = Get-Json "https://api.github.com/repos/$repo"
    $out.Add("default_branch=$($meta.default_branch)  archived=$($meta.archived)  license=$($meta.license.spdx_id)  created_at=$($meta.created_at)  pushed_at=$($meta.pushed_at)")
    $out.Add("description=$($meta.description)")
    $tree = Get-Json "https://api.github.com/repos/$repo/git/trees/$($meta.default_branch)?recursive=1"
    $out.Add("tree entries=$($tree.tree.Count)  truncated=$($tree.truncated)")
    $paths = $tree.tree | Where-Object { $_.type -eq 'blob' -and $_.path -match '(?i)(spectrum-var|vars/.*\.css$|tokens?/.*\.(css|json|yml|yaml)$|color.*\.(css|json)$)' } | Select-Object -ExpandProperty path
    $out.Add('候选文件（令牌/颜色定义）：')
    foreach ($p in $paths) { $out.Add("  $p") }
  } catch { $out.Add("ERROR: $($_.Exception.Message)") }
  $out.Add('')
}

$target = Join-Path $PSScriptRoot $outFile
[IO.File]::WriteAllText($target, ($out -join "`n"), (New-Object Text.UTF8Encoding($false)))
Write-Output "已写入 $target （$($out.Count) 行）"
