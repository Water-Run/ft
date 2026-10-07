# 两项补充。（a）WSL 容器的端口映射：Windows 一侧由哪个进程监听（14 里用的 httpd 不在 Alpine minirootfs 的 busybox 里，那一段未得到结果）；
# （b）13 的计时含 sync，这里对「解到 Windows 文件系统」再量一组不含 sync 的，看 sync 占多大比重。
# 前提：11 与 14 已执行（ft-wsl1、ft-wsl2、映像 ft-alpine:3.24.2 都在）。回显存为 out_15_port_and_nosync.txt。
$ErrorActionPreference = 'Continue'
$env:WSL_UTF8 = '1'
$IMG = 'ft-alpine:3.24.2'
$SRC = 'WSL-3.0.1.tar.gz'
function Clean([string]$s) { $s.Replace($env:LOCALAPPDATA, '%LOCALAPPDATA%').Replace($env:USERPROFILE, '%USERPROFILE%').Replace($env:USERNAME, '<用户>').Replace($env:COMPUTERNAME, '<主机>') }
function Run([string]$cmd) { "PS> $cmd"; $o = (Invoke-Expression "$cmd 2>&1" | Out-String).TrimEnd(); if ($o) { Clean $o }; "[exit=$LASTEXITCODE]"; "" }
"# 取证时刻（UTC）：" + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
""
"## a 端口映射"
Run "wslc run -d --name ft-web -p 18080:80 $IMG nc -lk -p 80 -e cat /etc/alpine-release"
Start-Sleep -Seconds 2
Run 'wslc list'
"PS> 从 Windows 连 localhost:18080，读回容器发来的内容"
try {
  $c = New-Object Net.Sockets.TcpClient; $c.ReceiveTimeout = 5000; $c.Connect('127.0.0.1', 18080)
  $buf = New-Object byte[] 64; $n = $c.GetStream().Read($buf, 0, 64); $c.Close()
  "收到 $n 字节：" + ([Text.Encoding]::ASCII.GetString($buf, 0, $n).Trim())
} catch { "连接失败：" + $_.Exception.Message }
""
"PS> Get-NetTCPConnection -LocalPort 18080 -State Listen   （Windows 一侧的监听者）"
Get-NetTCPConnection -LocalPort 18080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { "{0,-10} 端口 {1,-6} 进程={2}" -f $_.LocalAddress, $_.LocalPort, (Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Name }
""
Run 'wslc exec ft-web ip -o -4 addr'
Run 'wslc exec ft-web cat /etc/resolv.conf'
Run 'wslc system session run cat /proc/net/dev'
Run 'wslc system session run cat /etc/resolv.conf'
Run 'wslc stop ft-web'
Run 'wslc remove ft-web'
""
"## b 解到 Windows 文件系统，不含 sync（各 3 次，毫秒；每次之前清空目标目录，不计时）"
foreach ($d in 'ft-wsl1', 'ft-wsl2') {
  $t = "/mnt/c/ftlab/x_$d"
  $ms = foreach ($i in 0..3) {
    wsl -d $d -- sh -c "rm -rf $t; mkdir -p $t" 2>$null | Out-Null
    $sw = [Diagnostics.Stopwatch]::StartNew(); wsl -d $d -- sh -c "tar xzf /root/$SRC -C $t" 2>$null | Out-Null; $sw.Stop()
    if ($i -gt 0) { [int]$sw.ElapsedMilliseconds }
  }
  "{0,-8} | {1,-28} | {2} | 中位 {3}" -f $d, "tar xzf（无 sync）→ /mnt/c", ($ms -join ' '), ($ms | Sort-Object)[1]
  wsl -d $d -- sh -c "rm -rf $t" 2>$null | Out-Null
}
wsl -t ft-wsl1 | Out-Null; wsl -t ft-wsl2 | Out-Null
