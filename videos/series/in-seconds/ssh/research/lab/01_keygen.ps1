# 一次性的密钥结构实验：只测「结构与长度」，不留存任何密钥材料。
#
# 用法（口令从环境变量取，不写进本文件，也不写进回显）：
#   $env:FTLAB_PASSPHRASE = '<一次性实验口令>'
#   pwsh -File research/lab/01_keygen.ps1
#
# 这个口令只保护本次运行在临时目录里生成的一次性密钥；脚本结束时整个临时目录被删除。
# 它不对应任何真实凭据，请不要填入真实口令。回显里的公钥指纹是公钥的单向摘要，
# 用来展示 `ssh-keygen -lf` 的输出格式；公钥本体（base64）不落盘。
#
# 2026-10-19 首次运行。环境：Windows 11，OpenSSH for Windows。

$ErrorActionPreference = 'Stop'
$pass = $env:FTLAB_PASSPHRASE
if ([string]::IsNullOrEmpty($pass)) { throw '请先设置 $env:FTLAB_PASSPHRASE（一次性实验口令）' }

$root = Join-Path $env:TEMP ('ftlab-key-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $root | Out-Null

function Show-Hex([byte[]]$b) { (($b | ForEach-Object { $_.ToString('x2') }) -join ' ') }

function Measure-Key([string]$label, [string[]]$keygenArgs) {
  $base = Join-Path $root $label
  Write-Output "───── $label ─────"
  Write-Output "命令：ssh-keygen $($keygenArgs -join ' ') -N [口令已隐去] -C ft-lab@example.invalid -f <临时目录>/$label"
  & ssh-keygen @keygenArgs '-N' $pass '-C' 'ft-lab@example.invalid' '-f' $base | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "ssh-keygen $label 失败，退出码 $LASTEXITCODE" }

  $pub = "$base.pub"
  $line = (Get-Content $pub -Raw).TrimEnd()
  $parts = $line -split ' ', 3
  $type = $parts[0]; $b64 = $parts[1]; $comment = $parts[2]
  $bytes = [Convert]::FromBase64String($b64)

  Write-Output "公钥文件行数            : 1"
  Write-Output "公钥整行字符数          : $($line.Length)"
  Write-Output "三段                    : 类型=$type / base64 段=$($b64.Length) 字符 / 注释=$comment"
  Write-Output "base64 段解码后字节数   : $($bytes.Length)"
  Write-Output "解码后前 8 字节(hex)    : $(Show-Hex $bytes[0..7])"

  # 按 SSH 的长度前缀字符串解析：4 字节大端（网络字节序）长度 + 内容
  $off = 0; $n = 0; $totalPrefix = 0
  while ($off -lt $bytes.Length) {
    $n++
    $start = $off
    $len = [int]$bytes[$off] * 16777216 + [int]$bytes[$off + 1] * 65536 + [int]$bytes[$off + 2] * 256 + [int]$bytes[$off + 3]
    $off = $off + 4
    $val = [System.Text.Encoding]::ASCII.GetString($bytes, $off, $len)
    $off = $off + $len
    $totalPrefix = $totalPrefix + 4
    $prefix = $bytes[$start..($start + 3)]
    $printable = $true
    foreach ($ch in $val.ToCharArray()) { if ([int]$ch -lt 32 -or [int]$ch -gt 126) { $printable = $false; break } }
    if ($printable) { $shown = $val }
    else { $shown = '（二进制 ' + $len + ' 字节，前 8 字节 hex ' + (Show-Hex $bytes[($off - $len)..($off - $len + 7)]) + '）' }
    Write-Output ("第 {0} 个长度前缀串     : 长度前缀={1}（hex {2}，大端） 内容长度={3} 内容={4}" -f $n, $len, (Show-Hex $prefix), $len, $shown)
  }
  Write-Output "长度前缀串个数          : $n"
  Write-Output "字节账                  : 长度前缀 $totalPrefix + 内容 $($bytes.Length - $totalPrefix) = $($bytes.Length) 字节"
  $le = [int]$bytes[0] -bor ([int]$bytes[1] -shl 8) -bor ([int]$bytes[2] -shl 16) -bor ([int]$bytes[3] -shl 24)
  Write-Output "同一批字节按小端读长度  : $le ← 错的；SSH 用网络字节序（大端）"

  Write-Output "指纹（ssh-keygen -lf）  :"
  & ssh-keygen -lf $pub 2>&1 | ForEach-Object { Write-Output "  $_" }
  Write-Output "私钥首行                : $((Get-Content $base -TotalCount 1))"
  Write-Output ""
}

try {
  Write-Output "环境：$([System.Environment]::OSVersion.VersionString)；$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz'))"
  Write-Output "ssh 版本：$(((& ssh -V) 2>&1) -join '')"
  Write-Output ""
  Write-Output "本实验只记录结构与长度。公钥 base64 段、私钥文件、口令都不落盘、不回显。"
  Write-Output ""

  Measure-Key 'ed25519' @('-t', 'ed25519')
  Measure-Key 'rsa4096' @('-t', 'rsa', '-b', '4096')

  Write-Output "───── 清理 ─────"
  Write-Output "删除临时目录（实验密钥不留在磁盘上）"
  Remove-Item -Recurse -Force $root
  Write-Output "已删除。"
}
finally {
  if (Test-Path $root) { Remove-Item -Recurse -Force $root -ErrorAction SilentlyContinue }
}
