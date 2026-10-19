# 真实握手取证：本机跑一个一次性 sshd，用 `ssh -vvv` 连一次，抓下协议交换的真实回显。
#
# 用法：pwsh -File research/lab/03_handshake.ps1
#
# 范围说明：
# - 只用 127.0.0.1 回环地址，不连任何外部主机。
# - 主机密钥与用户密钥都是本次运行临时生成的一次性密钥，实验结束即删除。
# - 用户名用本机真实账号（否则 Windows sshd 找不到账号，认证无法完成），
#   但回显里一律替换成 ftlab；用户目录一律替换成 C:\Users\user。
# - known_hosts 里的一次性主机公钥用占位符替换：只保留字段结构，不落盘密钥字节。
# - 本机不是管理员，Windows sshd 走用户目录下的 authorized_keys 规则。
#
# 2026-10-19 首次运行。环境：Windows 11，OpenSSH for Windows 9.5p2。

$ErrorActionPreference = 'Continue'

$root = Join-Path $env:TEMP ('ftlab-sshd-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $root | Out-Null
$u = $env:USERNAME

function Mask([string]$s) {
  if ($null -eq $s) { return '' }
  $s = $s.Replace('C:\\Users\\' + $u, 'C:\\Users\\user')
  $s = $s.Replace('C:\Users\' + $u, 'C:\Users\user')
  $s = $s.Replace('C:/Users/' + $u, 'C:/Users/user')
  # 只替换独立出现的用户名，不碰 base64 串里的同名片段
  $s = [regex]::Replace($s, '(?<![A-Za-z0-9+/=])' + [regex]::Escape($u) + '(?![A-Za-z0-9+/=])', 'ftlab')
  # 一次性公钥的 base64 本体：只保留长度，不落盘密钥字节
  $s = [regex]::Replace($s, '[A-Za-z0-9+/]{60,}={0,2}', { param($m) '<' + $m.Value.Length + ' 字符的 base64（一次性公钥体，已删除，用占位符）>' })
  return $s
}

Write-Output "环境：$([System.Environment]::OSVersion.VersionString)；$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz'))"
Write-Output "客户端：$(((& ssh -V) 2>&1) -join '')"
Write-Output "服务端：$(((& 'C:\WINDOWS\System32\OpenSSH\sshd.exe' -V) 2>&1) -join '')"
Write-Output "临时目录：$(Mask $root)"
Write-Output ""

& ssh-keygen -q -t ed25519 -N '' -C 'ftlab-host@example.invalid' -f "$root\hostkey" 2>&1 | Out-Null
& ssh-keygen -q -t ed25519 -N '' -C 'ftlab-user@example.invalid' -f "$root\id_ed25519" 2>&1 | Out-Null
Copy-Item "$root\id_ed25519.pub" "$root\authorized_keys" -Force

@"
Port 2222
ListenAddress 127.0.0.1
HostKey $root\hostkey
AuthorizedKeysFile $root\authorized_keys
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
StrictModes no
PidFile $root\sshd.pid
LogLevel DEBUG3
"@ | Set-Content -Path "$root\sshd_config" -Encoding utf8

Write-Output "───── 一次性 sshd 的配置（路径与用户名已脱敏）─────"
Write-Output (Mask (Get-Content "$root\sshd_config" -Raw))
Write-Output "───── 启动 sshd ─────"
$proc = Start-Process -FilePath 'C:\WINDOWS\System32\OpenSSH\sshd.exe' `
  -ArgumentList @('-f', "$root\sshd_config", '-E', "$root\sshd.log") -PassThru -NoNewWindow
Start-Sleep -Seconds 2
Write-Output "sshd 进程是否在运行：$(-not $proc.HasExited)"
if ($proc.HasExited) {
  Write-Output "sshd 退出码：$($proc.ExitCode)"
  Write-Output (Mask (Get-Content "$root\sshd.log" -Raw))
  Write-Output "临时目录：$(Mask $root)"
  exit 1
}

Write-Output ""
Write-Output "───── ssh -vvv 的真实回显（127.0.0.1:2222）─────"
$out = & ssh -vvv -p 2222 -i "$root\id_ed25519" `
  -o UserKnownHostsFile="$root\known_hosts" `
  -o StrictHostKeyChecking=accept-new `
  -o IdentitiesOnly=yes `
  -o NumberOfPasswordPrompts=0 `
  -l $u 127.0.0.1 exit 2>&1
Write-Output (Mask ($out -join "`n"))
Write-Output ""
Write-Output "ssh 客户端退出码：$LASTEXITCODE"
Write-Output ""

Write-Output "───── 客户端写下的 known_hosts（字段结构保留，公钥体换成占位）─────"
if (Test-Path "$root\known_hosts") {
  $n = 0
  foreach ($line in (Get-Content "$root\known_hosts")) {
    $n++
    if ($line.Trim() -eq '') { continue }
    $f = $line -split '\s+'
    # known_hosts 每行：主机名/地址 | 密钥类型 | base64 公钥体 | 注释（可省）
    # 只把公钥体换成占位，字段结构与类型名保留。
    $f[2] = '<' + $f[2].Length + ' 字符的 base64 公钥体（一次性主机公钥，已删除，此处用占位符）>'
    Write-Output (($f -join ' ') + "   ← 共 $($f.Count) 段：主机名/地址、密钥类型、公钥体" + $(if ($f.Count -gt 3) { '、注释' } else { '（无注释）' }))
  }
  Write-Output "known_hosts 行数：$n"
} else { Write-Output "（没有写出 known_hosts）" }
Write-Output ""

Write-Output "───── 服务端日志（DEBUG3，脱敏后）─────"
# 先停 sshd，日志文件才不再被占用
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 800
if (Test-Path "$root\sshd.log") { Write-Output (Mask (Get-Content "$root\sshd.log" -Raw)) }
Write-Output ""

Write-Output "───── 收尾 ─────"
Write-Output "sshd 已停止。删除临时目录：$(Mask $root)"
if (Test-Path $root) { Remove-Item -Recurse -Force $root }
Write-Output "一次性主机密钥与用户密钥已删除。"
